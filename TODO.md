# TODO

## General
- [ ] finish initDB.ks
- [ ] create functions to accommodate graphs
- [ ] for updateDB.js when it appends a film it should follow format from tidy.js
- [ ] get cron-job working for updateDB.js (run twice a day?)
- [ ] design the website


### initDB.js
- [x] find efficient way to do 'franchise' attribute
- [x] bug for languages, if foreign film it puts the english title as the language
- [x] if film has >3 directors, only the first 3 are scraped
- [x] filter content rating in initDB.js
- [x] avoid hard-coding languages and countries
- [x] fix imdbtop25position

### graph.js
- [x] Mean Genre Rating (atm it's all genres, further customisation: top/bottom k with >= n films) {bar}
- [x] Quantity of films watched per genre {doughnut}
- [x] Top k Directors (>= n films) {bar}
- [x] Ratings of a directors' films (e.g. Chris Nolan) {line}
- [x] Top k Actors (>= n films) {bar}
- [x] Ratings of an actor's films (e.g. Ryan Gosling) {line}
- [ ] myRating of IMDB Top 25 {line}
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
- [ ]
