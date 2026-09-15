const STORAGE_KEY_TRANSACTIONS = 'zenith_transactions';
const STORAGE_KEY_TASKS = 'zenith_tasks';
const STORAGE_KEY_STREAK = 'zenith_streak';
const STORAGE_KEY_STUDY_LOG = 'zenith_study_log';
const STORAGE_KEY_VOCAB_LIST = 'zenith_vocab_list';
const STORAGE_KEY_BUDGET_PLAN = 'zenith_saved_budget_plan';
const STORAGE_KEY_DATA_VERSION = 'zenith_data_version';
const CURRENT_DATA_VERSION = 'v3_super_app';

export const INITIAL_TRANSACTIONS = [];

export const INITIAL_TASKS = [];

export const INITIAL_STREAK = {
  currentStreak: 0,
  bestStreak: 0,
  kanjiVocabCount: 0,
  studyMinutesToday: 0,
  dailyGoalMinutes: 90
};

export const INITIAL_STUDY_LOG = [];

export const INITIAL_VOCAB_LIST = [];

// Tự động xoá cache dữ liệu mẫu cũ trên trình duyệt để bắt đầu sạch sẽ
try {
  const currentVer = localStorage.getItem(STORAGE_KEY_DATA_VERSION);
  if (currentVer !== CURRENT_DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_STREAK);
    localStorage.removeItem(STORAGE_KEY_STUDY_LOG);
    localStorage.removeItem(STORAGE_KEY_VOCAB_LIST);
    localStorage.setItem(STORAGE_KEY_DATA_VERSION, CURRENT_DATA_VERSION);
  }
} catch {
  // ignore in non-browser or restricted environments
}

export const loadTransactions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return raw ? JSON.parse(raw) : INITIAL_TRANSACTIONS;
  } catch (e) {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveTransactions = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
};

export const loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    return raw ? JSON.parse(raw) : INITIAL_TASKS;
  } catch (e) {
    return INITIAL_TASKS;
  }
};

export const saveTasks = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
};

export const loadStreak = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STREAK);
    return raw ? JSON.parse(raw) : INITIAL_STREAK;
  } catch (e) {
    return INITIAL_STREAK;
  }
};

export const saveStreak = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save streak:', e);
  }
};

export const loadStudyLog = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDY_LOG);
    return raw ? JSON.parse(raw) : INITIAL_STUDY_LOG;
  } catch (e) {
    return INITIAL_STUDY_LOG;
  }
};

export const saveStudyLog = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY_STUDY_LOG, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save study log:', err);
  }
};

export const loadVocabList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOCAB_LIST);
    return raw ? JSON.parse(raw) : INITIAL_VOCAB_LIST;
  } catch {
    return INITIAL_VOCAB_LIST;
  }
};

export const saveVocabList = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY_VOCAB_LIST, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save vocab list:', err);
  }
};

export const loadSavedBudgetPlan = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGET_PLAN);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSavedBudgetPlan = (plan) => {
  try {
    localStorage.setItem(STORAGE_KEY_BUDGET_PLAN, JSON.stringify(plan));
  } catch (err) {
    console.error('Failed to save budget plan:', err);
  }
};

export const deleteSavedBudgetPlan = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_BUDGET_PLAN);
  } catch {}
};

export const exportAllData = () => {
  const data = {
    appName: 'Zenith',
    exportedAt: new Date().toISOString(),
    transactions: loadTransactions(),
    tasks: loadTasks(),
    streak: loadStreak(),
    studyLog: loadStudyLog(),
    vocabList: loadVocabList(),
    savedBudgetPlan: loadSavedBudgetPlan()
  };
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.transactions) saveTransactions(parsed.transactions);
    if (parsed.tasks) saveTasks(parsed.tasks);
    if (parsed.streak) saveStreak(parsed.streak);
    if (parsed.studyLog) saveStudyLog(parsed.studyLog);
    if (parsed.vocabList) saveVocabList(parsed.vocabList);
    if (parsed.savedBudgetPlan) saveSavedBudgetPlan(parsed.savedBudgetPlan);
    return true;
  } catch {
    return false;
  }
};
