const hre = require("hardhat");

async function main() {
  const contractClass = "FungibleTokenUpgradeable";
  const contractFactory = await hre.ethers.getContractFactory(contractClass);

  const contract = await contractFactory.deploy();
  await contract.deployed();

  const [owner] = await hre.ethers.getSigners();
  const initArgs = [
    "SYRO 1M",
    "SYRO1M",
    hre.ethers.utils.parseUnits("1000000", "ether"),
    "0xfe32DBc156E104D99428147e40135a706A08D6F6",
  ];
  await contract.initialize(...initArgs);

  console.log(contractClass, contract.address);
  console.log(
    "hh verify",
    contract.address,
    "--contract contracts/" +
      contractClass +
      ".sol:" +
      contractClass +
      " --network",
    hre.network.name
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
