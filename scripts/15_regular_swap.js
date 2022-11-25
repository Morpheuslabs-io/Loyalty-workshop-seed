const { BigNumber } = require("ethers");
const abi = require('../build/artifacts/contracts/Periphery2.sol/Periphery2.json').abi;

async function main() {
    const [account1, account2, account3] = await ethers.getSigners();
    console.log("Caller:", account2.address);
    console.log("Balance:", (await account2.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Periphery2 = '0x6098b3bcEce6E76a387e1d0689Fbd38Af0dC293f';
    const periphery = new ethers.Contract(Periphery2, abi, provider);
    
    //  Regular swap
    console.log('Regular swap two loyalty tokens .........')
    const bMembership = '0x6950319Dd4A19B505d792eA8C3bd7Af191afFeA8';
    const qMembership = '0xDF80f659B832399f6B01f1bC5B420Ff1F5aB4384';
    const bMemberId = '1';
    const qMemberId = '1';
    const bAmount = 1000;
    let tx = await periphery.connect(account2).regularSwap(
        bMembership, bMemberId, qMembership, qMemberId, bAmount
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