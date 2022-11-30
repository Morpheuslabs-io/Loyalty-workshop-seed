const { task } = require('hardhat/config');
const days = 24 * 3600;

task('accounts', 'Show account list')
    .setAction( async() => {
        const [...accounts] = await ethers.getSigners();
        console.log('\nAccount List:');
        console.log('Account 1: %s', accounts[0].address);
        console.log('Account 2: %s', accounts[1].address);
        console.log('Account 3: %s', accounts[2].address);

        console.log('\n ===== DONE =====');
    }
);
  