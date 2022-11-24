const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;

async function main() {
    const [owner] = await ethers.getSigners();

    console.log("Owner account:", owner.address);
    console.log("Account balance:", (await owner.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Periphery = '0x533e331098ce304c8620270dC460EF57051C6147';
    const periphery = new ethers.Contract(Periphery, abi, provider);

    const membership = '0x6950319Dd4A19B505d792eA8C3bd7Af191afFeA8';
    const loyalty = '0x667979e3C4A5F5628674e3f06fdbdde4D8057fAF';
    const voucher = '0x17b317CC8628373b2ba1673688b15C9BDdFE14eC';

    //  Register Membership, Loyalty and Voucher contracts
    console.log("Register Membership, Loyalty and Voucher in Periphery contract .........")
    const tx = await periphery.connect(owner).addPair(
        membership, loyalty, voucher
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