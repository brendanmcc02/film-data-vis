main();

async function main() {
    console.log("test");
    const top5Genres = await getTop5Genres();
    const top5GenreRatings = await getTop5GenreRatings();

    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top5Genres,
            datasets: [{
                label: 'Title',
                data: top5GenreRatings,
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

    const quantityGenres = await getQuantityGenres();
    const genresSorted = await getGenresSorted();
    console.log(quantityGenres, genresSorted);
}

// returns array of clean data
async function getData() {
    const response = await fetch('data/ratings.csv');
    const dataRaw = await response.text();

    // splitting data into rows, and removing column headers
    let data = dataRaw.split('\n').slice(1);

    // removing last row if empty
    if (data[data.length - 1] === '') {
        data.pop();
    }

    // splitting rows into columns
    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        row = row.split(',');
        // concatenating title if commas are in it
        if (row[3].includes('"')) {
            row[3] = row[3].replace('"', '');
            row[3] += ",";

            let searchingEndQuotationMark = true;
            while (searchingEndQuotationMark) {
                if (row[4].includes('"')) {
                    row[4] = row[4].replace('"', '');
                    searchingEndQuotationMark = false;
                } else {
                    row[4] += ",";
                }

                row[3] += row[4];
                row.splice(4, 1);
            }
        }
        data[i] = row;
    }

    // removing TV episodes, series, and shorts
    for (let i = 0; i < data.length; i++) {
        let row = data[i];

        if (row[5] != "movie") {
            data.splice(i, 1);
            i--;
        }
    }

    // concatenating genres into one sub-array
    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        row[9] = [row[9]];
        if (row[9][0].includes('"')) {
            row[9][0] = row[9][0].replace('"', '');

            let searchingEndQuotationMark = true;
            while (searchingEndQuotationMark) {
                if (row[10].includes('"')) {
                    row[10] = row[10].replace('"', '');
                    searchingEndQuotationMark = false;
                }

                row[10] = row[10].replace(' ', '');
                row[9].push(row[10]);
                row.splice(10, 1);
            }
            data[i] = row;
        }
    }

    // removing documentaries
    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        if (row[9].includes("Documentary")) {
            data.splice(i, 1);
        }
    }

    // concatenating directors into one sub-array
    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        row[12] = [row[12]];
        if (row[12][0].includes('"')) {
            row[12][0] = row[12][0].replace('"', '');

            let searchingEndQuotationMark = true;
            while (searchingEndQuotationMark) {
                if (row[13].includes('"')) {
                    row[13] = row[13].replace('"', '');
                    searchingEndQuotationMark = false;
                }

                row[13] = row[13].replace(' ', '');
                row[12].push(row[13]);
                row.splice(13, 1);
            }
            data[i] = row;
        }
    }

    // removing dateRated, URL, titleType, releaseDate
    for (let i = 0; i < data.length; i++) {
        let row = data[i];

        row.splice(11, 1); // releaseDate
        row.splice(10, 1); // imdbVotes
        row.splice(5, 1);  // titleType
        row.splice(4, 1);  // URL
        row.splice(2, 1);  // dateRated

        data[i] = row;
    }

    return data;
}

// returns array of titles
async function getTitles() {
    const data = await getData();
    let titles = [];

    data.forEach(row => {
        titles.push(row[2])
    });

    return titles;
}

// returns array of my ratings (type: int)
async function getMyRatings() {
    const data = await getData();
    let myRatings = [];

    data.forEach(row => {
        myRatings.push(parseInt(row[1]))
    });

    return myRatings;
}

// returns 2D-array of genres of each film
async function getGenres() {
    const data = await getData();
    let genres = [];

    data.forEach(row => {
        genres.push(row[6]);
    });

    return genres;
}

// returns array of genres (sorted alphabetically)
async function getGenresSorted() {
    const genres = await getGenres();
    let genresSorted = [];

    for (let i = 0; i < genres.length; i++) {
        for (let j = 0; j < genres[i].length; j++) {
            if (!genresSorted.includes(genres[i][j])) {
                genresSorted.push(genres[i][j]);
            }
        }
    }

    return genresSorted.sort();
}

