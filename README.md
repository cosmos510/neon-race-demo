# NEON RACER

<div align="center">

**A futuristic 3D racing experience built with Three.js & WebGL**

[![Live Demo](https://img.shields.io/badge/Live_Demo-neon--race.vercel.app-blue?style=for-the-badge)](https://neon-race.vercel.app)

[Présentation](#présentation) • [Essayer](#essayer) • [Fonctionnalités](#fonctionnalités) • [Architecture_Technique](#architecture-technique) • [Feuille_de_route](#feuille-de-route) • [Contact](#contact)

</div>

---

## Présentation

**Neon Racer** est une expérience de jeu de course 3D développée avec Three.js et WebGL. Ce projet a été conçu comme une vitrine technique démontrant la maîtrise du rendu 3D dans le navigateur, l'optimisation des performances graphiques et la gestion d'état d'un jeu interactif.

### Le constat

- Le WebGL et les moteurs 3D web nécessitent une gestion rigoureuse de la mémoire et des performances pour garantir la fluidité sur tous les appareils.
- Créer un jeu 3D immersif directement accessible via le navigateur implique de concilier complexité graphique et légèreté d'exécution.

### La solution

Un jeu web 3D optimisé et réactif qui propose :
- **Un rendu néon cyberpunk** - matériaux émissifs, éclairages dynamiques et effets de post-processing
- **Une physique et des contrôles fluides** - détection de collision précise et mouvements interpolés
- **Des performances maîtrisées** - optimisé pour maintenir un taux constant de 60 FPS
- **Une accessibilité universelle** - aucun plugin requis, compatible desktop et mobile

---

## Essayer

<div align="center">

### 👉 [neon-race.vercel.app](https://neon-race.vercel.app) 👈

**Accessible directement depuis votre navigateur, sans téléchargement.**

</div>

### Contrôles

- **A / D** ou **Flèches Gauche / Droite** : Diriger la voiture
- **ESPACE** : Lancer la partie
- **Commandes tactiles** : Supportées sur mobile et tablette

---

## Fonctionnalités

| ✨ Fonctionnalité | Description |
|------------------|-------------|
| **Rendu 3D Cyberpunk** | Matériaux PBR, effets de particules, éclairages néon et camera shake |
| **Interface & Minimap** | HUD futuriste avec minimap radar en temps réel et suivi de score/vitesse |
| **Physique & Gameplay** | Gestion des collisions, bonus de score (power-ups) et difficulté progressive |
| **Post-Processing** | Tone mapping, antialiasing et ombres temps réel pour une immersion maximale |
| **Design Responsive** | Adaptation automatique de l'affichage pour desktop, tablette et mobile |

---

## Performance & Optimisations

| Métrique | Valeur / Méthode |
|----------|------------------|
| **FPS Target** | 60 FPS constant |
| **Draw Calls** | Optimisés (< 50 par frame) |
| **Utilisation Mémoire** | < 100 MB RAM |
| **Techniques d'optimisation** | Object pooling, Frustum culling, géométries procédurales, LOD |

---

## Architecture Technique

### Technologies clés

- **Moteur 3D** : Three.js (WebGL 1.0/2.0)
- **Langages** : JavaScript ES6+ (Programmation Orientée Objet), HTML5 Canvas, CSS3
- **Typography & Assets** : Matériaux générés programmatiquement, police Orbitron

### Architecture logicielle

- Séparation claire entre la boucle de rendu (Render Loop), la physique et l'interface utilisateur (HUD)
- Gestion centralisée des événements et des états de jeu
- Recyclage des objets 3D (Object Pooling) pour minimiser l'impact du Garbage Collector

---

## Feuille de route

- [ ] 🌐 Mode **multijoueur** en temps réel
- [ ] 🛠️ **Éditeur de circuits** personnalisé
- [ ] 🏎️ Choix et **personnalisation des véhicules**
- [ ] 🥽 Compatibilité **VR / AR (WebXR)**
- [ ] 🏆 **Classement mondial** des scores (Leaderboard)

---

## Contact

<div align="center">

[![Email](https://img.shields.io/badge/Email-maximemartin510%40gmail.com-red?style=for-the-badge&logo=gmail)](mailto:maximemartin510@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Maxime_Martin-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/maxime-martin-090731aa/)

</div>

---

<div align="center">

**Neon Racer** - Développé par Maxime Martin.

### [👉 Lancer le jeu](https://neon-race.vercel.app)

</div>
