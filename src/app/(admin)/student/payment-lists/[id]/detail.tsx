"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    CalendarDays,
    FileText,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Clock,
    User,
    School,
    Download,
    Receipt,
    Copy,
    X,
    Wallet,
    ChevronUp,
    ChevronDown,
    UserCircle,
    Hash
} from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import { endpointUrl, httpPost, httpGet } from "@/../helpers";
import { Loading } from '@/components/loading/Loading';

interface NominalItem {
    rowid: string;
    no_faktur: string;
    Nama_Pembayaran: string;
    Nilai: string;
    kd_pembayaran: string;
}

interface TagihInfo {
    TagihId: string;
    sekolah: string;
    tahunajaran: string;
    kelas: string;
    Periode: string;
    Tanggal_Tagihan: string;
}

interface PaymentInfo {
    id: string;
    status_transaksi: string;
    pg_url_redirect: string | null;
    pg_payment_method: string;
    checkout_time: string;
}

interface DetailData {
    tagihId: string;
    no_faktur: string;
    regidsiswa: string;
    nama_siswa: string;
    totaltagih: string;
    status_bayar: string;
    tgl_bayar: string;
    VA: string;
    tagih: TagihInfo;
    nominals: NominalItem[];
    payments: PaymentInfo | null;
}

interface InstructionStep {
    step: string;
    value: string;
}

interface InstructionMethod {
    id: number;
    name: string;
    details: InstructionStep[];
}

