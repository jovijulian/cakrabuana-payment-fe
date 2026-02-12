"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    School,
    CalendarDays,
    FileText,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Clock,
    Search,
    ChevronRight,
    UserCircle,
    Receipt,
    ChevronLeft,
    X,
    Copy,
    ChevronDown,
    ChevronUp,
    Wallet
} from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import { endpointUrl, httpGet } from "@/../helpers";
import { Loading } from '@/components/loading/Loading';
import _ from 'lodash';

interface PaymentDetails {
    id: string;
    tagih_id: string;
    no_faktur: string;
    checkout_time: string;
    nominal_total: string;
    status_transaksi: string;
    pg_payment_method: string;
    pg_url_redirect: string | null;
}

interface TagihDetails {
    TagihId: string;
    sekolah: string;
    tahunajaran: string;
    kelas: string;
    Periode: string;
    Tanggal_Tagihan: string;
}

interface TransactionItem {
    tagihId: string;
    no_faktur: string;
    regidsiswa: string;
    nama_siswa: string;
    totaltagih: string;
    status_bayar: string;
    tgl_bayar: string;
    VA: string;
    tagih: TagihDetails;
    payments: PaymentDetails | null;
}

interface PaginationInfo {
    total_record: number;
    size_per_page: number;
    current_page: number;
    total_pages: number;
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

export default function StudentPaymentListPage() {
    const router = useRouter();
    const [data, setData] = useState<TransactionItem[]>([]);
    const [schoolName, setSchoolName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10); 
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TransactionItem | null>(null);
    const [instructions, setInstructions] = useState<InstructionMethod[]>([]);
    const [loadingInstructions, setLoadingInstructions] = useState(false);
    const [activeInstructionId, setActiveInstructionId] = useState<number | null>(null);

    const theme = useMemo(() => {
        const school = schoolName.toLowerCase();
        if (school.includes('cakra buana')) {
            return {
                primary: 'bg-[#007A33]',
                primaryText: 'text-[#007A33]',
                lightBg: 'bg-green-50',
                border: 'border-green-100',
                gradient: 'from-[#007A33] to-[#005c27]',
                badgePaid: 'bg-green-100 text-green-700 border-green-200',
                badgePending: 'bg-orange-100 text-orange-700 border-orange-200',
                button: 'bg-[#007A33] hover:bg-[#006b2c] text-white',
                buttonOutline: 'border border-[#007A33] text-[#007A33] hover:bg-green-50'
            };
        } else if (school.includes('bintara')) {
            return {
                primary: 'bg-blue-700',
                primaryText: 'text-blue-700',
                lightBg: 'bg-blue-50',
                border: 'border-blue-100',
                gradient: 'from-blue-700 via-blue-600 to-blue-900',
                badgePaid: 'bg-blue-100 text-blue-700 border-blue-200',
                badgePending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                primaryHover: 'hover:bg-blue-800',
                button: 'bg-blue-700 hover:bg-blue-800 text-white',
                buttonOutline: 'border border-blue-700 text-blue-700 hover:bg-blue-50'
            };
        }
        return {
            primary: 'bg-[#007A33]',
            primaryText: 'text-[#007A33]',
            lightBg: 'bg-green-50',
            border: 'border-green-100',
            gradient: 'from-[#007A33] to-[#005c27]',
            badgePaid: 'bg-green-100 text-green-700 border-green-200',
            badgePending: 'bg-orange-100 text-orange-700 border-orange-200',
            button: 'bg-[#007A33] hover:bg-[#006b2c] text-white',
            buttonOutline: 'border border-[#007A33] text-[#007A33] hover:bg-green-50'
        };
    }, [schoolName]);

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
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 600);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', perPage.toString());
            if (debouncedSearch) params.append('search', debouncedSearch);

            const response = await httpGet(endpointUrl(`history-transaction?${params.toString()}`), true);

