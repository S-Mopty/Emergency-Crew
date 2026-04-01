# ⚙️ EMERGENCY CREW : Règles & Mécaniques Profondes

---

## 1. Format de Partie

| Paramètre         | Valeur                                      |
| :----------------- | :------------------------------------------ |
| **Joueurs**        | 3 minimum — 6 maximum                       |
| **Format**         | Manche unique                               |
| **Durée (chrono)** | 7 min (3J) · 7m30 (4J) · 8m (5J) · 8m30 (6J) |
| **Affichage chrono** | Toujours visible, centre-haut de l'écran  |

> **Règle d'or :** Si le chrono atteint zéro et que la station est encore debout → Victoire collective, classement individuel. Si la jauge de Stabilité tombe à zéro avant → Défaite collective, pas de gagnant.

---

## 2. Système de Combat

### Philosophie
Le combat n'élimine jamais un joueur. Son unique but est **d'interrompre et de ralentir**. Chaque seconde passée à se battre est une seconde où personne ne répare.

### 2.1 — La Bousculade (Action rapide)
| Propriété         | Valeur                          |
| :----------------- | :------------------------------ |
| **Input**          | Appui simple (touche action)    |
| **Cooldown**       | ~1 seconde                      |
| **Effet**          | Repousse la cible de 2-3 tuiles |
| **Drop d'objet**   | Oui — l'objet tombe au sol     |
| **Interruption réparation** | ❌ Non              |
| **Vulnérabilité**  | Aucune (action instantanée)     |

> **Usage tactique :** Harcèlement, vol d'objet au sol, contrôle de zone dans les couloirs. Ne sert pas à empêcher une réparation, mais à voler l'objet *avant* qu'elle commence.

### 2.2 — Le Coup Chargé (Action lourde)
| Propriété         | Valeur                                      |
| :----------------- | :------------------------------------------ |
| **Input**          | Maintenir la touche action (~1s de charge)   |
| **Cooldown**       | ~3 secondes après utilisation                |
| **Effet**          | Étourdit la cible pendant 2 secondes         |
| **Drop d'objet**   | Oui — l'objet tombe au sol                  |
| **Interruption réparation** | ✅ Oui — annule la progression |
| **Vulnérabilité**  | Le joueur est **immobile** pendant la charge |

