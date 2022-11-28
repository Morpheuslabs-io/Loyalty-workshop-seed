const { task } = require('hardhat/config');
const { BigNumber } = require('ethers');
const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;

task('redeem', 'Redeem loyalty points')
    .addParam('membership', 'address of Membership contract')
    .addParam('voucher', 'address of Voucher contract')
    .addParam('periphery', 'address of Periphery contract')
    .addParam('pts', 'loyalty points to be redeem')
    .setAction( async( {membership, voucher, periphery, pts} ) => {
        const chainId = 1029;
        const DOMAIN = {
            name: 'Membership and Loyalty',
            version: 'Version 1',
            chainId: chainId,
            verifyingContract: periphery,
        };

        const [...accounts] = await ethers.getSigners();
        const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
        const Periphery = new ethers.Contract(periphery, abi, provider);
        const Operator = accounts[0];
        const Beneficiary = accounts[1];

        console.log('Operator:', Operator.address);
        console.log('Beneficiary:', Beneficiary.address);

        //  Generate a signature to authenticate a redeem request
        console.log('Generate a signature to authenticate a redeem request .........')
        const caller = Beneficiary.address;
        const memberId = BigNumber.from('1');
        const value = utils.parseUnits("100.0", "ether");
        const nonce = await Periphery.nonces(caller);
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
                membership: membership,     memberId: memberId,     point: pts,     voucher: voucher, 
                value: value,               nonce: nonce,           expiry: expiry,
            }          
        };
        const sig = await Operator._signTypedData(DOMAIN, types, values);
        const redeem = [
            membership, memberId, pts, voucher, value, nonce, expiry
        ]
    
        //  Send a request to redeem Loyalty Points
        console.log('Redeem Loyalty points and receive the Voucher .........')
        await Periphery.connect(Beneficiary).callStatic.redeem(redeem, sig);
        const tx = await Periphery.connect(Beneficiary).redeem(redeem, sig);
        console.log('TxHash: ', tx.hash);
        await tx.wait();

        console.log('\n ===== DONE =====');
    }
); 