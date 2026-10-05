# Delta : état actuel → plan cible

**Produit :** La Loge Corse · **Plan :** version 1 · **Date :** 2026-10-05

**État actuel :** aucun suivi. La lecture du code (modélisation produit) n'a trouvé aucun outil de mesure d'audience. Aucun audit formel (`current-state.yaml`) n'a été produit, et il n'y a rien à auditer.

**Bilan :** 8 événements à ajouter ; 0 à supprimer, renommer, garder ou modifier. Ajout (8) + renommage (0) + conservation (0) = 8 événements cibles.

## Préalables (changements du site nécessaires au suivi)

| # | Changement | Pourquoi | Priorité |
|---|-----------|----------|----------|
| A | Remplacer le champ libre « Société » du formulaire public par une liste déroulante (la même que l'espace partenaire) | Sans cela, impossible d'attribuer une demande à un partenaire stable (`partner_id`) | P1 |
| B | Donner un identifiant stable à chaque match (`pfc-2026-27-j07`…) et ajouter les matchs du Stade Français à l'espace partenaire | Même match = même identifiant dans les deux parcours ; aujourd'hui l'espace ne propose que le Paris FC | P1 |
| C | Enregistrer aussi les demandes du formulaire public dans `donnees-loge/` et les faire valider par le même lien que l'espace | Aujourd'hui elles ne vivent que dans la boîte mail : on ne peut suivre ni leur validation ni leur refus | P1 |
| D | Ajouter un fichier de configuration : formule de chaque partenaire, société interne, liste de tests | Alimente `formula`, `is_internal` et le filtre d'exclusion | P1 |
| E | Mémoriser la première ouverture de chaque invitation | Permet `invitation.opened` sans doublons | P2 |
| F | Créer le scan des QR codes à l'entrée (page ou appli pour l'accueil) | Seul moyen de mesurer la présence réelle | P3 |

## Ajouter (non suivi aujourd'hui)

| Priorité | Événement | Catégorie | Pourquoi |
|----------|-----------|-----------|----------|
| P1 | `invitation_request.submitted` | valeur | Demande de places, dans les deux parcours (`request_source`) |
| P1 | `invitation_request.approved` | valeur | **Action de valeur principale** : invitations nominatives envoyées |
| P1 | `invitation_request.rejected` | valeur | Le taux de refus révèle la saturation de la loge ou des demandes hors règles |
| P1 | `partner.signed_up` | cycle de vie | Adoption de l'espace partenaire |
| P1 | `partner.activated` | cycle de vie | Délai de validation des comptes |
| P2 | `invitation_request.failed` | erreur | Demandes perdues à cause d'un contrôle (téléphone, consentement, limite…) |
| P2 | `invitation.opened` | valeur | Les invitations arrivent-elles et sont-elles lues ? (en attendant la présence) |
| P3 | `invitation.checked_in` | valeur | Présence réelle au stade ; dépend du préalable F |

Fiche partenaire (traits de groupe) à envoyer : nom, formule, interne oui/non, compte espace oui/non, dates d'inscription et d'activation, dernière demande, compteurs de la saison (demandes, demandes validées, invités, puis présents).

## Supprimer · Renommer · Garder · Modifier

Rien : aucun suivi existant.

## Ordre de mise en œuvre conseillé

1. **Préalables A à D**, puis les 5 événements P1 et la fiche partenaire : on mesure tout de suite demandes, validations et invités par partenaire et par match.
2. **P2** : erreurs de dépôt et ouverture des invitations.
3. **P3** : scan des QR codes, puis `invitation.checked_in` et le compteur de présents.

## Risques et points de vigilance

- **Données personnelles :** les coordonnées des invités circulent par e-mail. Elles ne doivent jamais entrer dans PostHog : ni nom, ni e-mail, ni téléphone, ni message libre, ni code ou lien d'invitation.
- **Fiabilité :** l'envoi vers PostHog ne doit jamais bloquer une demande ni la validation des invitations.
- **Coût :** quelques centaines d'événements par saison, très loin du premier million gratuit. Le module « Group analytics » de PostHog est une option : le plan met aussi `partner_id` dans chaque événement pour s'en passer.
- **Limites incohérentes** (6 invités dans le formulaire public, 4 dans l'espace) : à harmoniser, idéalement selon la formule du partenaire.
