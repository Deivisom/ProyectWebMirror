let featuredGames = [];
let discountGames = [];
let currentIndex = 0;
let offerIndex = 0;

const contentArea = document.getElementById("carousel-content");
const dotsArea = document.getElementById("dots-container");

// Carga el JSON y filtra los juegos por categoría
async function loadGames() {
  try {
    const response = await fetch("games.json");
    const allGames = await response.json();
    featuredGames = allGames.filter((game) => game.category === "destacados");
    discountGames = allGames.filter((g) => g.category === "descuentos");

    renderFeatured();
    renderDiscounts();
    renderTabbedList(allGames);
  } catch (error) {
    console.error("Error cargando el JSON:", error);
  }
}
/*seccion de juegos destacados*/
function renderFeatured() {
  const game = featuredGames[currentIndex];
  const contentArea = document.getElementById("carousel-content");

  //cambia la imagen principal al pasar el mouse por las miniaturas
  const thumbsHTML = game.screenshots
    .map(
      (img) => `
        <div class="thumb">
            <img src="${img}" onmouseover="document.getElementById('main-img').src='${img}'">
        </div>
    `,
    )
    .join("");

  // renderiza el contenido del juego destacado
  contentArea.innerHTML = `
        <div class="carousel-card">
            <div class="main-capsule">
                <img src="${game.main_image}" id="main-img">
            </div>
            <div class="info-side">
                <h3 class="game-title">${game.title}</h3>
                <div class="screenshots">${thumbsHTML}</div>
                <div class="status-info">
                    <p style="font-size: 13px; margin: 5px 0;">Ya disponible</p>
                    <span class="tag">${game.tag}</span>
                </div>
                <div class="price-row">
                    <span class="price">${game.price}</span>
                    <img src="./img/img_games/windows.png" style="width:18px; opacity:0.6;">
                </div>
            </div>
        </div>
    `;

  updateDots();
}
//sincroniza los puntos del carrusel con el juego destacado
function updateDots() {
  dotsArea.innerHTML = featuredGames
    .map(
      (_, i) => `
        <span class="dot ${i === currentIndex ? "active" : ""}"></span>
    `,
    )
    .join("");
}

/*seccion de ofertas*/
//TODO: Mejorar grid-area para hacerlo mas dinamico mostrar diferentes grids dependiendo de la cantidad de ofertas

function renderDiscounts() {
  const container = document.getElementById("offers-container");
  //renderiza 4 ofertas a la vez, dependiendo del índice actual
  const visibleOffers = discountGames.slice(offerIndex, offerIndex + 4);

  container.innerHTML = visibleOffers
    .map(
      (game, index) => `
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
    `,
    )
    .join("");
}
//navegación de carrusel de juegos destacados y ofertas
//mirar si se pueden poner iguales para ambos
document.getElementById("nextBtn").onclick = () => {
  currentIndex = (currentIndex + 1) % featuredGames.length;
  renderFeatured();
};

document.getElementById("prevBtn").onclick = () => {
  currentIndex =
    (currentIndex - 1 + featuredGames.length) % featuredGames.length;
  renderFeatured();
};

document.getElementById("nextOfferBtn").onclick = () => {
  if (offerIndex + 3 < discountGames.length) {
    offerIndex += 3;
  } else {
    offerIndex = 0; 
  }
  renderDiscounts();
};
document.getElementById("prevOfferBtn").onclick = () => {
  if (offerIndex - 3 >= 0) {
    offerIndex -= 3;
  } else {
    offerIndex = Math.max(0, discountGames.length - 3); 
  }
  renderDiscounts();
};

/*seccion de listado de juegos- en progreso*/
function renderTabbedList(filteredGames) {
  const listContainer = document.getElementById("main-games-list");

  listContainer.innerHTML = filteredGames
    .map(
      (game) => `
        <div class="list-item" onmouseover="showPreview(${game.id})">
            <img src="${game.main_image}">
            <div style="flex-grow: 1;">
                <div class="game-name">${game.title}</div>
                <div style="font-size: 11px; opacity: 0.7;">${game.tag}</div>
            </div>
            <div class="game-price">${game.price}</div>
        </div>
    `,
    )
    .join("");

  
  if (filteredGames.length > 0) showPreview(filteredGames[0].id);
}

// Función que actualiza el panel azul derecho -no funcional
window.showPreview = function (id) {
  const game = allGames.find((g) => g.id === id); 
  const previewContainer = document.getElementById("preview-container");

  previewContainer.innerHTML = `
        <h3>${game.title}</h3>
        <div style="background: rgba(0,0,0,0.1); padding: 5px; margin-bottom: 10px; font-size: 12px;">
            Reseñas: <span style="color: #66c0f4">Muy positivas</span>
        </div>
        <div class="preview-tags">
            <span>Acción</span><span>Aventura</span><span>Indie</span>
        </div>
        <div class="preview-shots">
            ${game.screenshots.map((src) => `<img src="${src}">`).join("")}
        </div>
    `;
};

loadGames();