// returns array of quantity of films per genre (sorted alphabetically)
async function getQuantityGenres() {
    const genres = await getGenres();
    const genresSorted = await getGenresSorted();

    let quantityGenres = [];

    for (let i = 0; i < genresSorted.length; i++) {
        quantityGenres[i] = 0;
    }

    for (let i = 0; i < genres.length; i++) {
        for (let j = 0; j < genres[i].length; j++) {
            let index = genresSorted.indexOf(genres[i][j]);
            quantityGenres[index] += 1;
        }
    }

    return quantityGenres;
}

// returns array of mean genre ratings (type: float; sorted alphabetically)
async function getMeanGenreRatings() {
    const genres = await getGenres();
    const myRatings = await getMyRatings();
    const genresSorted = await getGenresSorted();
    const quantityGenres = await getQuantityGenres();

    let meanGenreRatings = [];
    let sumGenres = [];

    // initialise arrays
    for (let i = 0; i < genresSorted.length; i++) {
        meanGenreRatings[i] = 0;
        sumGenres[i] = 0;
    }

    for (let i = 0; i < genres.length; i++) {
        let myRating = parseInt(myRatings[i]);

        for (let j = 0; j < genres[i].length; j++) {
            let index = genresSorted.indexOf(genres[i][j]);
            sumGenres[index] += myRating;
        }
    }

    for (let i = 0; i < meanGenreRatings.length; i++) {
        meanGenreRatings[i] = Math.round((sumGenres[i] / quantityGenres[i]) * 10) / 10;
    }

    return meanGenreRatings;
}

// returns array of top 5 genre ratings (sorted descending)
async function getTop5GenreRatings() {
    let meanGenreRatings = await getMeanGenreRatings();

    let top5GenreRatings = [];

    for (let i = 0; i < 5; i++) {
        let highestRating = meanGenreRatings[0];
        let highestRatingIndex = 0;

        for (let j = 1; j < meanGenreRatings.length; j++) {
            if (highestRating < meanGenreRatings[j]) {
                highestRating = meanGenreRatings[j];
                highestRatingIndex = j;
            }
        }
        top5GenreRatings.push(highestRating);
        meanGenreRatings.splice(highestRatingIndex, 1);
    }

    return top5GenreRatings;
}

// returns array of top 5 genres (sorted descending)
async function getTop5Genres() {
    const top5GenreRatings = await getTop5GenreRatings();
    let genresSorted = await getGenresSorted();
    let meanGenreRatings = await getMeanGenreRatings();

    let top5Genres = [];
    let ratingIndex = 0;

    for (let i = 0; i < top5GenreRatings.length; i++) {
        let rating = top5GenreRatings[i];

        ratingIndex = meanGenreRatings.indexOf(rating);
        top5Genres.push(genresSorted[ratingIndex]);
        genresSorted.splice(ratingIndex, 1);
        meanGenreRatings.splice(ratingIndex, 1);
    }

    return top5Genres;
}

// returns array of bottom 5 genre ratings (sorted descending)
async function getBottom5GenreRatings() {
    let meanGenreRatings = await getMeanGenreRatings();

    let bottom5GenreRatings = [];

    for (let i = 0; i < 5; i++) {
        let lowestRating = meanGenreRatings[0];
        let lowestRatingIndex = 0;

        for (let j = 1; j < meanGenreRatings.length; j++) {
            if (lowestRating > meanGenreRatings[j]) {
                lowestRating = meanGenreRatings[j];
                lowestRatingIndex = j;
            }
        }
        bottom5GenreRatings.push(lowestRating);
        meanGenreRatings.splice(lowestRatingIndex, 1);
    }

    return bottom5GenreRatings;
}

// returns array of bottom 5 genres (sorted descending)
async function getBottom5Genres() {
    const bottom5GenreRatings = await getBottom5GenreRatings();
    let genresSorted = await getGenresSorted();
    let meanGenreRatings = await getMeanGenreRatings();

    let bottom5Genres = [];
    let ratingIndex = 0;

    for (let i = 0; i < bottom5GenreRatings.length; i++) {
        let rating = bottom5GenreRatings[i];

        ratingIndex = meanGenreRatings.indexOf(rating);
        bottom5Genres.push(genresSorted[ratingIndex]);
        genresSorted.splice(ratingIndex, 1);
        meanGenreRatings.splice(ratingIndex, 1);
    }

    return bottom5Genres;
}

