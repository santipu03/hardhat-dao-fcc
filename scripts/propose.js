const { ethers, network } = require("hardhat")
const fs = require("fs")
const {
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    developmentChains,
    VOTING_DELAY,
    proposalsFile,
} = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

async function propose(functionToCall, args, proposalDescription) {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")

    /**
     *  Propose function args:
     *      - address[] targets --> addresses we want to call
     *      - uint256[] values --> ETH we want to send
     *      - bytes[] calldatas --> encoded params for the function we want to call
     *      - string description --> description of the proposal
     */

    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
    console.log(`Proposal Description: \n  ${proposalDescription}`)

    const proposeTx = await governor.propose(
        [box.address],
        [0],
        [encodedFunctionCall],
        proposalDescription
    )
    const proposeReceipt = await proposeTx.wait(1)

    if (!developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1)
    }

    const proposalId = proposeReceipt.events[0].args.proposalId
    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    proposals[network.config.chainId.toString()].push(proposalId.toString())
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals))
}

propose(FUNC, [NEW_STORE_VALUE], PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
