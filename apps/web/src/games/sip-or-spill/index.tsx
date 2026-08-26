import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useI18n } from '@/i18n';
import type { LocalGameProps } from '@/games/types';
import { usePile } from '@/games/_kit/pile';
import { at, label } from '@/games/_kit/players';
import { CardFace, GameFrame, NeedPlayers, SwipeCard, Tally, TurnBanner } from '@/games/_kit/ui';
import { haptic } from '@/lib/haptics';
import { SIP_DECK } from './deck';

const SIPS = 2;

/**
 * One question, one person, two ways out. There is nothing to hide from the
 * table here, so the card is simply on screen the whole time.
 */
export default function SipOrSpill({ players, adult, onExit }: LocalGameProps) {
  const { t, loc } = useI18n();
  const pile = usePile(SIP_DECK, adult);
  const [turn, setTurn] = useState(0);
  const [sips, setSips] = useState<Record<string, number>>({});
  const [spills, setSpills] = useState<Record<string, number>>({});

  const current = at(players, turn);

  const resolve = useCallback(
    (drank: boolean) => {
      haptic(drank ? 'fail' : 'success');
      if (current) {
        const bump = (prev: Record<string, number>) => ({
          ...prev,
          [current.id]: (prev[current.id] ?? 0) + (drank ? SIPS : 1),
        });
        if (drank) setSips(bump);
        else setSpills(bump);
      }
      setTurn((n) => n + 1);
      pile.draw();
    },
    [current, pile],
  );

  if (players.length < 2) {
    return (
      <NeedPlayers
        emoji="🫗"
        message={t('games.sip-or-spill.needPlayers')}
        cta={t('game.otherGame')}
        onExit={onExit}
      />
    );
  }

  const card = pile.card;

  return (
    <GameFrame
      status={t('game.round', { n: turn + 1 })}
      chips={
        <>
          <Chip tone="warn">{t('games.sip-or-spill.stake', { n: SIPS })}</Chip>
          {adult && <Chip tone="accent">18+</Chip>}
        </>
      }
      hint={t('games.sip-or-spill.rules')}
      footer={
        <>
          <Tally players={players} values={sips} unit={t('games.sip-or-spill.sipsUnit')} />
          <Tally players={players} values={spills} unit={t('games.sip-or-spill.spillsUnit')} />
        </>
      }
      actions={
        <>
          <Button variant="primary" size="xl" full glow onClick={() => resolve(false)}>
            🗣️ {t('games.sip-or-spill.spill')}
          </Button>
          <Button variant="danger" size="lg" full onClick={() => resolve(true)}>
            🫗 {t('games.sip-or-spill.sip', { n: SIPS })}
          </Button>
        </>
      }
    >
      <div className="mb-5">
        <TurnBanner
          kicker={t('games.sip-or-spill.onTheSpot')}
          name={label(current, t('game.anyone'))}
        />
      </div>
      <SwipeCard cardKey={card?.id ?? 'none'} onNext={pile.draw} onBack={pile.back}>
        <CardFace
          kicker={t('games.sip-or-spill.question')}
          tone="text-orange"
          text={card ? loc(card.text) : ''}
          adult={card?.adult ?? false}
        />
      </SwipeCard>
    </GameFrame>
  );
}

