// Variables globales
let scene, camera, renderer, car, road = [], obstacles = [], particles = [];
let gameStarted = false, gameOver = false, gameLoaded = false;
let score = 0, speed = 0, distance = 0, level = 1;
let keys = { left: false, right: false, space: false };
let carPosition = { x: 0, targetX: 0 };
let cameraShake = { x: 0, y: 0, intensity: 0 };
let minimapCtx, powerUps = [], trails = [];
let currentLevelData = {};
let carTrails = [], speedLines = [], combo = 0, lastCollectTime = 0;
let screenEffects = { flash: false, levelUp: false };
let frameCount = 0, lastFPSTime = 0, fps = 60;

// Object Pools pour optimisation
const pools = {
    obstacles: [],
    trails: [],
    particles: [],
    speedLines: []
};

// Configuration
const ROAD_WIDTH = 12;
const CAR_SPEED = 0.25;
let OBSTACLE_SPEED = 0.3;
const MAX_SPEED = 0.8;
let difficultyMultiplier = 1;

// Détection mobile
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const MAX_PARTICLES = isMobile ? 50 : 80;
const MAX_TRAILS = isMobile ? 15 : 25;
const MAX_SPEED_LINES = isMobile ? 8 : 12;

// Niveaux avec thèmes
const LEVELS = {
    1: { name: "DÉBUTANT", color: 0x00ffff, fogColor: 0x000011, obstacleColor: 0xff0044 },
    2: { name: "PILOTE", color: 0x00ff88, fogColor: 0x001100, obstacleColor: 0xff4400 },
    3: { name: "EXPERT", color: 0xff00ff, fogColor: 0x110011, obstacleColor: 0xff0088 },
    4: { name: "PRO", color: 0xffff00, fogColor: 0x111100, obstacleColor: 0xff8800 },
    5: { name: "LÉGENDE", color: 0xff0066, fogColor: 0x110000, obstacleColor: 0xff0000 }
};

// Effets visuels
let particleSystem, trailSystem, explosionParticles = [], neonLights = [];

// Géométries partagées pour performance
const sharedGeometries = {
    obstacle: new THREE.OctahedronGeometry(0.8),
    cone: new THREE.ConeGeometry(0.6, 1.5, 6),
    powerUp: new THREE.SphereGeometry(0.5),
    trail: new THREE.SphereGeometry(0.1),
    speedLine: new THREE.BoxGeometry(0.05, 0.05, 2)
};

// Initialisation
function init() {
    // Écran de chargement
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            gameLoaded = true;
        }, 1000);
    }, 3000);
    
    // Scène
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000011, 30, 150);
    
    // Caméra avec position optimisée
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 8);
    camera.lookAt(0, 0, -10);
    
    // Renderer optimisé pour Vercel/mobile
    const canvas = document.getElementById('gameCanvas');
    
    renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: !isMobile, 
        alpha: false,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Ombres seulement sur desktop
    if (!isMobile) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
    }
    
    // Éclairage néon
    const ambientLight = new THREE.AmbientLight(0x001122, 0.3);
    scene.add(ambientLight);
    
    // Lumière principale
    const mainLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    mainLight.position.set(0, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    scene.add(mainLight);
    
    // Seulement 2 lumières néon pour performance
    const neonLight1 = new THREE.PointLight(0xff00ff, 2, 50);
    neonLight1.position.set(-15, 8, -30);
    neonLights.push(neonLight1);
    scene.add(neonLight1);
    
    const neonLight2 = new THREE.PointLight(0x00ff88, 2, 50);
    neonLight2.position.set(15, 8, -30);
    neonLights.push(neonLight2);
    scene.add(neonLight2);
    
    // Création des éléments
    createCar();
    createRoad();
    createParticleSystem();
    createEnvironment();
    setupMinimap();
    setupControls();
    
    animate();
}

