const { task } = require('hardhat/config');
const abi = require('../build/artifacts/contracts/Periphery2.sol/Periphery2.json').abi;

task('swap', 'Swap two types of Loyalty')
    .addParam('periphery', 'address of Periphery2 contract')
    .addParam('bmembership', 'address of base Membership contract')
    .addParam('qmembership', 'address of quote Membership contract')
    .addParam('caller', 'address of Caller')
    .addParam('bmemberid', 'member id of base loyalty token')
    .addParam('qmemberid', 'member id of quote loyalty token')
    .addParam('amount', 'amount of base loyalty points')
    .addParam('eventid', '0 = regular swap, eventId = non-zero')
    .setAction( async( {periphery, bmembership, qmembership, caller, bmemberid, qmemberid, amount, eventid} ) => {
        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const Periphery = new ethers.Contract(periphery, abi, provider);

        let Caller;
        if (caller == accounts[0].address)
            Caller = accounts[0];
        else if (caller == accounts[1].address)
            Caller = accounts[1];
        else if (caller == accounts[2].address)
            Caller = accounts[2];

        console.log("Caller:", Caller.address);

        //  Swap two types of Loyalty
        let tx;
        if (eventid == 0) {
            console.log('\nRegular swap two types of Loyalty .........')
            tx = await Periphery.connect(Caller).regularSwap(
                bmembership, bmemberid, qmembership, qmemberid, amount
            );
        } 
        else {
            console.log('\nSpecial swap two types of Loyalty .........')
            tx = await Periphery.connect(Caller).specialSwap(
                eventid, bmembership, bmemberid, qmembership, qmemberid, amount
            ); 
        }
               
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 