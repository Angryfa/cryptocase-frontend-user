import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const AuthContext = createContext(null);

// === Настройки эндпоинтов (подправь под свой бэкенд) ===
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8002";
const EP_ME = "/api/auth/me/";        // или "/me/"
const EP_LOGIN = "/api/auth/login/";     // или "/token/"
const EP_REFRESH = "/api/auth/refresh/";   // или "/token/refresh/"
const EP_PROFILE = "/api/auth/profile/";

const LS_ACCESS = "accessToken";
const LS_REFRESH = "refreshToken";

function decodeJwt(token) {
   try {
      const [, payload] = token.split(".");
      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
   } catch { return null; }
}

export function AuthProvider({ children }) {
   const [accessToken, setAccessToken] = useState(() => localStorage.getItem(LS_ACCESS));
   const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(LS_REFRESH));
   const [user, setUser] = useState(null);
   const isAuthenticated = !!accessToken;
   const refreshTimer = useRef(null);
   const [profile, setProfile] = useState(null);

   const saveTokens = (access, refresh) => {
      if (access) { localStorage.setItem(LS_ACCESS, access); setAccessToken(access); }
      if (refresh) { localStorage.setItem(LS_REFRESH, refresh); setRefreshToken(refresh); }
   };

   const clearTokens = () => {
      localStorage.removeItem(LS_ACCESS);
      localStorage.removeItem(LS_REFRESH);
      setAccessToken(null);
      setRefreshToken(null);
   };

   const logout = () => {
      clearTokens();
      setUser(null);
      setProfile(null);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
   };

   const scheduleRefresh = (token) => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      const data = decodeJwt(token);
      if (!data?.exp) return; // нет exp — не планируем
      const expiresAtMs = data.exp * 1000;
      // Обновим за 30 секунд до истечения
      const delay = Math.max(0, expiresAtMs - Date.now() - 30_000);
      refreshTimer.current = setTimeout(() => { silentRefresh(); }, delay);
   };

   const loadUser = async (token = accessToken) => {
      if (!token) return;
      try {
         const res = await fetch(`${API_BASE}${EP_ME}`, {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (res.ok) {
            const data = await res.json();
            setUser(data);
         } else {
            logout();
         }
      } catch {
         logout();
      }
   };

   const loadProfile = async (token = accessToken) => {
      if (!token) return;
      try {
         const res = await fetch(`${API_BASE}${EP_PROFILE}`, {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (res.ok) {
            const data = await res.json();
            setProfile(data);
         }
      } catch {

      }
   };


   const login = async (email, password) => {
      const res = await fetch(`${API_BASE}${EP_LOGIN}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.access) throw new Error(data?.detail || data?.error || "Ошибка входа");
      saveTokens(data.access, data.refresh);
      scheduleRefresh(data.access);
      await Promise.all([loadUser(data.access), loadProfile(data.access)]);
      return true;
   };

   const silentRefresh = async () => {
      if (!refreshToken) return logout();
      try {
         const res = await fetch(`${API_BASE}${EP_REFRESH}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
         });
         if (!res.ok) throw new Error("refresh failed");
         const data = await res.json();
         if (!data?.access) throw new Error("no access");
         saveTokens(data.access, null);
         scheduleRefresh(data.access);
         // Можно обновить профиль (по желанию):
         // await loadUser(data.access);
         return data.access;
      } catch {
         logout();
         return null;
      }
   };

   // При изменении access — аутентификация + загрузка профиля
   useEffect(() => {
      if (accessToken) {
         scheduleRefresh(accessToken);
         loadUser(accessToken);
         loadProfile(accessToken);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [accessToken]);

   // Единая обёртка fetch с авто-Authorization и ретраем после refresh
   const authFetch = async (url, init = {}, _retry = false) => {
      const headers = new Headers(init.headers || {});
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

      const res = await fetch(`${API_BASE}${url}`, { ...init, headers });
      if (res.status !== 401 || _retry) return res;

      const newAccess = await silentRefresh();
      if (!newAccess) return res; // не удалось — вернём 401
      const retryHeaders = new Headers(init.headers || {});
      if (!retryHeaders.has("Content-Type")) retryHeaders.set("Content-Type", "application/json");
      retryHeaders.set("Authorization", `Bearer ${newAccess}`);
      return fetch(`${API_BASE}${url}`, { ...init, headers: retryHeaders });
   };

   const value = useMemo(() => ({
      accessToken,
      refreshToken,
      isAuthenticated,
      user,
      setUser,
      profile,
      setProfile,
      login,
      logout,
      loadUser,
      loadProfile,
      authFetch,
      API_BASE,
   }), [accessToken, refreshToken, isAuthenticated, user, profile]);

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
   return useContext(AuthContext);
}
