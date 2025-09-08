import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import s from "../assets/styles/Tickets.module.css";
import root from "../assets/styles/Root.module.css";

export default function TicketChatPage() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const load = async () => {
    const res = await authFetch(`/api/support/tickets/${id}/`);
    const data = res.ok ? await res.json() : null;
    setTicket(data);
    // отметить прочитанные пользователем
    await authFetch(`/api/support/tickets/${id}/mark-read/`, { method: "POST" });
    setTimeout(()=> endRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const onReply = async (e) => {
    e.preventDefault(); setError("");
    try {
      const form = new FormData();
      form.append("body", body);
      if (file) form.append("attachment", file);
      const res = await authFetch(`/api/support/tickets/${id}/reply/`, { method: "POST", body: form, headers: {} });
      if (!res.ok) {
        const err = await res.json().catch(()=>({detail:"Ошибка"}));
        throw new Error(err.detail || JSON.stringify(err));
      }
      setBody(""); setFile(null);
      await load();
    } catch (e) { setError(e.message || "Ошибка"); }
  };

  const onClose = async () => {
    await authFetch(`/api/support/tickets/${id}/close/`, { method: "POST" });
    await load();
  };

  const fmt = (d) => new Date(d).toLocaleString("ru-RU");

  if (!ticket) return <div>Загрузка...</div>;

  return (
    <div className={s.page}>
      <h2 className={s.title}>Тикет #{ticket.id}: {ticket.subject}</h2>
      <div className={s.card}>
        Статус: <b>{ticket.status}</b>
        {ticket.status !== "closed" && (
          <button className={root.btn} style={{ marginLeft: 8 }} onClick={onClose}>Закрыть</button>
        )}
      </div>
      <div className={s.card}>
        <div className={s.chat}>
          {ticket.messages?.map(m => (
            <div key={m.id} className={s.msg}>
              <div className={s.meta}>
                {m.author?.email || m.author?.username || ""} · {fmt(m.created_at)}
              </div>
              <div>{m.body}</div>
              {m.attachment && (
                <div><a href={m.attachment} target="_blank" rel="noreferrer">Вложение</a></div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {ticket.status !== "closed" && (
        <div className={s.card}>
          <form onSubmit={onReply} className={s.form}>
            <textarea rows={4} placeholder="Ваш ответ" value={body} onChange={e=>setBody(e.target.value)} required />
            <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={e=>setFile(e.target.files?.[0] || null)} />
            <div><button className={root.btnPrimary} type="submit">Отправить</button> {error && <span style={{ color: "red", marginLeft: 8 }}>{error}</span>}</div>
          </form>
        </div>
      )}
    </div>
  );
}


