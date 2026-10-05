# Product: La Loge Corse

**Last updated:** 2026-10-05
**Method:** codebase scan (dépôt `nouarideba-bit/lalogecorse`, version 2 du 3 octobre 2026) + conversation

## Product Identity
- **One-liner:** Les entreprises partenaires choisissent un match du Paris FC ou du Stade Français au Stade Jean-Bouin, inscrivent leurs invités dans la loge, et chaque invité reçoit par e-mail une invitation nominative (avec QR code) à présenter à l'entrée.
- **Category:** plateforme d'hospitalité B2B (club d'entreprises autour d'une loge de stade)
- **Product type:** B2B : chaque action se fait au nom d'une entreprise partenaire, donc le suivi par compte (entreprise) s'applique.
- **Collaboration:** hybride : chaque partenaire gère seul ses demandes, mais chaque demande passe par une validation de l'administrateur avant l'envoi des invitations.

## Business Model
- **Monetization:** partenariat payant par formule, vendu hors ligne (bouton « Nous contacter », pas de paiement sur le site).
- **Pricing tiers:** Formule 2 invités par match ; Formule 4 invités par match (avec fiche partenaire et événements du réseau) ; Formule 6 invités par match (mêmes avantages). Les prix n'apparaissent pas dans le code ; il faut que vous les fournissiez.
- **Billing integration:** aucune détectée.

## Tech Stack
- **Primary language:** PHP 8.1+ (côté serveur), HTML/CSS/JavaScript sans framework (côté navigateur)
- **Framework:** aucun : pages statiques et scripts PHP autonomes
- **Database:** aucune : fichiers JSON dans un dossier protégé (`donnees-loge/` : partenaires, demandes, tentatives de connexion)
- **Background jobs:** aucun : tout se fait au moment de la requête, y compris l'envoi des e-mails
- **HTTP client patterns:** aucun côté serveur ; e-mails envoyés avec la fonction `mail()` de PHP ; les anciens scripts v1 (non chargés) appelaient l'API TheSportsDB avec `fetch`
- **Module organization:** un fichier par parcours (`index.html`, `invitation.php`, `espace.php`, `mentions-legales.html`) + `assets/js/main.js` ; hébergement Apache (`.htaccess`)

## Value Mapping

### Primary Value Action
**Invitations validées et envoyées aux invités** : un partenaire a inscrit des invités pour un match, l'administrateur a validé, et les invitations nominatives sont parties. Si ce chiffre tombe à zéro, la loge est vide et le projet est en échec.
Retenu par défaut, en attente de votre confirmation. La présence réelle au stade n'est pas mesurable aujourd'hui : le code génère un QR code et un code d'accès, mais rien n'enregistre leur scan à l'entrée.

### Core Features (directly deliver value)
1. **Inscription des invités pour un match** : cœur du produit. Elle passe par deux parcours conservés tous les deux :
   - le formulaire public de la page d'accueil, sans compte, jusqu'à 6 invités, demande transmise par e-mail ;
   - l'espace partenaire, avec compte, jusqu'à 4 invités, demande enregistrée.
2. **Validation par l'administrateur et envoi des invitations nominatives** : transforme une demande en places réelles (lien de validation par e-mail, invitation avec QR code et code d'accès, copie au partenaire).
3. **Calendrier des affiches** : le partenaire choisit son match (17 matchs du Paris FC, 13 du Stade Français annoncés sur le site).

