import { useState } from 'react';
import { submitFeedback } from '../../services/api';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

/* ── Constants ───────────────────────────────────── */
const CATEGORIES = [
    { value: 'bug_report', emoji: '🐛', label: 'Bug Report', sub: "Something isn't working" },
    { value: 'feature_request', emoji: '💡', label: 'Feature Request', sub: 'I have an idea' },
    { value: 'ui_ux', emoji: '🎨', label: 'UI/UX Suggestion', sub: 'Visual/Navigation improvement' },
    { value: 'content_quality', emoji: '📚', label: 'Content Quality', sub: 'Issue with Resources/Kuppi' },
    { value: 'appreciation', emoji: '⭐', label: 'General Appreciation', sub: 'Positive feedback' },
];

const AREAS = ['Dashboard', 'Kuppi Classes', 'Resource Sharing', 'Study Groups', 'Quiz Zone', 'Student Profile'];

const METRICS = [
    { key: 'easeOfUse', label: 'Ease of Use' },
    { key: 'informationClarity', label: 'Information Clarity' },
    { key: 'loadingSpeed', label: 'Loading Speed' },
    { key: 'overallSatisfaction', label: 'Overall Satisfaction' },
];

/* ── Star row ─────────────────────────────────────── */
function StarRow({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    type="button"
                    key={n}
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    className={`text-3xl transition-all hover:scale-110 focus:outline-none ${n <= (hovered || value) ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'
                        }`}
                >★</button>
            ))}
        </div>
    );
}

/* ── Toggle switch ────────────────────────────────── */
function Toggle({ checked, onChange, label }) {
    return (
        <label className="flex items-center justify-between gap-4 cursor-pointer group">
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
            <div
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
        </label>
    );
}

