// Sistema de Toggle de Tema VeloHub
import React from 'react';

export class ThemeToggle {
  constructor() {
    this.isDarkMode = false;
    this.init();
  }

  init() {
    // Carregar tema salvo
    this.loadSavedTheme();
    
    // Criar botão de toggle
    this.createToggleButton();
    
    // Aplicar tema inicial
    this.applyTheme();
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('velohub-theme') || 'light';
    this.isDarkMode = savedTheme === 'dark';
  }

  createToggleButton() {
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = this.isDarkMode ? '☀️' : '🌙';
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.onclick = () => this.toggleTheme();
    
    // Adicionar ao body
    document.body.appendChild(toggleBtn);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.saveTheme();
    this.updateToggleButton();
  }

  applyTheme() {
    const root = document.documentElement;
    
    if (this.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  saveTheme() {
    const theme = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem('velohub-theme', theme);
  }

  updateToggleButton() {
    const btn = document.querySelector('.theme-toggle-btn');
    if (btn) {
      btn.innerHTML = this.isDarkMode ? '☀️' : '🌙';
    }
  }
}

// Hook React para tema
export const useTheme = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('velohub-theme') || 'light';
    const isDarkMode = savedTheme === 'dark';
    setIsDark(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('velohub-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('velohub-theme', 'light');
    }
  };

  return { isDark, toggleTheme };
};
