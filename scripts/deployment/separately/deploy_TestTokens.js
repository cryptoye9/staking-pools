const hre = require("hardhat");
const { ethers } = hre;
const { verify, getAddressSaver } = require("../utilities/helpers");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();

    // Deployed contract address saving functionality
    const network = 'MUMBAI'; // Getting of the current network
    // Path for saving of addresses of deployed contracts
    const addressesPath = path.join(__dirname, "../deploymentAddresses.json");
    // The function to save an address of a deployed contract to the specified file and to output to console
    const saveAddress = getAddressSaver(addressesPath, network, true);

    const ERC20 = (await ethers.getContractFactory("TestERC20")).connect(deployer);
    const stakingToken = await ERC20.deploy("StT", "St20");
    await stakingToken.deployed();

    const rewardToken = await ERC20.deploy("RewT", "Rew20");
    await rewardToken.deployed();

    // Saving of an address of the deployed contract to the file
    saveAddress("StakingToken", stakingToken.address);
    saveAddress("RewardToken", rewardToken.address);

    // Verification of the deployed contract
    await verify(stakingToken.address, ["StT", "St20"]); 
    await verify(rewardToken.address, ["RewT", "Rew20"]); 
    console.log("Deployment is completed.");
}

// This pattern is recommended to be able to use async/await everywhere and properly handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});