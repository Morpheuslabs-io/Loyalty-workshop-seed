const abi = require('../build/artifacts/contracts/Membership.sol/Membership.json').abi;

async function main() {
    const [operator, account] = await ethers.getSigners();

    console.log("Operator account:", operator.address);
    console.log("Account balance:", (await operator.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Membership = '0x6950319Dd4A19B505d792eA8C3bd7Af191afFeA8';
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