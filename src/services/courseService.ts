import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';

export interface Lecture {
  id: string;
  title: string;
  type: string;
  isFreePreview: boolean;
  videoUrl?: string;
  fileUrl?: string;
  textContent?: string;
  sort_order?: number;
}

export interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
  sort_order?: number;
}

export const courseService = {
  /**
   * Fetch all courses
   */
  async getCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch published courses
   */
  async getPublishedCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'Published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch course by ID
   */
  async getCourseById(id: string) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Create new course
   */
  async createCourse(courseData: any) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update existing course
   */
  async updateCourse(id: string, courseData: any) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Delete course
   */
  async deleteCourse(id: string) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch course sections with their lectures
   */
  async getCourseSectionsWithLectures(courseId: string) {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*, course_lectures(*)')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch full curriculum for a course (sections and lectures)
   */
  async getCourseCurriculum(courseId: string) {
    try {
      // 1. Fetch sections
      const { data: sections, error: secError } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });

      if (secError) throw secError;

      if (!sections || sections.length === 0) {
        return { data: [], error: null };
      }

      // 2. Fetch lectures for these sections
      const sectionIds = sections.map(s => s.id);
      const { data: lectures, error: lecError } = await supabase
        .from('course_lectures')
        .select('*')
        .in('section_id', sectionIds)
        .order('sort_order', { ascending: true });

      if (lecError) throw lecError;

      // 3. Map together
      const curriculum = sections.map(sec => ({
        id: sec.id,
        title: sec.title,
        lectures: (lectures || [])
          .filter(l => l.section_id === sec.id)
          .map(l => ({
            id: l.id,
            title: l.title,
            type: l.lecture_type,
            isFreePreview: l.is_free_preview,
            videoUrl: l.video_url || '',
            fileUrl: l.file_url || '',
            textContent: l.text_content || '',
            sort_order: l.sort_order
          }))
      }));

      return { data: curriculum, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Sync course curriculum non-destructively using deltas & upserts.
   * This preserves student learning progress records linked to existing lecture IDs.
   */
  async syncCurriculum(courseId: string, sections: Section[]) {
    try {
      // 1. Get existing database sections
      const { data: dbSecs, error: dbSecError } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId);
      
      if (dbSecError) throw dbSecError;

      const dbSecIds = dbSecs ? dbSecs.map(s => s.id) : [];
      const uiSecIds = sections.map(s => s.id);

      // 2. Identify sections to delete
      const sectionsToDelete = dbSecIds.filter(id => !uiSecIds.includes(id));

      // 3. Get existing database lectures for the course sections
      let dbLecIds: string[] = [];
      if (dbSecIds.length > 0) {
        const { data: dbLecs, error: dbLecError } = await supabase
          .from('course_lectures')
          .select('id')
          .in('section_id', dbSecIds);
        
        if (dbLecError) throw dbLecError;
        dbLecIds = dbLecs ? dbLecs.map(l => l.id) : [];
      }

      const uiLecIds = sections.flatMap(sec => sec.lectures.map(l => l.id));
      const lecturesToDelete = dbLecIds.filter(id => !uiLecIds.includes(id));

      // 4. Delete removed lectures first (FK constraint safety)
      if (lecturesToDelete.length > 0) {
        const { error: delLecError } = await supabase
          .from('course_lectures')
          .delete()
          .in('id', lecturesToDelete);
        if (delLecError) throw delLecError;
      }

      // 5. Delete removed sections
      if (sectionsToDelete.length > 0) {
        const { error: delSecError } = await supabase
          .from('course_sections')
          .delete()
          .in('id', sectionsToDelete);
        if (delSecError) throw delSecError;
      }

      // 6. Upsert Sections
      const sectionsToUpsert = sections.map((sec, i) => ({
        id: sec.id,
        course_id: courseId,
        title: sec.title,
        sort_order: i
      }));

      if (sectionsToUpsert.length > 0) {
        const { error: upsertSecError } = await supabase
          .from('course_sections')
          .upsert(sectionsToUpsert);
        if (upsertSecError) throw upsertSecError;
      }

      // 7. Upsert Lectures
      const lecturesToUpsert = sections.flatMap((sec) => 
        sec.lectures.map((l, idx) => ({
          id: l.id,
          section_id: sec.id,
          title: l.title,
          lecture_type: l.type,
          is_free_preview: l.isFreePreview || false,
          video_url: l.videoUrl || null,
          file_url: l.fileUrl || null,
          text_content: l.textContent || null,
          sort_order: idx
        }))
      );

      if (lecturesToUpsert.length > 0) {
        const { error: upsertLecError } = await supabase
          .from('course_lectures')
          .upsert(lecturesToUpsert);
        if (upsertLecError) throw upsertLecError;
      }

      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Reviews System
   */
  async getReviews(itemType: 'Course' | 'Product' | 'Service', itemId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  async addReview(reviewData: { item_type: 'Course' | 'Product' | 'Service'; item_id: string; rating: number; comment: string }) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Favorites System
   */
  async toggleFavorite(courseId: string, isFav: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لإضافة الدورة للمفضلة');

      if (isFav) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user.id, course_id: courseId });
        if (error) throw error;
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, course_id: courseId }]);
        if (error) throw error;
      }
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  async getFavorites() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: null };

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          course:courses(*)
        `)
        .eq('user_id', user.id);
      if (error) throw error;
      return { data: data?.map((f: any) => f.course) || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Categories
   */
  async getCategories(type: 'course' | 'product' = 'course') {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('name');
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  async createCategory(name: string, type: 'course' | 'product' = 'course') {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, type }])
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Counts
   */
  async getCourseCount(isFree?: boolean) {
    try {
      let query = supabase.from('courses').select('*', { count: 'exact', head: true });
      if (isFree !== undefined) {
        query = query.eq('is_free', isFree);
      }
      const { count, error } = await query;
      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (err) {
      return { count: 0, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch published, public courses with their section/lecture counts
   */
  async getPublishedPublicCoursesWithLectures() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, course_sections(course_lectures(id))')
        .eq('status', 'Published')
        .eq('visibility', 'Public')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch top most viewed courses
   */
  async getMostViewedCourses(limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, course_sections(course_lectures(id))')
        .eq('status', 'Published')
        .order('views_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Get list of favorite course IDs for a user
   */
  async getFavoriteIds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: null };

      const { data, error } = await supabase
        .from('favorites')
        .select('course_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return { data: data?.map(f => f.course_id) || [], error: null };
    } catch (err) {
      return { data: [], error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch all course orders (Admin)
   */
  async getCourseOrders() {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          status,
          created_at:enrolled_at,
          profiles:user_id (full_name, email),
          courses:course_id (title, price)
        `)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      const mappedData = data?.map(enrollment => {
        let status = 'pending';
        if (enrollment.status === 'approved') status = 'completed';
        if (enrollment.status === 'rejected') status = 'canceled';

        const courseObj = Array.isArray(enrollment.courses)
          ? enrollment.courses[0]
          : (enrollment.courses as any);

        const profileObj = Array.isArray(enrollment.profiles)
          ? enrollment.profiles[0]
          : (enrollment.profiles as any);

        return {
          id: enrollment.id,
          created_at: enrollment.created_at,
          status: status,
          amount: courseObj?.price || 0,
          profiles: profileObj,
          courses: courseObj
        };
      });

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update course order status (Admin)
   */
  async updateCourseOrderStatus(orderId: string, status: string) {
    try {
      let dbStatus = 'pending';
      if (status === 'completed') dbStatus = 'approved';
      if (status === 'canceled') dbStatus = 'rejected';

      const { data, error } = await supabase
        .from('enrollments')
        .update({ status: dbStatus })
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
   * Fetch all learning paths (with their courses)
   */
  async getLearningPaths() {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*, learning_path_courses(course_id, courses(*))')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch all learning paths with course counts
   */
  async getLearningPathsWithCourseCount() {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*, learning_path_courses(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch a learning path by ID
   */
  async getLearningPathById(id: string) {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*, learning_path_courses(course_id, sort_order, courses(*))')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Create or update a learning path and sync its courses
   */
  async saveLearningPath(id: string | undefined, payload: any, selectedCourses: any[]) {
    try {
      let currentPathId = id;

      if (id) {
        // Edit mode
        const { error } = await supabase
          .from('learning_paths')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Create mode
        const { data, error } = await supabase
          .from('learning_paths')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        currentPathId = data.id;
      }

      if (currentPathId) {
        // Delete existing mappings
        const { error: deleteError } = await supabase
          .from('learning_path_courses')
          .delete()
          .eq('learning_path_id', currentPathId);
        if (deleteError) throw deleteError;

        // Insert new mappings if there are selected courses
        if (selectedCourses.length > 0) {
          const mappings = selectedCourses.map((course, index) => ({
            learning_path_id: currentPathId,
            course_id: course.id,
            sort_order: index
          }));

          const { error: insertError } = await supabase
            .from('learning_path_courses')
            .insert(mappings);
          if (insertError) throw insertError;
        }
      }

      return { data: currentPathId, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Delete a learning path
   */
  async deleteLearningPath(id: string) {
    try {
      const { error } = await supabase
        .from('learning_paths')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  async getSuggestedCourses(limit: number = 3) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'Published')
        .eq('visibility', 'Public')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  }
};


