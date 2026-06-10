export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  bio?: string;
  specialization?: string;
  portfolio_url?: string;
  role: UserRole;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  identity_document_url?: string;
  identity_document_back_url?: string;
  national_id?: string;
  reputation_points?: number;
  reputation_level?: 'beginner' | 'active' | 'professional' | 'trusted' | 'expert';
  jobs_rating?: number;
  services_rating?: number;
  products_rating?: number;
  overall_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  type?: 'course' | 'product';
  created_at: string;
}


export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail_url?: string;
  intro_video_url?: string;
  language?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  category?: string;
  instructor_name?: string;
  is_free: boolean;
  price: number;
  status: 'Draft' | 'Published';
  visibility: 'Public' | 'Private' | 'Unlisted';
  created_at: string;
  updated_at: string;
  
  // Virtual / frontend calculated properties
  progress?: number;
  totalLectures?: number;
  completedCount?: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'approved' | 'rejected';
  proof_image_url?: string;
  enrolled_at: string;
  course?: Course;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  lecture_id: string;
  completed_at: string;
}

export interface CertificateRequest {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'approved' | 'rejected';
  certificate_url?: string;
  requested_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  status: 'Draft' | 'Published';
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  learning_path_courses?: LearningPathCourse[];
}

export interface LearningPathCourse {
  learning_path_id: string;
  course_id: string;
  sort_order: number;
  courses?: Course;
}

export interface Workshop {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  attendees_count?: number;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  stock: number;
  governorate?: string;
  images?: string[];
  moderation_status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  seller?: Profile;
}

export interface ServicePackage {
  name: string;
  description: string;
  price: number;
  delivery_time_days: number;
  revisions?: number;
}

export interface Service {
  id: string;
  freelancer_id: string;
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  delivery_time_days: number;
  category?: string;
  portfolio_images?: string[];
  packages?: ServicePackage[];
  created_at: string;
  updated_at?: string;
  freelancer?: Profile;
}

export interface ServiceOrder {
  id: string;
  service_id: string;
  client_id: string;
  freelancer_id: string;
  package_name: string;
  price: number;
  status: 'new' | 'in_progress' | 'delivered' | 'accepted' | 'completed' | 'cancelled';
  requirements?: string;
  created_at: string;
  updated_at: string;
  service?: Service;
  client?: Profile;
  freelancer?: Profile;
}

export interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  shipping_address: string;
  contact_number: string;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  buyer?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  quantity: number;
  price_at_purchase: number;
  products?: Product;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  company_name?: string;
  description?: string;
  requirements?: string;
  salary_range?: string;
  location?: string;
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Remote' | 'Internship';
  status: 'Open' | 'Closed';
  skills?: string[];
  deadline?: string;
  governorate?: string;
  created_at: string;
  updated_at: string;
  employer?: Profile;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_url?: string;
  cover_letter?: string;
  status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: Profile;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface Favorite {
  user_id: string;
  course_id: string;
}

export interface Review {
  id: string;
  user_id: string;
  item_type: 'Course' | 'Product' | 'Service';
  item_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profile?: Profile;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  context_type?: 'job' | 'service' | 'product' | 'general';
  context_id?: string;
  context_title?: string;
  last_message_at: string;
  created_at: string;
  participant_1_profile?: Profile;
  participant_2_profile?: Profile;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  is_flagged: boolean;
  created_at: string;
  sender_profile?: Profile;
}
