import React, { useMemo } from 'react';
import { sound } from '../utils/audio';
import { ArrowRight, Plus, Clock } from 'lucide-react';
import ExpenseDonutChart from './ExpenseDonutChart';

export default function Dashboard({ transactions, tasks, streak, setActiveTab, onOpenQuickAdd }) {
  const today = new Date();
  const currentMonthNum = today.getMonth() + 1;
  const currentMonthPrefix = `${today.getFullYear()}-${String(currentMonthNum).padStart(2, '0')}`;

  const fin = useMemo(() => {
    let allTimeIncome = 0;
    let allTimeExpense = 0;
    let allTimeSavings = 0;

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    let thisMonthSavings = 0;

    transactions.forEach(t => {
      const a = Number(t.amount) || 0;
      const isThisMonth = t.date && t.date.startsWith(currentMonthPrefix);

      if (t.type === 'Thu') {
        allTimeIncome += a;
        if (isThisMonth) thisMonthIncome += a;
      } else if (t.type === 'Chi') {
        allTimeExpense += a;
        if (isThisMonth) thisMonthExpense += a;
      } else if (t.type === 'Tiết kiệm') {
        allTimeSavings += a;
        if (isThisMonth) thisMonthSavings += a;
      }
    });

    const monthRate = thisMonthIncome > 0 ? Math.round((thisMonthSavings / thisMonthIncome) * 100) : 0;

    return {
      allTimeIncome,
      allTimeExpense,
      allTimeNet: allTimeIncome - allTimeExpense,
      thisMonthIncome,
      thisMonthExpense,
      thisMonthSavings,
      thisMonthNet: thisMonthIncome - thisMonthExpense,
      rate: monthRate
    };
  }, [transactions, currentMonthPrefix]);

  const thisMonthTransactions = useMemo(() => {
    return transactions.filter(t => t.date && t.date.startsWith(currentMonthPrefix));
  }, [transactions, currentMonthPrefix]);

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px' }}>
      
      {/* Top Banner */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '600', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            Tổng quan ngày
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Kỷ luật chuỗi {streak?.currentStreak ?? 0} ngày • Nạp +{streak?.kanjiVocabCount ?? 0} từ vựng/Kanji • Tiết kiệm {fin.rate}% thu nhập
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onOpenQuickAdd} className="btn-solid">
            <Plus size={15} />
            <span>Thêm chi tiêu</span>
          </button>
          <button onClick={() => { sound.playClick(); setActiveTab('study'); }} className="btn-ghost">
            <Clock size={15} />
            <span>Học ngoại ngữ</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        
        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SỐ DƯ TÍCH LŨY (VÍ)</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '600', color: fin.allTimeNet >= 0 ? '#FFFFFF' : 'var(--accent-rose)', marginTop: '8px' }}>
            {formatVND(fin.allTimeNet)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Thu tháng {currentMonthNum}: +{formatVND(fin.thisMonthIncome)}
          </div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TỔNG ĐÃ CHI THÁNG {currentMonthNum}</div>
            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.12)', color: 'var(--accent-rose)' }}>
              Tháng này
            </span>
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--accent-rose)', marginTop: '8px' }}>
            {formatVND(fin.thisMonthExpense)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {fin.thisMonthNet >= 0 ? `Dư thu-chi tháng: +${formatVND(fin.thisMonthNet)}` : `Bội chi tháng: -${formatVND(Math.abs(fin.thisMonthNet))}`}
          </div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>THỜI GIAN HỌC HÔM NAY</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#FFFFFF', marginTop: '8px' }}>
            {streak?.studyMinutesToday ?? 0}m
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Mục tiêu: {streak?.dailyGoalMinutes ?? 90}m
          </div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>MỤC TIÊU HOÀN THÀNH</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--accent-emerald)', marginTop: '8px' }}>
            {completedCount}/{tasks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Học tập & Deep Work
          </div>
        </div>

      </div>

      {/* Spending Breakdown & Donut Chart (Current Month Priority) */}
      <ExpenseDonutChart
        transactions={thisMonthTransactions.length > 0 ? thisMonthTransactions : transactions}
      />

      {/* Dual Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Left: Recent Transactions */}
        <div className="zen-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF' }}>Giao dịch gần đây</span>
            <button
              onClick={() => { sound.playClick(); setActiveTab('finance'); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Xem tất cả</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '24px 0', textAlign: 'center' }}>
                Chưa có giao dịch nào được ghi nhận.
              </div>
            ) : (
              transactions.slice(0, 4).map(t => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: '500' }}>{t.category}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>{t.date} • {t.method}</div>
                  </div>
                  <span className="font-mono" style={{
                    fontWeight: '600',
                    color: t.type === 'Thu' ? 'var(--accent-emerald)' : t.type === 'Tiết kiệm' ? '#A78BFA' : '#FFFFFF'
                  }}>
                    {t.type === 'Thu' ? '+' : '-'}{formatVND(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Today's Tasks */}
        <div className="zen-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF' }}>Nhiệm vụ trọng tâm</span>
            <button
              onClick={() => { sound.playClick(); setActiveTab('study'); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Phòng học</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tasks.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '24px 0', textAlign: 'center' }}>
                Chưa có nhiệm vụ nào hôm nay.
              </div>
            ) : (
              tasks.slice(0, 4).map(t => {
                const label = t.lang === 'ja' ? '🇯🇵 Nhật N3' : t.lang === 'en' ? '🇬🇧 Tiếng Anh' : t.lang === 'deep' ? '⚡ Deep Work' : '📌 Cá nhân';
                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <div style={{ color: t.completed ? 'var(--text-faint)' : '#FFFFFF', textDecoration: t.completed ? 'line-through' : 'none' }}>
                        {t.title}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
                        {label} • {t.durationMin} phút
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: t.completed ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      {t.completed ? 'Đã xong' : 'Chưa'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
