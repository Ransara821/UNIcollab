import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, ChevronRight } from 'lucide-react';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2'];

export default function QuizSection() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const navigate = useNavigate();

  const handleBrowse = () => {
    if (selectedYear && selectedSemester) {
      navigate(`/student/quizzes/list?year=${encodeURIComponent(selectedYear)}&semester=${encodeURIComponent(selectedSemester)}`);
    }
  };

  return (
    <div className="p-8 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-semibold mb-1" style={{ color: '#4F46E5' }}>Knowledge Assessment</p>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Zone</h1>
        <p className="text-slate-500">Select your academic year and semester to browse available quizzes.</p>
      </div>

      {/* Year Selection */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Academic Year</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {YEARS.map((year, idx) => {
            const isActive = selectedYear === year;
            return (
              <button key={year} onClick={() => { setSelectedYear(year); setSelectedSemester(null); }}
                className="p-4 rounded-2xl border-2 text-center font-semibold transition-all duration-200 hover:-translate-y-1"
                style={{
                  borderColor: isActive ? '#4F46E5' : '#E2E8F0',
                  background: isActive ? 'linear-gradient(135deg, #EEF2FF, #E0F2FE)' : 'white',
                  color: isActive ? '#4F46E5' : '#64748B',
                }}>
                <div className="text-lg font-bold mb-1 text-slate-400">{idx + 1}</div>
                <div className="text-sm">{year}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Semester Selection */}
      {selectedYear && (
        <div className="mb-8 animate-fade-in">
          <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Semester</p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {SEMESTERS.map((sem) => {
              const isActive = selectedSemester === sem;
              return (
                <button key={sem} onClick={() => setSelectedSemester(sem)}
                  className="p-4 rounded-2xl border-2 text-center font-semibold transition-all duration-200 hover:-translate-y-1"
                  style={{
                    borderColor: isActive ? '#06B6D4' : '#E2E8F0',
                    background: isActive ? 'linear-gradient(135deg, #ECFEFF, #EEF2FF)' : 'white',
                    color: isActive ? '#0891B2' : '#64748B',
                  }}>
                  <div className="text-xs font-medium mb-1 uppercase tracking-widest" style={{ color: isActive ? '#06B6D4' : '#94A3B8' }}>
                    {sem === 'Semester 1' ? 'SEM 1' : 'SEM 2'}
                  </div>
                  <div className="text-sm">{sem}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      {selectedYear && selectedSemester && (
        <div className="animate-fade-in">
          <div className="p-4 rounded-xl mb-6 flex items-center gap-3"
            style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
            <BookOpen size={16} style={{ color: '#4F46E5' }} />
            <span className="text-sm font-semibold text-indigo-700">{selectedYear} · {selectedSemester} selected</span>
          </div>
          <div className="flex gap-3">
            <button onClick={handleBrowse}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)' }}>
              Browse Quizzes <ChevronRight size={16} />
            </button>
            <button onClick={() => navigate('/student/quizzes/leaderboard')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
              <Trophy size={16} /> Leaderboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
