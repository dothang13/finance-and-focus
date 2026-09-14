import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FinFlow from './components/FinFlow';
import StudyFlow from './components/StudyFlow';
import SyncModal from './components/SyncModal';
import StreakModal from './components/StreakModal';
import { 
  loadTransactions, saveTransactions,
  loadTasks, saveTasks,
  loadStreak, saveStreak
} from './utils/storage';
import { LayoutDashboard, Wallet, BookOpen } from 'lucide-react';
import { sound } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'finance' | 'study'
  const [transactions, setTransactions] = useState(loadTransactions);
  const [tasks, setTasks] = useState(loadTasks);
  const [streak, setStreak] = useState(loadStreak);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isStreakOpen, setIsStreakOpen] = useState(false);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStreak(streak);
  }, [streak]);

  const handleOpenQuickAdd = () => {
    sound.playClick();
    setActiveTab('finance');
  };

  return (
    <div className="main-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <Header
        onOpenSync={() => setIsSyncOpen(true)}
        onOpenStreak={() => setIsStreakOpen(true)}
        streak={streak}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            tasks={tasks}
            streak={streak}
            setActiveTab={setActiveTab}
            onOpenQuickAdd={handleOpenQuickAdd}
          />
        )}

        {activeTab === 'finance' && (
          <FinFlow
            transactions={transactions}
            setTransactions={setTransactions}
          />
        )}

        {activeTab === 'study' && (
          <StudyFlow
            tasks={tasks}
            setTasks={setTasks}
            streak={streak}
            setStreak={setStreak}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto'
      }}>
        <p>Zenith • Finance & Focus System</p>
      </footer>

      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <button
          onClick={() => { sound.playClick(); setActiveTab('dashboard'); }}
          className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Tổng quan</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('finance'); }}
          className={`mobile-nav-btn ${activeTab === 'finance' ? 'active' : ''}`}
        >
          <Wallet size={18} />
          <span>Tài chính</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('study'); }}
          className={`mobile-nav-btn ${activeTab === 'study' ? 'active' : ''}`}
        >
          <BookOpen size={18} />
          <span>Học tập</span>
        </button>
      </nav>

      {/* Sync Modal */}
      {isSyncOpen && (
        <SyncModal
          onClose={() => setIsSyncOpen(false)}
          setTransactions={setTransactions}
          setTasks={setTasks}
          setStreak={setStreak}
        />
      )}

      {/* Streak Calendar Modal */}
      {isStreakOpen && (
        <StreakModal
          streak={streak}
          onClose={() => setIsStreakOpen(false)}
        />
      )}

    </div>
  );
}
