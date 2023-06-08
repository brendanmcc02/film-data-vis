// get the html
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
// import {readFilmData} from "./updateDB.js";

const imdbTop250URL = "https://www.imdb.com/chart/top";

main();

async function main() {
    // get the html
    let response = await nodeFetch(imdbTop250URL);
    let body = await response.text();
    let c = cheerio.load(body);

    const preFilmObjects = readFilmData();
    preFilmObjects.forEach(film => {
        film.imdbTop25Position = -1;
    })

    let position = 1;
    for (let i = 0; i < 250 && position <= 25; i++) {
        let id = c('.wlb_ribbon').eq(i).attr('data-tconst');
        let index = getIndexOfId(preFilmObjects, id);
        if (index !== -1) {
            preFilmObjects[index].imdbTop25Position = position;
            position++;
        }
    }
}

// utility function that gets the index of
// the preFilmObject with the matching id.
// returns -1 if no match.
function getIndexOfId(preFilmObjects, id) {
    for (let i = 0; i < preFilmObjects.length; i++) {
        if (preFilmObjects[i].id === id) {
            return i;
        }
    }

    return -1;
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
