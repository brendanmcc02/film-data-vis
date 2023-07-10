// get the html
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";

main();

async function main() {
    let myRatedFilms = [{"title": "", "year": 0,  "myRating": myRatedFilm.myRating, "imdbRating": -1.0,
        "metascore": -1, "image": "", "runtime": -1, "directors": [], "actors": [],
        "genres": [], "countries": [], "languages": [], "contentRating": "",
        "watchedInCinema": myRatedFilm.watchedInCinema, "imdbTop25Position": myRatedFilm.imdbTop25Position,
        "myTop10Position": myRatedFilm.myTop10Position, "franchise": myRatedFilm.franchise
    }];

    let filmData = await getFilmData(myRatedFilms);
}
