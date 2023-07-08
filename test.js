// get the html
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

main();

async function main() {
    let preFilmObject = {"title" : "Paddington 2", "id" : "tt4468740", "myRating" : 8, "numberOfVotes" : 86000,
        "watchedInCinema" : false, "imdbTop25Position" : -1, "myPosition" : -1, "franchise" : ""};

    const film = await getFilm(preFilmObject);

    console.log(film);
}

// returns null if the preFilmObject is not a film (e.g. tv series)
async function getFilm(preFilmObject) {
    // initialise film object
    let film = {"id": preFilmObject.id, "title": preFilmObject.title, "year": 0, "image": "",
        "runtime": -1, "directorList": [], "actorList": [], "genreList": [], "countryList": [],
        "languageList": [], "contentRating": "", "imdbRating": -1, "numberOfVotes": preFilmObject.numberOfVotes,
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
        film.directorList.push(c(this).text());
    });

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
    // and push this to film.actorList
    const len = actorNames.length;
    for (let i = 0; i < len; i++) {
        film.actorList.push({"name" : actorNames[i], "image" : actorImages[i]});
    }

    // get list of genres
    c('.ipc-chip.ipc-chip--on-baseAlt').each(function () {
        film.genreList.push(c(this).text());
    });

    // get list of countries
    c('.sc-f65f65be-0.fVkLRr[data-testid=title-details-section] ' +
        'li:nth-child(2) li').each(function () {
            film.countryList.push(c(this).text());
    });

    // get list of languages
    c('.sc-f65f65be-0.fVkLRr[data-testid=title-details-section] ' +
        'li:nth-child(4) li').each(function () {
        film.languageList.push(c(this).text());
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
