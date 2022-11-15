const { ethers } = require("hardhat")
const { ADDRESS_ZERO } = require("../helper-hardhat-config")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // If we don't execute this script, the TimeLock Admin is the deployer
    // We have to set up the roles for the executor and proposer, and then revoke our role

    const timeLock = await ethers.getContract("TimeLock")
    const governanceToken = await ethers.getContract("GovernanceToken")
    const governanceContract = await ethers.getContract("GovernorContract")

    log(`TimeLock at ${timeLock.address}`)
    log(`Token at ${governanceToken.address}`)
    log(`Governor Contract at ${governanceContract.address}`)

    log("Setting up roles...")
    const proposerRole = await timeLock.PROPOSER_ROLE()
    const executorRole = await timeLock.EXECUTOR_ROLE()
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

    const proposerTx = await timeLock.grantRole(proposerRole, governanceContract.address)
    await proposerTx.wait(1)
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
    await executorTx.wait(1)
    const revokeTx = await timeLock.revokeRole(adminRole, deployer)
    await revokeTx.wait(1)

    log("-----------------------------")
}
