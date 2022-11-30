const { task } = require('hardhat/config');
const { utils, BigNumber } = require('ethers');
const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;

task('redeem', 'Redeem loyalty points')
    .addParam('membership', 'address of Membership contract')
    .addParam('voucher', 'address of Voucher contract')
    .addParam('periphery', 'address of Periphery contract')
    .addParam('caller', 'address of Caller')
    .addParam('memberid', 'member id')
    .addParam('pts', 'loyalty points to be redeem')
    .setAction( async( {membership, voucher, periphery, caller, memberid, pts} ) => {
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

        let Beneficiary;
        if (caller == accounts[0].address)
            Beneficiary = accounts[0];
        else if (caller == accounts[1].address)
            Beneficiary = accounts[1];
        else if (caller == accounts[2].address)
            Beneficiary = accounts[2];

        console.log('Operator:', Operator.address);
        console.log('Beneficiary:', Beneficiary.address);

        //  Generate a signature to authenticate a redeem request
        console.log('Generate a signature to authenticate a redeem request .........')
        const Caller = Beneficiary.address;
        const value = utils.parseUnits(
            BigNumber.from(pts).div(100).toString(), "ether"
        );
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
            caller: Caller,
            data: {
                membership: membership,     memberId: memberid,     point: pts,     voucher: voucher, 
                value: value,               nonce: nonce,           expiry: expiry,
            }          
        };
        const sig = await Operator._signTypedData(DOMAIN, types, values);
        const redeem = [
            membership, memberid, pts, voucher, value, nonce, expiry
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