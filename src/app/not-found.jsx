import React from "react";
import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
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

      
      <h1 className={styles.title}>404</h1>
      <p className={styles.subtitle}>Página não encontrada</p>

      
      <Link href="/" className={styles.button}>
        VOLTAR PARA INÍCIO
      </Link>
    </div>
  );
}
