// this file is intended to run in node.js
// as opposed to a web browser

// module imports
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";

// function exports for updateDB.js
export {getMyRatedFilms, writeToJson, getFilm, getBondFilmTitles, getMcuFilmTitles, writeMetadata};

// constant exports
export {imdbBaseTitleUrl};

// global constants
const myRatingsURL = "https://www.imdb.com/user/ur95934592/ratings";
const watchedInCinemaURL = "https://www.imdb.com/list/ls081360952/";
const imdbBaseTitleUrl = "https://www.imdb.com/title/";
const myTop10URL = "https://www.imdb.com/list/ls048298278/";
const marvelURL = "https://en.wikipedia.org/wiki/List_of_Marvel_Cinematic_Universe_films";
const bondURL = "https://en.wikipedia.org/wiki/List_of_James_Bond_films";

const startTime = Date.now();

main();

// initialises a database of all my rated films on imdb
async function main() {
    console.log("Web scraping my rated films.");
    const myRatedFilms = [{"id" : "tt0468569", "myRating" : 7, "watchedInCinema" : true, "myTop10Position" : -1}]; // for testing
    // const myRatedFilms = await getMyRatedFilms();
    console.log("Web scraping full data for each rated film:");
    const films = await getFilms(myRatedFilms);
    console.log("Writing to filmData.json.");
    writeToJson(films, "data/filmData.json");

    console.log("Writing to metadata.json.");
    writeMetadata("ok", startTime, "", "");
}

// web scrapes my ratings page and returns an array of film objects:
// {id, myRating, watchedInCinema, myTop10Position}
// ~30 sec runtime
async function getMyRatedFilms() {
    let myRatedFilms = [];

    let url = myRatingsURL;

    // continuously iterate through each ratings web page
    for (let f = 0; url !== ""; f+=100) {
        try {
            // get the html
            let response = await nodeFetch(url);
            let body = await response.text();
            let c = cheerio.load(body);

            // for each film
            c('.lister-list .lister-item.mode-detail').each(function () {
                let id = c(this).find('.lister-item-image.ribbonize').attr('data-tconst');

                // error handling - film id
                if (id === undefined) {
                    throwErrorMessage("rated film id unrecognised, css class name may have changed.");
                }

                let myRating = parseInt(c(this).find('.ipl-rating-star.ipl-rating-star--other-user.small ' +
                    '.ipl-rating-star__rating').text());

                // error handling - film myRating
                if (myRating === undefined) {
                    throwErrorMessage("rated film myRating unrecognised, css class name may have changed. " + id);
                }

                myRatedFilms.push({"id" : id, "myRating" : myRating,
                    "watchedInCinema" : false, "myTop10Position" : -1});
            });

            // get url for next iteration.
            url = await getNextURL(url);
        } catch (error) {
            writeMetadata("error", startTime, error.name, error.message);
            throw error;
        }
    }

    // iterate through 'films watched in cinemas' list
    let filmsWatchedInCinemas = [];
    url = watchedInCinemaURL;

    while (url !== "") {
        try {
            // get the html
            let response = await nodeFetch(url);
            let body = await response.text();
            let c = cheerio.load(body);

            // push id to array
            c('.lister-item-image.ribbonize').each(function () {
                let id = c(this).attr('data-tconst');

                if (id !== undefined) {
                    filmsWatchedInCinemas.push(id);
                } else {
                    throwErrorMessage("ID of cinema film is undefined.");
                }

            })

            // change url for next iteration
            url = await getNextURL(url);
        } catch (error) {
            writeMetadata("error", startTime, error.name, error.message);
            throw error;
        }
    }

    // for each rated film, if it is in filmsWatchedInCinema,
    // change watchedInCinema attribute to true
    myRatedFilms.forEach(film => {
        if (filmsWatchedInCinemas.includes(film.id)) {
            film.watchedInCinema = true;
        }
    });

    // iterate through my top 10 films and change the
    // 'myTop10Position' attribute of the corresponding films

    let myTop10Films = [];

    try {
        // get the html
        let response = await nodeFetch(myTop10URL);
        let body = await response.text();
        let c = cheerio.load(body);

        // push id to array
        c('.lister-item-image.ribbonize').each(function () {
            let id = c(this).attr('data-tconst');

            if (id !== undefined) {
                myTop10Films.push(id);
            } else {
                throwErrorMessage("ID of myTop10 film is undefined.");
            }
        });

        // for each film, modify the 'myTop10Position' to the corresponding value
        const len = myTop10Films.length;
        for (let i = 0; i < len; i++) {
            let id = myTop10Films[i];
            let index = getIndexOfId(myRatedFilms, id);
            myRatedFilms[index].myTop10Position = i + 1;
        }

        return myRatedFilms;
    } catch (error) {
        writeMetadata("error", startTime, error.name, error.message);
        throw error;
    }
}

