-- Courses Table
CREATE TABLE public.courses (
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

-- Course Sections Table (Modules)
CREATE TABLE public.course_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Lectures Table
CREATE TABLE public.course_lectures (
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

-- RLS Policies (Row Level Security)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lectures ENABLE ROW LEVEL SECURITY;

-- Admins can do everything. Assuming user_metadata->>'role' = 'admin' for auth.users
CREATE POLICY "Admins can manage all courses" ON public.courses
    FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all sections" ON public.course_sections
    FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all lectures" ON public.course_lectures
    FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Public users can only read published courses
CREATE POLICY "Public users can view published courses" ON public.courses
    FOR SELECT USING (status = 'Published' AND visibility = 'Public');

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
