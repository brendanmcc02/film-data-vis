// get the html
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

main();

async function main() {

    let source = "Star Wars: Episode VI - Return of the Jedi";
    let t = "Star ";

}

async function containsSubstringArray(source, arrayOfSubstrings) {
    const len = arrayOfSubstrings.length;

    for (let i = 0; i < len; i++) {
        if (source.includes(arrayOfSubstrings[i]) === true) {
            return true;
        }
    }

    return false;
}

// reads filmData.json file into a variable
function readFilmData() {
    let filmData;

    try {
        filmData = fs.readFileSync("data/filmData.json");
    } catch (error) {
        console.error(error);
        throw error;
    }

    return JSON.parse(filmData);
}
