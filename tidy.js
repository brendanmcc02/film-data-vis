// this file is intended to run in node.js

// tidies up the filmData.json (final product of initDB.js
// isn't perfect)

// module imports
import {readFilmData} from "./updateDB.js";
import {writeFilmsToJson} from "./initDB.js";

main();

async function main() {
    const filmData = readFilmData();
    filmData.forEach(film => {

        let directors = [];
        film.directorList.forEach(director => {
            directors.push(director.name);
        });
        film.directorList = directors;

        let genres = [];
        film.genreList.forEach(genre => {
            genres.push(genre.key);
        });
        film.genreList = genres;

        let actors = [];
        film.actorList.forEach(actor => {
            actors.push(actor.name);
        });
        film.actorList = actors;

        let languages = [];
        film.languageList.forEach(language => {
            languages.push(language.key);
        });
        film.languageList = languages;

        // film.year = parseInt(film.year);
        // film.runtimeMins = parseInt(film.runtimeMins);
        // film.imDbRating = parseFloat(film.imDbRating);
        // film.imDbRatingVotes = parseInt(film.imDbRatingVotes);
        // film.metacriticRating = parseInt(film.metacriticRating);
    });

    writeFilmsToJson(filmData);
}
