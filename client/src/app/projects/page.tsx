"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from '@/state/projectApi';
import { useGetCustomersQuery, useCreateCustomerMutation } from '@/state/salesApi';
import { useGetEmployeesQuery } from '@/state/payrollApi';
import { useToast } from '@/components/ui/Toast';
import PermissionGuard from '@/components/PermissionGuard';
import {
    Briefcase,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Download,
    Calendar,
    User,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ProjectsPage = () => {
    const router = useRouter();
    const toast = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: projectsData, isLoading, error } = useGetProjectsQuery({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
    });

    const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
    const [deleteProject] = useDeleteProjectMutation();

    const handleCreateProject = async (data: any) => {
        try {
            await createProject(data).unwrap();
            setIsModalOpen(false);
            toast.success('تم بنجاح', 'تم إنشاء المشروع بنجاح');
        } catch (err: any) {
            toast.error('خطأ', err.data?.message || 'فشل إنشاء المشروع');
        }
    };

    const handleDeleteProject = async (id: number) => {
        const confirmed = await toast.confirm('تأكيد الحذف', 'هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المصروفات المرتبطة به أيضاً.');
        if (confirmed) {
            try {
                await deleteProject(id).unwrap();
                toast.success('تم بنجاح', 'تم حذف المشروع بنجاح');
            } catch (err: any) {
                toast.error('خطأ', err.data?.message || 'فشل حذف المشروع');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'NEW':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-semibold">جديد</span>;
            case 'IN_PROGRESS':
                return <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full text-xs font-semibold">جاري العمل</span>;
            case 'ON_HOLD':
                return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-semibold">متوقف</span>;
            case 'COMPLETED':
                return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-semibold">مكتمل</span>;
            default:
                return null;
        }
    };

    if (error) {
        return <div className="p-6 text-center text-red-500">حدث خطأ أثناء تحميل البيانات</div>;
    }

    return (
        <PermissionGuard requiredPermission="screen.projects">
            <div className="p-6 max-w-7xl mx-auto" dir="rtl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-xl text-white">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-text-primary">إدارة المشاريع</h1>
                            <p className="text-slate-500 dark:text-text-secondary">تتبع مشاريع العملاء والمصروفات المالية</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        مشروع جديد
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="إجمالي المشاريع" value={projectsData?.pagination.total || 0} icon={Briefcase} color="blue" />
                    <StatCard title="نشطة حالياً" value={projectsData?.projects.filter(p => p.status === 'IN_PROGRESS').length || 0} icon={Clock} color="orange" />
                    <StatCard title="مكتملة" value={projectsData?.projects.filter(p => p.status === 'COMPLETED').length || 0} icon={CheckCircle2} color="green" />
                    <StatCard title="متوقفة" value={projectsData?.projects.filter(p => p.status === 'ON_HOLD').length || 0} icon={AlertCircle} color="red" />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-surface-primary p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-border-primary mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="ابحث عن مشروع، عميل، أو مدير مشروع..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-12 pl-4 py-3 border border-slate-200 dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-surface-secondary dark:text-text-primary transition-all"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 border border-slate-200 dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-surface-secondary dark:text-text-primary"
                            >
                                <option value="">جميع الحالات</option>
                                <option value="NEW">جديد</option>
                                <option value="IN_PROGRESS">جاري العمل</option>
                                <option value="ON_HOLD">متوقف</option>
                                <option value="COMPLETED">مكتمل</option>
                            </select>
                            <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 dark:border-border-primary rounded-xl hover:bg-slate-50 dark:hover:bg-surface-hover transition-all dark:text-text-primary font-semibold">
                                <Download className="w-5 h-5" />
                                تصدير
                            </button>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {isLoading ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            جاري التحميل...
                        </div>
                    ) : !projectsData?.projects || projectsData.projects.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-surface-primary rounded-2xl border dark:border-border-primary">
                            <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-text-secondary text-lg">لا توجد مشاريع مضافة حالياً</p>
                        </div>
                    ) : projectsData.projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white dark:bg-surface-primary rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-border-primary hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-text-primary group-hover:text-blue-600 transition-colors">
                                            {project.name}
                                        </h3>
                                        {getStatusBadge(project.status)}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-text-secondary">
                                        <span className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            {project.customer?.name}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs">
                                            <Calendar className="w-4 h-4" />
                                            {project.createdAt ? format(new Date(project.createdAt), 'yyyy/MM/dd', { locale: ar }) : '-'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push(`/projects/${project.id}`)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="عرض التفاصيل"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="حذف"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-text-secondary text-sm line-clamp-2 mb-4 h-10">
                                {project.description || 'لا يوجد وصف للمشروع'}
                            </p>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-border-primary">
                                <div>
                                    <p className="text-[10px] text-slate-400 dark:text-text-tertiary mb-1">مدير المشروع</p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-text-primary truncate">
                                        {project.manager?.name || 'غير محدد'}
                                    </p>
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] text-slate-400 dark:text-text-tertiary mb-1">قيمة التعاقد</p>
                                    <p className="text-sm font-bold text-green-600">
                                        {project.contractValue?.toLocaleString()} د.ل
                                    </p>
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] text-slate-400 dark:text-text-tertiary mb-1">الميزانية التقديرية</p>
                                    <p className="text-sm font-bold text-blue-600">
                                        {project.estimatedBudget?.toLocaleString()} د.ل
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination placeholder */}
                {projectsData && projectsData.pagination.pages > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: projectsData.pagination.pages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === i + 1
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white dark:bg-surface-primary text-slate-500 dark:text-text-secondary border dark:border-border-primary hover:bg-slate-50'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <ProjectModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleCreateProject}
                        isLoading={isCreating}
                    />
                )}
            </div>
        </PermissionGuard>
    );
};

