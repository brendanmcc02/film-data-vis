// this file is intended to run in node.js
// as opposed to a web browser

// module imports
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";

// function imports
import {writeFilmsToJson, getPreFilmObjects, getFilteredFilm, getRawFilm, getNextURL, getNumberOfRatedFilms} from './initDB.js'

// exports for main.js
export {readFilmData};

// global constants
const myRatingsURL = "https://www.imdb.com/user/ur95934592/ratings";
const watchedInCinemaURL = "https://www.imdb.com/list/ls081360952/";

main();

// reads filmData.json as a variable,
// updates filmData
// and then writes filmData into json
async function main() {
    const startTime = Date.now();
    /////////////////////////////

    const filmData = readFilmData();
    const cinemaFilms = await getCinemaFilms();
    const numberOfFilms = await getNumberOfRatedFilms();
    const ratedFilms = await getRatedFilms(numberOfFilms, cinemaFilms);
    const updatedFilmData = await getUpdatedFilmData(filmData, ratedFilms);
    writeFilmsToJson(updatedFilmData);

    ///////////////////////////
    const endTime = Date.now();
    const runTime = (endTime - startTime) / 1000.0;
    console.log("\nRuntime: " + runTime.toFixed(2) + " seconds");
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

// gets array of all rated films,
// returns a preFilmObject: {"id", "myRating", "watchedInCinema", "numberOfVotes"}
async function getRatedFilms(numberOfFilms, cinemaFilms) {
    let ratedFilms = [];
    let url = myRatingsURL;
    let ids = [];
    let numberOfVotesArray = [];

    // iterate through each ratings' webpage
    // url is initialised to myRatingsURL
    for (let f = 0; url !== ""; f+=100) {
        // get html of web page
        let response = await nodeFetch(url);
        let body = await response.text();
        let c = cheerio.load(body);

        // iterate through each instance of film and push film ID to array
        c('.lister-item-image.ribbonize').each(function () {
            ids.push(c(this).attr('data-tconst'));
        });

        // iterate through each instance of film and push numberOfVotes to array
        c('.lister-item-content span[data-value]').each(function () {
            numberOfVotesArray.push(parseInt(c(this).attr('data-value')));
        })

        // get corresponding myRating of each film
        // if you're confused by this code then check the comments
        // in initDB.js for identical code
        let min = Math.min(f + 100, numberOfFilms);
        for (let i = f; i < min; i++) {
            let myRating = c('span.ipl-rating-star__rating').eq(1 + 24 * (i-f)).text();
            ratedFilms.push({"id" : ids[i], "myRating" : parseInt(myRating),
                            "watchedInCinema" : false, "numberOfVotes" : numberOfVotesArray[i]});
        }

        // get url for next iteration
        url = await getNextURL(url);
    }

    // iterate through each rated film and check if it has been watched in cinema
    const len = cinemaFilms.length;
    ratedFilms.forEach(film => {
        for (let i = 0; i < len; i++) {
            if (film.id === cinemaFilms[i]) {
                film.watchedInCinema = true;
                break;
            }
        }
    })

    return ratedFilms;
}

// returns array of films watched in cinema
// ~1s for 10 films
async function getCinemaFilms() {
    let cinemaFilms = [];
    let url = watchedInCinemaURL;

    // continuously iterate through each web page
    while (url !== "") {
        // get html
        let response = await nodeFetch(watchedInCinemaURL);
        let body = await response.text();
        let c = cheerio.load(body);

        // push id to array
        c('.lister-item-image.ribbonize').each(function () {
            cinemaFilms.push(c(this).attr('data-tconst'));
        })

        // change url for next iteration
        url = await getNextURL(url);
    }

    return cinemaFilms;
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

    return parseInt(metascore);
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

// updates the database
async function getUpdatedFilmData(filmData, ratedFilms) {
    // api is rate limited (100/24hrs),
    // so this variable keeps track of the calls
    let apiCount = 0;
    const len = ratedFilms.length;

    // for each of the rated films
    for (let i = 0; i < len; i++) {
        // if the film is already in the database
        const filmIndex = getIndexOfFilm(filmData, ratedFilms[i].id);

        if (filmIndex !== -1) {
            // update metascore, imdbRating, numberOfVotes, watchedInCinema, myRating
            filmData[filmIndex].metacriticRating = await getMetascore(filmData[filmIndex].id);
            filmData[filmIndex].imDbRating = await getImdbRating(filmData[filmIndex].id);
            filmData[filmIndex].imDbRatingVotes = ratedFilms[i].numberOfVotes;
            filmData[filmIndex].watchedInCinema = ratedFilms[i].watchedInCinema;
            filmData[filmIndex].myRating = ratedFilms[i].myRating;
        }
        // else, use the api to add film to the database
        // (only if <100 calls have been made)
        else if (apiCount < 100) {
            const rawFilm = await getRawFilm(ratedFilms[i]);
            filmData.push(await getFilteredFilm(rawFilm, ratedFilms[i]))
            apiCount++;
        }
    }

    return filmData;
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
