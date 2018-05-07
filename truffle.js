module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 3500000
        },
        rinkeby: {
            host: "localhost",  // Connect to geth on the specified
            port: 8545,
            from: "YOUR_ACCOUNT_ADDRESS",   // default address to use for any transaction Truffle makes during migrations
            network_id: 4,  // rinkeby network id
            gas: 4612388    // Gas limit used for deploys
        }
    }
};