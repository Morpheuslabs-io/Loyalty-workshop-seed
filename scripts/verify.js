async function main() {
    const [Deployer] = await ethers.getSigners();
    console.log("Deployer account:", Deployer.address);

    // console.log("Verify Membership Contract ......")
    const Membership = '0x6950319Dd4A19B505d792eA8C3bd7Af191afFeA8';                    //  Replace by your deployed contract
    await hre.run("verify:verify", {
        address: Membership,
        constructorArguments: [
            "Amazon Membership", "AMZM", "https://example.com/amazon_membership/"
        ],
    });

    // console.log("Verify Loyalty Contract ......")
    const Loyalty = '0x667979e3C4A5F5628674e3f06fdbdde4D8057fAF';                    //  Replace by your deployed contract
    await hre.run("verify:verify", {
        address: Loyalty,
        constructorArguments: [
            "Amazon Loyalty", "AMZL", 0
        ],
    });

    // console.log("Verify Voucher Contract ......")
    const Voucher = '0x17b317CC8628373b2ba1673688b15C9BDdFE14eC';                  //  Replace by your deployed contract
    await hre.run("verify:verify", {
        address: Voucher,
        constructorArguments: [
            "Amazon Voucher", "AMZV", 18
        ],
    });

    console.log("Verify Periphery Contract ......")
    const Periphery = '0x533e331098ce304c8620270dC460EF57051C6147';                  //  Replace by your deployed contract
    await hre.run("verify:verify", {
        address: Periphery,
        constructorArguments: [
            Deployer.address, Deployer.address
        ],
    });

    console.log("Verify Periphery2 Contract ......")
    const Periphery2 = '0x6098b3bcEce6E76a387e1d0689Fbd38Af0dC293f';                  //  Replace by your deployed contract
    await hre.run("verify:verify", {
        address: Periphery2,
        constructorArguments: [Periphery],
    });

    // console.log("Verify USDT Contract ......")
    // const USDT = '0xE4B5aE864C54b4E5744aFfFfcA2ddA3daea48B08';                  //  Replace by your deployed contract

    // await hre.run("verify:verify", {
    //     address: USDT,
    //     constructorArguments: ['6'],
    // });

    console.log('\n===== DONE =====')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
});