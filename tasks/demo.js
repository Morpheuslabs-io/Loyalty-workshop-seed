const { task } = require('hardhat/config');
const days = 24 * 3600;

task('demo', 'Deploy and config settings in contracts')
    .setAction( async() => {

        const [...accounts] = await ethers.getSigners();
  
        const Owner = accounts[0];
        console.log("Owner:", Owner.address);

        //  Deploy two Membership contracts
        console.log('\nDeploy two Membership contracts .........');
        console.log('Deploy Membership1 contract .........');
        const Membership = await ethers.getContractFactory('Membership', Owner);
        const membership1 = await Membership.deploy(
            "Amazon Membership", "AMZM", "https://example.com/amazon_membership/"
        );
        console.log('Tx Hash: %s', membership1.deployTransaction.hash);
        await membership1.deployed();
        console.log('Membership1 Contract: ', membership1.address);

        console.log('Deploy Membership2 contract .........');
        const membership2 = await Membership.deploy(
            "Starbuck Membership", "SBKM", "https://example.com/starbuck_membership/"
        );
        console.log('Tx Hash: %s', membership2.deployTransaction.hash);
        await membership2.deployed();
        console.log('Membership2 Contract: ', membership2.address);

        //  Deploy two Loyalty contracts
        console.log('\nDeploy two Loyalty contracts .........');
        console.log('Deploy Loyalty1 contract .........');
        const Loyalty = await ethers.getContractFactory('Loyalty', Owner);
        const loyalty1 = await Loyalty.deploy(
            "Amazon Loyalty", "AMZL", 0
        );
        console.log('Tx Hash: %s', loyalty1.deployTransaction.hash);
        await loyalty1.deployed();
        console.log('Loyalty1 Contract: ', loyalty1.address);

        console.log('Deploy Loyalty2 contract .........');
        const loyalty2 = await Loyalty.deploy(
            "Starbuck Loyalty", "SBKL", 0
        );
        console.log('Tx Hash: %s', loyalty2.deployTransaction.hash);
        await loyalty2.deployed();
        console.log('Loyalty2 Contract: ', loyalty2.address);

        //  Deploy two Voucher contracts
        console.log('\nDeploy two Voucher contracts .........');
        console.log('Deploy Voucher1 contract .........');
        const Voucher = await ethers.getContractFactory('Voucher', Owner);
        const voucher1 = await Voucher.deploy(
            "Amazon Voucher", "AMZV", 18
        );
        console.log('Tx Hash: %s', voucher1.deployTransaction.hash);
        await voucher1.deployed();
        console.log('Voucher1 Contract: ', voucher1.address);

        console.log('Deploy Voucher2 contract .........');
        const voucher2 = await Voucher.deploy(
            "Starbuck Voucher", "SBKV", 18
        );
        console.log('Tx Hash: %s', voucher2.deployTransaction.hash);
        await voucher2.deployed();
        console.log('Voucher2 Contract: ', voucher2.address);

        //  Deploy Periphery contract
        console.log('\nDeploy Periphery Contract .........');
        const Periphery = await ethers.getContractFactory('Periphery', Owner);
        const periphery = await Periphery.deploy(Owner.address, Owner.address);
        console.log('Tx Hash: %s', periphery.deployTransaction.hash);
        await periphery.deployed();
        console.log('Periphery Contract: ', periphery.address);

        //  Deploy Periphery2 contract
        console.log('\nDeploy Periphery2 Contract .........');
        const Periphery2 = await ethers.getContractFactory('Periphery2', Owner);
        const periphery2 = await Periphery2.deploy(periphery.address);
        console.log('Tx Hash: %s', periphery2.deployTransaction.hash);
        await periphery2.deployed();
        console.log('Periphery2 Contract: ', periphery2.address);

        //  Set Periphery, Periphery2, and Owner as Operator
        const operators = [periphery.address, periphery2.address, Owner.address];
        console.log('\nSet Periphery, Periphery2, and Owner as Operator in two Membership contracts .........');
        console.log('Setting in Membership1 contract .........');
        let tx = await membership1.connect(Owner).setOperator(operators, true);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('Setting in Membership2 contract .........');
        tx = await membership2.connect(Owner).setOperator(operators, true);
        console.log('TxHash: ', tx.hash);
        await tx.wait();
        
        console.log('\nSet Periphery, Periphery2, and Owner as Operator in two Loyalty contracts .........');
        console.log('Setting in Loyalty1 contract .........');
        tx = await loyalty1.connect(Owner).setOperator(operators, true);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('Setting in Loyalty2 contract .........');
        tx = await loyalty2.connect(Owner).setOperator(operators, true);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\nSet Periphery, Periphery2, and Owner as Operator in two Voucher contracts .........');
        console.log('Setting in Vouche1 contract .........');
        tx = await voucher1.connect(Owner).setOperator(operators, true);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('Setting in Vouche2 contract .........');
        tx = await voucher2.connect(Owner).setOperator(operators, true);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        //  Config tier list for this membership type
        console.log("\nConfig Tiers'requirements in two Membership contracts .........")
        const values = [10000, 20000, 50000, 100000, 300000];

        console.log('Config in Membership1 contract .........');
        tx = await membership1.connect(Owner).config(values);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('Config in Membership2 contract .........');
        tx = await membership2.connect(Owner).config(values);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        //  Register Membership, Loyalty and Voucher contracts
        console.log("\nRegister Membership, Loyalty and Voucher contracts in Periphery contract .........");
        console.log("Register Membership1, Loyalty1 and Voucher1 .........")
        tx = await periphery.connect(Owner).addPair(
            membership1.address, loyalty1.address, voucher1.address
        );
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log("Register Membership2, Loyalty2 and Voucher2 .........")
        tx = await periphery.connect(Owner).addPair(
            membership2.address, loyalty2.address, voucher2.address
        );
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        //  Add new Voucher to Membership 1
        console.log("Add Voucher2 to Membership1 pair .........");
        const vouchers = [voucher2.address]
        tx = await periphery.connect(Owner).updateVouchers(membership1.address, vouchers, true);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        //  Set Schedule for a special event
        console.log('\nSet special event in Periphery2 contract .........');
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const block = await provider.getBlockNumber();
        const timestamp = (await provider.getBlock(block)).timestamp;
        const eventId = 1;
        const startTime = timestamp + 30;           //  after 30s
        const endTime = startTime + 7 * days;
        tx = await periphery2.connect(Owner).setSchedule(eventId, startTime, endTime);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        //  Set Regular and Special exchange rates
        const bMemberships = [membership1.address];            let bValues = [1];
        const qMemberships = [membership2.address];            let qValues = [5];
        console.log('\nSet exchange rates in Periphery2 contract .........');
        console.log('Set regular exchange rate .........');
        tx = await periphery2.connect(Owner).setXRate(
            0, bMemberships, qMemberships, bValues, qValues
        );
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        bValues = [2];          qValues = [15];
        console.log('Set special exchange rate .........');
        tx = await periphery2.connect(Owner).setXRate(
            eventId, bMemberships, qMemberships, bValues, qValues
        );
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
);
  