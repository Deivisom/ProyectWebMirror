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

const dotsArea = document.getElementById("dots-container");
const searchInput = document.getElementById("search-input");

const fallbackThumbnail = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="231" height="87"><rect width="100%" height="100%" fill="%23222"/><text x="50%" y="50%" fill="%23ccc" font-size="14" font-family="Arial" dominant-baseline="middle" text-anchor="middle"></text></svg>';

// Función para mostrar secciones dinámicamente
function showSection(section) {
    const storeSection = document.getElementById('store-section');
    const profileSection = document.getElementById('profile-section');
    const menuLinks = document.querySelectorAll('.menu-links a');
    const subHeader = document.querySelector('.sub-header');

    if (section === 'store') {
        storeSection.style.display = 'block';
        profileSection.style.display = 'none';
        if (subHeader) subHeader.style.display = 'flex';
        menuLinks.forEach(link => link.classList.remove('active'));
        document.querySelector('.menu-links a[onclick*="store"]').classList.add('active');
    } else if (section === 'profile') {
        storeSection.style.display = 'none';
        profileSection.style.display = 'block';
        if (subHeader) subHeader.style.display = 'none';
        menuLinks.forEach(link => link.classList.remove('active'));
        document.querySelector('.menu-links a[onclick*="profile"]').classList.add('active');
    }
}

window.showBigImage = function(src) {
    const mainImg = document.getElementById("main-img");
    if (mainImg) mainImg.src = src;
};

window.resetBigImage = function() {
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
        allGames = await response.json(); 
        
        featuredGames = allGames.filter((game) => game.category === "destacados");
        discountGames = allGames.filter((g) => g.category === "descuentos");

        renderFeatured();
        renderDiscounts();
        renderTabbedList(allGames); 
        showSection('store'); // Initialize to show store
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
                     alt="Captura ${index + 1} de ${game.title}"
                     onmouseover="showBigImage('${img}')"
                     onerror="this.onerror=null; this.src='${fallbackThumbnail}'">
            </div>
        `).join("");

    contentArea.innerHTML = `
        <div class="carousel-card">
            <div class="main-capsule">
                <img src="${game.main_image}" id="main-img" data-original="${game.main_image}" alt="Portada de ${game.title}"
                     onerror="this.onerror=null; this.src='${fallbackThumbnail}'">
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
    updateDots();
}

function updateDots() {
    if (!dotsArea) return;
    dotsArea.innerHTML = featuredGames
        .map((_, i) => `<span class="dot ${i === currentIndex ? "active" : ""}"></span>`)
        .join("");
}

/* =========================================
   SECCIÓN OFERTAS
   ========================================= */
function renderDiscounts() {
    const container = document.getElementById("offers-container");
    if (!container) return;
    const visibleOffers = discountGames.slice(offerIndex, offerIndex + 4);

    container.innerHTML = visibleOffers.map((game, index) => `
        <div class="offer-card">
            <div class="offer-image-container">
                <img src="${game.main_image}">
            </div>
            <div class="offer-info-box">
                ${index < 2 ? '<p class="offer-type">OFERTA DE ENTRE SEMANA</p>' : ""}
                <div class="discount-block">
                    <div class="discount-pct">${game.discount}</div>
                    <div class="discount-prices">
                        <span class="price-old">${game.original_price}</span>
                        <span class="price-new">${game.final_price}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join("");
}

/* =========================================
   SECCIÓN LISTADO Y VISTA PREVIA
   ========================================= */
function renderTabbedList(listToRender) {
    const listContainer = document.getElementById("main-games-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = listToRender.slice(0, 10).map(game => `
        <div class="list-item" onmouseover="showPreview(${game.id})">
            <img src="${game.main_image}" width="120">
            <div style="flex-grow: 1; margin-left: 10px;">
                <div class="game-name">${game.title}</div>
                <div style="font-size: 11px; opacity: 0.7;">${game.tag}</div>
            </div>
            <div class="game-price">${game.price}</div>
        </div>
    `).join("");

    if (listToRender.length > 0) showPreview(listToRender[0].id);
}

window.showPreview = function (id) {
    const game = allGames.find((g) => g.id === id);
    const previewContainer = document.getElementById("preview-container");
    if (!game || !previewContainer) return;

    previewContainer.innerHTML = "";

    const title = document.createElement("h3");
    title.style.marginTop = "0";
    title.textContent = game.title;

    const reviewBox = document.createElement("div");
    reviewBox.style.background = "rgba(0,0,0,0.2)";
    reviewBox.style.padding = "8px";
    reviewBox.style.marginBottom = "10px";
    reviewBox.style.fontSize = "12px";
    reviewBox.innerHTML = 'Reseñas generales: <span style="color: #66c0f4">Muy positivas</span>';

    const actions = document.createElement("div");
    actions.style.marginBottom = "15px";
    actions.style.display = "flex";
    actions.style.gap = "10px";
   
    actions.innerHTML = `
        <button onclick="addToCart(${game.id})" class="btn-steam">Añadir al carro</button>
        <button onclick="addToWishlist(${game.id})" class="btn-wish">♥</button>
    `;

    const shotsContainer = document.createElement("div");
    shotsContainer.className = "preview-shots";
    shotsContainer.addEventListener("mouseleave", resetBigImage);

    game.screenshots.slice(0, 4).forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Captura de ${game.title}`;
        img.style.width = "100%";
        img.style.marginBottom = "5px";
        img.style.borderRadius = "2px";
        img.addEventListener("mouseover", () => showBigImage(src));
        img.addEventListener("error", function () {
            this.onerror = null;
            this.src = game.main_image;
        });
        shotsContainer.appendChild(img);
    });

    previewContainer.appendChild(title);
    previewContainer.appendChild(reviewBox);
    previewContainer.appendChild(actions);
    previewContainer.appendChild(shotsContainer);
};

/* =========================================
   LÓGICA DE CARRITO Y FAVORITOS (LOCALSTORAGE)
   ========================================= */
window.addToCart = function(id) {
    const game = allGames.find(g => g.id === id);
    if (game && !cart.some(item => item.id === id)) {
        cart.push(game);
        localStorage.setItem("steam_cart", JSON.stringify(cart));
        alert(`${game.title} añadido al carrito`);
    } else {
        alert("Este juego ya está en tu carrito");
    }
};

window.addToWishlist = function(id) {
    const game = allGames.find(g => g.id === id);
    if (game && !wishlist.some(item => item.id === id)) {
        wishlist.push(game);
        localStorage.setItem("steam_wishlist", JSON.stringify(wishlist));
        alert(`${game.title} añadido a la lista de deseos`);
    }
};

/* =========================================
   BUSCADOR EN TIEMPO REAL
   ========================================= */
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredResults = allGames.filter((game) => 
            game.title.toLowerCase().includes(searchTerm) || 
            game.tag.toLowerCase().includes(searchTerm)
        );
        renderTabbedList(filteredResults);
    });
}

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

window.filterTabs = function(category) {
    let filteredGames;
    switch(category) {
        case 'novedades':
            filteredGames = allGames.slice(0, 10); // Primeros 10 juegos
            break;
        case 'ventas':
            filteredGames = allGames.filter(game => game.tag === 'Lo más vendido');
            break;
        case 'proximos':
            filteredGames = allGames.slice(-5); // Últimos 5 juegos como "próximos"
            break;
        default:
            filteredGames = allGames;
    }
    renderTabbedList(filteredGames);
};