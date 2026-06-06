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
CREATE OR REPLACE FUNCTION public.increment_likes(post_id_val UUID)
RETURNS void AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.post_likes WHERE post_id = post_id_val AND user_id = auth.uid()) THEN
        RAISE EXCEPTION 'Like not registered';
    END IF;
    UPDATE public.posts
    SET likes_count = (SELECT COUNT(*) FROM public.post_likes WHERE post_id = post_id_val)
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_likes(post_id_val UUID)
RETURNS void AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    UPDATE public.posts
    SET likes_count = (SELECT COUNT(*) FROM public.post_likes WHERE post_id = post_id_val)
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_comments(post_id_val UUID)
RETURNS void AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    UPDATE public.posts
    SET comments_count = (SELECT COUNT(*) FROM public.post_comments WHERE post_id = post_id_val)
    WHERE id = post_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_comments(post_id_val UUID)
RETURNS void AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    UPDATE public.posts
    SET comments_count = (SELECT COUNT(*) FROM public.post_comments WHERE post_id = post_id_val)
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
    bio TEXT,
    specialization TEXT,
    portfolio_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    reputation_points INTEGER DEFAULT 0,
    reputation_level TEXT DEFAULT 'beginner' CHECK (reputation_level IN ('beginner', 'active', 'professional', 'trusted', 'expert')),
    jobs_rating DECIMAL(3,2) DEFAULT 0,
    services_rating DECIMAL(3,2) DEFAULT 0,
    products_rating DECIMAL(3,2) DEFAULT 0,
    overall_rating DECIMAL(3,2) DEFAULT 0,
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
    'user'
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
    governorate TEXT,
    images TEXT[] DEFAULT '{}',
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
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
    category TEXT,
    portfolio_images TEXT[] DEFAULT '{}',
    packages JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'delivered', 'accepted', 'completed', 'cancelled')),
    requirements TEXT,
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
    job_type TEXT CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'Internship')),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    skills TEXT[] DEFAULT '{}',
    deadline DATE,
    governorate TEXT,
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
-- 7.5. نظام الرسائل الموحد (UNIFIED MESSAGING SYSTEM)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    context_type TEXT CHECK (context_type IN ('job', 'service', 'product', 'general')),
    context_id UUID,
    context_title TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_distinct_participants CHECK (participant_1 <> participant_2)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
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
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- سياسات البروفايلات
-- دالة للتحقق مما إذا كان المستخدم مسؤولاً (أدمن) دون إحداث تكرار حلقي في السياسات
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- سياسات البروفايلات
DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are public for select of public info" ON public.profiles;
CREATE POLICY "Profiles are public for select of public info" ON public.profiles FOR SELECT USING (
  -- 1. Owner can select own profile
  auth.uid() = public.profiles.id OR
  -- 2. Admin can select any profile (using JWT to avoid recursion)
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR
  -- 3. If someone is a seller of any product/service, their profile is visible
  EXISTS (SELECT 1 FROM public.products p WHERE p.seller_id = public.profiles.id) OR
  EXISTS (SELECT 1 FROM public.services s WHERE s.freelancer_id = public.profiles.id) OR
  -- 4. If someone is a buyer of an order where the current user is the merchant
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    JOIN public.products p ON p.id = oi.product_id
    WHERE o.buyer_id = public.profiles.id AND p.seller_id = auth.uid()
  ) OR
  -- 5. If someone is the author of a community post/comment/report/job
  EXISTS (SELECT 1 FROM public.posts p WHERE p.user_id = public.profiles.id) OR
  EXISTS (SELECT 1 FROM public.post_comments pc WHERE pc.user_id = public.profiles.id) OR
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.employer_id = public.profiles.id)
);
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
DROP POLICY IF EXISTS "Admins can view all reports" ON public.post_reports;
CREATE POLICY "Admins can view all reports" ON public.post_reports FOR SELECT USING (
    reporter_id = auth.uid() OR public.is_admin(auth.uid())
);
DROP POLICY IF EXISTS "Users can create reports" ON public.post_reports;
CREATE POLICY "Users can create reports" ON public.post_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "Admins can manage reports" ON public.post_reports;
CREATE POLICY "Admins can manage reports" ON public.post_reports FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات الكورسات
CREATE POLICY "Published courses are public" ON public.courses FOR SELECT USING (status = 'Published');
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات مسارات التعلم
CREATE POLICY "Published learning paths are public" ON public.learning_paths FOR SELECT USING (status = 'Published');
CREATE POLICY "Admins manage learning paths" ON public.learning_paths FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات ربط مسارات التعلم بالكورسات
CREATE POLICY "Learning path courses are public" ON public.learning_path_courses FOR SELECT USING (true);
CREATE POLICY "Admins manage learning path courses" ON public.learning_path_courses FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات الورش والتدريبات
CREATE POLICY "Workshops are public" ON public.workshops FOR SELECT USING (true);
CREATE POLICY "Admins manage workshops" ON public.workshops FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات المنتجات والخدمات
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers manage own products" ON public.products FOR ALL USING (auth.uid() = seller_id);

