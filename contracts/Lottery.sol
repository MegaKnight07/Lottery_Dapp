// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

contract Lottery is VRFConsumerBaseV2 {
    // Lottery State
    address[] public players;
    address public recentWinner;
    uint256 public lotteryEndTime;
    uint256 public entryFee;
    address public owner;
    bool public isLotteryActive;
    uint256 public lotteryCount;

    mapping(uint256 => address[]) public lotteryHistory;

    // Chainlink VRF
    VRFCoordinatorV2Interface private COORDINATOR;
    uint256 private subscriptionId;
    bytes32 private keyHash;
    uint32 private callbackGasLimit = 100000;
    uint16 private requestConfirmations = 3;
    uint256 private requestId;

    // Events
    event LotteryStarted(uint256 lotteryCount, uint256 endTime, uint256 entryFee);
    event PlayerEntered(address indexed player, uint256 lotteryCount);
    event LotteryEnded(uint256 lotteryCount, address winner);
    event WinnerPaid(address indexed winner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    constructor(
        uint256 _subscriptionId,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _entryFee,
        uint256 _duration
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        entryFee = _entryFee;
        owner = msg.sender;
        startLottery(_duration);
    }

    // Enter the lottery
    function enter() public payable {
        require(isLotteryActive, "Lottery is not active.");
        require(block.timestamp < lotteryEndTime, "Lottery has ended.");
        require(msg.value == entryFee, "Incorrect entry fee.");

        players.push(msg.sender);
        lotteryHistory[lotteryCount].push(msg.sender);
        emit PlayerEntered(msg.sender, lotteryCount);
    }

    // Start a new lottery
    function startLottery(uint256 duration) public onlyOwner {
        require(!isLotteryActive, "A lottery is already active.");
        delete players;
        recentWinner = address(0);
        lotteryEndTime = block.timestamp + duration;
        isLotteryActive = true;
        lotteryCount++;
        emit LotteryStarted(lotteryCount, lotteryEndTime, entryFee);
    }

    // End the lottery and request a random winner
    function endLottery() public onlyOwner {
        require(isLotteryActive, "No lottery to end.");
        require(block.timestamp >= lotteryEndTime, "Lottery duration not over.");
        require(players.length > 0, "No players in the lottery.");

        isLotteryActive = false;

        // Request random number from Chainlink VRF
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1 // Number of random words
        );
    }

    // Callback function to handle the random number
    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        uint256 randomIndex = randomWords[0] % players.length;
        recentWinner = players[randomIndex];

        // Transfer the prize to the winner
        uint256 prize = address(this).balance;
        (bool success, ) = recentWinner.call{value: prize}("");
        require(success, "Transfer to winner failed.");
        emit WinnerPaid(recentWinner, prize);
        emit LotteryEnded(lotteryCount, recentWinner);
    }

    // Get all players for the current lottery
    function getCurrentPlayers() public view returns (address[] memory) {
        return players;
    }

    // Owner can update entry fee
    function updateEntryFee(uint256 _newEntryFee) public onlyOwner {
        entryFee = _newEntryFee;
    }

    // Owner can update lottery duration
    function updateDuration(uint256 _newDuration) public onlyOwner {
        require(!isLotteryActive, "Cannot update during active lottery.");
        lotteryEndTime = block.timestamp + _newDuration;
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
