const abi = require('../build/artifacts/contracts/Membership.sol/Membership.json').abi;

async function main() {
    const [operator] = await ethers.getSigners();

    console.log("Operator account:", operator.address);
    console.log("Account balance:", (await operator.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Membership = '0x7F2A4C89AB043A3ca3a974b524f94C5e00aE32dF';
    const membership = new ethers.Contract(Membership, abi, provider);

    //  Update Loyalty points of an existing `account`
    const memberId = 1;
    const value = 10000;
    console.log("Update Loyalty points .........")
    const tx = await membership.connect(operator).updatePoint(
        memberId, value, true
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