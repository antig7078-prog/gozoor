export type UserRole = 'user' | 'admin' | 'instructor';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  bio?: string;
  location?: string;
  specialization?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  instructor_id: string;
  category_id?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  is_free: boolean;
  status: 'Published' | 'Draft';
  visibility: 'Public' | 'Private';
  created_at: string;
  updated_at: string;
  instructor?: Profile;
  category?: Category;
  enrollments_count?: number;
  rating?: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  seller_id: string;
  category_id?: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  seller?: Profile;
}

export interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary_range?: string;
  description: string;
  requirements?: string[];
  posted_by: string;
  is_active: boolean;
  created_at: string;
  poster?: Profile;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price_starts_at: number;
  provider_id: string;
  category_id?: string;
  delivery_time: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  provider?: Profile;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  is_completed: boolean;
  last_watched_at?: string;
  created_at: string;
  course?: Course;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  service_id?: string;
  quantity: number;
  price: number;
}
