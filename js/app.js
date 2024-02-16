document.addEventListener("DOMContentLoaded", function (){
    // global constants
    const API_KEY = "894c089f-9951-4e8c-8800-3a3c572d5eeb";
    const API_URL_TOP =
        "https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_ALL";
    const API_URL_SEARCH = "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
    const API_URL_MOVIE_DETAILS = "https://kinopoiskapiunofficial.tech/api/v2.2/films/"
    // global elements
    const modalEl = document.querySelector(".modal");
    const moviesContainer = document.querySelector(".movies");
    const form = document.querySelector("form");
    const search = document.querySelector(".header__search");
    // global params
    let searchValue = search.value;
    let pages = 0;
    let currentPage = 1;
    // helpers
    const closeModal = () => {
        modalEl.classList.remove("modal--show");
        document.body.classList.remove("stop-scrolling");
    }
    const openModal = async (id)=> {
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

    const renderMovies = (movie) => {
        const id = searchValue ? movie.filmId : movie.kinopoiskId;
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
        moviesContainer.appendChild(movieItem);
    }

    getMovies()

    async function getMovies(page = 1) {
        const topLink = API_URL_TOP + (page ? `&page=${page}`: '');
        const searchLink = API_URL_SEARCH + searchValue + (page ? `&page=${page}`: '');
        const url = searchValue ? searchLink : topLink
        const resp = await fetch(url, {
            headers: {
                "Content-type": "application/json",
                "X-API-KEY": API_KEY,
            },
        });
        const respJson = await resp.json();
        // если мы используем поиск прокидываем массив из films, если нет - items
        const data =  respJson[searchValue ?"films": "items"];
        const pagesCount = respJson[searchValue ? "pagesCount" : "totalPages"];

        console.log('=====>url', url);
        console.log('=====>respJson', respJson);

        showMovies(data);
        if(pagesCount !== pages){
            pages = pagesCount
            createPageButtons(pagesCount)
            currentPage = 1
        }
        // updateActiveButtonStates(0)
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
        document.querySelector(".movies").innerHTML = "";
        data.forEach(renderMovies);
    }

    function createPageButtons(count) {
        const paginationContainer = document.querySelector(".pagination");
        paginationContainer.innerHTML = "";
        console.log(pages);
        const beforeButton = document.createElement("button");
        beforeButton.classList.add("pagination__before");
        paginationContainer.appendChild(beforeButton);
        beforeButton.textContent = '<';

        const firstPages = [0, 1 ,2, 3, 4]
        const pageNumbers = [0, 1 ,2, 3, 4, count - 1];
        const lastPage = count - 1;

        beforeButton.addEventListener("click", async () => {
            currentPage -= 1
            await getMovies(currentPage);
            updateActiveButtonStates(currentPage);
        });
        for (let i = 0; i < count; i++) {
            if(firstPages.includes(i)){
                count = pages
                const buttonNumber = i + 1;
                const pageButton = document.createElement("button");
                pageButton.classList.add("pagination__item");
                paginationContainer.appendChild(pageButton);
                pageButton.textContent = buttonNumber;
                if(currentPage === buttonNumber){
                    pageButton.classList.add("pagination__item--active")
                }

                pageButton.addEventListener("click", async () => {
                    await getMovies(buttonNumber);
                    currentPage = buttonNumber
                    updateActiveButtonStates(buttonNumber);

                    console.log("====> count " + count)
                });
            } else if (i === 5){
                const pageButton = document.createElement("button");
                pageButton.classList.add("pagination__more");
                paginationContainer.appendChild(pageButton);
                pageButton.textContent = '...';

                pageButton.addEventListener("click", async () => {

                });
            } else if (i === lastPage) {
                const pageButton = document.createElement("button");
                pageButton.classList.add("pagination__item");
                paginationContainer.appendChild(pageButton);
                pageButton.textContent = lastPage + 1;
                if(currentPage === lastPage){
                    pageButton.classList.add("pagination__item--active")
                }
                pageButton.addEventListener("click", async () => {
                    await getMovies(lastPage + 1);
                    currentPage = lastPage;
                    updateActiveButtonStates();
                    console.log("======> current page " + currentPage)
                    console.log("======> last page " + lastPage)
                });
            }
        }
        const afterButton = document.createElement("button");
        afterButton.classList.add("pagination__after");
        paginationContainer.appendChild(afterButton);
        afterButton.textContent = '>';

        if (firstPages.includes(currentPage) || currentPage !== lastPage) {
            afterButton.addEventListener("click", async () => {
                currentPage += 1;
                await getMovies(currentPage);
                updateActiveButtonStates();
            });
            console.log("======> current page " + currentPage)
            console.log("======> last page " + lastPage)

        } else if (currentPage === lastPage){
            afterButton.addEventListener("click", async () => {
            await getMovies(lastPage);
            updateActiveButtonStates();
            });
        }

    }

    function updateActiveButtonStates() {
        const pageButtons = document.querySelectorAll(".pagination__item");
        pageButtons.forEach(
            (button, i) => currentPage === i + 1
                ? button.classList.add("pagination__item--active")
                : button.classList.remove("pagination__item--active"));
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        searchValue = search.value;
        getMovies();
    });

    window.addEventListener("click", (e) => e.target === modalEl && closeModal())
    window.addEventListener("keydown", (e) => e.keyCode === 27 && closeModal())
});




