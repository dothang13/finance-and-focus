import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Check, Maximize2, Minimize2, ChevronLeft, ChevronRight, Calendar, BookOpen, Edit2 } from 'lucide-react';
import { sound } from '../utils/audio';
import { loadStudyLog, saveStudyLog, loadVocabList, saveVocabList } from '../utils/storage';
import FlipClock from './FlipClock';
import SevenSegmentClock from './SevenSegmentClock';
import confetti from 'canvas-confetti';

export default function StudyFlow({ tasks, setTasks, streak, setStreak }) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Navigation & Date
  const [selectedDate, setSelectedDate] = useState(todayStr); // YYYY-MM-DD
  const [taskFilter, setTaskFilter] = useState('ALL'); // 'ALL' | 'ja' | 'en' | 'deep'

  // Clock theme & LED color
  const [clockTheme, setClockTheme] = useState('flip'); // 'flip' | 'traffic'
  const [ledColor, setLedColor] = useState('#FFFFFF'); // Default White LED

  // Pomodoro Settings: Cadence 25/5 vs 50/10 vs 90
  const [cadence, setCadence] = useState('25_5'); // '25_5' | '50_10' | '90'
  const [mode, setMode] = useState('focus'); // focus | shortBreak | longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [focusSubject, setFocusSubject] = useState('ja'); // 'ja' | 'en' | 'deep' for study log attribution

  // New task input
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('ja');
  const [newTaskDuration, setNewTaskDuration] = useState(25);

  // Vocabulary Studio
  const [vocabList, setVocabList] = useState(loadVocabList);
  const [showVocabDetails, setShowVocabDetails] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newWordLang, setNewWordLang] = useState('ja');
  const [isEditingVocabCount, setIsEditingVocabCount] = useState(false);
  const [manualVocabCount, setManualVocabCount] = useState(streak?.kanjiVocabCount ?? 0);

  // 7-day study log
  const [studyLog, setStudyLog] = useState(loadStudyLog);

  const CATEGORY_MAP = {
    ja: { label: 'Tiếng Nhật N3', badgeClass: 'badge-ja', icon: '🇯🇵' },
    en: { label: 'Tiếng Anh', badgeClass: 'badge-en', icon: '🇬🇧' },
    deep: { label: 'Deep Work', badgeClass: 'badge-deep', icon: '⚡' },
    general: { label: 'Cá nhân', badgeClass: 'badge-general', icon: '📌' }
  };

  // Get current duration based on cadence and mode
  const getDuration = (m, c) => {
    if (c === '50_10') {
      if (m === 'focus') return 50 * 60;
      if (m === 'shortBreak') return 10 * 60;
      return 15 * 60;
    } else if (c === '90') {
      if (m === 'focus') return 90 * 60;
      if (m === 'shortBreak') return 15 * 60;
      return 20 * 60;
    } else {
      if (m === 'focus') return 25 * 60;
      if (m === 'shortBreak') return 5 * 60;
      return 15 * 60;
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
      
      const sessionMinutes = cadence === '90' ? 90 : cadence === '50_10' ? 50 : 25;

      if (mode === 'focus') {
        setStreak(prev => ({
          ...prev,
          studyMinutesToday: (prev.studyMinutesToday ?? 0) + sessionMinutes,
          currentStreak: prev.currentStreak > 0 ? prev.currentStreak : 1
        }));

        const existingIndex = studyLog.findIndex(item => item.date === selectedDate);
        let updatedLog;
        if (existingIndex >= 0) {
          updatedLog = studyLog.map((item, idx) => {
            if (idx === existingIndex) {
              return {
                ...item,
                [focusSubject]: (item[focusSubject] || 0) + sessionMinutes
              };
            }
            return item;
          });
        } else {
          updatedLog = [
            ...studyLog,
            {
              date: selectedDate,
              ja: focusSubject === 'ja' ? sessionMinutes : 0,
              en: focusSubject === 'en' ? sessionMinutes : 0,
              deep: focusSubject === 'deep' ? sessionMinutes : 0
            }
          ];
        }
        setStudyLog(updatedLog);
        saveStudyLog(updatedLog);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, cadence, focusSubject, selectedDate, studyLog, setStreak]);

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

  // Date Navigation
  const changeDateBy = (days) => {
    sound.playClick();
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  // Unified Task Filtering: Strictly by selected date, with optional category filter
  const dayTasks = useMemo(() => {
    return tasks.filter(t => t.date === selectedDate);
  }, [tasks, selectedDate]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'ALL') return dayTasks;
    return dayTasks.filter(t => (t.lang || 'ja') === taskFilter);
  }, [dayTasks, taskFilter]);

  const completedCount = dayTasks.filter(t => t.completed).length;
  const progressPercent = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

  // Category task counts for tabs
  const jaCount = dayTasks.filter(t => t.lang === 'ja').length;
  const enCount = dayTasks.filter(t => t.lang === 'en').length;
  const deepCount = dayTasks.filter(t => t.lang === 'deep').length;

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
      lang: newTaskCategory,
      durationMin: Number(newTaskDuration) || 25,
      completed: false,
      date: selectedDate
    };

    setTasks([...tasks, t]);
    setNewTaskTitle('');
  };

  const deleteTask = (id) => {
    sound.playClick();
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearCompletedTasks = () => {
    if (window.confirm('Xoá toàn bộ nhiệm vụ đã hoàn thành trong ngày này?')) {
      sound.playClick();
      setTasks(tasks.filter(t => !(t.date === selectedDate && t.completed)));
    }
  };

  // Vocabulary Functions
  const changeVocab = (delta) => {
    sound.playClick();
    setStreak(prev => {
      const nextCount = Math.max(0, (prev.kanjiVocabCount ?? 0) + delta);
      return {
        ...prev,
        kanjiVocabCount: nextCount
      };
    });
  };

  const handleSetExactVocabCount = (e) => {
    e.preventDefault();
    const val = parseInt(manualVocabCount, 10);
    if (!isNaN(val) && val >= 0) {
      sound.playClick();
      setStreak(prev => ({
        ...prev,
        kanjiVocabCount: val
      }));
      setIsEditingVocabCount(false);
    }
  };

  const handleResetVocab = () => {
    if (window.confirm('Đặt lại số lượng từ vựng về 0?')) {
      sound.playClick();
      setStreak(prev => ({
        ...prev,
        kanjiVocabCount: 0
      }));
    }
  };

  // Add specific vocab item
  const handleAddVocabWord = (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    sound.playClick();

    const item = {
      id: 'v_' + Date.now(),
      word: newWord.trim(),
      meaning: newMeaning.trim(),
      lang: newWordLang,
      date: selectedDate,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextList = [item, ...vocabList];
    setVocabList(nextList);
    saveVocabList(nextList);

    // Auto increment streak counter
    setStreak(prev => ({
      ...prev,
      kanjiVocabCount: (prev.kanjiVocabCount ?? 0) + 1
    }));

    setNewWord('');
    setNewMeaning('');
  };

  // Delete specific vocab word (solves misclicked words)
  const handleDeleteVocabWord = (id) => {
    sound.playClick();
    const nextList = vocabList.filter(v => v.id !== id);
    setVocabList(nextList);
    saveVocabList(nextList);

    // Automatically decrement counter if word was for today
    setStreak(prev => ({
      ...prev,
      kanjiVocabCount: Math.max(0, (prev.kanjiVocabCount ?? 0) - 1)
    }));
  };

  const todayVocabWords = useMemo(() => {
    return vocabList.filter(v => v.date === selectedDate);
  }, [vocabList, selectedDate]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px' }}>
      
      {/* FULLSCREEN ZEN MODE OVERLAY (ZERO OVERLAP, MASSIVE LED DISPLAY) */}
      {isFullScreen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#070709',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          boxSizing: 'border-box',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden'
        }}>
          {/* Top Bar: Title, Theme switcher, and Exit button */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, height: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ledColor, boxShadow: `0 0 10px ${ledColor}` }} />
              <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {mode === 'focus' ? `ZENITH FOCUS • ${CATEGORY_MAP[focusSubject]?.label}` : mode === 'shortBreak' ? 'NGHỈ NGẮN' : 'NGHỈ DÀI'}
              </span>
            </div>

            {/* Theme switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { sound.playClick(); setClockTheme('traffic'); }}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  background: clockTheme === 'traffic' ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: clockTheme === 'traffic' ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                📟 Đồng hồ số
              </button>

              <button
                onClick={() => { sound.playClick(); setClockTheme('flip'); }}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  background: clockTheme === 'flip' ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: clockTheme === 'flip' ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🕰️ Lật số
              </button>

              {clockTheme === 'traffic' && (
                <div style={{ display: 'flex', gap: '5px', marginLeft: '6px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '8px' }}>
                  {[
                    { color: '#00F0FF', title: 'Xanh Cyan điện tử' },
                    { color: '#10B981', title: 'Xanh ngọc Emerald' },
                    { color: '#F59E0B', title: 'Vàng cam hổ phách' },
                    { color: '#EF4444', title: 'Đỏ LED' },
                    { color: '#FFFFFF', title: 'Trắng sáng' }
                  ].map(c => (
                    <div
                      key={c.color}
                      onClick={() => { sound.playClick(); setLedColor(c.color); }}
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: c.color,
                        cursor: 'pointer',
                        border: ledColor === c.color ? '2px solid #FFFFFF' : '1px solid transparent',
                        boxShadow: `0 0 6px ${c.color}`
                      }}
                      title={c.title}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Exit Fullscreen */}
            <button
              onClick={toggleFullScreen}
              className="btn-ghost"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Thoát toàn màn hình (ESC)"
            >
              <Minimize2 size={16} />
              <span style={{ fontSize: '0.8rem' }}>Thu nhỏ (ESC)</span>
            </button>
          </div>

          {/* Middle Display: MASSIVE CLOCK, ZERO OVERLAP */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
            {clockTheme === 'traffic' ? (
              <SevenSegmentClock totalSeconds={timeLeft} isFullScreen={true} ledColor={ledColor} />
            ) : (
              <FlipClock totalSeconds={timeLeft} isFullScreen={true} />
            )}
          </div>

          {/* Bottom Controls Bar */}
          <div style={{ display: 'flex', gap: '16px', flexShrink: 0, height: '60px', alignItems: 'center' }}>
            <button
              onClick={toggleTimer}
              className="btn-solid"
              style={{ padding: '14px 44px', fontSize: '1.1rem', borderRadius: 'var(--radius-md)' }}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
            </button>

            <button onClick={resetTimer} className="btn-ghost" style={{ padding: '14px 20px', borderRadius: 'var(--radius-md)' }} title="Đặt lại">
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER & DATE BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Phòng Học & Tập Trung
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Đồng hồ lật cơ học Pomodoro, quản lý nhiệm vụ đa năng và nhật ký từ vựng
          </p>
        </div>

        {/* Date Selector Bar */}
        <div className="zen-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => changeDateBy(-1)} className="btn-ghost" style={{ padding: '5px 8px' }} title="Ngày trước">
            <ChevronLeft size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--text-muted)" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="zen-input font-mono"
              style={{ width: 'auto', padding: '3px 6px', fontSize: '0.82rem', background: 'transparent', border: 'none', color: '#FFFFFF' }}
            />
            {selectedDate === todayStr && (
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                (Hôm nay)
              </span>
            )}
          </div>

          <button onClick={() => changeDateBy(1)} className="btn-ghost" style={{ padding: '5px 8px' }} title="Ngày sau">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN: FLIP CLOCK & UNIFIED TODO LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: 3D FLIP CLOCK & VOCABULARY STUDIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* MECHANICAL FLIP CLOCK CARD */}
          <div className="zen-card" style={{ padding: '28px 24px', textAlign: 'center', position: 'relative' }}>
            
            {/* Maximize Zen Mode Button */}
            <button
              onClick={toggleFullScreen}
              className="btn-ghost"
              title="Phóng to toàn màn hình Zen Mode"
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px' }}
            >
              <Maximize2 size={15} />
            </button>

            {/* Cadence Selector */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
              {[
                { id: '25_5', label: '25 / 5m' },
                { id: '50_10', label: '50 / 10m' },
                { id: '90', label: '90m Flow' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSwitchCadence(c.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    borderRadius: 'var(--radius-xs)',
                    border: 'none',
                    background: cadence === c.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: cadence === c.id ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Mode Selector (Focus / Short Break / Long Break) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {[
                { id: 'focus', label: 'Tập trung' },
                { id: 'shortBreak', label: 'Nghỉ ngắn' },
                { id: 'longBreak', label: 'Nghỉ dài' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => switchMode(m.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: '500',
                    border: 'none',
                    background: mode === m.id ? '#FFFFFF' : 'transparent',
                    color: mode === m.id ? '#000000' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Clock Style Toggle & LED Color Selector */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', background: 'var(--bg-app)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => { sound.playClick(); setClockTheme('traffic'); }}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: clockTheme === 'traffic' ? 'rgba(255,255,255,0.14)' : 'transparent',
                    color: clockTheme === 'traffic' ? '#FFFFFF' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  📟 Đồng hồ số
                </button>
                <button
                  onClick={() => { sound.playClick(); setClockTheme('flip'); }}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: clockTheme === 'flip' ? 'rgba(255,255,255,0.14)' : 'transparent',
                    color: clockTheme === 'flip' ? '#FFFFFF' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🕰️ Lật số
                </button>
              </div>

              {clockTheme === 'traffic' && (
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[
                    { color: '#00F0FF', title: 'Xanh Cyan điện tử' },
                    { color: '#10B981', title: 'Xanh ngọc Emerald' },
                    { color: '#F59E0B', title: 'Vàng cam hổ phách' },
                    { color: '#EF4444', title: 'Đỏ LED' },
                    { color: '#FFFFFF', title: 'Trắng sáng' }
                  ].map(c => (
                    <div
                      key={c.color}
                      onClick={() => { sound.playClick(); setLedColor(c.color); }}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: c.color,
                        cursor: 'pointer',
                        border: ledColor === c.color ? '2px solid #FFFFFF' : '1px solid transparent',
                        boxShadow: `0 0 5px ${c.color}`
                      }}
                      title={c.title}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* CLOCK COMPONENT (7-SEGMENT TRAFFIC LED OR FLIP CLOCK) */}
            {clockTheme === 'traffic' ? (
              <SevenSegmentClock totalSeconds={timeLeft} isFullScreen={false} ledColor={ledColor} />
            ) : (
              <FlipClock totalSeconds={timeLeft} isFullScreen={false} />
            )}

            {/* Study attribution subject tag */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Tính giờ cho:</span>
              {['ja', 'en', 'deep'].map(s => (
                <button
                  key={s}
                  onClick={() => { sound.playClick(); setFocusSubject(s); }}
                  style={{
                    background: focusSubject === s ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: '1px solid',
                    borderColor: focusSubject === s ? 'rgba(255,255,255,0.25)' : 'transparent',
                    color: focusSubject === s ? '#FFFFFF' : 'var(--text-secondary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    fontSize: '0.72rem'
                  }}
                >
                  {CATEGORY_MAP[s].icon} {CATEGORY_MAP[s].label}
                </button>
              ))}
            </div>

            {/* Timer Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '22px' }}>
              <button
                onClick={toggleTimer}
                className="btn-solid"
                style={{ padding: '10px 24px', fontSize: '0.9rem' }}
              >
                {isRunning ? <Pause size={15} /> : <Play size={15} />}
                <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
              </button>

              <button onClick={resetTimer} className="btn-ghost" title="Đặt lại đồng hồ">
                <RotateCcw size={15} />
              </button>
            </div>

          </div>

          {/* VOCABULARY & KANJI STUDIO (WITH WORD LIST & DELETE MISCLICKS) */}
          <div className="zen-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} color="var(--accent-amber)" />
                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF' }}>Từ vựng & Kanji</span>
              </div>

              {/* Edit or Reset Button */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { sound.playClick(); setShowVocabDetails(!showVocabDetails); }}
                  className="btn-ghost"
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  {showVocabDetails ? 'Đóng chi tiết' : 'Danh sách từ'}
                </button>
                <button
                  onClick={handleResetVocab}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer' }}
                  title="Đặt lại về 0"
                >
                  Đặt lại
                </button>
              </div>
            </div>

            {/* Vocab count & Quick adjustments */}
            <div style={{ background: 'var(--bg-app)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Tổng từ nạp hôm nay:
                </span>

                {isEditingVocabCount ? (
                  <form onSubmit={handleSetExactVocabCount} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      value={manualVocabCount}
                      onChange={e => setManualVocabCount(e.target.value)}
                      className="zen-input font-mono"
                      style={{ width: '60px', padding: '2px 6px', fontSize: '1rem', textAlign: 'center' }}
                      autoFocus
                    />
                    <button type="submit" className="btn-solid" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>Lưu</button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '700', color: '#FBBF24' }}>
                      +{streak?.kanjiVocabCount ?? 0}
                    </span>
                    <button
                      onClick={() => { setManualVocabCount(streak?.kanjiVocabCount ?? 0); setIsEditingVocabCount(true); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      title="Sửa số lượng trực tiếp"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Increments and Decrements */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                <button onClick={() => changeVocab(-5)} className="btn-ghost" style={{ flex: 1, padding: '5px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }} title="Giảm 5 từ (nếu ấn nhầm)">
                  -5
                </button>
                <button onClick={() => changeVocab(-1)} className="btn-ghost" style={{ flex: 1, padding: '5px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }} title="Giảm 1 từ (nếu ấn nhầm)">
                  -1
                </button>
                <button onClick={() => changeVocab(1)} className="btn-ghost" style={{ flex: 1, padding: '5px 0', fontSize: '0.75rem' }}>
                  +1
                </button>
                <button onClick={() => changeVocab(5)} className="btn-ghost" style={{ flex: 1, padding: '5px 0', fontSize: '0.75rem' }}>
                  +5
                </button>
                <button onClick={() => changeVocab(10)} className="btn-ghost" style={{ flex: 1, padding: '5px 0', fontSize: '0.75rem' }}>
                  +10
                </button>
              </div>
            </div>

            {/* EXPANDABLE VOCABULARY DETAIL LIST WITH INSTANT DELETE FOR MISCLICKS */}
            {showVocabDetails && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '10px' }}>
                  Nhật ký từ vựng ngày {selectedDate} ({todayVocabWords.length} từ)
                </div>

                {/* Form to log word */}
                <form onSubmit={handleAddVocabWord} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={newWordLang}
                      onChange={e => setNewWordLang(e.target.value)}
                      className="zen-input"
                      style={{ width: '80px', fontSize: '0.75rem', padding: '6px 8px' }}
                    >
                      <option value="ja">🇯🇵 JP</option>
                      <option value="en">🇬🇧 EN</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Từ mới / Hán tự..."
                      value={newWord}
                      onChange={e => setNewWord(e.target.value)}
                      className="zen-input"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Nghĩa / Cách đọc / Ví dụ..."
                      value={newMeaning}
                      onChange={e => setNewMeaning(e.target.value)}
                      className="zen-input"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
                    />
                    <button type="submit" className="btn-solid" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                      <Plus size={13} />
                      <span>Thêm</span>
                    </button>
                  </div>
                </form>

                {/* Word list */}
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {todayVocabWords.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Chưa có từ cụ thể nào được lưu hôm nay.
                    </div>
                  ) : (
                    todayVocabWords.map(v => (
                      <div
                        key={v.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          background: 'var(--bg-app)',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '600', color: '#FFFFFF' }}>{v.word}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{v.lang === 'ja' ? '🇯🇵' : '🇬🇧'}</span>
                          </div>
                          {v.meaning && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {v.meaning}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteVocabWord(v.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '4px' }}
                          title="Xoá từ này (nếu thêm nhầm)"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: UNIFIED TODO LIST (3-IN-1: JP, EN, DEEP WORK) */}
        <div className="zen-card" style={{ padding: '28px 24px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#FFFFFF' }}>
                Nhiệm vụ trọng tâm trong ngày
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Gộp chung Tiếng Nhật, Tiếng Anh và Deep Work trong một luồng làm việc
              </p>
            </div>

            {/* Clear completed button */}
            {completedCount > 0 && (
              <button
                onClick={clearCompletedTasks}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Dọn việc đã xong ({completedCount})
              </button>
            )}
          </div>

          {/* Daily Progress Bar */}
          <div style={{ marginBottom: '20px', background: 'var(--bg-app)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tiến độ hoàn thành:</span>
              <span className="font-mono" style={{ color: completedCount === dayTasks.length && dayTasks.length > 0 ? 'var(--accent-emerald)' : '#FFFFFF', fontWeight: '600' }}>
                {completedCount}/{dayTasks.length} ({progressPercent}%)
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progressPercent}%`,
                  background: progressPercent === 100 ? 'var(--accent-emerald)' : 'linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-emerald) 100%)'
                }}
              />
            </div>
          </div>

          {/* Unified Filter Pills (Tất cả, Tiếng Nhật, Tiếng Anh, Deep Work) */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `Tất cả (${dayTasks.length})` },
              { id: 'ja', label: `🇯🇵 Tiếng Nhật (${jaCount})` },
              { id: 'en', label: `🇬🇧 Tiếng Anh (${enCount})` },
              { id: 'deep', label: `⚡ Deep Work (${deepCount})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => { sound.playClick(); setTaskFilter(f.id); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  border: '1px solid',
                  borderColor: taskFilter === f.id ? 'rgba(255,255,255,0.4)' : 'var(--border-subtle)',
                  background: taskFilter === f.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: taskFilter === f.id ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Unified Quick Add Form */}
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Thêm nhiệm vụ mới..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="zen-input"
              style={{ flex: 1, minWidth: '180px', fontSize: '0.82rem' }}
            />

            {/* Category Select */}
            <select
              value={newTaskCategory}
              onChange={e => setNewTaskCategory(e.target.value)}
              className="zen-input"
              style={{ width: '135px', fontSize: '0.78rem' }}
            >
              <option value="ja">🇯🇵 Tiếng Nhật</option>
              <option value="en">🇬🇧 Tiếng Anh</option>
              <option value="deep">⚡ Deep Work</option>
              <option value="general">📌 Cá nhân</option>
            </select>

            <input
              type="number"
              placeholder="25m"
              value={newTaskDuration}
              onChange={e => setNewTaskDuration(e.target.value)}
              className="zen-input font-mono"
              style={{ width: '60px', fontSize: '0.82rem', textAlign: 'center' }}
            />

            <button type="submit" className="btn-solid" style={{ padding: '8px 14px' }}>
              <Plus size={14} />
            </button>
          </form>

          {/* Unified Task Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Chưa có nhiệm vụ nào cho danh mục này. Hãy nhập nhiệm vụ phía trên để bắt đầu!
              </div>
            ) : (
              filteredTasks.map(t => {
                const cat = CATEGORY_MAP[t.lang] || CATEGORY_MAP.general;

                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: t.completed ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg-app)',
                      border: '1px solid',
                      borderColor: t.completed ? 'transparent' : 'var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      {/* Checkbox */}
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: t.completed ? '1px solid var(--accent-emerald)' : '1px solid var(--border-medium)',
                        background: t.completed ? 'var(--accent-emerald)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000000',
                        flexShrink: 0
                      }}>
                        {t.completed && <Check size={12} strokeWidth={3} />}
                      </div>

                      {/* Title & Info */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: '0.86rem',
                          color: t.completed ? 'var(--text-faint)' : '#FFFFFF',
                          textDecoration: t.completed ? 'line-through' : 'none',
                          wordBreak: 'break-word'
                        }}>
                          {t.title}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span className={`badge-category ${cat.badgeClass}`}>
                            {cat.icon} {cat.label}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {t.durationMin} phút
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '6px', marginLeft: '8px' }}
                      title="Xoá nhiệm vụ"
                    >
                      <Trash2 size={14} />
                    </button>
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
