// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

/**
 * @dev This contract is the owner of Box.sol
 * We want to wait some blocks for a new proposal to be executed
 * This prevent malicious actors and give users the opportunity to "get out" if they want
 */

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
  /**
   * @dev Our constructor pass the next params to TimelockController contract
   *        - minDelay: How long you have to wait before executing
   *        - proposers: who can propose
   *        - executors: Who can execute when a proposal passes
   */
  constructor(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors
  )
    TimelockController(minDelay, proposers, executors, 0x0000000000000000000000000000000000000000)
  {}
}
