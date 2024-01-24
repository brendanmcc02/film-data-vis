import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import {throwErrorMessage} from "./initDB.js";

const imdbBaseTitleUrl = "https://www.imdb.com/title/";

main();

async function main() {
    const url = imdbBaseTitleUrl + "tt1255953";

    let correct = 0;
    let wrong = 0;

    for (let i = 0; i < 100; i++) {
        console.log("i:", i);
        try {
            const response = await nodeFetch(url);
            const body = await response.text();
            const c = cheerio.load(body);

            // get imdbRating
            const imdbRating = c('div[data-testid=hero-rating-bar__aggregate-rating__score]').first().find('span:nth-child(1)').text();
            let f = parseFloat(imdbRating);

            if (f !== 8.3) {
                console.log("wrong");
                wrong++;
            } else {
                console.log("correct");
                correct++;
            }

            // if (imdbRating === '') {
            //     throwErrorMessage("imdb rating not recognised. css class name possibly changed. " + id);
            // }
        } catch (error) {
            console.log(error);
        }
    }

    console.log("c:", correct);
    console.log("w:", wrong);
}


// reads .json file into a variable
function readFromJson(filepath) {
    let filmData;

    try {
        filmData = fs.readFileSync(filepath);
    } catch (error) {
        console.error(error);
        throw error;
    }

    return JSON.parse(filmData);
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
