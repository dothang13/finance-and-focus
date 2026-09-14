import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { sound } from '../utils/audio';

const CATEGORIES = [
  { name: 'Nhà ở & Tiền thuê', group: 'Thiết yếu', type: 'Chi' },
  { name: 'Ăn uống & Nhu yếu phẩm', group: 'Thiết yếu', type: 'Chi' },
  { name: 'Đi lại & Xăng xe', group: 'Thiết yếu', type: 'Chi' },
  { name: 'Tiện ích & Dịch vụ số', group: 'Thiết yếu', type: 'Chi' },
  { name: 'Y tế & Bảo hiểm', group: 'Thiết yếu', type: 'Chi' },
  { name: 'Cà phê & Gặp gỡ', group: 'Mong muốn', type: 'Chi' },
  { name: 'Mua sắm cá nhân', group: 'Mong muốn', type: 'Chi' },
  { name: 'Du lịch & Giải trí', group: 'Mong muốn', type: 'Chi' },
  { name: 'Khóa học & Kỹ năng', group: 'Mong muốn', type: 'Chi' },
  { name: 'Quỹ khẩn cấp', group: 'Tiết kiệm', type: 'Tiết kiệm' },
  { name: 'Đầu tư tích lũy', group: 'Tiết kiệm', type: 'Tiết kiệm' },
  { name: 'Tiết kiệm mục tiêu', group: 'Tiết kiệm', type: 'Tiết kiệm' },
  { name: 'Lương tháng', group: 'Thu nhập', type: 'Thu' },
  { name: 'Thưởng', group: 'Thu nhập', type: 'Thu' }
];

