import{n as e}from"./supabase-BSN9DkJR.js";import{t}from"./error-Dq0pFFyW.js";var n={async getProducts(n){try{let t=e.from(`products`).select(`
          *,
          seller:profiles(*)
        `);n?.sellerId&&(t=t.eq(`seller_id`,n.sellerId)),n?.category&&(t=t.eq(`category`,n.category)),n?.governorate&&(t=t.eq(`governorate`,n.governorate)),n?.search&&(t=t.or(`title.ilike.%${n.search}%,description.ilike.%${n.search}%`)),t=t.neq(`moderation_status`,`rejected`);let{data:r,error:i}=await t.order(`created_at`,{ascending:!1});if(i)throw i;return{data:r,error:null}}catch(e){return{data:null,error:t(e)}}},async getProductById(n){try{let{data:t,error:r}=await e.from(`products`).select(`
          *,
          seller:profiles(*)
        `).eq(`id`,n).single();if(r)throw r;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async createProduct(n){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لنشر منتج.`);let{data:r,error:i}=await e.from(`products`).insert([{...n,seller_id:t.id,moderation_status:`pending`}]).select().single();if(i)throw i;return{data:r,error:null}}catch(e){return{data:null,error:t(e)}}},async deleteProduct(n){try{let{error:t}=await e.from(`products`).delete().eq(`id`,n);if(t)throw t;return{error:null}}catch(e){return{error:t(e)}}},async getServices(n){try{let t=e.from(`services`).select(`
          *,
          freelancer:profiles(*)
        `);n?.freelancerId&&(t=t.eq(`freelancer_id`,n.freelancerId)),n?.category&&(t=t.eq(`category`,n.category)),n?.minPrice!==void 0&&(t=t.gte(`price`,n.minPrice)),n?.maxPrice!==void 0&&(t=t.lte(`price`,n.maxPrice)),n?.search&&(t=t.or(`title.ilike.%${n.search}%,description.ilike.%${n.search}%`));let{data:r,error:i}=await t.order(`created_at`,{ascending:!1});if(i)throw i;return{data:r,error:null}}catch(e){return{data:null,error:t(e)}}},async getServiceById(n){try{let{data:t,error:r}=await e.from(`services`).select(`
          *,
          freelancer:profiles(*)
        `).eq(`id`,n).single();if(r)throw r;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async createService(n){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لتقديم خدمة.`);let{data:r,error:i}=await e.from(`services`).insert([{...n,freelancer_id:t.id}]).select().single();if(i)throw i;return{data:r,error:null}}catch(e){return{data:null,error:t(e)}}},async deleteService(n){try{let{error:t}=await e.from(`services`).delete().eq(`id`,n);if(t)throw t;return{error:null}}catch(e){return{error:t(e)}}},async createServiceOrder(n){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لطلب هذه الخدمة.`);let{data:r,error:i}=await e.from(`service_orders`).insert([{service_id:n.service_id,freelancer_id:n.freelancer_id,package_name:n.package_name,price:n.price,requirements:n.requirements,client_id:t.id,status:`new`}]).select().single();if(i)throw i;return{data:r,error:null}}catch(e){return{data:null,error:t(e)}}},async getServiceOrderById(n){try{let{data:t,error:r}=await e.from(`service_orders`).select(`
          *,
          service:services(*),
          client:profiles(*),
          freelancer:profiles(*)
        `).eq(`id`,n).single();if(r)throw r;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async getMyServiceOrders(){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لعرض طلباتك.`);let{data:n,error:r}=await e.from(`service_orders`).select(`
          *,
          service:services(*),
          freelancer:profiles(*)
        `).eq(`client_id`,t.id).order(`created_at`,{ascending:!1});if(r)throw r;return{data:n,error:null}}catch(e){return{data:null,error:t(e)}}},async getFreelancerOrders(){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لعرض الطلبات الواردة.`);let{data:n,error:r}=await e.from(`service_orders`).select(`
          *,
          service:services(*),
          client:profiles(*)
        `).eq(`freelancer_id`,t.id).order(`created_at`,{ascending:!1});if(r)throw r;return{data:n,error:null}}catch(e){return{data:null,error:t(e)}}},async updateServiceOrderStatus(n,r){try{let{data:t,error:i}=await e.from(`service_orders`).update({status:r}).eq(`id`,n).select().single();if(i)throw i;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async createMarketplaceOrder(n,r,i,a){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لإتمام عملية الشراء.`);let{data:o,error:s}=await e.from(`orders`).insert([{buyer_id:t.id,total_amount:n,shipping_address:r,contact_number:i,status:`Pending`}]).select().single();if(s)throw s;let c=a.map(e=>({order_id:o.id,product_id:e.id,quantity:e.quantity,price_at_purchase:e.price})),{error:l}=await e.from(`order_items`).insert(c);if(l)throw l;return{data:o,error:null}}catch(e){return{data:null,error:t(e)}}},async getMarketplaceOrders(){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لعرض الطلبات.`);let{data:n,error:r}=await e.from(`orders`).select(`
          id, total_amount, status, created_at,
          order_items ( id, quantity, price_at_purchase, product_id, products ( title, image_url ) )
        `).eq(`buyer_id`,t.id).order(`created_at`,{ascending:!1});if(r)throw r;return{data:n,error:null}}catch(e){return{data:null,error:t(e)}}},async getMerchantOrders(){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لعرض الطلبات.`);let{data:n,error:r}=await e.from(`products`).select(`id`).eq(`seller_id`,t.id);if(r)throw r;if(!n||n.length===0)return{data:[],error:null};let i=n.map(e=>e.id),{data:a,error:o}=await e.from(`order_items`).select(`
          id, 
          order_id, 
          quantity, 
          price_at_purchase, 
          product_id,
          products ( title, image_url )
        `).in(`product_id`,i);if(o)throw o;if(!a||a.length===0)return{data:[],error:null};let s=Array.from(new Set(a.map(e=>e.order_id))),{data:c,error:l}=await e.from(`orders`).select(`
          id, 
          created_at, 
          status, 
          total_amount,
          buyer:profiles!orders_buyer_id_fkey ( full_name, phone, whatsapp )
        `).in(`id`,s).order(`created_at`,{ascending:!1});if(l)throw l;return{data:(c||[]).map(e=>({...e,items:a.filter(t=>t.order_id===e.id)})),error:null}}catch(e){return{data:null,error:t(e)}}},async updateOrderStatus(n,r){try{let{data:t,error:i}=await e.from(`orders`).update({status:r}).eq(`id`,n).select().single();if(i)throw i;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}}};export{n as t};