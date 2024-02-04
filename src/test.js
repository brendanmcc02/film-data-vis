// // returns an array of the titles of bond films
// // (web scrapes from wikipedia page)
// import nodeFetch from "node-fetch";
// import * as cheerio from "cheerio";
//
// const bondURL = "https://en.wikipedia.org/wiki/List_of_James_Bond_films";
//
// main();
//
// async function main() {
//     const res = await getBondFilmTitles();
//     console.log(res);
// }
//
// async function getBondFilmTitles() {
//
//     let bondFilmTitles = [];
//
//     try {
//         // get the html
//         const response = await nodeFetch(bondURL);
//         const body = await response.text();
//         const c = cheerio.load(body);
//
//         // initial error handling
//         if (c('table:first th[scope="row"]').length === 0) {
//             // throwErrorMessage("James Bond films wiki html possibly changed. check wiki html.");
//             console.log("oh nein")
//         }
//
//         c('table:first th[scope="row"]').each(function () {
//             // get the title of the bond film
//             let title = c(this).text();
//             title = title.replace("\n", "");
//
//             bondFilmTitles.push(title);
//         });
//
//         return bondFilmTitles;
//     } catch (error) {
//         // writeMetadata("error", startTime, error.name, error.message);
//         throw error;
//     }
//
// }