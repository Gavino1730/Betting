import React from 'react';
import '../styles/About.css';

function About() {
  const stats = {
    revisions: 325,
    developer: 'Gavin Galan',
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
      backend: 'v1.0.0 - Production',
      frontend: 'v1.0.0 - Production',
      database: 'PostgreSQL 14+ (Supabase)'
    },
    timeline: {
      startDate: 'December 17, 2025',
      endDate: 'January 4, 2026',
      daysElapsed: 18,
      totalFiles: 52337,
      totalFolders: 7731
    }
  };

  return (
    <div className="about-page">
      <div className="about-header">
        <h1>ℹ️ About Valiant Picks</h1>
        <p>Project Overview & Development Details</p>
      </div>

      <div className="about-container">
        {/* Mission Section */}
        <section className="about-section mission-section">
          <h2>🎯 Our Mission</h2>
          <div className="mission-content">
            <p>
              Valiant Picks was created with a simple but powerful goal: <strong>to bring our community together</strong> and foster genuine engagement with Valiants sports.
            </p>
            
            <div className="mission-grid">
              <div className="mission-card">
                <div className="mission-icon">👥</div>
                <h3>Build Community</h3>
                <p>Connect teachers, students, parents, and players in a shared experience that goes beyond the game.</p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">🏟️</div>
                <h3>Increase Attendance</h3>
                <p>Give everyone a reason to show up to games and support our teams with increased excitement and friendly competition.</p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">⚡</div>
                <h3>Boost Engagement</h3>
                <p>Create a fun, accessible way for everyone to get involved with sports teams and stay invested in their success.</p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">🤝</div>
                <h3>Strengthen Connections</h3>
                <p>Foster meaningful bonds between players, supporters, and the wider community through interactive participation.</p>
              </div>
            </div>

            <p className="mission-closer">
              By combining the excitement of sports with a virtual betting platform, Valiant Picks transforms how we experience games together. 
              It's not just about predictions—it's about building a vibrant community where everyone feels invested, supported, and connected.
            </p>
          </div>
        </section>

        {/* Git Stats */}
        <section className="about-section">
          <h2>📈 Development History</h2>
          <div className="sole-creator">
            <div className="creator-title">✨ Entirely Created By</div>
            <div className="creator-name">{stats.developer}</div>
            <div className="creator-subtitle">All {stats.revisions} revisions across {Object.values(stats.files).reduce((a, b) => a + b, 0)} tracked files</div>
          </div>
          <div className="about-grid">
            <div className="stat-card highlight">
              <div className="stat-number">{stats.revisions}</div>
              <div className="stat-label">Total Revisions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{Object.values(stats.files).reduce((a, b) => a + b, 0)}</div>
              <div className="stat-label">Tracked Files</div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="about-section timeline-section">
          <h2>⏱️ Development Timeline</h2>
          <div className="timeline-content">
            <div className="timeline-item">
              <span className="timeline-label">Project Created</span>
              <span className="timeline-date">{stats.timeline.startDate}</span>
            </div>
            <div className="timeline-divider">↓</div>
            <div className="timeline-item">
              <span className="timeline-label">Completed</span>
              <span className="timeline-date">{stats.timeline.endDate}</span>
            </div>
          </div>
          <div className="timeline-stats">
            <div className="timeline-stat-card">
              <div className="timeline-stat-number">{stats.timeline.daysElapsed}</div>
              <div className="timeline-stat-label">Days</div>
            </div>
            <div className="timeline-stat-card">
              <div className="timeline-stat-number">{stats.timeline.totalFiles.toLocaleString()}</div>
              <div className="timeline-stat-label">Total Files</div>
            </div>
            <div className="timeline-stat-card">
              <div className="timeline-stat-number">{stats.timeline.totalFolders.toLocaleString()}</div>
              <div className="timeline-stat-label">Total Folders</div>
            </div>
          </div>
        </section>

        {/* Language Breakdown */}
        <section className="about-section">
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
        <section className="about-section">
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
        <section className="about-section">
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
        <section className="about-section">
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
        <section className="about-section">
          <h2>🔄 Versions</h2>
          <div className="deployment-cards">
            <div className="deploy-card">
              <div className="deploy-label">Backend API</div>
              <div className="deploy-value">{stats.deployment.backend}</div>
            </div>
            <div className="deploy-card">
              <div className="deploy-label">Frontend Client</div>
              <div className="deploy-value">{stats.deployment.frontend}</div>
            </div>
            <div className="deploy-card">
              <div className="deploy-label">Database</div>
              <div className="deploy-value">{stats.deployment.database}</div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="about-section summary-section">
          <h2>✨ Project Overview</h2>
          <div className="summary-content">
            <p>
              <strong>Valiant Picks</strong> is a full-stack sports betting web application developed from the ground up by <strong>Gavin Galan</strong>. 
              Built for Valiants sports, this application enables users to place confidence-based bets on games with virtual Valiant Bucks, 
              manage teams and player rosters, track betting history, and compete on a public leaderboard.
            </p>
            
            <h3>Technical Architecture</h3>
            <p>
              The application follows a modern full-stack monorepo architecture with a React 18.2.0 frontend hosted on Cloudflare Pages and an Express.js 
              backend deployed on Railway. Data is persisted in a PostgreSQL database through Supabase, ensuring reliability and scalability. Authentication 
              is handled via JWT tokens with bcryptjs password hashing, providing secure user sessions. The entire codebase spans <strong>79 tracked files</strong> 
              across <strong>325 commits</strong>, demonstrating consistent development and iteration.
            </p>

            <h3>Key Capabilities</h3>
            <p>
              Users can authenticate, browse available games, place bets with three confidence levels (Low 1.2x, Medium 1.5x, High 2.0x), track their betting 
              history, view real-time leaderboards, and explore team rosters with detailed player information. Admin users gain access to a comprehensive dashboard 
              for managing games, teams, players, bets, and user balances. The application supports prop bets with custom odds, automatic bet resolution upon game 
              completion, and transaction history tracking for complete financial transparency.
            </p>

            <h3>User Experience</h3>
            <p>
              The frontend is fully responsive across five breakpoints (1024px+, 768px, 520px, 480px, and below) ensuring seamless experiences on desktop, tablet, 
              and mobile devices. Features include a mobile slide-out navigation menu, real-time balance updates, animated notifications, onboarding modals for new 
              users, and intuitive forms for placing bets. The interface uses a professional color scheme anchored by #004f9e Valiant blue with careful attention 
              to accessibility and visual hierarchy.
            </p>

            <h3>Data & Security</h3>
            <p>
              The database includes 8 core models (User, Game, Team, Bet, PropBet, Notification, Player, Transaction) with Row-Level Security (RLS) policies 
              for data protection. All API endpoints are protected with JWT middleware, and user inputs are validated server-side. The system maintains referential 
              integrity through foreign keys, prevents overbetting by validating user balances, and automatically calculates and credits winnings upon bet resolution.
            </p>

            <div className="summary-highlights">
              <div className="highlight-item">
                <span className="highlight-icon">🎯</span>
                <span>Full-stack monorepo with clear separation of concerns</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">📱</span>
                <span>5-breakpoint responsive design for all devices</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🔐</span>
                <span>JWT + RLS security with server-side validation</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">⚡</span>
                <span>Production-ready with Railway + Cloudflare deployment</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🎲</span>
                <span>Confidence-based betting system with live odds</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">📊</span>
                <span>Real-time leaderboards and transaction tracking</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
