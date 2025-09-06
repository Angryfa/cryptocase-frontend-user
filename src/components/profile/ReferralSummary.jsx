import s from "../../assets/styles/ReferralSummary.module.css";

export default function ReferralSummary({ data }) {
   const copy = async () => {
      if (!data?.link) return;
      await navigator.clipboard.writeText(data.link);
      // можно добавить toast, но оставим лаконично
   };

   return (
      <div className={s.box}>
         <div className={s.row}>
            <div className={s.label}>Ваша реферальная ссылка</div>
            <div className={s.linkWrap}>
               <input className={s.input} readOnly value={data?.link || ""} />
               <button className={s.copy} onClick={copy}>Копировать</button>
            </div>
         </div>
         <div className={s.stats}>
            <div className={s.stat}><span>L1</span><b>{data?.level1_count ?? 0}</b></div>
            <div className={s.stat}><span>L2</span><b>{data?.level2_count ?? 0}</b></div>
         </div>
      </div>
   );
}
