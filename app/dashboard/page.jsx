'use client';
import { useState, useEffect } from 'react';
import { quotationAPI, userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FileText, Users, Clock, Plus, ArrowRight, TrendingUp, Search } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function DashboardPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalQuotations: 0,
        draftQuotations: 0,
        sentQuotations: 0,
        acceptedQuotations: 0,
        totalUsers: 0
    });
    const [recentQuotations, setRecentQuotations] = useState([]);
    const [quotationGraphData, setQuotationGraphData] = useState([]);
    const [monthlyPercentage, setMonthlyPercentage] = useState(0);
    const [loading, setLoading] = useState(true);

    const filteredRecentQuotations = recentQuotations.filter((q) =>
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const quotationsRes = await quotationAPI.getAll();
            const quotations = quotationsRes.data.quotations;
            const graphData = buildQuotationGraph(quotations);
            setQuotationGraphData(graphData);
            const percent = calculateMonthlyPercentage(quotations);
            setMonthlyPercentage(percent);



            const statsData = {
                totalQuotations: quotations.length,
                draftQuotations: quotations.filter(q => q.status === 'draft').length,
                sentQuotations: quotations.filter(q => q.status === 'sent').length,
                acceptedQuotations: quotations.filter(q => q.status === 'accepted').length,
                totalUsers: 0
            };

            if (user.role === 'admin') {
                const usersRes = await userAPI.getAll();
                statsData.totalUsers = usersRes.data.users.length;
            }

            setStats(statsData);
            setRecentQuotations(quotations.slice(0, 5));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const buildQuotationGraph = (quotations) => {
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const dayCount = {
            Mon: 0,
            Tue: 0,
            Wed: 0,
            Thu: 0,
            Fri: 0,
            Sat: 0,
        };

        quotations.forEach((q) => {
            const day = new Date(q.createdAt)
                .toLocaleDateString('en-US', { weekday: 'short' });

            if (dayCount[day] !== undefined) {
                dayCount[day]++;
            }
        });

        return weekDays.map((day) => ({
            day,
            value: dayCount[day],
        }));
    };

    const calculateMonthlyPercentage = (quotations) => {
        const now = new Date();

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date(currentYear, currentMonth - 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const currentMonthCount = quotations.filter((q) => {
            const d = new Date(q.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        const lastMonthCount = quotations.filter((q) => {
            const d = new Date(q.createdAt);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        }).length;

        if (lastMonthCount === 0) {
            return currentMonthCount > 0 ? 100 : 0;
        }

        return Math.round((currentMonthCount / lastMonthCount) * 100);
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="w-full max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search quotation #, customer name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg 
               focus:ring-2 focus:ring-[#007d58] focus:border-transparent 
               outline-none bg-white"
                    />
                </div>

                <Link
                    href="/dashboard/quotations/create"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    New Quotation
                </Link>
            </div>

            {/* Dashboard Header */}
            <div className="bg-[#f7f7f2] rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                    {/* left: Total monthly % Quotations graph */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-28 h-28">
                            <PieChart width={112} height={112}>
                                <Pie
                                    data={[
                                        { value: monthlyPercentage },
                                        { value: 100 - monthlyPercentage }
                                    ]}
                                    innerRadius={38}
                                    outerRadius={50}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <Cell fill="#111827" />
                                    <Cell fill="#e5e7eb" />
                                </Pie>
                            </PieChart>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold text-gray-900">
                                    {monthlyPercentage}%
                                </span>
                            </div>
                        </div>

                        <p className="mt-2 text-sm text-gray-600 text-center">
                            Monthly Quotations
                        </p>
                    </div>

                    {/* middle: New Quotations Graph */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                            New Quotations
                        </p>

                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={quotationGraphData}>
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="value"
                                        radius={[6, 6, 0, 0]}
                                        fill="#111827"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>


                    {/* Right: Total Quotations */}
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900">
                            {stats.totalQuotations}
                        </p>
                        <p className="text-sm text-gray-600">
                            Total Quotations
                        </p>
                    </div>


                </div>
            </div>



            {/* Recent Quotations */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Recent Quotations</h2>
                        <p className="text-sm text-gray-600 mt-1">Your latest quotation activity</p>
                    </div>
                    <Link
                        href="/dashboard/quotations"
                        className="text-gray-900 hover:text-gray-700 font-medium flex items-center gap-2 text-sm transition-colors"
                    >
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {recentQuotations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotations yet</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first quotation</p>
                        <Link
                            href="/dashboard/quotations/create"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Create Quotation
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Quotation #
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRecentQuotations.map((quotation) => (
                                    <tr key={quotation._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/dashboard/quotations/${quotation._id}`}
                                                className="text-gray-900 hover:text-gray-700 font-semibold text-sm"
                                            >
                                                {quotation.quotationNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{quotation.customerName}</div>
                                            <div className="text-sm text-gray-500">{quotation.customerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900">
                                                ₹{quotation.total.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg
                                                    ${quotation.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                    ${quotation.status === 'sent' ? 'bg-blue-100 text-blue-700' : ''}
                                                    ${quotation.status === 'accepted' ? 'bg-green-100 text-green-700' : ''}
                                                    ${quotation.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                                                `}
                                            >
                                                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(quotation.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}