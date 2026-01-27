/**
 * Project API
 * API لإصدارة المشاريع والمصروفات
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuthInterceptor } from "./apiUtils";
import { API_CACHE_CONFIG } from "@/lib/config";

export interface Project {
    id: number;
    companyId: number;
    customerId: number;
    name: string;
    description?: string;
    projectManagerId?: number;
    manager?: {
        id: number;
        name: string;
        jobTitle?: string;
    };
    status: "NEW" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED";
    startDate?: string;
    endDate?: string;
    estimatedBudget: number;
    contractValue: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    customer?: {
        id: number;
        name: string;
        phone?: string;
    };
    company?: {
        id: number;
        name: string;
        code: string;
    };
    expenses?: ProjectExpense[];
    financialSummary?: {
        totalEstimated: number;
        totalActual: number;
        difference: number;
        remainingBudget: number;
        totalGoodsActual: number;
    };
    _count?: {
        expenses: number;
    };
}

export interface ProjectExpense {
    id: number;
    projectId: number;
    companyId: number;
    productId?: number;
    name: string;
    itemType: "SERVICE" | "MATERIAL";
    expenseType: "ESTIMATED" | "ACTUAL";
    quantity: number;
    unitPrice: number;
    total: number;
    expenseDate: string;
    notes?: string;
    createdAt: string;
    product?: {
        id: number;
        name: string;
        sku: string;
        unit?: string;
    };
}

export interface CreateProjectRequest {
    name: string;
    customerId: number;
    description?: string;
    projectManagerId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    estimatedBudget?: number;
    contractValue?: number;
    notes?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> { }

export interface CreateProjectExpenseRequest {
    projectId: number;
    name: string;
    itemType: "SERVICE" | "MATERIAL";
    expenseType: "ESTIMATED" | "ACTUAL";
    productId?: number;
    quantity: number;
    unitPrice: number;
    expenseDate?: string;
    notes?: string;
}

export interface ProjectsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    customerId?: number;
    status?: string;
}

export interface ProjectsResponse {
    success: boolean;
    projects: Project[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export const projectApi = createApi({
    reducerPath: "projectApi",
    baseQuery: baseQueryWithAuthInterceptor,
    tagTypes: ["Projects", "Project"],
    ...API_CACHE_CONFIG.projects,
    endpoints: (builder) => ({
        getProjects: builder.query<ProjectsResponse, ProjectsQueryParams>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        searchParams.append(key, value.toString());
                    }
                });
                return `projects?${searchParams.toString()}`;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.projects.map(({ id }) => ({ type: "Project" as const, id })),
                        { type: "Projects", id: "LIST" },
                    ]
                    : [{ type: "Projects", id: "LIST" }],
        }),
        getProject: builder.query<{ success: boolean; data: Project }, number>({
            query: (id) => `projects/${id}`,
            providesTags: (result, error, id) => [{ type: "Project", id }],
        }),
        createProject: builder.mutation<{ success: boolean; data: Project }, CreateProjectRequest>({
            query: (data) => ({
                url: "projects",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Projects", id: "LIST" }],
        }),
        updateProject: builder.mutation<{ success: boolean; data: Project }, { id: number; data: UpdateProjectRequest }>({
            query: ({ id, data }) => ({
                url: `projects/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Project", id },
                { type: "Projects", id: "LIST" },
            ],
        }),
        deleteProject: builder.mutation<{ success: boolean }, number>({
            query: (id) => ({
                url: `projects/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Projects", id: "LIST" }],
        }),
        addProjectExpense: builder.mutation<{ success: boolean; data: ProjectExpense }, CreateProjectExpenseRequest>({
            query: (data) => ({
                url: "projects/expenses",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { projectId }) => [
                { type: "Project", id: projectId },
                { type: "Projects", id: "LIST" },
            ],
        }),
        deleteProjectExpense: builder.mutation<{ success: boolean }, { id: number; projectId: number }>({
            query: ({ id }) => ({
                url: `projects/expenses/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { projectId }) => [
                { type: "Project", id: projectId },
                { type: "Projects", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetProjectsQuery,
    useGetProjectQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
    useAddProjectExpenseMutation,
    useDeleteProjectExpenseMutation,
} = projectApi;
