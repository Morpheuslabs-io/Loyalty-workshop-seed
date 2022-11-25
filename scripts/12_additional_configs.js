const abi = require('../build/artifacts/contracts/Periphery.sol/Periphery.json').abi;
const abi2 = require('../build/artifacts/contracts/Periphery2.sol/Periphery2.json').abi;
const days = 3600 * 24;

async function main() {
    const [owner] = await ethers.getSigners();

    console.log("Owner:", owner.address);
    console.log("Balance:", (await owner.getBalance()).toString());

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const block = await provider.getBlockNumber();
    const timestamp = (await provider.getBlock(block)).timestamp;
    const Periphery = '0x533e331098ce304c8620270dC460EF57051C6147';
    const periphery = new ethers.Contract(Periphery, abi, provider);
    const Periphery2 = '0x6098b3bcEce6E76a387e1d0689Fbd38Af0dC293f';
    const periphery2 = new ethers.Contract(Periphery2, abi2, provider);

    const membership = '0xDF80f659B832399f6B01f1bC5B420Ff1F5aB4384';
    const loyalty = '0x1b72C80342Ec893c04D3d4a9421a70067c51118c';
    const voucher = '0x85CBBc4dFFb39511C99D697C933a77771EE6CE3d';

    //  Register new Membership, Loyalty and Voucher contracts
    console.log("\nRegister new Membership, Loyalty and Voucher in Periphery contract .........")
    let tx = await periphery.connect(owner).addPair(
        membership, loyalty, voucher
    );
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    //  Add new Voucher to Membership 1
    console.log("\nAdd new Voucher to Membership 1 pair .........");
    const membership1 = '0x6950319Dd4A19B505d792eA8C3bd7Af191afFeA8';
    const vouchers = [voucher]
    tx = await periphery.connect(owner).updateVouchers(membership1, vouchers, true);
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    //  Set Schedule for a special event
    console.log('\nSet special event in Periphery2 contract .........')
    const eventId = 1;
    const startTime = timestamp + 30;           //  after 30s
    const endTime = startTime + 7 * days;
    tx = await periphery2.connect(owner).setSchedule(eventId, startTime, endTime);
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    //  Set rate for a regular exchange
    let bMemberships = [membership1];            let bValues = [1];
    let qMemberships = [membership];             let qValues = [5];
    console.log('\nSet rate for a regular exchange in Periphery2 contract .........');
    tx = await periphery2.connect(owner).setXRate(
        0, bMemberships, qMemberships, bValues, qValues
    );
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    //  Set rate for a special exchange
    bValues = [2];
    qValues = [15];
    console.log('\nSet rate for a special exchange in Periphery2 contract .........');
    tx = await periphery2.connect(owner).setXRate(
        eventId, bMemberships, qMemberships, bValues, qValues
    );
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