function createCar() {
    const carGroup = new THREE.Group();
    
    // Carrosserie principale avec matériau néon
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.9, 3.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ffff,
        emissive: 0x002244,
        shininess: 100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.45;
    body.castShadow = true;
    carGroup.add(body);
    
    // Cockpit
    const cockpitGeometry = new THREE.BoxGeometry(1.4, 0.8, 2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x001122,
        transparent: true,
        opacity: 0.8
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 1.1, -0.2);
    cockpit.castShadow = true;
    carGroup.add(cockpit);
    
    // Aileron arrière
    const spoilerGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
    const spoilerMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
    spoiler.position.set(0, 1.2, -1.8);
    carGroup.add(spoiler);
    
    // Roues avec jantes néon
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const rimMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff88,
        emissive: 0x002211
    });
    
    const wheelPositions = [
        [-0.9, 0, 1.4], [0.9, 0, 1.4],
        [-0.9, 0, -1.4], [0.9, 0, -1.4]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.32, 8), rimMaterial);
        wheel.position.set(...pos);
        rim.position.set(...pos);
        wheel.rotation.z = Math.PI / 2;
        rim.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        carGroup.add(wheel);
        carGroup.add(rim);
    });
    
    // Phares simples sans faisceaux coûteux
    const headlightGeometry = new THREE.SphereGeometry(0.2, 6, 6);
    const headlightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff
    });
    
    [-0.6, 0.6].forEach(x => {
        const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight.position.set(x, 0.6, 1.8);
        carGroup.add(headlight);
    });
    
    car = carGroup;
    car.position.set(0, 0, 5);
    carPosition.x = 0;
    carPosition.targetX = 0;
    scene.add(car);
}

function createRoad() {
    // Route principale avec texture néon
    const roadGeometry = new THREE.PlaneGeometry(ROAD_WIDTH, 300);
    const roadMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x001122,
        emissive: 0x000511
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.z = -75;
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);
    
    // Lignes de route néon
    for (let i = 0; i < 30; i++) {
        const lineGeometry = new THREE.BoxGeometry(0.3, 0.02, 5);
        const lineMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.3
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 0.01, -i * 10);
        road.push(line);
        scene.add(line);
    }
    
    // Bordures néon
    [-ROAD_WIDTH/2 - 1.5, ROAD_WIDTH/2 + 1.5].forEach((x, index) => {
        for (let i = 0; i < 60; i++) {
            const barrierGeometry = new THREE.BoxGeometry(0.3, 1.5, 3);
            const barrierMaterial = new THREE.MeshPhongMaterial({ 
                color: index === 0 ? 0xff00ff : 0x00ff88,
                emissive: index === 0 ? 0x330022 : 0x002211
            });
            const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
            barrier.position.set(x, 0.75, -i * 5);
            barrier.castShadow = true;
            scene.add(barrier);
        }
    });
}

function createObstacle() {
    const obstacleType = Math.random();
    let obstacle = pools.obstacles.pop();
    const levelData = LEVELS[level] || LEVELS[5];
    
    if (!obstacle) {
        if (obstacleType < 0.75) {
            const geometry = level >= 3 ? sharedGeometries.cone : sharedGeometries.obstacle;
            const material = new THREE.MeshBasicMaterial({ 
                color: levelData.obstacleColor
            });
            obstacle = new THREE.Mesh(geometry, material);
        } else {
            const material = new THREE.MeshBasicMaterial({ 
                color: levelData.color
            });
            obstacle = new THREE.Mesh(sharedGeometries.powerUp, material);
            obstacle.isPowerUp = true;
        }
    }
    
    obstacle.material.color.setHex(obstacle.isPowerUp ? levelData.color : levelData.obstacleColor);
    obstacle.position.set(
        (Math.random() - 0.5) * (ROAD_WIDTH - 3),
        obstacle.isPowerUp ? 1 : 0.8,
        -60
    );
    obstacle.rotationSpeed = (Math.random() - 0.5) * 0.2;
    obstacle.visible = true;
    
    obstacles.push(obstacle);
    scene.add(obstacle);
}

