import React from "react";
import Image from "next/image";
import styles from "./pedidogerado.module.css";
import SiteHeader from "@/components/SiteHeader";

export default function Page() {
  return (
    <div className={styles.container}>
      <SiteHeader className={styles.header} backHref="/bomboniere" />

      
      <h1 className={styles.successText}>PEDIDO REALIZADO COM SUCESSO !</h1>

      <div className={styles.content}>
        
        <div className={styles.qrSection}>
          
          <Image
            src="/qr.png"
            alt="QR Code de entrada"
            width={180}
            height={180}
            priority
          />
          <button className={styles.qrButton}>SEU QR CODE PARA ENTRADA</button>
        </div>

        
        <div className={styles.ticketBox}>
          <p className={styles.ticketLabel}>SENHA BOMBONIERE</p>
          <p className={styles.ticketNumber}>#A102</p>
        </div>
      </div>

      
      <p className={styles.instructions}>
        APRESENTE O QR CODE PARA ACESSAR A SALA. AGUARDE SUA SENHA SER CHAMADA
        NO PAINEL DA BOMBONIERE PARA RETIRAR SEUS LANCHES.
      </p>

      
      <h2 className={styles.thanks}>OBRIGADA E APROVEITE A SESSÃO !</h2>
    </div>
  );
}
