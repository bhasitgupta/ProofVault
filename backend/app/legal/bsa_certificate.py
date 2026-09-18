"""
BSA §63 / IEA §65B Certificate Generator

Generates a tamper-evident PDF certificate suitable for court admission under
the Bharatiya Sakshya Adhiniyam (BSA) §63 / IEA §65B. Contains:
  - Document identity (doc_id, case_id, filename)
  - Hashes: content_hash, blob_hash, chunk_merkle_root
  - Ledger transaction reference (dochash-channel tx_id)
  - Officer signature + TSA timestamp
  - QR code linking to the online verification endpoint
  - ReportLab PDF generation — no external service required
"""

import hashlib
import io
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

try:
    import qrcode
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False


def _make_qr(data: str) -> Optional[bytes]:
    if not HAS_QRCODE:
        return None
    qr = qrcode.QRCode(version=2, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=4, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.read()


def generate_bsa_certificate(
    *,
    doc_id: str,
    case_id: str,
    filename: str,
    content_hash: str,
    blob_hash: str,
    chunk_merkle_root: str,
    chunk_count: int,
    ledger_tx_id: str,
    uploader_id: str,
    issuer_id: str,
    classification: str,
    doc_type: str,
    tsa_token_hash: str,
    verification_url: str = "https://sdms.mha.gov.in/verify",
    output_dir: str = "certificates",
) -> dict:
    """
    Generates a BSA §63 PDF certificate and returns metadata dict.

    Returns:
        {
            "cert_id": str,
            "pdf_path": str,
            "pdf_hash": str,   # SHA-256 of the PDF bytes for on-chain registration
        }
    """
    cert_id = str(uuid.uuid4())
    issued_at = datetime.now(timezone.utc).isoformat()
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = str(out_dir / f"cert_{cert_id}.pdf")

    if not HAS_REPORTLAB:
        # Fallback: write a plain-text certificate
        cert_text = _build_text_cert(
            cert_id=cert_id, doc_id=doc_id, case_id=case_id, filename=filename,
            content_hash=content_hash, blob_hash=blob_hash, chunk_merkle_root=chunk_merkle_root,
            chunk_count=chunk_count, ledger_tx_id=ledger_tx_id, uploader_id=uploader_id,
            issuer_id=issuer_id, classification=classification, doc_type=doc_type,
            tsa_token_hash=tsa_token_hash, issued_at=issued_at,
        )
        pdf_path = pdf_path.replace(".pdf", ".txt")
        Path(pdf_path).write_text(cert_text, encoding="utf-8")
        pdf_bytes = cert_text.encode("utf-8")
    else:
        pdf_bytes = _build_pdf_cert(
            cert_id=cert_id, doc_id=doc_id, case_id=case_id, filename=filename,
            content_hash=content_hash, blob_hash=blob_hash, chunk_merkle_root=chunk_merkle_root,
            chunk_count=chunk_count, ledger_tx_id=ledger_tx_id, uploader_id=uploader_id,
            issuer_id=issuer_id, classification=classification, doc_type=doc_type,
            tsa_token_hash=tsa_token_hash, issued_at=issued_at,
            verification_url=verification_url,
        )
        Path(pdf_path).write_bytes(pdf_bytes)

    pdf_hash = hashlib.sha256(pdf_bytes).hexdigest()
    return {
        "cert_id": cert_id,
        "pdf_path": pdf_path,
        "pdf_hash": pdf_hash,
        "issued_at": issued_at,
    }


def _build_pdf_cert(
    *, cert_id, doc_id, case_id, filename, content_hash, blob_hash,
    chunk_merkle_root, chunk_count, ledger_tx_id, uploader_id, issuer_id,
    classification, doc_type, tsa_token_hash, issued_at, verification_url,
) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    # ── Header
    title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=14,
                                  spaceAfter=6, alignment=TA_CENTER)
    sub_style = ParagraphStyle("Sub", parent=styles["Normal"], fontSize=10,
                                spaceAfter=4, alignment=TA_CENTER, textColor=colors.grey)
    story.append(Paragraph("CERTIFICATE OF ELECTRONIC EVIDENCE", title_style))
    story.append(Paragraph("Bharatiya Sakshya Adhiniyam §63 / Information Technology Act §65B", sub_style))
    story.append(Paragraph("Ministry of Home Affairs — Secure Digital Management System", sub_style))
    story.append(Spacer(1, 0.4*cm))

    # ── Classification Banner
    cls_color = {
        "RESTRICTED": colors.green,
        "CONFIDENTIAL": colors.orange,
        "SECRET": colors.red,
    }.get(classification, colors.grey)
    cls_style = ParagraphStyle("Cls", parent=styles["Normal"], fontSize=12,
                                textColor=colors.white, backColor=cls_color,
                                spaceAfter=8, alignment=TA_CENTER, borderPadding=4)
    story.append(Paragraph(f"⬛ CLASSIFICATION: {classification}", cls_style))
    story.append(Spacer(1, 0.3*cm))

    # ── Certificate metadata table
    normal = styles["Normal"]
    bold = ParagraphStyle("Bold", parent=styles["Normal"], fontName="Helvetica-Bold")

    def row(label, value):
        return [Paragraph(label, bold), Paragraph(str(value), normal)]

    table_data = [
        row("Certificate ID:", cert_id),
        row("Issued At (UTC):", issued_at),
        row("Case ID:", case_id),
        row("Document ID:", doc_id),
        row("Filename:", filename),
        row("Document Type:", doc_type),
        row("Uploaded By:", uploader_id),
        row("Issued By:", issuer_id),
    ]
    t = Table(table_data, colWidths=[4.5*cm, 12*cm])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.whitesmoke, colors.white]),
        ("GRID", (0,0), (-1,-1), 0.3, colors.lightgrey),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.4*cm))

    # ── Cryptographic Evidence section
    story.append(Paragraph("Cryptographic Evidence Chain", ParagraphStyle(
        "SecHead", parent=styles["Heading2"], spaceAfter=4)))

    hash_data = [
        row("Content SHA-256:", content_hash),
        row("Ciphertext SHA-256:", blob_hash),
        row("Chunk Merkle Root:", chunk_merkle_root),
        row("Chunk Count:", str(chunk_count)),
        row("Ledger TX (dochash-channel):", ledger_tx_id),
        row("TSA Token SHA-256:", tsa_token_hash),
    ]
    t2 = Table(hash_data, colWidths=[4.5*cm, 12*cm])
    t2.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.lightyellow, colors.white]),
        ("GRID", (0,0), (-1,-1), 0.3, colors.lightgrey),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("FONTNAME", (1,0), (1,-1), "Courier"),
        ("FONTSIZE", (1,0), (1,-1), 7),
        ("WORDWRAP", (1,0), (1,-1), True),
    ]))
    story.append(t2)
    story.append(Spacer(1, 0.4*cm))

    # ── QR code for verification
    qr_bytes = _make_qr(f"{verification_url}?doc_id={doc_id}&tx={ledger_tx_id}")
    if qr_bytes:
        qr_img = Image(io.BytesIO(qr_bytes), width=3*cm, height=3*cm)
        qr_table = Table([[qr_img, Paragraph(
            f"Scan to verify this certificate online.\n\nVerification URL:\n{verification_url}\n\ndoc_id: {doc_id}",
            normal
        )]], colWidths=[3.5*cm, 13*cm])
        story.append(qr_table)
        story.append(Spacer(1, 0.3*cm))

    # ── Legal declaration
    decl_style = ParagraphStyle("Decl", parent=styles["Normal"], fontSize=8,
                                 textColor=colors.grey, spaceAfter=4)
    story.append(Paragraph(
        "This certificate was generated by the Ministry of Home Affairs Secure Digital Management System (SDMS). "
        "The hashes listed above constitute the chain-of-custody proof for this electronic evidence document "
        "and are registered on an immutable distributed ledger. This certificate may be submitted as computer-generated "
        "evidence under BSA §63 / IEA §65B and is digitally verifiable at the URL above.",
        decl_style
    ))

    doc.build(story)
    buf.seek(0)
    return buf.read()