function updateLevelTheme() {
    const levelData = LEVELS[level] || LEVELS[5];
    
    // Changement du brouillard
    scene.fog.color.setHex(levelData.fogColor);
    
    // Mise à jour de l'interface
    document.getElementById('levelName').textContent = levelData.name;
    document.getElementById('levelName').style.color = `#${levelData.color.toString(16).padStart(6, '0')}`;
    
    // Effets de transition
    cameraShake.intensity = 0.4;
    showLevelUpNotification(levelData.name);
    flashScreen();
    
    // Changement des lumières néon
    neonLights.forEach((light, index) => {
        light.color.setHex(index % 2 === 0 ? levelData.color : levelData.obstacleColor);
    });
    
    currentLevelData = levelData;
}

function showLevelUpNotification(levelName) {
    const notification = document.getElementById('levelUpNotification');
    notification.textContent = `NIVEAU ${level}: ${levelName}`;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

function flashScreen() {
    const flash = document.getElementById('screenFlash');
    flash.classList.remove('hidden');
    setTimeout(() => {
        flash.classList.add('hidden');
    }, 200);
}

function createCarTrail() {
    if (carTrails.length >= MAX_TRAILS) return;
    
    let trail = pools.trails.pop();
    if (!trail) {
        const trailMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });
        trail = new THREE.Mesh(sharedGeometries.trail, trailMaterial);
    }
    
    trail.position.copy(car.position);
    trail.position.y = 0.2;
    trail.life = 1.0;
    trail.visible = true;
    
    carTrails.push(trail);
    scene.add(trail);
}

function createSpeedLines() {
    if (speedLines.length >= MAX_SPEED_LINES) return;
    
    for (let i = 0; i < 3; i++) {
        let line = pools.speedLines.pop();
        if (!line) {
            const lineMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.4
            });
            line = new THREE.Mesh(sharedGeometries.speedLine, lineMaterial);
        }
        
        line.position.set(
            (Math.random() - 0.5) * 20,
            Math.random() * 10,
            -Math.random() * 50 - 10
        );
        line.velocity = Math.random() * 2 + 1;
        line.visible = true;
        
        speedLines.push(line);
        scene.add(line);
    }
}

function createParticleSystem() {
    // Système de particules optimisé
    const particleCount = MAX_PARTICLES;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = Math.random() * 20;
        positions[i * 3 + 2] = -Math.random() * 100;
        velocities.push({ x: 0, y: 0, z: Math.random() * 2 + 1 });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.5,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: false
    });
    
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.userData = { velocities };
    particleSystem.frustumCulled = false;
    scene.add(particleSystem);
}

function createEnvironment() {
    // Gratte-ciels en arrière-plan
    for (let i = 0; i < 20; i++) {
        const buildingGeometry = new THREE.BoxGeometry(
            Math.random() * 5 + 2,
            Math.random() * 30 + 10,
            Math.random() * 5 + 2
        );
        const buildingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x001122,
            emissive: Math.random() > 0.7 ? 0x002244 : 0x000000
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        
        building.position.set(
            (Math.random() - 0.5) * 200,
            building.geometry.parameters.height / 2,
            -Math.random() * 200 - 50
        );
        
        scene.add(building);
    }
}

function setupMinimap() {
    const canvas = document.getElementById('minimapCanvas');
    if (isMobile) {
        canvas.width = 100;
        canvas.height = 130;
    }
    minimapCtx = canvas.getContext('2d');
}

function setupControls() {
    // Contrôles clavier
    document.addEventListener('keydown', (event) => {
        if (!gameLoaded) return;
        
        if (!gameStarted && !gameOver && event.code === 'Space') {
            startGame();
        }
        
        switch(event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                keys.left = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                keys.right = true;
                break;
            case 'Space':
                keys.space = true;
                event.preventDefault();
                break;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        switch(event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                keys.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                keys.right = false;
                break;
            case 'Space':
                keys.space = false;
                break;
        }
    });
    
    // Contrôles tactiles
    if (isMobile) {
        setupTouchControls();
    }
}

function setupTouchControls() {
    const touchLeft = document.getElementById('touchLeft');
    const touchRight = document.getElementById('touchRight');
    const touchStart = document.getElementById('touchStart');
    
    // Bouton gauche
    touchLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.left = true;
    });
    touchLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.left = false;
    });
    
    // Bouton droite
    touchRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.right = true;
    });
    touchRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.right = false;
    });
    
    // Bouton start
    touchStart.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameStarted && !gameOver && gameLoaded) {
            startGame();
        }
    });
    
    // Gestion du swipe sur l'écran
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!gameStarted || gameOver) return;
        
        const touchX = e.touches[0].clientX;
        const diff = touchX - touchStartX;
        
        if (Math.abs(diff) > 20) {
            keys.left = diff < 0;
            keys.right = diff > 0;
        }
    });
    
    document.addEventListener('touchend', () => {
        keys.left = false;
        keys.right = false;
    });
}