// utility function that gets the index of
// the myRatedFilm with the matching id.
// returns -1 if no match.
function getIndexOfId(myRatedFilms, id) {
    const len = myRatedFilms.length;
    for (let i = 0; i < len; i++) {
        if (myRatedFilms[i].id === id) {
            return i;
        }
    }

    return -1;
}

// given a current URL, returns the URL of the next web page
// returns "" if there is no next page
async function getNextURL(currentURL) {
    try {
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
    } catch (error) {
        writeMetadata("error", startTime, error.name, error.message);
        throw error;
    }

}

// returns array of film objects
// check getFilm() for format.
async function getFilms(myRatedFilms) {
    let films = [];
    const len = myRatedFilms.length;
    const lenStr = len.toString();

    try {
        const bondFilmTitles = await getBondFilmTitles();
        const mcuFilmTitles = await getMcuFilmTitles();

        for (let i = 0; i < len; i++) {
            console.log("Scraping film: " + (i + 1).toString() + " / " + lenStr);
            let film = await getFilm(myRatedFilms[i], bondFilmTitles, mcuFilmTitles);

            // error handling - getFilm() return type
            if (film === undefined) {
                throwErrorMessage("getFilm() return type is undefined.");
            }
            // if it is a feature film, push to films array.
            else if (film !== "not a feature film") {
                films.push(film);
            }
        }
        
        return films;
    } catch (error) {
        writeMetadata("error", startTime, error.name, error.message);
        throw error;
    }
}

