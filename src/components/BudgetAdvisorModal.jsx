import React, { useState, useMemo } from 'react';
import { X, Calculator, AlertTriangle, CheckCircle2, TrendingUp, Home, Utensils, Fuel, ShieldAlert, Coffee, Bookmark } from 'lucide-react';
import { sound } from '../utils/audio';
import { loadSavedBudgetPlan, saveSavedBudgetPlan, deleteSavedBudgetPlan } from '../utils/storage';

export default function BudgetAdvisorModal({ onClose }) {
  // Load previously saved plan from storage if available
  const initialSaved = useMemo(() => loadSavedBudgetPlan(), []);
  const [incomeStr, setIncomeStr] = useState(() => initialSaved?.incomeStr || '3.000.000');
  const [rentStr, setRentStr] = useState(() => initialSaved?.rentStr || '2.000.000');
  const [utilitiesStr, setUtilitiesStr] = useState(() => initialSaved?.utilitiesStr || '200.000');
  const [savedAt, setSavedAt] = useState(() => initialSaved?.savedAt || null);
  const [isSaved, setIsSaved] = useState(() => !!initialSaved);
  const [toastMsg, setToastMsg] = useState('');

  const formatDots = (num) => {
    if (!num && num !== 0) return '';
    const clean = num.toString().replace(/\D/g, '');
    if (!clean) return '';
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseNum = (str) => {
    if (!str) return 0;
    const clean = str.toString().replace(/\D/g, '');
    return clean ? Number(clean) : 0;
  };

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const income = parseNum(incomeStr);
  const rent = parseNum(rentStr);
  const utilities = parseNum(utilitiesStr);

  const fixedCosts = rent + utilities;
  const remaining = Math.max(0, income - fixedCosts);

  // Analysis & Dynamic Breakdown
  const analysis = useMemo(() => {
    if (income <= 0) return null;

    const rentRatio = Math.round((rent / income) * 100);
    const fixedRatio = Math.round((fixedCosts / income) * 100);

    let healthStatus = 'GOOD'; // GOOD | WARNING | DANGER
    let warningTitle = '';
    let warningDesc = '';

    if (rentRatio > 40) {
      healthStatus = 'DANGER';
      warningTitle = `Tiền trọ chiếm ${rentRatio}% thu nhập`;
      warningDesc = `Chi phí chỗ ở chiếm tỷ trọng lớn. Dư khả dụng còn lại: ${formatVND(remaining)}.`;
    } else if (fixedRatio > 55) {
      healthStatus = 'WARNING';
      warningTitle = `Chi phí cố định chiếm ${fixedRatio}% thu nhập`;
      warningDesc = `Dư khả dụng còn lại: ${formatVND(remaining)}.`;
    } else {
      healthStatus = 'GOOD';
      warningTitle = `Chi phí cố định hợp lý (${fixedRatio}% thu nhập)`;
      warningDesc = `Dư khả dụng phân bổ: ${formatVND(remaining)}.`;
    }

    // Dynamic Allocation of the Remaining Amount
    let food = 0;
    let transport = 0;
    let savings = 0;
    let personal = 0;

    if (remaining > 0) {
      if (healthStatus === 'DANGER') {
        food = Math.round(remaining * 0.65);
        transport = Math.round(remaining * 0.20);
        savings = Math.round(remaining * 0.10);
        personal = Math.max(0, remaining - food - transport - savings);
      } else if (healthStatus === 'WARNING') {
        food = Math.round(remaining * 0.55);
        transport = Math.round(remaining * 0.20);
        savings = Math.round(remaining * 0.15);
        personal = Math.max(0, remaining - food - transport - savings);
      } else {
        food = Math.round(remaining * 0.45);
        transport = Math.round(remaining * 0.15);
        savings = Math.round(remaining * 0.25);
        personal = Math.max(0, remaining - food - transport - savings);
      }
    }

    const dailyFood = Math.round(food / 30);

    return {
      rentRatio,
      fixedRatio,
      healthStatus,
      warningTitle,
      warningDesc,
      food,
      dailyFood,
      transport,
      savings,
      personal
    };
  }, [income, rent, utilities, fixedCosts, remaining]);

  const handleApplyPreset = (inc, r, u) => {
    sound.playClick();
    setIncomeStr(formatDots(inc));
    setRentStr(formatDots(r));
    setUtilitiesStr(formatDots(u));
    setIsSaved(false);
  };

  const handleSavePlan = () => {
    sound.playChime();
    const now = new Date().toISOString();
    const plan = {
      incomeStr,
      rentStr,
      utilitiesStr,
      savedAt: now
    };
    saveSavedBudgetPlan(plan);
    setSavedAt(now);
    setIsSaved(true);
    setToastMsg('Đã lưu dữ liệu');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleClearPlan = () => {
    sound.playClick();
    deleteSavedBudgetPlan();
    setSavedAt(null);
    setIsSaved(false);
    setToastMsg('Đã xoá');
    setTimeout(() => setToastMsg(''), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{ padding: '24px', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={18} color="var(--accent-emerald)" />
            <span style={{ fontSize: '1rem', fontWeight: '600', color: '#FFFFFF' }}>
              Phân Bổ Chi Tiêu Theo Thu Nhập
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Income Presets */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '14px' }}>
          {[
            { label: 'Lương 3tr, Trọ 2tr', inc: 3000000, r: 2000000, u: 200000 },
            { label: 'Lương 5tr, Trọ 2tr', inc: 5000000, r: 2000000, u: 300000 },
            { label: 'Lương 10tr, Trọ 3tr', inc: 10000000, r: 3000000, u: 500000 },
            { label: 'Lương 20tr, Trọ 4tr', inc: 20000000, r: 4000000, u: 700000 }
          ].map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p.inc, p.r, p.u)}
              className="preset-chip"
              style={{ fontSize: '0.74rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px', background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tổng lương / tháng</label>
            <input
              type="text"
              inputMode="numeric"
              value={incomeStr}
              onChange={e => { setIncomeStr(formatDots(e.target.value)); setIsSaved(false); }}
              className="zen-input font-mono"
              style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-emerald)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tiền phòng trọ / nhà</label>
            <input
              type="text"
              inputMode="numeric"
              value={rentStr}
              onChange={e => { setRentStr(formatDots(e.target.value)); setIsSaved(false); }}
              className="zen-input font-mono"
              style={{ fontSize: '0.95rem', fontWeight: '600' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Điện nước / Mạng</label>
            <input
              type="text"
              inputMode="numeric"
              value={utilitiesStr}
              onChange={e => { setUtilitiesStr(formatDots(e.target.value)); setIsSaved(false); }}
              className="zen-input font-mono"
              style={{ fontSize: '0.95rem', fontWeight: '600' }}
            />
          </div>
        </div>

        {/* Analysis & Results */}
        {analysis && (
          <div>
            {/* Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '14px',
                background: analysis.healthStatus === 'DANGER' ? 'rgba(244, 63, 94, 0.1)' : analysis.healthStatus === 'WARNING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: '1px solid',
                borderColor: analysis.healthStatus === 'DANGER' ? 'rgba(244, 63, 94, 0.25)' : analysis.healthStatus === 'WARNING' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)'
              }}
            >
              {analysis.healthStatus === 'DANGER' ? (
                <ShieldAlert size={16} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
              ) : analysis.healthStatus === 'WARNING' ? (
                <AlertTriangle size={16} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '0.78rem', color: '#FAFAFA' }}>
                <span style={{ fontWeight: '600', color: analysis.healthStatus === 'DANGER' ? 'var(--accent-rose)' : analysis.healthStatus === 'WARNING' ? '#FBBF24' : 'var(--accent-emerald)' }}>
                  {analysis.warningTitle}
                </span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
                  — {analysis.warningDesc}
                </span>
              </div>
            </div>

            {/* Recommended Breakdown Table */}
            <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>BẢNG PHÂN BỔ CHI TIÊU HÀNG THÁNG</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Dư khả dụng: {formatVND(remaining)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                
                {/* Rent & Utilities */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Home size={14} color="var(--text-muted)" />
                    <span>Cố định (Trọ + Điện nước)</span>
                  </div>
                  <span className="font-mono" style={{ fontWeight: '600', color: '#FFFFFF' }}>
                    {formatVND(fixedCosts)} ({analysis.fixedRatio}%)
                  </span>
                </div>

                {/* Food */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Utensils size={14} color="var(--accent-rose)" />
                    <div>
                      <div>Ăn uống & Sinh hoạt</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>~{formatVND(analysis.dailyFood)} / ngày</div>
                    </div>
                  </div>
                  <span className="font-mono" style={{ fontWeight: '600', color: '#FFFFFF' }}>
                    {formatVND(analysis.food)}
                  </span>
                </div>

                {/* Transport */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Fuel size={14} color="var(--accent-blue)" />
                    <span>Đi lại & Xăng xe</span>
                  </div>
                  <span className="font-mono" style={{ fontWeight: '600', color: '#FFFFFF' }}>
                    {formatVND(analysis.transport)}
                  </span>
                </div>

                {/* Emergency Savings */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={14} color="var(--accent-emerald)" />
                    <span>Quỹ tích lũy / Dự phòng</span>
                  </div>
                  <span className="font-mono" style={{ fontWeight: '600', color: 'var(--accent-emerald)' }}>
                    {formatVND(analysis.savings)}
                  </span>
                </div>

                {/* Wants */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Coffee size={14} color="#A78BFA" />
                    <span>Chi tiêu linh hoạt</span>
                  </div>
                  <span className="font-mono" style={{ fontWeight: '600', color: '#FFFFFF' }}>
                    {formatVND(analysis.personal)}
                  </span>
                </div>

              </div>
            </div>

            {/* Bottom Actions: Save & Clear */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                {toastMsg ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>{toastMsg}</span>
                ) : savedAt ? (
                  <button
                    onClick={handleClearPlan}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', textDecoration: 'underline' }}
                  >
                    Xoá phương án đã lưu
                  </button>
                ) : null}
              </div>

              <button
                onClick={handleSavePlan}
                className="btn-solid"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.78rem',
                  background: isSaved ? 'rgba(16, 185, 129, 0.15)' : undefined,
                  color: isSaved ? '#10B981' : undefined,
                  border: isSaved ? '1px solid rgba(16, 185, 129, 0.3)' : undefined
                }}
              >
                <Bookmark size={13} />
                <span>{isSaved ? '✓ Đã lưu' : 'Lưu phương án'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
