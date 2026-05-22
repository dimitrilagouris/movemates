import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { MovementsPage } from './pages/movements';
import { LearnPage } from './pages/movements/learn';
import {RecordPage} from "./pages/movements/record";

import './styles/base.css';
import './styles/buttons.css';
import './App.css';
import {ReplayPage} from "./pages/movements/replay";


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
                </Routes>
            </main>
        </div>
    );
}

export default App;