-- Services
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Public users can view services" ON public.services;
CREATE POLICY "Public users can view services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Freelancers can manage their own services" ON public.services;
CREATE POLICY "Freelancers can manage their own services" 
ON public.services FOR ALL 
USING (auth.uid() = freelancer_id)
WITH CHECK (auth.uid() = freelancer_id);

-- سياسات التصنيفات (CATEGORIES)
DROP POLICY IF EXISTS "Categories are public" ON public.categories;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات التسجيل في الكورسات (ENROLLMENTS)
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.enrollments;
CREATE POLICY "Users can insert own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all enrollments" ON public.enrollments;
CREATE POLICY "Admins manage all enrollments" ON public.enrollments FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات فصول ومحاضرات الكورس (SECTIONS & LECTURES)
DROP POLICY IF EXISTS "Course sections are public" ON public.course_sections;
CREATE POLICY "Course sections are public" ON public.course_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage course sections" ON public.course_sections;
CREATE POLICY "Admins manage course sections" ON public.course_sections FOR ALL USING (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Course lectures are public" ON public.course_lectures;
CREATE POLICY "Course lectures are public" ON public.course_lectures FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage course lectures" ON public.course_lectures;
CREATE POLICY "Admins manage course lectures" ON public.course_lectures FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات تقدم المستخدم (USER PROGRESS)
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- سياسات طلبات الشهادات (CERTIFICATE REQUESTS)
DROP POLICY IF EXISTS "Users can view own certificate requests" ON public.certificate_requests;
CREATE POLICY "Users can view own certificate requests" ON public.certificate_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own certificate requests" ON public.certificate_requests;
CREATE POLICY "Users can create own certificate requests" ON public.certificate_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage certificate requests" ON public.certificate_requests;
CREATE POLICY "Admins manage certificate requests" ON public.certificate_requests FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات الطلبات والمشتريات (ORDERS & ORDER ITEMS)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Admins manage all orders" ON public.orders;
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL USING (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create own order items" ON public.order_items;
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (
    public.is_admin(auth.uid())
);

-- سياسات الوظائف والتقدم للوظائف (JOBS & JOB APPLICATIONS)
DROP POLICY IF EXISTS "Jobs are public" ON public.jobs;
CREATE POLICY "Jobs are public" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employers/Admins manage jobs" ON public.jobs;
CREATE POLICY "Employers/Admins manage jobs" ON public.jobs FOR ALL USING (
    auth.uid() = employer_id OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can view relevant job applications" ON public.job_applications;
CREATE POLICY "Users can view relevant job applications" ON public.job_applications FOR SELECT USING (
    auth.uid() = applicant_id OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can submit job applications" ON public.job_applications;
CREATE POLICY "Users can submit job applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Employers/Admins manage job applications" ON public.job_applications;
CREATE POLICY "Employers/Admins manage job applications" ON public.job_applications FOR ALL USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()) OR 
    public.is_admin(auth.uid())
);

-- سياسات المفضلة والتقييمات (FAVORITES & REVIEWS)
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own reviews" ON public.reviews;
CREATE POLICY "Users can manage own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id);

-- سياسات طلبات الخدمات (SERVICE ORDERS)
DROP POLICY IF EXISTS "Users can view relevant service orders" ON public.service_orders;
CREATE POLICY "Users can view relevant service orders" ON public.service_orders FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = freelancer_id OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can create own service orders" ON public.service_orders;
CREATE POLICY "Users can create own service orders" ON public.service_orders FOR INSERT WITH CHECK (
    auth.uid() = client_id
);

DROP POLICY IF EXISTS "Users can update relevant service orders" ON public.service_orders;
CREATE POLICY "Users can update relevant service orders" ON public.service_orders FOR UPDATE USING (
    auth.uid() = client_id OR auth.uid() = freelancer_id OR public.is_admin(auth.uid())
);

-- سياسات المحادثات (CONVERSATIONS)
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2 OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can create own conversations" ON public.conversations;
CREATE POLICY "Users can create own conversations" ON public.conversations FOR INSERT WITH CHECK (
    auth.uid() = participant_1 OR auth.uid() = participant_2
);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2 OR public.is_admin(auth.uid())
);

-- سياسات الرسائل (MESSAGES)
DROP POLICY IF EXISTS "Users can view relevant messages" ON public.messages;
CREATE POLICY "Users can view relevant messages" ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = conversation_id 
          AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    ) OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can create own messages" ON public.messages;
