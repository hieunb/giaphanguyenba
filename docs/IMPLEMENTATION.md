# Hướng dẫn Implementation - Các Module Mới

Tài liệu này hướng dẫn chi tiết cách triển khai các module mới cho Gia Phả OS.

---

## 🚀 Quy trình triển khai chung

Mỗi module nên được triển khai theo thứ tự sau:

### 1. Database Setup
- Chạy script SQL từ `docs/schema_extended.sql`
- Verify RLS policies
- Test với Supabase Dashboard

### 2. Backend (Server Actions)
- Tạo file actions trong `app/actions/`
- Implement CRUD operations
- Add validation và error handling

### 3. Frontend (Components)
- Tạo components trong `components/`
- Tạo pages trong `app/dashboard/`
- Implement UI/UX

### 4. Testing
- Test manual qua UI
- Test permissions với các roles khác nhau
- Test edge cases

---

## 📦 Module 1: Achievements (Ưu tiên cao)

### Step 1: Setup Database

```bash
# Connect vào Supabase SQL Editor và chạy:
# 1. Phần enum và table từ schema_extended.sql
# 2. Indexes
# 3. RLS Policies
```

### Step 2: Create Server Actions

Tạo file: `app/actions/achievement.ts`

```typescript
"use server";

import { getProfile, getSupabase } from "@/utils/supabase/queries";
import { revalidatePath } from "next/cache";
import type { AchievementFormData } from "@/types/extended";

export async function createAchievement(data: AchievementFormData) {
  const profile = await getProfile();
  const supabase = await getSupabase();

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return { error: "Không có quyền truy cập" };
  }

  const { error } = await supabase
    .from("achievements")
    .insert({
      ...data,
      created_by: profile.id,
    });

  if (error) {
    console.error("Error creating achievement:", error);
    return { error: "Không thể tạo thành tích" };
  }

  revalidatePath("/dashboard/achievements");
  return { success: true };
}

export async function getAchievements() {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("achievements")
    .select(`
      *,
      member:persons!member_id (
        id,
        full_name,
        generation,
        avatar_url
      )
    `)
    .order("year", { ascending: false });

  if (error) {
    console.error("Error fetching achievements:", error);
    return { data: [], error: "Không thể tải thành tích" };
  }

  return { data };
}

export async function updateAchievement(id: string, data: Partial<AchievementFormData>) {
  const profile = await getProfile();
  const supabase = await getSupabase();

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return { error: "Không có quyền truy cập" };
  }

  const { error } = await supabase
    .from("achievements")
    .update(data)
    .eq("id", id);

  if (error) {
    console.error("Error updating achievement:", error);
    return { error: "Không thể cập nhật thành tích" };
  }

  revalidatePath("/dashboard/achievements");
  return { success: true };
}

export async function deleteAchievement(id: string) {
  const profile = await getProfile();
  const supabase = await getSupabase();

  if (profile?.role !== "admin") {
    return { error: "Chỉ Admin mới có quyền xóa" };
  }

  const { error } = await supabase
    .from("achievements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting achievement:", error);
    return { error: "Không thể xóa thành tích" };
  }

  revalidatePath("/dashboard/achievements");
  return { success: true };
}
```

### Step 3: Create Page

Tạo file: `app/dashboard/achievements/page.tsx`

```typescript
import { getAchievements } from "@/app/actions/achievement";
import AchievementList from "@/components/AchievementList";

export default async function AchievementsPage() {
  const { data: achievements } = await getAchievements();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🏆 Bảng vàng thành tích</h1>
        <button className="btn btn-primary">
          + Thêm thành tích
        </button>
      </div>
      
      <AchievementList achievements={achievements ?? []} />
    </div>
  );
}
```

### Step 4: Create Component

Tạo file: `components/AchievementList.tsx`

```typescript
"use client";

import { useState } from "react";
import type { AchievementWithMember } from "@/types/extended";

export default function AchievementList({
  achievements,
}: {
  achievements: AchievementWithMember[];
}) {
  const groupedByYear = achievements.reduce((acc, achievement) => {
    const year = achievement.year ?? "Chưa rõ năm";
    if (!acc[year]) acc[year] = [];
    acc[year].push(achievement);
    return acc;
  }, {} as Record<string, AchievementWithMember[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedByYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, items]) => (
          <div key={year}>
            <h2 className="text-2xl font-bold mb-4">{year}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: AchievementWithMember }) {
  return (
    <div className="card bg-white shadow-lg">
      <div className="card-body">
        <h3 className="font-bold">{achievement.title}</h3>
        <p className="text-sm text-gray-600">{achievement.member.full_name}</p>
        {achievement.organization && (
          <p className="text-sm">{achievement.organization}</p>
        )}
        {achievement.description && (
          <p className="text-sm mt-2">{achievement.description}</p>
        )}
      </div>
    </div>
  );
}
```

### Step 5: Add Navigation

Cập nhật `components/DashboardHeader.tsx` hoặc navigation component:

```typescript
<Link href="/dashboard/achievements" className="nav-link">
  🏆 Thành tích
</Link>
```

---

## 📦 Module 2: Funds

### Key Features

1. **Fund Management** - Admin quản lý quỹ
2. **Transaction Recording** - Ghi nhận thu chi
3. **Balance Tracking** - Tự động cập nhật số dư (trigger)
4. **Reports** - Báo cáo tài chính

### Important Notes

- **Trigger** `update_fund_balance()` đã được setup trong schema
- Balance tự động cập nhật khi thêm/sửa/xóa transaction
- Admin-only cho transaction management
- All members có thể xem báo cáo

