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
    
    //  Generate a signature to authenticate a redeem request
    console.log('Generate a signature to authenticate a redeem request .........')
    const caller = account.address;
    const memberId = BigNumber.from('1');
    const point = 10000;
    const ticketId = BigNumber.from('1');
    const voucher_type = 1;
    const value = 100;
    const nonce = 1;
    const expiry = timestamp + 1800;     //  expire in 30 mins

    const types = {
        Redeem: [
            { name: "caller", type: "address" },
            { name: "memberId", type: "uint256" },
            { name: "point", type: "uint256" },
            { name: "ticketId", type: "uint256" },
            { name: "typeOf", type: "uint256" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint128" },
            { name: "expiry", type: "uint128" },
        ],
    };
    const values = {
        caller: caller,             memberId: memberId,     point: point,     ticketId: ticketId, 
        typeOf: voucher_type,       value: value,           nonce: nonce,       expiry: expiry,
    };
    const sig = await operator._signTypedData(DOMAIN, types, values);
    const redeem = [
        memberId, point, ticketId, voucher_type, value, nonce, expiry
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