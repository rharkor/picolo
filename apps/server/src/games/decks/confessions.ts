import type { LocalizedText } from '@piccolo/shared';
import type { RoomCard } from '../kit.js';

export interface PromptOnly extends RoomCard {
  text: LocalizedText;
}

/**
 * A prompt narrows the field, which is the difference between eight useful
 * confessions and eight people typing "I don't know". None of them force
 * anything: "pass" is always a legitimate answer.
 */
export const CONFESSION_PROMPTS: PromptOnly[] = [
  { id: 'c1', adult: false, intensity: 'chill', text: { en: 'Something you have never told this group.', fr: 'Un truc que tu n’as jamais dit à ce groupe.' } },
  { id: 'c2', adult: false, intensity: 'chill', text: { en: 'The last lie you told, and who to.', fr: 'Ton dernier mensonge, et à qui.' } },
  { id: 'c3', adult: false, intensity: 'chill', text: { en: 'A habit you hide from everyone.', fr: 'Une habitude que tu caches à tout le monde.' } },
  { id: 'c4', adult: false, intensity: 'chill', text: { en: 'The pettiest thing you have done this year.', fr: 'La chose la plus mesquine que tu as faite cette année.' } },
  { id: 'c5', adult: false, intensity: 'chill', text: { en: 'Something you have stolen.', fr: 'Quelque chose que tu as volé.' } },
  { id: 'c6', adult: false, intensity: 'chill', text: { en: 'A rule you break constantly.', fr: 'Une règle que tu enfreins constamment.' } },
  { id: 'c7', adult: false, intensity: 'chill', text: { en: 'The most embarrassing thing in your home.', fr: 'La chose la plus gênante chez toi.' } },
  { id: 'c8', adult: false, intensity: 'party', text: { en: 'The worst thing you have done at a party.', fr: 'La pire chose que tu as faite en soirée.' } },
  { id: 'c9', adult: false, intensity: 'party', text: { en: 'A time you got away with something.', fr: 'Une fois où tu t’en es sorti sans problème.' } },
  { id: 'c10', adult: false, intensity: 'party', text: { en: 'The most money you have wasted in one night.', fr: 'Le plus d’argent claqué en une soirée.' } },
  { id: 'c11', adult: false, intensity: 'party', text: { en: 'Something you did that you blamed on someone else.', fr: 'Un truc que tu as fait et fait porter à quelqu’un d’autre.' } },
  { id: 'c12', adult: false, intensity: 'party', text: { en: 'A text you regret sending.', fr: 'Un message que tu regrettes d’avoir envoyé.' } },
  { id: 'c13', adult: false, intensity: 'party', text: { en: 'The strangest place you have fallen asleep.', fr: 'L’endroit le plus étrange où tu t’es endormi.' } },
  { id: 'c14', adult: false, intensity: 'party', text: { en: 'A thing you pretend to enjoy.', fr: 'Un truc que tu fais semblant d’aimer.' } },
  { id: 'c15', adult: false, intensity: 'wild', text: { en: 'A secret you are keeping from someone in this room.', fr: 'Un secret que tu gardes pour quelqu’un dans cette pièce.' } },
  { id: 'c16', adult: false, intensity: 'wild', text: { en: 'The worst thing you have said about a friend.', fr: 'La pire chose dite sur un ami.' } },
  { id: 'c17', adult: false, intensity: 'wild', text: { en: 'Something you have never admitted to your family.', fr: 'Un truc jamais avoué à ta famille.' } },
  { id: 'c18', adult: false, intensity: 'wild', text: { en: 'A moment you are genuinely ashamed of.', fr: 'Un moment dont tu as vraiment honte.' } },
  { id: 'c19', adult: false, intensity: 'wild', text: { en: 'Something you would delete from your past.', fr: 'Quelque chose que tu effacerais de ton passé.' } },
  { id: 'c20', adult: false, intensity: 'wild', text: { en: 'A crush you have never confessed.', fr: 'Un crush que tu n’as jamais avoué.' } },

  { id: 'cs1', adult: true, intensity: 'wild', text: { en: 'The wildest thing you have done sober.', fr: 'La chose la plus folle faite en étant sobre.' } },
  { id: 'cs2', adult: true, intensity: 'wild', text: { en: 'Something in your search history you would not read out.', fr: 'Un truc de ton historique que tu ne lirais pas à voix haute.' } },
  { id: 'cs3', adult: true, intensity: 'wild', text: { en: 'A hookup you have never mentioned.', fr: 'Un coup dont tu n’as jamais parlé.' } },
  { id: 'cs4', adult: true, intensity: 'wild', text: { en: 'The biggest lie you have told a partner.', fr: 'Le plus gros mensonge dit à un partenaire.' } },
];
