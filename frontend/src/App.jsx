import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import LoadingScreen from './components/LoadingScreen';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/student/Dashboard';
import KuppiClasses from './pages/student/KuppiClasses';
import Enrollments from './pages/student/Enrollments';
import ResourceSharing from './pages/student/ResourceSharing';
import StudyGroupFinder from './pages/student/StudyGroupFinder';
import QuizSection from './pages/student/QuizSection';
import SemesterSelection from './pages/student/SemesterSelection';
import QuizList from './pages/student/QuizList';
import QuizDetails from './pages/student/QuizDetails';
import QuizAttempt from './pages/student/QuizAttempt';
import QuizResult from './pages/student/QuizResult';
import Leaderboard from './pages/student/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import PostKuppiClass from './pages/admin/PostKuppiClass';
import ManageEnrollments from './pages/admin/ManageEnrollments';
import UploadResource from './pages/admin/UploadResource';
import CreateStudyGroup from './pages/admin/CreateStudyGroup';
import AdminQuizManagement from './pages/admin/AdminQuizManagement';
import QuizQuestionEditor from './pages/admin/QuizQuestionEditor';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminStudentAttempts from './pages/admin/AdminStudentAttempts';


const StudentLayout = ({ children }) => (
  <div className="flex bg-gray-50 min-h-screen">
    <Sidebar />
    <main className="ml-64 flex-1">{children}</main>
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="flex bg-gray-50 min-h-screen">
    <AdminSidebar />
    <main className="ml-64 flex-1">{children}</main>
  </div>
);

// Quiz attempt is full screen (no sidebar)
const BlankLayout = ({ children }) => (
  <div className="min-h-screen" style={{ background: '#F8FAFC' }}>{children}</div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen message="Securing your session..." />;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/student/dashboard" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute><StudentLayout><Dashboard /></StudentLayout></ProtectedRoute>
      } />
      <Route path="/student/kuppi-classes" element={
        <ProtectedRoute><StudentLayout><KuppiClasses /></StudentLayout></ProtectedRoute>
      } />
      <Route path="/student/enrollments" element={
        <ProtectedRoute><StudentLayout><Enrollments /></StudentLayout></ProtectedRoute>
      } />
      <Route path="/student/resource-sharing" element={
        <ProtectedRoute><StudentLayout><ResourceSharing /></StudentLayout></ProtectedRoute>
      } />
      <Route path="/student/study-groups" element={
        <ProtectedRoute><StudentLayout><StudyGroupFinder /></StudentLayout></ProtectedRoute>
      } />

      {/* Quiz Student Routes */}
      <Route path="/student/quizzes" element={
        <ProtectedRoute><StudentLayout><QuizSection /></StudentLayout></ProtectedRoute>
      } />
      <Route path="/student/quizzes/:year" element={
        <ProtectedRoute><StudentLayout><SemesterSelection /></StudentLayout></ProtectedRoute>
      } />
      <Route path="/student/quizzes/:year/:semester" element={
        <ProtectedRoute><StudentLayout><QuizList /></StudentLayout></ProtectedRoute>
      } />
      <Route path="/student/quizzes/:id/details" element={
        <ProtectedRoute><StudentLayout><QuizDetails /></StudentLayout></ProtectedRoute>
      } />
      <Route path="/student/quizzes/:id/attempt" element={
        <ProtectedRoute><BlankLayout><QuizAttempt /></BlankLayout></ProtectedRoute>
      } />
      <Route path="/student/quizzes/result/:attemptId" element={
        <ProtectedRoute><BlankLayout><QuizResult /></BlankLayout></ProtectedRoute>
      } />
      <Route path="/student/quizzes/leaderboard" element={
        <ProtectedRoute><StudentLayout><Leaderboard /></StudentLayout></ProtectedRoute>
      } />
      <Route path="/student/quizzes/:id/leaderboard" element={
        <ProtectedRoute><StudentLayout><Leaderboard /></StudentLayout></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><ManageUsers /></AdminLayout></ProtectedRoute>
      } />
      <Route path="/admin/post-kuppi-class" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><PostKuppiClass /></AdminLayout></ProtectedRoute>
      } />
      <Route path="/admin/enrollments" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><ManageEnrollments /></AdminLayout></ProtectedRoute>
      } />
      <Route path="/admin/upload-resource" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><UploadResource /></AdminLayout></ProtectedRoute>
      } />
      <Route path="/admin/create-study-group" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><CreateStudyGroup /></AdminLayout></ProtectedRoute>
      } />
      <Route path="/admin/quiz-management" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><AdminQuizManagement /></AdminLayout></ProtectedRoute>
      } />
      <Route path="/admin/quiz-management/:id/questions" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><QuizQuestionEditor /></AdminLayout></ProtectedRoute>
      } />
      <Route path="/admin/subjects" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><AdminSubjects /></AdminLayout></ProtectedRoute>
      } />
      <Route path="/admin/student-attempts" element={
        <ProtectedRoute adminOnly={true}><AdminLayout><AdminStudentAttempts /></AdminLayout></ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);
  if (showSplash) return <LoadingScreen />;
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}