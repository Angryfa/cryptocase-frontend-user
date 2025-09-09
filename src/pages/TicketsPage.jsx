import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import s from "../assets/styles/TicketsCenter.module.css";
import root from "../assets/styles/Root.module.css";

export default function TicketsPage() {
  const { authFetch, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const active = useMemo(()=> items.find(t=>t.id===activeId) || items[0], [items, activeId]);

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
      setOpenCreate(false);
    } catch (e) { setError(e.message || "Ошибка"); }
  };

  const fmtStatus = (s) => (s === 'closed' ? 'Закрыт' : 'Открыт');

  return (
    <div className={s.wrap}>
      <div className={s.top}>
        <h2 className={s.title}>Центр поддержки</h2>
        <button className={root.btnPrimary} onClick={()=>setOpenCreate(true)}>Создать тикет</button>
      </div>

      <div className={s.grid}>
        <div className={s.left}>
          <div className={s.search}><input placeholder="Поиск" /></div>
          <div className={s.list}>
            {loading ? <div style={{padding:12}}>Загрузка…</div> : (
              items.length === 0 ? <div className={s.emptyList}>Тикетов нет</div> : items.map(t => (
                <div key={t.id} className={`${s.item} ${active?.id===t.id? s.itemActive: ''}`} onClick={()=>setActiveId(t.id)}>
                  <h4 className={s.itTitle}>{t.subject}</h4>
                  <div className={s.itMeta}>
                    <span>{new Date(t.created_at).toLocaleString("ru-RU")}</span>
                    <span className={s.pill}>
                      <span className={t.status === 'closed' ? s.dotRed : s.dotGreen}></span>
                      {fmtStatus(t.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={s.right}>
          <div className={s.head}>
            <h3 className={s.subject}>Тема обращения: {active?.subject || ""}</h3>
            {active && active.status !== 'closed' && (
              <button className={s.closeBtn} onClick={async()=>{ await authFetch(`/api/support/tickets/${active.id}/close/`, { method: 'POST' }); await load(); }}>Закрыть</button>
            )}
          </div>
          <div className={s.chat}>
            {!active && <div>Выберите тикет слева…</div>}
            {active?.messages?.map(m => {
              const isMine = !!(m?.author?.id && user?.id && m.author.id === user.id);
              return (
                <div key={m.id} className={`${s.bubbleRow} ${isMine ? s.mineRow : ''}`}>
                  <div className={`${s.msg} ${isMine ? s.mine : ''}`}>
                    <div className={s.name}>{isMine ? (user?.username || user?.email || 'Вы') : 'Техподдержка'}</div>
                    <div className={s.meta}>{new Date(m.created_at).toLocaleString("ru-RU")}</div>
                    <div>{m.body}</div>
                    {m.attachment && <div><a href={m.attachment} target="_blank" rel="noreferrer">Вложение</a></div>}
                  </div>
                </div>
              );
            })}
          </div>
          {active && active.status !== 'closed' && (
            <div className={s.composer}>
              <textarea placeholder="Ваше сообщение" value={body} onChange={e=>setBody(e.target.value)} />
              <div className={s.actions}>
                <label className={s.file}><input type="file" accept="application/pdf,image/jpeg,image/png" onChange={e=>setFile(e.target.files?.[0] || null)} /><span className={s.fileBtn}>Файл</span></label>
                <button className={root.btnPrimary} onClick={async(e)=>{
                  e.preventDefault();
                  setError("");
                  try {
                    const form = new FormData();
                    form.append('body', body);
                    if (file) form.append('attachment', file);
                    const res = await authFetch(`/api/support/tickets/${active.id}/reply/`, { method: 'POST', body: form, headers: {} });
                    if (!res.ok) throw new Error('Не удалось отправить');
                    setBody(""); setFile(null);
                    await load();
                  } catch (e) { setError(e.message || 'Ошибка'); }
                }}>Отправить</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {openCreate && (
        <div className={s.backdrop} onClick={()=>setOpenCreate(false)}>
          <div className={s.modal} onClick={e=>e.stopPropagation()}>
            <h3>Создать тикет</h3>
            <div className={s.field}><label>Тема</label><input value={subject} onChange={e=>setSubject(e.target.value)} /></div>
            <div className={s.field}><label>Сообщение</label><textarea rows={5} value={body} onChange={e=>setBody(e.target.value)} /></div>
            <div className={s.field}><label>Файл</label><input type="file" accept="application/pdf,image/jpeg,image/png" onChange={e=>setFile(e.target.files?.[0] || null)} /></div>
            <div className={s.modalActions}>
              <button className={root.btn} onClick={()=>setOpenCreate(false)}>Отмена</button>
              <button className={root.btnPrimary} onClick={onCreate}>Создать</button>
            </div>
            {error && <div style={{ color: "red" }}>{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}


