-- =============================================================================
-- LOOK ENGLISH - HỆ THỐNG QUẢN LÝ & HỌC TẬP NGOẠI NGỮ
-- DATABASE SCHEMA SPECIFICATION (POSTGRESQL / MYSQL COMPATIBLE)
-- Hỗ trợ đồng bộ Backend Real-time giữa Máy tính & Điện thoại di động
-- =============================================================================

-- 1. BẢNG TÀI KHOẢN NGƯỜI DÙNG (USERS)
-- Quản trị viên (Admin), Giáo viên (Teacher), Học viên (Student), Phụ huynh (Parent)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent', 'guest')),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    student_code VARCHAR(32) UNIQUE, -- Ví dụ: LK-STAR-101, LK-IELTS-204 (bắt buộc khi phụ huynh đăng ký)
    class_id VARCHAR(64), -- Lớp học chính của học sinh
    phone VARCHAR(32),
    avatar_url TEXT,
    parent_of_student_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL, -- Liên kết phụ huynh với học viên
    account_status VARCHAR(32) DEFAULT 'active' CHECK (account_status IN ('active', 'pending', 'locked')),
    reward_stars INT DEFAULT 40, -- Tổng điểm sao tích lũy khen thưởng của học sinh
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_student_code ON users(student_code);
CREATE INDEX IF NOT EXISTS idx_users_parent_child ON users(parent_of_student_id);

-- 2. BẢNG LỚP HỌC (CLASSES)
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(64) PRIMARY KEY,
    class_name VARCHAR(255) NOT NULL,
    teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    level VARCHAR(64), -- IELTS 6.5+, Cambridge Flyers, Kids Starters, Teen English
    schedule VARCHAR(255), -- Ví dụ: T2-T4-T6 (18:00 - 19:30)
    room VARCHAR(64), -- Phòng học, ví dụ: Room 204
    max_capacity INT DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG DANH SÁCH HỌC VIÊN TRONG LỚP (CLASS_ENROLLMENTS)
CREATE TABLE IF NOT EXISTS class_enrollments (
    class_id VARCHAR(64) REFERENCES classes(id) ON DELETE CASCADE,
    student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_id)
);

