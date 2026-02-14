import { Sidebar } from './components/sidebar/index.tsx'
import './styles/base.css'
import './App.css';

function App() {
    return (
        <div className="app">
            <Sidebar />

            <main className="app__main shadow-3 ">
                <header className="page-header">
                    <h1 className="page-header__title">Welcome back, Dimitri!</h1>
                    <p className="page-header__subtitle">Select a movement to start.</p>
                </header>

                {/* Placeholder for your Movements content */}
                <div style={{}}>
                    Movements Content Will Go Here
                </div>
            </main>
        </div>
    );
}

export default App;