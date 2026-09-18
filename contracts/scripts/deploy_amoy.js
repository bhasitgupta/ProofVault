const hre = require("hardhat");

async function main() {
  console.log("--> Initiating NYAYA-VAULT Smart Contract Deployment to Polygon Amoy (ChainId 80002)...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("--> Deploying using account:", deployer.address);

  // 1. Evidence Registry
  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const evidenceRegistry = await EvidenceRegistry.deploy();
  await evidenceRegistry.waitForDeployment();
  console.log("--> EvidenceRegistry deployed at:", await evidenceRegistry.getAddress());

  // 2. Provenance Registry
  const ProvenanceRegistry = await hre.ethers.getContractFactory("ProvenanceRegistry");
  const provenanceRegistry = await ProvenanceRegistry.deploy();
  await provenanceRegistry.waitForDeployment();
  console.log("--> ProvenanceRegistry deployed at:", await provenanceRegistry.getAddress());

  // 3. Audit Anchor Registry
  const AuditAnchorRegistry = await hre.ethers.getContractFactory("AuditAnchorRegistry");
  const auditAnchorRegistry = await AuditAnchorRegistry.deploy();
  await auditAnchorRegistry.waitForDeployment();
  console.log("--> AuditAnchorRegistry deployed at:", await auditAnchorRegistry.getAddress());

  // 4. Legal Hold Registry
  const LegalHoldRegistry = await hre.ethers.getContractFactory("LegalHoldRegistry");
  const legalHoldRegistry = await LegalHoldRegistry.deploy();
  await legalHoldRegistry.waitForDeployment();
  console.log("--> LegalHoldRegistry deployed at:", await legalHoldRegistry.getAddress());

  console.log("--> All NYAYA-VAULT contracts deployed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
