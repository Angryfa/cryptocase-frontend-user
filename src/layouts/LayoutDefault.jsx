import Header from '../components/Header';
// import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';
import root from '../assets/styles/Root.module.css';

export default function LayoutDefault() {
   return (
      <>
         <Header />
         <main className={`${root.main} ${root.container}`}>
            <Outlet />
         </main>
         {/* <BottomNav /> */}
         <Footer />
      </>
   );
}
