const abi = require('../build/artifacts/contracts/Membership.sol/Membership.json').abi;

async function main() {
    const [operator, account] = await ethers.getSigners();

    console.log("Operator:", operator.address);
    console.log("Balance:", (await operator.getBalance()).toString());
    console.log("Member:", account.address);
    console.log("Balance:", (await account.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Membership = '0xDF80f659B832399f6B01f1bC5B420Ff1F5aB4384';
    const membership = new ethers.Contract(Membership, abi, provider);

    //  Register Membership
    const memberId = 1;
    console.log("Register Membership .........")
    const tx = await membership.connect(operator).addMembership(account.address, memberId);
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    console.log('\n ===== DONE =====');
}
  
main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
});