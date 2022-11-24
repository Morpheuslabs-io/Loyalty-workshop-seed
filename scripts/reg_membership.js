const abi = require('../build/artifacts/contracts/Membership.sol/Membership.json').abi;

async function main() {
    const [operator, account] = await ethers.getSigners();

    console.log("Operator account:", operator.address);
    console.log("Account balance:", (await operator.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Membership = '0x1e7D19060BF3e4E49c5DfBD43F9aAA060DDbe7d1';
    const membership = new ethers.Contract(Membership, abi, provider);

    //  Register Membership and add Loyalty points to `account`
    const memberId = 1;
    const loyalty_type = 1;
    const value = 9000;
    console.log("Register Membership and Add Loyalty points .........")
    const tx = await membership.connect(operator).addMembership(
        account.address, memberId, loyalty_type, value
    );
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