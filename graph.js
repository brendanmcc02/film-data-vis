graph();

async function graph() {

    // read filmData.json into a variable
    const response = await fetch("data/filmData.json");
    const filmData = await response.json();

    // get relevant data for graphs
    const base = getRuntimes(filmData);
    const labels = getRuntimeLabels(base, 3);
    const data = getRuntimeRatings(base, 3);

    // plot the graph
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Title',
                data: data,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    min: 0,
                    max: 10
                }
            }
        }
    });
}

// Very commonly I need to iterate through all the films
// in the database and calculate the mean ratings of anything,
// e.g. mean ratings of specific runtimes, or mean ratings of different genres.
// this code adds the films myRating to a total (ratingSum), increments ratingQuantity,
// and calculates the new mean rating of that particular object.
// this function was created because the code became repetitive.
function modifyMean(film, arrayOfMeanObjects, i) {
    arrayOfMeanObjects[i].ratingSum += film.myRating;
    arrayOfMeanObjects[i].ratingQuantity++;
    arrayOfMeanObjects[i].ratingMean = arrayOfMeanObjects[i].ratingSum / arrayOfMeanObjects[i].ratingQuantity;
}

// returns an array of genre objects {"genre", "ratingMean", "ratingSum", "ratingQuantity"},
// sorted by ratingMean (highest -> lowest)
function getGenres(filmData) {
    let genres = [];

    filmData.forEach(film => {
        film.genreList.forEach(genre => {
            let genreIndex = getGenreIndex(genres, genre);
            // genre not in array
            if (genreIndex === -1) {
                genres.push({"genre" : genre, "ratingMean" : film.myRating,
                    "ratingSum" : film.myRating, "ratingQuantity" : 1});
            }
            // genre is in array
            else {
                modifyMean(film, genres, genreIndex);
            }
        });
    });

    // sort by ratingMean (highest -> lowest)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = genres.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (genres[i].ratingMean < genres[i+1].ratingMean) {
                [genres[i], genres[i+1]] = [genres[i+1], genres[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    // round each ratingMean to 2 decimal places
    genres.forEach(genre => {
        genre.ratingMean = Math.round((genre.ratingMean + Number.EPSILON) * 100) / 100;
    });

    return genres;
}


// utility function that gets the index of a target genre
// in an array of genres.
// if genre is not in array, it returns -1
function getGenreIndex(genres, genre) {
    const len = genres.length;

    for (let i = 0; i < len; i++) {
        if (genres[i].genre === genre) {
            return i;
        }
    }

    return -1;
}

// returns array of genre labels (sorted highest->lowest ratingMean)
function getGenreLabels(genres) {
    let genreLabels = [];

    genres.forEach(genre => {
       genreLabels.push(genre.genre);
    });

    return genreLabels;
}

// returns array of mean genre ratings (sorted highest->lowest)
function getGenreRatings(genres) {
    let genreRatings = [];

    genres.forEach(genre => {
        genreRatings.push(genre.ratingMean);
    });

    return genreRatings;
}

// returns array of quantity of films watched per genre (sorted highest -> lowest in meanRating)
function getGenreQuantities(genres) {
    let genreQuantities = [];

    genres.forEach(genre => {
       genreQuantities.push(genre.ratingQuantity);
    });

    return genreQuantities;
}

// returns an array of director objects {"director", "ratingMean", "ratingSum", "ratingQuantity"},
// sorted by ratingMean (highest -> lowest)
function getDirectors(filmData) {
    let directors = [];

    filmData.forEach(film => {
        film.directorList.forEach(director => {
            let directorIndex = getDirectorIndex(directors, director);
            // director not in array
            if (directorIndex === -1) {
                directors.push({"director" : director, "ratingMean" : film.myRating,
                    "ratingSum" : film.myRating, "ratingQuantity" : 1});
            }
            // director is in array
            else {
                modifyMean(film, directors, directorIndex);
            }
        });
    });

    // sort by ratingMean (highest -> lowest)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = directors.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (directors[i].ratingMean < directors[i+1].ratingMean) {
                [directors[i], directors[i+1]] = [directors[i+1], directors[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    // round each ratingMean to 2 decimal places
    directors.forEach(director => {
        director.ratingMean = Math.round((director.ratingMean + Number.EPSILON) * 100) / 100;
    });

    return directors;
}

// returns array of top k director labels with at least n films
// sorted highest->lowest ratingMean
function getTopKDirectorLabels(directors, k, n) {
    let directorLabels = [];

    const len = directors.length;
    let count = 0;
    for (let i = 0; count < k && i < len; i++) {
        if (directors[i].ratingQuantity >= n) {
            directorLabels.push(directors[i].director);
            count++;
        }
    }

    return directorLabels;
}

// returns array of top k mean director ratings with at least n films
// sorted highest->lowest ratingMean
function getTopKDirectorRatings(directors, k, n) {
    let directorRatings = [];

    const len = directors.length;
    let count = 0;
    for (let i = 0; count < k && i < len; i++) {
        if (directors[i].ratingQuantity >= n) {
            directorRatings.push(directors[i].ratingMean);
            count++;
        }
    }

    return directorRatings;
}

// utility function that gets the index of a target director
// in an array of directors.
// if director is not in array, it returns -1
function getDirectorIndex(directors, director) {
    const len = directors.length;

    for (let i = 0; i < len; i++) {
        if (directors[i].director === director) {
            return i;
        }
    }

    return -1;
}

// returns array of a director's films, sorted oldest -> newest
function getDirectorFilms(filmData, director) {
    let directorFilms = [];

    filmData.forEach(film => {
        if(film.directorList.includes(director)) {
            directorFilms.push(film);
        }
    });

    // sort by year (oldest -> newest)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = directorFilms.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (directorFilms[i].year > directorFilms[i+1].year) {
                [directorFilms[i], directorFilms[i+1]] = [directorFilms[i+1], directorFilms[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return directorFilms;
}

// given an array of sorted films by a director (oldest -> newest),
// return array of titles of those films
function getDirectorTitles(directorFilms) {
    let directorTitles = [];

    directorFilms.forEach(film => {
       directorTitles.push(film.title);
    });

    return directorTitles;
}

// given an array of sorted films by a director (oldest -> newest),
// return array of my ratings of those films
function getDirectorRatings(directorFilms) {
    let directorRatings = [];

    directorFilms.forEach(film => {
        directorRatings.push(film.myRating);
    });

    return directorRatings;
}

// returns an array of actor objects {"actorName", "ratingMean", "ratingSum", "ratingQuantity"},
// sorted by ratingMean (highest -> lowest)
function getActors(filmData) {
    let actors = [];

    filmData.forEach(film => {
        film.actorList.forEach(actor => {
            let actorIndex = getActorIndex(actors, actor.name);
            // actor not in array
            if (actorIndex === -1) {
                actors.push({"actorName" : actor.name, "ratingMean" : film.myRating,
                    "ratingSum" : film.myRating, "ratingQuantity" : 1});
            }
            // actor is in array
            else {
                modifyMean(film, actors, actorIndex);
            }
        });
    });

    // sort by ratingMean (highest -> lowest)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = actors.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (actors[i].ratingMean < actors[i+1].ratingMean) {
                [actors[i], actors[i+1]] = [actors[i+1], actors[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    // round each ratingMean to 2 decimal places
    actors.forEach(actor => {
        actor.ratingMean = Math.round((actor.ratingMean + Number.EPSILON) * 100) / 100;
    });

    return actors;
}

// returns array of top k actor labels with at least n films
// sorted highest->lowest ratingMean
function getTopKActorLabels(actors, k, n) {
    let actorLabels = [];

    const len = actors.length;
    let count = 0;
    for (let i = 0; count < k && i < len; i++) {
        if (actors[i].ratingQuantity >= n) {
            actorLabels.push(actors[i].actorName);
            count++;
        }
    }

    return actorLabels;
}

// returns array of top k mean actor ratings with at least n films
// sorted highest->lowest ratingMean
function getTopKActorRatings(actors, k, n) {
    let actorRatings = [];

    const len = actors.length;
    let count = 0;
    for (let i = 0; count < k && i < len; i++) {
        if (actors[i].ratingQuantity >= n) {
            actorRatings.push(actors[i].ratingMean);
            count++;
        }
    }

    return actorRatings;
}

// utility function that gets the index of a target actor
// in an array of actors.
// if actor is not in array, it returns -1
function getActorIndex(actors, actorName) {
    const len = actors.length;

    for (let i = 0; i < len; i++) {
        if (actors[i].actorName === actorName) {
            return i;
        }
    }

    return -1;
}

// returns array of an actor's films, sorted oldest -> newest
function getActorFilms(filmData, actorName) {
    let actorFilms = [];

    filmData.forEach(film => {
        film.actorList.forEach(actor => {
            if(actor.name === actorName) {
                actorFilms.push(film);
            }
        });
    });

    // sort by year (oldest -> newest)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = actorFilms.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (actorFilms[i].year > actorFilms[i+1].year) {
                [actorFilms[i], actorFilms[i+1]] = [actorFilms[i+1], actorFilms[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return actorFilms;
}

// given an array of sorted films by an actor (oldest -> newest),
// return array of titles of those films
function getActorTitles(actorFilms) {
    let actorTitles = [];

    actorFilms.forEach(film => {
        actorTitles.push(film.title);
    });

    return actorTitles;
}

// given an array of sorted films by an actor (oldest -> newest),
// return array of my ratings of those films
function getActorRatings(actorFilms) {
    let actorRatings = [];

    actorFilms.forEach(film => {
        actorRatings.push(film.myRating);
    });

    return actorRatings;
}

// gets array of the top 25 films on imdb that I've rated
// sorted 1st -> 25th
function getImdbTop25Films(filmData) {
    let imdbTop25Films = [];

    filmData.forEach(film => {
        if (film.imdbTop25Position !== -1) {
            imdbTop25Films.push(film);
        }
    });

    // sort by position (1st -> 25th)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = imdbTop25Films.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (imdbTop25Films[i].imdbTop25Position > imdbTop25Films[i+1].imdbTop25Position) {
                [imdbTop25Films[i], imdbTop25Films[i+1]] = [imdbTop25Films[i+1], imdbTop25Films[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return imdbTop25Films;
}

// given array of imdb top 25 films that I've rated,
// return the titles of these films
function getImdbTop25Titles(imdbTop25Films) {
    let imdbTop25Titles = [];

    imdbTop25Films.forEach(film => {
       imdbTop25Titles.push(film.title);
    });

    return imdbTop25Titles;
}

// given array of imdb top 25 films that I've rated,
// return my ratings of these films
function getImdbTop25Ratings(imdbTop25Films) {
    let imdbTop25Ratings = [];

    imdbTop25Films.forEach(film => {
        imdbTop25Ratings.push(film.myRating);
    });

    return imdbTop25Ratings;
}

// gets array of my top 10 films,
// sorted by position (1st -> 10th)
function getMyTop10Films(filmData) {
    let myTop10Films = [];

    filmData.forEach(film => {
       if (film.myPosition !== -1) {
           myTop10Films.push(film);
       }
    });

    // sort by position (1st -> 25th)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = myTop10Films.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (myTop10Films[i].myPosition > myTop10Films[i+1].myPosition) {
                [myTop10Films[i], myTop10Films[i+1]] = [myTop10Films[i+1], myTop10Films[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return myTop10Films;
}

// given array of my top 25 films,
// return an array of the titles of those films
function getMyTop10Titles(myTop10Films) {
    let myTop10Titles = [];

    myTop10Films.forEach(film => {
       myTop10Titles.push(film.title);
    });

    return myTop10Titles;
}

// given array of my top 25 films,
// return an array of the imdb rating of those films
function getMyTop10Ratings(myTop10Films) {
    let myTop10Ratings = [];

    myTop10Films.forEach(film => {
        myTop10Ratings.push(film.imDbRating);
    });

    return myTop10Ratings;
}

// given array of my top 25 films,
// return an array of the metascore of those films
function getMyTop10Metascores(myTop10Films) {
    let myTop10Metascores = [];

    myTop10Films.forEach(film => {
        myTop10Metascores.push(film.metacriticRating);
    });

    return myTop10Metascores;
}

// returns an array of decade objects
// {"decade", "ratingMean", "ratingSum", "ratingQuantity"},
// sorted by decade (earliest -> latest)
function getDecades(filmData) {
    let decades = [];

    filmData.forEach(film => {
        let decade = Math.floor(film.year / 10) * 10;
        let decadeIndex = getDecadeIndex(decades, decade);
        // decade not in array
        if (decadeIndex === -1) {
            decades.push({"decade" : decade, "ratingMean" : film.myRating,
                "ratingSum" : film.myRating, "ratingQuantity" : 1});
        }
        // decade is in array
        else {
            modifyMean(film, decades, decadeIndex);
        }
    });

    // sort by decade (earliest -> latest)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = decades.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (decades[i].decade > decades[i+1].decade) {
                [decades[i], decades[i+1]] = [decades[i+1], decades[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    // round each ratingMean to 2 decimal places
    decades.forEach(decade => {
        decade.ratingMean = Math.round((decade.ratingMean + Number.EPSILON) * 100) / 100;
    });

    return decades;
}


// utility function that gets the index of a target decade
// in an array of decades.
// if decade is not in array, it returns -1
function getDecadeIndex(decades, decade) {
    const len = decades.length;

    for (let i = 0; i < len; i++) {
        if (decades[i].decade === decade) {
            return i;
        }
    }

    return -1;
}

// returns array of decade labels with at least n films
// (sorted earliest->latest decade)
function getDecadeLabels(decades, n) {
    let decadeLabels = [];

    decades.forEach(decade => {
        if (decade.ratingQuantity >= n) {
            decadeLabels.push(decade.decade);
        }
    });

    return decadeLabels;
}

// returns array of decade myRatings with at least n films
// (sorted earliest->latest decade)
function getDecadeRatings(decades, n) {
    let decadeRatings = [];

    decades.forEach(decade => {
        if (decade.ratingQuantity >= n) {
            decadeRatings.push(decade.ratingMean);
        }
    });

    return decadeRatings;
}

// returns an array of year objects {"year", "ratingMean", "ratingSum", "ratingQuantity"}.
// if a year has < n films, it's ratingMean is set to null.
// if a there is a year with no rated films (e.g. 1961),
// it is added to the array but with ratingMean = null.
// sorted by year (earliest -> latest).
function getYears(filmData, n) {
    let years = [];

    filmData.forEach(film => {
        let year = film.year;
        let yearIndex = getYearIndex(years, year);
        // year not in array
        if (yearIndex === -1) {
            years.push({"year" : year, "ratingMean" : film.myRating,
                "ratingSum" : film.myRating, "ratingQuantity" : 1});
        }
        // year is in array
        else {
            modifyMean(film, years, yearIndex);
        }
    });

    // get the min year with >= n films

    // unnecessary to use infinity, I guess this will become
    // deprecated in 73 years =)
    let minYear = 2100;
    years.forEach(year => {
        if (year.year < minYear) {
            minYear = year.year;
        }
    });

    // get the max year
    let maxYear = 0;
    years.forEach(year => {
        if (year.year > maxYear) {
            maxYear = year.year;
        }
    });

    // starting from the minimum year, add year objects for years
    // that have no rated films, and set their ratingMean to null.
    // do this until you hit the max year.
    // if the year has < n films, also set it's ratingMean to null.
    for (let y = minYear; y <= maxYear; y++) {
        let yearIndex = getYearIndex(years, y);
        // if the year has no films
        if (yearIndex === -1) {
            years.push({"year" : y, "ratingMean" : null,
                "ratingSum" : null, "ratingQuantity": null});
        }
        // else if the year has < n films
        else if (years[yearIndex].ratingQuantity < n) {
            years[yearIndex].ratingMean = null;
            years[yearIndex].ratingSum = null;
            years[yearIndex].ratingQuantity = null;
        }
    }

    // sort by year (earliest -> latest)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = years.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (years[i].year > years[i+1].year) {
                [years[i], years[i+1]] = [years[i+1], years[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    // round each ratingMean to 2 decimal places
    // (only if it's not null)
    years.forEach(year => {
        if (year.ratingMean !== null) {
            year.ratingMean = Math.round((year.ratingMean + Number.EPSILON) * 100) / 100;
        }
    });

    return years;
}


// utility function that gets the index of a target year
// in an array of years.
// if year is not in array, it returns -1
function getYearIndex(years, year) {
    const len = years.length;

    for (let i = 0; i < len; i++) {
        if (years[i].year === year) {
            return i;
        }
    }

    return -1;
}

// utility function that gets
// the index of minimum non-null year
// given an array of sorted year objects
function getMinYearIndex(years) {
    // get the index of  minimum non-null year
    const len = years.length;
    for (let i = 0; i < len; i++) {
        if (years[i].ratingMean !== null) {
            console.log(i);
            return i;
        }
    }

    return 0;
}

// utility function that gets
// the index of maximum non-null year
// given an array of sorted year objects
function getMaxYearIndex(years) {
    // get the index of maximum non-null year
    const len = years.length;

    for (let i = len - 1; i > 0; i--) {
        if (years[i].ratingMean !== null) {
            return i;
        }
    }

    return 0;
}

// returns array of year labels
// starts at the minimum non-null year,
// ends at the maximum non-null year
// (sorted earliest -> latest year)
function getYearLabels(years, minYear, maxYear) {
    let yearLabels = [];

    for (let y = minYear; y <= maxYear; y++) {
        yearLabels.push(years[y].year);
    }

    return yearLabels;
}

// returns array of myRating of each year
// (sorted earliest -> latest year)
function getYearRatings(years, minYear, maxYear) {
    let yearRatings = [];

    for (let y = minYear; y <= maxYear; y++) {
        yearRatings.push(years[y].ratingMean);
    }

    return yearRatings;
}

// returns an array of runtime objects:
// {"runtime", "ratingSum", "ratingQuantity", "ratingMean"}
// sorted by runtime.
function getRuntimes(filmData) {
    // initialise an array 'runtimes' in the format above
    let runtimes = initRuntimes();

    // for each film, modify the relevant entry in the 'runtimes'
    // array, modifying the quantity, sum, and mean of that runtime interval.
    const len = runtimes.length;
    filmData.forEach(film => {
        for (let r = 0; r < len; r++) {
            if (film.runtimeMins < runtimes[r].runtime) {
                modifyMean(film, runtimes, r);
                r = len; // break
            }
        }
    });

    // round each ratingMean to 2 decimal places
    // (only if it's non-zero)
    runtimes.forEach(runtime => {
        if (runtime.ratingMean !== 0) {
            runtime.ratingMean = Math.round((runtime.ratingMean + Number.EPSILON) * 100) / 100;
        }
    });

    return runtimes;
}

// initialises the runtime array.
// adds 8 intervals: <60, <90, ..., <210, <240, <∞
function initRuntimes() {
    let runtimes = [];

    for (let r = 60; r <= 240; r+=30) {
        runtimes.push({"runtime" : r, "ratingSum" : 0,
            "ratingQuantity" : 0, "ratingMean" : 0});
    }

    runtimes.push({"runtime" : Infinity, "ratingSum" : 0,
        "ratingQuantity" : 0, "ratingMean" : 0});

    return runtimes;
}

// given an array of runtime objects,
// returns the runtime labels if it has >= n films.
function getRuntimeLabels(runtimes, n) {
    let runtimeLabels = [];

    runtimes.forEach(runtime => {
        if (runtime.ratingQuantity >= n) {
            if (runtime.runtime === Infinity) {
                runtimeLabels.push("∞");
            } else {
                runtimeLabels.push(runtime.runtime);
            }
        }
    });

    return runtimeLabels;
}

// given an array of runtime objects,
// returns the runtime meanRatings if it has >= n films.
function getRuntimeRatings(runtimes, n) {
    let runtimeRatings = [];

    runtimes.forEach(runtime => {
        if (runtime.ratingQuantity >= n) {
            runtimeRatings.push(runtime.ratingMean);
        }
    });

    return runtimeRatings;
}

// given an array of runtime objects,
// returns an array of runtimeQuantities,
// sorted by runtime (i.e: 60, 90, ..., 210, 240)
function getRuntimeQuantities(runtimes) {
    let runtimeQuantities = [];

    runtimes.forEach(runtime => {
        if (runtime.ratingQuantity > 0) {
            runtimeQuantities.push(runtime.ratingQuantity);
        }
    })

    return runtimeQuantities;
}

// returns array of {"label" : "English-Spoken/International", "ratingSum", "ratingQuantity", "ratingMean"}.
// array is size 2, one object is for english-spoken films,
// the second object is for international films.
// to determine if a film is international:
// oscars definition: film produced outside the US and >50% non-english dialogue track.
// so, I check if a film is produced outside the US (and the UK because realistically if
// a film is produced in the UK it will obviously have English be primarily spoken),
// and then I check if the first language in the languageList is English.
// unfortunately it's not perfect because Roma and All Quiet on the Western Front are international films,
// but because they are netflix films, USA is included in its list of countries making it a non-international film.
function getEnglishInternationalFilms(filmData) {
    let englishInternationalFilms = [
        {"label" : "English-Spoken", "ratingMean" : 0, "ratingSum" : 0, "ratingQuantity" : 0},
        {"label" : "International",  "ratingMean" : 0, "ratingSum" : 0, "ratingQuantity" : 0}];

    filmData.forEach(film => {
        // if the film is international
        if (!film.countryList.includes("USA") && !film.countryList.includes("UK") && film.languageList[0] !== "English") {
            modifyMean(film, englishInternationalFilms, 1);
        }
        // else, the film is english-spoken
        else {
            modifyMean(film, englishInternationalFilms, 0);
        }
    });

    // round each ratingMean to 2 decimal places
    englishInternationalFilms.forEach(eif => {
        eif.ratingMean = Math.round((eif.ratingMean + Number.EPSILON) * 100) / 100;
    });

    return englishInternationalFilms;
}

// given a size 2 array of english & international films,
// returns the labels of each object in that array
function getEnglishInternationalLabels(englishInternationalFilms) {
    let englishInternationalLabels = [];

    englishInternationalFilms.forEach(eif => {
       englishInternationalLabels.push(eif.label);
    });

    return englishInternationalLabels;
}

// given a size 2 array of english & international films,
// returns the ratingMean of each object in that array
function getEnglishInternationalRatings(englishInternationalFilms) {
    let englishInternationalRatings = [];

    englishInternationalFilms.forEach(eif => {
        englishInternationalRatings.push(eif.ratingMean);
    });

    return englishInternationalRatings;
}

// given a size 2 array of english & international films,
// returns the ratingQuantity of each object in that array
function getEnglishInternationalQuantities(englishInternationalFilms) {
    let englishInternationalQuantities = [];

    englishInternationalFilms.forEach(eif => {
        englishInternationalQuantities.push(eif.ratingQuantity);
    });

    return englishInternationalQuantities;
}

// returns array of {"label" : "Watched in Cinemas / Not Watched in Cinemas", "ratingSum", "ratingQuantity", "ratingMean"}.
// array is size 2, one object is for films watched in cinemas,
// the second object is for films not watched in cinemas.
function getCinemaFilms(filmData) {
    let cinemaFilms = [
        {"label" : "Watched in Cinemas",     "ratingMean" : 0, "ratingSum" : 0, "ratingQuantity" : 0},
        {"label" : "Not Watched in Cinemas", "ratingMean" : 0, "ratingSum" : 0, "ratingQuantity" : 0}];

    filmData.forEach(film => {
        // if the film was watched in cinema
        if (film.watchedInCinema) {
            modifyMean(film, cinemaFilms, 0);
        }
        // else, the film was not watched in cinema
        else {
            modifyMean(film, cinemaFilms, 1);
        }
    });

    // round each ratingMean to 2 decimal places
    cinemaFilms.forEach(cf => {
        cf.ratingMean = Math.round((cf.ratingMean + Number.EPSILON) * 100) / 100;
    });

    return cinemaFilms;
}

// given a size 2 array of cinema films,
// returns the labels of each object in that array
function getCinemaLabels(cinemaFilms) {
    let cinemaLabels = [];

    cinemaFilms.forEach(cf => {
        cinemaLabels.push(cf.label);
    });

    return cinemaLabels;
}

// given a size 2 array of cinema films,
// returns the ratingMean of each object in that array
function getCinemaRatings(cinemaFilms) {
    let cinemaRatings = [];

    cinemaFilms.forEach(cf => {
        cinemaRatings.push(cf.ratingMean);
    });

    return cinemaRatings;
}

// given a size 2 array of cinema films,
// returns the ratingQuantity of each object in that array
function getCinemaQuantities(cinemaFilms) {
    let cinemaQuantities = [];

    cinemaFilms.forEach(cf => {
        cinemaQuantities.push(cf.ratingQuantity);
    });

    return cinemaQuantities;
}

// gets an array of content rating objects:
// {"label", "ratingSum", "ratingQuantity", "ratingMean"}.
// sorted by age rating ("Not Rated", "G", "PG", "PG-13", "R", "NC-17").
function getContentRatings(filmData) {
    let contentRatings = initContentRatings();

    filmData.forEach(film => {
        switch (film.contentRating) {
            // if a film has no content rating, consider it as "Not Rated"
            case null:
                modifyMean(film, contentRatings, 0);
                break;
            case "Not Rated":
                modifyMean(film, contentRatings, 0);
                break;
            case "G":
                modifyMean(film, contentRatings, 1);
                break;
            case "PG":
                modifyMean(film, contentRatings, 2);
                break;
            // if a film has "TV-PG" as it's content rating, consider it as "PG"
            case "TV-PG":
                modifyMean(film, contentRatings, 2);
                break;
            case "PG-13":
                modifyMean(film, contentRatings, 3);
                break;
            // pre-1968 films were classified as either 'Approved' or 'Disapproved'.
            // consider these films as "PG-13", which will not always be accurate,
            // but it's the most likely solution
            case "Approved":
                modifyMean(film, contentRatings, 3);
                break;
            // pre-168 films were also classified as either 'Passed' or 'Not Passed'.
            // consider these films as "PG-13", which will not always be accurate,
            // but it's the most likely solution
            case "Passed":
                modifyMean(film, contentRatings, 3);
                break;
            case "R":
                modifyMean(film, contentRatings, 4);
                break;
            case "NC-17":
                modifyMean(film, contentRatings, 5);
                break;
            // 'X' rated films were basically NC-17, so consider 'X' films as NC-17
            case "X":
                modifyMean(film, contentRatings, 5);
                break;
            default:
                console.log("ERROR: Unrecognised Film Content Rating:", film.title, ", ", film.contentRating);
        }
    });

    // round each ratingMean to 2 decimal places
    // (only if it's non-null)
    contentRatings.forEach(cr => {
        if (cr.ratingMean != null) {
            cr.ratingMean = Math.round((cr.ratingMean + Number.EPSILON) * 100) / 100;
        }
    });

    return contentRatings;
}

// initialises the content ratings array in the form:
// {"label", "ratingSum", "ratingQuantity", "ratingMean"}.
// sorted by content rating ("Not Rated", "G", "PG", "PG-13", "R", "NC-17").
function initContentRatings() {
    let contentRatings = [];

    for (let i = 0; i < 6; i++) {
        switch (i) {
            case 0:
                contentRatings.push({"label" : "Not Rated", "ratingSum" : null, "ratingQuantity" : null, "ratingMean" : null});
                break;
            case 1:
                contentRatings.push({"label" : "G", "ratingSum" : null, "ratingQuantity" : null, "ratingMean" : null});
                break;
            case 2:
                contentRatings.push({"label" : "PG", "ratingSum" : null, "ratingQuantity" : null, "ratingMean" : null});
                break;
            case 3:
                contentRatings.push({"label" : "PG-13", "ratingSum" : null, "ratingQuantity" : null, "ratingMean" : null});
                break;
            case 4:
                contentRatings.push({"label" : "R", "ratingSum" : null, "ratingQuantity" : null, "ratingMean" : null});
                break;
            case 5:
                contentRatings.push({"label" : "NC-17", "ratingSum" : null, "ratingQuantity" : null, "ratingMean" : null});
        }
    }

    return contentRatings;
}

// returns array of ratingMeans of each contentRating.
// (with >= n films)
// sorted by content rating ("Not Rated", "G", "PG", "PG-13", "R", "NC-17")
function getContentRatingRatings(contentRatings, n) {
    let contentRatingRatings = [];

    contentRatings.forEach(cr => {
        if (cr.ratingQuantity >= n) {
            contentRatingRatings.push(cr.ratingMean);
        }
    });

    return contentRatingRatings;
}

// returns array of ratingQuantity of each contentRating.
// (with >= n films)
// sorted by content rating ("Not Rated", "G", "PG", "PG-13", "R", "NC-17")
function getContentRatingQuantities(contentRatings) {
    let contentRatingRatings = [];

    contentRatings.forEach(cr => {
        contentRatingRatings.push(cr.ratingQuantity);
    });

    return contentRatingRatings;
}

// returns array of labels of each contentRating.
// (with >= n films)
// (only if the ratingMean is non-null)
// sorted by content rating ("Not Rated", "G", "PG", "PG-13", "R", "NC-17")
function getContentRatingLabels(contentRatings, n) {
    let contentRatingLabels = [];

    contentRatings.forEach(cr => {
        if (cr.ratingQuantity >= n) {
            contentRatingLabels.push(cr.label);
        }
    });

    return contentRatingLabels;
}

// returns an array of bond film objects {"title", "myRating", "year"},
// sorted by release date.
// a special function is used for the bond franchise because
// the bond films are all uniquely named, i.e. they don't all contain "James Bond"
// in the titles, so it's much more difficult than (for example) the Harry Potter franchise
// since the HP films all have "Harry Potter" in the title.
// in "initDB.js", it web scrapes the wiki page for the bond films and changes
// a 'franchise' attribute of the prefilmobject to "James Bond", so all this function
// has to do is to take films with a "James Bond" franchise value.
function getBondFilms(filmData) {
    let bondFilms = [];

    // iterate through each film and add it to array if it's a bond film
    filmData.forEach(film => {
        if (film.franchise === "James Bond") {
            bondFilms.push({"title" : film.title, "myRating" : film.myRating, "year" : film.year});
        }
    });

    // sort by release date.
    // bubble sort is used for algorithmic simplicity.

    let swapped = true; // flag
    const len = bondFilms.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (bondFilms[i].year > bondFilms[i+1].year) {
                [bondFilms[i], bondFilms[i+1]] = [bondFilms[i+1], bondFilms[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return bondFilms;
}

// returns an array of mcu film objects {"title", "myRating", "year"},
// sorted by release date
// same logic as getBondFilms (check comments above)
function getMcuFilms(filmData) {
    let mcuFilms = [];

    // iterate through each film and add it to array if it's an MCU film
    filmData.forEach(film => {
        if (film.franchise === "MCU") {
            mcuFilms.push({"title" : film.title, "myRating" : film.myRating, "year" : film.year});
        }
    });

    // sort by release date.
    // bubble sort is used for algorithmic simplicity.

    let swapped = true; // flag
    const len = mcuFilms.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (mcuFilms[i].year > mcuFilms[i+1].year) {
                [mcuFilms[i], mcuFilms[i+1]] = [mcuFilms[i+1], mcuFilms[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return mcuFilms;
}

// given an array of franchise titles (e.g. ["Lord of the Rings", "The Hobbit"]),
// return an array of film objects {"title", "rating", "year"},
// each object is a film in the given franchise.
// sorted by release year.
function getFranchise(filmData, titles) {

    // MCU and Bond franchises are dealt with differently,
    // hence they have their own functions
    if (titles[0] === "MCU") {
        return getMcuFilms(filmData)
    } else if (titles[0] === "James Bond") {
        return getBondFilms(filmData);
    }

    // else, the franchise is read more easily,
    // simply by checking if the film titles contain a specific substring,
    // e.g. checking for "Lord of the Rings" or "Harry Potter"
    let franchise = [];
    let len = filmData.length;

    for (let i = 0; i < len; i++) {
        // if the film title (e.g. lotr rotk) has a franchise (e.g. Lotr) as a substring
        if (containsSubstringArray(filmData[i].title, titles) === true) {
            franchise.push({"title" : filmData[i].title, "myRating" : filmData[i].myRating, "year" : filmData[i].year});
        }
    }

    // sort by release date.
    // bubble sort is used for algorithmic simplicity.

    let swapped = true; // flag
    len = franchise.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (franchise[i].year > franchise[i+1].year) {
                [franchise[i], franchise[i+1]] = [franchise[i+1], franchise[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return franchise;
}

// utility function that checks if an element in an array of substrings is contained in a source string
function containsSubstringArray(source, arrayOfSubstrings) {
    const len = arrayOfSubstrings.length;

    for (let i = 0; i < len; i++) {
        if (source.includes(arrayOfSubstrings[i]) === true) {
            return true;
        }
    }

    return false;
}

// given an array of franchise objects, return an array of
// the mean rating of each film in that franchise
function getFranchiseRatings(franchise) {
    let franchiseRatings = [];

    franchise.forEach(f => {
       franchiseRatings.push(f.myRating);
    });

    return franchiseRatings;
}

// given an array of franchise objects, return an array of
// the titles of each film in that franchise
function getFranchiseTitles(franchise) {
    let franchiseTitles = [];

    franchise.forEach(f => {
        franchiseTitles.push(f.title);
    });

    return franchiseTitles;
}
