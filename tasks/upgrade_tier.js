const { task } = require('hardhat/config');
const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;

task('upgrade_tier', 'Upgrade current tier')
    .addParam('membership', 'address of Membership contract')
    .addParam('periphery', 'address of Periphery contract')
    .setAction( async( {membership, periphery} ) => {
        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const Periphery = new ethers.Contract(periphery, abi, provider);
        const Caller = accounts[1];

        console.log('Caller:', Caller.address);

        //  Calling to upgrade tier
        console.log("Calling to upgrade tier .........")
        const memberId = 1;
        const tx = await Periphery.connect(Caller).upgradeTier(membership, memberId);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 