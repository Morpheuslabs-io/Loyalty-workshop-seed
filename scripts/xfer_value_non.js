const abi = require('../build/artifacts/contracts/Voucher.sol/Voucher.json').abi;

async function main() {
    const [account1, account2, account3] = await ethers.getSigners();

    console.log("Sender account:", account2.address);
    console.log("Receiver account:", account1.address);

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Voucher = '0x9421bb4F731999cdc08A2907D9ee5Fa85810437E';
    const voucher = new ethers.Contract(Voucher, abi, provider);

    //  Transfer value of the Voucher from `account2` to `account1`
    const ticketId = 2;
    const value = 300;
    console.log("Transfer Voucher's value to Account that has no Voucher .........")
    const tx = await voucher.connect(account2)
        ['transferFrom(uint256,address,uint256)']
        (ticketId, account1.address, value);

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