/* ── Step indicator ───────────────────────────────── */
function StepIndicator({ current }) {
    const steps = ['Category & Module', 'Performance Ratings', 'Details & Preferences'];
    return (
        <div className="flex items-center gap-2 mb-8">
            {steps.map((label, i) => {
                const idx = i + 1;
                const done = idx < current;
                const active = idx === current;
                return (
                    <div key={idx} className="flex items-center gap-2 flex-1 last:flex-none">
                        <div className={`flex items-center gap-2 flex-shrink-0 ${active ? 'text-emerald-600' : done ? 'text-emerald-500' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${active ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                    : done ? 'bg-emerald-100 border-emerald-300 text-emerald-600'
                                        : 'bg-slate-100 border-slate-200 text-slate-400'
                                }`}>
                                {done ? '✓' : idx}
                            </div>
                            <span className={`text-xs font-bold hidden sm:block ${active ? 'text-emerald-700' : done ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ── Main component ───────────────────────────────── */
export default function Feedback() {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Step 1
    const [category, setCategory] = useState('');
    const [targetAreas, setTargetAreas] = useState([]);

    // Step 2
    const [ratings, setRatings] = useState({
        easeOfUse: 0, informationClarity: 0, loadingSpeed: 0, overallSatisfaction: 0,
    });

    // Step 3
    const [painPoints, setPainPoints] = useState('');
    const [featureSuggestion, setFeatureSuggestion] = useState('');
    const [contactPermission, setContactPermission] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);

    const toggleArea = (area) =>
        setTargetAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);

    const setRating = (key, val) => setRatings(prev => ({ ...prev, [key]: val }));

    /* Validation per step */
    const canProceed = () => {
        if (step === 1) return !!category;
        if (step === 2) return Object.values(ratings).every(v => v > 0);
        return true;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            await submitFeedback({ category, targetAreas, ratings, painPoints, featureSuggestion, contactPermission, isAnonymous });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    /* Success screen */
    if (success) {
        return (
            <div className="p-8 max-w-2xl">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-emerald-500 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Thank you for your feedback!</h2>
                    <p className="text-slate-500 font-medium mb-8">Your response has been recorded and will help us improve UNIcollab.</p>
                    <button
                        onClick={() => { setSuccess(false); setStep(1); setCategory(''); setTargetAreas([]); setRatings({ easeOfUse: 0, informationClarity: 0, loadingSpeed: 0, overallSatisfaction: 0 }); setPainPoints(''); setFeatureSuggestion(''); setContactPermission(false); setIsAnonymous(false); }}
                        className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors"
                    >
                        Submit Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">💬 Provide Feedback</h1>
                <p className="text-gray-500 mt-1">Help us improve UNIcollab — your voice matters.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <StepIndicator current={step} />

                {/* ── STEP 1 ─────────────────────────────────── */}
                {step === 1 && (
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900 mb-1">What's this about?</h2>
                        <p className="text-sm text-slate-500 font-medium mb-6">Select a category and the modules involved.</p>

                        {/* Category pill-selector */}
                        <label className="block text-sm font-bold text-slate-700 mb-3">Feedback Category <span className="text-red-400">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                            {CATEGORIES.map(c => (
                                <button
                                    type="button"
                                    key={c.value}
                                    onClick={() => setCategory(c.value)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${category === c.value
                                            ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-500/10'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <span className="text-2xl leading-none">{c.emoji}</span>
                                    <div>
                                        <p className={`text-sm font-bold ${category === c.value ? 'text-emerald-700' : 'text-slate-800'}`}>{c.label}</p>
                                        <p className="text-xs text-slate-500 font-medium">{c.sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Target areas */}
                        <label className="block text-sm font-bold text-slate-700 mb-3">Target Module(s) <span className="text-slate-400 font-medium">(optional)</span></label>
                        <div className="flex flex-wrap gap-2">
                            {AREAS.map(area => (
                                <button
                                    type="button"
                                    key={area}
                                    onClick={() => toggleArea(area)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${targetAreas.includes(area)
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                                        }`}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── STEP 2 ─────────────────────────────────── */}
                {step === 2 && (
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900 mb-1">Rate your experience</h2>
                        <p className="text-sm text-slate-500 font-medium mb-6">Give us a score for each area (all required).</p>

                        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden">
                            {METRICS.map(({ key, label }) => (
                                <div key={key} className="flex items-center justify-between gap-4 px-5 py-4 bg-white hover:bg-slate-50/60 transition-colors">
                                    <span className="text-sm font-bold text-slate-700 w-44">{label}</span>
                                    <StarRow value={ratings[key]} onChange={v => setRating(key, v)} />
                                    <span className={`text-sm font-black w-6 text-right ${ratings[key] ? 'text-amber-500' : 'text-slate-300'}`}>
                                        {ratings[key] || '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {!canProceed() && (
                            <p className="mt-3 text-xs text-red-500 font-semibold">Please rate all metrics before continuing.</p>
                        )}
                    </div>
                )}

                {/* ── STEP 3 ─────────────────────────────────── */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Tell us more</h2>
                            <p className="text-sm text-slate-500 font-medium mb-6">Help us understand your experience in detail.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">What did you find most difficult to use?</label>
                            <textarea
                                value={painPoints}
                                onChange={e => setPainPoints(e.target.value)}
                                placeholder="Describe any pain points or confusing parts..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 min-h-[100px] text-sm font-medium resize-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">What one feature would make UNIcollab better for you?</label>
                            <textarea
                                value={featureSuggestion}
                                onChange={e => setFeatureSuggestion(e.target.value)}
                                placeholder="Describe your idea..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 min-h-[100px] text-sm font-medium resize-none transition"
                            />
                        </div>

                        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                            <Toggle
                                checked={contactPermission}
                                onChange={setContactPermission}
                                label="Is it okay for the dev team to contact you via your student email?"
                            />
                            <div className="border-t border-slate-200" />
                            <Toggle
                                checked={isAnonymous}
                                onChange={setIsAnonymous}
                                label="Submit feedback anonymously"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border border-red-100">
                                ❌ {error}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Navigation buttons ─────────────────────── */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-60"
                        >
                            {submitting ? 'Submitting…' : '🚀 Submit Feedback'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
