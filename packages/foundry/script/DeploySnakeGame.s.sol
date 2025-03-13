// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/SnakeGame.sol";

contract DeploySnakeGame is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Deploy SnakeGame contract
        SnakeGame snakeGame = new SnakeGame();

        // Store deployment information
        deployments.push(Deployment("SnakeGame", address(snakeGame)));

        console.log("SnakeGame deployed to:", address(snakeGame));
    }
}
