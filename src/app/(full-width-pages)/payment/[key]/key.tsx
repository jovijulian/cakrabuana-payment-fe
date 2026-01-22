'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
    Loader2 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { endpointUrl, httpPost } from "@/../helpers"; 
import moment from 'moment';

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
}

export default function PaymentDetailPage() {
    const params = useParams();
    const [data, setData] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showContent, setShowContent] = useState(false);

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

        try {
            const payload = { key: paymentKey };
            const response = await httpPost(endpointUrl('transaction/detail-by-key'), payload);

            if (response.data && response.data.status === 200) {
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

    const handlePayment = () => {
        if (!data) return;
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

    const copyFaktur = () => {
        if (data?.no_faktur) {
            navigator.clipboard.writeText(data.no_faktur);
            toast.success("No Faktur disalin!");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#A61C23] rounded-full animate-ping opacity-20"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-xl border-4 border-gray-100">
                        <Loader2 className="h-8 w-8 text-[#A61C23] animate-spin" />
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-[#A61C23] font-bold text-lg animate-pulse">Sekolah Cakra Buana</p>
                    <p className="text-gray-500 text-sm mt-1">Memuat rincian tagihan...</p>
                </div>
            </div>
        );
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
                    <p className="text-xs text-gray-400">Silakan minta link baru kepada admin sekolah.</p>
                </div>
            </div>
        );
    }

    const isLunas = data.status_bayar.toLowerCase() === 'lunas';

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32 font-sans">
            <div className="relative bg-gradient-to-br from-[#A61C23] via-[#85161C] to-[#5e0f13] text-white pb-32 rounded-b-[3rem] shadow-xl overflow-hidden">
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
                                    Cakra Buana - Payment Portal
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{data.sekolah}</h1>
                            <p className="text-white/80 text-lg font-light mt-1">{data.tahun_ajaran}</p>
                        </div>

                        <div className="hidden md:block text-right">
                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold shadow-lg backdrop-blur-md border border-white/20 ${isLunas ? 'bg-green-500/80 text-white' : 'bg-white/90 text-[#A61C23]'
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
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-white/50 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
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
                                            <button onClick={copyFaktur} className="text-blue-500 hover:text-blue-700 transition-colors p-1" title="Salin Faktur">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`rounded-xl p-4 border flex items-center gap-3 ${isLunas ? 'bg-green-50 border-green-100 text-green-700' : 'bg-orange-50 border-orange-100 text-orange-700'
                                        }`}>
                                        <div className={`p-2 rounded-lg ${isLunas ? 'bg-green-200' : 'bg-orange-200'}`}>
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

                        <div className="hidden lg:block bg-white/60 backdrop-blur rounded-2xl p-5 border border-white/50 text-center">
                            <p className="text-sm text-gray-500 mb-3">Mengalami kendala pembayaran?</p>
                            <a
                                href={`https://wa.me/${data.no_wa}`}
                                target="_blank"
                                className="inline-flex items-center justify-center gap-2 w-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 px-4 py-3 rounded-xl font-bold transition-all"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Chat Admin Sekolah
                            </a>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="bg-[#A61C23] text-white p-2 rounded-lg shadow-md">
                                <ScrollText className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Rincian Pembayaran</h3>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                            <div className="divide-y divide-gray-100">
                                {data.detail.map((item, index) => (
                                    <div
                                        key={index}
                                        className="group p-5 md:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-[#A61C23] transition-colors flex-shrink-0"></div>
                                            <div>
                                                <p className="text-gray-800 font-medium text-lg leading-snug">{item.nama_tagihan}</p>
                                                <p className="text-gray-400 text-xs mt-1 md:hidden">Tagihan Sekolah</p>
                                            </div>
                                        </div>
                                        <div className="text-right pl-6">
                                            <span className="block font-bold text-gray-900 text-lg group-hover:text-[#A61C23] transition-colors">
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
                                <div className="text-3xl font-bold text-[#A61C23]">
                                    {formatRupiah(data.total_tagihan)}
                                </div>
                            </div>
                        </div>

                        <div className="lg:hidden text-center py-4">
                            <p className="text-sm text-gray-500 mb-3">Mengalami kendala pembayaran?</p>
                            <a
                                href={`https://wa.me/${data.no_wa}`}
                                target="_blank"
                                className="inline-flex items-center justify-center gap-2 w-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 px-4 py-3 rounded-xl font-bold transition-all"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Chat Admin Sekolah
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="hidden md:flex items-center gap-3">
                            <div className="bg-gray-100 p-3 rounded-full text-gray-500">
                                <Banknote className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Total Pembayaran</p>
                                <p className="text-xl font-bold text-[#A61C23]">{formatRupiah(data.total_tagihan)}</p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex gap-3">
                            <div className="md:hidden flex-1 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 flex flex-col justify-center">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Total</span>
                                <span className="text-lg font-bold text-[#A61C23] leading-none">{formatRupiah(data.total_tagihan)}</span>
                            </div>

                            {!isLunas ? (
                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="flex-1 md:flex-none bg-[#A61C23] hover:bg-[#85161C] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:shadow-red-300 transform active:scale-95 transition-all flex items-center justify-center gap-3 min-w-[200px]"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="animate-spin w-5 h-5" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Bayar Sekarang</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button disabled className="flex-1 md:flex-none bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-200 cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Pembayaran Lunas
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}