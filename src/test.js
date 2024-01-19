import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

const imdbBaseTitleUrl = "https://www.imdb.com/title/";

main();

async function main() {
    writeToJson({"test":"broski"}, "data/test.json");
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
