import nodeFetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

main();

async function main() {
    let response = await nodeFetch("https://www.imdb.com/title/tt0468569");
    let body = await response.text();
    let c = cheerio.load(body);

    // goal: get year-ct-rt tag

    console.log(c('h1[data-testid=hero__pageTitle]').text());
}
