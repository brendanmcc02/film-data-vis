// imports
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";

// global constants
const myRatingsURL = "https://www.imdb.com/user/ur95934592/ratings";
const watchedInCinemaURL = "https://www.imdb.com/list/ls081360952/";
const apiURL = "https://imdb-api.com/en/API/Title/k_ywttr3ie/";
const apiRequestOptions = {
    method: 'GET',
    redirect: 'follow'
};

main();

// main
async function main() {
    const startTime = Date.now();
    /////////////////////////////

    // const preFilmObjects = await getPreFilmObjects();
    // const rawFilms = await getRawFilms(preFilmObjects);

    let preFilmObjects = [];
    let rawFilms = [];

    preFilmObjects.push({"filmID" : "tt6718170", "myRating" : 6, "watchedInCinema" : true});
    rawFilms.push(await getRawFilm(preFilmObjects[0]));

    const stringRawFilm = JSON.stringify(rawFilms[0]);

    fs.writeFileSync("data/rawFilms.json", stringRawFilm, (error) => {
        if (error) {
            console.log(error);
            throw error;
        }
    })

    ///////////////////////////
    const endTime = Date.now();
    const runTime = (endTime - startTime) / 1000.0;
    console.log("\nRuntime: " + runTime.toFixed(2) + " seconds");
}

// web scrapes my imdb ratings page
// returns array of pre film objects: {filmID, myRating, watchedInCinema}
// ~30 sec runtime
async function getPreFilmObjects() {
    let preFilmObjects = [];

    const numberOfFilms = await getNumberOfRatedFilms();
    let url = myRatingsURL;
    let filmIDs = [];

    // iterate through each ratings' webpage; url is initialised to myRatingsURL
    for (let f = 0; f < numberOfFilms && url !== ""; f+=100) {

        let response = await fetch(url);
        let body = await response.text();
        let c = cheerio.load(body);

        // iterate through each instance of a film and push film ID to array
        c('.lister-item-image.ribbonize').each(function () {
            filmIDs.push(c(this).attr('data-tconst'));
        });

        // get corresponding myRating of each film
        // create and push json object to array
        let min = Math.min(f + 100, numberOfFilms);
        for (let i = f; i < min; i++) {
            let myRating = c('span.ipl-rating-star__rating').eq(1 + 24 * (i-f)).text();
            myRating = parseInt(myRating);
            preFilmObjects.push({"filmID" : filmIDs[i], "myRating" : myRating, "watchedInCinema" : false});
        }

        // get url for next iteration
        url = await getNextURL(url);
    }

    // iterate through films watched in cinemas, change 'watchedInCinema' attribute
    // of relevant films

    let filmsWatchedInCinemas = [];
    url = watchedInCinemaURL;
    while (url !== "") {
        let response = await fetch(watchedInCinemaURL);
        let body = await response.text();
        let c = cheerio.load(body);

        c('.lister-item-image.ribbonize').each(function () {
            filmsWatchedInCinemas.push(c(this).attr('data-tconst'));
        })

        preFilmObjects.forEach(film => {
            if (filmsWatchedInCinemas.includes(film.filmID)) {
                film.watchedInCinema = true;
            }
        });

        url = await getNextURL(url);
    }

    return preFilmObjects;
}

// given current URL, returns the URL of the next page
// returns "" if no next page
async function getNextURL(currentURL) {
    let response = await fetch(currentURL);
    let body = await response.text();
    let c = cheerio.load(body);

    let nextURL = c('.flat-button.lister-page-next.next-page').attr('href');

    // if there is no next page then the url attribute will be empty
    if (nextURL === undefined) {
        return "";
    }

    let imdbURL = "https://www.imdb.com"
    nextURL = imdbURL.concat(nextURL);

    return nextURL.toString();
}

// returns number of films rated on my account
async function getNumberOfRatedFilms() {
    const response = await fetch(myRatingsURL);
    const body = await response.text();
    const c = cheerio.load(body);

    let numberOfRatedFilms = c(".lister-list-length span").text();

    return parseInt(numberOfRatedFilms);
}

// iterate through all pre film objects {filmID, myRating, watchedInCinema},
// return an array of raw film objects
async function getRawFilms(preFilmObjects) {
    let rawFilms = [];

    for (const preFilmObject of preFilmObjects) {
        rawFilms.push(await getRawFilm(preFilmObject));
    }

    return rawFilms;
}

// given a pre film object {filmID, myRating, watchedInCinema},
// fetch the full raw film object using the imdb-api
// api is limited to 100 calls every 24 hours
// ~150 secs for all films
async function getRawFilm(preFilmObject) {
    try {
        const filmURL = apiURL.concat(preFilmObject.filmID);
        const response = await fetch(filmURL, apiRequestOptions);
        const rawFilm = await response.json();
        return rawFilm;
    }
    // if there's an error, recursively try again until non-error
    // not sure if smart, if a consistent error persists then stack overflow
    catch (error) {
        console.error(error);
        return getRawFilm(preFilmObject);
    }
}

// preFilmObjects.push({"filmID" : "tt6718170", "myRating" : 6, "watchedInCinema" : true});