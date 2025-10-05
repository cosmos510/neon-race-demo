// Variables globales
let scene, camera, renderer, car, road = [], obstacles = [], particles = [];
let gameStarted = false, gameOver = false, gameLoaded = false;
let score = 0, speed = 0, distance = 0, level = 1;
let keys = { left: false, right: false, space: false };
let carPosition = { x: 0, targetX: 0 };
let cameraShake = { x: 0, y: 0, intensity: 0 };
let minimapCtx, powerUps = [], trails = [];

// Configuration
const ROAD_WIDTH = 12;
const CAR_SPEED = 0.25;
let OBSTACLE_SPEED = 0.3;
const MAX_SPEED = 0.8;
let difficultyMultiplier = 1;

// Effets visuels
let particleSystem, trailSystem, explosionParticles = [];

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
    
    // Renderer avec post-processing
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
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
    
    // Lumières d'ambiance néon
    const neonLight1 = new THREE.PointLight(0xff00ff, 2, 50);
    neonLight1.position.set(-15, 5, -20);
    scene.add(neonLight1);
    
    const neonLight2 = new THREE.PointLight(0x00ff88, 2, 50);
    neonLight2.position.set(15, 5, -20);
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
    
    // Phares
    const headlightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headlightMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5
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
    let obstacle;
    
    if (obstacleType < 0.7) {
        // Obstacle standard
        const geometry = new THREE.OctahedronGeometry(0.8);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff0044,
            emissive: 0x440011,
            transparent: true,
            opacity: 0.9
        });
        obstacle = new THREE.Mesh(geometry, material);
    } else {
        // Power-up (bonus)
        const geometry = new THREE.SphereGeometry(0.5);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.5
        });
        obstacle = new THREE.Mesh(geometry, material);
        obstacle.isPowerUp = true;
    }
    
    obstacle.position.set(
        (Math.random() - 0.5) * (ROAD_WIDTH - 3),
        obstacle.isPowerUp ? 1 : 0.8,
        -60
    );
    obstacle.castShadow = true;
    obstacle.rotationSpeed = (Math.random() - 0.5) * 0.2;
    
    obstacles.push(obstacle);
    scene.add(obstacle);
}

function createParticleSystem() {
    // Système de particules pour les effets
    const particleCount = 200;
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
        opacity: 0.6
    });
    
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.userData = { velocities };
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
    minimapCtx = canvas.getContext('2d');
}

function setupControls() {
    document.addEventListener('keydown', (event) => {
        if (!gameLoaded) return;
        
        if (!gameStarted && !gameOver && event.code === 'Space') {
            gameStarted = true;
            document.getElementById('instructions').classList.add('hidden');
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
    
    // Augmentation progressive de la difficulté
    distance += OBSTACLE_SPEED * 10;
    level = Math.floor(distance / 1500) + 1;
    difficultyMultiplier = 1 + (level - 1) * 0.1;
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
                // Bonus collecté
                score += 50;
                createExplosion(obstacle.position, 0x00ff88);
                scene.remove(obstacle);
                obstacles.splice(index, 1);
            } else {
                // Collision avec obstacle
                createExplosion(car.position, 0xff0044);
                cameraShake.intensity = 0.5;
                endGame();
            }
        }
        
        // Suppression des obstacles hors écran
        if (obstacle.position.z > 20) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
            if (!obstacle.isPowerUp) {
                score += 10;
            }
        }
    });
    
    // Mise à jour des particules
    updateParticles();
    
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
    
    minimapCtx.fillStyle = '#000011';
    minimapCtx.fillRect(0, 0, 150, 200);
    
    // Route
    minimapCtx.fillStyle = '#001122';
    minimapCtx.fillRect(25, 0, 100, 200);
    
    // Voiture
    minimapCtx.fillStyle = '#00ffff';
    const carX = 75 + (car.position.x / ROAD_WIDTH) * 100;
    minimapCtx.fillRect(carX - 3, 180, 6, 10);
    
    // Obstacles
    obstacles.forEach(obstacle => {
        const obstacleX = 75 + (obstacle.position.x / ROAD_WIDTH) * 100;
        const obstacleY = ((obstacle.position.z + 60) / 80) * 200;
        
        if (obstacleY >= 0 && obstacleY <= 200) {
            minimapCtx.fillStyle = obstacle.isPowerUp ? '#00ff88' : '#ff0044';
            minimapCtx.fillRect(obstacleX - 2, obstacleY - 2, 4, 4);
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
    
    // Reset de l'UI
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('instructions').classList.remove('hidden');
}

function animate() {
    requestAnimationFrame(animate);
    
    // Mise à jour des particules d'explosion
    explosionParticles.forEach((particle, index) => {
        particle.position.add(particle.velocity);
        particle.velocity.multiplyScalar(0.98);
        particle.life -= 0.02;
        particle.material.opacity = particle.life;
        
        if (particle.life <= 0) {
            scene.remove(particle);
            explosionParticles.splice(index, 1);
        }
    });
    
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