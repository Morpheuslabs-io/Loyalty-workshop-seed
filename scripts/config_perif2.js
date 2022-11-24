const { BigNumber } = require("ethers");
const abi = require('../build/artifacts/contracts/Periphery2.sol/Periphery2.json').abi;
const days = 3600 * 24;

async function main() {
    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const block = await provider.getBlockNumber();
    const timestamp = (await provider.getBlock(block)).timestamp;
    const Periphery2 = '0x32385E92A2E7c110397c0abDF6df2D87014041C8';
    const periphery = new ethers.Contract(Periphery2, abi, provider);

    const [manager] = await ethers.getSigners();
    console.log("Manager account:", manager.address);
    
    //  Set Schedule for a special event
    console.log('Set special event .........')
    const eventId = 1;
    const startTime = timestamp + 30;           //  after 30s
    const endTime = startTime + 7 * days;
    let tx = await periphery.connect(manager).setSchedule(eventId, startTime, endTime);
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    //  Set rate for a regular exchange
    let bTypes = [1];             let bValues = [1];
    let qTypes = [2];             let qValues = [5];
    console.log('Set rate for a regular exchange .........');
    tx = await periphery.connect(manager).setXRate(
        0, bTypes, qTypes, bValues, qValues
    );
    console.log('TxHash: ', tx.hash);
    await tx.wait();

    //  Set rate for a special exchange
    bTypes = [1];             bValues = [2];
    qTypes = [2];             qValues = [15];
    console.log('Set rate for a special exchange .........');
    tx = await periphery.connect(manager).setXRate(
        eventId, bTypes, qTypes, bValues, qValues
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