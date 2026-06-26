import{n as e}from"./supabase-YFmQ3URY.js";import{t}from"./error-D-UQALud.js";var n={async getProducts(n){try{let t=e.from(`products`).select(`
          *,
          seller:profiles(*)
        `);n?.sellerId&&(t=t.eq(`seller_id`,n.sellerId)),n?.category&&(t=t.eq(`category`,n.category)),n?.governorate&&(t=t.eq(`governorate`,n.governorate)),n?.search&&(t=t.or(`title.ilike.%${n.search}%,description.ilike.%${n.search}%`)),n?.sellerId||(t=t.eq(`moderation_status`,`approved`));let{data:r,error:i}=await t.order(`created_at`,{ascending:!1});if(i)throw i;return{data:r,error:null}}catch(e){return{data:null,error:t(e)}}},async getProductById(n){try{let{data:t,error:r}=await e.from(`products`).select(`
          *,
          seller:profiles(*)
        `).eq(`id`,n).single();if(r)throw r;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async createProduct(n){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لنشر منتج.`);let{data:r,error:i}=await e.from(`products`).insert([{...n,seller_id:t.id,moderation_status:`pending`}]).select().single();if(i)throw i;return{data:r,error:null}}catch(e){return{data:null,error:t(e)}}},async deleteProduct(n){try{let{error:t}=await e.from(`products`).delete().eq(`id`,n);if(t){if(t.code===`23503`)return{error:`لا يمكن حذف المنتج لوجود طلبات مرتبطة به`};throw t}return{error:null}}catch(e){return{error:t(e)}}},async updateProduct(n,r){try{let{data:t,error:i}=await e.from(`products`).update(r).eq(`id`,n).select().single();if(i)throw i;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async getAllProductsForAdmin(){try{let{data:t,error:n}=await e.from(`products`).select(`
          *,
          seller:profiles(*)
        `).order(`created_at`,{ascending:!1});if(n)throw n;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async updateProductModeration(n,r){try{let{error:t}=await e.from(`products`).update({moderation_status:r}).eq(`id`,n);if(t)throw t;return{error:null}}catch(e){return{error:t(e)}}},async getServices(n){try{let t=e.from(`services`).select(`
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
        `).eq(`freelancer_id`,t.id).order(`created_at`,{ascending:!1});if(r)throw r;return{data:n,error:null}}catch(e){return{data:null,error:t(e)}}},async updateServiceOrderStatus(n,r){try{let{data:t,error:i}=await e.from(`service_orders`).update({status:r}).eq(`id`,n).select().single();if(i)throw i;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async createMarketplaceOrder(n,r,i,a,o,s){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لإتمام عملية الشراء.`);let c={buyer_id:t.id,total_amount:n,shipping_address:r,contact_number:i,payment_method:o||`cod`,status:`Pending`};s&&(c.payment_proof_url=s);let{data:l,error:u}=await e.from(`orders`).insert([c]).select().single();if(u)throw u;let d=a.map(e=>({order_id:l.id,product_id:e.id,quantity:e.quantity,price_at_purchase:e.price})),{error:f}=await e.from(`order_items`).insert(d);if(f)throw f;for(let t of a){let{error:n}=await e.rpc(`decrement_product_stock`,{product_id:t.id,quantity:t.quantity});if(n){let{data:n}=await e.from(`products`).select(`stock`).eq(`id`,t.id).single();if(n&&n.stock!==null){let r=Math.max(0,n.stock-t.quantity);await e.from(`products`).update({stock:r}).eq(`id`,t.id)}}}return{data:l,error:null}}catch(e){return{data:null,error:t(e)}}},async getMarketplaceOrders(){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لعرض الطلبات.`);let{data:n,error:r}=await e.from(`orders`).select(`
          id, total_amount, status, created_at,
          payment_method, payment_proof_url,
          tracking_number, shipping_company, estimated_delivery_date,
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
          buyer_id,
          created_at, 
          status, 
          total_amount,
          shipping_address,
          tracking_number,
          shipping_company,
          estimated_delivery_date,
          buyer:profiles!orders_buyer_id_fkey ( full_name, phone, whatsapp )
        `).in(`id`,s).order(`created_at`,{ascending:!1});if(l)throw l;return{data:(c||[]).map(e=>({...e,items:a.filter(t=>t.order_id===e.id)})),error:null}}catch(e){return{data:null,error:t(e)}}},async updateOrderStatus(n,r){try{let{data:t,error:i}=await e.from(`orders`).update({status:r}).eq(`id`,n).select().single();if(i)throw i;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async getAllMarketplaceOrders(){try{let{data:t,error:n}=await e.from(`orders`).select(`
          *,
          buyer:profiles!orders_buyer_id_fkey (*),
          order_items (
            id, quantity, price_at_purchase, product_id,
            products ( title, image_url, seller_id )
          )
        `).order(`created_at`,{ascending:!1});if(n)throw n;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async updateOrderShipping(n,r){try{let{data:t,error:i}=await e.from(`orders`).update(r).eq(`id`,n).select().single();if(i)throw i;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async toggleProductFavorite(n){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لإضافة المنتج للمفضلة.`);let{data:r}=await e.from(`product_favorites`).select(`product_id`).match({user_id:t.id,product_id:n}).maybeSingle();if(r){let{error:r}=await e.from(`product_favorites`).delete().match({user_id:t.id,product_id:n});if(r)throw r;return{favorited:!1,error:null}}else{let{error:r}=await e.from(`product_favorites`).insert([{user_id:t.id,product_id:n}]);if(r)throw r;return{favorited:!0,error:null}}}catch(e){return{favorited:!1,error:t(e)}}},async getProductFavorites(){try{let{data:{user:t}}=await e.auth.getUser();if(!t)return{data:[],error:null};let{data:n,error:r}=await e.from(`product_favorites`).select(`
          *,
          products (*)
        `).eq(`user_id`,t.id).order(`created_at`,{ascending:!1});if(r)throw r;return{data:n,error:null}}catch(e){return{data:null,error:t(e)}}},async syncCartToServer(n){try{let{data:{user:t}}=await e.auth.getUser();if(!t)return{error:null};let{data:r}=await e.from(`cart_items`).select(`product_id, quantity`).eq(`user_id`,t.id),i=new Map(r?.map(e=>[e.product_id,e.quantity])||[]),a=new Map(n.map(e=>[e.id,e.quantity])),o=[];for(let[e,n]of a)o.push({user_id:t.id,product_id:e,quantity:n});if(o.length>0){let{error:t}=await e.from(`cart_items`).upsert(o,{onConflict:`user_id, product_id`});if(t)throw t}let s=[...i.keys()].filter(e=>!a.has(e));if(s.length>0){let{error:n}=await e.from(`cart_items`).delete().eq(`user_id`,t.id).in(`product_id`,s);if(n)throw n}return{error:null}}catch(e){return{error:t(e)}}},async getServerCart(){try{let{data:{user:t}}=await e.auth.getUser();if(!t)return{data:[],error:null};let{data:n,error:r}=await e.from(`cart_items`).select(`
          product_id,
          quantity,
          products:product_id ( id, seller_id, title, price, image_url )
        `).eq(`user_id`,t.id);if(r)throw r;return{data:(n||[]).map(e=>({id:e.products?.id,seller_id:e.products?.seller_id,title:e.products?.title,price:e.products?.price,image_url:e.products?.image_url,quantity:e.quantity})).filter(e=>e.id),error:null}}catch(e){return{data:null,error:t(e)}}},async validateCoupon(n,r){try{let{data:t,error:i}=await e.from(`coupons`).select(`*`).eq(`code`,n.toUpperCase().trim()).eq(`is_active`,!0).maybeSingle();if(i)throw i;if(!t)return{valid:!1,discount:0,error:`كود الخصم غير صالح`};if(t.expires_at&&new Date(t.expires_at)<new Date)return{valid:!1,discount:0,error:`كود الخصم منتهي الصلاحية`};if(t.max_uses>0&&t.used_count>=t.max_uses)return{valid:!1,discount:0,error:`تم استنفاذ عدد مرات استخدام كود الخصم`};if(r<t.min_amount)return{valid:!1,discount:0,error:`الحد الأدنى للطلب لتطبيق الخصم هو ${t.min_amount} ج.م`};let a=0;return a=t.discount_type===`percentage`?Math.min(r*(t.discount_value/100),r):Math.min(t.discount_value,r),{valid:!0,discount:a,couponId:t.id,error:null}}catch(e){return{valid:!1,discount:0,error:t(e)}}},async applyCoupon(n){try{let{data:t}=await e.from(`coupons`).select(`used_count`).eq(`id`,n).single();if(t){let{error:r}=await e.from(`coupons`).update({used_count:(t.used_count||0)+1}).eq(`id`,n);if(r)throw r}return{error:null}}catch(e){return{error:t(e)}}},async checkProductFavorite(n){try{let{data:{user:t}}=await e.auth.getUser();if(!t)return{favorited:!1,error:null};let{data:r,error:i}=await e.from(`product_favorites`).select(`product_id`).match({user_id:t.id,product_id:n}).maybeSingle();if(i)throw i;return{favorited:!!r,error:null}}catch(e){return{favorited:!1,error:t(e)}}}};export{n as t};