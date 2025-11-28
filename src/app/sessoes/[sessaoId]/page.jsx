"use client";
import React, { useEffect, useState, use } from "react";
import axios from "axios";
import styles from "./page.module.css";
import Button from "@/components/Button/page";
import SiteHeader from "@/components/Header/page";
import { useRouter } from "next/navigation";

const ordenarAssentos = (lista = []) => {
    const pesoLinha = (linha = "") => {
        if (!linha) return 0;
        return linha
            .toUpperCase()
            .split("")
            .reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
    };

    const quebrarPosicao = (posicao = "") => {
        const match = posicao.match(/^([A-Za-z]+)(\d+)$/);
        if (!match) return [posicao || "", 0];
        return [match[1], Number(match[2])];
    };

    return [...lista].sort((a, b) => {
        const [linhaA, numeroA] = quebrarPosicao(a.posicao || "");
        const [linhaB, numeroB] = quebrarPosicao(b.posicao || "");

        const diffLinha = pesoLinha(linhaA) - pesoLinha(linhaB);
        if (diffLinha !== 0) return diffLinha;
        return numeroA - numeroB;
    });
};

const deduplicarAssentosPorSala = (lista = []) => {
    const vistos = new Set();
    return lista.filter((assento) => {
        const salaKey = Number(assento?.salaId) || 0;
        const chaveBase = assento?.posicao ? assento.posicao.trim().toUpperCase() : `ID-${assento?.id}`;
        const chave = `${salaKey}-${chaveBase}`;
        if (vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
    });
};

const obterLabelDataSessao = (dataHora) => {
    if (!dataHora) return "";
    const data = new Date(dataHora);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataComparar = new Date(data);
    dataComparar.setHours(0, 0, 0, 0);

    const diffDias = Math.floor((dataComparar - hoje) / (1000 * 60 * 60 * 24));
    if (diffDias === 0) return "HOJE";
    if (diffDias === 1) return "AMANHÃ";
    return data.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit"
    }).toUpperCase();
};

