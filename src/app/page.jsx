import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={styles.container}>
      
      <div className={styles.logo}>
        <span className={styles.cine}>Cine</span>
        <div className={styles.glasses}>
          <div className={styles.lensLeft}></div>
          <div className={styles.lensRight}></div>
        </div>
        <span className={styles.flow}>Flow</span>
      </div>

      
      <Link href="/Filmes" className={styles.button}>
        ESCOLHER FILMES
      </Link>

      
      <p className={styles.footerText}>COMPRE SEUS INGRESSOS E LANCHES</p>
    </div>
  );
}
