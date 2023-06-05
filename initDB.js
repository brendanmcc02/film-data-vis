// this file is intended to run in node.js
// as opposed to a web browser

// api keys:
// k_795p7sp0 outlook

// module imports
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";

// function exports for updateDB.js
export {getPreFilmObjects, writeFilmsToJson, getFilteredFilm, getRawFilm, getNextURL, getNumberOfRatedFilms};

// global constants
const myRatingsURL = "https://www.imdb.com/user/ur95934592/ratings";
const watchedInCinemaURL = "https://www.imdb.com/list/ls081360952/";
const imdbTop250URL = "https://www.imdb.com/chart/top";
const myTop25URL = "https://www.imdb.com/list/ls048298278/";
const apiURL = "https://imdb-api.com/en/API/Title/k_795p7sp0/";
const apiRequestOptions = {
    method: 'GET',
    redirect: 'follow'
};

main();

// api is limited to 100 calls/24hrs,
// so this function creates a filmData.json with 100 films.
// this has to be called multiple times (manually appending the filmData.json together),
// until all my rated films have been added to the database.
// the startIndex is the index of the array at which the api calls start.
// the getRawFilms() method will only call 100 films
async function main() {
    const startTime = Date.now();
    /////////////////////////////

    // ~11:55 5th June k_795p7sp0
    // ~16:25 31st May k_xg3u88nc
    const startIndex = 100;
    const numberOfFilms = await getNumberOfRatedFilms();
    const preFilmObjects = await getPreFilmObjects(numberOfFilms);
    const rawFilms = await getRawFilms(preFilmObjects, startIndex, numberOfFilms);
    const filmData = getFilmData(rawFilms, startIndex, preFilmObjects, numberOfFilms);
    writeFilmsToJson(filmData);

    ///////////////////////////
    const endTime = Date.now();
    const runTime = (endTime - startTime) / 1000.0;
    console.log("\nRuntime: " + runTime.toFixed(2) + " seconds");
}

// web scrapes my imdb ratings page
// returns array of preFilmObjects:
// {id, myRating, watchedInCinema imdbTop25Position, myPosition}
// ~30 sec runtime
async function getPreFilmObjects(numberOfFilms) {
    let preFilmObjects = [];

    let url = myRatingsURL;
    let ids = [];

    // continuously iterate through each ratings web page
    for (let f = 0; url !== ""; f+=100) {
        // get the html
        let response = await nodeFetch(url);
        let body = await response.text();
        let c = cheerio.load(body);

        // iterate through each instance of a film and push film ID to array
        c('.lister-item-image.ribbonize').each(function () {
            ids.push(c(this).attr('data-tconst'));
        });

        // get corresponding myRating of each film
        // ok this was an ugly solution but for some reason I can't get direct access to
        // the rating attribute of each film, so I had to get all the span tags
        // with a certain name ("ipl-rating-star__rating"), - there are 24 of these for
        // each film, and the 2nd one (index 1, hence the + 1 you see below) is my rating
        // of the film. I hope future Brendan understands this, I apologise for the awful
        // solution, but it works =)
        let min = Math.min(f + 100, numberOfFilms);
        for (let i = f; i < min; i++) {
            let myRating = c('span.ipl-rating-star__rating').eq(1 + 24 * (i-f)).text();
            myRating = parseInt(myRating);
            preFilmObjects.push({"id" : ids[i], "myRating" : myRating,
                "watchedInCinema" : false, "imdbTop25Position" : -1,
                "myPosition" : -1});
        }

        // get url for next iteration
        url = await getNextURL(url);
    }

    // iterate through films watched in cinemas and
    // change 'watchedInCinema' attribute of relevant films
    let filmsWatchedInCinemas = [];
    url = watchedInCinemaURL;

    // continuously iterate through each web page of
    // the 'films watched in cinema' list
    while (url !== "") {
        // get the html
        let response = await nodeFetch(watchedInCinemaURL);
        let body = await response.text();
        let c = cheerio.load(body);

        // push id to array
        c('.lister-item-image.ribbonize').each(function () {
            filmsWatchedInCinemas.push(c(this).attr('data-tconst'));
        })

        // for each rated film, if it is in filmsWatchedInCinema,
        // change watchedInCinema attribute to true
        preFilmObjects.forEach(film => {
            if (filmsWatchedInCinemas.includes(film.id)) {
                film.watchedInCinema = true;
            }
        });

        // change url for next iteration
        url = await getNextURL(url);
    }

    // iterate through imdb top 250 films,
    // and change the position attribute of the
    // first 25 films that I've rated

    // get the html
    let response = await nodeFetch(imdbTop250URL);
    let body = await response.text();
    let c = cheerio.load(body);

    let position = 1;
    for (let i = 0; i < 250 && position <= 25; i++) {
        let id = c('.wlb_ribbon').eq(i).attr('data-tconst');
        let index = getIndexOfId(preFilmObjects, id);
        if (index !== -1) {
            preFilmObjects[index].imdbTop25Position = position;
            position++;
        }
    }

    // iterate through my top 25 films and change the
    // 'myPosition' attribute of the corresponding films

    let myTop25Films = [];

    // get the html
    response = await nodeFetch(myTop25URL);
    body = await response.text();
    c = cheerio.load(body);

    // push id to array
    c('.lister-item-image.ribbonize').each(function () {
        myTop25Films.push(c(this).attr('data-tconst'));
    });

    // for each film, modify the 'myPosition' to the corresponding value
    const len = myTop25Films.length;
    for (let i = 0; i < len; i++) {
        let id = myTop25Films[i];
        let index = getIndexOfId(preFilmObjects, id);
        preFilmObjects[index].myPosition = i + 1;
    }

    return preFilmObjects;
}

