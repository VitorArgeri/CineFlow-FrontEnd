"use client";
import React from "react";
import Link from "next/link";
import styles from "./page.module.css";
import ProfileLink from "@/components/ProfileLink/page";

export default function Page() {
  const handleStartPedido = () => {
    try {
      sessionStorage.removeItem("cineflow-assentos-selecionados");
      sessionStorage.removeItem("cineflow-carrinho");
    } catch (_) {
      // ignore storage errors
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileWrapper}>
        <ProfileLink />
      </div>
      
      <div className={styles.logo}>
        <span className={styles.cine}>Cine</span>
        <div className={styles.glasses}>
          <div className={styles.lensLeft}></div>
          <div className={styles.lensRight}></div>
        </div>
        <span className={styles.flow}>Flow</span>
      </div>

      
      <Link href="/Filmes" className={styles.button} onClick={handleStartPedido}>
        ESCOLHER FILMES
      </Link>

      
      <p className={styles.footerText}>COMPRE SEUS INGRESSOS E LANCHES</p>
    </div>
  );
}
