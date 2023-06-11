// get the html
import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

main();

async function main() {
    // get the html
    let response = await nodeFetch("https://en.wikipedia.org/wiki/List_of_Marvel_Cinematic_Universe_films");
    let body = await response.text();
    let c = cheerio.load(body);

    // const preFilmObjects = readFilmData();

    // web scrape all mcu film titles
    c('.wikitable.plainrowheaders.defaultcenter.col2left tr th[scope="row"]').each(function () {
       console.log(c(this).text());
    });
    // c('.wikitable.plainrowheaders.defaultcenter.col2left').each(function () {
    //     console.log(c(this))
    // })
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
