const networkConfig = {
    31337: {
        name: "localhost",
    },
    5: {
        name: "goerli",
    },
}

const developmentChains = ["hardhat", "localhost"]
const MIN_DELAY = 3600
const VOTING_PERIOD = 5
const VOTING_DELAY = 1
const QUORUM_PERCENTAGE = 4
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"

module.exports = {
    networkConfig,
    developmentChains,
    MIN_DELAY,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
    ADDRESS_ZERO,
}
