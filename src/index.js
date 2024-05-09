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
                const { id, Type, Title, Year, Location, Production_Company, Distributor, Director, Writers, Actor,Frequency  } = row;
                if (!films[Actor]) {
                    films[Actor] = [];
                }
                films[Actor].push({ Title, Year, Type , Location });
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
        const actorMovies = films[actor];
        if (actorMovies.length < 1) continue; // Skip actors with no movies

        actorReport.push(`Actor: ${actor}`);
        actorMovies.forEach(movie => {
            const { Title, Year, Type, Location} = movie;
            const formattedYears = Array.isArray(Year) ? `${Math.min(...Year)} - ${Math.max(...Year)}` : Year;
            let locations = '';

            if (Array.isArray(Location)) {
                const neighborhoodList = Location.map(loc => neighborhoods[loc] || loc);
                locations = neighborhoodList.length <= 3 ? neighborhoodList.join('; ') : `${neighborhoodList.slice(0, 2).join('; ')} and ${neighborhoodList.length - 2} more`;
            } else {
                locations = neighborhoods[Location] || Location;
            }
           

            actorReport.push(`${Title}   ${Type}   ${formattedYears}   ${locations}` );
        });

        actorReport.push(''); // Add an empty line after each actor's report
    }
    console.log("Actor report " + actorReport)
    return actorReport;
    
}

// Example usage
const film_path = 'film_locations_with_id.csv';
const neighborhood_path = 'sf_neighborhoods_with_centroid.csv';

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
            generate_actors_report(film_path, neighborhood_path)
            .then(report => {
                for (let i = 0; i < report.length; i++) {
                    console.log()
                    console.log("MovieTitle " + " Format " + " Year " + " Location " + "\n" + report[i] + "\n"); // Each actor report
                }
            })
            .catch(error => {
                console.error('Error:', error);
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