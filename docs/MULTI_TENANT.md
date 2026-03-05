# Multi-Tenant Architecture - SaaS cho nhiều dòng họ

Tài liệu này mô tả cách chuyển đổi Gia Phả OS từ single-tenant → multi-tenant SaaS platform.

---

## 🎯 Mục tiêu

Cho phép nhiều dòng họ sử dụng cùng một hệ thống, mỗi họ có:
- Database riêng biệt (logical separation)
- User management riêng
- Billing riêng
- Custom domain (optional)

---

## 🏗️ Kiến trúc Multi-Tenant

### Option 1: Database Per Tenant (Khuyến nghị)

Mỗi clan có database Supabase riêng.

**Ưu điểm:**
- ✅ Isolation hoàn toàn
- ✅ Dễ backup/restore
- ✅ Scaling độc lập
- ✅ Compliance (GDPR)

**Nhược điểm:**
- ❌ Chi phí cao hơn
- ❌ Phức tạp quản lý

### Option 2: Shared Database + Row Level Security

Tất cả clans dùng chung database, phân biệt bằng `clan_id`.

**Ưu điểm:**
- ✅ Chi phí thấp
- ✅ Dễ quản lý
- ✅ Shared resources

**Nhược điểm:**
- ❌ RLS complexity
- ❌ Risk of data leakage
- ❌ Scaling challenges

**➡️ Recommend: Option 2 cho MVP, Option 1 cho production scale**

---

## 📊 Database Schema cho Multi-Tenant

### Extended Schema

```sql
-- ==========================================
-- MULTI-TENANT EXTENSIONS
-- ==========================================

-- Clans (Organizations)
CREATE TABLE IF NOT EXISTS public.clans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly name
  description TEXT,
  logo_url TEXT,
  
  -- Subscription
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'basic', 'premium', 'enterprise'
  max_members INT DEFAULT 100,
  max_storage_mb INT DEFAULT 500,
  custom_domain TEXT,
  
  -- Billing
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Clan Members (Link users to clans)
CREATE TABLE IF NOT EXISTS public.clan_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'editor', 'member'
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  
  UNIQUE(clan_id, user_id)
);

-- Invitations
CREATE TABLE IF NOT EXISTS public.clan_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- MODIFY EXISTING TABLES
-- ==========================================

-- Add clan_id to all existing tables
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE;
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE;
ALTER TABLE public.custom_events ADD COLUMN IF NOT EXISTS clan_id UUID REFERENCES public.clans(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_persons_clan ON public.persons(clan_id);
CREATE INDEX IF NOT EXISTS idx_achievements_clan ON public.achievements(clan_id);
CREATE INDEX IF NOT EXISTS idx_funds_clan ON public.funds(clan_id);
CREATE INDEX IF NOT EXISTS idx_events_clan ON public.events(clan_id);
CREATE INDEX IF NOT EXISTS idx_documents_clan ON public.documents(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_clan ON public.clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user ON public.clan_members(user_id);

-- ==========================================
-- RLS POLICIES for Multi-Tenant
-- ==========================================

-- Helper: Get user's clan
CREATE OR REPLACE FUNCTION public.get_user_clan_id()
RETURNS UUID AS $$
  SELECT clan_id 
  FROM public.clan_members 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if user is clan admin/owner
CREATE OR REPLACE FUNCTION public.is_clan_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clan_members
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- PERSONS policies (scoped to clan)
DROP POLICY IF EXISTS "Users can view persons in their clan" ON public.persons;
CREATE POLICY "Users can view persons in their clan" 
ON public.persons FOR SELECT 
TO authenticated 
USING (clan_id = public.get_user_clan_id());

DROP POLICY IF EXISTS "Admins can manage persons in their clan" ON public.persons;
CREATE POLICY "Admins can manage persons in their clan" 
ON public.persons FOR ALL 
TO authenticated 
USING (clan_id = public.get_user_clan_id() AND public.is_clan_admin());

-- Similar policies for other tables...

-- ==========================================
-- STORAGE per Clan
-- ==========================================

-- Storage path structure: {clan_id}/{category}/{file}
-- Example: 123e4567-e89b-12d3-a456-426614174000/documents/genealogy.pdf

CREATE POLICY "Clan members can view clan storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  (storage.foldername(name))[1] = public.get_user_clan_id()::text
);

CREATE POLICY "Clan admins can upload to clan storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  (storage.foldername(name))[1] = public.get_user_clan_id()::text
  AND public.is_clan_admin()
);
```