CREATE POLICY "Users can create own messages" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = conversation_id 
          AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can update relevant messages" ON public.messages;
CREATE POLICY "Users can update relevant messages" ON public.messages FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = conversation_id 
          AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    ) OR public.is_admin(auth.uid())
);

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
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;  -- Removed overly broad grant
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;  -- Removed overly broad grant

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
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- 12. سياسات التخزين (STORAGE POLICIES)
-- ==========================================

-- إنشاء الباكتس المطلوبة وتحديث حالة الخصوصية للباكتس الحساسة
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('uploads', 'uploads', true),
    ('payment-proofs', 'payment-proofs', false),
    ('certificates', 'certificates', false),
    ('course-content', 'course-content', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- سياسات المشاهدة العامة للملفات العامة
DROP POLICY IF EXISTS "Public Select Uploads" ON storage.objects;
CREATE POLICY "Public Select Uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Public Select Course Content" ON storage.objects;
CREATE POLICY "Public Select Course Content" ON storage.objects FOR SELECT USING (bucket_id = 'course-content');

-- سياسات المشاهدة للملفات الخاصة (المستندات الحساسة)
DROP POLICY IF EXISTS "Public Select Payment Proofs" ON storage.objects;
CREATE POLICY "Allow Select Payment Proofs" ON storage.objects FOR SELECT USING (
    bucket_id = 'payment-proofs' AND (
        auth.uid()::text = split_part(name, '/', 1) OR
        public.is_admin(auth.uid())
    )
);

DROP POLICY IF EXISTS "Public Select Certificates" ON storage.objects;
CREATE POLICY "Allow Select Certificates" ON storage.objects FOR SELECT USING (
    bucket_id = 'certificates' AND (
        EXISTS (
            SELECT 1 FROM public.certificate_requests cr
            WHERE cr.id::text = substring(split_part(name, '/', 2) from 1 for 36)
              AND (cr.user_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    )
);

-- سياسات الرفع للمستخدمين المسجلين والمديرين
DROP POLICY IF EXISTS "Authenticated Insert Uploads" ON storage.objects;
CREATE POLICY "Authenticated Insert Uploads" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'uploads' AND 
    auth.role() = 'authenticated' AND
    (LOWER(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'pdf'])) AND
    (COALESCE((metadata->>'size')::int, 0) < 10485760) -- الحد الأقصى 10 ميجابايت
);

DROP POLICY IF EXISTS "Authenticated Insert Payment Proofs" ON storage.objects;
CREATE POLICY "Authenticated Insert Payment Proofs" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = split_part(name, '/', 1) AND
    (LOWER(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'pdf'])) AND
    (COALESCE((metadata->>'size')::int, 0) < 5242880) -- الحد الأقصى 5 ميجابايت
);

