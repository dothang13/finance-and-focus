import React, { useMemo } from 'react';
import { sound } from '../utils/audio';
import { ArrowRight, Plus, Clock } from 'lucide-react';

export default function Dashboard({ transactions, tasks, streak, setActiveTab, onOpenQuickAdd }) {
  
  const fin = useMemo(() => {
    let income = 0;
    let expense = 0;
    let savings = 0;

    transactions.forEach(t => {
      const a = Number(t.amount) || 0;
      if (t.type === 'Thu') income += a;
      else if (t.type === 'Chi') expense += a;
      else if (t.type === 'Tiết kiệm') savings += a;
    });

    return {
      income,
      expense,
      savings,
      net: income - expense,
      rate: income > 0 ? Math.round((savings / income) * 100) : 0
    };
  }, [transactions]);

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
            Kỷ luật chuỗi {streak?.currentStreak || 8} ngày • Nạp +{streak?.kanjiVocabCount || 0} từ vựng/Kanji • Tiết kiệm {fin.rate}% thu nhập
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
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SỐ DƯ KHẢ DỤNG</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#FFFFFF', marginTop: '8px' }}>
            {formatVND(fin.net)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Thu: {formatVND(fin.income)}
          </div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TỔNG ĐÃ CHI THÁNG 9</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--accent-rose)', marginTop: '8px' }}>
            {formatVND(fin.expense)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Bao gồm thiết yếu & mong muốn
          </div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>THỜI GIAN HỌC HÔM NAY</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#FFFFFF', marginTop: '8px' }}>
            {streak?.studyMinutesToday || 55}m
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Mục tiêu: {streak?.dailyGoalMinutes || 90}m
          </div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>MỤC TIÊU HOÀN THÀNH</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--accent-emerald)', marginTop: '8px' }}>
            {completedCount}/{tasks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Nhật N3 & Tiếng Anh
          </div>
        </div>

      </div>

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
            {transactions.slice(0, 4).map(t => (
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
            ))}
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
            {tasks.slice(0, 4).map(t => (
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
                    {t.lang === 'ja' ? 'Tiếng Nhật N3' : 'Tiếng Anh'} • {t.durationMin} phút
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: t.completed ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {t.completed ? 'Đã xong' : 'Chưa'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
