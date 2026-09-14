import React, { useState } from 'react';
import { Radio, Smartphone, Flame, Volume2, Check } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Header({ onOpenSync, onOpenStreak, streak, activeTab, setActiveTab }) {
  const [activeTrack, setActiveTrack] = useState(null);
  const [showSoundMenu, setShowSoundMenu] = useState(false);

  const SOUND_TRACKS = [
    { id: 'rain', label: 'Tiếng mưa rơi nhẹ', desc: 'Mưa lofi lọc tần số dịu' },
    { id: '432hz', label: 'Tần số 432 Hz', desc: 'Sóng hài hoà tự nhiên + Ambient Pad' },
    { id: '528hz', label: 'Tần số 528 Hz', desc: 'Tần số Solfeggio + Nhạc thiền êm' },
    { id: 'alpha', label: 'Sóng Alpha 10 Hz', desc: 'Binaural beats + Hợp âm ghi nhớ' },
    { id: 'gamma', label: 'Sóng Gamma 40 Hz', desc: 'Binaural beats + Deep Work Flow' }
  ];

  const handleSelectTrack = (trackId) => {
    sound.playClick();
    if (activeTrack === trackId) {
      sound.stopCurrentSound();
      setActiveTrack(null);
    } else {
      sound.playTrack(trackId);
      setActiveTrack(trackId);
    }
  };

  return (
    <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-app)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', fontWeight: '700', fontSize: '0.85rem' }}>
            Z
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '600', letterSpacing: '0.02em', color: '#FFFFFF' }}>
                ZENITH
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Finance & Focus</span>
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="desktop-only" style={{ display: 'flex', background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => { sound.playClick(); setActiveTab('dashboard'); }}
            className={`tab-pill ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('finance'); }}
            className={`tab-pill ${activeTab === 'finance' ? 'active' : ''}`}
          >
            Tài chính 50/30/20
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('study'); }}
            className={`tab-pill ${activeTab === 'study' ? 'active' : ''}`}
          >
            Học ngoại ngữ & Thời gian
          </button>
        </nav>

        {/* Right Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          
          {/* Clickable Streak Badge */}
          <div
            onClick={() => { sound.playClick(); onOpenStreak(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontSize: '0.8rem',
              color: '#FBBF24',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Nhấn để xem Lịch kỷ luật chuỗi ngày"
          >
            <Flame size={14} color="#F59E0B" />
            <span style={{ fontWeight: '600' }}>{streak?.currentStreak || 8}d</span>
          </div>

          {/* Sound Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSoundMenu(!showSoundMenu)}
              className="btn-ghost"
              style={{
                padding: '6px 12px',
                height: '32px',
                fontSize: '0.8rem',
                color: activeTrack ? '#FFFFFF' : 'var(--text-secondary)',
                borderColor: activeTrack ? 'rgba(255,255,255,0.3)' : 'var(--border-subtle)',
                background: activeTrack ? 'rgba(255,255,255,0.08)' : 'transparent'
              }}
              title="Sóng não & Nhạc nền tập trung"
            >
              <Radio size={14} color={activeTrack ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
              <span>{activeTrack ? activeTrack.toUpperCase() : 'Âm thanh'}</span>
            </button>

            {/* Sound Menu Popover */}
            {showSoundMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '40px',
                  width: '270px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.7)',
                  padding: '8px',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                  TẦN SỐ TẬP TRUNG & NHẠC THIỀN
                </div>

                {SOUND_TRACKS.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTrack(t.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: activeTrack === t.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                      transition: 'background 0.1s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '500', color: activeTrack === t.id ? '#FFFFFF' : 'var(--text-secondary)' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {t.desc}
                      </div>
                    </div>
                    {activeTrack === t.id && <Check size={14} color="var(--accent-emerald)" />}
                  </div>
                ))}

                {activeTrack && (
                  <button
                    onClick={() => {
                      sound.stopCurrentSound();
                      setActiveTrack(null);
                      setShowSoundMenu(false);
                    }}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '6px',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      background: 'rgba(244, 63, 94, 0.1)',
                      color: 'var(--accent-rose)',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Tắt âm thanh
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sync Button */}
          <button
            onClick={() => { sound.playClick(); onOpenSync(); }}
            className="btn-ghost"
            style={{ padding: '6px 10px', height: '32px', fontSize: '0.8rem' }}
          >
            <Smartphone size={14} />
            <span className="desktop-only">Đồng bộ</span>
          </button>

        </div>

      </div>
    </header>
  );
}
