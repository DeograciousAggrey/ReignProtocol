require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-gas-reporter");
require("dotenv").config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

module.exports = {
        solidity: {
            compilers: [{version: "0.8.4"}, {version: "0.8.20"}],
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        },
        paths: {
            artifacts: "./frontend/src/artifacts",
        },
        networks: {
            polygon_mumbai: {
                url: process.env.MUMBAI_URL,
                accounts: [process.env.PRIVATE_KEY],
            },
        },

    };
        