# 💻 Spécifications Techniques

## Architecture (Recommandée)
* **Affichage :** Rendu 2D Isometric (Tuiles de 64x32).
* **Réseau :** État du monde géré par le serveur (Server-authoritative) pour éviter que les joueurs trichent sur le combat.
* **Localisation des fichiers :** Puisque tu travailles sous WSL, assure-toi que tes assets sont bien accessibles via le chemin : `\\wsl.localhost\Ubuntu\home\synnheal\.openclaw` pour tes tests de déploiement.

## Prochaines étapes de Dev
1.  Coder le déplacement isométrique fluide.
2.  Implémenter la collision entre joueurs (Bousculade).
3.  Créer le système de ramassage/dépose d'objet.