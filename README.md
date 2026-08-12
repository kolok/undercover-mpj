# Undercover Companion

Il s'agit de créer une application mobile pour le jeu undercover.

Cette application n’aura pas besoin d’être connectée à un autre système, elle pourra être utilisé en mode hors ligne.

On utilise 1 seul téléphone pour tous les joueurs.

# Règles du jeu

Undercover est un jeu de déduction sociale et de bluff, qui se joue de 3 a 10 joueurs.

## Mise en place

Chaque joueur reçoit secrètement un mot.

La majorité des joueurs (les civils) reçoit le même mot.

Un à 3 joueurs (les undercover) reçoivent un mot différent, mais proche du premier (ex : "citron" vs "orange").

De 0 à 2 joueurs (Mr White) ne reçoit aucun mot.

Les civil et undercover ne connaissent pas leur rôle 

## Déroulement

À tour de rôle, chaque joueur donne un indice (un mot ou une courte phrase) décrivant son mot, sans jamais le dire directement.

Le but : rester assez vague pour ne pas se trahir si on est undercover, mais assez précis pour prouver qu'on est civil.

Après le tour de table, tout le monde vote pour éliminer le joueur jugé le plus suspect.

Le rôle du joueur éliminé est révélé (civil ou undercover) mais pas son mot.

Cas particulier : Mr White

N'ayant pas de mot, il doit deviner ce que disent les autres et improviser des indices plausibles.

S'il est éliminé, il a une dernière chance : deviner le mot des civils. S'il trouve, il gagne quand même !

## Conditions de victoire

Les civils gagnent s'ils éliminent tous les undercover (et Mr White).

Les undercover (et Mr White) gagnent s'il ne reste qu'eux face à un seul civil, ou si Mr White devine le mot après élimination.

# Comportement de l’application

## Ecran d’accueil

Lécran d’accueil à un bouton “Démarrer la partie”

Quand on clic sur “Démarrer la partie”, ça ouvre un écran “Nombre de joueur”

## Ecran “Nombre de joueur”  Tu peux indiquer le nombre de joueur

Tu peux choisir le nombre de undercover et le nombre de Mr White, le nombre de civils est toujours plus que la moitié de joueurs, il y a toujours au minimum 1 undercover

Il y a un bouton “Jouer” qui valide le nombre de joueur et passe à l’écran “Jeu”

## Ecran “Jeu”

Des cartes sont affichées face cachée, 1 par joueur

Chaque joueur chacun son tour (le téléphone passe de main en main) :

- Choisir une carte (elle ne pourra plus être choisi par un autre joueur

- Ouvre une succession écran Joueur sur lesquels

    - Ecran joueur 1 : le joueur écrit son nom (un nom par défaut est proposé), le joueur valide

    - Ecran joueur 2 : le mot secret est affiché selon son rôle, si le joueur est Mr White, il est juste écrit que le joueur est Mr White, il n’a pas de mot secret, le joueur valide

    - On retourne sur l’écran “Jeu”, le joueur passe le téléphone au joueur suivant, il est affiché clairement les carte déjà dévoilée qui ne sont plus sélectionnable

Un fois que tous les joueurs ont sélectionné leur carte et connaissent leur mot, un bouton “Commencer le tour de table” est affiché. Quand on clique dessus l’écran “Tour de table” est affiché

 ## Ecran “Tour de table” est affiché

Les cartes des joueurs sont affichées avec un ordre de passage, On conserve le même ordre de passage que lors du la sélection des cartes, L’application choisit le premier joueur, ce ne doit pas être Mr White.

Les joueurs donnent leur indice à tour de rôle (dans la vrai vie, pas d’action spécifique sur l’application).

Un bouton “Finir le tour” est disponible sur l’écran “Tour de table”

Quand on clique sur “Finir le tour”, les joueurs passent au vote et désignent la personne à éliminer (dans la vrai vie)

Sur l’écran, les joueurs choisissent la carte du joueur éliminé.

Son rôle est révélé mais pas son mot 

Cas de Mr White :

  Si c’est mr white il doit essayer de deviner  le mot des civil, Un écran est affiché lui permettant d’écrire le mot qu’il pense être celui des civils

  s’il le trouve le mot est révélé et le mr white  a gagner, 

 s’il ne le trouve pas le mot n’est pas révélé le mr white est éliminé

La partie continue avec d’autre tour de table jusqu’à ce qu’il ne reste plus que des civil ou des undercover et mr white ou qu’un mr white trouve le mot des civil 

Quand la partie est terminée il y a un écran de succès qui marque qui a gagner et un bouton rejouer pour recommancer une partie avec de nouveaux mots

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://undercover-mpj.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b335c896-042a-40a0-a83d-e19fea94a7ad).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
