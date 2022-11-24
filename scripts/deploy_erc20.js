async function main() {
    const [Deployer] = await ethers.getSigners();
  
    console.log("Deployer account:", Deployer.address);
    console.log("Account balance:", (await Deployer.getBalance()).toString());

    //  Deploy USDT contract
    console.log('\nDeploy USDT Contract .........');
    const decimals = 6;
    const ERC20 = await ethers.getContractFactory('Token20', Deployer);
    const erc20 = await ERC20.deploy(decimals);
    console.log('Tx Hash: %s', erc20.deployTransaction.hash);
    await erc20.deployed();

    console.log('USDT Contract: ', erc20.address);

    console.log('\n===== DONE =====')
}
  
main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
});