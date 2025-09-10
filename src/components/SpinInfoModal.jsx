// src/components/SpinInfoModal.jsx
import { useState } from "react";
import { sha256Hex, hmacSha256Hex, rngFromDigestHex, almostEqual } from "../utils/pf";
import root from "../assets/styles/Root.module.css";

function Modal({ open, onClose, children, title = "Инфо" }) {
   if (!open) return null;
   return (
      <div style={{
         position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
         display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
      }}>
         <div style={{ background: "#fff", borderRadius: 12, padding: 20, width: "min(720px, 95vw)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
               <h3 style={{ margin: 0 }}>{title}</h3>
               <button className={root.btn} onClick={onClose}>×</button>
            </div>
            <div>{children}</div>
         </div>
      </div>
   );
}


export default function SpinInfoModal({ open, onClose, data }) {
   const [verifying, setVerifying] = useState(false);
   const [result, setResult] = useState(null);
   const [error, setError] = useState("");

   const verify = async () => {
      try {
         setVerifying(true); setError(""); setResult(null);
         const { serverSeed, serverSeedHash, clientSeed, nonce, rngValue, rollDigest } = data || {};
         const computedHash = await sha256Hex(serverSeed || "");
         const hashOk = (computedHash === serverSeedHash);

         const msg = `${clientSeed}:${nonce}`;
         const hmacHex = await hmacSha256Hex(serverSeed || "", msg);
         const digestOk = (hmacHex === rollDigest);

         const rng = rngFromDigestHex(hmacHex);
         const rngOk = almostEqual(rng, rngValue);

         setResult({ hashOk, digestOk, rngOk, computedHash, hmacHex, rngComputed: rng });
      } catch (e) {
         setError("Локальная проверка не удалась");
      } finally {
         setVerifying(false);
      }
   };

   return (
      <Modal open={open} onClose={onClose} title="Provably Fair — детали прокрутки">
         {data ? (
            <div style={{ display: "grid", gap: 10 }}>
               {data?.prize && (
                  <div><b>Приз:</b> ${data.prize.amount_usd} — {data.prize.title}</div>
               )}
               {data?.spinId && (
                  <div><b>Spin ID:</b> {data.spinId}</div>
               )}
               <div><b>Server Seed Hash:</b> <code>{data.serverSeedHash}</code></div>
               {"serverSeed" in data && data.serverSeed && (
                  <div><b>Server Seed:</b> <code>{data.serverSeed}</code></div>
               )}
               <div><b>Client Seed:</b> <code>{data.clientSeed}</code></div>
               <div><b>Nonce:</b> <code>{data.nonce}</code></div>
               <div><b>HMAC (rollDigest):</b> <code>{data.rollDigest}</code></div>
               <div><b>RNG Value:</b> <code>{data.rngValue}</code></div>

               <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                     className={root.btnPrimary}
                     onClick={verify}
                     disabled={verifying || !data?.serverSeed}
                     title={!data?.serverSeed ? "Проверка доступна, когда сервер раскрывает Server Seed" : ""}
                  >
                     {verifying ? "Проверяем…" : "Проверить локально"}
                  </button>

                  {data?.spinId && (
                     <a
                        className={root.btn}
                        href={`/provably-fair/verify?serverSeed=${encodeURIComponent(data.serverSeed || "")}&serverSeedHash=${encodeURIComponent(data.serverSeedHash || "")}&clientSeed=${encodeURIComponent(data.clientSeed || "")}&nonce=${encodeURIComponent(data.nonce || "")}&rollDigest=${encodeURIComponent(data.rollDigest || "")}&rngValue=${encodeURIComponent(data.rngValue || "")}&spinId=${encodeURIComponent(data.spinId)}`}
                        target="_blank" rel="noreferrer"
                     >
                        Открыть страницу верификации
                     </a>
                  )}
               </div>

               {result && (
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "#f6f7fb" }}>
                     <div><b>Хеш совпал:</b> {result.hashOk ? "Да" : "Нет"}</div>
                     <div><b>HMAC совпал:</b> {result.digestOk ? "Да" : "Нет"}</div>
                     <div><b>RNG совпал:</b> {result.rngOk ? "Да" : "Нет"}</div>
                     <details style={{ marginTop: 8 }}>
                        <summary>Тех. детали</summary>
                        <div><b>SHA256(serverSeed) локально:</b> <code>{result.computedHash}</code></div>
                        <div><b>HMAC локально:</b> <code>{result.hmacHex}</code></div>
                        <div><b>RNG локально:</b> <code>{result.rngComputed}</code></div>
                     </details>
                  </div>
               )}
               {error && <div style={{ color: "#d00" }}>{error}</div>}
            </div>
         ) : (
            <div>Нет данных для отображения.</div>
         )}
      </Modal>
   );
}
