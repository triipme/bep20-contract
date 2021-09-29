const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FungibleTokenUpgradeable contract", function () {
  let contract;
  let owner;
  let addrs;

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();

    const contractFactory = await ethers.getContractFactory("FungibleTokenUpgradeable");
    contract = await contractFactory.deploy();
    contract.initialize(
      "FungibleTokenUpgradeable TOKEN",
      "FungibleTokenUpgradeable",
      ethers.utils.parseUnits("100", "ether"),
      owner.address
    );
  });

  describe("#name", function () {
    it("returns token name", async function () {
      expect(await contract.name()).to.equal("FungibleTokenUpgradeable TOKEN");
    });
  });

  describe("#symbol", function () {
    it("returns token symbol", async function () {
      expect(await contract.symbol()).to.equal("FungibleTokenUpgradeable");
    });
  });

  describe("#totalSupply", function () {
    it("returns token totalSupply", async function () {
      expect(await contract.totalSupply()).to.equal(
        ethers.utils.parseUnits("100", "ether")
      );
    });
  });

  describe("#owner", function () {
    it("returns owner address", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("#balanceOf", function () {
    describe("when account is owner", function () {
      it("returns total supply", async function () {
        expect(await contract.balanceOf(owner.address)).to.equal(
          ethers.utils.parseUnits("100", "ether")
        );
      });
    });
  });

  describe("#hasRole", function () {
    describe("#when check account is owner", function () {
      describe("#when role is PAUSER_ROLE", function () {
        it("returns true", async function () {
          expect(
            await contract.hasRole(await contract.PAUSER_ROLE(), owner.address)
          ).to.equal(true);
        });
      });
    });

    describe("#when check account is not owner", function () {
      it("returns false", async function () {
        expect(
          await contract.hasRole(await contract.PAUSER_ROLE(), addrs[0].address)
        ).to.equal(false);
      });
    });
  });

  describe("#pause", function () {
    it("sets paused", async function () {
      expect(await contract.paused()).to.equal(false);
      await contract.pause();
      expect(await contract.paused()).to.equal(true);
    });

    describe("#when call with not pauser", function () {
      it("reverts with AccessControl", async function () {
        const contractCall = await contract.connect(addrs[0]);
        await expect(contractCall.pause()).to.be.revertedWith("AccessControl");
      });
    });
  });

  describe("#unpause", function () {
    it("sets paused", async function () {
      await contract.pause();
      expect(await contract.paused()).to.equal(true);

      await contract.unpause();
      expect(await contract.paused()).to.equal(false);
    });

    describe("#when call with not pauser", function () {
      it("reverts with AccessControl", async function () {
        const contractCall = await contract.connect(addrs[0]);
        await expect(contractCall.unpause()).to.be.revertedWith(
          "AccessControl"
        );
      });
    });
  });

  describe("#initialize", function () {
    describe("#when call initialize again", function () {
      it("reverts with Initializable: contract is already initialized", async function () {
        await expect(
          contract.initialize(
            "FungibleTokenUpgradeable TOKEN",
            "FungibleTokenUpgradeable",
            ethers.utils.parseUnits("100", "ether"),
            owner.address
          )
        ).to.be.revertedWith("Initializable: contract is already initialized");
      });
    });
  });

  describe("#transfer", function () {
    it("transfers amount of sender to recipient", async function () {
      const recipient = addrs[0];
      const amount = ethers.utils.parseUnits("1.6", "ether");
      await contract.transfer(recipient.address, amount);

      expect(await contract.balanceOf(recipient.address)).to.equal(amount);

      await contract.transfer(recipient.address, amount);
      expect(await contract.balanceOf(recipient.address)).to.equal(
        ethers.utils.parseUnits("3.2", "ether")
      );
    });

    describe("when contract paused", function () {
      it("reverts with ERC20Pausable", async function () {
        await contract.pause();
        await expect(
          contract.transfer(
            addrs[0].address,
            ethers.utils.parseUnits("1.6", "ether")
          )
        ).to.be.revertedWith("ERC20Pausable: token transfer while paused");
      });
    });
  });

  describe("#burn", function () {
    it("burns sender tokens and decreases totalSupply", async function () {
      await contract.transfer(
        addrs[0].address,
        ethers.utils.parseUnits("10", "ether")
      );

      await contract.burn(ethers.utils.parseUnits("86.6", "ether"));

      expect(await contract.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("3.4", "ether")
      );
      expect(await contract.totalSupply()).to.equal(
        ethers.utils.parseUnits("13.4", "ether")
      );
    });
  });

  describe("#burnFrom", function () {
    beforeEach(async function () {
      const addr = addrs[0];
      await contract.transfer(addr.address, ethers.utils.parseUnits("10", "ether"));
      await contract.approve(
        addr.address,
        ethers.utils.parseUnits("23.6", "ether")
      );
    });
    it("burns account tokens and decreases totalSupply", async function () {
      const addr = addrs[0];
      const addrContract = contract.connect(addr);
      await addrContract.burnFrom(
        owner.address,
        ethers.utils.parseUnits("13.6", "ether")
      );

      expect(await contract.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("76.4", "ether")
      );
      expect(await contract.totalSupply()).to.equal(
        ethers.utils.parseUnits("86.4", "ether")
      );
    });

    describe("when currentAllowance is greater than burnAmount", function () {
      it("reverts with ERC20", async function () {
        const addr = addrs[0];
        const addrContract = contract.connect(addr);

        await expect(
          addrContract.burnFrom(
            owner.address,
            ethers.utils.parseUnits("23.7", "ether")
          )
        ).to.be.revertedWith("ERC20: burn amount exceeds allowance");
      });
    });
  });
});
