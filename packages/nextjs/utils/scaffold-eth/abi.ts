export const CONTRACT_ABI = [
    {
        "type": "function",
        "name": "getHighScores",
        "inputs": [],
        "outputs": [{
            "name": "", "type": "tuple[]", "internalType": "struct SnakeGame.Score[]", "components": [
                { "name": "player", "type": "address", "internalType": "address" },
                { "name": "score", "type": "uint256", "internalType": "uint256" },
                { "name": "timestamp", "type": "uint256", "internalType": "uint256" }
            ]
        }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPlayerBestScore",
        "inputs": [{ "name": "_player", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "highScores",
        "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "player", "type": "address", "internalType": "address" }, { "name": "score", "type": "uint256", "internalType": "uint256" }, { "name": "timestamp", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "playerBestScores",
        "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "submitScore",
        "inputs": [{ "name": "_score", "type": "uint256", "internalType": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    }
] as const;
