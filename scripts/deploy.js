async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(
      process.env.SUB_ID,
      process.env.VRF_CORDINATOR,
      process.env.KEYHASH,
      ethers.utils.parseEther("0.0001"),
      300 // 5 minutes duration
    );

    console.log("Lottery contract deployed to:", lottery.address);
  }

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
