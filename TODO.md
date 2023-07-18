# TODO

## General
- [x] finish initDB.js
- [ ] finish updateDB.js
- [ ] metadata.json - contains info about latest write, error messages
- [ ] error handling
- [ ] get cron-job working for updateDB.js
- [ ] finish graph.js
- [ ] design the website


### initDB.js
- [x] find efficient way to do 'franchise' attribute
- [x] bug for languages, if foreign film it puts the english title as the language
- [x] if film has >3 directors, only the first 3 are scraped
- [x] filter content rating in initDB.js
- [x] avoid hard-coding languages and countries
- [x] fix imdbTop25Position
- [x] node fetch error handling: try catch statements (node fetch timed out)
- [x] add progress messages (console.log)

### graph.js
- [x] Mean Genre Rating (atm it's all genres, further customisation: top/bottom k with >= n films) {bar}
- [x] Quantity of films watched per genre {doughnut}
- [x] Top k Directors (>= n films) {bar}
- [x] Ratings of a directors' films (e.g. Chris Nolan) {line}
- [x] Top k Actors (>= n films) {bar}
- [x] Ratings of an actor's films (e.g. Ryan Gosling) {line}
- [x] myRating of IMDB Top 25 {bar}
- [x] imdbRating of my Top 25 {bar}
- [x] metascore of my Top 25 {bar}
- [x] mean decade rating (>= n films) {hist}
- [x] mean rating per year {line}
- [x] mean runtime rating (>= n films) {hist}
- [x] Quantity of films watched per runtime interval {doughnut}
- [x] English-spoken  vs. international films {meanRating: bar, proportion: doughnut}
- [x] watchedInCinema vs. !watchedInCinema    {meanRating: bar, proportion: doughnut}
- [ ] mean rating of each content rating {meanRating: line, proportion: doughnut}
- [x] mcu ratings {line}
- [x] bond ratings {line}
- [x] lotr, hp, star wars ratings {line}
- [x] check if every function needs to be async
- [ ] myRating distribution {bar}

### updateDB.js
- [x] figure out functions running twice smdfh
