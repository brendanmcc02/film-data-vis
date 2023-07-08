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
// {title, id, myRating, numberOfVotes, watchedInCinema, imdbTop25Position, myPosition, franchise}
// ~30 sec runtime
async function getPreFilmObjects(numberOfFilms) {
    let preFilmObjects = [];

    let url = myRatingsURL;
    let ids = [];
    let titles = [];
    let numberOfVotes = [];

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

        // web scrape number of imdb votes
        c('.lister-item-content span[data-value]').each(function () {
            numberOfVotes.push(parseInt(c(this).attr('data-value')));
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
                "numberOfVotes" : numberOfVotes[i], "watchedInCinema" : false, "imdbTop25Position" : -1,
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
        let film = await getFilm(preFilmObjects[i]);

        if (film !== null) {
            filmData.push(film);
        }
    }

    return filmData;
}

async function getFilm(preFilmObject) {
    // initialise film object
    let film = {"id": preFilmObject.id, "title": preFilmObject.title, "year": 0, "image": "",
        "runtime": -1, "directors": [], "actors": [], "genres": [], "countries": [],
        "languages": [], "contentRating": "", "imdbRating": -1, "numberOfVotes": preFilmObject.numberOfVotes,
        "metascore": -1, "myRating": preFilmObject.myRating,
        "watchedInCinema": preFilmObject.watchedInCinema, "imdbTop25Position": preFilmObject.imdbTop25Position,
        "myPosition": preFilmObject.myPosition, "franchise": preFilmObject.franchise
    };

    // get html of page
    const baseTitleUrl = "https://www.imdb.com/title/";
    const titleUrl = baseTitleUrl.concat(film.id)
    const response = await nodeFetch(titleUrl);
    const body = await response.text();
    const c = cheerio.load(body);

    // if the title is tv series, miniseries, or tv special, return null
    if (c(".sc-52d569c6-0.kNzJA-D li").length > 3) {
        return null;
    }
    // else if it's a tv episode
    else if (c(".sc-52d569c6-0.kNzJA-D li").eq(0).text().includes("Episode")) {
        return null;
    }

    // get year
    film.year = parseInt(c(".sc-52d569c6-0.kNzJA-D li").eq(0).text());

    // get content rating
    if (c(".sc-52d569c6-0.kNzJA-D li").length === 3) {
        film.contentRating = c(".sc-52d569c6-0.kNzJA-D li").eq(1).text();
    }
    // edge case for when a film has no content rating
    else {
        film.contentRating = "Not Rated";
    }

    // get runtime
    let runtime = 0;

    if (c(".sc-52d569c6-0.kNzJA-D li").length < 3) {
        runtime = c(".sc-52d569c6-0.kNzJA-D li").eq(1).text();
    } else {
        runtime = c(".sc-52d569c6-0.kNzJA-D li").eq(2).text();
    }

    let runtimes = runtime.split(" ");

    if (runtimes.length === 1) {
        if (runtimes[0].includes("m")) {
            runtimes[0].replace("m","");
            film.runtime = parseInt(runtimes[0]);
        } else {
            runtimes[0].replace("h","");
            film.runtime = parseInt(runtimes[0]) * 60;
        }
    } else {
        runtimes[0].replace("h","");
        runtimes[1].replace("m","");
        runtimes[0] = parseInt(runtimes[0]);
        runtimes[1] = parseInt(runtimes[1]);
        film.runtime = (runtimes[0] * 60) + runtimes[1];
    }

    // get film image
    film.image = c('.sc-385ac629-7.kdyVyZ img').attr('src');

    // get list of directors (try to get image as well?)
    c('.sc-52d569c6-3.jBXsRT li:first-child li').each(function () {
        film.directors.push(c(this).text());
    });

    // TODO fix actorName & image offset (if an actor has no image it messes it up)
    // TODO check TDKR as an example, Sam Kennard has no image

    let actorNames = [];
    let actorImages = [];

    // get list of actors

    // get actor names
    c('.sc-bfec09a1-1.fUguci').each(function () {
        actorNames.push(c(this).text());
    });

    // get actor images
    c('.sc-bfec09a1-6.cRAGvN.title-cast-item__avatar img').each(function () {
        actorImages.push(c(this).attr('src'));
    });

    // combine actor name with their image as an object {"name", "image"}
    // and push this to film.actors
    const len = actorNames.length;
    for (let i = 0; i < len; i++) {
        film.actors.push({"name" : actorNames[i], "image" : actorImages[i]});
    }

    // get list of genres
    c('.ipc-chip.ipc-chip--on-baseAlt').each(function () {
        film.genres.push(c(this).text());
    });

    // get list of countries
    c('.sc-f65f65be-0.fVkLRr[data-testid=title-details-section] ' +
        'li:nth-child(2) li').each(function () {
        film.countries.push(c(this).text());
    });

    // get list of languages
    c('.sc-f65f65be-0.fVkLRr[data-testid=title-details-section] ' +
        'li:nth-child(4) li').each(function () {
        film.languages.push(c(this).text());
    });

    // get imdb rating
    film.imdbRating = parseFloat(c('.sc-bde20123-1.iZlgcd').eq(0).text());

    // get metascore (check updateDB.js)
    let metascore = c(".score-meta").text();
    if (metascore !== '') {
        film.metascore = parseInt(metascore);
    }

    return film;
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
