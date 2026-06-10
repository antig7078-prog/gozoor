import{n as e}from"./supabase-BSN9DkJR.js";import{t}from"./error-BIsBAgpT.js";var n={async getPosts(){try{let{data:t,error:n}=await e.from(`posts`).select(`
          *,
          profiles:user_id (full_name, avatar_url, role),
          post_likes (user_id),
          post_comments (
            *,
            profiles:user_id (full_name, avatar_url, role)
          )
        `).order(`created_at`,{ascending:!1});if(n)throw n;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async createPost(n,r){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول لنشر مشاركة في مجتمع المزارعين.`);let{data:i,error:a}=await e.from(`posts`).insert([{user_id:t.id,content:n,image_url:r||null}]).select().single();if(a)throw a;return{data:i,error:null}}catch(e){return{data:null,error:t(e)}}},async deletePost(n){try{let{error:t}=await e.from(`posts`).delete().eq(`id`,n);if(t)throw t;return{error:null}}catch(e){return{error:t(e)}}},async toggleLike(n,r){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول للتفاعل مع المنشورات.`);if(r){let{error:r}=await e.from(`post_likes`).delete().match({post_id:n,user_id:t.id});if(r)throw r;await e.rpc(`decrement_likes`,{post_id_val:n})}else{let{error:r}=await e.from(`post_likes`).insert([{post_id:n,user_id:t.id}]);if(r)throw r;await e.rpc(`increment_likes`,{post_id_val:n})}return{error:null}}catch(e){return{error:t(e)}}},async getComments(n){try{let{data:t,error:r}=await e.from(`post_comments`).select(`
          *,
          profiles:user_id (full_name, avatar_url, role)
        `).eq(`post_id`,n).order(`created_at`,{ascending:!0});if(r)throw r;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async createComment(n,r,i){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول للتعليق.`);let{data:a,error:o}=await e.from(`post_comments`).insert([{post_id:n,user_id:t.id,parent_id:i||null,content:r}]).select().single();if(o)throw o;return await e.rpc(`increment_comments`,{post_id_val:n}),{data:a,error:null}}catch(e){return{data:null,error:t(e)}}},async reportPost(n,r){try{let{data:{user:t}}=await e.auth.getUser();if(!t)throw Error(`يجب تسجيل الدخول للإبلاغ عن المحتوى.`);let{data:i,error:a}=await e.from(`post_reports`).insert([{post_id:n,reporter_id:t.id,reason:r}]).select().single();if(a)throw a;return{data:i,error:null}}catch(e){return{data:null,error:t(e)}}},async getReports(){try{let{data:t,error:n}=await e.from(`post_reports`).select(`
          *,
          posts:post_id (
            content,
            profiles:user_id (full_name)
          ),
          profiles:reporter_id (full_name)
        `).order(`created_at`,{ascending:!1});if(n)throw n;return{data:t,error:null}}catch(e){return{data:null,error:t(e)}}},async updateReportStatus(n,r){try{let{error:t}=await e.from(`post_reports`).update({status:r}).eq(`id`,n);if(t)throw t;return{error:null}}catch(e){return{error:t(e)}}}};export{n as t};