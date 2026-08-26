import type { LocalizedText } from '@piccolo/shared';
import type { RoomCard } from '../kit.js';

export interface FillCard extends RoomCard {
  /** Contains `___` where the player's answer goes. */
  text: LocalizedText;
}

/**
 * Fill-in-the-blank prompts. Each one has exactly one blank and works with a
 * two-word answer as well as a paragraph — the funniest submissions are almost
 * always the shortest.
 */
export const PUNCHLINES: FillCard[] = [
  { id: 'f1', adult: false, intensity: 'chill', text: { en: 'The worst possible name for a pet is ___.', fr: 'Le pire nom possible pour un animal, c’est ___.' } },
  { id: 'f2', adult: false, intensity: 'chill', text: { en: 'My autobiography would be called ___.', fr: 'Mon autobiographie s’appellerait ___.' } },
  { id: 'f3', adult: false, intensity: 'chill', text: { en: 'Nothing ruins a first date faster than ___.', fr: 'Rien ne gâche un premier rendez-vous plus vite que ___.' } },
  { id: 'f4', adult: false, intensity: 'chill', text: { en: 'The real reason I was late is ___.', fr: 'La vraie raison de mon retard, c’est ___.' } },
  { id: 'f5', adult: false, intensity: 'chill', text: { en: 'You can tell a lot about someone from their ___.', fr: 'On apprend beaucoup sur quelqu’un rien qu’avec son ___.' } },
  { id: 'f6', adult: false, intensity: 'chill', text: { en: 'The new national sport should be ___.', fr: 'Le nouveau sport national devrait être ___.' } },
  { id: 'f7', adult: false, intensity: 'chill', text: { en: 'I would pay good money to never hear about ___ again.', fr: 'Je paierais cher pour ne plus jamais entendre parler de ___.' } },
  { id: 'f8', adult: false, intensity: 'chill', text: { en: 'My superpower is ___, which is useless.', fr: 'Mon super-pouvoir, c’est ___, et ça ne sert à rien.' } },
  { id: 'f9', adult: false, intensity: 'chill', text: { en: 'The worst thing to find in a hotel room is ___.', fr: 'La pire chose à trouver dans une chambre d’hôtel, c’est ___.' } },
  { id: 'f10', adult: false, intensity: 'chill', text: { en: 'Every family has one ___.', fr: 'Chaque famille a son ___.' } },
  { id: 'f11', adult: false, intensity: 'chill', text: { en: 'I have never recovered from ___.', fr: 'Je ne me suis jamais remis de ___.' } },
  { id: 'f12', adult: false, intensity: 'chill', text: { en: 'The secret ingredient is always ___.', fr: 'L’ingrédient secret, c’est toujours ___.' } },
  { id: 'f13', adult: false, intensity: 'party', text: { en: 'The worst thing to shout in a quiet bar is ___.', fr: 'La pire chose à crier dans un bar silencieux, c’est ___.' } },
  { id: 'f14', adult: false, intensity: 'party', text: { en: 'This party would be better with ___.', fr: 'Cette soirée serait meilleure avec ___.' } },
  { id: 'f15', adult: false, intensity: 'party', text: { en: 'I only agreed to come tonight because of ___.', fr: 'Je ne suis venu ce soir que pour ___.' } },
  { id: 'f16', adult: false, intensity: 'party', text: { en: 'My worst hangover cure is ___.', fr: 'Mon pire remède contre la gueule de bois, c’est ___.' } },
  { id: 'f17', adult: false, intensity: 'party', text: { en: 'The taxi driver did not need to know about ___.', fr: 'Le chauffeur de taxi n’avait pas besoin de savoir pour ___.' } },
  { id: 'f18', adult: false, intensity: 'party', text: { en: 'Two things you should never mix: alcohol and ___.', fr: 'Deux choses à ne jamais mélanger : l’alcool et ___.' } },
  { id: 'f19', adult: false, intensity: 'party', text: { en: 'I once got banned from ___.', fr: 'Je me suis fait interdire l’entrée de ___.' } },
  { id: 'f20', adult: false, intensity: 'party', text: { en: 'The group chat is 90% ___.', fr: 'Le groupe de discussion, c’est 90 % de ___.' } },
  { id: 'f21', adult: false, intensity: 'party', text: { en: 'At 3am, ___ always seems like a good idea.', fr: 'À 3 h du matin, ___ semble toujours être une bonne idée.' } },
  { id: 'f22', adult: false, intensity: 'party', text: { en: 'My most expensive mistake was ___.', fr: 'Mon erreur la plus chère, c’était ___.' } },
  { id: 'f23', adult: false, intensity: 'party', text: { en: 'The house rule nobody follows is ___.', fr: 'La règle de la maison que personne ne respecte, c’est ___.' } },
  { id: 'f24', adult: false, intensity: 'party', text: { en: 'Never trust a person who ___.', fr: 'Ne fais jamais confiance à quelqu’un qui ___.' } },
  { id: 'f25', adult: false, intensity: 'party', text: { en: 'I would survive exactly ___ in a horror film.', fr: 'Je survivrais exactement ___ dans un film d’horreur.' } },
  { id: 'f26', adult: false, intensity: 'party', text: { en: 'The most overrated thing in the world is ___.', fr: 'La chose la plus surestimée au monde, c’est ___.' } },
  { id: 'f27', adult: false, intensity: 'party', text: { en: 'My last brain cell is currently working on ___.', fr: 'Mon dernier neurone travaille actuellement sur ___.' } },
  { id: 'f28', adult: false, intensity: 'party', text: { en: 'The only acceptable excuse for cancelling is ___.', fr: 'La seule excuse acceptable pour annuler, c’est ___.' } },
  { id: 'f29', adult: false, intensity: 'party', text: { en: 'Somebody in this room definitely ___.', fr: 'Quelqu’un dans cette pièce a clairement ___.' } },
  { id: 'f30', adult: false, intensity: 'party', text: { en: 'I would like to apologise for ___.', fr: 'Je voudrais m’excuser pour ___.' } },
  { id: 'f31', adult: false, intensity: 'party', text: { en: 'The fastest way to end a friendship is ___.', fr: 'Le moyen le plus rapide de finir une amitié, c’est ___.' } },
  { id: 'f32', adult: false, intensity: 'party', text: { en: 'I judge people who ___.', fr: 'Je juge les gens qui ___.' } },
  { id: 'f33', adult: false, intensity: 'party', text: { en: 'My hidden talent is ___.', fr: 'Mon talent caché, c’est ___.' } },
  { id: 'f34', adult: false, intensity: 'party', text: { en: 'The wildest thing in my search history is ___.', fr: 'Le truc le plus fou de mon historique, c’est ___.' } },
  { id: 'f35', adult: false, intensity: 'party', text: { en: 'This drink tastes like ___.', fr: 'Cette boisson a un goût de ___.' } },
  { id: 'f36', adult: false, intensity: 'wild', text: { en: 'I have never told anyone about ___.', fr: 'Je n’ai jamais parlé à personne de ___.' } },
  { id: 'f37', adult: false, intensity: 'wild', text: { en: 'The person to my left is definitely thinking about ___.', fr: 'La personne à ma gauche pense clairement à ___.' } },
  { id: 'f38', adult: false, intensity: 'wild', text: { en: 'If I disappeared tonight, blame ___.', fr: 'Si je disparais ce soir, accusez ___.' } },
  { id: 'f39', adult: false, intensity: 'wild', text: { en: 'My last relationship ended because of ___.', fr: 'Ma dernière relation s’est terminée à cause de ___.' } },
  { id: 'f40', adult: false, intensity: 'wild', text: { en: 'The one thing I would delete from my past is ___.', fr: 'La seule chose que j’effacerais de mon passé, c’est ___.' } },
  { id: 'f41', adult: false, intensity: 'chill', text: { en: 'The best thing about being an adult is ___.', fr: 'Le mieux quand on est adulte, c’est ___.' } },
  { id: 'f42', adult: false, intensity: 'chill', text: { en: 'I still do not understand ___.', fr: 'Je ne comprends toujours pas ___.' } },
  { id: 'f43', adult: false, intensity: 'chill', text: { en: 'My childhood was mostly ___.', fr: 'Mon enfance, c’était surtout ___.' } },
  { id: 'f44', adult: false, intensity: 'party', text: { en: 'The perfect crime involves ___.', fr: 'Le crime parfait implique ___.' } },
  { id: 'f45', adult: false, intensity: 'party', text: { en: 'You know it is a good night when ___.', fr: 'On sait que la soirée est bonne quand ___.' } },

  { id: 'fs1', adult: true, intensity: 'wild', text: { en: 'The worst thing to say in bed is ___.', fr: 'La pire chose à dire au lit, c’est ___.' } },
  { id: 'fs2', adult: true, intensity: 'wild', text: { en: 'My type is basically ___.', fr: 'Mon type, c’est en gros ___.' } },
  { id: 'fs3', adult: true, intensity: 'wild', text: { en: 'The fastest red flag on a date is ___.', fr: 'Le red flag le plus rapide à un rendez-vous, c’est ___.' } },
  { id: 'fs4', adult: true, intensity: 'wild', text: { en: 'Nothing kills the mood like ___.', fr: 'Rien ne tue l’ambiance comme ___.' } },
  { id: 'fs5', adult: true, intensity: 'wild', text: { en: 'My dating profile should really say ___.', fr: 'Mon profil de rencontre devrait vraiment dire ___.' } },
];
