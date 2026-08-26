import type { Intensity, LocalizedText } from '@piccolo/shared';
import type { Rank } from '@/games/_kit/cards';

/**
 * Three rules per rank. One set is drawn at the start of each game, so the ten
 * of clubs does not mean the same thing every single night — which is the one
 * thing that kills King's Cup after the third session.
 */
export interface KingsRule {
  id: string;
  rank: Rank;
  adult: boolean;
  intensity: Intensity;
  title: LocalizedText;
  text: LocalizedText;
}

export const KINGS_RULES: KingsRule[] = [
  // -------------------------------------------------------------------- A ---
  { id: 'a1', rank: 'A', adult: false, intensity: 'party', title: { en: 'Waterfall', fr: 'Cascade' }, text: { en: 'Everyone starts drinking at once. You may only stop once the person before you has stopped.', fr: 'Tout le monde commence à boire en même temps. Tu ne peux t’arrêter qu’une fois que celui d’avant s’est arrêté.' } },
  { id: 'a2', rank: 'A', adult: false, intensity: 'party', title: { en: 'Reverse waterfall', fr: 'Cascade inversée' }, text: { en: 'Same thing, the other way round the table. The person who drew it stops last.', fr: 'Même chose, dans l’autre sens. Celui qui a tiré la carte s’arrête en dernier.' } },
  { id: 'a3', rank: 'A', adult: false, intensity: 'wild', title: { en: 'Sniper', fr: 'Sniper' }, text: { en: 'Pick anyone. They drink four. No discussion, no appeal.', fr: 'Choisis qui tu veux. Il boit quatre. Sans discussion, sans appel.' } },

  // -------------------------------------------------------------------- 2 ---
  { id: 'b1', rank: '2', adult: false, intensity: 'chill', title: { en: 'You', fr: 'Toi' }, text: { en: 'Give two sips to whoever you like.', fr: 'Donne deux gorgées à qui tu veux.' } },
  { id: 'b2', rank: '2', adult: false, intensity: 'chill', title: { en: 'Split it', fr: 'Partage' }, text: { en: 'Give one sip each to two different people.', fr: 'Donne une gorgée à deux personnes différentes.' } },
  { id: 'b3', rank: '2', adult: false, intensity: 'party', title: { en: 'Two for two', fr: 'Deux pour deux' }, text: { en: 'Name two people. They drink two each, or take one each and answer a question from you.', fr: 'Nomme deux personnes. Elles boivent deux chacune, ou une chacune et répondent à une question de toi.' } },

  // -------------------------------------------------------------------- 3 ---
  { id: 'c1', rank: '3', adult: false, intensity: 'chill', title: { en: 'Me', fr: 'Moi' }, text: { en: 'You drink three. Bad luck.', fr: 'Tu bois trois gorgées. Pas de chance.' } },
  { id: 'c2', rank: '3', adult: false, intensity: 'chill', title: { en: 'Me, or a truth', fr: 'Moi, ou une vérité' }, text: { en: 'Drink three, or answer one honest question from the table.', fr: 'Bois trois gorgées, ou réponds honnêtement à une question de la table.' } },
  { id: 'c3', rank: '3', adult: false, intensity: 'party', title: { en: 'Me and my neighbour', fr: 'Moi et mon voisin' }, text: { en: 'You and the person on your left drink two each.', fr: 'Toi et la personne à ta gauche buvez deux gorgées chacun.' } },

  // -------------------------------------------------------------------- 4 ---
  { id: 'd1', rank: '4', adult: false, intensity: 'party', title: { en: 'Floor', fr: 'Par terre' }, text: { en: 'Everyone touches the floor. Last one down drinks two.', fr: 'Tout le monde touche le sol. Le dernier boit deux gorgées.' } },
  { id: 'd2', rank: '4', adult: false, intensity: 'party', title: { en: 'Four on the floor', fr: 'Quatre au sol' }, text: { en: 'Everyone gets four points of contact on the floor. Last one drinks three.', fr: 'Tout le monde met quatre appuis au sol. Le dernier boit trois gorgées.' } },
  { id: 'd3', rank: '4', adult: false, intensity: 'party', title: { en: 'Whores and gentlemen', fr: 'Debout, assis' }, text: { en: 'Everyone stands up, then sits down. Last of each drinks one.', fr: 'Tout le monde se lève, puis se rassoit. Le dernier des deux boit une gorgée.' } },

  // -------------------------------------------------------------------- 5 ---
  { id: 'e1', rank: '5', adult: false, intensity: 'party', title: { en: 'Thumb master', fr: 'Maître du pouce' }, text: { en: 'You are thumb master until the next 5. Put your thumb on the table whenever you like — last to copy drinks two.', fr: 'Tu es maître du pouce jusqu’au prochain 5. Pose ton pouce sur la table quand tu veux — le dernier à copier boit deux gorgées.' } },
  { id: 'e2', rank: '5', adult: false, intensity: 'party', title: { en: 'Silent master', fr: 'Maître du silence' }, text: { en: 'Whenever you go completely silent, everyone must too. Last to notice drinks two.', fr: 'Dès que tu te tais complètement, tout le monde doit se taire. Le dernier à s’en rendre compte boit deux gorgées.' } },
  { id: 'e3', rank: '5', adult: false, intensity: 'party', title: { en: 'Mirror', fr: 'Miroir' }, text: { en: 'Everything you do, the table copies until the next 5. Anyone who misses one drinks.', fr: 'Tout ce que tu fais, la table le copie jusqu’au prochain 5. Celui qui rate boit.' } },

  // -------------------------------------------------------------------- 6 ---
  { id: 'f1', rank: '6', adult: false, intensity: 'chill', title: { en: 'Categories', fr: 'Thèmes' }, text: { en: 'Name a category. Go round naming things in it. First to hesitate or repeat drinks three.', fr: 'Annonce un thème. Faites le tour en citant. Le premier qui hésite ou répète boit trois gorgées.' } },
  { id: 'f2', rank: '6', adult: false, intensity: 'chill', title: { en: 'Rhyme', fr: 'Rime' }, text: { en: 'Say a word. Everyone rhymes with it in turn. First to fail drinks three.', fr: 'Dis un mot. Chacun rime à son tour. Le premier qui sèche boit trois gorgées.' } },
  { id: 'f3', rank: '6', adult: false, intensity: 'party', title: { en: 'Never have I ever', fr: 'Je n’ai jamais' }, text: { en: 'Say something you have never done. Everyone who has drinks two.', fr: 'Dis un truc que tu n’as jamais fait. Tous ceux qui l’ont fait boivent deux gorgées.' } },

  // -------------------------------------------------------------------- 7 ---
  { id: 'g1', rank: '7', adult: false, intensity: 'party', title: { en: 'Heaven', fr: 'Ciel' }, text: { en: 'Point at the ceiling. Last one to notice drinks two.', fr: 'Pointe le plafond. Le dernier à s’en apercevoir boit deux gorgées.' } },
  { id: 'g2', rank: '7', adult: false, intensity: 'party', title: { en: 'Seven up', fr: 'Sept en haut' }, text: { en: 'Everyone raises a hand. Last one up drinks two and gives one away.', fr: 'Tout le monde lève la main. Le dernier boit deux gorgées et en donne une.' } },
  { id: 'g3', rank: '7', adult: false, intensity: 'party', title: { en: 'Lucky seven', fr: 'Sept chanceux' }, text: { en: 'Count round the table. Every multiple of seven, say nothing and clap. Slip up and drink two.', fr: 'Comptez autour de la table. À chaque multiple de sept, ne dis rien et tape dans tes mains. Erreur, deux gorgées.' } },

  // -------------------------------------------------------------------- 8 ---
  { id: 'h1', rank: '8', adult: false, intensity: 'party', title: { en: 'Mate', fr: 'Binôme' }, text: { en: 'Pick a drinking mate. From now on, when you drink they drink.', fr: 'Choisis un binôme. À partir de maintenant, quand tu bois, il boit.' } },
  { id: 'h2', rank: '8', adult: false, intensity: 'party', title: { en: 'Enemy', fr: 'Ennemi' }, text: { en: 'Pick someone. Every time they drink, they drink one extra, until the next 8.', fr: 'Choisis quelqu’un. Chaque fois qu’il boit, il boit une de plus, jusqu’au prochain 8.' } },
  { id: 'h3', rank: '8', adult: false, intensity: 'party', title: { en: 'Chain', fr: 'Chaîne' }, text: { en: 'Pick a mate. They pick a mate. All three drink together from now on.', fr: 'Choisis un binôme. Il en choisit un aussi. Vous trois buvez ensemble à partir de maintenant.' } },

  // -------------------------------------------------------------------- 9 ---
  { id: 'i1', rank: '9', adult: false, intensity: 'chill', title: { en: 'Rhyme', fr: 'Rime' }, text: { en: 'Say a word, the table rhymes in turn. First to blank drinks three.', fr: 'Dis un mot, la table rime à tour de rôle. Le premier à sécher boit trois gorgées.' } },
  { id: 'i2', rank: '9', adult: false, intensity: 'chill', title: { en: 'Song', fr: 'Chanson' }, text: { en: 'Sing a line with the word "night" in it. Anyone who cannot follow drinks three.', fr: 'Chante une ligne avec le mot « nuit » dedans. Celui qui ne peut pas suivre boit trois gorgées.' } },
  { id: 'i3', rank: '9', adult: false, intensity: 'party', title: { en: 'Bust a rhyme', fr: 'Rime à deux' }, text: { en: 'Pick someone. You two trade rhymes until one fails. The loser drinks four.', fr: 'Choisis quelqu’un. Vous échangez des rimes jusqu’à ce que l’un sèche. Le perdant boit quatre gorgées.' } },

  // ------------------------------------------------------------------- 10 ---
  { id: 'j1', rank: '10', adult: false, intensity: 'chill', title: { en: 'Categories', fr: 'Thèmes' }, text: { en: 'Pick a category and go round. Hesitation, repetition or a blank costs three.', fr: 'Choisis un thème et faites le tour. Hésitation, répétition ou trou : trois gorgées.' } },
  { id: 'j2', rank: '10', adult: false, intensity: 'party', title: { en: 'Ten fingers', fr: 'Dix doigts' }, text: { en: 'Everyone holds up ten fingers. Say something you have done — anyone who has not done it puts a finger down. All ten down and you drink four.', fr: 'Tout le monde lève dix doigts. Dis un truc que tu as fait — ceux qui ne l’ont pas fait baissent un doigt. Dix doigts baissés, quatre gorgées.' } },
  { id: 'j3', rank: '10', adult: false, intensity: 'party', title: { en: 'Group toast', fr: 'Toast collectif' }, text: { en: 'Propose a toast. Everyone who does not join in drinks three.', fr: 'Propose un toast. Tous ceux qui ne suivent pas boivent trois gorgées.' } },

  // -------------------------------------------------------------------- J ---
  { id: 'k1', rank: 'J', adult: false, intensity: 'party', title: { en: 'New rule', fr: 'Nouvelle règle' }, text: { en: 'Invent a rule. It lasts until the end of the deck. Break it and drink two.', fr: 'Invente une règle. Elle tient jusqu’à la fin du deck. Enfreins-la et bois deux gorgées.' } },
  { id: 'k2', rank: 'J', adult: false, intensity: 'party', title: { en: 'Ban a word', fr: 'Bannis un mot' }, text: { en: 'Ban any word for the rest of the game. Anyone who says it drinks two.', fr: 'Bannis un mot pour le reste de la partie. Celui qui le dit boit deux gorgées.' } },
  { id: 'k3', rank: 'J', adult: false, intensity: 'wild', title: { en: 'Lift a rule', fr: 'Lève une règle' }, text: { en: 'Cancel any rule in play. Whoever created it drinks three.', fr: 'Annule une règle en jeu. Celui qui l’a créée boit trois gorgées.' } },

  // -------------------------------------------------------------------- Q ---
  { id: 'l1', rank: 'Q', adult: false, intensity: 'party', title: { en: 'Question master', fr: 'Maître des questions' }, text: { en: 'Until the next queen, anyone who answers a question you ask drinks two.', fr: 'Jusqu’à la prochaine dame, quiconque répond à une de tes questions boit deux gorgées.' } },
  { id: 'l2', rank: 'Q', adult: false, intensity: 'party', title: { en: 'Never answer', fr: 'Ne réponds jamais' }, text: { en: 'You may not answer anything until the next queen. Slip up and drink three.', fr: 'Tu ne peux répondre à rien jusqu’à la prochaine dame. Erreur, trois gorgées.' } },
  { id: 'l3', rank: 'Q', adult: false, intensity: 'wild', title: { en: 'Interrogation', fr: 'Interrogatoire' }, text: { en: 'Ask anyone one question. They answer honestly or drink four.', fr: 'Pose une question à qui tu veux. Il répond honnêtement ou boit quatre gorgées.' } },

  // -------------------------------------------------------------------- K ---
  { id: 'm1', rank: 'K', adult: false, intensity: 'wild', title: { en: "King's cup", fr: 'Verre du roi' }, text: { en: 'Pour some of your drink into the cup in the middle. Whoever draws the fourth king drinks all of it.', fr: 'Verse un peu de ton verre dans le verre du centre. Celui qui tire le quatrième roi boit tout.' } },
  { id: 'm2', rank: 'K', adult: false, intensity: 'wild', title: { en: 'Royal decree', fr: 'Décret royal' }, text: { en: 'Pour into the cup, then hand out three sips. The fourth king still drinks it all.', fr: 'Verse dans le verre, puis distribue trois gorgées. Le quatrième roi boit quand même tout.' } },
  { id: 'm3', rank: 'K', adult: false, intensity: 'wild', title: { en: 'Tax the table', fr: 'Impôt royal' }, text: { en: 'Everyone pours a little into the cup. The fourth king empties it.', fr: 'Chacun verse un peu dans le verre. Le quatrième roi le vide.' } },
];
