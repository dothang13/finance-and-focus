import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, X, Calculator, Calendar as CalendarIcon, Filter, Edit2 } from 'lucide-react';
import { sound } from '../utils/audio';
import BudgetAdvisorModal from './BudgetAdvisorModal';
import MonthlyFinanceCalendar from './MonthlyFinanceCalendar';

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
  const [editingTx, setEditingTx] = useState(null);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  // Calendar State: Year & Month navigation, plus optional single-day filter
  const today = new Date();
  const [calMonth, setCalMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() // 0-indexed
  });
  const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD' or null for whole month
  const [scope, setScope] = useState('month'); // 'month' | 'all'

  // Form
  const [type, setType] = useState('Chi');
  const [category, setCategory] = useState('Ăn uống & Nhu yếu phẩm');
  const [group, setGroup] = useState('Thiết yếu');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Chuyển khoản');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(today.toISOString().split('T')[0]);

  const handleChangeMonth = (delta) => {
    setCalMonth(prev => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) {
        m = 11;
        y -= 1;
      } else if (m > 11) {
        m = 0;
        y += 1;
      }
      return { year: y, month: m };
    });
    setSelectedDate(null);
  };

  const handleResetMonth = () => {
    const now = new Date();
    setCalMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(null);
  };

  // Overall Statistics (for top metrics)
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

  const currentMonthPrefix = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}`;

  // Chronologically Sorted Transactions (Newest Date First)
  const filteredAndSorted = useMemo(() => {
    return transactions
      .filter(t => {
        // Scope & Date Filtering
        if (selectedDate) {
          if (t.date !== selectedDate) return false;
        } else if (scope === 'month') {
          if (!t.date || !t.date.startsWith(currentMonthPrefix)) return false;
        }

        const matchType = filterType === 'ALL' || t.type === filterType;
        const matchSearch = !search ||
          t.category.toLowerCase().includes(search.toLowerCase()) ||
          (t.note && t.note.toLowerCase().includes(search.toLowerCase()));
        return matchType && matchSearch;
      })
      // Sort newest date first, then by transaction id descending
      .sort((a, b) => {
        const cmp = (b.date || '').localeCompare(a.date || '');
        if (cmp !== 0) return cmp;
        return (b.id || '').localeCompare(a.id || '');
      });
  }, [transactions, selectedDate, scope, currentMonthPrefix, filterType, search]);

  // Grouped by Date for Clear Daily Synthesis
  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredAndSorted.forEach(t => {
      const d = t.date || 'Chưa chọn ngày';
      if (!groups[d]) groups[d] = [];
      groups[d].push(t);
    });

    return Object.entries(groups).map(([dateStr, items]) => {
      let dayInc = 0;
      let dayExp = 0;
      let daySav = 0;
      items.forEach(it => {
        const a = Number(it.amount) || 0;
        if (it.type === 'Thu') dayInc += a;
        else if (it.type === 'Chi') dayExp += a;
        else if (it.type === 'Tiết kiệm') daySav += a;
      });
      return { dateStr, items, dayInc, dayExp, daySav };
    });
  }, [filteredAndSorted]);

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr || dateStr === 'Chưa chọn ngày') return 'Chưa chọn ngày';
    try {
      const [y, m, d] = dateStr.split('-');
      return `Ngày ${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handleAmountChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setAmount('');
      return;
    }
    const formatted = rawVal.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setAmount(formatted);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const rawNum = Number(amount.replace(/\./g, ''));
    if (!rawNum || rawNum <= 0) return;

    sound.playClick();

    if (editingTx) {
      // Update existing transaction
      setTransactions(transactions.map(t => t.id === editingTx.id ? {
        ...t,
        date,
        type,
        category,
        group,
        amount: rawNum,
        method,
        note: note || category
      } : t));
    } else {
      // Create new transaction
      const newTx = {
        id: Date.now().toString(),
        date,
        type,
        category,
        group,
        amount: rawNum,
        method,
        note: note || category
      };
      setTransactions([newTx, ...transactions]);
    }

    setShowModal(false);
    setEditingTx(null);
    setAmount('');
    setNote('');
  };

  const openEdit = (tx) => {
    sound.playClick();
    setEditingTx(tx);
    setType(tx.type || 'Chi');
    setCategory(tx.category || 'Ăn uống & Nhu yếu phẩm');
    setGroup(tx.group || 'Thiết yếu');
    setAmount(tx.amount ? String(tx.amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
    setMethod(tx.method || 'Chuyển khoản');
    setNote(tx.note || '');
    setDate(tx.date || todayStr);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    sound.playClick();
    if (window.confirm('Xác nhận xoá giao dịch này?')) {
      setTransactions(transactions.filter(t => t.id !== id));
      if (editingTx && editingTx.id === id) {
        setEditingTx(null);
        setShowModal(false);
      }
    }
  };

  const handleQuickPreset = (preset) => {
    sound.playClick();
    setEditingTx(null);
    setType(preset.type);
    setCategory(preset.category);
    setGroup(preset.group);
    setAmount(preset.amount ? String(preset.amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
    setMethod(preset.method || 'Chuyển khoản');
    setNote(preset.note || preset.category);
    setDate(selectedDate || todayStr);
    setShowModal(true);
  };

  const openAddForDate = (customDate) => {
    sound.playClick();
    setEditingTx(null);
    setType('Chi');
    setCategory('Ăn uống & Nhu yếu phẩm');
    setGroup('Thiết yếu');
    setAmount('');
    setMethod('Chuyển khoản');
    setNote('');
    setDate(customDate || todayStr);
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px' }}>
      
      {/* Top Header & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#FFFFFF', letterSpacing: '-0.02em' }}>Tài chính cá nhân</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Theo dõi dòng tiền và kiểm soát hạn mức ngân sách 50/30/20</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => { sound.playClick(); setShowAdvisor(true); }}
            className="btn-ghost"
            style={{ padding: '8px 14px' }}
            title="Nhập lương và trọ để gợi ý phân bổ chi tiêu sinh hoạt"
          >
            <Calculator size={15} color="var(--accent-emerald)" />
            <span>Gợi ý phân bổ chi tiêu</span>
          </button>

          <button onClick={() => openAddForDate(selectedDate || todayStr)} className="btn-solid">
            <Plus size={15} />
            <span>Thêm giao dịch</span>
          </button>
        </div>
      </div>

      {/* 1-Click Quick Expense Presets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Nhập nhanh:</span>
        {[
          { label: '☕ Cà phê 35k', type: 'Chi', category: 'Cà phê & Gặp gỡ', group: 'Mong muốn', amount: 35000, method: 'Ví điện tử', note: 'Cà phê sáng' },
          { label: '🍱 Bữa trưa 50k', type: 'Chi', category: 'Ăn uống & Nhu yếu phẩm', group: 'Thiết yếu', amount: 50000, method: 'Ví điện tử', note: 'Cơm trưa' },
          { label: '⛽ Đổ xăng 70k', type: 'Chi', category: 'Đi lại & Xăng xe', group: 'Thiết yếu', amount: 70000, method: 'Tiền mặt', note: 'Đổ xăng' },
          { label: '🛒 Siêu thị 250k', type: 'Chi', category: 'Ăn uống & Nhu yếu phẩm', group: 'Thiết yếu', amount: 250000, method: 'Thẻ tín dụng', note: 'Siêu thị' },
          { label: '💰 Tiết kiệm 1.000k', type: 'Tiết kiệm', category: 'Đầu tư tích lũy', group: 'Tiết kiệm', amount: 1000000, method: 'Chuyển khoản', note: 'Tích lũy định kỳ' },
          { label: '💼 Lương tháng', type: 'Thu', category: 'Lương tháng', group: 'Thu nhập', amount: '', method: 'Chuyển khoản', note: 'Lương tháng' }
        ].map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPreset(p)}
            className="preset-chip"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        
        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>TỔNG THU NHẬP</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: '#3B82F6', marginTop: '8px' }}>
            {formatVND(stats.income)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Lương & các nguồn thu</div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>TỔNG CHI TIÊU</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: '#EF4444', marginTop: '8px' }}>
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
      <div className="zen-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF' }}>Hạn mức ngân sách 50/30/20</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mục tiêu dựa trên thu nhập tháng</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* 50% */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ color: '#E4E4E7', fontWeight: '500' }}>50% Thiết yếu</span>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: stats.needsSpent > stats.needsBudget ? '#EF4444' : 'var(--text-secondary)' }}>
                {Math.round((stats.needsSpent / stats.needsBudget) * 100)}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (stats.needsSpent / stats.needsBudget) * 100)}%`,
                background: stats.needsSpent > stats.needsBudget ? '#EF4444' : '#FFFFFF'
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
              <span className="font-mono" style={{ fontSize: '0.8rem', color: stats.wantsSpent > stats.wantsBudget ? '#EF4444' : 'var(--text-secondary)' }}>
                {Math.round((stats.wantsSpent / stats.wantsBudget) * 100)}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (stats.wantsSpent / stats.wantsBudget) * 100)}%`,
                background: stats.wantsSpent > stats.wantsBudget ? '#EF4444' : '#A1A1AA'
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
              <span className="font-mono" style={{ fontSize: '0.8rem', color: '#10B981' }}>
                {Math.round((stats.savings / stats.savingsBudget) * 100)}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (stats.savings / stats.savingsBudget) * 100)}%`,
                background: '#10B981'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Đã nạp: <strong className="font-mono" style={{ color: '#FFFFFF' }}>{formatVND(stats.savings)}</strong></span>
              <span>Mục tiêu: {formatVND(stats.savingsBudget)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* MONTHLY FINANCE CALENDAR COMPONENT */}
      <MonthlyFinanceCalendar
        transactions={transactions}
        year={calMonth.year}
        month={calMonth.month}
        onChangeMonth={handleChangeMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onResetMonth={handleResetMonth}
      />

      {/* TRANSACTIONS TABLE (SORTED & GROUPED CHRONOLOGICALLY BY DAY) */}
      <div className="zen-card" style={{ padding: '24px' }}>
        
        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Section Title & Scope */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: '600', color: '#FFFFFF' }}>
                {selectedDate ? `Giao dịch ${formatDateLabel(selectedDate)}` : `Giao dịch Tháng ${calMonth.month + 1}/${calMonth.year}`}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({filteredAndSorted.length} giao dịch)
              </span>
            </div>

            {/* Scope Switcher: Month vs All */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
              {selectedDate ? (
                <button
                  onClick={() => { sound.playClick(); setSelectedDate(null); }}
                  className="btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#60A5FA' }}
                >
                  ← Trở về xem cả tháng {calMonth.month + 1}
                </button>
              ) : (
                <div style={{ display: 'inline-flex', background: 'var(--bg-app)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => { sound.playClick(); setScope('month'); }}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      border: 'none',
                      background: scope === 'month' ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: scope === 'month' ? '#FFFFFF' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Tháng {calMonth.month + 1}
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setScope('all'); }}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      border: 'none',
                      background: scope === 'all' ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: scope === 'all' ? '#FFFFFF' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Tất cả lịch sử
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Type Filter & Search */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Type Filters */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', 'Chi', 'Thu', 'Tiết kiệm'].map(f => (
                <button
                  key={f}
                  onClick={() => { sound.playClick(); setFilterType(f); }}
                  className={`tab-pill ${filterType === f ? 'active' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  {f === 'ALL' ? 'Tất cả' : f}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', width: '180px' }}>
              <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm danh mục, ghi chú..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="zen-input"
                style={{ paddingLeft: '28px', fontSize: '0.75rem', padding: '5px 8px 5px 28px', width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* CHRONOLOGICALLY SORTED & GROUPED LIST */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {groupedTransactions.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Không có giao dịch nào trong {selectedDate ? `ngày ${selectedDate}` : `khoảng thời gian này`}.
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={() => openAddForDate(selectedDate || todayStr)}
                  className="btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                >
                  + Thêm giao dịch ngay
                </button>
              </div>
            </div>
          ) : (
            groupedTransactions.map(group => {
              const isGroupToday = group.dateStr === todayStr;

              return (
                <div key={group.dateStr} style={{ marginBottom: '22px' }}>
                  
                  {/* Daily Section Header with Date & Subtotals */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '8px',
                      borderLeft: isGroupToday ? '3px solid #3B82F6' : '3px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarIcon size={14} color={isGroupToday ? '#3B82F6' : 'var(--text-muted)'} />
                      <span style={{ fontSize: '0.82rem', fontWeight: '600', color: isGroupToday ? '#FFFFFF' : '#E4E4E7' }}>
                        {formatDateLabel(group.dateStr)}
                      </span>
                      {isGroupToday && (
                        <span style={{ fontSize: '0.7rem', color: '#3B82F6', fontWeight: '600' }}>
                          (Hôm nay)
                        </span>
                      )}
                    </div>

                    {/* Daily Subtotals: Thu (Xanh dương) • Chi (Đỏ) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem' }}>
                      {group.dayInc > 0 && (
                        <span className="font-mono" style={{ color: '#3B82F6', fontWeight: '600' }}>
                          +{formatVND(group.dayInc)}
                        </span>
                      )}
                      {group.dayExp > 0 && (
                        <span className="font-mono" style={{ color: '#EF4444', fontWeight: '600' }}>
                          -{formatVND(group.dayExp)}
                        </span>
                      )}
                      {group.daySav > 0 && (
                        <span className="font-mono" style={{ color: '#A78BFA', fontWeight: '600' }}>
                          +{formatVND(group.daySav)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Individual Transaction Items */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {group.items.map(t => {
                      const isInc = t.type === 'Thu';
                      const isSav = t.type === 'Tiết kiệm';

                      return (
                        <div
                          key={t.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 10px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            fontSize: '0.84rem',
                            borderRadius: '4px',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: isInc ? '#3B82F6' : isSav ? '#A78BFA' : '#EF4444'
                            }} />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ color: '#FFFFFF', fontWeight: '500' }}>{t.category}</span>
                                {t.group && (
                                  <span
                                    style={{
                                      fontSize: '0.66rem',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: '600',
                                      background: t.group === 'Thiết yếu'
                                        ? 'rgba(245, 158, 11, 0.12)'
                                        : t.group === 'Mong muốn'
                                        ? 'rgba(168, 85, 247, 0.12)'
                                        : t.group === 'Tiết kiệm'
                                        ? 'rgba(16, 185, 129, 0.12)'
                                        : 'rgba(59, 130, 246, 0.12)',
                                      color: t.group === 'Thiết yếu'
                                        ? '#FBBF24'
                                        : t.group === 'Mong muốn'
                                        ? '#D8B4FE'
                                        : t.group === 'Tiết kiệm'
                                        ? '#6EE7B7'
                                        : '#93C5FD',
                                      border: t.group === 'Thiết yếu'
                                        ? '1px solid rgba(245, 158, 11, 0.25)'
                                        : t.group === 'Mong muốn'
                                        ? '1px solid rgba(168, 85, 247, 0.25)'
                                        : t.group === 'Tiết kiệm'
                                        ? '1px solid rgba(16, 185, 129, 0.25)'
                                        : '1px solid rgba(59, 130, 246, 0.25)'
                                    }}
                                  >
                                    {t.group === 'Thiết yếu' ? '50% Thiết yếu' : t.group === 'Mong muốn' ? '30% Mong muốn' : t.group === 'Tiết kiệm' ? '20% Tiết kiệm' : 'Thu nhập'}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {t.method} {t.note && `• "${t.note}"`}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="font-mono" style={{
                              fontWeight: '600',
                              color: isInc ? '#3B82F6' : isSav ? '#A78BFA' : '#EF4444'
                            }}>
                              {isInc ? '+' : '-'}{formatVND(t.amount)}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <button
                                onClick={() => openEdit(t)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px' }}
                                title="Sửa giao dịch (ngày, danh mục, số tiền, ghi chú...)"
                                className="btn-ghost"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px' }}
                                title="Xoá giao dịch"
                                className="btn-ghost"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Clean Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setEditingTx(null); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#FFFFFF' }}>
                  {editingTx ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch'}
                </span>
                {editingTx && (
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Chỉnh sửa lại ngày, danh mục hoặc số tiền nếu nhập nhầm
                  </p>
                )}
              </div>
              <button onClick={() => { setShowModal(false); setEditingTx(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Số tiền (VND)</label>
                  {amount && (
                    <span style={{ fontSize: '0.75rem', color: type === 'Thu' ? '#3B82F6' : '#EF4444', fontWeight: '600' }}>
                      {formatVND(Number(amount.replace(/\./g, '')))}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  className="zen-input font-mono"
                  style={{ fontSize: '1.2rem', fontWeight: '600' }}
                  autoFocus
                  required
                />
              </div>

              {/* Category & 50/30/20 Group Indicator */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Danh mục</label>
                  {group && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: group === 'Thiết yếu'
                          ? 'rgba(245, 158, 11, 0.14)'
                          : group === 'Mong muốn'
                          ? 'rgba(168, 85, 247, 0.14)'
                          : group === 'Tiết kiệm'
                          ? 'rgba(16, 185, 129, 0.14)'
                          : 'rgba(59, 130, 246, 0.14)',
                        color: group === 'Thiết yếu'
                          ? '#FBBF24'
                          : group === 'Mong muốn'
                          ? '#D8B4FE'
                          : group === 'Tiết kiệm'
                          ? '#6EE7B7'
                          : '#93C5FD',
                        border: group === 'Thiết yếu'
                          ? '1px solid rgba(245, 158, 11, 0.3)'
                          : group === 'Mong muốn'
                          ? '1px solid rgba(168, 85, 247, 0.3)'
                          : group === 'Tiết kiệm'
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {group === 'Thiết yếu' ? '📌 50% Thiết yếu' : group === 'Mong muốn' ? '✨ 30% Mong muốn' : group === 'Tiết kiệm' ? '💰 20% Tiết kiệm' : '💼 Thu nhập'}
                    </span>
                  )}
                </div>

                <select
                  value={category}
                  onChange={e => {
                    setCategory(e.target.value);
                    const c = CATEGORIES.find(item => item.name === e.target.value);
                    if (c) setGroup(c.group);
                  }}
                  className="zen-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  {type === 'Chi' ? (
                    <>
                      <optgroup label="50% THIẾT YẾU (Bắt buộc: nhà ở, ăn uống, đi lại, y tế)">
                        {CATEGORIES.filter(c => c.type === 'Chi' && c.group === 'Thiết yếu').map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="30% MONG MUỐN (Linh hoạt: cà phê, mua sắm, giải trí, khóa học)">
                        {CATEGORIES.filter(c => c.type === 'Chi' && c.group === 'Mong muốn').map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                    </>
                  ) : (
                    CATEGORIES.filter(c => c.type === type).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))
                  )}
                </select>

                {/* 50/30/20 Group switch for Chi expenses */}
                {type === 'Chi' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Phân bổ ngân sách:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => { sound.playClick(); setGroup('Thiết yếu'); }}
                        style={{
                          background: group === 'Thiết yếu' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                          color: group === 'Thiết yếu' ? '#FBBF24' : 'var(--text-muted)',
                          border: group === 'Thiết yếu' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          fontWeight: group === 'Thiết yếu' ? '600' : '400'
                        }}
                      >
                        50% Thiết yếu
                      </button>
                      <button
                        type="button"
                        onClick={() => { sound.playClick(); setGroup('Mong muốn'); }}
                        style={{
                          background: group === 'Mong muốn' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                          color: group === 'Mong muốn' ? '#D8B4FE' : 'var(--text-muted)',
                          border: group === 'Mong muốn' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          fontWeight: group === 'Mong muốn' ? '600' : '400'
                        }}
                      >
                        30% Mong muốn
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Ngày giao dịch</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="zen-input font-mono"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  required
                />
              </div>

              {/* Note */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Chi tiết giao dịch..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="zen-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingTx(null); }} className="btn-ghost">
                  Hủy
                </button>
                <button type="submit" className="btn-solid">
                  {editingTx ? 'Lưu thay đổi' : 'Xác nhận'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Budget Advisor Modal */}
      {showAdvisor && (
        <BudgetAdvisorModal onClose={() => setShowAdvisor(false)} />
      )}

    </div>
  );
}
