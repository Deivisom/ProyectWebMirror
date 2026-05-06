document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener el ID del juego desde la URL (?id=X)
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (!gameId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // 2. Fetch de los datos del juego al API
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) throw new Error('Juego no encontrado');
        
        const game = await response.json();
        
        // 3. Rellenar los datos en la página
        document.title = `${game.title} en Steam`;
        document.getElementById('game-title').textContent = game.title;
        document.getElementById('purchase-title').textContent = `Comprar ${game.title}`;
        document.getElementById('side-game-img').src = game.main_image;
        document.getElementById('game-price').textContent = game.final_price || game.price || 'Gratis';
        
        if (game.tag) {
            document.getElementById('game-short-desc').textContent = `Explora el increíble mundo de ${game.title}. Un título de la categoría ${game.tag} que te mantendrá enganchado durante horas.`;
        }

        // 4. Manejo de Media (Imágenes/Capturas)
        const mainMediaContainer = document.getElementById('main-media-container');
        const thumbnailsContainer = document.getElementById('media-thumbnails');
        
        // Imagen principal inicial
        const mainImg = document.createElement('img');
        mainImg.src = game.main_image;
        mainImg.id = 'current-main-img';
        mainMediaContainer.appendChild(mainImg);

        // Generar miniaturas (incluimos la principal y las secundarias)
        const allScreenshots = [game.main_image];
        if (game.screenshots) {
            try {
                const extra = typeof game.screenshots === 'string' ? JSON.parse(game.screenshots) : game.screenshots;
                if (Array.isArray(extra)) allScreenshots.push(...extra);
            } catch (e) {
                console.warn('Error parsing screenshots', e);
            }
        }

        allScreenshots.forEach((src, index) => {
            if (!src) return;
            const thumb = document.createElement('img');
            thumb.src = src;
            if (index === 0) thumb.classList.add('active');
            
            thumb.addEventListener('click', () => {
                document.getElementById('current-main-img').src = src;
                document.querySelectorAll('.media-thumbnails img').forEach(img => img.classList.remove('active'));
                thumb.classList.add('active');
            });
            
            thumbnailsContainer.appendChild(thumb);
        });

        // 5. Botón de deseados
        const btnWish = document.getElementById('btn-add-wishlist');
        if (btnWish) {
            btnWish.addEventListener('click', () => {
                let wishlist = JSON.parse(localStorage.getItem("steam_wishlist")) || [];
                if (!wishlist.some(item => item.id === game.id)) {
                    wishlist.push(game);
                    localStorage.setItem("steam_wishlist", JSON.stringify(wishlist));
                    alert(`${game.title} añadido a tu lista de deseados.`);
                } else {
                    alert('Este juego ya está en tu lista.');
                }
            });
        }

        // 6. Botón de Añadir al Carro
        const btnCart = document.querySelector('.btn-add-cart');
        if (btnCart) {
            btnCart.addEventListener('click', () => {
                let cart = JSON.parse(localStorage.getItem("steam_cart")) || [];
                if (!cart.some(item => item.id === game.id)) {
                    cart.push(game);
                    localStorage.setItem("steam_cart", JSON.stringify(cart));
                    alert(`${game.title} añadido al carrito.`);
                    // Intentar actualizar el contador si existe en el header
                    const cartCount = document.getElementById('cart-count');
                    if (cartCount) cartCount.textContent = cart.length;
                    const cartBtn = document.getElementById('cart-button');
                    if (cartBtn) cartBtn.style.display = 'flex';
                } else {
                    alert('Este juego ya está en tu carrito.');
                }
            });
        }

    } catch (error) {
        console.error('Error al cargar el juego:', error);
        alert('Hubo un error al cargar los detalles del juego.');
        // window.location.href = 'index.html';
    }
});
