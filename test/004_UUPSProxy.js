const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UUPSProxy contract", function () {
  let owner;
  let addrs;

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();
  });

  describe("#createProxy", function () {
    it("returns proxy token with right init", async function () {
      const tokenContractFactory = await ethers.getContractFactory(
        "FungibleTokenUpgradeable"
      );

      const initArgs = [
        "TOKEN NAME",
        "TOKENSYM",
        ethers.utils.parseUnits("100", "ether"),
        owner.address,
      ];

      // const data = tokenContractFactory.interface.encodeFunctionData(
      //   "initialize",
      //   initArgs
      // );
      // console.log(data);

      const proxyContract = await upgrades.deployProxy(
        tokenContractFactory,
        initArgs,
        {
          kind: "uups",
        }
      );
      // const tx = await contract.deployed();
      // const receipt = await tx.deployTransaction.wait();
      // console.log("0x" + receipt.logs[0].topics[1].substring(26, 66));

      // init right data
      expect(await proxyContract.name()).to.equal("TOKEN NAME");
      expect(await proxyContract.symbol()).to.equal("TOKENSYM");
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

      await proxyContract.transfer(
        addrs[0].address,
        ethers.utils.parseUnits("16", "ether")
      );
      expect(await proxyContract.balanceOf(addrs[0].address)).to.equal(
        ethers.utils.parseUnits("16", "ether")
      );
      expect(await proxyContract.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("84", "ether")
      );

      // upgrade v2
      const tokenContractFactoryV2 = await ethers.getContractFactory(
        "FungibleTokenUpgradeableV2"
      );
      await upgrades.upgradeProxy(proxyContract, tokenContractFactoryV2);
      expect(await proxyContract.version()).to.equal("v2");
      expect(await proxyContract.balanceOf(addrs[0].address)).to.equal(
        ethers.utils.parseUnits("16", "ether")
      );
      expect(await proxyContract.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("84", "ether")
      );

      // rollback v1
      await upgrades.upgradeProxy(proxyContract, tokenContractFactory);
      expect(await proxyContract.version()).to.equal("v1");
      expect(await proxyContract.balanceOf(addrs[0].address)).to.equal(
        ethers.utils.parseUnits("16", "ether")
      );
      expect(await proxyContract.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("84", "ether")
      );

      // upgrade v2 without owner
      await expect(
        upgrades.upgradeProxy(
          proxyContract,
          tokenContractFactoryV2.connect(addrs[0])
        )
      ).to.be.revertedWith("Ownable");
      expect(await proxyContract.version()).to.equal("v1");
      expect(await proxyContract.balanceOf(addrs[0].address)).to.equal(
        ethers.utils.parseUnits("16", "ether")
      );
      expect(await proxyContract.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("84", "ether")
      );
    });
  });
});
