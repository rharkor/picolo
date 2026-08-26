import type { LocalizedText } from '@piccolo/shared';
import type { RoomCard } from '../kit.js';

export interface TriviaFactCard extends RoomCard {
  question: LocalizedText;
  /** The real answer. Short — it sits in a list next to invented ones. */
  answer: LocalizedText;
}

/**
 * Obscure enough that nobody knows, concrete enough that a made-up answer can
 * pass for real. That balance is the whole game: anything guessable is a bad
 * card here.
 */
export const LIAR_FACTS: TriviaFactCard[] = [
  { id: 'l1', adult: false, intensity: 'chill', question: { en: 'What is a group of flamingos called?', fr: 'Comment appelle-t-on un groupe de flamants roses ?' }, answer: { en: 'A flamboyance', fr: 'Une flamboyance' } },
  { id: 'l2', adult: false, intensity: 'chill', question: { en: 'What is the fear of long words called?', fr: 'Comment s’appelle la peur des mots longs ?' }, answer: { en: 'Hippopotomonstrosesquipedaliophobia', fr: 'Hippopotomonstrosesquipédaliophobie' } },
  { id: 'l3', adult: false, intensity: 'chill', question: { en: 'What is the dot over a lowercase i called?', fr: 'Comment s’appelle le point sur un « i » minuscule ?' }, answer: { en: 'A tittle', fr: 'Un point souscrit… non : un « tittle »' } },
  { id: 'l4', adult: false, intensity: 'chill', question: { en: 'What was the first item ever sold on eBay?', fr: 'Quel a été le premier objet vendu sur eBay ?' }, answer: { en: 'A broken laser pointer', fr: 'Un pointeur laser cassé' } },
  { id: 'l5', adult: false, intensity: 'chill', question: { en: 'What colour is a polar bear’s skin?', fr: 'De quelle couleur est la peau d’un ours polaire ?' }, answer: { en: 'Black', fr: 'Noire' } },
  { id: 'l6', adult: false, intensity: 'chill', question: { en: 'Which country invented the modern paperclip patent?', fr: 'Quel pays a déposé le brevet du trombone moderne ?' }, answer: { en: 'The United States', fr: 'Les États-Unis' } },
  { id: 'l7', adult: false, intensity: 'chill', question: { en: 'What is the only letter not in any US state name?', fr: 'Quelle est la seule lettre absente du nom de tous les États américains ?' }, answer: { en: 'Q', fr: 'Q' } },
  { id: 'l8', adult: false, intensity: 'chill', question: { en: 'How many hearts does an octopus have?', fr: 'Combien de cœurs a une pieuvre ?' }, answer: { en: 'Three', fr: 'Trois' } },
  { id: 'l9', adult: false, intensity: 'chill', question: { en: 'What is a baby puffin called?', fr: 'Comment appelle-t-on un bébé macareux ?' }, answer: { en: 'A puffling', fr: 'Un pufflin' } },
  { id: 'l10', adult: false, intensity: 'chill', question: { en: 'What does the "e" in email originally stand for?', fr: 'Que signifie à l’origine le « e » de e-mail ?' }, answer: { en: 'Electronic', fr: 'Electronic' } },
  { id: 'l11', adult: false, intensity: 'chill', question: { en: 'Which fruit was once called a "love apple"?', fr: 'Quel fruit était appelé « pomme d’amour » ?' }, answer: { en: 'The tomato', fr: 'La tomate' } },
  { id: 'l12', adult: false, intensity: 'chill', question: { en: 'What is the collective noun for crows?', fr: 'Comment appelle-t-on un groupe de corbeaux ?' }, answer: { en: 'A murder', fr: 'Une assemblée' } },
  { id: 'l13', adult: false, intensity: 'chill', question: { en: 'How long is a "jiffy" in physics?', fr: 'Combien de temps dure un « jiffy » en physique ?' }, answer: { en: 'The time light takes to travel one centimetre', fr: 'Le temps que met la lumière pour parcourir un centimètre' } },
  { id: 'l14', adult: false, intensity: 'chill', question: { en: 'What was Coca-Cola’s original colour?', fr: 'Quelle était la couleur d’origine du Coca-Cola ?' }, answer: { en: 'Green', fr: 'Verte' } },
  { id: 'l15', adult: false, intensity: 'chill', question: { en: 'What is the smallest country in the world by area?', fr: 'Quel est le plus petit pays du monde en superficie ?' }, answer: { en: 'Vatican City', fr: 'Le Vatican' } },
  { id: 'l16', adult: false, intensity: 'chill', question: { en: 'Which animal cannot stick out its tongue?', fr: 'Quel animal ne peut pas sortir la langue ?' }, answer: { en: 'The crocodile', fr: 'Le crocodile' } },
  { id: 'l17', adult: false, intensity: 'chill', question: { en: 'What is the name for the plastic tip of a shoelace?', fr: 'Comment s’appelle l’embout plastique d’un lacet ?' }, answer: { en: 'An aglet', fr: 'Un aiguillette' } },
  { id: 'l18', adult: false, intensity: 'chill', question: { en: 'How many bones does a shark have?', fr: 'Combien d’os a un requin ?' }, answer: { en: 'None', fr: 'Aucun' } },
  { id: 'l19', adult: false, intensity: 'chill', question: { en: 'What was the first video ever uploaded to YouTube?', fr: 'Quelle a été la première vidéo publiée sur YouTube ?' }, answer: { en: '"Me at the zoo"', fr: '« Me at the zoo »' } },
  { id: 'l20', adult: false, intensity: 'chill', question: { en: 'Which planet rotates on its side?', fr: 'Quelle planète tourne sur le côté ?' }, answer: { en: 'Uranus', fr: 'Uranus' } },
  { id: 'l21', adult: false, intensity: 'chill', question: { en: 'What do you call the study of flags?', fr: 'Comment appelle-t-on l’étude des drapeaux ?' }, answer: { en: 'Vexillology', fr: 'La vexillologie' } },
  { id: 'l22', adult: false, intensity: 'chill', question: { en: 'How many noses does a slug have?', fr: 'Combien de nez a une limace ?' }, answer: { en: 'Four', fr: 'Quatre' } },
  { id: 'l23', adult: false, intensity: 'chill', question: { en: 'What is the loudest animal on earth?', fr: 'Quel est l’animal le plus bruyant sur Terre ?' }, answer: { en: 'The sperm whale', fr: 'Le cachalot' } },
  { id: 'l24', adult: false, intensity: 'chill', question: { en: 'Which country has no rivers?', fr: 'Quel pays n’a aucune rivière ?' }, answer: { en: 'Saudi Arabia', fr: 'L’Arabie saoudite' } },
  { id: 'l25', adult: false, intensity: 'chill', question: { en: 'What is a "murmuration"?', fr: 'Qu’est-ce qu’une « murmuration » ?' }, answer: { en: 'A flock of starlings in flight', fr: 'Un vol groupé d’étourneaux' } },
  { id: 'l26', adult: false, intensity: 'chill', question: { en: 'What was bubble wrap originally invented as?', fr: 'À quoi devait servir le papier bulle à l’origine ?' }, answer: { en: 'Textured wallpaper', fr: 'Du papier peint texturé' } },
  { id: 'l27', adult: false, intensity: 'chill', question: { en: 'How many times can a piece of paper be folded in half, in practice?', fr: 'Combien de fois peut-on plier une feuille en deux, en pratique ?' }, answer: { en: 'About seven', fr: 'Environ sept' } },
  { id: 'l28', adult: false, intensity: 'chill', question: { en: 'What is the hardest natural substance after diamond?', fr: 'Quelle est la substance naturelle la plus dure après le diamant ?' }, answer: { en: 'Corundum', fr: 'Le corindon' } },
  { id: 'l29', adult: false, intensity: 'chill', question: { en: 'Which bird can fly backwards?', fr: 'Quel oiseau peut voler en marche arrière ?' }, answer: { en: 'The hummingbird', fr: 'Le colibri' } },
  { id: 'l30', adult: false, intensity: 'chill', question: { en: 'What does a "cordwainer" make?', fr: 'Que fabrique un « bottier » ?' }, answer: { en: 'Shoes', fr: 'Des chaussures' } },
  { id: 'l31', adult: false, intensity: 'chill', question: { en: 'What is the world’s most stolen food?', fr: 'Quel est l’aliment le plus volé au monde ?' }, answer: { en: 'Cheese', fr: 'Le fromage' } },
  { id: 'l32', adult: false, intensity: 'chill', question: { en: 'How many muscles are in an elephant’s trunk?', fr: 'Combien de muscles compte la trompe d’un éléphant ?' }, answer: { en: 'Around forty thousand', fr: 'Environ quarante mille' } },
  { id: 'l33', adult: false, intensity: 'chill', question: { en: 'What is the official animal of Scotland?', fr: 'Quel est l’animal officiel de l’Écosse ?' }, answer: { en: 'The unicorn', fr: 'La licorne' } },
  { id: 'l34', adult: false, intensity: 'chill', question: { en: 'Which vegetable is 96% water?', fr: 'Quel légume est composé de 96 % d’eau ?' }, answer: { en: 'The cucumber', fr: 'Le concombre' } },
  { id: 'l35', adult: false, intensity: 'chill', question: { en: 'What is the term for a word that reads the same backwards?', fr: 'Comment appelle-t-on un mot qui se lit dans les deux sens ?' }, answer: { en: 'A palindrome', fr: 'Un palindrome' } },
  { id: 'l36', adult: false, intensity: 'chill', question: { en: 'How many strings does a standard harp have?', fr: 'Combien de cordes a une harpe standard ?' }, answer: { en: 'Forty-seven', fr: 'Quarante-sept' } },
  { id: 'l37', adult: false, intensity: 'chill', question: { en: 'What was the first alarm clock able to ring at?', fr: 'À quelle heure seulement sonnait le premier réveil ?' }, answer: { en: 'Four in the morning', fr: 'Quatre heures du matin' } },
  { id: 'l38', adult: false, intensity: 'chill', question: { en: 'Which country consumes the most chocolate per person?', fr: 'Quel pays consomme le plus de chocolat par habitant ?' }, answer: { en: 'Switzerland', fr: 'La Suisse' } },
  { id: 'l39', adult: false, intensity: 'chill', question: { en: 'What is a group of jellyfish called?', fr: 'Comment appelle-t-on un groupe de méduses ?' }, answer: { en: 'A smack', fr: 'Un essaim' } },
  { id: 'l40', adult: false, intensity: 'chill', question: { en: 'How long did the shortest war in history last?', fr: 'Combien de temps a duré la guerre la plus courte de l’histoire ?' }, answer: { en: 'Thirty-eight minutes', fr: 'Trente-huit minutes' } },
];
