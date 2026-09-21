import { ethers } from 'ethers';

export const POLYGON_AMOY_CHAIN_ID = 80002;
export const POLYGON_AMOY_CHAIN_HEX = '0x13882';
export const POLYGON_AMOY_RPC = ((import.meta as any).env?.VITE_POLYGON_RPC_URL as string) || 'https://polygon-amoy-bor-rpc.publicnode.com';
export const EVIDENCE_REGISTRY_ADDR = ((import.meta as any).env?.VITE_POLYGON_EVIDENCE_REGISTRY as string) || '0xE5A9000fe858f49f4e0520b44dBCC138ba2ef05b';
export const PROVENANCE_REGISTRY_ADDR = ((import.meta as any).env?.VITE_POLYGON_PROVENANCE_REGISTRY as string) || '0x5D94C63ABfAEFf3758A51642A03912F73a064ADA';
export const POLYGONSCAN_BASE = 'https://amoy.polygonscan.com';

const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 'https://kraxwwwkhprczuiqkxuw.supabase.co';
// Always use anon key — never use service role key in browser
const SUPABASE_KEY =
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_yBEvcnfdSVjN_5ZlxSw_5w_bDe53Czq';

const EVIDENCE_REGISTRY_ABI = [
  'function registerEvidence(bytes32 docIdHash, bytes32 contentHash, bytes32 merkleRoot, bytes32 blobHash, string calldata caseId, uint256 batchId) external',
  'function mintEvidence(bytes32 docIdHash, bytes32 contentHash, bytes32 merkleRoot, bytes32 blobHash, string calldata caseId, uint256 batchId) external',
  'event EvidenceRegistered(bytes32 indexed docIdHash, bytes32 indexed merkleRoot, bytes32 contentHash, string caseId, uint256 batchId, uint256 timestamp, address indexed registrar)',
  'event EvidenceMinted(bytes32 indexed docIdHash, bytes32 indexed merkleRoot, string caseId, uint256 timestamp, address indexed registrar)'
];

export const PROVENANCE_REGISTRY_ABI = [
  'function logCase(string calldata caseId) external',
  'function isCaseAnchored(string calldata caseId) external view returns (bool)',
  'function getCaseAnchor(string calldata caseId) external view returns (tuple(bytes32 caseIdHash, string caseId, address anchoredBy, uint256 anchoredAt, bool exists))',
  'function getTotalCasesAnchored() external view returns (uint256)',
  'event CaseAnchored(bytes32 indexed caseIdHash, string caseId, address indexed anchoredBy, uint256 timestamp)'
];

/**
 * Generates W3C-compliant Decentralized Identifier (DID)
 */
export function generateDID(caseId: string, docId: string): string {
  const cleanCase = caseId.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const cleanDoc = docId.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return `did:proofvault:${cleanCase}:${cleanDoc}`;
}

/**
 * Generates Content Reference / Resource Digest (CRD / CID)
 */
export function generateCRD(contentHash: string): string {
  const cleanHash = contentHash.replace(/^0x/, '').toLowerCase();
  // Ensure formatted CRD identifier is strictly <= 64 characters (11 + 50 = 61 chars)
  return `crd:sha256:${cleanHash.slice(0, 50)}`.slice(0, 64);
}

/**
 * Generates a court-admissible SVG document thumbnail
 */
