const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EvidenceRegistry", function () {
  let evidenceRegistry, owner, officer, unauthorized;

  beforeEach(async function () {
    [owner, officer, unauthorized] = await ethers.getSigners();
    const EvidenceRegistry = await ethers.getContractFactory("EvidenceRegistry");
    evidenceRegistry = await EvidenceRegistry.deploy();
    await evidenceRegistry.waitForDeployment();
  });

  it("should deploy with owner as admin", async function () {
    expect(await evidenceRegistry.owner()).to.equal(owner.address);
  });

  it("should allow permissionless evidence registration", async function () {
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("DOC_TEST_001"));
    const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("MERKLE_ROOT_001"));
    const tx = await evidenceRegistry.connect(officer).registerEvidence(
      "DOC001",
      "CASE001",
      docHash,
      merkleRoot,
      "CONFIDENTIAL"
    );
    await tx.wait();
    const isReg = await evidenceRegistry.isRegistered("DOC001");
    expect(isReg).to.be.true;
  });
});
