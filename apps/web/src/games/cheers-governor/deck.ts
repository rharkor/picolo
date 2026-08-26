import type { DeckCard } from '@/games/types';

/**
 * Suggestions for the rule you have to invent when you hit 21. Nobody is
 * creative at that point in the evening, which is exactly the problem this deck
 * solves.
 */
export const GOVERNOR_RULES: DeckCard[] = [
  { id: 'g1', adult: false, intensity: 'chill', text: { en: 'say "moose" instead', fr: 'dire « élan » à la place' } },
  { id: 'g2', adult: false, intensity: 'chill', text: { en: 'clap instead of saying it', fr: 'taper dans ses mains au lieu de le dire' } },
  { id: 'g3', adult: false, intensity: 'chill', text: { en: 'stand up and sit back down', fr: 'se lever puis se rasseoir' } },
  { id: 'g4', adult: false, intensity: 'chill', text: { en: 'say it in another language', fr: 'le dire dans une autre langue' } },
  { id: 'g5', adult: false, intensity: 'chill', text: { en: 'say the number backwards', fr: 'dire le nombre à l’envers' } },
  { id: 'g6', adult: false, intensity: 'chill', text: { en: 'point at the person to your right', fr: 'pointer la personne à ta droite' } },
  { id: 'g7', adult: false, intensity: 'chill', text: { en: 'whistle instead', fr: 'siffler à la place' } },
  { id: 'g8', adult: false, intensity: 'chill', text: { en: 'say the name of a fruit', fr: 'dire le nom d’un fruit' } },
  { id: 'g9', adult: false, intensity: 'party', text: { en: 'reverse the direction of play', fr: 'inverser le sens du jeu' } },
  { id: 'g10', adult: false, intensity: 'party', text: { en: 'skip the next person', fr: 'sauter la personne suivante' } },
  { id: 'g11', adult: false, intensity: 'party', text: { en: 'shout it as loud as you can', fr: 'le crier le plus fort possible' } },
  { id: 'g12', adult: false, intensity: 'party', text: { en: 'whisper it', fr: 'le chuchoter' } },
  { id: 'g13', adult: false, intensity: 'party', text: { en: 'say it in a French accent', fr: 'le dire avec un accent anglais' } },
  { id: 'g14', adult: false, intensity: 'party', text: { en: 'take a sip before saying it', fr: 'boire une gorgée avant de le dire' } },
  { id: 'g15', adult: false, intensity: 'party', text: { en: 'do a dance move', fr: 'faire un pas de danse' } },
  { id: 'g16', adult: false, intensity: 'party', text: { en: 'say the name of someone at the table', fr: 'dire le prénom de quelqu’un à table' } },
  { id: 'g17', adult: false, intensity: 'party', text: { en: 'make an animal noise', fr: 'faire un bruit d’animal' } },
  { id: 'g18', adult: false, intensity: 'party', text: { en: 'high-five your neighbour', fr: 'taper la main de ton voisin' } },
  { id: 'g19', adult: false, intensity: 'party', text: { en: 'say it while holding your nose', fr: 'le dire en te pinçant le nez' } },
  { id: 'g20', adult: false, intensity: 'party', text: { en: 'stand on one leg', fr: 'te tenir sur une jambe' } },
  { id: 'g21', adult: false, intensity: 'wild', text: { en: 'give a sip to anyone', fr: 'donner une gorgée à qui tu veux' } },
  { id: 'g22', adult: false, intensity: 'wild', text: { en: 'everybody drinks', fr: 'tout le monde boit' } },
  { id: 'g23', adult: false, intensity: 'wild', text: { en: 'confess something true', fr: 'avouer une chose vraie' } },
  { id: 'g24', adult: false, intensity: 'wild', text: { en: 'swap seats with someone', fr: 'échanger de place avec quelqu’un' } },
  { id: 'g25', adult: false, intensity: 'wild', text: { en: 'compliment the person opposite you', fr: 'complimenter la personne en face' } },
  { id: 'g26', adult: false, intensity: 'wild', text: { en: 'answer one question honestly', fr: 'répondre honnêtement à une question' } },
];
