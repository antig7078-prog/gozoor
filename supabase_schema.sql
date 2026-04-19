-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- E-LEARNING SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    thumbnail_url TEXT,
    intro_video_url TEXT,
    language TEXT DEFAULT 'en',
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    category TEXT,
    subcategory TEXT,
    tags TEXT[],
    is_free BOOLEAN DEFAULT false,
    price DECIMAL(10, 2),
    discount_price DECIMAL(10, 2),
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
    visibility TEXT DEFAULT 'Public' CHECK (visibility IN ('Public', 'Private', 'Unlisted')),
    certificate_available BOOLEAN DEFAULT false,
    duration TEXT,
    target_audience TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    what_you_will_learn JSONB DEFAULT '[]'::jsonb,
    instructor_name TEXT,
    instructor_bio TEXT,
    instructor_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_lectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    lecture_type TEXT CHECK (lecture_type IN ('Video', 'File', 'Text', 'Quiz')),
    video_url TEXT,
    file_url TEXT,
    text_content TEXT,
    duration TEXT,
    is_free_preview BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- MARKETPLACE SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- JOB SYSTEM SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    salary_range TEXT,
    location TEXT,
    job_type TEXT CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance')),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- FREELANCING SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    delivery_time_days INTEGER DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- REVIEWS SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT CHECK (item_type IN ('Course', 'Product', 'Service')),
    item_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- AUTO UPDATE UPDATED_AT TRIGGER FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Courses
DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;
CREATE POLICY "Admins can manage all courses" ON public.courses FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Public users can view published courses" ON public.courses;
CREATE POLICY "Public users can view published courses" ON public.courses FOR SELECT USING (status = 'Published' AND visibility = 'Public');

DROP POLICY IF EXISTS "Admins can manage all sections" ON public.course_sections;
CREATE POLICY "Admins can manage all sections" ON public.course_sections FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Public users can view sections of published courses" ON public.course_sections;
CREATE POLICY "Public users can view sections of published courses" ON public.course_sections FOR SELECT USING (true); 

DROP POLICY IF EXISTS "Admins can manage all lectures" ON public.course_lectures;
CREATE POLICY "Admins can manage all lectures" ON public.course_lectures FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Public users can view lectures of published courses" ON public.course_lectures;
CREATE POLICY "Public users can view lectures of published courses" ON public.course_lectures FOR SELECT USING (true);

-- Products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Public users can view products" ON public.products;
CREATE POLICY "Public users can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can manage their own products" ON public.products;
CREATE POLICY "Sellers can manage their own products" ON public.products FOR ALL USING (auth.uid() = seller_id);

-- Orders
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Buyers can view and create their own orders" ON public.orders;
CREATE POLICY "Buyers can view and create their own orders" ON public.orders FOR ALL USING (auth.uid() = buyer_id);

-- Order Items
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Buyers can view and create their own order items" ON public.order_items;
CREATE POLICY "Buyers can view and create their own order items" ON public.order_items FOR ALL USING (
    order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid())
);

-- Jobs
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.jobs;
CREATE POLICY "Admins can manage jobs" ON public.jobs FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Public users can view jobs" ON public.jobs;
CREATE POLICY "Public users can view jobs" ON public.jobs FOR SELECT USING (status = 'Open');

DROP POLICY IF EXISTS "Employers can manage their own jobs" ON public.jobs;
CREATE POLICY "Employers can manage their own jobs" ON public.jobs FOR ALL USING (auth.uid() = employer_id);

-- Job Applications
DROP POLICY IF EXISTS "Admins can manage job applications" ON public.job_applications;
CREATE POLICY "Admins can manage job applications" ON public.job_applications FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Applicants can view and create their own applications" ON public.job_applications;
CREATE POLICY "Applicants can view and create their own applications" ON public.job_applications FOR ALL USING (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Employers can view applications for their jobs" ON public.job_applications FOR SELECT USING (
    job_id IN (SELECT id FROM public.jobs WHERE employer_id = auth.uid())
);

-- Services
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Public users can view services" ON public.services;
CREATE POLICY "Public users can view services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Freelancers can manage their own services" ON public.services;
CREATE POLICY "Freelancers can manage their own services" ON public.services FOR ALL USING (auth.uid() = freelancer_id);

-- Reviews
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Public users can view reviews" ON public.reviews;
CREATE POLICY "Public users can view reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own reviews" ON public.reviews;
CREATE POLICY "Users can manage their own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id);
