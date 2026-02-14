import { Sidebar } from './components/sidebar/index.tsx';
import { MovementsPage } from './pages/movements/index.tsx';
import './styles/base.css';
import './App.css';

function App() {
    return (
        <div className="app">
            <Sidebar />

            <main className="app__main shadow-3">

                <MovementsPage />
            </main>
        </div>
    );
}

export default App;