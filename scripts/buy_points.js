const { BigNumber } = require("ethers");
const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;

const chainId = 1029;
const Periphery = '0x749603Bd4d13607B0eEF7Ac8fe48D53d30DA8bF4';
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
    const memberId = BigNumber.from('1');
    const paymentToken = '0xE4B5aE864C54b4E5744aFfFfcA2ddA3daea48B08';
    const point = 1000;
    const totalPayment = 200000000;
    const nonce = 0;
    const expiry = timestamp + 1800;     //  expire in 30 mins

    const types = {
        Buy: [
            { name: "caller", type: "address" },
            { name: "beneficiary", type: "address" },
            { name: "memberId", type: "uint256" },
            { name: "paymentToken", type: "address" },
            { name: "point", type: "uint256" },
            { name: "totalPayment", type: "uint256" },
            { name: "nonce", type: "uint128" },
            { name: "expiry", type: "uint128" },
        ],
    };
    const values = {
        caller: caller,     beneficiary: beneficiary,       memberId: memberId,     paymentToken: paymentToken,     
        point: point,     totalPayment: totalPayment,     nonce: nonce,           expiry: expiry,
    };
    const sig = await operator._signTypedData(DOMAIN, types, values);
    const invoice = [
        beneficiary, memberId, paymentToken, point, totalPayment, nonce, expiry
    ]

    //  Send a request to purchase Loyalty Points
    console.log('Purchase Loyalty points .........')
    await periphery.connect(account).callStatic.buy(invoice, sig);
    const tx = await periphery.connect(account).buy(invoice, sig);
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