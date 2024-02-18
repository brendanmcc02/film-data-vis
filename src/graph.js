graph();

async function graph() {

    // read filmData.json into a variable
    const response = await fetch("../data/filmData.json");
    const filmData = await response.json();

    // get relevant data for graphs

    // mean genre ratings
    const base_genres = getGenres(filmData);
    const labels_genres = getGenreLabels(base_genres, 5);
    const data_genres = getGenreRatings(base_genres, 5);

    // genre quantities
    const labels_genres_quant = getGenreLabels(base_genres, 1);
    const data_genres_quant = getGenreQuantities(base_genres);

    // directors
    const base_directors = getDirectors(filmData);
    const labels_directors = getTopKDirectorLabels(base_directors, 5, 5);
    const data_directors = getTopKDirectorRatings(base_directors, 5, 5);

    // Christopher Nolan
    const base_nolan = getDirectorFilms(filmData, "Christopher Nolan");
    const labels_nolan = getDirectorTitles(base_nolan);
    const data_nolan = getDirectorRatings(base_nolan);

    // Denis Villeneuve
    const base_villeneuve = getDirectorFilms(filmData, "Denis Villeneuve");
    const labels_villeneuve = getDirectorTitles(base_villeneuve);
    const data_villeneuve = getDirectorRatings(base_villeneuve);

    // actors
    const base_actors = getActors(filmData);
    // console.log(base_actors);
    const labels_actors = getTopKActorLabels(base_actors, 5, 5);
    const data_actors = getTopKActorRatings(base_actors, 5, 5);

    // ryan gosling
    const base_gosling = getActorFilms(filmData, "Ryan Gosling");
    const labels_gosling = getActorTitles(base_gosling);
    const data_gosling = getActorRatings(base_gosling);

    // my rating of imdb top 25
    const base_imdbtop25 = getImdbTop25Films(filmData);
    const labels_imdbtop25 = getImdbTop25Titles(base_imdbtop25);
    const data_imdbtop25 = getImdbTop25Ratings(base_imdbtop25);

    // imdb rating & metascore of my top 10
    const base_mytop10 = getMyTop10Films(filmData);
    const labels_mytop10 = getMyTop10Titles(base_mytop10);
    const data_mytop10imdb = getMyTop10Ratings(base_mytop10);
    const data_mytop10meta = getMyTop10Metascores(base_mytop10);

    // mean decade rating
    const base_decade = getDecades(filmData);
    const labels_decade = getDecadeLabels(base_decade, 10);
    const data_decade = getDecadeRatings(base_decade, 10);
    const labels_decade_quant = getDecadeLabels(base_decade, 1);
    const quant_decade = getDecadeQuantities(base_decade);

    // english-spoken vs international films
    const base_engint = getEnglishInternationalFilms(filmData);
    const labels_engint = getEnglishInternationalLabels(base_engint);
    const data_engint = getEnglishInternationalRatings(base_engint);

    // watched in cinema
    const base_cinema = getCinemaFilms(filmData);
    const labels_cinema = getCinemaLabels(base_cinema);
    const ratings_cinema = getCinemaRatings(base_cinema);

    // mcu
    const base_mcu = getFranchise(filmData, ["MCU"]);
    const labels_mcu = getFranchiseTitles(base_mcu);
    const rating_mcu = getFranchiseRatings(base_mcu);

    // hp
    const base_hp = getFranchise(filmData, ["Harry Potter", "Fantastic Beasts"]);
    const labels_hp = getFranchiseTitles(base_hp);
    const rating_hp = getFranchiseRatings(base_hp);

    // star wars
    const base_sw = getFranchise(filmData, ["Star Wars", "Rogue One"]);
    const labels_sw = getFranchiseTitles(base_sw);
    const rating_sw = getFranchiseRatings(base_sw);

    // myRating dist
    const base_myRating = getMyRatings(filmData);
    const labels_myRating = getMyRatingLabels(base_myRating);
    const data_myRating = getMyRatingQuantities(base_myRating);

    // plot the graphs
    const ctx_1 = document.getElementById('mean-genre-rating');
    new Chart(ctx_1, {
        type: 'bar',
        data: {
            labels: labels_genres,
            datasets: [{
                data: data_genres,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Genres',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Mean Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_2 = document.getElementById('quant-genre');
    new Chart(ctx_2, {
        type: 'doughnut',
        data: {
            labels: labels_genres_quant,
            datasets: [{
                data: data_genres_quant,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_3 = document.getElementById('directors');
    new Chart(ctx_3, {
        type: 'bar',
        data: {
            labels: labels_directors,
            datasets: [{
                data: data_directors,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Directors',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Mean Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_4 = document.getElementById('nolan');
    new Chart(ctx_4, {
        type: 'line',
        data: {
            labels: labels_nolan,
            datasets: [{
                data: data_nolan,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                radius: 5,
                hoverRadius: 10,
                hoverBorderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Film',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_5 = document.getElementById('villeneuve');
    new Chart(ctx_5, {
        type: 'line',
        data: {
            labels: labels_villeneuve,
            datasets: [{
                data: data_villeneuve,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                radius: 5,
                hoverRadius: 10,
                hoverBorderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Film',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_6 = document.getElementById('actors');
    new Chart(ctx_6, {
        type: 'bar',
        data: {
            labels: labels_actors,
            datasets: [{
                data: data_actors,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Actors',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Mean Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_7 = document.getElementById('gosling');
    new Chart(ctx_7, {
        type: 'line',
        data: {
            labels: labels_gosling,
            datasets: [{
                data: data_gosling,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                radius: 5,
                hoverRadius: 10,
                hoverBorderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Film',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_8 = document.getElementById('imdb-top-25');
    new Chart(ctx_8, {
        type: 'line',
        data: {
            labels: labels_imdbtop25,
            datasets: [{
                data: data_imdbtop25,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                radius: 5,
                hoverRadius: 10,
                hoverBorderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Film',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'My Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_9 = document.getElementById('imdb-top-10');
    new Chart(ctx_9, {
        type: 'bar',
        data: {
            labels: labels_mytop10,
            datasets: [{
                data: data_mytop10imdb,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'My Top 10 Films',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'IMDB Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_10 = document.getElementById('meta-top-10');
    new Chart(ctx_10, {
        type: 'bar',
        data: {
            labels: labels_mytop10,
            datasets: [{
                data: data_mytop10meta,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'My Top 10 Films',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Metascore',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_11 = document.getElementById('decade');
    new Chart(ctx_11, {
        type: 'bar',
        data: {
            labels: labels_decade,
            datasets: [{
                data: data_decade,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Decade',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Mean Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_115 = document.getElementById('quant-decade');
    new Chart(ctx_115, {
        type: 'doughnut',
        data: {
            labels: labels_decade_quant,
            datasets: [{
                data: quant_decade,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_15 = document.getElementById('rating-eng-int');
    new Chart(ctx_15, {
        type: 'bar',
        data: {
            labels: labels_engint,
            datasets: [{
                data: data_engint,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Film Type',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Mean Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_17 = document.getElementById('rating-cinema');
    new Chart(ctx_17, {
        type: 'bar',
        data: {
            labels: labels_cinema,
            datasets: [{
                data: ratings_cinema,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Film Type',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Mean Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_21 = document.getElementById('mcu');
    new Chart(ctx_21, {
        type: 'line',
        data: {
            labels: labels_mcu,
            datasets: [{
                data: rating_mcu,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                radius: 5,
                hoverRadius: 10,
                hoverBorderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Film',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_24 = document.getElementById('hp');
    new Chart(ctx_24, {
        type: 'line',
        data: {
            labels: labels_hp,
            datasets: [{
                data: rating_hp,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                radius: 5,
                hoverRadius: 10,
                hoverBorderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Film',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_25 = document.getElementById('sw');
    new Chart(ctx_25, {
        type: 'line',
        data: {
            labels: labels_sw,
            datasets: [{
                data: rating_sw,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                radius: 5,
                hoverRadius: 10,
                hoverBorderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Film',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Rating',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const ctx_26 = document.getElementById('dist');
    new Chart(ctx_26, {
        type: 'bar',
        data: {
            labels: labels_myRating,
            datasets: [{
                data: data_myRating,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(175, 125, 255, 0.3)',
                    'rgba(255, 205, 86, 0.3)',
                    'rgba(20, 20, 235, 0.3)'
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(175, 125, 255, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(20, 20, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(175, 125, 255, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(20, 20, 235, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(175, 125, 255, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(20, 20, 235, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Rating',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    min: 0,
                    title: {
                        display: true,
                        text: 'Number of Films',
                        font: {
                            size: 20
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
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
        film.genres.forEach(genre => {
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

// returns array of genre labels (sorted highest->lowest ratingMean, with >= n films)
function getGenreLabels(genres, n) {
    let genreLabels = [];

    genres.forEach(genre => {
        if (genre.ratingQuantity >= n) {
            genreLabels.push(genre.genre);
        }
    });

    return genreLabels;
}

// returns array of mean genre ratings (sorted highest->lowest)
function getGenreRatings(genres, n) {
    let genreRatings = [];

    genres.forEach(genre => {
        if (genre.ratingQuantity >= n) {
            genreRatings.push(genre.ratingMean);
        }
    });

    return genreRatings;
}

// returns array of quantity of films watched per genre (sorted highest -> lowest in meanRating)
function getGenreQuantities(genres) {
    let genreQuantities = [];

    genres.forEach(genre => {
        if (genre.ratingQuantity > 0) {
            genreQuantities.push(genre.ratingQuantity);
        }
    });

    return genreQuantities;
}

// returns an array of director objects {"director", "ratingMean", "ratingSum", "ratingQuantity"},
// sorted by ratingMean (highest -> lowest)
function getDirectors(filmData) {
    let directors = [];

    filmData.forEach(film => {
        film.directors.forEach(director => {
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
        if(film.directors.includes(director)) {
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
        film.actors.forEach(actor => {
            let actorIndex = getActorIndex(actors, actor);
            // actor not in array
            if (actorIndex === -1) {
                actors.push({"actorName" : actor, "ratingMean" : film.myRating,
                    "ratingSum" : film.myRating, "ratingQuantity" : 1});
            }
            // actor is in array
            else {
                console.log("hi")
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
        film.actors.forEach(actor => {
            if(actor === actorName) {
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

    const len = filmData.length;

    for (let count = 0; count < 25; count++) {
        let maxFilm = {};
        // ensure the initial maxFilm is not in imdbTop25Films
        for (let i = 0; i < len; i++) {
            if (!arrayContainsTitle(imdbTop25Films, filmData[i].title)) {
                maxFilm = filmData[i];
            }
        }
        for (let i = 0; i < len; i++) {
            if (filmData[i].imdbRating > maxFilm.imdbRating
                    && !arrayContainsTitle(imdbTop25Films, filmData[i].title)) {
                maxFilm = filmData[i];
            }
        }

        imdbTop25Films.push(maxFilm);
    }

    return imdbTop25Films;
}

// utility function that checks if an array of film objects contains a given film title
function arrayContainsTitle(array, title) {
    const len = array.length;

    for (let i = 0; i < len; i++) {
        if (array[i].title === title) {
            return true;
        }
    }

    return false;
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
        if (film.myTop10Position !== -1) {
            myTop10Films.push(film);
        }
    });

    // sort by position (1st -> 10th)
    // bubble sort is used for its algorithmic simplicity.
    // also because the array is not large,
    // so time complexity is not an issue

    let swapped = true; // flag
    const len = myTop10Films.length - 1;

    // continually make passes until the array is sorted
    while (swapped) {
        swapped = false;

        for (let i = 0; i < len; i++) {
            if (myTop10Films[i].myTop10Position > myTop10Films[i+1].myTop10Position) {
                [myTop10Films[i], myTop10Films[i+1]] = [myTop10Films[i+1], myTop10Films[i]] // swap
                swapped = true; // signal flag
            }
        }
    }

    return myTop10Films;
}

// given array of my top 10 films,
// return an array of the titles of those films
function getMyTop10Titles(myTop10Films) {
    let myTop10Titles = [];

    myTop10Films.forEach(film => {
        myTop10Titles.push(film.title);
    });

    return myTop10Titles;
}

// given array of my top 10 films,
// return an array of the imdb rating of those films
function getMyTop10Ratings(myTop10Films) {
    let myTop10Ratings = [];

    myTop10Films.forEach(film => {
        myTop10Ratings.push(film.imdbRating);
    });

    return myTop10Ratings;
}

// given array of my top 25 films,
// return an array of the metascore of those films
function getMyTop10Metascores(myTop10Films) {
    let myTop10Metascores = [];

    myTop10Films.forEach(film => {
        myTop10Metascores.push(film.metascore);
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

// returns array of decade ratingQuantity
// (sorted earliest->latest decade)
function getDecadeQuantities(decades) {
    let decadeQuantites = [];

    decades.forEach(decade => {
        if (decade.ratingQuantity > 0) {
            decadeQuantites.push(decade.ratingQuantity);
        }
    });

    return decadeQuantites;
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
        if (!film.countries.includes("USA") && !film.countries.includes("UK") && film.languages[0] !== "English") {
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

// returns an array of mcu film objects {"title", "myRating", "year"},
// sorted by release date
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
// return an array of film objects {"title", "myRating", "year"},
// each object is a film in the given franchise.
// sorted by release year.
function getFranchise(filmData, titles) {

    // MCU is dealt with differently,
    // hence they have their own functions
    if (titles[0] === "MCU") {
        return getMcuFilms(filmData)
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

// returns an array of the distribution of myRating of films
function getMyRatings(filmData) {
    let myRatings = new Array(10);

    for (let i = 0; i < 10; i++) {
        myRatings[i] = 0;
    }

    filmData.forEach(film => {
        myRatings[film.myRating - 1]++;
    });

    return myRatings;
}

// returns an array of the quantities of each myRating (only ratings with > 0 ratings)
function getMyRatingQuantities(myRatings) {
    let myRatingQuantities = [];

    for (let i = 0; i < 10; i++) {
        if (myRatings[i] > 0) {
            myRatingQuantities.push(myRatings[i].toString());
        }
    }

    return myRatingQuantities;
}

// returns an array of the labels of each myRating (only ratings with > 0 ratings)
function getMyRatingLabels(myRatings) {
    let myRatingLabels = [];

    for (let i = 1; i <= 10; i++) {
        if (myRatings[i-1] > 0) {
            myRatingLabels.push(i.toString());
        }
    }

    return myRatingLabels;
}
