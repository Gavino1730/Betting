import React from 'react';
import '../styles/Footer.css';

function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <button 
            className="footer-link"
            onClick={() => onNavigate('about')}
          >
            About
          </button>
          <span className="footer-divider">•</span>
          <a href="https://valiantpicks.com" className="footer-link" target="_blank" rel="noopener noreferrer">
            Website
          </a>
          <span className="footer-divider">•</span>
          <a href="mailto:support@valiantpicks.com" className="footer-link">
            Contact
          </a>
        </div>
        <div className="footer-credit">
          <p>© 2026 Valiant Picks. Built by Gavin Galan.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
