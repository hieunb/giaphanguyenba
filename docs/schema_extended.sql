-- ==========================================
-- GIAPHA-OS EXTENDED SCHEMA
-- New modules: Achievements, Funds, Events, Documents
-- ==========================================

-- This file extends the base schema.sql with new features
-- Run this AFTER running the base schema.sql

-- ==========================================
-- EXTENSIONS (Already created in base schema)
-- ==========================================
-- CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ==========================================
-- NEW ENUMS
-- ==========================================

-- Achievement types
DO $$ BEGIN
    CREATE TYPE public.achievement_type_enum AS ENUM (
        'education',
        'career',
        'culture',
        'sports',
        'social',
        'clan_contribution'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fund types
DO $$ BEGIN
    CREATE TYPE public.fund_type_enum AS ENUM (
        'clan_fund',
        'scholarship_fund'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transaction types
DO $$ BEGIN
    CREATE TYPE public.transaction_type_enum AS ENUM (
        'donation',
        'expense',
        'scholarship',
        'support'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event types
DO $$ BEGIN
    CREATE TYPE public.event_type_enum AS ENUM (
        'ancestor_memorial',
        'clan_meeting',
        'inauguration',
        'scholarship',
        'wedding',
        'sports',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RSVP status
DO $$ BEGIN
    CREATE TYPE public.rsvp_status_enum AS ENUM (
        'confirmed',
        'declined',
        'maybe'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Document types
DO $$ BEGIN
    CREATE TYPE public.document_type_enum AS ENUM (
        'genealogy',
        'decree',
        'stele',
        'history',
        'photo',
        'video',
        'regulation',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- MODULE 1: ACHIEVEMENTS (Vinh danh thành tích)
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
  created_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for achievements
CREATE INDEX IF NOT EXISTS idx_achievements_member ON public.achievements(member_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON public.achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_year ON public.achievements(year);
CREATE INDEX IF NOT EXISTS idx_achievements_featured ON public.achievements(is_featured);

-- ==========================================
-- MODULE 2: FUNDS (Quỹ Họ & Khuyến học)
-- ==========================================

-- Funds table
CREATE TABLE IF NOT EXISTS public.funds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fund_type public.fund_type_enum NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fund transactions
CREATE TABLE IF NOT EXISTS public.fund_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID REFERENCES public.funds(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  transaction_type public.transaction_type_enum NOT NULL,
  description TEXT,
  receipt_url TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for funds
CREATE INDEX IF NOT EXISTS idx_funds_type ON public.funds(fund_type);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_fund ON public.fund_transactions(fund_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_member ON public.fund_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_date ON public.fund_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_type ON public.fund_transactions(transaction_type);

-- ==========================================
-- MODULE 3: EVENTS (Lịch sự kiện)
-- ==========================================

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type public.event_type_enum NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  is_lunar BOOLEAN DEFAULT FALSE,
  recurrence TEXT, -- 'yearly', 'monthly', 'weekly', null
  max_attendees INT,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event attendees (RSVP)
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.persons(id) ON DELETE CASCADE NOT NULL,
  status public.rsvp_status_enum NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate RSVPs
  UNIQUE(event_id, member_id)
);

-- Event photos
CREATE TABLE IF NOT EXISTS public.event_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_member ON public.event_attendees(member_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON public.event_attendees(status);
CREATE INDEX IF NOT EXISTS idx_event_photos_event ON public.event_photos(event_id);

-- ==========================================
-- MODULE 4: DOCUMENTS (Kho tài liệu)
-- ==========================================

-- Document categories (hierarchical)
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

-- Documents
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
  uploaded_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document tags
CREATE TABLE IF NOT EXISTS public.document_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate tags
  UNIQUE(document_id, tag)
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_document_categories_parent ON public.document_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON public.documents(is_public);
CREATE INDEX IF NOT EXISTS idx_documents_title ON public.documents USING gin(to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_documents_description ON public.documents USING gin(to_tsvector('simple', description));
CREATE INDEX IF NOT EXISTS idx_document_tags_document ON public.document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON public.document_tags(tag);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Updated At Triggers
DROP TRIGGER IF EXISTS tr_achievements_updated_at ON public.achievements;
CREATE TRIGGER tr_achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_funds_updated_at ON public.funds;
CREATE TRIGGER tr_funds_updated_at BEFORE UPDATE ON public.funds FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_events_updated_at ON public.events;
CREATE TRIGGER tr_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_event_attendees_updated_at ON public.event_attendees;
CREATE TRIGGER tr_event_attendees_updated_at BEFORE UPDATE ON public.event_attendees FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_document_categories_updated_at ON public.document_categories;
CREATE TRIGGER tr_document_categories_updated_at BEFORE UPDATE ON public.document_categories FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_documents_updated_at ON public.documents;
CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==========================================
-- FUNCTION: Update fund balance
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_fund_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update balance: donations positive, expenses negative
    IF NEW.transaction_type = 'donation' THEN
      UPDATE public.funds 
      SET balance = balance + NEW.amount 
      WHERE id = NEW.fund_id;
    ELSIF NEW.transaction_type IN ('expense', 'scholarship', 'support') THEN
      UPDATE public.funds 
      SET balance = balance - NEW.amount 
      WHERE id = NEW.fund_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Revert old transaction
    IF OLD.transaction_type = 'donation' THEN
      UPDATE public.funds 
      SET balance = balance - OLD.amount 
      WHERE id = OLD.fund_id;
    ELSIF OLD.transaction_type IN ('expense', 'scholarship', 'support') THEN
      UPDATE public.funds 
      SET balance = balance + OLD.amount 
      WHERE id = OLD.fund_id;
    END IF;
    
    -- Apply new transaction
    IF NEW.transaction_type = 'donation' THEN
      UPDATE public.funds 
      SET balance = balance + NEW.amount 
      WHERE id = NEW.fund_id;
    ELSIF NEW.transaction_type IN ('expense', 'scholarship', 'support') THEN
      UPDATE public.funds 
      SET balance = balance - NEW.amount 
      WHERE id = NEW.fund_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Revert transaction on delete
    IF OLD.transaction_type = 'donation' THEN
      UPDATE public.funds 
      SET balance = balance - OLD.amount 
      WHERE id = OLD.fund_id;
    ELSIF OLD.transaction_type IN ('expense', 'scholarship', 'support') THEN
      UPDATE public.funds 
      SET balance = balance + OLD.amount 
      WHERE id = OLD.fund_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_fund_transactions_balance ON public.fund_transactions;
CREATE TRIGGER tr_fund_transactions_balance 
AFTER INSERT OR UPDATE OR DELETE ON public.fund_transactions 
FOR EACH ROW EXECUTE PROCEDURE public.update_fund_balance();

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is editor or admin
CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- ACHIEVEMENTS POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Authenticated users can view achievements" ON public.achievements;
CREATE POLICY "Authenticated users can view achievements" ON public.achievements 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Editors can insert achievements" ON public.achievements;
CREATE POLICY "Editors can insert achievements" ON public.achievements 
FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can update achievements" ON public.achievements;
CREATE POLICY "Editors can update achievements" ON public.achievements 
FOR UPDATE TO authenticated USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Admins can delete achievements" ON public.achievements;
CREATE POLICY "Admins can delete achievements" ON public.achievements 
FOR DELETE TO authenticated USING (public.is_admin());

-- ==========================================
-- FUNDS POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Authenticated users can view funds" ON public.funds;
CREATE POLICY "Authenticated users can view funds" ON public.funds 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage funds" ON public.funds;
CREATE POLICY "Admins can manage funds" ON public.funds 
FOR ALL TO authenticated USING (public.is_admin());

-- FUND TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.fund_transactions;
CREATE POLICY "Authenticated users can view transactions" ON public.fund_transactions 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert transactions" ON public.fund_transactions;
CREATE POLICY "Admins can insert transactions" ON public.fund_transactions 
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update transactions" ON public.fund_transactions;
CREATE POLICY "Admins can update transactions" ON public.fund_transactions 
FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete transactions" ON public.fund_transactions;
CREATE POLICY "Admins can delete transactions" ON public.fund_transactions 
FOR DELETE TO authenticated USING (public.is_admin());

-- ==========================================
-- EVENTS POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;
CREATE POLICY "Authenticated users can view events" ON public.events 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Editors can insert events" ON public.events;
CREATE POLICY "Editors can insert events" ON public.events 
FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can update events" ON public.events;
CREATE POLICY "Editors can update events" ON public.events 
FOR UPDATE TO authenticated USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events" ON public.events 
FOR DELETE TO authenticated USING (public.is_admin());

-- EVENT ATTENDEES POLICIES
DROP POLICY IF EXISTS "Users can view event attendees" ON public.event_attendees;
CREATE POLICY "Users can view event attendees" ON public.event_attendees 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can RSVP to events" ON public.event_attendees;
CREATE POLICY "Users can RSVP to events" ON public.event_attendees 
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own RSVP" ON public.event_attendees;
CREATE POLICY "Users can update own RSVP" ON public.event_attendees 
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.persons p
    WHERE p.id = member_id
  ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can delete RSVPs" ON public.event_attendees;
CREATE POLICY "Admins can delete RSVPs" ON public.event_attendees 
FOR DELETE TO authenticated USING (public.is_admin());

-- EVENT PHOTOS POLICIES
DROP POLICY IF EXISTS "Users can view event photos" ON public.event_photos;
CREATE POLICY "Users can view event photos" ON public.event_photos 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can upload event photos" ON public.event_photos;
CREATE POLICY "Users can upload event photos" ON public.event_photos 
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own photos" ON public.event_photos;
CREATE POLICY "Users can delete own photos" ON public.event_photos 
FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.is_admin());

-- ==========================================
-- DOCUMENTS POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Users can view categories" ON public.document_categories;
CREATE POLICY "Users can view categories" ON public.document_categories 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Editors can manage categories" ON public.document_categories;
CREATE POLICY "Editors can manage categories" ON public.document_categories 
FOR ALL TO authenticated USING (public.is_editor_or_admin());

-- DOCUMENTS POLICIES
DROP POLICY IF EXISTS "Users can view public documents" ON public.documents;
CREATE POLICY "Users can view public documents" ON public.documents 
FOR SELECT TO authenticated USING (is_public = true OR public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can insert documents" ON public.documents;
CREATE POLICY "Editors can insert documents" ON public.documents 
FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can update documents" ON public.documents;
CREATE POLICY "Editors can update documents" ON public.documents 
FOR UPDATE TO authenticated USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;
CREATE POLICY "Admins can delete documents" ON public.documents 
FOR DELETE TO authenticated USING (public.is_admin());

-- DOCUMENT TAGS POLICIES
DROP POLICY IF EXISTS "Users can view tags" ON public.document_tags;
CREATE POLICY "Users can view tags" ON public.document_tags 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Editors can manage tags" ON public.document_tags;
CREATE POLICY "Editors can manage tags" ON public.document_tags 
FOR ALL TO authenticated USING (public.is_editor_or_admin());

-- ==========================================
-- SEED DATA (Optional)
-- ==========================================

-- Example: Create default funds
INSERT INTO public.funds (name, description, fund_type, balance) 
VALUES 
  ('Quỹ Họ', 'Quỹ chung của dòng họ dùng cho các hoạt động chung', 'clan_fund', 0),
  ('Quỹ Khuyến học', 'Quỹ hỗ trợ học tập và thưởng học sinh giỏi', 'scholarship_fund', 0)
ON CONFLICT DO NOTHING;

-- Example: Create default document categories
INSERT INTO public.document_categories (name, description, icon, sort_order) 
VALUES 
  ('Gia phả', 'Các bản gia phả qua các thời kỳ', '📖', 1),
  ('Sắc phong', 'Sắc phong, chiếu chỉ của triều đình', '📜', 2),
  ('Văn bia', 'Bia công đức, bia lịch sử', '🗿', 3),
  ('Ảnh lịch sử', 'Ảnh cũ, ảnh tổ tiên', '🖼️', 4),
  ('Nghiên cứu dòng họ', 'Tài liệu nghiên cứu, lịch sử họ', '📚', 5),
  ('Video', 'Video sự kiện, lễ giỗ', '🎬', 6),
  ('Quy chế', 'Quy chế, nội quy dòng họ', '📋', 7)
ON CONFLICT DO NOTHING;

-- ==========================================
-- VIEWS (Optional - for analytics)
-- ==========================================

-- Fund summary view
CREATE OR REPLACE VIEW public.fund_summary AS
SELECT 
  f.id,
  f.name,
  f.fund_type,
  f.balance,
  COUNT(DISTINCT CASE WHEN ft.transaction_type = 'donation' THEN ft.member_id END) as donor_count,
  SUM(CASE WHEN ft.transaction_type = 'donation' THEN ft.amount ELSE 0 END) as total_donations,
  SUM(CASE WHEN ft.transaction_type IN ('expense', 'scholarship', 'support') THEN ft.amount ELSE 0 END) as total_expenses
FROM public.funds f
LEFT JOIN public.fund_transactions ft ON f.id = ft.fund_id
GROUP BY f.id, f.name, f.fund_type, f.balance;

-- Event attendance view
CREATE OR REPLACE VIEW public.event_attendance AS
SELECT 
  e.id,
  e.title,
  e.start_date,
  e.event_type,
  COUNT(CASE WHEN ea.status = 'confirmed' THEN 1 END) as confirmed_count,
  COUNT(CASE WHEN ea.status = 'declined' THEN 1 END) as declined_count,
  COUNT(CASE WHEN ea.status = 'maybe' THEN 1 END) as maybe_count,
  COUNT(*) as total_rsvp
FROM public.events e
LEFT JOIN public.event_attendees ea ON e.id = ea.event_id
GROUP BY e.id, e.title, e.start_date, e.event_type;

-- Achievement statistics view
CREATE OR REPLACE VIEW public.achievement_stats AS
SELECT 
  achievement_type,
  COUNT(*) as count,
  COUNT(DISTINCT member_id) as unique_members,
  MIN(year) as earliest_year,
  MAX(year) as latest_year
FROM public.achievements
GROUP BY achievement_type;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE public.achievements IS 'Stores member achievements and honors';
COMMENT ON TABLE public.funds IS 'Clan and scholarship funds';
COMMENT ON TABLE public.fund_transactions IS 'Financial transactions for funds';
COMMENT ON TABLE public.events IS 'Clan events and ceremonies';
COMMENT ON TABLE public.event_attendees IS 'RSVP data for events';
COMMENT ON TABLE public.documents IS 'Document library for clan archives';
COMMENT ON TABLE public.document_categories IS 'Hierarchical categories for documents';

-- ==========================================
-- END OF EXTENDED SCHEMA
-- ==========================================
