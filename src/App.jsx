import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import WordsPage from './pages/WordsPage';
import ReviewPage from './pages/ReviewPage';
import NotesPage from './pages/NotesPage';
import StatsPage from './pages/StatsPage';
import ReadingHelperPage from './pages/ReadingHelperPage';
import GrammarPage from './pages/GrammarPage';
import WritingPage from './pages/WritingPage';
import SpeakingPage from './pages/SpeakingPage';
import GamePage from './pages/GamePage';
import { useTheme } from './context/ThemeContext';
import './App.css';

function App() {
  const { dark, toggle } = useTheme();

  return (
    <HashRouter>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<WordsPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/read" element={<ReadingHelperPage />} />
            <Route path="/write" element={<WritingPage />} />
            <Route path="/speak" element={<SpeakingPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/game" element={<GamePage />} />
          </Routes>
        </main>

        <nav className="bottom-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📖</span><span className="nav-label">单词</span>
          </NavLink>
          <NavLink to="/review" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">🔄</span><span className="nav-label">复习</span>
          </NavLink>
          <NavLink to="/grammar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📐</span><span className="nav-label">语法</span>
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📝</span><span className="nav-label">笔记</span>
          </NavLink>
          <NavLink to="/read" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📰</span><span className="nav-label">阅读</span>
          </NavLink>
          <NavLink to="/write" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">✍️</span><span className="nav-label">写作</span>
          </NavLink>
          <NavLink to="/speak" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">🗣️</span><span className="nav-label">口语</span>
          </NavLink>
          <NavLink to="/stats" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📊</span><span className="nav-label">统计</span>
          </NavLink>
          <NavLink to="/game" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">🎮</span><span className="nav-label">游戏</span>
          </NavLink>
        </nav>

        <button className="theme-toggle" onClick={toggle}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </HashRouter>
  );
}

export default App;