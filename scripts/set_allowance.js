const { BigNumber } = require('ethers');
const abi = require('../build/artifacts/contracts/mock/Token20.sol/Token20.json').abi;

async function main() {
    const [admin, caller] = await ethers.getSigners();

    console.log("Caller account:", caller.address);
    console.log("Account balance:", (await caller.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const ERC20 = '0xE4B5aE864C54b4E5744aFfFfcA2ddA3daea48B08';
    const erc20 = new ethers.Contract(ERC20, abi, provider);

    //  Approve an amount of allowance
    console.log("Approve Spender an amount of allowance .........")
    const Spender = '0x749603Bd4d13607B0eEF7Ac8fe48D53d30DA8bF4';             //  address of Periphery contract
    const amount = BigNumber.from('9000000000000000000000000000000');
    const tx = await erc20.connect(caller).approve(Spender, amount);
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