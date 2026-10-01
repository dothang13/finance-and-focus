import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, X, Calculator, Calendar as CalendarIcon, Edit2, Zap, ChevronLeft, ChevronRight, PieChart, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import { detectCategoryFromNote } from '../utils/categorizer';
import BudgetAdvisorModal from './BudgetAdvisorModal';
import MonthlyFinanceCalendar from './MonthlyFinanceCalendar';
import ExpenseDonutChart from './ExpenseDonutChart';

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
  const [showChart, setShowChart] = useState(true);
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

  // Is viewing the real current month
  const isCurrentMonth = calMonth.year === today.getFullYear() && calMonth.month === today.getMonth();
  const currentMonthPrefix = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}`;

  // Form
  const [type, setType] = useState('Chi');
  const [category, setCategory] = useState('Ăn uống & Nhu yếu phẩm');
  const [group, setGroup] = useState('Thiết yếu');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Chuyển khoản');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(today.toISOString().split('T')[0]);
  const [detectedCategory, setDetectedCategory] = useState(null);

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

  const handleSelectYearMonth = (newYear, newMonth) => {
    setCalMonth({ year: newYear, month: newMonth });
    setSelectedDate(null);
  };

  const handleResetMonth = () => {
    const now = new Date();
    setCalMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(null);
  };

  // Transactions belonging specifically to the selected month
  const selectedMonthTransactions = useMemo(() => {
    return transactions.filter(t => t.date && t.date.startsWith(currentMonthPrefix));
  }, [transactions, currentMonthPrefix]);

  // Overall & Scoped Statistics
  const stats = useMemo(() => {
    // 1. All-time net worth / cumulative balance
    let allTimeIncome = 0;
    let allTimeExpense = 0;
    let allTimeSavings = 0;

    transactions.forEach(t => {
      const a = Number(t.amount) || 0;
      if (t.type === 'Thu') allTimeIncome += a;
      else if (t.type === 'Chi') allTimeExpense += a;
      else if (t.type === 'Tiết kiệm') allTimeSavings += a;
    });

    const allTimeNet = allTimeIncome - allTimeExpense;

    // 2. Statistics scoped to the chosen view (month vs all)
    const activeTxs = scope === 'month' ? selectedMonthTransactions : transactions;

    let income = 0;
    let expense = 0;
    let savings = 0;
    let needsSpent = 0;
    let wantsSpent = 0;

    activeTxs.forEach(t => {
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
      allTimeNet,
      allTimeSavings,
      rate,
      needsSpent,
      needsBudget: Math.round(base * 0.50),
      wantsSpent,
      wantsBudget: Math.round(base * 0.30),
      savingsBudget: Math.round(base * 0.20),
      count: activeTxs.length
    };
  }, [transactions, selectedMonthTransactions, scope]);

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

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNote(val);
    const match = detectCategoryFromNote(val);
    if (match) {
      setCategory(match.category);
      setGroup(match.group);
      setType(match.type);
      setDetectedCategory(match);
    } else {
      setDetectedCategory(null);
    }
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
    setDetectedCategory(null);
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
    setDetectedCategory(null);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    sound.playClick();
    if (window.confirm('Xác nhận xoá giao dịch này?')) {
      setTransactions(transactions.filter(t => t.id !== id));
      if (editingTx && editingTx.id === id) {
        setEditingTx(null);
        setDetectedCategory(null);
        setShowModal(false);
      }
    }
  };

  const defaultDateForCurrentView = selectedDate || (
    isCurrentMonth
      ? todayStr
      : `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-01`
  );

  const handleQuickPreset = (preset) => {
    sound.playClick();
    setEditingTx(null);
    setType(preset.type);
    setCategory(preset.category);
    setGroup(preset.group);
    setAmount(preset.amount ? String(preset.amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
    setMethod(preset.method || 'Chuyển khoản');
    setNote(preset.note || preset.category);
    setDate(defaultDateForCurrentView);
    setDetectedCategory(null);
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
    setDate(customDate || defaultDateForCurrentView);
    setDetectedCategory(null);
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px' }}>
      
      {/* Top Header & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#FFFFFF', letterSpacing: '-0.02em' }}>Tài chính cá nhân</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Theo dõi dòng tiền tự động theo từng tháng • Kiểm soát hạn mức ngân sách 50/30/20
          </p>
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

          <button onClick={() => openAddForDate(defaultDateForCurrentView)} className="btn-solid">
            <Plus size={15} />
            <span>Thêm giao dịch</span>
          </button>
        </div>
      </div>

      {/* SMART MONTH SELECTOR BAR (Raycast / Apple Style) */}
      <div className="zen-card" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Left: Quick Month Navigation & Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => { sound.playClick(); handleChangeMonth(-1); }}
              className="btn-ghost"
              style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
              title="Xem tháng trước"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Direct Month Selector */}
            <select
              value={calMonth.month}
              onChange={(e) => { sound.playClick(); handleSelectYearMonth(calMonth.year, Number(e.target.value)); }}
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-medium)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-xs)',
                padding: '6px 10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>

            {/* Direct Year Selector */}
            <select
              value={calMonth.year}
              onChange={(e) => { sound.playClick(); handleSelectYearMonth(Number(e.target.value), calMonth.month); }}
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-medium)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-xs)',
                padding: '6px 10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={() => { sound.playClick(); handleChangeMonth(1); }}
              className="btn-ghost"
              style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
              title="Xem tháng sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Reset to Current Month Button / Live Badge */}
          <button
            onClick={() => { sound.playClick(); handleResetMonth(); }}
            className="btn-ghost"
            style={{
              fontSize: '0.78rem',
              padding: '5px 12px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isCurrentMonth ? 'var(--accent-emerald)' : '#FAFAFA',
              background: isCurrentMonth ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.06)',
              border: isCurrentMonth ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
              fontWeight: '500'
            }}
            title="Nhảy nhanh về tháng hiện tại theo thời gian thực"
          >
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isCurrentMonth ? 'var(--accent-emerald)' : '#A1A1AA',
              display: 'inline-block'
            }} />
            <span>{isCurrentMonth ? 'Tháng này (Thời gian thực)' : '↺ Về tháng hiện tại'}</span>
          </button>
        </div>

        {/* Right: Scope Switcher & Donut Chart Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <button
            onClick={() => { sound.playClick(); setShowChart(!showChart); }}
            className="btn-ghost"
            style={{
              fontSize: '0.76rem',
              padding: '5px 10px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: showChart ? '#60A5FA' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <PieChart size={14} />
            <span>{showChart ? 'Ẩn biểu đồ tròn' : 'Xem biểu đồ tròn'}</span>
          </button>

          {/* Scope: Month vs All-time */}
          <div style={{ display: 'inline-flex', background: 'var(--bg-app)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => { sound.playClick(); setScope('month'); }}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
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
                padding: '4px 10px',
                fontSize: '0.74rem',
                borderRadius: '4px',
                border: 'none',
                background: scope === 'all' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: scope === 'all' ? '#FFFFFF' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Tất cả thời gian
            </button>
          </div>
        </div>

      </div>

      {/* Auto-Reset Welcome Banner when entering a new month with 0 transactions */}
      {isCurrentMonth && selectedMonthTransactions.length === 0 && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.06) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="var(--accent-emerald)" />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: '600', color: '#FFFFFF' }}>
                Tháng mới đã bắt đầu • Dữ liệu đã tự động làm mới!
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Các chỉ số thu, chi, và hạn mức 50/30/20 đã tự động reset về 0đ cho Tháng {calMonth.month + 1}/{calMonth.year}. Số dư tích lũy ví ({formatVND(stats.allTimeNet)}) luôn được bảo toàn.
              </div>
            </div>
          </div>
          <button onClick={() => openAddForDate(todayStr)} className="btn-solid" style={{ fontSize: '0.78rem', padding: '7px 14px' }}>
            + Ghi nhận khoản đầu tiên
          </button>
        </div>
      )}

      {/* Notice if looking at a past/future month with no records */}
      {!isCurrentMonth && selectedMonthTransactions.length === 0 && scope === 'month' && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <span>Chưa có giao dịch nào được ghi nhận trong Tháng {calMonth.month + 1}/{calMonth.year}.</span>
          <button
            onClick={() => { sound.playClick(); handleResetMonth(); }}
            className="btn-ghost"
            style={{ fontSize: '0.74rem', padding: '4px 10px', color: 'var(--accent-emerald)' }}
          >
            Quay về tháng hiện tại →
          </button>
        </div>
      )}

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

      {/* Metrics Row - Scoped specifically to chosen month */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        
        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            {scope === 'month' ? `THU NHẬP THÁNG ${calMonth.month + 1}` : 'TỔNG THU NHẬP'}
          </div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: '#3B82F6', marginTop: '8px' }}>
            {formatVND(stats.income)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {scope === 'month' ? `Lương & nguồn thu tháng ${calMonth.month + 1}` : 'Tất cả nguồn thu'}
          </div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            {scope === 'month' ? `CHI TIÊU THÁNG ${calMonth.month + 1}` : 'TỔNG CHI TIÊU'}
          </div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: '#EF4444', marginTop: '8px' }}>
            {formatVND(stats.expense)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Thiết yếu & Mong muốn
          </div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            {scope === 'month' ? `DƯ THÁNG ${calMonth.month + 1}` : 'DƯ KHẢ DỤNG'}
          </div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: stats.net >= 0 ? '#FFFFFF' : '#EF4444', marginTop: '8px' }}>
            {stats.net >= 0 ? '+' : ''}{formatVND(stats.net)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Số dư lũy kế ví: <strong className="font-mono" style={{ color: '#FFFFFF' }}>{formatVND(stats.allTimeNet)}</strong>
          </div>
        </div>

        <div className="zen-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            {scope === 'month' ? `TIẾT KIỆM THÁNG ${calMonth.month + 1}` : 'ĐÃ TIẾT KIỆM'}
          </div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '600', color: '#A78BFA', marginTop: '8px' }}>
            {formatVND(stats.savings)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tỷ lệ: {stats.rate}% thu nhập {scope === 'month' ? `tháng ${calMonth.month + 1}` : ''}
          </div>
        </div>

      </div>

      {/* 50/30/20 Clean Progress - Evaluated specifically for the month */}
      <div className="zen-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF' }}>
            Hạn mức ngân sách 50/30/20 {scope === 'month' ? `(Tháng ${calMonth.month + 1}/${calMonth.year})` : '(Toàn bộ)'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {stats.income > 0 ? `Dựa trên thu nhập ${formatVND(stats.income)}` : 'Dựa trên định mức gợi ý chuẩn'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* 50% */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ color: '#E4E4E7', fontWeight: '500' }}>50% Thiết yếu</span>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: stats.needsSpent > stats.needsBudget ? '#EF4444' : 'var(--text-secondary)' }}>
                {stats.needsBudget > 0 ? Math.round((stats.needsSpent / stats.needsBudget) * 100) : 0}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${stats.needsBudget > 0 ? Math.min(100, (stats.needsSpent / stats.needsBudget) * 100) : 0}%`,
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
                {stats.wantsBudget > 0 ? Math.round((stats.wantsSpent / stats.wantsBudget) * 100) : 0}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${stats.wantsBudget > 0 ? Math.min(100, (stats.wantsSpent / stats.wantsBudget) * 100) : 0}%`,
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
                {stats.savingsBudget > 0 ? Math.round((stats.savings / stats.savingsBudget) * 100) : 0}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${stats.savingsBudget > 0 ? Math.min(100, (stats.savings / stats.savingsBudget) * 100) : 0}%`,
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

      {/* MONTHLY EXPENSE DONUT CHART (Scoped to Selected Month) */}
      {showChart && (
        <ExpenseDonutChart
          transactions={scope === 'month' ? selectedMonthTransactions : transactions}
        />
      )}

      {/* MONTHLY FINANCE CALENDAR COMPONENT */}
      <MonthlyFinanceCalendar
        transactions={transactions}
        year={calMonth.year}
        month={calMonth.month}
        onChangeMonth={handleChangeMonth}
        onSelectYearMonth={handleSelectYearMonth}
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
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setEditingTx(null); setDetectedCategory(null); }}>
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
              <button onClick={() => { setShowModal(false); setEditingTx(null); setDetectedCategory(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
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

              {/* Note with Smart Auto-Categorization */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Ghi chú (Tự động nhận diện danh mục)</label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VD: xăng, phở, cà phê, trọ...</span>
                </div>
                <input
                  type="text"
                  placeholder="Nhập ghi chú (VD: đổ xăng 50k, tiền trọ, cf Highlands...)"
                  value={note}
                  onChange={handleNoteChange}
                  className="zen-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />

                {/* Auto-detected Confirmation Chip */}
                {detectedCategory && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93C5FD' }}>
                      <Zap size={13} color="#FBBF24" />
                      <span>Nhận diện từ <strong>"{detectedCategory.matchedKeyword}"</strong>:</span>
                      <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{detectedCategory.category}</span>
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      background: detectedCategory.group === 'Thiết yếu'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : detectedCategory.group === 'Mong muốn'
                        ? 'rgba(168, 85, 247, 0.2)'
                        : 'rgba(16, 185, 129, 0.2)',
                      color: detectedCategory.group === 'Thiết yếu'
                        ? '#FBBF24'
                        : detectedCategory.group === 'Mong muốn'
                        ? '#D8B4FE'
                        : '#6EE7B7',
                      border: detectedCategory.group === 'Thiết yếu'
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : detectedCategory.group === 'Mong muốn'
                        ? '1px solid rgba(168, 85, 247, 0.4)'
                        : '1px solid rgba(16, 185, 129, 0.4)'
                    }}>
                      {detectedCategory.group === 'Thiết yếu' ? '50% Thiết yếu' : detectedCategory.group === 'Mong muốn' ? '30% Mong muốn' : detectedCategory.group === 'Tiết kiệm' ? '20% Tiết kiệm' : 'Thu nhập'}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingTx(null); setDetectedCategory(null); }} className="btn-ghost">
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
