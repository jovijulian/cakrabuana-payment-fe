import React from 'react';
import {
    LayoutDashboard,
    CalendarClock,
    Car,
    Users,
    GitBranch,
    Home,
    FileText,
    Settings,
    School,
    LayoutList,
    GitPullRequestArrow,
    List,
    PlusCircle,
    Pin,
    Calendar,
    Database,
    Receipt,
    CircleUserRound,
    ShieldUser,
    Truck,
    Building2,
    Package,
    CreditCard,
    Navigation,
    UserCog,
    Archive,
    Gem,
    Coins,
    Diamond,
    PackageSearch,
    HeartHandshake,
    UserCheck,
    Users2,
    User2,
    BookText,
    Pointer,
    BookOpenCheck,
    LogOut,
} from 'lucide-react';
import { TbUserDollar } from 'react-icons/tb';
import { FaTags, FaWpforms } from 'react-icons/fa';

export type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    roles: number[];
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean, roles: number[] }[];
};

export const menuConfig: Record<string, NavItem[]> = {
    menu: [
        {
            name: 'Dashboard',
            icon: <LayoutDashboard />,
            path: '/admin/dashboard',
            roles: [1],
        },
        {
            name: 'Transaksi',
            icon: <Receipt />,
            path: '/admin/transactions',
            roles: [1],
        },
        {
            name: 'Riwayat Tagihan',
            icon: <Receipt />,
            path: '/student/payment-lists',
            roles: [2],
        },
        {
            name: 'Setting Akun',
            icon: <Settings />,
            path: '/profile',
            roles: [2],
        },
        {
            name: 'Sign Out',
            icon: <LogOut />,
            path: '/logout',
            roles: [2],
        },

    ],

};