/* =========================================
   VARIABLES GLOBALES Y ESTADO
   ========================================= */
let allGames = [];
let featuredGames = [];
let discountGames = [];
let currentIndex = 0;
let offerIndex = 0;

// Cargar Carrito y Favoritos desde LocalStorage
let cart = JSON.parse(localStorage.getItem("steam_cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("steam_wishlist")) || [];

const searchInput = document.getElementById("search-input");

const fallbackThumbnail = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22224%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22grad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%231a1f2e%22%20%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%232a3a4d%22%20%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url%28%23grad%29%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2245%25%22%20font-size%3D%2220%22%20fill%3D%22%2366c0f4%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%3E🎮%3C%2Ftext%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2265%25%22%20font-size%3D%2216%22%20fill%3D%22%23aaa%22%20font-family%3D%22Arial%2C%20sans-serif%22%20text-anchor%3D%22middle%22%3EImagen%3C%2Ftext%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2280%25%22%20font-size%3D%2216%22%20fill%3D%22%23aaa%22%20font-family%3D%22Arial%2C%20sans-serif%22%20text-anchor%3D%22middle%22%3Eno%20disponible%3C%2Ftext%3E%3C%2Fsvg%3E';

// Función auxiliar para manejar errores de imagen
function setupImageErrorHandler(img, fallbackSrc = null) {
    if (img && !img._errorHandlerSetup) {
        img._errorHandlerSetup = true;
        img.addEventListener('error', function() {
            if (fallbackSrc && this.src !== fallbackSrc) {
                this.src = fallbackSrc;
            } else if (!fallbackSrc && this.src !== fallbackThumbnail) {
                this.src = fallbackThumbnail;
            }
        }, { once: false });
    }
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('steam_current_user') || 'null');
    } catch (error) {
        return null;
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('steam_jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function syncUserData() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const [cartResponse, wishlistResponse] = await Promise.all([
            fetch('/api/users/cart', { headers: getAuthHeaders() }),
            fetch('/api/users/favorites', { headers: getAuthHeaders() })
        ]);

        if (cartResponse.ok) {
            cart = await cartResponse.json();
            localStorage.setItem('steam_cart', JSON.stringify(cart));
        }

        if (wishlistResponse.ok) {
            wishlist = await wishlistResponse.json();
            localStorage.setItem('steam_wishlist', JSON.stringify(wishlist));
        }

        window.updateCartUI();
    } catch (error) {
        console.warn('No se pudo sincronizar datos de usuario:', error);
    }
}

function goToGamePage(id) {
    window.location.href = `game.html?id=${id}`;
}

function getReviewData(game) {
    const reviewOptions = [
        { status: 'Muy negativas', min: 500, max: 2500 },
        { status: 'Negativas', min: 2500, max: 8000 },
        { status: 'Mixtas', min: 8000, max: 20000 },
        { status: 'Mayormente positivas', min: 18000, max: 42000 },
        { status: 'Muy positivas', min: 40000, max: 90000 },
        { status: 'Extremadamente positivas', min: 85000, max: 160000 }
    ];

    const bias = game.category === 'proximos' ? 2 : game.discount ? 4 : 3;
    const index = Math.min(reviewOptions.length - 1, bias + (game.tag?.toLowerCase().includes('popular') ? 1 : 0));
    const option = reviewOptions[Math.max(0, index)];

    const count = Math.floor(Math.random() * (option.max - option.min + 1)) + option.min;
    return {
        review_status: option.status,
        review_count: count
    };
}

