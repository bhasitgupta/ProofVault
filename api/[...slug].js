export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';

  if (url.includes('/cases')) {
    return res.status(200).json([
      {
        case_id: 'CASE-101',
        title: 'State vs Cyber Syndicate - Hawala Breach & Crypto Theft',
        description: 'Inter-state cybercrime and fraudulent cryptocurrency transfer involving international cold wallets.',
        status: 'ACTIVE',
        classification_ceiling: 'CONFIDENTIAL',
        owning_msp: 'PoliceMSP',
        active_document_count: 5
      },
      {
        case_id: 'CASE-102',
        title: 'FIR 402/2026 - Central Bank Core Gateway Ransomware',
        description: 'Critical banking infrastructure ransomware deployment impacting central clearing switch.',
        status: 'ACTIVE',
        classification_ceiling: 'SECRET',
        owning_msp: 'PoliceMSP',
        active_document_count: 4
      },
      {
        case_id: 'CASE-103',
        title: 'Special Investigation - Ballistics & Arms Seizure',
        description: 'Ballistic cross-matching and illegal firearm telemetry in trans-border arms smuggling.',
        status: 'ACTIVE',
        classification_ceiling: 'SECRET',
        owning_msp: 'PoliceMSP',
        active_document_count: 3
      },
      {
        case_id: 'CASE-104',
        title: 'Judicial Review - Corporate Embezzlement & Balance Sheet Forgery',
        description: 'Shell corporation money trails, forged auditor sign-offs, and siphoned infrastructure subsidies.',
        status: 'ACTIVE',
        classification_ceiling: 'CONFIDENTIAL',
        owning_msp: 'JudiciaryMSP',
        active_document_count: 3
      },
      {
        case_id: 'CASE-105',
        title: 'Digital Narcotics Trafficking & Darknet Transit Network',
        description: 'Encrypted communication extractions, cryptocurrency payments, and darknet postal drops.',
        status: 'ACTIVE',
        classification_ceiling: 'SECRET',
        owning_msp: 'PoliceMSP',
        active_document_count: 4
      }
    ]);
  }

  if (url.includes('/auth/wallet-login') || url.includes('/auth/login')) {
    return res.status(200).json({
      access_token: 'proof-vault-token-live',
      token_type: 'bearer',
      partial_token: 'proof-vault-partial',
      mfa_required: false
    });
  }

  if (url.includes('/audit/incidents')) {
    return res.status(200).json({ total: 0, incidents: [] });
  }

  return res.status(200).json({
    status: 'online',
    platform: 'Proof Vault Sovereign Gateway',
    timestamp: new Date().toISOString()
  });
}
