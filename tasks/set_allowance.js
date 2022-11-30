const { task } = require('hardhat/config');
const { utils } = require('ethers');
const abi = require('../build/artifacts/contracts/mock/Token20.sol/Token20.json').abi;

task('set_allowance', 'Approve an amount of allowance')
    .addParam('periphery', 'address of Periphery contract')
    .addParam('caller', 'caller address')
    .addParam('amount', 'approval amount')
    .setAction( async( {periphery, caller, amount} ) => {
        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const ERC20 = '0xE4B5aE864C54b4E5744aFfFfcA2ddA3daea48B08';
        const erc20 = new ethers.Contract(ERC20, abi, provider);
        
        let Caller;
        if (caller == accounts[0].address)
            Caller = accounts[0];
        else if (caller == accounts[1].address) 
            Caller = accounts[1];
        else if (caller == accounts[2].address)
            Caller = accounts[2];

        console.log('Caller:', Caller.address);
        
        //  Approve an amount of allowance
        console.log("Set an amount of allowance .........")
        const allowance_amount = utils.parseUnits(amount, 6)
        const tx = await erc20.connect(Caller).approve(periphery, allowance_amount);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 