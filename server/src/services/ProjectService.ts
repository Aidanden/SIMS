import prisma from '../models/prismaClient';
import {
    CreateProjectDto,
    UpdateProjectDto,
    CreateProjectExpenseDto,
    GetProjectsQueryDto
} from '../dto/projectDto';
import { ProjectStatus, ProjectExpenseType, ProjectExpenseItemType } from '@prisma/client';
import customerAccountService from './CustomerAccountService';

/**
 * Project Service
 * خدمة إدارة المشاريع
 */
export class ProjectService {
    private prisma = prisma;

    /**
     * إنشاء مشروع جديد
     */
    async createProject(data: CreateProjectDto, companyId: number) {
        return await this.prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    name: data.name,
                    customerId: data.customerId,
                    companyId,
                    description: data.description,
                    projectManager: data.projectManager,
                    status: data.status as ProjectStatus || ProjectStatus.NEW,
                    startDate: data.startDate ? new Date(data.startDate) : null,
                    endDate: data.endDate ? new Date(data.endDate) : null,
                    estimatedBudget: data.estimatedBudget || 0,
                    contractValue: data.contractValue || 0,
                    notes: data.notes
                },
                include: {
                    customer: true,
                }
            });

            // إذا كانت هناك قيمة تعاقدية، نسجلها كدين على العميل
            if (data.contractValue && data.contractValue > 0) {
                await customerAccountService.createAccountEntry({
                    customerId: data.customerId,
                    transactionType: 'DEBIT',
                    amount: data.contractValue,
                    referenceType: 'PROJECT',
                    referenceId: project.id,
                    description: `قيمة التعاقد لمشروع: ${project.name}`,
                    transactionDate: new Date()
                }, tx as any);
            }

            return project;
        });
    }

    /**
     * الحصول على المشاريع
     */
    async getProjects(query: GetProjectsQueryDto, companyId: number, isSystemUser: boolean = false) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (!isSystemUser) {
            where.companyId = companyId;
        }

        if (query.customerId) where.customerId = query.customerId;
        if (query.status) where.status = query.status;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { projectManager: { contains: query.search, mode: 'insensitive' } },
                { customer: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }

        const [projects, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: {
                        select: { id: true, name: true, phone: true }
                    },
                    company: {
                        select: { id: true, name: true, code: true }
                    },
                    _count: {
                        select: { expenses: true }
                    }
                }
            }),
            this.prisma.project.count({ where })
        ]);

        return {
            projects: projects.map(p => ({
                ...p,
                estimatedBudget: Number(p.estimatedBudget),
                contractValue: Number(p.contractValue)
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * الحصول على تفاصيل المشروع
     */
    async getProjectById(id: number, companyId: number, isSystemUser: boolean = false) {
        const where: any = { id };
        if (!isSystemUser) {
            where.companyId = companyId;
        }

        const project = await this.prisma.project.findFirst({
            where,
            include: {
                customer: true,
                company: true,
                expenses: {
                    include: {
                        product: {
                            select: { id: true, name: true, sku: true, unit: true }
                        }
                    },
                    orderBy: { expenseDate: 'desc' }
                }
            }
        });

        if (!project) throw new Error('المشروع غير موجود');

        // حساب الملخص المالي
        const estimatedExpenses = project.expenses
            .filter(e => e.expenseType === ProjectExpenseType.ESTIMATED)
            .reduce((sum, e) => sum + Number(e.total), 0);

        const actualExpenses = project.expenses
            .filter(e => e.expenseType === ProjectExpenseType.ACTUAL)
            .reduce((sum, e) => sum + Number(e.total), 0);

        const actualGoodsExpenses = project.expenses
            .filter(e => e.expenseType === ProjectExpenseType.ACTUAL && e.itemType === ProjectExpenseItemType.MATERIAL)
            .reduce((sum, e) => sum + Number(e.total), 0);

        return {
            ...project,
            estimatedBudget: Number(project.estimatedBudget),
            contractValue: Number(project.contractValue),
            expenses: project.expenses.map(e => ({
                ...e,
                quantity: Number(e.quantity),
                unitPrice: Number(e.unitPrice),
                total: Number(e.total)
            })),
            financialSummary: {
                totalEstimated: estimatedExpenses,
                totalActual: actualExpenses,
                difference: estimatedExpenses - actualExpenses,
                remainingBudget: Number(project.estimatedBudget) - actualExpenses,
                totalGoodsActual: actualGoodsExpenses
            }
        };
    }

    /**
     * تحديث المشروع
     */
    async updateProject(id: number, data: UpdateProjectDto, companyId: number, isSystemUser: boolean = false) {
        const where: any = { id };
        if (!isSystemUser) {
            where.companyId = companyId;
        }

        const existing = await this.prisma.project.findFirst({ where });
        if (!existing) throw new Error('المشروع غير موجود أو لا تملك صلاحية تعديله');

        return await this.prisma.project.update({
            where: { id },
            data: {
                name: data.name,
                customerId: data.customerId,
                description: data.description,
                projectManager: data.projectManager,
                status: data.status as ProjectStatus,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                estimatedBudget: data.estimatedBudget,
                contractValue: data.contractValue,
                notes: data.notes
            }
        });
    }

    /**
     * حذف مشروع
     */
    async deleteProject(id: number, companyId: number, isSystemUser: boolean = false) {
        const where: any = { id };
        if (!isSystemUser) {
            where.companyId = companyId;
        }

        const existing = await this.prisma.project.findFirst({ where });
        if (!existing) throw new Error('المشروع غير موجود أو لا تملك صلاحية حذفه');

        return await this.prisma.project.delete({
            where: { id }
        });
    }

    /**
     * إضافة مصروف للمشروع
     */
    async addExpense(data: CreateProjectExpenseDto, companyId: number) {
        return await this.prisma.$transaction(async (tx) => {
            const project = await tx.project.findUnique({
                where: { id: data.projectId }
            });

            if (!project) throw new Error('المشروع غير موجود');
            if (project.companyId !== companyId) throw new Error('غير مصرح لك بالإضافة لهذا المشروع');

            if (data.expenseType === ProjectExpenseType.ACTUAL && data.itemType === ProjectExpenseItemType.MATERIAL) {
                if (!data.productId) throw new Error('يجب تحديد الصنف للمصروفات العينية (بضاعة)');

                const stock = await tx.stock.findUnique({
                    where: {
                        companyId_productId: {
                            companyId,
                            productId: data.productId
                        }
                    }
                });

                if (!stock || Number(stock.boxes) < data.quantity) {
                    throw new Error('الرصيد في المخزن غير كافٍ');
                }

                await tx.stock.update({
                    where: { id: stock.id },
                    data: {
                        boxes: { decrement: data.quantity }
                    }
                });
            }

            return await tx.projectExpense.create({
                data: {
                    projectId: data.projectId,
                    companyId,
                    productId: data.productId,
                    name: data.name,
                    itemType: data.itemType,
                    expenseType: data.expenseType,
                    quantity: data.quantity,
                    unitPrice: data.unitPrice,
                    total: data.quantity * data.unitPrice,
                    expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
                    notes: data.notes
                }
            });
        });
    }

    /**
     * حذف مصروف
     */
    async deleteExpense(id: number, companyId: number) {
        return await this.prisma.$transaction(async (tx) => {
            const expense = await tx.projectExpense.findUnique({
                where: { id }
            });

            if (!expense) throw new Error('المصروف غير موجود');
            if (expense.companyId !== companyId) throw new Error('غير مصرح لك بحذف هذا المصروف');

            if (expense.expenseType === ProjectExpenseType.ACTUAL && expense.itemType === ProjectExpenseItemType.MATERIAL && expense.productId) {
                await tx.stock.upsert({
                    where: {
                        companyId_productId: {
                            companyId,
                            productId: expense.productId
                        }
                    },
                    update: {
                        boxes: { increment: expense.quantity }
                    },
                    create: {
                        companyId,
                        productId: expense.productId,
                        boxes: expense.quantity
                    }
                });
            }

            return await tx.projectExpense.delete({
                where: { id }
            });
        });
    }
}
