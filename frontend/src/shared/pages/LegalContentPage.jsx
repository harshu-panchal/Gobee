import React, { useEffect, useState } from 'react';
import { ChevronLeft, ShieldCheck, LifeBuoy, Mail } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@core/api/axios';
import { useSettings } from '@core/context/SettingsContext';

const VALID_PANELS = ['customer', 'seller', 'delivery'];

const TYPE_META = {
    privacy: { fallbackTitle: 'Privacy Policy', icon: ShieldCheck },
    support: { fallbackTitle: 'Support', icon: LifeBuoy },
};

const LegalContentPage = ({ type }) => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const { panel: panelParam } = useParams();
    const panel = VALID_PANELS.includes(panelParam) ? panelParam : 'customer';
    const meta = TYPE_META[type] || TYPE_META.privacy;
    const Icon = meta.icon;

    const [page, setPage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        axiosInstance
            .get('/legal-pages/public', { params: { panel, type } })
            .then((response) => {
                if (!cancelled) {
                    setPage(response.data.result || null);
                }
            })
            .catch(() => {
                if (!cancelled) setPage(null);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [panel, type]);

    const title = page?.title || meta.fallbackTitle;
    const content = page?.content || '';

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            <div className="bg-white sticky top-0 z-30 px-4 py-3 flex items-center gap-1 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ChevronLeft size={24} className="text-slate-600" />
                </button>
                <h1 className="text-lg font-black text-slate-800">{title}</h1>
            </div>

            <div className="p-5 max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                            <Icon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-10 text-center text-slate-400 text-sm font-semibold">Loading...</div>
                    ) : content ? (
                        <div className="prose prose-slate prose-sm max-w-none text-slate-600 space-y-4">
                            <div className="whitespace-pre-wrap">{content}</div>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm font-semibold">Content coming soon.</p>
                    )}
                </div>

                {/* Support Contact Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mt-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-orange-500">
                            <Mail size={28} className="stroke-2" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">WARRANTY SUPPORT</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-slate-500 font-bold mb-1 text-sm">Email</p>
                            <p className="text-slate-800 text-[15px] font-medium">{settings?.supportEmail || 'support@appzeto.com'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold mb-1 text-sm">Phone</p>
                            <p className="text-slate-800 text-[15px] font-medium">{settings?.supportPhone || '+91 9870162128'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold mb-1 text-sm">Hours</p>
                            <p className="text-slate-800 text-[15px] font-medium">{settings?.supportHours || 'Mon-Sat: 9 AM - 7 PM'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalContentPage;
