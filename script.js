// imports
import fetch from "node-fetch";
import * as cheerio from "cheerio";

// global constants
const myRatingsURL = "https://www.imdb.com/user/ur95934592/ratings";
const watchedInCinemaURL = "https://www.imdb.com/list/ls081360952/";
const apiURL = "https://imdb-api.com/en/API/Title/k_ywttr3ie/";
const apiRequestOptions = {
    method: 'GET',
    redirect: 'follow'
};

main();

async function main() {
    const filmIDsAndMyRatings = await getfilmIDsAndMyRatings();
    console.log(filmIDsAndMyRatings);
}

// returns array of objects: {filmID, myRating}
async function getfilmIDsAndMyRatings() {
    let filmIDsAndMyRatings = [];

    var numberOfFilms = await getNumberOfRatedFilms();
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
            filmIDsAndMyRatings.push({"filmID" : filmIDs[i], "myRating" : myRating, "watchedInCinema" : false});
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

        filmIDsAndMyRatings.forEach(film => {
            if (filmsWatchedInCinemas.includes(film.filmID)) {
                film.watchedInCinema = true;
            }
        });

        url = await getNextURL(url);
    }

    return filmIDsAndMyRatings;
}

// given current URL, returns the URL of the next page (Returns "" if no next page)
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

// iterate through each film ID using imdb-API
// and returns array of full (raw) film objects
async function getRawFilms(filmIDsAndMyRatings) {
    let rawFilms = [];

    filmIDsAndMyRatings.forEach((f) => {
        let filmURL = apiURL.concat(f.filmID);

        var filmObject;
        fetch(filmURL, apiRequestOptions)
            .then(response => response.json())
            .then(data => {
                filmObject = data;
                console.log(filmObject);
            })
            .catch(error => console.log('error', error));
        console.log(filmObject)
    });

    return rawFilms;
}

// NOTES
// tvSpecial (e.g. HP reunion) is recognised as type: "movie" in imdb API
// should be fine anyway because it has "documentary" as it's genre
