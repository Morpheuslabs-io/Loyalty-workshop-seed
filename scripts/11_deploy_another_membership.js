async function main() {
    const [Deployer] = await ethers.getSigners();
  
    console.log("Deployer:", Deployer.address);
    console.log("Balance:", (await Deployer.getBalance()).toString());

    //  Deploy Membership contract
    console.log('\nDeploy Membership Contract .........');
    const Membership = await ethers.getContractFactory('Membership', Deployer);
    const membership = await Membership.deploy(
        "Starbuck Membership", "SBKM", "https://example.com/starbuck_membership/"
    );
    console.log('Tx Hash: %s', membership.deployTransaction.hash);
    await membership.deployed();

    console.log('Membership Contract: ', membership.address);

    //  Deploy Loyalty contract
    console.log('\nDeploy Loyalty Contract .........');
    const Loyalty = await ethers.getContractFactory('Loyalty', Deployer);
    const loyalty = await Loyalty.deploy(
        "Starbuck Loyalty", "SBKL", 0
    );
    console.log('Tx Hash: %s', loyalty.deployTransaction.hash);
    await loyalty.deployed();

    console.log('Loyalty Contract: ', loyalty.address);

    //  Deploy Voucher contract
    console.log('\nDeploy Voucher Contract .........');
    const Voucher = await ethers.getContractFactory('Voucher', Deployer);
    const voucher = await Voucher.deploy(
        "Starbuck Voucher", "SBKV", 18
    );
    console.log('Tx Hash: %s', voucher.deployTransaction.hash);
    await voucher.deployed();

    console.log('Voucher Contract: ', voucher.address);

    //  Set Periphery, Periphery2, and Deployer as Operator
    const Periphery = '0x533e331098ce304c8620270dC460EF57051C6147';
    const Periphery2 = '0x4E50A26c94d823b7FB05E11EE7F29254e6261514';
    const operators = [Periphery, Periphery2, Deployer.address];
    console.log('\nSet Periphery, Periphery2, and Deployer as Operator in new Membership contract .........');
    let tx = await membership.connect(Deployer).setOperator(operators, true);
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    console.log('Set Periphery, Periphery2, and Deployer as Operator in new Loyalty contract .........');
    tx = await loyalty.connect(Deployer).setOperator(operators, true);
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    console.log('Set Periphery, Periphery2, and Deployer as Operator in new Voucher contract .........');
    tx = await voucher.connect(Deployer).setOperator(operators, true);
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    //  Config tier list for this membership type
    console.log("Config Tiers'requirements - Membership .........")
    const values = [10000, 20000, 50000, 100000, 300000];
    tx = await membership.connect(Deployer).config(values);
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