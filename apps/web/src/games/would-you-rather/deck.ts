import type { Intensity, LocalizedText } from '@piccolo/shared';

/** Two options, both bad. The whole game is the argument in between. */
export interface Dilemma {
  id: string;
  adult: boolean;
  intensity: Intensity;
  a: LocalizedText;
  b: LocalizedText;
}

export const DILEMMAS: Dilemma[] = [
  { id: 'w1', adult: false, intensity: 'chill', a: { en: 'Never drink coffee again', fr: 'Ne plus jamais boire de café' }, b: { en: 'Never drink alcohol again', fr: 'Ne plus jamais boire d’alcool' } },
  { id: 'w2', adult: false, intensity: 'chill', a: { en: 'Always be 20 minutes late', fr: 'Être toujours en retard de 20 minutes' }, b: { en: 'Always be an hour early', fr: 'Être toujours en avance d’une heure' } },
  { id: 'w3', adult: false, intensity: 'chill', a: { en: 'Lose all your photos', fr: 'Perdre toutes tes photos' }, b: { en: 'Lose all your music', fr: 'Perdre toute ta musique' } },
  { id: 'w4', adult: false, intensity: 'chill', a: { en: 'Live without a phone for a year', fr: 'Vivre un an sans téléphone' }, b: { en: 'Live without hot water for a year', fr: 'Vivre un an sans eau chaude' } },
  { id: 'w5', adult: false, intensity: 'chill', a: { en: 'Only ever whisper', fr: 'Ne pouvoir que chuchoter' }, b: { en: 'Only ever shout', fr: 'Ne pouvoir que crier' } },
  { id: 'w6', adult: false, intensity: 'chill', a: { en: 'Be fluent in every language', fr: 'Parler toutes les langues' }, b: { en: 'Be able to play every instrument', fr: 'Jouer de tous les instruments' } },
  { id: 'w7', adult: false, intensity: 'chill', a: { en: 'Have no sense of taste', fr: 'Perdre le goût' }, b: { en: 'Have no sense of smell', fr: 'Perdre l’odorat' } },
  { id: 'w8', adult: false, intensity: 'chill', a: { en: 'Work four long days', fr: 'Travailler quatre longues journées' }, b: { en: 'Work six short ones', fr: 'Travailler six courtes journées' } },
  { id: 'w9', adult: false, intensity: 'chill', a: { en: 'Always be slightly too hot', fr: 'Avoir toujours un peu trop chaud' }, b: { en: 'Always be slightly too cold', fr: 'Avoir toujours un peu trop froid' } },
  { id: 'w10', adult: false, intensity: 'chill', a: { en: 'Read minds but never turn it off', fr: 'Lire les pensées sans pouvoir arrêter' }, b: { en: 'Be invisible but never turn it off', fr: 'Être invisible sans pouvoir arrêter' } },
  { id: 'w11', adult: false, intensity: 'chill', a: { en: 'Eat only sweet food forever', fr: 'Ne manger que du sucré à vie' }, b: { en: 'Eat only salty food forever', fr: 'Ne manger que du salé à vie' } },
  { id: 'w12', adult: false, intensity: 'chill', a: { en: 'Live in a city you hate with people you love', fr: 'Vivre dans une ville que tu détestes avec des gens que tu aimes' }, b: { en: 'Live in a city you love, alone', fr: 'Vivre seul dans une ville que tu adores' } },
  { id: 'w13', adult: false, intensity: 'chill', a: { en: 'Know when you will die', fr: 'Savoir quand tu vas mourir' }, b: { en: 'Know how you will die', fr: 'Savoir comment tu vas mourir' } },
  { id: 'w14', adult: false, intensity: 'chill', a: { en: 'Never watch a film twice', fr: 'Ne jamais revoir un film' }, b: { en: 'Only ever watch one film again', fr: 'Ne revoir qu’un seul film à vie' } },
  { id: 'w15', adult: false, intensity: 'chill', a: { en: 'Have unlimited money but no free time', fr: 'Argent illimité mais aucun temps libre' }, b: { en: 'Unlimited free time but just enough money', fr: 'Temps libre illimité mais juste assez d’argent' } },
  { id: 'w16', adult: false, intensity: 'party', a: { en: 'Sing karaoke sober in front of strangers', fr: 'Chanter un karaoké sobre devant des inconnus' }, b: { en: 'Give a speech at a wedding with no notes', fr: 'Improviser un discours à un mariage' } },
  { id: 'w17', adult: false, intensity: 'party', a: { en: 'Have every text you sent read out loud', fr: 'Que tous tes SMS soient lus à voix haute' }, b: { en: 'Have every photo on your phone shown', fr: 'Que toutes tes photos soient montrées' } },
  { id: 'w18', adult: false, intensity: 'party', a: { en: 'Be the drunkest person at the party', fr: 'Être le plus bourré de la soirée' }, b: { en: 'Be the only sober one', fr: 'Être le seul sobre' } },
  { id: 'w19', adult: false, intensity: 'party', a: { en: 'Wear the same outfit for a year', fr: 'Porter la même tenue pendant un an' }, b: { en: 'Have a new haircut chosen for you every week', fr: 'Te faire choisir une nouvelle coupe chaque semaine' } },
  { id: 'w20', adult: false, intensity: 'party', a: { en: 'Never dance again', fr: 'Ne plus jamais danser' }, b: { en: 'Have to dance every time you hear music', fr: 'Devoir danser dès que tu entends de la musique' } },
  { id: 'w21', adult: false, intensity: 'party', a: { en: 'Always tell the truth', fr: 'Toujours dire la vérité' }, b: { en: 'Never be believed again', fr: 'Ne plus jamais être cru' } },
  { id: 'w22', adult: false, intensity: 'party', a: { en: 'Spend a night in jail for something you did not do', fr: 'Passer une nuit en cellule pour rien' }, b: { en: 'Spend a week explaining something you did do', fr: 'Passer une semaine à t’expliquer sur un truc que tu as fait' } },
  { id: 'w23', adult: false, intensity: 'party', a: { en: 'Have your search history public', fr: 'Que ton historique de recherche soit public' }, b: { en: 'Have your bank statement public', fr: 'Que ton relevé bancaire soit public' } },
  { id: 'w24', adult: false, intensity: 'party', a: { en: 'Be famous for something embarrassing', fr: 'Être célèbre pour un truc gênant' }, b: { en: 'Be forgotten by everyone you know', fr: 'Être oublié par tous ceux que tu connais' } },
  { id: 'w25', adult: false, intensity: 'party', a: { en: 'Lose a bet and shave your head', fr: 'Perdre un pari et te raser la tête' }, b: { en: 'Lose a bet and get a random tattoo', fr: 'Perdre un pari et te faire tatouer au hasard' } },
  { id: 'w26', adult: false, intensity: 'party', a: { en: 'Fight one person your size', fr: 'Te battre contre une personne de ta taille' }, b: { en: 'Fight five children', fr: 'Te battre contre cinq enfants' } },
  { id: 'w27', adult: false, intensity: 'party', a: { en: 'Have everyone here rate your outfits forever', fr: 'Que tout le monde ici note tes tenues à vie' }, b: { en: 'Have everyone here rate your dates forever', fr: 'Que tout le monde ici note tes rendez-vous à vie' } },
  { id: 'w28', adult: false, intensity: 'party', a: { en: 'Never post online again', fr: 'Ne plus jamais rien poster' }, b: { en: 'Have to post every single day', fr: 'Devoir poster tous les jours' } },
  { id: 'w29', adult: false, intensity: 'party', a: { en: 'Get stuck in a lift with your boss for six hours', fr: 'Rester bloqué six heures dans un ascenseur avec ton patron' }, b: { en: 'Get stuck in a lift with your ex for two', fr: 'Rester bloqué deux heures dans un ascenseur avec ton ex' } },
  { id: 'w30', adult: false, intensity: 'party', a: { en: 'Have hiccups for a year', fr: 'Avoir le hoquet pendant un an' }, b: { en: 'Sneeze every five minutes for a month', fr: 'Éternuer toutes les cinq minutes pendant un mois' } },
  { id: 'w31', adult: false, intensity: 'party', a: { en: 'Be the funniest person nobody takes seriously', fr: 'Être le plus drôle mais que personne ne prend au sérieux' }, b: { en: 'Be the smartest person nobody finds fun', fr: 'Être le plus intelligent mais que personne ne trouve drôle' } },
  { id: 'w32', adult: false, intensity: 'party', a: { en: 'Pay for everyone tonight', fr: 'Payer pour tout le monde ce soir' }, b: { en: 'Be driven home by the drunkest person here', fr: 'Te faire ramener par le plus bourré ici' } },
  { id: 'w33', adult: false, intensity: 'wild', a: { en: 'Tell your best friend one brutal truth', fr: 'Dire une vérité brutale à ton meilleur ami' }, b: { en: 'Hear one brutal truth about yourself', fr: 'Entendre une vérité brutale sur toi' } },
  { id: 'w34', adult: false, intensity: 'wild', a: { en: 'Have everyone here know your worst secret', fr: 'Que tout le monde ici connaisse ton pire secret' }, b: { en: 'Know everyone else’s and never say it', fr: 'Connaître tous les leurs sans jamais rien dire' } },
  { id: 'w35', adult: false, intensity: 'wild', a: { en: 'Lose your closest friend', fr: 'Perdre ton ami le plus proche' }, b: { en: 'Lose every other friend you have', fr: 'Perdre tous tes autres amis' } },
  { id: 'w36', adult: false, intensity: 'wild', a: { en: 'Relive your worst year', fr: 'Revivre ta pire année' }, b: { en: 'Forget your best one', fr: 'Oublier ta meilleure' } },
  { id: 'w37', adult: false, intensity: 'wild', a: { en: 'Be cheated on and never know', fr: 'Être trompé sans jamais le savoir' }, b: { en: 'Be told about it by everyone', fr: 'L’apprendre de la bouche de tout le monde' } },
  { id: 'w38', adult: false, intensity: 'wild', a: { en: 'Read every message ever sent about you', fr: 'Lire tous les messages jamais écrits sur toi' }, b: { en: 'Never wonder about it again', fr: 'Ne plus jamais te poser la question' } },
  { id: 'w39', adult: false, intensity: 'wild', a: { en: 'Say what you think for 24 hours', fr: 'Dire ce que tu penses pendant 24 heures' }, b: { en: 'Say nothing at all for a week', fr: 'Ne rien dire pendant une semaine' } },
  { id: 'w40', adult: false, intensity: 'wild', a: { en: 'Have your parents watch a film of your twenties', fr: 'Que tes parents voient le film de tes vingt ans' }, b: { en: 'Have your future kids watch it', fr: 'Que tes futurs enfants le voient' } },
  { id: 'w41', adult: false, intensity: 'chill', a: { en: 'Teleport anywhere but only once a year', fr: 'Te téléporter partout mais une fois par an' }, b: { en: 'Fly, but only at walking speed', fr: 'Voler, mais à la vitesse de la marche' } },
  { id: 'w42', adult: false, intensity: 'chill', a: { en: 'Have a personal chef', fr: 'Avoir un chef personnel' }, b: { en: 'Have a personal driver', fr: 'Avoir un chauffeur personnel' } },
  { id: 'w43', adult: false, intensity: 'chill', a: { en: 'Never wait in a queue again', fr: 'Ne plus jamais faire la queue' }, b: { en: 'Never sit in traffic again', fr: 'Ne plus jamais être dans les bouchons' } },
  { id: 'w44', adult: false, intensity: 'party', a: { en: 'Have your night narrated out loud by a stranger', fr: 'Que ta soirée soit commentée à voix haute par un inconnu' }, b: { en: 'Have it filmed and posted', fr: 'Qu’elle soit filmée et publiée' } },
  { id: 'w45', adult: false, intensity: 'party', a: { en: 'Only ever drink warm beer', fr: 'Ne boire que de la bière tiède' }, b: { en: 'Only ever drink cheap wine', fr: 'Ne boire que du vin bas de gamme' } },
  { id: 'w46', adult: false, intensity: 'party', a: { en: 'Lose your keys every week', fr: 'Perdre tes clés chaque semaine' }, b: { en: 'Lose your phone once a month', fr: 'Perdre ton téléphone une fois par mois' } },
  { id: 'w47', adult: false, intensity: 'party', a: { en: 'Be the group’s therapist forever', fr: 'Être le psy du groupe à vie' }, b: { en: 'Be the group’s problem forever', fr: 'Être le problème du groupe à vie' } },
  { id: 'w48', adult: false, intensity: 'wild', a: { en: 'Give up your phone or the group reads it out', fr: 'Rendre ton téléphone ou le groupe le lit à voix haute' }, b: { en: 'Answer any one question honestly', fr: 'Répondre honnêtement à une seule question' } },
  { id: 'w49', adult: false, intensity: 'wild', a: { en: 'Start again from zero in a new country', fr: 'Repartir de zéro dans un nouveau pays' }, b: { en: 'Stay exactly where you are forever', fr: 'Rester exactement où tu es pour toujours' } },
  { id: 'w50', adult: false, intensity: 'wild', a: { en: 'Be loved by everyone and trusted by nobody', fr: 'Être aimé de tous et cru par personne' }, b: { en: 'Be trusted by everyone and loved by nobody', fr: 'Être cru par tous et aimé par personne' } },

  // ------------------------------------------------------------- 18+ deck ---
  { id: 'ws1', adult: true, intensity: 'wild', a: { en: 'Never kiss again', fr: 'Ne plus jamais embrasser' }, b: { en: 'Never sleep with anyone again', fr: 'Ne plus jamais coucher avec personne' } },
  { id: 'ws2', adult: true, intensity: 'wild', a: { en: 'Have your last date rate you publicly', fr: 'Que ton dernier date te note publiquement' }, b: { en: 'Rate all of your exes out loud right now', fr: 'Noter tous tes ex à voix haute maintenant' } },
  { id: 'ws3', adult: true, intensity: 'wild', a: { en: 'Have your number of partners announced', fr: 'Que ton nombre de partenaires soit annoncé' }, b: { en: 'Have your worst hookup described in detail', fr: 'Que ton pire coup soit raconté en détail' } },
  { id: 'ws4', adult: true, intensity: 'wild', a: { en: 'Sleep with an ex one more time', fr: 'Recoucher une fois avec un ex' }, b: { en: 'Never see any of them again', fr: 'Ne plus jamais revoir aucun d’eux' } },
  { id: 'ws5', adult: true, intensity: 'wild', a: { en: 'Be walked in on by your parents', fr: 'Être surpris par tes parents' }, b: { en: 'Walk in on them', fr: 'Les surprendre' } },
  { id: 'ws6', adult: true, intensity: 'wild', a: { en: 'Have every flirt you sent read out here', fr: 'Que tous tes messages de drague soient lus ici' }, b: { en: 'Have everyone here guess who they were to', fr: 'Que tout le monde devine à qui ils étaient destinés' } },
  { id: 'ws7', adult: true, intensity: 'wild', a: { en: 'Kiss the person to your left', fr: 'Embrasser la personne à ta gauche' }, b: { en: 'Let the table pick who you kiss', fr: 'Laisser la table choisir qui tu embrasses' } },
  { id: 'ws8', adult: true, intensity: 'wild', a: { en: 'Confess your biggest fantasy out loud', fr: 'Avouer ton plus gros fantasme à voix haute' }, b: { en: 'Have the group invent one for you', fr: 'Laisser le groupe t’en inventer un' } },
  { id: 'ws9', adult: true, intensity: 'wild', a: { en: 'Only ever hook up with strangers', fr: 'Ne coucher qu’avec des inconnus' }, b: { en: 'Only ever hook up with friends', fr: 'Ne coucher qu’avec des amis' } },
  { id: 'ws10', adult: true, intensity: 'wild', a: { en: 'Have someone here describe your type', fr: 'Que quelqu’un ici décrive ton type' }, b: { en: 'Describe the type of everyone here', fr: 'Décrire le type de tout le monde ici' } },
];
