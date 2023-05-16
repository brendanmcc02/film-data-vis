main();

async function main() {

    const response = await fetch("data/filmData.json");
    const filmData = await response.json();

    const genres = await getGenres(filmData);
    const genreLabels = await getGenreLabels(genres);
    const genreRatings = await getGenreRatings(genres);

    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: genreLabels,
            datasets: [{
                label: 'Title',
                data: genreRatings,
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

async function getGenreLabels(genres) {
    let genreLabels = [];

    genres.forEach(genre => {
       genreLabels.push(genre.genre);
    });

    return genreLabels;
}

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
    })

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

// need:
// array of genre labels (top 5, highest to lowest)
// array of genre ratings (top 5, highest to lowest)
