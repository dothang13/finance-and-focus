import React from 'react';
import { Flame, Calendar, X, CheckCircle2 } from 'lucide-react';

export default function StreakModal({ onClose, streak }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  // Days in current month & start day offset (0: Sun, 1: Mon, ...)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOffset = new Date(currentYear, currentMonth, 1).getDay();

  const currentStreakCount = streak?.currentStreak ?? 0;
  const bestStreakCount = streak?.bestStreak ?? 0;

  // Active days: if streak > 0, mark the last currentStreakCount days up to today
  const activeDays = [];
  if (currentStreakCount > 0) {
    for (let i = 0; i < currentStreakCount; i++) {
      const d = todayDate - i;
      if (d >= 1) activeDays.push(d);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px', maxWidth: '440px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} color="#F59E0B" />
            <span style={{ fontSize: '1rem', fontWeight: '600', color: '#FFFFFF' }}>Lịch Kỷ Luật & Chuỗi Ngày</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--bg-app)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CHUỖI HIỆN TẠI</div>
            <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '700', color: '#FBBF24', marginTop: '4px' }}>
              {currentStreakCount} ngày
            </div>
          </div>

          <div style={{ background: 'var(--bg-app)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KỶ LỤC DÀI NHẤT</div>
            <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '700', color: '#FFFFFF', marginTop: '4px' }}>
              {bestStreakCount} ngày
            </div>
          </div>
        </div>

        {/* Calendar Month View */}
        <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#FFFFFF' }}>
              <Calendar size={14} color="var(--text-muted)" />
              <span>Tháng {currentMonth + 1} / {currentYear}</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {activeDays.length > 0 ? `${activeDays.length} ngày kỷ luật` : 'Chưa có chuỗi'}
            </span>
          </div>

          {/* Weekday labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {/* Empty slots for start of month */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={'empty_' + i} style={{ height: '34px' }} />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isActive = activeDays.includes(dayNum);
              const isToday = dayNum === todayDate;

              return (
                <div
                  key={dayNum}
                  style={{
                    height: '34px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-xs)',
                    background: isActive ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                    border: isToday ? '1px solid #FFFFFF' : isActive ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                    color: isActive ? '#FDE68A' : dayNum > todayDate ? 'var(--text-faint)' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: isActive || isToday ? '600' : '400',
                    position: 'relative'
                  }}
                >
                  <span>{dayNum}</span>
                  {isActive && (
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#F59E0B', marginTop: '1px' }} />
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Motivational message */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: currentStreakCount > 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.05)', border: currentStreakCount > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-subtle)' }}>
          <CheckCircle2 size={16} color={currentStreakCount > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
          <span style={{ fontSize: '0.78rem', color: currentStreakCount > 0 ? '#D1FAE5' : 'var(--text-secondary)' }}>
            {currentStreakCount > 0 
              ? 'Hôm nay bạn đã duy trì chuỗi thành công! Tiếp tục đà phong độ nhé.' 
              : 'Hãy hoàn thành một nhiệm vụ hôm nay để thắp sáng chuỗi kỷ luật!'}
          </span>
        </div>

      </div>
    </div>
  );
}
