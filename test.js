import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

main();

async function main() {
    let films = readFromJson("data/filmData.json");

    films.forEach(film => {
        if (film.franchise !== "") {
            console.log(film.franchise + " " + film.title);
        }
    });
}

// reads .json file into a variable
function readFromJson(filepath) {
    let filmData;

    try {
        filmData = fs.readFileSync(filepath);
    } catch (error) {
        console.error(error);
        throw error;
    }

    return JSON.parse(filmData);
}
