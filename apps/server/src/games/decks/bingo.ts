import type { LocalizedText } from '@piccolo/shared';
import type { RoomCard } from '../kit.js';

export interface BingoCard extends RoomCard {
  text: LocalizedText;
}

/**
 * Room edition of the bingo grid. Every phone gets its own sixteen, drawn from
 * here, so two people can be one square away from bingo on completely different
 * things.
 */
export const BINGO_SQUARES: BingoCard[] = [
  { id: 'g1', adult: false, intensity: 'chill', text: { en: 'Someone spills a drink', fr: 'Quelqu’un renverse son verre' } },
  { id: 'g2', adult: false, intensity: 'chill', text: { en: 'The music gets changed mid-song', fr: 'On change la musique en plein morceau' } },
  { id: 'g3', adult: false, intensity: 'chill', text: { en: 'A phone dies', fr: 'Un téléphone tombe en panne de batterie' } },
  { id: 'g4', adult: false, intensity: 'chill', text: { en: 'Someone mentions their star sign', fr: 'Quelqu’un parle de son signe astro' } },
  { id: 'g5', adult: false, intensity: 'chill', text: { en: 'A group photo is attempted', fr: 'On tente une photo de groupe' } },
  { id: 'g6', adult: false, intensity: 'chill', text: { en: 'The snacks run out', fr: 'Les snacks sont finis' } },
  { id: 'g7', adult: false, intensity: 'chill', text: { en: 'Somebody talks about work', fr: 'Quelqu’un parle du boulot' } },
  { id: 'g8', adult: false, intensity: 'chill', text: { en: 'A video gets shown to the room', fr: 'Une vidéo est montrée à toute la pièce' } },
  { id: 'g9', adult: false, intensity: 'chill', text: { en: 'Someone asks for the wifi', fr: 'Quelqu’un demande le wifi' } },
  { id: 'g10', adult: false, intensity: 'chill', text: { en: 'A charger goes missing', fr: 'Un chargeur disparaît' } },
  { id: 'g11', adult: false, intensity: 'party', text: { en: 'A shot is proposed', fr: 'Quelqu’un propose un shot' } },
  { id: 'g12', adult: false, intensity: 'party', text: { en: 'Somebody tells the same story twice', fr: 'Quelqu’un raconte deux fois la même histoire' } },
  { id: 'g13', adult: false, intensity: 'party', text: { en: 'A serious debate about nothing', fr: 'Un débat très sérieux sur rien' } },
  { id: 'g14', adult: false, intensity: 'party', text: { en: 'Someone texts their ex', fr: 'Quelqu’un écrit à son ex' } },
  { id: 'g15', adult: false, intensity: 'party', text: { en: 'A drink is abandoned and lost', fr: 'Un verre est abandonné puis perdu' } },
  { id: 'g16', adult: false, intensity: 'party', text: { en: 'The neighbours get mentioned', fr: 'On parle des voisins' } },
  { id: 'g17', adult: false, intensity: 'party', text: { en: 'Someone sings badly and loudly', fr: 'Quelqu’un chante mal et fort' } },
  { id: 'g18', adult: false, intensity: 'party', text: { en: 'Food is ordered for the table', fr: 'On commande à manger pour la table' } },
  { id: 'g19', adult: false, intensity: 'party', text: { en: 'Someone goes missing for 20 minutes', fr: 'Quelqu’un disparaît 20 minutes' } },
  { id: 'g20', adult: false, intensity: 'party', text: { en: 'The playlist gets hijacked', fr: 'La playlist est détournée' } },
  { id: 'g21', adult: false, intensity: 'party', text: { en: 'Somebody says they never get drunk', fr: 'Quelqu’un dit qu’il n’est jamais bourré' } },
  { id: 'g22', adult: false, intensity: 'party', text: { en: 'A camera roll gets passed around', fr: 'Une galerie photo circule' } },
  { id: 'g23', adult: false, intensity: 'party', text: { en: 'Unsolicited life advice', fr: 'Des conseils de vie non demandés' } },
  { id: 'g24', adult: false, intensity: 'party', text: { en: 'A window is opened because "it is hot"', fr: 'On ouvre une fenêtre parce qu’« il fait chaud »' } },
  { id: 'g25', adult: false, intensity: 'party', text: { en: 'Somebody films for their story', fr: 'Quelqu’un filme pour sa story' } },
  { id: 'g26', adult: false, intensity: 'party', text: { en: 'A toast is made', fr: 'On porte un toast' } },
  { id: 'g27', adult: false, intensity: 'party', text: { en: 'Two people find a mutual friend', fr: 'Deux personnes se trouvent un ami commun' } },
  { id: 'g28', adult: false, intensity: 'party', text: { en: 'A taxi is ordered then cancelled', fr: 'Un taxi est commandé puis annulé' } },
  { id: 'g29', adult: false, intensity: 'party', text: { en: 'Someone changes seats to sit next to someone', fr: 'Quelqu’un change de place pour se rapprocher' } },
  { id: 'g30', adult: false, intensity: 'party', text: { en: 'An old photo resurfaces', fr: 'Une vieille photo ressort' } },
  { id: 'g31', adult: false, intensity: 'wild', text: { en: 'Someone cries', fr: 'Quelqu’un pleure' } },
  { id: 'g32', adult: false, intensity: 'wild', text: { en: 'A secret comes out', fr: 'Un secret sort' } },
  { id: 'g33', adult: false, intensity: 'wild', text: { en: 'Two people disappear together', fr: 'Deux personnes disparaissent ensemble' } },
  { id: 'g34', adult: false, intensity: 'wild', text: { en: 'An argument almost starts', fr: 'Une dispute commence presque' } },
  { id: 'g35', adult: false, intensity: 'wild', text: { en: 'Undying friendship is declared', fr: 'Une amitié éternelle est déclarée' } },
  { id: 'g36', adult: false, intensity: 'wild', text: { en: 'Something gets broken', fr: 'Quelque chose se casse' } },
  { id: 'g37', adult: false, intensity: 'wild', text: { en: 'Someone tries to cook at 3am', fr: 'Quelqu’un essaie de cuisiner à 3 h' } },
  { id: 'g38', adult: false, intensity: 'wild', text: { en: 'A confession nobody asked for', fr: 'Une confession que personne n’a demandée' } },
  { id: 'g39', adult: false, intensity: 'wild', text: { en: 'Somebody falls over', fr: 'Quelqu’un tombe' } },
  { id: 'g40', adult: false, intensity: 'wild', text: { en: 'The host regrets everything', fr: 'L’hôte regrette tout' } },
  { id: 'g41', adult: false, intensity: 'chill', text: { en: 'The temperature becomes a topic', fr: 'La température devient un sujet' } },
  { id: 'g42', adult: false, intensity: 'chill', text: { en: 'Someone leaves and comes back', fr: 'Quelqu’un part puis revient' } },
  { id: 'g43', adult: false, intensity: 'party', text: { en: 'A game is suggested and ignored', fr: 'On propose un jeu et personne ne suit' } },
  { id: 'g44', adult: false, intensity: 'party', text: { en: 'Somebody loses and blames the rules', fr: 'Quelqu’un perd et accuse les règles' } },
  { id: 'g45', adult: false, intensity: 'party', text: { en: 'A bottle is opened badly', fr: 'Une bouteille est ouverte n’importe comment' } },

  { id: 'gs1', adult: true, intensity: 'wild', text: { en: 'Someone flirts badly', fr: 'Quelqu’un drague très mal' } },
  { id: 'gs2', adult: true, intensity: 'wild', text: { en: 'Two people kiss', fr: 'Deux personnes s’embrassent' } },
  { id: 'gs3', adult: true, intensity: 'wild', text: { en: 'A dating app is opened at the table', fr: 'Une appli de rencontre est ouverte à table' } },
  { id: 'gs4', adult: true, intensity: 'wild', text: { en: 'Far too much detail is shared', fr: 'Beaucoup trop de détails sont partagés' } },
];
