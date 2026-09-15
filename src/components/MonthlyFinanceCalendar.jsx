import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const formatCompactVND = (num) => {
  if (!num) return '0';
  if (num >= 1000000) {
    const m = num / 1000000;
    return m % 1 === 0 ? `${m}tr` : `${m.toFixed(1).replace('.0', '')}tr`;
  }
  if (num >= 1000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(0)}k`;
  }
  return `${num}`;
};

const formatVND = (num) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export default function MonthlyFinanceCalendar({
  transactions = [],
  year,
  month, // 0-indexed: 0 = Jan, 8 = Sep
  onChangeMonth,
  selectedDate,
  onSelectDate,
  onResetMonth
}) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Pre-calculate daily totals from transactions
  const dailyTotals = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (!t.date) return;
      if (!map[t.date]) {
        map[t.date] = { income: 0, expense: 0, savings: 0, count: 0 };
      }
      const amt = Number(t.amount) || 0;
      if (t.type === 'Thu') map[t.date].income += amt;
      else if (t.type === 'Chi') map[t.date].expense += amt;
      else if (t.type === 'Tiết kiệm') map[t.date].savings += amt;
      map[t.date].count += 1;
    });
    return map;
  }, [transactions]);

  // Monthly aggregated stats
  const monthStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let savings = 0;
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

    transactions.forEach(t => {
      if (t.date && t.date.startsWith(monthPrefix)) {
        const a = Number(t.amount) || 0;
        if (t.type === 'Thu') income += a;
        else if (t.type === 'Chi') expense += a;
        else if (t.type === 'Tiết kiệm') savings += a;
      }
    });

    return {
      income,
      expense,
      savings,
      net: income - expense
    };
  }, [transactions, year, month]);

  // Calendar Grid generation
  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month padding days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        stats: dailyTotals[dateStr] || null
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        stats: dailyTotals[dateStr] || null
      });
    }

    // Next month padding days to complete full weeks
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false,
        stats: dailyTotals[dateStr] || null
      });
    }

    return cells;
  }, [year, month, dailyTotals]);

  const monthLabel = `Tháng ${String(month + 1).padStart(2, '0')} / ${year}`;

  return (
    <div className="zen-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
      
      {/* Calendar Header: Navigation & Monthly Aggregates */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Month Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => { sound.playClick(); onChangeMonth(-1); }}
              className="btn-ghost"
              style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
              title="Tháng trước"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontSize: '1rem', fontWeight: '600', color: '#FFFFFF', minWidth: '135px', textAlign: 'center' }}>
              {monthLabel}
            </span>

            <button
              onClick={() => { sound.playClick(); onChangeMonth(1); }}
              className="btn-ghost"
              style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
              title="Tháng sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => { sound.playClick(); onResetMonth(); }}
            className="btn-ghost"
            style={{ fontSize: '0.74rem', padding: '4px 10px', color: 'var(--text-secondary)' }}
            title="Trở về tháng hiện tại"
          >
            Hôm nay
          </button>
        </div>

        {/* Monthly Summary Badges: Thu Xanh Dương, Chi Đỏ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Thu:</span>
            <span className="font-mono" style={{ fontWeight: '600', color: '#3B82F6' }}>
              +{formatVND(monthStats.income)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Chi:</span>
            <span className="font-mono" style={{ fontWeight: '600', color: '#EF4444' }}>
              -{formatVND(monthStats.expense)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Dư:</span>
            <span className="font-mono" style={{ fontWeight: '600', color: monthStats.net >= 0 ? '#10B981' : '#EF4444' }}>
              {monthStats.net >= 0 ? '+' : ''}{formatVND(monthStats.net)}
            </span>
          </div>
        </div>
      </div>

      {/* Weekdays Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px', marginBottom: '8px', textAlign: 'center' }}>
        {WEEKDAYS.map((w, idx) => (
          <div
            key={w}
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: idx >= 5 ? 'var(--text-secondary)' : 'var(--text-muted)',
              padding: '4px 0'
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid of Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px' }}>
        {calendarCells.map((cell, idx) => {
          const isSelected = selectedDate === cell.dateStr;
          const isToday = cell.dateStr === todayStr;
          const hasIncome = cell.stats && cell.stats.income > 0;
          const hasExpense = cell.stats && cell.stats.expense > 0;

          return (
            <div
              key={idx}
              onClick={() => {
                sound.playClick();
                // Toggle selection
                if (isSelected) {
                  onSelectDate(null); // Deselect to view entire month
                } else {
                  onSelectDate(cell.dateStr);
                }
              }}
              style={{
                minHeight: '64px',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                background: isSelected
                  ? 'rgba(59, 130, 246, 0.12)'
                  : cell.isCurrentMonth
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(255, 255, 255, 0.005)',
                border: isSelected
                  ? '1px solid #3B82F6'
                  : isToday
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                opacity: cell.isCurrentMonth ? 1 : 0.3,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              className="calendar-day-cell"
            >
              {/* Day Number & Today Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: isToday ? '700' : '500',
                    color: isToday ? '#FFFFFF' : isSelected ? '#60A5FA' : 'var(--text-primary)'
                  }}
                >
                  {cell.dayNum}
                </span>

                {isToday && (
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#3B82F6',
                      boxShadow: '0 0 6px #3B82F6'
                    }}
                    title="Hôm nay"
                  />
                )}
              </div>

              {/* Day Badges: Income (Blue) & Expense (Red) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start', marginTop: '4px' }}>
                {hasIncome && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: '600',
                      color: '#3B82F6',
                      lineHeight: '1.2',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                    title={`Thu: +${formatVND(cell.stats.income)}`}
                  >
                    +{formatCompactVND(cell.stats.income)}
                  </span>
                )}

                {hasExpense && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: '600',
                      color: '#EF4444',
                      lineHeight: '1.2',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                    title={`Chi: -${formatVND(cell.stats.expense)}`}
                  >
                    -{formatCompactVND(cell.stats.expense)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Filter Banner */}
      {selectedDate && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '14px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: '0.78rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={14} color="#3B82F6" />
            <span style={{ color: '#FFFFFF' }}>
              Đang lọc theo ngày: <strong>{selectedDate}</strong>
            </span>
          </div>

          <button
            onClick={() => { sound.playClick(); onSelectDate(null); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#60A5FA',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: '500'
            }}
          >
            Hiển thị toàn bộ tháng ({monthLabel})
          </button>
        </div>
      )}

    </div>
  );
}
