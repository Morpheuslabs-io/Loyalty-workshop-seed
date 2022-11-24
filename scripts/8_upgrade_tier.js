const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;

async function main() {
    const [operator, account] = await ethers.getSigners();

    console.log("Account:", account.address);
    console.log("Account balance:", (await account.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Periphery = '0x533e331098ce304c8620270dC460EF57051C6147';
    const periphery = new ethers.Contract(Periphery, abi, provider);

    //  Calling to upgrade tier
    console.log("Calling to upgrade tier .........")
    const membership = '0x6950319Dd4A19B505d792eA8C3bd7Af191afFeA8';
    const memberId = 1;
    const tx = await periphery.connect(account).upgradeTier(membership, memberId);
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