import { motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { primeAudio, sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { GameFrame, NeedPlayers, PlayerPicker, Standings } from '@/games/_kit/ui';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import { pick, shuffle } from '@/lib/random';
import type { PartyPlayer } from '@/store/party';
import { WORD_PAIRS } from './deck';

export type Role = 'civilian' | 'undercover' | 'white';

const SIPS = 4;

/**
 * The one game where passing the phone round is the entire point: each player
 * has to see something different, and nobody may see anybody else's screen.
 * Everything after the deal happens out loud, so the app steps back to being a
 * vote counter.
 */
type Phase = 'setup' | 'handoff' | 'peek' | 'describe' | 'verdict' | 'guess' | 'over';

/** Sensible role split for a given table size, matching how the game is normally played. */
function suggestRoles(count: number): { undercovers: number; whites: number } {
  if (count <= 4) return { undercovers: 1, whites: 0 };
  if (count <= 6) return { undercovers: 1, whites: 1 };
  if (count <= 9) return { undercovers: 2, whites: 1 };
  return { undercovers: 2, whites: 2 };
}

export default function MrWhite({ players, adult, onExit }: LocalGameProps) {
  const { t, loc, tRaw } = useI18n();
  const pile = usePile(WORD_PAIRS, adult, false);

  const suggested = suggestRoles(players.length);
  const [undercovers, setUndercovers] = useState(suggested.undercovers);
  const [whites, setWhites] = useState(suggested.whites);

  const [phase, setPhase] = useState<Phase>('setup');
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [flipped, setFlipped] = useState(false);
  const [order, setOrder] = useState<PartyPlayer[]>([]);
  const [starterId, setStarterId] = useState<string | null>(null);
  const [seat, setSeat] = useState(0);
  const [outIds, setOutIds] = useState<string[]>([]);
  const [vote, setVote] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [outcome, setOutcome] = useState<'civilians' | 'impostors' | null>(null);
  const [wins, setWins] = useState<Record<string, number>>({});

  const pair = pile.card;
  const civilianWord = pair ? loc(flipped ? pair.b : pair.a) : '';
  const undercoverWord = pair ? loc(flipped ? pair.a : pair.b) : '';

  const alive = useMemo(() => players.filter((p) => !outIds.includes(p.id)), [outIds, players]);
  const aliveImpostors = alive.filter((p) => roles[p.id] && roles[p.id] !== 'civilian');
  const aliveCivilians = alive.filter((p) => roles[p.id] === 'civilian');

  const deal = useCallback(() => {
    primeAudio();
    haptic('select');
    pile.draw();
    const bag = shuffle(players);
    const assigned: Record<string, Role> = {};
    bag.forEach((player, i) => {
      if (i < whites) assigned[player.id] = 'white';
      else if (i < whites + undercovers) assigned[player.id] = 'undercover';
      else assigned[player.id] = 'civilian';
    });
    setRoles(assigned);
    setFlipped(Math.random() < 0.5);
    // Deal in party order, not in the shuffled role order: handing the phone to
    // your actual neighbour is the only ergonomics that matters here.
    setOrder([...players]);
    // Mr White has nothing to say until he has heard a real clue, so the opening
    // word always belongs to somebody who actually holds a word.
    setStarterId(pick(players.filter((p) => assigned[p.id] !== 'white'))?.id ?? null);
    setSeat(0);
    setOutIds([]);
    setVote(null);
    setRound(1);
    setOutcome(null);
    setPhase('handoff');
  }, [pile, players, undercovers, whites]);

  const current = order[seat];
  const currentRole = current ? roles[current.id] : undefined;

  const nextSeat = useCallback(() => {
    haptic('tap');
    if (seat + 1 >= order.length) {
      setPhase('describe');
      return;
    }
    setSeat((n) => n + 1);
    setPhase('handoff');
  }, [order.length, seat]);

  const finish = useCallback(
    (who: 'civilians' | 'impostors') => {
      haptic(who === 'civilians' ? 'success' : 'fail');
      if (who === 'civilians') sfx.good();
      else sfx.boom();
      const winners =
        who === 'civilians'
          ? players.filter((p) => roles[p.id] === 'civilian')
          : players.filter((p) => roles[p.id] && roles[p.id] !== 'civilian');
      setWins((prev) => {
        const next = { ...prev };
        for (const w of winners) next[w.id] = (next[w.id] ?? 0) + 1;
        return next;
      });
      setOutcome(who);
      setPhase('over');
    },
    [players, roles],
  );

  const eliminate = useCallback(() => {
    if (!vote) return;
    const role = roles[vote];
    haptic('heavy');
    sfx.reveal();
    const nextOut = [...outIds, vote];
    setOutIds(nextOut);
    if (role === 'white') {
      setPhase('guess');
      return;
    }
    const remaining = players.filter((p) => !nextOut.includes(p.id));
    const impostorsLeft = remaining.filter((p) => roles[p.id] && roles[p.id] !== 'civilian').length;
    const civiliansLeft = remaining.length - impostorsLeft;
    if (impostorsLeft === 0) {
      finish('civilians');
      return;
    }
    if (civiliansLeft <= impostorsLeft) {
      finish('impostors');
      return;
    }
    setVote(null);
    setRound((n) => n + 1);
    setPhase('verdict');
  }, [finish, outIds, players, roles, vote]);

  const whiteGuessed = useCallback(
    (right: boolean) => {
      if (right) {
        finish('impostors');
        return;
      }
      const remaining = players.filter((p) => !outIds.includes(p.id));
      const impostorsLeft = remaining.filter((p) => roles[p.id] && roles[p.id] !== 'civilian').length;
      const civiliansLeft = remaining.length - impostorsLeft;
      if (impostorsLeft === 0) {
        finish('civilians');
        return;
      }
      if (civiliansLeft <= impostorsLeft) {
        finish('impostors');
        return;
      }
      setVote(null);
      setRound((n) => n + 1);
      setPhase('verdict');
    },
    [finish, outIds, players, roles],
  );

  if (players.length < 4) {
    return (
      <NeedPlayers
        emoji="🕵️"
        message={t('games.mr-white.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const maxImpostors = Math.max(1, Math.floor((players.length - 1) / 2));
  const votedPlayer = players.find((p) => p.id === vote);
  const starter = players.find((p) => p.id === starterId);
  const lastOutRole = outIds.length > 0 ? roles[outIds[outIds.length - 1] ?? ''] : undefined;
  const lastOutPlayer = players.find((p) => p.id === outIds[outIds.length - 1]);

  return (
    <GameFrame
      status={
        phase === 'setup'
          ? t('games.mr-white.setupTitle')
          : phase === 'handoff' || phase === 'peek'
            ? t('games.mr-white.dealing', { current: seat + 1, total: order.length })
            : t('game.round', { n: round })
      }
      chips={
        phase !== 'setup' ? (
          <>
            <Chip tone="warn">🕵️ {aliveImpostors.length}</Chip>
            <Chip>🙂 {aliveCivilians.length}</Chip>
          </>
        ) : adult ? (
          <Chip tone="accent">18+</Chip>
        ) : undefined
      }
      hint={t('games.mr-white.rules')}
      actions={
        phase === 'setup' ? (
          <Button variant="primary" size="xl" full glow onClick={deal}>
            🃏 {t('games.mr-white.deal')}
          </Button>
        ) : phase === 'handoff' ? (
          <Button
            variant="primary"
            size="xl"
            full
            glow
            onClick={() => {
              haptic('heavy');
              setPhase('peek');
            }}
          >
            👀 {t('games.mr-white.showMine')}
          </Button>
        ) : phase === 'peek' ? (
          <Button variant="primary" size="xl" full glow onClick={nextSeat}>
            {seat + 1 >= order.length
              ? t('games.mr-white.everyoneKnows')
              : t('games.mr-white.hideAndPass')}
          </Button>
        ) : phase === 'describe' ? (
          <Button
            variant="primary"
            size="xl"
            full
            glow
            onClick={() => {
              haptic('select');
              setPhase('verdict');
            }}
          >
            🗳️ {t('games.mr-white.toTheVote')}
          </Button>
        ) : phase === 'verdict' ? (
          <Button variant="primary" size="xl" full glow disabled={!vote} onClick={eliminate}>
            {vote
              ? t('games.mr-white.eliminate', { name: votedPlayer?.name ?? '' })
              : t('games.mr-white.pickSomeone')}
          </Button>
        ) : phase === 'guess' ? (
          <>
            <Button variant="primary" size="lg" full glow onClick={() => whiteGuessed(true)}>
              {t('games.mr-white.guessedRight')}
            </Button>
            <Button variant="danger" size="lg" full onClick={() => whiteGuessed(false)}>
              {t('games.mr-white.guessedWrong')}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="xl" full glow onClick={deal}>
            {t('games.mr-white.newRound')}
          </Button>
        )
      }
    >
      {phase === 'setup' && (
        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="text-center">
            <span className="text-6xl" aria-hidden>
              🕵️
            </span>
            <p className="mt-3 font-display text-2xl leading-tight text-gradient">
              {t('games.mr-white.setupTitle')}
            </p>
            <p className="mt-2 text-sm text-muted text-balance">
              {t('games.mr-white.setupNote', { n: players.length })}
            </p>
          </div>

          <RoleCounter
            label={t('games.mr-white.undercovers')}
            note={t('games.mr-white.undercoverNote')}
            value={undercovers}
            max={maxImpostors - whites}
            onChange={setUndercovers}
          />
          <RoleCounter
            label={t('games.mr-white.whites')}
            note={t('games.mr-white.whiteNote')}
            value={whites}
            max={maxImpostors - undercovers}
            onChange={setWhites}
          />

          {Object.keys(wins).length > 0 && (
            <Standings
              rows={players
                .filter((p) => (wins[p.id] ?? 0) > 0)
                .map((p) => ({ id: p.id, label: `${p.avatar} ${p.name}`, value: wins[p.id] ?? 0 }))
                .sort((a, b) => b.value - a.value)}
              unit={t('games.mr-white.winsUnit')}
            />
          )}
        </div>
      )}

      {phase === 'handoff' && (
        <motion.div
          key={`handoff-${seat}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        >
          <span className="text-6xl" aria-hidden>
            🤝
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {t('games.mr-white.passTo')}
          </span>
          <p className="font-display text-4xl leading-tight text-gradient">
            {current ? `${current.avatar} ${current.name}` : ''}
          </p>
          <p className="max-w-xs text-muted text-balance">{t('games.mr-white.nobodyElse')}</p>
        </motion.div>
      )}

      {phase === 'peek' && (
        <motion.div
          key={`peek-${seat}`}
          initial={{ opacity: 0, rotateY: -70, scale: 0.92 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 210, damping: 25 }}
          style={{ transformPerspective: 1000 }}
          className="flex flex-1 flex-col"
        >
          <div
            className={cn(
              'ring-glow glass flex flex-1 flex-col items-center justify-center gap-3 rounded-[2rem] px-7 py-10 text-center',
              currentRole === 'white' && 'bg-gradient-to-br from-white/10 to-transparent',
            )}
          >
            {currentRole === 'white' ? (
              <>
                <span className="text-6xl" aria-hidden>
                  🕳️
                </span>
                <p className="font-display text-3xl leading-tight text-gradient">
                  {t('games.mr-white.youAreWhite')}
                </p>
                <p className="max-w-xs text-sm text-muted text-balance">
                  {t('games.mr-white.whiteBrief')}
                </p>
              </>
            ) : (
              <>
                <span className="font-display text-xs uppercase tracking-[0.25em] text-cyan">
                  {t('games.mr-white.yourWord')}
                </span>
                <p className="font-display text-4xl leading-tight text-balance">
                  {currentRole === 'undercover' ? undercoverWord : civilianWord}
                </p>
                <p className="max-w-xs text-sm text-muted text-balance">
                  {t('games.mr-white.wordBrief')}
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}

      {phase === 'describe' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl" aria-hidden>
            🗣️
          </span>
          <p className="font-display text-2xl leading-tight text-gradient">
            {t('games.mr-white.describeTitle')}
          </p>
          <p className="max-w-sm text-muted text-balance">
            {t('games.mr-white.describeNote', { name: starter?.name ?? order[0]?.name ?? '' })}
          </p>
        </div>
      )}

      {phase === 'verdict' && (
        <div className="flex flex-1 flex-col gap-3">
          {lastOutPlayer && lastOutRole && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white/5 px-4 py-2.5 text-center text-sm"
            >
              {t('games.mr-white.wasOut', {
                name: lastOutPlayer.name,
                role: tRaw(`games.mr-white.role.${lastOutRole}`),
              })}
            </motion.p>
          )}
          <p className="text-center text-sm text-muted text-balance">
            {t('games.mr-white.votePrompt')}
          </p>
          <PlayerPicker
            players={alive}
            selected={vote ? [vote] : []}
            onToggle={(id) => setVote((prev) => (prev === id ? null : id))}
          />
        </div>
      )}

      {phase === 'guess' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        >
          <span className="text-6xl" aria-hidden>
            🕳️
          </span>
          <p className="font-display text-3xl leading-tight text-gradient">
            {t('games.mr-white.wasWhite', { name: lastOutPlayer?.name ?? '' })}
          </p>
          <p className="max-w-xs text-muted text-balance">{t('games.mr-white.whiteGuessNote')}</p>
        </motion.div>
      )}

      {phase === 'over' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col justify-center gap-4"
        >
          <div className="text-center">
            <p className="font-display text-3xl leading-tight text-gradient">
              {outcome === 'civilians'
                ? t('games.mr-white.civiliansWin')
                : t('games.mr-white.impostorsWin')}
            </p>
            <p className="mt-2 text-sm text-muted">
              {t('games.mr-white.theWords', { civilian: civilianWord, undercover: undercoverWord })}
            </p>
            <p className="mt-1 font-display text-lg text-rose">
              {t('games.mr-white.losersDrink', { n: SIPS })}
            </p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {players.map((player) => {
              const role = roles[player.id] ?? 'civilian';
              const won =
                outcome === 'civilians' ? role === 'civilian' : role !== 'civilian';
              return (
                <li
                  key={player.id}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-2.5',
                    won ? 'bg-gradient-to-r from-lime/20 to-transparent' : 'bg-white/5',
                  )}
                >
                  <span aria-hidden>{player.avatar}</span>
                  <span className="min-w-0 flex-1 truncate font-display font-semibold">
                    {player.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {tRaw(`games.mr-white.role.${role}`)}
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </GameFrame>
  );
}

function RoleCounter({
  label,
  note,
  value,
  max,
  onChange,
}: {
  label: string;
  note: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const ceiling = Math.max(0, max);
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold">{label}</p>
        <p className="text-xs text-muted">{note}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label="-1"
          disabled={value <= 0}
          onClick={() => onChange(value - 1)}
        >
          −
        </Button>
        <span className="w-5 text-center font-display text-lg tabular-nums">{value}</span>
        <Button
          variant="outline"
          size="sm"
          aria-label="+1"
          disabled={value >= ceiling}
          onClick={() => onChange(value + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}
