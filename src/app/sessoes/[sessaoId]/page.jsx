"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./page.module.css";
import Button from "@/components/Button/page";
import SiteHeader from "@/components/Header/page";
import { useParams, useRouter } from "next/navigation";

const parseSeat = (posicao = "") => {
    const match = posicao.match(/^([A-Za-z]+)(\d+)$/);
    return {
        row: (match?.[1] || "").toUpperCase(),
        number: Number(match?.[2]) || 0
    };
};

const sortSeats = (a, b) => {
    const seatA = parseSeat(a.posicao || "");
    const seatB = parseSeat(b.posicao || "");
    const rowDiff = seatA.row.localeCompare(seatB.row);
    if (rowDiff !== 0) return rowDiff;
    return seatA.number - seatB.number;
};

const buildSeats = (assentos = [], registros = [], salaId) => {
    const listaRegistros = Array.isArray(registros) ? registros : [];
    const idsOcupados = new Set(listaRegistros.map((reg) => reg.assentoId));
    const posicoesVistas = new Set();

    return (assentos || [])
        .filter((assento) => {
            const ehDaSala = Number(assento?.salaId) === Number(salaId);
            
            if (!ehDaSala) return false;

            const chave = (assento.posicao || assento.id || "").toString().toUpperCase();
            
            if (posicoesVistas.has(chave)) return false;

            posicoesVistas.add(chave);
            return true;
        })
        .map((assento) => {
            const estaNoRegistro = idsOcupados.has(assento.id);
            const statusOcupado = assento.status?.toLowerCase() === "ocupado";

            return {
                ...assento,
                reservado: estaNoRegistro,
                ocupado: estaNoRegistro || statusOcupado
            };
        })
        .sort(sortSeats);
};

const getSessionDateLabel = (dataHora) => {
    if (!dataHora) return "";

    const dataEvento = new Date(dataHora);
    const dataHoje = new Date();

    dataEvento.setHours(0, 0, 0, 0);
    dataHoje.setHours(0, 0, 0, 0);

    const diffMs = dataEvento - dataHoje;
    const diffDias = Math.round(diffMs / 86400000);

    if (diffDias === 0) return "HOJE";
    if (diffDias === 1) return "AMANHÃ";

    return new Date(dataHora).toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit"
    }).toUpperCase();
};

const formatHour = (dataIso) => {
    if (!dataIso) return "";

    return new Date(dataIso).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
};

const initialPageState = {
    session: null,
    film: null,
    seats: [],
    loading: true,
    error: ""
};

export default function AssentosSessao() {
    const router = useRouter();
    const params = useParams();
    const sessaoId = params?.sessaoId;

    const [pageState, setPageState] = useState(initialPageState);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        if (!sessaoId) return;

        const carregarDados = async () => {
            setPageState((prev) => ({ ...prev, loading: true, error: "" }));
            try {
                const sessaoResponse = await axios.get(`http://localhost:5000/sessoes/${sessaoId}`);
                const sessaoData = sessaoResponse.data;

                const [filmeResponse, assentosResponse, registrosResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/filmes/${sessaoData.filmeId}`),
                    axios.get(`http://localhost:5000/assentos?salaId=${sessaoData.salaId}`),
                    axios.get(`http://localhost:5000/registros-sessao?sessaoId=${sessaoId}`).catch(() => ({ data: [] }))
                ]);

                setPageState({
                    session: sessaoData,
                    film: filmeResponse.data,
                    seats: buildSeats(assentosResponse.data || [], registrosResponse.data || [], sessaoData.salaId),
                    loading: false,
                    error: ""
                });
                setSelectedSeats([]);
            } catch (error) {
                console.error("Erro ao carregar dados da sessão", error);
                setPageState({ ...initialPageState, loading: false, error: "Não conseguimos carregar os assentos desta sessão. Tente novamente mais tarde." });
            }
        };

        carregarDados();
    }, [sessaoId]);

    const toggleSeat = (assento) => {
        if (assento.ocupado) return;
        setSelectedSeats((prev) => (
            prev.includes(assento.id) ? prev.filter((id) => id !== assento.id) : [...prev, assento.id]
        ));
    };

    const { session, film, seats, loading, error } = pageState;
    const detalheFilmeHref = film ? `/${film.id}` : "/Filmes";
    const assentosSelecionados = seats.filter((assento) => selectedSeats.includes(assento.id));

        const getSeatLabel = (assento) => {
            if (assento.reservado) return "OC";
            if (selectedSeats.includes(assento.id)) return "X";
            if (assento.ocupado) return "X";
            return "";
        };

    const handleContinue = () => {
        if (assentosSelecionados.length === 0) return;

        const payload = {
            sessaoId,
            filmeId: film?.id,
            filmeNome: film?.nome,
            salaId: session?.salaId,
            dataHora: session?.dataHora,
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

    if (error || !session) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loadingText}>{error || "Sessão não encontrada."}</p>
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
                    <span className={styles.sessionSummaryLabel}>FILME:</span> {film?.nome || "Sessão"} <span className={styles.sessionSummaryDivider}>|</span>
                    <span className={styles.sessionSummaryLabel}>DATA:</span> {getSessionDateLabel(session.dataHora)} <span className={styles.sessionSummaryDivider}>|</span>
                    <span className={styles.sessionSummaryLabel}>SESSÃO:</span> {formatHour(session.dataHora)}h <span className={styles.sessionSummaryDivider}>|</span>
                    <span className={styles.sessionSummaryLabel}>SALA:</span> {session.salaId} <span className={styles.sessionSummaryDivider}>|</span>
                    <span className={styles.sessionSummaryLabel}>TIPO:</span> {session.tipo} {session.dublagem && `- ${session.dublagem}`}
                </p>
            </section>

            <section className={styles.chooser}>
                <div className={styles.screen}>TELA</div>
                <div className={styles.seatsGrid}>
                    {seats.map((assento) => (
                        <button
                            key={assento.id}
                            type="button"
                            className={`${styles.seat} ${assento.reservado ? styles.seatBooked : assento.ocupado ? styles.seatOccupied : styles.seatFree} ${selectedSeats.includes(assento.id) ? styles.seatSelected : ""
                                }`}
                            onClick={() => toggleSeat(assento)}
                            disabled={assento.ocupado}
                            aria-label={`Assento ${assento.posicao || assento.id}`}
                        >
                            <span className={styles.seatLabel}>{getSeatLabel(assento)}</span>
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
                <div>
                    <span className={`${styles.legendBadge} ${styles.legendBooked}`}></span>
                    <p>RESERVADO</p>
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
