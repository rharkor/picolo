import type { Intensity, LocalizedText } from '@piccolo/shared';

/**
 * Both decks bid on a plain number, so every card supplies the thing being
 * bid on and its unit separately. That keeps the sentence grammatical in both
 * languages instead of gluing a number into a translated string.
 *
 * The difference is who settles the bet: a quiz card carries the true answer,
 * a challenge card leaves it to the table.
 */
export interface Question {
  id: string;
  /** Phrased so the only possible answer is a number. */
  prompt: LocalizedText;
  /** Plural unit that follows the number: "grams", "steps". */
  unit: LocalizedText;
  /** The truth. A bid at or below this one is honest — ties go to the bidder. */
  answer: number;
  /** Deliberately low anchor so the bidding has room to climb. */
  start: number;
  /** Increment used by the bump buttons. Sized to the answer. */
  step: number;
  adult: boolean;
  intensity: Intensity;
}

export interface Challenge {
  id: string;
  /** The feat, as an infinitive phrase: "do push-ups in a row". */
  feat: LocalizedText;
  /** Plural unit that follows the number: "push-ups", "seconds". */
  unit: LocalizedText;
  /** Sensible opening bid so nobody starts at 1. */
  start: number;
  /** Increment used by the big bump button. */
  step: number;
  adult: boolean;
  intensity: Intensity;
}

