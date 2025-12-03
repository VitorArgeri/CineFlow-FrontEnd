"use client";
import React, { useState, useEffect } from "react";
import SiteHeader from "@/components/Header/page";
import styles from "./finalizacao.module.css";

const resolveTicketInfo = async (sessao) => {
  if (!sessao) return { preco: 0, tipo: "Padrão" };

  if (sessao.ingresso?.preco !== undefined) {
    return {
      preco: Number(sessao.ingresso.preco),
      tipo: sessao.ingresso.tipo || sessao.tipo,
    };
  }
  if (sessao.preco !== undefined) {
    return { preco: Number(sessao.preco), tipo: sessao.tipo };
  }

  try {
    let url = "";
    if (sessao.ingressoId)
      url = `http://localhost:5000/ingressos/${sessao.ingressoId}`;
    else if (sessao.tipo)
      url = `http://localhost:5000/ingressos?tipo=${encodeURIComponent(
        sessao.tipo
      )}`;

    if (url) {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const item = Array.isArray(data) ? data[0] : data;
        return {
          preco: Number(item?.preco || 0),
          tipo: item?.tipo || sessao.tipo,
        };
      }
    }
  } catch (err) {
    console.error("Erro ao buscar preço:", err);
  }

  return { preco: 0, tipo: "Padrão" };
};

export default function FinalizacaoPage() {
  const [resumo, setResumo] = useState({
    ingressos: [],
    lanches: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const taxaServico = 5;

  useEffect(() => {
    const loadData = async () => {
      const sessaoStorage =
        JSON.parse(sessionStorage.getItem("cineflow-assentos-selecionados")) ||
        {};
      const carrinhoStorage =
        JSON.parse(sessionStorage.getItem("cineflow-carrinho")) || {};

      const [sessaoRes, alimentosRes] = await Promise.all([
        sessaoStorage.sessaoId
          ? fetch(`http://localhost:5000/sessoes/${sessaoStorage.sessaoId}`)
          : null,
        fetch("http://localhost:5000/alimentos"),
      ]);

      const sessao = sessaoRes?.ok ? await sessaoRes.json() : null;
      const alimentos = alimentosRes?.ok ? await alimentosRes.json() : [];

      const ticketInfo = await resolveTicketInfo(sessao);
      const dataObj = new Date(
        sessao?.dataHora || sessaoStorage.dataHora || Date.now()
      );

      const listaIngressos = (sessaoStorage.assentos || []).map((assento) => ({
        filme: sessaoStorage.filmeNome || "Filme",
        data: dataObj.toLocaleDateString("pt-BR"),
        hora: dataObj.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sala: sessao?.salaId || sessaoStorage.salaId || "N/A",
        assento: assento.posicao || assento.id,
        tipo: ticketInfo.tipo,
        preco: ticketInfo.preco,
      }));

      const listaLanches = Object.entries(carrinhoStorage)
        .map(([id, qtd]) => {
          const item = alimentos.find((a) => a.id === Number(id));
          if (!item || qtd <= 0) return null;
          return { ...item, quantidade: qtd, subtotal: item.preco * qtd };
        })
        .filter(Boolean);

      const totalIngressos = listaIngressos.reduce(
        (acc, i) => acc + i.preco,
        0
      );
      const totalLanches = listaLanches.reduce((acc, i) => acc + i.subtotal, 0);

      setResumo({
        ingressos: listaIngressos,
        lanches: listaLanches,
        subIngressos: totalIngressos,
        subLanches: totalLanches,
        totalGeral: totalIngressos + totalLanches + taxaServico,
        backLink: sessaoStorage.sessaoId
          ? `/sessoes/${sessaoStorage.sessaoId}`
          : "/Filmes",
      });
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <SiteHeader backHref="/Filmes" backLabel="VOLTAR" />
        <div className={styles.content}>
          <p style={{ textAlign: "center", color: "white", marginTop: 50 }}>
            Carregando pedido...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <SiteHeader backHref={resumo.backLink} backLabel="VOLTAR" />

      <div className={styles.content}>
        <h1 className={styles.title}>RESUMO DO PEDIDO</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎬 INGRESSOS</h2>
          <div className={styles.ingressosContainer}>
            {resumo.ingressos.length > 0 ? (
              resumo.ingressos.map((item, i) => (
                <div key={i} className={styles.ingressoCard}>
                  <div className={styles.ingressoInfo}>
                    <h3 className={styles.filmeName}>{item.filme}</h3>
                    <div className={styles.detalhes}>
                      <p>
                        <strong>Data:</strong> {item.data}
                      </p>
                      <p>
                        <strong>Hora:</strong> {item.hora}
                      </p>
                      <p>
                        <strong>Sala:</strong> {item.sala}
                      </p>
                      <p>
                        <strong>Assento:</strong> {item.assento}
                      </p>
                      <p>
                        <strong>Tipo:</strong> {item.tipo}
                      </p>
                    </div>
                  </div>
                  <div className={styles.priceIngresso}>
                    R$ {item.preco.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>Nenhum ingresso selecionado</p>
            )}
          </div>
          {resumo.ingressos.length > 0 && (
            <div className={styles.subtotal}>
              Subtotal: <strong>R$ {resumo.subIngressos.toFixed(2)}</strong>
            </div>
          )}
        </section>

                      <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>🍿 LANCHES</h2>
                    <div className={styles.lanchesContainer}>
                        {resumo.lanches.length > 0 ? (
                            resumo.lanches.map((item, i) => (
                                <div key={i} className={styles.lanchCard}>
                                    <div className={styles.lanchInfo}>
                                        <h3 className={styles.lancheName}>{item.nome}</h3>
                                        <p className={styles.quantidade}>Qtd: {item.quantidade}</p>
                                    </div>
                                    <div className={styles.priceLanche}>R$ {item.subtotal.toFixed(2)}</div>
                                </div>
                            ))
                        ) : <p className={styles.emptyMessage}>Nenhum lanche selecionado</p>}
                    </div>
                    {resumo.lanches.length > 0 && (
                        <div className={styles.subtotal}>Subtotal: <strong>R$ {resumo.subLanches.toFixed(2)}</strong></div>
                    )}
                </section>

                <section className={styles.totalSection}>
                    <h2 className={styles.sectionTitle}>💳 RESUMO FINANCEIRO</h2>
                    <div className={styles.totalContainer}>
                        <div className={styles.totalRow}><span>Ingressos:</span><span>R$ {resumo.subIngressos.toFixed(2)}</span></div>
                        <div className={styles.totalRow}><span>Lanches:</span><span>R$ {resumo.subLanches.toFixed(2)}</span></div>
                        <div className={styles.totalRow}><span>Taxa de Serviço:</span><span>R$ {taxaServico.toFixed(2)}</span></div>
                        <div className={styles.totalRowFinal}><span>TOTAL A PAGAR:</span><span>R$ {resumo.totalGeral.toFixed(2)}</span></div>
                    </div>
                    <button onClick={() => window.location.href = "/PedidoGerado"} className={styles.pagarButton}>
                        PAGAR
                    </button>
                </section>
            </div>
        </div>
    );
}