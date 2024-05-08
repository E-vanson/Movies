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


async function generate_actors_report(film_path, neighborhood_path) {
    const films = {}; // Object to store films data
    const neighborhoods = {}; // Object to store neighborhood data

    // Read film location data
    await new Promise((resolve, reject) => {
        fs.createReadStream(film_path)
            .pipe(csv_parser())
            .on('data', (row) => {
                const { Title, Year, Location, Type, Actor } = row;
                if (!films[Actor]) {
                    films[Actor] = [];
                }
                films[Actor].push({ Title, Year, Location, Type });
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    });

    // Read neighborhood data
    await new Promise((resolve, reject) => {
        fs.createReadStream(neighborhood_path)
            .pipe(csv_parser())
            .on('data', (row) => {
                neighborhoods[row.Location] = row.Name;
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    });

    // Generate actor report
    const actorReport = [];
    for (const actor in films) {
        const productions = films[actor];
        if (productions.length < 2) continue; // Skip actors with fewer than two productions

        actorReport.push(`Actor: ${actor.padEnd(30)}`);
        const sortedProductions = productions.sort((a, b) => a.Title.localeCompare(b.Title));

        sortedProductions.forEach(prod => {
            const years = prod.Year.includes('-') ? prod.Year.split('-') : [prod.Year];
            const formattedYears = years.length > 1 ? `${Math.min(...years)} - ${Math.max(...years)}` : years[0];
            const neighborhoodsList = neighborhoods[prod.Location] ? neighborhoods[prod.Location].split(';') : [];
            let locationsStr;
            if (neighborhoodsList.length <= 3) {
                locationsStr = neighborhoodsList.join('; ');
            } else {
                locationsStr = neighborhoodsList.slice(0, 2).join('; ') + `; and ${neighborhoodsList.length - 2} more`;
            }
            actorReport.push(`${prod.Title.padEnd(35)}${prod.Type.padEnd(6)}${formattedYears.padEnd(7)}${locationsStr}`);
        });
    }

    return actorReport;
}

// Example usage
const film_path = 'actor_data.csv';
const neighborhood_path = 'actor_data.csv';

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

async function runProgram() {
    displayMenu();
    rl.question("Enter your choice: ", async function(choice) {
        clear();
        if (choice === "1") {
            reportOne();
        } else if (choice === "2") {
        const report = await generate_actors_report(film_path, neighborhood_path);
        report.forEach(line => {
            console.log(line);
            console.log(); // Insert newline after each actor's report
        });
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