// returns a film object:
// {title, id, year, myRating, imdbRating, metascore, image, runtime, directors, actors, genres, countries,
// languages, contentRating, watchedInCinema, myTop10Position, franchise}
async function getFilm(myRatedFilm, bondFilmTitles, mcuFilmTitles) {
    // initialise film object
    let film = {"title": "", "id": myRatedFilm.id, "year": 0,  "myRating": myRatedFilm.myRating,
        "imdbRating": -1.0, "metascore": -1, "image": "", "runtime": -1, "directors": [], "actors": [],
        "genres": [], "countries": [], "languages": [], "contentRating": "",
        "watchedInCinema": myRatedFilm.watchedInCinema,
        "myTop10Position": myRatedFilm.myTop10Position, "franchise": ""
    };

    try {
        // get html of page
        const titleUrl = imdbBaseTitleUrl.concat(myRatedFilm.id)
        let response = await nodeFetch(titleUrl);
        let body = await response.text();
        let c = cheerio.load(body);

        // if the title is tv series, miniseries, or tv special, return "not a feature film"

        let selector = 'ul.ipc-inline-list.ipc-inline-list--show-dividers.baseAlt[role=presentation]:nth-child(2) li.ipc-inline-list__item';

        if (c(selector).length > 3) {
            return "not a feature film";
        }
        // else if it's a tv episode, also return "not a feature film"
        else if (c(selector).eq(0).text().includes("Episode")) {
            return "not a feature film";
        }
        // else if the html tag is not being read, throw an error
        else if (c(selector).length === 0) {
            throwErrorMessage("\'year-contentRating-runtime\' html tag is outdated, or html page has been updated. " +
                            myRatedFilm.id);
        }

        // get genres

        // error handling - film genres
        if (c('.ipc-chip.ipc-chip--on-baseAlt').length === 0) {
            throwErrorMessage("film genres are not being recognised. also possible the film has no genres. " +
                            myRatedFilm.id);
        }

        c('.ipc-chip.ipc-chip--on-baseAlt').each(function () {
            film.genres.push(c(this).text());
        });

        if (film.genres.includes("Short") || film.genres.includes("Documentary")) {
            return "not a feature film";
        }

        // get title
        let title = c('h1[data-testid=hero__pageTitle]').text();

        if (title === undefined) {
            throwErrorMessage("film title not recognised. css class name possibly updated. " + film.id);
        }

        film.title = title;

        // get year

        let year = parseInt(c(selector).eq(0).text());

        if (year === undefined) {
            throwErrorMessage("film year not recognised. css class name possibly updated. " + film.id);
        }

        film.year = year;

        // get content rating

        if (c(selector).length === 3) {
            film.contentRating = c(selector).eq(1).text();
        }
        // error handling - film content rating
        else if (c(selector).length === 0) {
            throwErrorMessage("film content rating not recognised. css class name possibly updated. " + film.id);
        }
        // edge case for when a film has no content rating
        else {
            film.contentRating = "Not Rated";
        }

        // simplify edge cases for content ratings
        switch (film.contentRating) {
            case "12":
                film.contentRating = "12A";
                break;
            case "15":
                film.contentRating = "15A";
                break;
            case "PG-13":
                film.contentRating = "PG";
                break;
            case "Approved":
                film.contentRating = "Not Rated";
                break;
            case "Passed":
                film.contentRating = "Not Rated";
                break;
            case "TV-G":
                film.contentRating = "G";
                break;
            case "TV-PG":
                film.contentRating = "PG";
                break;
            case "TV-14":
                film.contentRating = "15A";
                break;
            case "TV-MA":
                film.contentRating = "18";
                break;
            case "R":
                film.contentRating = "18";
                break;
        }

        // if the content rating still dodges edge cases, set it as "Not Rated"
        const irishRatings = ["Not Rated", "G", "PG", "12A", "15A", "16", "18"];
        if (!irishRatings.includes(film.contentRating)) {
            film.contentRating = "Not Rated";
        }

        // get runtime
        let runtime;

        if (c(selector).length < 3) {
            runtime = c(selector).eq(1).text();
        }
        // else, the film has a content rating, and the runtime will be at index 2
        else {
            runtime = c(selector).eq(2).text();
        }

        // converting runtime to minutes
        // e.g. 2h 32m => 152
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
        selector = '.ipc-media.ipc-media--baseAlt.ipc-media--poster-l.ipc-poster__poster-image.ipc-media__img';

        let image = c(selector + ' img').attr('src');

        if (image === undefined) {
            throwErrorMessage("film image not recognised. css class name possibly updated. " + film.id);
        }

        film.image = image;

        // get actors

        // error handling - actors

        selector = '.ipc-sub-grid--wraps-at-above-l div[data-testid=title-cast-item]';

        if (c(selector).length === 0) {
            throwErrorMessage("film actors not recognised. css class name was updated, or the film has no star cast. " +
                             film.id);
        }

        c(selector).each(function () {
            let actorName = c(this).find('div:nth-child(2) a[data-testid=title-cast-item__actor]').text();

            // error handling - actor name
            if (actorName === undefined) {
                throwErrorMessage("actor name not recognised. css class name possibly updated.")
            }

            let actorImage = c(this).find('div:nth-child(1) img').attr('src');

            // it's possible the actor has no image, not an error.
            if (actorImage === undefined) {
                actorImage = "";
            }

            film.actors.push({"name" : actorName, "image" : actorImage});
        });

        // get countries

        // error handling - countries

        if (c('li[data-testid=title-details-origin] li').length === 0) {
            throwErrorMessage("film has no countries. html tag possibly updated, " +
                "or maybe the film has no countries, check imdb. " + film.id);
        }

        c('li[data-testid=title-details-origin] li').each(function () {
            film.countries.push(c(this).text());
        });

        // get languages

        // error handling - languages

        if (c('li[data-testid=title-details-languages] li').length === 0) {
            throwErrorMessage("film has no languages. html tag possibly updated, " +
                "or maybe the film has no spoken languages. check imdb. " + film.id);
        }

        c('li[data-testid=title-details-languages] li').each(function () {
            film.languages.push(c(this).text());
        });

        // get imdb rating

        // error handling - imdbRating
        let imdbRating = c('div[data-testid=hero-rating-bar__aggregate-rating__score]').first().find('span:nth-child(1)').text();

        if (imdbRating === '') {
            throwErrorMessage("imdb rating not recognised. css class name possibly changed. " + film.id);
        }

        film.imdbRating = parseFloat(imdbRating);

        // get metascore
        let metascore = c(".score-meta").text();
        if (metascore !== '') {
            film.metascore = parseInt(metascore);
        }

        // get franchise

        // james bond
        const bondLen = bondFilmTitles.length;
        for (let i = 0; i < bondLen && film.franchise === ""; i++) {
            if (bondFilmTitles[i] === film.title) {
                film.franchise = "James Bond";
            }
        }

        // mcu
        const mcuLen = mcuFilmTitles.length;
        for (let i = 0; i < mcuLen && film.franchise === ""; i++) {
            if (mcuFilmTitles[i] === film.title) {
                film.franchise = "MCU";
            }
        }

        // get directors

        // full list of directors is on another URL
        let fullCreditsURL = titleUrl.concat("/fullcredits")

        // get html
        response = await nodeFetch(fullCreditsURL);
        body = await response.text();
        c = cheerio.load(body);

        // error handling - directors
        if (c('table:first td.name a').length === 0) {
            throwErrorMessage("no directors recognised. html possibly changed, " +
                "or maybe film has no directors. check imdb: " + film.id);
        }

        // for each director
        c('table:first td.name a').each(function () {
            film.directors.push(c(this).text());
        });

        // the text in the tag is in the form: " DIRECTOR NAME\n",
        // so the \n and the initial space needs to be removed
        const directorLen = film.directors.length;
        for (let i = 0; i < directorLen; i++) {
            film.directors[i] = film.directors[i].replace("\n", "");
            film.directors[i] = film.directors[i].replace(" ", "");
        }

        return film;
    } catch (error) {
        writeMetadata("error", startTime, error.name, error.message);
        throw error;
    }
}

