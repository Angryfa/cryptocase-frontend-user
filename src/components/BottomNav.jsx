import { Link, useLocation } from 'react-router-dom';
import root from '../assets/styles/Root.module.css';
import styles from '../assets/styles/BottomNav.module.css';

export default function BottomNav() {
   const { pathname } = useLocation();
   return (
      <nav className={styles.wrap}>
         <div className={`${root.container} ${styles.bar}`}>
            <Link to="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>Главная</Link>
            <Link to="/profile" className={`${styles.link} ${pathname.startsWith('/profile') ? styles.active : ''}`}>Профиль</Link>
            <Link to="/chat" className={`${styles.link} ${pathname === '/chat' ? styles.active : ''}`}>Чат</Link>
         </div>
      </nav>
   );
}
