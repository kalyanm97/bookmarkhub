import { useEffect, useState } from 'react';

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'} ago`;
}

function computeLabel(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - then) / 1000);

  if (isNaN(then)) return 'some time ago';
  if (diffSec < 0) {
    if (Math.abs(diffSec) < 60) return 'just now';
  }

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return plural(Math.floor(diffSec / 60), 'min');
  if (diffSec < 86400) return plural(Math.floor(diffSec / 3600), 'hour');

  const days = Math.floor(diffSec / 86400);
  if (days < 30) return plural(days, 'day');

  const months = Math.floor(days / 30);
  if (months < 12) return plural(months, 'month');

  const years = Math.floor(days / 365);
  return plural(years, 'year');
}

function nextUpdateDelayMs(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  let diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 0) diffSec = Math.abs(diffSec);
  if (isNaN(then)) return 60_000;
  if (diffSec < 0) return Math.max(1_000, Math.abs(diffSec) * 1000);

  if (diffSec < 60) {
    return (60 - (diffSec % 60)) * 1000;
  }
  if (diffSec < 3600) {
    return (60 - (diffSec % 60)) * 1000;
  }
  if (diffSec < 86400) {
    return (3600 - (diffSec % 3600)) * 1000;
  }
  if (diffSec < 30 * 86400) {
    return (86400 - (diffSec % 86400)) * 1000;
  }
  return (86400 - (diffSec % 86400)) * 1000;
}

export default function useRelativeTime(iso: string) {
  const [label, setLabel] = useState(() => computeLabel(iso));

  useEffect(() => {
    let mounted = true;
    function tick() {
      if (!mounted) return;
      setLabel(computeLabel(iso));
      const ms = nextUpdateDelayMs(iso);
      timer = window.setTimeout(tick, ms);
    }

    let timer = window.setTimeout(tick, nextUpdateDelayMs(iso));
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [iso]);

  return label;
}
