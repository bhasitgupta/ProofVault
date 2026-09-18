const hre = require("hardhat");

async function main() {
  console.log("--> Verifying NYAYA-VAULT TRD §12.1 contracts on Polygonscan Amoy...");
  const contracts = [
    { name: "EvidenceRegistry", address: process.env.POLYGON_EVIDENCE_REGISTRY_ADDRESS || process.env.POLYGON_EVIDENCE_CONTRACT_ADDRESS },
    { name: "ProvenanceRegistry", address: process.env.POLYGON_PROVENANCE_REGISTRY_ADDRESS || process.env.POLYGON_PROVENANCE_CONTRACT_ADDRESS },
  ];

  for (const c of contracts) {
    if (c.address) {
      try {
        await hre.run("verify:verify", { address: c.address, constructorArguments: [] });
        console.log(`--> Verified ${c.name} at ${c.address}`);
      } catch (e) {
        console.log(`--> ${c.name} verification note:`, e.message);
      }
    } else {
      console.log(`--> Skipping ${c.name}: Address not set in environment.`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