export default function StudentPaymentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [detail, setDetail] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingInstructions, setLoadingInstructions] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [instructions, setInstructions] = useState<InstructionMethod[]>([]);
    const [activeInstructionId, setActiveInstructionId] = useState<number | null>(null);

    const theme = useMemo(() => {
        const school = detail?.tagih?.sekolah?.toLowerCase() || "";
        if (school.includes('cakra buana')) {
            return {
                primary: 'bg-[#007A33]',
                primaryText: 'text-[#007A33]',
                lightBg: 'bg-green-50',
                border: 'border-green-100',
                gradient: 'from-[#007A33] to-[#005c27]',
                badgePaid: 'bg-green-100 text-green-700 border-green-200',
                badgePending: 'bg-orange-100 text-orange-700 border-orange-200',
                badgeUnpaid: 'bg-red-50 text-red-600 border-red-100',
                button: 'bg-[#007A33] hover:bg-[#006b2c] text-white',
                buttonOutline: 'border border-[#007A33] text-[#007A33] hover:bg-green-50',
                iconBg: 'bg-green-100'
            };
        } else if (school.includes('bintara')) {
            return {
                primary: 'bg-blue-700',
                primaryText: 'text-blue-700',
                lightBg: 'bg-blue-50',
                border: 'border-blue-100',
                gradient: 'from-blue-700 to-blue-900',
                badgePaid: 'bg-blue-100 text-blue-700 border-blue-200',
                badgePending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                badgeUnpaid: 'bg-red-50 text-red-600 border-red-100',
                button: 'bg-blue-700 hover:bg-blue-800 text-white',
                buttonOutline: 'border border-blue-700 text-blue-700 hover:bg-blue-50',
                iconBg: 'bg-blue-100'
            };
        }
        return {
            primary: 'bg-gray-800',
            primaryText: 'text-gray-800',
            lightBg: 'bg-gray-50',
            border: 'border-gray-200',
            gradient: 'from-gray-800 to-black',
            badgePaid: 'bg-green-100 text-green-700 border-green-200',
            badgePending: 'bg-orange-100 text-orange-700 border-orange-200',
            badgeUnpaid: 'bg-red-50 text-red-600 border-red-100',
            button: 'bg-gray-800 hover:bg-gray-900 text-white',
            buttonOutline: 'border border-gray-800 text-gray-800 hover:bg-gray-50',
            iconBg: 'bg-gray-100'
        };
    }, [detail]);

    const formatRupiah = (angka: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(Number(angka));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Disalin ke clipboard!");
    };

    useEffect(() => {
        const fetchDetail = async () => {
            if (!params.id) return;
            let noFaktur = "";
            try {
                noFaktur = atob(decodeURIComponent(params.id as string));
            } catch (e) {
                console.error("Gagal decode ID", e);
                toast.error("ID Tagihan tidak valid");
                router.back();
                return;
            }
            setLoading(true);
            try {
                const response = await httpPost(endpointUrl('history-transaction'), { no_faktur: noFaktur }, true);
                if (response.data && response.data.status === 200) {
                    setDetail(response.data.data);
                } else {
                    toast.error(response.data.message || "Gagal memuat detail.");
                    router.back();
                }
            } catch (error) {
                console.error(error);
                toast.error("Terjadi kesalahan koneksi.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [params.id, router]);

    const fetchInstructions = async () => {
        setLoadingInstructions(true);
        if (instructions.length > 0) return;
        try {
            const response = await httpGet(endpointUrl('instruction-payment'), true);
            if (response.data && response.data.status === 200) {
                setInstructions(response.data.data.instructions);
            }
        } catch (error) { console.error(error); }
        finally { setLoadingInstructions(false); }
    };

    const getStatus = () => {
        if (!detail) return { label: '-', icon: AlertCircle, className: '' };
        const isPaid = detail.status_bayar?.toLowerCase() === 'lunas' || detail.payments?.status_transaksi === '2';

        if (isPaid) return { label: 'Lunas', icon: CheckCircle2, className: theme.badgePaid, isPaid: true };
        if (detail.payments?.status_transaksi === '1') return { label: 'Menunggu Pembayaran', icon: Clock, className: theme.badgePending, isPaid: false };
        return { label: 'Belum Lunas', icon: AlertCircle, className: theme.badgeUnpaid, isPaid: false };
    };

    const handlePay = async () => {
        if (!detail) return;
        if (detail.VA && detail.VA !== "") {
            setShowModal(true);
            await fetchInstructions();
            return;
        }
        if (detail.payments?.pg_url_redirect) {
            window.open(detail.payments.pg_url_redirect, '_blank');
            return;
        }
        toast.info("Metode pembayaran belum tersedia.");
    };

    if (loading) return <Loading message="Memuat detail..." />;
    if (!detail) return null;

    const status = getStatus();
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 font-sans">
            <div className={`relative bg-gradient-to-br ${theme.gradient} text-white pb-32 pt-8 rounded-b-[2.5rem] shadow-xl overflow-hidden`}>
                <School className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white opacity-10 rotate-12" />

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => router.back()}
                            className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all border border-white/10 group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <h1 className="text-lg font-bold tracking-wide text-white/90">Detail Tagihan</h1>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <School className="w-3.5 h-3.5" />
                                    {detail.tagih.sekolah}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 bg-white text-gray-800 shadow-sm`}>
                                    <StatusIcon className={`w-3.5 h-3.5 ${status.isPaid ? 'text-green-600' : 'text-orange-500'}`} />
                                    {status.label}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                {detail.tagih.Periode ? moment(detail.tagih.Periode).format("MMMM YYYY") : "-"}
                            </h2>

                            <div className="flex items-center gap-2 text-white/80">
                                <UserCircle className="w-5 h-5" />
                                <span className="font-medium text-lg">{detail.nama_siswa}</span>
                                <span className="opacity-60 text-sm mx-1">•</span>
                                <span className="opacity-90">{detail.tagih.kelas}</span>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[220px]">
                            <p className="text-xs text-white/70 uppercase font-semibold mb-1">Total Tagihan</p>
                            <p className="text-2xl font-bold">{formatRupiah(detail.totaltagih)}</p>
                        </div>

                    </div>

                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${theme.lightBg} ${theme.primaryText}`}>
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Rincian Pembayaran</h3>
                                    <p className="text-xs text-gray-500">Daftar item tagihan periode ini</p>
                                </div>
                            </div>

                            {detail.nominals.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {detail.nominals.map((item, idx) => (
                                        <div key={idx} className="p-5 flex justify-between items-center hover:bg-gray-50/50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${theme.primary} group-hover:scale-125 transition-transform`}></div>
                                                <span className="font-medium text-gray-700">{item.Nama_Pembayaran}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{formatRupiah(item.Nilai)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center text-gray-400 italic">Tidak ada rincian item.</div>
                            )}

                            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">Subtotal</span>
                                <span className={`font-bold text-lg ${theme.primaryText}`}>{formatRupiah(detail.totaltagih)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                Informasi Faktur
                            </h4>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Nomor Faktur</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">{detail.no_faktur}</span>
                                        <button onClick={() => copyToClipboard(detail.no_faktur)} className="text-gray-400 hover:text-blue-500 transition-colors">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">ID Siswa</span>
                                    <span className="font-medium text-gray-700">{detail.regidsiswa}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Tahun Ajaran</span>
                                    <span className="font-medium text-gray-700">{detail.tagih.tahunajaran}</span>
                                </div>

                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-6">
                            <p className="text-sm text-gray-500 font-medium mb-1">Total yang harus dibayar</p>
                            <p className={`text-3xl font-extrabold ${theme.primaryText} mb-6`}>
                                {formatRupiah(detail.totaltagih)}
                            </p>

                            {!status.isPaid ? (
                                <button
                                    onClick={handlePay}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-gray-200 flex items-center justify-center gap-2 transition-all transform active:scale-95 ${theme.button}`}
                                >
                                    <CreditCard className="w-5 h-5" />
                                    {detail.VA ? 'Lihat Virtual Account' : 'Bayar Sekarang'}
                                </button>
                            ) : (
                                <div className="w-full py-4 rounded-xl font-bold bg-gray-50 text-green-600 border border-green-200 flex items-center justify-center gap-2 cursor-default">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Pembayaran Lunas
                                </div>
                            )}

                            {/* <p className="text-xs text-center text-gray-400 mt-4 px-4">
                                {status.isPaid 
                                    ? `Lunas pada ${detail.tgl_bayar !== "0000-00-00 00:00:00" ? moment(detail.tgl_bayar).format("DD MMM YYYY") : "-"}` 
                                    : "Pastikan pembayaran dilakukan sebelum tanggal jatuh tempo untuk menghindari denda."
                                }
                            </p> */}
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">
                        <div className={`${theme.lightBg} p-5 border-b border-gray-200 flex justify-between items-center`}>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Pembayaran Virtual Account</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Metode pembayaran otomatis</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6 space-y-6">
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Nomor Virtual Account</p>
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <span className="text-xl font-mono font-bold tracking-wider">{detail.VA}</span>
                                        <button onClick={() => copyToClipboard(detail.VA)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-colors backdrop-blur-sm">
                                            <Copy className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Total Tagihan</span>
                                        <span className="text-xl font-bold">{formatRupiah(detail.totaltagih)}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Wallet className={`w-5 h-5 ${theme.primaryText}`} />
                                    Cara Pembayaran
                                </h4>
                                {loadingInstructions ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>)}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {instructions.map((inst) => (
                                            <div key={inst.id} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
                                                <button
                                                    onClick={() => setActiveInstructionId(activeInstructionId === inst.id ? null : inst.id)}
                                                    className={`w-full flex items-center justify-between p-4 text-left font-medium text-gray-700 hover:bg-gray-50 transition-colors ${activeInstructionId === inst.id ? 'bg-gray-50 text-gray-900' : ''}`}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <span className={`w-2 h-2 rounded-full ${activeInstructionId === inst.id ? theme.primary : 'bg-gray-300'}`}></span>
                                                        {inst.name}
                                                    </span>
                                                    {activeInstructionId === inst.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                </button>
                                                {activeInstructionId === inst.id && (
                                                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
                                                        {inst.details.map((step, idx) => (
                                                            <div key={idx} className="flex gap-3">
                                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.primary} text-white flex items-center justify-center text-xs font-bold mt-0.5`}>{idx + 1}</div>
                                                                <p className="text-gray-600 leading-relaxed pt-0.5">{step.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {instructions.length === 0 && <p className="text-gray-500 text-center italic py-4 text-sm">Instruksi belum tersedia.</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-100 bg-gray-50 text-center">
                            <button onClick={() => setShowModal(false)} className={`w-full py-3.5 rounded-xl font-bold ${theme.button} shadow-lg shadow-gray-300/50 transition-transform active:scale-[0.98]`}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}