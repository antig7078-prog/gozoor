-- ==========================================
-- 1. الإضافات والوظائف الأساسية (EXTENSIONS & UTILS)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- وظيفة تحديث تاريخ التعديل تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- وظائف تحديث عدادات الإعجابات والتعليقات
CREATE OR REPLACE FUNCTION increment_likes(post_id_val UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes(post_id_val UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_comments(post_id_val UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. نظام المستخدمين والبروفايلات (USER SYSTEM)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- التفعيل التلقائي للبروفايل عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 3. نظام التعليم الإلكتروني (E-LEARNING)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    thumbnail_url TEXT,
    intro_video_url TEXT,
    language TEXT DEFAULT 'العربية',
    level TEXT DEFAULT 'Beginner', -- Beginner, Intermediate, Advanced
    category TEXT REFERENCES public.categories(name) ON UPDATE CASCADE,
    instructor_name TEXT,
    is_free BOOLEAN DEFAULT false,
    price DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
    visibility TEXT DEFAULT 'Public' CHECK (visibility IN ('Public', 'Private', 'Unlisted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_lectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    lecture_type TEXT CHECK (lecture_type IN ('Video', 'File', 'Text', 'Quiz')),
    video_url TEXT,
    file_url TEXT,
    text_content TEXT,
    is_free_preview BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    proof_image_url TEXT, -- صورة إيصال الدفع
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lecture_id UUID REFERENCES public.course_lectures(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lecture_id)
);

CREATE TABLE IF NOT EXISTS public.certificate_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    certificate_url TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_path_courses (
    learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (learning_path_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.workshops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    attendees_count INTEGER DEFAULT 0,
    location TEXT DEFAULT 'أونلاين (Zoom)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. المتجر والعمل الحر (MARKETPLACE & FREELANCE)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    delivery_time_days INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- ==========================================
-- 5. نظام الوظائف (JOBS SYSTEM)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company_name TEXT,
    description TEXT,
    requirements TEXT,
    salary_range TEXT,
    location TEXT,
    job_type TEXT CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance')),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تأكيد وجود الحقل للنسخ القديمة من الجدول
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_name TEXT;

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. المجتمع الزراعي (COMMUNITY)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. الميزات المشتركة (FAVORITES & REVIEWS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_type TEXT CHECK (item_type IN ('Course', 'Product', 'Service')),
    item_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 8. نظام الحماية (RLS POLICIES)
-- ==========================================

-- تفعيل RLS لجميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

-- سياسات البروفايلات
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- سياسات المجتمع (بوستات)
CREATE POLICY "Posts are public" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- سياسات الإعجابات
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are public" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like/unlike" ON public.post_likes FOR ALL USING (auth.uid() = user_id);

-- سياسات التعليقات
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are public" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON public.post_comments FOR ALL USING (auth.uid() = user_id);

-- سياسات البلاغات
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all reports" ON public.post_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create reports" ON public.post_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage reports" ON public.post_reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- سياسات الكورسات
CREATE POLICY "Published courses are public" ON public.courses FOR SELECT USING (status = 'Published');
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- سياسات مسارات التعلم
CREATE POLICY "Published learning paths are public" ON public.learning_paths FOR SELECT USING (status = 'Published');
CREATE POLICY "Admins manage learning paths" ON public.learning_paths FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- سياسات ربط مسارات التعلم بالكورسات
CREATE POLICY "Learning path courses are public" ON public.learning_path_courses FOR SELECT USING (true);
CREATE POLICY "Admins manage learning path courses" ON public.learning_path_courses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- سياسات الورش والتدريبات
CREATE POLICY "Workshops are public" ON public.workshops FOR SELECT USING (true);
CREATE POLICY "Admins manage workshops" ON public.workshops FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- سياسات المنتجات والخدمات
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers manage own products" ON public.products FOR ALL USING (auth.uid() = seller_id);

-- Services
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
);

DROP POLICY IF EXISTS "Public users can view services" ON public.services;
CREATE POLICY "Public users can view services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Freelancers can manage their own services" ON public.services;
CREATE POLICY "Freelancers can manage their own services" 
ON public.services FOR ALL 
USING (auth.uid() = freelancer_id)
WITH CHECK (auth.uid() = freelancer_id);

-- ==========================================
-- 11. إصلاح المستخدمين الحاليين (FIX EXISTING USERS)
-- ==========================================
-- هذا الجزء يضمن أن أي مستخدم سجل قبل تفعيل الـ Trigger سيحصل على بروفايل
INSERT INTO public.profiles (id, full_name, email, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email), 
    email, 
    COALESCE(raw_user_meta_data->>'role', 'user')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 9. الصلاحيات (GRANTS)
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==========================================
-- 10. تفعيل التحديث التلقائي (TRIGGERS)
-- ==========================================
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON public.learning_paths FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON public.workshops FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- 12. سياسات التخزين (STORAGE POLICIES)
-- ==========================================

-- إنشاء الباكتس المطلوبة إذا لم تكن موجودة
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('uploads', 'uploads', true),
    ('payment-proofs', 'payment-proofs', true),
    ('certificates', 'certificates', true),
    ('course-content', 'course-content', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات المشاهدة العامة للملفات
DROP POLICY IF EXISTS "Public Select Uploads" ON storage.objects;
CREATE POLICY "Public Select Uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Public Select Payment Proofs" ON storage.objects;
CREATE POLICY "Public Select Payment Proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Public Select Certificates" ON storage.objects;
CREATE POLICY "Public Select Certificates" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Public Select Course Content" ON storage.objects;
CREATE POLICY "Public Select Course Content" ON storage.objects FOR SELECT USING (bucket_id = 'course-content');

-- سياسات الرفع للمستخدمين المسجلين
DROP POLICY IF EXISTS "Authenticated Insert Uploads" ON storage.objects;
CREATE POLICY "Authenticated Insert Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Insert Payment Proofs" ON storage.objects;
CREATE POLICY "Authenticated Insert Payment Proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Insert Certificates" ON storage.objects;
CREATE POLICY "Authenticated Insert Certificates" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Insert Course Content" ON storage.objects;
CREATE POLICY "Authenticated Insert Course Content" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-content' AND auth.role() = 'authenticated');

-- سياسة تحكم كاملة للمشرفين
DROP POLICY IF EXISTS "Admins Manage Storage Objects" ON storage.objects;
CREATE POLICY "Admins Manage Storage Objects" ON storage.objects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- 13. وظائف المساعدة (HELPER FUNCTIONS)
-- ==========================================

-- وظيفة تحديث التوقيت تلقائياً
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- وظائف عدادات المجتمع
CREATE OR REPLACE FUNCTION public.increment_likes(post_id_val UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_likes(post_id_val UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_comments(post_id_val UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_comments(post_id_val UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
