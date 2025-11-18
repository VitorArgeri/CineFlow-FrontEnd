'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './page.module.css';
import Button from '@/components/Button';
import ProfileLink from '@/components/ProfileLink';

export default function DetalhesSessao({ params }) {
    const [filme, setFilme] = useState(null);
    const [sessoes, setSessoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [datasDisponiveis, setDatasDisponiveis] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Buscar filme
                const filmeRes = await axios.get(`http://localhost:5000/filmes/${params.id}`);
                setFilme(filmeRes.data);

                // Buscar sessões do filme
                const sessoesRes = await axios.get(`http://localhost:5000/sessoes?filmeId=${params.id}`);
                const sessoesData = sessoesRes.data;
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

        fetchData();
    }, [params.id]);

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
    const sessoesFiltradas = sessoes.filter(sessao => {
        const dataSessao = new Date(sessao.dataHora);
        dataSessao.setHours(0, 0, 0, 0);
        const dataSelec = new Date(dataSelecionada);
        dataSelec.setHours(0, 0, 0, 0);
        return dataSessao.getTime() === dataSelec.getTime();
    });

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
        <main className={styles.main}>
            <div className={styles.backButtonWrapper}>
                <Button href="/Filmes">
                    VOLTAR
                </Button>
            </div>
            <div className={styles.profileWrapper}>
                <ProfileLink />
            </div>
            <section className={styles.selecaoSessao}>
                <h1 className={styles.titulo}>SELECIONE A SESSÃO</h1>
                
                {datasDisponiveis.length > 0 ? (
                    <div className={styles.datasContainer}>
                        {datasDisponiveis.map((data, index) => (
                            <button
                                key={index}
                                className={`${styles.dataBtn} ${dataSelecionada && dataSelecionada.getTime() === data.dataCompleta.getTime() ? styles.selecionada : ''}`}
                                onClick={() => setDataSelecionada(data.dataCompleta)}
                            >
                                <div className={styles.dataInfo}>
                                    <span className={styles.dataLabel}>{data.label}</span>
                                    <span className={styles.dataValor}>{data.data}</span>
                                </div>
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
            </section>

            <section className={styles.detalhesFilme}>
                {datasDisponiveis.length > 0 ? (
                    <div className={styles.filmeContainer}>
                        <img
                            src={filme.imgUrl}
                            alt={filme.nome}
                            className={styles.filmePoster}
                        />
                        <div className={styles.filmeInfo}>
                            <h2 className={styles.filmeTitulo}>{filme.nome}</h2>
                            <div className={styles.filmeMeta}>
                                <span className={styles.classificacao}>
                                    {filme.classificacaoIndicativa === '1' ? 'Livre' : filme.classificacaoIndicativa}
                                </span>
                                <span className={styles.duracao}>
                                    {filme.duracaoMinutos}min
                                </span>
                                <span className={styles.genero}>
                                    {filme.genero}
                                </span>
                            </div>
                            {filme.sinopse ? (
                                <p className={styles.sinopse}>
                                    {filme.sinopse}
                                </p>
                            ) : (
                                <p className={styles.mensagemIndisponivel}>
                                    Sinopse não disponível no momento.
                                </p>
                            )}
                        </div>
                    </div>
                ) : null}
            </section>

            <section className={styles.sessionsSection}>
                {!dataSelecionada && datasDisponiveis.length > 0 ? (
                    <div className={styles.mensagemContainer}>
                        <p className={styles.mensagemIndisponivel}>
                            Por favor, selecione uma data para visualizar as sessões disponíveis.
                        </p>
                    </div>
                ) : dataSelecionada && sessoesFiltradas.length > 0 ? (
                    <div className={styles.timeGrid}>
                        {sessoesFiltradas.map((sessao) => {
                            const horario = new Date(sessao.dataHora).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            return (
                                <button key={sessao.id} className={styles.timeButton}>
                                    <div className={styles.horario}>{horario}</div>
                                    <div className={styles.sessaoDetalhes}>
                                        <div>{sessao.tipo}</div>
                                        <div>{sessao.dublagem}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : dataSelecionada && datasDisponiveis.length > 0 ? (
                    <div className={styles.mensagemContainer}>
                        <p className={styles.mensagemIndisponivel}>
                            Nenhuma sessão disponível para esta data.
                        </p>
                    </div>
                ) : null}
            </section>
        </main>
    );
}