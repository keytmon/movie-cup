const API_KEY = "894c089f-9951-4e8c-8800-3a3c572d5eeb";
const API_URL_TOP =
    "https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_ALL&page=1";
const API_URL_SEARCH = "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";

getMovies(API_URL_TOP);

async function getMovies(url){
    const resp = await fetch(url, {
        headers: {
            "Content-type": "application/json",
            "X-API-KEY": API_KEY,
        },
    });
    const respData = await resp.json();
    console.log(respData);
    showMovies(respData);
}

function getClassByRate(vote) {
    if (vote >= 7) {
        return "green";
    } else if (vote > 5) {
        return "orange";
    } else {
        return "red";
    }
}

function showMovies(data) {
    const moviesItem = document.querySelector(".movies");

    document.querySelector(".movies").innerHTML = "";

    data.items.forEach((movie) => {
       const movieItem = document.createElement("div");
       movieItem.classList.add("movie");
       movieItem.innerHTML = `
            <div class="cover__inner">
                <img src="${movie.posterUrlPreview}"
                     class="movie__cover"
                     alt="${movie.nameRu}"/>
                <div class="cover__darkened"></div>
               </div>
              <div class="movie__info">
                <div class="movie__title">${movie.nameRu}</div>
                <div class="movie__category">${movie.genres.map(
           (genre) => ` ${genre.genre}`
       )}</div>
             ${movie.ratingKinopoisk && `
                <div class="movie__average average-${getClassByRate(
                    movie.ratingKinopoisk
       )}">${movie.ratingKinopoisk}</div>
       `
       }
            </div>
       `;
       moviesItem.appendChild(movieItem);
    });
}

const form = document.querySelector("form");
const search = document.querySelector(".header__search");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const apiSearchUrl = `${API_URL_SEARCH}${search.value}`;
    if (search.value) {
        console.log(apiSearchUrl);
        getMovies(apiSearchUrl);

        search.value = "";
    }

});