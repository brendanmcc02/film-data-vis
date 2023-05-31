main();

async function main() {

    // read filmData.json into a variable
    const response = await fetch("data/filmData.json");
    const filmData = await response.json();

    // get relevant data for graphs
    const runtimes = await getRuntimes(filmData);
    const runtimeLabels = await getRuntimeLabels(runtimes, 10);
    const runtimeRatings = await getRuntimeRatings(runtimes, 10);

    // plot the graph
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: runtimeLabels,
            datasets: [{
                label: 'Title',
                data: runtimeRatings,
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

// returns an array of genre objects {"genre", "ratingMean", "ratingSum", "ratingQuantity"},
// sorted by ratingMean (highest -> lowest)
async function getGenres(filmData) {
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
                genres[genreIndex].ratingSum += film.myRating;
                genres[genreIndex].ratingQuantity++;
                genres[genreIndex].ratingMean = genres[genreIndex].ratingSum / genres[genreIndex].ratingQuantity;
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
async function getGenreLabels(genres) {
    let genreLabels = [];

    genres.forEach(genre => {
       genreLabels.push(genre.genre);
    });

    return genreLabels;
}

// returns array of mean genre ratings (sorted highest->lowest)
async function getGenreRatings(genres) {
    let genreRatings = [];

    genres.forEach(genre => {
        genreRatings.push(genre.ratingMean);
    });

    return genreRatings;
}

// returns array of top k director labels with at least n films()
// sorted highest->lowest ratingMean
async function getTopKDirectorLabels(directors, k, n) {
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

// returns array of top k mean director ratings with at least n films()
// sorted highest->lowest ratingMean
async function getTopKDirectorRatings(directors, k, n) {
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

// returns an array of director objects {"director", "ratingMean", "ratingSum", "ratingQuantity"},
// sorted by ratingMean (highest -> lowest)
async function getDirectors(filmData) {
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
                directors[directorIndex].ratingSum += film.myRating;
                directors[directorIndex].ratingQuantity++;
                directors[directorIndex].ratingMean = directors[directorIndex].ratingSum / directors[directorIndex].ratingQuantity;
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
async function getDirectorFilms(filmData, director) {
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
async function getDirectorTitles(directorFilms) {
    let directorTitles = [];

    directorFilms.forEach(film => {
       directorTitles.push(film.title);
    });

    return directorTitles;
}

// given an array of sorted films by a director (oldest -> newest),
// return array of my ratings of those films
async function getDirectorRatings(directorFilms) {
    let directorRatings = [];

    directorFilms.forEach(film => {
        directorRatings.push(film.myRating);
    });

    return directorRatings;
}

// gets array of the top 25 films on imdb that I've rated
// sorted 1st -> 25th
async function getImdbTop25Films(filmData) {
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
async function getImdbTop25Titles(imdbTop25Films) {
    let imdbTop25Titles = [];

    imdbTop25Films.forEach(film => {
       imdbTop25Titles.push(film.title);
    });

    return imdbTop25Titles;
}

// given array of imdb top 25 films that I've rated,
// return my ratings of these films
async function getImdbTop25Ratings(imdbTop25Films) {
    let imdbTop25Ratings = [];

    imdbTop25Films.forEach(film => {
        imdbTop25Ratings.push(film.myRating);
    });

    return imdbTop25Ratings;
}

// gets array of my top 25 films,
// sorted by position (1st -> 25th)
async function getMyTop25Films(filmData) {
    let myTop25Films = [];

    filmData.forEach(film => {
       if (film.myPosition !== -1) {
           myTop25Films.push(film);
       }
    });

    // sort by position (1st -> 25th)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = myTop25Films.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (myTop25Films[i].myPosition > myTop25Films[i+1].myPosition) {
                [myTop25Films[i], myTop25Films[i+1]] = [myTop25Films[i+1], myTop25Films[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return myTop25Films;
}

// given array of my top 25 films,
// return an array of the titles of those films
async function getMyTop25Titles(myTop25Films) {
    let myTop25Titles = [];

    myTop25Films.forEach(film => {
       myTop25Titles.push(film.title);
    });

    return myTop25Titles;
}

// given array of my top 25 films,
// return an array of the imdb rating of those films
async function getMyTop25Ratings(myTop25Films) {
    let myTop25Ratings = [];

    myTop25Films.forEach(film => {
        myTop25Ratings.push(film.imDbRating);
    });

    return myTop25Ratings;
}

// given array of my top 25 films,
// return an array of the metascore of those films
async function getMyTop25Metascores(myTop25Films) {
    let myTop25Metascores = [];

    myTop25Films.forEach(film => {
        myTop25Metascores.push(film.metacriticRating);
    });

    return myTop25Metascores;
}

// returns an array of decade objects
// {"decade", "ratingMean", "ratingSum", "ratingQuantity"},
// sorted by decade (earliest -> latest)
async function getDecades(filmData) {
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
            decades[decadeIndex].ratingSum += film.myRating;
            decades[decadeIndex].ratingQuantity++;
            decades[decadeIndex].ratingMean = decades[decadeIndex].ratingSum / decades[decadeIndex].ratingQuantity;
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
async function getDecadeLabels(decades, n) {
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
async function getDecadeRatings(decades, n) {
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
async function getYears(filmData, n) {
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
            years[yearIndex].ratingSum += film.myRating;
            years[yearIndex].ratingQuantity++;
            years[yearIndex].ratingMean = years[yearIndex].ratingSum / years[yearIndex].ratingQuantity;
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
async function getMinYearIndex(years) {
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
async function getMaxYearIndex(years) {
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
async function getYearLabels(years, minYear, maxYear) {
    let yearLabels = [];

    for (let y = minYear; y <= maxYear; y++) {
        yearLabels.push(years[y].year);
    }

    return yearLabels;
}

// returns array of myRating of each year
// (sorted earliest -> latest year)
async function getYearRatings(years, minYear, maxYear) {
    let yearRatings = [];

    for (let y = minYear; y <= maxYear; y++) {
        yearRatings.push(years[y].ratingMean);
    }

    return yearRatings;
}

// returns an array of runtime objects:
// {"runtime", "inequality" "ratingSum", "ratingQuantity", "ratingMean"}
// sorted by runtime.
async function getRuntimes(filmData) {
    // initialise an array 'runtimes' in the format above
    let runtimes = await initRuntimes();

    // for each film, modify the relevant entry in the 'runtimes'
    // array, modifying the quantity, sum, and mean of that runtime interval.
    const len = runtimes.length;
    filmData.forEach(film => {
        for (let r = 0; r < len; r++) {
            if ( (runtimes[r].inequality === "<" && film.runtimeMins < runtimes[r].runtime)
                 || (runtimes[r].inequality === ">=" && film.runtimeMins >= runtimes[r].runtime) ) {
                runtimes[r].ratingSum += film.myRating;
                runtimes[r].ratingQuantity++;
                runtimes[r].ratingMean = runtimes[r].ratingSum / runtimes[r].ratingQuantity;
                r = len; // break
            }
        }
    });

    // round each ratingMean to 2 decimal places
    // (only if it's not null)
    runtimes.forEach(runtime => {
        if (runtime.ratingMean !== 0) {
            runtime.ratingMean = Math.round((runtime.ratingMean + Number.EPSILON) * 100) / 100;
        }
    });

    return runtimes;
}

// initialises the runtime array.
// adds 7 intervals: <60, <90, ..., <210, <240.
// then adds a final 8th interval: >240
async function initRuntimes() {
    let runtimes = [];

    for (let r = 60; r <= 240; r+=30) {
        runtimes.push({"runtime" : r, "inequality": "<",
            "ratingSum" : 0, "ratingQuantity" : 0, "ratingMean" : 0});
    }

    runtimes.push({"runtime" : 240, "inequality" : ">=",
        "ratingSum" : 0, "ratingQuantity" : 0, "ratingMean" : 0});

    return runtimes;
}

// given an array of runtime objects,
// returns the runtime labels if it has >= n films.
async function getRuntimeLabels(runtimes, n) {
    let runtimeLabels = [];

    runtimes.forEach(runtime => {
        if (runtime.ratingQuantity >= n) {
            runtimeLabels.push(runtime.runtime);
        }
    });

    return runtimeLabels;
}

// given an array of runtime objects,
// returns the runtime meanRatings if it has >= n films.
async function getRuntimeRatings(runtimes, n) {
    let runtimeRatings = [];

    runtimes.forEach(runtime => {
        if (runtime.ratingQuantity >= n) {
            runtimeRatings.push(runtime.ratingMean);
        }
    });

    return runtimeRatings;
}

// given an array of runtimes,
// returns an array of runtimeQuantities,
// sorted by runtime (i.e: 90, 120, ..., 210, 240
async function getRuntimeQuantities(runtimes) {
    let runtimeQuantities = [];

    runtimes.forEach(runtime => {
        if (runtime.ratingQuantity > 0) {
            runtimeQuantities.push(runtime.ratingQuantity);
        }
    })

    return runtimeQuantities;
}
