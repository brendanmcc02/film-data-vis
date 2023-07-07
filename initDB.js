// this file is intended to run in node.js
// as opposed to a web browser

// module imports
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";

// function exports for updateDB.js
export {getPreFilmObjects, writeFilmsToJson,  getNextURL, getNumberOfRatedFilms};

// global constants
const myRatingsURL = "https://www.imdb.com/user/ur95934592/ratings";
const watchedInCinemaURL = "https://www.imdb.com/list/ls081360952/";
const imdbTop250URL = "https://www.imdb.com/chart/top";
const myTop10URL = "https://www.imdb.com/list/ls048298278/";
const marvelURL = "https://en.wikipedia.org/wiki/List_of_Marvel_Cinematic_Universe_films";
const bondURL = "https://en.wikipedia.org/wiki/List_of_James_Bond_films";
const apiRequestOptions = {
    method: 'GET',
    redirect: 'follow'
};

main();

// initialises a database of all my rated films on imdb
async function main() {
    const startTime = Date.now();
    /////////////////////////////

    const numberOfFilms = await getNumberOfRatedFilms();
    const preFilmObjects = await getPreFilmObjects(numberOfFilms);
    const filmData = await getFilmData(preFilmObjects, numberOfFilms);
    writeFilmsToJson(filmData);

    ///////////////////////////
    const endTime = Date.now();
    const runTime = (endTime - startTime) / 1000.0;
    console.log("\nRuntime: " + runTime.toFixed(2) + " seconds");
}

// web scrapes my imdb ratings page
// returns array of preFilmObjects:
// {title, id, myRating, watchedInCinema, imdbTop25Position, myPosition, franchise}
// ~30 sec runtime
async function getPreFilmObjects(numberOfFilms) {
    let preFilmObjects = [];

    let url = myRatingsURL;
    let ids = [];
    let titles = [];

    // continuously iterate through each ratings web page
    for (let f = 0; url !== ""; f+=100) {
        // get the html
        let response = await nodeFetch(url);
        let body = await response.text();
        let c = cheerio.load(body);

        // iterate through each instance of a film; push film ID to array
        c('.lister-item-image.ribbonize').each(function () {
            ids.push(c(this).attr('data-tconst'));
        });

        // web scrape all film titles
        c('.lister-item-header a').each(function () {
            titles.push(c(this).text());
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
            preFilmObjects.push({"id" : ids[i], "title" : titles[i], "myRating" : myRating,
                "watchedInCinema" : false, "imdbTop25Position" : -1,
                "myPosition" : -1, "franchise" : ""});
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

    // iterate through my top 10 films and change the
    // 'myPosition' attribute of the corresponding films

    let myTop10Films = [];

    // get the html
    response = await nodeFetch(myTop10URL);
    body = await response.text();
    c = cheerio.load(body);

    // push id to array
    c('.lister-item-image.ribbonize').each(function () {
        myTop10Films.push(c(this).attr('data-tconst'));
    });

    // for each film, modify the 'myPosition' to the corresponding value
    const len = myTop10Films.length;
    for (let i = 0; i < len; i++) {
        let id = myTop10Films[i];
        let index = getIndexOfId(preFilmObjects, id);
        preFilmObjects[index].myPosition = i + 1;
    }

    // franchises
    // MCU

    // get the html
    response = await nodeFetch(marvelURL);
    body = await response.text();
    c = cheerio.load(body);

    // get mcu films and change the franchise attribute of all mcu films in the database
    // web scrape each entry in wiki page
    c('.wikitable.plainrowheaders.defaultcenter.col2left tr th[scope="row"]').each(function () {
        // get the title of the mcu film
        let title = c(this).text();
        title = title.replace("\n", "");
        const len = preFilmObjects.length;

        // find the mcu film in preFilmObjects,
        // if there, change 'franchise' attribute to "MCU"
        for (let i = 0; i < len; i++) {
            if (preFilmObjects[i].title === title) {
                preFilmObjects[i].franchise = "MCU";
                i = len; // break
            }
        }
    });

    // James Bond

    // get the html
    response = await nodeFetch(bondURL);
    body = await response.text();
    c = cheerio.load(body);

    c('table:first th[scope="row"]').each(function () {
        // get the title of the bond film
        let title = c(this).text();
        title = title.replace("\n", "");
        const len = preFilmObjects.length;

        // find the bond film in preFilmObjects,
        // if there, change 'franchise' attribute to "James Bond"
        for (let i = 0; i < len; i++) {
            if (preFilmObjects[i].title === title) {
                preFilmObjects[i].franchise = "James Bond";
                i = len; // break
            }
        }
    });

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

// returns clean array of filmData objects
async function getFilmData(preFilmObjects) {
    let filmData = [];
    const len = preFilmObjects.length;

    for (let i = 0; i < len; i++) {
        let film = await getFilmData(getFilm(preFilmObjects[i]));

        if (film !== null) {
            filmData.push(film);
        }
    }

    return filmData;
}

async function getFilm(preFilmObject) {
    // initialise film object
    let film = {"id": preFilmObject.id, "title": preFilmObject.title, "year": 0, "image": "",
        "runtimeMins": -1, "directorList": [], "actorList": [], "genreList": [], "countryList": [],
        "languageList": [], "contentRating": "", "imDbRating": -1, "imDbRatingVotes": -1,
        "metacriticRating": -1, "myRating": preFilmObject.myRating,
        "watchedInCinema": preFilmObject.watchedInCinema, "imdbTop25Position": preFilmObject.imdbTop25Position,
        "myPosition": preFilmObject.myPosition, "franchise": preFilmObject.franchise
    };

    // get html of page
    const baseTitleUrl = "https://www.imdb.com/title/";
    const titleUrl = baseTitleUrl.concat(film.id)
    const response = await nodeFetch(titleUrl);
    const body = await response.text();
    const c = cheerio.load(body);

    // get year

    // get film image

    // get runtime

    // get list of directors (try get image as well?)

    // get list of actors {"name", "image"}

    // get list of genres

    // get list of countries

    // get list of languages

    // get content rating

    // get imdb rating

    // get number of imdb votes

    // get metacritic (check updatedb.js)

    return film;
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
