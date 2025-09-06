import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import root from "../assets/styles/Root.module.css";
import s from "../assets/styles/AuthForm.module.css"; // как раньше

export default function LoginPage() {
   const [email, setEmail] = useState(""); const [pwd, setPwd] = useState("");
   const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
   const { login } = useAuth(); const nav = useNavigate(); const from = useLocation().state?.from?.pathname || "/";

   const submit = async (e) => {
      e.preventDefault(); setErr(""); setLoading(true);
      try { await login(email, pwd); nav(from, { replace: true }); }
      catch (e) { setErr(String(e.message || e)); }
      finally { setLoading(false); }
   };

   return (
      <div className={`${root.container} ${s.wrap}`}>
         <h1 className={s.title}>Вход</h1>
         <form className={s.form} onSubmit={submit}>
            <input className={s.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            <input className={s.input} type="password" placeholder="Пароль" value={pwd} onChange={e => setPwd(e.target.value)} />
            {err && <div className={s.error}>{err}</div>}
            <div className={s.actions}>
               <button className={root.btnPrimary} disabled={loading} type="submit">{loading ? "Входим..." : "Войти"}</button>
               <Link to="/register">Регистрация</Link>
            </div>
         </form>
      </div>
   );
}
