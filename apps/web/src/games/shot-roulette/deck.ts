import type { DeckCard } from '@/games/types';

/**
 * What the wheel does to you once it has picked you. A quarter of the deck is
 * good news on purpose — a wheel that only ever punishes stops being tense.
 */
export const ROULETTE_DECK: DeckCard[] = [
  { id: 'r1', adult: false, intensity: 'party', text: { en: 'Take a shot. No negotiating.', fr: 'Cul sec. Pas de négociation.' } },
  { id: 'r2', adult: false, intensity: 'party', text: { en: 'Drink three sips.', fr: 'Bois trois gorgées.' } },
  { id: 'r3', adult: false, intensity: 'party', text: { en: 'Drink five sips, slowly, while everyone watches.', fr: 'Bois cinq gorgées, lentement, sous les regards.' } },
  { id: 'r4', adult: false, intensity: 'chill', text: { en: 'Safe. The wheel likes you today.', fr: 'Sauvé. La roue t’aime bien aujourd’hui.' } },
  { id: 'r5', adult: false, intensity: 'chill', text: { en: 'Immunity: skip the next time you land.', fr: 'Immunité : passe la prochaine fois que tu tombes dessus.' } },
  { id: 'r6', adult: false, intensity: 'party', text: { en: 'Hand out four sips however you like.', fr: 'Distribue quatre gorgées comme tu veux.' } },
  { id: 'r7', adult: false, intensity: 'party', text: { en: 'Everyone else drinks two. Enjoy it.', fr: 'Tous les autres boivent deux gorgées. Profite.' } },
  { id: 'r8', adult: false, intensity: 'party', text: { en: 'Swap drinks with the person on your left.', fr: 'Échange ton verre avec celui à ta gauche.' } },
  { id: 'r9', adult: false, intensity: 'party', text: { en: 'Down whatever is left in your glass.', fr: 'Finis ce qu’il reste dans ton verre.' } },
  { id: 'r10', adult: false, intensity: 'party', text: { en: 'Answer any question the table asks, or take a shot.', fr: 'Réponds à n’importe quelle question de la table, ou cul sec.' } },
  { id: 'r11', adult: false, intensity: 'party', text: { en: 'Speak only in questions until the wheel picks you again.', fr: 'Ne parle qu’en questions jusqu’à ce que la roue te reprenne.' } },
  { id: 'r12', adult: false, intensity: 'party', text: { en: 'Do ten press-ups or drink four.', fr: 'Dix pompes ou quatre gorgées.' } },
  { id: 'r13', adult: false, intensity: 'party', text: { en: 'Pick someone to drink with you. Three each.', fr: 'Choisis quelqu’un pour boire avec toi. Trois chacun.' } },
  { id: 'r14', adult: false, intensity: 'party', text: { en: 'Show the table the last photo you took, or drink four.', fr: 'Montre ta dernière photo, ou bois quatre gorgées.' } },
  { id: 'r15', adult: false, intensity: 'party', text: { en: 'You are the bartender until the wheel picks you again.', fr: 'Tu es barman jusqu’à ce que la roue te reprenne.' } },
  { id: 'r16', adult: false, intensity: 'chill', text: { en: 'Nothing happens. Everyone is disappointed.', fr: 'Rien ne se passe. Tout le monde est déçu.' } },
  { id: 'r17', adult: false, intensity: 'wild', text: { en: 'Take a shot, then spin again immediately.', fr: 'Cul sec, puis relance la roue immédiatement.' } },
  { id: 'r18', adult: false, intensity: 'wild', text: { en: 'Give your phone to the person on your right for one minute, or take a shot.', fr: 'Donne ton téléphone à ton voisin de droite une minute, ou cul sec.' } },
  { id: 'r19', adult: false, intensity: 'wild', text: { en: 'Confess something nobody here knows, or drink six.', fr: 'Avoue un truc que personne ici ne sait, ou bois six gorgées.' } },
  { id: 'r20', adult: false, intensity: 'wild', text: { en: 'The table votes: shot, or a dare of their choosing.', fr: 'La table vote : cul sec, ou un défi de son choix.' } },
  { id: 'r21', adult: false, intensity: 'party', text: { en: 'Drink one for every person at the table.', fr: 'Une gorgée par personne à table.' } },
  { id: 'r22', adult: false, intensity: 'party', text: { en: 'Take a shot, unless someone volunteers to take it for you.', fr: 'Cul sec, sauf si quelqu’un se dévoue pour toi.' } },
  { id: 'r23', adult: false, intensity: 'chill', text: { en: 'Choose: two sips now, or five later. The table remembers.', fr: 'Choisis : deux gorgées maintenant, ou cinq plus tard. La table s’en souviendra.' } },
  { id: 'r24', adult: false, intensity: 'wild', text: { en: 'Everyone points at you and you drink one per finger.', fr: 'Tout le monde te pointe et tu bois une gorgée par doigt.' } },

  // ------------------------------------------------------------- 18+ deck ---
  { id: 'rs1', adult: true, intensity: 'wild', text: { en: 'Take a shot, or remove one item of clothing.', fr: 'Cul sec, ou enlève un vêtement.' } },
  { id: 'rs2', adult: true, intensity: 'wild', text: { en: 'Whisper something you find attractive about the person on your left.', fr: 'Chuchote à ton voisin de gauche ce que tu trouves attirant chez lui/elle.' } },
  { id: 'rs3', adult: true, intensity: 'wild', text: { en: 'Answer one question about your love life, or take two shots.', fr: 'Réponds à une question sur ta vie amoureuse, ou deux culs secs.' } },
  { id: 'rs4', adult: true, intensity: 'wild', text: { en: 'Read out your last flirty message, or drink six.', fr: 'Lis ton dernier message de drague, ou bois six gorgées.' } },
];
