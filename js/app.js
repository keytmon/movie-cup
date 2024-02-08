document.addEventListener("DOMContentLoaded", function (){
    const API_KEY = "894c089f-9951-4e8c-8800-3a3c572d5eeb";
    const API_URL_TOP =
        "https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_ALL&page=";
    const API_URL_SEARCH = "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
    const API_URL_MOVIE_DETAILS = "https://kinopoiskapiunofficial.tech/api/v2.2/films/"

    getMovies(API_URL_TOP + 1).then((data) => {
        createPageButtons(data.totalPages)
    })

    async function getMovies(url, isSearch) {
        const resp = await fetch(url, {
            headers: {
                "Content-type": "application/json",
                "X-API-KEY": API_KEY,
            },
        });
        const respData = await resp.json();
        console.log(respData);
        // если мы используем поиск прокидываем массив из films, если нет - items
        showMovies(respData, isSearch);
        return respData;
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

    function showMovies(data, isSearch) {
        const moviesItem = document.querySelector(".movies");

        document.querySelector(".movies").innerHTML = "";
        const moviesData = isSearch ? data.films : data.items;
        const paginatedMoviesData = getPaginatedMoviesData(moviesData);
        function getPaginatedMoviesData(data) {

        }
        moviesData.forEach((movie) => {
            const id = isSearch? movie.filmId : movie.kinopoiskId;
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
                <div class="movie__category">${movie.genres?.map((genre) => ` ${genre.genre}`)}</div>
                ${movie.ratingKinopoisk ? `
                    <div class="movie__average average-${getClassByRate(movie.ratingKinopoisk)}">
                        ${movie.ratingKinopoisk}
                    </div>` : ''}
              </div>
       `;
            movieItem.addEventListener("click", () => openModal(id));
            moviesItem.appendChild(movieItem);
        });
        createPageButtons(moviesData);
    }

    function createPageButtons(pages) {
        const paginationContainer = document.querySelector(".pagination");


        for (let i = 0; i < pages; i++) {

            const pageButton = document.createElement("button");
            pageButton.classList.add(".pagination__item");
            paginationContainer.appendChild(pageButton);
            pageButton.textContent = i + 1;
            pageButton.addEventListener("click", () => {
                currentPage = i;
                getMovies(API_URL_TOP + (i + 1));
                updateActiveButtonStates();
            });

        }
    }
    const form = document.querySelector("form");
    const search = document.querySelector(".header__search");

    const content = document.querySelector(".movies");
    let currentPage = 0;


    function updateActiveButtonStates() {
        const pageButtons = document.querySelectorAll(".pagination__item");
        pageButtons.forEach((button, i) => {
            if (i === currentPage) {
                button.classList.add(".pagination__item--active");
            } else {
                button.classList.remove(".pagination__item--active");
            }
        });
    }




    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const apiSearchUrl = `${API_URL_SEARCH}${search.value}`;
        if (search.value) {
            console.log(apiSearchUrl);
            // добавляем флаг в функцию
            getMovies(apiSearchUrl, true);
            search.value = "";
        }

    });
    const modalEl = document.querySelector(".modal");

    const closeModal = () => {
        modalEl.classList.remove("modal--show");
        document.body.classList.remove("stop-scrolling");
    }
    async function openModal(id) {
        console.log(id)

        const resp = await fetch(API_URL_MOVIE_DETAILS + id, {
            headers: {
                "Content-type": "application/json",
                "X-API-KEY": API_KEY,
            },
        });

        const respData = await resp.json();

        modalEl.classList.add("modal--show");
        document.body.classList.add("stop-scrolling");

        modalEl.innerHTML = `
    <div class="modal__card">
        <img class="modal__movie-background" src="${respData.posterUrl}" alt="">
        <h2>
            <span class="modal__movie-title">${respData.nameRu}</span>
            <span class="modal__movie-release-year"> - ${respData.year}</span>
        </h2>
        <ul class="modal__movie-info">
            <div class="loader"></div>
            <li class="modal__movie-genre">Жанр - ${respData.genres.map((el) => `<span>${el.genre}</span>`)}</li>
            ${respData.filmLength ? `<li class="modal__movie-runtime">Время - ${respData.filmLength} минут</li>` : ''}
            <li>Сайт: <a class="modal__movie-site" href="${respData.webUrl}">${respData.webUrl}</a></li>
            <li class="modal__movie-overview">Описание - ${respData.description}</li>
        </ul>
        <button type="button" class="modal__button-close">Закрыть</button>
    </div>
    `

        const btnClose = document.querySelector(".modal__button-close")
        btnClose.addEventListener("click", closeModal);
    }


    window.addEventListener("click", (e) => e.target === modalEl && closeModal())

    window.addEventListener("keydown", (e) => e.keyCode === 27 && closeModal())
});




