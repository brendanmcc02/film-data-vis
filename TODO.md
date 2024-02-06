# TODO

### Website
- [x] Position all graphs and descriptions
- [x] Descriptions of each graph
- [x] if metascore is not -1, update it
- [x] home down arrow
- [x] scale graphs and divs to work with different screen sizes
- [x] Down arrow on all pages
- [x] change runtime labels from mins to hhmm (e.g. instead of <150 do <2h30m)
- [x] decade quant
- [x] hover effects
- [x] wallpapers for each page
- [x] home page
- [x] final page
- [x] readme (how it works)
- [x] website video preview

## General
- [x] finish initDB.js
- [x] finish updateDB.js
- [x] metadata.json - contains info about latest write, error messages
- [x] error handling
- [x] get cron-job working for updateDB.js
- [x] finish initDB.js
- [x] finish updateDB.js
- [x] finish graph.js
- [x] design the website

### graph.js
- [x] decade quantity {doughnut}
- [x] Mean Genre Rating {bar}
- [x] Quantity of films watched per genre {doughnut}
- [x] Top k Directors (>= n films) {bar}
- [x] Ratings of a directors' films (e.g. Chris Nolan) {line}
- [x] Top k Actors (>= n films) {bar}
- [x] Ratings of an actor's films (e.g. Ryan Gosling) {line}
- [x] myRating of IMDB Top 25 {line}
- [x] imdbRating of my Top 10 {bar}
- [x] metascore of my Top 25 {bar}
- [x] mean decade rating (>= n films) {hist/bar}
- [x] mean rating per year {line}
- [x] mean runtime rating (>= n films) {hist/bar}
- [x] Quantity of films watched per runtime interval {doughnut}
- [x] English-spoken  vs. international films {meanRating: bar, proportion: doughnut}
- [x] watchedInCinema vs. !watchedInCinema    {meanRating: bar, proportion: doughnut}
- [x] mean rating of each content rating {meanRating: line, proportion: doughnut}
- [x] mcu ratings {line}
- [x] bond ratings {line}
- [x] lotr, hp, star wars ratings {line}
- [x] check if every function needs to be async
- [x] myRating distribution {bar}
- [x] multiple colours

### updateDB.js
- [x] figure out functions running twice smdfh
- [x] error handling
- [x] imdb rating, metascore null for updateDB.js -> take getImdbRating & getMetascore from initDB.js
- [x] fix imdb rating error

### initDB.js
- [x] find efficient way to do 'franchise' attribute
- [x] bug for languages, if foreign film it puts the english title as the language
- [x] if film has >3 directors, only the first 3 are scraped
- [x] filter content rating in initDB.js
- [x] avoid hard-coding languages and countries
- [x] fix imdbTop25Position
- [x] node fetch error handling: try catch statements (node fetch timed out)
- [x] add progress messages (console.log)
- [x] don't rely on dynamic html tags (they change every so often)
- [x] fix glass onion 'year-cr-runtime' bug
- [x] re-initDB and check if new selectors are bug-free

