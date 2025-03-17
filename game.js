const crypto = require('crypto');
const readlineSync = require('readline-sync');

function generateHMAC(secretKey, message) {
    return crypto.createHmac('sha3-256', secretKey).update(message).digest('hex');
}

function validateDiceConfig(diceConfigs) {
    if (diceConfigs.length < 3) {
        console.error("Error: You must provide at least 3 dice.");
        process.exit(1);
    }

    for (let dice of diceConfigs) {
        let sides = dice.split(',').map(s => s.trim());

        if (sides.length !== 6) {
            console.error(`Error: Invalid number of sides (${sides.length}) in dice: ${dice}`);
            process.exit(1);
        }

        if (!sides.every(side => /^\d+$/.test(side))) {
            console.error(`Error: Invalid value found in dice: ${dice}`);
            process.exit(1);
        }
    }
}

const args = process.argv.slice(2);
validateDiceConfig(args);

const dice = args.map(d => d.split(',').map(Number));

const firstPlayer = Math.floor(Math.random() * 2);
console.log(`First player selection (0=User, 1=Computer): ${firstPlayer}`);

let userDiceIndex, computerDiceIndex;
if (firstPlayer === 0) {
    userDiceIndex = readlineSync.questionInt(`Enter your dice choice (0-${dice.length - 1}): `);
    if (userDiceIndex < 0 || userDiceIndex >= dice.length) {
        console.error("Error: Invalid dice selection.");
        process.exit(1);
    }
    computerDiceIndex = (userDiceIndex + 1) % dice.length; 
} else {
    computerDiceIndex = Math.floor(Math.random() * dice.length);
    userDiceIndex = (computerDiceIndex + 1) % dice.length; 
}

console.log(`User selects Dice ${userDiceIndex}, Computer selects Dice ${computerDiceIndex}`);

const userSecretKey = crypto.randomBytes(16).toString('hex');
const computerSecretKey = crypto.randomBytes(16).toString('hex');

const userRollIndex = Math.floor(Math.random() * 6);
const computerRollIndex = Math.floor(Math.random() * 6);

const userRoll = dice[userDiceIndex][userRollIndex];
const computerRoll = dice[computerDiceIndex][computerRollIndex];

const userHMAC = generateHMAC(userSecretKey, userRoll.toString());
const computerHMAC = generateHMAC(computerSecretKey, computerRoll.toString());

console.log(`User roll: ${userRoll}, HMAC: ${userHMAC}`);
console.log(`Computer roll: ${computerRoll}, HMAC: ${computerHMAC}`);

if (userRoll > computerRoll) {
    console.log("User wins!");
} else if (userRoll < computerRoll) {
    console.log("Computer wins!");
} else {
    console.log("It's a tie!");
}

console.log("\n=== HMAC Verification ===");
console.log(`User Secret Key: ${userSecretKey}`);
console.log(`Computer Secret Key: ${computerSecretKey}`);
console.log(`User should verify HMAC: ${generateHMAC(userSecretKey, userRoll.toString())}`);
console.log(`Computer should verify HMAC: ${generateHMAC(computerSecretKey, computerRoll.toString())}`);
