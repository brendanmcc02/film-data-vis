// this file is intended to run in node.js
// as opposed to a web browser

// module imports
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";

// function imports
import {writeToJson, getMyRatedFilms, getFilm, getMcuFilmTitles, writeMetadata} from './initDB.js';

// constant imports
import {imdbBaseTitleUrl} from './initDB.js';

// exports for graph.js
export {readFromJson};

const startTime = Date.now();

main();

// 1. reads film-data.json into a variable,
// 2. updates film-data
// 3. writes to json
async function main() {
    console.log("Reading film-data.json into a variable.");
    let filmData = readFromJson("../data/film-data.json");
    console.log("Updating film-data.json:")
    await updateFilmData(filmData);
    console.log("Writing film-data to .json file.")
    writeToJson(filmData, "../data/film-data.json");

    console.log("Writing to metadata.json.");
    writeMetadata("ok", startTime, "", "");
}

// reads .json file into a variable
function readFromJson(filepath) {
    let filmData;

    try {
        filmData = fs.readFileSync(filepath);
    } catch (error) {
        writeMetadata("error", startTime, error.name, error.message);
        throw error;
    }

    return JSON.parse(filmData);
}

// iterates through film-data.json and compares it to myRatedFilms
// if a rated film is already in film-data.json, it will update:
// myRating, imdbRating, metascore, watchedInCinema, myTop10Position
// else, if the film is not in film-data.json, it will add full film data
// to film-data.json
async function updateFilmData(filmData) {

    // web scrape all my rated films
    console.log("Web scraping my rated films.");
    const myRatedFilms = await getMyRatedFilms();
    // get mcu films for 'franchise' attribute of film object
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

            // update only if new imdb rating is not -1
            if (filmRatingData.imdbRating !== -1.0) {
                filmData[filmIndex].imdbRating = filmRatingData.imdbRating;
            }

            // update only if: new meta is not -1
            if (filmRatingData.metascore !== -1) {
                filmData[filmIndex].metascore = filmRatingData.metascore;
            }

            filmData[filmIndex].watchedInCinema = myRatedFilms[i].watchedInCinema;
            filmData[filmIndex].myTop10Position = myRatedFilms[i].myTop10Position;
        }
            // else, get the full film data and add it to the database
        // (only if it's not a tv series, episode, special, short or documentary)
        else {
            let film = await getFilm(myRatedFilms[i], mcuFilmTitles);

            if (film !== "not a feature film") {
                filmData.unshift(film);
            }
        }
    }

    // the following code covers the edge case:
    // 1. rate a film -> it gets added to film-data.json
    // 2. unrate the film on my account
    // 3. the film will stay in film-data.json, when it should be removed

    // iterate through all films in film-data.json, if there is a film there that is
    // not in myRatedFilms, remove this film from film-data.json
    for (let i = 0; i < filmData.length; i++) {
        let filmIndex = getIndexOfFilm(myRatedFilms, filmData[i].id);

        // if the film-data film is not in myRatedFilms, remove it
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
        const imdbRating = c('div[data-testid=hero-rating-bar__aggregate-rating__score]').first().find('span:nth-child(1)').text();

        if (imdbRating !== '') {
            filmRatingData.imdbRating = parseFloat(imdbRating);
        }
            // there is a rare (~1/100) bug where it simply won't read the imdb rating. it is not replicable, don't know what the problem is but idc.
            // for now if the bug occurs, i won't bother updating the imdb rating for that film. the imdb rating really only changes on new movies,
        // and if the bug occurs on one film, most likely the next time the update script is run it'll update it's imdb rating on the next round.
        else {
            filmRatingData.imdbRating = -1.0;
        }

        // get metascore
        let metascore = c(".metacritic-score-box").text();

        // if film has a metascore, parse the string to an integer
        if (metascore !== '') {
            filmRatingData.metascore = parseInt(metascore);
        }

        return filmRatingData;
    } catch (error) {
        writeMetadata("error", startTime, error.name, error.message);
        throw error;
    }

}

// gets the index of a film in either film-data or myRatedFilms array.
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