const hre = require("hardhat");

async function main() {
  console.log("--> Verifying NYAYA-VAULT contracts on Polygonscan Amoy...");
  const evidenceAddr = process.env.POLYGON_EVIDENCE_CONTRACT_ADDRESS;
  const provenanceAddr = process.env.POLYGON_PROVENANCE_CONTRACT_ADDRESS;

  if (evidenceAddr) {
    try {
      await hre.run("verify:verify", { address: evidenceAddr, constructorArguments: [] });
      console.log("--> Verified EvidenceRegistry at", evidenceAddr);
    } catch (e) {
      console.log("--> EvidenceRegistry verification note:", e.message);
    }
  }

  if (provenanceAddr) {
    try {
      await hre.run("verify:verify", { address: provenanceAddr, constructorArguments: [] });
      console.log("--> Verified ProvenanceRegistry at", provenanceAddr);
    } catch (e) {
      console.log("--> ProvenanceRegistry verification note:", e.message);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
