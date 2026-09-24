const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProvenanceRegistry", function () {
  let provenanceRegistry, owner, officer;

  beforeEach(async function () {
    [owner, officer] = await ethers.getSigners();
    const ProvenanceRegistry = await ethers.getContractFactory("ProvenanceRegistry");
    provenanceRegistry = await ProvenanceRegistry.deploy();
    await provenanceRegistry.waitForDeployment();
  });

  it("should deploy with initial admin", async function () {
    expect(await provenanceRegistry.isAdmin(owner.address)).to.be.true;
  });

  it("should allow any wallet to log a case anchor", async function () {
    const caseId = "CASE009";
    const tx = await provenanceRegistry.connect(officer).logCase(caseId);
    await tx.wait();
    expect(await provenanceRegistry.isCaseAnchored(caseId)).to.be.true;
  });
});
