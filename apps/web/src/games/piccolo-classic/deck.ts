import type { Intensity, LocalizedText } from '@piccolo/shared';

/**
 * What the table has to do with a card. The kind drives the icon, the colour
 * and — for `rule` — whether the card sticks around after it is turned over.
 */
export type ClassicKind =
  | 'sip' // you drink
  | 'give' // you hand sips out
  | 'challenge' // do something, now
  | 'rule' // stays in play for the rest of the night
  | 'vote' // everyone points at once
  | 'duel' // two players, one loser
  | 'group' // everybody at the same time
  | 'never'; // confess or drink

export interface ClassicCard {
  id: string;
  kind: ClassicKind;
  adult: boolean;
  intensity: Intensity;
  /** `{player}`, `{player2}` are filled with names from the party. */
  text: LocalizedText;
}

export const CLASSIC_DECK: ClassicCard[] = [
  // ------------------------------------------------------------------- sip ---
  { id: 'c1', kind: 'sip', adult: false, intensity: 'chill', text: { en: '{player}, you look far too sober. Two sips.', fr: '{player}, tu as l’air bien trop sobre. Deux gorgées.' } },
  { id: 'c2', kind: 'sip', adult: false, intensity: 'chill', text: { en: 'Everyone wearing something black drinks one.', fr: 'Tous ceux qui portent du noir boivent une gorgée.' } },
  { id: 'c3', kind: 'sip', adult: false, intensity: 'chill', text: { en: 'Youngest at the table drinks two. Age has privileges.', fr: 'Le plus jeune de la table boit deux gorgées. L’âge a ses privilèges.' } },
  { id: 'c4', kind: 'sip', adult: false, intensity: 'chill', text: { en: 'Anyone who checked their phone in the last minute drinks.', fr: 'Quiconque a regardé son téléphone dans la dernière minute boit.' } },
  { id: 'c5', kind: 'sip', adult: false, intensity: 'party', text: { en: '{player}, drink for every letter in your first name. Sorry, Alexandra.', fr: '{player}, une gorgée par lettre de ton prénom. Désolé, Alexandra.' } },
  { id: 'c6', kind: 'sip', adult: false, intensity: 'party', text: { en: 'Last person to arrive tonight drinks three.', fr: 'Le dernier arrivé ce soir boit trois gorgées.' } },
  { id: 'c7', kind: 'sip', adult: false, intensity: 'party', text: { en: 'Anyone who has been in love this year drinks two.', fr: 'Quiconque a été amoureux cette année boit deux gorgées.' } },
  { id: 'c8', kind: 'sip', adult: false, intensity: 'wild', text: { en: '{player} and {player2} drink together. You know why.', fr: '{player} et {player2} boivent ensemble. Vous savez pourquoi.' } },
  { id: 'c9', kind: 'sip', adult: false, intensity: 'wild', text: { en: 'Everyone who has ever been dumped drinks. Take your time.', fr: 'Tous ceux qui se sont déjà fait larguer boivent. Prends ton temps.' } },
  { id: 'c10', kind: 'sip', adult: false, intensity: 'party', text: { en: 'Drink if you are the reason this party is happening.', fr: 'Bois si c’est grâce à toi que cette soirée existe.' } },

  // ------------------------------------------------------------------ give ---
  { id: 'c11', kind: 'give', adult: false, intensity: 'chill', text: { en: '{player}, hand out two sips however you like.', fr: '{player}, distribue deux gorgées comme tu veux.' } },
  { id: 'c12', kind: 'give', adult: false, intensity: 'chill', text: { en: '{player}, give three sips to the funniest person here.', fr: '{player}, donne trois gorgées au plus drôle ici.' } },
  { id: 'c13', kind: 'give', adult: false, intensity: 'party', text: { en: '{player}, pick someone to drink double for the next three cards.', fr: '{player}, choisis qui boira double pendant les trois prochaines cartes.' } },
  { id: 'c14', kind: 'give', adult: false, intensity: 'party', text: { en: '{player}, give four sips to whoever you trust the least.', fr: '{player}, donne quatre gorgées à celui en qui tu as le moins confiance.' } },
  { id: 'c15', kind: 'give', adult: false, intensity: 'party', text: { en: 'Split five sips between two people. {player} decides.', fr: 'Répartis cinq gorgées entre deux personnes. {player} décide.' } },
  { id: 'c16', kind: 'give', adult: false, intensity: 'wild', text: { en: '{player}, name the person you would least like to be judged by. They drink four.', fr: '{player}, nomme celui par qui tu voudrais le moins être jugé. Il boit quatre.' } },
  { id: 'c17', kind: 'give', adult: false, intensity: 'chill', text: { en: 'The person to your left drinks. {player}, that is your neighbour, not mine.', fr: 'Celui à ta gauche boit. {player}, c’est ton voisin, pas le mien.' } },

  // ------------------------------------------------------------- challenge ---
  { id: 'c18', kind: 'challenge', adult: false, intensity: 'chill', text: { en: '{player}, do your best impression of someone at this table. If nobody guesses, drink three.', fr: '{player}, imite quelqu’un à cette table. Si personne ne devine, bois trois gorgées.' } },
  { id: 'c19', kind: 'challenge', adult: false, intensity: 'chill', text: { en: '{player}, name five countries in ten seconds or drink three.', fr: '{player}, cite cinq pays en dix secondes ou bois trois gorgées.' } },
  { id: 'c20', kind: 'challenge', adult: false, intensity: 'chill', text: { en: '{player}, tell a story about {player2} — the group decides if it is true.', fr: '{player}, raconte une histoire sur {player2} — le groupe décide si c’est vrai.' } },
  { id: 'c21', kind: 'challenge', adult: false, intensity: 'chill', text: { en: '{player}, speak in an accent until your next turn or drink two.', fr: '{player}, parle avec un accent jusqu’à ton prochain tour ou bois deux gorgées.' } },
  { id: 'c22', kind: 'challenge', adult: false, intensity: 'party', text: { en: '{player}, show the last photo in your camera roll. Refuse and drink four.', fr: '{player}, montre la dernière photo de ta galerie. Refuse et bois quatre gorgées.' } },
  { id: 'c23', kind: 'challenge', adult: false, intensity: 'party', text: { en: '{player}, read out your last message out loud. Or drink four.', fr: '{player}, lis ton dernier message à voix haute. Ou bois quatre gorgées.' } },
  { id: 'c24', kind: 'challenge', adult: false, intensity: 'party', text: { en: '{player}, compliment {player2} until they blush. Fail and drink two.', fr: '{player}, complimente {player2} jusqu’à ce qu’il rougisse. Échoue et bois deux gorgées.' } },
  { id: 'c25', kind: 'challenge', adult: false, intensity: 'party', text: { en: '{player}, hold a plank until three people have drunk.', fr: '{player}, tiens la planche jusqu’à ce que trois personnes aient bu.' } },
  { id: 'c26', kind: 'challenge', adult: false, intensity: 'party', text: { en: '{player}, sing the chorus of the last song you listened to.', fr: '{player}, chante le refrain de la dernière chanson que tu as écoutée.' } },
  { id: 'c27', kind: 'challenge', adult: false, intensity: 'party', text: { en: '{player}, call the fifth contact in your phone and stay on for ten seconds. Or drink five.', fr: '{player}, appelle le cinquième contact de ton téléphone et tiens dix secondes. Ou bois cinq gorgées.' } },
  { id: 'c28', kind: 'challenge', adult: false, intensity: 'party', text: { en: '{player}, swap an item of clothing with {player2}.', fr: '{player}, échange un vêtement avec {player2}.' } },
  { id: 'c29', kind: 'challenge', adult: false, intensity: 'wild', text: { en: '{player}, let {player2} post anything they like on your story. Or drink six.', fr: '{player}, laisse {player2} poster ce qu’il veut sur ta story. Ou bois six gorgées.' } },
  { id: 'c30', kind: 'challenge', adult: false, intensity: 'wild', text: { en: '{player}, confess something nobody here knows or drink five.', fr: '{player}, avoue un truc que personne ici ne sait ou bois cinq gorgées.' } },
  { id: 'c31', kind: 'challenge', adult: false, intensity: 'wild', text: { en: '{player}, hand your unlocked phone to {player2} for thirty seconds. Or drink six.', fr: '{player}, donne ton téléphone déverrouillé à {player2} pendant trente secondes. Ou bois six gorgées.' } },
  { id: 'c32', kind: 'challenge', adult: false, intensity: 'wild', text: { en: '{player}, say one honest thing about everyone at this table.', fr: '{player}, dis une chose honnête sur chaque personne de cette table.' } },
  { id: 'c33', kind: 'challenge', adult: false, intensity: 'chill', text: { en: '{player}, keep a straight face while the table tries to break you. Ten seconds.', fr: '{player}, garde ton sérieux pendant que la table essaie de te faire craquer. Dix secondes.' } },

  // ------------------------------------------------------------------ rule ---
  { id: 'c34', kind: 'rule', adult: false, intensity: 'chill', text: { en: 'No first names. Say one and drink.', fr: 'Interdit de dire un prénom. Si tu le fais, tu bois.' } },
  { id: 'c35', kind: 'rule', adult: false, intensity: 'chill', text: { en: 'Drink with your non-dominant hand only.', fr: 'On boit uniquement de la main non dominante.' } },
  { id: 'c36', kind: 'rule', adult: false, intensity: 'chill', text: { en: 'No pointing. Use your elbows.', fr: 'Interdit de pointer du doigt. Utilise tes coudes.' } },
  { id: 'c37', kind: 'rule', adult: false, intensity: 'chill', text: { en: 'Nobody says "drink". Say it and you do.', fr: 'Personne ne dit « bois ». Si tu le dis, tu bois.' } },
  { id: 'c38', kind: 'rule', adult: false, intensity: 'party', text: { en: '{player} is the Judge. Their word settles every argument.', fr: '{player} est le Juge. Sa parole tranche tous les débats.' } },
  { id: 'c39', kind: 'rule', adult: false, intensity: 'party', text: { en: 'Every time someone laughs, they drink one. Yes, really.', fr: 'Chaque fois que quelqu’un rit, il boit une gorgée. Oui, vraiment.' } },
  { id: 'c40', kind: 'rule', adult: false, intensity: 'party', text: { en: 'Phones face down on the table. Touch yours and drink two.', fr: 'Téléphones face contre table. Touche le tien et bois deux gorgées.' } },
  { id: 'c41', kind: 'rule', adult: false, intensity: 'party', text: { en: '{player} invents a rule right now. It lasts all night.', fr: '{player} invente une règle maintenant. Elle tient toute la soirée.' } },
  { id: 'c42', kind: 'rule', adult: false, intensity: 'party', text: { en: 'Nobody swears. Every slip costs a sip.', fr: 'Interdit de jurer. Chaque écart coûte une gorgée.' } },
  { id: 'c43', kind: 'rule', adult: false, intensity: 'party', text: { en: 'Answer every question with a question until this rule is lifted.', fr: 'Réponds à toute question par une question jusqu’à la levée de cette règle.' } },
  { id: 'c44', kind: 'rule', adult: false, intensity: 'wild', text: { en: '{player} and {player2} are drinking buddies: when one drinks, both drink.', fr: '{player} et {player2} sont liés : quand l’un boit, l’autre boit.' } },
  { id: 'c45', kind: 'rule', adult: false, intensity: 'wild', text: { en: 'Nobody leaves the table without asking the group. Two sips if you do.', fr: 'Personne ne quitte la table sans demander au groupe. Deux gorgées sinon.' } },
  { id: 'c46', kind: 'rule', adult: false, intensity: 'chill', text: { en: 'Lift one rule of your choice. {player} picks.', fr: 'Lève une règle de ton choix. {player} décide.' } },

  // ------------------------------------------------------------------ vote ---
  { id: 'c47', kind: 'vote', adult: false, intensity: 'chill', text: { en: 'Point at whoever is most likely to fall asleep first. They drink two.', fr: 'Pointez celui qui s’endormira le premier. Il boit deux gorgées.' } },
  { id: 'c48', kind: 'vote', adult: false, intensity: 'chill', text: { en: 'Point at the best dressed. Everyone else drinks one.', fr: 'Pointez le mieux habillé. Tous les autres boivent une gorgée.' } },
  { id: 'c49', kind: 'vote', adult: false, intensity: 'party', text: { en: 'Point at the biggest liar in the room. They drink three.', fr: 'Pointez le plus gros menteur de la pièce. Il boit trois gorgées.' } },
  { id: 'c50', kind: 'vote', adult: false, intensity: 'party', text: { en: 'Point at whoever will regret tonight the most. Three sips for them.', fr: 'Pointez celui qui regrettera le plus cette soirée. Trois gorgées pour lui.' } },
  { id: 'c51', kind: 'vote', adult: false, intensity: 'party', text: { en: 'Point at the worst driver. They drink, then hand over their keys.', fr: 'Pointez le plus mauvais conducteur. Il boit, puis il rend ses clés.' } },
  { id: 'c52', kind: 'vote', adult: false, intensity: 'party', text: { en: 'Point at whoever has the messiest room. Two sips.', fr: 'Pointez celui qui a la chambre la plus en bordel. Deux gorgées.' } },
  { id: 'c53', kind: 'vote', adult: false, intensity: 'wild', text: { en: 'Point at whoever is hiding something tonight. They drink four or explain.', fr: 'Pointez celui qui cache quelque chose ce soir. Il boit quatre gorgées ou il explique.' } },
  { id: 'c54', kind: 'vote', adult: false, intensity: 'wild', text: { en: 'Point at the person you would call in a real emergency. Everyone else drinks two.', fr: 'Pointez la personne que vous appelleriez en vraie urgence. Tous les autres boivent deux gorgées.' } },
  { id: 'c55', kind: 'vote', adult: false, intensity: 'wild', text: { en: 'Point at whoever has the best story they have never told. They tell it or drink five.', fr: 'Pointez celui qui a la meilleure histoire jamais racontée. Il la raconte ou boit cinq gorgées.' } },

  // ------------------------------------------------------------------ duel ---
  { id: 'c56', kind: 'duel', adult: false, intensity: 'chill', text: { en: '{player} vs {player2}: staring contest. Loser drinks three.', fr: '{player} contre {player2} : concours de regard. Le perdant boit trois gorgées.' } },
  { id: 'c57', kind: 'duel', adult: false, intensity: 'chill', text: { en: '{player} vs {player2}: name football teams until one blanks.', fr: '{player} contre {player2} : citez des clubs de foot jusqu’à ce que l’un sèche.' } },
  { id: 'c58', kind: 'duel', adult: false, intensity: 'party', text: { en: '{player} vs {player2}: rock paper scissors, best of three. Loser drinks four.', fr: '{player} contre {player2} : pierre feuille ciseaux, au meilleur des trois. Le perdant boit quatre gorgées.' } },
  { id: 'c59', kind: 'duel', adult: false, intensity: 'party', text: { en: '{player} vs {player2}: arm wrestle. Loser drinks four.', fr: '{player} contre {player2} : bras de fer. Le perdant boit quatre gorgées.' } },
  { id: 'c60', kind: 'duel', adult: false, intensity: 'party', text: { en: '{player} vs {player2}: whoever the table finds funnier wins. Loser drinks three.', fr: '{player} contre {player2} : celui que la table trouve le plus drôle gagne. Le perdant boit trois gorgées.' } },
  { id: 'c61', kind: 'duel', adult: false, intensity: 'party', text: { en: '{player} vs {player2}: first to make the other laugh wins.', fr: '{player} contre {player2} : le premier à faire rire l’autre gagne.' } },
  { id: 'c62', kind: 'duel', adult: false, intensity: 'wild', text: { en: '{player} vs {player2}: reveal the worse secret. The table judges. Loser drinks five.', fr: '{player} contre {player2} : révélez le pire secret. La table juge. Le perdant boit cinq gorgées.' } },
  { id: 'c63', kind: 'duel', adult: false, intensity: 'wild', text: { en: '{player} vs {player2}: whoever has done the wilder thing wins. Loser drinks four.', fr: '{player} contre {player2} : celui qui a fait le truc le plus fou gagne. Le perdant boit quatre gorgées.' } },

  // ----------------------------------------------------------------- group ---
  { id: 'c64', kind: 'group', adult: false, intensity: 'chill', text: { en: 'Waterfall. {player} starts, nobody stops before them.', fr: 'Cascade. {player} commence, personne ne s’arrête avant lui.' } },
  { id: 'c65', kind: 'group', adult: false, intensity: 'chill', text: { en: 'Last person to raise a hand drinks two.', fr: 'Le dernier à lever la main boit deux gorgées.' } },
  { id: 'c66', kind: 'group', adult: false, intensity: 'chill', text: { en: 'Everyone toast something real. Anyone who cannot think of anything drinks three.', fr: 'Chacun porte un vrai toast. Celui qui ne trouve rien boit trois gorgées.' } },
  { id: 'c67', kind: 'group', adult: false, intensity: 'party', text: { en: 'Everyone name a category out loud in turn. First to repeat or blank drinks three.', fr: 'Chacun cite un mot du thème à son tour. Le premier qui répète ou sèche boit trois gorgées.' } },
  { id: 'c68', kind: 'group', adult: false, intensity: 'party', text: { en: 'Everyone stand up. Last one standing gets to hand out five sips.', fr: 'Tout le monde debout. Le dernier debout distribue cinq gorgées.' } },
  { id: 'c69', kind: 'group', adult: false, intensity: 'party', text: { en: 'Everyone say a number between one and ten at the same time. Matching pairs drink.', fr: 'Tout le monde dit un chiffre entre un et dix en même temps. Les doublons boivent.' } },
  { id: 'c70', kind: 'group', adult: false, intensity: 'party', text: { en: 'Everyone reveal the last thing they searched for. Refusals drink four.', fr: 'Chacun montre sa dernière recherche. Ceux qui refusent boivent quatre gorgées.' } },
  { id: 'c71', kind: 'group', adult: false, intensity: 'wild', text: { en: 'Everyone confess one thing they did tonight and hoped nobody noticed.', fr: 'Chacun avoue une chose faite ce soir en espérant que personne ne l’a vue.' } },
  { id: 'c72', kind: 'group', adult: false, intensity: 'wild', text: { en: 'Everyone drink for every ex they still have a photo of.', fr: 'Chacun boit pour chaque ex dont il garde une photo.' } },
  { id: 'c73', kind: 'group', adult: false, intensity: 'party', text: { en: 'Everybody swap seats. Last to move drinks three.', fr: 'Tout le monde change de place. Le dernier à bouger boit trois gorgées.' } },

  // ----------------------------------------------------------------- never ---
  { id: 'c74', kind: 'never', adult: false, intensity: 'chill', text: { en: 'Drink if you have ever pretended to be busy to avoid someone here.', fr: 'Bois si tu as déjà fait semblant d’être occupé pour éviter quelqu’un ici.' } },
  { id: 'c75', kind: 'never', adult: false, intensity: 'chill', text: { en: 'Drink if you have ever cried at a film in the cinema.', fr: 'Bois si tu as déjà pleuré au cinéma.' } },
  { id: 'c76', kind: 'never', adult: false, intensity: 'party', text: { en: 'Drink if you have ever been thrown out of anywhere.', fr: 'Bois si tu t’es déjà fait sortir d’un endroit.' } },
  { id: 'c77', kind: 'never', adult: false, intensity: 'party', text: { en: 'Drink if you have ever texted the wrong person something you should not have.', fr: 'Bois si tu as déjà envoyé un message très gênant à la mauvaise personne.' } },
  { id: 'c78', kind: 'never', adult: false, intensity: 'party', text: { en: 'Drink if you have ever lied to get out of a night out.', fr: 'Bois si tu as déjà menti pour éviter une soirée.' } },
  { id: 'c79', kind: 'never', adult: false, intensity: 'wild', text: { en: 'Drink if you have kissed someone in this room.', fr: 'Bois si tu as embrassé quelqu’un dans cette pièce.' } },
  { id: 'c80', kind: 'never', adult: false, intensity: 'wild', text: { en: 'Drink if you have ever kept a secret that would change everything here.', fr: 'Bois si tu gardes un secret qui changerait tout ici.' } },
  { id: 'c81', kind: 'never', adult: false, intensity: 'wild', text: { en: 'Drink if you have lied at least once tonight.', fr: 'Bois si tu as menti au moins une fois ce soir.' } },

  // ------------------------------------------------------------- 18+ cards ---
  { id: 'cs1', kind: 'sip', adult: true, intensity: 'wild', text: { en: 'Drink one for every person you have kissed this year.', fr: 'Une gorgée par personne embrassée cette année.' } },
  { id: 'cs2', kind: 'sip', adult: true, intensity: 'wild', text: { en: 'Anyone who has sent a nude drinks three.', fr: 'Quiconque a déjà envoyé un nude boit trois gorgées.' } },
  { id: 'cs3', kind: 'challenge', adult: true, intensity: 'wild', text: { en: '{player}, describe your type in detail. Anyone here who fits it drinks three.', fr: '{player}, décris ton type en détail. Toute personne ici qui correspond boit trois gorgées.' } },
  { id: 'cs4', kind: 'challenge', adult: true, intensity: 'wild', text: { en: '{player}, rate {player2} out of ten. If they disagree, you both drink four.', fr: '{player}, note {player2} sur dix. S’il n’est pas d’accord, vous buvez tous les deux quatre gorgées.' } },
  { id: 'cs5', kind: 'challenge', adult: true, intensity: 'wild', text: { en: '{player}, take off one item of clothing or drink six.', fr: '{player}, enlève un vêtement ou bois six gorgées.' } },
  { id: 'cs6', kind: 'challenge', adult: true, intensity: 'wild', text: { en: '{player}, whisper your wildest story to {player2}. They decide if the table hears it.', fr: '{player}, chuchote ton histoire la plus chaude à {player2}. Il décide si la table l’entend.' } },
  { id: 'cs7', kind: 'vote', adult: true, intensity: 'wild', text: { en: 'Point at whoever has the wildest history. They drink four or tell us.', fr: 'Pointez celui qui a le passé le plus chaud. Il boit quatre gorgées ou il raconte.' } },
  { id: 'cs8', kind: 'vote', adult: true, intensity: 'wild', text: { en: 'Point at the best kisser here, purely on instinct. They drink two.', fr: 'Pointez celui qui embrasse le mieux, à l’instinct. Il boit deux gorgées.' } },
  { id: 'cs9', kind: 'duel', adult: true, intensity: 'wild', text: { en: '{player} vs {player2}: whoever has the racier search history wins. Loser drinks five.', fr: '{player} contre {player2} : celui qui a l’historique le plus chaud gagne. Le perdant boit cinq gorgées.' } },
  { id: 'cs10', kind: 'group', adult: true, intensity: 'wild', text: { en: 'Everyone drink for every dating app on their phone right now.', fr: 'Chacun boit pour chaque appli de rencontre sur son téléphone là maintenant.' } },
  { id: 'cs11', kind: 'never', adult: true, intensity: 'wild', text: { en: 'Drink if you have hooked up with someone you met that same night.', fr: 'Bois si tu as couché avec quelqu’un rencontré le soir même.' } },
  { id: 'cs12', kind: 'never', adult: true, intensity: 'wild', text: { en: 'Drink if you have thought about someone in this room that way.', fr: 'Bois si tu as pensé à quelqu’un dans cette pièce de cette façon.' } },
  { id: 'cs13', kind: 'rule', adult: true, intensity: 'wild', text: { en: 'Every compliment has to be flirty until this rule is lifted.', fr: 'Tous les compliments doivent être aguicheurs jusqu’à la levée de cette règle.' } },
  { id: 'cs14', kind: 'sip', adult: true, intensity: 'wild', text: { en: 'Drink two if you are single. Drink three if you say it is complicated.', fr: 'Deux gorgées si tu es célibataire. Trois si tu dis que c’est compliqué.' } },
];