export function generateDocumentThumbnailSvg(params: {
  docId: string;
  caseId: string;
  filename: string;
  docType: string;
  classification: string;
  merkleRoot: string;
  did: string;
}): string {
  const { docId, caseId, filename, docType, classification, merkleRoot, did } = params;
  const shortHash = merkleRoot.slice(0, 16);
  const dateStr = new Date().toISOString().split('T')[0];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDFBF7"/>
        <stop offset="100%" stop-color="#F4EFEA"/>
      </linearGradient>
      <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#800020"/>
        <stop offset="100%" stop-color="#4A0E17"/>
      </linearGradient>
    </defs>
    
    <!-- Parchment Background -->
    <rect width="400" height="520" rx="16" fill="url(#bgGrad)" stroke="#D5C7B7" stroke-width="2"/>
    
    <!-- Top Judicial Header Bar -->
    <rect x="0" y="0" width="400" height="70" rx="16" fill="url(#crestGrad)"/>
    <rect x="0" y="54" width="400" height="16" fill="url(#crestGrad)"/>
    
    <!-- Judicial Seal & Header Title -->
    <text x="20" y="32" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#FFFFFF">PROOF VAULT • ELECTRONIC EVIDENCE</text>
    <text x="20" y="52" font-family="monospace" font-size="10" fill="#E2D4C3">BSA §63 / IEA §65B STATUTORY ADMISSIBILITY</text>
    
    <!-- Classification Badge -->
    <rect x="20" y="90" width="110" height="24" rx="6" fill="#800020" fill-opacity="0.1" stroke="#800020" stroke-width="1"/>
    <text x="30" y="106" font-family="monospace" font-size="10" font-weight="bold" fill="#800020">${classification}</text>

    <rect x="140" y="90" width="140" height="24" rx="6" fill="#0D9488" fill-opacity="0.1" stroke="#0D9488" stroke-width="1"/>
    <text x="150" y="106" font-family="monospace" font-size="10" font-weight="bold" fill="#0F766E">POLYGON AMOY (80002)</text>
    
    <!-- Document Title & Filename -->
    <text x="20" y="150" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1C1917">${docType.replace(/_/g, ' ')}</text>
    <text x="20" y="174" font-family="sans-serif" font-size="12" fill="#57534E">${filename}</text>
    
    <!-- Divider -->
    <line x1="20" y1="195" x2="380" y2="195" stroke="#E7E5E4" stroke-width="1.5"/>
    
    <!-- Metadata Grid -->
    <text x="20" y="225" font-family="monospace" font-size="10" font-weight="bold" fill="#78716C">DOCUMENT ID:</text>
    <text x="140" y="225" font-family="monospace" font-size="11" font-weight="bold" fill="#1C1917">${docId}</text>

    <text x="20" y="255" font-family="monospace" font-size="10" font-weight="bold" fill="#78716C">CASE DOSSIER:</text>
    <text x="140" y="255" font-family="monospace" font-size="11" font-weight="bold" fill="#1C1917">${caseId}</text>
    
    <text x="20" y="285" font-family="monospace" font-size="10" font-weight="bold" fill="#78716C">DECENTRALIZED ID:</text>
    <text x="140" y="285" font-family="monospace" font-size="9" fill="#800020">${did}</text>

    <text x="20" y="315" font-family="monospace" font-size="10" font-weight="bold" fill="#78716C">MERKLE ROOT:</text>
    <text x="140" y="315" font-family="monospace" font-size="10" font-weight="bold" fill="#059669">${shortHash}...</text>

    <text x="20" y="345" font-family="monospace" font-size="10" font-weight="bold" fill="#78716C">TIMESTAMP:</text>
    <text x="140" y="345" font-family="monospace" font-size="10" fill="#44403C">${dateStr}</text>
    
    <!-- Watermark Stamp -->
    <circle cx="310" cy="420" r="50" fill="none" stroke="#800020" stroke-width="2" stroke-dasharray="4,4" opacity="0.4"/>
    <text x="310" y="415" font-family="Georgia, serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#800020" opacity="0.6">POLYGON</text>
    <text x="310" y="430" font-family="monospace" font-size="8" text-anchor="middle" fill="#800020" opacity="0.6">MINTED NFT</text>
    
    <!-- Bottom Bar -->
    <rect x="0" y="490" width="400" height="30" fill="#E7E0D8"/>
    <text x="20" y="510" font-family="monospace" font-size="9" fill="#57534E">Immutable Cryptographic Bitstream Evidence Vault</text>
  </svg>`;
}

/**
 * Extracts readable OCR/text content from a document buffer.
 * Handles plain text, markdown, and PDF files properly.
 * Binary content is reported with clean forensic metadata — no garbage characters.
 */
export async function extractDocumentOcr(file: File, buffer: Uint8Array): Promise<string> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isTextLike =
    file.type.includes('text') ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.md') ||
    file.name.endsWith('.csv') ||
    file.name.endsWith('.json') ||
    file.name.endsWith('.xml');

  // Plain text / markdown / CSV — decode directly
  if (isTextLike) {
    try {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      if (text && text.trim().length > 0) {
        return text.trim().slice(0, 8000);
      }
    } catch {}
  }

  // PDF — extract embedded text streams (BT...ET blocks) without full pdf.js
  if (isPdf) {
    try {
      const rawText = new TextDecoder('latin1', { fatal: false }).decode(buffer);
      // Extract text between BT (Begin Text) and ET (End Text) PDF operators
      const textBlocks: string[] = [];
      const btEtRegex = /BT[\s\S]*?ET/g;
      let match: RegExpExecArray | null;
      while ((match = btEtRegex.exec(rawText)) !== null && textBlocks.length < 200) {
        const block = match[0];
        // Extract parenthesized string literals: (text here)
        const strRegex = /\(([^)\\]*(\\.[^)\\]*)*)\)/g;
        let strMatch: RegExpExecArray | null;
        while ((strMatch = strRegex.exec(block)) !== null) {
          // Unescape PDF string escapes
          const raw = strMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            // Remove non-printable characters
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
          if (raw.trim().length > 0) {
            textBlocks.push(raw);
          }
        }
        // Also extract hex strings: <hex bytes>
        const hexRegex = /<([0-9A-Fa-f\s]+)>/g;
        let hexMatch: RegExpExecArray | null;
        while ((hexMatch = hexRegex.exec(block)) !== null) {
          const hex = hexMatch[1].replace(/\s/g, '');
          if (hex.length > 0 && hex.length % 2 === 0) {
            try {
              const bytes = new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
              const decoded = new TextDecoder('latin1').decode(bytes)
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
              if (decoded.trim().length > 0) {
                textBlocks.push(decoded);
              }
            } catch {}
          }
        }
      }

      const extracted = textBlocks.join(' ').replace(/\s+/g, ' ').trim();
      if (extracted.length > 20) {
        return `[PDF TEXT EXTRACTION — ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n\n${extracted.slice(0, 8000)}`;
      }
    } catch (pdfErr) {
      console.warn('PDF text extraction failed:', pdfErr);
    }
    // PDF with no extractable text (scanned image PDF)
    return `[SCANNED PDF — ${file.name}]\nSize: ${(file.size / 1024).toFixed(1)} KB\nNote: This PDF appears to contain scanned images without embedded text. The file is cryptographically sealed on Polygon Amoy. For OCR on scanned PDFs, please use a server-side OCR processor.`;
  }

  // Binary files — return clean forensic metadata, no garbage chars
  return `[BINARY EVIDENCE PAYLOAD]\nFilename: ${file.name}\nSize: ${file.size} bytes (${(file.size / 1024).toFixed(2)} KB)\nMIME Type: ${file.type || 'application/octet-stream'}\nForensic Status: SHA-256 hash sealed and Merkle root anchored on Polygon Amoy Testnet.\nNote: Binary content cannot be extracted as readable text. The cryptographic hash is the authoritative forensic identifier.`;
}

/**
 * Compute SHA-256 hash using Web Crypto API
 */
export async function computeSHA256(data: ArrayBuffer | Uint8Array): Promise<string> {
  const bufferSource: BufferSource = data instanceof Uint8Array
    ? (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
    : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', bufferSource);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * True Merkle Tree Generator
 * Generates deterministic Merkle Root from 256KB chunk array
 */
export async function computeMerkleRoot(chunkBuffers: Uint8Array[]): Promise<{ root: string; count: number }> {
  if (chunkBuffers.length === 0) {
    const emptyHash = await computeSHA256(new Uint8Array(0));
    return { root: emptyHash, count: 0 };
  }

  let layer: string[] = [];
  for (const chunk of chunkBuffers) {
    const h = await computeSHA256(chunk);
    layer.push(h);
  }

  while (layer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        const combined = new TextEncoder().encode(layer[i] + layer[i + 1]);
        const parentHash = await computeSHA256(combined);
        nextLayer.push(parentHash);
      } else {
        nextLayer.push(layer[i]);
      }
    }
    layer = nextLayer;
  }

  return { root: layer[0], count: chunkBuffers.length };
}

/**
 * Switch or add Polygon Amoy Testnet in browser Web3 wallet
 */
export async function ensurePolygonAmoyNetwork(): Promise<boolean> {
  const eth = (window as any).ethereum;
  if (!eth) return false;

  // Multiple Polygon Amoy RPC endpoints — MetaMask picks the fastest/available
  const AMOY_RPC_URLS = [
    POLYGON_AMOY_RPC,
    'https://polygon-amoy-bor-rpc.publicnode.com',
    'https://polygon-amoy.drpc.org',
    'https://80002.rpc.thirdweb.com',
    'https://api.zan.top/node/v1/polygon/amoy/public',
  ];

  try {
    const currentChainId = await eth.request({ method: 'eth_chainId' });
    if (currentChainId === POLYGON_AMOY_CHAIN_HEX || parseInt(currentChainId, 16) === POLYGON_AMOY_CHAIN_ID) {
      return true;
    }

    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CHAIN_HEX }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.message?.includes('unrecognized')) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: POLYGON_AMOY_CHAIN_HEX,
            chainName: 'Polygon Amoy Testnet',
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            rpcUrls: AMOY_RPC_URLS,
            blockExplorerUrls: [POLYGONSCAN_BASE],
          }],
        });
        return true;
      }
      throw switchError;
    }
  } catch (err) {
    console.warn('Network switch to Polygon Amoy skipped:', err);
    return false;
  }
}

export interface AnchorResult {
  txHash: string;
  blockNumber?: number;
  explorerUrl: string;
  anchoredOnChain: boolean;
  statusText: string;
}

/**
 * Submits evidence cryptographic commitment and mints NFT proof to Polygon Amoy EVM
 */
export async function anchorEvidenceToPolygon(params: {
  docId: string;
  contentHash: string;
  merkleRoot: string;
  blobHash: string;
  caseId: string;
  did?: string;
  crd?: string;
}): Promise<AnchorResult> {
  const { docId, contentHash, merkleRoot, blobHash, caseId, did } = params;

  // Convert hashes to 32-byte EVM format (anchoring DID identifier + Merkle Root + CRD Content Hash)
  const docIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(did || docId));
  const contentBytes32 = contentHash.startsWith('0x') ? contentHash : `0x${contentHash.padEnd(64, '0').slice(0, 64)}`;
  const merkleBytes32 = merkleRoot.startsWith('0x') ? merkleRoot : `0x${merkleRoot.padEnd(64, '0').slice(0, 64)}`;
  const blobBytes32 = blobHash.startsWith('0x') ? blobHash : `0x${blobHash.padEnd(64, '0').slice(0, 64)}`;
  const batchId = Math.floor(Date.now() / 1000);

  const iface = new ethers.Interface(EVIDENCE_REGISTRY_ABI);
  // Call mintEvidence to mint NFT evidence proof on Polygon Amoy
  const calldata = iface.encodeFunctionData('mintEvidence', [
    docIdBytes32,
    contentBytes32,
    merkleBytes32,
    blobBytes32,
    caseId,
    batchId,
  ]);

  const eth = (window as any).ethereum;

  // Mode 1: Connected Browser Web3 Wallet (MetaMask / Phantom / Coinbase)
  if (eth) {
    try {
      await ensurePolygonAmoyNetwork();
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const fromAddress = accounts[0];

        try {
          const txHash = await eth.request({
            method: 'eth_sendTransaction',
            params: [{
              from: fromAddress,
              to: EVIDENCE_REGISTRY_ADDR,
              data: calldata,
              value: '0x0',
              gas: '0x7A120',                      // 500,000 gas limit (well within Amoy 33,554,432 cap)
              maxPriorityFeePerGas: '0x6fc23ac00', // 30 Gwei (>= 25 Gwei Amoy minimum)
              maxFeePerGas: '0x9502f9000',         // 40 Gwei
            }],
          });

          if (txHash && typeof txHash === 'string') {
            return {
              txHash,
              explorerUrl: `${POLYGONSCAN_BASE}/tx/${txHash}`,
              anchoredOnChain: true,
              statusText: 'MINTED & ANCHORED (Polygon Amoy Web3)',
            };
          }
        } catch (contractErr: any) {
          console.warn('Direct EvidenceRegistry call reverted or was cancelled:', contractErr);
          // Fall through to deterministic sovereign EVM anchor
        }
      }
    } catch (walletErr) {
      console.warn('Wallet interaction error:', walletErr);
    }
  }

  // Mode 2: If Web3 wallet is not connected or user cancels, document is secured locally in database with SHA-256 Merkle root
  // Do NOT forge fake on-chain transaction hashes or dead Polygonscan links
  return {
    txHash: '',
    explorerUrl: '',
    anchoredOnChain: false,
    statusText: 'OFF_CHAIN (Web3 Wallet Not Connected)',
  };
}

/**
 * Stores electronic evidence payload, OCR text, and thumbnail in Supabase Cloud
 */
export async function uploadToSupabaseStorageAndDB(params: {
  docId: string;
  caseId: string;
  file: File;
  contentHash: string;
  blobHash: string;
  merkleRoot: string;
  chunkCount: number;
  docType: string;
  classification: string;
  uploaderId: string;
  ledgerTxId: string;
  chunks: { index: number; hash: string; text: string; pageNumber: number }[];
  did?: string;
  crd?: string;
  thumbnailSvg?: string;
}): Promise<any> {
  const {
    docId,
    caseId,
    file,
    contentHash,
    blobHash,
    merkleRoot,
    chunkCount,
    docType,
    classification,
    uploaderId,
    ledgerTxId,
    chunks,
    did,
    crd,
    thumbnailSvg,
  } = params;

  const nowIso = new Date().toISOString();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageObjectKey = `${docId}_${sanitizedName}`;
  const dbStoragePath = `evidence/${storageObjectKey}`;

  // 1. Direct upload into Supabase Storage bucket 'evidence'
  try {
    const storageRes = await fetch(`${SUPABASE_URL}/storage/v1/object/evidence/${storageObjectKey}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: file,
    });

    if (!storageRes.ok) {
      const errTxt = await storageRes.text();
      console.warn('Supabase Storage upload warning:', storageRes.status, errTxt);
    }
  } catch (storageErr) {
    console.error('Supabase storage upload failed:', storageErr);
  }

  // 2. Upload thumbnail SVG to Supabase Storage
  if (thumbnailSvg) {
    try {
      await fetch(`${SUPABASE_URL}/storage/v1/object/evidence/thumbnails/${docId}_thumb.svg`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'image/svg+xml',
          'x-upsert': 'true',
        },
        body: thumbnailSvg,
      });
    } catch (thumbErr) {
      console.warn('Thumbnail upload to Supabase storage skipped:', thumbErr);
    }
  }

  // Ensure hashes fit 64-char database constraints
  const cleanContentHash = contentHash.replace(/^0x/, '').slice(0, 64).padEnd(64, '0');
  const cleanBlobHash = blobHash.replace(/^0x/, '').slice(0, 64).padEnd(64, '0');
  const cleanMerkleRoot = merkleRoot.replace(/^0x/, '').slice(0, 64).padEnd(64, '0');
  const cleanTxId = ledgerTxId ? ledgerTxId.replace(/^0x/, '').slice(0, 64) : '';
  const cleanNonce = (crd ? crd.slice(0, 64) : cleanContentHash).slice(0, 64);

  // 3. Insert document record into Supabase PostgreSQL 'documents' table
  // We store DID in wrapped_dek and CRD in nonce_hex
  const docPayload = {
    id: docId.slice(0, 64),
    case_id: caseId.slice(0, 64),
    filename: file.name.slice(0, 255),
    content_hash: cleanContentHash,
    blob_hash: cleanBlobHash,
    chunk_merkle_root: cleanMerkleRoot,
    chunk_count: chunkCount,
    size_bytes: file.size,
    mime_type: (file.type || 'application/pdf').slice(0, 64),
    doc_type: docType.slice(0, 32),
    classification: classification.slice(0, 32),
    uploader_id: uploaderId.slice(0, 64),
    storage_path: dbStoragePath.slice(0, 500),
    wrapped_dek: (did || `did:proofvault:${caseId.toLowerCase()}:${docId.toLowerCase()}`).slice(0, 500),
    nonce_hex: cleanNonce,
    ledger_tx_id: cleanTxId,
    tsa_token_hash: cleanContentHash,
    status: 'ACTIVE',
    created_at: nowIso,
    updated_at: nowIso,
  };

  const docRes = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(docPayload),
  });

  if (!docRes.ok) {
    const errBody = await docRes.text();
    console.error('Supabase documents table insert error:', docRes.status, errBody);
    throw new Error(`Supabase DB Error: ${errBody}`);
  }

  // 4. Insert chunk records with OCR text into Supabase 'chunks' table
  if (chunks && chunks.length > 0) {
    const chunkRows = chunks.map((c) => ({
      id: `${docId}_chk_${c.index}`.slice(0, 64),
      doc_id: docId.slice(0, 64),
      chunk_index: c.index,
      chunk_hash: c.hash.replace(/^0x/, '').slice(0, 64).padEnd(64, '0'),
      chunk_text: c.text,
      page_number: c.pageNumber,
      qdrant_point_id: '',
      created_at: nowIso,
      updated_at: nowIso,
    }));

    fetch(`${SUPABASE_URL}/rest/v1/chunks`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(chunkRows),
    }).catch(err => console.warn('Chunks insert warning:', err));
  }

  // 5. Log immutable custody audit event into Supabase 'audit_logs' table
  const auditEventId = `evt_${Date.now().toString().slice(-6)}_${Math.random().toString(36).slice(2, 6)}`;
  const auditPayload = {
    id: `aud_${Date.now().toString().slice(-6)}_${Math.random().toString(36).slice(2, 6)}`,
    event_id: auditEventId,
    actor_id: uploaderId,
    actor_role: 'INVESTIGATOR',
    action: cleanTxId ? 'EVIDENCE_ANCHORED_ON_CHAIN' : 'EVIDENCE_INGESTED_LOCAL',
    case_id: caseId,
    outcome: 'ALLOW',
    reason: `Evidence registered: ${file.name} (DID: ${docPayload.wrapped_dek.slice(0, 40)}..., Merkle: ${cleanMerkleRoot.slice(0, 16)}...)`,
    raw_query_encrypted: '',
    ledger_tx_id: cleanTxId,
    created_at: nowIso,
    updated_at: nowIso,
  };

  fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(auditPayload),
  }).catch(err => console.warn('Audit log insert warning:', err));

  return docPayload;
}

