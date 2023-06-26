# TODO

### Graphs
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
- [X] watchedInCinema vs. !watchedInCinema    {meanRating: bar, proportion: doughnut}
- [x] mean rating of each content rating {meanRating: line, proportion: doughnut}
- [x] mcu ratings {line}
- [x] bond ratings {line}
- [x] lotr, hp, star wars ratings {line}
- [ ] think about scatter plots
- [ ] myRating (y-axis) & numOfVotes (x-axis) {scatter} / {line? get mean of each 50/100k interval}
- [ ] check if every function needs to be async

### Other
- [ ] create functions to accommodate graphs
- [ ] re-initialise filmData.json with extra data
- [ ] for updateDB.js when it appends a film it should follow format from tidy.js
- [ ] get cron-job working for updateDB.js (run twice a day?)
- [ ] design the website