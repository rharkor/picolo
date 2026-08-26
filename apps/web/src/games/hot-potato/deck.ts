import type { DeckCard } from '@/games/types';

/** What the potato does to whoever is holding it when the music stops. */
export const POTATO_DECK: DeckCard[] = [
  { id: 'hp1', adult: false, intensity: 'chill', text: { en: 'Drink two sips.', fr: 'Bois deux gorgées.' } },
  { id: 'hp2', adult: false, intensity: 'chill', text: { en: 'Drink three sips.', fr: 'Bois trois gorgées.' } },
  { id: 'hp3', adult: false, intensity: 'chill', text: { en: 'Hand out three sips.', fr: 'Distribue trois gorgées.' } },
  { id: 'hp4', adult: false, intensity: 'chill', text: { en: 'Tell the table a joke. If nobody laughs, drink three.', fr: 'Raconte une blague. Si personne ne rit, bois trois gorgées.' } },
  { id: 'hp5', adult: false, intensity: 'chill', text: { en: 'Name five things in a category the table picks, in ten seconds.', fr: 'Cite cinq éléments d’un thème choisi par la table, en dix secondes.' } },
  { id: 'hp6', adult: false, intensity: 'party', text: { en: 'Answer one question from the table honestly.', fr: 'Réponds honnêtement à une question de la table.' } },
  { id: 'hp7', adult: false, intensity: 'party', text: { en: 'Do ten squats or drink four.', fr: 'Dix squats ou quatre gorgées.' } },
  { id: 'hp8', adult: false, intensity: 'party', text: { en: 'Sing the chorus of the last song you listened to.', fr: 'Chante le refrain de ta dernière chanson écoutée.' } },
  { id: 'hp9', adult: false, intensity: 'party', text: { en: 'Show the table your last photo, or drink four.', fr: 'Montre ta dernière photo, ou bois quatre gorgées.' } },
  { id: 'hp10', adult: false, intensity: 'party', text: { en: 'Speak in an accent until the next explosion.', fr: 'Parle avec un accent jusqu’à la prochaine explosion.' } },
  { id: 'hp11', adult: false, intensity: 'party', text: { en: 'Swap seats with the person opposite you.', fr: 'Échange de place avec la personne en face.' } },
  { id: 'hp12', adult: false, intensity: 'party', text: { en: 'Give your drink to someone. They pick what you get next.', fr: 'Donne ton verre à quelqu’un. Il choisit ton prochain.' } },
  { id: 'hp13', adult: false, intensity: 'party', text: { en: 'Say something nice about everyone at the table.', fr: 'Dis un truc gentil sur chaque personne à table.' } },
  { id: 'hp14', adult: false, intensity: 'party', text: { en: 'Do an impression of someone here. If nobody guesses, drink three.', fr: 'Imite quelqu’un ici. Si personne ne devine, bois trois gorgées.' } },
  { id: 'hp15', adult: false, intensity: 'party', text: { en: 'You cannot laugh until the next explosion. One sip per slip.', fr: 'Interdit de rire jusqu’à la prochaine explosion. Une gorgée par écart.' } },
  { id: 'hp16', adult: false, intensity: 'wild', text: { en: 'Take a shot.', fr: 'Cul sec.' } },
  { id: 'hp17', adult: false, intensity: 'wild', text: { en: 'Confess something small you have never admitted.', fr: 'Avoue un petit truc jamais admis.' } },
  { id: 'hp18', adult: false, intensity: 'wild', text: { en: 'Let the table read one message from your phone, or drink six.', fr: 'Laisse la table lire un message de ton téléphone, ou bois six gorgées.' } },
  { id: 'hp19', adult: false, intensity: 'wild', text: { en: 'Call someone in your contacts and say hello. Or drink five.', fr: 'Appelle un contact et dis bonjour. Ou bois cinq gorgées.' } },
  { id: 'hp20', adult: false, intensity: 'chill', text: { en: 'Nothing. You got lucky.', fr: 'Rien. Tu as eu de la chance.' } },
  { id: 'hp21', adult: false, intensity: 'party', text: { en: 'Everyone else drinks one. You are untouchable this round.', fr: 'Tous les autres boivent une gorgée. Tu es intouchable ce tour.' } },
  { id: 'hp22', adult: false, intensity: 'party', text: { en: 'Drink one for every vowel in your name.', fr: 'Une gorgée par voyelle de ton prénom.' } },

  // ------------------------------------------------------------- 18+ deck ---
  { id: 'hps1', adult: true, intensity: 'wild', text: { en: 'Remove one item of clothing or drink five.', fr: 'Enlève un vêtement ou bois cinq gorgées.' } },
  { id: 'hps2', adult: true, intensity: 'wild', text: { en: 'Answer one question about your love life, no dodging.', fr: 'Réponds à une question sur ta vie amoureuse, sans esquiver.' } },
  { id: 'hps3', adult: true, intensity: 'wild', text: { en: 'Whisper your type to the person on your left.', fr: 'Chuchote ton type à la personne à ta gauche.' } },
];
