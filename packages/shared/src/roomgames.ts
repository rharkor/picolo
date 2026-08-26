/**
 * Public state shapes broadcast by multi-device games.
 *
 * These live in the shared package so the server that writes them and the two
 * views that read them cannot drift. Content never appears here — the server
 * localises card text before broadcasting, so decks stay off the wire and out
 * of the browser bundle.
 */

export interface PeoplePollPublic {
  kind: 'people-poll';
  round: number;
  phase: 'voting' | 'reveal';
  prompt: string;
  /** Player ids that have voted. Never what they voted for. */
  voted: string[];
  results?: { id: string; votes: number }[];
  leaders?: string[];
}

export interface OptionPollPublic {
  kind: 'option-poll';
  round: number;
  phase: 'voting' | 'reveal';
  a: string;
  b: string;
  voted: string[];
  results?: { a: number; b: number };
  minority?: 'a' | 'b' | 'tie';
}

/** Punchline, Confessions, Liar Liar: write something, then vote on it. */
export interface WritePublic {
  kind: 'write';
  round: number;
  phase: 'writing' | 'voting' | 'reveal';
  /** The prompt everyone is answering, already localised. */
  prompt: string;
  /** Shown in the reveal phase only, for games that have a real answer. */
  truth?: string;
  submitted: string[];
  voted: string[];
  /** Shuffled entries. `author` is only filled in once the round is revealed. */
  entries?: { id: string; text: string; author?: string; votes?: number; correct?: boolean }[];
  winners?: string[];
}

/** Confessions: everyone writes one, then the room guesses who wrote each. */
export interface AuthorPublic {
  kind: 'author';
  /** Which confession is on screen, 1-based. */
  index: number;
  total: number;
  phase: 'writing' | 'guessing' | 'reveal';
  prompt: string;
  submitted: string[];
  entry?: string;
  guessed: string[];
  author?: string;
  /** Who guessed right, once revealed. */
  correct?: string[];
}

export interface ImpostorPublic {
  kind: 'impostor';
  round: number;
  phase: 'peeking' | 'clues' | 'voting' | 'reveal' | 'over';
  /** Whose turn it is to give a clue, in fixed clue order. */
  speaker?: string;
  clueOrder: string[];
  ready: string[];
  voted: string[];
  out: string[];
  results?: { id: string; votes: number }[];
  ejected?: string;
  ejectedRole?: 'civilian' | 'undercover' | 'white';
  /** Nobody was ejected: the vote was a dead heat. */
  tie?: boolean;
  /** Set when Mr White has been caught and gets one shot at the word. */
  whiteGuess?: boolean;
  outcome?: 'civilians' | 'impostors';
  words?: { civilian: string; undercover: string };
}

export interface TriviaPublic {
  kind: 'trivia';
  round: number;
  total: number;
  phase: 'question' | 'reveal' | 'over';
  question: string;
  options: string[];
  answered: string[];
  /** Milliseconds left when the state was sent. */
  endsIn?: number;
  correct?: number;
  gained?: { id: string; points: number; picked: number | null }[];
}

export interface WavelengthPublic {
  kind: 'wavelength';
  round: number;
  phase: 'clue' | 'guessing' | 'reveal';
  /** The two poles of the spectrum. */
  left: string;
  right: string;
  psychic: string;
  clue?: string;
  guessed: string[];
  /** 0–100. Only revealed at the end of the round. */
  target?: number;
  guesses?: { id: string; value: number; points: number }[];
}

export interface RankPublic {
  kind: 'rank';
  round: number;
  phase: 'ranking' | 'reveal';
  title: string;
  items: string[];
  submitted: string[];
  /** Index order per player, revealed at the end. */
  consensus?: number[];
  scores?: { id: string; points: number }[];
}

export interface DrawPublic {
  kind: 'draw';
  round: number;
  phase: 'drawing' | 'reveal';
  artist: string;
  /** Only the artist gets the word, via `game:private`. */
  strokes: number[][];
  guesses: { id: string; text: string; correct: boolean }[];
  endsIn?: number;
  word?: string;
  winner?: string;
}

export interface WerewolfPublic {
  kind: 'werewolf';
  round: number;
  phase: 'peeking' | 'night' | 'day' | 'voting' | 'reveal' | 'over';
  ready: string[];
  acted: string[];
  voted: string[];
  out: string[];
  /** Announced at dawn. */
  killed?: string | null;
  ejected?: string;
  ejectedRole?: string;
  outcome?: 'village' | 'wolves';
  reveal?: { id: string; role: string }[];
  results?: { id: string; votes: number }[];
}

/** Two Truths & a Lie: three statements per player, the room picks the lie. */
export interface TrioPublic {
  kind: 'trio';
  phase: 'writing' | 'guessing' | 'reveal';
  /** Which player's set is on screen, 1-based. */
  index: number;
  total: number;
  submitted: string[];
  subject?: string;
  statements?: string[];
  guessed: string[];
  /** Index of the lie, revealed at the end of each set. */
  lie?: number;
  correct?: string[];
}

export interface TapRacePublic {
  kind: 'tap-race';
  round: number;
  phase: 'ready' | 'running' | 'reveal';
  endsIn?: number;
  taps: { id: string; count: number }[];
  winner?: string;
  loser?: string;
}

export interface BingoPublic {
  kind: 'bingo';
  /** Everyone gets their own grid, delivered privately. */
  lines: { id: string; lines: number; full: boolean }[];
  claims: { id: string; lines: number; at: number }[];
}

export type RoomGamePublic =
  | PeoplePollPublic
  | AuthorPublic
  | TrioPublic
  | OptionPollPublic
  | WritePublic
  | ImpostorPublic
  | TriviaPublic
  | WavelengthPublic
  | RankPublic
  | DrawPublic
  | WerewolfPublic
  | TapRacePublic
  | BingoPublic;
