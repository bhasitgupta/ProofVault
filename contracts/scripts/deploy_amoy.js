const hre = require("hardhat");

async function main() {
  console.log("--> Initiating NYAYA-VAULT Smart Contract Deployment to Polygon Amoy (ChainId 80002)...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("--> Deploying from account:", deployer.address);

  // 1. Evidence Registry (Core Evidence & Merkle Root Anchor)
  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const evidenceRegistry = await EvidenceRegistry.deploy();
  await evidenceRegistry.waitForDeployment();
  const evidenceAddr = await evidenceRegistry.getAddress();
  console.log("--> 1. EvidenceRegistry deployed at:", evidenceAddr);

  // 2. Provenance Registry (Chain-of-Custody & Forensic Audit Trail)
  const ProvenanceRegistry = await hre.ethers.getContractFactory("ProvenanceRegistry");
  const provenanceRegistry = await ProvenanceRegistry.deploy();
  await provenanceRegistry.waitForDeployment();
  const provenanceAddr = await provenanceRegistry.getAddress();
  console.log("--> 2. ProvenanceRegistry deployed at:", provenanceAddr);

  // 3. Audit Anchor Registry (Batch Merkle Root Rollup)
  const AuditAnchorRegistry = await hre.ethers.getContractFactory("AuditAnchorRegistry");
  const auditAnchorRegistry = await AuditAnchorRegistry.deploy();
  await auditAnchorRegistry.waitForDeployment();
  const auditAnchorAddr = await auditAnchorRegistry.getAddress();
  console.log("--> 3. AuditAnchorRegistry deployed at:", auditAnchorAddr);

  // 4. Legal Hold Registry (Statutory Court Preservation Orders)
  const LegalHoldRegistry = await hre.ethers.getContractFactory("LegalHoldRegistry");
  const legalHoldRegistry = await LegalHoldRegistry.deploy();
  await legalHoldRegistry.waitForDeployment();
  const legalHoldAddr = await legalHoldRegistry.getAddress();
  console.log("--> 4. LegalHoldRegistry deployed at:", legalHoldAddr);

  // 5. Access Control Registry (Zero-Trust Clearance & Roles)
  const AccessControlRegistry = await hre.ethers.getContractFactory("AccessControlRegistry");
  const accessControlRegistry = await AccessControlRegistry.deploy();
  await accessControlRegistry.waitForDeployment();
  const accessControlAddr = await accessControlRegistry.getAddress();
  console.log("--> 5. AccessControlRegistry deployed at:", accessControlAddr);

  console.log("\n--> All 5 NYAYA-VAULT smart contracts deployed successfully to Polygon Amoy!");
  console.log("\nConfiguration environment snippet:");
  console.log(`POLYGON_EVIDENCE_REGISTRY_ADDRESS=${evidenceAddr}`);
  console.log(`POLYGON_PROVENANCE_REGISTRY_ADDRESS=${provenanceAddr}`);
  console.log(`POLYGON_AUDIT_ANCHOR_REGISTRY_ADDRESS=${auditAnchorAddr}`);
  console.log(`POLYGON_LEGAL_HOLD_REGISTRY_ADDRESS=${legalHoldAddr}`);
  console.log(`POLYGON_ACCESS_CONTROL_REGISTRY_ADDRESS=${accessControlAddr}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
