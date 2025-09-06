import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import root from "../assets/styles/Root.module.css";
import s from "../assets/styles/AuthForm.module.css";

export default function RegisterPage() {
   const [email, setEmail] = useState("");
   const [password, setPwd] = useState("");
   const [password2, setPwd2] = useState("");
   const [err, setErr] = useState("");
   const [loading, setLoading] = useState(false);
   const nav = useNavigate();
   const loc = useLocation();
   const { login } = useAuth();

   const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8002";

   // 1) Сохраняем ?ref=CODE из адресной строки
   useEffect(() => {
      const p = new URLSearchParams(loc.search);
      const code = p.get("ref");
      if (code) localStorage.setItem("referral_code", code);
   }, [loc.search]);

   const submit = async (e) => {
      e.preventDefault();
      setErr("");
      setLoading(true);
      try {
         if (password !== password2) throw new Error("Пароли не совпадают");
         // 2) Берём ref (если есть) и отправляем вместе с регистрацией
         const ref = localStorage.getItem("referral_code") || null;

         // регистрация
         const res = await fetch(`${API_BASE}/api/auth/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, password2, ref }),
         });
         const data = await res.json().catch(() => ({}));
         if (!res.ok) throw new Error(data?.detail || data?.error || "Ошибка регистрации");
         localStorage.removeItem("referral_code");

         // если после регистрации хочешь сразу логинить:
         await login(email, password);

         // или отправляем на страницу логина
         nav("/", { replace: true, state: { justRegistered: true } });
      } catch (e) {
         setErr(String(e.message || e));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className={`${root.container} ${s.wrap}`}>
         <h1 className={s.title}>Регистрация</h1>
         <form className={s.form} onSubmit={submit}>
            <input className={s.input} type="email" placeholder="you@example.com"
               value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={s.input} type="password" placeholder="Пароль"
               value={password} onChange={(e) => setPwd(e.target.value)} />
            <input className={s.input} type="password" placeholder="Повторите пароль"
               value={password2} onChange={(e) => setPwd2(e.target.value)} />
            {err && <div className={s.error}>{err}</div>}
            <div className={s.actions}>
               <button className={root.btnPrimary} disabled={loading} type="submit">
                  {loading ? "Отправка..." : "Зарегистрироваться"}
               </button>
               <Link className={s.link} to="/login">У меня есть аккаунт</Link>
            </div>
         </form>
      </div>
   );
}