---

## 🔐 Authentication Flow

### 1. Signup Flow

```typescript
// app/signup/page.tsx
export default function SignupPage() {
  return (
    <form onSubmit={handleSignup}>
      {/* Step 1: Create Account */}
      <input name="email" placeholder="Email" />
      <input name="password" placeholder="Mật khẩu" />
      
      {/* Step 2: Create or Join Clan */}
      <div>
        <label>
          <input type="radio" name="clan_action" value="create" />
          Tạo dòng họ mới
        </label>
        <label>
          <input type="radio" name="clan_action" value="join" />
          Tham gia dòng họ hiện có
        </label>
      </div>
      
      {/* If create new clan */}
      <input name="clan_name" placeholder="Tên dòng họ" />
      <input name="clan_slug" placeholder="URL (vd: nguyen-ha-noi)" />
      
      {/* If join existing */}
      <input name="invitation_code" placeholder="Mã mời" />
    </form>
  );
}
```

### 2. Middleware - Clan Context

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's clan
  if (user) {
    const { data: clanMember } = await supabase
      .from("clan_members")
      .select("clan_id, role, clans(slug, name)")
      .eq("user_id", user.id)
      .single();

    if (clanMember) {
      // Set clan context in header (accessible in server components)
      response.headers.set("x-clan-id", clanMember.clan_id);
      response.headers.set("x-clan-slug", clanMember.clans.slug);
    }
  }

  return response;
}
```

### 3. Server Utils - Get Clan Context

```typescript
// utils/supabase/clan.ts
import { headers } from "next/headers";
import { getSupabase } from "./queries";

export async function getClanId(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("x-clan-id");
}

export async function getClan() {
  const clanId = await getClanId();
  if (!clanId) return null;

  const supabase = await getSupabase();
  const { data } = await supabase
    .from("clans")
    .select("*")
    .eq("id", clanId)
    .single();

  return data;
}

export async function getUserClanRole() {
  const clanId = await getClanId();
  if (!clanId) return null;

  const supabase = await getSupabase();
  const { data } = await supabase
    .from("clan_members")
    .select("role")
    .eq("clan_id", clanId)
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  return data?.role ?? null;
}
```

---

## 🌐 Multi-Domain Setup

### Custom Domain per Clan

```typescript
// next.config.ts
const config = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(?<clan>.+)\\.giapha\\.app",
          },
        ],
        destination: "/clan/:clan/:path*",
      },
    ];
  },
};
```

### Dynamic Routing

```
Structure:
app/
  [clan]/           # Clan-scoped routes
    dashboard/
      page.tsx
      members/
        page.tsx
```

```typescript
// app/[clan]/dashboard/page.tsx
export default async function ClanDashboard({
  params,
}: {
  params: { clan: string };
}) {
  const clan = await getClanBySlug(params.clan);
  
  if (!clan) {
    notFound();
  }
  
  // ... render dashboard
}
```

---

## 💳 Pricing & Billing

### Plans

| Plan | Price | Members | Storage | Features |
|------|-------|---------|---------|----------|
| **Free** | 0đ | 50 | 500MB | Basic |
| **Basic** | 199,000đ/tháng | 200 | 5GB | + Achievements, Funds |
| **Premium** | 499,000đ/tháng | 1000 | 50GB | + Events, Documents |
| **Enterprise** | Custom | Unlimited | Unlimited | + AI, Custom Domain |

### Stripe Integration

```typescript
// app/actions/billing.ts
"use server";

