const STORAGE_KEY_TRANSACTIONS = 'zenith_transactions';
const STORAGE_KEY_TASKS = 'zenith_tasks';
const STORAGE_KEY_STREAK = 'zenith_streak';
const STORAGE_KEY_STUDY_LOG = 'zenith_study_log';

export const INITIAL_TRANSACTIONS = [
  { id: '1', date: '2026-09-01', type: 'Thu', category: 'Lương tháng', group: 'Thu nhập', amount: 30000000, method: 'Chuyển khoản', note: 'Lương cứng tháng 9' },
  { id: '2', date: '2026-09-02', type: 'Chi', category: 'Nhà ở & Tiền thuê', group: 'Thiết yếu', amount: 5500000, method: 'Chuyển khoản', note: 'Tiền thuê căn hộ' },
  { id: '3', date: '2026-09-03', type: 'Tiết kiệm', category: 'Quỹ khẩn cấp', group: 'Tiết kiệm', amount: 2500000, method: 'Chuyển khoản', note: 'Trích lập quỹ dự phòng' },
  { id: '4', date: '2026-09-03', type: 'Tiết kiệm', category: 'Đầu tư tích lũy', group: 'Tiết kiệm', amount: 2500000, method: 'Chuyển khoản', note: 'Mua chứng chỉ quỹ định kỳ' },
  { id: '5', date: '2026-09-04', type: 'Chi', category: 'Ăn uống & Nhu yếu phẩm', group: 'Thiết yếu', amount: 1800000, method: 'Thẻ tín dụng', note: 'Đi siêu thị WinMart đầu tháng' },
  { id: '6', date: '2026-09-05', type: 'Chi', category: 'Tiện ích & Dịch vụ số', group: 'Thiết yếu', amount: 1200000, method: 'Ví điện tử', note: 'Hóa đơn điện thoại & cáp internet' },
  { id: '7', date: '2026-09-06', type: 'Chi', category: 'Đi lại & Xăng xe', group: 'Thiết yếu', amount: 600000, method: 'Tiền mặt', note: 'Đổ xăng xe máy & phí gửi xe' },
  { id: '8', date: '2026-09-07', type: 'Chi', category: 'Ăn uống & Nhu yếu phẩm', group: 'Thiết yếu', amount: 850000, method: 'Thẻ tín dụng', note: 'Thực phẩm tươi tuần 2' },
  { id: '9', date: '2026-09-08', type: 'Chi', category: 'Cà phê & Gặp gỡ', group: 'Mong muốn', amount: 450000, method: 'Ví điện tử', note: 'Gặp bạn bè cuối tuần' },
  { id: '10', date: '2026-09-09', type: 'Chi', category: 'Mua sắm cá nhân', group: 'Mong muốn', amount: 1250000, method: 'Thẻ tín dụng', note: 'Quần áo & vật dụng cá nhân' },
  { id: '11', date: '2026-09-10', type: 'Thu', category: 'Thưởng', group: 'Thu nhập', amount: 3500000, method: 'Chuyển khoản', note: 'Thưởng dự án Q3' },
  { id: '12', date: '2026-09-11', type: 'Chi', category: 'Du lịch & Giải trí', group: 'Mong muốn', amount: 1200000, method: 'Thẻ tín dụng', note: 'Vé xem phim & ăn tối cuối tuần' },
  { id: '13', date: '2026-09-12', type: 'Chi', category: 'Khóa học & Kỹ năng', group: 'Mong muốn', amount: 800000, method: 'Chuyển khoản', note: 'Khóa học phát triển bản thân online' },
  { id: '14', date: '2026-09-13', type: 'Tiết kiệm', category: 'Tiết kiệm mục tiêu', group: 'Tiết kiệm', amount: 1000000, method: 'Chuyển khoản', note: 'Tiết kiệm mua sắm thiết bị mới' },
  { id: '15', date: '2026-09-14', type: 'Chi', category: 'Y tế & Bảo hiểm', group: 'Thiết yếu', amount: 500000, method: 'Chuyển khoản', note: 'Khám sức khỏe răng miệng & thuốc men' }
];

export const INITIAL_TASKS = [
  // Tiếng Nhật hôm nay
  { id: 't1', title: 'Học 20 chữ Hán Kanji N3 (Soumatome)', lang: 'ja', durationMin: 35, completed: true, date: '2026-09-14' },
  { id: 't2', title: 'Làm 1 bài Đọc hiểu ngắn Dokkai N3', lang: 'ja', durationMin: 25, completed: false, date: '2026-09-14' },
  { id: 't3', title: 'Nghe Luyện Choukai N3 đề thi chính thức các năm', lang: 'ja', durationMin: 30, completed: false, date: '2026-09-14' },

  // Tiếng Anh hôm nay
  { id: 't4', title: 'Nghe 1 bài Podcast BBC 6 Minute English & Shadowing', lang: 'en', durationMin: 20, completed: true, date: '2026-09-14' },
  { id: 't5', title: 'Ôn tập 20 từ vựng Business / Tech English trên Anki', lang: 'en', durationMin: 25, completed: false, date: '2026-09-14' },
  
  // Deep Work hôm nay
  { id: 't6', title: 'Nghiên cứu kiến trúc Clean Architecture & Kotlin', lang: 'deep', durationMin: 45, completed: true, date: '2026-09-14' },
  { id: 't7', title: 'Tối ưu hiệu năng ứng dụng & Refactor code', lang: 'deep', durationMin: 30, completed: false, date: '2026-09-14' },

  // Hôm qua (2026-09-13)
  { id: 't8', title: 'Học 15 Kanji N3 tuần 3', lang: 'ja', durationMin: 30, completed: true, date: '2026-09-13' },
  { id: 't9', title: 'Luyện Shadowing Podcast TED Talks 15 phút', lang: 'en', durationMin: 20, completed: true, date: '2026-09-13' },
  { id: 't10', title: 'Viết API test case cho dự án', lang: 'deep', durationMin: 40, completed: true, date: '2026-09-13' }
];

export const INITIAL_STREAK = {
  currentStreak: 8,
  bestStreak: 21,
  kanjiVocabCount: 38,
  studyMinutesToday: 55,
  dailyGoalMinutes: 90
};

// Log lịch sử học tập 7 ngày qua (để vẽ biểu đồ thống kê)
export const INITIAL_STUDY_LOG = [
  { date: '2026-09-08', ja: 45, en: 30, deep: 40 },
  { date: '2026-09-09', ja: 50, en: 25, deep: 50 },
  { date: '2026-09-10', ja: 60, en: 35, deep: 30 },
  { date: '2026-09-11', ja: 40, en: 40, deep: 60 },
  { date: '2026-09-12', ja: 55, en: 20, deep: 45 },
  { date: '2026-09-13', ja: 65, en: 30, deep: 55 },
  { date: '2026-09-14', ja: 35, en: 20, deep: 45 }
];

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
  } catch (e) {
    console.error('Failed to save study log:', e);
  }
};

export const exportAllData = () => {
  const data = {
    appName: 'Zenith',
    exportedAt: new Date().toISOString(),
    transactions: loadTransactions(),
    tasks: loadTasks(),
    streak: loadStreak(),
    studyLog: loadStudyLog()
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
    return true;
  } catch (e) {
    return false;
  }
};
