import s from "../../assets/styles/ReferralTables.module.css";

function Row({ u, showReferrer = false }) {
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
         <td>{u.id}</td>
         <td>{nick}</td>
         <td>{u.email}</td>
         <td>{dt}</td>
         {showReferrer && refCell}
      </tr>
   );
}

export default function ReferralTables({ level1 = [], level2 = [] }) {
   return (
      <div className={s.grid}>
         <div>
            <h3 className={s.h3}>Рефералы 1 уровня</h3>
            <div className={s.tableWrap}>
               <table className={s.table}>
                  <thead>
                     <tr><th>ID</th><th>Ник</th><th>Email</th><th>Дата</th></tr>
                  </thead>
                  <tbody>
                     {level1.length ? level1.map(u => <Row key={u.id} u={u} />)
                        : <tr><td colSpan="4" className={s.empty}>Нет данных</td></tr>}
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
                        <th>ID</th><th>Ник</th><th>Email</th><th>Дата</th><th>Пригласил (L1)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {level2.length ? level2.map(u => <Row key={`${u.id}-l2`} u={u} showReferrer />)
                        : <tr><td colSpan="5" className={s.empty}>Нет данных</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