// returns an array of the titles of bond films
// (web scrapes from wikipedia page)
async function getBondFilmTitles() {

    let bondFilmTitles = [];

    try {
        // get the html
        const response = await nodeFetch(bondURL);
        const body = await response.text();
        const c = cheerio.load(body);

        // initial error handling
        if (c('table:first th[scope="row"]').length === 0) {
            throwErrorMessage("James Bond films wiki html possibly changed. check wiki html.");
        }

        c('table:first th[scope="row"]').each(function () {
            // get the title of the bond film
            let title = c(this).text();
            title = title.replace("\n", "");

            bondFilmTitles.push(title);
        });

        return bondFilmTitles;
    } catch (error) {
        writeMetadata("error", startTime, error.name, error.message);
        throw error;
    }

}

// returns an array of the titles of mcu films
// (web scrapes from wikipedia page)
async function getMcuFilmTitles() {

    let mcuFilmTitles = [];

    try {
        // get html
        const response = await nodeFetch(marvelURL);
        const body = await response.text();
        const c = cheerio.load(body);

        // initial error handling
        if (c('.wikitable.plainrowheaders.defaultcenter.col2left tr th[scope="row"]').length === 0) {
            throwErrorMessage("MCU films wiki html possibly changed. check wiki html.");
        }

        // get mcu films and change the franchise attribute of all mcu films in the database
        // web scrape each entry in wiki page
        c('.wikitable.plainrowheaders.defaultcenter.col2left tr th[scope="row"]').each(function () {
            // get the title of the mcu film
            let title = c(this).text();
            title = title.replace("\n", "");
            mcuFilmTitles.push(title);
        });

        return mcuFilmTitles;
    } catch (error) {
        writeMetadata("error", startTime, error.name, error.message);
        throw error;
    }
}

// writes data to a .json file
function writeToJson(data, filepath) {
    const stringData = JSON.stringify(data, null, 4);

    fs.writeFileSync(filepath, stringData, (error) => {
        if (error) {
            console.log(error);
            throw error;
        }
    });
}

// returns string in the form: 'time day dd/mm/yyy'
// e.g. 13:18 Wednesday 19/7/2023
function getTimestamp() {
    const date = new Date();
    let day = date.getDay();

    switch (day) {
        case 0:
            day = "Sunday";
            break;
        case 1:
            day = "Monday";
            break;
        case 2:
            day = "Tuesday";
            break;
        case 3:
            day = "Wednesday";
            break;
        case 4:
            day = "Thursday";
            break;
        case 5:
            day = "Friday";
            break;
        case 6:
            day = "Saturday";
            break;
        default:
            day = "unknown_day";
            break;
    }

    return date.getHours().toString() + ":" + date.getMinutes().toString() + " " + day + " " +
        date.getDate() + "/" + (date.getMonth() + 1).toString() + "/" + date.getFullYear();
}

// writes metadata.json file
function writeMetadata(status, startTime, errorName, errorMessage) {
    const runtime = getRuntime(startTime);

    const metadata = {"status": status, "lastWrite": getTimestamp(), "runtime": runtime, "errorName" : errorName, "errorMessage": errorMessage};

    writeToJson(metadata, "data/metadata.json");
}

// returns the runtime, e.g: "10 minutes 40 seconds"
function getRuntime(startTime) {
    const endTime = Date.now();
    let runtime = (endTime - startTime) / 1000;
    const minutes = Math.floor(runtime/60);
    const seconds = runtime % 60;
    return minutes.toString() + " minutes " + Math.round(seconds).toString() + " seconds";
}

// custom function that throws an error message.
// this was created to solve an error: "throw of exception was caught locally".
// solution is a bit dumb, but it means I don't get an error message from webstorm
// so, I don't really care.
function throwErrorMessage(errorMessage) {
    throw new Error(errorMessage);
}
