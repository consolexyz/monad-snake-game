// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SnakeGame {
    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    Score[] public highScores;
    mapping(address => uint256) public playerBestScores;

    event NewHighScore(
        address indexed player,
        uint256 score,
        uint256 timestamp
    );
    event NewPersonalBest(address indexed player, uint256 score);

    function submitScore(uint256 _score) external {
        // Update player's best score if applicable
        if (_score > playerBestScores[msg.sender]) {
            playerBestScores[msg.sender] = _score;
            emit NewPersonalBest(msg.sender, _score);
        }

        // Add to high scores if it qualifies
        if (
            highScores.length < 10 ||
            _score > highScores[highScores.length - 1].score
        ) {
            Score memory newScore = Score(msg.sender, _score, block.timestamp);

            if (highScores.length < 10) {
                highScores.push(newScore);
            } else {
                highScores[highScores.length - 1] = newScore;
            }

            // Sort high scores (simple bubble sort since we only have 10 elements max)
            for (uint i = 0; i < highScores.length - 1; i++) {
                for (uint j = 0; j < highScores.length - i - 1; j++) {
                    if (highScores[j].score < highScores[j + 1].score) {
                        Score memory temp = highScores[j];
                        highScores[j] = highScores[j + 1];
                        highScores[j + 1] = temp;
                    }
                }
            }

            emit NewHighScore(msg.sender, _score, block.timestamp);
        }
    }

    function getHighScores() external view returns (Score[] memory) {
        return highScores;
    }

    function getPlayerBestScore(
        address _player
    ) external view returns (uint256) {
        return playerBestScores[_player];
    }
}
