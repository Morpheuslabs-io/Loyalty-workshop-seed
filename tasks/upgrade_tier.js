const { task } = require('hardhat/config');
const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;

task('upgrade_tier', 'Upgrade current tier')
    .addParam('membership', 'address of Membership contract')
    .addParam('periphery', 'address of Periphery contract')
    .addParam('caller', 'address of Caller')
    .addParam('memberid', 'member id')
    .setAction( async( {membership, periphery, caller, memberid} ) => {
        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const Periphery = new ethers.Contract(periphery, abi, provider);

        let Caller;
        if (caller == accounts[0].address)
            Caller = accounts[0];
        else if (caller == accounts[1].address)
            Caller = accounts[1];

        console.log('Caller:', Caller.address);

        //  Calling to upgrade tier
        console.log("Calling to upgrade tier .........")
        const tx = await Periphery.connect(Caller).upgradeTier(membership, memberid);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 