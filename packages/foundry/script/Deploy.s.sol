//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import {DeploySnakeGame} from "./DeploySnakeGame.s.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploy SnakeGame contract
        DeploySnakeGame deploySnakeGame = new DeploySnakeGame();
        deploySnakeGame.run();
    }
}
