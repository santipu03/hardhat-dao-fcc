const { network } = require("hardhat")

module.exports = async function moveBlocks(amount) {
    console.log("Moving blocks...")
    for (let i = 0; i < amount; i++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
    }
    console.log(`Moved ${amount} blocks`)
}
