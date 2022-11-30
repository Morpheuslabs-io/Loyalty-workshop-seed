const { task } = require('hardhat/config');
const abi = require('../build/artifacts/contracts/Membership.sol/Membership.json').abi;

task('reg_member', 'Register new member in the Membership contract')
    .addParam('membership', 'address of Membership contract')
    .addParam('member', 'address of a new Member')
    .addParam('memberid', 'member id')
    .setAction( async( {membership, member, memberid} ) => {
        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const Membership = new ethers.Contract(membership, abi, provider);
        const Operator = accounts[0];
 
        console.log("Membership contract:", membership);
        console.log("Operator:", Operator.address);
        console.log("New Member:", member);

        //  Register Membership
        console.log("\nOperator %s registers %s as a new member (memberId = %s) .........", Operator.address, member, memberid);
        const tx = await Membership.connect(Operator).addMembership(member, memberid);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
);
  