export const CHALLENGES: Challenge[] = [
  { id: 'c1', start: 5, step: 5, adult: false, intensity: 'party', feat: { en: 'Do push-ups in a row', fr: 'Faire des pompes d’affilée' }, unit: { en: 'push-ups', fr: 'pompes' } },
  { id: 'c2', start: 10, step: 5, adult: false, intensity: 'party', feat: { en: 'Do squats without stopping', fr: 'Faire des squats sans s’arrêter' }, unit: { en: 'squats', fr: 'squats' } },
  { id: 'c3', start: 20, step: 10, adult: false, intensity: 'chill', feat: { en: 'Hold your breath', fr: 'Retenir sa respiration' }, unit: { en: 'seconds', fr: 'secondes' } },
  { id: 'c4', start: 20, step: 10, adult: false, intensity: 'chill', feat: { en: 'Hold a plank', fr: 'Tenir la planche' }, unit: { en: 'seconds', fr: 'secondes' } },
  { id: 'c5', start: 15, step: 10, adult: false, intensity: 'chill', feat: { en: 'Balance on one foot with your eyes shut', fr: 'Tenir sur un pied les yeux fermés' }, unit: { en: 'seconds', fr: 'secondes' } },
  { id: 'c6', start: 5, step: 3, adult: false, intensity: 'chill', feat: { en: 'Name African countries in a row', fr: 'Citer des pays d’Afrique d’affilée' }, unit: { en: 'countries', fr: 'pays' } },
  { id: 'c7', start: 6, step: 3, adult: false, intensity: 'chill', feat: { en: 'Name European capitals in a row', fr: 'Citer des capitales européennes d’affilée' }, unit: { en: 'capitals', fr: 'capitales' } },
  { id: 'c8', start: 8, step: 4, adult: false, intensity: 'chill', feat: { en: 'Name car brands without repeating', fr: 'Citer des marques de voiture sans répéter' }, unit: { en: 'brands', fr: 'marques' } },
  { id: 'c9', start: 8, step: 4, adult: false, intensity: 'chill', feat: { en: 'Name Pokémon without repeating', fr: 'Citer des Pokémon sans répéter' }, unit: { en: 'Pokémon', fr: 'Pokémon' } },
  { id: 'c10', start: 6, step: 3, adult: false, intensity: 'chill', feat: { en: 'Recite decimals of pi', fr: 'Réciter des décimales de pi' }, unit: { en: 'decimals', fr: 'décimales' } },
  { id: 'c11', start: 6, step: 3, adult: false, intensity: 'party', feat: { en: 'Say the alphabet backwards, letter by letter', fr: 'Dire l’alphabet à l’envers, lettre par lettre' }, unit: { en: 'letters', fr: 'lettres' } },
  { id: 'c12', start: 5, step: 3, adult: false, intensity: 'party', feat: { en: 'Find words that rhyme with your own name', fr: 'Trouver des mots qui riment avec ton prénom' }, unit: { en: 'words', fr: 'mots' } },
  { id: 'c13', start: 5, step: 3, adult: false, intensity: 'party', feat: { en: 'Pull different faces in a row, no repeats', fr: 'Faire des grimaces différentes d’affilée, sans répéter' }, unit: { en: 'faces', fr: 'grimaces' } },
  { id: 'c14', start: 4, step: 2, adult: false, intensity: 'party', feat: { en: 'Eat crisps in one mouthful', fr: 'Manger des chips en une seule bouchée' }, unit: { en: 'crisps', fr: 'chips' } },
  { id: 'c15', start: 2, step: 1, adult: false, intensity: 'wild', feat: { en: 'Eat spoonfuls of mustard', fr: 'Manger des cuillères de moutarde' }, unit: { en: 'spoonfuls', fr: 'cuillères' } },
  { id: 'c16', start: 1, step: 1, adult: false, intensity: 'wild', feat: { en: 'Bite into lemon wedges without flinching', fr: 'Croquer des quartiers de citron sans broncher' }, unit: { en: 'wedges', fr: 'quartiers' } },
  { id: 'c17', start: 20, step: 10, adult: false, intensity: 'wild', feat: { en: 'Hold an ice cube in your closed hand', fr: 'Garder un glaçon dans la main fermée' }, unit: { en: 'seconds', fr: 'secondes' } },
  { id: 'c18', start: 5, step: 5, adult: false, intensity: 'party', feat: { en: 'Drink gulps of water without breathing', fr: 'Boire des gorgées d’eau sans respirer' }, unit: { en: 'gulps', fr: 'gorgées' } },
  { id: 'c19', start: 3, step: 2, adult: false, intensity: 'party', feat: { en: 'Hop around the room on one leg, laps', fr: 'Faire le tour de la pièce à cloche-pied, en tours' }, unit: { en: 'laps', fr: 'tours' } },
  { id: 'c20', start: 2, step: 1, adult: false, intensity: 'party', feat: { en: 'Stay completely silent', fr: 'Rester totalement silencieux' }, unit: { en: 'minutes', fr: 'minutes' } },
  { id: 'c21', start: 6, step: 3, adult: false, intensity: 'party', feat: { en: 'Name films with the same actor in them', fr: 'Citer des films avec le même acteur' }, unit: { en: 'films', fr: 'films' } },
  { id: 'c22', start: 6, step: 3, adult: false, intensity: 'party', feat: { en: 'Sing song choruses from memory, one line each', fr: 'Chanter des refrains de mémoire, une ligne chacun' }, unit: { en: 'choruses', fr: 'refrains' } },
  { id: 'c23', start: 10, step: 5, adult: false, intensity: 'chill', feat: { en: 'Keep an object spinning on the table', fr: 'Faire tourner un objet sur la table' }, unit: { en: 'seconds', fr: 'secondes' } },
  { id: 'c24', start: 5, step: 3, adult: false, intensity: 'chill', feat: { en: 'Juggle an object, catches in a row', fr: 'Jongler avec un objet, rattrapages d’affilée' }, unit: { en: 'catches', fr: 'rattrapages' } },
  { id: 'c25', start: 8, step: 4, adult: false, intensity: 'party', feat: { en: 'Snap your fingers in ten seconds', fr: 'Claquer des doigts en dix secondes' }, unit: { en: 'snaps', fr: 'claquements' } },
  { id: 'c26', start: 5, step: 3, adult: false, intensity: 'party', feat: { en: 'Name creative insults without repeating', fr: 'Inventer des insultes créatives sans répéter' }, unit: { en: 'insults', fr: 'insultes' } },
  { id: 'c27', start: 5, step: 3, adult: false, intensity: 'party', feat: { en: 'List things in your fridge right now, from memory', fr: 'Lister ce qu’il y a dans ton frigo, de mémoire' }, unit: { en: 'things', fr: 'choses' } },
  { id: 'c28', start: 4, step: 2, adult: false, intensity: 'wild', feat: { en: 'Text people something absurd and get a reply', fr: 'Envoyer un message absurde et obtenir une réponse' }, unit: { en: 'people', fr: 'personnes' } },
  { id: 'c29', start: 8, step: 4, adult: false, intensity: 'party', feat: { en: 'Do burpees without stopping', fr: 'Faire des burpees sans s’arrêter' }, unit: { en: 'burpees', fr: 'burpees' } },
  { id: 'c30', start: 6, step: 3, adult: false, intensity: 'chill', feat: { en: 'Name everyone in this room in birthday order', fr: 'Classer les gens de la pièce par date d’anniversaire' }, unit: { en: 'people', fr: 'personnes' } },
  { id: 'c31', start: 3, step: 2, adult: false, intensity: 'wild', feat: { en: 'Down shots of whatever is closest', fr: 'Enchaîner des shots de ce qui est le plus proche' }, unit: { en: 'shots', fr: 'shots' } },
  { id: 'c32', start: 5, step: 3, adult: false, intensity: 'party', feat: { en: 'Name brands of beer without repeating', fr: 'Citer des marques de bière sans répéter' }, unit: { en: 'brands', fr: 'marques' } },

  // -------------------------------------------------------------- 18+ ---
  { id: 'cs1', start: 3, step: 2, adult: true, intensity: 'wild', feat: { en: 'Name positions out loud without hesitating', fr: 'Citer des positions à voix haute sans hésiter' }, unit: { en: 'positions', fr: 'positions' } },
  { id: 'cs2', start: 2, step: 1, adult: true, intensity: 'wild', feat: { en: 'Remove items of clothing', fr: 'Enlever des vêtements' }, unit: { en: 'items', fr: 'vêtements' } },
  { id: 'cs3', start: 3, step: 2, adult: true, intensity: 'wild', feat: { en: 'Send flirty messages and get replies', fr: 'Envoyer des messages aguicheurs et obtenir des réponses' }, unit: { en: 'replies', fr: 'réponses' } },
  { id: 'cs4', start: 3, step: 2, adult: true, intensity: 'wild', feat: { en: 'List places you have done it', fr: 'Lister des endroits où tu l’as fait' }, unit: { en: 'places', fr: 'endroits' } },
  { id: 'cs5', start: 4, step: 2, adult: true, intensity: 'wild', feat: { en: 'Name exes in chronological order', fr: 'Citer tes ex dans l’ordre chronologique' }, unit: { en: 'exes', fr: 'ex' } },
  { id: 'cs6', start: 20, step: 10, adult: true, intensity: 'wild', feat: { en: 'Hold eye contact with the person opposite, no laughing', fr: 'Soutenir le regard de la personne en face, sans rire' }, unit: { en: 'seconds', fr: 'secondes' } },
  { id: 'cs7', start: 3, step: 2, adult: true, intensity: 'wild', feat: { en: 'Confess crushes you have had in this group', fr: 'Avouer des crushs que tu as eus dans ce groupe' }, unit: { en: 'crushes', fr: 'crushs' } },
  { id: 'cs8', start: 2, step: 1, adult: true, intensity: 'wild', feat: { en: 'Read out old messages from your DMs, unedited', fr: 'Lire d’anciens messages de tes DM, sans les censurer' }, unit: { en: 'messages', fr: 'messages' } },
];