export default function FinFlow({ transactions, setTransactions }) {
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  // Form
  const [type, setType] = useState('Chi');
  const [category, setCategory] = useState('Ăn uống & Nhu yếu phẩm');
  const [group, setGroup] = useState('Thiết yếu');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Chuyển khoản');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Statistics
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let savings = 0;
    let needsSpent = 0;
    let wantsSpent = 0;

    transactions.forEach(t => {
      const a = Number(t.amount) || 0;
      if (t.type === 'Thu') income += a;
      else if (t.type === 'Tiết kiệm') savings += a;
      else if (t.type === 'Chi') {
        expense += a;
        if (t.group === 'Thiết yếu') needsSpent += a;
        if (t.group === 'Mong muốn') wantsSpent += a;
      }
    });

    const net = income - expense;
    const rate = income > 0 ? Math.round((savings / income) * 100) : 0;
    const base = income > 0 ? income : 30000000;

    return {
      income,
      expense,
      savings,
      net,
      rate,
      needsSpent,
      needsBudget: Math.round(base * 0.50),
      wantsSpent,
      wantsBudget: Math.round(base * 0.30),
      savingsBudget: Math.round(base * 0.20)
    };
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchType = filterType === 'ALL' || t.type === filterType;
      const matchSearch = !search ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.note && t.note.toLowerCase().includes(search.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [transactions, filterType, search]);

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    sound.playClick();
    const newTx = {
      id: Date.now().toString(),
      date,
      type,
      category,
      group,
      amount: Number(amount),
      method,
      note: note || category
    };

    setTransactions([newTx, ...transactions]);
    setShowModal(false);
    setAmount('');
    setNote('');
  };

  const handleDelete = (id) => {
    sound.playClick();
    if (window.confirm('Xác nhận xoá giao dịch này?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px' }}>
      
      {/* Top Header & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#FFFFFF', letterSpacing: '-0.02em' }}>Tài chính cá nhân</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Theo dõi dòng tiền và kiểm soát hạn mức ngân sách 50/30/20</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-solid">
          <Plus size={15} />
          <span>Thêm giao dịch</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        
        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>TỔNG THU NHẬP</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--accent-emerald)', marginTop: '8px' }}>
            {formatVND(stats.income)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Lương & các nguồn thu</div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>TỔNG CHI TIÊU</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--accent-rose)', marginTop: '8px' }}>
            {formatVND(stats.expense)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Thiết yếu & Mong muốn</div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>DƯ KHẢ DỤNG</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: '#FFFFFF', marginTop: '8px' }}>
            {formatVND(stats.net)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Thu nhập còn lại</div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>ĐÃ TIẾT KIỆM</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: '#A78BFA', marginTop: '8px' }}>
            {formatVND(stats.savings)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Tỷ lệ: {stats.rate}% thu nhập</div>
        </div>

      </div>

      {/* 50/30/20 Clean Progress */}
      <div className="zen-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF' }}>Hạn mức ngân sách 50/30/20</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mục tiêu dựa trên thu nhập tháng</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* 50% */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ color: '#E4E4E7', fontWeight: '500' }}>50% Thiết yếu</span>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: stats.needsSpent > stats.needsBudget ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                {Math.round((stats.needsSpent / stats.needsBudget) * 100)}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (stats.needsSpent / stats.needsBudget) * 100)}%`,
                background: stats.needsSpent > stats.needsBudget ? 'var(--accent-rose)' : '#FFFFFF'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Đã chi: <strong className="font-mono" style={{ color: '#FFFFFF' }}>{formatVND(stats.needsSpent)}</strong></span>
              <span>Hạn mức: {formatVND(stats.needsBudget)}</span>
            </div>
          </div>

          {/* 30% */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ color: '#E4E4E7', fontWeight: '500' }}>30% Mong muốn</span>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: stats.wantsSpent > stats.wantsBudget ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                {Math.round((stats.wantsSpent / stats.wantsBudget) * 100)}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (stats.wantsSpent / stats.wantsBudget) * 100)}%`,
                background: stats.wantsSpent > stats.wantsBudget ? 'var(--accent-rose)' : '#A1A1AA'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Đã chi: <strong className="font-mono" style={{ color: '#FFFFFF' }}>{formatVND(stats.wantsSpent)}</strong></span>
              <span>Hạn mức: {formatVND(stats.wantsBudget)}</span>
            </div>
          </div>

          {/* 20% */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ color: '#E4E4E7', fontWeight: '500' }}>20% Tiết kiệm</span>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                {Math.round((stats.savings / stats.savingsBudget) * 100)}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (stats.savings / stats.savingsBudget) * 100)}%`,
                background: 'var(--accent-emerald)'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Đã nạp: <strong className="font-mono" style={{ color: '#FFFFFF' }}>{formatVND(stats.savings)}</strong></span>
              <span>Mục tiêu: {formatVND(stats.savingsBudget)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Transaction Table */}
      <div className="zen-card" style={{ padding: '24px' }}>
        
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'Chi', 'Thu', 'Tiết kiệm'].map(f => (
              <button
                key={f}
                onClick={() => { sound.playClick(); setFilterType(f); }}
                className={`tab-pill ${filterType === f ? 'active' : ''}`}
                style={{ fontSize: '0.8rem' }}
              >
                {f === 'ALL' ? 'Tất cả' : f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="zen-input"
              style={{ paddingLeft: '30px', fontSize: '0.8rem', padding: '6px 10px 6px 30px' }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map(t => {
            const isInc = t.type === 'Thu';
            const isSav = t.type === 'Tiết kiệm';

            return (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isInc ? 'var(--accent-emerald)' : isSav ? '#A78BFA' : 'var(--accent-rose)'
                  }} />
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: '500' }}>{t.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {t.date} • {t.method} {t.note && `• "${t.note}"`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className="font-mono" style={{
                    fontWeight: '600',
                    color: isInc ? 'var(--accent-emerald)' : isSav ? '#A78BFA' : '#FFFFFF'
                  }}>
                    {isInc ? '+' : '-'}{formatVND(t.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Clean Add Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1rem', fontWeight: '600', color: '#FFFFFF' }}>Thêm giao dịch</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Type */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
                {['Chi', 'Thu', 'Tiết kiệm'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setType(t);
                      if (t === 'Thu') setGroup('Thu nhập');
                      else if (t === 'Tiết kiệm') setGroup('Tiết kiệm');
                      else setGroup('Thiết yếu');
                    }}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      background: type === t ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      color: type === t ? '#FFFFFF' : 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Số tiền (VND)</label>
                <input
                  type="number"
                  placeholder="0"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="zen-input font-mono"
                  style={{ fontSize: '1.2rem', fontWeight: '600' }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Danh mục</label>
                <select
                  value={category}
                  onChange={e => {
                    setCategory(e.target.value);
                    const found = CATEGORIES.find(c => c.name === e.target.value);
                    if (found) setGroup(found.group);
                  }}
                  className="zen-input"
                >
                  {CATEGORIES
                    .filter(c => type === 'Thu' ? c.type === 'Thu' : type === 'Tiết kiệm' ? c.type === 'Tiết kiệm' : c.type === 'Chi')
                    .map(c => (
                      <option key={c.name} value={c.name}>{c.name} ({c.group})</option>
                    ))}
                </select>
              </div>

              {/* Method & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Phương thức</label>
                  <select value={method} onChange={e => setMethod(e.target.value)} className="zen-input">
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                    <option value="Ví điện tử">Ví điện tử</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Ngày</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="zen-input" />
                </div>
              </div>

              {/* Note */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Ghi chú</label>
                <input
                  type="text"
                  placeholder="Nội dung chi tiết..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="zen-input"
                />
              </div>

              <button type="submit" className="btn-solid" style={{ marginTop: '8px', padding: '10px' }}>
                Lưu giao dịch
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
