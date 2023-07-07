// get the html
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

main();

async function main() {
    let preFilmObject = {"title" : "Paddington 2", "id" : "tt3854496", "myRating" : 8, "watchedInCinema" : false,
        "imdbTop25Position" : -1, "myPosition" : -1, "franchise" : ""};

    const film = await getFilm(preFilmObject);

    console.log(film);
}

async function getFilm(preFilmObject) {
    // initialise film object
    let film = {"id": preFilmObject.id, "title": preFilmObject.title, "year": 0, "image": "",
        "runtime": -1, "directorList": [], "actorList": [], "genreList": [], "countryList": [],
        "languageList": [], "contentRating": "", "imdbRating": -1, "numberOfVotes": -1,
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

    let runtime = 0;
    // get runtime
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

    // get list of directors (try get image as well?)

    // get list of actors {"name", "image"}

    // get list of genres

    // get list of countries

    // get list of languages

    // get imdb rating

    // get number of imdb votes

    // get metacritic (check updatedb.js)

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
