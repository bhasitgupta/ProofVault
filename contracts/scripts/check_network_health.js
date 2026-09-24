// Diagnostic script to check Polygon Amoy RPC health and block timestamp drift
const { ethers } = require("hardhat");

async function main() {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  console.log("Latest Polygon Amoy Block:", blockNumber);
  console.log("Block Timestamp:", new Date(block.timestamp * 1000).toISOString());
}

if (require.main === module) main();
