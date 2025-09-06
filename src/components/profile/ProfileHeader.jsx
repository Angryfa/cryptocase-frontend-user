import s from "../../assets/styles/ProfileHeader.module.css";

export default function ProfileHeader({ nick, email }) {
   return (
      <div className={s.headerRow}>
         <div className={s.avatar} aria-hidden />
         <div className={s.idBlock}>
            <div className={s.nick}>{nick || "—"}</div>
            <div className={s.email}>{email || "—"}</div>
         </div>
      </div>
   );
}
