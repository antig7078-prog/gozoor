import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';
import type { Job } from '../types';

export const jobsService = {
    /**
     * Fetch all jobs from the database with advanced filtering and 60-day auto-expiration
     */
    async getJobs(options?: {
        status?: string;
        job_type?: string;
        governorate?: string;
        search?: string;
        excludeExpired?: boolean;
    }) {
        try {
            // Fetch jobs with employer profile pre-loaded
            let query = supabase
                .from('jobs')
                .select('*, employer:profiles(*)');

            // Apply 60-day auto-expiration rule (jobs are filtered out if older than 60 days)
            if (options?.excludeExpired !== false) {
                const sixtyDaysAgo = new Date();
                sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                query = query.gte('created_at', sixtyDaysAgo.toISOString());
            }

            if (options?.status) {
                query = query.eq('status', options.status);
            }

            if (options?.job_type) {
                query = query.eq('job_type', options.job_type);
            }

            if (options?.governorate) {
                query = query.eq('governorate', options.governorate);
            }

            if (options?.search) {
                query = query.or(`title.ilike.%${options.search}%,company_name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return { data: data as Job[], error: null };
        } catch (error) {
            return { data: null, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Get a specific job by its ID with employer details
     */
    async getJobById(id: string) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*, employer:profiles(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { data: data as Job, error: null };
        } catch (error) {
            return { data: null, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Create a new job with validation
     */
    async createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>) {
        try {
            // Frontend validation
            if (!jobData.title?.trim()) throw new Error('عنوان الوظيفة مطلوب');
            if (!jobData.company_name?.trim()) throw new Error('اسم الشركة مطلوب');
            if (!jobData.description?.trim()) throw new Error('وصف الوظيفة مطلوب');
            if (!jobData.job_type) throw new Error('نوع العمل مطلوب');

            // Check limit daily first on client-side
            const limitCheck = await this.checkDailyLimit(jobData.employer_id);
            if (limitCheck.isLimitReached) {
                throw new Error('لقد تجاوزت الحد الأقصى للنشر اليومي (10 وظائف في اليوم).');
            }

            const { data, error } = await supabase
                .from('jobs')
                .insert([jobData])
                .select()
                .single();

            if (error) throw error;
            return { data: data as Job, error: null };
        } catch (error) {
            return { data: null, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Close a job (Change status to Closed)
     */
    async closeJob(id: string) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .update({ status: 'Closed' })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { data: data as Job, error: null };
        } catch (error) {
            return { data: null, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Fetch jobs posted by a specific employer
     */
    async getMyJobs(employerId: string) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('employer_id', employerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data: data as Job[], error: null };
        } catch (error) {
            return { data: null, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Delete a job by its ID
     */
    async deleteJob(id: string) {
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Check if an employer has reached the limit of 10 jobs in the current day
     */
    async checkDailyLimit(employerId: string) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count, error } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .eq('employer_id', employerId)
                .gte('created_at', today.toISOString());

            if (error) throw error;
            const countVal = count || 0;
            return { count: countVal, isLimitReached: countVal >= 10, error: null };
        } catch (error) {
            return { count: 0, isLimitReached: false, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Check if a user has already applied for a specific job
     */
    async checkHasApplied(jobId: string, applicantId: string) {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select('id')
                .eq('job_id', jobId)
                .eq('applicant_id', applicantId)
                .maybeSingle();

            if (error) throw error;
            return { hasApplied: !!data, error: null };
        } catch (error) {
            return { hasApplied: false, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Submit a job application
     */
    async applyToJob(jobId: string, applicantId: string, resumeUrl: string, coverLetter: string) {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .insert([
                    {
                        job_id: jobId,
                        applicant_id: applicantId,
                        resume_url: resumeUrl,
                        cover_letter: coverLetter,
                        status: 'Pending'
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Fetch all applications for a specific job (For employer/admin)
     */
    async getApplicants(jobId: string) {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select('*, applicant:profiles(*)')
                .eq('job_id', jobId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Update job application status (For employer/admin)
     */
    async updateApplicationStatus(applicationId: string, status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected') {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .update({ status })
                .eq('id', applicationId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error: getFriendlyErrorMessage(error) };
        }
    },

    /**
     * Fetch all applications submitted by a specific applicant
     */
    async getMyApplications(applicantId: string) {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select(`
                    id, status, created_at, job_id,
                    jobs ( title, employer_id, job_type, location, company_name )
                `)
                .eq('applicant_id', applicantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error: getFriendlyErrorMessage(error) };
        }
    }
};
