import React from 'react';

export default function SevenSegmentClock({ totalSeconds, isFullScreen = false, ledColor = '#FFFFFF' }) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  const minStr = String(mins).padStart(2, '0');
  const secStr = String(secs).padStart(2, '0');

  return (
    <div
      className={`digital-alarm-screen ${isFullScreen ? 'digital-alarm-fullscreen' : ''}`}
      style={{
        boxShadow: isFullScreen
          ? `inset 0 0 60px rgba(0, 0, 0, 0.98), 0 30px 90px rgba(0, 0, 0, 0.95), 0 0 45px ${ledColor}28`
          : `inset 0 0 25px rgba(0, 0, 0, 0.95), 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px ${ledColor}18`
      }}
    >
      <div className="digital-alarm-inner">
        {/* Lớp nền mờ 88:88 chuẩn màn hình điện tử LCD/LED */}
        <div
          className="digital-alarm-ghost"
          style={{ color: ledColor }}
          aria-hidden="true"
        >
          88:88
        </div>

        {/* Số điện tử Digital-7 phát sáng chuẩn nét như hình chụp đồng hồ */}
        <div
          className="digital-alarm-digits"
          style={{
            color: ledColor,
            textShadow: `
              0 0 6px ${ledColor},
              0 0 18px ${ledColor}aa,
              0 0 40px ${ledColor}44
            `
          }}
        >
          <span>{minStr}</span>
          <span className="digital-colon-blink">:</span>
          <span>{secStr}</span>
        </div>
      </div>
    </div>
  );
}