function normalizeGame(game) {
    let safeScreenshots = [];
    if (Array.isArray(game.screenshots)) {
        safeScreenshots = game.screenshots.filter(Boolean);
    } else if (typeof game.screenshots === 'string') {
        try {
            const parsed = JSON.parse(game.screenshots);
            safeScreenshots = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch (error) {
            if (game.screenshots) safeScreenshots = [game.screenshots];
        }
    }

    const mainImage = game.main_image || fallbackThumbnail;
    const finalPrice = game.final_price || null;
    const originalPrice = game.original_price || null;
    const rawPrice = game.price && game.price !== 'Gratis' ? game.price : null;

    const price = game.category === 'proximos' ? '' : rawPrice || finalPrice || originalPrice || '—';
    const displayOriginal = originalPrice || price;
    const displayFinal = finalPrice || price;

    const reviewData = getReviewData(game);

    return {
        id: typeof game.id === 'number' ? game.id : Number(game.id) || Date.now(),
        title: game.title || 'Título desconocido',
        category: game.category || 'otros',
        main_image: mainImage,
        screenshots: safeScreenshots.length ? safeScreenshots : [mainImage],
        tag: game.tag || 'Recomendado',
        price,
        discount: game.discount || '',
        original_price: displayOriginal,
        final_price: displayFinal,
        description: game.description || '',
        review_status: game.review_status || reviewData.review_status,
        review_count: game.review_count || reviewData.review_count
    };
}

// Función para mostrar secciones dinámicamente
function showSection(section) {
    const storeSection = document.getElementById('store-section');
    const profileSection = document.getElementById('profile-section');
    const menuLinks = document.querySelectorAll('.menu-links a');
    const subHeader = document.querySelector('.sub-header');

    // Update URL hash
    window.location.hash = section;

    if (section === 'store') {
        storeSection.style.display = 'block';
        profileSection.style.display = 'none';
        if (subHeader) subHeader.style.display = 'flex';
        const footer = document.querySelector('.main-footer');
        if (footer) footer.classList.remove('profile-mode');
        menuLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector('.menu-links a[onclick*="store"]');
        if (activeLink) activeLink.classList.add('active');
    } else if (section === 'profile') {
        storeSection.style.display = 'none';
        profileSection.style.display = 'block';
        if (subHeader) subHeader.style.display = 'none';
        const footer = document.querySelector('.main-footer');
        if (footer) footer.classList.add('profile-mode');
        menuLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector('.menu-links a[onclick*="profile"]');
        if (activeLink) activeLink.classList.add('active');
    }
}

window.showBigImage = function (src) {
    const mainImg = document.getElementById("main-img");
    if (mainImg) mainImg.src = src;
};

window.resetBigImage = function () {
    const mainImg = document.getElementById("main-img");
    if (mainImg && mainImg.dataset.original) {
        mainImg.src = mainImg.dataset.original;
    }
};

/* =========================================
   CARGA DE DATOS (JSON)
   ========================================= */
async function loadGames() {
    try {
        const response = await fetch("http://localhost:3000/api/games");
        const rawGames = await response.json();
        allGames = (Array.isArray(rawGames) ? rawGames.filter(Boolean) : []).map(normalizeGame);

        featuredGames = allGames.filter((game) => game.category === "destacados");
        discountGames = allGames.filter((g) => g.category === "descuentos");

        await syncUserData();
        renderFeatured();
        renderDiscounts();
        filterTabs('novedades');
        
        // Initialize section based on URL hash or default to store
        const hash = window.location.hash.replace('#', '');
        if (hash === 'profile' || hash === 'store') {
            showSection(hash);
        } else {
            showSection('store');
        }
    } catch (error) {
        console.error("Error cargando el JSON:", error);
    }
}

/* =========================================
   SECCIÓN JUEGOS DESTACADOS (CARRUSEL)
   ========================================= */
function renderFeatured() {
    const game = featuredGames[currentIndex];
    const contentArea = document.getElementById("carousel-content");
    if (!game) return;

    const thumbsHTML = game.screenshots
        .map((img, index) => `
            <div class="thumb">
                <img src="${img}"
                     alt="Captura ${index + 1} de ${game.title}">
            </div>
        `).join("");

    contentArea.innerHTML = `
        <div class="carousel-card" onclick="goToGamePage(${game.id})" style="cursor:pointer;">
            <div class="main-capsule">
                <img src="${game.main_image}" id="main-img" data-original="${game.main_image}" alt="Portada de ${game.title}">
            </div>
            <div class="info-side">
                <h3 class="game-title">${game.title}</h3>
                <div class="screenshots" onmouseleave="resetBigImage()">${thumbsHTML}</div>
                <div class="status-info">
                    <p style="font-size: 13px; margin: 5px 0;">Ya disponible</p>
                    <span class="tag">${game.tag}</span>
                </div>
                <div class="price-row">
                    <span class="price">${game.price}</span>
                    <img src="./img/img_games/windows.png" style="width:18px; opacity:0.6;" alt="Windows">
                </div>
            </div>
        </div>
    `;
    
    // Aplicar manejador de error a todas las imágenes
    const mainImg = document.getElementById('main-img');
    if (mainImg) setupImageErrorHandler(mainImg);
    
    const thumbs = contentArea.querySelectorAll('.thumb img');
    thumbs.forEach(img => setupImageErrorHandler(img, game.main_image));
    
    updateDots("dots-container", currentIndex, featuredGames.length);
}

function updateDots(containerId, activeIndex, totalDots) {
    const dotsContainer = document.getElementById(containerId);
    if (!dotsContainer) return;

    let dotsHTML = "";
    for (let i = 0; i < totalDots; i++) {
        dotsHTML += `<span class="dot ${i === activeIndex ? "active" : ""}"></span>`;
    }
    dotsContainer.innerHTML = dotsHTML;
}

/* =========================================
   SECCIÓN OFERTAS
   ========================================= */
function renderDiscounts() {
    const container = document.getElementById("offers-container");
    if (!container) return;
    const visibleOffers = discountGames.slice(offerIndex, offerIndex + 4);

    container.innerHTML = visibleOffers.map((game, index) => {
        const isMidweek = index < 2;
        const offerClass = isMidweek ? "offer-midweek" : "offer-daily";
        const offerTitle = isMidweek ? "OFERTA DE ENTRE SEMANA" : "OFERTA DEL DÍA";
        return `
        <div class="offer-card ${offerClass}" onmouseenter="showGameTooltip(event, ${game.id})" onmouseleave="hideGameTooltip()" onclick="goToGamePage(${game.id})" style="cursor:pointer;">
            <div class="offer-image-container">
                <img src="${game.main_image}" alt="${game.title}" class="offer-img-${game.id}">
            </div>
            <div class="offer-info-box">
                <p class="offer-type">${offerTitle}</p>
                <div class="discount-block">
                    <div class="discount-pct">${game.discount || '0%'}</div>
                    <div class="discount-prices">
                        <span class="price-old">${game.original_price}</span>
                        <span class="price-new">${game.final_price}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join("");
    
    // Aplicar manejador de error a las imágenes de ofertas
    visibleOffers.forEach(game => {
        const img = container.querySelector(`.offer-img-${game.id}`);
        if (img) setupImageErrorHandler(img, game.main_image);
    });

    updateDots("dots-offers-container", Math.floor(offerIndex / 4), Math.ceil(discountGames.length / 4));
}

/* =========================================
   SECCIÓN LISTADO Y VISTA PREVIA
   ========================================= */
function renderTabbedList(listToRender) {
    const listContainer = document.getElementById("main-games-list");
    if (!listContainer) return;

    listContainer.innerHTML = listToRender.slice(0, 10).map(game => {
        const priceHtml = game.category === 'proximos' ? '' : `<div class="game-price">${game.price}</div>`;
        return `
        <div class="list-item" onmouseover="showPreview(${game.id})" onclick="goToGamePage(${game.id})">
            <img src="${game.main_image}" alt="${game.title}" width="120" class="list-img-${game.id}">
            <div class="list-item-meta">
                <div class="game-name">${game.title}</div>
                <div class="game-subtitle">${game.tag}</div>
            </div>
            ${priceHtml}
        </div>
    `;
    }).join("");
    
    // Aplicar manejador de error a las imágenes del listado
    listToRender.forEach(game => {
        const img = listContainer.querySelector(`.list-img-${game.id}`);
        if (img) setupImageErrorHandler(img, game.main_image);
    });

    if (listToRender.length > 0) showPreview(listToRender[0].id);
}

window.showPreview = function (id) {
    const game = allGames.find((g) => g.id === id);
    const previewContainer = document.getElementById("preview-container");
    if (!game || !previewContainer) return;

    const screenshotHTML = game.screenshots.slice(0, 4).map((src, idx) => `
        <img src="${src}" alt="Captura de ${game.title}" onmouseover="showBigImage('${src}')" class="preview-shot-${id}-${idx}">
    `).join("");

    const previewPriceHtml = game.category === 'proximos' ? '' : `<div class="preview-price">${game.price}</div>`;
    previewContainer.innerHTML = `
        <div class="preview-header">
            <div>
                <h3>${game.title}</h3>
                <div class="preview-tags"><span>${game.tag}</span></div>
            </div>
            ${previewPriceHtml}
        </div>
        <div class="preview-review-box">
            <span>Reseñas generales:</span>
            <strong>${game.review_status}</strong>
            <span class="review-count">(${game.review_count.toLocaleString()} reseñas)</span>
        </div>
        ${game.description ? `<div class="preview-description">${game.description}</div>` : ''}
        <div class="preview-actions">
            <button onclick="addToCart(${game.id})" class="btn-steam">Añadir al carrito</button>
            <button onclick="addToWishlist(${game.id})" class="btn-wish">♥ Favorito</button>
        </div>
        <div class="preview-shots">${screenshotHTML}</div>
    `;
    
    // Aplicar manejador de error a las imágenes del preview
    game.screenshots.forEach((src, idx) => {
        const img = previewContainer.querySelector(`.preview-shot-${id}-${idx}`);
        if (img) setupImageErrorHandler(img, game.main_image);
    });
};

/* =========================================
   LÓGICA DE CARRITO Y FAVORITOS (LOCALSTORAGE)
   ========================================= */
window.updateCartUI = function () {
    const cartBtn = document.getElementById("cart-button");
    const countSpan = document.getElementById("cart-count");
    if (cartBtn && countSpan) {
        if (cart.length > 0) {
            cartBtn.style.display = "flex";
            countSpan.textContent = " " + cart.length;
        } else {
            cartBtn.style.display = "none";
        }
    }
};

// Initial cart UI render
window.addEventListener('DOMContentLoaded', () => {
    window.updateCartUI();
});

window.addToCart = async function (id) {
    const game = allGames.find(g => g.id === id);
    const user = getCurrentUser();

    if (!game) return;

    if (user) {
        try {
            const response = await fetch('/api/users/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ gameId: id })
            });
            if (response.ok) {
                cart = await fetch('/api/users/cart', { headers: getAuthHeaders() }).then(r => r.json());
                localStorage.setItem('steam_cart', JSON.stringify(cart));
                window.updateCartUI();
                return;
            }
        } catch (error) {
            console.warn('Error guardando carrito en servidor:', error);
        }
    }

    if (!cart.some(item => item.id === id)) {
        cart.push(game);
        localStorage.setItem("steam_cart", JSON.stringify(cart));
        window.updateCartUI();
    }
};

window.addToWishlist = async function (id) {
    const game = allGames.find(g => g.id === id);
    const user = getCurrentUser();

    if (!game) return;

    if (user) {
        try {
            const response = await fetch('/api/users/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ gameId: id })
            });
            if (response.ok) {
                wishlist = await fetch('/api/users/favorites', { headers: getAuthHeaders() }).then(r => r.json());
                localStorage.setItem('steam_wishlist', JSON.stringify(wishlist));
                return;
            }
        } catch (error) {
            console.warn('Error guardando favoritos en servidor:', error);
        }
    }

    if (!wishlist.some(item => item.id === id)) {
        wishlist.push(game);
        localStorage.setItem("steam_wishlist", JSON.stringify(wishlist));
    }
};

/* =========================================
   BUSCADOR EN TIEMPO REAL
   ========================================= */
const searchResultsContainer = document.getElementById('search-results');
const searchButton = document.getElementById('search-button');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findSearchMatches(searchTerm) {
    const query = (searchTerm || '').trim().toLowerCase();
    if (!query) return [];

    const exactMatch = (text) => text === query;
    const startsWith = (text) => text.startsWith(query);
    const wordBoundary = new RegExp(`\\b${escapeRegExp(query)}`);

    const uniqueById = new Map();

    const matches = allGames.filter((game) => {
        const title = game.title.toLowerCase();
        const tag = (game.tag || '').toLowerCase();
        const description = (game.description || '').toLowerCase();

        return exactMatch(title) ||
            startsWith(title) ||
            wordBoundary.test(title) ||
            wordBoundary.test(tag) ||
            wordBoundary.test(description);
    });

    matches.forEach((game) => {
        if (!uniqueById.has(game.id)) {
            uniqueById.set(game.id, game);
        }
    });

    return Array.from(uniqueById.values());
}

function renderSearchResults(searchTerm) {
    const matches = findSearchMatches(searchTerm).slice(0, 6);
    if (!searchResultsContainer) return;

    if (!matches.length) {
        if (!searchTerm || !searchTerm.trim()) {
            searchResultsContainer.style.display = 'none';
            searchResultsContainer.innerHTML = '';
            return;
        }
        searchResultsContainer.innerHTML = '<div class="search-empty">No se encontraron resultados</div>';
        searchResultsContainer.style.display = 'block';
        return;
    }

    searchResultsContainer.innerHTML = matches.map(game => {
        const resultPrice = game.category === 'proximos' ? '' : `<div class="search-result-price">${game.price}</div>`;
        return `
        <div class="search-result-item" role="option" onclick="handleSearchSelection(${game.id})">
            <img class="search-result-thumb" src="${game.main_image}" alt="${game.title}">
            <div class="search-result-meta">
                <div class="search-result-title">${game.title}</div>
                <div class="search-result-subtitle">${game.tag} · ${game.category}</div>
            </div>
            ${resultPrice}
        </div>
    `;
    }).join('');
    searchResultsContainer.style.display = 'block';
}

window.handleSearchSelection = function (id) {
    const game = allGames.find(g => g.id === id);
    if (!game) return;
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'game-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;
    
    const card = document.createElement('div');
    card.style.cssText = `
        background: #1a1f2e;
        border: 1px solid #2a3f5f;
        border-radius: 8px;
        max-width: 700px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 0;
        color: #ccc;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.9);
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 102, 102, 0.8);
        border: none;
        color: white;
        font-size: 24px;
        width: 40px;
        height: 40px;
        cursor: pointer;
        border-radius: 4px;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => modal.remove();
    
    const screenshotHTML = game.screenshots.slice(0, 4).map((src, idx) => `
        <img src="${src}" alt="Captura de ${game.title}" class="modal-shot-${id}-${idx}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">
    `).join("");
    
    const priceHtml = game.category === 'proximos' ? '' : `<div style="font-size: 24px; color: #66c0f4; font-weight: bold; margin: 15px 0;">${game.price}</div>`;
    
    card.innerHTML = `
        <div style="position: relative;">
            <img src="${game.main_image}" alt="${game.title}" class="modal-main-img-${id}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px 8px 0 0;">
            <div style="padding: 30px;">
                <h2 style="margin: 0 0 10px 0; color: #fff; font-size: 28px;">${game.title}</h2>
                <div style="font-size: 13px; color: #8f98a0; margin-bottom: 15px;">
                    <span style="background: #2a3f5f; padding: 4px 8px; border-radius: 4px;">${game.tag}</span>
                    <span style="margin-left: 10px;">${game.category}</span>
                </div>
                
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                    <div style="font-size: 12px; color: #8f98a0; margin-bottom: 5px;">Reseñas en Español de España</div>
                    <div style="color: #66c0f4; font-weight: bold; font-size: 14px;">${game.review_status}</div>
                    <div style="font-size: 12px; color: #8f98a0;">(${game.review_count.toLocaleString()} reseñas)</div>
                </div>
                
                ${priceHtml}
                
                ${game.description ? `<div style="margin: 15px 0; font-size: 14px; line-height: 1.6;">${game.description}</div>` : ''}
                
                <div style="margin: 20px 0;">
                    <h4 style="color: #ccc; margin-bottom: 10px;">Screenshots:</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        ${screenshotHTML}
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="addToCart(${game.id}); window.location.href='carrito_compra.html';" style="flex: 1; background: #1a9fff; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold;">Añadir al carrito</button>
                    <button onclick="addToWishlist(${game.id}); window.location.href='lista_favoritos.html';" style="flex: 1; background: transparent; color: #66c0f4; border: 2px solid #66c0f4; padding: 12px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold;">♥ Favorito</button>
                </div>
            </div>
        </div>
    `;
    
    // Aplicar error handlers a las imágenes
    const mainImg = card.querySelector(`.modal-main-img-${id}`);
    if (mainImg) setupImageErrorHandler(mainImg);
    
    game.screenshots.forEach((src, idx) => {
        const img = card.querySelector(`.modal-shot-${id}-${idx}`);
        if (img) setupImageErrorHandler(img, game.main_image);
    });
    
    modal.appendChild(card);
    modal.appendChild(closeBtn);
    
    // Cerrar al hacer click fuera
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    document.body.appendChild(modal);
    
    if (searchResultsContainer) {
        searchResultsContainer.style.display = 'none';
    }
};

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        renderSearchResults(searchTerm);
        const filteredResults = findSearchMatches(searchTerm);
        renderTabbedList(filteredResults.length ? filteredResults : allGames);
    });
    searchInput.addEventListener('focus', (e) => {
        renderSearchResults(e.target.value);
    });
}

