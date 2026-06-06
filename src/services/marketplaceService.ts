import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';
import type { Product, Service, ServiceOrder } from '../types';

export const marketplaceService = {
  /**
   * ==========================================
   * PRODUCTS (MARKETPLACE) OPERATIONS
   * ==========================================
   */

  /**
   * Fetch all products with optional filters
   */
  async getProducts(options?: {
    sellerId?: string;
    category?: string;
    governorate?: string;
    search?: string;
  }) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:profiles(*)
        `);

      if (options?.sellerId) {
        query = query.eq('seller_id', options.sellerId);
      }

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.governorate) {
        query = query.eq('governorate', options.governorate);
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      // Filter out rejected or deleted products (moderation check)
      query = query.neq('moderation_status', 'rejected');

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Product[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch product by ID
   */
  async getProductById(id: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as Product, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Create product
   */
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لنشر منتج.');

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, seller_id: user.id, moderation_status: 'pending' }])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Product, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * ==========================================
   * FREELANCE SERVICES OPERATIONS
   * ==========================================
   */

  /**
   * Fetch freelance services with advanced filters
   */
  async getServices(options?: {
    freelancerId?: string;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          freelancer:profiles(*)
        `);

      if (options?.freelancerId) {
        query = query.eq('freelancer_id', options.freelancerId);
      }

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
      }

      if (options?.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Service[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch freelance service by ID
   */
  async getServiceById(id: string) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          freelancer:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as Service, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Create freelance service
   */
  async createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لتقديم خدمة.');

      const { data, error } = await supabase
        .from('services')
        .insert([{ ...serviceData, freelancer_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Service, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Delete freelance service
   */
  async deleteService(id: string) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * ==========================================
   * SERVICE ORDERS OPERATIONS (NEW)
   * ==========================================
   */

  /**
   * Create a service order
   */
  async createServiceOrder(orderData: {
    service_id: string;
    freelancer_id: string;
    package_name: 'Basic' | 'Standard' | 'Premium';
    price: number;
    requirements: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لطلب هذه الخدمة.');

      const { data, error } = await supabase
        .from('service_orders')
        .insert([{
          service_id: orderData.service_id,
          freelancer_id: orderData.freelancer_id,
          package_name: orderData.package_name,
          price: orderData.price,
          requirements: orderData.requirements,
          client_id: user.id,
          status: 'new'
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: data as ServiceOrder, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Get a single service order by ID
   */
  async getServiceOrderById(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          service:services(*),
          client:profiles(*),
          freelancer:profiles(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return { data: data as ServiceOrder, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },


  /**
   * Get service orders placed by the current client (Purchases)
   */
  async getMyServiceOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لعرض طلباتك.');

      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          service:services(*),
          freelancer:profiles(*)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as any[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Get freelance service orders received by the current user (Freelancer sales)
   */
  async getFreelancerOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لعرض الطلبات الواردة.');

      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          service:services(*),
          client:profiles(*)
        `)
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as any[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update service order status
   */
  async updateServiceOrderStatus(orderId: string, status: ServiceOrder['status']) {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as ServiceOrder, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * ==========================================
   * MARKETPLACE ORDERS OPERATIONS
   * ==========================================
   */

  /**
   * Create marketplace order
   */
  async createMarketplaceOrder(totalAmount: number, shippingAddress: string, contactNumber: string, items: Array<{ id: string; price: number; quantity: number }>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لإتمام عملية الشراء.');

      // 1. Insert order header
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          contact_number: contactNumber,
          status: 'Pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItemsInsert = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsInsert);

      if (itemsError) throw itemsError;

      return { data: orderData, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch user's marketplace orders
   */
  async getMarketplaceOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لعرض الطلبات.');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, total_amount, status, created_at,
          order_items ( id, quantity, price_at_purchase, product_id, products ( title, image_url ) )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch orders for the merchant/seller
   */
  async getMerchantOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لعرض الطلبات.');

      // First, find all products belonging to this seller
      const { data: myProducts, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', user.id);

      if (productsError) throw productsError;
      if (!myProducts || myProducts.length === 0) {
        return { data: [], error: null };
      }

      const productIds = myProducts.map(p => p.id);

      // Fetch order items for these products
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id, 
          order_id, 
          quantity, 
          price_at_purchase, 
          product_id,
          products ( title, image_url )
        `)
        .in('product_id', productIds);

      if (itemsError) throw itemsError;
      if (!orderItems || orderItems.length === 0) {
        return { data: [], error: null };
      }

      const orderIds = Array.from(new Set(orderItems.map(item => item.order_id)));

      // Fetch the actual orders and buyer info
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          status, 
          total_amount,
          buyer:profiles!orders_buyer_id_fkey ( full_name, phone, whatsapp )
        `)
        .in('id', orderIds)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Group items by order
      const formattedOrders = (ordersData || []).map((order: any) => ({
        ...order,
        items: orderItems.filter(item => item.order_id === order.id)
      }));

      return { data: formattedOrders, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update marketplace order status
   */
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  }
};
