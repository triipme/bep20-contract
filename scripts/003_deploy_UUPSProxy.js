const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const contractClass = "FungibleTokenUpgradeable";
  const contractFactory = await hre.ethers.getContractFactory(contractClass);

  const initArgs = [
    process.env.DEPLOY_TOKEN_NAME,
    process.env.DEPLOY_TOKEN_SYMBOL,
    hre.ethers.utils.parseUnits(process.env.DEPLOY_TOTAL_SUPPLY, "ether"),
    process.env.DEPLOY_OWNER_ADDRESS || owner.address,
  ];
  const contract = await upgrades.deployProxy(contractFactory, initArgs, {
    kind: "uups",
  });
  const tx = await contract.deployed();
  const receipt = await tx.deployTransaction.wait();
  const implementation = "0x" + receipt.logs[0].topics[1].substring(26, 66);

  console.log("implementation", implementation);
  console.log("proxy", contract.address);

  console.log(
    "hh verify",
    implementation,
    "--contract contracts/" +
      contractClass +
      ".sol:" +
      contractClass +
      " --network",
    hre.network.name
  );

  console.log("/proxyContractChecker?a=", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