// returns array of release years (type: int)
async function getYears() {
    const data = await getData();
    let years = [];

    data.forEach(row => {
        years.push(parseInt(row[5]));
    });

    return years;
}

// returns array of directors (sorted alphabetically)
async function getDirectors() {
    const data = await getData();
    let directors = [];

    data.forEach(row => {
        for (let i = 0; i < row[7].length; i++) {
            if (!directors.includes(row[7][i])) {
                directors.push(row[7][i]);
            }
        }
    });

    directors = directors.sort();

    return directors;
}

// returns array of quantity of films per director (sorted alphabetically)
async function getQuantityDirectors() {
    const data = await getData();
    const directors = await getDirectors();

    let quantityDirectors = [];

    for (let i = 0; i < directors.length; i++) {
        quantityDirectors[i] = 0;
    }

    data.forEach(row => {
        for (let i = 0; i < row[7].length; i++) {
            let index = directors.indexOf(row[7][i]);
            quantityDirectors[index] += 1;
        }
    });

    return quantityDirectors;
}

// returns array of mean director ratings (type: int; sorted alphabetically)
async function getMeanDirectorRatings() {
    const data = await getData();
    const directors = await getDirectors();
    const quantityDirectors = await getQuantityDirectors();

    let meanDirectorRatings = [];
    let sumDirectors = [];

    // initialise arrays
    for (let i = 0; i < directors.length; i++) {
        meanDirectorRatings[i] = 0;
        sumDirectors[i] = 0;
    }

    data.forEach(row => {
        let rating = parseInt(row[1]);

        for (let i = 0; i < row[7].length; i++) {
            let index = directors.indexOf(row[7][i]);
            sumDirectors[index] += rating;
        }
    });

    for (let i = 0; i < meanDirectorRatings.length; i++) {
        meanDirectorRatings[i] = Math.round((sumDirectors[i] / quantityDirectors[i]) * 10) / 10;
    }

    return meanDirectorRatings;
}

