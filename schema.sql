-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS steam;
USE steam;

-- Tabla de juegos
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM('destacados', 'descuentos', 'novedades', 'ventas', 'proximos') NOT NULL DEFAULT 'destacados',
    tag VARCHAR(100),
    main_image VARCHAR(500) NOT NULL,
    price VARCHAR(50),
    original_price VARCHAR(50),
    final_price VARCHAR(50),
    discount VARCHAR(50),
    screenshots JSON -- Almacenará el array de imágenes como JSON
);

-- Insertar datos iniciales desde el games.json actual
INSERT INTO games (title, category, tag, main_image, price, original_price, final_price, discount, screenshots) VALUES
('Crimson Desert', 'destacados', 'Lo más vendido', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2880010/capsule_616x353.jpg', '69,99€', NULL, NULL, NULL, '["https://cdn.cloudflare.steamstatic.com/steam/apps/2880010/ss_8e7f1e6f9d2de6dbf1bb65c4007b8b20ff498522.1920x1080.jpg", "https://cdn.cloudflare.steamstatic.com/steam/apps/2880010/ss_123456789.1920x1080.jpg", "https://cdn.cloudflare.steamstatic.com/steam/apps/2880010/ss_123456789_1.1920x1080.jpg", "https://cdn.cloudflare.steamstatic.com/steam/apps/2880010/ss_123456789_2.1920x1080.jpg"]'),

('Expedition 33', 'destacados', 'Rol', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2808040/capsule_616x353.jpg', '49,99€', NULL, NULL, NULL, '["https://cdn.cloudflare.steamstatic.com/steam/apps/2808040/ss_2fdcfcdafc644be64506cbe6e685f0eb1c85d774.1920x1080.jpg", "https://cdn.cloudflare.steamstatic.com/steam/apps/2808040/ss_2fdcfcdafc644be64506cbe6e685f0eb1c85d774_1.1920x1080.jpg"]'),

('Kingdom Come: Deliverance II', 'destacados', 'Mundo Abierto', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1771300/capsule_616x353.jpg', '59,99€', NULL, NULL, NULL, '["https://cdn.cloudflare.steamstatic.com/steam/apps/1771300/ss_6ec0c541cdfc82b8b9a1da87ffc9a597a7a505b2.1920x1080.jpg"]'),

('inZOI', 'destacados', 'Simulación', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2456740/capsule_616x353.jpg', 'Gratis', NULL, NULL, NULL, '["https://cdn.cloudflare.steamstatic.com/steam/apps/2456740/ss_499f5727beaa0bb1d0b50352ef29d1ff5b2ba13a.1920x1080.jpg"]'),

('Sid Meier’s Civilization® VII', 'destacados', 'Estrategia', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1295660/capsule_616x353.jpg', '69,99€', NULL, NULL, NULL, '["https://cdn.cloudflare.steamstatic.com/steam/apps/1295660/ss_ed0e3bf733076c8c156ab750c37f40cfd693bf6f.1920x1080.jpg"]'),

('My Time at Sandrock', 'descuentos', 'Aventura', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1084600/header.jpg', NULL, '39,99€', '15,99€', '-60%', '["https://cdn.cloudflare.steamstatic.com/steam/apps/1084600/ss_ccdb43db16922df6eeada1fbad0fbac0fb39ea05.1920x1080.jpg"]'),

('Sons Of The Forest', 'descuentos', 'Supervivencia', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1326470/header.jpg', NULL, '28,99€', '14,49€', '-50%', '["https://cdn.cloudflare.steamstatic.com/steam/apps/1326470/ss_bf4eb3fe4ce92404bc617b07bc4ced78f7e349fd.1920x1080.jpg"]'),

('Detroit: Become Human', 'descuentos', 'Decisiones', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1222140/header.jpg', NULL, '39,90€', '11,97€', '-70%', '["https://cdn.cloudflare.steamstatic.com/steam/apps/1222140/ss_3e2b26c7d24abaf6ca3775f28fdec7c9a667b36f.1920x1080.jpg"]'),

('Hogwarts Legacy', 'descuentos', 'Magia', 'https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg', NULL, '59,99€', '17,99€', '-70%', '["https://cdn.cloudflare.steamstatic.com/steam/apps/990080/ss_1.1920x1080.jpg"]'),

('Forza Horizon 5', 'novedades', 'Carreras', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg', '59,99€', NULL, NULL, NULL, '["https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/ss_1.1920x1080.jpg"]'),

('Elden Ring', 'ventas', 'Mundo Abierto', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg', '59,99€', NULL, NULL, NULL, '["https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_1.1920x1080.jpg"]'),

('Hollow Knight: Silksong', 'proximos', 'Metroidvania', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/header.jpg', 'TBD', NULL, NULL, NULL, '["https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/ss_1.1920x1080.jpg"]');
