import { z } from 'zod';
import { ProjectStatus, ProjectExpenseType, ProjectExpenseItemType } from '@prisma/client';

/**
 * Project DTOs
 * كائنات نقل البيانات للمشاريع
 */

export const CreateProjectDtoSchema = z.object({
    name: z.string().min(1, 'اسم المشروع مطلوب'),
    customerId: z.number().int().positive('معرف العميل مطلوب'),
    description: z.string().optional(),
    projectManager: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional().default(ProjectStatus.NEW),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    estimatedBudget: z.number().min(0).optional().default(0),
    contractValue: z.number().min(0).optional().default(0),
    notes: z.string().optional()
});

export const UpdateProjectDtoSchema = z.object({
    name: z.string().min(1).optional(),
    customerId: z.number().int().positive().optional(),
    description: z.string().optional(),
    projectManager: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    estimatedBudget: z.number().min(0).optional(),
    contractValue: z.number().min(0).optional(),
    notes: z.string().optional()
});

export const CreateProjectExpenseDtoSchema = z.object({
    projectId: z.number().int().positive(),
    name: z.string().min(1, 'اسم بند المصروف مطلوب'),
    itemType: z.nativeEnum(ProjectExpenseItemType),
    expenseType: z.nativeEnum(ProjectExpenseType),
    productId: z.number().int().positive().optional(),
    quantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
    unitPrice: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر'),
    expenseDate: z.string().optional(),
    notes: z.string().optional()
});

export const GetProjectsQueryDtoSchema = z.object({
    page: z.string().optional().default('1').transform(Number).pipe(z.number().int().positive()),
    limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().positive().max(1000)),
    search: z.string().transform(val => val === '' ? undefined : val).optional(),
    customerId: z.union([
        z.string().transform(val => val === '' ? undefined : Number(val)).pipe(z.number().int().positive()),
        z.literal('').transform(() => undefined)
    ]).optional(),
    status: z.union([z.nativeEnum(ProjectStatus), z.literal('').transform(() => undefined)]).optional()
});

export type CreateProjectDto = z.infer<typeof CreateProjectDtoSchema>;
export type UpdateProjectDto = z.infer<typeof UpdateProjectDtoSchema>;
export type CreateProjectExpenseDto = z.infer<typeof CreateProjectExpenseDtoSchema>;
export type GetProjectsQueryDto = z.infer<typeof GetProjectsQueryDtoSchema>;
