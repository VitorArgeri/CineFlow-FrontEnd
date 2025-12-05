"use client";
import React from "react";
import Image from "next/image";
import styles from "./pedidogerado.module.css";
import Button from "@/components/Button/page";

export default function Page() {
  const handleVoltarInicio = () => {
    sessionStorage.removeItem("cineflow-assentos-selecionados");
    sessionStorage.removeItem("cineflow-carrinho");
    window.location.href = "/";
  };

  return (
    <div className={styles.container}>
      
      <h1 className={styles.successText}>PEDIDO REALIZADO COM SUCESSO !</h1>

      <div className={styles.content}>
        
        <div className={styles.qrSection}>
          
          <Image
            src="/Img/qr.png"
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

      <div className={styles.homeButtonWrapper}>
        <Button onClick={handleVoltarInicio} className={styles.homeButton}>
          VOLTAR PARA A PÁGINA INICIAL
        </Button>
      </div>
    </div>
  );
}
