import React, { useState, useEffect, useCallback } from 'react';
import Card from '@shared/components/ui/Card';
import { FileText, ShieldCheck, LifeBuoy, Save, Users, Store, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@shared/components/ui/Toast';
import { adminApi } from '../services/adminApi';

const PANELS = [
    { key: 'customer', label: 'User', icon: Users },
    { key: 'seller', label: 'Seller', icon: Store },
    { key: 'delivery', label: 'Delivery', icon: Truck },
];

const TYPES = [
    { key: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { key: 'support', label: 'Support', icon: LifeBuoy },
];

const emptyPage = (panel, type) => ({
    panel,
    type,
    title: type === 'privacy' ? 'Privacy Policy' : 'Support',
    content: '',
});

const LegalContentManagement = () => {
    const { showToast } = useToast();
    const [activePanel, setActivePanel] = useState('customer');
    const [activeType, setActiveType] = useState('privacy');
    const [pages, setPages] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchPages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminApi.getLegalPages();
            const items = response.data.results || response.data.result || [];
            const map = {};
            items.forEach((item) => {
                map[`${item.panel}:${item.type}`] = item;
            });
            setPages(map);
        } catch (error) {
            showToast('Failed to fetch legal content', 'error');
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    const key = `${activePanel}:${activeType}`;
    const current = pages[key] || emptyPage(activePanel, activeType);

    const updateCurrent = (fields) => {
        setPages((prev) => ({
            ...prev,
            [key]: { ...current, ...fields },
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await adminApi.updateLegalPage({
                panel: activePanel,
                type: activeType,
                title: current.title,
                content: current.content,
            });
            const saved = response.data.result;
            setPages((prev) => ({ ...prev, [key]: saved }));
            showToast('Content saved successfully', 'success');
        } catch (error) {
            showToast('Failed to save content', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="ds-section-spacing animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
                <div>
                    <h1 className="ds-h1 flex items-center gap-3">
                        Privacy & Support Content
                        <div className="p-2 bg-sky-100 rounded-xl">
                            <FileText className="h-5 w-5 text-sky-600" />
                        </div>
                    </h1>
                    <p className="ds-description mt-1">
                        Manage the Privacy Policy and Support content shown during login/signup for each panel.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Panel + Type selectors */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-6 border-none shadow-xl ring-1 ring-slate-100 bg-white rounded-xl text-left">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Panel</h4>
                        <div className="space-y-2">
                            {PANELS.map((panel) => (
                                <button
                                    key={panel.key}
                                    onClick={() => setActivePanel(panel.key)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all",
                                        activePanel === panel.key ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <panel.icon className="h-4 w-4 opacity-70" />
                                    {panel.label}
                                </button>
                            ))}
                        </div>

                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-8">Page</h4>
                        <div className="space-y-2">
                            {TYPES.map((type) => (
                                <button
                                    key={type.key}
                                    onClick={() => setActiveType(type.key)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all",
                                        activeType === type.key ? "bg-sky-600 text-white shadow-lg shadow-sky-100" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <type.icon className="h-4 w-4 opacity-70" />
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Editor */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="p-6 border-none shadow-xl ring-1 ring-slate-100 bg-white rounded-xl text-left">
                        {isLoading ? (
                            <div className="py-16 text-center text-slate-400 text-sm font-bold">Loading content...</div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={current.title}
                                        onChange={(e) => updateCurrent({ title: e.target.value })}
                                        placeholder="Page title..."
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                        Content
                                    </label>
                                    <textarea
                                        rows={16}
                                        value={current.content}
                                        onChange={(e) => updateCurrent({ content: e.target.value })}
                                        placeholder="Write the content shown to users..."
                                        className="w-full px-5 py-5 bg-slate-50 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm resize-y leading-relaxed"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-8 py-4 bg-sky-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-sky-700 shadow-xl shadow-sky-100 transition-all disabled:opacity-60"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LegalContentManagement;
