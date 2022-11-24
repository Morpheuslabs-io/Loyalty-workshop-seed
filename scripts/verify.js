async function main() {
    const [Deployer] = await ethers.getSigners();
    console.log("Deployer account:", Deployer.address);

    // console.log("Verify Membership Contract ......")
    const Membership = '';                    //  Replace by your deployed contract
    await hre.run("verify:verify", {
        address: Membership,
        constructorArguments: [
            "Amazon Membership", "AMZM", "https://example.com/amazon_membership/"
        ],
    });

    // console.log("Verify Loyalty Contract ......")
    const Loyalty = '';                    //  Replace by your deployed contract
    await hre.run("verify:verify", {
        address: Loyalty,
        constructorArguments: [
            "Amazon Loyalty", "AMZL", 0
        ],
    });

    // console.log("Verify Voucher Contract ......")
    const Voucher = '';                  //  Replace by your deployed contract
    await hre.run("verify:verify", {
        address: Voucher,
        constructorArguments: [
            "Amazon Voucher", "AMZV", 18
        ],
    });

    console.log("Verify Periphery Contract ......")
    const Periphery = '';                  //  Replace by your deployed contract
    await hre.run("verify:verify", {
        address: Periphery,
        constructorArguments: [
            Deployer.address, Deployer.address
        ],
    });

    console.log("Verify Periphery2 Contract ......")
    const Periphery2 = '';                  //  Replace by your deployed contract
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