(() => {
    const getProducts = async () => {
        const localProducts = localStorage.getItem('productList');
        if (localProducts) {
            return JSON.parse(localProducts);
        }

        const response = await fetch('https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json');
        const data = await response.json();
        localStorage.setItem('productList', JSON.stringify(data));
        return data;
    };

    const restoreFavorites = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites.forEach(id => {
            const button = document.querySelector(`.heart-button[data-id="${id}"]`);
            if (button) button.classList.add('favorited');
        });
    };

    const toggleFavorite = (button, id) => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (button.classList.contains('favorited')) {
            button.classList.remove('favorited');
            const index = favorites.indexOf(id);
            if (index > -1) favorites.splice(index, 1);
        } else {
            button.classList.add('favorited');
            favorites.push(id);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
    };

    const buildHTML = (products) => {
        const carouselHTML = `
            <div class="carousel-container">
                <h2>You Might Also Like</h2>
                <div class="carousel">
                    <button class="carousel-arrow left">◀</button>
                    <div class="carousel-track-container">
                        <ul class="carousel-track">
                            ${products.map(product => `
                                <li class="carousel-item" data-id="${product.id}">
                                    <a href="${product.url}" target="_blank" class="product-link">
                                        <img src="${product.img}" alt="${product.name}" />
                                    </a>
                                    <button class="heart-button" data-id="${product.id}">
                                        <svg class="heart-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                            <path fill="none" d="M0 0h24v24H0z"/>
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                        </svg>
                                    </button>
                                    <div class="product-info">
                                        <a href="${product.url}" target="_blank" class="product-name">${product.name}</a>
                                        <span class="product-price">${product.price} TL</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <button class="carousel-arrow right">▶</button>
                </div>
            </div>
        `;
        document.querySelector('.product-detail').insertAdjacentHTML('beforeend', carouselHTML);
    };

    const buildCSS = () => {
        const style = document.createElement('style');
        style.innerHTML = `
            .carousel-container { margin: 20px; font-family: Arial, sans-serif; }
            .carousel h2 { margin-left: 10px; font-size: 1.5rem; }
            .carousel { display: flex; align-items: center; position: relative; }
            .carousel-track-container { overflow: hidden; flex: 1; }
            .carousel-track { display: flex; transition: transform 0.5s ease; padding-left: 0; }
            .carousel-item { flex: 0 0 calc(100% / 6.5); text-align: center; list-style: none; position: relative; }
            .carousel-item img { width: 100%; border-radius: 5px; }
            .heart-button { 
                margin-top: 5px; 
                cursor: pointer; 
                background: none; 
                border: none; 
                font-size: 1.5em; 
                position: absolute; 
                top: 10px; 
                right: 10px; 
                z-index: 10; 
            }
            .heart-icon { fill: none; stroke: gray; stroke-width: 2; transition: fill 0.3s, stroke 0.3s; } 
            .heart-button.favorited .heart-icon { 
                fill: blue; 
                stroke: blue; 
            }
            .product-info { margin-top: 5px; }
            .product-name {
                color: inherit; 
                text-decoration: none; 
                display: block; 
                margin-bottom: 5px; 
            }
            .product-name:hover {
                text-decoration: underline; 
            }
            .carousel-arrow { background: rgba(255, 255, 255, 0.8); border: 1px solid gray; position: absolute; top: 50%; transform: translateY(-50%); cursor: pointer; z-index: 10; padding: 10px; border-radius: 5px; }
            .carousel-arrow.left { left: 10px; }
            .carousel-arrow.right { right: 10px; }
            .carousel-arrow.hidden { display: none; }
            
            @media (max-width: 768px) {
                .carousel-item { flex: 0 0 calc(100% / 3); }
            }

            @media (max-width: 480px) {
                .carousel-item { flex: 0 0 calc(100% / 2); }
            }
        `;
        document.head.appendChild(style);
    };

    let currentIndex = 0;

    const updateArrowVisibility = () => {
        const totalItems = document.querySelectorAll('.carousel-item').length;
        const visibleItems = 6.5;
        const leftArrow = document.querySelector('.carousel-arrow.left');
        const rightArrow = document.querySelector('.carousel-arrow.right');

        leftArrow.style.display = (currentIndex === 0) ? 'none' : 'block'; 
        rightArrow.style.display = (currentIndex >= totalItems - visibleItems) ? 'none' : 'block'; 
    };

    const setEvents = () => {
        const track = document.querySelector('.carousel-track');
        const totalItems = document.querySelectorAll('.carousel-item').length;

        document.querySelectorAll('.heart-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.closest('.heart-button').dataset.id;
                toggleFavorite(event.target.closest('.heart-button'), id);
            });
        });

        const moveCarousel = (direction) => {
            const visibleItems = 6.5;

            if (direction === 'left' && currentIndex > 0) {
                currentIndex -= 1;
            } else if (direction === 'right' && currentIndex < totalItems - visibleItems) {
                currentIndex += 1;
            }

            const itemWidth = document.querySelector('.carousel-item').offsetWidth;
            track.style.transform = `translateX(${-currentIndex * itemWidth}px)`;
            updateArrowVisibility();
        };

        document.querySelector('.carousel-arrow.left').addEventListener('click', () => {
            moveCarousel('left');
        });

        document.querySelector('.carousel-arrow.right').addEventListener('click', () => {
            moveCarousel('right');
        });

        updateArrowVisibility();
    };

    const init = async () => {
        const products = await getProducts();
        buildHTML(products);
        buildCSS();
        restoreFavorites();
        setEvents();
    };

    init();
})();