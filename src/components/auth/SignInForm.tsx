"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Root } from "@/types";
import { useForm } from "@mantine/form";
import { endpointUrl, httpGet } from "@/../helpers";
import useLocalStorage from "@/hooks/useLocalStorage";
import { setCookie } from "cookies-next";
import Alert from "@/components/ui/alert/Alert";
import axios from "axios";
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    School, 
    ShieldCheck, 
    ArrowRight 
} from "lucide-react"; // Menggunakan Lucide agar konsisten
import { toast } from "react-toastify";

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
      email: (value: any) => (/^\S+@\S+$/.test(value) ? null : "Email tidak valid"),
      password: (value: any) =>
        value.length < 6
          ? "Password minimal 6 karakter"
          : null,
    },
  });

  const onSubmit = async (payload: typeof form.values) => {
    setLoading(true);
    setAlert(null);
    try {
      toast.success("Sedang dalam pengembangan. Silakan hubungi administrator untuk akses.");
      // const response = await axios<Root>({
      //   method: "POST",
      //   url: endpointUrl(`auth/login`),
      //   data: {
      //     ...payload,
      //     user_agent: navigator.userAgent,
      //   },
      // });

      // const { token, user } = response.data.data;
      // localStorage.setItem("token", token);
      // setCookie("cookieKey", token, {});
      // getMe();
    } catch (error) {
      console.log(error);
      setAlert({
        variant: "error",
        title: "Login Gagal",
        message: "Email atau password yang Anda masukkan salah.",
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
      localStorage.setItem("role", user.role_id);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("user_id", user.id);

      setCookie("role", user.role_id);

      // Routing logic (sesuaikan jika perlu)
      if (user.role_id == 1) {
        window.location.href = "/";
      } else if (user.role_id == 2) {
        window.location.href = "/mechanic-transaction";
      } else if (user.role_id == 3) {
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#007A33] px-4 relative overflow-hidden font-sans">
        {/* --- Background Pattern & Decor --- */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
            {/* Pattern titik-titik halus */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_3px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_3px)] bg-[size:30px_30px]"></div>
            {/* Icon Sekolah Raksasa di Background */}
            <School className="absolute -right-20 -bottom-20 text-white w-96 h-96 opacity-20 transform -rotate-12" />
        </div>

        {/* --- Main Card --- */}
        <div className="relative w-full max-w-md z-10">
            {/* Efek Glow di belakang card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-green-300 rounded-[2rem] blur opacity-30"></div>
            
            <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-[1.5rem] shadow-2xl p-8 relative overflow-hidden">
                
                {/* Header Section */}
                <div className="text-center mb-8 relative">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-50 p-4 rounded-2xl shadow-inner border border-green-100">
                             {/* Ganti dengan Logo Image Sekolah Anda */}
                            <Image
                                src="/images/logo/logo-sekolah.jpeg" 
                                alt="Cakra Buana Logo"
                                width={120}
                                height={120}
                                className="object-contain h-16 w-auto"
                                priority
                            />
                        </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100/50 border border-green-200 text-[#007A33] text-xs font-bold uppercase tracking-wider mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Portal
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Silakan login untuk mengelola sistem.
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={form.onSubmit(onSubmit)} className="space-y-5">
                    
                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007A33] transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                {...form.getInputProps("email")}
                                type="email"
                                placeholder="nama@cakrabuana.sch.id"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A33]/20 focus:border-[#007A33] transition-all text-gray-800 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007A33] transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                {...form.getInputProps("password")}
                                type={isPasswordVisible ? "text" : "password"}
                                placeholder="Masukkan password anda"
                                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A33]/20 focus:border-[#007A33] transition-all text-gray-800 placeholder-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#007A33] transition-colors p-1"
                            >
                                {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Error Alert Component */}
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 px-4 bg-[#007A33] hover:bg-[#00662b] text-white font-bold rounded-xl shadow-lg shadow-green-900/10 hover:shadow-green-900/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-[#007A33] flex items-center justify-center gap-2 ${
                            loading ? 'opacity-80 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? (
                             <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Copyright */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Sekolah Cakra Buana. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SignIn;