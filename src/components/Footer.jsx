import root from '../assets/styles/Root.module.css';
import styles from '../assets/styles/Footer.module.css';

export default function Footer() {
   return (
      <footer className={styles.footer}>
         <div className={root.container}>
            <p>© {new Date().getFullYear()} CRYPTOCASE. Все права защищены.</p>
         </div>
      </footer>
   );
}
