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

// global constants
const imdbBaseTitleUrl = "https://www.imdb.com/title/";

main();

// reads filmData.json as a variable,
// updates filmData
// and then writes filmData into json
async function main() {
    const startTime = Date.now();
    /////////////////////////////

    console.log("Reading filmData.json into a variable.");
    let filmData = readFilmData();
    console.log("Updating filmData.json:")
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

// iterates through filmData.json and compares it to myRatedFilms
// if a rated film is already in filmData.json, it will update:
// myRating, imdbRating, metascore, watchedInCinema, myTop10Position
// else, if the film is not in filmData.json, it will add full film data
// to filmData.json
async function updateFilmData(filmData) {

    // web scrape all my rated films
    console.log("Web scraping my rated films.");
    const myRatedFilms = await getMyRatedFilms();
    // get bond and mcu films for 'franchise' attribute of film object
    const bondFilmTitles = await getBondFilmTitles();
    const mcuFilmTitles = await getMcuFilmTitles();
    let len = myRatedFilms.length;

    // for each of my rated films
    for (let i = 0; i < len; i++) {
        console.log("Updating film:", i + 1, "/", len);
        const filmIndex = getIndexOfFilm(filmData, myRatedFilms[i].id);

        // if the film is already in the database
        if (filmIndex !== -1) {
            // update myRating, imdbRating, metascore, watchedInCinema, myTop10Position
            filmData[filmIndex].myRating = myRatedFilms[i].myRating;
            const filmRatingData = await getFilmRatingData(filmData[filmIndex].id);
            filmData[filmIndex].imdbRating = filmRatingData.imdbRating;
            filmData[filmIndex].metascore = filmRatingData.metascore;
            filmData[filmIndex].watchedInCinema = myRatedFilms[i].watchedInCinema;
            filmData[filmIndex].myTop10Position = myRatedFilms[i].myTop10Position;
        }
        // else, get the full film data and add it to the database
        // (only if it's not a tv series, episode, special, short or documentary)
        else {
            let film = await getFilm(myRatedFilms[i], bondFilmTitles, mcuFilmTitles);

            if (film != null) {
                filmData.unshift(film);
            }
        }
    }

    // the following code covers the edge case:
    // 1. rate a film -> it gets added to filmData.json
    // 2. unrate the film on my account
    // 3. the film will stay in filmData.json, when it should be removed

    // iterate through all films in filmData.json, if there is a film there that is
    // not in myRatedFilms, remove this film from filmData.json
    for (let i = 0; i < filmData.length; i++) {
        let filmIndex = getIndexOfFilm(myRatedFilms, filmData[i].id);

        // if the filmData film is not in myRatedFilms, remove it
        if (filmIndex === -1) {
            filmData.splice(i, 1);
            i--; // don't forget to decrement after removing array entry!
        }
    }
}

// gets the imdbRating and metascore of a film
async function getFilmRatingData(id) {

    // initialise the object
    let filmRatingData = {"imdbRating": 0.0, "metascore": -1};

    // get the web page URL for the film specified by id
    const url = imdbBaseTitleUrl.concat(id);

    try {
        // get html
        const response = await nodeFetch(url);
        const body = await response.text();
        const c = cheerio.load(body);

        // get imdbRating
        const imdbRating = c("span.sc-bde20123-1.iZlgcd").eq(0).text();
        filmRatingData.imdbRating = parseFloat(imdbRating);

        // get metascore
        let metascore = c(".score-meta").text();

        // if film has a metascore, parse the string to an integer
        if (metascore !== '') {
            filmRatingData.metascore = parseInt(metascore);
        }
        // else, set the metascore to -1
        else {
            filmRatingData.metascore = -1;
        }

        return filmRatingData;
    } catch (error) {
        console.log(error.name + ": " + error.message);
        throw error;
    }

}

// gets the index of a film in either filmData or myRatedFilms array.
// if the film is not in the array, it returns -1
function getIndexOfFilm(filmArray, id) {
    const len = filmArray.length;

    for (let i = 0; i < len; i++) {
        if (filmArray[i].id === id) {
            return i;
        }
    }

    return -1;
}
