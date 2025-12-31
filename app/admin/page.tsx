'use client';

import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

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
        chart?: { date: string; views: number; visitors: number }[];
        pages: { name: string; value: number }[];
        countries: { name: string; value: number }[];
        referrers: { name: string; value: number }[];
        recentVisitors?: {
            id: string;
            ip?: string;
            country?: string;
            city?: string;
            userAgent?: string;
            lastSeen: string;
            email?: string;
        }[];
    };
}

const getCountryName = (code: string) => {
    try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        return regionNames.of(code) || code;
    } catch {
        return code;
    }
};

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [activeTab, setActiveTab] = useState('analytics'); // 'subscribers' | 'analytics'
    const [timeRange, setTimeRange] = useState('0'); // '0' = Today, '7', '30', 'all'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Subscriber; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    const sortedSubscribers = [...subscribers].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const requestSort = (key: keyof Subscriber) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // helper to set cookie
    const setCookie = (name: string, value: string, days: number) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    };

    // helper to get cookie
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const verifyAndLoad = async (pwd: string) => {
        setLoading(true);
        setError('');

        try {
            // Build date range
            const end = new Date();
            const start = new Date();

            let from, to;
            if (timeRange === 'all') {
                from = 'all';
                to = end.toISOString().slice(0, 10);
            } else {
                start.setDate(start.getDate() - parseInt(timeRange));
                to = end.toISOString().slice(0, 10);
                from = start.toISOString().slice(0, 10);
            }

            // Fetch both concurrently
            const [subRes, analyticsRes] = await Promise.all([
                fetch(`/api/admin/subscribers?key=${pwd}`),
                fetch(`/api/admin/analytics?key=${pwd}&from=${from}&to=${to}`)
            ]);

            const subData = await subRes.json();
            const analyticsData = await analyticsRes.json();

            if (subRes.ok) {
                setSubscribers(subData.subscribers);
                setAnalytics(analyticsData);
                setIsAuthenticated(true);
                setPassword(pwd); // Sync state
                setCookie('admin_secret', pwd, 30); // Persist login
            } else {
                setError(subData.error || analyticsData.error || 'Invalid credentials');
                // If invalid, clear cookie
                setCookie('admin_secret', '', -1);
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    // Initial load: Check URL param or Cookie
    useEffect(() => {
        if (isAuthenticated) return; // Don't run if already logged in

        const params = new URLSearchParams(window.location.search);
        const urlSecret = params.get('secret');
        const cookieSecret = getCookie('admin_secret');

        if (urlSecret) {
            verifyAndLoad(urlSecret);
        } else if (cookieSecret) {
            verifyAndLoad(cookieSecret);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refresh analytics when timeRange changes
    useEffect(() => {
        if (isAuthenticated && password) {
            verifyAndLoad(password);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        verifyAndLoad(password);
    };

    const handleLogout = () => {
        setCookie('admin_secret', '', -1);
        window.location.href = '/admin'; // Hard reload to clear state
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
                                : `Views${timeRange === 'all' ? ' (All Time)' : timeRange === '0' ? '' : ` (Last ${timeRange} Days)`}: ${analytics?.overview?.views || 0}`}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        Logout
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-2 mb-6 gap-4">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'analytics'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('subscribers')}
                            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'subscribers'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            Subscribers
                        </button>
                    </div>

                    {activeTab === 'analytics' && (
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-white text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                        >
                            <option value="0">Today</option>
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                    )}
                </div>

                {activeTab === 'subscribers' ? (
                    <div className="bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-800">
                        <div className="px-4 py-3 border-b border-gray-800 flex justify-between bg-gray-800/50">
                            <button onClick={() => requestSort('email')} className="text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white flex items-center gap-1">
                                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </button>
                            <button onClick={() => requestSort('date')} className="text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white flex items-center gap-1">
                                Joined {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-800">
                            {sortedSubscribers.map((sub) => (
                                <li key={sub.email} className="px-4 py-4 sm:px-6 hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <a href={`mailto:${sub.email}`} className="text-sm font-medium text-indigo-400 truncate hover:text-indigo-300">{sub.email}</a>
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

                        {/* Traffic Chart */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                                <h3 className="text-sm font-medium text-white">Traffic Overview</h3>
                            </div>
                            <div className="p-4 h-72">
                                {analytics?.data?.chart && analytics.data.chart.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={analytics.data.chart}
                                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#9ca3af"
                                                fontSize={12}
                                                tickFormatter={(str) => {
                                                    const date = new Date(str);
                                                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                                }}
                                            />
                                            <YAxis stroke="#9ca3af" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                                                itemStyle={{ color: '#f3f4f6' }}
                                                labelStyle={{ color: '#9ca3af' }}
                                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="views"
                                                stroke="#818cf8"
                                                fillOpacity={1}
                                                fill="url(#colorViews)"
                                                name="Total Views"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="visitors"
                                                stroke="#34d399"
                                                fillOpacity={1}
                                                fill="url(#colorVisitors)"
                                                name="Unique Visitors"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                        No chart data available
                                    </div>
                                )}
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
                                                    <span className="text-sm text-gray-300 truncate">{getCountryName(p.name)}</span>
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

                        {/* Recent Visitors Table */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                                <h3 className="text-sm font-medium text-white">Recent/Identified Visitors</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm whitespace-nowrap">
                                    <thead className="text-gray-400 border-b border-gray-800">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Identity (Email)</th>
                                            <th className="px-4 py-3 font-medium">IP Address</th>
                                            <th className="px-4 py-3 font-medium">Location</th>
                                            <th className="px-4 py-3 font-medium">Last Seen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {(analytics && analytics.data.recentVisitors && analytics.data.recentVisitors.length > 0) ? (
                                            analytics.data.recentVisitors.map((v, i) => (
                                                <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-indigo-400">
                                                        {v.email ? (
                                                            <span className="font-bold">{v.email}</span>
                                                        ) : (
                                                            <span className="text-gray-600 italic">Anonymous</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{v.ip}</td>
                                                    <td className="px-4 py-3 text-gray-300">
                                                        {v.country ? getCountryName(v.country) : 'Unknown'}
                                                        {v.city && v.city !== 'unknown' && <span className="text-gray-500 text-xs ml-1">({v.city})</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(v.lastSeen).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                                    No recent visitor data
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
