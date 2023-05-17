main();

async function main() {

    const response = await fetch("data/filmData.json");
    const filmData = await response.json();

    const directorFilms = await getDirectorFilms(filmData, "Christopher Nolan");
    const directorTitles = await getDirectorTitles(directorFilms);
    const directorRatings = await getDirectorRatings(directorFilms);

    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: directorTitles,
            datasets: [{
                label: 'Title',
                data: directorRatings,
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
                // y: {
                //     min: 0,
                //     max: 11
                // }
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
            if (directorFilms[i].year > directorFilms[i+1].directorFilms) {
                [directorFilms[i], directorFilms[i+1]] = [directorFilms[i+1], directorFilms[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return directorFilms;
}

async function getDirectorTitles(directorFilms) {
    let directorTitles = [];

    directorFilms.forEach(film => {
       directorTitles.push(film.title);
    });

    return directorTitles;
}

async function getDirectorRatings(directorFilms) {
    let directorRatings = [];

    directorFilms.forEach(film => {
        directorRatings.push(film.myRating);
    });

    return directorRatings;
}