DROP POLICY IF EXISTS "Authenticated Insert Certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins Insert Certificates" ON storage.objects;
CREATE POLICY "Admins Insert Certificates" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated Insert Course Content" ON storage.objects;
DROP POLICY IF EXISTS "Admins Insert Course Content" ON storage.objects;
CREATE POLICY "Admins Insert Course Content" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'course-content' AND
    public.is_admin(auth.uid())
);

-- سياسة تحكم كاملة للمشرفين
DROP POLICY IF EXISTS "Admins Manage Storage Objects" ON storage.objects;
CREATE POLICY "Admins Manage Storage Objects" ON storage.objects FOR ALL USING (
    public.is_admin(auth.uid())
);

-- ==========================================
-- 9. وظائف الحماية الإضافية (SECURITY HELPER FUNCTIONS & TRIGGERS)
-- ==========================================

-- زناد لحماية حقل الرول من التعديل الذاتي من قبل المستخدمين العاديين
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من أن العملية تتم من خلال سياق طلب خارجي وليس من مدير قاعدة البيانات مباشرة
  IF auth.uid() IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    -- التحقق مما إذا كان المستخدم الحالي مسؤولاً (أدمن)
    IF NOT public.is_admin(auth.uid()) THEN
      NEW.role = OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تفعيل الزناد قبل التعديل على جدول البروفايلات
DROP TRIGGER IF EXISTS check_profile_role_update ON public.profiles;
CREATE TRIGGER check_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_update();

-- دالة آمنة لتحديث أدوار المستخدمين من قبل المشرفين فقط
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id UUID, new_role TEXT)
RETURNS void AS $$
BEGIN
  -- التحقق من صلاحيات الأدمن للمستخدم الحالي
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized. Admin role required.';
  END IF;

  -- تحديث الدور
  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة آمنة لحذف بروفايل وحساب المستخدم بالكامل من قبل المشرفين فقط
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- التحقق من صلاحيات الأدمن للمستخدم الحالي
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized. Admin role required.';
  END IF;

  -- حذف حساب المستخدم بالكامل من auth.users (والذي يمتد بالحذف المتتالي لجدول البروفايلات)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من عدم تجاوز الحد اليومي لنشر الوظائف (10 وظائف يومياً)
CREATE OR REPLACE FUNCTION public.check_job_limit_daily()
RETURNS TRIGGER AS $$
DECLARE
    job_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO job_count
    FROM public.jobs
    WHERE employer_id = NEW.employer_id
      AND created_at >= NOW() - INTERVAL '1 day';
      
    IF job_count >= 10 THEN
        RAISE EXCEPTION 'You have reached the maximum limit of 10 jobs per day.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_job_limit ON public.jobs;
CREATE TRIGGER trg_check_job_limit
    BEFORE INSERT ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.check_job_limit_daily();

-- دالة لفحص الرسائل وتمييز أرقام الهواتف المصرية
CREATE OR REPLACE FUNCTION public.flag_egyptian_phone_numbers()
RETURNS TRIGGER AS $$
DECLARE
    cleaned_content TEXT;
BEGIN
    cleaned_content := regexp_replace(NEW.content, '[\s\-\_\(\)\+\.\,]+', '', 'g');
    
    IF cleaned_content ~ '(20|0)?1[0125][0-9]{8}' THEN
        NEW.is_flagged := true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_flag_egyptian_phone ON public.messages;
CREATE TRIGGER trg_flag_egyptian_phone
    BEFORE INSERT OR UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.flag_egyptian_phone_numbers();

-- دالة لتحديث تاريخ آخر رسالة في المحادثة تلقائياً
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_conversation_time ON public.messages;
CREATE TRIGGER trg_update_conversation_time
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_last_message();

-- 1. منح الصلاحيات الكاملة للأدوار الافتراضية على جميع الجداول والدوال الحالية في قاعدة البيانات
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, anon, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated, anon, service_role;

-- 2. تفعيل منح الصلاحيات تلقائياً لأي جدول، دالة، أو تسلسل يتم إنشاؤه مستقبلاً
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, authenticated, anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, authenticated, anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, authenticated, anon, service_role;
