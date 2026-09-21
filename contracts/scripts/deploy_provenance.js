const hre = require("hardhat");

async function main() {
  console.log("--> Deploying upgraded ProvenanceRegistry to Polygon Amoy...");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const ProvenanceRegistry = await hre.ethers.getContractFactory("ProvenanceRegistry");
  const provenanceRegistry = await ProvenanceRegistry.deploy();
  await provenanceRegistry.waitForDeployment();
  const address = await provenanceRegistry.getAddress();
  console.log("--> SUCCESS! ProvenanceRegistry deployed at:", address);
  console.log(`POLYGON_PROVENANCE_REGISTRY_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
