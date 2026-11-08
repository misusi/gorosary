'use client';

import { useEffect, useState } from 'react';
import { InlineText } from './Blocks';
import type { RunnerStep } from '@/lib/rosary-steps';

export function StepRunner({
  steps,
  startLabel,
}: {
  steps: RunnerStep[];
  startLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const step = steps[index];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      }
      if (event.key === 'ArrowRight') {
        setIndex((value) => Math.min(value + 1, steps.length - 1));
      }
      if (event.key === 'ArrowLeft') {
        setIndex((value) => Math.max(value - 1, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steps.length]);

  if (!step) return null;

  const percent = Math.round(((index + 1) / steps.length) * 100);
  const atStart = index === 0;
  const atEnd = index === steps.length - 1;

  return (
    <div className="runner">
      {/*
        The controls sit in a sticky bar at the top of the runner. The point
        is that they never move: the button you press is always in the same
        place, whatever length the prayer underneath it happens to be.
      */}
      <div className="runner__bar">
        <div className="runner__controls">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setIndex((value) => Math.max(value - 1, 0))}
            disabled={atStart}
          >
            Back
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setIndex((value) => Math.min(value + 1, steps.length - 1))}
            disabled={atEnd}
          >
            Next
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setIndex(steps.length - 1)}
          >
            Skip to end
          </button>
        </div>

        <div
          className="runner__progress"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Prayer progress"
        >
          <span style={{ width: `${percent}%` }} />
        </div>

        <span className="runner__count">
          {index + 1} / {steps.length}
        </span>
      </div>

      <div className="runner__body">
        <p className="runner__label">{startLabel}</p>
        <h3 className="runner__step">{step.label}</h3>

        {step.text ? (
          <p className="runner__text">
            <InlineText text={step.text} />
          </p>
        ) : null}

        {step.meditation ? (
          <p className="runner__text runner__text--meditation">
            <InlineText text={step.meditation} />
          </p>
        ) : null}

        {step.scripture ? (
          <p className="small muted" style={{ marginTop: 10 }}>
            {step.scripture}
          </p>
        ) : null}

        {step.note ? (
          <p className="small muted runner__note">
            <InlineText text={step.note} />
          </p>
        ) : null}
      </div>
    </div>
  );
}
