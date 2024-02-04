// // this file is intended to run in node.js
// // as opposed to a web browser
//
// // module imports
// import * as fs from "fs";
// import {writeMetadata} from "./initDB.js";
//
// main();
//
// // initialises a database of all my rated films on imdb
// async function main() {
//     let filmdata = readFromJson("../data/filmData.json");
//     let actors = [];
//
//     filmdata.forEach(film => {
//         actors = [];
//
//         film.actors.forEach(actor => {
//            actors.push(actor.name);
//         });
//
//         film.actors = actors;
//     });
//
//     writeToJson(filmdata, "../data/filmData.json");
// }
//
// // writes data to a .json file
// function writeToJson(data, filepath) {
//     const stringData = JSON.stringify(data, null, 4);
//
//     fs.writeFileSync(filepath, stringData, (error) => {
//         if (error) {
//             writeMetadata("error", startTime, error.name, error.message);
//             throw error;
//         }
//     });
// }
//
// // reads .json file into a variable
// function readFromJson(filepath) {
//     let filmData;
//
//     try {
//         filmData = fs.readFileSync(filepath);
//     } catch (error) {
//         writeMetadata("error", startTime, error.name, error.message);
//         throw error;
//     }
//
//     return JSON.parse(filmData);
// }
