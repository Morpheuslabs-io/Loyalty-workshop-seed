async function main() {
    const [Deployer] = await ethers.getSigners();
  
    console.log("Deployer:", Deployer.address);
    console.log("Balance:", (await Deployer.getBalance()).toString());

    //  Deploy Membership contract
    console.log('\nDeploy Membership Contract .........');
    const Membership = await ethers.getContractFactory('Membership', Deployer);
    const membership = await Membership.deploy(
        "Amazon Membership", "AMZM", "https://example.com/amazon_membership/"
    );
    console.log('Tx Hash: %s', membership.deployTransaction.hash);
    await membership.deployed();

    console.log('Membership Contract: ', membership.address);

    //  Deploy Loyalty contract
    console.log('\nDeploy Loyalty Contract .........');
    const Loyalty = await ethers.getContractFactory('Loyalty', Deployer);
    const loyalty = await Loyalty.deploy(
        "Amazon Loyalty", "AMZL", 0
    );
    console.log('Tx Hash: %s', loyalty.deployTransaction.hash);
    await loyalty.deployed();

    console.log('Loyalty Contract: ', loyalty.address);

    //  Deploy Voucher contract
    console.log('\nDeploy Voucher Contract .........');
    const Voucher = await ethers.getContractFactory('Voucher', Deployer);
    const voucher = await Voucher.deploy(
        "Amazon Voucher", "AMZV", 18
    );
    console.log('Tx Hash: %s', voucher.deployTransaction.hash);
    await voucher.deployed();

    console.log('Voucher Contract: ', voucher.address);

    //  Deploy Periphery contract
    console.log('\nDeploy Periphery Contract .........');
    const Periphery = await ethers.getContractFactory('Periphery', Deployer);
    const periphery = await Periphery.deploy(Deployer.address, Deployer.address);
    console.log('Tx Hash: %s', periphery.deployTransaction.hash);
    await periphery.deployed();

    console.log('Periphery Contract: ', periphery.address);

    //  Deploy Periphery2 contract
    console.log('\nDeploy Periphery2 Contract .........');
    const Periphery2 = await ethers.getContractFactory('Periphery2', Deployer);
    const periphery2 = await Periphery2.deploy(periphery.address);
    console.log('Tx Hash: %s', periphery2.deployTransaction.hash);
    await periphery2.deployed();

    console.log('Periphery2 Contract: ', periphery2.address);

    //  Set Periphery, Periphery2, and Deployer as Operator
    const operators = [periphery.address, periphery2.address, Deployer.address];
    console.log('\nSet Periphery, Periphery2, and Deployer as Operator in Membership contracts .........');
    let tx = await membership.connect(Deployer).setOperator(operators, true);
    console.log('TxHash: ', tx.hash);
    await tx.wait();
    
    console.log('Set Periphery, Periphery2, and Deployer as Operator in Loyalty contracts .........');
    tx = await loyalty.connect(Deployer).setOperator(operators, true);
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    console.log('Set Periphery, Periphery2, and Deployer as Operator in Voucher contracts .........');
    tx = await voucher.connect(Deployer).setOperator(operators, true);
    console.log('TxHash: ', tx.hash);
    await tx.wait();
    
    console.log('\n===== DONE =====')
}
  
main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
});