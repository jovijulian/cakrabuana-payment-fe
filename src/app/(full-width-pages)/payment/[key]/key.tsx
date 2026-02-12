'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    School,
    GraduationCap,
    ScrollText,
    CheckCircle2,
    AlertCircle,
    MessageCircle,
    CalendarDays,
    Banknote,
    ShieldCheck,
    ArrowRight,
    Copy,
    Loader2,
    X,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { endpointUrl, httpPost } from "@/../helpers";
import { Loading } from '@/components/loading/Loading';
import { FaWhatsapp } from 'react-icons/fa';
import moment from 'moment';

interface InstructionDetail {
    step: string;
    value: string;
}

interface Instruction {
    id: number;
    name: string;
    details: InstructionDetail[];
}

interface DetailItem {
    nama_tagihan: string;
    nominal: string;
}

interface PaymentData {
    no_faktur: string;
    sekolah: string;
    tahun_ajaran: string;
    kelas: string;
    nama_siswa: string;
    periode: string;
    total_tagihan: string;
    no_wa: string;
    status_bayar: string;
    detail: DetailItem[];
    url_payment: string | null;
    // Field Baru
    is_va: boolean;
    va: string;
    instructions: Instruction[];
}

export default function PaymentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const [activeInstruction, setActiveInstruction] = useState<number | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const getTheme = () => {
        const sekolah = data?.sekolah?.toLowerCase() || '';
        if (sekolah.includes('bintara')) {
            return {
                primary: 'bg-blue-700',
                primaryHover: 'hover:bg-blue-800',
                gradient: 'from-blue-700 via-blue-600 to-blue-900',
                text: 'text-blue-700',
                bgLight: 'bg-blue-50',
                borderLight: 'border-blue-100',
                shadow: 'shadow-blue-900/5',
                buttonText: 'Lihat Nomor VA & Cara Bayar'
            };
        }
        return {
            primary: 'bg-[#007A33]',
            primaryHover: 'hover:bg-[#006b2c]',
            gradient: 'from-[#007A33] via-[#006b2c] to-[#004d20]',
            text: 'text-[#007A33]',
            bgLight: 'bg-green-50',
            borderLight: 'border-green-100',
            shadow: 'shadow-green-900/5',
            buttonText: 'Bayar Sekarang'
        };
    };

    const theme = getTheme();

    const formatRupiah = (angka: string) => {
        const number = parseFloat(angka);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const getDetail = async () => {
        const paymentKey = params.key;
        if (!paymentKey) {
            setError("Link pembayaran tidak valid / kadaluarsa.");
            setLoading(false);
            return;
        }
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
        try {
            const payload = { key: paymentKey };
            const [response] = await Promise.all([
                httpPost(endpointUrl('transaction/detail-by-key'), payload),
                minLoadingTime
            ]);

            if (response.data && response.data.status === 200) {
                response.data.data.sekolah = 'Bintara'
                setData(response.data.data);
                setTimeout(() => setShowContent(true), 100);
            } else {
                setError(response.data.message || "Gagal memuat data tagihan");
            }
        } catch (error) {
            console.error(error);
            setError("Terjadi kesalahan jaringan saat memuat data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDetail();
    }, []);

    const handlePaymentAction = () => {
        if (!data) return;

        if (data.is_va) {
            setShowInstructionModal(true);
            return;
        }

        setProcessing(true);
        setTimeout(() => {
            if (data.url_payment) {
                window.open(data.url_payment, '_blank');
            } else {
                toast.error("Link pembayaran belum tersedia, silakan hubungi admin.");
            }
            setProcessing(false);
        }, 800);
    };

    const copyToClipboard = (text: string, label: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            toast.success(`${label} disalin!`);
        }
    }

    const toggleInstruction = (id: number) => {
        setActiveInstruction(activeInstruction === id ? null : id);
    };

    const handleConfirmPayment = () => {
        setPaymentSuccess(true);
    };

    const handleGoToLogin = () => {
        router.push('/signin');
    };

    if (loading) {
        return <Loading message='Memuat tagihan...' />;
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full border border-red-100">
                    <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="text-red-500 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
                    <p className="text-gray-600 mb-6">{error || "Data tidak ditemukan"}</p>
                </div>
            </div>
        );
    }

    const isLunas = data.status_bayar.toLowerCase() === 'lunas';

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32 font-sans">
            <div className={`relative bg-gradient-to-br ${theme.gradient} text-white pb-32 rounded-b-[3rem] shadow-xl overflow-hidden`}>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <School className="absolute -right-10 -top-10 w-[18rem] h-[18rem] text-white transform rotate-12 stroke-1" />
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-4">
                                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-100 font-medium text-xs uppercase tracking-widest">
                                    {data.sekolah} - Payment Portal
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{data.sekolah}</h1>
                            <p className="text-white/80 text-lg font-light mt-1">Tahun ajaran: {data.tahun_ajaran}</p>
                        </div>

                        <div className="hidden md:block text-right">
                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold backdrop-blur-md border border-white/20 ${isLunas ? 'bg-green-500/80 text-white' : `bg-white/90 ${theme.text}`
                                }`}>
                                {isLunas ? <CheckCircle2 className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
                                {data.status_bayar}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`relative z-20 max-w-7xl mx-auto px-4 -mt-20 transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-6">
                        <div className={`bg-white rounded-3xl p-6 md:p-8 border border-white/50 backdrop-blur-sm relative overflow-hidden group ${theme.shadow}`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${theme.bgLight} to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`bg-gradient-to-br ${theme.gradient} w-16 h-16 rounded-2xl flex items-center justify-center text-white`}>
                                        <GraduationCap className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 leading-tight">{data.nama_siswa}</h2>
                                        <p className="text-gray-500 font-medium">Kelas {data.kelas}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Nomor Faktur</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-800 font-mono font-bold text-sm truncate mr-2">{data.no_faktur}</p>
                                            <button onClick={() => copyToClipboard(data.no_faktur, 'No Faktur')} className={`${theme.text} hover:opacity-80 transition-colors p-1`} title="Salin Faktur">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`rounded-xl p-4 border flex items-center gap-3 ${isLunas ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                                        }`}>
                                        <div className={`p-2 rounded-lg ${isLunas ? 'bg-green-200' : 'bg-amber-200'}`}>
                                            {isLunas ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-80 uppercase font-bold">Status Pembayaran</p>
                                            <p className="font-bold">{data.status_bayar}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm pt-2">
                                        <span className="text-gray-500 flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4" /> Jatuh Tempo
                                        </span>
                                        <span className="font-bold text-gray-800">{moment(data.periode).format("DD/MM/YYYY")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className={`${theme.primary} text-white p-2 rounded-lg`}>
                                <ScrollText className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Rincian Pembayaran</h3>
                        </div>

                        <div className={`bg-white rounded-3xl shadow-xl ${theme.shadow} overflow-hidden border border-gray-100`}>
                            <div className="divide-y divide-gray-100">
                                {data.detail.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`group p-5 md:p-6 hover:${theme.bgLight} transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1.5 w-2 h-2 rounded-full bg-gray-300 group-hover:${theme.primary} transition-colors flex-shrink-0`}></div>
                                            <div>
                                                <p className="text-gray-800 font-medium text-lg leading-snug">{item.nama_tagihan}</p>
                                            </div>
                                        </div>
                                        <div className="text-right pl-6">
                                            <span className={`block font-bold text-gray-900 text-lg group-hover:${theme.text} transition-colors`}>
                                                {formatRupiah(item.nominal)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gray-50 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
                                <div className="text-gray-500 text-sm md:text-base font-medium">
                                    Total Tagihan Keseluruhan
                                </div>
                                <div className={`text-3xl font-bold ${theme.text}`}>
                                    {formatRupiah(data.total_tagihan)}
                                </div>
                            </div>
                        </div>

                        <div className="lg:hidden text-center py-4">
                            <a
                                href={`https://wa.me/${data.no_wa}`}
                                target="_blank"
                                className={`inline-flex items-center justify-center gap-2 w-full ${theme.bgLight} ${theme.text} px-4 py-3 rounded-xl font-bold transition-all`}
                            >
                                <FaWhatsapp className="w-5 h-5" />
                                Chat Admin Sekolah
                            </a>
                        </div>
                        <div className="text-center py-4">
                            <a
                                href="/signin"
                                className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all"
                            >
                                Lihat Riwayat Pembayaran
                            </a>
                        </div>

                    </div>
                </div>
            </div>

            <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t ${theme.borderLight} z-40`}>
                <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="hidden md:flex items-center gap-3">
                            <div className={`${theme.bgLight} p-3 rounded-full ${theme.text}`}>
                                <Banknote className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Total Pembayaran</p>
                                <p className={`text-xl font-bold ${theme.text}`}>{formatRupiah(data.total_tagihan)}</p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex gap-3">
                            <div className={`md:hidden flex-1 ${theme.bgLight} px-4 py-2 rounded-xl border ${theme.borderLight} flex flex-col justify-center`}>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Total</span>
                                <span className={`text-lg font-bold ${theme.text} leading-none`}>{formatRupiah(data.total_tagihan)}</span>
                            </div>

                            {!isLunas ? (
                                <button
                                    onClick={handlePaymentAction}
                                    disabled={processing}
                                    className={`flex-1 md:flex-none ${theme.primary} ${theme.primaryHover} text-white px-8 py-3 rounded-xl font-bold transform active:scale-95 transition-all flex items-center justify-center gap-3 min-w-[200px] shadow-lg`}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="animate-spin w-5 h-5" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{data.is_va ? 'Lihat Cara Bayar' : 'Bayar Sekarang'}</span>
                                            {data.is_va ? <ScrollText className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button disabled className="flex-1 md:flex-none bg-gray-100 text-gray-500 px-8 py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px] border border-gray-200">
                                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                                    Pembayaran Lunas
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showInstructionModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowInstructionModal(false)}
                    ></div>

                    <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 fade-in duration-300">
                        {paymentSuccess ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Terima Kasih!</h3>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Terima kasih atas pembayarannya.<br />
                                    Silakan login kembali dalam <strong>1x24 Jam</strong> untuk melihat status pembayaran Anda terupdate.
                                </p>
                                <button
                                    onClick={handleGoToLogin}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 ${theme.primary}`}
                                >
                                    Ke Halaman Login <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`${theme.bgLight} p-5 border-b ${theme.borderLight} flex justify-between items-center`}>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Instruksi Pembayaran</h3>
                                        <p className="text-xs text-gray-500">Virtual Account</p>
                                    </div>
                                    <button
                                        onClick={() => setShowInstructionModal(false)}
                                        className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="overflow-y-auto p-5 space-y-6">
                                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Nomor Virtual Account</p>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-2xl font-mono font-bold tracking-wider relative z-10">{data.va}</span>
                                            <button
                                                onClick={() => copyToClipboard(data.va, 'Nomor VA')}
                                                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors relative z-10"
                                            >
                                                <Copy className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                                            <span className="text-gray-400 text-sm">Total Tagihan</span>
                                            <span className="text-xl font-bold">{formatRupiah(data.total_tagihan)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <CreditCard className={`w-5 h-5 ${theme.text}`} />
                                            Metode Pembayaran
                                        </h4>
                                        <div className="space-y-3">
                                            {data.instructions.map((inst) => (
                                                <div key={inst.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                                    <button
                                                        onClick={() => toggleInstruction(inst.id)}
                                                        className={`w-full flex items-center justify-between p-4 text-left font-medium text-gray-700 hover:bg-gray-50 transition-colors ${activeInstruction === inst.id ? 'bg-gray-50' : ''}`}
                                                    >
                                                        <span>{inst.name}</span>
                                                        {activeInstruction === inst.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                    </button>

                                                    {activeInstruction === inst.id && (
                                                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-sm space-y-3">
                                                            {inst.details.map((step, idx) => (
                                                                <div key={step.step} className="flex gap-3">
                                                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.primary} text-white flex items-center justify-center text-xs font-bold mt-0.5`}>
                                                                        {idx + 1}
                                                                    </div>
                                                                    <p className="text-gray-600 leading-relaxed">{step.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                                    <button
                                        onClick={handleConfirmPayment}
                                        className={`w-full py-3.5 rounded-xl font-bold ${theme.primary} text-white shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all`}
                                    >
                                        <Check className="w-5 h-5" />
                                        Konfirmasi Pembayaran
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}