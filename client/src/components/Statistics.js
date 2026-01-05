import React from 'react';
import '../styles/Statistics.css';

function Statistics() {
  const stats = {
    commits: 325,
    developers: ['Gavino1730 (324)', 'Gavin Galan (1)'],
    files: {
      javascript: 45,
      css: 17,
      json: 4,
      images: 5,
      markdown: 2,
      sql: 1,
      html: 1
    },
    languages: [
      { name: 'JavaScript', percentage: 60, count: 45, color: '#F7DF1E' },
      { name: 'CSS', percentage: 21, count: 17, color: '#264de4' },
      { name: 'JSON', percentage: 5, count: 4, color: '#292929' },
      { name: 'Markdown', percentage: 5, count: 2, color: '#083fa1' },
      { name: 'Other', percentage: 9, count: 5, color: '#888a9b' }
    ],
    components: [
      { category: 'React Components', count: 15 },
      { category: 'CSS Stylesheets', count: 17 },
      { category: 'API Routes', count: 8 },
      { category: 'Database Models', count: 8 },
      { category: 'Middleware', count: 2 },
      { category: 'Utilities', count: 5 }
    ],
    stack: [
      { name: 'React', version: '18.2.0', role: 'Frontend' },
      { name: 'Express.js', version: '-', role: 'Backend' },
      { name: 'PostgreSQL', version: '-', role: 'Database' },
      { name: 'Supabase', version: '-', role: 'Database Service' },
      { name: 'JWT + bcryptjs', version: '-', role: 'Authentication' },
      { name: 'Axios', version: '-', role: 'HTTP Client' },
      { name: 'CSS3', version: '-', role: 'Styling' }
    ],
    deployment: {
      backend: 'Railway',
      frontend: 'Cloudflare Pages',
      domain: 'valiantpicks.com'
    }
  };

  return (
    <div className="statistics-page">
      <div className="stats-header">
        <h1>📊 Project Statistics</h1>
        <p>Valiant Picks Development Overview</p>
      </div>

      <div className="stats-container">
        {/* Git Stats */}
        <section className="stats-section">
          <h2>📈 Development History</h2>
          <div className="stats-grid">
            <div className="stat-card highlight">
              <div className="stat-number">{stats.commits}</div>
              <div className="stat-label">Total Commits</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.developers.length}</div>
              <div className="stat-label">Active Developers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{Object.values(stats.files).reduce((a, b) => a + b, 0)}</div>
              <div className="stat-label">Tracked Files</div>
            </div>
          </div>
          <div className="developers-list">
            <h3>👥 Contributors</h3>
            {stats.developers.map((dev, idx) => (
              <div key={idx} className="dev-badge">{dev}</div>
            ))}
          </div>
        </section>

        {/* Language Breakdown */}
        <section className="stats-section">
          <h2>💻 Language Breakdown</h2>
          <div className="language-charts">
            {stats.languages.map((lang, idx) => (
              <div key={idx} className="language-item">
                <div className="language-header">
                  <span className="lang-name">{lang.name}</span>
                  <span className="lang-count">{lang.count} files</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                  />
                </div>
                <div className="lang-percentage">{lang.percentage}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* Files by Type */}
        <section className="stats-section">
          <h2>📁 Files by Type</h2>
          <div className="files-grid">
            <div className="file-card">
              <div className="file-icon">📄</div>
              <div className="file-name">JavaScript</div>
              <div className="file-count">{stats.files.javascript}</div>
            </div>
            <div className="file-card">
              <div className="file-icon">🎨</div>
              <div className="file-name">CSS</div>
              <div className="file-count">{stats.files.css}</div>
            </div>
            <div className="file-card">
              <div className="file-icon">⚙️</div>
              <div className="file-name">JSON</div>
              <div className="file-count">{stats.files.json}</div>
            </div>
            <div className="file-card">
              <div className="file-icon">📊</div>
              <div className="file-name">Images</div>
              <div className="file-count">{stats.files.images}</div>
            </div>
            <div className="file-card">
              <div className="file-icon">📝</div>
              <div className="file-name">Markdown</div>
              <div className="file-count">{stats.files.markdown}</div>
            </div>
            <div className="file-card">
              <div className="file-icon">🗄️</div>
              <div className="file-name">SQL</div>
              <div className="file-count">{stats.files.sql}</div>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="stats-section">
          <h2>🏗️ Architecture Breakdown</h2>
          <div className="architecture-grid">
            {stats.components.map((comp, idx) => (
              <div key={idx} className="arch-card">
                <div className="arch-count">{comp.count}</div>
                <div className="arch-label">{comp.category}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="stats-section">
          <h2>🛠️ Tech Stack</h2>
          <div className="tech-table">
            <table>
              <thead>
                <tr>
                  <th>Technology</th>
                  <th>Version</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {stats.stack.map((tech, idx) => (
                  <tr key={idx}>
                    <td className="tech-name">{tech.name}</td>
                    <td className="tech-version">{tech.version}</td>
                    <td className="tech-role">{tech.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Deployment */}
        <section className="stats-section">
          <h2>🚀 Deployment</h2>
          <div className="deployment-cards">
            <div className="deploy-card">
              <div className="deploy-label">Backend</div>
              <div className="deploy-value">{stats.deployment.backend}</div>
            </div>
            <div className="deploy-card">
              <div className="deploy-label">Frontend</div>
              <div className="deploy-value">{stats.deployment.frontend}</div>
            </div>
            <div className="deploy-card">
              <div className="deploy-label">Domain</div>
              <div className="deploy-value">{stats.deployment.domain}</div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="stats-section summary-section">
          <h2>✨ Project Summary</h2>
          <div className="summary-content">
            <p>
              <strong>Valiant Picks</strong> is a full-stack sports betting web application built for Valiant Academy basketball. 
              With <strong>{stats.commits} commits</strong> of development, the application features a comprehensive betting system, 
              team management, real-time leaderboards, and an admin dashboard.
            </p>
            <div className="summary-highlights">
              <div className="highlight-item">
                <span className="highlight-icon">🎯</span>
                <span>Full-stack monorepo architecture</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">📱</span>
                <span>Responsive design with 5 breakpoints</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🔐</span>
                <span>JWT authentication + RLS policies</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🌐</span>
                <span>Production-ready deployment</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Statistics;
