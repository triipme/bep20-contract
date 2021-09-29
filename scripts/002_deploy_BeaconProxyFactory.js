const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  // Deploy implementation
  const implementationClass = "FungibleTokenUpgradeable";
  const implementationFactory = await hre.ethers.getContractFactory(
    implementationClass
  );
  const implementation = await implementationFactory.deploy();
  await implementation.deployed();
  const implementationInitArgs = [
    "TRIIP FTU",
    "TRIIPFTU",
    hre.ethers.utils.parseUnits("0", "ether"),
    owner.address,
  ];
  await implementation.initialize(...implementationInitArgs);

  console.log(implementationClass, implementation.address);
  console.log(
    "hh verify",
    implementation.address,
    "--contract contracts/" +
      implementationClass +
      ".sol:" +
      implementationClass +
      " --network",
    hre.network.name
  );
  console.log("");

  // Deploy factory
  const contractClass = "BeaconProxyFactory";
  const contractFactory = await hre.ethers.getContractFactory(contractClass);
  const initArgs = [implementation.address, owner.address];
  const contract = await contractFactory.deploy(...initArgs);
  let receipt = await contract.deployTransaction.wait();
  const beacon = receipt.logs[0].address;

  console.log("Implementation", implementation.address);
  console.log(contractClass, contract.address);
  console.log("Beacon", beacon);
  console.log(
    "hh verify",
    contract.address,
    JSON.stringify(initArgs)
      .replace(/[\[\]]/g, "")
      .replace(/[,]/g, " "),
    "--contract contracts/" +
      contractClass +
      ".sol:" +
      contractClass +
      " --network",
    hre.network.name
  );

  // Create first proxy
  const args = [
    "TRIIP TOKEN",
    "TRIIP",
    hre.ethers.utils.parseUnits("500000000", "ether"),
    "0x2E59B497951F135db80Db6A81c8b5298b7eF73B4",
  ];
  const data = implementation.interface.encodeFunctionData("initialize", args);
  const tx = await contract.createProxy(data);
  receipt = await tx.wait();
  const contractAddress = receipt.events[0].address;
  console.log("proxy:", contractAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
