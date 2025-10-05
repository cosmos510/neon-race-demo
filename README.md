# 🏎️ NEON RACER - Three.js Portfolio Showcase

Une expérience de course futuriste développée avec Three.js, démontrant des compétences avancées en développement web 3D et WebGL.

## 🚀 Fonctionnalités

### Gameplay Avancé
- **Physique réaliste** : Mouvement fluide avec interpolation
- **Système de niveaux** : Difficulté progressive
- **Power-ups** : Collectibles pour bonus de score
- **Collision précise** : Détection optimisée

### Effets Visuels
- **Rendu néon** : Matériaux émissifs et éclairage dynamique
- **Particules** : Système de particules pour les effets
- **Explosions** : Animations de particules lors des collisions
- **Camera shake** : Effets de secousse immersifs
- **Post-processing** : Tone mapping et antialiasing

### Interface Professionnelle
- **Design futuriste** : Interface néon avec animations CSS
- **Minimap** : Radar en temps réel
- **Statistiques** : Score, vitesse, distance, niveau
- **Responsive** : Adaptation mobile et desktop
- **Loading screen** : Écran de chargement animé

### Technologies Utilisées
- **Three.js** : Moteur 3D WebGL
- **JavaScript ES6+** : Programmation moderne
- **CSS3** : Animations et effets visuels
- **HTML5 Canvas** : Minimap et effets 2D

## 🎮 Contrôles

- **← →** ou **A D** : Diriger la voiture
- **ESPACE** : Commencer la partie
- **Responsive** : Support tactile mobile

## 🛠️ Installation et Lancement

```bash
# Cloner le projet
git clone https://github.com/maximemartin/neon-racer.git
cd neon-racer

# Lancer le serveur de développement
npm run start
# ou
python3 -m http.server 3000

# Ouvrir dans le navigateur
http://localhost:3000
```

## 🚀 Déploiement

### Déploiement Rapide (Netlify)
1. Connectez votre repository GitHub à [Netlify](https://netlify.com)
2. Le fichier `netlify.toml` configure automatiquement le déploiement
3. Votre jeu sera en ligne en 2 minutes !

### Autres Options
- **Vercel** : `vercel` (CLI)
- **GitHub Pages** : Activez dans Settings > Pages
- **Firebase** : `firebase deploy`

Voir `deploy.md` pour le guide complet.

## 📱 Compatibilité

- **Navigateurs modernes** : Chrome, Firefox, Safari, Edge
- **WebGL** : Support WebGL 1.0 requis
- **Performance** : Optimisé pour 60 FPS
- **Mobile** : Interface adaptative

## 🎯 Objectifs du Projet

Ce projet démontre :
- Maîtrise de **Three.js** et **WebGL**
- Développement de **jeux web** interactifs
- **Optimisation des performances** 3D
- **Design UX/UI** moderne
- **Programmation orientée objet** JavaScript
- **Gestion d'état** de jeu complexe

## 🏆 Fonctionnalités Techniques

### Rendu 3D
- Géométries procédurales
- Matériaux PBR (Physically Based Rendering)
- Système d'éclairage multi-sources
- Ombres en temps réel
- Fog atmosphérique

### Optimisations
- Object pooling pour les obstacles
- Frustum culling automatique
- Garbage collection optimisée
- Interpolation smooth des mouvements
- LOD (Level of Detail) pour les objets distants

### Architecture
- Code modulaire et maintenable
- Séparation des responsabilités
- Gestion d'événements centralisée
- Configuration paramétrable

## 📊 Métriques de Performance

- **FPS Target** : 60 FPS constant
- **Draw calls** : Optimisés < 50 par frame
- **Memory usage** : < 100MB RAM
- **Loading time** : < 3 secondes

## 🎨 Assets et Design

- **Modèles 3D** : Géométries procédurales Three.js
- **Textures** : Matériaux générés programmatiquement
- **Couleurs** : Palette néon cyberpunk
- **Typographie** : Orbitron (Google Fonts)
- **Animations** : CSS3 + Three.js

## 🎮 Gameplay Optimisé

- **Difficulté équilibrée** : Moins d'obstacles pour une expérience plus accessible
- **Progression fluide** : Montée en niveau plus graduelle
- **Performance 60 FPS** : Optimisé pour tous les appareils

## 📈 Évolutions Futures

- [ ] Multijoueur en temps réel
- [ ] Éditeur de circuits
- [ ] Système de véhicules
- [ ] Mode VR/AR
- [ ] Leaderboards globaux
- [ ] Personnalisation avancée

---

**Développé par Maxime Martin** - Portfolio de compétences Three.js et développement web 3D

*Ce projet est conçu pour démontrer des compétences professionnelles en développement web moderne et peut être intégré dans tout portfolio d'entreprise.*