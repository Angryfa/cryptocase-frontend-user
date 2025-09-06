import { Outlet } from 'react-router-dom';
import root from '../assets/styles/Root.module.css';

export default function LayoutClean() {
   return (
      <main className={`${root.main} ${root.container}`}>
         <Outlet />
      </main>
   );
}
