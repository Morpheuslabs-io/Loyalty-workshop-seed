const { task } = require('hardhat/config');
const abi = require('../build/artifacts/contracts/Loyalty.sol/Loyalty.json').abi;

task('update_pts', 'Update loyalty points in the Loyalty contract by Operator')
    .addParam('loyalty', 'address of Loyalty contract')
    .addParam('value', 'loyalty points to be added')
    .setAction( async( {loyalty, value} ) => {
        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const Loyalty = new ethers.Contract(loyalty, abi, provider);
        const Operator = accounts[0];
        const Member = accounts[1];
        console.log("Loyalty contract:", loyalty);
        console.log("Operator:", Operator.address);
        console.log("Member:", Member.address);

        //  Add loyalty points
        console.log("\nOperator %s adds loyalty points .........", Operator.address);
        console.log("%s receives %s points .........", Member.address, value);
        const tx = await Loyalty.connect(Operator).updatePoint(Member.address, value, true);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 