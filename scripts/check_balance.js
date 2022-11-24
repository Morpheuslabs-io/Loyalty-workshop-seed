const abi = require('../build/artifacts/contracts/Membership.sol/Membership.json').abi;

async function main() {
    const [account1, account2, account3] = await ethers.getSigners();

    console.log("Account1:", account1.address);
    console.log("Account2:", account2.address);
    console.log("Account3:", account3.address);

    const provider = ethers.getDefaultProvider(process.env.BTTC_TESTNET_PROVIDER);
    const Membership = '0x1396f595Db82615eF4876664331c6Fedd2291DFF';
    const membership = new ethers.Contract(Membership, abi, provider);

    //  Register Membership and add Loyalty points to `account`
    console.log("Check number of owning vouchers .........")
    console.log("Account 1 has %s vouchers",
        await membership['balanceOf(address)'](account1.address)
    );
    console.log("Account 2 has %s vouchers",
        await membership['balanceOf(address)'](account2.address)
    );
    console.log("Account 3 has %s vouchers",
        await membership['balanceOf(address)'](account3.address)
    );
    
    console.log('\n ===== DONE =====');
}
  
main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
});