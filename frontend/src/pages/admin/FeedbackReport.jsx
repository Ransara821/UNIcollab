import { useState, useEffect } from 'react';
import { getFeedbackReport } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MessageSquare, Bug, Lightbulb, Paintbrush2, BookOpen, Star, TrendingUp } from 'lucide-react';

const CATEGORY_LABELS = {
    bug_report: '🐛 Bug Report',
    feature_request: '💡 Feature Request',
    ui_ux: '🎨 UI/UX Suggestion',
    content_quality: '📚 Content Quality',
    appreciation: '⭐ Appreciation',
};

function Stars({ value }) {
    return (
        <span className="text-amber-400 tracking-tighter">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < value ? '★' : '☆'}</span>
            ))}
        </span>
    );
}

function KpiCard({ icon: Icon, label, value, from, to, light, text }) {
    return (
        <div className="relative rounded-2xl p-5 border border-slate-100 shadow-sm overflow-hidden" style={{ background: light }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                <Icon size={18} color="white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: text }}>{label}</p>
            <p className="text-3xl font-black" style={{ color: text }}>{value}</p>
        </div>
    );
}

export default function FeedbackReport() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        getFeedbackReport()
            .then(res => { setFeedbacks(res.data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    /* ── KPI Calculations ──────────────────────────── */
    const totalFeedbacks = feedbacks.length;
    const avgOverall = feedbacks.length
        ? (feedbacks.reduce((acc, fb) => acc + (fb.ratings?.overallSatisfaction ?? fb.rating ?? 0), 0) / feedbacks.length).toFixed(1)
        : '—';
    const bugReports = feedbacks.filter(fb => fb.category === 'bug_report').length;
    const featureRequests = feedbacks.filter(fb => fb.category === 'feature_request').length;
    const appreciations = feedbacks.filter(fb => fb.category === 'appreciation').length;
    const anonymousCount = feedbacks.filter(fb => fb.isAnonymous).length;

    const kpiCards = [
        { label: 'Total Feedback', value: totalFeedbacks, icon: MessageSquare, from: '#3B82F6', to: '#6366F1', light: '#EFF6FF', text: '#1D4ED8' },
        { label: 'Avg Overall Rating', value: avgOverall, icon: TrendingUp, from: '#F59E0B', to: '#EF4444', light: '#FFFBEB', text: '#B45309' },
        { label: 'Bug Reports', value: bugReports, icon: Bug, from: '#EF4444', to: '#F97316', light: '#FEF2F2', text: '#B91C1C' },
        { label: 'Feature Requests', value: featureRequests, icon: Lightbulb, from: '#8B5CF6', to: '#A855F7', light: '#F5F3FF', text: '#6D28D9' },
        { label: 'Appreciations', value: appreciations, icon: Star, from: '#10B981', to: '#14B8A6', light: '#ECFDF5', text: '#065F46' },
        { label: 'Anonymous', value: anonymousCount, icon: BookOpen, from: '#6B7280', to: '#374151', light: '#F9FAFB', text: '#374151' },
    ];

    /* ── PDF Export ─────────────────────────────────── */
    const downloadPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        // Header
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, 297, 22, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('UNIcollab — Feedback Report', 14, 14);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, 230, 14);

        // KPI summary block
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Report Summary', 14, 31);

        const summaryData = [
            ['Total Feedback', totalFeedbacks, 'Avg Overall Rating', avgOverall],
            ['Bug Reports', bugReports, 'Feature Requests', featureRequests],
            ['Appreciations', appreciations, 'Anonymous Submissions', anonymousCount],
        ];
        autoTable(doc, {
            startY: 34,
            head: [],
            body: summaryData.map(row => [
                { content: row[0], styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
                { content: String(row[1]), styles: { fontStyle: 'bold', textColor: [16, 185, 129] } },
                { content: row[2], styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
                { content: String(row[3]), styles: { fontStyle: 'bold', textColor: [16, 185, 129] } },
            ]),
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 30 }, 2: { cellWidth: 50 }, 3: { cellWidth: 30 } },
            margin: { left: 14 },
        });

        // Main table
        const startY = doc.lastAutoTable.finalY + 8;

        autoTable(doc, {
            startY,
            head: [['Date', 'Student', 'Email', 'Anonymous', 'Category', 'Target Areas', 'Ease', 'Clarity', 'Speed', 'Overall', 'Pain Points', 'Feature Idea']],
            body: feedbacks.map(fb => {
                const r = fb.ratings || {};
                return [
                    new Date(fb.createdAt).toLocaleDateString(),
                    fb.isAnonymous ? 'Anonymous' : (fb.user?.name || '—'),
                    fb.isAnonymous ? 'N/A' : (fb.user?.email || '—'),
                    fb.isAnonymous ? 'Yes' : 'No',
                    CATEGORY_LABELS[fb.category]?.replace(/[^\w\s/]/g, '').trim() || '—',
                    (fb.targetAreas || []).join(', ') || '—',
                    r.easeOfUse ? `${r.easeOfUse}/5` : '—',
                    r.informationClarity ? `${r.informationClarity}/5` : '—',
                    r.loadingSpeed ? `${r.loadingSpeed}/5` : '—',
                    r.overallSatisfaction ? `${r.overallSatisfaction}/5` : (fb.rating ? `${fb.rating}/5` : '—'),
                    fb.painPoints || '—',
                    fb.featureSuggestion || '—',
                ];
            }),
            headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { cellPadding: 3, overflow: 'linebreak' },
            columnStyles: {
                10: { cellWidth: 35 },
                11: { cellWidth: 35 },
            },
            margin: { left: 14, right: 14 },
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}  |  UNIcollab Feedback Report`, 14, doc.internal.pageSize.height - 6);
        }

        doc.save('unicollab_feedback_report.pdf');
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Feedback Report</h1>
                    <p className="text-gray-500 mt-1">Review and export student feedback.</p>
                </div>
                <button
                    onClick={downloadPDF}
                    disabled={feedbacks.length === 0}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                    <span>📄</span> Export PDF
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {kpiCards.map(card => (
                    <KpiCard key={card.label} {...card} value={loading ? '—' : card.value} />
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Gradient header */}
                <div
                    className="flex items-center gap-4 px-6 py-4"
                    style={{ background: 'linear-gradient(135deg, #065F46 0%, #10B981 60%, #14B8A6 100%)' }}
                >
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <MessageSquare size={18} color="white" />
                    </div>
                    <div>
                        <p className="text-white font-extrabold text-sm leading-tight">Student Feedback</p>
                        <p className="text-emerald-100 text-xs font-medium">All submitted responses</p>
                    </div>
                    <span className="ml-auto px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                        {loading ? '…' : totalFeedbacks} entries
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-bold">Date</th>
                                <th className="p-4 font-bold">Student</th>
                                <th className="p-4 font-bold">Category</th>
                                <th className="p-4 font-bold">Areas</th>
                                <th className="p-4 font-bold">Ratings</th>
                                <th className="p-4 font-bold">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Loading feedbacks...</td></tr>
                            ) : feedbacks.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No feedback submitted yet.</td></tr>
                            ) : (
                                feedbacks.map(fb => {
                                    const r = fb.ratings || {};
                                    const isExpanded = expanded === fb._id;
                                    return (
                                        <tr key={fb._id} className="hover:bg-slate-50 transition-colors align-top">
                                            <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                                                {new Date(fb.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900">
                                                    {fb.isAnonymous ? '🕵️ Anonymous' : fb.user?.name || '—'}
                                                </div>
                                                {!fb.isAnonymous && <div className="text-xs text-slate-500">{fb.user?.email || 'N/A'}</div>}
                                                {fb.contactPermission && !fb.isAnonymous && (
                                                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Can contact</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-semibold text-slate-700">{CATEGORY_LABELS[fb.category] || '—'}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                                    {!(fb.targetAreas || []).length
                                                        ? <span className="text-xs text-slate-400">—</span>
                                                        : (fb.targetAreas || []).map(area => (
                                                            <span key={area} className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">{area}</span>
                                                        ))
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1 text-xs">
                                                    {[
                                                        ['Ease', r.easeOfUse],
                                                        ['Clarity', r.informationClarity],
                                                        ['Speed', r.loadingSpeed],
                                                        ['Overall', r.overallSatisfaction ?? fb.rating],
                                                    ].map(([label, val]) => (
                                                        <div key={label} className="flex items-center gap-2">
                                                            <span className="text-slate-500 w-14 font-semibold">{label}</span>
                                                            {val ? <Stars value={val} /> : <span className="text-slate-300">—</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs">
                                                <button
                                                    onClick={() => setExpanded(isExpanded ? null : fb._id)}
                                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                                                >
                                                    {isExpanded ? 'Hide ▲' : 'View ▼'}
                                                </button>
                                                {isExpanded && (
                                                    <div className="mt-2 space-y-2">
                                                        {fb.painPoints && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Pain Points</p>
                                                                <p className="text-xs text-slate-700 leading-relaxed">{fb.painPoints}</p>
                                                            </div>
                                                        )}
                                                        {fb.featureSuggestion && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Feature Idea</p>
                                                                <p className="text-xs text-slate-700 leading-relaxed">{fb.featureSuggestion}</p>
                                                            </div>
                                                        )}
                                                        {!fb.painPoints && !fb.featureSuggestion && fb.comment && (
                                                            <p className="text-xs text-slate-600">{fb.comment}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