function startGame() {
    gameStarted = true;
    document.getElementById('instructions').classList.add('hidden');
    if (isMobile) {
        document.getElementById('touchStart').style.display = 'none';
    }
}

function updateGame() {
    if (!gameStarted || gameOver) return;
    
    // Mouvement fluide de la voiture
    if (keys.left && carPosition.targetX > -ROAD_WIDTH/2 + 2) {
        carPosition.targetX -= 0.2;
    }
    if (keys.right && carPosition.targetX < ROAD_WIDTH/2 - 2) {
        carPosition.targetX += 0.2;
    }
    
    // Interpolation smooth
    carPosition.x += (carPosition.targetX - carPosition.x) * 0.15;
    car.position.x = carPosition.x;
    
    // Inclinaison de la voiture
    const targetRotation = (carPosition.targetX - carPosition.x) * 0.3;
    car.rotation.z += (targetRotation - car.rotation.z) * 0.1;
    
    // Création de traînées de voiture (optimisé)
    if (frameCount % 3 === 0 && Math.random() < 0.4) {
        createCarTrail();
    }
    
    // Création de lignes de vitesse (optimisé)
    if (frameCount % 5 === 0 && speedLines.length < MAX_SPEED_LINES) {
        createSpeedLines();
    }
    
    // Augmentation progressive de la difficulté avec niveaux
    distance += OBSTACLE_SPEED * 10;
    const newLevel = Math.floor(distance / 1200) + 1;
    
    // Changement de niveau
    if (newLevel !== level) {
        level = Math.min(newLevel, 5);
        updateLevelTheme();
    }
    
    difficultyMultiplier = 1 + (level - 1) * 0.12;
    OBSTACLE_SPEED = Math.min(0.3 * difficultyMultiplier, MAX_SPEED);
    
    // Mouvement des éléments de route
    road.forEach(line => {
        line.position.z += OBSTACLE_SPEED;
        if (line.position.z > 20) {
            line.position.z = -280;
        }
    });
    
    // Création d'obstacles avec difficulté progressive
    const spawnRate = 0.012 + (level - 1) * 0.003;
    if (Math.random() < spawnRate) {
        createObstacle();
    }
    
    // Mouvement et gestion des obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += OBSTACLE_SPEED;
        obstacle.rotation.y += obstacle.rotationSpeed;
        
        if (obstacle.isPowerUp) {
            obstacle.position.y += Math.sin(Date.now() * 0.01 + index) * 0.02;
        }
        
        // Collision
        const distance = car.position.distanceTo(obstacle.position);
        if (distance < (obstacle.isPowerUp ? 1.5 : 1.8)) {
            if (obstacle.isPowerUp) {
                // Bonus collecté avec combo
                const currentTime = Date.now();
                if (currentTime - lastCollectTime < 2000) {
                    combo++;
                } else {
                    combo = 1;
                }
                lastCollectTime = currentTime;
                
                const bonusScore = 50 * combo;
                score += bonusScore;
                
                createExplosion(obstacle.position, currentLevelData.color || 0x00ff88);
                createPowerUpEffect(obstacle.position);
                scene.remove(obstacle);
                obstacles.splice(index, 1);
            } else {
                // Collision avec obstacle
                createExplosion(car.position, 0xff0044);
                cameraShake.intensity = 0.6;
                flashScreen();
                combo = 0;
                endGame();
            }
        }
        
        // Recyclage des obstacles hors écran
        if (obstacle.position.z > 20) {
            obstacle.visible = false;
            scene.remove(obstacle);
            pools.obstacles.push(obstacle);
            obstacles.splice(index, 1);
            if (!obstacle.isPowerUp) {
                score += 10;
            }
        }
    });
    
    // Mise à jour des particules et effets
    updateParticles();
    updateCarTrails();
    updateSpeedLines();
    updateNeonLights();
    
    // Shake de caméra
    if (cameraShake.intensity > 0) {
        camera.position.x = (Math.random() - 0.5) * cameraShake.intensity;
        camera.position.y = 6 + (Math.random() - 0.5) * cameraShake.intensity;
        cameraShake.intensity *= 0.9;
    }
    
    // Mise à jour de l'interface
    speed = Math.floor(OBSTACLE_SPEED * 150);
    document.getElementById('score').textContent = `SCORE: ${score}`;
    document.getElementById('speed').textContent = `${speed} KM/H`;
    document.getElementById('distance').textContent = `${Math.floor(distance)}m`;
    document.getElementById('level').textContent = level;
    
    // Mise à jour du nom de niveau si pas encore fait
    if (!currentLevelData.name) {
        updateLevelTheme();
    }
    
    // Minimap
    updateMinimap();
}

