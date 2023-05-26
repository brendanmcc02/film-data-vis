main();

async function main() {

    const response = await fetch("data/filmData.json");
    const filmData = await response.json();

    const imdbTop25Films = await getImdbTop25Films(filmData);
    const imdbTop25Titles = await getImdbTop25Titles(imdbTop25Films);
    const imdbTop25Ratings = await getImdbTop25Ratings(imdbTop25Films);

    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: imdbTop25Titles,
            datasets: [{
                label: 'Title',
                data: imdbTop25Ratings,
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
        })
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
       genre.ratingMean = Math.round((genre.ratingMean + Number.EPSILON) * 100) / 100
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
        })
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
        director.ratingMean = Math.round((director.ratingMean + Number.EPSILON) * 100) / 100
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
async function getMyTop25Ratings(myTop25Films) {
    let myTop25Ratings = [];

    myTop25Films.forEach(film => {
        myTop25Ratings.push(film.metacriticRating);
    });

    return myTop25Ratings;
}
