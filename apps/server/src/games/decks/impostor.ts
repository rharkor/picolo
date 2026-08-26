import type { LocalizedText } from '@piccolo/shared';
import type { RoomCard } from '../kit.js';

export interface WordPairCard extends RoomCard {
  a: LocalizedText;
  b: LocalizedText;
}

/**
 * Room-edition word pairs. Kept separate from the pass-the-phone Mr White deck
 * so a group that plays both is not handed the same forty pairs twice.
 */
export const IMPOSTOR_PAIRS: WordPairCard[] = [
  { id: 'i1', adult: false, intensity: 'chill', a: { en: 'Airport', fr: 'Aéroport' }, b: { en: 'Train station', fr: 'Gare' } },
  { id: 'i2', adult: false, intensity: 'chill', a: { en: 'Dentist', fr: 'Dentiste' }, b: { en: 'Barber', fr: 'Coiffeur' } },
  { id: 'i3', adult: false, intensity: 'chill', a: { en: 'Rain', fr: 'Pluie' }, b: { en: 'Fog', fr: 'Brouillard' } },
  { id: 'i4', adult: false, intensity: 'chill', a: { en: 'Wedding cake', fr: 'Gâteau de mariage' }, b: { en: 'Birthday cake', fr: 'Gâteau d’anniversaire' } },
  { id: 'i5', adult: false, intensity: 'chill', a: { en: 'Sunglasses', fr: 'Lunettes de soleil' }, b: { en: 'Reading glasses', fr: 'Lunettes de vue' } },
  { id: 'i6', adult: false, intensity: 'chill', a: { en: 'Museum', fr: 'Musée' }, b: { en: 'Gallery', fr: 'Galerie' } },
  { id: 'i7', adult: false, intensity: 'chill', a: { en: 'Coffee shop', fr: 'Café' }, b: { en: 'Bakery', fr: 'Boulangerie' } },
  { id: 'i8', adult: false, intensity: 'chill', a: { en: 'Ferry', fr: 'Ferry' }, b: { en: 'Cruise ship', fr: 'Paquebot' } },
  { id: 'i9', adult: false, intensity: 'chill', a: { en: 'Wallet', fr: 'Portefeuille' }, b: { en: 'Backpack', fr: 'Sac à dos' } },
  { id: 'i10', adult: false, intensity: 'chill', a: { en: 'Snowboard', fr: 'Snowboard' }, b: { en: 'Skis', fr: 'Skis' } },
  { id: 'i11', adult: false, intensity: 'chill', a: { en: 'Chess', fr: 'Échecs' }, b: { en: 'Poker', fr: 'Poker' } },
  { id: 'i12', adult: false, intensity: 'chill', a: { en: 'Playground', fr: 'Aire de jeux' }, b: { en: 'Fairground', fr: 'Fête foraine' } },
  { id: 'i13', adult: false, intensity: 'chill', a: { en: 'Pharmacy', fr: 'Pharmacie' }, b: { en: 'Supermarket', fr: 'Supermarché' } },
  { id: 'i14', adult: false, intensity: 'chill', a: { en: 'Sunrise', fr: 'Aube' }, b: { en: 'Midnight', fr: 'Minuit' } },
  { id: 'i15', adult: false, intensity: 'chill', a: { en: 'Balcony', fr: 'Balcon' }, b: { en: 'Garden', fr: 'Jardin' } },
  { id: 'i16', adult: false, intensity: 'chill', a: { en: 'Detective', fr: 'Détective' }, b: { en: 'Journalist', fr: 'Journaliste' } },
  { id: 'i17', adult: false, intensity: 'chill', a: { en: 'Violin', fr: 'Violon' }, b: { en: 'Cello', fr: 'Violoncelle' } },
  { id: 'i18', adult: false, intensity: 'chill', a: { en: 'Marathon', fr: 'Marathon' }, b: { en: 'Triathlon', fr: 'Triathlon' } },
  { id: 'i19', adult: false, intensity: 'chill', a: { en: 'Lighthouse', fr: 'Phare' }, b: { en: 'Windmill', fr: 'Moulin' } },
  { id: 'i20', adult: false, intensity: 'chill', a: { en: 'Passport', fr: 'Passeport' }, b: { en: 'Driving licence', fr: 'Permis de conduire' } },
  { id: 'i21', adult: false, intensity: 'party', a: { en: 'Wedding speech', fr: 'Discours de mariage' }, b: { en: 'Job interview', fr: 'Entretien d’embauche' } },
  { id: 'i22', adult: false, intensity: 'party', a: { en: 'Sunburn', fr: 'Coup de soleil' }, b: { en: 'Hangover', fr: 'Gueule de bois' } },
  { id: 'i23', adult: false, intensity: 'party', a: { en: 'House party', fr: 'Soirée à la maison' }, b: { en: 'Wedding reception', fr: 'Réception de mariage' } },
  { id: 'i24', adult: false, intensity: 'party', a: { en: 'Nightclub queue', fr: 'File d’attente en boîte' }, b: { en: 'Airport security', fr: 'Contrôle à l’aéroport' } },
  { id: 'i25', adult: false, intensity: 'party', a: { en: 'Karaoke', fr: 'Karaoké' }, b: { en: 'Open mic', fr: 'Scène ouverte' } },
  { id: 'i26', adult: false, intensity: 'party', a: { en: 'Tattoo', fr: 'Tatouage' }, b: { en: 'Scar', fr: 'Cicatrice' } },
  { id: 'i27', adult: false, intensity: 'party', a: { en: 'Group chat', fr: 'Groupe de discussion' }, b: { en: 'Family dinner', fr: 'Repas de famille' } },
  { id: 'i28', adult: false, intensity: 'party', a: { en: 'Blind date', fr: 'Rendez-vous arrangé' }, b: { en: 'Reunion', fr: 'Retrouvailles' } },
  { id: 'i29', adult: false, intensity: 'party', a: { en: 'Camping', fr: 'Camping' }, b: { en: 'Festival', fr: 'Festival' } },
  { id: 'i30', adult: false, intensity: 'party', a: { en: 'Speeding ticket', fr: 'Amende pour excès de vitesse' }, b: { en: 'Parking fine', fr: 'Amende de stationnement' } },
  { id: 'i31', adult: false, intensity: 'party', a: { en: 'Surprise party', fr: 'Fête surprise' }, b: { en: 'Intervention', fr: 'Mise au point' } },
  { id: 'i32', adult: false, intensity: 'party', a: { en: 'Housewarming', fr: 'Crémaillère' }, b: { en: 'Moving day', fr: 'Jour du déménagement' } },
  { id: 'i33', adult: false, intensity: 'wild', a: { en: 'Break-up', fr: 'Rupture' }, b: { en: 'Resignation', fr: 'Démission' } },
  { id: 'i34', adult: false, intensity: 'wild', a: { en: 'Funeral', fr: 'Enterrement' }, b: { en: 'Graduation', fr: 'Remise de diplôme' } },
  { id: 'i35', adult: false, intensity: 'wild', a: { en: 'Lie', fr: 'Mensonge' }, b: { en: 'Excuse', fr: 'Excuse' } },
  { id: 'i36', adult: false, intensity: 'wild', a: { en: 'Debt', fr: 'Dette' }, b: { en: 'Favour', fr: 'Service' } },
  { id: 'i37', adult: false, intensity: 'wild', a: { en: 'Confession', fr: 'Confession' }, b: { en: 'Apology', fr: 'Excuses' } },
  { id: 'i38', adult: false, intensity: 'wild', a: { en: 'Court', fr: 'Tribunal' }, b: { en: 'Police station', fr: 'Commissariat' } },
  { id: 'i39', adult: false, intensity: 'chill', a: { en: 'Library', fr: 'Bibliothèque' }, b: { en: 'Waiting room', fr: 'Salle d’attente' } },
  { id: 'i40', adult: false, intensity: 'chill', a: { en: 'Photograph', fr: 'Photographie' }, b: { en: 'Souvenir', fr: 'Souvenir' } },

  { id: 'is1', adult: true, intensity: 'wild', a: { en: 'One night stand', fr: 'Coup d’un soir' }, b: { en: 'Holiday romance', fr: 'Amour de vacances' } },
  { id: 'is2', adult: true, intensity: 'wild', a: { en: 'Honeymoon', fr: 'Lune de miel' }, b: { en: 'Dirty weekend', fr: 'Week-end coquin' } },
  { id: 'is3', adult: true, intensity: 'wild', a: { en: 'Strip club', fr: 'Club de striptease' }, b: { en: 'Burlesque show', fr: 'Spectacle burlesque' } },
  { id: 'is4', adult: true, intensity: 'wild', a: { en: 'Nude', fr: 'Nude' }, b: { en: 'Passport photo', fr: 'Photo de passeport' } },
  { id: 'is5', adult: true, intensity: 'wild', a: { en: 'Affair', fr: 'Liaison' }, b: { en: 'Secret friendship', fr: 'Amitié secrète' } },
];
