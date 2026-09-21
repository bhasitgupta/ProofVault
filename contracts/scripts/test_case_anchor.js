const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const contractAddress = "0x11A0a778303196d735B9cCdE62eB5bC5B29a855a";
  console.log("--> Testing ProvenanceRegistry at:", contractAddress);
  console.log("Caller:", signer.address);

  const registry = await hre.ethers.getContractAt("ProvenanceRegistry", contractAddress);

  const testCaseId = "CASE_VERIFY_" + Date.now();
  console.log(`--> Calling logCase("${testCaseId}")...`);

  const tx = await registry.logCase(testCaseId);
  console.log("--> TX submitted:", tx.hash);
  console.log("--> Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("--> CONFIRMED in block:", receipt.blockNumber);

  const isAnchored = await registry.isCaseAnchored(testCaseId);
  console.log("--> isCaseAnchored:", isAnchored);

  const anchor = await registry.getCaseAnchor(testCaseId);
  console.log("--> Anchor record:", {
    caseId: anchor.caseId,
    anchoredBy: anchor.anchoredBy,
    anchoredAt: new Date(Number(anchor.anchoredAt) * 1000).toISOString(),
    exists: anchor.exists,
  });

  const total = await registry.getTotalCasesAnchored();
  console.log("--> Total cases anchored:", total.toString());
  console.log(`--> Polygonscan: https://amoy.polygonscan.com/tx/${tx.hash}`);
}

main().catch(console.error);