### Implementation Structure

```
app/
  actions/
    fund.ts          # CRUD operations
  dashboard/
    funds/
      page.tsx       # Fund list & overview
      [id]/
        page.tsx     # Fund detail & transactions
        report/
          page.tsx   # Financial report

components/
  FundCard.tsx
  TransactionList.tsx
  FundReport.tsx
  DonationForm.tsx
```

---

## 📦 Module 3: Events

### Key Features

1. **Event Management** - CRUD events
2. **Calendar View** - Xem lịch (lunar/solar)
3. **RSVP System** - Xác nhận tham dự
4. **Photo Albums** - Upload ảnh sau sự kiện

### Implementation Structure

```
app/
  actions/
    event.ts         # Event CRUD
    rsvp.ts          # RSVP management
  dashboard/
    events/
      page.tsx       # Calendar view
      [id]/
        page.tsx     # Event detail
        photos/
          page.tsx   # Photo gallery

components/
  EventCalendar.tsx
  EventCard.tsx
  RSVPButton.tsx
  EventPhotoGallery.tsx
```

### Lunar Calendar Integration

```typescript
// utils/lunarHelpers.ts
import { Lunar } from "lunar-javascript";

export function convertToLunar(solarDate: Date) {
  const lunar = Lunar.fromDate(solarDate);
  return {
    day: lunar.getDay(),
    month: lunar.getMonth(),
    year: lunar.getYear(),
  };
}

export function convertToSolar(lunarDay: number, lunarMonth: number, lunarYear: number) {
  const lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
  return lunar.getSolar().toDate();
}
```

---

## 📦 Module 4: Documents

### Key Features

1. **Supabase Storage** - File upload
2. **Categories** - Hierarchical categories
3. **Tags** - Full-text search
4. **Permissions** - Public/Private documents

### Storage Setup

```typescript
// utils/supabase/storage.ts
import { createClient } from "@/utils/supabase/client";

export async function uploadDocument(
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("documents")
    .getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}
```

### Storage Buckets

Tạo buckets trong Supabase Dashboard:

1. `documents` - Public documents
2. `private-documents` - Private documents (RLS)
3. `receipts` - Fund receipts
4. `event-photos` - Event photos

### Bucket Policies

```sql
-- Example policy for documents bucket
CREATE POLICY "Authenticated users can view public documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Editors can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (SELECT public.is_editor_or_admin())
);
```

---

## 🔐 Security Checklist

### Backend Validation

```typescript
// app/actions/validation.ts
export function validateAchievement(data: AchievementFormData): string | null {
  if (!data.title || data.title.trim().length === 0) {
    return "Tiêu đề không được để trống";
  }
  
  if (data.year && (data.year < 1900 || data.year > new Date().getFullYear())) {
    return "Năm không hợp lệ";
  }
  
  return null;
}
```

### Permission Checks

```typescript
// Every server action should check permissions
const profile = await getProfile();
if (!profile) {
  return { error: "Chưa đăng nhập" };
}

if (profile.role !== "admin" && profile.role !== "editor") {
  return { error: "Không có quyền truy cập" };
}
```

### Input Sanitization

```typescript
import DOMPurify from "isomorphic-dompurify";

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] Admin có thể CRUD
- [ ] Editor có thể thêm/sửa (không xóa)
- [ ] Member chỉ có thể xem
- [ ] Unauthenticated user không truy cập được
- [ ] Validation hoạt động đúng
- [ ] Error messages rõ ràng
- [ ] Loading states hiển thị
- [ ] Responsive trên mobile

### Test với các roles

```typescript
// Test script example
async function testPermissions() {
  // 1. Login as Admin
  // 2. Create achievement
  // 3. Logout
  // 4. Login as Member
  // 5. Try to create achievement (should fail)
  // 6. Verify can view
}
```

---

## 📊 Performance Optimization

### Pagination

```typescript
export async function getAchievements(page = 1, perPage = 20) {
  const supabase = await getSupabase();
  
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from("achievements")
    .select("*, member:persons!member_id(*)", { count: "exact" })
    .range(from, to)
    .order("year", { ascending: false });

  return {
    data,
    pagination: {
      page,
      perPage,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / perPage),
    },
  };
}
```

### Caching với React Cache

```typescript
import { cache } from "react";

export const getCachedAchievements = cache(async () => {
  return getAchievements();
});
```

---

## 🎨 UI/UX Best Practices

### Loading States

```typescript
export default function AchievementsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AchievementList />
    </Suspense>
  );
}
```

### Empty States

```typescript
if (achievements.length === 0) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Chưa có thành tích nào</p>
      <button className="btn btn-primary mt-4">
        + Thêm thành tích đầu tiên
      </button>
    </div>
  );
}
```

### Toast Notifications

```typescript
// Use existing toast library or create simple one
export function showToast(message: string, type: "success" | "error") {
  // Implementation
}

// Usage in actions
const result = await createAchievement(data);
if (result.error) {
  showToast(result.error, "error");
} else {
  showToast("Thêm thành tích thành công!", "success");
}
```

---

## 🚢 Deployment Checklist

- [ ] Run migrations trong production Supabase
- [ ] Setup Storage buckets
- [ ] Configure Storage policies
- [ ] Verify environment variables
- [ ] Test with production data
- [ ] Setup monitoring/logging
- [ ] Document user guide
- [ ] Announce new features

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React 19 Features](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Cần trợ giúp?

- 💬 Mở Issue trên GitHub
- 📧 Email: [your-email]
- 🗨️ Discord: [link]

---

**Happy Coding! 🚀**
