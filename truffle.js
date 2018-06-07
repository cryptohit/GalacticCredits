module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    networks: {
        development: {
            host: "localhost",
            port: 7545,
            network_id: "5777",
            gas: 6721975
            //port: 8545,
            //network_id: "*",
            //gas: 3500000,
        },
        rinkeby: {
            host: "localhost",  // Connect to geth on the specified
            port: 8545,
            from: "0x32127Bd5FFb16215936f5483015D3d583c105FE9",   // default address to use for any transaction Truffle makes during migrations
            network_id: 4,  // rinkeby network id
            gas: 6712390    // Gas limit used for deploys
        },
        live: {
            host: "localhost",
            port: 8545,
            from: "ACCOUNT_ADDRESS",
            network_id: 1
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
};