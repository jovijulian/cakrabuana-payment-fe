"use client";
import React from 'react';
import { Award, Loader2 } from 'lucide-react';

interface LoadingProps {
    message?: string | null;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading' }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex flex-col items-center justify-center p-4">
            <div className="relative">
                <div className="absolute inset-0 bg-[#007A33] rounded-full animate-ping opacity-20"></div>
                <div className="relative bg-white p-4 rounded-full shadow-xl border-4 border-green-50">
                    <Loader2 className="h-8 w-8 text-[#007A33] animate-spin" />
                </div>
            </div>
            <div className="mt-6 text-center">
                <p className="text-[#007A33] font-bold text-xl animate-pulse">{message}</p>
                <span className="text-gray-500 mt-1 text-xs">Bintara - Cakra Buana - Payment Portal</span>
            </div>
            
        </div>

    );
};