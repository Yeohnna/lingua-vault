import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import WordsPage from './pages/WordsPage';
import ReviewPage from './pages/ReviewPage';
import NotesPage from './pages/NotesPage';
import StatsPage from './pages/StatsPage';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<WordsPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>

        <nav className="bottom-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            📖 单词
          </NavLink>
          <NavLink to="/review" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            🔄 复习
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            📝 笔记
          </NavLink>
          <NavLink to="/stats" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            📊 统计
          </NavLink>
        </nav>
      </div>
    </HashRouter>
  );
}

export default App;