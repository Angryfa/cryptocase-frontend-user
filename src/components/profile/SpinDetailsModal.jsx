import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../common/Modal";
import styles from "../../assets/styles/SpinDetailsModal.module.css"; // переиспользуем стили

function fmt2(n) { const v = Number(n ?? 0); return Number.isFinite(v) ? v.toFixed(2) : "0.00"; }
async function copy(text) { try { await navigator.clipboard.writeText(String(text)); } catch { } }

/**
 * Props:
 * - open: boolean
 * - spinId: number|null
 * - baseUrl: string  // например: "/api/cases/spins/"
 * - onClose: () => void
 */
export default function SpinDetailsModal({ open, spinId, baseUrl, onClose }) {
   const { authFetch } = useAuth();

   const [details, setDetails] = useState(null);
   const [detailsLoading, setDetailsLoading] = useState(false);
   const [detailsError, setDetailsError] = useState("");
   const [verifying, setVerifying] = useState(false);
   const [verifyResult, setVerifyResult] = useState(null);

   useEffect(() => {
      if (!open || !spinId) return;
      let alive = true;
      setDetails(null);
      setVerifyResult(null);
      setDetailsError("");
      setDetailsLoading(true);

      (async () => {
         try {
            const r = await authFetch(`${baseUrl}${spinId}/`, { headers: { Accept: "application/json" } });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const d = await r.json();
            if (alive) setDetails(d);
         } catch (e) {
            if (alive) setDetailsError("Не удалось получить детали крутки.");
         } finally {
            if (alive) setDetailsLoading(false);
         }
      })();

      return () => { alive = false; };
   }, [open, spinId, baseUrl, authFetch]);

   const runVerify = async () => {
      if (!spinId) return;
      setVerifying(true);
      setVerifyResult(null);
      try {
         const r = await authFetch(`${baseUrl}${spinId}/verify/`, { headers: { Accept: "application/json" } });
         if (!r.ok) throw new Error(`HTTP ${r.status}`);
         const d = await r.json();
         setVerifyResult(d);
      } catch {
         setVerifyResult({ ok: false, error: "Не удалось выполнить проверку." });
      } finally {
         setVerifying(false);
      }
   };
   const totalWeight = Array.isArray(details?.weights_snapshot)
      ? details.weights_snapshot.reduce((s, w) => s + (Number(w?.weight) || 0), 0)
      : 0;


   return (
      <Modal open={open} onClose={onClose} title={`Крутка #${spinId ?? ""}`}>
         {detailsLoading ? (
            <div className={styles.helper}>Загрузка деталей…</div>
         ) : detailsError ? (
            <div className={styles.error}>{detailsError}</div>
         ) : !details ? (
            <div className={styles.helper}>Нет данных.</div>
         ) : (
            <div className={styles.details}>
               <section>
                  <h5>Общее</h5>
                  <div className={styles.kv}><span>ID</span><div className={styles.valueRow}><span className={styles.badge}>#{details.id}</span></div></div>
                  <div className={styles.kv}><span>Дата</span><div className={styles.valueRow}>{new Date(details.created_at).toLocaleString("ru-RU")}</div></div>
                  <div className={styles.kv}><span>Кейс</span><div className={styles.valueRow}>{details.case_name ?? details.case?.name ?? `#${details.case}`}</div></div>
                  <div className={styles.kv}><span>Приз</span><div className={styles.valueRow}>{details.prize_title ?? details.prize?.title ?? "—"}</div></div>
                  <div className={styles.kv}><span>Сумма, $</span><div className={styles.valueRow}><span className={styles.badge}>{fmt2(details.amount_usd ?? details.prize?.amount_usd)}</span></div></div>
               </section>

               <section>
                  <h5>Provably Fair</h5>

                  <div className={styles.kv}>
                     <span>Server Seed Hash</span>
                     <div className={styles.valueRow}>
                        <code className={`${styles.codeBox} ${styles.clip}`}>{details.server_seed_hash}</code>
                        <button className={styles.copyBtn} onClick={() => copy(details.server_seed_hash)}>Копировать</button>
                     </div>
                  </div>

                  <div className={styles.kv}>
                     <span>Server Seed</span>
                     <div className={styles.valueRow}>
                        {"server_seed" in details && details.server_seed ? (
                           <>
                              <code className={`${styles.codeBox} ${styles.clip}`}>{details.server_seed}</code>
                              <button className={styles.copyBtn} onClick={() => copy(details.server_seed)}>Копировать</button>
                           </>
                        ) : (
                           <div className={styles.note}>Скрыт до “ревила”.</div>
                        )}
                     </div>
                  </div>

                  <div className={styles.kv}>
                     <span>Client Seed</span>
                     <div className={styles.valueRow}>
                        <code className={styles.codeBox}>{details.client_seed}</code>
                        <button className={styles.copyBtn} onClick={() => copy(details.client_seed)}>Копировать</button>
                     </div>
                  </div>

                  <div className={styles.kv}>
                     <span>Nonce</span>
                     <div className={styles.valueRow}><span className={styles.badge}>{details.nonce}</span></div>
                  </div>

                  <div className={styles.kv}>
                     <span>Roll Digest</span>
                     <div className={styles.valueRow}>
                        <code className={`${styles.codeBox} ${styles.clip}`}>{details.roll_digest}</code>
                        <button className={styles.copyBtn} onClick={() => copy(details.roll_digest)}>Копировать</button>
                     </div>
                  </div>

                  <div className={styles.kv}>
                     <span>RNG Value</span>
                     <div className={styles.valueRow}><code className={styles.codeBox}>{String(details.rng_value)}</code></div>
                  </div>

                  <button className={styles.primaryBtn} onClick={runVerify} disabled={verifying}>
                     {verifying ? "Проверяем…" : "Проверить честность"}
                  </button>

                  {verifyResult && (
                     <div className={`${styles.verifyBox} ${verifyResult.ok ? styles.ok : styles.bad}`}>
                        <div><strong>Проверка:</strong> {verifyResult.ok ? "ОК" : "НЕ СОВПАЛО"}</div>
                        {verifyResult.checks && (
                           <ul>
                              <li>ServerSeedHash: {String(verifyResult.checks.serverSeedHashMatches)}</li>
                              <li>RollDigest: {String(verifyResult.checks.rollDigestMatches)}</li>
                              <li>Приз совпал: {String(verifyResult.checks.prizeMatches)}</li>
                           </ul>
                        )}
                     </div>
                  )}
               </section>

               {Array.isArray(details.weights_snapshot) && details.weights_snapshot.length > 0 && (
                  <section>
                     <h5>Снимок весов</h5>
                     <div className={styles.weights}>
                        <table>
                           <thead>
                              <tr>
                                 <th>Prize ID</th>
                                 <th className={styles.num}>Вес</th>
                                 <th className={styles.num}>Сумма, $</th>
                                 <th className={styles.num}>Шанс, %</th>
                              </tr>
                           </thead>
                           <tbody>
                              {details.weights_snapshot.map((w, i) => (
                                 <tr key={i}>
                                    <td className={styles.code}>{w.prize_id}</td>
                                    <td className={styles.num}>{w.weight}</td>
                                    <td className={styles.num}>{fmt2(w.amount_usd)}</td>
                                    <td className={styles.num}>{totalWeight ? ((Number(w.weight) / totalWeight) * 100).toFixed(2) : "—"}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </section>
               )}
            </div>
         )}
      </Modal>
   );
}
