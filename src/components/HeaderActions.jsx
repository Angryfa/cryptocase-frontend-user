import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import root from "../assets/styles/Root.module.css";
import s from "../assets/styles/HeaderActions.module.css";

function nicknameFromUser(user) {
   const email = user?.email || "";
   if (email.includes("@")) return email.split("@")[0];
   return user?.username || "Аккаунт";
}

const fmt = (v) => Number(v ?? 0).toFixed(2);

export default function HeaderActions() {
   const { isAuthenticated, user, profile, logout } = useAuth();
   const navigate = useNavigate();

   const handleLogout = () => {
      logout();
      navigate("/", { replace: true });
   };

   return (
      <nav className={s.wrap}>
         <Link to="/cases" className={root.btn}>Кейсы</Link>

         {!isAuthenticated ? (
            <>
               <Link to="/login" className={root.btn}>Войти</Link>
               <Link to="/register" className={root.btnPrimary}>Регистрация</Link>
            </>
         ) : (
            <>
               <Link to="/tickets" className={root.btn}>Тикеты</Link>
               <Link to="/profile" className={`${root.btnPrimary} ${s.nick}`}>
                  {nicknameFromUser(user)}
               </Link>
               <span className={s.balance}>${fmt(profile?.balance_usd)}</span>
               <button className={root.btn} onClick={handleLogout}>Выйти</button>
            </>
         )}
      </nav>
   );
}