export default function AssentosSessao({ params }) {
    const { sessaoId } = use(params);
    const router = useRouter();
    const [sessao, setSessao] = useState(null);
    const [filme, setFilme] = useState(null);
    const [assentos, setAssentos] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        const carregarDados = async () => {
            setLoading(true);
            setErro("");
            try {
                const sessaoResponse = await axios.get(`http://localhost:5000/sessoes/${sessaoId}`);
                const sessaoData = sessaoResponse.data;
                setSessao(sessaoData);

                const [filmeResponse, assentosResponse, registrosResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/filmes/${sessaoData.filmeId}`),
                    axios.get(`http://localhost:5000/assentos?salaId=${sessaoData.salaId}`),
                    axios
                        .get(`http://localhost:5000/registroSessoes?sessaoId=${sessaoId}`)
                        .catch(() => ({ data: [] }))
                ]);

                setFilme(filmeResponse.data);
                const ocupados = new Set((registrosResponse.data || []).map((registro) => registro.assentoId));

                const salaIdNumero = Number(sessaoData.salaId);
                const assentosSala = (assentosResponse.data || []).filter((assento) => {
                    const salaAssento = Number(assento.salaId);
                    return salaAssento === salaIdNumero;
                });

                const assentosProcessados = deduplicarAssentosPorSala(assentosSala).map((assento) => ({
                    ...assento,
                    ocupado: ocupados.has(assento.id) || (assento.status || "").toLowerCase() === "ocupado"
                }));

                setAssentos(ordenarAssentos(assentosProcessados));
            } catch (error) {
                console.error("Erro ao carregar dados da sessão", error);
                setErro("Não conseguimos carregar os assentos desta sessão. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        if (sessaoId) {
            carregarDados();
        }
    }, [sessaoId]);

    const toggleSeat = (assento) => {
        if (assento.ocupado) return;
        setSelectedSeats((prev) => (
            prev.includes(assento.id)
                ? prev.filter((id) => id !== assento.id)
                : [...prev, assento.id]
        ));
    };

    const formatarHora = (dataIso) => {
        if (!dataIso) return "";
        return new Date(dataIso).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const detalheFilmeHref = filme ? `/${filme.id}` : "/Filmes";
    const assentosSelecionados = assentos.filter((assento) => selectedSeats.includes(assento.id));

    const getSeatLabel = (assentoId, ocupado) => {
        const selecionado = selectedSeats.includes(assentoId);
        if (ocupado || selecionado) {
            return "X";
        }
        return "";
    };

    const handleContinue = () => {
        if (assentosSelecionados.length === 0) return;

        const payload = {
            sessaoId,
            filmeId: filme?.id,
            filmeNome: filme?.nome,
            salaId: sessao?.salaId,
            dataHora: sessao?.dataHora,
            quantidade: assentosSelecionados.length,
            assentos: assentosSelecionados.map((seat) => ({
                id: seat.id,
                posicao: seat.posicao,
                salaId: seat.salaId
            }))
        };

        try {
            sessionStorage.setItem("cineflow-assentos-selecionados", JSON.stringify(payload));
        } catch (error) {
            console.warn("Não foi possível salvar a seleção localmente", error);
        }

        router.push("/bomboniere");
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loadingText}>CARREGANDO ASSENTOS...</p>
            </div>
        );
    }

    if (erro || !sessao) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loadingText}>{erro || "Sessão não encontrada."}</p>
                <Button href="/Filmes">VOLTAR</Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <SiteHeader
                backHref={detalheFilmeHref}
                backLabel="VOLTAR"
            />

            <section className={styles.sessionInfo}>
                                <p className={styles.sessionSummary}>
                    <span className={styles.sessionSummaryLabel}>FILME:</span> {filme?.nome || "Sessão"} <span className={styles.sessionSummaryDivider}>|</span>
                    <span className={styles.sessionSummaryLabel}>DATA:</span> {obterLabelDataSessao(sessao.dataHora)} <span className={styles.sessionSummaryDivider}>|</span>
                    <span className={styles.sessionSummaryLabel}>SESSÃO:</span> {formatarHora(sessao.dataHora)}h <span className={styles.sessionSummaryDivider}>|</span>
                    <span className={styles.sessionSummaryLabel}>SALA:</span> {sessao.salaId} <span className={styles.sessionSummaryDivider}>|</span>
                    <span className={styles.sessionSummaryLabel}>TIPO:</span> {sessao.tipo} {sessao.dublagem && `- ${sessao.dublagem}`}
                </p>
            </section>

            <section className={styles.chooser}>
                <div className={styles.screen}>TELA</div>
                <div className={styles.seatsGrid}>
                    {assentos.map((assento) => (
                        <button
                            key={assento.id}
                            type="button"
                            className={`${styles.seat} ${assento.ocupado ? styles.seatOccupied : styles.seatFree} ${selectedSeats.includes(assento.id) ? styles.seatSelected : ""
                                }`}
                            onClick={() => toggleSeat(assento)}
                            disabled={assento.ocupado}
                            aria-label={`Assento ${assento.posicao || assento.id}`}
                        >
                            <span className={styles.seatLabel}>{getSeatLabel(assento.id, assento.ocupado)}</span>
                        </button>
                    ))}
                </div>
            </section>

            <div className={styles.legend}>
                <div>
                    <span className={`${styles.legendBadge} ${styles.legendFree}`}></span>
                    <p>DISPONÍVEL</p>
                </div>
                <div>
                    <span className={`${styles.legendBadge} ${styles.legendSelected}`}></span>
                    <p>SELECIONANDO</p>
                </div>
                <div>
                    <span className={`${styles.legendBadge} ${styles.legendOccupied}`}></span>
                    <p>OCUPADO</p>
                </div>
            </div>

            <div className={styles.selectionSummary}>
                {assentosSelecionados.length === 0 ? (
                    <p>Escolha um assento livre para continuar.</p>
                ) : (
                    <>
                        <p>
                            Você selecionou <strong>{assentosSelecionados.length}</strong> assento(s):
                        </p>
                        <div className={styles.selectedList}>
                            {assentosSelecionados.map((seat) => (
                                <span key={seat.id}>{seat.posicao || seat.id}</span>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className={styles.actionsBar}>
                <button
                    type="button"
                    className={styles.continueButton}
                    disabled={assentosSelecionados.length === 0}
                    onClick={handleContinue}
                >
                    CONTINUAR
                </button>
                <button type="button" className={styles.backButton} onClick={() => router.back()}>
                    VOLTAR
                </button>
            </div>
        </div>
    );
}
