const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@atixlabs/hardhat-time-n-mine");
require("hardhat-deploy");
require("hardhat-gas-reporter");


require('./tasks/demo');
require('./tasks/swap');
require('./tasks/topup');
require('./tasks/redeem');
require('./tasks/buy_pts');
require('./tasks/reg_member');
require('./tasks/update_pts');
require('./tasks/upgrade_tier');
require('./tasks/set_allowance');

const mnemonic = process.env.MNEMONIC

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.9"
            }
        ]
    },

    gasReporter: {
        enabled: true
    },

    networks: {
        development: {
            url: "http://127.0.0.1:8545",     // Localhost (default: none)
            accounts: {
                mnemonic: mnemonic,
                count: 10
            },
            live: false, 
            saveDeployments: true
        },
        bsc: {
            url: process.env.BSC_MAINNET_PROVIDER,
            accounts: [
                process.env.MAINNET_DEPLOYER,
            ],
            timeout: 900000,
            chainId: 56,
        },
        bsc_test: {
            url: process.env.BSC_TESTNET_PROVIDER,
            accounts: [
                process.env.TESTNET_DEPLOYER
            ],
            timeout: 20000,
            chainId: 97
        },
        bttc: {
            url: process.env.BTTC_MAINNET_PROVIDER,
            accounts: [
                process.env.MAINNET_DEPLOYER
            ],
            gasPrice: 300000000000000,      // 300,000 GWei
            timeout: 1200000,       //   20 mins
            chainId: 199
        },
        bttc_test: {
            url: process.env.BTTC_TESTNET_PROVIDER,
            accounts: [
                process.env.TESTNET_DEPLOYER,
                process.env.ANOTHER_ACCOUNT1,
                process.env.ANOTHER_ACCOUNT2
            ],
            timeout: 20000,
            chainId: 1029
        },
    },

    paths: {
        sources: "./contracts",
        tests: "./tests",
        cache: "./build/cache",
        artifacts: "./build/artifacts",
        deployments: "./deployments"
    },

    etherscan: {
        // apiKey: process.env.BSC_API_KEY,
        apiKey: process.env.BTTC_API_KEY,
        customChains: [
            {
                network: "BitTorrent Chain Testnet",
                chainId: 1029,
                urls: {
                    apiURL: "https://api-testnet.bttcscan.com/api/",
                    browserURL: "https://testnet.bttcscan.com/"
                }
            },
            {
                network: "BitTorrent Chain Mainnet",
                chainId: 199,
                urls: {
                    apiURL: "https://api.bttcscan.com/api/",
                    browserURL: "https://bttcscan.com/"
                }
            },
        ]
    }
}