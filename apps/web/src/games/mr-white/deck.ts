import type { Intensity, LocalizedText } from '@piccolo/shared';

/**
 * Word pairs. The two halves have to be close enough that one clue could
 * plausibly fit either, and far enough apart that three clues cannot. Which
 * half the civilians get is decided at deal time, so the same pair plays
 * differently twice.
 */
export interface WordPair {
  id: string;
  adult: boolean;
  intensity: Intensity;
  a: LocalizedText;
  b: LocalizedText;
}

export const WORD_PAIRS: WordPair[] = [
  { id: 'p1', adult: false, intensity: 'chill', a: { en: 'Coffee', fr: 'Café' }, b: { en: 'Tea', fr: 'Thé' } },
  { id: 'p2', adult: false, intensity: 'chill', a: { en: 'Beach', fr: 'Plage' }, b: { en: 'Swimming pool', fr: 'Piscine' } },
  { id: 'p3', adult: false, intensity: 'chill', a: { en: 'Bicycle', fr: 'Vélo' }, b: { en: 'Motorbike', fr: 'Moto' } },
  { id: 'p4', adult: false, intensity: 'chill', a: { en: 'Cat', fr: 'Chat' }, b: { en: 'Dog', fr: 'Chien' } },
  { id: 'p5', adult: false, intensity: 'chill', a: { en: 'Pizza', fr: 'Pizza' }, b: { en: 'Burger', fr: 'Burger' } },
  { id: 'p6', adult: false, intensity: 'chill', a: { en: 'Winter', fr: 'Hiver' }, b: { en: 'Autumn', fr: 'Automne' } },
  { id: 'p7', adult: false, intensity: 'chill', a: { en: 'Cinema', fr: 'Cinéma' }, b: { en: 'Theatre', fr: 'Théâtre' } },
  { id: 'p8', adult: false, intensity: 'chill', a: { en: 'Doctor', fr: 'Médecin' }, b: { en: 'Nurse', fr: 'Infirmier' } },
  { id: 'p9', adult: false, intensity: 'chill', a: { en: 'Guitar', fr: 'Guitare' }, b: { en: 'Piano', fr: 'Piano' } },
  { id: 'p10', adult: false, intensity: 'chill', a: { en: 'Train', fr: 'Train' }, b: { en: 'Bus', fr: 'Bus' } },
  { id: 'p11', adult: false, intensity: 'chill', a: { en: 'Sun', fr: 'Soleil' }, b: { en: 'Moon', fr: 'Lune' } },
  { id: 'p12', adult: false, intensity: 'chill', a: { en: 'Library', fr: 'Bibliothèque' }, b: { en: 'Bookshop', fr: 'Librairie' } },
  { id: 'p13', adult: false, intensity: 'chill', a: { en: 'Football', fr: 'Football' }, b: { en: 'Rugby', fr: 'Rugby' } },
  { id: 'p14', adult: false, intensity: 'chill', a: { en: 'Snow', fr: 'Neige' }, b: { en: 'Rain', fr: 'Pluie' } },
  { id: 'p15', adult: false, intensity: 'chill', a: { en: 'Hotel', fr: 'Hôtel' }, b: { en: 'Hostel', fr: 'Auberge' } },
  { id: 'p16', adult: false, intensity: 'chill', a: { en: 'Chocolate', fr: 'Chocolat' }, b: { en: 'Caramel', fr: 'Caramel' } },
  { id: 'p17', adult: false, intensity: 'chill', a: { en: 'Mountain', fr: 'Montagne' }, b: { en: 'Hill', fr: 'Colline' } },
  { id: 'p18', adult: false, intensity: 'chill', a: { en: 'Teacher', fr: 'Professeur' }, b: { en: 'Coach', fr: 'Entraîneur' } },
  { id: 'p19', adult: false, intensity: 'chill', a: { en: 'Wallet', fr: 'Portefeuille' }, b: { en: 'Purse', fr: 'Porte-monnaie' } },
  { id: 'p20', adult: false, intensity: 'chill', a: { en: 'Plane', fr: 'Avion' }, b: { en: 'Helicopter', fr: 'Hélicoptère' } },
  { id: 'p21', adult: false, intensity: 'chill', a: { en: 'Soup', fr: 'Soupe' }, b: { en: 'Stew', fr: 'Ragoût' } },
  { id: 'p22', adult: false, intensity: 'chill', a: { en: 'Mirror', fr: 'Miroir' }, b: { en: 'Window', fr: 'Fenêtre' } },
  { id: 'p23', adult: false, intensity: 'chill', a: { en: 'Sandals', fr: 'Sandales' }, b: { en: 'Slippers', fr: 'Chaussons' } },
  { id: 'p24', adult: false, intensity: 'chill', a: { en: 'Wedding', fr: 'Mariage' }, b: { en: 'Birthday', fr: 'Anniversaire' } },
  { id: 'p25', adult: false, intensity: 'chill', a: { en: 'Beer', fr: 'Bière' }, b: { en: 'Cider', fr: 'Cidre' } },
  { id: 'p26', adult: false, intensity: 'party', a: { en: 'Nightclub', fr: 'Boîte de nuit' }, b: { en: 'Bar', fr: 'Bar' } },
  { id: 'p27', adult: false, intensity: 'party', a: { en: 'Hangover', fr: 'Gueule de bois' }, b: { en: 'Flu', fr: 'Grippe' } },
  { id: 'p28', adult: false, intensity: 'party', a: { en: 'Selfie', fr: 'Selfie' }, b: { en: 'Portrait', fr: 'Portrait' } },
  { id: 'p29', adult: false, intensity: 'party', a: { en: 'Karaoke', fr: 'Karaoké' }, b: { en: 'Concert', fr: 'Concert' } },
  { id: 'p30', adult: false, intensity: 'party', a: { en: 'Taxi', fr: 'Taxi' }, b: { en: 'Uber', fr: 'Uber' } },
  { id: 'p31', adult: false, intensity: 'party', a: { en: 'Tattoo', fr: 'Tatouage' }, b: { en: 'Piercing', fr: 'Piercing' } },
  { id: 'p32', adult: false, intensity: 'party', a: { en: 'Festival', fr: 'Festival' }, b: { en: 'Carnival', fr: 'Carnaval' } },
  { id: 'p33', adult: false, intensity: 'party', a: { en: 'Boss', fr: 'Patron' }, b: { en: 'Landlord', fr: 'Propriétaire' } },
  { id: 'p34', adult: false, intensity: 'party', a: { en: 'Ex', fr: 'Ex' }, b: { en: 'Crush', fr: 'Crush' } },
  { id: 'p35', adult: false, intensity: 'party', a: { en: 'Gym', fr: 'Salle de sport' }, b: { en: 'Yoga', fr: 'Yoga' } },
  { id: 'p36', adult: false, intensity: 'party', a: { en: 'Shot', fr: 'Shot' }, b: { en: 'Cocktail', fr: 'Cocktail' } },
  { id: 'p37', adult: false, intensity: 'party', a: { en: 'Kebab', fr: 'Kebab' }, b: { en: 'Hot dog', fr: 'Hot-dog' } },
  { id: 'p38', adult: false, intensity: 'party', a: { en: 'Wedding ring', fr: 'Alliance' }, b: { en: 'Engagement ring', fr: 'Bague de fiançailles' } },
  { id: 'p39', adult: false, intensity: 'party', a: { en: 'Police', fr: 'Police' }, b: { en: 'Security guard', fr: 'Vigile' } },
  { id: 'p40', adult: false, intensity: 'party', a: { en: 'Podcast', fr: 'Podcast' }, b: { en: 'Radio', fr: 'Radio' } },
  { id: 'p41', adult: false, intensity: 'party', a: { en: 'Dating app', fr: 'Appli de rencontre' }, b: { en: 'Blind date', fr: 'Rendez-vous arrangé' } },
  { id: 'p42', adult: false, intensity: 'party', a: { en: 'Group chat', fr: 'Groupe de discussion' }, b: { en: 'Family dinner', fr: 'Repas de famille' } },
  { id: 'p43', adult: false, intensity: 'party', a: { en: 'Sofa', fr: 'Canapé' }, b: { en: 'Bed', fr: 'Lit' } },
  { id: 'p44', adult: false, intensity: 'party', a: { en: 'Whisky', fr: 'Whisky' }, b: { en: 'Rum', fr: 'Rhum' } },
  { id: 'p45', adult: false, intensity: 'party', a: { en: 'Sunburn', fr: 'Coup de soleil' }, b: { en: 'Bruise', fr: 'Bleu' } },
  { id: 'p46', adult: false, intensity: 'party', a: { en: 'Interview', fr: 'Entretien' }, b: { en: 'Exam', fr: 'Examen' } },
  { id: 'p47', adult: false, intensity: 'party', a: { en: 'Secret', fr: 'Secret' }, b: { en: 'Lie', fr: 'Mensonge' } },
  { id: 'p48', adult: false, intensity: 'party', a: { en: 'Neighbour', fr: 'Voisin' }, b: { en: 'Flatmate', fr: 'Colocataire' } },
  { id: 'p49', adult: false, intensity: 'wild', a: { en: 'Divorce', fr: 'Divorce' }, b: { en: 'Break-up', fr: 'Rupture' } },
  { id: 'p50', adult: false, intensity: 'wild', a: { en: 'Funeral', fr: 'Enterrement' }, b: { en: 'Hospital', fr: 'Hôpital' } },
  { id: 'p51', adult: false, intensity: 'wild', a: { en: 'Jealousy', fr: 'Jalousie' }, b: { en: 'Envy', fr: 'Envie' } },
  { id: 'p52', adult: false, intensity: 'wild', a: { en: 'Debt', fr: 'Dette' }, b: { en: 'Rent', fr: 'Loyer' } },
  { id: 'p53', adult: false, intensity: 'wild', a: { en: 'Therapy', fr: 'Thérapie' }, b: { en: 'Confession', fr: 'Confession' } },
  { id: 'p54', adult: false, intensity: 'wild', a: { en: 'Prison', fr: 'Prison' }, b: { en: 'Boarding school', fr: 'Internat' } },
  { id: 'p55', adult: false, intensity: 'chill', a: { en: 'Sunrise', fr: 'Lever de soleil' }, b: { en: 'Sunset', fr: 'Coucher de soleil' } },
  { id: 'p56', adult: false, intensity: 'chill', a: { en: 'Painting', fr: 'Peinture' }, b: { en: 'Photograph', fr: 'Photographie' } },
  { id: 'p57', adult: false, intensity: 'chill', a: { en: 'Fork', fr: 'Fourchette' }, b: { en: 'Spoon', fr: 'Cuillère' } },
  { id: 'p58', adult: false, intensity: 'chill', a: { en: 'Umbrella', fr: 'Parapluie' }, b: { en: 'Raincoat', fr: 'Imperméable' } },
  { id: 'p59', adult: false, intensity: 'chill', a: { en: 'Butterfly', fr: 'Papillon' }, b: { en: 'Moth', fr: 'Mite' } },
  { id: 'p60', adult: false, intensity: 'chill', a: { en: 'Castle', fr: 'Château' }, b: { en: 'Palace', fr: 'Palais' } },

  // ------------------------------------------------------------- 18+ deck ---
  { id: 'ps1', adult: true, intensity: 'wild', a: { en: 'One night stand', fr: 'Coup d’un soir' }, b: { en: 'First date', fr: 'Premier rendez-vous' } },
  { id: 'ps2', adult: true, intensity: 'wild', a: { en: 'Strip club', fr: 'Club de striptease' }, b: { en: 'Cabaret', fr: 'Cabaret' } },
  { id: 'ps3', adult: true, intensity: 'wild', a: { en: 'Honeymoon', fr: 'Lune de miel' }, b: { en: 'Weekend away', fr: 'Week-end en amoureux' } },
  { id: 'ps4', adult: true, intensity: 'wild', a: { en: 'Nude', fr: 'Nude' }, b: { en: 'Selfie', fr: 'Selfie' } },
  { id: 'ps5', adult: true, intensity: 'wild', a: { en: 'Affair', fr: 'Liaison' }, b: { en: 'Secret friendship', fr: 'Amitié secrète' } },
  { id: 'ps6', adult: true, intensity: 'wild', a: { en: 'Massage', fr: 'Massage' }, b: { en: 'Shower', fr: 'Douche' } },
];
