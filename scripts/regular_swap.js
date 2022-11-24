const { BigNumber } = require("ethers");
const abi = require('../build/artifacts/contracts/Periphery2.sol/Periphery2.json').abi;

async function main() {
    const [account1, account2, account3] = await ethers.getSigners();
    console.log("Manager account:", manager.address);
    const Periphery2 = '0x32385E92A2E7c110397c0abDF6df2D87014041C8';
    const periphery = new ethers.Contract(Periphery2, abi, provider);
    
    //  Regular swap
    console.log('Regular swap two loyalty tokens .........')
    const bTokenId = 1;
    const qTokenId = 0;
    const qType = 2;
    const amount = 50;
    let tx = await periphery.connect(account2).regularSwap(
        bTokenId, qTokenId, qType, amount
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