// utility function that gets the index of
// the preFilmObject with the matching id.
// returns -1 if no match.
function getIndexOfId(preFilmObjects, id) {
    const len = preFilmObjects.length;
    for (let i = 0; i < len; i++) {
        if (preFilmObjects[i].id === id) {
            return i;
        }
    }

    return -1;
}

// given a current URL, returns the URL of the next web page
// returns "" if there is no next page
async function getNextURL(currentURL) {
    // get html of page
    const response = await nodeFetch(currentURL);
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

// returns number of films rated on my account
async function getNumberOfRatedFilms() {
    // get html
    const response = await nodeFetch(myRatingsURL);
    const body = await response.text();
    const c = cheerio.load(body);

    let numberOfRatedFilms = c(".lister-list-length span").text();

    return parseInt(numberOfRatedFilms);
}

// iterates through 100 pre film objects {id, myRating, watchedInCinema},
// and returns an array of 100 raw film objects.
// (only does 100 films because api is limited to 100/24hrs)
// a raw film is the initial return value from the imdb api, it is called
// 'raw' because it has a lot of junk/unnecessary data that will go through
// a filter function
async function getRawFilms(preFilmObjects, startIndex, numberOfFilms) {
    let rawFilms = [];

    const min = Math.min(startIndex + 100, numberOfFilms);
    for (let i = startIndex; i < min; i++) {
        rawFilms.push(await getRawFilm(preFilmObjects[i]));
    }

    return rawFilms;
}

// given a pre film object {id, myRating, watchedInCinema},
// fetch the full raw film object using the imdb-api
// ~30secs for 100 films
async function getRawFilm(preFilmObject) {
    try {
        const filmURL = apiURL.concat(preFilmObject.id);
        const response = await nodeFetch(filmURL, apiRequestOptions);
        return await response.json();
    }
    catch (error) {
        console.error(error);
    }
}

// returns clean array of filmData objects
function getFilmData(rawFilms, startIndex, preFilmObjects, numberOfFilms) {
    let filmData = [];

    const min = Math.min(numberOfFilms - startIndex, 100);
    for (let i = 0; i < min; i++) {
        // if the film is a movie and not a short
        if (rawFilms[i].type === "Movie" && !arrayObjectContains(rawFilms[i].genreList, "Short")) {
            // filter unnecessary data and push that to filmData[]
            filmData.push(getFilteredFilm(rawFilms[i], preFilmObjects[i + startIndex]));
        }
    }

    return filmData;
}

// utility function that iterates through an array of objects,
// returning true if target value is found
function arrayObjectContains(arrayOfObjects, target) {
    arrayOfObjects.forEach(element => {
        if (Object.values(element).includes(target)) {
            return true;
        }
    });

    return false;
}

// filters unnecessary data of rawFilm object
// adds myRating and watchedInCinema attribute
function getFilteredFilm(rawFilm, preFilmObject) {
    // deletions
    delete rawFilm.originalTitle;
    delete rawFilm.fullTitle;
    delete rawFilm.type;
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
    delete rawFilm.boxOffice;

    rawFilm.directorList.forEach(director => {
       delete director.id;
    });

    rawFilm.actorList.forEach(actor => {
        delete actor.asCharacter;
        delete actor.id
    });

    rawFilm.genreList.forEach(genre => {
        delete genre.value;
    });

    rawFilm.languageList.forEach(language => {
        delete language.value;
    });

    rawFilm.countryList.forEach(country => {
        delete country.value;
    });

    // each element in directorList is an object with
    // (after the deletions) only one attribute: name.
    // we will simplify directorList by creating an array
    // of strings, the director names.
    let directors = [];
    rawFilm.directorList.forEach(director => {
        directors.push(director.name);
    });
    rawFilm.directorList = directors;

    // same as above but with genreList
    let genres = [];
    rawFilm.genreList.forEach(genre => {
        genres.push(genre.key);
    });
    rawFilm.genreList = genres;

    // same as above but with languageList
    let languages = [];
    rawFilm.languageList.forEach(language => {
        languages.push(language.key);
    });
    rawFilm.languageList = languages;

    // same as above but with countryList
    let countries = [];
    rawFilm.countryList.forEach(country => {
        countries.push(country.key);
    });
    rawFilm.countryList = countries;

    // changing strings to integers/floats
    rawFilm.year = parseInt(rawFilm.year);
    rawFilm.runtimeMins = parseInt(rawFilm.runtimeMins);
    rawFilm.imDbRating = parseFloat(rawFilm.imDbRating);
    rawFilm.imDbRatingVotes = parseFloat(rawFilm.imDbRatingVotes);
    rawFilm.metacriticRating = parseInt(rawFilm.metacriticRating);

    // adding attributes to the film object
    rawFilm.myRating = preFilmObject.myRating;
    rawFilm.watchedInCinema = preFilmObject.watchedInCinema;
    rawFilm.imdbTop25Position = preFilmObject.imdbTop25Position;
    rawFilm.myPosition = preFilmObject.myPosition;

    return rawFilm;
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
