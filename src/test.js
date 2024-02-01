import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import {throwErrorMessage} from "./initDB.js";

const imdbBaseTitleUrl = "https://www.imdb.com/title/";

main();

async function main() {
    const fd = readFromJson("../data/filmData.json");

    fd.forEach(film => {
       // if (film.imdbRating <= 0.0 || film.imdbRating >= 10.0) {
           console.log(film.imdbRating);
       // }
    });
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
            console.log(error);
            throw error;
        }
    });
}