### Supporting Features (enable core actions)
1. **Compte partenaire** (inscription, validation du compte par l'administrateur, connexion, suivi de ses demandes) : rend possible le parcours avec compte et l'envoi automatique des invitations.
2. **« Nous rejoindre » et formules** : fait venir de nouvelles entreprises partenaires (contact par e-mail).
3. **Vitrine** (histoire, partenaires et logos, infos pratiques, fiches des effectifs, vidéo) : donne envie et rassure avant la réservation.
4. **Accusés de réception et protections anti-abus** (limite de demandes, délai minimal de saisie, limite de tentatives de connexion) : fiabilisent les demandes.

## Entity Model

### Users
- **ID format:**
  - espace partenaire : identifiant aléatoire hexadécimal de 16 caractères, plus un identifiant de connexion choisi par le partenaire ;
  - formulaire public : aucun identifiant, seulement l'e-mail du référent.
- **Roles:**
  - **référent partenaire** : la personne qui inscrit les invités pour son entreprise ;
  - **administrateur** : Jérôme Brigato, sans compte, il agit par liens sécurisés reçus par e-mail ;
  - **invité** : sans compte, il reçoit une invitation nominative avec un code d'accès de 8 caractères ;
  - **visiteur anonyme** du site.
- **Multi-account:** non. Un compte = une entreprise = un référent.

### Accounts
- **ID format:** pas d'identifiant propre. L'entreprise est un nom de société en texte : liste fixe de 15 sociétés dans l'espace partenaire, saisie libre dans le formulaire public.
- **Hierarchy:** flat

## Group Hierarchy

```
La Loge Corse (instance unique)
└── Entreprise partenaire
```

| Group Type | Parent | Where Actions Happen |
|------------|--------|---------------------|
| La Loge Corse | — | décisions de l'administrateur (validation des comptes et des demandes) |
| Entreprise partenaire | La Loge Corse | demandes d'invitations, connexion, consultation des demandes |

**Default event level:** entreprise partenaire
**Admin actions at:** La Loge Corse (instance unique)
Le match (affiche) n'est pas un groupe : c'est le contexte de chaque demande.

## Current State
- **Existing tracking:** aucun outil de mesure d'audience détecté dans le code.
- **Documentation:** non (le README ne contient qu'un chemin de fichier local).
- **Known issues:**
  - les deux parcours n'ont pas la même limite d'invités (6 contre 4) ;
  - l'espace partenaire n'est lié nulle part sur la page d'accueil ;
  - l'espace partenaire ne propose que les matchs du Paris FC, pas ceux du Stade Français ;
  - il compte 15 sociétés, alors que le site en annonce 13 ;
  - les demandes du formulaire public ne sont pas enregistrées, elles n'existent que dans la boîte mail de l'administrateur ;
  - les coordonnées des invités (nom, e-mail, téléphone) circulent par e-mail et ne devront jamais figurer dans les données de suivi.

## Integration Targets
| Destination | Purpose | Priority |
|-------------|---------|----------|
| Aucune choisie à ce jour | à décider à l'étape de conception du plan | — |
| Candidat : PostHog (hébergement UE) | suivi des parcours et des demandes par entreprise | à évaluer |
| Candidat : Google Analytics 4 | fréquentation de la vitrine ; demande un bandeau de consentement cookies (RGPD) | à évaluer |
| Candidat : Accoil | engagement par entreprise partenaire ; ne garde que les noms d'événements, sans propriétés, ce qui influencera le nommage | à évaluer |

## Codebase Observations
- **Feature areas inferred:**
  - vitrine en une page : accueil, histoire, calendrier, réserver, partenaires, nous rejoindre, infos pratiques ;
  - formulaire d'inscription des invités ;
  - espace partenaire : inscription, connexion, nouvelle demande, mes demandes ;
  - validation administrateur par lien ;
  - page d'invitation nominative avec QR code ;
  - mentions légales.
- **Entity model inferred:**
  - partenaire : société, référent, e-mail, téléphone, identifiant de connexion, statut en attente / actif / refusé ;
  - demande : partenaire, affiche, invités, message, statut en attente / validée / refusée ;
  - invité : nom, prénom, e-mail, téléphone, code d'accès, lien d'invitation ;
  - les anciens scripts v1 (`app.js`, `ui.js`, `plus.js`) restent dans le dépôt mais ne sont plus chargés.
