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
    console.log("Operator:", operator.address);
    console.log("Balance:", (await operator.getBalance()).toString());
    console.log("Beneficiary:", account.address);
    console.log("Balance:", (await account.getBalance()).toString());
    
    //  Generate a signature to authenticate a redeem request
    console.log('Generate a signature to authenticate a redeem request .........')
    const caller = account.address;
    const membership = '0x6950319Dd4A19B505d792eA8C3bd7Af191afFeA8';
    const memberId = BigNumber.from('1');
    const point = BigNumber.from('10000');
    const voucher = '0x17b317CC8628373b2ba1673688b15C9BDdFE14eC';
    const value = utils.parseUnits("100.0", "ether");
    const nonce = BigNumber.from('1');
    const expiry = BigNumber.from(timestamp + 1800);     //  expire in 30 mins

    const types = {
        Redeem: [
            { name: "membership", type: "address" },
            { name: "memberId", type: "uint256" },
            { name: "point", type: "uint256" },
            { name: "voucher", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint128" },
            { name: "expiry", type: "uint128" },
        ],
        RedeemAction: [
            { name: "caller", type: "address" },
            { name: "data", type: "Redeem" },
        ],
    };
    const values = {
        caller: caller,
        data: {
            membership: membership,     memberId: memberId,     point: point,     voucher: voucher, 
            value: value,               nonce: nonce,           expiry: expiry,
        }          
    };
    const sig = await operator._signTypedData(DOMAIN, types, values);
    const redeem = [
        membership, memberId, point, voucher, value, nonce, expiry
    ]

    //  Send a request to redeem Loyalty Points
    console.log('Redeem Loyalty points and receive the Voucher .........')
    await periphery.connect(account).callStatic.redeem(redeem, sig);
    const tx = await periphery.connect(account).redeem(redeem, sig);
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