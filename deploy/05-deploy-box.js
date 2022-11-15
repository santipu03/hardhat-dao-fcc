const { network, ethers } = require("hardhat")
const { developmentChains, MIN_DELAY } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const args = []

    const box = await deploy("Box", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.waitConfirmations || 1,
    })

    const timeLock = await ethers.getContract("TimeLock")
    const boxContract = await ethers.getContract("Box")

    log("Transfering Ownership to TimeLock...")
    const transferOwnerTx = await boxContract.transferOwnership(timeLock.address)
    await transferOwnerTx.wait(1)
    log("Ownership Transferred Successfully")

    if (!developmentChains.includes(network.name)) {
        await verify(box.address, args)
    }
    log("-----------------------------")
}
