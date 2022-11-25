const abi = require('../build/artifacts/contracts/Membership.sol/Membership.json').abi;

async function main() {
    const [owner] = await ethers.getSigners();

    console.log("Owner:", owner.address);
    console.log("Balance:", (await owner.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Membership = '0x6950319Dd4A19B505d792eA8C3bd7Af191afFeA8';
    const membership = new ethers.Contract(Membership, abi, provider);

    const values = [10000, 20000, 50000, 100000, 300000];

    //  Config tier list for this membership type
    console.log("Config Tiers'requirements - Membership 1.........")
    let tx = await membership.connect(owner).config(values);
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