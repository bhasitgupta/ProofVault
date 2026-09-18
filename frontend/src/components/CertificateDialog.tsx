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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-police-accent/40 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <FileCheck className="w-5 h-5" />
            <span>BSA §63 Evidence Certificate Issued</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300">
          <div><span className="text-slate-500">Certificate ID:</span> {certData.cert_id}</div>
          <div><span className="text-slate-500">Document ID:</span> {certData.doc_id}</div>
          <div><span className="text-slate-500">PDF SHA-256:</span> {certData.pdf_hash}</div>
          <div><span className="text-slate-500">Ledger TX:</span> {certData.ledger_tx_id}</div>
          <div><span className="text-slate-500">Issued UTC:</span> {certData.issued_at}</div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Close
          </button>
          <a
            href={certData.download_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs bg-police-accent hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Download Signed PDF
          </a>
        </div>
      </div>
    </div>
  );
};
