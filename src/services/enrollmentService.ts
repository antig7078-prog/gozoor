import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';

export const enrollmentService = {
  /**
   * Check if current user is enrolled in a course
   */
  async checkEnrollment(courseId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { enrolled: false, error: null };

      const { data, error } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) throw error;
      return { enrolled: !!data, status: data?.status || null, error: null };
    } catch (err) {
      return { enrolled: false, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Enroll current user in a course
   */
  async enrollInCourse(courseId: string, paymentProofUrl?: string, status: 'approved' | 'pending' = 'pending') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول أولاً للتسجيل في الدورة.');

      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          status,
          proof_image_url: paymentProofUrl || null
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch user's enrolled courses
   */
  async getEnrolledCourses() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: null };

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          status,
          course:courses(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch all user progress for a course
   */
  async getCourseProgress(courseId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: null };

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update or insert lecture progress
   */
  async markLectureComplete(courseId: string, lectureId: string, completed: boolean = true) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لحفظ التقدم العلمي.');

      const { data, error } = await supabase
        .from('user_progress')
        .upsert([{
          user_id: user.id,
          course_id: courseId,
          lecture_id: lectureId,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        }], { onConflict: 'user_id,lecture_id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch user's certificate requests
   */
  async getCertificateRequests() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: null };

      const { data, error } = await supabase
        .from('certificate_requests')
        .select(`
          *,
          course:courses(title)
        `)
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Request a certificate for a completed course
   */
  async requestCertificate(courseId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لإرسال طلب الشهادة.');

      const { data, error } = await supabase
        .from('certificate_requests')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          status: 'pending'
        }])
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
  async getEnrollmentCount() {
    try {
      const { count, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (err) {
      return { count: 0, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch all enrollments (Admin)
   */
  async getEnrollments() {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:user_id (full_name, email),
          courses:course_id (title)
        `)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update enrollment status (Admin)
   */
  async updateEnrollmentStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .update({ status })
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
   * Fetch enrolled courses with calculation of progress %
   */
  async getUserEnrolledCoursesWithProgress() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: null };

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*, courses(*, course_sections(course_lectures(id)))')
        .eq('user_id', user.id);

      if (enrollmentsError) throw enrollmentsError;
      if (!enrollmentsData) return { data: [], error: null };

      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('course_id, lecture_id')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      const userCourses = enrollmentsData.map(e => e.courses).filter(Boolean);
      // remove duplicates if any
      const uniqueCourses = Array.from(new Map(userCourses.map((item: any) => [item.id, item])).values());

      const coursesWithProgress = uniqueCourses.map((course: any) => {
        let totalLectures = 0;
        if (course.course_sections) {
          course.course_sections.forEach((sec: any) => {
            totalLectures += sec.course_lectures?.length || 0;
          });
        }
        const completedCount = progressData?.filter(p => p.course_id === course.id).length || 0;
        const progress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;
        return { ...course, progress };
      });

      return { data: coursesWithProgress, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Toggle user progress for a lecture
   */
  async toggleLectureProgress(courseId: string, lectureId: string, isCompleted: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لحفظ التقدم الدراسي.');

      if (isCompleted) {
        const { error } = await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('lecture_id', lectureId);
        if (error) throw error;
        return { success: true, error: null };
      } else {
        const { error } = await supabase
          .from('user_progress')
          .insert([{ 
            user_id: user.id, 
            course_id: courseId, 
            lecture_id: lectureId 
          }]);
        if (error) throw error;
        return { success: true, error: null };
      }
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch certificate request for a course
   */
  async getCertificateRequestForCourse(courseId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: null };

      const { data, error } = await supabase
        .from('certificate_requests')
        .select('status, certificate_url')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  }
};



