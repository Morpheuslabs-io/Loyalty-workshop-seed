const { task } = require('hardhat/config');
const { utils, BigNumber } = require('ethers');
const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;

task('topup', 'Topup voucher value')
    .addParam('membership', 'address of Membership contract')
    .addParam('voucher', 'address of Voucher contract')
    .addParam('periphery', 'address of Periphery contract')
    .addParam('buyer', 'address of Buyer')
    .addParam('memberid', 'member id')
    .addParam('amount', 'topup amount')
    .setAction( async( {membership, voucher, periphery, buyer, memberid, amount} ) => {
        const chainId = 1029;
        const DOMAIN = {
            name: 'Membership and Loyalty',
            version: 'Version 1',
            chainId: chainId,
            verifyingContract: periphery,
        };

        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const block = await provider.getBlockNumber();
        const timestamp = (await provider.getBlock(block)).timestamp;
        const Periphery = new ethers.Contract(periphery, abi, provider);
        const Operator = accounts[0];
        
        let Buyer;
        if (buyer == accounts[0].address)
            Buyer = accounts[0];
        else if (buyer == accounts[1].address)
            Buyer = accounts[1];
        else if (buyer == accounts[2].address)
            Buyer = accounts[2];

        console.log('Operator:', Operator.address);
        console.log('Buyer:', Buyer.address);

        //  Generate a signature to authenticate a purchase request
        console.log('Generate a signature to authenticate a purchase request .........')
        const caller = Buyer.address;
        const beneficiary = Buyer.address;
        const value = utils.parseUnits(amount, "ether");
        const paymentToken = '0xE4B5aE864C54b4E5744aFfFfcA2ddA3daea48B08';
        const totalPayment = BigNumber.from(amount).mul('1000000');
        const nonce = await Periphery.nonces(caller);
        const expiry = BigNumber.from(timestamp + 1800);     //  expire in 30 mins

        const types = {
            TopUp: [
                { name: "beneficiary", type: "address" },
                { name: "membership", type: "address" },
                { name: "memberId", type: "uint256" },
                { name: "voucher", type: "address" },
                { name: "value", type: "uint256" },
                { name: "paymentToken", type: "address" },
                { name: "totalPayment", type: "uint256" },
                { name: "nonce", type: "uint128" },
                { name: "expiry", type: "uint128" },
            ],
            TopUpAction: [
                { name: "caller", type: "address" },
                { name: "data", type: "TopUp" },
            ],
        };
        const values = {
            caller: caller,                 
            data: {
                beneficiary: beneficiary,       membership: membership,         memberId: memberid,           
                voucher: voucher,               value: value,                   paymentToken: paymentToken,
                totalPayment: totalPayment,     nonce: nonce,                   expiry: expiry,
            }
        };
        const sig = await Operator._signTypedData(DOMAIN, types, values);
        const invoice = [
            beneficiary, membership, memberid, voucher, value, paymentToken, totalPayment, nonce, expiry
        ]
    
        //  Send a request to purchase or top-up a gift card
        console.log('Top-up a gift card/voucher .........')
        await Periphery.connect(Buyer).callStatic.topup(invoice, sig);
        const tx = await Periphery.connect(Buyer).topup(invoice, sig);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 