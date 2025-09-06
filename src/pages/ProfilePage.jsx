import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import root from "../assets/styles/Root.module.css";
import s from "../assets/styles/ProfilePage.module.css";

import ProfileHeader from "../components/profile/ProfileHeader";
import WalletStats from "../components/profile/WalletStats";
import ProfileForm from "../components/profile/ProfileForm";
import ReferralSummary from "../components/profile/ReferralSummary";
import ReferralTables from "../components/profile/ReferralTables";

function nicknameFromUser(u) {
   const email = u?.email || "";
   if (email.includes("@")) return email.split("@")[0];
   return u?.username || "";
}

export default function ProfilePage() {
   const { user, authFetch } = useAuth();

   const [me, setMe] = useState(null);
   const [profile, setProfile] = useState(null);
   const [refData, setRefData] = useState(null);
   const [phone, setPhone] = useState("");
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [msg, setMsg] = useState("");

   const nick = useMemo(() => nicknameFromUser(me || user), [me, user]);

   const load = async () => {
      setLoading(true);
      setMsg("");
      try {
         const rMe = await authFetch("/api/auth/me/");
         const dMe = rMe.ok ? await rMe.json() : null;
         setMe(dMe);

         const rPr = await authFetch("/api/auth/profile/");
         const dPr = rPr.ok ? await rPr.json() : null;
         setProfile(dPr);
         setPhone(dPr?.phone || "");

         const rRef = await authFetch("/api/referrals/me/");
         const dRef = rRef.ok ? await rRef.json() : null;
         setRefData(dRef);

      } catch {
         setMsg("Ошибка загрузки профиля");
      } finally {
         setLoading(false);
      }
   };

   const save = async (e) => {
      e.preventDefault();
      setSaving(true);
      setMsg("");
      try {
         const r = await authFetch("/api/auth/profile/", {
            method: "PATCH",
            body: JSON.stringify({ phone }),
         });
         if (!r.ok) throw new Error();
         const updated = await r.json().catch(() => null);
         if (updated) setProfile(updated);
         setMsg("Сохранено ✅");
      } catch {
         setMsg("Не удалось сохранить изменения");
      } finally {
         setSaving(false);
      }
   };

   useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

   return (
      <div className={root.container}>
         <h1 className={s.title}>Профиль</h1>

         <div className={root.card}>
            <ProfileHeader nick={nick || "—"} email={me?.email || user?.email || "—"} />

            <ProfileForm
               phone={phone}
               setPhone={setPhone}
               loading={loading}
               saving={saving}
               msg={msg}
               onRefresh={load}
               onSave={save}
            />

         </div>
         <div className={root.card}>
            <WalletStats profile={profile} />
         </div>

         <div className={root.card}>
            <ReferralSummary data={refData} />
         </div>

         <div className={root.card}>
            <ReferralTables level1={refData?.level1} level2={refData?.level2} />
         </div>
      </div>
   );
}
