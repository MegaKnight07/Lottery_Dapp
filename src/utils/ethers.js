// src/utils/ethers.js
import { ethers } from "ethers";
import abi from '../abi/Lottery.json'; // Import ABI from your Lottery contract

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS; // Your contract address here

// Get the Ethereum provider (MetaMask or any Ethereum provider)
export const getProvider = () => {
  if (window.ethereum) {
    // Initialize the provider with MetaMask without ENS
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider;
  } else {
    throw new Error("Ethereum wallet not found. Please install MetaMask.");
  }
};

// Get the contract instance using the provider
export const getContract = () => {
  const provider = getProvider(); // Get the provider
  const signer = provider.getSigner(); // Get the signer to interact with the contract
  const contract = new ethers.Contract("0x01bbC4e86fB24CAbFd9edFD208Ad984a7A9De299", abi, signer); // Initialize the contract instance
  return contract; // Return the contract instance
};

// Optionally, you can add a function to check if the user is connected to the correct network
export const checkNetwork = async () => {
  const provider = getProvider(); // Get the provider
  const network = await provider.getNetwork(); // Get the current network
  if (network.chainId !== 11155111) { // Sepolia network chainId
    console.error("Please switch to the Sepolia network.");
  }
};
