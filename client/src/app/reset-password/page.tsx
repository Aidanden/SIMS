"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useResetPasswordMutation } from "@/state/authApi";

const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("رابط غير صالح");
            return;
        }

        if (newPassword.length < 6) {
            setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("كلمتا المرور غير متطابقتين");
            return;
        }

        try {
            const response = await resetPassword({ token, newPassword }).unwrap();
            if (response.success) {
                setIsSuccess(true);
            }
        } catch (err: any) {
            setError(err?.data?.message || "فشل إعادة تعيين كلمة المرور");
        }
    };

    if (!token) {
        return (
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">رابط غير صالح</h2>
                <p className="text-slate-600 mb-6">
                    تأكد من نسخ الرابط بشكل صحيح من البريد الإلكتروني.
                </p>
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                    طلب رابط جديد
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">تم تغيير كلمة المرور</h2>
                <p className="text-slate-600 mb-6">
                    تم تحديث كلمة المرور الخاصة بك بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
                </p>
                <Link
                    href="/login"
                    className="btn-primary w-full py-3 text-base font-semibold block"
                >
                    تسجيل الدخول
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm lg:w-96">
            {/* Logo */}
            <div className="flex justify-center mb-8">
                <div className="w-32 h-32 relative flex items-center justify-center">
                    <Image
                        src="/Arabtech@3x.png"
                        alt="Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">تعيين كلمة مرور جديدة</h1>
                <p className="text-slate-600">
                    أدخل كلمة المرور الجديدة لحسابك
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 text-right">
                        كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input text-right pr-10 pl-10"
                            placeholder="••••••••"
                            dir="rtl"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 text-right">
                        تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input text-right pr-10 pl-10"
                            placeholder="••••••••"
                            dir="rtl"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-r-4 border-red-400 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="mr-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3 text-base font-semibold"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            جاري التحديث...
                        </div>
                    ) : (
                        "تغيير كلمة المرور"
                    )}
                </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8">
                <p className="text-xs text-slate-500">
                    &copy; 2026 ARABTECH . جميع الحقوق محفوظة
                </p>
            </div>
        </div>
    );
};

const ResetPasswordPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir="rtl">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
};

export default ResetPasswordPage;
