const { task } = require('hardhat/config');
const abi = require('../build/artifacts/contracts/Loyalty.sol/Loyalty.json').abi;

task('update_pts', 'Update loyalty points in the Loyalty contract by Operator')
    .addParam('loyalty', 'address of Loyalty contract')
    .addParam('member', 'address of Member')
    .addParam('value', 'loyalty points to be added')
    .setAction( async( {loyalty, member, value} ) => {
        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const Loyalty = new ethers.Contract(loyalty, abi, provider);
        const Operator = accounts[0];

        console.log("Loyalty contract:", loyalty);
        console.log("Operator:", Operator.address);
        console.log("Member:", member);

        //  Add loyalty points
        console.log("\nOperator %s adds loyalty points .........", Operator.address);
        console.log("%s receives %s points .........", member, value);
        const tx = await Loyalty.connect(Operator).updatePoint(member, value, true);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 