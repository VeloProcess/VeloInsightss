import React from 'react';

function Header() {
  return (
    <header className="velohub-header glass-effect">
      <div className="header-content fade-in">
        <div className="header-logo">
          <div className="logo-icon gradient-primary">
            📊
          </div>
          <h1 className="text-gradient">
            Velodados
            <span className="subtitle">Dashboard de Atendimentos</span>
          </h1>
        </div>
        <div className="header-stats">
          <div className="stat-item hover-lift">
            <span className="stat-number pulse-animation">100%</span>
            <span className="stat-label">Eficiência</span>
          </div>
          <div className="stat-item hover-lift">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Disponível</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
