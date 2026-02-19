import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_id?: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  products?: Product;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  client_id?: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  start_date?: string;
  due_date?: string;
  image_url?: string;
  technologies?: string[];
  created_at: string;
  updated_at: string;
  clients?: Client;
}

export interface TeamMember {
  id: string;
  name_ar: string;
  name_en: string;
  position_ar: string;
  position_en: string;
  photo_url?: string;
  image_url?: string;
  bio_ar?: string;
  bio_en?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface SiteContent {
  id: string;
  section: string;
  content_ar: Record<string, any>;
  content_en: Record<string, any>;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_position?: string;
  client_company?: string;
  client_photo?: string;
  content_ar: string;
  content_en: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface FAQ {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  image_url?: string;
  author_id?: string;
  category: string;
  tags?: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  category: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  label_ar: string | null;
  label_en: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}
