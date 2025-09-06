import Header from '../components/Header';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';
import root from '../assets/styles/Root.module.css';
import fixed from '../assets/styles/LayoutFixed.module.css';

export default function LayoutFooterFixed() {
   return (
      <div className={fixed.wrap}>
         <Header />
         <main className={`${fixed.grow} ${root.container}`}>
            <Outlet />
         </main>
         <Footer />
      </div>
   );
}
