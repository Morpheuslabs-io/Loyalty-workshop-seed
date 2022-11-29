const { task } = require('hardhat/config');
const abi = require('../build/artifacts/contracts/Periphery2.sol/Periphery2.json').abi;

task('swap', 'Swap two types of Loyalty')
    .addParam('periphery', 'address of Periphery2 contract')
    .addParam('bMembership', 'address of base Membership contract')
    .addParam('qMembership', 'address of quote Membership contract')
    .addParam('amount', 'amount of base loyalty points')
    .addParam('eventId', '0 = regular swap, eventId = non-zero')
    .setAction( async( {periphery, bMembership, qMembership, amount, eventId} ) => {
        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const Periphery = new ethers.Contract(periphery, abi, provider);

        const Caller = accounts[1];
        console.log("Caller:", Caller.address);

        //  Regular swap
        console.log('Regular swap two loyalty tokens .........')
        const bMemberId = '1';
        const qMemberId = '1';
        let tx;
        if (eventId == 0) 
            tx = await Periphery.connect(Caller).regularSwap(
                bMembership, bMemberId, qMembership, qMemberId, amount
            );
        else
            tx = await Periphery.connect(Caller).specialSwap(
                eventId, bMembership, bMemberId, qMembership, qMemberId, amount
            );    
        
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 