// Stat Card Sub-component
const StatCard = ({ title, value, icon: Icon, color }: any) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <div className="bg-white dark:bg-surface-primary p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-border-primary transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 dark:text-text-secondary text-sm font-semibold">{title}</p>
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-3xl font-bold dark:text-text-primary">{value}</p>
        </div>
    );
};

// Project Modal component
const ProjectModal = ({ isOpen, onClose, onSubmit, isLoading }: any) => {
    const toast = useToast();
    const [formData, setFormData] = useState({
        name: '',
        customerId: '' as any,
        description: '',
        projectManagerId: '' as any,
        estimatedBudget: '' as any,
        contractValue: '' as any,
        startDate: '',
        endDate: '',
        notes: ''
    });

    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
    const [selectedCustomerName, setSelectedCustomerName] = useState('');
    const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
    const customerSearchRef = React.useRef<HTMLDivElement>(null);

    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [showEmployeeSuggestions, setShowEmployeeSuggestions] = useState(false);
    const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
    const employeeSearchRef = React.useRef<HTMLDivElement>(null);

    const { data: customersData, isLoading: customersLoading } = useGetCustomersQuery({ limit: 1000 });
    const { data: employeesData, isLoading: employeesLoading } = useGetEmployeesQuery({ isActive: true });
    const [createCustomer] = useCreateCustomerMutation();

    // Close suggestions on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerSearchRef.current && !customerSearchRef.current.contains(event.target as Node)) {
                setShowCustomerSuggestions(false);
            }
            if (employeeSearchRef.current && !employeeSearchRef.current.contains(event.target as Node)) {
                setShowEmployeeSuggestions(false);
            }
        };
        if (showCustomerSuggestions || showEmployeeSuggestions) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCustomerSuggestions, showEmployeeSuggestions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerId) {
            toast.error('بيانات ناقصة', 'يرجى اختيار العميل أولاً');
            return;
        }
        onSubmit({
            ...formData,
            customerId: Number(formData.customerId),
            projectManagerId: formData.projectManagerId ? Number(formData.projectManagerId) : undefined,
            estimatedBudget: Number(formData.estimatedBudget || 0),
            contractValue: Number(formData.contractValue || 0)
        });
    };

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
                <div className="bg-white dark:bg-surface-primary rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border dark:border-border-primary animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b dark:border-border-primary flex justify-between items-center bg-slate-50 dark:bg-surface-secondary">
                        <h2 className="text-2xl font-bold dark:text-text-primary">إضافة مشروع جديد</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <Plus className="w-8 h-8 rotate-45" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">اسم المشروع</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all"
                                    placeholder="أدخل اسم المشروع..."
                                />
                            </div>

                            <div className="md:col-span-2 relative" ref={customerSearchRef}>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">
                                    العميل *
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={selectedCustomerName || customerSearchTerm}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setCustomerSearchTerm(value);
                                                setSelectedCustomerName('');
                                                setFormData(prev => ({ ...prev, customerId: '' }));
                                                setShowCustomerSuggestions(true);
                                            }}
                                            onFocus={() => setShowCustomerSuggestions(true)}
                                            placeholder="ابحث عن العميل بالاسم أو الهاتف..."
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary outline-none transition-all"
                                            required={!formData.customerId}
                                        />
                                        {customersLoading && (
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            </div>
                                        )}

                                        {showCustomerSuggestions && !customersLoading && (
                                            <div className="absolute z-[70] w-full mt-1 bg-white dark:bg-surface-elevated border border-slate-300 dark:border-border-primary rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                {customersData?.data?.customers
                                                    ?.filter((customer: any) =>
                                                    (customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                                                        customer.phone?.includes(customerSearchTerm))
                                                    )
                                                    ?.map((customer: any) => (
                                                        <div
                                                            key={customer.id}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, customerId: customer.id }));
                                                                setSelectedCustomerName(customer.name);
                                                                setCustomerSearchTerm('');
                                                                setShowCustomerSuggestions(false);
                                                            }}
                                                            className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-surface-hover cursor-pointer border-b border-slate-100 dark:border-border-primary last:border-b-0 transition-colors"
                                                        >
                                                            <div className="font-medium text-slate-900 dark:text-text-primary">{customer.name}</div>
                                                            {customer.phone && (
                                                                <div className="text-xs text-slate-500 dark:text-text-tertiary">📱 {customer.phone}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                {customersData?.data?.customers
                                                    ?.filter((customer: any) =>
                                                    (customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                                                        customer.phone?.includes(customerSearchTerm))
                                                    )?.length === 0 && (
                                                        <div className="px-4 py-3 text-slate-500 dark:text-text-tertiary text-sm">
                                                            لا توجد نتائج
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateCustomerModal(true)}
                                        className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center gap-1 whitespace-nowrap font-bold"
                                        title="إضافة عميل جديد"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>إضافة</span>
                                    </button>
                                </div>
                            </div>

                            <div className="relative" ref={employeeSearchRef}>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">مدير المشروع</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={selectedEmployeeName || employeeSearchTerm}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setEmployeeSearchTerm(value);
                                            setSelectedEmployeeName('');
                                            setFormData(prev => ({ ...prev, projectManagerId: '' }));
                                            setShowEmployeeSuggestions(true);
                                        }}
                                        onFocus={() => setShowEmployeeSuggestions(true)}
                                        placeholder="ابحث عن موظف بالاسم..."
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all"
                                    />
                                    {employeesLoading && (
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}

                                    {showEmployeeSuggestions && !employeesLoading && (
                                        <div className="absolute z-[70] w-full mt-1 bg-white dark:bg-surface-elevated border border-slate-300 dark:border-border-primary rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                            {employeesData?.data
                                                ?.filter((employee: any) =>
                                                    employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                                                    employee.jobTitle?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                                                )
                                                ?.map((employee: any) => (
                                                    <div
                                                        key={employee.id}
                                                        onClick={() => {
                                                            if (Number(employee.baseSalary) <= 0) {
                                                                toast.error('خطأ', 'لا يمكن اختيار هذا الموظف لأن راتبه 0');
                                                                return;
                                                            }
                                                            setFormData(prev => ({ ...prev, projectManagerId: employee.id }));
                                                            setSelectedEmployeeName(employee.name);
                                                            setEmployeeSearchTerm('');
                                                            setShowEmployeeSuggestions(false);
                                                        }}
                                                        className={`px-4 py-3 hover:bg-blue-50 dark:hover:bg-surface-hover cursor-pointer border-b border-slate-100 dark:border-border-primary last:border-b-0 transition-colors ${Number(employee.baseSalary) <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="font-medium text-slate-900 dark:text-text-primary">
                                                            {employee.name}
                                                            {Number(employee.baseSalary) <= 0 && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md mr-2">بدون راتب</span>}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-text-tertiary">
                                                            {employee.jobTitle || 'موظف'} | الراتب: {Number(employee.baseSalary).toLocaleString()} د.ل
                                                        </div>
                                                    </div>
                                                ))}
                                            {employeesData?.data
                                                ?.filter((employee: any) =>
                                                    employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                                                )?.length === 0 && (
                                                    <div className="px-4 py-3 text-slate-500 dark:text-text-tertiary text-sm">
                                                        لا توجد نتائج
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">تاريخ البدء</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">تاريخ الانتهاء</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">قيمة التعاقد (العائد)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.contractValue}
                                        onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl border-green-200 dark:border-green-900 focus:ring-2 focus:ring-green-500 outline-none dark:text-text-primary transition-all pr-4 pl-12"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold text-xs">د.ل</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">سيتم تسجيل هذا المبلغ كدين آجل على العميل</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">الميزانية التقديرية (التكاليف)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.estimatedBudget}
                                        onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all pr-4 pl-12"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold text-xs">د.ل</span>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">الوصف</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary resize-none transition-all"
                                    placeholder="تفاصيل المشروع..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] disabled:bg-slate-400 disabled:shadow-none"
                            >
                                {isLoading ? 'جاري الحفظ...' : 'حفظ المشروع'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-slate-100 dark:bg-surface-elevated text-slate-700 dark:text-text-primary py-4 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-surface-hover transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Create Customer Modal */}
            {showCreateCustomerModal && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto h-full w-full z-[70] flex items-center justify-center p-4">
                    <div className="relative mx-auto p-6 border dark:border-border-primary w-full max-w-md shadow-2xl rounded-2xl bg-white dark:bg-surface-primary animate-in fade-in zoom-in duration-200">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-text-primary">إضافة عميل جديد</h3>
                            <p className="text-slate-500 text-sm">أدخل بيانات العميل لإضافته للنظام واختياره</p>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                            const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
                            const note = (form.elements.namedItem('note') as HTMLInputElement).value;

                            try {
                                const result = await createCustomer({ name, phone, note }).unwrap();
                                setShowCreateCustomerModal(false);

                                if (result.data?.id) {
                                    setFormData(prev => ({ ...prev, customerId: result.data.id }));
                                    setSelectedCustomerName(result.data.name);
                                    setCustomerSearchTerm('');
                                }
                                toast.success('تم بنجاح', 'تم إضافة العميل واختياره تلقائياً');
                            } catch (err: any) {
                                toast.error('خطأ', err.data?.message || 'حدث خطأ أثناء إضافة العميل');
                            }
                        }} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">
                                    اسم العميل *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all"
                                    placeholder="الاسم الثلاثي..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">
                                    رقم الهاتف
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all"
                                    placeholder="091XXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary mb-2">
                                    ملاحظات
                                </label>
                                <input
                                    type="text"
                                    name="note"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-secondary border dark:border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-text-primary transition-all"
                                    placeholder="أي ملاحظات إضافية..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg"
                                >
                                    حفظ وتحديد
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateCustomerModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-surface-elevated text-slate-700 dark:text-text-primary py-4 rounded-xl font-bold hover:bg-slate-200"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectsPage;