> **Usage tactique :** L'arme nucléaire. Tu peux annuler une réparation en cours, mais tu t'immobilises 1 seconde pour charger (quelqu'un peut te bousculer pendant ce temps). Haut risque, haute récompense.

### 2.3 — Interactions entre actions
- Un joueur en charge de coup peut être **bousculé** → sa charge est annulée.
- Un joueur étourdi (2s) ne peut **rien faire** : pas bouger, pas ramasser, pas réparer.
- Deux bousculades simultanées entre deux joueurs → les deux reculent (physique symétrique).
- Un joueur **en réparation** est protégé contre la bousculade simple mais PAS contre le coup chargé.

---

## 3. Carte & Structure

### 3.1 — Template de base
Chaque map est construite à la main selon cette structure :

```
        [Salle Tech A]
              |
[Salle Tech D] — [STOCKAGE (centre)] — [Salle Tech B]
              |
        [Salle Tech C]
```

- **Salle de Stockage (centre)** : Là où apparaissent les objets de réparation et outils spéciaux. Point névralgique, zone de conflit naturelle.
- **4 Salles Techniques** : Là où se déclenchent les pannes. Chaque salle peut accueillir un type de panne.
- **Couloirs** : Zones de transit entre les salles. C'est là que les embuscades ont lieu.

### 3.2 — Spawn des joueurs
Les joueurs apparaissent dans la **Salle de Stockage** en début de manche, répartis aléatoirement autour de la zone.

### 3.3 — Contenu dynamique (post-MVP)
Prévu pour plus tard, pas dans le prototype :
- Portes qui se verrouillent temporairement.
- Couloirs qui s'effondrent (forçant des détours).
- Éclairage qui saute (lié à la panne Court-Circuit).

---

## 4. Système de Pannes

### 4.1 — Escalade en 3 Phases

| Phase | Timing       | Nom              | Pannes simultanées | Fréquence         | Surchauffe possible |
| :---- | :----------- | :--------------- | :------------------ | :----------------- | :------------------ |
| 1     | 0:00 → 3:00 | Calme avant la tempête | 1 max          | Toutes les ~20s   | ❌ Non              |
| 2     | 3:00 → 6:00 | Ça chauffe       | 2 max               | Toutes les ~12s   | ❌ Non              |
| 3     | 6:00 → Fin  | Alerte Rouge     | 3 max               | Toutes les ~8s    | ✅ Oui              |

> **Note d'équilibrage :** Ces valeurs sont des points de départ. À ajuster en playtest selon le nombre de joueurs (plus de joueurs = pannes plus fréquentes ou plus de pannes simultanées).

### 4.2 — Types de pannes (rappel + précisions)

| Panne             | Objet Requis           | Effet passif (si non réparée)                        | Temps de réparation |
| :----------------- | :--------------------- | :--------------------------------------------------- | :------------------ |
| **Fuite de Gaz**   | Kit de Soudure         | Ralentit tous les joueurs dans la salle (~50% vitesse) | 3 secondes          |
| **Court-Circuit**  | Fusible                | Brouillard de guerre dans la salle (vision réduite)   | 3 secondes          |
| **Surchauffe**     | Liquide Refroidissement | ⚠️ Compte à rebours de 30s → Game Over total         | 4 secondes          |

### 4.3 — Règles de la Surchauffe
- Apparaît **uniquement en Phase 3** (les 2-3 dernières minutes).
- Déclenche un **compte à rebours visible de 30 secondes** pour tous les joueurs (alarme sonore + visuel clignotant).
- Si le compte à rebours atteint zéro → **Game Over immédiat**, la jauge de Stabilité est ignorée.
- Temps de réparation plus long (4s au lieu de 3s) pour compenser sa puissance.
- C'est l'événement qui force la coopération : si personne ne la répare, tout le monde perd.

### 4.4 — Mécanique de réparation
1. Le joueur doit **se tenir devant le panneau de la panne** et **posséder le bon objet** dans son slot.
2. Il maintient la touche d'interaction → une **barre de progression** apparaît (3s standard, 4s pour Surchauffe).
3. Pendant la réparation, le joueur est **immobile et vulnérable au Coup Chargé** (mais protégé contre la bousculade simple).
4. Si la réparation est interrompue (coup chargé reçu), la **progression est perdue** — il faut recommencer.
5. L'objet est **consommé** uniquement si la réparation est complétée avec succès.

---

## 5. Inventaire

### 5.1 — Règle : UN seul slot
Chaque joueur possède **un unique emplacement d'inventaire**. Il peut contenir :
- Un **objet de réparation** (Kit de Soudure, Fusible, Liquide Refroidissement), OU
- Un **outil spécial** (Clé Dorée, etc.)

Jamais les deux en même temps.

### 5.2 — Gestion des objets
- **Ramasser** : Le joueur marche sur l'objet et appuie sur la touche d'interaction.
- **Poser** : Le joueur appuie sur la touche de drop. L'objet apparaît à ses pieds.
- **Échange forcé** : Si le joueur ramasse un objet alors qu'il en tient déjà un, l'ancien objet est **automatiquement posé au sol**.
- **Drop par bousculade/coup** : L'objet tombe à la position du joueur au moment de l'impact.

### 5.3 — Objets de réparation (Consommables)
- Apparaissent dans la **Salle de Stockage** à intervalles réguliers.
- Il n'y a **jamais assez d'objets pour toutes les pannes actives** — la pénurie est voulue.
- Disparaissent après une réparation réussie.

### 5.4 — Outils Spéciaux (Persistants)
- Apparaissent **rarement** dans la Salle de Stockage (1 à 2 fois par manche max).
- **Ne se consomment pas** — le joueur les garde tant qu'il ne les pose/perd pas.
- Occupent le slot unique → Dilemme permanent : garder l'outil OU transporter un objet de réparation.

| Outil Spécial      | Effet                                          |
| :------------------ | :--------------------------------------------- |
| **Clé Dorée**       | Répare 2x plus vite (barre en 1.5s au lieu de 3s) |
| **Bottes Magnétiques** | Immunité à la bousculade simple (pas au coup chargé) |
| **Scanner**         | Révèle la prochaine panne 5s avant qu'elle apparaisse |

> **Note :** La Clé Dorée ne remplace pas le besoin d'avoir le bon objet de réparation. Elle accélère juste le temps de la barre. Le joueur doit poser la clé, prendre l'objet, réparer vite, puis récupérer la clé (s'il ne se l'est pas fait voler entre-temps).

> ⚠️ **Correction importante :** La Clé Dorée accélère la barre, mais le joueur doit quand même avoir l'objet de réparation en main au moment de réparer. L'outil doit donc être posé pour ramasser l'objet → conflit de slot garanti.

---

## 6. Jauge de Stabilité

### 6.1 — Fonctionnement
- **Valeur max :** 100 points (début de manche).
- **Drain par panne active :**
  - Fuite de Gaz : -2 pts/seconde
  - Court-Circuit : -3 pts/seconde
  - Surchauffe : -5 pts/seconde (en plus de son propre compte à rebours)
- **Gain par réparation :** +10 points (immédiat à la fin de la barre).
- **Si elle atteint 0 :** Game Over — la station est détruite, tout le monde perd.

### 6.2 — Affichage
Barre horizontale en haut de l'écran, toujours visible. Change de couleur :
- 🟢 Vert : 70-100%
- 🟡 Jaune : 30-69%
- 🔴 Rouge : 0-29% (alarme sonore)

---

## 7. Score & Classement

### 7.1 — Crédits de Maintenance (score individuel)

| Action                        | Crédits |
| :---------------------------- | :------ |
| Réparation mineure (Gaz, Court-Circuit) | 20 pts  |
| Réparation critique (Surchauffe)        | 100 pts |
| Coup Chargé réussi sur adversaire       | 5 pts   |
| Aide coopérative (être dans la salle quand un allié répare) | 10 pts |

### 7.2 — Écran de fin : Victoire (station sauvée)

| Titre               | Critère                                    | Visuel           |
| :------------------- | :----------------------------------------- | :--------------- |
| 🏆 **Employé du Mois** | Plus de Crédits de Maintenance            | Gros trophée     |
| 🔧 **Héros Silencieux** | Plus de réparations critiques (Surchauffe) | Médaille         |
| 👊 **Le Saboteur**    | Plus d'interruptions infligées (bousculades + coups) | Gant de boxe |
| 📋 **Le Stagiaire**   | Moins de Crédits de Maintenance            | Badge honte      |

### 7.3 — Écran de fin : Défaite (station détruite)
- Temps de survie affiché.
- Nombre total de pannes réparées (collectif).
- Titre collectif : **"Licenciés pour Faute Grave"**.
- Les stats individuelles sont quand même affichées (pour le débriefing / le sel).

---

## 8. Récapitulatif du Flow d'une Manche

```
DÉBUT DE MANCHE
  │
  ├─ Tous les joueurs spawn au Stockage
  ├─ Chrono démarre (7-8m30 selon joueurs)
  ├─ Jauge Stabilité = 100
  │
  ▼
PHASE 1 — "Calme avant la tempête" (0:00 → 3:00)
  │  · 1 panne à la fois, rythme lent
  │  · Les joueurs apprennent la map
  │  · Premières bousculades pour les objets
  │
  ▼
PHASE 2 — "Ça chauffe" (3:00 → 6:00)
  │  · 2 pannes simultanées
  │  · Objets insuffisants → conflits sérieux
  │  · Les scores commencent à se creuser
  │
  ▼
PHASE 3 — "Alerte Rouge" (6:00 → Fin)
  │  · 3 pannes simultanées
  │  · SURCHAUFFE possible (30s → Game Over)
  │  · Chaos total, alliances temporaires
  │
  ▼
FIN DE MANCHE
  │
  ├─ Si Jauge > 0 au chrono final → VICTOIRE
  │     └─ Classement : Employé du Mois, Héros, Saboteur, Stagiaire
  │
  └─ Si Jauge = 0 avant le chrono → DÉFAITE
        └─ "Licenciés pour Faute Grave" + stats
```

---

## 9. Valeurs à Équilibrer en Playtest

| Variable                    | Valeur initiale | Notes                              |
| :-------------------------- | :-------------- | :--------------------------------- |
| Durée bousculade cooldown   | 1s              | Trop bas = spam insupportable      |
| Durée charge coup           | 1s              | Trop haut = jamais utilisé         |
| Durée stun coup chargé      | 2s              | Trop haut = trop punitif           |
| Durée réparation standard   | 3s              | Cœur du gameplay, toucher avec soin|
| Durée réparation surchauffe | 4s              | Doit être stressant mais faisable  |
| Fréquence pannes Phase 1    | ~20s            | Doit laisser le temps de respirer  |
| Fréquence pannes Phase 3    | ~8s             | Doit être étouffant                |
| Drain stabilité / panne     | 2-5 pts/s       | À scaler selon nb joueurs          |
| Fréquence spawn objets      | À définir       | Doit créer la pénurie sans frustrer|
| Fréquence outils spéciaux   | 1-2 / manche    | Doit rester un événement rare      |