/**
 * Quiz cards. `answer` is the figure the table gets shown when someone calls
 * the bluff, so it has to be a number people will accept: exact where the
 * fact is exact, and the question says "roughly" where it is not.
 */
export const QUESTIONS: Question[] = [
  { id: 'q1', answer: 220, start: 20, step: 10, adult: false, intensity: 'chill', prompt: { en: 'Roughly how much does a Big Mac weigh?', fr: 'Combien pèse un Big Mac, à peu près ?' }, unit: { en: 'grams', fr: 'grammes' } },
  { id: 'q2', answer: 503, start: 50, step: 25, adult: false, intensity: 'chill', prompt: { en: 'How many calories are there in a Big Mac?', fr: 'Combien de calories dans un Big Mac ?' }, unit: { en: 'calories', fr: 'calories' } },
  { id: 'q3', answer: 206, start: 20, step: 10, adult: false, intensity: 'chill', prompt: { en: 'How many bones are there in an adult body?', fr: 'Combien d’os dans le corps d’un adulte ?' }, unit: { en: 'bones', fr: 'os' } },
  { id: 'q4', answer: 32, start: 4, step: 2, adult: false, intensity: 'chill', prompt: { en: 'How many teeth in a full adult mouth?', fr: 'Combien de dents dans la bouche d’un adulte ?' }, unit: { en: 'teeth', fr: 'dents' } },
  { id: 'q5', answer: 88, start: 10, step: 5, adult: false, intensity: 'chill', prompt: { en: 'How many keys on a standard piano?', fr: 'Combien de touches sur un piano standard ?' }, unit: { en: 'keys', fr: 'touches' } },
  { id: 'q6', answer: 330, start: 30, step: 10, adult: false, intensity: 'chill', prompt: { en: 'How tall is the Eiffel Tower, antennas included?', fr: 'Quelle est la hauteur de la tour Eiffel, antennes comprises ?' }, unit: { en: 'metres', fr: 'mètres' } },
  { id: 'q7', answer: 1665, start: 100, step: 100, adult: false, intensity: 'party', prompt: { en: 'How many steps from the ground to the top of the Eiffel Tower?', fr: 'Combien de marches du sol au sommet de la tour Eiffel ?' }, unit: { en: 'steps', fr: 'marches' } },
  { id: 'q8', answer: 27, start: 3, step: 2, adult: false, intensity: 'chill', prompt: { en: 'How many countries are in the European Union?', fr: 'Combien de pays dans l’Union européenne ?' }, unit: { en: 'countries', fr: 'pays' } },
  { id: 'q9', answer: 54, start: 5, step: 5, adult: false, intensity: 'chill', prompt: { en: 'How many countries are there in Africa?', fr: 'Combien de pays en Afrique ?' }, unit: { en: 'countries', fr: 'pays' } },
  { id: 'q10', answer: 193, start: 20, step: 10, adult: false, intensity: 'chill', prompt: { en: 'How many member states does the UN have?', fr: 'Combien d’États membres à l’ONU ?' }, unit: { en: 'states', fr: 'États' } },
  { id: 'q11', answer: 118, start: 10, step: 10, adult: false, intensity: 'chill', prompt: { en: 'How many elements are on the periodic table?', fr: 'Combien d’éléments dans le tableau périodique ?' }, unit: { en: 'elements', fr: 'éléments' } },
  { id: 'q12', answer: 24, start: 4, step: 2, adult: false, intensity: 'chill', prompt: { en: 'How many letters in the Greek alphabet?', fr: 'Combien de lettres dans l’alphabet grec ?' }, unit: { en: 'letters', fr: 'lettres' } },
  { id: 'q13', answer: 27, start: 3, step: 2, adult: false, intensity: 'chill', prompt: { en: 'How many bones are there in one human hand?', fr: 'Combien d’os dans une main humaine ?' }, unit: { en: 'bones', fr: 'os' } },
  { id: 'q14', answer: 46, start: 4, step: 2, adult: false, intensity: 'chill', prompt: { en: 'How many chromosomes in a human cell?', fr: 'Combien de chromosomes dans une cellule humaine ?' }, unit: { en: 'chromosomes', fr: 'chromosomes' } },
  { id: 'q15', answer: 5, start: 1, step: 1, adult: false, intensity: 'chill', prompt: { en: 'How many litres of blood are in an adult body?', fr: 'Combien de litres de sang dans le corps d’un adulte ?' }, unit: { en: 'litres', fr: 'litres' } },
  { id: 'q16', answer: 35, start: 3, step: 2, adult: false, intensity: 'party', prompt: { en: 'How many grams of sugar in a 33 cl can of Coke?', fr: 'Combien de grammes de sucre dans une canette de Coca de 33 cl ?' }, unit: { en: 'grams', fr: 'grammes' } },
  { id: 'q17', answer: 58, start: 5, step: 5, adult: false, intensity: 'chill', prompt: { en: 'How much does a tennis ball weigh?', fr: 'Combien pèse une balle de tennis ?' }, unit: { en: 'grams', fr: 'grammes' } },
  { id: 'q18', answer: 430, start: 50, step: 25, adult: false, intensity: 'chill', prompt: { en: 'How much does a football weigh?', fr: 'Combien pèse un ballon de football ?' }, unit: { en: 'grams', fr: 'grammes' } },
  { id: 'q19', answer: 620, start: 100, step: 50, adult: false, intensity: 'chill', prompt: { en: 'How much does an official NBA basketball weigh?', fr: 'Combien pèse un ballon de basket officiel NBA ?' }, unit: { en: 'grams', fr: 'grammes' } },
  { id: 'q20', answer: 305, start: 50, step: 25, adult: false, intensity: 'chill', prompt: { en: 'How high is a basketball hoop, in centimetres?', fr: 'À quelle hauteur est un panier de basket, en centimètres ?' }, unit: { en: 'centimetres', fr: 'centimètres' } },
  { id: 'q21', answer: 42, start: 5, step: 2, adult: false, intensity: 'chill', prompt: { en: 'How many kilometres is a marathon?', fr: 'Combien de kilomètres fait un marathon ?' }, unit: { en: 'kilometres', fr: 'kilomètres' } },
  { id: 'q22', answer: 21, start: 3, step: 2, adult: false, intensity: 'chill', prompt: { en: 'How many stages are there in the Tour de France?', fr: 'Combien d’étapes sur le Tour de France ?' }, unit: { en: 'stages', fr: 'étapes' } },
  { id: 'q23', answer: 7, start: 2, step: 1, adult: false, intensity: 'chill', prompt: { en: 'How many players per team on a handball court?', fr: 'Combien de joueurs sur le terrain par équipe au handball ?' }, unit: { en: 'players', fr: 'joueurs' } },
  { id: 'q24', answer: 108, start: 10, step: 10, adult: false, intensity: 'chill', prompt: { en: 'How many stitches are there on a baseball?', fr: 'Combien de coutures sur une balle de baseball ?' }, unit: { en: 'stitches', fr: 'coutures' } },
  { id: 'q25', answer: 47, start: 5, step: 5, adult: false, intensity: 'chill', prompt: { en: 'How many strings on a concert harp?', fr: 'Combien de cordes sur une harpe de concert ?' }, unit: { en: 'strings', fr: 'cordes' } },
  { id: 'q26', answer: 78, start: 10, step: 5, adult: false, intensity: 'chill', prompt: { en: 'How many cards in a tarot deck?', fr: 'Combien de cartes dans un jeu de tarot ?' }, unit: { en: 'cards', fr: 'cartes' } },
  { id: 'q27', answer: 28, start: 5, step: 2, adult: false, intensity: 'chill', prompt: { en: 'How many tiles in a double-six domino set?', fr: 'Combien de dominos dans un jeu double-six ?' }, unit: { en: 'tiles', fr: 'dominos' } },
  { id: 'q28', answer: 8849, start: 500, step: 250, adult: false, intensity: 'chill', prompt: { en: 'How high is Mount Everest, in metres?', fr: 'Quelle est l’altitude de l’Everest, en mètres ?' }, unit: { en: 'metres', fr: 'mètres' } },
  { id: 'q29', answer: 687, start: 50, step: 50, adult: false, intensity: 'chill', prompt: { en: 'How many days long is a year on Mars?', fr: 'Combien de jours dure une année sur Mars ?' }, unit: { en: 'days', fr: 'jours' } },
  { id: 'q30', answer: 5500, start: 200, step: 200, adult: false, intensity: 'chill', prompt: { en: 'How hot is the surface of the Sun, in °C?', fr: 'Quelle est la température à la surface du Soleil, en °C ?' }, unit: { en: 'degrees', fr: 'degrés' } },
  { id: 'q31', answer: 1400, start: 100, step: 100, adult: false, intensity: 'chill', prompt: { en: 'How much does an adult brain weigh, in grams?', fr: 'Combien pèse le cerveau d’un adulte, en grammes ?' }, unit: { en: 'grams', fr: 'grammes' } },
  { id: 'q32', answer: 8, start: 2, step: 1, adult: false, intensity: 'chill', prompt: { en: 'How many countries border mainland France?', fr: 'Combien de pays ont une frontière avec la France métropolitaine ?' }, unit: { en: 'countries', fr: 'pays' } },
  { id: 'q33', answer: 20, start: 3, step: 1, adult: false, intensity: 'chill', prompt: { en: 'How many arrondissements does Paris have?', fr: 'Combien d’arrondissements à Paris ?' }, unit: { en: 'arrondissements', fr: 'arrondissements' } },
  { id: 'q34', answer: 236, start: 20, step: 20, adult: false, intensity: 'party', prompt: { en: 'How many episodes of Friends were made?', fr: 'Combien d’épisodes compte la série Friends ?' }, unit: { en: 'episodes', fr: 'épisodes' } },
  { id: 'q35', answer: 11, start: 2, step: 1, adult: false, intensity: 'party', prompt: { en: 'How many Oscars did Titanic win?', fr: 'Combien d’Oscars a remportés Titanic ?' }, unit: { en: 'Oscars', fr: 'Oscars' } },
  { id: 'q36', answer: 300, start: 30, step: 20, adult: false, intensity: 'chill', prompt: { en: 'Roughly how many bones is a baby born with?', fr: 'Avec combien d’os naît un bébé, à peu près ?' }, unit: { en: 'bones', fr: 'os' } },
  { id: 'q37', answer: 280, start: 30, step: 20, adult: false, intensity: 'chill', prompt: { en: 'How many days does a pregnancy last, on average?', fr: 'Combien de jours dure une grossesse, en moyenne ?' }, unit: { en: 'days', fr: 'jours' } },
  { id: 'q38', answer: 7, start: 1, step: 1, adult: false, intensity: 'chill', prompt: { en: 'Roughly how many metres long is the small intestine?', fr: 'Combien de mètres fait l’intestin grêle, à peu près ?' }, unit: { en: 'metres', fr: 'mètres' } },
  { id: 'q39', answer: 308, start: 30, step: 20, adult: false, intensity: 'chill', prompt: { en: 'Roughly how many stations does the Paris metro have?', fr: 'Combien de stations compte le métro parisien, à peu près ?' }, unit: { en: 'stations', fr: 'stations' } },
  { id: 'q40', answer: 128, start: 10, step: 10, adult: false, intensity: 'party', prompt: { en: 'Roughly how many litres of beer does the average Czech drink per year?', fr: 'Combien de litres de bière un Tchèque boit-il par an, à peu près ?' }, unit: { en: 'litres', fr: 'litres' } },

  // ------------------------------------------------------ pop culture ---
  { id: 'qp1', answer: 8, start: 2, step: 1, adult: false, intensity: 'chill', prompt: { en: 'How many Harry Potter films are there?', fr: 'Combien de films Harry Potter existe-t-il ?' }, unit: { en: 'films', fr: 'films' } },
  { id: 'qp2', answer: 9, start: 2, step: 1, adult: false, intensity: 'chill', prompt: { en: 'How many films are in the Star Wars Skywalker saga?', fr: 'Combien de films compte la saga Skywalker de Star Wars ?' }, unit: { en: 'films', fr: 'films' } },
  { id: 'qp3', answer: 7, start: 2, step: 1, adult: false, intensity: 'chill', prompt: { en: 'How many Weasley children are there in Harry Potter?', fr: 'Combien d’enfants Weasley y a-t-il dans Harry Potter ?' }, unit: { en: 'children', fr: 'enfants' } },
  { id: 'qp4', answer: 23, start: 5, step: 2, adult: false, intensity: 'party', prompt: { en: 'How many films make up the Marvel Infinity Saga?', fr: 'Combien de films composent la Saga de l’Infini chez Marvel ?' }, unit: { en: 'films', fr: 'films' } },
  { id: 'qp5', answer: 25, start: 5, step: 2, adult: false, intensity: 'party', prompt: { en: 'How many official James Bond films has Eon made so far?', fr: 'Combien de James Bond officiels Eon a-t-il produits à ce jour ?' }, unit: { en: 'films', fr: 'films' } },
  { id: 'qp6', answer: 73, start: 10, step: 5, adult: false, intensity: 'party', prompt: { en: 'How many episodes of Game of Thrones were made?', fr: 'Combien d’épisodes compte Game of Thrones ?' }, unit: { en: 'episodes', fr: 'épisodes' } },
  { id: 'qp7', answer: 59, start: 5, step: 5, adult: false, intensity: 'party', prompt: { en: 'How many Emmy Awards did Game of Thrones win?', fr: 'Combien d’Emmy Awards Game of Thrones a-t-il remportés ?' }, unit: { en: 'Emmys', fr: 'Emmy' } },
  { id: 'qp8', answer: 62, start: 10, step: 5, adult: false, intensity: 'party', prompt: { en: 'How many episodes of Breaking Bad are there?', fr: 'Combien d’épisodes compte Breaking Bad ?' }, unit: { en: 'episodes', fr: 'épisodes' } },
  { id: 'qp9', answer: 201, start: 20, step: 20, adult: false, intensity: 'party', prompt: { en: 'How many episodes of The Office (US) were made?', fr: 'Combien d’épisodes compte The Office (US) ?' }, unit: { en: 'episodes', fr: 'épisodes' } },
  { id: 'qp10', answer: 456, start: 50, step: 50, adult: false, intensity: 'party', prompt: { en: 'How many players start the games in Squid Game?', fr: 'Combien de joueurs commencent les épreuves dans Squid Game ?' }, unit: { en: 'players', fr: 'joueurs' } },
  { id: 'qp11', answer: 220, start: 20, step: 20, adult: false, intensity: 'party', prompt: { en: 'How many episodes are in the original Naruto series?', fr: 'Combien d’épisodes compte la série Naruto d’origine ?' }, unit: { en: 'episodes', fr: 'épisodes' } },
  { id: 'qp12', answer: 151, start: 20, step: 10, adult: false, intensity: 'chill', prompt: { en: 'How many Pokémon were in the original Red and Blue Pokédex?', fr: 'Combien de Pokémon comptait le Pokédex de Rouge et Bleu ?' }, unit: { en: 'Pokémon', fr: 'Pokémon' } },
  { id: 'qp13', answer: 100, start: 10, step: 10, adult: false, intensity: 'chill', prompt: { en: 'How many rings does Sonic need for an extra life?', fr: 'Combien d’anneaux faut-il à Sonic pour une vie supplémentaire ?' }, unit: { en: 'rings', fr: 'anneaux' } },
  { id: 'qp14', answer: 32, start: 5, step: 5, adult: false, intensity: 'chill', prompt: { en: 'How many levels are in the original Super Mario Bros.?', fr: 'Combien de niveaux compte le premier Super Mario Bros. ?' }, unit: { en: 'levels', fr: 'niveaux' } },
  { id: 'qp15', answer: 256, start: 20, step: 20, adult: false, intensity: 'party', prompt: { en: 'How many levels can you clear in Pac-Man before the kill screen?', fr: 'Combien de niveaux peut-on passer à Pac-Man avant l’écran de la mort ?' }, unit: { en: 'levels', fr: 'niveaux' } },
  { id: 'qp16', answer: 120, start: 20, step: 10, adult: false, intensity: 'party', prompt: { en: 'How many shrines are there in Zelda: Breath of the Wild?', fr: 'Combien de sanctuaires y a-t-il dans Zelda : Breath of the Wild ?' }, unit: { en: 'shrines', fr: 'sanctuaires' } },
  { id: 'qp17', answer: 100, start: 10, step: 10, adult: false, intensity: 'chill', prompt: { en: 'How many players are in one Fortnite battle royale match?', fr: 'Combien de joueurs dans une partie de battle royale sur Fortnite ?' }, unit: { en: 'players', fr: 'joueurs' } },
  { id: 'qp18', answer: 194, start: 60, step: 15, adult: false, intensity: 'party', prompt: { en: 'How many minutes long is the film Titanic?', fr: 'Combien de minutes dure le film Titanic ?' }, unit: { en: 'minutes', fr: 'minutes' } },
  { id: 'qp19', answer: 181, start: 60, step: 15, adult: false, intensity: 'party', prompt: { en: 'How many minutes long is Avengers: Endgame?', fr: 'Combien de minutes dure Avengers: Endgame ?' }, unit: { en: 'minutes', fr: 'minutes' } },
  { id: 'qp20', answer: 355, start: 60, step: 30, adult: false, intensity: 'party', prompt: { en: 'How many seconds long is Bohemian Rhapsody?', fr: 'Combien de secondes dure Bohemian Rhapsody ?' }, unit: { en: 'seconds', fr: 'secondes' } },
  { id: 'qp21', answer: 20, start: 4, step: 2, adult: false, intensity: 'party', prompt: { en: 'How many US number-one hits did the Beatles have?', fr: 'Combien de numéros un américains les Beatles ont-ils eus ?' }, unit: { en: 'hits', fr: 'tubes' } },

  // -------------------------------------------------------------- 18+ ---
  { id: 'qs1', answer: 100, start: 10, step: 10, adult: true, intensity: 'wild', prompt: { en: 'Roughly how many calories does a man burn during sex, per session?', fr: 'Combien de calories un homme brûle-t-il pendant un rapport, à peu près ?' }, unit: { en: 'calories', fr: 'calories' } },
  { id: 'qs2', answer: 5, start: 1, step: 1, adult: true, intensity: 'wild', prompt: { en: 'How many minutes does sex last on average, foreplay not counted?', fr: 'Combien de minutes dure un rapport en moyenne, préliminaires non comptés ?' }, unit: { en: 'minutes', fr: 'minutes' } },
  { id: 'qs3', answer: 10000, start: 500, step: 500, adult: true, intensity: 'wild', prompt: { en: 'Roughly how many nerve endings does the clitoris have?', fr: 'Combien de terminaisons nerveuses dans le clitoris, à peu près ?' }, unit: { en: 'nerve endings', fr: 'terminaisons' } },
  { id: 'qs4', answer: 200, start: 10, step: 10, adult: true, intensity: 'wild', prompt: { en: 'How many sperm are in an average ejaculation, in millions?', fr: 'Combien de spermatozoïdes dans une éjaculation, en millions ?' }, unit: { en: 'millions', fr: 'millions' } },
];