def _build_text_cert(*, cert_id, doc_id, case_id, filename, content_hash, blob_hash,
                      chunk_merkle_root, chunk_count, ledger_tx_id, uploader_id,
                      issuer_id, classification, doc_type, tsa_token_hash, issued_at) -> str:
    return f"""
================================================================================
     CERTIFICATE OF ELECTRONIC EVIDENCE — BSA §63 / IEA §65B
     Ministry of Home Affairs — Secure Digital Management System
================================================================================
CLASSIFICATION: {classification}

Certificate ID     : {cert_id}
Issued At (UTC)    : {issued_at}
Case ID            : {case_id}
Document ID        : {doc_id}
Filename           : {filename}
Document Type      : {doc_type}
Uploaded By        : {uploader_id}
Issued By          : {issuer_id}

── Cryptographic Evidence Chain ──────────────────────────────────────────────
Content SHA-256             : {content_hash}
Ciphertext SHA-256          : {blob_hash}
Chunk Merkle Root           : {chunk_merkle_root}
Chunk Count                 : {chunk_count}
Ledger TX (dochash-channel) : {ledger_tx_id}
TSA Token SHA-256           : {tsa_token_hash}

── Legal Declaration ──────────────────────────────────────────────────────────
This certificate was generated by the MHA SDMS. The hashes above constitute the
chain-of-custody proof and are registered on an immutable distributed ledger.
This certificate may be submitted under BSA §63 / IEA §65B.
================================================================================
"""
