// this file is intended to run in node.js

// tidies up the filmData.json (final product of initDB.js
// isn't perfect)

// module imports
import {readFilmData} from "./updateDB.js";
import {writeFilmsToJson} from "./initDB.js";

main();

async function main() {
    const filmData = readFilmData();

    //

    writeFilmsToJson(filmData);
}
