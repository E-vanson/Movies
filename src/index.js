const fs = require("fs");
const csv_parser = require("csv-parser");
const readline = require('readline');
const { clear } = require('console');

function read_csv(file_path){
    const result = [];

    fs.createReadStream(file_path)
    .pipe(csv_parser())
    .on("data", (data)=> result.push(data))
    .on("end", ()=>{
        console.log("Csv file successfully read ", result)
    })
}
//read_csv("actor_data.csv")

function reportOne() {
    // Define report two functionality
    console.log("Running Report One...");
}

function generate_actors_report() {
    // Define report two functionality
    console.log("Running Report Two...");
}

// Define any additional report functions here

// Function to display the menu and get user choice
function displayMenu() {
    console.log("Enter the number of the report you would like to to view");
    console.log("1. Decades report");
    console.log("2. Actor report");
    // Add extra credit options if needed
    console.log("0. Exit");
}

// Main program loop
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function runProgram() {
    displayMenu();
    rl.question("Enter your choice: ", function(choice) {
        clear();
        if (choice === "1") {
            reportOne();
        } else if (choice === "2") {
            generate_actors_report();
        } 
        // Add extra credit options if needed
        else if (choice === "0") {
            console.log("Exiting...");
            rl.close();
            return;
        } else {
            console.log("Invalid choice. Please try again.");
        }

        rl.question("Do you want to run another report? (yes/no): ", function(answer) {
            if (answer.toLowerCase() === "yes") {
                runProgram();
            } else {
                console.log("Exiting...");
                rl.close();
            }
        });
    });
}
runProgram();