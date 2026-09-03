import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: "Manage users",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    active: true,
  },
  {
    label: "Total Quizzes",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    label: "Active Quizzes",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    label: "Create Quizzes",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
  },
  {
    label: "Total Institution",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    label: "Test Details",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
];

const statCards = [
  {
    count: 10,
    label: "Admins",
    icon: (
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
        <circle cx="26" cy="20" r="10" fill="#1e3a5f"/>
        <path d="M6 52c0-11 9-18 20-18s20 7 20 18" fill="#1e3a5f"/>
        <circle cx="44" cy="44" r="10" fill="#e8edf7" stroke="#1e3a5f" strokeWidth="2"/>
        <path d="M40 44h8M44 40v8" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    count: 10,
    label: "Teachers",
    icon: (
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="20" r="10" fill="#1e3a5f"/>
        <path d="M12 54c0-11 9-18 20-18s20 7 20 18" fill="#1e3a5f"/>
        <rect x="18" y="36" width="28" height="18" rx="3" fill="none" stroke="#1e3a5f" strokeWidth="2"/>
        <line x1="24" y1="42" x2="40" y2="42" stroke="#1e3a5f" strokeWidth="2"/>
        <line x1="24" y1="47" x2="36" y2="47" stroke="#1e3a5f" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    count: 10,
    label: "Students",
    icon: (
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="18" r="9" fill="#1e3a5f"/>
        <path d="M32 10L10 22l22 12 22-12z" fill="#4a7ab5"/>
        <path d="M18 28v10c0 5 6 10 14 10s14-5 14-10V28" fill="#1e3a5f"/>
      </svg>
    ),
  },
  {
    count: 10,
    label: "Normal Users",
    icon: (
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
        <circle cx="20" cy="22" r="8" fill="#9ca3af"/>
        <path d="M2 50c0-9 8-15 18-15" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <circle cx="40" cy="20" r="9" fill="#1e3a5f"/>
        <path d="M22 50c0-10 8-16 18-16s18 6 18 16" fill="#1e3a5f"/>
      </svg>
    ),
  },
];

const actionCards = [
  {
    label: "Create Admin",
    bg: "#c8dff0",
    icon: (
      <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
        <circle cx="38" cy="30" r="18" fill="#1e3a5f"/>
        <path d="M8 75c0-17 13-27 30-27s30 10 30 27" fill="#1e3a5f"/>
        <circle cx="62" cy="65" r="16" fill="#e8edf7" stroke="#c8dff0" strokeWidth="2"/>
        <circle cx="62" cy="57" r="5" fill="#f97316"/>
        <path d="M50 68c0-3 2-5 4-6h8a7 7 0 014 6" fill="#f97316"/>
        <circle cx="72" cy="72" r="8" fill="#c8dff0" stroke="#1e3a5f" strokeWidth="2"/>
        <path d="M68 72h8M72 68v8" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Show Users",
    bg: "#b3b8e0",
    icon: (
      <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
        <circle cx="28" cy="35" r="13" fill="#1a1a2e"/>
        <path d="M6 72c0-13 10-20 22-20" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <circle cx="50" cy="30" r="15" fill="#1a1a2e"/>
        <path d="M22 75c0-14 12-22 28-22s28 8 28 22" fill="#1a1a2e"/>
        <circle cx="72" cy="35" r="13" fill="#1a1a2e"/>
        <path d="M94 72c0-13-10-20-22-20" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    label: "Pending Request",
    bg: "#d8c8f0",
    icon: (
      <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
        <rect x="20" y="15" width="60" height="72" rx="6" fill="white" stroke="#1a1a2e" strokeWidth="3"/>
        <rect x="28" y="22" width="44" height="14" rx="3" fill="#1a1a2e"/>
        <text x="50" y="33" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="sans-serif">PENDING</text>
        <text x="50" y="43" textAnchor="middle" fill="#1a1a2e" fontSize="8" fontWeight="700" fontFamily="sans-serif">APPROVAL</text>
        <circle cx="50" cy="62" r="14" fill="none" stroke="#1a1a2e" strokeWidth="3"/>
        <path d="M43 62l5 5 10-10" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="28" y="82" width="44" height="4" rx="2" fill="#1a1a2e"/>
      </svg>
    ),
  },
];

export default function ManageUsers() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: linear-gradient(135deg, #d4f1ec 0%, #e0f0e8 25%, #e8f4f0 50%, #dde8f5 75%, #e8e0f0 100%);
          min-height: 100vh;
        }

        /* ── NAVBAR ── */
        .navbar {
          background: white;
          border-radius: 0 0 20px 20px;
          padding: 14px 40px;
          display: flex;
          align-items: center;
          gap: 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          position: relative;
          z-index: 50;
        }
        .nav-logo { font-size: 22px; font-weight: 800; color: #2563eb; margin-right: auto; }
        .nav-links { display: flex; gap: 32px; list-style: none; }
        .nav-links li a { text-decoration: none; color: #374151; font-size: 15px; font-weight: 500; }
        .nav-links li a:hover { color: #2563eb; }
        .nav-btn-login {
          background: #e8edf7; color: #374151; border: none;
          padding: 9px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
        }
        .nav-btn-signup {
          background: #1e3a5f; color: white; border: none;
          padding: 9px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
        }
        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px; margin-left: auto;
        }
        .hamburger span { display: block; width: 24px; height: 2.5px; background: #1e3a5f; border-radius: 2px; }
        .mobile-nav-menu {
          display: none; position: absolute; top: 100%; left: 0; right: 0;
          background: white; border-radius: 0 0 16px 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          padding: 16px 24px 20px; flex-direction: column; gap: 12px; z-index: 100;
        }
        .mobile-nav-menu.open { display: flex; }
        .mobile-nav-menu a { text-decoration: none; color: #374151; font-size: 15px; font-weight: 500; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
        .mobile-nav-btns { display: flex; gap: 10px; margin-top: 4px; }
        .mobile-nav-btns button { flex: 1; }

        /* ── PAGE LAYOUT ── */
        .page-layout {
          display: flex;
          gap: 0;
          padding: 20px 24px;
          max-width: 1280px;
          margin: 0 auto;
          align-items: flex-start;
        }

        /* ── LEFT SIDEBAR ── */
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 40;
        }
        .sidebar-overlay.open { display: block; }
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #1e3a5f;
          border-radius: 18px;
          padding: 18px 14px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 560px;
          margin-right: 20px;
        }
        .sidebar-hamburger {
          background: none; border: none; cursor: pointer;
          padding: 4px 6px; margin-bottom: 4px; align-self: flex-start;
        }
        .sidebar-hamburger span {
          display: block; width: 22px; height: 2px;
          background: white; border-radius: 2px; margin: 5px 0;
        }
        .sidebar-nav-item {
          display: flex; align-items: center; gap: 10px;
          background: white; border: none; border-radius: 10px;
          padding: 10px 12px; cursor: pointer; width: 100%;
          text-align: left; transition: background 0.2s;
        }
        .sidebar-nav-item.active { background: #f0f4ff; }
        .sidebar-nav-item:hover { background: #f0f4ff; }
        .sidebar-nav-item .item-label {
          flex: 1; font-size: 13px; font-weight: 600; color: #1e3a5f;
        }
        .sidebar-nav-item .item-arrow {
          font-size: 14px; color: #6b7280; font-weight: 700;
        }
        .sidebar-nav-item .item-icon { color: #1e3a5f; flex-shrink: 0; }
        .sidebar-spacer { flex: 1; min-height: 16px; }
        .sidebar-divider { border: none; border-top: 1px solid rgba(255,255,255,0.25); margin: 4px 0; }
        .sidebar-bottom { display: flex; flex-direction: column; gap: 10px; }
        .sidebar-settings {
          display: flex; align-items: center; justify-content: space-between;
          padding: 4px 6px;
        }
        .sidebar-settings span { color: white; font-size: 16px; font-weight: 800; }
        .sidebar-settings svg { color: white; }
        .sidebar-logout {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.15); border: none; border-radius: 12px;
          padding: 11px 16px; cursor: pointer; width: 100%;
        }
        .sidebar-logout span { color: white; font-size: 15px; font-weight: 700; }

        /* Sidebar mobile toggle btn */
        .sidebar-toggle-btn {
          display: none;
          background: #1e3a5f; border: none; border-radius: 10px;
          padding: 10px 14px; cursor: pointer; margin-bottom: 12px;
          align-items: center; gap: 8px;
        }
        .sidebar-toggle-btn span { color: white; font-size: 14px; font-weight: 600; }
        .sidebar-toggle-btn svg { color: white; }

        /* ── MAIN CONTENT ── */
        .main-content { flex: 1; display: flex; flex-direction: column; gap: 20px; min-width: 0; }

        .page-title-card {
          background: white; border-radius: 16px;
          padding: 18px 32px; text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .page-title-card h2 { font-size: 26px; font-weight: 800; color: #1e3a5f; }

        /* ── STAT CARDS ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px 16px 20px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          min-height: 130px;
        }
        .stat-count { font-size: 20px; font-weight: 800; color: #1e3a5f; }
        .stat-label { font-size: 14px; font-weight: 500; color: #374151; }

        /* ── ACTION CARDS ── */
        .action-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .action-card {
          border-radius: 18px;
          padding: 28px 20px 22px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end;
          gap: 16px;
          min-height: 200px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .action-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.13); }
        .action-card-label { font-size: 17px; font-weight: 700; color: white; text-align: center; }
        .action-icon-wrap { flex: 1; display: flex; align-items: center; justify-content: center; }

        /* ── RESPONSIVE ── */

        /* Tablet */
        @media (max-width: 1024px) {
          .navbar { padding: 14px 20px; gap: 18px; }
          .nav-links { gap: 20px; }
          .sidebar { width: 200px; }
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* Small tablet */
        @media (max-width: 820px) {
          .page-layout { flex-direction: column; padding: 14px 14px; }
          .sidebar {
            position: fixed; top: 0; left: -260px; height: 100vh;
            width: 240px; border-radius: 0 18px 18px 0;
            z-index: 45; transition: left 0.3s; min-height: unset;
            overflow-y: auto; margin-right: 0;
          }
          .sidebar.open { left: 0; }
          .sidebar-toggle-btn { display: flex; align-self: flex-start; }
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .action-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .navbar { padding: 12px 16px; }
          .nav-links, .nav-btn-login, .nav-btn-signup { display: none; }
          .hamburger { display: flex; }
          .page-layout { padding: 12px 10px; gap: 12px; }
          .page-title-card h2 { font-size: 20px; }
          .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .action-grid { grid-template-columns: 1fr; gap: 12px; }
          .action-card { min-height: 160px; flex-direction: row; padding: 20px; justify-content: flex-start; gap: 20px; }
          .action-icon-wrap { flex: 0 0 auto; }
          .action-card-label { font-size: 16px; text-align: left; }
          .stat-card { min-height: 100px; padding: 16px 10px; }
          .stat-count { font-size: 18px; }
        }

        @media (max-width: 400px) {
          .stat-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      {/* <nav className="navbar">
        <span className="nav-logo">LOGO</span>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Education</a></li>
          <li><a href="#">Quiz</a></li>
          <li><a href="#">Humanities &amp; Science</a></li>
        </ul>
        <button className="nav-btn-login">Login</button>
        <button className="nav-btn-signup">Sign Up</button>
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span/><span/><span/>
        </button>
        <div className={`mobile-nav-menu${menuOpen ? " open" : ""}`}>
          <a href="#" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#" onClick={() => setMenuOpen(false)}>Education</a>
          <a href="#" onClick={() => setMenuOpen(false)}>Quiz</a>
          <a href="#" onClick={() => setMenuOpen(false)}>Humanities &amp; Science</a>
          <div className="mobile-nav-btns">
            <button className="nav-btn-login">Login</button>
            <button className="nav-btn-signup">Sign Up</button>
          </div>
        </div>
      </nav> */}

      {/* ── PAGE ── */}
      <div className="page-layout">

        {/* Sidebar overlay (mobile) */}
        <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Mobile sidebar toggle */}
        <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <span>Menu</span>
        </button>

        {/* LEFT SIDEBAR */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <button className="sidebar-hamburger" onClick={() => setSidebarOpen(false)}>
            <span/><span/><span/>
          </button>

          {navItems.map((item) => (
            <button key={item.label} className={`sidebar-nav-item${item.active ? " active" : ""}`}>
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
              <span className="item-arrow">→</span>
            </button>
          ))}

          <div className="sidebar-spacer" />
          <hr className="sidebar-divider" />

          <div className="sidebar-bottom">
            <div className="sidebar-settings">
              <span>Settings</span>
              <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
            </div>
            <button className="sidebar-logout">
              <span>Log Out!</span>
              <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="main-content">
          {/* Title */}
          <div className="page-title-card">
            <h2>Manage Users</h2>
          </div>

          {/* Stat Cards */}
          <div className="stat-grid">
            {statCards.map((card) => (
              <div className="stat-card" key={card.label}>
                {card.icon}
                <div style={{ textAlign: "center" }}>
                  <div className="stat-count">{card.count}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="action-grid">
            {actionCards.map((card) => (
              <div className="action-card" key={card.label} style={{ background: card.bg }}>
                <div className="action-icon-wrap">{card.icon}</div>
                <div className="action-card-label">{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
