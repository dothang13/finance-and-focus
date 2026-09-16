import React, { useState, useMemo } from 'react';
import { PieChart, TrendingDown, Sparkles } from 'lucide-react';

const PALETTE = [
  '#F43F5E', // Rose
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#A855F7', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#EAB308', // Yellow
  '#64748B'  // Slate
];

const formatVND = (num) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export default function ExpenseDonutChart({ transactions = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Group expenses by category
  const breakdown = useMemo(() => {
    let totalExpense = 0;
    const map = {};
    const groupMap = {};

    transactions.forEach(t => {
      if (t.type === 'Chi') {
        const amt = Number(t.amount) || 0;
        if (amt > 0) {
          totalExpense += amt;
          map[t.category] = (map[t.category] || 0) + amt;
          if (t.group) {
            groupMap[t.category] = t.group;
          }
        }
      }
    });

    const items = Object.entries(map)
      .map(([name, amount], index) => {
        const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        return {
          name,
          amount,
          percent,
          group: groupMap[name] || 'Thiết yếu',
          color: PALETTE[index % PALETTE.length]
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      items,
      totalExpense,
      topCategory: items[0] || null
    };
  }, [transactions]);

  // SVG Geometry: radius 54, circumference ~339.292
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Calculate slice stroke offsets
  let accumulatedOffset = 0;
  const slices = breakdown.items.map((item, idx) => {
    const fraction = breakdown.totalExpense > 0 ? item.amount / breakdown.totalExpense : 0;
    const strokeDash = fraction * CIRCUMFERENCE;
    const strokeGap = CIRCUMFERENCE - strokeDash;
    const offset = accumulatedOffset;
    accumulatedOffset += strokeDash;

    return {
      ...item,
      strokeDasharray: `${strokeDash} ${strokeGap}`,
      strokeDashoffset: -offset,
      idx
    };
  });

  const activeItem = hoveredIdx !== null ? breakdown.items[hoveredIdx] : null;

  if (breakdown.items.length === 0) {
    return (
      <div className="zen-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <PieChart size={18} color="var(--accent-rose)" />
          <span style={{ fontSize: '1rem', fontWeight: '600', color: '#FFFFFF' }}>
            Cơ Cấu Chi Tiêu
          </span>
        </div>
        <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
          Chưa có dữ liệu chi tiêu để vẽ biểu đồ tròn. Khi bạn ghi nhận các khoản chi, biểu đồ phân tích cơ cấu tiền sẽ hiển thị tại đây!
        </div>
      </div>
    );
  }

  return (
    <div className="zen-card" style={{ padding: '24px', marginBottom: '32px' }}>
      
      {/* Card Header & Main Insight */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="var(--accent-rose)" />
            <span style={{ fontSize: '1rem', fontWeight: '600', color: '#FFFFFF' }}>
              Cơ Cấu Chi Tiêu & Nơi Tiền Đi Nhiều Nhất
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Thống kê tỷ lệ phần trăm các danh mục chi tiêu giúp bạn kiểm soát dòng tiền
          </p>
        </div>

        {/* Top Expense Highlight Badge */}
        {breakdown.topCategory && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              fontSize: '0.76rem'
            }}
          >
            <TrendingDown size={14} color="var(--accent-rose)" />
            <span style={{ color: '#FAFAFA' }}>
              Chi nhiều nhất: <strong style={{ color: 'var(--accent-rose)' }}>{breakdown.topCategory.name}</strong> ({breakdown.topCategory.percent}%)
            </span>
          </div>
        )}
      </div>

      {/* Main Content: Donut Chart on Left + Detailed Legend on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) minmax(0, 1fr)', gap: '28px', alignItems: 'center' }}>
        
        {/* SVG Donut Chart with Interactive Hover */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <svg
            viewBox="0 0 160 160"
            style={{ width: '220px', height: '220px', transform: 'rotate(-90deg)', overflow: 'visible' }}
          >
            {/* Background Track Circle */}
            <circle
              cx="80"
              cy="80"
              r={RADIUS}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="18"
            />

            {/* Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredIdx === slice.idx;

              return (
                <circle
                  key={slice.name}
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? 23 : 18}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                    opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                    filter: isHovered ? `drop-shadow(0 0 8px ${slice.color})` : 'none'
                  }}
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Info inside Donut */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              width: '120px'
            }}
          >
            {activeItem ? (
              <>
                <div style={{ fontSize: '0.72rem', color: activeItem.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {activeItem.name}
                </div>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFFFFF', marginTop: '2px' }}>
                  {activeItem.percent}%
                </div>
                <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {formatVND(activeItem.amount)}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TỔNG CHI
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent-rose)', marginTop: '2px' }}>
                  {formatVND(breakdown.totalExpense)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  {breakdown.items.length} danh mục
                </div>
              </>
            )}
          </div>
        </div>

        {/* Categories Breakdown Legend List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Key Highlight Sentence */}
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', lineHeight: '1.5' }}>
            💡 <strong>Nhận định chi tiêu:</strong> Phần lớn tiền của bạn trong thời gian này dành cho{' '}
            <span style={{ color: breakdown.topCategory?.color || '#FFFFFF', fontWeight: '600' }}>
              {breakdown.topCategory?.name}
            </span>{' '}
            (chiếm <strong>{breakdown.topCategory?.percent}%</strong> tổng chi tiêu, tương đương {formatVND(breakdown.topCategory?.amount || 0)}).
          </div>

          {/* Slices list with progress fill bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
            {breakdown.items.map((item, idx) => {
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: isHovered ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: item.color,
                          boxShadow: isHovered ? `0 0 8px ${item.color}` : 'none'
                        }}
                      />
                      <span style={{ fontWeight: isHovered ? '600' : '500', color: '#FFFFFF' }}>
                        {item.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: item.group === 'Thiết yếu' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(168, 85, 247, 0.12)',
                          color: item.group === 'Thiết yếu' ? '#FBBF24' : '#D8B4FE',
                          fontWeight: '500'
                        }}
                      >
                        {item.group === 'Thiết yếu' ? 'Thiết yếu' : 'Mong muốn'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {formatVND(item.amount)}
                      </span>
                      <span className="font-mono" style={{ fontWeight: '700', color: item.color, minWidth: '35px', textAlign: 'right' }}>
                        {item.percent}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal mini bar */}
                  <div style={{ width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '2px', overflow: 'hidden', marginTop: '5px' }}>
                    <div
                      style={{
                        width: `${item.percent}%`,
                        height: '100%',
                        background: item.color,
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
