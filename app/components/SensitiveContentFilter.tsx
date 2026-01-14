'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SensitiveContentFilterProps {
    onShowContent: () => void;
}

export default function SensitiveContentFilter({ onShowContent }: SensitiveContentFilterProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Sensitive Content Warning</h2>
                <p className="text-zinc-400 max-w-md">
                    This event contains graphic imagery that some viewers may find disturbing.
                    Viewer discretion is advised.
                </p>
            </div>

            <div className="flex items-center justify-center gap-3 w-full max-w-72">
                <button
                    onClick={() => router.back()}
                    className="font-heading rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer flex-1"
                >
                    Go Back
                </button>
                <button
                    onClick={onShowContent}
                    className="font-heading rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-zinc-200 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer flex-1"
                >
                    Show Content
                </button>
            </div>
        </div>
    );
}
