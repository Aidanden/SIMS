"use client";

import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useForgotPasswordMutation } from "@/state/authApi";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    // const [isLoading, setIsLoading] = useState(false); // remove local loading state
    const [error, setError] = useState("");

    // Use the mutation from RTK Query
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    // منع أي إعادة توجيه تلقائية
    useEffect(() => {
        // الصفحة متاحة للجميع
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("يرجى إدخال البريد الإلكتروني");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("يرجى إدخال بريد إلكتروني صحيح");
            return;
        }

        try {
            const response = await forgotPassword({ email }).unwrap();
            if (response.success) {
                setIsSubmitted(true);
            }
        } catch (err: any) {
            setError(err?.data?.message || "حدث خطأ أثناء إرسال البريد الإلكتروني");
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir="rtl">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">تم إرسال الرابط</h2>
                        <p className="text-slate-600 mb-6">
                            تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
                        </p>
                        <p className="text-sm text-slate-500 mb-6">
                            يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات لإعادة تعيين كلمة المرور
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            العودة إلى تسجيل الدخول
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex" dir="rtl">
            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
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
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">نسيت كلمة المرور؟</h1>
                        <p className="text-slate-600">
                            أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2 text-right">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input text-right pr-10 pl-10"
                                    placeholder="أدخل بريدك الإلكتروني"
                                    dir="rtl"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
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
                                    جارٍ الإرسال...
                                </div>
                            ) : (
                                "إرسال رابط إعادة التعيين"
                            )}
                        </button>

                        {/* Back to Login */}
                        <div className="text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                العودة إلى تسجيل الدخول
                            </Link>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-xs text-slate-500">
                            &copy; 2026 ARABTECH . جميع الحقوق محفوظة
                        </p>
                    </div>
                </div>
            </div>

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-20 xl:px-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="absolute inset-0 h-full w-full" fill="currentColor">
                        <defs>
                            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="20" cy="20" r="2" fill="white" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
                    </svg>
                </div>

                <div className="relative z-10 text-white">
                    <h2 className="text-4xl font-bold mb-6 text-right">
                        استعادة الوصول لحسابك
                    </h2>
                    <p className="text-xl mb-8 text-blue-100 text-right leading-relaxed">
                        لا تقلق، يحدث هذا لأفضلنا. سنساعدك على استعادة الوصول إلى حسابك بسرعة وأمان
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-right">
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                            <span className="text-blue-100">عملية سريعة وآمنة</span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                            <span className="text-blue-100">حماية بيانات متقدمة</span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                            <span className="text-blue-100">دعم فني متواصل</span>
                        </div>
                    </div>

                    <div className="mt-12 text-right">
                        <p className="text-blue-200 text-sm">
                            &copy; 2026 Smart Integrated Management System
                        </p>
                        <p className="text-blue-300 text-xs mt-1">
                            جميع الحقوق محفوظة . ARABTECH
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
