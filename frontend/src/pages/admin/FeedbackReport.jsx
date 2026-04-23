import { useState, useEffect } from 'react';
import { getFeedbackReport } from '../../services/api';

export default function FeedbackReport() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFeedbackReport()
            .then(res => {
                setFeedbacks(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const downloadCSV = () => {
        const headers = ['Date', 'User Name', 'Email', 'Rating', 'Comment'];
        const rows = feedbacks.map(fb => {
            const date = new Date(fb.createdAt).toLocaleDateString();
            const name = `"${(fb.user?.name || 'Anonymous').replace(/"/g, '""')}"`;
            const email = `"${(fb.user?.email || 'N/A').replace(/"/g, '""')}"`;
            const rating = fb.rating;
            const comment = `"${fb.comment.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
            return [date, name, email, rating, comment].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'unicollab_feedback_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Feedback Report</h1>
                    <p className="text-gray-500 mt-1">Review and export student feedback.</p>
                </div>
                <button
                    onClick={downloadCSV}
                    disabled={feedbacks.length === 0}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                    <span>📥</span> Export CSV
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-bold">Date</th>
                                <th className="p-4 font-bold">Student</th>
                                <th className="p-4 font-bold">Rating</th>
                                <th className="p-4 font-bold">Comment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">Loading feedbacks...</td>
                                </tr>
                            ) : feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">No feedback submitted yet.</td>
                                </tr>
                            ) : (
                                feedbacks.map(fb => (
                                    <tr key={fb._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(fb.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{fb.user?.name || 'Anonymous'}</div>
                                            <div className="text-xs text-slate-500">{fb.user?.email || 'N/A'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex text-amber-400">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i}>{i < fb.rating ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 max-w-md truncate">
                                            {fb.comment}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
