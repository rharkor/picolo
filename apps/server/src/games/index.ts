import { bingo } from './bingo.js';
import { confessions } from './confessions.js';
import { drawAndGuess } from './draw.js';
import { impostor } from './impostor.js';
import { rankIt } from './rank.js';
import { trivia } from './trivia.js';
import { wavelength } from './wavelength.js';
import { tapRace } from './taprace.js';
import { trio } from './trio.js';
import { werewolf } from './werewolf.js';
import { LIAR_FACTS } from './decks/liar.js';
import { DILEMMAS_ROOM, MOST_LIKELY_ROOM, SUPERLATIVES } from './decks/polls.js';
import { PUNCHLINES } from './decks/punchline.js';
import { createOptionPoll, createPeoplePoll } from './poll.js';
import { registerRoomGame } from './registry.js';
import { createWriteGame } from './write.js';

/**
 * Importing this module is what makes multi-device games exist. Anything not
 * registered here answers `game-unknown` when a host tries to start it, which
 * is the honest failure mode.
 */
registerRoomGame(
  createPeoplePoll({ id: 'most-likely-to', deck: MOST_LIKELY_ROOM, minPlayers: 3, maxPlayers: 16 }),
);
registerRoomGame(
  createPeoplePoll({ id: 'who-in-the-room', deck: SUPERLATIVES, minPlayers: 4, maxPlayers: 16 }),
);
registerRoomGame(
  createOptionPoll({ id: 'would-you-rather', deck: DILEMMAS_ROOM, minPlayers: 3, maxPlayers: 16 }),
);
registerRoomGame(
  createWriteGame({
    id: 'punchline',
    mode: 'funniest',
    deck: PUNCHLINES,
    minPlayers: 3,
    maxPlayers: 10,
  }),
);
registerRoomGame(
  createWriteGame({
    id: 'liar-liar',
    mode: 'find-truth',
    deck: LIAR_FACTS,
    minPlayers: 3,
    maxPlayers: 10,
  }),
);
registerRoomGame(confessions);
registerRoomGame(impostor);
registerRoomGame(trivia);
registerRoomGame(wavelength);
registerRoomGame(rankIt);
registerRoomGame(drawAndGuess);
registerRoomGame(werewolf);
registerRoomGame(tapRace);
registerRoomGame(bingo);
registerRoomGame(trio);

export { ROOM_CONTENT } from './content.js';
