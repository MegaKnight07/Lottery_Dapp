import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./utils/ethers";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState(null);
  const [players, setPlayers] = useState([]);
  const [entryFee, setEntryFee] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [lotteryActive, setLotteryActive] = useState(false);
  const [recentWinner, setRecentWinner] = useState(null);

  // Fetch contract state
  useEffect(() => {
    // console.log(process.env.)
    const fetchState = async () => {
      const contract = getContract();
      const fee = await contract.entryFee();
      const active = await contract.isLotteryActive();
      const winner = await contract.recentWinner();
      const playersList = await contract.getCurrentPlayers();

      setEntryFee(ethers.utils.formatEther(fee));
      setLotteryActive(active);
      setRecentWinner(winner);
      setPlayers(playersList);
    };
    fetchState();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const contract = getContract();
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    } else {
      alert("Please install MetaMask.");
    }
  };

  // Enter the lottery
  const enterLottery = async () => {
    const contract = getContract();
    await contract.enter({ value: ethers.utils.parseEther(entryFee) });
    alert("Successfully entered the lottery!");
  };

  // End the lottery and pick a winner
  const endLottery = async () => {
    const contract = getContract();
    await contract.endLottery();
    alert("Lottery ended and winner has been selected!");
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Decentralized Lottery</h1>
        <button className="connect-button" onClick={connectWallet}>
          {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
        </button>
      </div>

      <div className="lottery-info">
        <div className="info-box">
          <h3>Entry Fee: {entryFee} ETH</h3>
          <h4>Players: {players.length}</h4>
          <h4>Recent Winner: {recentWinner || "None"}</h4>
        </div>

        <div className="action-buttons">
          <button
            className="action-button"
            onClick={enterLottery}
            disabled={!lotteryActive}
          >
            {lotteryActive ? "Enter Lottery" : "Lottery Ended"}
          </button>

          {isOwner && (
            <button className="action-button" onClick={endLottery}>
              End Lottery
            </button>
          )}
        </div>
      </div>

      <div className="footer">
        <p>Made with ❤️ for Prakhyat</p>
      </div>
    </div>
  );
};

export default App;
