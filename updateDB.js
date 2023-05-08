// imports
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";

// global constants
const myRatingsURL = "https://www.imdb.com/user/ur95934592/ratings";
const watchedInCinemaURL = "https://www.imdb.com/list/ls081360952/";
const apiURL = "https://imdb-api.com/en/API/Title/k_795p7sp0/";
const apiRequestOptions = {
    method: 'GET',
    redirect: 'follow'
};

main();

async function main() {
    const startTime = Date.now();
    /////////////////////////////

    // const filmData = readFilmData();
    // const latestFilms = await getLatestFilms();
    // const updatedFilmData = await getUpdatedFilmData(filmData, latestFilms);
    // writeFilmsToJson(updatedFilmData);

    const pls = await getNumberOfVotes("tt0068646");
    console.log(pls);

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

// gets array of last 100 rated films {"filmID", "myRating", "watchedInCinema"}
async function getLatestFilms() {
    let latestFilms = [];
    let filmIDs = [];

    let response = await fetch(myRatingsURL);
    let body = await response.text();
    let c = cheerio.load(body);

    // iterate through each instance of a film and push film ID to array
    c('.lister-item-image.ribbonize').each(function () {
        filmIDs.push(c(this).attr('data-tconst'));
    });

    // if you are confused by this code check initDB.js for identical code and see comments
    for (let i = 0; i < 100; i++) {
        let myRating = c('span.ipl-rating-star__rating').eq(1 + 24 * (i)).text();
        myRating = parseInt(myRating);
        latestFilms.push({"filmID" : filmIDs[i], "myRating" : myRating, "watchedInCinema" : false});
    }

    let filmsWatchedInCinema = [];
    let url = watchedInCinemaURL;

    while (url !== "") {
        let response = await fetch(watchedInCinemaURL);
        let body = await response.text();
        let c = cheerio.load(body);

        // push filmID to array
        c('.lister-item-image.ribbonize').each(function () {
            filmsWatchedInCinema.push(c(this).attr('data-tconst'));
        })

        // for each rated film, if it is in filmsWatchedInCinema,
        // change watchedInCinema attribute to true
        latestFilms.forEach(film => {
            if (filmsWatchedInCinema.includes(film.filmID)) {
                film.watchedInCinema = true;
            }
        });

        // change url for next iteration
        url = await getNextURL(url);
    }

    return latestFilms;
}

// given current URL, returns the URL of the next page
// returns "" if there is no next page
async function getNextURL(currentURL) {
    const response = await fetch(currentURL);
    const body = await response.text();
    const c = cheerio.load(body);

    let nextURL = c('.flat-button.lister-page-next.next-page').attr('href');

    // if there is no next page then the url attribute will be empty
    if (nextURL === undefined) {
        return "";
    }

    const imdbURL = "https://www.imdb.com"
    nextURL = imdbURL.concat(nextURL);

    return nextURL.toString();
}

// gets metascore of film
async function getMetascore(filmID) {
    const imdbURL = "https://www.imdb.com/title/";
    const url = imdbURL.concat(filmID);

    const response = await fetch(url);
    const body = await response.text();
    const c = cheerio.load(body);

    const metascore = c(".score-meta").text();

    return parseInt(metascore);
}

// gets number of imdb votes of film
async function getNumberOfVotes(filmID) {
    const imdbURL = "https://www.imdb.com/title/";
    const url = imdbURL.concat(filmID);

    const response = await fetch(url);
    const body = await response.text();
    const c = cheerio.load(body);

    // the class id returns 2 instances of the rating, so only the first
    // instance is selected ( hence eq(0) )
    let numberOfVotes = c(".sc-bde20123-3.bjjENQ").eq(0).text();

    if (numberOfVotes.includes("K")) {
        numberOfVotes = numberOfVotes.replace("K", "");
        numberOfVotes = parseFloat(numberOfVotes);
        numberOfVotes *= 1000;
    } else if (numberOfVotes.includes("M")) {
        numberOfVotes = numberOfVotes.replace("M", "");
        numberOfVotes = parseFloat(numberOfVotes);
        numberOfVotes *= 1000000;
    } else {
        numberOfVotes = parseInt(numberOfVotes);
    }

    return numberOfVotes;
}

// gets imdb rating of film
async function getImdbRating(filmID) {
    return 0;
}

// updates the database
async function getUpdatedFilmData(filmData, latestFilms) {
    // for each of the latest films
    for (let i = 0; i < 100; i++) {
        // if the film is already in the database
        const filmIndex = getIndexOfFilm(filmData, latestFilms[i].filmID);
        if (filmIndex !== -1) {
            // update metascore, imdbRating, numberOfVotes, watchedInCinema, myRating
            filmData[filmIndex].metacriticRating = await getMetascore(filmData[filmIndex].filmID);
            filmData[filmIndex].imDbRating = await getImdbRating(filmData[filmIndex].filmID);
            filmData[filmIndex].imDbRatingVotes = await getNumberOfVotes(filmData[filmIndex].filmID);
            filmData[filmIndex].watchedInCinema = latestFilms[i].watchedInCinema;
            filmData[filmIndex].myRating = latestFilms[i].myRating;
        } else {
            const rawFilm = await getRawFilm(latestFilms[i]);
            filmData.push(await getFilteredFilm(rawFilm, latestFilms[i]))
        }
    }
}

// given a pre film object {filmID, myRating, watchedInCinema},
// fetch the full raw film object using the imdb-api
// ~30secs for 100 films
async function getRawFilm(preFilmObject) {
    try {
        const filmURL = apiURL.concat(preFilmObject.filmID);
        const response = await fetch(filmURL, apiRequestOptions);
        return await response.json();
    }
    catch (error) {
        console.error(error);
    }
}

// filters unnecessary data of rawFilm object
// adds myRating and watchedInCinema attribute
function getFilteredFilm(rawFilm, preFilmObject) {
    // deletions
    delete rawFilm.id;
    delete rawFilm.originalTitle;
    delete rawFilm.fullTitle;
    delete rawFilm.image;
    delete rawFilm.releaseDate;
    delete rawFilm.runtimeStr;
    delete rawFilm.plot;
    delete rawFilm.plotLocal;
    delete rawFilm.plotLocalIsRtl;
    delete rawFilm.awards;
    delete rawFilm.directors;
    delete rawFilm.writers;
    delete rawFilm.writerList;
    delete rawFilm.stars;
    delete rawFilm.starList;
    delete rawFilm.fullCast;
    delete rawFilm.genres;
    delete rawFilm.companies;
    delete rawFilm.companyList;
    delete rawFilm.countries;
    delete rawFilm.languages;
    delete rawFilm.contentRating;
    delete rawFilm.ratings;
    delete rawFilm.wikipedia;
    delete rawFilm.posters;
    delete rawFilm.images;
    delete rawFilm.trailer;
    delete rawFilm.tagline;
    delete rawFilm.keywords;
    delete rawFilm.keywordList;
    delete rawFilm.similars;
    delete rawFilm.tvSeriesInfo;
    delete rawFilm.tvEpisodeInfo;
    delete rawFilm.errorMessage;
    delete rawFilm.boxOffice.openingWeekendUSA;
    delete rawFilm.boxOffice.grossUSA;
    delete rawFilm.boxOffice.budget;

    rawFilm.directorList.forEach(director => {
        delete director.id;
    });

    rawFilm.actorList.forEach(actor => {
        delete actor.id;
        delete actor.image;
        delete actor.asCharacter;
    });

    rawFilm.genreList.forEach(genre => {
        delete genre.value;
    });

    rawFilm.countryList.forEach(country => {
        delete country.value;
    });

    rawFilm.languageList.forEach(language => {
        delete language.value;
    });

    // additions
    rawFilm.myRating = preFilmObject.myRating;
    rawFilm.watchedInCinema = preFilmObject.watchedInCinema;

    return rawFilm;
}

// gets the index of a film in the database
// if the film is not in the database, it returns -1
function getIndexOfFilm(filmData, filmID) {
    const len = filmData.length
    let i = 0;

    for (; i < len; i++) {
        if (filmData[i].filmID === filmID) {
            return i;
        }
    }

    return -1;
}

// given array of filtered filmData, write to .json file
// CAUTION: if a filmData.json already exists, the function
// will overwrite it
function writeFilmsToJson(filmData) {
    const stringFilmData = JSON.stringify(filmData, null, 4);

    fs.writeFileSync("data/filmData.json", stringFilmData, (error) => {
        if (error) {
            console.log(error);
            throw error;
        }
    })
}
