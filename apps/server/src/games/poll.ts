import type { OptionPollPublic, PeoplePollPublic } from '@piccolo/shared';
import {
  activeIds,
  countVotes,
  everyoneIn,
  localize,
  newCursor,
  nextCard,
  topVoted,
  type DeckCursor,
} from './kit.js';
import { HOST_ACTOR, type RoomGame, type RoomGameContext } from './registry.js';
import type { DilemmaCard, PromptCard } from './decks/polls.js';

/**
 * Three room games are the same machine: put a prompt on the big screen, take
 * one tap from every phone, then show the split. Only what you are voting *on*
 * differs — a person, or one of two options — so it lives here once.
 */
interface PollState {
  cursor: DeckCursor;
  round: number;
  phase: 'voting' | 'reveal';
  /** playerId -> vote target (a player id, or 'a' / 'b'). */
  votes: Record<string, string>;
  prompt: { text: string } | { a: string; b: string };
}

function driver(ctx: RoomGameContext, actor: string): boolean {
  if (actor === HOST_ACTOR) return true;
  return ctx.players.find((p) => p.id === actor)?.isHost ?? false;
}

export function createPeoplePoll(config: {
  id: string;
  deck: readonly PromptCard[];
  minPlayers: number;
  maxPlayers: number | null;
}): RoomGame {
  const { id, deck, minPlayers, maxPlayers } = config;

  function publish(ctx: RoomGameContext, state: PollState): void {
    const prompt = 'text' in state.prompt ? state.prompt.text : '';
    const base: PeoplePollPublic = {
      kind: 'people-poll',
      round: state.round,
      phase: state.phase,
      prompt,
      voted: Object.keys(state.votes),
    };
    if (state.phase === 'reveal') {
      const counts = countVotes(state.votes);
      base.results = ctx.players
        .map((p) => ({ id: p.id, votes: counts[p.id] ?? 0 }))
        .sort((x, y) => y.votes - x.votes);
      base.leaders = topVoted(counts);
    }
    ctx.setState(state);
    ctx.setPublic(base);
  }

  function deal(ctx: RoomGameContext, previous?: PollState): void {
    const cursor = previous?.cursor ?? newCursor(deck, ctx.adultUnlocked);
    const { card, cursor: moved } = nextCard(deck, cursor);
    publish(ctx, {
      cursor: moved,
      round: (previous?.round ?? 0) + 1,
      phase: 'voting',
      votes: {},
      prompt: { text: card ? localize(card.text, ctx.locale) : '' },
    });
  }

  return {
    id,
    minPlayers,
    maxPlayers,
    start: (ctx) => deal(ctx),
    action: (ctx, actor, action, payload) => {
      const state = ctx.getState<PollState>();
      if (!state) return;

      if (action === 'vote' && state.phase === 'voting' && actor !== HOST_ACTOR) {
        const target = typeof payload === 'string' ? payload : '';
        if (!ctx.players.some((p) => p.id === target)) return;
        const votes = { ...state.votes, [actor]: target };
        const next: PollState = { ...state, votes };
        if (everyoneIn(ctx, votes)) {
          next.phase = 'reveal';
          for (const winner of topVoted(countVotes(votes))) ctx.addScore(winner, 1);
          ctx.emit('reveal');
        }
        publish(ctx, next);
        return;
      }

      if (action === 'reveal' && state.phase === 'voting' && driver(ctx, actor)) {
        // The screen can cut a round short when somebody has walked off.
        for (const winner of topVoted(countVotes(state.votes))) ctx.addScore(winner, 1);
        publish(ctx, { ...state, phase: 'reveal' });
        return;
      }

      if (action === 'next' && driver(ctx, actor)) {
        deal(ctx, state);
      }
    },
    playersChanged: (ctx) => {
      const state = ctx.getState<PollState>();
      if (!state || state.phase !== 'voting') return;
      // Someone dropping should not leave the room waiting on a dead phone.
      const live = activeIds(ctx);
      const votes = Object.fromEntries(
        Object.entries(state.votes).filter(([voter]) => live.includes(voter)),
      );
      const next: PollState = { ...state, votes };
      if (everyoneIn(ctx, votes)) next.phase = 'reveal';
      publish(ctx, next);
    },
  };
}

export function createOptionPoll(config: {
  id: string;
  deck: readonly DilemmaCard[];
  minPlayers: number;
  maxPlayers: number | null;
}): RoomGame {
  const { id, deck, minPlayers, maxPlayers } = config;

  function publish(ctx: RoomGameContext, state: PollState): void {
    const prompt = 'a' in state.prompt ? state.prompt : { a: '', b: '' };
    const base: OptionPollPublic = {
      kind: 'option-poll',
      round: state.round,
      phase: state.phase,
      a: prompt.a,
      b: prompt.b,
      voted: Object.keys(state.votes),
    };
    if (state.phase === 'reveal') {
      const values = Object.values(state.votes);
      const a = values.filter((v) => v === 'a').length;
      const b = values.filter((v) => v === 'b').length;
      base.results = { a, b };
      base.minority = a === b ? 'tie' : a < b ? 'a' : 'b';
    }
    ctx.setState(state);
    ctx.setPublic(base);
  }

  function deal(ctx: RoomGameContext, previous?: PollState): void {
    const cursor = previous?.cursor ?? newCursor(deck, ctx.adultUnlocked);
    const { card, cursor: moved } = nextCard(deck, cursor);
    publish(ctx, {
      cursor: moved,
      round: (previous?.round ?? 0) + 1,
      phase: 'voting',
      votes: {},
      prompt: {
        a: card ? localize(card.a, ctx.locale) : '',
        b: card ? localize(card.b, ctx.locale) : '',
      },
    });
  }

  return {
    id,
    minPlayers,
    maxPlayers,
    start: (ctx) => deal(ctx),
    action: (ctx, actor, action, payload) => {
      const state = ctx.getState<PollState>();
      if (!state) return;

      if (action === 'vote' && state.phase === 'voting' && actor !== HOST_ACTOR) {
        if (payload !== 'a' && payload !== 'b') return;
        const votes = { ...state.votes, [actor]: payload };
        const next: PollState = { ...state, votes };
        if (everyoneIn(ctx, votes)) {
          next.phase = 'reveal';
          ctx.emit('reveal');
          // The smaller camp drinks, so the bigger one banks the point.
          const values = Object.values(votes);
          const a = values.filter((v) => v === 'a').length;
          const b = values.filter((v) => v === 'b').length;
          if (a !== b) {
            const safe = a > b ? 'a' : 'b';
            for (const [voter, choice] of Object.entries(votes)) {
              if (choice === safe) ctx.addScore(voter, 1);
            }
          }
        }
        publish(ctx, next);
        return;
      }

      if (action === 'reveal' && state.phase === 'voting' && driver(ctx, actor)) {
        publish(ctx, { ...state, phase: 'reveal' });
        return;
      }

      if (action === 'next' && driver(ctx, actor)) {
        deal(ctx, state);
      }
    },
    playersChanged: (ctx) => {
      const state = ctx.getState<PollState>();
      if (!state || state.phase !== 'voting') return;
      const live = activeIds(ctx);
      const votes = Object.fromEntries(
        Object.entries(state.votes).filter(([voter]) => live.includes(voter)),
      );
      const next: PollState = { ...state, votes };
      if (everyoneIn(ctx, votes)) next.phase = 'reveal';
      publish(ctx, next);
    },
  };
}