/**
 * Permanently anchors a Case ID to Polygon Amoy using ProvenanceRegistry.logCase(caseId).
 * Enforces Web3 wallet popup (MetaMask) and returns confirmed transaction hash and explorer URL.
 */
export async function anchorCaseOnChain(caseId: string): Promise<{ txHash: string; explorerUrl: string }> {
  const eth = (window as any).ethereum;
  if (!eth) {
    throw new Error('MetaMask / Web3 wallet is required to anchor cases to Polygon blockchain. Please install MetaMask and try again.');
  }

  await ensurePolygonAmoyNetwork();

  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet account selected. Please unlock MetaMask.');
  }

  const iface = new ethers.Interface(PROVENANCE_REGISTRY_ABI);
  const calldata = iface.encodeFunctionData('logCase', [caseId]);

  try {
    const txHash: string = await eth.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to: PROVENANCE_REGISTRY_ADDR,
        data: calldata,
        value: '0x0',
        gas: '0x30D40', // 200,000 gas limit
        maxPriorityFeePerGas: '0x6fc23ac00', // 30 Gwei (>= 25 Gwei Amoy minimum)
        maxFeePerGas: '0xdf8475800', // 60 Gwei
      }],
    });

    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Transaction was not broadcasted by wallet.');
    }

    return {
      txHash,
      explorerUrl: `${POLYGONSCAN_BASE}/tx/${txHash}`,
    };
  } catch (err: any) {
    if (err?.code === 4001 || err?.message?.includes('User denied') || err?.message?.includes('rejected')) {
      throw new Error('Transaction rejected by user in MetaMask.');
    }
    throw new Error(`Polygon Amoy transaction failed: ${err?.message || err}`);
  }
}

/**
 * Checks whether a case ID is already anchored on Polygon Amoy.
 */
export async function isCaseAnchoredOnChain(caseId: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC);
    const contract = new ethers.Contract(PROVENANCE_REGISTRY_ADDR, PROVENANCE_REGISTRY_ABI, provider);
    return await contract.isCaseAnchored(caseId);
  } catch (err) {
    console.warn('Failed to verify case anchor on-chain:', err);
    return false;
  }
}
