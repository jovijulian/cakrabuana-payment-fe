"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "@mantine/form";
import useLocalStorage from "@/hooks/useLocalStorage";
import { setCookie } from "cookies-next";
import Alert from "@/components/ui/alert/Alert";
import axios from "axios";
import {
    Lock,
    Eye,
    EyeOff,
    User,
    ArrowRight,
    CreditCard
} from "lucide-react";
import { toast } from "react-toastify";
import { endpointUrl, httpGet } from "@/../helpers";

const SignIn: React.FC = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [_, setToken] = useLocalStorage("token", "");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ variant: any; title: string; message: string; showLink: boolean; linkHref: string; linkText: string } | null>(null);

    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },
        validate: {
            email: (value: any) =>
                !value || value.length < 5
                    ? "ID Siswa tidak valid"
                    : null,
            password: (value: any) =>
                value.length < 1
                    ? "Password wajib diisi"
                    : null,
        },
    });

    const onSubmit = async (values: typeof form.values) => {
        setLoading(true);
        setAlert(null);
        const payload = {
            email: values.email,
            password: values.password,
        };

        try {
            const response = await axios.post(endpointUrl(`auth/login`), payload);

            const { token } = response.data.data;
            localStorage.setItem("token", token);
            setCookie("cookieKey", token, {});
            getMe();

        } catch (error: any) {
            if (error.response.status === 401) {
                setAlert({
                    variant: "error",
                    title: "Gagal Masuk",
                    message: "Email atau Kata Sandi salah.",
                    showLink: false,
                    linkHref: "",
                    linkText: "",
                });
                return;
            } else if (error.response.status === 400) {
                setAlert({
                    variant: "error",
                    title: "Gagal Masuk",
                    message: "Permintaan tidak valid. Silakan periksa kembali input Anda.",
                    showLink: false,
                    linkHref: "",
                    linkText: "",
                });
                return;
            }
            setAlert({
                variant: "error",
                title: "Gagal Masuk",
                message: "Kesalahan Server Internal.",
                showLink: false,
                linkHref: "",
                linkText: "",
            });
        } finally {
            setLoading(false);
        }
    };

    const getMe = async () => {
        try {
            const response = await httpGet(endpointUrl(`auth/me`), true);
            const user = response.data.data;
            setCookie("role", user.role_id, {});
            localStorage.setItem("role", user.role_id);
            localStorage.setItem("name", user.name);
            localStorage.setItem("email", user.email);
            localStorage.setItem("id", user.id);

            if (user.role_id == "1") {
                window.location.href = "/admin/dashboard";
            } else if (user.role_id == "2") {
                window.location.href = "/student/payment-lists";
            }

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 relative font-sans">
            <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-700 opacity-90"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>
            <div className="relative w-full max-w-md z-10">
                <div className="bg-white/95 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl p-8 relative">
                    <div className="text-center mb-8 relative">
                        <div className="flex justify-center mb-5">
                            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                                <Image
                                    src="/images/logo/logo-sekolah.jpeg"
                                    alt="Logo Sekolah"
                                    width={100}
                                    height={100}
                                    className="object-contain h-14 w-auto"
                                    priority
                                />
                            </div>
                        </div>

                        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Portal Orang Tua</h1>
                        <p className="text-gray-500 text-sm mt-2">
                            Silakan masuk menggunakan ID Siswa untuk melihat informasi pembayaran dan lainnya.
                        </p>
                    </div>

                    <form onSubmit={form.onSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">
                                Nomor Registrasi Siswa
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <input
                                    {...form.getInputProps("email")}
                                    type="text"
                                    placeholder="Contoh: 125260002"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 font-medium"
                                />
                            </div>
                            {form.errors.email && (
                                <p className="text-red-500 text-xs ml-1 mt-1 font-medium">{form.errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    {...form.getInputProps("password")}
                                    type={isPasswordVisible ? "text" : "password"}
                                    placeholder="Masukkan password"
                                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
                                >
                                    {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {form.errors.password && (
                                <p className="text-red-500 text-xs ml-1 mt-1 font-medium">{form.errors.password}</p>
                            )}
                        </div>

                        {/* Error Alert */}
                        {alert && (
                            <div className="animate-fade-in-down">
                                <Alert
                                    variant={alert.variant}
                                    title={alert.title}
                                    message={alert.message}
                                    showLink={alert.showLink}
                                    linkHref={alert.linkHref}
                                    linkText={alert.linkText}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-4 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2
                            bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
                            ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex space-x-1.5 py-1">
                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                                </div>
                            ) : (
                                <>
                                    <span>Masuk Portal</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Copyright */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">
                            &copy; {new Date().getFullYear()} Bintara - Cakra Buana. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;