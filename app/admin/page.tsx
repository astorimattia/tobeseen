'use client';

import { useState } from 'react';

interface Subscriber {
    email: string;
    timestamp: number;
    date: string;
}

interface AnalyticsData {
    overview: {
        views: number;
        visitors: number;
    };
    data: {
        pages: { name: string; value: number }[];
        countries: { name: string; value: number }[];
        referrers: { name: string; value: number }[];
    };
}

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' | 'analytics'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Fetch both concurrently
            const [subRes, analyticsRes] = await Promise.all([
                fetch(`/api/admin/subscribers?key=${password}`),
                fetch(`/api/admin/analytics?key=${password}`)
            ]);

            const subData = await subRes.json();
            const analyticsData = await analyticsRes.json();

            if (subRes.ok) {
                setSubscribers(subData.subscribers);
                setAnalytics(analyticsData);
                setIsAuthenticated(true);
            } else {
                setError(subData.error || 'Invalid credentials');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight">Admin Access</h1>
                        <p className="mt-2 text-gray-400">Enter secure key to view subscribers</p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Secret Key"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">{error}</div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Access Dashboard'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {activeTab === 'subscribers'
                                ? `Total Subscribers: ${subscribers.length}`
                                : `Today's Views: ${analytics?.overview?.views || 0}`}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        Logout
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-800 pb-2">
                    <button
                        onClick={() => setActiveTab('subscribers')}
                        className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'subscribers'
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        Subscribers
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'analytics'
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        Analytics (Today)
                    </button>
                </div>

                {activeTab === 'subscribers' ? (
                    <div className="bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-800">
                        <ul className="divide-y divide-gray-800">
                            {subscribers.map((sub) => (
                                <li key={sub.email} className="px-4 py-4 sm:px-6 hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-indigo-400 truncate">{sub.email}</p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100/10 text-green-400">
                                                Active
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-xs text-gray-500">
                                                Joined {sub.date}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Overview Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                                <p className="text-sm text-gray-400">Total Views</p>
                                <p className="text-2xl font-bold text-white">{analytics?.overview?.views || 0}</p>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                                <p className="text-sm text-gray-400">Unique Visitors</p>
                                <p className="text-2xl font-bold text-indigo-400">{analytics?.overview?.visitors || 0}</p>
                            </div>
                        </div>

                        {/* Top Lists */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Top Pages */}
                            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                                    <h3 className="text-sm font-medium text-white">Top Pages</h3>
                                </div>
                                <div className="p-4">
                                    {analytics && analytics.data.pages.length > 0 ? (
                                        <ul className="space-y-3">
                                            {analytics.data.pages.map((p, i) => (
                                                <li key={i} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-300 truncate">{p.name}</span>
                                                    <span className="text-sm font-mono text-gray-500">{p.value}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Top Countries */}
                            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                                    <h3 className="text-sm font-medium text-white">Top Locations</h3>
                                </div>
                                <div className="p-4">
                                    {analytics && analytics.data.countries.length > 0 ? (
                                        <ul className="space-y-3">
                                            {analytics.data.countries.map((p, i) => (
                                                <li key={i} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-300 truncate">{p.name}</span>
                                                    <span className="text-sm font-mono text-gray-500">{p.value}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
