import type { DeckCard } from '@/games/types';

/**
 * Not the statements — the *subject*. Handing someone a topic is the difference
 * between "uhh… I have a dog?" and a story worth calling out.
 */
export const THEME_DECK: DeckCard[] = [
  { id: 't1', adult: false, intensity: 'chill', text: { en: 'Something from your childhood', fr: 'Un truc de ton enfance' } },
  { id: 't2', adult: false, intensity: 'chill', text: { en: 'A place you have been', fr: 'Un endroit où tu es allé' } },
  { id: 't3', adult: false, intensity: 'chill', text: { en: 'A job you have had', fr: 'Un boulot que tu as fait' } },
  { id: 't4', adult: false, intensity: 'chill', text: { en: 'A skill you claim to have', fr: 'Une compétence que tu prétends avoir' } },
  { id: 't5', adult: false, intensity: 'chill', text: { en: 'Something in your fridge right now', fr: 'Quelque chose dans ton frigo là maintenant' } },
  { id: 't6', adult: false, intensity: 'chill', text: { en: 'A famous person you have met', fr: 'Une célébrité que tu as croisée' } },
  { id: 't7', adult: false, intensity: 'chill', text: { en: 'An injury you have had', fr: 'Une blessure que tu as eue' } },
  { id: 't8', adult: false, intensity: 'chill', text: { en: 'A food you cannot stand', fr: 'Un aliment que tu ne supportes pas' } },
  { id: 't9', adult: false, intensity: 'chill', text: { en: 'Something you own that nobody knows about', fr: 'Un objet que tu possèdes et que personne ne connaît' } },
  { id: 't10', adult: false, intensity: 'chill', text: { en: 'A record or prize you have won', fr: 'Un record ou un prix que tu as gagné' } },
  { id: 't11', adult: false, intensity: 'chill', text: { en: 'A pet you have had', fr: 'Un animal que tu as eu' } },
  { id: 't12', adult: false, intensity: 'chill', text: { en: 'Something you did as a teenager', fr: 'Un truc que tu as fait ado' } },
  { id: 't13', adult: false, intensity: 'party', text: { en: 'A night you barely remember', fr: 'Une soirée dont tu te souviens à peine' } },
  { id: 't14', adult: false, intensity: 'party', text: { en: 'A time you got caught', fr: 'Une fois où tu t’es fait prendre' } },
  { id: 't15', adult: false, intensity: 'party', text: { en: 'Something you have stolen', fr: 'Quelque chose que tu as volé' } },
  { id: 't16', adult: false, intensity: 'party', text: { en: 'A lie you told that worked', fr: 'Un mensonge qui a marché' } },
  { id: 't17', adult: false, intensity: 'party', text: { en: 'The worst thing you have eaten', fr: 'La pire chose que tu as mangée' } },
  { id: 't18', adult: false, intensity: 'party', text: { en: 'A rule you have broken', fr: 'Une règle que tu as enfreinte' } },
  { id: 't19', adult: false, intensity: 'party', text: { en: 'Something embarrassing in your search history', fr: 'Un truc gênant dans ton historique' } },
  { id: 't20', adult: false, intensity: 'party', text: { en: 'A time you were somewhere you should not have been', fr: 'Une fois où tu étais là où tu n’aurais pas dû' } },
  { id: 't21', adult: false, intensity: 'party', text: { en: 'Money you have lost', fr: 'De l’argent que tu as perdu' } },
  { id: 't22', adult: false, intensity: 'party', text: { en: 'Something you did purely out of spite', fr: 'Un truc fait purement par vengeance' } },
  { id: 't23', adult: false, intensity: 'party', text: { en: 'The most you have paid for something stupid', fr: 'Le plus que tu as payé pour une bêtise' } },
  { id: 't24', adult: false, intensity: 'party', text: { en: 'A talent nobody here believes you have', fr: 'Un talent que personne ici ne te croit capable d’avoir' } },
  { id: 't25', adult: false, intensity: 'wild', text: { en: 'Something about someone in this room', fr: 'Quelque chose sur quelqu’un dans cette pièce' } },
  { id: 't26', adult: false, intensity: 'wild', text: { en: 'A secret you have kept for years', fr: 'Un secret que tu gardes depuis des années' } },
  { id: 't27', adult: false, intensity: 'wild', text: { en: 'The worst thing you have done to a friend', fr: 'La pire chose que tu as faite à un ami' } },
  { id: 't28', adult: false, intensity: 'wild', text: { en: 'A time you lied to get out of trouble', fr: 'Une fois où tu as menti pour t’en sortir' } },
  { id: 't29', adult: false, intensity: 'wild', text: { en: 'Something you have never told your family', fr: 'Un truc jamais dit à ta famille' } },
  { id: 't30', adult: false, intensity: 'wild', text: { en: 'A relationship nobody knew about', fr: 'Une relation que personne ne connaissait' } },
  { id: 't31', adult: false, intensity: 'chill', text: { en: 'A film you claim to have seen', fr: 'Un film que tu prétends avoir vu' } },
  { id: 't32', adult: false, intensity: 'chill', text: { en: 'Something you are scared of', fr: 'Quelque chose qui te fait peur' } },
  { id: 't33', adult: false, intensity: 'chill', text: { en: 'A subject you were terrible at', fr: 'Une matière où tu étais nul' } },
  { id: 't34', adult: false, intensity: 'party', text: { en: 'A tattoo, piercing or haircut story', fr: 'Une histoire de tatouage, piercing ou coupe' } },
  { id: 't35', adult: false, intensity: 'party', text: { en: 'Something you have broken and never admitted', fr: 'Un truc cassé et jamais avoué' } },

  // ------------------------------------------------------------- 18+ deck ---
  { id: 'ts1', adult: true, intensity: 'wild', text: { en: 'A place you have hooked up', fr: 'Un endroit où tu as couché' } },
  { id: 'ts2', adult: true, intensity: 'wild', text: { en: 'A number you have exaggerated', fr: 'Un nombre que tu as exagéré' } },
  { id: 'ts3', adult: true, intensity: 'wild', text: { en: 'Something about your dating history', fr: 'Un truc sur ton passé amoureux' } },
  { id: 'ts4', adult: true, intensity: 'wild', text: { en: 'A fantasy, real or invented', fr: 'Un fantasme, vrai ou inventé' } },
  { id: 'ts5', adult: true, intensity: 'wild', text: { en: 'The strangest thing a partner has asked you', fr: 'La chose la plus étrange qu’un partenaire t’a demandée' } },
];
