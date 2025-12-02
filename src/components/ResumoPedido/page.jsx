"use client"
import styles from "./ResumoPedido.module.css";

export default function ResumoPedido({ 
  ingressos = [], 
  lanches = [], 
  taxaServico = 5,
  mostrarBotao = false,
  onPagar = null,
  titulo = "RESUMO DO PEDIDO"
}) {
  
  const calcularTotalIngressos = () => {
    return ingressos.reduce((total, ingresso) => total + (ingresso.preco || 0), 0);
  };

  const calcularTotalLanches = () => {
    return lanches.reduce((total, lanche) => total + (lanche.preco * lanche.quantidade || 0), 0);
  };

  const totalIngressos = calcularTotalIngressos();
  const totalLanches = calcularTotalLanches();
  const totalGeral = totalIngressos + totalLanches + taxaServico;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{titulo}</h1>

      {/* Container de Ingressos */}
      {ingressos.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎬 INGRESSOS</h2>
          <div className={styles.ingressosContainer}>
            {ingressos.map((ingresso, index) => (
              <div key={index} className={styles.ingressoCard}>
                <div className={styles.ingressoInfo}>
                  <h3 className={styles.filmeName}>{ingresso.nomeFilme}</h3>
                  <div className={styles.detalhes}>
                    <p className={styles.detalhe}>
                      <strong>Data:</strong> {ingresso.data}
                    </p>
                    <p className={styles.detalhe}>
                      <strong>Hora:</strong> {ingresso.hora}
                    </p>
                    <p className={styles.detalhe}>
                      <strong>Sala:</strong> {ingresso.sala}
                    </p>
                    <p className={styles.detalhe}>
                      <strong>Assento:</strong> {ingresso.assento}
                    </p>
                  </div>
                </div>
                <div className={styles.priceIngresso}>
                  R$ {ingresso.preco?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.subtotal}>
            Subtotal Ingressos: <strong>R$ {totalIngressos.toFixed(2)}</strong>
          </div>
        </section>
      )}

      {/* Container de Lanches */}
      {lanches.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🍿 LANCHES</h2>
          <div className={styles.lanchesContainer}>
            {lanches.map((lanche, index) => (
              <div key={index} className={styles.lanchCard}>
                <div className={styles.lanchInfo}>
                  <h3 className={styles.lancheName}>{lanche.nome}</h3>
                  <p className={styles.quantidade}>Quantidade: {lanche.quantidade}</p>
                </div>
                <div className={styles.priceLanche}>
                  R$ {(lanche.preco * lanche.quantidade).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.subtotal}>
            Subtotal Lanches: <strong>R$ {totalLanches.toFixed(2)}</strong>
          </div>
        </section>
      )}

      {/* Container de Total */}
      <section className={styles.totalSection}>
        <h2 className={styles.sectionTitle}>💳 RESUMO FINANCEIRO</h2>
        <div className={styles.totalContainer}>
          {totalIngressos > 0 && (
            <div className={styles.totalRow}>
              <span>Ingressos:</span>
              <span>R$ {totalIngressos.toFixed(2)}</span>
            </div>
          )}
          {totalLanches > 0 && (
            <div className={styles.totalRow}>
              <span>Lanches:</span>
              <span>R$ {totalLanches.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.totalRow}>
            <span>Taxa de Serviço:</span>
            <span>R$ {taxaServico.toFixed(2)}</span>
          </div>
          <div className={styles.totalRowFinal}>
            <span>TOTAL A PAGAR:</span>
            <span>R$ {totalGeral.toFixed(2)}</span>
          </div>
        </div>

        {mostrarBotao && onPagar && (
          <button onClick={onPagar} className={styles.pagarButton}>
            PAGAR
          </button>
        )}
      </section>
    </div>
  );
}
