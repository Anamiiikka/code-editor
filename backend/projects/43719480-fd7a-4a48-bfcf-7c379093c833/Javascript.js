const readline = require('readline');

// Create an interface for reading input from the user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask for the input
rl.question('Enter a number: ', (n) => {
    n = parseInt(n);  // Convert input to integer

    if (isNaN(n)) {
        console.log("Please enter a valid number.");
    } else {
        // Print numbers from 1 to n
        for (let i = 1; i <= n; i++) {
            console.log(i);
        }
    }

    rl.close();  // Close the input interface
});
