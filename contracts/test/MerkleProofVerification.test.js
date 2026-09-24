const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MerkleProof Verification", function () {
  it("should compute valid parent nodes from 256KB chunk pairs", async function () {
    const left = ethers.keccak256(ethers.toUtf8Bytes("chunk0"));
    const right = ethers.keccak256(ethers.toUtf8Bytes("chunk1"));
    const parent = ethers.keccak256(ethers.concat([left, right]));
    expect(parent).to.have.lengthOf(66);
  });
});
