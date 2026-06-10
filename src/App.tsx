import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { MovementsPage } from './pages/movements';
import { LearnPage } from './pages/movements/learn';
import { RecordPage } from "./pages/movements/record";
import { ReplayPage } from "./pages/movements/replay";
import { ReportPage } from "./pages/movements/report";
import { SettingsPage } from "./pages/settings";
import { ProgressPage } from "./pages/progress";
import { PrivacyPage } from "./pages/privacy";

import './styles/base.css';
import './styles/buttons.css';
import './App.css';

function App() {
    return (
        <div className="app">
            <Sidebar />

            <main className="app__main shadow-3">
                <Routes>
                    <Route path="/" element={<Navigate to="/movements" replace />} />

                    <Route path="/movements" element={<MovementsPage />} />
                    <Route path="/movements/learn/:movementId" element={<LearnPage />} />
                    <Route path="/movements/record/:movementId" element={<RecordPage />} />
                    <Route path="/movements/replay/:movementId" element={<ReplayPage />} />
                    <Route path="/movements/report/:movementId" element={<ReportPage />} />

                    <Route path="/progress" element={<ProgressPage />} />

                    {/* NEW: Settings view registration */}
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;