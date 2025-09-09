import { useState, useMemo } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import s from "../assets/styles/Sidebar.module.css";
import root from "../assets/styles/Root.module.css";

export default function LayoutSidebar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, profile, login, logout } = useAuth();
  const nick = useMemo(() => {
    const email = user?.email || "";
    if (email.includes("@")) return email.split("@")[0];
    return user?.username || "";
  }, [user]);
  return (
    <div className={s.layout}>
      <div className={s.topbar}>
        <button onClick={()=>setOpen(true)}>☰</button>
        <Link to="/" className={s.brand}>CRYPTOCASE</Link>
      </div>
      {open && <div className={s.backdrop} onClick={()=>setOpen(false)} />}
      <aside className={`${s.sidebar} ${open ? s.sidebarOpen : ""}`}>
        <div className={s.sideCol}>
          <Link to="/" className={s.brand}>CRYPTO<b>CASES</b></Link>
          <nav className={s.nav} onClick={()=>setOpen(false)}>
            <NavLink to="/cases" className={({isActive})=> isActive ? `${s.link} ${s.linkActive}` : s.link}>
              <svg className={s.icon} viewBox="0 0 24 24"><path d="M3 7h18v12H3zM8 3h8l2 4H6z"/></svg>
              Кейсы
            </NavLink>
            <NavLink to="/tickets" className={({isActive})=> isActive ? `${s.link} ${s.linkActive}` : s.link}>
              <svg className={s.icon} viewBox="0 0 24 24"><path d="M4 4h16v12H5l-1 4z"/></svg>
              Тикеты
            </NavLink>
            <NavLink to="/profile" className={({isActive})=> isActive ? `${s.link} ${s.linkActive}` : s.link}>
              <svg className={s.icon} viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"/></svg>
              Профиль
            </NavLink>
          </nav>
          <div className={s.sideFooter}>
            <p>© {new Date().getFullYear()} CRYPTOCASE</p>
          </div>
        </div>
      </aside>
      <main className={s.content}>
        <div className={s.userbar}>
          <Link to="/profile" className={s.userLeft}>
            <svg className={s.icon} viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"/></svg>
            {nick || "Гость"}
          </Link>
          <div className={s.userRight}>
            {isAuthenticated && (
              <span className={s.balance}>
                <svg className={s.icon} viewBox="0 0 24 24">
                  <path d="M3 7h14a2 2 0 0 1 2 2v1h-4a3 3 0 1 0 0 6h4v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm16 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                ${Number(profile?.balance_usd ?? 0).toFixed(2)}
              </span>
            )}
            {!isAuthenticated ? (
              <Link to="/login" className={root.btnPrimary}>
                Войти
              </Link>
            ) : (
              <button className={root.btn} onClick={logout}>
                Выйти
              </button>
            )}
          </div>
        </div>
        <div className={s.inner}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}


