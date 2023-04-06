// This is a script for deployment and automatically verification of all the contracts (`contracts/`)
const { ethers, upgrades } = require("hardhat");
const { verify, getAddressSaver } = require("../utilities/helpers");
const path = require("path");
const deploymentAddresses = require("../deploymentAddresses.json")
const erc20ABI = require("../../../abi/contracts/token/ERC20.sol/TestERC20.json");

const ver = async function verifyContracts(address, arguments) {
  await hre
      .run('verify:verify', {
          address: address,
          constructorArguments: arguments,
      }).catch((err) => console.log(err))
}

async function main() {
    const [deployer] = await ethers.getSigners();

    // Deployed contract address saving functionality
    const network = 'MUMBAI'; // Getting of the current network
    // Path for saving of addresses of deployed contracts
    const addressesPath = path.join(__dirname, "../deploymentAddresses.json");
    // The function to save an address of a deployed contract to the specified file and to output to console
    const saveAddress = getAddressSaver(addressesPath, network, true);

    const rewardToken_addr = deploymentAddresses.MUMBAI.new.RewardToken;
    const rewardToken = new ethers.Contract(rewardToken_addr, erc20ABI, deployer)

    const StakingPools = (await ethers.getContractFactory("StakingPools")).connect(deployer);
    const stakingPools = await upgrades.deployProxy(StakingPools, [])
    await stakingPools.deployed();
    saveAddress("StakingPools", stakingPools.address);
    console.log("StakingPools deployed to " + stakingPools.address);

    // Verification of the deployed contract
    await ver(stakingPools.address, []); 

    await rewardToken.transfer(stakingPools.address, ethers.utils.parseEther('1000'));

    console.log("Deployment is completed.");
}

// This pattern is recommended to be able to use async/await everywhere and properly handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
