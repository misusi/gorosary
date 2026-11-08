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

  return (
    <div className="runner">
      <div className="runner__bar">
        <span className="runner__step">{startLabel}</span>
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
        <span>
          {index + 1} / {steps.length}
        </span>
      </div>

      <div className="runner__body">
        <p className="runner__label">{step.label}</p>
        {step.text ? (
          <p className="runner__text">
            <InlineText text={step.text} />
          </p>
        ) : null}

        {step.meditation ? (
          <p className="runner__text" style={{ marginTop: 18, fontStyle: 'italic' }}>
            <InlineText text={step.meditation} />
          </p>
        ) : null}

        {step.scripture ? (
          <p className="small muted" style={{ marginTop: 10 }}>
            {step.scripture}
          </p>
        ) : null}

        {step.note ? (
          <p className="small muted" style={{ marginTop: 12, fontStyle: 'italic' }}>
            <InlineText text={step.note} />
          </p>
        ) : null}

        <div className="runner__controls">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setIndex((value) => Math.max(value - 1, 0))}
            disabled={index === 0}
          >
            Back
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setIndex((value) => Math.min(value + 1, steps.length - 1))}
            disabled={index === steps.length - 1}
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
      </div>
    </div>
  );
}
