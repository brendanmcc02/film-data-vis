// this file is intended to run in node.js
// as opposed to a web browser

// module imports
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";

// function imports
import {writeFilmsToJson, getMyRatedFilms, getFilm, getBondFilmTitles, getMcuFilmTitles} from './initDB.js'

// exports for graph.js
export {readFilmData};

main();

// reads filmData.json as a variable,
// updates filmData
// and then writes filmData into json
async function main() {
    const startTime = Date.now();
    /////////////////////////////

    console.log("Reading filmData.json into a variable.");
    let filmData = readFilmData();
    console.log("Updating filmData.json.")
    await updateFilmData(filmData);
    console.log("Writing filmData to .json file.")
    writeFilmsToJson(filmData);

    ///////////////////////////
    const endTime = Date.now();
    let runtime = (endTime - startTime) / 1000;
    const minutes = Math.floor(runtime/60);
    const seconds = runtime % 60;
    console.log("\nRuntime: " + minutes + " minutes " + seconds.toFixed(1) + " seconds.");
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

// updates the database
async function updateFilmData(filmData) {

    const myRatedFilms = await getMyRatedFilms();
    const bondFilmTitles = await getBondFilmTitles();
    const mcuFilmTitles = await getMcuFilmTitles();
    const len = myRatedFilms.length;

    // for each of the rated films
    for (let i = 0; i < len; i++) {
        const filmIndex = getIndexOfFilm(filmData, myRatedFilms[i].id);

        // if the film is already in the database
        if (filmIndex !== -1) {
            // update myRating, imdbRating, metascore, watchedInCinema, myTop10Position
            filmData[filmIndex].myRating = myRatedFilms[i].myRating;
            filmData[filmIndex].imdbRating = await getImdbRating(filmData[filmIndex].id);
            filmData[filmIndex].metascore = await getMetascore(filmData[filmIndex].id);
            filmData[filmIndex].watchedInCinema = myRatedFilms[i].watchedInCinema;
            filmData[filmIndex].myTop10Position = myRatedFilms[i].myTop10Position;
        }
        // else, get the full film data and add it to the database
        else {
            const film = getFilm(myRatedFilms, bondFilmTitles, mcuFilmTitles);
            filmData.unshift(film);
        }
    }
}

// gets metascore of film
async function getMetascore(id) {
    // get the web page URL for the film specified by id
    const imdbURL = "https://www.imdb.com/title/";
    const url = imdbURL.concat(id);

    // get html
    const response = await nodeFetch(url);
    const body = await response.text();
    const c = cheerio.load(body);

    const metascore = c(".score-meta").text();

    if (metascore !== '') {
        return parseInt(metascore);
    }

    return -1;
}

// gets imdb rating of film
async function getImdbRating(id) {
    // get the web page URL for the film specified by id
    const imdbURL = "https://www.imdb.com/title/";
    const url = imdbURL.concat(id);

    // get html
    const response = await nodeFetch(url);
    const body = await response.text();
    const c = cheerio.load(body);

    const imdbRating = c("span.sc-bde20123-1.iZlgcd").eq(0).text();

    return parseFloat(imdbRating);
}

// gets the index of a film in the database
// if the film is not in the database, it returns -1
function getIndexOfFilm(filmData, id) {
    const len = filmData.length;
    for (let i = 0; i < len; i++) {
        if (filmData[i].id === id) {
            return i;
        }
    }

    return -1;
}
