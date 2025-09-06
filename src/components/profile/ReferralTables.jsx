import s from "../../assets/styles/ReferralTables.module.css";

function Row({ u }) {
   const nick = u?.email?.includes("@") ? u.email.split("@")[0] : (u?.username || "-");
   const dt = u?.referred_at ? new Date(u.referred_at).toLocaleString("ru-RU") : "—";
   return (
      <tr>
         <td>{u.id}</td>
         <td>{nick}</td>
         <td>{u.email}</td>
         <td>{dt}</td>
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
                     {level1.length ? level1.map(u => <Row key={u.id} u={u} />) :
                        <tr><td colSpan="4" className={s.empty}>Нет данных</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>

         <div>
            <h3 className={s.h3}>Рефералы 2 уровня</h3>
            <div className={s.tableWrap}>
               <table className={s.table}>
                  <thead>
                     <tr><th>ID</th><th>Ник</th><th>Email</th><th>Дата</th></tr>
                  </thead>
                  <tbody>
                     {level2.length ? level2.map(u => <Row key={`${u.id}-l2`} u={u} />) :
                        <tr><td colSpan="4" className={s.empty}>Нет данных</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
