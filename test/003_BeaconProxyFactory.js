const { expect } = require("chai");
const { ethers } = require("hardhat");
const abi = require("../artifacts/contracts/FungibleTokenUpgradeable.sol/FungibleTokenUpgradeable.json");
const upgradeableABI = require("../artifacts/@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol/UpgradeableBeacon.json");

describe("BeaconProxyFactory contract", function () {
  let tokenContract;
  let contract;
  let upgradeableContract;
  let owner;
  let addrs;

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();

    const tokenContractFactory = await ethers.getContractFactory(
      "FungibleTokenUpgradeable"
    );
    tokenContract = await tokenContractFactory.deploy();

    const contractFactory = await ethers.getContractFactory(
      "BeaconProxyFactory"
    );
    contract = await contractFactory.deploy(
      tokenContract.address,
      owner.address
    );

    const receipt = await contract.deployTransaction.wait();
    const upgradeableAddress = receipt.logs[0].address;
    upgradeableContract = new ethers.Contract(
      upgradeableAddress,
      upgradeableABI.abi,
      owner
    );
  });

  describe("#createProxy", function () {
    it("returns proxy token with right init", async function () {
      // const initArgs = [
      //   "TOKEN NAME",
      //   "TOKEN",
      //   ethers.utils.parseUnits("100", "ether"),
      //   owner.address,
      // ];
      const initArgs = [
        "TRIIP TOKEN",
        "TRIIP",
        hre.ethers.utils.parseUnits("500000000", "ether"),
        "0x2E59B497951F135db80Db6A81c8b5298b7eF73B4",
      ];
      const data = tokenContract.interface.encodeFunctionData(
        "initialize",
        initArgs
      );
      console.log("data", data);
      const tx = await contract.createProxy(data);
      const receipt = await tx.wait();
      const proxyAddress = receipt.events[0].address;
      const proxyContract = new ethers.Contract(proxyAddress, abi.abi, owner);

      // init right data
      expect(await proxyContract.name()).to.equal("TOKEN NAME");
      expect(await proxyContract.symbol()).to.equal("TOKEN");
      expect(await proxyContract.totalSupply()).to.equal(
        ethers.utils.parseUnits("100", "ether")
      );
      expect(await proxyContract.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("100", "ether")
      );
      expect(await proxyContract.owner()).to.equal(owner.address);
      expect(
        await proxyContract.hasRole(
          ethers.utils.id("PAUSER_ROLE"),
          owner.address
        )
      ).to.equal(true);
      expect(
        await proxyContract.hasRole(
          ethers.utils.id("MINTER_ROLE"),
          owner.address
        )
      ).to.equal(true);
      expect(
        await proxyContract.hasRole(
          ethers.utils.id("BURNER_ROLE"),
          owner.address
        )
      ).to.equal(true);
      expect(await proxyContract.version()).to.equal("v1");
    });

    describe("When upgrade implementation", function () {
      it("returns proxy version v2 and keeps states of proxy", async function () {
        const initArgs = [
          "TOKEN NAME",
          "TOKEN",
          ethers.utils.parseUnits("100", "ether"),
          owner.address,
        ];
        const data = tokenContract.interface.encodeFunctionData(
          "initialize",
          initArgs
        );
        const tx = await contract.createProxy(data);
        const receipt = await tx.wait();
        const proxyAddress = receipt.events[0].address;
        const proxyContract = new ethers.Contract(proxyAddress, abi.abi, owner);
        expect(await proxyContract.version()).to.equal("v1");
        expect(await upgradeableContract.implementation()).to.eq(
          tokenContract.address
        );

        // create states
        await proxyContract.transfer(
          addrs[0].address,
          ethers.utils.parseUnits("15", "ether")
        );
        expect(await proxyContract.balanceOf(addrs[0].address)).to.equal(
          ethers.utils.parseUnits("15", "ether")
        );
        expect(await proxyContract.balanceOf(owner.address)).to.equal(
          ethers.utils.parseUnits("85", "ether")
        );

        const tokenContractV2Factory = await ethers.getContractFactory(
          "FungibleTokenUpgradeableV2"
        );
        const tokenContractV2 = await tokenContractV2Factory.deploy();
        await upgradeableContract.upgradeTo(tokenContractV2.address);
        expect(await proxyContract.version()).to.equal("v2");
        expect(await upgradeableContract.implementation()).to.eq(
          tokenContractV2.address
        );
        expect(await proxyContract.balanceOf(addrs[0].address)).to.equal(
          ethers.utils.parseUnits("15", "ether")
        );
        expect(await proxyContract.balanceOf(owner.address)).to.equal(
          ethers.utils.parseUnits("85", "ether")
        );
      });
    });
  });
});
