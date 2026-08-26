import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { sfx } from '@/games/_kit/audio';
import { usePile } from '@/games/_kit/pile';
import { at, label } from '@/games/_kit/players';
import { CardFace, GameFrame, NeedPlayers, TurnBanner } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';
import { PARANOIA_DECK } from './deck';

/**
 * The only game in here where hiding the screen *is* the game: the question is
 * whispered, the answer is public, and whether anyone ever learns what was
 * asked is bought with a drink. So the handoff step stays.
 */
type Phase = 'handoff' | 'asking' | 'revealed' | 'sealed';

const SIPS = 3;

export default function Paranoia({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(PARANOIA_DECK, adult, false);
  const [phase, setPhase] = useState<Phase>('handoff');
  const [turn, setTurn] = useState(0);
  const [revealed, setRevealed] = useState(0);

  const asker = at(players, turn);
  const answerer = at(players, turn + 1);

  const showQuestion = useCallback(() => {
    haptic('heavy');
    pile.draw();
    setPhase('asking');
  }, [pile]);

  const settle = useCallback((drank: boolean) => {
    haptic(drank ? 'success' : 'tap');
    if (drank) {
      sfx.reveal();
      setRevealed((n) => n + 1);
    }
    setPhase(drank ? 'revealed' : 'sealed');
  }, []);

  const nextRound = useCallback(() => {
    haptic('select');
    setTurn((n) => n + 1);
    setPhase('handoff');
  }, []);

  if (players.length < 4) {
    return (
      <NeedPlayers
        emoji="🤫"
        message={t('games.paranoia.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const card = pile.card;
  const question = card ? loc(card.text) : '';

  return (
    <GameFrame
      status={t('game.round', { n: turn + 1 })}
      chips={
        <>
          {revealed > 0 && <Chip tone="warn">👀 {revealed}</Chip>}
          {adult && <Chip tone="accent">18+</Chip>}
        </>
      }
      hint={t('games.paranoia.rules')}
      actions={
        phase === 'handoff' ? (
          <Button variant="primary" size="xl" full glow onClick={showQuestion}>
            👀 {t('games.paranoia.showMine')}
          </Button>
        ) : phase === 'asking' ? (
          <>
            <Button variant="primary" size="xl" full glow onClick={() => settle(true)}>
              🫗 {t('games.paranoia.paidUp', { n: SIPS })}
            </Button>
            <Button variant="surface" size="lg" full onClick={() => settle(false)}>
              🙈 {t('games.paranoia.letItGo')}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="xl" full glow onClick={nextRound}>
            {t('games.paranoia.nextRound')}
          </Button>
        )
      }
    >
      {phase === 'handoff' && (
        <motion.div
          key={`handoff-${turn}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        >
          <span className="text-6xl" aria-hidden>
            🤫
          </span>
          <TurnBanner
            kicker={t('games.paranoia.passTo')}
            name={label(asker, t('game.anyone'))}
            note={t('games.paranoia.nobodyElse')}
          />
        </motion.div>
      )}

      {phase === 'asking' && (
        <motion.div
          key={`asking-${turn}`}
          initial={{ opacity: 0, rotateX: -60 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          style={{ transformPerspective: 1000 }}
          className="flex flex-1 flex-col"
        >
          <CardFace
            kicker={t('games.paranoia.yourQuestion')}
            tone="text-indigo"
            text={question}
            adult={card?.adult ?? false}
          >
            <p className="text-sm text-muted text-balance">
              {t('games.paranoia.whisperTo', { name: answerer?.name ?? '' })}
            </p>
          </CardFace>
          <p className="mt-4 text-center text-sm text-muted text-balance">
            {t('games.paranoia.thenWhat', { n: SIPS })}
          </p>
        </motion.div>
      )}

      {phase === 'revealed' && (
        <motion.div
          key={`revealed-${turn}`}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="flex flex-1 flex-col"
        >
          <CardFace
            kicker={t('games.paranoia.itWas')}
            tone="text-amber"
            text={question}
            size="xl"
          />
        </motion.div>
      )}

      {phase === 'sealed' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl" aria-hidden>
            🔒
          </span>
          <p className="font-display text-2xl leading-tight text-gradient">
            {t('games.paranoia.sealed')}
          </p>
          <p className="max-w-xs text-muted text-balance">{t('games.paranoia.sealedNote')}</p>
        </div>
      )}
    </GameFrame>
  );
}
