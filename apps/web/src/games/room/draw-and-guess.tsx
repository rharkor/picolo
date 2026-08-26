import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DrawPublic } from '@piccolo/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptics';
import type { RoomViewProps } from './types';
import { HostStage, PhonePanel, Waiting } from './ui';

const SIZE = 1000;

/** Strokes arrive as events, so both views keep their own copy of the drawing. */
function useCanvasState(pub: DrawPublic | null, event: RoomViewProps['event']) {
  const [strokes, setStrokes] = useState<number[][]>([]);
  const [guesses, setGuesses] = useState<{ id: string; text: string }[]>([]);
  const round = pub?.round ?? 0;
  const published = pub?.strokes;
  const lastSeq = useRef(0);

  // A published list is authoritative: it arrives on a phase change or when
  // somebody reconnects, and it is the only thing that can resync a screen.
  useEffect(() => {
    setStrokes(published ?? []);
  }, [published, round]);

  useEffect(() => {
    setGuesses([]);
  }, [round]);

  useEffect(() => {
    if (!event || event.seq === lastSeq.current) return;
    lastSeq.current = event.seq;
    if (event.event === 'stroke' && Array.isArray(event.payload)) {
      setStrokes((prev) => [...prev, event.payload as number[]]);
    } else if (event.event === 'clear') {
      setStrokes([]);
    } else if (event.event === 'guess') {
      const payload = event.payload as { id: string; text: string } | undefined;
      if (payload) setGuesses((prev) => [...prev.slice(-11), payload]);
    }
  }, [event]);

  return { strokes, guesses };
}

