import React, { useState, useEffect, useRef } from 'react';

// Single digit flip card
function FlipDigit({ digit }) {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevRef = useRef(digit);

  useEffect(() => {
    if (prevRef.current !== digit) {
      setPrevious(prevRef.current);
      setCurrent(digit);
      setIsFlipping(true);
      prevRef.current = digit;

      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [digit]);

  return (
    <div className="flip-card-unit">
      {/* Background Static Cards */}
      <div className="flip-half flip-top">
        <span className="flip-text">{current}</span>
      </div>
      <div className="flip-half flip-bottom">
        <span className="flip-text">{isFlipping ? previous : current}</span>
      </div>

      {/* Foreground Flipping Flaps */}
      {isFlipping && (
        <>
          <div className="flip-half flip-top flip-anim-top">
            <span className="flip-text">{previous}</span>
          </div>
          <div className="flip-half flip-bottom flip-anim-bottom">
            <span className="flip-text">{current}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function FlipClock({ totalSeconds, isFullScreen = false }) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  const minStr = String(mins).padStart(2, '0');
  const secStr = String(secs).padStart(2, '0');

  const m1 = minStr[0];
  const m2 = minStr[1];
  const s1 = secStr[0];
  const s2 = secStr[1];

  return (
    <div className={`flip-clock-container ${isFullScreen ? 'flip-clock-fullscreen' : ''}`}>
      {/* Minute Group */}
      <div className="flip-group">
        <FlipDigit digit={m1} />
        <FlipDigit digit={m2} />
        <span className="flip-group-label">Phút</span>
      </div>

      {/* Colon Divider */}
      <div className="flip-colon">
        <div className="flip-colon-dot" />
        <div className="flip-colon-dot" />
      </div>

      {/* Second Group */}
      <div className="flip-group">
        <FlipDigit digit={s1} />
        <FlipDigit digit={s2} />
        <span className="flip-group-label">Giây</span>
      </div>
    </div>
  );
}
