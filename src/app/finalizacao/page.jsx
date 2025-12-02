"use client"
import { useState, useEffect } from "react";
import SiteHeader from "@/components/Header/page";
import styles from "./finalizacao.module.css";

// Garante que qualquer valor recebido da API seja tratado como número válido
const normalizarValorMonetario = (valor) => {
  const numero = Number(valor);
  return Number.isNaN(numero) ? 0 : numero;
};

// Busca o preço correto do ingresso considerando o vínculo com a sessão
const obterDetalhesIngresso = async (sessao) => {
  const descricaoPadrao = sessao?.tipo || "Ingresso";
  if (!sessao) {
    return { preco: 0, descricao: descricaoPadrao };
  }

  if (sessao?.ingresso?.preco !== undefined) {
    return {
      preco: normalizarValorMonetario(sessao.ingresso.preco),
      descricao: sessao.ingresso.tipo || descricaoPadrao
    };
  }

  if (sessao?.ingressoId) {
    try {
      const ingressoResponse = await fetch(`http://localhost:5000/ingressos/${sessao.ingressoId}`);
      if (ingressoResponse.ok) {
        const ingressoData = await ingressoResponse.json();
        return {
          preco: normalizarValorMonetario(ingressoData?.preco),
          descricao: ingressoData?.tipo || descricaoPadrao
        };
      }
    } catch (error) {
      console.error("Erro ao buscar ingresso por ID:", error);
    }
  }

  if (sessao?.preco !== undefined) {
    return { preco: normalizarValorMonetario(sessao.preco), descricao: descricaoPadrao };
  }

  if (sessao?.tipo) {
    try {
      const ingressoResponse = await fetch(`http://localhost:5000/ingressos?tipo=${encodeURIComponent(sessao.tipo)}`);
      if (ingressoResponse.ok) {
        const ingressosData = await ingressoResponse.json();
        const ingressoEncontrado = Array.isArray(ingressosData) ? ingressosData[0] : ingressosData;
        if (ingressoEncontrado) {
          return {
            preco: normalizarValorMonetario(ingressoEncontrado?.preco),
            descricao: ingressoEncontrado?.tipo || descricaoPadrao
          };
        }
      }
    } catch (error) {
      console.error("Erro ao buscar ingresso por tipo:", error);
    }
  }

  return { preco: 0, descricao: descricaoPadrao };
};

