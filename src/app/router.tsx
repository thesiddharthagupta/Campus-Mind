import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../shared/components/layout/AppLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MaterialsPage } from '../features/materials/pages/MaterialsPage';
import { NotesPage } from '../features/notes/pages/NotesPage';
import { QuizzesPage } from '../features/quizzes/pages/QuizzesPage';
import { ProgressPage } from '../features/progress/pages/ProgressPage';
import { AcademicPage } from '../features/academic/pages/AcademicPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { NotFoundPage } from '../shared/components/feedback/NotFoundPage';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import { ModeratorRoute } from './guards/ModeratorRoute';
import { ModerationPage } from '../features/moderation/pages/ModerationPage';

export function AppRouter() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
    <Route index element={<DashboardPage />} />
    <Route path="/academic" element={<AcademicPage />} />
    <Route path="/materials" element={<MaterialsPage />} />
    <Route path="/notes" element={<NotesPage />} />
    <Route path="/practice" element={<QuizzesPage />} />
    <Route path="/progress" element={<ProgressPage />} />
    <Route path="/reports" element={<ReportsPage />} />
    <Route element={<ModeratorRoute />}><Route path="/moderation" element={<ModerationPage />} /></Route>
    <Route path="/dashboard" element={<Navigate to="/" replace />} />
    <Route path="*" element={<NotFoundPage />} />
    </Route></Route>
  </Routes>;
}