function updateParticles() {
    if (!particleSystem) return;
    
    const positions = particleSystem.geometry.attributes.position.array;
    const velocities = particleSystem.userData.velocities;
    
    for (let i = 0; i < velocities.length; i++) {
        positions[i * 3 + 2] += velocities[i].z;
        
        if (positions[i * 3 + 2] > 20) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 20;
            positions[i * 3 + 2] = -100;
        }
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true;
}

function updateCarTrails() {
    for (let i = carTrails.length - 1; i >= 0; i--) {
        const trail = carTrails[i];
        trail.life -= 0.03;
        trail.material.opacity = trail.life;
        trail.position.z -= 0.1;
        
        if (trail.life <= 0) {
            trail.visible = false;
            scene.remove(trail);
            pools.trails.push(trail);
            carTrails.splice(i, 1);
        }
    }
}

function updateSpeedLines() {
    for (let i = speedLines.length - 1; i >= 0; i--) {
        const line = speedLines[i];
        line.position.z += line.velocity;
        
        if (line.position.z > 20) {
            line.visible = false;
            scene.remove(line);
            pools.speedLines.push(line);
            speedLines.splice(i, 1);
        }
    }
}

function updateNeonLights() {
    // Animation simplifiée toutes les 10 frames
    if (frameCount % 10 === 0) {
        const time = Date.now() * 0.003;
        neonLights[0].intensity = 1.8 + Math.sin(time) * 0.4;
        neonLights[1].intensity = 1.8 + Math.cos(time) * 0.4;
    }
}

function createPowerUpEffect(position) {
    for (let i = 0; i < 10; i++) {
        const ringGeometry = new THREE.RingGeometry(0.5, 0.7, 8);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: currentLevelData.color || 0x00ff88,
            transparent: true,
            opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        
        ring.position.copy(position);
        ring.rotation.x = Math.PI / 2;
        ring.scale.set(0.1, 0.1, 0.1);
        ring.life = 1.0;
        
        explosionParticles.push(ring);
        scene.add(ring);
    }
}

function createExplosion(position, color) {
    for (let i = 0; i < 20; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1);
        const particleMaterial = new THREE.MeshBasicMaterial({ color });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 2,
            (Math.random() - 0.5) * 2
        );
        particle.life = 1.0;
        
        explosionParticles.push(particle);
        scene.add(particle);
    }
}

