const crypto = require("crypto");
const readline = require("readline-sync");

class HMACGenerator {
    constructor() {
        this.key = crypto.randomBytes(32).toString("hex");
    }

    generateHMAC(message) {
        return crypto.createHmac("sha3-256", this.key).update(message.toString()).digest("hex");
    }
}

class Dice {
    constructor(values) {
        if (!Array.isArray(values) || values.length !== 6 || !values.every(Number.isInteger)) {
            throw new Error("Each dice must have exactly 6 integer values.");
        }
        this.values = values;
    }

    roll() {
        return this.values[Math.floor(Math.random() * 6)];
    }
}

class DiceGame {
    constructor(diceArray) {
        if (diceArray.length < 3) {
            throw new Error("You must provide at least 3 valid dice.");
        }
        this.dice = diceArray.map(values => new Dice(values));
        this.firstMoveHMAC = new HMACGenerator();
        this.userRollHMAC = new HMACGenerator();
        this.computerRollHMAC = new HMACGenerator();
    }

    startGame() {
        console.log("Welcome to the Provably Fair Dice Game!");

        const firstMove = Math.floor(Math.random() * 2); // 0 = User, 1 = Computer
        console.log(`First move HMAC: ${this.firstMoveHMAC.generateHMAC(firstMove)}`);

        console.log("First player selection (0=User, 1=Computer):", firstMove);

        const userDiceIndex = this.getUserDiceChoice();
        const computerDiceIndex = firstMove === 0 ? (userDiceIndex === 0 ? 1 : 0) : 0;

        console.log(`User selects Dice ${userDiceIndex}, Computer selects Dice ${computerDiceIndex}`);

        const userRoll = this.dice[userDiceIndex].roll();
        const computerRoll = this.dice[computerDiceIndex].roll();

        console.log(`User roll: ${userRoll}, HMAC: ${this.userRollHMAC.generateHMAC(userRoll)}`);
        console.log(`Computer roll: ${computerRoll}, HMAC: ${this.computerRollHMAC.generateHMAC(computerRoll)}`);

        this.determineWinner(userRoll, computerRoll);
        this.revealKeys();
    }

    getUserDiceChoice() {
        let choice;
        do {
            choice = readline.questionInt("Select your dice (0 or 1): ");
        } while (![0, 1].includes(choice));
        return choice;
    }

    determineWinner(userRoll, computerRoll) {
        if (userRoll > computerRoll) {
            console.log("User wins!");
        } else if (userRoll < computerRoll) {
            console.log("Computer wins!");
        } else {
            console.log("It's a tie!");
        }
    }

    revealKeys() {
        console.log("\nRevealing Keys:");
        console.log(`First move key: ${this.firstMoveHMAC.key}`);
        console.log(`User roll key: ${this.userRollHMAC.key}`);
        console.log(`Computer roll key: ${this.computerRollHMAC.key}`);
    }
}

// Run the game
try {
    const args = process.argv.slice(2).map(arg => arg.split(",").map(Number));
    const game = new DiceGame(args);
    game.startGame();
} catch (error) {
    console.error(`Error: ${error.message}`);
}
