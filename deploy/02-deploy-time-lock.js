const { network } = require("hardhat")
const { developmentChains, MIN_DELAY } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("-----------------------------")

    const args = [MIN_DELAY, [], []]

    const timeLock = await deploy("TimeLock", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.waitConfirmations || 1,
    })

    if (!developmentChains.includes(network.name)) {
        await verify(timeLock.address, args)
    }
    log("-----------------------------")
}
