const hre = require("hardhat");

async function main() {
  console.log("--> Initiating Proof Vault Smart Contract Deployment to Polygon Amoy (ChainId 80002)...");
  console.log("--> Standard: Strict TRD §12.1 Specification (EvidenceRegistry & ProvenanceRegistry)");

  const [deployer] = await hre.ethers.getSigners();
  console.log("--> Deploying from account:", deployer.address);

  // 1. Evidence Registry (TRD §12.1 & §13 Core Evidence & Merkle Root Anchor)
  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const evidenceRegistry = await EvidenceRegistry.deploy();
  await evidenceRegistry.waitForDeployment();
  const evidenceAddr = await evidenceRegistry.getAddress();
  console.log("--> 1. EvidenceRegistry deployed at:", evidenceAddr);

  // 2. Provenance Registry (TRD §12.1 Chain-of-Custody & Forensic Audit Trail)
  const ProvenanceRegistry = await hre.ethers.getContractFactory("ProvenanceRegistry");
  const provenanceRegistry = await ProvenanceRegistry.deploy();
  await provenanceRegistry.waitForDeployment();
  const provenanceAddr = await provenanceRegistry.getAddress();
  console.log("--> 2. ProvenanceRegistry deployed at:", provenanceAddr);

  console.log("\n--> Both Proof Vault TRD §12.1 smart contracts deployed successfully to Polygon Amoy!");
  console.log("\nConfiguration environment snippet:");
  console.log(`POLYGON_EVIDENCE_REGISTRY_ADDRESS=${evidenceAddr}`);
  console.log(`POLYGON_PROVENANCE_REGISTRY_ADDRESS=${provenanceAddr}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
