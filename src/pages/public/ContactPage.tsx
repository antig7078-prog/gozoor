import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSubmitting(false);
        setIsSuccess(true);
        toast.success('تم إرسال رسالتك بنجاح! سنرد عليك في أقرب وقت.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        setTimeout(() => setIsSuccess(false), 5000);
    };

    return (
        <PageContainer maxWidth="lg">
            <div className="grid lg:grid-cols-2 gap-16 py-12">
                {/* Contact Info Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-12"
                >
                    <div>
                        <h1 className="text-5xl font-black text-text-primary mb-6 leading-tight">تواصل معنا</h1>
                        <p className="text-xl text-text-secondary font-bold leading-relaxed">
                            نحن هنا لمساعدتك في أي استفسار يخص المنصة. فريق دعم جذور متاح دائماً لخدمتكم وتطوير تجربتكم الزراعية.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-6 p-6 bg-white rounded-3xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                <Mail className="w-7 h-7 text-brand-primary" />
                            </div>
                            <div>
                                <h4 className="font-black text-text-primary text-lg mb-1">البريد الإلكتروني</h4>
                                <p className="text-text-muted font-bold">support@gozoor.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6 p-6 bg-white rounded-3xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                                <MessageCircle className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-text-primary text-lg mb-1">واتساب الدعم</h4>
                                <p className="text-text-muted font-bold" dir="ltr">+20 100 000 0000</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6 p-6 bg-white rounded-3xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                                <Clock className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-text-primary text-lg mb-1">ساعات العمل</h4>
                                <p className="text-text-muted font-bold">الأحد - الخميس: 9:00 ص - 6:00 م</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[40px] border border-border-subtle shadow-2xl p-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary"></div>
                    
                    {isSuccess ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-12 h-12 text-brand-primary" />
                            </div>
                            <h2 className="text-3xl font-black text-text-primary mb-4">شكراً لتواصلك!</h2>
                            <p className="text-text-secondary font-bold max-w-sm mx-auto">
                                لقد تم استلام رسالتك بنجاح. سيقوم فريقنا بمراجعتها والرد عليك في أقرب وقت ممكن.
                            </p>
                            <Button 
                                variant="secondary" 
                                className="mt-10" 
                                onClick={() => setIsSuccess(false)}
                            >
                                إرسال رسالة أخرى
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-widest mr-2">الاسم بالكامل</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
                                        placeholder="مثال: أحمد محمد"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest mr-2">موضوع الرسالة</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
                                    placeholder="مثال: استفسار عن الكورسات"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest mr-2">الرسالة</label>
                                <textarea 
                                    rows={5}
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold resize-none"
                                    placeholder="اكتب رسالتك هنا..."
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Clock className="w-6 h-6 animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        إرسال الرسالة
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </PageContainer>
    );
};