import Stripe from "stripe";
import { getClanId } from "@/utils/supabase/clan";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(planId: string) {
  const clanId = await getClanId();
  if (!clanId) return { error: "No clan found" };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: planId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?canceled=true`,
    metadata: {
      clan_id: clanId,
    },
  });

  return { url: session.url };
}

export async function createPortalSession() {
  const clanId = await getClanId();
  const supabase = await getSupabase();
  
  const { data: clan } = await supabase
    .from("clans")
    .select("stripe_customer_id")
    .eq("id", clanId)
    .single();

  if (!clan?.stripe_customer_id) {
    return { error: "No subscription found" };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: clan.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`,
  });

  return { url: session.url };
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clanId = session.metadata?.clan_id;

      await supabase
        .from("clans")
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: "active",
        })
        .eq("id", clanId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("clans")
        .update({
          subscription_status: "canceled",
          plan: "free",
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    // Handle other events...
  }

  return NextResponse.json({ received: true });
}
```

---

## 📊 Usage Tracking & Limits

```typescript
// utils/limits.ts
export async function checkMemberLimit(clanId: string) {
  const supabase = await getSupabase();
  
  const { data: clan } = await supabase
    .from("clans")
    .select("max_members")
    .eq("id", clanId)
    .single();
    
  const { count } = await supabase
    .from("persons")
    .select("*", { count: "exact", head: true })
    .eq("clan_id", clanId);
    
  return {
    current: count ?? 0,
    limit: clan?.max_members ?? 100,
    available: (clan?.max_members ?? 100) - (count ?? 0),
  };
}

export async function checkStorageLimit(clanId: string) {
  const supabase = await getSupabase();
  
  const { data: clan } = await supabase
    .from("clans")
    .select("max_storage_mb")
    .eq("id", clanId)
    .single();
    
  const { data: files } = await supabase
    .from("documents")
    .select("file_size")
    .eq("clan_id", clanId);
    
  const usedMb = (files ?? []).reduce((sum, f) => sum + (f.file_size ?? 0), 0) / 1024 / 1024;
  
  return {
    current: Math.round(usedMb),
    limit: clan?.max_storage_mb ?? 500,
    available: Math.round((clan?.max_storage_mb ?? 500) - usedMb),
  };
}
```

---

## 🚀 Migration Strategy

### From Single-Tenant to Multi-Tenant

```sql
-- 1. Create default clan for existing data
INSERT INTO public.clans (name, slug, plan)
VALUES ('Họ Nguyễn', 'nguyen', 'premium')
RETURNING id;

-- 2. Update all existing records
UPDATE public.persons SET clan_id = '<clan_id_from_above>';
UPDATE public.achievements SET clan_id = '<clan_id_from_above>';
-- ... repeat for all tables

-- 3. Link existing users to clan
INSERT INTO public.clan_members (clan_id, user_id, role)
SELECT '<clan_id>', id, 
  CASE 
    WHEN role = 'admin' THEN 'owner'
    ELSE role
  END
FROM auth.users;
```

---

## 📈 Analytics per Clan

```typescript
// app/dashboard/analytics/page.tsx
export default async function ClanAnalytics() {
  const clanId = await getClanId();
  const stats = await getClanStats(clanId);
  
  return (
    <div>
      <h1>Thống kê dòng họ</h1>
      
      <div className="stats">
        <div className="stat">
          <div className="stat-title">Tổng thành viên</div>
          <div className="stat-value">{stats.total_members}</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Storage sử dụng</div>
          <div className="stat-value">
            {stats.storage_used_mb}MB / {stats.storage_limit_mb}MB
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Số sự kiện</div>
          <div className="stat-value">{stats.total_events}</div>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Launch Checklist

- [ ] Database migration script
- [ ] RLS policies per clan
- [ ] Billing integration
- [ ] Usage tracking
- [ ] Landing page cho SaaS
- [ ] Pricing page
- [ ] Signup flow
- [ ] Invitation system
- [ ] Admin panel cho platform
- [ ] Documentation
- [ ] Legal (Terms, Privacy)
- [ ] Support system

---

## 💡 Future Enhancements

1. **White Label** - Cho phép clans customize branding
2. **API Access** - REST API cho integrations
3. **Mobile Apps** - iOS/Android native apps
4. **Marketplace** - Plugins/Extensions
5. **Multi-language** - i18n support
6. **Data Export** - Full data portability
7. **Advanced Analytics** - Insights & Reports

---

**Transform Gia Phả OS thành SaaS Platform! 🚀**
