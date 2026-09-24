const hre = require("hardhat");

async function main() {
  console.log("--> Deploying upgraded EvidenceRegistry to Polygon Amoy...");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const evidenceRegistry = await EvidenceRegistry.deploy();
  await evidenceRegistry.waitForDeployment();
  const address = await evidenceRegistry.getAddress();
  console.log("--> SUCCESS! EvidenceRegistry deployed at:", address);
  console.log(`POLYGON_EVIDENCE_REGISTRY_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
