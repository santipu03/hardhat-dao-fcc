const { deployments, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const {
    VOTING_DELAY,
    VOTING_PERIOD,
    MIN_DELAY,
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
} = require("../../helper-hardhat-config")
const { moveBlocks } = require("../../utils/move-blocks")
const { moveTime } = require("../../utils/move-time")

describe("Governor Flow", async () => {
    let governor
    let governanceToken
    let timeLock
    let box
    const voteWay = 1
    const reason = "Simply because I'm a cool guy"
    beforeEach(async () => {
        await deployments.fixture(["all"])
        governor = await ethers.getContract("GovernorContract")
        timeLock = await ethers.getContract("TimeLock")
        governanceToken = await ethers.getContract("GovernanceToken")
        box = await ethers.getContract("Box")
    })

    it("can only be changed through governance", async () => {
        await expect(box.store(55)).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("proposes, votes, waits, queues, and then executes", async () => {
        // PROPOSE
        const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [NEW_STORE_VALUE])
        const proposeTx = await governor.propose(
            [box.address],
            [0],
            [encodedFunctionCall],
            PROPOSAL_DESCRIPTION
        )

        const proposeReceipt = await proposeTx.wait(1)
        const proposalId = proposeReceipt.events[0].args.proposalId
        let proposalState = await governor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)
        await moveBlocks(VOTING_DELAY + 1)

        // VOTE
        const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
        await voteTx.wait(1)
        proposalState = await governor.state(proposalId)
        assert.equal(proposalState.toString(), "1")
        console.log(`Current Proposal State: ${proposalState}`)
        await moveBlocks(VOTING_PERIOD + 1)

        // queue & execute
        // const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
        const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION)
        const queueTx = await governor.queue(
            [box.address],
            [0],
            [encodedFunctionCall],
            descriptionHash
        )
        await queueTx.wait(1)
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)

        proposalState = await governor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        console.log("Executing...")
        console.log
        const exTx = await governor.execute(
            [box.address],
            [0],
            [encodedFunctionCall],
            descriptionHash
        )
        await exTx.wait(1)
        console.log((await box.retrieve()).toString())
    })
})
