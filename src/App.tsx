import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { MovementsPage } from './pages/movements';
import { LearnPage } from './pages/movements/learn';
import './styles/base.css';
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
                </Routes>
            </main>
        </div>
    );
}

export default App;