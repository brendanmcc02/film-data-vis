// this file is intended to run in node.js
// as opposed to a web browser

// module imports
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";

// function exports for updateDB.js
export {getMyRatedFilms, writeFilmsToJson, getNextURL};

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

    const myRatedFilms = await getMyRatedFilms();
    // const myRatedFilms = [{"id": "tt11564570", "myRating": 6, "watchedInCinema": false,
    //     "imdbTop25Position": -1, "myTop10Position": -1}];
    const films = await getFilms(myRatedFilms);
    writeFilmsToJson(films);

    ///////////////////////////
    const endTime = Date.now();
    const runTime = (endTime - startTime) / 1000.0;
    console.log("\nRuntime: " + runTime.toFixed(2) + " seconds");
}

// web scrapes my ratings page and returns an array of film objects:
// {id, myRating, watchedInCinema, imdbTop25Position, myTop10Position}
// ~30 sec runtime
async function getMyRatedFilms() {
    let myRatedFilms = [];

    let url = myRatingsURL;

    // continuously iterate through each ratings web page
    for (let f = 0; url !== ""; f+=100) {
        // get the html
        let response = await nodeFetch(url);
        let body = await response.text();
        let c = cheerio.load(body);

        // for each film
        c('.lister-list .lister-item.mode-detail').each(function () {
            let id = c(this).find('.lister-item-image.ribbonize').attr('data-tconst');
            let myRating = c(this).find('.ipl-rating-star.ipl-rating-star--other-user.small ' +
                '.ipl-rating-star__rating').text();
            myRatedFilms.push({"id" : id, "myRating" : myRating, "watchedInCinema" : false,
                "imdbTop25Position" : -1, "myTop10Position" : -1});
        });

        // get url for next iteration
        url = await getNextURL(url);
    }

    // iterate through 'films watched in cinemas' list
    let filmsWatchedInCinemas = [];
    url = watchedInCinemaURL;

    while (url !== "") {
        // get the html
        let response = await nodeFetch(url);
        let body = await response.text();
        let c = cheerio.load(body);

        // push id to array
        c('.lister-item-image.ribbonize').each(function () {
            filmsWatchedInCinemas.push(c(this).attr('data-tconst'));
        })

        // change url for next iteration
        url = await getNextURL(url);
    }

    // for each rated film, if it is in filmsWatchedInCinema,
    // change watchedInCinema attribute to true
    myRatedFilms.forEach(film => {
        if (filmsWatchedInCinemas.includes(film.id)) {
            film.watchedInCinema = true;
        }
    });

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
        let index = getIndexOfId(myRatedFilms, id);
        if (index !== -1) {
            myRatedFilms[index].imdbTop25Position = position;
            position++;
        }
    }

    // iterate through my top 10 films and change the
    // 'myTop10Position' attribute of the corresponding films

    let myTop10Films = [];

    // get the html
    response = await nodeFetch(myTop10URL);
    body = await response.text();
    c = cheerio.load(body);

    // push id to array
    c('.lister-item-image.ribbonize').each(function () {
        myTop10Films.push(c(this).attr('data-tconst'));
    });

    // for each film, modify the 'myTop10Position' to the corresponding value
    const len = myTop10Films.length;
    for (let i = 0; i < len; i++) {
        let id = myTop10Films[i];
        let index = getIndexOfId(myRatedFilms, id);
        myRatedFilms[index].myTop10Position = i + 1;
    }

    return myRatedFilms;
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

// returns array of film objects
// check getFilm() for format.
async function getFilms(myRatedFilms) {
    let films = [];
    const len = myRatedFilms.length;
    const bondFilmTitles = await getBondFilmTitles();
    const mcuFilmTitles = await getMcuFilmTitles();

    for (let i = 0; i < len; i++) {
        let film = await getFilm(myRatedFilms[i], bondFilmTitles, mcuFilmTitles);

        if (film !== null) {
            films.push(film);
        }
    }


    return films;
}

// returns a film object:
// {title, year, myRating, imdbRating, metascore, image, runtime, directors, actors, genres, countries,
// languages, contentRating, watchedInCinema, imdbTop25Position, myTop10Position, franchise}
async function getFilm(myRatedFilm, bondFilmTitles, mcuFilmTitles) {
    // initialise film object
    let film = {"title": "", "year": 0,  "myRating": myRatedFilm.myRating, "imdbRating": -1.0,
        "metascore": -1, "image": "", "runtime": -1, "directors": [], "actors": [],
        "genres": [], "countries": [], "languages": [], "contentRating": "",
        "watchedInCinema": myRatedFilm.watchedInCinema, "imdbTop25Position": myRatedFilm.imdbTop25Position,
        "myTop10Position": myRatedFilm.myTop10Position, "franchise": ""
    };

    // get html of page
    const baseTitleUrl = "https://www.imdb.com/title/";
    const titleUrl = baseTitleUrl.concat(myRatedFilm.id)
    let response = await nodeFetch(titleUrl);
    let body = await response.text();
    let c = cheerio.load(body);

    // if the title is tv series, miniseries, or tv special, return null
    if (c(".sc-52d569c6-0.kNzJA-D li").length > 3) {
        return null;
    }
    // else if it's a tv episode
    else if (c(".sc-52d569c6-0.kNzJA-D li").eq(0).text().includes("Episode")) {
        return null;
    }

    // get title
    film.title = c('.sc-afe43def-1.fDTGTb').text();

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

    // get actors
    c('.sc-bfec09a1-5.kUzsHJ').each(function () {
        let actorName = c(this).find('.sc-bfec09a1-1.fUguci').text();
        let actorImage = c(this).find('.sc-bfec09a1-6.cRAGvN.title-cast-item__avatar img').attr('src');
        if (actorImage === undefined) {
            actorImage = "";
        }

        film.actors.push({"name" : actorName, "image" : actorImage});
    })

    // get genres
    c('.ipc-chip.ipc-chip--on-baseAlt').each(function () {
        film.genres.push(c(this).text());
    });

    // get countries
    c('.sc-f65f65be-0.fVkLRr[data-testid=title-details-section] ' +
        'li:nth-child(2) li').each(function () {
        film.countries.push(c(this).text());
    });

    // get languages
    c('.sc-f65f65be-0.fVkLRr[data-testid=title-details-section] ' +
        'li:nth-child(4) li').each(function () {
        film.languages.push(c(this).text());
    });

    // get imdb rating
    film.imdbRating = parseFloat(c('.sc-bde20123-1.iZlgcd').eq(0).text());

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

    return film;
}

async function getBondFilmTitles() {

    let bondFilmTitles = [];

    // get the html
    const response = await nodeFetch(bondURL);
    const body = await response.text();
    const c = cheerio.load(body);

    c('table:first th[scope="row"]').each(function () {
        // get the title of the bond film
        let title = c(this).text();
        title = title.replace("\n", "");

        bondFilmTitles.push(title);
    });

    return bondFilmTitles;
}

async function getMcuFilmTitles() {

    let mcuFilmTitles = [];

    // get html
    const response = await nodeFetch(marvelURL);
    const body = await response.text();
    const c = cheerio.load(body);

    // get mcu films and change the franchise attribute of all mcu films in the database
    // web scrape each entry in wiki page
    c('.wikitable.plainrowheaders.defaultcenter.col2left tr th[scope="row"]').each(function () {
        // get the title of the mcu film
        let title = c(this).text();
        title = title.replace("\n", "");
        mcuFilmTitles.push(title);
    });

    return mcuFilmTitles;
}


// writes filmData array to a .json file
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
