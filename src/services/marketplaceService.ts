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

      // Only show approved products in marketplace listings (not when seller views own products)
      if (!options?.sellerId) {
        query = query.eq('moderation_status', 'approved');
      }

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

      if (error) {
        // Foreign key constraint violation
        if (error.code === '23503') {
          return { error: 'لا يمكن حذف المنتج لوجود طلبات مرتبطة به' };
        }
        throw error;
      }
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update product
   */
  async updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'seller_id'>>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Product, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch all products for admin (including rejected)
   */
  async getAllProductsForAdmin() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Product[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update product moderation status
   */
  async updateProductModeration(id: string, status: 'pending' | 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('products')
        .update({ moderation_status: status })
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
  async createMarketplaceOrder(totalAmount: number, shippingAddress: string, contactNumber: string, items: Array<{ id: string; price: number; quantity: number; seller_id?: string }>, paymentMethod?: string, paymentProofUrl?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لإتمام عملية الشراء.');

      // 1. Insert order header
      const orderInsert: any = {
        buyer_id: user.id,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        contact_number: contactNumber,
        payment_method: paymentMethod || 'cod',
        status: 'Pending'
      };

      if (paymentProofUrl) {
        orderInsert.payment_proof_url = paymentProofUrl;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderInsert])
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

      // 3. Decrement stock for each product
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_product_stock', {
          product_id: item.id,
          quantity: item.quantity
        });

        if (stockError) {
          // Fallback: direct update if RPC doesn't exist
          const { data: prodData } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.id)
            .single();

          if (prodData && prodData.stock !== null) {
            const newStock = Math.max(0, prodData.stock - item.quantity);
            await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.id);
          }
        }
      }

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
          payment_method, payment_proof_url,
          tracking_number, shipping_company, estimated_delivery_date,
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
          buyer_id,
          created_at, 
          status, 
          total_amount,
          shipping_address,
          tracking_number,
          shipping_company,
          estimated_delivery_date,
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
  },

  /**
   * Fetch ALL marketplace orders for admin
   */
  async getAllMarketplaceOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey (*),
          order_items (
            id, quantity, price_at_purchase, product_id,
            products ( title, image_url, seller_id )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update order shipping details
   */
  async updateOrderShipping(orderId: string, shippingData: {
    tracking_number?: string;
    shipping_company?: string;
    estimated_delivery_date?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(shippingData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * ==========================================
   * PRODUCT FAVORITES (WISHLIST)
   * ==========================================
   */

  async toggleProductFavorite(productId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لإضافة المنتج للمفضلة.');

      // Check if already favorited
      const { data: existing } = await supabase
        .from('product_favorites')
        .select('product_id')
        .match({ user_id: user.id, product_id: productId })
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('product_favorites')
          .delete()
          .match({ user_id: user.id, product_id: productId });
        if (error) throw error;
        return { favorited: false, error: null };
      } else {
        const { error } = await supabase
          .from('product_favorites')
          .insert([{ user_id: user.id, product_id: productId }]);
        if (error) throw error;
        return { favorited: true, error: null };
      }
    } catch (err) {
      return { favorited: false, error: getFriendlyErrorMessage(err) };
    }
  },

  async getProductFavorites() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: null };

      const { data, error } = await supabase
        .from('product_favorites')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as any[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * ==========================================
   * SERVER-SIDE CART SYNC
   * ==========================================
   */

  async syncCartToServer(items: Array<{ id: string; quantity: number }>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: null };

      // Get existing cart items for this user
      const { data: existing } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('user_id', user.id);

      const existingMap = new Map(existing?.map(e => [e.product_id, e.quantity]) || []);
      const newMap = new Map(items.map(i => [i.id, i.quantity]));

      // Items to insert or update
      const toUpsert: Array<{ user_id: string; product_id: string; quantity: number }> = [];
      for (const [pid, qty] of newMap) {
        toUpsert.push({ user_id: user.id, product_id: pid, quantity: qty });
      }

      if (toUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from('cart_items')
          .upsert(toUpsert, { onConflict: 'user_id, product_id' });
        if (upsertError) throw upsertError;
      }

      // Items to delete (in existing but not in new)
      const toDelete = [...existingMap.keys()].filter(pid => !newMap.has(pid));
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .in('product_id', toDelete);
        if (deleteError) throw deleteError;
      }

      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  async getServerCart() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: null };

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          product_id,
          quantity,
          products:product_id ( id, seller_id, title, price, image_url )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const items = (data || []).map((item: any) => ({
        id: item.products?.id,
        seller_id: item.products?.seller_id,
        title: item.products?.title,
        price: item.products?.price,
        image_url: item.products?.image_url,
        quantity: item.quantity
      })).filter((i: any) => i.id);

      return { data: items, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * ==========================================
   * COUPONS
   * ==========================================
   */

  async validateCoupon(code: string, totalAmount: number) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { valid: false, discount: 0, error: 'كود الخصم غير صالح' };

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, discount: 0, error: 'كود الخصم منتهي الصلاحية' };
      }

      // Check max uses
      if (data.max_uses > 0 && data.used_count >= data.max_uses) {
        return { valid: false, discount: 0, error: 'تم استنفاذ عدد مرات استخدام كود الخصم' };
      }

      // Check min amount
      if (totalAmount < data.min_amount) {
        return { valid: false, discount: 0, error: `الحد الأدنى للطلب لتطبيق الخصم هو ${data.min_amount} ج.م` };
      }

      let discount = 0;
      if (data.discount_type === 'percentage') {
        discount = Math.min(totalAmount * (data.discount_value / 100), totalAmount);
      } else {
        discount = Math.min(data.discount_value, totalAmount);
      }

      return { valid: true, discount, couponId: data.id, error: null };
    } catch (err) {
      return { valid: false, discount: 0, error: getFriendlyErrorMessage(err) };
    }
  },

  async applyCoupon(couponId: string) {
    try {
      // Read current value and increment
      const { data: coupon } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', couponId)
        .single();

      if (coupon) {
        const { error } = await supabase
          .from('coupons')
          .update({ used_count: (coupon.used_count || 0) + 1 })
          .eq('id', couponId);
        if (error) throw error;
      }
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  async checkProductFavorite(productId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { favorited: false, error: null };

      const { data, error } = await supabase
        .from('product_favorites')
        .select('product_id')
        .match({ user_id: user.id, product_id: productId })
        .maybeSingle();

      if (error) throw error;
      return { favorited: !!data, error: null };
    } catch (err) {
      return { favorited: false, error: getFriendlyErrorMessage(err) };
    }
  }
};
