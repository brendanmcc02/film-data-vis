# Initialising Database

## What?
The purpose of this branch is to initialise the database.

## How?
A web scraper (Cheerio JS) is used to scrape all films from my ratings web page (https://www.imdb.com/user/ur95934592/ratings).
Specifically, I scrape the unique film ID, and my rating of the film.

I then web scrape a list of films that I've watched in cinema (https://www.imdb.com/list/ls081360952).
Using these 3 pieces of info (filmID, myRating, watchedInCinema), I can use an imdb-api to get more comprehensive data of each
film.

This data is pre-processed by removing unused & unnecessary data, and then stored as a json file.
