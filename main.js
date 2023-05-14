main();

async function main() {
    const response = await fetch('data/filmDataCombined.json');
    const filmData = await response.json();
    console.log(filmData);
}