function Canvas({ strokes, className }: { strokes: number[][]; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={cn('aspect-square w-full rounded-[2rem] bg-white', className)}
    >
      {strokes.map((points, i) => (
        <polyline
          key={i}
          points={points.reduce<string[]>((acc, value, index) => {
            if (index % 2 === 0) acc.push(`${value},${points[index + 1] ?? 0}`);
            return acc;
          }, []).join(' ')}
          fill="none"
          stroke="#14121c"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function Host({ state, event, action, canDrive }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as DrawPublic | null;
  const canvas = useCanvasState(pub?.kind === 'draw' ? pub : null, event);
  if (pub?.kind !== 'draw') return null;

  const artist = state.players.find((p) => p.id === pub.artist);
  const winner = state.players.find((p) => p.id === pub.winner);
  const shown = [...pub.guesses.filter((g) => !g.correct), ...canvas.guesses].slice(-10);

  return (
    <HostStage
      kicker={t('games.draw-and-guess.roomKicker')}
      title={
        pub.phase === 'reveal'
          ? winner
            ? t('games.draw-and-guess.gotIt', { name: winner.name, word: pub.word ?? '' })
            : t('games.draw-and-guess.nobodyGotIt', { word: pub.word ?? '' })
          : t('games.draw-and-guess.drawing', { name: artist?.name ?? '' })
      }
      chips={<Chip tone="warn">{t('game.round', { n: pub.round })}</Chip>}
      footer={
        canDrive ? (
          pub.phase === 'reveal' ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="primary" size="xl" full glow onClick={() => action('next')}>
                {t('games.draw-and-guess.nextArtist')}
              </Button>
              <Button variant="surface" size="lg" full onClick={() => action('finish')}>
                {t('room.game.finalScores')}
              </Button>
            </div>
          ) : (
            <Button variant="surface" size="lg" full onClick={() => action('force')}>
              {t('games.draw-and-guess.giveUp')}
            </Button>
          )
        ) : undefined
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <Canvas strokes={canvas.strokes} className="max-h-[52dvh]" />
        <ul className="flex max-h-[52dvh] flex-col gap-1.5 overflow-hidden md:w-64">
          {shown.map((guess, i) => {
            const player = state.players.find((p) => p.id === guess.id);
            return (
              <motion.li
                key={`${guess.id}-${i}-${guess.text}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl bg-white/5 px-3 py-2 text-sm"
              >
                <span className="text-muted">{player?.name ?? ''}: </span>
                {guess.text}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </HostStage>
  );
}

export function Phone({ state, self, privateState, event, action }: RoomViewProps) {
  const { t } = useI18n();
  const pub = state.public as DrawPublic | null;
  const secret = privateState as { word?: string; artist?: boolean } | null;
  const canvas = useCanvasState(pub?.kind === 'draw' ? pub : null, event);
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const drawing = useRef<number[]>([]);
  const [live, setLive] = useState<number[]>([]);
  const round = pub?.kind === 'draw' ? pub.round : 0;

  useEffect(() => {
    setSent([]);
    setDraft('');
    setLive([]);
    drawing.current = [];
  }, [round]);

  const point = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return [
      Math.round(((e.clientX - box.left) / box.width) * SIZE),
      Math.round(((e.clientY - box.top) / box.height) * SIZE),
    ];
  }, []);

  const down = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      drawing.current = point(e);
      setLive([...drawing.current]);
    },
    [point],
  );

  const move = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (drawing.current.length === 0) return;
      drawing.current = [...drawing.current, ...point(e)];
      setLive([...drawing.current]);
    },
    [point],
  );

  const up = useCallback(() => {
    if (drawing.current.length >= 4) action('stroke', drawing.current);
    drawing.current = [];
    setLive([]);
  }, [action]);

  const guess = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    haptic('tap');
    setSent((prev) => [...prev.slice(-4), text]);
    setDraft('');
    action('guess', text);
  }, [action, draft]);

  if (pub?.kind !== 'draw') return null;
  const isArtist = secret?.artist === true || self?.id === pub.artist;

  if (pub.phase === 'reveal') {
    return (
      <PhonePanel
        kicker={t('games.draw-and-guess.roomKicker')}
        title={pub.word ?? ''}
        hint={t('room.game.lookUp')}
      />
    );
  }

  if (isArtist) {
    return (
      <PhonePanel
        kicker={t('games.draw-and-guess.roomKicker')}
        title={secret?.word ?? ''}
        hint={t('games.draw-and-guess.drawHint')}
        footer={
          <Button variant="surface" size="lg" full onClick={() => action('clear')}>
            {t('games.draw-and-guess.clear')}
          </Button>
        }
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="aspect-square w-full touch-none rounded-[2rem] bg-white"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {[...canvas.strokes, live].map((points, i) => (
            <polyline
              key={i}
              points={points
                .reduce<string[]>((acc, value, index) => {
                  if (index % 2 === 0) acc.push(`${value},${points[index + 1] ?? 0}`);
                  return acc;
                }, [])
                .join(' ')}
              fill="none"
              stroke="#14121c"
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </PhonePanel>
    );
  }

  return (
    <PhonePanel
      kicker={t('games.draw-and-guess.roomKicker')}
      title={t('games.draw-and-guess.guessTitle')}
      hint={t('games.draw-and-guess.guessHint')}
      footer={
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') guess();
            }}
            maxLength={40}
            placeholder={t('games.draw-and-guess.guessPlaceholder')}
            aria-label={t('games.draw-and-guess.guessPlaceholder')}
            className="glass min-w-0 flex-1 rounded-2xl px-4 py-3 text-base outline-none focus:border-fuchsia/50"
          />
          <Button variant="primary" size="lg" disabled={draft.trim().length === 0} onClick={guess}>
            {t('room.game.submit')}
          </Button>
        </div>
      }
    >
      {sent.length === 0 ? (
        <Waiting label={t('games.draw-and-guess.watchScreen')} />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {sent.map((text, i) => (
            <li key={`${text}-${i}`} className="rounded-2xl bg-white/5 px-4 py-2 text-sm text-muted">
              {text}
            </li>
          ))}
        </ul>
      )}
    </PhonePanel>
  );
}
