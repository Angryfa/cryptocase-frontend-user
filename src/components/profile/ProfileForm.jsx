import root from "../../assets/styles/Root.module.css";
import s from "../../assets/styles/ProfileForm.module.css";

export default function ProfileForm({
   phone, setPhone,
   loading, saving, msg,
   onRefresh, onSave,
}) {
   return (
      <form className={s.form} onSubmit={onSave}>
         {/* пока одно поле — телефон; позже можно добавлять новые блоки */}
         <label className={s.field}>
            <span className={s.label}>Телефон</span>
            <input
               className={s.input}
               type="tel"
               placeholder="+49 151 1234567"
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
            />
         </label>

         <div className={s.actions}>
            <button className={root.btn} type="button" onClick={onRefresh} disabled={loading}>
               {loading ? "Обновляем…" : "Обновить"}
            </button>
            <button className={root.btnPrimary} type="submit" disabled={saving}>
               {saving ? "Сохраняем…" : "Сохранить"}
            </button>
         </div>

         {msg && <div className={s.msg}>{msg}</div>}
      </form>
   );
}
