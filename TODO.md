# TODO

### initDB.js
- [x] for foreign films get english title as film.title
- [x] find efficient way to do 'franchise' attribute
- [x] bug for languages, if foreign film it puts the english title as the language

### graphs
- [x] Mean Genre Rating (atm it's all genres, further customisation: top/bottom k with >= n films) {bar}
- [x] Quantity of films watched per genre {doughnut}
- [x] Top k Directors (>= n films) {bar}
- [x] Ratings of a directors' films (e.g. Chris Nolan) {line}
- [x] Top k Actors (>= n films) {bar}
- [x] Ratings of an actor's films (e.g. Ryan Gosling) {line}
- [x] myRating of IMDB Top 25 {line}
- [x] imdbRating of my Top 25 {bar}
- [x] metascore of my Top 25 {bar}
- [x] mean decade rating (>= n films) {hist}
- [x] mean rating per year {line}
- [x] mean runtime rating (>= n films) {hist}
- [x] Quantity of films watched per runtime interval {doughnut}
- [x] English-spoken  vs. international films {meanRating: bar, proportion: doughnut}
- [x] watchedInCinema vs. !watchedInCinema    {meanRating: bar, proportion: doughnut}
- [x] mean rating of each content rating {meanRating: line, proportion: doughnut}
- [x] mcu ratings {line}
- [x] bond ratings {line}
- [x] lotr, hp, star wars ratings {line}
- [x] check if every function needs to be async

### Other
- [ ] alter content rating to match irish ratings (instead of USA)
- [ ] create functions to accommodate graphs
- [ ] re-initialise filmData.json with extra data
- [ ] for updateDB.js when it appends a film it should follow format from tidy.js
- [ ] get cron-job working for updateDB.js (run twice a day?)
- [ ] design the website