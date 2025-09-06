import s from "../../assets/styles/WalletStats.module.css";

const fmtUSD = (v) => (v === null || v === undefined ? "0.00" : String(v));

export default function WalletStats({ profile }) {
   return (
      <div className={s.grid}>
         <div className={s.stat}>
            <div className={s.title}>Депозит (всего)</div>
            <div className={s.value}>${fmtUSD(profile?.deposit_total_usd)}</div>
         </div>
         <div className={s.stat}>
            <div className={s.title}>Баланс</div>
            <div className={s.value}>${fmtUSD(profile?.balance_usd)}</div>
         </div>
         <div className={s.stat}>
            <div className={s.title}>Выиграно</div>
            <div className={s.value}>${fmtUSD(profile?.won_total_usd)}</div>
         </div>
         <div className={s.stat}>
            <div className={s.title}>Проиграно</div>
            <div className={s.value}>${fmtUSD(profile?.lost_total_usd)}</div>
         </div>
      </div>
   );
}
