// Automated Polygonscan Amoy verification runner for EvidenceRegistry
const hre = require("hardhat");

async function main() {
  const address = process.env.VITE_POLYGON_EVIDENCE_REGISTRY || "0xF022e8E8E7FD5d565fAb24dC74B6fAc1c8760a01";
  console.log("Verifying EvidenceRegistry at:", address);
  try {
    await hre.run("verify:verify", { address, constructorArguments: [] });
  } catch (err) {
    console.log("Verification notice:", err.message);
  }
}

if (require.main === module) main();
