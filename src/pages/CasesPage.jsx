import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import root from "../assets/styles/Root.module.css";
import s from "../assets/styles/CasesPage.module.css";
import SpinInfoModal from "../components/SpinInfoModal";

function fmt(dt) {
   try {
      return new Date(dt).toLocaleString("ru-RU", {
         day: "2-digit", month: "2-digit", year: "numeric",
         hour: "2-digit", minute: "2-digit"
      });
   } catch { return ""; }
}


export default function CasesPage() {
   const API = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8002";
   const { isAuthenticated, authFetch, setProfile } = useAuth();
   const nav = useNavigate();

   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [err, setErr] = useState("");
   const [spinningId, setSpinningId] = useState(null);

   // PF: последние данные по кейсам
   const [lastPFByCaseId, setLastPFByCaseId] = useState({});
   const [pfModal, setPfModal] = useState({ open: false, data: null });

   useEffect(() => {
      let alive = true;
      (async () => {
         try {
            setErr(""); setLoading(true);
            const r = await fetch(`${API}/api/cases/?all=1`);
            const d = await r.json();
            if (alive) setItems((Array.isArray(d) ? d : []).filter(c => c.is_active));
         } catch {
            if (alive) setErr("Не удалось загрузить кейсы");
         } finally {
            if (alive) setLoading(false);
         }
      })();
      return () => { alive = false; };
   }, [API]);

   const handleSpin = async (id) => {
      if (!isAuthenticated) {
         nav("/login", { state: { from: { pathname: "/cases" } } });
         return;
      }
      setSpinningId(id);
      try {
         const r = await authFetch(`/api/cases/${id}/spin/`, { method: "POST" });
         const d = await r.json().catch(() => ({}));
         if (r.ok) {
            setItems(prev => prev.map(c => (c.id === id ? { ...c, ...d.case } : c)));
            if (d.profile) setProfile(d.profile);

            const prizeUsd = d?.spin?.prize?.amount_usd ?? "?";
            alert(`Выпало: $${prizeUsd}`);

            const pf = d?.provably_fair || null;
            if (pf) {
               const payload = { ...pf, prize: d?.spin?.prize || null, spinId: d?.spin?.id || null };
               setLastPFByCaseId(prev => ({ ...prev, [id]: payload }));
               setPfModal({ open: true, data: payload });
            }
         } else {
            alert(d?.detail || "Не удалось прокрутить");
         }
      } finally {
         setSpinningId(null);
      }
   };

   const openInfo = (caseId) => {
      const data = lastPFByCaseId[caseId];
      if (!data) return;
      setPfModal({ open: true, data });
   };

   return (
      <div className={root.container}>
         <h1 className={s.title}>Кейсы</h1>
         {err && <div className={s.error}>{err}</div>}
         {loading && <div className={s.loading}>Загрузка…</div>}
         <div className={s.grid}>
            {items.map((c) => {
               const isLimited = !!c?.type?.is_limited;
               const isTimed = !!c?.type?.is_timed;
               const availableFrom = c?.available_from ? new Date(c.available_from) : null;
               const availableTo = c?.available_to ? new Date(c.available_to) : null;
               const canSpin =
                  c.is_available_now &&
                  (!isLimited || (c.spins_remaining ?? Infinity) > 0);
               const disabled = spinningId === c.id || !canSpin;
               let disabledReason = "";
               if (!c.is_available_now) {
                  if (isTimed && availableFrom && Date.now() < +availableFrom) {
                     disabledReason = `Доступен с ${fmt(availableFrom)}`;
                  } else if (isTimed && availableTo && Date.now() > +availableTo) {
                     disabledReason = "Время истекло";
                  } else {
                     disabledReason = "Кейс недоступен";
                  }
               } else if (isLimited && (c.spins_remaining ?? 0) <= 0) {
                  disabledReason = "Лимит круток исчерпан";
               }
               const hasPF = !!lastPFByCaseId[c.id];
               return (
                  <article key={c.id} className={s.card}>
                     <header className={s.cardHead}>
                        <h2 className={s.name}>{c.name}</h2>
                        <div className={s.badges}>
                           {c?.type?.type && <span className={s.badgeType}>{c.type.type}</span>}
                           {isTimed && availableFrom && Date.now() < +availableFrom && (
                              <span className={`${s.badge} ${s.badgeOutline}`}>с {fmt(availableFrom)}</span>
                           )}
                           {isTimed && availableTo && Date.now() > +availableTo && (
                              <span className={`${s.badge} ${s.badgeGray}`}>истёк</span>)}
                           {!canSpin && !isTimed && (
                              <span className={`${s.badge} ${s.badgeGray}`}>недоступен</span>
                           )}
                        </div>
                     </header>
                     <div className={s.meta}>
                        {isLimited && (
                           <div className={s.spins}>
                              Осталось круток: <b>{c.spins_remaining}</b>
                           </div>
                        )}
                     </div>
                     {isTimed && (
                        <div className={s.window}>
                           Доступность:&nbsp;
                           {availableFrom ? `с ${fmt(availableFrom)}` : "—"}
                           {availableTo ? ` до ${fmt(availableTo)}` : ""}
                        </div>
                     )}
                     <div className={s.actions} style={{ gap: 8 }}>
                        <div className={s.price}>${c.price_usd}</div>
                        <button
                           className={`${root.btnPrimary} ${s.btn}`}
                           onClick={() => handleSpin(c.id)}
                           disabled={disabled}
                           title={disabled ? disabledReason : ""}
                        >
                           {spinningId === c.id ? "Открываем…" : disabled ? "не доступен" : "Открыть"}
                        </button>

                        {hasPF && (
                           <button
                              className={`${root.btn} ${s.btn}`}
                              onClick={() => openInfo(c.id)}
                              title="Показать детали Provably Fair"
                           >
                              Info
                           </button>
                        )}
                     </div>
                  </article>
               )
            })}
         </div>
         <SpinInfoModal
            open={pfModal.open}
            onClose={() => setPfModal({ open: false, data: null })}
            data={pfModal.data}
         />
      </div>
   );
}