function updateMinimap() {
    if (!minimapCtx) return;
    
    const canvas = document.getElementById('minimapCanvas');
    const width = canvas.width;
    const height = canvas.height;
    
    minimapCtx.fillStyle = '#000011';
    minimapCtx.fillRect(0, 0, width, height);
    
    // Route
    minimapCtx.fillStyle = '#001122';
    const roadWidth = width * 0.6;
    const roadX = (width - roadWidth) / 2;
    minimapCtx.fillRect(roadX, 0, roadWidth, height);
    
    // Voiture
    minimapCtx.fillStyle = '#00ffff';
    const carX = width / 2 + (car.position.x / ROAD_WIDTH) * roadWidth;
    const carSize = isMobile ? 4 : 6;
    minimapCtx.fillRect(carX - carSize/2, height - 20, carSize, carSize + 2);
    
    // Obstacles
    obstacles.forEach(obstacle => {
        const obstacleX = width / 2 + (obstacle.position.x / ROAD_WIDTH) * roadWidth;
        const obstacleY = ((obstacle.position.z + 60) / 80) * height;
        
        if (obstacleY >= 0 && obstacleY <= height) {
            minimapCtx.fillStyle = obstacle.isPowerUp ? '#00ff88' : '#ff0044';
            const size = isMobile ? 2 : 3;
            minimapCtx.fillRect(obstacleX - size, obstacleY - size, size * 2, size * 2);
        }
    });
}

function endGame() {
    gameOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalDistance').textContent = Math.floor(distance);
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

function restartGame() {
    // Reset des variables
    gameStarted = false;
    gameOver = false;
    score = 0;
    speed = 0;
    distance = 0;
    level = 1;
    difficultyMultiplier = 1;
    OBSTACLE_SPEED = 0.3;
    currentLevelData = {};
    
    // Reset du thème
    scene.fog.color.setHex(0x000011);
    document.getElementById('levelName').textContent = 'DÉBUTANT';
    document.getElementById('levelName').style.color = '#00ffff';
    
    // Reset de la voiture
    car.position.set(0, 0, 5);
    car.rotation.z = 0;
    carPosition.x = 0;
    carPosition.targetX = 0;
    
    // Reset caméra
    camera.position.set(0, 6, 8);
    cameraShake.intensity = 0;
    
    // Suppression des obstacles et particules
    obstacles.forEach(obstacle => scene.remove(obstacle));
    obstacles = [];
    
    explosionParticles.forEach(particle => scene.remove(particle));
    explosionParticles = [];
    
    // Recyclage optimisé des objets
    carTrails.forEach(trail => {
        trail.visible = false;
        scene.remove(trail);
        pools.trails.push(trail);
    });
    carTrails = [];
    
    speedLines.forEach(line => {
        line.visible = false;
        scene.remove(line);
        pools.speedLines.push(line);
    });
    speedLines = [];
    
    obstacles.forEach(obstacle => {
        obstacle.visible = false;
        scene.remove(obstacle);
        pools.obstacles.push(obstacle);
    });
    obstacles = [];
    
    combo = 0;
    lastCollectTime = 0;
    
    // Reset de l'UI
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('instructions').classList.remove('hidden');
    if (isMobile) {
        document.getElementById('touchStart').style.display = 'flex';
    }
}

function animate() {
    requestAnimationFrame(animate);
    frameCount++;
    
    // Calcul FPS pour optimisation adaptative
    const currentTime = performance.now();
    if (currentTime - lastFPSTime > 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFPSTime = currentTime;
        
        // Ajustement qualité selon FPS
        if (fps < 45) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio * 0.8, 1));
        } else if (fps > 55) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    }
    
    // Mise à jour des particules d'explosion (optimisé)
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const particle = explosionParticles[i];
        if (particle.velocity) {
            particle.position.add(particle.velocity);
            particle.velocity.multiplyScalar(0.98);
        } else {
            particle.scale.multiplyScalar(1.05);
        }
        
        particle.life -= 0.02;
        particle.material.opacity = particle.life;
        
        if (particle.life <= 0) {
            scene.remove(particle);
            explosionParticles.splice(i, 1);
        }
    }
    
    updateGame();
    renderer.render(scene, camera);
}

// Redimensionnement
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Démarrage
init();

// Optimisations de performance
window.addEventListener('blur', () => {
    // Pause le jeu quand la fenêtre perd le focus
});

window.addEventListener('focus', () => {
    // Reprend le jeu
});