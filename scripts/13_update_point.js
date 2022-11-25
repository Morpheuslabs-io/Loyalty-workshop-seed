const abi = require('../build/artifacts/contracts/Loyalty.sol/Loyalty.json').abi;

async function main() {
    const [operator, account] = await ethers.getSigners();

    console.log("Operator:", operator.address);
    console.log("Balance:", (await operator.getBalance()).toString());
    console.log("Beneficiary:", account.address);
    console.log("Balance:", (await account.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Loyalty = '0x667979e3C4A5F5628674e3f06fdbdde4D8057fAF';
    const loyalty = new ethers.Contract(Loyalty, abi, provider);

    //  Update Loyalty points of an existing `account`
    const value = 12000;
    console.log("Update Loyalty points .........")
    const tx = await loyalty.connect(operator).updatePoint(account.address, value, true);
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