const hre = require("hardhat");

async function main() {
  console.log("--> Verifying NYAYA-VAULT contracts on Polygonscan Amoy...");
  const contracts = [
    { name: "EvidenceRegistry", address: process.env.POLYGON_EVIDENCE_REGISTRY_ADDRESS || process.env.POLYGON_EVIDENCE_CONTRACT_ADDRESS },
    { name: "ProvenanceRegistry", address: process.env.POLYGON_PROVENANCE_REGISTRY_ADDRESS || process.env.POLYGON_PROVENANCE_CONTRACT_ADDRESS },
    { name: "AuditAnchorRegistry", address: process.env.POLYGON_AUDIT_ANCHOR_REGISTRY_ADDRESS },
    { name: "LegalHoldRegistry", address: process.env.POLYGON_LEGAL_HOLD_REGISTRY_ADDRESS },
    { name: "AccessControlRegistry", address: process.env.POLYGON_ACCESS_CONTROL_REGISTRY_ADDRESS },
  ];

  for (const c of contracts) {
    if (c.address) {
      try {
        await hre.run("verify:verify", { address: c.address, constructorArguments: [] });
        console.log(`--> Verified ${c.name} at ${c.address}`);
      } catch (e) {
        console.log(`--> ${c.name} verification note:`, e.message);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
