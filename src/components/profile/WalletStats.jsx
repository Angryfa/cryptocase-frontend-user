// src/components/profile/WalletStats.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import root from "../../assets/styles/Root.module.css";
import s from "../../assets/styles/WalletStats.module.css";

const fmtUSD = (v) => (v == null ? "0.00" : Number(v).toFixed(2));

export default function WalletStats() {
   // ❗ Берём profile из контекста, а не через пропс
   const { authFetch, profile, setProfile } = useAuth();

   const [cbBalance, setCbBalance] = useState("0.00");
   const [loading, setLoading] = useState(true);
   const [claiming, setClaiming] = useState(false);

   async function loadCashback() {
      try {
         setLoading(true);
         const r = await authFetch("/api/cashback/me/summary/");
         const d = await r.json();
         if (!r.ok) throw new Error(d?.detail || "Ошибка");
         setCbBalance(d.balance_usd || "0.00");
      } catch (e) {
         console.error(e);
         setCbBalance("0.00");
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      loadCashback();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   async function handleClaim() {
      const amt = Number(cbBalance);
      if (!Number.isFinite(amt) || amt <= 0) return;

      try {
         setClaiming(true);

         // 🔹 Оптимистично обновляем UI сразу
         setProfile((p) => {
            const cur = Number(p?.balance_usd || 0);
            return { ...(p || {}), balance_usd: (cur + amt).toFixed(2) };
         });
         setCbBalance("0.00");

         // 🔹 Запрос к API
         const r = await authFetch("/api/cashback/me/claim/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount_usd: amt.toFixed(2) }),
         });
         const d = await r.json().catch(() => ({}));
         if (!r.ok) throw new Error(d?.detail || "Не удалось зачислить кэшбэк");

         // 🔹 Синхронизация с ответом сервера (точные значения)
         if (d?.profile_balance_usd != null) {
            setProfile((p) => ({ ...(p || {}), balance_usd: d.profile_balance_usd }));
         }
         await loadCashback();

         alert(`Зачислено: $${d?.debited ?? amt.toFixed(2)}`);
      } catch (e) {
         // 🔁 Откат при ошибке: просто перезагрузим фактические данные
         await loadCashback();
         // при желании можно подтянуть /api/profile и обновить setProfile
         alert(e.message || "Ошибка зачисления");
      } finally {
         setClaiming(false);
      }
   }

   const canClaim = !loading && !claiming && Number(cbBalance) > 0;

   return (
      <div className={s.grid}>
         <div className={s.stat}>
            <div className={s.title}>Депозит (всего)</div>
            <div className={s.value}>${fmtUSD(profile?.deposit_total_usd)}</div>
         </div>
         <div className={s.stat}>
            <div className={s.title}>Баланс</div>
            <div className={s.value}>${fmtUSD(profile?.balance_usd)}</div>
         </div>
         <div className={s.stat}>
            <div className={s.title}>Выиграно</div>
            <div className={s.value}>${fmtUSD(profile?.won_total_usd)}</div>
         </div>
         <div className={s.stat}>
            <div className={s.title}>Проиграно</div>
            <div className={s.value}>${fmtUSD(profile?.lost_total_usd)}</div>
         </div>
         <div className={s.stat}>
            <div className={s.title}>Выведено (всего)</div>
            <div className={s.value}>${fmtUSD(profile?.withdrawn_total_usd)}</div>
         </div>

         {/* Кэшбэк */}
         <div className={s.stat}>
            <div className={s.title}>Доступный кэшбэк</div>
            <div className={s.value}>{loading ? "…" : `$${fmtUSD(cbBalance)}`}</div>

            {Number(cbBalance) > 0 && (
               <button
                  className={root.btnPrimary}
                  onClick={handleClaim}
                  disabled={!canClaim}
                  style={{ marginTop: 8 }}
               >
                  {claiming ? "Зачисляем…" : "Зачислить"}
               </button>
            )}
         </div>
      </div>
   );
}
