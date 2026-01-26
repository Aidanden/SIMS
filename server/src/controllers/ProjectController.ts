/**
 * Project Controller
 * تحكم في عمليات المشاريع
 */

import { Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import {
    CreateProjectDtoSchema,
    UpdateProjectDtoSchema,
    CreateProjectExpenseDtoSchema,
    GetProjectsQueryDtoSchema
} from '../dto/projectDto';

export class ProjectController {
    private projectService: ProjectService;

    constructor() {
        this.projectService = new ProjectService();
    }

    /**
     * إنشاء مشروع جديد
     */
    async createProject(req: Request, res: Response): Promise<void> {
        try {
            const validationResult = CreateProjectDtoSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: validationResult.error.issues.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }

            const userCompanyId = (req as any).user?.companyId;
            if (!userCompanyId) {
                res.status(401).json({
                    success: false,
                    message: 'غير مصرح لك بالوصول: معرف الشركة غير موجود'
                });
                return;
            }

            const project = await this.projectService.createProject(validationResult.data, userCompanyId);

            res.status(201).json({
                success: true,
                message: 'تم إنشاء المشروع بنجاح',
                data: project,
            });
        } catch (error: any) {
            console.error('Error creating project:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'خطأ في الخادم الداخلي أثناء إنشاء المشروع'
            });
        }
    }

    /**
     * الحصول على قائمة المشاريع
     */
    async getProjects(req: Request, res: Response): Promise<void> {
        try {
            const validationResult = GetProjectsQueryDtoSchema.safeParse(req.query);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'معطيات البحث غير صحيحة',
                    errors: validationResult.error.issues
                });
                return;
            }

            const userCompanyId = (req as any).user?.companyId;
            const isSystemUser = (req as any).user?.isSystemUser;

            if (!userCompanyId && !isSystemUser) {
                res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول' });
                return;
            }

            const result = await this.projectService.getProjects(validationResult.data, userCompanyId, isSystemUser);
            if (process.env.NODE_ENV !== 'production') {
                console.log('Projects Controller - Result:', JSON.stringify({
                    success: true,
                    projectCount: result.projects.length,
                    total: result.pagination.total
                }));
            }
            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
            console.error('Error fetching projects:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'خطأ في الخادم الداخلي أثناء جلب المشاريع'
            });
        }
    }

    /**
     * الحصول على مشروع واحد بالتفاصيل
     */
    async getProjectById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'معرف المشروع غير صحيح' });
                return;
            }

            const userCompanyId = (req as any).user?.companyId;
            const isSystemUser = (req as any).user?.isSystemUser;

            const project = await this.projectService.getProjectById(id, userCompanyId, isSystemUser);
            res.status(200).json({
                success: true,
                data: project
            });
        } catch (error: any) {
            console.error('Error fetching project:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'المشروع غير موجود'
            });
        }
    }

    /**
     * تحديث بيانات المشروع
     */
    async updateProject(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string);
            const validationResult = UpdateProjectDtoSchema.safeParse(req.body);

            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'معرف المشروع غير صحيح' });
                return;
            }

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: validationResult.error.issues
                });
                return;
            }

            const userCompanyId = (req as any).user?.companyId;
            const isSystemUser = (req as any).user?.isSystemUser;

            const project = await this.projectService.updateProject(id, validationResult.data, userCompanyId, isSystemUser);
            res.status(200).json({
                success: true,
                message: 'تم تحديث المشروع بنجاح',
                data: project
            });
        } catch (error: any) {
            console.error('Error updating project:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'خطأ في الخادم الداخلي أثناء تحديث المشروع'
            });
        }
    }

    /**
     * حذف مشروع
     */
    async deleteProject(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'معرف المشروع غير صحيح' });
                return;
            }

            const userCompanyId = (req as any).user?.companyId;
            const isSystemUser = (req as any).user?.isSystemUser;

            await this.projectService.deleteProject(id, userCompanyId, isSystemUser);
            res.status(200).json({
                success: true,
                message: 'تم حذف المشروع بنجاح'
            });
        } catch (error: any) {
            console.error('Error deleting project:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'خطأ في الخادم الداخلي أثناء حذف المشروع'
            });
        }
    }

    /**
     * إضافة مصروف جديد للمشروع
     */
    async addExpense(req: Request, res: Response): Promise<void> {
        try {
            const validationResult = CreateProjectExpenseDtoSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'بيانات المصروف غير صحيحة',
                    errors: validationResult.error.issues
                });
                return;
            }

            const userCompanyId = (req as any).user?.companyId;
            if (!userCompanyId) {
                res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول' });
                return;
            }

            const expense = await this.projectService.addExpense(validationResult.data, userCompanyId);

            res.status(201).json({
                success: true,
                message: 'تم إضافة المصروف بنجاح',
                data: expense
            });
        } catch (error: any) {
            console.error('Error adding expense:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'خطأ أثناء إضافة المصروف'
            });
        }
    }

    /**
     * حذف مصروف من المشروع
     */
    async deleteExpense(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'معرف المصروف غير صحيح' });
                return;
            }

            const userCompanyId = (req as any).user?.companyId;
            if (!userCompanyId) {
                res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول' });
                return;
            }

            await this.projectService.deleteExpense(id, userCompanyId);

            res.status(200).json({
                success: true,
                message: 'تم حذف المصروف بنجاح'
            });
        } catch (error: any) {
            console.error('Error deleting expense:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'خطأ أثناء حذف المصروف'
            });
        }
    }
}
