import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import s from "../assets/styles/Tickets.module.css";
import root from "../assets/styles/Root.module.css";

export default function TicketsPage() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await authFetch("/api/support/tickets/");
    const data = res.ok ? await res.json() : [];
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const onCreate = async (e) => {
    e.preventDefault(); setError("");
    try {
      const form = new FormData();
      form.append("subject", subject);
      form.append("body", body);
      if (file) form.append("attachment", file);
      const res = await authFetch("/api/support/tickets/", { method: "POST", body: form, headers: {} });
      if (!res.ok) {
        const err = await res.json().catch(()=>({detail:"Ошибка"}));
        throw new Error(err.detail || JSON.stringify(err));
      }
      setSubject(""); setBody(""); setFile(null);
      await load();
    } catch (e) { setError(e.message || "Ошибка"); }
  };

  const fmtStatus = (s) => ({ open: "Открыт", answered: "Отвечен", closed: "Закрыт" }[s] || s);

  return (
    <div className={s.page}>
      <h2 className={s.title}>Тикеты</h2>
      <div className={s.card}>
        <form onSubmit={onCreate} className={s.form}>
          <div className={s.row}><input placeholder="Тема обращения" value={subject} onChange={e=>setSubject(e.target.value)} required /></div>
          <div className={s.row}><textarea placeholder="Опишите проблему" value={body} onChange={e=>setBody(e.target.value)} rows={5} required /></div>
          <div className={s.row}><input type="file" accept="application/pdf,image/jpeg,image/png" onChange={e=>setFile(e.target.files?.[0] || null)} /></div>
          <div><button className={root.btnPrimary} type="submit">Создать тикет</button> {error && <span style={{ color: "red", marginLeft: 8 }}>{error}</span>}</div>
        </form>
      </div>

      <div className={s.card}>
        {loading ? <div>Загрузка...</div> : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr><th>ID</th><th>Тема</th><th>Статус</th><th>Создан</th><th></th></tr>
              </thead>
              <tbody>
                {items.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.subject}</td>
                    <td>{fmtStatus(t.status)}</td>
                    <td>{new Date(t.created_at).toLocaleString("ru-RU")}</td>
                    <td><Link className={root.btn} to={`/tickets/${t.id}`}>Открыть</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


