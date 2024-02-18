import nodeFetch from "node-fetch";
import * as fs from "fs";
main();

async function main() {
    let filmData = readFromJson("../data/filmData.json");

    filmData.forEach(film => {
       delete film.runtime;
    });

    writeToJson(filmData, "../data/filmData.json");
}

// reads .json file into a variable
function readFromJson(filepath) {
    let filmData;

    try {
        filmData = fs.readFileSync(filepath);
    } catch (error) {
        throw error;
    }

    return JSON.parse(filmData);
}


// writes data to a .json file
function writeToJson(data, filepath) {
    const stringData = JSON.stringify(data, null, 4);

    fs.writeFileSync(filepath, stringData, (error) => {
        if (error) {
            throw error;
        }
    });
}