import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORIES } from "../../../data/stories";
import ProtectedStoryContainer from "../../../components/ProtectedStoryContainer";

export default async function StoryPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params;
    const story = STORIES[eventId];

    if (!story) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md z-50">
                <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
                    <Link
                        href={`/work/${eventId}`}
                        className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        Back to Event
                    </Link>
                </div>
            </nav>

            <ProtectedStoryContainer story={story} />
        </main>
    );
}
