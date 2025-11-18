"use client";
import React, { useState, useEffect, use } from "react";
import axios from "axios";
import styles from "./page.module.css";
import Button from "@/components/Button";
import ProfileLink from "@/components/ProfileLink";

export default function DetalhesFilme({ params }) {
    const unwrappedParams = use(params);
    const [filme, setFilme] = useState(null);
    const [sessoes, setSessoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [datasDisponiveis, setDatasDisponiveis] = useState([]);

    useEffect(() => {
        const fetchFilmeData = async () => {
            setLoading(true);
            try {
                // Buscar dados do filme
                const filmeResponse = await axios.get(`http://localhost:5000/filmes/${unwrappedParams.id}`);
                setFilme(filmeResponse.data);

                // Buscar sessões do filme
                const sessoesResponse = await axios.get(`http://localhost:5000/sessoes?filmeId=${unwrappedParams.id}`);
                const sessoesData = sessoesResponse.data;
                setSessoes(sessoesData);

                // Extrair datas únicas das sessões
                const datas = extrairDatasUnicas(sessoesData);
                setDatasDisponiveis(datas);

                // Não selecionar data automaticamente
                setDataSelecionada(null);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilmeData();
    }, [unwrappedParams.id]);

    // Extrair datas únicas das sessões disponíveis
    const extrairDatasUnicas = (sessoes) => {
        if (!sessoes || sessoes.length === 0) {
            return [];
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const datasMap = new Map();

        sessoes.forEach(sessao => {
            const data = new Date(sessao.dataHora);
            data.setHours(0, 0, 0, 0);
            const dataStr = data.toISOString().split('T')[0];

            if (!datasMap.has(dataStr)) {
                const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
                const diffDias = Math.floor((data - hoje) / (1000 * 60 * 60 * 24));

                let label;
                if (diffDias === 0) label = 'HOJE';
                else if (diffDias === 1) label = 'AMANHÃ';
                else label = diasSemana[data.getDay()];

                datasMap.set(dataStr, {
                    label,
                    data: data.toLocaleDateString('pt-BR'),
                    dataCompleta: data
                });
            }
        });

        return Array.from(datasMap.values()).sort((a, b) => a.dataCompleta - b.dataCompleta);
    };

    // Filtrar sessões pela data selecionada
    const sessoesFiltradas = dataSelecionada ? sessoes.filter(sessao => {
        const dataSessao = new Date(sessao.dataHora);
        dataSessao.setHours(0, 0, 0, 0);
        const dataSelec = new Date(dataSelecionada);
        dataSelec.setHours(0, 0, 0, 0);
        return dataSessao.getTime() === dataSelec.getTime();
    }) : [];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loadingText}>CARREGANDO...</p>
            </div>
        );
    }

    if (!filme) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loadingText}>FILME NÃO ENCONTRADO</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.backButtonContainer}>
                    <Button href="/Filmes">VOLTAR</Button>
                </div>
                <div className={styles.logo}>
                    <span className={styles.cine}>Cine</span>
                    <div className={styles.glasses}>
                        <div className={styles.lensLeft}></div>
                        <div className={styles.lensRight}></div>
                    </div>
                    <span className={styles.flow}>Flow</span>
                </div>
                <div className={styles.profileContainer}>
                    <ProfileLink />
                </div>
            </div>

            <div className={styles.linha}></div>

            {/* Título */}
            <h1 className={styles.titulo}>SELECIONE A SESSÃO</h1>

            {/* Seletor de datas */}
            {datasDisponiveis.length > 0 ? (
                <div className={styles.datasContainer}>
                    {datasDisponiveis.map((d, index) => (
                        <button
                            key={index}
                            className={`${styles.dataBtn} ${dataSelecionada && dataSelecionada.getTime() === d.dataCompleta.getTime() ? styles.dataBtnAtiva : ''}`}
                            onClick={() => setDataSelecionada(d.dataCompleta)}
                        >
                            <div className={styles.dataLabel}>{d.label}</div>
                            <div className={styles.dataNumero}>{d.data}</div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className={styles.mensagemContainer}>
                    <p className={styles.mensagemIndisponivel}>
                        Nenhuma sessão disponível para este filme no momento.
                    </p>
                </div>
            )}

            {/* Card do Filme */}
            {datasDisponiveis.length > 0 && (
                <div className={styles.filmeCard}>
                    <div className={styles.filmeImageContainer}>
                        <img src={filme.imgUrl} alt={filme.nome} className={styles.filmeImage} />
                    </div>
                    <div className={styles.filmeInfo}>
                        <h2 className={styles.filmeNome}>{filme.nome}</h2>
                        <p className={styles.filmeMetadata}>
                            <span className={`${styles.classificacao} ${
                                filme.classificacaoIndicativa === '1' ? styles.classificacaoLivre :
                                filme.classificacaoIndicativa === '6' ? styles.classificacao6 :
                                filme.classificacaoIndicativa === '10' ? styles.classificacao10 :
                                filme.classificacaoIndicativa === '12' ? styles.classificacao12 :
                                filme.classificacaoIndicativa === '14' ? styles.classificacao14 :
                                filme.classificacaoIndicativa === '16' ? styles.classificacao16 :
                                filme.classificacaoIndicativa === '18' ? styles.classificacao18 : ''
                            }`}>
                                {filme.classificacaoIndicativa === '1' ? 'Livre' : filme.classificacaoIndicativa}
                            </span>
                            <span>{filme.duracaoMinutos}min</span>
                            <span>{filme.genero}</span>
                        </p>
                        <div className={styles.sinopseContainer}>
                            {filme.sinopse ? (
                                <p className={styles.filmeSinopse}>{filme.sinopse}</p>
                            ) : (
                                <p className={styles.mensagemIndisponivel}>Sinopse não disponível no momento.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sessões disponíveis */}
            {datasDisponiveis.length > 0 && (
                <>
                    {!dataSelecionada ? (
                        <div className={styles.mensagemContainer}>
                            <p className={styles.mensagemIndisponivel}>
                                Por favor, selecione uma data para visualizar as sessões disponíveis.
                            </p>
                        </div>
                    ) : sessoesFiltradas.length > 0 ? (
                        <div className={styles.sessoesContainer}>
                            {sessoesFiltradas.map((sessao) => {
                                const horario = new Date(sessao.dataHora).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                                return (
                                    <div key={sessao.id} className={styles.sessaoCard}>
                                        <div className={styles.sessaoHorario}>{horario}</div>
                                        <div className={styles.sessaoInfo}>
                                            <p>{sessao.tipo}</p>
                                            <p>{sessao.dublagem}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.mensagemContainer}>
                            <p className={styles.mensagemIndisponivel}>
                                Nenhuma sessão disponível para esta data.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
