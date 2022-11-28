const { task } = require('hardhat/config');
const abi = require('../build/artifacts/contracts/mock/Token20.sol/Token20.json').abi;

task('set_allowance', 'Approve an amount of allowance')
    .addParam('periphery', 'address of Periphery contract')
    .setAction( async( {periphery} ) => {
        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const ERC20 = '0xE4B5aE864C54b4E5744aFfFfcA2ddA3daea48B08';
        const erc20 = new ethers.Contract(ERC20, abi, provider);
        const caller = accounts[1];
        
        //  Approve an amount of allowance
        console.log("Set an amount of allowance .........")
        const amount = BigNumber.from('9000000000000000000000000000000');
        const tx = await erc20.connect(caller).approve(periphery, amount);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 