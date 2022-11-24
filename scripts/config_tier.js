const abi = require('../build/artifacts/contracts/Membership.sol/Membership.json').abi;

async function main() {
    const [owner] = await ethers.getSigners();

    console.log("Owner account:", owner.address);
    console.log("Account balance:", (await owner.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Membership = '0x1e7D19060BF3e4E49c5DfBD43F9aAA060DDbe7d1';
    const membership = new ethers.Contract(Membership, abi, provider);

    const loyalty_type = 1;
    const values = [10000, 20000, 50000, 100000, 300000];

    //  Config tier list of one loyalty type
    console.log("Config Tiers'requirements .........")
    const tx = await membership.connect(owner).config(loyalty_type, values);
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