const { utils, BigNumber } = require("ethers");
const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;

const chainId = 1029;
const Periphery = '0x533e331098ce304c8620270dC460EF57051C6147';
const DOMAIN = {
    name: "Membership and Loyalty",
    version: "Version 1",
    chainId: chainId,
    verifyingContract: Periphery,
};

async function main() {
    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const block = await provider.getBlockNumber();
    const timestamp = (await provider.getBlock(block)).timestamp;
    const periphery = new ethers.Contract(Periphery, abi, provider);

    const [operator, account] = await ethers.getSigners();
    console.log("Operator account:", operator.address);
    
    //  Generate a signature to authenticate a purchase request
    console.log('Generate a signature to authenticate a purchase request .........')
    const caller = account.address;
    const beneficiary = account.address;
    const membership = '0x6950319Dd4A19B505d792eA8C3bd7Af191afFeA8';
    const memberId = BigNumber.from('1');
    const voucher = '0x17b317CC8628373b2ba1673688b15C9BDdFE14eC';
    const value = utils.parseUnits("2000.0", "ether");
    const paymentToken = '0xE4B5aE864C54b4E5744aFfFfcA2ddA3daea48B08';
    const totalPayment = BigNumber.from('2000000000');
    const nonce = BigNumber.from('2');
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
            beneficiary: beneficiary,       membership: membership,         memberId: memberId,           
            voucher: voucher,               value: value,                   paymentToken: paymentToken,
            totalPayment: totalPayment,     nonce: nonce,                   expiry: expiry,
        }
    };
    const sig = await operator._signTypedData(DOMAIN, types, values);
    const invoice = [
        beneficiary, membership, memberId, voucher, value, paymentToken, totalPayment, nonce, expiry
    ]

    //  Send a request to purchase or top-up a gift card
    console.log('Top-up a gift card/voucher .........')
    await periphery.connect(account).callStatic.topup(invoice, sig);
    const tx = await periphery.connect(account).topup(invoice, sig);
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