// returns array of top 5 director ratings (with at least 5 films; sorted descending)
async function getTop5DirectorRatings() {
    let quantityDirectors = await getQuantityDirectors();
    let meanDirectorRatings = await getMeanDirectorRatings();

    let top5DirectorRatings = [];

    // remove directors with less than 5 films
    for (let i = 0; i < quantityDirectors.length; i++) {
        if (quantityDirectors[i] < 5) {
            meanDirectorRatings.splice(i, 1);
            quantityDirectors.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < 5; i++) {
        let highestRating = meanDirectorRatings[0];
        let highestRatingIndex = 0;

        for (let j = 1; j < meanDirectorRatings.length; j++) {
            if (highestRating < meanDirectorRatings[j]) {
                highestRating = meanDirectorRatings[j];
                highestRatingIndex = j;
            }
        }
        top5DirectorRatings.push(highestRating);
        meanDirectorRatings.splice(highestRatingIndex, 1);
    }

    return top5DirectorRatings;
}

// returns array of top 5 directors (with at least 5 films; sorted descending)
async function getTop5Directors() {
    const top5DirectorRatings = await getTop5DirectorRatings();
    let directors = await getDirectors();
    let quantityDirectors = await getQuantityDirectors();
    let meanDirectorRatings = await getMeanDirectorRatings();

    let top5Directors = [];

    // remove directors with less than 5 films
    for (let i = 0; i < directors.length; i++) {
        if (quantityDirectors[i] < 5) {
            directors.splice(i, 1);
            meanDirectorRatings.splice(i, 1);
            quantityDirectors.splice(i, 1);
            i--;
        }
    }

    let ratingIndex = 0;

    for (let i = 0; i < top5DirectorRatings.length; i++) {
        let rating = top5DirectorRatings[i];

        ratingIndex = meanDirectorRatings.indexOf(rating);
        top5Directors.push(directors[ratingIndex]);
        directors.splice(ratingIndex, 1);
        meanDirectorRatings.splice(ratingIndex, 1);
    }

    return top5Directors;
}

// returns array of imdb ratings (type: float)
async function getImdbRatings() {
    const data = await getData();
    let imdbRatings = [];

    data.forEach(row => {
        imdbRatings.push(parseFloat(row[3]));
    });

    return imdbRatings;
}

// returns array of top 25 imdb ratings
async function getTop25ImdbRatings() {
    let imdbRatings = await getImdbRatings();

    let top25ImdbRatings = [];

    for (let i = 0; i < 25; i++) {
        let highestRating = imdbRatings[0];
        let highestRatingIndex = 0;

        for (let j = 1; j < imdbRatings.length; j++) {
            if (highestRating < imdbRatings[j]) {
                highestRating = imdbRatings[j];
                highestRatingIndex = j;
            }
        }
        top25ImdbRatings.push(highestRating);
        imdbRatings.splice(highestRatingIndex, 1);
    }

    return top25ImdbRatings;
}

// returns array of top 25 imdb titles
async function getTop25ImdbTitles() {
    const top25ImdbRatings = await getTop25ImdbRatings();
    let titles = await getTitles();
    let imdbRatings = await getImdbRatings();

    let top25ImdbTitles = [];

    let ratingIndex = 0;

    for (let i = 0; i < top25ImdbRatings.length; i++) {
        let rating = top25ImdbRatings[i];

        ratingIndex = imdbRatings.indexOf(rating);
        top25ImdbTitles.push(titles[ratingIndex]);
        titles.splice(ratingIndex, 1);
        imdbRatings.splice(ratingIndex, 1);
    }

    return top25ImdbTitles;
}

// returns array of my rating of top 25 imdb films
async function getMyRatingTop25Imdb() {
    const top25ImdbTitles = await getTop25ImdbTitles();
    const titles = await getTitles();
    const myRatings = await getMyRatings();

    let myRatingTop25Imdb = [];

    top25ImdbTitles.forEach(title => {
        let index = titles.indexOf(title);
        myRatingTop25Imdb.push(myRatings[index]);
    });

    return myRatingTop25Imdb;
}

// returns array of my top 25 ratings
async function getMyTop25Ratings() {
    let myRatings = await getMyRatings();

    let myTop25Ratings = [];

    for (let i = 0; i < 25; i++) {
        let highestRating = myRatings[0];
        let highestRatingIndex = 0;

        for (let j = 1; j < myRatings.length; j++) {
            if (highestRating < myRatings[j]) {
                highestRating = myRatings[j];
                highestRatingIndex = j;
            }
        }
        myTop25Ratings.push(highestRating);
        myRatings.splice(highestRatingIndex, 1);
    }

    return myTop25Ratings;
}

// returns array of my top 25 titles
async function getMyTop25Titles() {
    const myTop25Ratings = await getMyTop25Ratings();
    let titles = await getTitles();
    let myRatings = await getMyRatings();

    let myTop25Titles = [];

    let ratingIndex = 0;

    for (let i = 0; i < myTop25Ratings.length; i++) {
        let rating = myTop25Ratings[i];

        ratingIndex = myRatings.indexOf(rating);
        myTop25Titles.push(titles[ratingIndex]);
        titles.splice(ratingIndex, 1);
        myRatings.splice(ratingIndex, 1);
    }

    return myTop25Titles;
}

// returns array of imdb rating of my top 25 films
async function getImdbRatingMyTop25() {
    const myTop25Titles = await getMyTop25Titles();
    const titles = await getTitles();
    const imdbRatings = await getImdbRatings();

    let imdbRatingMyTop25 = [];

    myTop25Titles.forEach(title => {
        let index = titles.indexOf(title);
        imdbRatingMyTop25.push(imdbRatings[index]);
    });

    return imdbRatingMyTop25;
}

// returns array of quantity of films per decade
async function getQuantityDecades() {
    const data = await getData();

    let quantityDecades = [];
    let decades = [];

    for (year = 1880; year < 2030; year += 10) {
        decades.push(year);
    }

    for (let i = 0; i < decades.length; i++) {
        quantityDecades[i] = 0;
    }

    data.forEach(row => {
        for (let year = 1880; year < 2030; year += 10) {
            if (row[5] < year + 10) {
                let index = decades.indexOf(year);
                quantityDecades[index]++;
                year = 2030;
            }
        }
    });

    return quantityDecades;
}

// returns array of decades (with at least 10 films)
async function getDecades() {
    let quantityDecades = await getQuantityDecades();

    let decades = [];

    for (let i = 0; i < quantityDecades.length; i++) {
        if (quantityDecades[i] > 9) {
            decades.push(1880 + (i * 10));
        }
    }

    return decades;
}

// returns array of mean decade ratings (type: float)
async function getMeanDecadeRatings() {
    const data = await getData();
    const decades = await getDecades();
    let quantityDecades = await getQuantityDecades();

    let meanDecadeRatings = [];
    let sumDecades = [];

    // initialise arrays
    for (let i = 0; i < decades.length; i++) {
        meanDecadeRatings[i] = 0;
        sumDecades[i] = 0;
    }

    data.forEach(row => {
        let rating = parseInt(row[1]);
        let decade = parseInt(row[5] / 10) * 10;
        let index = decades.indexOf(decade);
        if (index !== -1) {
            sumDecades[index] += rating;
        }
    });

    for (let i = 0; i < quantityDecades.length; i++) {
        if (quantityDecades[i] < 10) {
            quantityDecades.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < meanDecadeRatings.length; i++) {
        meanDecadeRatings[i] = Math.round((sumDecades[i] / quantityDecades[i]) * 10) / 10;
    }

    return meanDecadeRatings;
}

// returns array of runtimes (type: int)
async function getRuntimes() {
    const data = await getData();
    let runtimes = [];

    data.forEach(row => {
        runtimes.push(parseInt(row[4]));
    });

    return runtimes;
}

// returns array of quantity of films per runtime interval (<90, <120, ..., <210, <240)
async function getQuantityRuntimes() {
    const runtimes = await getRuntimes();

    let quantityRuntimes = [];
    let runtimeIntervals = [];

    for (let runtimeInterval = 90; runtimeInterval < 270; runtimeInterval += 30) {
        runtimeIntervals.push(runtimeInterval);
    }

    // initialising array
    for (let i = 0; i < runtimeIntervals.length; i++) {
        quantityRuntimes[i] = 0;
    }

    runtimes.forEach(runtime => {
        for (let runtimeInterval = 90; runtimeInterval < 270; runtimeInterval += 30) {
            if (runtime < runtimeInterval) {
                let index = runtimeIntervals.indexOf(runtimeInterval);
                quantityRuntimes[index]++;
                runtimeInterval = 270;
            }
        }
    });

    return quantityRuntimes;
}

// returns array of runtime intervals (with at least 10 films)
async function getRuntimeIntervals() {
    const quantityRuntimes = await getQuantityRuntimes();

    let runtimeIntervals = [];

    for (let i = 0; i < quantityRuntimes.length; i++) {
        if (quantityRuntimes[i] > 9) {
            runtimeIntervals.push(90 + (i * 30));
        }
    }

    return runtimeIntervals;
}

// returns array of mean runtime ratings (with at least 10 films; type: float)
async function getMeanRuntimeRatings() {
    const myRatings = await getMyRatings();
    const runtimes = await getRuntimes();
    const runtimeIntervals = await getRuntimeIntervals();
    const quantityRuntimes = await getQuantityRuntimes();

    let meanRuntimeRatings = [];
    let sumRuntimes = [];

    // initialise arrays
    for (let i = 0; i < quantityRuntimes.length; i++) {
        meanRuntimeRatings[i] = 0;
        sumRuntimes[i] = 0;
    }

    for (let i = 0; i < quantityRuntimes.length; i++) {
        if (quantityRuntimes[i] < 10) {
            quantityRuntimes.splice(i, 1);
            meanRuntimeRatings.splice(i, 1);
            sumRuntimes.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < runtimes.length; i++) {
        let myRating = myRatings[i];
        for (let runtime = 90; runtime < 270; runtime += 30) {
            if (runtimes[i] < runtime) {
                let index = runtimeIntervals.indexOf(runtime);
                sumRuntimes[index] += myRating;
                runtime = 270;
            }
        }
    }

    for (let i = 0; i < meanRuntimeRatings.length; i++) {
        meanRuntimeRatings[i] = Math.round((sumRuntimes[i] / quantityRuntimes[i]) * 10) / 10;
    }

    return meanRuntimeRatings;
}
