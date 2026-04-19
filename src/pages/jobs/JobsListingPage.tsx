import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Search, MapPin, DollarSign, Clock, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string;
    salary_range: string;
    location: string;
    job_type: string;
    created_at: string;
}

export const JobsListingPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('status', 'Open')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setJobs(data);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.description && j.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-emerald-600" />
                    الوظائف المتاحة
                </h1>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن المسمى الوظيفي..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={job.id}
                            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-100">
                                    {job.job_type}
                                </span>
                            </div>

                            <h3 className="font-black text-slate-800 text-xl mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                {job.title}
                            </h3>

                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
                                {job.description || 'لا يوجد وصف متاح'}
                            </p>

                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                    {job.location || 'غير محدد'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    {job.salary_range || 'غير محدد'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                    <Clock className="w-4 h-4 text-emerald-600" />
                                    {new Date(job.created_at).toLocaleDateString('ar-EG')}
                                </div>
                            </div>

                            <Link
                                to={`/jobs/${job.id}`}
                                className="w-full text-center px-4 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-sm font-bold transition-colors"
                            >
                                التفاصيل والتقديم
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                    <Briefcase className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">لا يوجد وظائف حالياً</h3>
                    <p className="text-slate-500 mt-2">لم يتم العثور على أي وظائف تطابق بحثك.</p>
                </div>
            )}
        </div>
    );
};