if (searchButton) {
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (searchInput) {
            renderSearchResults(searchInput.value);
        }
    });
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-container') && searchResultsContainer) {
        searchResultsContainer.style.display = 'none';
    }
});

/* =========================================
   EVENTOS DE NAVEGACIÓN
   ========================================= */
document.getElementById("nextBtn").onclick = () => {
    currentIndex = (currentIndex + 1) % featuredGames.length;
    renderFeatured();
};

document.getElementById("prevBtn").onclick = () => {
    currentIndex = (currentIndex - 1 + featuredGames.length) % featuredGames.length;
    renderFeatured();
};

document.getElementById("nextOfferBtn").onclick = () => {
    offerIndex = (offerIndex + 4 >= discountGames.length) ? 0 : offerIndex + 4;
    renderDiscounts();
};

document.getElementById("prevOfferBtn").onclick = () => {
    offerIndex = (offerIndex - 4 < 0) ? Math.max(0, discountGames.length - 4) : offerIndex - 4;
    renderDiscounts();
};

// Iniciar aplicación
loadGames();

function shuffleArray(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

window.setActiveTab = function (category) {
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(tab => {
        const isActive = tab.getAttribute('onclick')?.includes(`filterTabs('${category}')`);
        tab.classList.toggle('active', isActive);
    });
};

window.filterTabs = function (category) {
    let filteredGames;
    switch (category) {
        case 'novedades':
            filteredGames = shuffleArray(allGames.filter(game => game.category === 'destacados')).slice(0, 10);
            break;
        case 'ventas':
            filteredGames = shuffleArray(allGames.filter(game =>
                game.tag.toLowerCase().includes('lo más vendido') ||
                game.tag.toLowerCase().includes('popular') ||
                game.category === 'ventas'
            )).slice(0, 10);
            if (!filteredGames.length) {
                filteredGames = shuffleArray(allGames).slice(0, 10);
            }
            break;
        case 'proximos':
            filteredGames = allGames.filter(game => game.category === 'proximos');
            break;
        default:
            filteredGames = allGames;
    }
    renderTabbedList(filteredGames);
    window.setActiveTab(category);
};

/* =========================================
   TOOLTIP GLOBAL DE JUEGOS
   ========================================= */
let tooltipInterval;
let tooltipContainer = null;

window.showGameTooltip = function (event, gameId) {
    if (!tooltipContainer) {
        tooltipContainer = document.createElement("div");
        tooltipContainer.id = "global-game-tooltip";
        tooltipContainer.className = "game-hover-tooltip";
        document.body.appendChild(tooltipContainer);
    }

    const game = allGames.find(g => g.id === gameId);
    if (!game) return;

    let shots = [];
    if (Array.isArray(game.screenshots)) {
        shots = game.screenshots.filter(Boolean);
    } else if (typeof game.screenshots === 'string') {
        try {
            const parsedShots = JSON.parse(game.screenshots);
            shots = Array.isArray(parsedShots) ? parsedShots.filter(Boolean) : [];
        } catch (err) {
            if (game.screenshots) {
                shots = [game.screenshots];
            }
        }
    }

    if (!shots.length && game.main_image) {
        shots = [game.main_image];
    }

    const firstShot = shots.length > 0 ? shots[0] : fallbackThumbnail;
    let shotIndex = 0;
    const maxShots = shots.length;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'tooltip-content';
    
    const titleH4 = document.createElement('h4');
    titleH4.className = 'tooltip-title';
    titleH4.textContent = game.title;
    
    const shotContainer = document.createElement('div');
    shotContainer.className = 'tooltip-shot-container';
    
    const img = document.createElement('img');
    img.id = 'tooltip-shot';
    img.src = firstShot;
    img.alt = 'Screenshot';
    setupImageErrorHandler(img, game.main_image);
    
    shotContainer.appendChild(img);
    
    const reviewsDiv = document.createElement('div');
    reviewsDiv.className = 'tooltip-reviews';
    reviewsDiv.innerHTML = `Reseñas en Español de España <br>
                <span class="review-status">${game.review_status}</span> (${game.review_count.toLocaleString()} reseñas)`;
    
    contentDiv.appendChild(titleH4);
    contentDiv.appendChild(shotContainer);
    contentDiv.appendChild(reviewsDiv);
    
    tooltipContainer.innerHTML = '';
    tooltipContainer.appendChild(contentDiv);

    tooltipContainer.style.display = "block";
    tooltipContainer.style.opacity = 1;

    // Posicionar relativo al elemento que dispara el evento
    const rect = event.currentTarget.getBoundingClientRect();

    let left = rect.right + window.scrollX + 15;
    let top = rect.top + window.scrollY;

    // Si se sale por la derecha, mostrar a la izquierda
    if (left + 320 > window.innerWidth) {
        left = rect.left + window.scrollX - 335;
    }

    // Si se sale por abajo
    if (top + 250 > window.innerHeight + window.scrollY) {
        top = window.innerHeight + window.scrollY - 260;
    }

    tooltipContainer.style.top = top + "px";
    tooltipContainer.style.left = left + "px";

    clearInterval(tooltipInterval);
    if (maxShots > 1) {
        tooltipInterval = setInterval(() => {
            shotIndex = (shotIndex + 1) % maxShots;
            const imgEl = document.getElementById("tooltip-shot");
            if (imgEl) {
                imgEl.src = shots[shotIndex] || firstShot;
            }
        }, 1500);
    }
};

window.hideGameTooltip = function () {
    if (tooltipContainer) {
        tooltipContainer.style.display = "none";
        tooltipContainer.style.opacity = 0;
        clearInterval(tooltipInterval);
    }
};