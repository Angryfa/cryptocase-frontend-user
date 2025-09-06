import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import root from "./assets/styles/Root.module.css";
import "./assets/styles/Fonts.module.css";

import LayoutDefault from "./layouts/LayoutDefault";
import LayoutNotFooter from "./layouts/LayoutNotFooter";
import LayoutFooterFixed from "./layouts/LayoutFooterFixed";
import LayoutClean from "./layouts/LayoutClean";

import ExplorePage from "./pages/ExplorePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import CasesPage from "./pages/CasesPage";

import ScrollToTop from "./components/ScrollToTop";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";

function App() {
   return (
      <div className={root.app}>
         <AuthProvider>
            <Router>
               <ScrollToTop />
               <Routes>
                  {/* Базовый лэйаут: хедер + нав + футер */}
                  <Route element={<LayoutDefault />}>
                     <Route path="/" element={<ExplorePage />} />
                     <Route path="/cases" element={<CasesPage />} />
                     {/* Пример приватного роута (доступен только после логина) */}
                     <Route
                        path="/profile"
                        element={
                           <RequireAuth>
                              <ProfilePage />
                           </RequireAuth>
                        }
                     />
                  </Route>

                  {/* Лэйаут без футера (если понадобится для каких-то страниц) */}
                  <Route element={<LayoutNotFooter />}>
                     {/* примеры:
              <Route path="/edit-profile" element={<RequireAuth><EditProfilePage/></RequireAuth>} />
              */}
                  </Route>

                  {/* Лэйаут с «липким» футером (пример) */}
                  <Route element={<LayoutFooterFixed />}>
                     {/* примеры:
              <Route path="/account-deleted" element={<AccountDeletedPage />} />
              */}
                  </Route>

                  {/* Чистый лэйаут — используем для auth-страниц */}
                  <Route element={<LayoutClean />}>
                     <Route path="/login" element={<LoginPage />} />
                     <Route path="/register" element={<RegisterPage />} />
                  </Route>

                  {/* 404 по желанию */}
                  {/* <Route path="*" element={<LayoutClean><NotFoundPage /></LayoutClean>} /> */}
               </Routes>
            </Router>
         </AuthProvider>
      </div>
   );
}

export default App;
