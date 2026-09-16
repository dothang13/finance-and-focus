/**
 * Smart Auto-Categorization Engine
 * Automatically detects category and 50/30/20 group based on note keywords.
 */

export const CATEGORY_KEYWORDS = [
  // Đi lại & Xăng xe
  {
    keywords: ['xăng', 'đổ xăng', 'grab', 'be', 'gojek', 'taxi', 'gửi xe', 'vé xe', 'xe bus', 'sửa xe', 'thay nhớt', 'rửa xe', 'vé tàu', 'bến xe', 'cầu đường', 'vé tàu điện', 'bảo dưỡng xe'],
    category: 'Đi lại & Xăng xe',
    group: 'Thiết yếu',
    type: 'Chi'
  },
  // Nhà ở & Tiền thuê
  {
    keywords: ['tiền trọ', 'phòng trọ', 'tiền nhà', 'tiền phòng', 'thuê trọ', 'thuê nhà', 'chủ trọ', 'chủ nhà', 'đặt cọc phòng', 'đóng tiền trọ'],
    category: 'Nhà ở & Tiền thuê',
    group: 'Thiết yếu',
    type: 'Chi'
  },
  // Tiện ích & Dịch vụ số
  {
    keywords: ['tiền điện', 'tiền nước', 'điện nước', 'wifi', 'internet', 'tiền mạng', 'tiền rác', 'dịch vụ chung cư', 'truyền hình', '4g', 'nạp đt', 'tiền net', 'viettel', 'mobifone', 'vinaphone'],
    category: 'Tiện ích & Dịch vụ số',
    group: 'Thiết yếu',
    type: 'Chi'
  },
  // Y tế & Bảo hiểm
  {
    keywords: ['thuốc', 'hiệu thuốc', 'bệnh viện', 'bác sĩ', 'khám bệnh', 'nha khoa', 'răng', 'y tế', 'bảo hiểm y tế', 'bảo hiểm', 'xét nghiệm', 'khám răng', 'tiêm phòng', 'vitamin'],
    category: 'Y tế & Bảo hiểm',
    group: 'Thiết yếu',
    type: 'Chi'
  },
  // Ăn uống & Nhu yếu phẩm
  {
    keywords: ['cơm', 'phở', 'bún', 'bánh mì', 'thịt', 'cá', 'rau', 'chợ', 'siêu thị', 'trứng', 'sữa', 'mì tôm', 'ăn trưa', 'ăn sáng', 'ăn tối', 'vinmart', 'winmart', 'coopmart', 'bách hoá xanh', 'bách hóa', 'đồ ăn', 'nấu cơm', 'gạo', 'dầu ăn', 'muối', 'gia vị', 'uống nước'],
    category: 'Ăn uống & Nhu yếu phẩm',
    group: 'Thiết yếu',
    type: 'Chi'
  },
  // Cà phê & Gặp gỡ
  {
    keywords: ['cà phê', 'cafe', 'coffee', 'trà sữa', 'highlands', 'starbucks', 'phúc long', 'toco', 'trà đào', 'ăn vặt', 'nhậu', 'bia', 'tụ tập', 'gặp bạn', 'liên hoan', 'quán nước', 'chill'],
    category: 'Cà phê & Gặp gỡ',
    group: 'Mong muốn',
    type: 'Chi'
  },
  // Mua sắm cá nhân
  {
    keywords: ['quần', 'áo', 'giày', 'dép', 'shopee', 'lazada', 'tiki', 'tiktok shop', 'mỹ phẩm', 'son', 'nước hoa', 'túi xách', 'balo', 'đồng hồ', 'mua sắm', 'shopping', 'dưỡng da', 'cắt tóc', 'sữa rửa mặt'],
    category: 'Mua sắm cá nhân',
    group: 'Mong muốn',
    type: 'Chi'
  },
  // Du lịch & Giải trí
  {
    keywords: ['xem phim', 'cgv', 'bhd', 'lotte cinema', 'du lịch', 'vé máy bay', 'khách sạn', 'homestay', 'game', 'nạp game', 'nạp thẻ', 'spotify', 'netflix', 'youtube premium', 'karaoke', 'billiard', 'bi-a'],
    category: 'Du lịch & Giải trí',
    group: 'Mong muốn',
    type: 'Chi'
  },
  // Khóa học & Kỹ năng
  {
    keywords: ['sách', 'khóa học', 'khoá học', 'học phí', 'tiếng anh', 'tiếng nhật', 'kanji', 'n3', 'n2', 'ielts', 'toeic', 'udemy', 'coursera', 'giáo trình', 'vở viết', 'bút'],
    category: 'Khóa học & Kỹ năng',
    group: 'Mong muốn',
    type: 'Chi'
  },
  // Đầu tư tích lũy
  {
    keywords: ['đầu tư', 'chứng khoán', 'cổ phiếu', 'vàng', 'crypto', 'bitcoin', 'quỹ đầu tư', 'tích lũy'],
    category: 'Đầu tư tích lũy',
    group: 'Tiết kiệm',
    type: 'Tiết kiệm'
  },
  // Tiết kiệm & Khẩn cấp
  {
    keywords: ['tiết kiệm', 'gửi tiết kiệm', 'sổ tiết kiệm', 'quỹ khẩn cấp', 'dự phòng', 'nuôi heo', 'bỏ ống'],
    category: 'Quỹ khẩn cấp',
    group: 'Tiết kiệm',
    type: 'Tiết kiệm'
  },
  // Thưởng
  {
    keywords: ['thưởng', 'bonus', 'hoa hồng', 'thưởng tết', 'thưởng tháng', 'thưởng nóng'],
    category: 'Thưởng',
    group: 'Thu nhập',
    type: 'Thu'
  },
  // Lương
  {
    keywords: ['lương', 'salary', 'nhận lương', 'lương tháng', 'ting ting', 'chuyển lương'],
    category: 'Lương tháng',
    group: 'Thu nhập',
    type: 'Thu'
  }
];

/**
 * Detects matching category and 50/30/20 group from raw note text
 * @param {string} noteText 
 * @returns {object|null}
 */
export const detectCategoryFromNote = (noteText) => {
  if (!noteText || typeof noteText !== 'string') return null;
  const lower = noteText.toLowerCase().trim();
  if (!lower) return null;

  for (const rule of CATEGORY_KEYWORDS) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return {
          matchedKeyword: kw,
          category: rule.category,
          group: rule.group,
          type: rule.type
        };
      }
    }
  }

  return null;
};
