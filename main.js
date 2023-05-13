// imports
import {readFilmData} from "./updateDB.js";

main();

async function main() {
    const filmData = readFilmData();

    console.log(filmData[98].title);
}
