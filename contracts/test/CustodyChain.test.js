const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustodyChain Verification", function () {
  it("should verify deterministic custody transfer tags", async function () {
    const tag = "CUSTODY_TRANSFER:CASE001:PoliceMSP:ProsecutorMSP:OFFICER406:1700000000";
    const tagHash = ethers.keccak256(ethers.toUtf8Bytes(tag));
    expect(tagHash).to.have.lengthOf(66);
  });
});
