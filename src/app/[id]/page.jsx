"use client";
import React, { useState, useEffect, use } from "react";
import axios from "axios";
import styles from "./page.module.css";
import Button from "@/components/Button/page";
import SiteHeader from "@/components/Header/page";
import { useRouter } from "next/navigation";

export default function DetalhesFilme({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const [filme, setFilme] = useState(null);
    const [sessoes, setSessoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [datasDisponiveis, setDatasDisponiveis] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [editFormData, setEditFormData] = useState(null);
    const [editFeedback, setEditFeedback] = useState({ success: "", error: "", saving: false });
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchFilmeData = async () => {
            setLoading(true);
            try {
                // Buscar dados do filme
                const filmeResponse = await axios.get(`http://localhost:5000/filmes/${unwrappedParams.id}`);
                setFilme(filmeResponse.data);
                setEditFormData({
                    nome: filmeResponse.data?.nome || "",
                    classificacaoIndicativa: filmeResponse.data?.classificacaoIndicativa || "",
                    duracaoMinutos: filmeResponse.data?.duracaoMinutos ?? "",
                    genero: filmeResponse.data?.genero || "",
                    sinopse: filmeResponse.data?.sinopse || "",
                    imgUrl: filmeResponse.data?.imgUrl || ""
                });

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

    useEffect(() => {
        try {
            const token = localStorage.getItem("userToken");
            setIsAuthenticated(!!token);
            setAuthToken(token);
        } catch (_) {
            setIsAuthenticated(false);
            setAuthToken(null);
        }
    }, []);

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

    const classificacaoOptions = [
        { label: "Livre", value: "1" },
        { label: "6 anos", value: "6" },
        { label: "10 anos", value: "10" },
        { label: "12 anos", value: "12" },
        { label: "14 anos", value: "14" },
        { label: "16 anos", value: "16" },
        { label: "18 anos", value: "18" }
    ];

    const handleEditChange = (field, value) => {
        setEditFormData((prev) => ({
            ...(prev || {}),
            [field]: field === "duracaoMinutos" ? value.replace(/[^0-9]/g, "") : value
        }));
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        if (!authToken) {
            setEditFeedback({ success: "", error: "Você precisa estar logado para editar.", saving: false });
            return;
        }

        setEditFeedback({ success: "", error: "", saving: true });

        const payload = {
            ...editFormData,
            duracaoMinutos: Number(editFormData?.duracaoMinutos) || 0
        };

        try {
            await axios.put(`http://localhost:5000/filmes/${unwrappedParams.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            });
            setFilme((prev) => ({ ...prev, ...payload }));
            setEditFeedback({ success: "Filme atualizado com sucesso!", error: "", saving: false });
        } catch (error) {
            console.error("Erro ao atualizar filme", error);
            const message = error?.response?.data?.message || "Não foi possível atualizar o filme.";
            setEditFeedback({ success: "", error: message, saving: false });
        }
    };

    const handleDeleteFilme = async () => {
        if (!authToken) {
            setEditFeedback({ success: "", error: "Você precisa estar logado para deletar o filme.", saving: false });
            return;
        }

        const confirmed = window.confirm("Deseja realmente deletar este filme? Esta ação não pode ser desfeita.");
        if (!confirmed) return;

        setDeleteLoading(true);
        setEditFeedback((prev) => ({ ...prev, success: "", error: "", saving: false }));

        try {
            await axios.delete(`http://localhost:5000/filmes/${unwrappedParams.id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            router.push("/Filmes");
        } catch (error) {
            console.error("Erro ao deletar filme", error);
            const message = error?.response?.data?.message || "Não foi possível deletar o filme.";
            setEditFeedback({ success: "", error: message, saving: false });
        } finally {
            setDeleteLoading(false);
        }
    };

    // Filtrar sessões pela data selecionada
    const sessoesFiltradas = dataSelecionada ? sessoes.filter(sessao => {
        const dataSessao = new Date(sessao.dataHora);
        dataSessao.setHours(0, 0, 0, 0);
        const dataSelec = new Date(dataSelecionada);
        dataSelec.setHours(0, 0, 0, 0);
        return dataSessao.getTime() === dataSelec.getTime();
    }) : [];

    const handleSessaoClick = (sessao) => {
        if (!sessao?.id) return;
        router.push(`/sessoes/${sessao.id}`);
    };

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
            <SiteHeader backHref="/Filmes" />

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

            {isAuthenticated && (
                <section className={styles.editSection}>
                    <h2 className={styles.editTitle}>Editar informações do filme</h2>
                    <p className={styles.editSubtitle}>Atualize o título, a classificação indicativa, o gênero, a duração ou a sinopse e salve para manter os dados alinhados com o cartaz.</p>

                    <form className={styles.editForm} onSubmit={handleEditSubmit}>
                        <div className={styles.formGrid}>
                            <label className={styles.editField}>
                                <span>Nome</span>
                                <input
                                    type="text"
                                    value={editFormData?.nome || ''}
                                    onChange={(event) => handleEditChange('nome', event.target.value)}
                                    required
                                />
                            </label>

                            <label className={styles.editField}>
                                <span>Classificação</span>
                                <select
                                    value={editFormData?.classificacaoIndicativa || ''}
                                    onChange={(event) => handleEditChange('classificacaoIndicativa', event.target.value)}
                                    required
                                >
                                    <option value="" disabled>Selecione</option>
                                    {classificacaoOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </label>

                            <label className={styles.editField}>
                                <span>Duração (min)</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={editFormData?.duracaoMinutos ?? ''}
                                    onChange={(event) => handleEditChange('duracaoMinutos', event.target.value)}
                                    required
                                />
                            </label>

                            <label className={styles.editField}>
                                <span>Gênero</span>
                                <input
                                    type="text"
                                    value={editFormData?.genero || ''}
                                    onChange={(event) => handleEditChange('genero', event.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <label className={styles.editField}>
                            <span>Sinopse</span>
                            <textarea
                                rows={4}
                                value={editFormData?.sinopse || ''}
                                onChange={(event) => handleEditChange('sinopse', event.target.value)}
                                placeholder="Descreva a trama em poucas linhas"
                            />
                        </label>

                        <label className={styles.editField}>
                            <span>Imagem (URL)</span>
                            <input
                                type="url"
                                value={editFormData?.imgUrl || ''}
                                onChange={(event) => handleEditChange('imgUrl', event.target.value)}
                                placeholder="https://exemplo.com/cartaz.jpg"
                            />
                        </label>

                        <div className={styles.editActions}>
                            <div className={styles.actionGroup}>
                                <button type="submit" className={`${styles.actionButton} ${styles.saveButton}`} disabled={editFeedback.saving}>
                                    {editFeedback.saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                                <div className={styles.feedbackWrapper}>
                                    {editFeedback.success && <span className={styles.feedbackSuccess}>{editFeedback.success}</span>}
                                    {editFeedback.error && <span className={styles.feedbackError}>{editFeedback.error}</span>}
                                </div>
                            </div>
                            <button
                                type="button"
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                onClick={handleDeleteFilme}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'DELETANDO...' : 'DELETAR'}
                            </button>
                        </div>
                    </form>
                </section>
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
                                    <button
                                        key={sessao.id}
                                        type="button"
                                        className={styles.sessaoCard}
                                        onClick={() => handleSessaoClick(sessao)}
                                    >
                                        <div className={styles.sessaoHorario}>{horario}</div>
                                        <div className={styles.sessaoInfo}>
                                            <p>{sessao.tipo}</p>
                                            <p>{sessao.dublagem}</p>
                                        </div>
                                    </button>
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
