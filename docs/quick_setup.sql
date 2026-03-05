-- ==========================================
-- QUICK SETUP - 4 MODULES MỚI
-- Chạy file này trên Supabase SQL Editor
-- ==========================================

-- ==========================================
-- 1. TẠO ENUMS
-- ==========================================
-- LƯU Ý: Nếu chạy lại script và gặp lỗi "type already exists",
-- bạn có thể bỏ qua phần này hoặc DROP TYPE trước khi tạo lại.

-- Achievement types
DO $$ BEGIN
    CREATE TYPE public.achievement_type_enum AS ENUM (
        'education',        -- Học tập
        'career',          -- Nghề nghiệp
        'culture',         -- Văn hóa
        'sports',          -- Thể thao
        'social',          -- Xã hội
        'clan_contribution' -- Đóng góp dòng họ
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fund types
DO $$ BEGIN
    CREATE TYPE public.fund_type_enum AS ENUM (
        'clan_fund',        -- Quỹ họ
        'scholarship_fund'  -- Quỹ khuyến học
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transaction types
DO $$ BEGIN
    CREATE TYPE public.transaction_type_enum AS ENUM (
        'donation',    -- Đóng góp
        'expense',     -- Chi tiêu
        'scholarship', -- Học bổng
        'support'      -- Hỗ trợ
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event types
DO $$ BEGIN
    CREATE TYPE public.event_type_enum AS ENUM (
        'ancestor_memorial', -- Giỗ tổ
        'clan_meeting',      -- Họp họ
        'inauguration',      -- Khánh thành
        'scholarship',       -- Khuyến học
        'wedding',          -- Cưới hỏi
        'sports',           -- Thể thao
        'other'             -- Khác
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RSVP status
DO $$ BEGIN
    CREATE TYPE public.rsvp_status_enum AS ENUM (
        'confirmed', -- Xác nhận
        'declined',  -- Từ chối
        'maybe'      -- Có thể
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. MODULE ACHIEVEMENTS (Vinh danh thành tích)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.persons(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    achievement_type public.achievement_type_enum NOT NULL,
    year INT,
    organization TEXT,
    certificate_url TEXT,
    image_url TEXT,
    verified_by UUID REFERENCES public.profiles(id),
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_member ON public.achievements(member_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON public.achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_year ON public.achievements(year);
CREATE INDEX IF NOT EXISTS idx_achievements_featured ON public.achievements(is_featured);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Policies: Ai cũng xem được, chỉ admin/editor mới sửa
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Anyone can view achievements" ON public.achievements 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Editors can manage achievements" ON public.achievements;
CREATE POLICY "Editors can manage achievements" ON public.achievements 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- ==========================================
-- 3. MODULE FUNDS (Quỹ Họ & Khuyến học)
-- ==========================================

-- Bảng Quỹ
CREATE TABLE IF NOT EXISTS public.funds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    fund_type public.fund_type_enum NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Giao dịch
CREATE TABLE IF NOT EXISTS public.fund_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fund_id UUID REFERENCES public.funds(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type public.transaction_type_enum NOT NULL,
    description TEXT,
    receipt_url TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_funds_type ON public.funds(fund_type);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_fund ON public.fund_transactions(fund_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_date ON public.fund_transactions(transaction_date);

-- Enable RLS
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_transactions ENABLE ROW LEVEL SECURITY;

-- Policies: Ai cũng xem được, chỉ admin mới sửa
DROP POLICY IF EXISTS "Anyone can view funds" ON public.funds;
CREATE POLICY "Anyone can view funds" ON public.funds 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage funds" ON public.funds;
CREATE POLICY "Admins can manage funds" ON public.funds 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Anyone can view transactions" ON public.fund_transactions;
CREATE POLICY "Anyone can view transactions" ON public.fund_transactions 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage transactions" ON public.fund_transactions;
CREATE POLICY "Admins can manage transactions" ON public.fund_transactions 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 4. MODULE EVENTS (Lịch sự kiện)
-- ==========================================

-- Bảng Sự kiện
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type public.event_type_enum NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    is_lunar BOOLEAN DEFAULT FALSE,
    recurrence TEXT, -- 'yearly', 'monthly', null
    max_attendees INT,
    image_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Người tham dự (RSVP)
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.persons(id) ON DELETE CASCADE NOT NULL,
    status public.rsvp_status_enum NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

-- Bảng Ảnh sự kiện
CREATE TABLE IF NOT EXISTS public.event_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    caption TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_member ON public.event_attendees(member_id);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events" ON public.events 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Editors can manage events" ON public.events;
CREATE POLICY "Editors can manage events" ON public.events 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Anyone can view attendees" ON public.event_attendees;
CREATE POLICY "Anyone can view attendees" ON public.event_attendees 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can RSVP" ON public.event_attendees;
CREATE POLICY "Members can RSVP" ON public.event_attendees 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Members can update their RSVP" ON public.event_attendees;
CREATE POLICY "Members can update their RSVP" ON public.event_attendees 
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view event photos" ON public.event_photos;
CREATE POLICY "Anyone can view event photos" ON public.event_photos 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Editors can manage photos" ON public.event_photos;
CREATE POLICY "Editors can manage photos" ON public.event_photos 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- ==========================================
-- 5. MODULE DOCUMENTS (Kho tài liệu)
-- ==========================================

-- Bảng Danh mục tài liệu
CREATE TABLE IF NOT EXISTS public.document_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.document_categories(id) ON DELETE CASCADE,
    icon TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Tài liệu
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.document_categories(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Tags
CREATE TABLE IF NOT EXISTS public.document_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, tag)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_document_categories_parent ON public.document_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON public.documents(is_public);
CREATE INDEX IF NOT EXISTS idx_document_tags_document ON public.document_tags(document_id);

-- Enable RLS
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.document_categories;
CREATE POLICY "Anyone can view categories" ON public.document_categories 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Editors can manage categories" ON public.document_categories;
CREATE POLICY "Editors can manage categories" ON public.document_categories 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Anyone can view public documents" ON public.documents;
CREATE POLICY "Anyone can view public documents" ON public.documents 
    FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Editors can manage documents" ON public.documents;
CREATE POLICY "Editors can manage documents" ON public.documents 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Anyone can view tags" ON public.document_tags;
CREATE POLICY "Anyone can view tags" ON public.document_tags 
    FOR SELECT USING (true);

-- ==========================================
-- 6. TẠO DỮ LIỆU MẪU (OPTIONAL)
-- ==========================================

-- Insert 2 funds mẫu
INSERT INTO public.funds (name, description, fund_type, balance)
VALUES 
    ('Quỹ Họ Nguyễn Bá', 'Quỹ chung cho các hoạt động dòng họ', 'clan_fund', 0),
    ('Quỹ Khuyến học Họ Nguyễn Bá', 'Quỹ hỗ trợ học tập cho con cháu', 'scholarship_fund', 0)
ON CONFLICT DO NOTHING;

-- Insert danh mục tài liệu mẫu
INSERT INTO public.document_categories (name, description, icon)
VALUES 
    ('Gia phả', 'Các bản gia phả lịch sử', '📜'),
    ('Sắc phong', 'Sắc phong triều đình', '🏛️'),
    ('Văn bia', 'Bia công đức, bia lịch sử', '🗿'),
    ('Ảnh lịch sử', 'Ảnh tổ tiên và sự kiện', '📸'),
    ('Video', 'Video lễ giỗ, họp họ', '🎬'),
    ('Quy chế', 'Quy chế dòng họ', '📋')
ON CONFLICT DO NOTHING;

-- ==========================================
-- ✅ HOÀN TẤT!
-- ==========================================

-- Kiểm tra các bảng đã tạo:
SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'achievements', 
        'funds', 
        'fund_transactions',
        'events',
        'event_attendees',
        'event_photos',
        'document_categories',
        'documents',
        'document_tags'
    )
ORDER BY tablename;
