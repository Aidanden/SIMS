"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    useGetProjectQuery,
    useAddProjectExpenseMutation,
    useDeleteProjectExpenseMutation,
    useUpdateProjectMutation
} from '@/state/projectApi';
import { useGetProductsQuery } from '@/state/productsApi';
import { useToast } from '@/components/ui/Toast';
import PermissionGuard from '@/components/PermissionGuard';
import {
    ArrowRight,
    Plus,
    Trash2,
    Package,
    DollarSign,
    TrendingDown,
    TrendingUp,
    Layout,
    FileText,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const toast = useToast();

    const projectId = Number(id);
    const { data: projectResponse, isLoading, error } = useGetProjectQuery(projectId);
    const [updateProject] = useUpdateProjectMutation();
    const [addExpense, { isLoading: isAddingExpense }] = useAddProjectExpenseMutation();
    const [deleteExpense] = useDeleteProjectExpenseMutation();

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    const project = projectResponse?.data;

    const handleUpdateStatus = async (status: string) => {
        try {
            await updateProject({ id: projectId, data: { status } }).unwrap();
            toast.success('تم التحديث', 'تم تغيير حالة المشروع بنجاح');
        } catch (err: any) {
            toast.error('خطأ', err.data?.message || 'فشل تحديث الحالة');
        }
    };

    const handleAddExpense = async (data: any) => {
        try {
            await addExpense({ ...data, projectId }).unwrap();
            setIsExpenseModalOpen(false);
            toast.success('تم الإضافة', 'تم إضافة المصروف بنجاح');
        } catch (err: any) {
            toast.error('خطأ', err.data?.message || 'فشل إضافة المصروف');
        }
    };

    const handleDeleteExpense = async (expenseId: number) => {
        const confirmed = await toast.confirm('تأكيد الحذف', 'هل أنت متأكد من حذف هذا المصروف؟ إذا كان مصروف بضاعة، سيتم إرجاع الكمية للمخزن.');
        if (confirmed) {
            try {
                await deleteExpense({ id: expenseId, projectId }).unwrap();
                toast.success('تم الحذف', 'تم حذف المصروف بنجاح');
            } catch (err: any) {
                toast.error('خطأ', err.data?.message || 'فشل حذف المصروف');
            }
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !project) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-text-primary">المشروع غير موجود</h2>
            <button onClick={() => router.push('/projects')} className="text-blue-600 font-bold hover:underline">العودة للمشاريع</button>
        </div>
    );

    return (
        <PermissionGuard requiredPermission="screen.projects">
            <div className="p-6 max-w-7xl mx-auto" dir="rtl">
                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/projects')}
                            className="p-3 bg-white dark:bg-surface-primary border dark:border-border-primary hover:bg-slate-50 dark:hover:bg-surface-secondary rounded-xl transition-all shadow-sm group"
                        >
                            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold dark:text-text-primary">{project.name}</h1>
                            <p className="text-slate-500 dark:text-text-secondary">تفاصيل فنية ومتابعة مالية</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-surface-primary border dark:border-border-primary rounded-xl font-bold dark:text-text-primary shadow-sm hover:border-blue-300 transition-all">
                                {getStatusText(project.status)}
                                <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-surface-secondary border dark:border-border-primary rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50 animate-in slide-in-from-top-2 duration-200">
                                {['NEW', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleUpdateStatus(s)}
                                        className="w-full text-right px-4 py-3 hover:bg-blue-50 dark:hover:bg-surface-elevated text-sm transition-colors font-semibold"
                                    >
                                        {getStatusText(s)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsExpenseModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة مصروف
                        </button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-surface-primary rounded-2xl p-8 border dark:border-border-primary shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 bg-blue-600 h-full"></div>
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-text-primary">
                                <FileText className="w-5 h-5 text-blue-600" />
                                وصف المشروع
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary mb-8 leading-relaxed text-lg">
                                {project.description || 'لا يوجد وصف للمشروع'}
                            </p>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 p-6 bg-slate-50 dark:bg-surface-secondary rounded-xl">
                                <div>
                                    <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">العميل</p>
                                    <p className="font-bold text-slate-800 dark:text-text-primary flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                        {project.customer?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">مدير المشروع</p>
                                    <p className="font-bold text-slate-800 dark:text-text-primary flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                        {project.manager?.name || 'غير محدد'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">تاريخ البدء</p>
                                    <p className="font-bold text-slate-800 dark:text-text-primary flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                        {project.startDate ? format(new Date(project.startDate), 'yyyy/MM/dd', { locale: ar }) : 'غير محدد'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Expenses List */}
                        <div className="bg-white dark:bg-surface-primary rounded-2xl border dark:border-border-primary shadow-sm overflow-hidden">
                            <div className="p-6 border-b dark:border-border-primary flex justify-between items-center bg-slate-50/50 dark:bg-surface-secondary/50">
                                <h3 className="text-lg font-bold dark:text-text-primary">قائمة المصروفات</h3>
                                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-2 text-blue-500">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></span>
                                        تقديري
                                    </span>
                                    <span className="flex items-center gap-2 text-green-500">
                                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></span>
                                        فعلي
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-surface-secondary text-right">
                                        <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            <th className="p-4">البند</th>
                                            <th className="p-4 text-center">النوع</th>
                                            <th className="p-4 text-center">الكمية</th>
                                            <th className="p-4 text-center">السعر</th>
                                            <th className="p-4">الإجمالي</th>
                                            <th className="p-4">التاريخ</th>
                                            <th className="p-4 text-center">إجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-border-primary">
                                        {project.expenses?.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center text-slate-400 italic">لا توجد مصروفات مسجلة لهذا المشروع</td>
                                            </tr>
                                        ) : project.expenses?.map((exp) => (
                                            <tr key={exp.id} className="text-sm hover:bg-slate-50/80 dark:hover:bg-surface-hover transition-colors group">
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-800 dark:text-text-primary">{exp.name}</div>
                                                    {exp.product && (
                                                        <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                                                            <Package className="w-3 h-3" />
                                                            {exp.product.name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${exp.expenseType === 'ESTIMATED' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                            {exp.expenseType === 'ESTIMATED' ? 'تقديري' : 'فعلي'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {exp.itemType === 'MATERIAL' ? 'معدات/بضاعة' : 'خدمة/عام'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-semibold text-slate-600 dark:text-text-secondary">{exp.quantity}</td>
                                                <td className="p-4 text-center font-semibold text-slate-600 dark:text-text-secondary">{exp.unitPrice.toLocaleString()}</td>
                                                <td className="p-4 font-black text-slate-800 dark:text-white">{exp.total.toLocaleString()} د.ل</td>
                                                <td className="p-4 text-xs font-bold text-slate-400">
                                                    {format(new Date(exp.expenseDate), 'yyyy/MM/dd')}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteExpense(exp.id)}
                                                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Side Summary */}
                    <div className="space-y-6">
                        {/* Contract Value Card */}
                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20 blur-3xl"></div>

                            <TrendingUp className="w-12 h-12 mb-6 opacity-30 bg-white/20 p-2 rounded-2xl" />
                            <h3 className="text-sm font-black mb-1 opacity-60 uppercase tracking-widest">قيمة التعاقد (العائد)</h3>
                            <p className="text-4xl font-black tabular-nums tracking-tight">
                                {project.contractValue?.toLocaleString()}
                                <span className="text-base font-bold mr-2 opacity-50">د.ل</span>
                            </p>
                            <p className="text-[10px] opacity-70 mt-2 font-bold">هذا المبلغ مسجل كدين آجل على العميل</p>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-blue-600 dark:to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20 blur-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full translate-x-10 translate-y-10 blur-2xl"></div>

                            <DollarSign className="w-12 h-12 mb-6 opacity-30 bg-white/20 p-2 rounded-2xl" />
                            <h3 className="text-sm font-black mb-1 opacity-60 uppercase tracking-widest">ميزانية التكاليف (التقديرية)</h3>
                            <p className="text-4xl font-black mb-8 tabular-nums tracking-tight">
                                {project.estimatedBudget?.toLocaleString()}
                                <span className="text-base font-bold mr-2 opacity-50">د.ل</span>
                            </p>

                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-end text-sm">
                                    <span className="opacity-60 font-bold uppercase text-[10px]">التكلفة الفعلية</span>
                                    <span className="font-black text-lg">{(project.financialSummary?.totalActual || 0).toLocaleString()} د.ل</span>
                                </div>
                                <div className="w-full h-3 bg-white/10 rounded-full p-0.5 border border-white/5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 shadow-sm ${(project.financialSummary?.totalActual || 0) > project.estimatedBudget ? 'bg-red-400' : 'bg-green-400'
                                            }`}
                                        style={{ width: `${Math.min(100, (project.financialSummary?.totalActual || 0) / (project.estimatedBudget || 1) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-start text-[10px] font-black uppercase tracking-tighter">
                                    <span className="opacity-50">استهلاك التكاليف</span>
                                    <span className={(project.financialSummary?.totalActual || 0) > project.estimatedBudget ? 'text-red-300' : 'text-green-300'}>
                                        {Math.round((project.financialSummary?.totalActual || 0) / (project.estimatedBudget || 1) * 100) || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Details */}
                        <div className="bg-white dark:bg-surface-primary rounded-3xl p-8 border dark:border-border-primary shadow-sm space-y-8">
                            <h4 className="font-black flex items-center gap-3 border-b dark:border-border-primary pb-6 text-slate-800 dark:text-text-primary uppercase tracking-widest text-xs">
                                <Layout className="w-5 h-5 text-blue-600" />
                                الربحية المتوقعة
                            </h4>

                            <div className="space-y-6">
                                <SummaryItem
                                    label="إجمالي العائد (التعاقد)"
                                    value={project.contractValue}
                                    icon={TrendingUp}
                                    color="green"
                                />
                                <SummaryItem
                                    label="إجمالي التكاليف (الفعلية)"
                                    value={project.financialSummary?.totalActual}
                                    icon={TrendingDown}
                                    color="red"
                                />
                                <div className="pt-4 border-t dark:border-border-primary">
                                    <SummaryItem
                                        label="صافي الربح الفعلي"
                                        value={(project.contractValue || 0) - (project.financialSummary?.totalActual || 0)}
                                        icon={DollarSign}
                                        color="blue"
                                    />
                                </div>
                            </div>

                            <div className={`p-6 rounded-2xl flex items-center justify-between transition-all ${project.financialSummary?.difference! >= 0
                                ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20'
                                : 'bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/20'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl scale-110 ${project.financialSummary?.difference! >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                        {project.financialSummary?.difference! >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase opacity-60">توفير التكاليف</span>
                                        <span className="text-xl font-black tabular-nums">{(project.financialSummary?.difference || 0).toLocaleString()} <span className="text-xs font-bold">د.ل</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {isExpenseModalOpen && (
                    <ExpenseModal
                        isOpen={isExpenseModalOpen}
                        onClose={() => setIsExpenseModalOpen(false)}
                        onSubmit={handleAddExpense}
                        isLoading={isAddingExpense}
                    />
                )}
            </div>
        </PermissionGuard>
    );
};

// Summary Item component
const SummaryItem = ({ label, value, icon: Icon, color }: any) => {
    const colors: any = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
        orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    };

    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all group-hover:scale-110 ${colors[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <span className="font-black tabular-nums text-slate-800 dark:text-text-primary">{(value || 0).toLocaleString()} <span className="text-[10px] opacity-40 font-bold">د.ل</span></span>
        </div>
    );
};

// Expense Modal component
const ExpenseModal = ({ isOpen, onClose, onSubmit, isLoading }: any) => {
    const [formData, setFormData] = useState({
        name: '',
        itemType: 'SERVICE',
        expenseType: 'ACTUAL',
        productId: '',
        quantity: 1,
        unitPrice: 0,
        expenseDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const { data: productsResponse } = useGetProductsQuery({ limit: 1000 });
    const products = productsResponse?.data?.products || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            productId: formData.productId ? Number(formData.productId) : undefined,
            quantity: Number(formData.quantity),
            unitPrice: Number(formData.unitPrice)
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <div className="bg-white dark:bg-surface-primary rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border dark:border-border-primary animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b dark:border-border-primary flex justify-between items-center bg-slate-50 dark:bg-surface-secondary">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-text-primary">إضافة مصروف جديد</h2>
                        <p className="text-xs text-slate-500 dark:text-text-tertiary mt-1">توثيق مالي وحسم مخزني</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                        <Plus className="w-8 h-8 rotate-45" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">وصف البند</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all font-semibold"
                                placeholder="بند المصروف..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">نوع التسجيل</label>
                                <select
                                    value={formData.expenseType}
                                    onChange={(e) => setFormData({ ...formData, expenseType: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary font-bold transition-all text-sm"
                                >
                                    <option value="ACTUAL">🟢 مصروف فعلي</option>
                                    <option value="ESTIMATED">🔵 رصيد تقديري</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">نوع المورد</label>
                                <select
                                    value={formData.itemType}
                                    onChange={(e) => setFormData({ ...formData, itemType: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary font-bold transition-all text-sm"
                                >
                                    <option value="SERVICE">🛠️ خدمة / عام</option>
                                    <option value="MATERIAL">📦 بضاعة (مخزن)</option>
                                </select>
                            </div>
                        </div>

                        {formData.itemType === 'MATERIAL' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">الصنف المخصص</label>
                                <select
                                    required
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary font-bold text-sm"
                                >
                                    <option value="">اختر من المخزن...</option>
                                    {products.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name} - [{p.sku}]</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">الكمية</label>
                                <input
                                    required
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary font-bold tabular-nums"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">سعر الوحدة</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.unitPrice || ''}
                                        onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                                        className="w-full pr-4 pl-12 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary font-bold tabular-nums"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">د.ل</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">التاريخ</label>
                            <input
                                type="date"
                                value={formData.expenseDate}
                                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">ملاحظات</label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary resize-none transition-all"
                                placeholder="أي ملاحظات إضافية..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4 border-t dark:border-border-primary">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] disabled:bg-slate-400 disabled:shadow-none"
                            >
                                {isLoading ? 'جاري الحفظ...' : 'تأكيد الإضافة'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-slate-100 dark:bg-surface-elevated text-slate-700 dark:text-text-primary py-4 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-surface-hover transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Utils
const getStatusText = (status: string) => {
    switch (status) {
        case 'NEW': return '✨ مشروع جديد';
        case 'IN_PROGRESS': return '🚀 جاري العمل';
        case 'ON_HOLD': return '⏸️ متوقف مؤقتاً';
        case 'COMPLETED': return '✅ مكتمل بنجاح';
        default: return status;
    }
};

export default ProjectDetailsPage;
