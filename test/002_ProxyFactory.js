const { expect } = require("chai");
const { ethers } = require("hardhat");
const abi = require("../artifacts/contracts/FungibleTokenUpgradeable.sol/FungibleTokenUpgradeable.json");

describe("ProxyFactory contract", function () {
  let tokenContract;
  let contract;
  let owner;
  let addrs;

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();

    const contractFactory = await ethers.getContractFactory("ProxyFactory");
    contract = await contractFactory.deploy();

    const tokenContractFactory = await ethers.getContractFactory(
      "FungibleTokenUpgradeable"
    );
    tokenContract = await tokenContractFactory.deploy();
  });

  describe("#createProxy", function () {
    it("returns proxy token", async function () {
      const initArgs = [
        "FungibleTokenUpgradeable NAME",
        "FungibleTokenUpgradeable",
        ethers.utils.parseUnits("101.5", "ether"),
        owner.address,
      ];
      const data = tokenContract.interface.encodeFunctionData(
        "initialize",
        initArgs
      );
      const tx = await contract.createProxy(tokenContract.address, data);
      const receipt = await tx.wait();
      const proxyAddress = receipt.events[0].address;
      const proxyContract = new ethers.Contract(proxyAddress, abi.abi, owner);

      // init right data
      expect(await proxyContract.name()).to.equal(
        "FungibleTokenUpgradeable NAME"
      );
      expect(await proxyContract.symbol()).to.equal("FungibleTokenUpgradeable");
      expect(await proxyContract.totalSupply()).to.equal(
        ethers.utils.parseUnits("101.5", "ether")
      );
      expect(await proxyContract.owner()).to.equal(owner.address);
      expect(
        await proxyContract.hasRole(
          ethers.utils.id("PAUSER_ROLE"),
          owner.address
        )
      ).to.equal(true);
    });
  });
});
