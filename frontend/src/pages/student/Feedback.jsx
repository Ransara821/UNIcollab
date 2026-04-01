import { useState } from 'react';
import { submitFeedback } from '../../services/api';

export default function Feedback() {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Please select a rating before submitting.');
            return;
        }

        setStatus('submitting');
        try {
            await submitFeedback({ rating, comment });
            setStatus('success');
            setComment('');
            setRating(0);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Provide Feedback</h1>
            <p className="text-gray-500 mb-8">We value your input! Help us improve UNIcollab.</p>

            {status === 'success' && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 font-medium">
                    ✅ Thank you for your feedback!
                </div>
            )}
            {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">
                    ❌ Failed to submit feedback. Please try again later.
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(num => (
                            <button
                                type="button"
                                key={num}
                                onClick={() => setRating(num)}
                                className={`text-5xl transition-all hover:scale-110 focus:outline-none ${rating >= num
                                    ? 'text-amber-400 drop-shadow-sm'
                                    : 'text-slate-300 hover:text-amber-200'
                                    }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Comments or Suggestions</label>
                    <textarea
                        required
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us what you think..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 min-h-[120px]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                    {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
}
