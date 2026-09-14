import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Check, Maximize2, Minimize2, ChevronLeft, ChevronRight, Calendar, BarChart2 } from 'lucide-react';
import { sound } from '../utils/audio';
import { loadStudyLog, saveStudyLog } from '../utils/storage';
import confetti from 'canvas-confetti';

export default function StudyFlow({ tasks, setTasks, streak, setStreak }) {
  // Navigation & Filter
  const [activeLang, setActiveLang] = useState('ja'); // 'ja' | 'en' | 'deep'
  const [selectedDate, setSelectedDate] = useState('2026-09-14'); // YYYY-MM-DD
  const [showStats, setShowStats] = useState(false);

  // Pomodoro Settings: Cadence 25/5 vs 50/10
  const [cadence, setCadence] = useState('25_5'); // '25_5' | '50_10'
  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // New task input
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(25);

  // 7-day study log
  const [studyLog, setStudyLog] = useState(loadStudyLog);

  const LANG_LABELS = {
    ja: 'Tiếng Nhật N3',
    en: 'Tiếng Anh',
    deep: 'Deep Work'
  };

  // Get current duration based on cadence and mode
  const getDuration = (m, c) => {
    if (c === '50_10') {
      if (m === 'focus') return 50 * 60;
      if (m === 'shortBreak') return 10 * 60;
      return 15 * 60; // longBreak
    } else {
      if (m === 'focus') return 25 * 60;
      if (m === 'shortBreak') return 5 * 60;
      return 15 * 60; // longBreak
    }
  };

  const handleSwitchCadence = (newCadence) => {
    sound.playClick();
    setCadence(newCadence);
    const newDur = getDuration(mode, newCadence);
    setTimeLeft(newDur);
    setIsRunning(false);
  };

  // Timer Effect
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      sound.playChime();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      
      const sessionMinutes = cadence === '50_10' ? 50 : 25;

      if (mode === 'focus') {
        setStreak(prev => ({
          ...prev,
          studyMinutesToday: prev.studyMinutesToday + sessionMinutes
        }));

        const updatedLog = studyLog.map(item => {
          if (item.date === selectedDate) {
            return {
              ...item,
              [activeLang]: (item[activeLang] || 0) + sessionMinutes
            };
          }
          return item;
        });
        setStudyLog(updatedLog);
        saveStudyLog(updatedLog);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, cadence, activeLang, selectedDate, studyLog, setStreak]);

  // Fullscreen ESC listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const toggleFullScreen = () => {
    sound.playClick();
    const next = !isFullScreen;
    setIsFullScreen(next);
    if (next && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (!next && document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const switchMode = (m) => {
    sound.playClick();
    setMode(m);
    setTimeLeft(getDuration(m, cadence));
    setIsRunning(false);
  };

  const toggleTimer = () => {
    sound.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    sound.playClick();
    setIsRunning(false);
    setTimeLeft(getDuration(mode, cadence));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const total = getDuration(mode, cadence);
  const pct = ((total - timeLeft) / total) * 100;
  const strokeOffset = 502 - (502 * pct) / 100;

  // Date Navigation
  const changeDateBy = (days) => {
    sound.playClick();
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  // Filter tasks strictly by active language AND selected date
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.lang === activeLang && t.date === selectedDate);
  }, [tasks, activeLang, selectedDate]);

  const completedCount = filteredTasks.filter(t => t.completed).length;

  // Task Toggle with Confetti celebration!
  const toggleTask = (id) => {
    sound.playClick();
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          sound.playChime();
          confetti({ particleCount: 55, spread: 65, origin: { y: 0.7 } });
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    sound.playClick();

    const t = {
      id: 't_' + Date.now(),
      title: newTaskTitle.trim(),
      lang: activeLang,
      durationMin: Number(newTaskDuration) || 25,
      completed: false,
      date: selectedDate
    };

    setTasks([t, ...tasks]);
    setNewTaskTitle('');
  };

  const deleteTask = (id) => {
    sound.playClick();
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Vocab change (supports negative decrement if user clicked by accident)
  const changeVocab = (delta) => {
    sound.playClick();
    setStreak(prev => ({
      ...prev,
      kanjiVocabCount: Math.max(0, (prev.kanjiVocabCount || 0) + delta)
    }));
  };

  // Stats for the selected date
  const dateLog = studyLog.find(l => l.date === selectedDate) || { ja: 0, en: 0, deep: 0 };
  const totalMinutesThisDate = (dateLog.ja || 0) + (dateLog.en || 0) + (dateLog.deep || 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px' }}>
      
      {/* FULLSCREEN ZEN FOCUS OVERLAY */}
      {isFullScreen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#000000',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          
          <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#FFFFFF' }}>ZENITH</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {LANG_LABELS[activeLang]} ({cadence === '50_10' ? '50/10' : '25/5'})</span>
            </div>

            <button
              onClick={toggleFullScreen}
              className="btn-ghost"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
            >
              <Minimize2 size={15} />
              <span>Thu nhỏ (ESC)</span>
            </button>
          </div>

          <div style={{ position: 'relative', width: '320px', height: '320px', margin: '0 auto 36px' }}>
            <svg width="320" height="320" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="160" cy="160" r="140" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" fill="none" />
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeDasharray="880"
                strokeDashoffset={880 - (880 * pct) / 100}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>

            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="font-mono" style={{ fontSize: '4.5rem', fontWeight: '500', color: '#FFFFFF', letterSpacing: '-0.03em' }}>
                {formatTime(timeLeft)}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {isRunning ? `Đang học ${LANG_LABELS[activeLang]}` : 'Tạm dừng'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={toggleTimer}
              className="btn-solid"
              style={{ minWidth: '160px', padding: '14px 28px', fontSize: '1.05rem' }}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
            </button>

            <button onClick={resetTimer} className="btn-ghost" style={{ padding: '14px 20px' }} title="Đặt lại">
              <RotateCcw size={18} />
            </button>
          </div>

        </div>
      )}

      {/* TOP BAR: TABS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {LANG_LABELS[activeLang]}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Nhiệm vụ và thời lượng học riêng biệt cho từng phân hệ
          </p>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {[
            { key: 'ja', label: 'Tiếng Nhật N3' },
            { key: 'en', label: 'Tiếng Anh' },
            { key: 'deep', label: 'Deep Work' }
          ].map(l => (
            <button
              key={l.key}
              onClick={() => { sound.playClick(); setActiveLang(l.key); }}
              className={`tab-pill ${activeLang === l.key ? 'active' : ''}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* DATE SELECTOR BAR */}
      <div className="zen-card" style={{ padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => changeDateBy(-1)} className="btn-ghost" style={{ padding: '6px 10px' }}>
            <ChevronLeft size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--text-muted)" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="zen-input font-mono"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.82rem', background: 'transparent', border: 'none', color: '#FFFFFF' }}
            />
            {selectedDate === '2026-09-14' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '500' }}>
                (Hôm nay)
              </span>
            )}
          </div>

          <button onClick={() => changeDateBy(1)} className="btn-ghost" style={{ padding: '6px 10px' }}>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            Tổng học ngày: <strong className="font-mono" style={{ color: '#FFFFFF' }}>{totalMinutesThisDate} phút</strong>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Nhiệm vụ {LANG_LABELS[activeLang]}: <strong className="font-mono" style={{ color: 'var(--accent-emerald)' }}>{completedCount}/{filteredTasks.length} xong</strong>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn-ghost"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <BarChart2 size={13} />
            <span>{showStats ? 'Đóng thống kê' : 'Xem thống kê 7 ngày'}</span>
          </button>
        </div>

      </div>

      {/* 7-DAY STUDY STATS DROPDOWN */}
      {showStats && (
        <div className="zen-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '14px' }}>
            Thống kê thời lượng học 7 ngày gần nhất (Phút)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', alignItems: 'end', height: '140px', paddingBottom: '20px' }}>
            {studyLog.map(item => {
              const totalM = item.ja + item.en + item.deep;
              const maxScale = 160;
              const barHeight = Math.min(100, Math.round((totalM / maxScale) * 100));
              const isToday = item.date === selectedDate;

              return (
                <div key={item.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                  <span className="font-mono" style={{ fontSize: '0.7rem', color: isToday ? '#FFFFFF' : 'var(--text-muted)' }}>
                    {totalM}m
                  </span>
                  <div style={{
                    width: '100%',
                    maxWidth: '32px',
                    height: `${barHeight}%`,
                    minHeight: '6px',
                    background: isToday ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    transition: 'height 0.3s ease'
                  }} />
                  <span style={{ fontSize: '0.68rem', color: isToday ? '#FFFFFF' : 'var(--text-muted)' }}>
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <span>🇯🇵 Nhật N3: {dateLog.ja || 0}m</span>
            <span>🇬🇧 Tiếng Anh: {dateLog.en || 0}m</span>
            <span>⚡ Deep Work: {dateLog.deep || 0}m</span>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN: POMODORO & TASKS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* TIMER CARD */}
        <div className="zen-card" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          
          {/* Maximize Button */}
          <button
            onClick={toggleFullScreen}
            className="btn-ghost"
            title="Phóng to toàn màn hình"
            style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px' }}
          >
            <Maximize2 size={15} />
          </button>

          {/* Cadence Selector: 25/5 vs 50/10 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
            <button
              onClick={() => handleSwitchCadence('25_5')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: cadence === '25_5' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: cadence === '25_5' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Mode 25 / 5m
            </button>
            <button
              onClick={() => handleSwitchCadence('50_10')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: cadence === '50_10' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: cadence === '50_10' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Mode 50 / 10m (Học sâu)
            </button>
          </div>

          {/* Mode Switcher: Focus, Short Break, Long Break */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
            {[
              { key: 'focus', label: cadence === '50_10' ? 'Tập trung (50m)' : 'Tập trung (25m)' },
              { key: 'shortBreak', label: cadence === '50_10' ? 'Nghỉ ngắn (10m)' : 'Nghỉ ngắn (5m)' },
              { key: 'longBreak', label: 'Nghỉ dài (15m)' }
            ].map(m => (
              <button
                key={m.key}
                onClick={() => switchMode(m.key)}
                className={`tab-pill ${mode === m.key ? 'active' : ''}`}
                style={{ fontSize: '0.78rem' }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Minimal Ring */}
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 28px' }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="80" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="4" fill="none" />
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeDasharray="502"
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>

            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="font-mono" style={{ fontSize: '2.6rem', fontWeight: '500', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {formatTime(timeLeft)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {isRunning ? `Đang học ${LANG_LABELS[activeLang]}` : 'Tạm dừng'}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={toggleTimer} className="btn-solid" style={{ minWidth: '120px' }}>
              {isRunning ? <Pause size={15} /> : <Play size={15} />}
              <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
            </button>

            <button onClick={resetTimer} className="btn-ghost" title="Đặt lại">
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Vocab / Kanji Counter with + AND - buttons! */}
          <div style={{ marginTop: '28px', width: '100%', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {activeLang === 'ja' ? 'Hán tự & Từ vựng N3 hôm nay' : 'Từ vựng Tiếng Anh hôm nay'}
              </span>
              <span className="font-mono" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                +{streak?.kanjiVocabCount || 0}
              </span>
            </div>

            {/* Increments and Decrements */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => changeVocab(-5)}
                className="btn-ghost"
                title="Giảm 5 từ"
                style={{ flex: 1, padding: '5px 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}
              >
                -5
              </button>
              <button
                onClick={() => changeVocab(-1)}
                className="btn-ghost"
                title="Giảm 1 từ"
                style={{ flex: 1, padding: '5px 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}
              >
                -1
              </button>
              <button
                onClick={() => changeVocab(1)}
                className="btn-ghost"
                style={{ flex: 1, padding: '5px 0', fontSize: '0.78rem' }}
              >
                +1
              </button>
              <button
                onClick={() => changeVocab(5)}
                className="btn-ghost"
                style={{ flex: 1, padding: '5px 0', fontSize: '0.78rem' }}
              >
                +5
              </button>
              <button
                onClick={() => changeVocab(10)}
                className="btn-ghost"
                style={{ flex: 1, padding: '5px 0', fontSize: '0.78rem' }}
              >
                +10
              </button>
            </div>
          </div>

        </div>

        {/* DEDICATED TASKS LIST */}
        <div className="zen-card" style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF' }}>
              Nhiệm vụ {LANG_LABELS[activeLang]} ({selectedDate})
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Đã xong {completedCount}/{filteredTasks.length}
            </span>
          </div>

          {/* Quick Add Task Input */}
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <input
              type="text"
              placeholder={`Thêm nhiệm vụ ${LANG_LABELS[activeLang]}...`}
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="zen-input"
              style={{ fontSize: '0.82rem' }}
            />

            <input
              type="number"
              placeholder="25m"
              value={newTaskDuration}
              onChange={e => setNewTaskDuration(e.target.value)}
              className="zen-input font-mono"
              style={{ width: '65px', fontSize: '0.82rem' }}
            />

            <button type="submit" className="btn-solid" style={{ padding: '8px 14px' }}>
              <Plus size={14} />
            </button>
          </form>

          {/* Task list strictly filtered */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Chưa có nhiệm vụ nào cho {LANG_LABELS[activeLang]} vào ngày {selectedDate}.
              </div>
            ) : (
              filteredTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: t.completed ? '1px solid #FFFFFF' : '1px solid var(--border-medium)',
                      background: t.completed ? '#FFFFFF' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000000'
                    }}>
                      {t.completed && <Check size={12} strokeWidth={3} />}
                    </div>

                    <div>
                      <span style={{
                        fontSize: '0.85rem',
                        color: t.completed ? 'var(--text-faint)' : '#FFFFFF',
                        textDecoration: t.completed ? 'line-through' : 'none'
                      }}>
                        {t.title}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t.durationMin} phút • {t.date}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
