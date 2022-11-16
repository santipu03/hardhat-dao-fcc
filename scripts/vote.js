const { ethers, network } = require("hardhat")
const fs = require("fs")
const { developmentChains, VOTING_PERIOD, proposalsFile } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

async function main() {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    const proposalId = proposals[network.config.chainId].at(-1)
    // 0 = Against, 1 = For, 2 = Abstain
    const voteWay = 1
    const reason = "I'm the one who knocks"
    const governor = await ethers.getContract("GovernorContract")
    const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason)
    await voteTxResponse.wait(1)

    if (developmentChains.includes(network.name)) {
        moveBlocks(VOTING_PERIOD + 1)
    }
    // Now the state will be 4 (Succedeed)
    const proposalState2 = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState2}`)
    console.log("Voted! Ready to go!")
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
