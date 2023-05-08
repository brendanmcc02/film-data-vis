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

    const f = await getLast100Films();
    console.log(f);

    ///////////////////////////
    const endTime = Date.now();
    const runTime = (endTime - startTime) / 1000.0;
    console.log("\nRuntime: " + runTime.toFixed(2) + " seconds");
}

// gets array of last 100 rated films
async function getLast100Films() {
    let films = [];
    let filmIDs = [];

    const response = await fetch(myRatingsURL);
    const body = await response.text();
    const c = cheerio.load(body);

    // iterate through each instance of a film and push film ID to array
    c('.lister-item-image.ribbonize').each(function () {
        filmIDs.push(c(this).attr('data-tconst'));
    });

    // if you are confused by this code check initDB.js for identical code and see comments
    for (let i = 0; i < 100; i++) {
        let myRating = c('span.ipl-rating-star__rating').eq(1 + 24 * (i)).text();
        myRating = parseInt(myRating);
        films.push({"filmID" : filmIDs[i], "myRating" : myRating, "watchedInCinema" : false});
    }

    return films;
}

// gets metascore of film

// gets imdb rating of film

// gets number of imdb votes of film
