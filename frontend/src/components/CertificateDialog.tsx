import React from 'react';
import { FileCheck, Download, X } from 'lucide-react';

interface CertificateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  certData: {
    cert_id: string;
    doc_id: string;
    pdf_hash: string;
    issued_at: string;
    ledger_tx_id: string;
    download_url: string;
  } | null;
}

export const CertificateDialog: React.FC<CertificateDialogProps> = ({ isOpen, onClose, certData }) => {
  if (!isOpen || !certData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white border-crimson-gold rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2 text-emerald-700 font-serif-judicial font-bold">
            <FileCheck className="w-5 h-5" />
            <span>BSA §63 Evidence Certificate Issued</span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-xs font-mono bg-parchment-50 p-4 rounded-xl border border-stone-200 text-stone-700">
          <div><span className="text-stone-500 font-semibold">Certificate ID:</span> <span className="text-stone-900 font-bold">{certData.cert_id}</span></div>
          <div><span className="text-stone-500 font-semibold">Document ID:</span> {certData.doc_id}</div>
          <div><span className="text-stone-500 font-semibold">PDF SHA-256:</span> {certData.pdf_hash}</div>
          <div><span className="text-stone-500 font-semibold">Ledger TX:</span> <span className="text-crimson-800 font-bold">{certData.ledger_tx_id}</span></div>
          <div><span className="text-stone-500 font-semibold">Issued UTC:</span> {certData.issued_at}</div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs bg-white hover:bg-parchment-100 text-stone-700 rounded-xl transition-colors border border-stone-200 shadow-sm"
          >
            Close
          </button>
          <a
            href={certData.download_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs bg-crimson-800 hover:bg-crimson-700 text-white font-semibold rounded-xl transition-colors shadow-md shadow-crimson-900/15"
          >
            <Download className="w-3.5 h-3.5" />
            Download Signed PDF
          </a>
        </div>
      </div>
    </div>
  );
};
export default CertificateDialog;
