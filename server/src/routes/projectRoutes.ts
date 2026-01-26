/**
 * Project Routes
 * مسارات إدارة المشاريع
 */

import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authenticateToken } from '../middleware/auth';
import { authorizePermissions } from '../middleware/authorization';
import { SCREEN_PERMISSIONS } from '../constants/screenPermissions';

const router = Router();
const projectController = new ProjectController();

// تطبيق middleware المصادقة على جميع المسارات
router.use(authenticateToken);

/**
 * @route   GET /api/projects
 * @desc    الحصول على قائمة المشاريع
 */
router.get('/', authorizePermissions([SCREEN_PERMISSIONS.PROJECTS, SCREEN_PERMISSIONS.ALL]), projectController.getProjects.bind(projectController));

/**
 * @route   POST /api/projects
 * @desc    إنشاء مشروع جديد
 */
router.post('/', authorizePermissions([SCREEN_PERMISSIONS.PROJECTS, SCREEN_PERMISSIONS.ALL]), projectController.createProject.bind(projectController));

/**
 * @route   GET /api/projects/:id
 * @desc    الحصول على مشروع واحد بالتفاصيل
 */
router.get('/:id', authorizePermissions([SCREEN_PERMISSIONS.PROJECTS, SCREEN_PERMISSIONS.ALL]), projectController.getProjectById.bind(projectController));

/**
 * @route   PUT /api/projects/:id
 * @desc    تحديث بيانات المشروع
 */
router.put('/:id', authorizePermissions([SCREEN_PERMISSIONS.PROJECTS, SCREEN_PERMISSIONS.ALL]), projectController.updateProject.bind(projectController));

/**
 * @route   DELETE /api/projects/:id
 * @desc    حذف مشروع
 */
router.delete('/:id', authorizePermissions([SCREEN_PERMISSIONS.PROJECTS, SCREEN_PERMISSIONS.ALL]), projectController.deleteProject.bind(projectController));

/**
 * @route   POST /api/projects/expenses
 * @desc    إضافة مصروف للمشروع
 */
router.post('/expenses', authorizePermissions([SCREEN_PERMISSIONS.PROJECTS, SCREEN_PERMISSIONS.ALL]), projectController.addExpense.bind(projectController));

/**
 * @route   DELETE /api/projects/expenses/:id
 * @desc    حذف مصروف من المشروع
 */
router.delete('/expenses/:id', authorizePermissions([SCREEN_PERMISSIONS.PROJECTS, SCREEN_PERMISSIONS.ALL]), projectController.deleteExpense.bind(projectController));

export default router;
