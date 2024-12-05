require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: "0.8.4", // or your preferred Solidity version
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, // Use Infura or Alchemy URL for Sepolia
      accounts: [`0x${process.env.PRIVATE_KEY}`], // Your private key for deployment
      chainId: 11155111,  // Sepolia Chain ID
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY, // Optional: To verify contracts on Etherscan
  },
};
