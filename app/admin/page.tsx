'use client';

import { useState } from 'react';

interface Subscriber {
    email: string;
    timestamp: number;
    date: string;
}

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/admin/subscribers?key=${password}`);
            const data = await res.json();

            if (res.ok) {
                setSubscribers(data.subscribers);
                setIsAuthenticated(true);
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
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
                        <h1 className="text-2xl font-bold">Subscribers</h1>
                        <p className="text-gray-400 text-sm mt-1">Total: {subscribers.length}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        Logout
                    </button>
                </div>

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
            </div>
        </div>
    );
}
