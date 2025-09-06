import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Outlet } from 'react-router-dom';
import root from '../assets/styles/Root.module.css';

export default function LayoutNotFooter() {
   return (
      <>
         <Header />
         <main className={`${root.main} ${root.container}`}>
            <Outlet />
         </main>
         <BottomNav />
      </>
   );
}
