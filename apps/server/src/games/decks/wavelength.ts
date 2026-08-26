import type { LocalizedText } from '@piccolo/shared';
import type { RoomCard } from '../kit.js';

export interface SpectrumCard extends RoomCard {
  left: LocalizedText;
  right: LocalizedText;
}

/**
 * Spectrums, not opposites. "Hot ↔ cold" is a bad card because everyone agrees
 * where things sit; "underrated ↔ overrated" is a good one because nobody does.
 */
export const SPECTRUMS: SpectrumCard[] = [
  { id: 'w1', adult: false, intensity: 'chill', left: { en: 'Underrated', fr: 'Sous-estimé' }, right: { en: 'Overrated', fr: 'Surestimé' } },
  { id: 'w2', adult: false, intensity: 'chill', left: { en: 'Cheap', fr: 'Cheap' }, right: { en: 'Classy', fr: 'Classe' } },
  { id: 'w3', adult: false, intensity: 'chill', left: { en: 'Useless', fr: 'Inutile' }, right: { en: 'Essential', fr: 'Indispensable' } },
  { id: 'w4', adult: false, intensity: 'chill', left: { en: 'Round', fr: 'Rond' }, right: { en: 'Pointy', fr: 'Pointu' } },
  { id: 'w5', adult: false, intensity: 'chill', left: { en: 'Forgettable', fr: 'Oubliable' }, right: { en: 'Iconic', fr: 'Iconique' } },
  { id: 'w6', adult: false, intensity: 'chill', left: { en: 'Quiet', fr: 'Silencieux' }, right: { en: 'Deafening', fr: 'Assourdissant' } },
  { id: 'w7', adult: false, intensity: 'chill', left: { en: 'Guilty pleasure', fr: 'Plaisir coupable' }, right: { en: 'Proud of it', fr: 'Assumé' } },
  { id: 'w8', adult: false, intensity: 'chill', left: { en: 'Child’s toy', fr: 'Jouet d’enfant' }, right: { en: 'Adult hobby', fr: 'Hobby d’adulte' } },
  { id: 'w9', adult: false, intensity: 'chill', left: { en: 'Snack', fr: 'Snack' }, right: { en: 'Meal', fr: 'Repas' } },
  { id: 'w10', adult: false, intensity: 'chill', left: { en: 'Fashion crime', fr: 'Faute de goût' }, right: { en: 'Timeless', fr: 'Intemporel' } },
  { id: 'w11', adult: false, intensity: 'chill', left: { en: 'Easy', fr: 'Facile' }, right: { en: 'Impossible', fr: 'Impossible' } },
  { id: 'w12', adult: false, intensity: 'chill', left: { en: 'Boring job', fr: 'Métier ennuyeux' }, right: { en: 'Dream job', fr: 'Métier de rêve' } },
  { id: 'w13', adult: false, intensity: 'chill', left: { en: 'Weekday', fr: 'Jour de semaine' }, right: { en: 'Weekend', fr: 'Week-end' } },
  { id: 'w14', adult: false, intensity: 'chill', left: { en: 'Smells bad', fr: 'Sent mauvais' }, right: { en: 'Smells amazing', fr: 'Sent divinement bon' } },
  { id: 'w15', adult: false, intensity: 'chill', left: { en: 'Villain', fr: 'Méchant' }, right: { en: 'Hero', fr: 'Héros' } },
  { id: 'w16', adult: false, intensity: 'chill', left: { en: 'A want', fr: 'Une envie' }, right: { en: 'A need', fr: 'Un besoin' } },
  { id: 'w17', adult: false, intensity: 'chill', left: { en: 'Bad advice', fr: 'Mauvais conseil' }, right: { en: 'Life-changing advice', fr: 'Conseil qui change la vie' } },
  { id: 'w18', adult: false, intensity: 'chill', left: { en: 'Ugly', fr: 'Laid' }, right: { en: 'Beautiful', fr: 'Beau' } },
  { id: 'w19', adult: false, intensity: 'party', left: { en: 'Sober activity', fr: 'Activité sobre' }, right: { en: 'Drunk activity', fr: 'Activité de soirée' } },
  { id: 'w20', adult: false, intensity: 'party', left: { en: 'Bad idea', fr: 'Mauvaise idée' }, right: { en: 'Genius idea', fr: 'Idée de génie' } },
  { id: 'w21', adult: false, intensity: 'party', left: { en: 'Embarrassing', fr: 'Gênant' }, right: { en: 'Impressive', fr: 'Impressionnant' } },
  { id: 'w22', adult: false, intensity: 'party', left: { en: 'A rumour', fr: 'Une rumeur' }, right: { en: 'A fact', fr: 'Un fait' } },
  { id: 'w23', adult: false, intensity: 'party', left: { en: 'Would never', fr: 'Jamais de la vie' }, right: { en: 'Already have', fr: 'Déjà fait' } },
  { id: 'w24', adult: false, intensity: 'party', left: { en: 'Green flag', fr: 'Green flag' }, right: { en: 'Red flag', fr: 'Red flag' } },
  { id: 'w25', adult: false, intensity: 'party', left: { en: 'Small talk', fr: 'Banalité' }, right: { en: 'Deep conversation', fr: 'Conversation profonde' } },
  { id: 'w26', adult: false, intensity: 'party', left: { en: 'Cancel the plan', fr: 'Annuler le plan' }, right: { en: 'Clear the calendar', fr: 'Tout annuler pour y aller' } },
  { id: 'w27', adult: false, intensity: 'party', left: { en: 'Cheap night out', fr: 'Sortie pas chère' }, right: { en: 'Rent money gone', fr: 'Loyer envolé' } },
  { id: 'w28', adult: false, intensity: 'party', left: { en: 'Family friendly', fr: 'Tout public' }, right: { en: 'Not in front of your mother', fr: 'Pas devant ta mère' } },
  { id: 'w29', adult: false, intensity: 'party', left: { en: 'Forgivable', fr: 'Pardonnable' }, right: { en: 'Unforgivable', fr: 'Impardonnable' } },
  { id: 'w30', adult: false, intensity: 'party', left: { en: 'A phase', fr: 'Une phase' }, right: { en: 'A personality', fr: 'Une personnalité' } },
  { id: 'w31', adult: false, intensity: 'wild', left: { en: 'White lie', fr: 'Petit mensonge' }, right: { en: 'Betrayal', fr: 'Trahison' } },
  { id: 'w32', adult: false, intensity: 'wild', left: { en: 'Awkward', fr: 'Malaisant' }, right: { en: 'Devastating', fr: 'Dévastateur' } },
  { id: 'w33', adult: false, intensity: 'wild', left: { en: 'Would tell a friend', fr: 'Je le dirais à un ami' }, right: { en: 'Taking it to the grave', fr: 'Je l’emporte dans la tombe' } },
  { id: 'w34', adult: false, intensity: 'wild', left: { en: 'Petty', fr: 'Mesquin' }, right: { en: 'Justified', fr: 'Justifié' } },
  { id: 'w35', adult: false, intensity: 'wild', left: { en: 'A friend', fr: 'Un ami' }, right: { en: 'An acquaintance', fr: 'Une connaissance' } },
  { id: 'w36', adult: false, intensity: 'chill', left: { en: 'Modern', fr: 'Moderne' }, right: { en: 'Ancient', fr: 'Antique' } },
  { id: 'w37', adult: false, intensity: 'chill', left: { en: 'Comfort food', fr: 'Plat réconfortant' }, right: { en: 'Fine dining', fr: 'Gastronomie' } },
  { id: 'w38', adult: false, intensity: 'chill', left: { en: 'Waste of time', fr: 'Perte de temps' }, right: { en: 'Time well spent', fr: 'Temps bien investi' } },
  { id: 'w39', adult: false, intensity: 'chill', left: { en: 'Loud colour', fr: 'Couleur criarde' }, right: { en: 'Subtle colour', fr: 'Couleur discrète' } },
  { id: 'w40', adult: false, intensity: 'chill', left: { en: 'Chore', fr: 'Corvée' }, right: { en: 'Treat', fr: 'Plaisir' } },

  { id: 'ws1', adult: true, intensity: 'wild', left: { en: 'Innocent', fr: 'Innocent' }, right: { en: 'Filthy', fr: 'Cochon' } },
  { id: 'ws2', adult: true, intensity: 'wild', left: { en: 'First date material', fr: 'Sujet de premier rendez-vous' }, right: { en: 'Third date at least', fr: 'Troisième rendez-vous minimum' } },
  { id: 'ws3', adult: true, intensity: 'wild', left: { en: 'Would admit sober', fr: 'Avouable à jeun' }, right: { en: 'Only after three drinks', fr: 'Seulement après trois verres' } },
  { id: 'ws4', adult: true, intensity: 'wild', left: { en: 'Vanilla', fr: 'Classique' }, right: { en: 'Adventurous', fr: 'Aventureux' } },
];
