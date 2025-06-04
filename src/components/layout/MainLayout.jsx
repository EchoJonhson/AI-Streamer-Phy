import React from 'react';
import { Link } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <header className="header">
        <div className="logo">虚拟AI主播</div>
        <nav className="nav">
          <ul>
            <li><Link to="/">首页</Link></li>
            <li><Link to="/live">直播间</Link></li>
            <li><Link to="/settings">设置</Link></li>
          </ul>
        </nav>
      </header>
      <main className="content">
        {children}
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} 虚拟AI主播 - 基于AI技术的虚拟主播平台</p>
      </footer>
    </div>
  );
};

export default MainLayout; 