// Checks deployer native POL balance on Polygon Amoy testnet
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Address:", deployer.address);
  console.log("Polygon Amoy POL Balance:", ethers.formatEther(balance));
}

if (require.main === module) main();
