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
    country?: string;
    city?: string;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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
        cities: { name: string; value: number }[];
        referrers: { name: string; value: number }[];
        topVisitors?: {
            id: string;
            value: number;
            email: string | null;
            ip: string | null;
            country?: string | null;
            city?: string | null;
        }[];
        recentVisitors?: {
            id: string;
            ip?: string;
            country?: string;
            city?: string;
            userAgent?: string;
            lastSeen: string;
            email?: string;
        }[];
        pagination?: PaginationMeta;
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
    const [subPagination, setSubPagination] = useState<PaginationMeta | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [activeTab, setActiveTab] = useState('analytics'); // 'subscribers' | 'analytics'
    const [timeRange, setTimeRange] = useState('7'); // '0' = Today, '7', '30', 'all'
    const [subPage, setSubPage] = useState(1);
    const [visitorPage, setVisitorPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Subscriber; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [countryPage, setCountryPage] = useState(1);
    const [cityPage, setCityPage] = useState(1);
    const [pagesPage, setPagesPage] = useState(1);
    const [visitorsPage, setVisitorsPage] = useState(1);



    const sortedSubscribers = [...subscribers].sort((a, b) => {
        const valA = (a[sortConfig.key] || '').toString().toLowerCase();
        const valB = (b[sortConfig.key] || '').toString().toLowerCase();

        if (valA < valB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
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

    const verifyAndLoad = async (pwd: string, subP = subPage, visP = visitorPage) => {
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
            // Add cache: 'no-store' to prevent stale data
            const headers = { 'Cache-Control': 'no-store' };
            const analyticsUrl = `/api/admin/analytics?key=${pwd}&from=${from}&to=${to}&visitorPage=${visP}&visitorLimit=15${selectedCountry ? `&country=${encodeURIComponent(selectedCountry)}` : ''}`;

            const [subRes, analyticsRes] = await Promise.all([
                fetch(`/api/admin/subscribers?key=${pwd}&page=${subP}&limit=15`, { headers, cache: 'no-store' }),
                fetch(analyticsUrl, { headers, cache: 'no-store' })
            ]);

            const subData = await subRes.json();
            const analyticsData = await analyticsRes.json();

            if (subRes.ok) {
                setSubscribers(subData.subscribers);
                setSubPagination(subData.pagination);
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

    // Refresh when timeRange or pages change
    useEffect(() => {
        if (isAuthenticated && password) {
            verifyAndLoad(password, subPage, visitorPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange, subPage, visitorPage, selectedCountry]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        verifyAndLoad(password);
    };

    const handleLogout = () => {
        setCookie('admin_secret', '', -1);
        window.location.href = '/admin'; // Hard reload to clear state
    };

    const PaginationControls = ({ meta, onPageChange }: { meta: PaginationMeta, onPageChange: (p: number) => void }) => {
        if (!meta || meta.totalPages <= 1) return null;

        // Generate page numbers to show (e.g. 1, 2, 3 ... 10)
        // Simple logic: always show first, last, and current +/- 1
        // Generate page numbers to show (e.g. 1, 2, 3 ... 10)
        // Simple logic: always show first, last, and current +/- 1
        const getPageNumbers = () => {
            const pages = [];
            const { page, totalPages } = meta;

            if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
                // Always include 1
                pages.push(1);

                if (page > 3) pages.push('...');

                // Neighbors
                const start = Math.max(2, page - 1);
                const end = Math.min(totalPages - 1, page + 1);

                for (let i = start; i <= end; i++) {
                    if (i > 1 && i < totalPages) pages.push(i);
                }

                if (page < totalPages - 2) pages.push('...');

                // Always include last
                if (totalPages > 1) pages.push(totalPages);
            }
            return pages;
        };

        const pages = getPageNumbers();

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-t border-gray-800">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => onPageChange(Math.max(1, meta.page - 1))}
                        disabled={meta.page === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="text-sm text-gray-400 self-center">
                        {meta.page} / {meta.totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(Math.min(meta.totalPages, meta.page + 1))}
                        disabled={meta.page === meta.totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-400">
                            Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-medium">{meta.total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => onPageChange(Math.max(1, meta.page - 1))}
                                disabled={meta.page === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Previous</span>
                                <span className="h-5 w-5" aria-hidden="true">&lsaquo;</span>
                            </button>

                            {pages.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => typeof p === 'number' ? onPageChange(p) : null}
                                    disabled={typeof p !== 'number'}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${p === meta.page
                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-default'
                                        : 'text-gray-300 ring-1 ring-inset ring-gray-700 hover:bg-gray-800 focus:outline-offset-0 cursor-pointer'
                                        } ${typeof p !== 'number' ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                onClick={() => onPageChange(Math.min(meta.totalPages, meta.page + 1))}
                                disabled={meta.page === meta.totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Next</span>
                                <span className="h-5 w-5" aria-hidden="true">&rsaquo;</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
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
                                ? `Total Subscribers: ${subPagination?.total || subscribers.length}`
                                : `Views${timeRange === 'all' ? ' (All Time)' : timeRange === '0' ? '' : ` (Last ${timeRange} Days)`}: ${analytics?.overview?.views || 0}`}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-400 hover:text-white cursor-pointer"
                    >
                        Logout
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-2 mb-6 gap-4">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`text-sm font-medium pb-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'analytics'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('subscribers')}
                            className={`text-sm font-medium pb-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'subscribers'
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
                    <div className="bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-800 flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-800 flex justify-between bg-gray-800/50">
                            <button onClick={() => requestSort('email')} className="text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white flex items-center gap-1 cursor-pointer">
                                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </button>
                            <button onClick={() => requestSort('date')} className="text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white flex items-center gap-1 cursor-pointer">
                                Joined {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-800 flex-1">
                            {sortedSubscribers.map((sub) => (
                                <li key={sub.email} className="px-4 py-4 sm:px-6 hover:bg-gray-800/50 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                        {/* Email */}
                                        <a href={`mailto:${sub.email}`} className="text-sm font-medium text-indigo-400 truncate hover:text-indigo-300 flex-1">{sub.email}</a>

                                        {/* Details Horizontal */}
                                        <div className="flex items-center text-xs text-gray-500 gap-4">
                                            <span>Joined {sub.date}</span>
                                            {(sub.city || sub.country) && (sub.city !== 'Unknown' || sub.country !== 'Unknown') && (
                                                <span className="flex items-center">
                                                    {sub.city && sub.city !== 'Unknown' ? decodeURIComponent(sub.city) : ''}
                                                    {sub.city && sub.city !== 'Unknown' && sub.country && sub.country !== 'Unknown' ? ', ' : ''}
                                                    {sub.country && sub.country !== 'Unknown' ? getCountryName(sub.country) : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {sortedSubscribers.length === 0 && (
                                <li className="px-4 py-8 text-center text-gray-500 text-sm">No subscribers found</li>
                            )}
                        </ul>
                        {/* Subscriber Pagination */}
                        {subPagination && <PaginationControls meta={subPagination} onPageChange={setSubPage} />}
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Traffic Overview */}
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
                                                        if (str.includes(':')) return str;
                                                        const date = new Date(str);
                                                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                                    }}
                                                />
                                                <YAxis stroke="#9ca3af" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                                                    itemStyle={{ color: '#f3f4f6' }}
                                                    labelStyle={{ color: '#9ca3af' }}
                                                    labelFormatter={(label) => {
                                                        if (label.includes(':')) return `Time: ${label}`;
                                                        return new Date(label).toLocaleDateString();
                                                    }}
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

                            {/* New Subscribers */}
                            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                                    <h3 className="text-sm font-medium text-white">New Subscribers</h3>
                                </div>
                                <div className="p-4 h-72">
                                    {analytics?.data?.chart && analytics.data.chart.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={analytics.data.chart}
                                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#9ca3af"
                                                    fontSize={12}
                                                    tickFormatter={(str) => {
                                                        if (str.includes(':')) return str;
                                                        const date = new Date(str);
                                                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                                    }}
                                                />
                                                <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                                                    itemStyle={{ color: '#f3f4f6' }}
                                                    labelStyle={{ color: '#9ca3af' }}
                                                    labelFormatter={(label) => {
                                                        if (label.includes(':')) return `Time: ${label}`;
                                                        return new Date(label).toLocaleDateString();
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="subscribers"
                                                    stroke="#c084fc"
                                                    fillOpacity={1}
                                                    fill="url(#colorSubscribers)"
                                                    name="New Subscribers"
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
                        </div>

                        {/* Top Lists */}
                        {/* 2x2 Grid Layout: Pages | Visitors | Countries | Cities */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Top Pages */}
                            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex flex-col h-[340px]">
                                <div className="px-4 border-b border-gray-800 flex-shrink-0 h-[48px] flex items-center bg-gray-800/50">
                                    <h3 className="text-sm font-medium text-white">Top Pages</h3>
                                </div>
                                {analytics && analytics.data.pages.length > 0 ? (
                                    <>
                                        <div className="p-4 flex-1 overflow-hidden">
                                            <ul className="space-y-3">
                                                {analytics.data.pages
                                                    .slice((pagesPage - 1) * 7, pagesPage * 7)
                                                    .map((p, i) => (
                                                        <li key={i} className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-300 truncate" title={p.name}>{p.name}</span>
                                                            <span className="text-sm font-mono text-gray-500">{p.value}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                        <div className="px-4 flex justify-between items-center border-t border-gray-800 h-[42px] flex-shrink-0 bg-gray-900">
                                            <div className="w-[60px]">
                                                {pagesPage > 1 && (
                                                    <button
                                                        onClick={() => setPagesPage(p => Math.max(1, p - 1))}
                                                        className="text-xs text-gray-400 hover:text-white cursor-pointer"
                                                    >
                                                        Previous
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {pagesPage} / {Math.ceil(analytics.data.pages.length / 7)}
                                            </span>
                                            <div className="w-[60px] flex justify-end">
                                                {pagesPage < Math.ceil(analytics.data.pages.length / 7) && (
                                                    <button
                                                        onClick={() => setPagesPage(p => Math.min(Math.ceil(analytics.data.pages.length / 7), p + 1))}
                                                        className="text-xs text-gray-400 hover:text-white cursor-pointer"
                                                    >
                                                        Next
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 flex-1 flex items-center justify-center">
                                        <p className="text-sm text-gray-500">No data yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Top Visitors */}
                            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex flex-col h-[340px]">
                                <div className="px-4 border-b border-gray-800 flex-shrink-0 h-[48px] flex items-center bg-gray-800/50">
                                    <h3 className="text-sm font-medium text-white">Top Visitors</h3>
                                </div>
                                {analytics && analytics.data.topVisitors && analytics.data.topVisitors.length > 0 ? (
                                    <>
                                        <div className="p-4 flex-1 overflow-hidden">
                                            <ul className="space-y-3">
                                                {analytics.data.topVisitors
                                                    .slice((visitorsPage - 1) * 7, visitorsPage * 7)
                                                    .map((v, i) => (
                                                        <li key={i} className="flex justify-between items-center">
                                                            <div className="flex flex-col overflow-hidden mr-2">
                                                                {v.email ? (
                                                                    <span className="text-sm text-indigo-400 font-medium truncate" title={v.email}>{v.email}</span>
                                                                ) : (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm text-gray-300 truncate font-mono text-xs">{v.ip || 'Unknown'}</span>
                                                                        {(v.city || v.country) && (
                                                                            <span className="text-xs text-gray-500 truncate">
                                                                                {v.city && v.city !== 'unknown' ? decodeURIComponent(v.city) : ''}
                                                                                {v.city && v.country ? ', ' : ''}
                                                                                {v.country ? getCountryName(v.country) : ''}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-mono text-gray-500 flex-shrink-0">{v.value}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                        <div className="px-4 flex justify-between items-center border-t border-gray-800 h-[42px] flex-shrink-0 bg-gray-900">
                                            <div className="w-[60px]">
                                                {visitorsPage > 1 && (
                                                    <button
                                                        onClick={() => setVisitorsPage(p => Math.max(1, p - 1))}
                                                        className="text-xs text-gray-400 hover:text-white cursor-pointer"
                                                    >
                                                        Previous
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {visitorsPage} / {Math.ceil(analytics.data.topVisitors.length / 7)}
                                            </span>
                                            <div className="w-[60px] flex justify-end">
                                                {visitorsPage < Math.ceil(analytics.data.topVisitors.length / 7) && (
                                                    <button
                                                        onClick={() => setVisitorsPage(p => Math.min(Math.ceil((analytics.data.topVisitors?.length || 0) / 7), p + 1))}
                                                        className="text-xs text-gray-400 hover:text-white cursor-pointer"
                                                    >
                                                        Next
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 flex-1 flex items-center justify-center">
                                        <p className="text-sm text-gray-500">No data yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Top Countries */}
                            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex flex-col h-[340px]">
                                <div className="px-4 border-b border-gray-800 flex-shrink-0 h-[48px] flex items-center justify-between bg-gray-800/50">
                                    <h3 className="text-sm font-medium text-white">Top Countries</h3>
                                </div>
                                {analytics && analytics.data.countries.length > 0 ? (
                                    <>
                                        <div className="p-4 flex-1 overflow-hidden">
                                            <ul className="space-y-3">
                                                {analytics.data.countries
                                                    .slice((countryPage - 1) * 7, countryPage * 7)
                                                    .map((p, i) => (
                                                        <li
                                                            key={i}
                                                            className={`flex justify-between items-center group cursor-pointer transition-colors ${selectedCountry === p.name ? '' : ''}`}
                                                            onClick={() => {
                                                                setSelectedCountry(selectedCountry === p.name ? null : p.name);
                                                                setCityPage(1);
                                                            }}
                                                        >
                                                            <span className={`text-sm truncate ${selectedCountry === p.name ? 'text-indigo-300 font-medium' : 'text-gray-300 group-hover:text-white'}`}>{getCountryName(p.name)}</span>
                                                            <span className="text-sm font-mono text-gray-500">{p.value}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                        <div className="px-4 flex justify-between items-center border-t border-gray-800 h-[42px] flex-shrink-0 bg-gray-900">
                                            <div className="w-[60px]">
                                                {countryPage > 1 && (
                                                    <button
                                                        onClick={() => setCountryPage(p => Math.max(1, p - 1))}
                                                        className="text-xs text-gray-400 hover:text-white cursor-pointer"
                                                    >
                                                        Previous
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {countryPage} / {Math.ceil(analytics.data.countries.length / 7)}
                                            </span>
                                            <div className="w-[60px] flex justify-end">
                                                {countryPage < Math.ceil(analytics.data.countries.length / 7) && (
                                                    <button
                                                        onClick={() => setCountryPage(p => Math.min(Math.ceil(analytics.data.countries.length / 7), p + 1))}
                                                        className="text-xs text-gray-400 hover:text-white cursor-pointer"
                                                    >
                                                        Next
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 flex-1 flex items-center justify-center">
                                        <p className="text-sm text-gray-500">No data yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Top Cities */}
                            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex flex-col h-[340px]">
                                <div className="px-4 border-b border-gray-800 flex-shrink-0 h-[48px] flex items-center justify-between bg-gray-800/50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <h3 className="text-sm font-medium text-white truncate">
                                            {selectedCountry ? `Cities in ${getCountryName(selectedCountry)}` : 'Top Cities'}
                                        </h3>
                                        {selectedCountry && (
                                            <button onClick={() => setSelectedCountry(null)} className="flex-shrink-0 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer border border-indigo-500/30 rounded px-1.5 py-0.5">
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {analytics && analytics.data.cities && analytics.data.cities.length > 0 ? (
                                    <>
                                        <div className="p-4 flex-1 overflow-hidden">
                                            <ul className="space-y-3">
                                                {analytics.data.cities
                                                    .slice((cityPage - 1) * 7, cityPage * 7)
                                                    .map((p, i) => (
                                                        <li key={i} className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-300 truncate">{decodeURIComponent(p.name)}</span>
                                                            <span className="text-sm font-mono text-gray-500">{p.value}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                        <div className="px-4 flex justify-between items-center border-t border-gray-800 h-[42px] flex-shrink-0 bg-gray-900">
                                            <div className="w-[60px]">
                                                {cityPage > 1 && (
                                                    <button
                                                        onClick={() => setCityPage(p => Math.max(1, p - 1))}
                                                        className="text-xs text-gray-400 hover:text-white cursor-pointer"
                                                    >
                                                        Previous
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {cityPage} / {Math.ceil(analytics.data.cities.length / 7)}
                                            </span>
                                            <div className="w-[60px] flex justify-end">
                                                {cityPage < Math.ceil(analytics.data.cities.length / 7) && (
                                                    <button
                                                        onClick={() => setCityPage(p => Math.min(Math.ceil(analytics.data.cities.length / 7), p + 1))}
                                                        className="text-xs text-gray-400 hover:text-white cursor-pointer"
                                                    >
                                                        Next
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 flex-1 flex items-center justify-center">
                                        <p className="text-sm text-gray-500">No city data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Visitors Table */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex flex-col">
                            <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                                <h3 className="text-sm font-medium text-white">Recent/Identified Visitors</h3>
                            </div>
                            <div className="overflow-x-auto flex-1">
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
                                                        {v.city && v.city !== 'unknown' && <span className="text-gray-500 text-xs ml-1">({decodeURIComponent(v.city)})</span>}
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
                            {/* Visitor Pagination */}
                            {analytics?.data?.pagination && <PaginationControls meta={analytics.data.pagination} onPageChange={setVisitorPage} />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
