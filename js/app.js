document.addEventListener("DOMContentLoaded", function (){
    // global constants
    const API_KEY = "0722cc30-8468-46f3-9550-bda98540fc72";
        // "894c089f-9951-4e8c-8800-3a3c572d5eeb";
    const API_URL_TOP =
        "https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_ALL";
    const API_URL_SEARCH = "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
    const API_URL_MOVIE_DETAILS = "https://kinopoiskapiunofficial.tech/api/v2.2/films/"
    // global elements
    const modalEl = document.querySelector(".modal");
    const moviesContainer = document.querySelector(".movies");
    const form = document.querySelector("form");
    const header = document.querySelector("header");
    const search = header.querySelector(".header__search");
    // global params
    let searchValue = search.value;
    let pages = 0;
    let currentPage = 1;
    console.log('=====>currentPagewindow', currentPage)
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
        console.log("======> current page " + currentPage)
        // variables
        const paginationContainer = document.querySelector(".pagination");
        let firstPagesCountStart = 0;
        let firstPagesCountEnd = 4;
        const lastPage = count - 1;
        // helpers
        const updateFirstButtonState = (i)=> {
            if(i > 0 && beforeButton.classList.contains("disabled")){
                beforeButton.classList.remove("disabled");
            }
            if(i === 0 && !beforeButton.classList.contains("disabled")){
                beforeButton.classList.add("disabled");
            }
        }
        const updateAfterButtonState = (i)=> {
            if(i > 0 && beforeButton.classList.contains("disabled")){
                beforeButton.classList.remove("disabled");
            }
            if(i === 0 && !beforeButton.classList.contains("disabled")){
                beforeButton.classList.add("disabled");
            }
        }
        const createLastPageButton = () => {
            const pageButton = document.createElement("button");
            const lastPageNumber = lastPage + 1;
            pageButton.classList.add("pagination__item");
            paginationContainer.appendChild(pageButton);
            pageButton.textContent = lastPageNumber;

            if (currentPage === lastPageNumber) {
                pageButton.classList.add("active");
            }

            pageButton.addEventListener("click", async () => {
                await getMovies(lastPageNumber);
                currentPage = lastPageNumber;
                updateActiveButtonStates(lastPageNumber);

            });
        }
        const createPaginationPages = (startIndex, endIndex) => {
            const existedBlock = document.querySelector('.first-elements')
            const elementsContainer = existedBlock || document.createElement("div")
            elementsContainer.innerHTML=""
            if(!existedBlock){
                elementsContainer.classList.add("first-elements")
                paginationContainer.appendChild(elementsContainer);
            }
            for (let i = startIndex; i < count; i++) {
                if(i <= endIndex){
                    count = pages
                    const buttonNumber = i + 1;
                    const pageButton = document.createElement("button");
                    pageButton.classList.add("pagination__item");
                    pageButton.textContent = buttonNumber;
                    if(currentPage === buttonNumber){
                        pageButton.classList.add("active")
                    }
                    pageButton.addEventListener("click", async () => {
                        updateFirstButtonState(i)
                        updateAfterButtonState(i)
                        await getMovies(buttonNumber);
                        currentPage = buttonNumber
                        updateActiveButtonStates(buttonNumber);
                    });
                    elementsContainer.appendChild(pageButton);

                } else if (i === lastPage) {


                }
            }
        }
        const createMoreButton = () => {
            const moreButton = document.createElement("button");
            moreButton.classList.add("pagination__more");
            paginationContainer.appendChild(moreButton);
            moreButton.textContent = '...';
            moreButton.addEventListener("click", async () => {
                console.log('=====>moreButtonClick')
            });
        }
        const createBeforeButton = () => {
            const beforeButton = document.createElement("button");
            beforeButton.classList.add("pagination__before");
            beforeButton.textContent = '<';
            paginationContainer.appendChild(beforeButton);
            if (currentPage - 1 <= 0) {
                beforeButton.classList.add("disabled");
            } else {
                beforeButton.classList.remove("disabled");
            }
            beforeButton.addEventListener("click", async () => {
                currentPage -= 1
                await getMovies(currentPage);
                updateActiveButtonStates(currentPage);

            });
            return beforeButton
        }
        const createAfterButton = () => {
            const afterButton = document.createElement("button");
            afterButton.classList.add("pagination__after");
            paginationContainer.appendChild(afterButton);
            afterButton.textContent = '>';
            afterButton.addEventListener("click", async () => {
                if(currentPage) currentPage += 1;
                if(currentPage - 1 > firstPagesCountEnd){
                    firstPagesCountStart+=1
                    firstPagesCountEnd+=1
                    createPaginationPages(firstPagesCountStart, firstPagesCountEnd)
                }
                await getMovies(currentPage);
                updateActiveButtonStates();
            });
            return afterButton
        }

        const beforeButton = createBeforeButton(currentPage);
        createPaginationPages(0, firstPagesCountEnd);
        createMoreButton();
        createLastPageButton();
        const afterButton = createAfterButton(currentPage)

    }

    function updateActiveButtonStates() {
        const pageButtons = document.querySelectorAll(".pagination__item");
        pageButtons.forEach(
            (button, i) =>  currentPage === Number(button.innerHTML)
                ? button.classList.add("active")
                : button.classList.remove("active"));
        header.scrollIntoView()
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        searchValue = search.value;
        getMovies();
    });

    window.addEventListener("click", (e) => e.target === modalEl && closeModal())
    window.addEventListener("keydown", (e) => e.keyCode === 27 && closeModal())
});




