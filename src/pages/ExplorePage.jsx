import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import root from "../assets/styles/Root.module.css";

export default function ExplorePage() {
   const API = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8002";
   const { isAuthenticated, user, authFetch } = useAuth();

   const [health, setHealth] = useState(null);
   const [me, setMe] = useState(null);
   const [profile, setProfile] = useState(null);
   const [bio, setBio] = useState("");
   const [telegram, setTelegram] = useState("");
   const [status, setStatus] = useState("");

   const ping = async () => {
      setStatus("");
      const r = await fetch(`${API}/api/health/`);
      setHealth(await r.json().catch(() => null));
   };

   const loadMe = async () => {
      setStatus("");
      const r = await authFetch("/api/auth/me/");
      if (r.ok) {
         const d = await r.json();
         setMe(d);
      } else {
         setMe(null);
         setStatus(`me: ${r.status}`);
      }
   };

   const loadProfile = async () => {
      setStatus("");
      const r = await authFetch("/api/auth/profile/");
      if (r.ok) {
         const d = await r.json();
         setProfile(d);
         setBio(d?.bio || "");
         setTelegram(d?.telegram || "");
      } else {
         setProfile(null);
         setStatus(`profile: ${r.status}`);
      }
   };

   const saveProfile = async (e) => {
      e.preventDefault();
      setStatus("");
      const r = await authFetch("/api/auth/profile/", {
         method: "PATCH",
         body: JSON.stringify({ bio, telegram }),
      });
      if (r.ok) {
         const d = await r.json();
         setProfile(d);
         setStatus("Профиль сохранён");
      } else {
         setStatus(`Ошибка сохранения: ${r.status}`);
      }
   };

   return (
      <div className={root.container}>
         <h1>Тест интеграции фронт ↔ бэк</h1>

         {/* HEALTH */}
         <div className={root.card} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
               <button className={root.btn} onClick={ping}>Пингануть /api/health/</button>
               <code>{API}/api/health/</code>
            </div>
            {health && (
               <pre style={{ marginTop: 12 }}>{JSON.stringify(health, null, 2)}</pre>
            )}
         </div>

         {/* AUTH STATE */}
         <div className={root.card} style={{ marginBottom: 16 }}>
            <p>
               Аутентификация: <strong>{isAuthenticated ? "ДА" : "НЕТ"}</strong>{" "}
               {!isAuthenticated && (
                  <>
                     — <Link to="/login">Войти</Link> / <Link to="/register">Регистрация</Link>
                  </>
               )}
            </p>
            {user && (
               <p style={{ opacity: 0.8, fontSize: 14 }}>
                  Пользователь: {user?.email || user?.username || "—"}
               </p>
            )}
         </div>

         {/* ME */}
         <div className={root.card} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
               <button className={root.btn} onClick={loadMe} disabled={!isAuthenticated}>
                  Загрузить /api/auth/me/
               </button>
               <span style={{ fontSize: 13, opacity: 0.7 }}>
                  Требует Authorization: Bearer &lt;access&gt;
               </span>
            </div>
            {me && (
               <pre style={{ marginTop: 12 }}>{JSON.stringify(me, null, 2)}</pre>
            )}
         </div>

         {/* PROFILE VIEW/EDIT */}
         <div className={root.card}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
               <button className={root.btn} onClick={loadProfile} disabled={!isAuthenticated}>
                  Загрузить /api/auth/profile/
               </button>
               <span style={{ fontSize: 13, opacity: 0.7 }}>
                  Просмотр/изменение профиля
               </span>
            </div>

            {profile && (
               <form onSubmit={saveProfile} style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <label>
                     <div style={{ fontSize: 13, opacity: 0.8 }}>Bio</div>
                     <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        style={{ width: "100%", minHeight: 80, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                     />
                  </label>
                  <label>
                     <div style={{ fontSize: 13, opacity: 0.8 }}>Telegram</div>
                     <input
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                     />
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                     <button className={root.btn} type="submit">Сохранить</button>
                     <button className={root.btn} type="button" onClick={loadProfile}>Обновить</button>
                  </div>
               </form>
            )}

            {status && <div style={{ marginTop: 10, fontSize: 14, opacity: 0.8 }}>{status}</div>}
         </div>
      </div>
   );
}
