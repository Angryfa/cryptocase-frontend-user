import s from "../../assets/styles/ReferralTables.module.css";

function fmt2(n) {
   const v = Number(n ?? 0);
   return Number.isFinite(v) ? v.toFixed(2) : "0.00";
}

function Row({ u, showReferrer = false, showPercent = false, showAmount = false }) {
   const nick = u?.email?.includes("@") ? u.email.split("@")[0] : (u?.username || "-");
   const dt = u?.referred_at ? new Date(u.referred_at).toLocaleString("ru-RU") : "—";

   let refCell = null;
   if (showReferrer) {
      const rb = u?.referred_by;
      const rbNick = rb?.email?.includes("@") ? rb.email.split("@")[0] : (rb?.username || "-");
      refCell = <td title={rb?.email || ""}>{rb ? rbNick : "—"}</td>;
   }

   return (
      <tr>
         <td>{nick}</td>
         <td>{u.email}</td>
         <td>{dt}</td>
         {showPercent && <td className={s.num}>{u?.percent != null ? `${fmt2(u.percent)}%` : "—"}</td>}
         {showAmount && <td className={s.num}>{u?.earned_usd != null ? `$${fmt2(u.earned_usd)}` : "$0.00"}</td>}
         {showReferrer && refCell}
      </tr>
   );
}

export default function ReferralTables({ level1 = [], level2 = [], level1_percent, level2_percent }) {
   return (
      <div className={s.grid}>
         <div>
            <h3 className={s.h3}>Рефералы 1 уровня</h3>
            <div className={s.tableWrap}>
               <table className={s.table}>
                  <thead>
                     <tr><th>Ник</th><th>Email</th><th>Дата</th><th className={s.num}>Процент</th><th className={s.num}>Доход</th></tr>
                  </thead>
                  <tbody>
                     {level1.length ? level1.map(u => <Row key={u.id} u={u} showPercent showAmount />)
                        : <tr><td colSpan="5" className={s.empty}>Нет данных</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>

         <div>
            <h3 className={s.h3}>Рефералы 2 уровня</h3>
            <div className={s.tableWrap}>
               <table className={s.table}>
                  <thead>
                     <tr>
                        <th>Ник</th><th>Email</th><th>Дата</th><th className={s.num}>Процент</th><th className={s.num}>Доход</th><th>Пригласил (L1)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {level2.length ? level2.map(u => <Row key={`${u.id}-l2`} u={u} showReferrer showPercent showAmount />)
                        : <tr><td colSpan="6" className={s.empty}>Нет данных</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
