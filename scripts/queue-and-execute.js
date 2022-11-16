const { ethers, network } = require("hardhat")
const fs = require("fs")
const {
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    MIN_DELAY,
    developmentChains,
    proposalsFile,
} = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")
const { moveTime } = require("../utils/move-time")

async function queueAndExecute() {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")
    const args = [NEW_STORE_VALUE]
    const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args)
    // Here we provide the hash of the description instead of the description
    // Because the description is already on chain with the propose() function
    const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION)
    console.log("Queueing...")
    const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1)

    if (developmentChains.includes(network.name)) {
        moveTime(MIN_DELAY + 1)
        moveBlocks(1)
    }

    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    const proposalId = proposals[network.config.chainId].at(-1)
    const proposalState = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

    console.log("Executing...")
    const executeTx = await governor.execute(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await executeTx.wait(1)

    const proposalState2 = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState2}`)

    const boxNewValue = await box.retrieve()
    console.log(`New Box Value: ${boxNewValue.toString()}`)
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
