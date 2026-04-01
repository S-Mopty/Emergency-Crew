# 🚨 Emergency Crew

> **"Réparez la station. Sabotez vos collègues. Devenez l'Employé du Mois."**

**Emergency Crew** est un jeu multijoueur (3-6 joueurs) de survie technique en **2D isométrique**. Une équipe de maintenance est coincée dans une station qui tombe en ruines. Tout le monde doit coopérer pour empêcher l'explosion — mais à la fin, un seul joueur sera sacré **Employé du Mois**.

---

## 🎮 Le Pitch

La station est en alerte. Les pannes s'enchaînent, la jauge de stabilité chute, et les objets de réparation sont en nombre insuffisant. Vous devez réparer pour survivre, mais chaque réparation rapporte des **Crédits de Maintenance** — et seul le meilleur score gagne.

Le dilemme : **trop de sabotage et la station explose** (tout le monde perd). **Pas assez et vous laissez la victoire aux autres.**

---

## ✨ Caractéristiques

- **Multijoueur local/en ligne** — 3 à 6 joueurs par manche
- **Manches courtes** — 7 à 8min30 selon le nombre de joueurs
- **Combat non-létal** — Bousculade et Coup Chargé pour interrompre, jamais pour éliminer
- **Pannes en escalade** — 3 phases de difficulté croissante, jusqu'au chaos total
- **Inventaire à 1 slot** — Chaque objet ramassé est un choix stratégique
- **Outils spéciaux rares** — Bonus puissants mais qui occupent votre unique slot
- **Classement de fin** — Employé du Mois, Saboteur, Héros Silencieux, Stagiaire

---

## 🗂️ Documentation du Game Design

| Document | Contenu |
| :--- | :--- |
| [`01_Vision_Globale.md`](01_Vision_Globale.md) | Concept, piliers du jeu, dilemme central |
| [`02_Regles_Et_Mecaniques.md`](02_Regles_Et_Mecaniques.md) | Règles complètes, combat, pannes, inventaire, scoring |
| [`03_Systemes_Et_Objets.md`](03_Systemes_Et_Objets.md) | Types de pannes, objets, jauge de stabilité |
| [`04_Score_Et_Progression.md`](04_Score_Et_Progression.md) | Barème des crédits, écran de fin, podium |
| [`05_Technical_Setup.md`](05_Technical_Setup.md) | Architecture technique, réseau, prochaines étapes |

---

## 🕹️ Résumé des Mécaniques

### Déroulement d'une manche

```
SPAWN → PHASE 1 (calme) → PHASE 2 (tension) → PHASE 3 (chaos) → FIN
         1 panne/20s        2 pannes/12s       3 pannes/8s
                                                + Surchauffe possible
```

### Combat

| Action | Effet | Interrompt une réparation ? |
| :--- | :--- | :---: |
| **Bousculade** | Repousse + drop d'objet | ❌ |
| **Coup Chargé** | Stun 2s + drop d'objet | ✅ |

### Types de pannes

| Panne | Objet requis | Conséquence |
| :--- | :--- | :--- |
| Fuite de Gaz | Kit de Soudure | Ralentissement zone |
| Court-Circuit | Fusible | Brouillard de guerre |
| Surchauffe | Liquide Refroidissement | 30s → Game Over total |

### Condition de victoire

- **Station debout au chrono final** → Victoire collective, classement individuel
- **Jauge de stabilité à 0** → Défaite collective : *"Licenciés pour Faute Grave"*

---

## 🛠️ Stack Technique

- **Rendu :** 2D Isométrique (tuiles 64×32)
- **Réseau :** Server-authoritative
- **Environnement :** WSL (Ubuntu)

---

## 🚧 Roadmap

- [x] Vision du jeu & piliers de design
- [x] Système de combat (Bousculade / Coup Chargé)
- [x] Système de pannes en 3 phases
- [x] Règles d'inventaire (1 slot)
- [x] Scoring & classement de fin
- [ ] Prototype — Déplacement isométrique
- [ ] Prototype — Collision entre joueurs
- [ ] Prototype — Ramassage / dépose d'objet
- [ ] Première map jouable (5 salles)
- [ ] Système de pannes fonctionnel
- [ ] Playtest & équilibrage des valeurs
- [ ] Contenu dynamique (portes, couloirs destructibles)
- [ ] Polish — UI, sons, effets visuels

---

## 👥 Crédits

Projet en cours de développement.

---

*"La station ne va pas se réparer toute seule. Enfin si, mais pas assez vite."*