            if (response.data && response.data.status === 200) {
                const result = response.data.data;
                setSchoolName(result.nama_sekolah || "Cakra Buana");
                setData(result.data || []);
                setPagination(result.page_info);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data transaksi.");
        } finally {
            setLoading(false);
        }
    }, [page, perPage, debouncedSearch]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const fetchInstructions = async () => {
        if (instructions.length > 0) return; 
        setLoadingInstructions(true);
        try {
            const response = await httpGet(endpointUrl('instruction-payment'), true);
            if (response.data && response.data.status === 200) {
                setInstructions(response.data.data.instructions);
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat instruksi pembayaran.");
        } finally {
            setLoadingInstructions(false);
        }
    };

    const getStatus = (item: TransactionItem) => {
        const isPaid = item.status_bayar?.toLowerCase() === 'lunas' || item.payments?.status_transaksi === '2';

        if (isPaid) {
            return { label: 'Lunas', icon: CheckCircle2, className: theme.badgePaid, isPaid: true };
        }
        if (item.payments?.status_transaksi === '1') {
            return { label: 'Menunggu', icon: Clock, className: theme.badgePending, isPaid: false };
        }

        return { label: 'Belum Lunas', icon: AlertCircle, className: 'bg-red-50 text-red-600 border-red-100', isPaid: false };
    };

    const handlePayAction = async (e: React.MouseEvent, item: TransactionItem) => {
        e.stopPropagation();
        if (item.VA && item.VA !== "") {
            setSelectedItem(item);
            setShowModal(true);
            await fetchInstructions();
            return;
        }

        if (item.payments?.pg_url_redirect) {
            window.open(item.payments.pg_url_redirect, '_blank');
            return;
        }

        toast.info("Link pembayaran belum tersedia.");
    };

    const toggleInstruction = (id: number) => {
        setActiveInstructionId(activeInstructionId === id ? null : id);
    };

    const goToDetail = (noFaktur: string) => {
        const safeId = encodeURIComponent(btoa(noFaktur));
        
        router.push(`/student/payment-lists/${safeId}`);
    };


    if (loading && page === 1 && data.length === 0) return <Loading message="Memuat Daftar Tagihan..." />;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 font-sans">
            <div className={`relative bg-gradient-to-br ${theme.gradient} text-white pb-32 pt-12 rounded-b-[2.5rem] shadow-xl overflow-hidden`}>
                <School className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white opacity-10 rotate-12" />
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2 bg-white/20 backdrop-blur-sm w-fit px-3 py-1 rounded-full border border-white/10">
                                <School className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{schoolName}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Riwayat Tagihan</h1>
                            {data.length > 0 && (
                                <div className="flex items-center gap-2 mt-2 text-white/90">
                                    <UserCircle className="w-5 h-5" />
                                    <span className="text-lg font-medium">{data[0].nama_siswa}</span>
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-auto relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari Faktur / Periode..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-80 pl-10 pr-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 shadow-lg focus:ring-4 focus:ring-white/20 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-20 relative z-20">

                {data.length === 0 && !loading ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100 flex flex-col items-center">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                            <Receipt className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Tidak ada tagihan ditemukan</h3>
                        <p className="text-gray-500 mt-1 max-w-md">Tidak ada data yang cocok dengan pencarian Anda. Coba kata kunci lain atau hubungi admin sekolah.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map((item, index) => {
                            const status = getStatus(item);
                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={index}
                                    onClick={() => goToDetail(item.no_faktur)}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col h-full"
                                >
                                    <div className="p-5 border-b border-gray-50">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-2.5 rounded-xl ${theme.lightBg} ${theme.primaryText}`}>
                                                <CalendarDays className="w-6 h-6" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1.5 ${status.className}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                                            {moment(item.tagih.Periode).format("MMMM YYYY")}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> #{item.no_faktur}
                                        </p>
                                    </div>
                                    <div className="p-5 flex-grow flex flex-col justify-between">
                                        <div className="space-y-3 mb-5">
                                            <div className="flex justify-between text-sm items-center border-b border-dashed border-gray-100 pb-2">
                                                <span className="text-gray-500">Tahun Ajaran</span>
                                                <span className="font-semibold text-gray-700">{item.tagih.tahunajaran}</span>
                                            </div>
                                            <div className="flex justify-between text-sm items-center border-b border-dashed border-gray-100 pb-2">
                                                <span className="text-gray-500">Kelas</span>
                                                <span className="font-semibold text-gray-700">{item.tagih.kelas}</span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">Total Tagihan</p>
                                            <div className={`text-2xl font-extrabold ${theme.primaryText}`}>
                                                {formatRupiah(item.totaltagih)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                        <button className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${theme.buttonOutline}`}>
                                            Detail
                                        </button>

                                        {!status.isPaid ? (
                                            <button
                                                onClick={(e) => handlePayAction(e, item)}
                                                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-gray-200 hover:shadow-md transition-all ${theme.button}`}
                                            >
                                                {item.VA ? 'Lihat VA' : 'Bayar'} <ArrowRight className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <div className="flex-1 py-2.5 text-center text-xs text-green-600 font-bold bg-green-50 rounded-xl flex items-center justify-center gap-1 border border-green-100">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {pagination && pagination.total_pages > 1 && (
                    <div className="mt-10 flex justify-center items-center gap-6 pb-10">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-gray-600"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <span className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                            Halaman <span className="font-bold text-gray-900">{page}</span> dari {pagination.total_pages}
                        </span>

                        <button
                            disabled={page === pagination.total_pages}
                            onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                            className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-gray-600"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
            {showModal && selectedItem && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowModal(false)}
                    ></div>

                    <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">
                        {/* Modal Header */}
                        <div className={`${theme.lightBg} p-5 border-b border-gray-200 flex justify-between items-center`}>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Pembayaran Virtual Account</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Segera lakukan pembayaran sebelum jatuh tempo</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>

                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Nomor Virtual Account</p>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xl font-mono font-bold tracking-wider relative z-10">{selectedItem.VA}</span>
                                    <button
                                        onClick={() => copyToClipboard(selectedItem.VA,)}
                                        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors relative z-10"
                                    >
                                        <Copy className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                                    <span className="text-gray-400 text-sm">Total Tagihan</span>
                                    <span className="text-xl font-bold">{formatRupiah(selectedItem.totaltagih)}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Wallet className={`w-5 h-5 ${theme.primaryText}`} />
                                    Cara Pembayaran
                                </h4>

                                {loadingInstructions ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {instructions.map((inst) => (
                                            <div key={inst.id} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
                                                <button
                                                    onClick={() => toggleInstruction(inst.id)}
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
                                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.primary} text-white flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm`}>
                                                                    {idx + 1}
                                                                </div>
                                                                <p className="text-gray-600 leading-relaxed pt-0.5">{step.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {instructions.length === 0 && (
                                            <p className="text-gray-500 text-center italic py-4 text-sm">Instruksi pembayaran belum tersedia.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50 text-center">
                            <button
                                onClick={() => setShowModal(false)}
                                className={`w-full py-3.5 rounded-xl font-bold ${theme.button} shadow-lg shadow-gray-300/50 transition-transform active:scale-[0.98]`}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}