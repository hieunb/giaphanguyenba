# Roadmap - Gia Phả OS

Tài liệu này mô tả các tính năng nâng cao sẽ được phát triển để biến Gia Phả OS từ **"hệ thống lưu trữ gia phả"** → **"nền tảng quản trị cộng đồng dòng họ"**.

---

## 📋 Mục lục

- [1. Vinh danh thành tích (Honor/Achievement)](#1-vinh-danh-thành-tích-honorachievement)
- [2. Quỹ Họ & Quỹ Khuyến học](#2-quỹ-họ--quỹ-khuyến-học)
- [3. Lịch sự kiện dòng họ](#3-lịch-sự-kiện-dòng-họ)
- [4. Kho tài liệu dòng họ](#4-kho-tài-liệu-dòng-họ)
- [5. Kiến trúc hệ thống](#5-kiến-trúc-hệ-thống)
- [6. Tính năng AI (Tương lai)](#6-tính-năng-ai-tương-lai)
- [7. Timeline triển khai](#7-timeline-triển-khai)

---

## 1. Vinh danh thành tích (Honor/Achievement)

### 🎯 Mục tiêu

Ghi nhận và lan tỏa các thành tích của con cháu trong dòng họ, tạo **"bảng vàng truyền thống"** số hóa trong từ đường.

### 📊 Các loại thành tích

| Loại | Ví dụ |
|------|-------|
| **Học tập** | Thủ khoa đại học, học bổng quốc tế |
| **Khoa bảng** | Tiến sĩ, Giáo sư, Học vị |
| **Nghề nghiệp** | CEO, Lãnh đạo cấp cao, Doanh nhân |
| **Văn hóa** | Nghệ sĩ nhân dân, Nhà văn |
| **Thể thao** | Huy chương Olympic, SEA Games |
| **Xã hội** | Anh hùng lao động, Huân chương |
| **Đóng góp dòng họ** | Tài trợ xây nhà thờ họ, tu sửa mộ tổ |

### 🗂️ Dữ liệu (Schema)

```sql
achievements
-------------
id              UUID PRIMARY KEY
member_id       UUID REFERENCES persons(id)
title           TEXT NOT NULL
description     TEXT
achievement_type TEXT NOT NULL -- 'education', 'career', 'culture', 'sports', 'social', 'clan_contribution'
year            INTEGER
organization    TEXT
certificate_url TEXT
image_url       TEXT
verified_by     UUID REFERENCES profiles(id)
is_featured     BOOLEAN DEFAULT FALSE
created_by      UUID REFERENCES profiles(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### 🖥️ Giao diện

#### 1️⃣ Trang **Bảng vàng dòng họ** (`/dashboard/achievements`)

```
🏆 Bảng vàng thành tích dòng họ

━━━ 2025 ━━━
🎓 Nguyễn Văn A – Học bổng MIT toàn phần
🥇 Nguyễn Văn B – Huy chương Vàng Olympic Toán Quốc gia

━━━ 2024 ━━━
🎓 Nguyễn Thị C – Tiến sĩ Oxford, chuyên ngành AI
💼 Nguyễn Văn D – CEO startup công nghệ, định giá 10M USD
```

#### 2️⃣ Trang **Profile cá nhân**

```
Nguyễn Văn A
Đời thứ 7 – Chi 3

🏆 Thành tích
━━━━━━━━━━━━━━━━━━━━━
2025
🎓 Học bổng MIT toàn phần
   Viện Công nghệ Massachusetts

2023  
🥇 Giải Nhất Olympic Toán Việt Nam
   Bộ Giáo dục & Đào tạo
```

### ✨ Tính năng

- ✅ Admin/Editor thêm, sửa, xóa thành tích
- ✅ Upload chứng chỉ, ảnh minh chứng
- ✅ Đánh dấu "Thành tích nổi bật" để hiển thị trang chủ
- ✅ Lọc theo loại, năm, người
- ✅ Export PDF "Bảng vàng dòng họ"

### 💡 Lợi ích

- Tăng **niềm tự hào dòng họ**
- Truyền cảm hứng cho thế hệ trẻ
- Lưu giữ di sản văn hóa
- Tạo văn hóa cạnh tranh tích cực

---

## 2. Quỹ Họ & Quỹ Khuyến học

### 🎯 Mục tiêu

Quản lý tài chính minh bạch cho các hoạt động dòng họ.

### 💰 Hai loại quỹ

#### 1️⃣ Quỹ Họ (Clan Fund)

**Mục đích sử dụng:**
- Tu sửa, xây dựng nhà thờ họ
- Tổ chức giỗ tổ, lễ khánh thành
- Hỗ trợ người khó khăn trong dòng họ
- In ấn gia phả, sách lịch sử

#### 2️⃣ Quỹ Khuyến học (Scholarship Fund)

**Mục đích sử dụng:**
- Thưởng học sinh giỏi trong họ
- Hỗ trợ học phí cho học sinh khó khăn
- Học bổng du học
- Hỗ trợ nghiên cứu khoa học

### 🗂️ Dữ liệu (Schema)

```sql
-- Bảng Quỹ
funds
------
id              UUID PRIMARY KEY
name            TEXT NOT NULL
description     TEXT
fund_type       TEXT NOT NULL -- 'clan_fund', 'scholarship_fund'
balance         DECIMAL(15,2) DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()

-- Bảng Giao dịch
fund_transactions
-----------------
id                UUID PRIMARY KEY
fund_id           UUID REFERENCES funds(id)
member_id         UUID REFERENCES persons(id) -- người đóng góp hoặc nhận
amount            DECIMAL(15,2) NOT NULL
transaction_type  TEXT NOT NULL -- 'donation', 'expense', 'scholarship', 'support'
description       TEXT
receipt_url       TEXT
transaction_date  DATE NOT NULL
recorded_by       UUID REFERENCES profiles(id)
created_at        TIMESTAMPTZ DEFAULT NOW()
```

### 🖥️ Giao diện

#### 1️⃣ Admin Panel - Quản lý Quỹ

```
📊 Quỹ Họ Nguyễn
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Số dư hiện tại: 120,000,000 VNĐ

📈 Thu nhập (Tháng 3/2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
+ 5,000,000 đ   Nguyễn Văn A
+ 1,000,000 đ   Nguyễn Văn B  
+ 2,000,000 đ   Nguyễn Thị C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tổng thu:        8,000,000 đ

📉 Chi tiêu (Tháng 3/2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 20,000,000 đ  Tu sửa nhà thờ họ
- 5,000,000 đ   Tổ chức giỗ tổ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tổng chi:        25,000,000 đ
```

#### 2️⃣ Trang đóng góp công khai

```
💝 Ủng hộ Quỹ Khuyến học

Số tiền đóng góp:
┌──────────────────────────┐
│  [500,000] VNĐ           │
└──────────────────────────┘

Người đóng góp:
┌──────────────────────────┐
│  Nguyễn Văn A            │
└──────────────────────────┘

Ghi chú (tùy chọn):
┌──────────────────────────┐
│                          │
└──────────────────────────┘

[💳 Thanh toán]  [📱 QR Code]
```

#### 3️⃣ Báo cáo tài chính công khai

```
📊 Báo cáo Quỹ Họ năm 2025

Tổng thu:    150,000,000 đ
Tổng chi:    120,000,000 đ
Còn lại:      30,000,000 đ

Chi tiết:
  Tu sửa nhà thờ:     80,000,000 đ
  Tổ chức sự kiện:    30,000,000 đ
  In gia phả:         10,000,000 đ

[📥 Tải Báo cáo Excel]  [📄 Xuất PDF]
```

### ✨ Tính năng

- ✅ Ghi nhận đóng góp với biên lai
- ✅ Theo dõi chi tiêu có chứng từ
- ✅ Báo cáo tài chính theo tháng/quý/năm
- ✅ Export Excel/PDF
- ✅ QR Code chuyển khoản
- ✅ Dashboard thống kê trực quan
- ✅ Phân quyền: Admin full access, Member chỉ xem báo cáo

### 💡 Lợi ích

- **Minh bạch tài chính** - tăng lòng tin
- **Dễ dàng quản lý** - không cần Excel
- **Lưu trữ vĩnh viễn** - không mất dữ liệu
- **Khuyến khích đóng góp** - thấy rõ sử dụng

---

## 3. Lịch sự kiện dòng họ

### 🎯 Mục tiêu

Quản lý tập trung các hoạt động và sự kiện truyền thống của dòng họ.

### 📅 Các loại sự kiện

| Loại | Ví dụ | Chu kỳ |
|------|-------|--------|
| **Giỗ tổ** | Giỗ Tổ tiên, Giỗ cụ | Hàng năm (âm lịch) |
| **Họp họ** | Họp chi, họp tộc | Định kỳ |
| **Lễ khánh thành** | Nhà thờ họ, bia công đức | Một lần |
| **Khuyến học** | Trao học bổng | Hàng năm |
| **Cưới hỏi** | Con cháu trong họ | Theo sự kiện |
| **Thể thao** | Giải bóng đá dòng họ | Định kỳ |

### 🗂️ Dữ liệu (Schema)

```sql
events
------
id              UUID PRIMARY KEY
title           TEXT NOT NULL
description     TEXT
event_type      TEXT NOT NULL -- 'ancestor_memorial', 'clan_meeting', 'inauguration', 'scholarship', 'wedding', 'sports', 'other'
start_date      TIMESTAMPTZ NOT NULL
end_date        TIMESTAMPTZ
location        TEXT
is_lunar        BOOLEAN DEFAULT FALSE -- Âm lịch hay dương lịch
recurrence      TEXT -- 'yearly', 'monthly', null
max_attendees   INTEGER
image_url       TEXT
created_by      UUID REFERENCES profiles(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()

-- RSVP (Xác nhận tham dự)
event_attendees
---------------
id              UUID PRIMARY KEY
event_id        UUID REFERENCES events(id)
member_id       UUID REFERENCES persons(id)
status          TEXT NOT NULL -- 'confirmed', 'declined', 'maybe'
note            TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()

-- Ảnh sự kiện
event_photos
------------
id              UUID PRIMARY KEY
event_id        UUID REFERENCES events(id)
photo_url       TEXT NOT NULL
caption         TEXT
uploaded_by     UUID REFERENCES profiles(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### 🖥️ Giao diện

#### 1️⃣ Calendar View

```
📅 Lịch sự kiện dòng họ - Tháng 3/2026

  CN    T2    T3    T4    T5    T6    T7
   1     2     3     4     5     6     7
   8     9    10    11    12    13    14
 [15]   16    17    18    19   [20]   21
  22    23    24    25    26    27    28
  29    30    31

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
15/3 (15/2 Âm lịch)
🕯️ Giỗ Tổ Họ Nguyễn
📍 Nhà thờ họ Nguyễn, Làng cổ
👥 120 người đã xác nhận tham dự

20/3  
🎓 Lễ trao học bổng khuyến học
📍 Hội trường dòng họ
👥 45 người đã xác nhận tham dự
```

#### 2️⃣ Chi tiết sự kiện

```
🕯️ Giỗ Tổ Họ Nguyễn

📅 15/3/2026 (15/2 Âm lịch)
⏰ 8:00 - 12:00
📍 Nhà thờ họ Nguyễn, Làng cổ

Mô tả:
Lễ giỗ tổ tiên đời thứ nhất của dòng họ Nguyễn.
Toàn thể con cháu tề tựu về dâng hương.

👥 Danh sách tham dự (120/150)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Nguyễn Văn A    (Đời 6)
✅ Nguyễn Văn B    (Đời 7)  
⏳ Nguyễn Thị C    (Đời 7)
❌ Nguyễn Văn D    (Đời 8)

[✅ Xác nhận tham dự]  [📸 Xem ảnh sự kiện]
```

#### 3️⃣ Thông báo nhắc lịch

```
🔔 Sắp đến: Giỗ Tổ Họ Nguyễn

📅 Còn 7 ngày (15/3/2026)
📍 Nhà thờ họ Nguyễn

Bạn đã xác nhận tham dự chưa?

[✅ Tôi sẽ đến]  [❌ Không thể tham dự]
```

### ✨ Tính năng

- ✅ Xem theo lịch (tháng, tuần, năm)
- ✅ Hỗ trợ âm lịch / dương lịch
- ✅ RSVP xác nhận tham dự
- ✅ Nhắc lịch qua email/Zalo (webhook)
- ✅ Upload ảnh sau sự kiện
- ✅ Thống kê số người tham dự
- ✅ Lặp lại hàng năm (giỗ tổ)

### 💡 Lợi ích

- Không bỏ lỡ sự kiện quan trọng
- Dễ dàng thống kê số người
- Lưu trữ kỷ niệm bằng ảnh
- Tăng sự gắn kết cộng đồng

---

## 4. Kho tài liệu dòng họ

### 🎯 Mục tiêu

Xây dựng **"thư viện số"** của dòng họ để lưu trữ và bảo tồn di sản văn hóa.

### 📚 Các loại tài liệu

| Loại | Ví dụ | Format |
|------|-------|--------|
| **Gia phả** | Bản gia phả năm 1902 | PDF, DOCX |
| **Sắc phong** | Sắc phong vua Tự Đức | PDF, JPG |
| **Văn bia** | Bia công đức, bia lịch sử | PDF, Text |
| **Lịch sử họ** | Nghiên cứu nguồn gốc | PDF, DOCX |
| **Ảnh cũ** | Ảnh tổ tiên, nhà thờ họ | JPG, PNG |
| **Video** | Lễ giỗ, họp họ | MP4 |
| **Quy chế** | Quy chế dòng họ | PDF |

### 🗂️ Dữ liệu (Schema)

```sql
document_categories
-------------------
id              UUID PRIMARY KEY
name            TEXT NOT NULL
description     TEXT
parent_id       UUID REFERENCES document_categories(id)
icon            TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()

documents
---------
id              UUID PRIMARY KEY
title           TEXT NOT NULL
description     TEXT
category_id     UUID REFERENCES document_categories(id)
file_url        TEXT NOT NULL
file_type       TEXT -- 'pdf', 'image', 'video', 'doc'
file_size       BIGINT -- bytes
thumbnail_url   TEXT
is_public       BOOLEAN DEFAULT FALSE
uploaded_by     UUID REFERENCES profiles(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()

-- Tags cho tài liệu
document_tags
-------------
id              UUID PRIMARY KEY
document_id     UUID REFERENCES documents(id)
tag             TEXT NOT NULL
```

### 🖥️ Giao diện

#### 1️⃣ Thư viện tài liệu

```
📚 Kho tài liệu dòng họ

🔍 [Tìm kiếm...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Gia phá (12 tài liệu)
📁 Sắc phong (5 tài liệu)
📁 Văn bia (8 tài liệu)
📁 Ảnh lịch sử (234 tài liệu)
📁 Nghiên cứu dòng họ (15 tài liệu)
📁 Video sự kiện (23 tài liệu)
📁 Quy chế & Nội quy (3 tài liệu)
```

#### 2️⃣ Chi tiết tài liệu

```
Gia phả Họ Nguyễn (1902)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[🖼️ Thumbnail ảnh bìa]

📄 Định dạng: PDF
💾 Kích thước: 12.5 MB  
📅 Upload: 15/01/2025
👤 Người upload: Nguyễn Văn A

Mô tả:
Bản gia phả gốc được viết tay năm 1902,
đã được số hóa với chất lượng cao.

🏷️ Tags: gia-pha, lich-su, 1902

[📥 Tải xuống]  [👁️ Xem trực tuyến]
```

#### 3️⃣ Upload tài liệu

```
📤 Upload tài liệu mới

Tiêu đề:
┌──────────────────────────┐
│  Sắc phong năm 1885      │
└──────────────────────────┘

Danh mục:
┌──────────────────────────┐
│  📁 Sắc phong          ▼ │
└──────────────────────────┘

File:
[📎 Chọn file...]  (Max 50MB)

Mô tả:
┌──────────────────────────┐
│                          │
│                          │
└──────────────────────────┘

Tags: (phân cách bằng dấu ,)
┌──────────────────────────┐
│  sac-phong, 1885         │
└──────────────────────────┘

☐ Công khai cho tất cả thành viên

[📤 Upload]  [❌ Hủy]
```

### ✨ Tính năng

- ✅ Phân loại theo danh mục
- ✅ Tìm kiếm full-text
- ✅ Tag hóa tài liệu
- ✅ Preview trực tuyến (PDF, ảnh)
- ✅ Download file
- ✅ Phân quyền xem (public/private)
- ✅ Thumbnail tự động
- ✅ Quản lý version (upload phiên bản mới)

### 💡 Lợi ích

- **Bảo tồn di sản** - số hóa tài liệu giấy
- **Dễ truy cập** - tìm kiếm nhanh chóng
- **An toàn** - không bị mất mát
- **Chia sẻ** - mọi người đều xem được

---

## 5. Kiến trúc hệ thống

### 🏗️ Tech Stack

```
Frontend:     Next.js 16 + React 19 + TypeScript
Backend:      Next.js Server Actions
Database:     Supabase PostgreSQL
Storage:      Supabase Storage
Auth:         Supabase Auth
Deployment:   Vercel / Docker / Kubernetes
```

### 📦 Supabase Storage Structure

```
storage/
├── achievements/        # Chứng chỉ, ảnh thành tích
│   ├── {member_id}/
│   │   └── {achievement_id}.jpg
│
├── documents/          # Tài liệu dòng họ
│   ├── genealogy/     # Gia phả
│   ├── decrees/       # Sắc phong
│   ├── steles/        # Văn bia
│   ├── photos/        # Ảnh lịch sử
│   └── videos/        # Video
│
├── events/            # Ảnh sự kiện
│   └── {event_id}/
│       └── {photo_id}.jpg
│
└── receipts/          # Biên lai quỹ
    └── {transaction_id}.pdf
```

### 🔐 Phân quyền (RLS Policies)

| Module | Admin | Editor | Member | Guest |
|--------|-------|--------|--------|-------|
| **Achievements** | Full | Add/Edit | View | - |
| **Funds** | Full | View | View Reports | - |
| **Events** | Full | Add/Edit | View + RSVP | View Public |
| **Documents** | Full | Add/Edit | View | View Public |

### 🔄 Luồng dữ liệu tổng thể

```
┌─────────────────────────────────────────────────┐
│              MEMBERS (Core)                      │
│      Thông tin thành viên & Phả hệ              │
└─────────────┬───────────────────────────────────┘
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
┌─────────────┐  ┌─────────────┐  
│Achievements │  │   Funds     │  
│  Thành tích │  │   Quỹ họ    │  
└─────────────┘  └─────────────┘  
      │                │
      └───────┬────────┘
              │
              ▼
      ┌───────────────┐
      │    Events     │
      │  Sự kiện      │
      └───────────────┘
              │
              ▼
      ┌───────────────┐
      │  Documents    │
      │  Tài liệu     │
      └───────────────┘
```

---

## 6. Tính năng AI (Tương lai)

### 🤖 AI Features Roadmap

#### Phase 1: AI Data Processing
- **OCR gia phả giấy** - Extract text từ gia phả scan
  - Nhận diện chữ Hán Nôm
  - Tự động parse thành cấu trúc dữ liệu
  
- **AI Family Photo Recognition**
  - Gắn tag tự động cho ảnh cũ
  - Nhận diện người trong ảnh

#### Phase 2: AI Analysis
- **AI Kinship Calculator**
  - Tính toán mối quan hệ phức tạp
  - Đề xuất cách xưng hô chính xác
  
- **AI Statistical Insights**
  - Phân tích xu hướng dòng họ
  - Dự đoán nhân khẩu học

#### Phase 3: AI Content Generation
- **AI Chatbot về Tổ tiên**
  - Trả lời câu hỏi về lịch sử dòng họ
  - RAG với database gia phả
  
- **AI viết lịch sử dòng họ**
  - Generate narrative từ data
  - Xuất PDF lịch sử tự động

### 🛠️ Tech Stack cho AI

```
OCR:          Azure AI Vision / Google Cloud Vision
LLM:          GPT-4 / Claude / Gemini
Vector DB:    Supabase pgvector
Framework:    LangChain / LlamaIndex
```

---

## 7. Timeline triển khai

### 📅 Roadmap Implementation

#### Q2 2026: Foundation
- ✅ System hiện tại (Members, Family Tree, Stats)
- [ ] Refactor codebase (tests, error handling)
- [ ] Enhanced RLS policies

#### Q3 2026: Community Features
- [ ] **Module 1: Achievements** (4 tuần)
  - Week 1-2: Database + Backend
  - Week 3-4: Frontend + UI
  
- [ ] **Module 2: Events** (4 tuần)
  - Week 1-2: Calendar + RSVP
  - Week 3-4: Photos + Reminders

#### Q4 2026: Finance & Documents
- [ ] **Module 3: Funds** (6 tuần)
  - Week 1-3: Fund management + Transactions
  - Week 4-6: Reports + Export
  
- [ ] **Module 4: Documents** (4 tuần)
  - Week 1-2: Storage + Upload
  - Week 3-4: Search + Preview

#### Q1 2027: Polish & Launch
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Production deployment

#### Q2-Q4 2027: AI Features
- [ ] OCR implementation
- [ ] AI chatbot
- [ ] Advanced analytics

---

## 🎯 Ưu tiên phát triển

### Priority 1: Must-have
1. ✅ Members & Family Tree (Done)
2. 🔄 Achievements
3. 🔄 Events

### Priority 2: Should-have
4. 🔄 Funds Management
5. 🔄 Documents Library

### Priority 3: Nice-to-have
6. 📋 AI Features
7. 📋 Mobile App
8. 📋 Multi-tenant SaaS

---

## 🤝 Đóng góp

Nếu bạn muốn đóng góp phát triển các module này:

1. Chọn module bạn quan tâm
2. Xem file `docs/schema_extended.sql` cho database design
3. Tạo Pull Request
4. Join Discord/Telegram để thảo luận

---

## 📞 Liên hệ

- 📧 Email: [your-email]
- 💬 Discord: [link]
- 📱 Telegram: [link]

---

**Cùng nhau xây dựng nền tảng quản trị dòng họ hoàn hảo! 🏛️**
