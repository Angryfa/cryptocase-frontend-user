// src/components/profile/SpinHistory.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "../../assets/styles/SpinHistory.module.css";
import SpinDetailsModal from "../profile/SpinDetailsModal";
import root from "../../assets/styles/Root.module.css";

function fmt2(n) {
   const v = Number(n ?? 0);
   return Number.isFinite(v) ? v.toFixed(2) : "0.00";
}

export default function SpinHistory({ fetchUrl = "/api/spins/my/", }) {
   const { authFetch } = useAuth();

   const [data, setData] = useState({ results: [], count: 0 });
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);
   const [loading, setLoading] = useState(false);
   const [err, setErr] = useState("");

   // modal state
   const [open, setOpen] = useState(false);
   const [activeId, setActiveId] = useState(null);

   // derive base: "/api/spins/my/" -> "/api/spins/"
   const baseUrl = useMemo(() => fetchUrl.replace(/\/my\/?$/, "/"), [fetchUrl]);

   const query = useMemo(() => {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("page_size", pageSize);
      params.set("ordering", "-created_at");
      return params.toString();
   }, [page, pageSize]);

   useEffect(() => {
      let alive = true;
      (async () => {
         setLoading(true);
         setErr("");
         try {
            const resp = await authFetch(`${fetchUrl}?${query}`, {
               headers: { Accept: "application/json" },
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();
            const results = Array.isArray(json?.results) ? json.results : (json?.spins || []);
            const count = Number.isFinite(json?.count) ? json.count : results.length;
            if (alive) setData({ results, count });
         } catch (e) {
            if (alive) setErr("Не удалось загрузить историю круток.");
         } finally {
            if (alive) setLoading(false);
         }
      })();
      return () => { alive = false; };
   }, [authFetch, fetchUrl, query]);

   const totalPages = Math.max(1, Math.ceil((data.count || 0) / pageSize));


   const openDetails = (id) => {
      setActiveId(id);
      setOpen(true);
   };




   return (
      <>
         <h3 style={{ marginTop: 0 }}>История круток</h3>

         <div className={styles.controls}>
            <label className={styles.pageSize}>
               На странице:
               <select
                  value={pageSize}
                  onChange={e => { setPage(1); setPageSize(Number(e.target.value)); }}
               >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
               </select>
            </label>
         </div>

         <div className={styles.tableWrap}>
            {loading ? (
               <div className={styles.helper}>Загрузка…</div>
            ) : err ? (
               <div className={styles.error}>{err}</div>
            ) : (data.results || []).length === 0 ? (
               <div className={styles.helper}>Пока нет круток.</div>
            ) : (
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th>Когда</th>
                        <th>Кейс</th>
                        <th>Приз</th>
                        <th>Сумма, $</th>
                        <th>Действие</th>
                     </tr>
                  </thead>
                  <tbody>
                     {data.results.map(sp => {
                        const caseName =
                           sp.case_name ??
                           sp.case?.name ??
                           (typeof sp.case === "number" ? `#${sp.case}` : "—");
                        const prizeTitle = sp.prize_title ?? sp.prize?.title ?? "—";
                        const amountUsd = sp.amount_usd ?? sp.prize?.amount_usd;

                        return (
                           <tr key={sp.id}>
                              <td>{sp.id}</td>
                              <td>{sp.created_at ? new Date(sp.created_at).toLocaleString("ru-RU") : "—"}</td>
                              <td>{caseName}</td>
                              <td>{prizeTitle}</td>
                              <td>{fmt2(amountUsd)}</td>
                              <td>
                                 <button className={root.btnLink} onClick={() => openDetails(sp.id)}>
                                    Подробнее
                                 </button>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            )}
         </div>

         {!loading && !err && data.count > pageSize && (
            <div className={styles.pagination}>
               <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  Назад
               </button>
               <span>{page} / {totalPages}</span>
               <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  Вперёд
               </button>
            </div>
         )}
         <SpinDetailsModal
            open={open}
            onClose={() => setOpen(false)}
            spinId={activeId}
            baseUrl={baseUrl}
         />
      </>
   );
}