export default function FinalizacaoPage() {
  const [ingressos, setIngressos] = useState([]);
  const [lanches, setLanches] = useState([]);
  const [sessaoInfo, setSessaoInfo] = useState(null);
  const [alimentos, setAlimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const taxaServico = 5;

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Recupera dados dos ingressos/sessão selecionada
        const sessaoData = JSON.parse(sessionStorage.getItem("cineflow-assentos-selecionados")) || {};
        setSessaoInfo(sessaoData);

        // Formata os ingressos a partir dos assentos selecionados
        if (sessaoData.assentos && sessaoData.assentos.length > 0) {
          try {
            const response = await fetch(`http://localhost:5000/sessoes/${sessaoData.sessaoId}`);
            if (!response.ok) {
              throw new Error("Não foi possível carregar a sessão selecionada.");
            }
            const sessao = await response.json();
            const detalhesIngresso = await obterDetalhesIngresso(sessao);
            const dataHoraSessao = sessao?.dataHora || sessaoData.dataHora;
            const dataHoraObjeto = dataHoraSessao ? new Date(dataHoraSessao) : null;
            const dataFormatada = dataHoraObjeto ? dataHoraObjeto.toLocaleDateString("pt-BR") : "--";
            const horaFormatada = dataHoraObjeto
              ? dataHoraObjeto.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "--";
            
            const ingressosFormatados = sessaoData.assentos.map((assento) => ({
              nomeFilme: sessaoData.filmeNome || "Filme",
              data: dataFormatada,
              hora: horaFormatada,
              sala: sessao?.salaId ?? sessaoData.salaId ?? "N/A",
              assento: assento.posicao || assento.id,
              tipoSessao: sessao?.tipo || "",
              tipoIngresso: detalhesIngresso.descricao,
              preco: detalhesIngresso.preco
            }));
            
            setIngressos(ingressosFormatados);
          } catch (error) {
            console.error("Erro ao carregar preço da sessão:", error);
          }
        }

        // Busca os alimentos da API
        try {
          const response = await fetch("http://localhost:5000/alimentos");
          const alimentosData = await response.json();
          setAlimentos(alimentosData);

          // Recupera dados dos lanches selecionados do carrinho
          const carrinhoJSON = sessionStorage.getItem("cineflow-carrinho");
          if (carrinhoJSON) {
            try {
              const carrinho = JSON.parse(carrinhoJSON);
              
              // Formata os lanches do carrinho com os dados dos alimentos
              const lanchesFormatados = Object.entries(carrinho)
                .filter(([id, quantidade]) => quantidade > 0)
                .map(([id, quantidade]) => {
                  const alimento = alimentosData.find(a => a.id === parseInt(id));
                  return {
                    id: id,
                    nome: alimento?.nome || "Produto",
                    quantidade: quantidade,
                    preco: alimento?.preco || 0
                  };
                });
              
              setLanches(lanchesFormatados);
            } catch (error) {
              console.error("Erro ao processar carrinho:", error);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar alimentos:", error);
        }
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const calcularTotalIngressos = () => {
    return ingressos.reduce((total, ingresso) => total + (ingresso.preco || 0), 0);
  };

  const calcularTotalLanches = () => {
    return lanches.reduce((total, lanche) => total + (lanche.preco * lanche.quantidade || 0), 0);
  };

  const totalIngressos = calcularTotalIngressos();
  const totalLanches = calcularTotalLanches();
  const totalGeral = totalIngressos + totalLanches + taxaServico;

  const handlePagar = () => {
    // Aqui você pode adicionar lógica de pagamento se necessário
    // Por enquanto, apenas redireciona para a página de pedido gerado
    window.location.href = "/PedidoGerado";
  };

  if (carregando) {
    return (
      <div className={styles.container}>
        <SiteHeader backHref="/Filmes" backLabel="VOLTAR" />
        <div className={styles.content}>
          <p style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
            Carregando pedido...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <SiteHeader 
        backHref={sessaoInfo?.sessaoId ? `/sessoes/${sessaoInfo.sessaoId}` : "/Filmes"} 
        backLabel="VOLTAR" 
      />

      <div className={styles.content}>
        <h1 className={styles.title}>RESUMO DO PEDIDO</h1>

        {/* Container de Ingressos */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎬 INGRESSOS</h2>
          <div className={styles.ingressosContainer}>
            {ingressos.length > 0 ? (
              ingressos.map((ingresso, index) => (
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
                      {ingresso.tipoSessao && (
                        <p className={styles.detalhe}>
                          <strong>Tipo de Sessão:</strong> {ingresso.tipoSessao}
                        </p>
                      )}
                      {ingresso.tipoIngresso && ingresso.tipoIngresso !== ingresso.tipoSessao && (
                        <p className={styles.detalhe}>
                          <strong>Ingresso:</strong> {ingresso.tipoIngresso}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={styles.priceIngresso}>
                    R$ {ingresso.preco?.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>Nenhum ingresso selecionado</p>
            )}
          </div>
          {ingressos.length > 0 && (
            <div className={styles.subtotal}>
              Subtotal Ingressos: <strong>R$ {totalIngressos.toFixed(2)}</strong>
            </div>
          )}
        </section>

        {/* Container de Lanches */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🍿 LANCHES</h2>
          <div className={styles.lanchesContainer}>
            {lanches.length > 0 ? (
              lanches.map((lanche, index) => (
                <div key={index} className={styles.lanchCard}>
                  <div className={styles.lanchInfo}>
                    <h3 className={styles.lancheName}>{lanche.nome}</h3>
                    <p className={styles.quantidade}>Quantidade: {lanche.quantidade}</p>
                  </div>
                  <div className={styles.priceLanche}>
                    R$ {(lanche.preco * lanche.quantidade).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>Nenhum lanche selecionado</p>
            )}
          </div>
          {lanches.length > 0 && (
            <div className={styles.subtotal}>
              Subtotal Lanches: <strong>R$ {totalLanches.toFixed(2)}</strong>
            </div>
          )}
        </section>

        {/* Container de Total */}
        <section className={styles.totalSection}>
          <h2 className={styles.sectionTitle}>💳 RESUMO FINANCEIRO</h2>
          <div className={styles.totalContainer}>
            <div className={styles.totalRow}>
              <span>Ingressos:</span>
              <span>R$ {totalIngressos.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Lanches:</span> 
              <span>R$ {totalLanches.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Taxa de Serviço:</span>
              <span>R$ {taxaServico.toFixed(2)}</span>
            </div>
            <div className={styles.totalRowFinal}>
              <span>TOTAL A PAGAR:</span>
              <span>R$ {totalGeral.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={handlePagar} className={styles.pagarButton}>
            PAGAR
          </button>
        </section>
      </div>
    </div>
  );
}