-- 4. BẢNG QUẢN LÝ TIỀN HỌC PHÍ (TUITION_FEES)
-- Quản lý học phí theo Tuần hoặc theo Tháng, tình trạng Nợ / Đã thanh toán, Biên lai
CREATE TABLE IF NOT EXISTS tuition_fees (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id VARCHAR(64) REFERENCES classes(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL, -- Ví dụ: "Học phí Tháng 10/2026", "Học phí Tuần 40 (01/10 - 07/10)"
    period_type VARCHAR(16) NOT NULL CHECK (period_type IN ('week', 'month')), -- 'week' (Tuần) hoặc 'month' (Tháng)
    period_label VARCHAR(64) NOT NULL, -- "Tháng 10/2026" hoặc "Tuần 40"
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0, -- Số tiền học phí (VNĐ)
    status VARCHAR(16) NOT NULL DEFAULT 'debt' CHECK (status IN ('debt', 'paid')), -- 'debt' (Nợ), 'paid' (Đã thanh toán)
    due_date DATE NOT NULL, -- Hạn chót đóng học phí
    paid_at TIMESTAMP WITH TIME ZONE, -- Thời gian thực tế phụ huynh đóng học phí
    receipt_image_url TEXT, -- Hình ảnh biên lai thu tiền / hóa đơn chuyển khoản ngân hàng
    note TEXT, -- Ghi chú giảm giá học bổng hoặc hình thức chuyển khoản
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tuition_student ON tuition_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_tuition_status ON tuition_fees(status);
CREATE INDEX IF NOT EXISTS idx_tuition_due_date ON tuition_fees(due_date);

-- 5. BẢNG ĐIỂM DANH HỌC VIÊN & CHỐT SĨ SỐ LỚP HÀNG NGÀY (DAILY_ATTENDANCE)
CREATE TABLE IF NOT EXISTS daily_attendance (
    id VARCHAR(128) PRIMARY KEY, -- att_{class_id}_{student_id}_{date}
    class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'late')),
    note TEXT, -- Ví dụ: "Vào muộn 10p", "Có đơn xin phép của phụ huynh"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON daily_attendance(class_id, date);

-- 6. BẢNG KHEN THƯỞNG, PHÊ BÌNH & CỘNG/TRỪ ĐIỂM SAO MỖI NGÀY (STUDENT_EVALUATIONS)
CREATE TABLE IF NOT EXISTS student_evaluations (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('reward', 'praise', 'discipline')),
    date DATE NOT NULL,
    star_delta INT DEFAULT 0, -- Ví dụ: +5 (Khen thưởng), +2 (Biểu dương), -1 (Phê bình nói chuyện), -2 (Không làm BTVN)
    reason_category VARCHAR(255),
    teacher_note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evaluations_student ON student_evaluations(student_id);

-- 7. BẢNG TIN TỨC TRUNG TÂM (CENTER_ANNOUNCEMENTS)
CREATE TABLE IF NOT EXISTS center_announcements (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('khai-giang', 'thi-cu', 'vinh-danh', 'thong-bao')),
    date DATE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_date ON center_announcements(date DESC);

-- 8. BẢNG HÌNH ẢNH HOẠT ĐỘNG & VIDEO TRUYỀN THÔNG (HOME_MEDIA_ITEMS)
CREATE TABLE IF NOT EXISTS home_media_items (
    id VARCHAR(64) PRIMARY KEY,
    tag VARCHAR(64) NOT NULL, -- 'COMPETITION', 'CLASSROOM', 'WORKSHOP', 'AWARDS', 'VIDEO'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    image_url TEXT NOT NULL,
    video_url TEXT,
    type VARCHAR(16) DEFAULT 'image' CHECK (type IN ('image', 'video')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. BẢNG ĐIỂM 4 KỸ NĂNG ACADEMIC (ACADEMIC_GRADES)
CREATE TABLE IF NOT EXISTS academic_grades (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(32) NOT NULL CHECK (skill IN ('listening', 'speaking', 'reading', 'writing', 'test')),
    score NUMERIC(4, 2) NOT NULL,
    date DATE NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. BẢNG BÀI TẬP VỀ NHÀ (HOMEWORK_ASSIGNMENTS)
CREATE TABLE IF NOT EXISTS homework_assignments (
    id VARCHAR(64) PRIMARY KEY,
    class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. BẢNG BÀI NỘP HỌC VIÊN (HOMEWORK_SUBMISSIONS)
CREATE TABLE IF NOT EXISTS homework_submissions (
    id VARCHAR(64) PRIMARY KEY,
    assignment_id VARCHAR(64) NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    score NUMERIC(4, 2),
    teacher_feedback TEXT,
    UNIQUE(assignment_id, student_id)
);

-- 12. BẢNG QUICK CHECK-IN HÀNG NGÀY CỦA HỌC SINH (STUDENT_CHECKINS)
CREATE TABLE IF NOT EXISTS student_checkins (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id VARCHAR(64) REFERENCES classes(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time VARCHAR(16) NOT NULL,
    mood VARCHAR(32) NOT NULL, -- 'excited', 'happy', 'confident', 'neutral', 'tired', 'stressed'
    mood_emoji VARCHAR(8) NOT NULL,
    mood_label VARCHAR(64) NOT NULL,
    energy_level INT DEFAULT 5 CHECK (energy_level BETWEEN 1 AND 5),
    reflection TEXT NOT NULL,
    topics_learned TEXT,
    need_help BOOLEAN DEFAULT FALSE,
    help_topic TEXT,
    parent_note TEXT,
    teacher_feedback JSONB, -- { teacherId, teacherName, comment, createdAt }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. BẢNG VINH DANH BẢNG VÀNG TOP 1 (LEADERBOARD_RECORDS)
CREATE TABLE IF NOT EXISTS leaderboard_records (
    id VARCHAR(64) PRIMARY KEY,
    class_id VARCHAR(64) REFERENCES classes(id) ON DELETE SET NULL,
    top_student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month VARCHAR(64) NOT NULL, -- "Tháng 10/2026"
    score NUMERIC(5, 2) NOT NULL,
    highlight_note TEXT,
    title VARCHAR(255),
    image_url TEXT,
    video_url TEXT,
    media_type VARCHAR(16) DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'both')),
    badge_text VARCHAR(64),
    stars_count INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. BẢNG CẤU HÌNH TÀI KHOẢN NGÂN HÀNG THU HỌC PHÍ (CENTER_BANK_CONFIG)
-- Admin có thể tự do điều chỉnh số tài khoản, tên ngân hàng linh hoạt mọi lúc
CREATE TABLE IF NOT EXISTS center_bank_config (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'current',
    bank_name VARCHAR(255) NOT NULL, -- Ví dụ: "Vietcombank (VCB)", "MB Bank"
    account_number VARCHAR(64) NOT NULL, -- Số tài khoản
    account_holder VARCHAR(255) NOT NULL, -- Tên chủ tài khoản hoặc tên trung tâm
    branch VARCHAR(255), -- Chi nhánh ngân hàng
    qr_image_url TEXT, -- Ảnh mã QR thanh toán (tải trực tiếp từ máy tính)
    note TEXT, -- Ghi chú hướng dẫn thêm khi phụ huynh chuyển khoản
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

