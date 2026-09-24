// Automated Polygonscan Amoy verification runner for ProvenanceRegistry
const hre = require("hardhat");

async function main() {
  const address = process.env.VITE_POLYGON_PROVENANCE_REGISTRY || "0x11A0a778303196d735B9cCdE62eB5bC5B29a855a";
  console.log("Verifying ProvenanceRegistry at:", address);
  try {
    await hre.run("verify:verify", { address, constructorArguments: [] });
  } catch (err) {
    console.log("Verification notice:", err.message);
  }
}

if (require.main === module) main();
