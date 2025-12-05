"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.css";
import SiteHeader from "@/components/Header/page";
import { useParams, useRouter } from "next/navigation";

const defaultFormValues = {
    nome: "",
    classificacaoIndicativa: "",
    duracaoMinutos: "",
    genero: "",
    sinopse: "",
    imgUrl: ""
};

const createFormFromFilm = (film) => ({
    ...defaultFormValues,
    nome: film?.nome || "",
    classificacaoIndicativa: film?.classificacaoIndicativa || "",
    duracaoMinutos: film?.duracaoMinutos ?? "",
    genero: film?.genero || "",
    sinopse: film?.sinopse || "",
    imgUrl: film?.imgUrl || ""
});

const buildAvailableDates = (sessions = []) => {
    if (!sessions.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const labels = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const map = new Map();

    sessions.forEach((sessao) => {
        const date = new Date(sessao.dataHora);
        date.setHours(0, 0, 0, 0);
        const key = date.toISOString().split('T')[0];

        if (map.has(key)) return;

        const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24));
        const label = diffDays === 0 ? 'HOJE' : diffDays === 1 ? 'AMANHÃ' : labels[date.getDay()];

        map.set(key, {
            label,
            data: date.toLocaleDateString('pt-BR'),
            dataCompleta: date
        });
    });

    return Array.from(map.values()).sort((a, b) => a.dataCompleta - b.dataCompleta);
};

const initialPageState = {
    film: null,
    sessions: [],
    availableDates: [],
    selectedDate: null
};

export default function DetalhesFilme() {
    const params = useParams();
    const router = useRouter();
    const movieId = params?.id;
    const [pageState, setPageState] = useState(initialPageState);
    const [statusState, setStatusState] = useState({ loading: true, deleting: false });
    const [authState, setAuthState] = useState({ token: null, isAuthenticated: false });
    const [editState, setEditState] = useState({
        form: { ...defaultFormValues },
        success: "",
        error: "",
        saving: false
    });

    useEffect(() => {
        if (!movieId) return;

        const fetchPageData = async () => {
            setStatusState((prev) => ({ ...prev, loading: true }));
            try {
                const [filmeResponse, sessoesResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/filmes/${movieId}`),
                    axios.get(`http://localhost:5000/sessoes?filmeId=${movieId}`)
                ]);

                const filmeData = filmeResponse?.data || null;
                const sessoesData = Array.isArray(sessoesResponse?.data) ? sessoesResponse.data : [];

                setPageState({
                    film: filmeData,
                    sessions: sessoesData,
                    availableDates: buildAvailableDates(sessoesData),
                    selectedDate: null
                });

                setEditState((prev) => ({
                    ...prev,
                    form: createFormFromFilm(filmeData)
                }));
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
                setPageState({ ...initialPageState });
            } finally {
                setStatusState((prev) => ({ ...prev, loading: false }));
            }
        };

        fetchPageData();
    }, [movieId]);

    useEffect(() => {
        try {
            const token = localStorage.getItem("userToken");
            setAuthState({
                token: token || null,
                isAuthenticated: Boolean(token)
            });
        } catch (_) {
            setAuthState({ token: null, isAuthenticated: false });
        }
    }, []);

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
        setEditState((prev) => ({
            ...prev,
            form: {
                ...prev.form,
                [field]: field === "duracaoMinutos" ? value.replace(/[^0-9]/g, "") : value
            }
        }));
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        if (!authState.token) {
            setEditState((prev) => ({ ...prev, success: "", error: "Você precisa estar logado para editar.", saving: false }));
            return;
        }

        setEditState((prev) => ({ ...prev, success: "", error: "", saving: true }));

        const payload = {
            ...editState.form,
            duracaoMinutos: Number(editState.form?.duracaoMinutos) || 0
        };

        try {
            await axios.put(`http://localhost:5000/filmes/${movieId}`, payload, {
                headers: {
                    Authorization: `Bearer ${authState.token}`,
                    "Content-Type": "application/json"
                }
            });
            setPageState((prev) => ({
                ...prev,
                film: prev.film ? { ...prev.film, ...payload } : prev.film
            }));
            setEditState((prev) => ({ ...prev, success: "Filme atualizado com sucesso!", error: "", saving: false }));
        } catch (error) {
            console.error("Erro ao atualizar filme", error);
            const message = error?.response?.data?.message || "Não foi possível atualizar o filme.";
            setEditState((prev) => ({ ...prev, success: "", error: message, saving: false }));
        }
    };

    const handleDeleteFilme = async () => {
        if (!authState.token) {
            setEditState((prev) => ({ ...prev, success: "", error: "Você precisa estar logado para deletar o filme.", saving: false }));
            return;
        }

        const confirmed = window.confirm("Deseja realmente deletar este filme? Esta ação não pode ser desfeita.");
        if (!confirmed) return;

        setStatusState((prev) => ({ ...prev, deleting: true }));
        setEditState((prev) => ({ ...prev, success: "", error: "", saving: false }));

        try {
            await axios.delete(`http://localhost:5000/filmes/${movieId}`, {
                headers: {
                    Authorization: `Bearer ${authState.token}`
                }
            });
            router.push("/Filmes");
        } catch (error) {
            console.error("Erro ao deletar filme", error);
            const message = error?.response?.data?.message || "Não foi possível deletar o filme.";
            setEditState((prev) => ({ ...prev, success: "", error: message, saving: false }));
        } finally {
            setStatusState((prev) => ({ ...prev, deleting: false }));
        }
    };

    const { film, sessions, availableDates, selectedDate } = pageState;
    const { loading, deleting } = statusState;
    const { isAuthenticated } = authState;
    const { form, success, error, saving } = editState;

    const sessoesFiltradas = selectedDate ? sessions.filter(sessao => {
        const dataSessao = new Date(sessao.dataHora);
        dataSessao.setHours(0, 0, 0, 0);
        const dataSelec = new Date(selectedDate);
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

    if (!film) {
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
            {availableDates.length > 0 ? (
                <div className={styles.datasContainer}>
                    {availableDates.map((d, index) => (
                        <button
                            key={index}
                            className={`${styles.dataBtn} ${selectedDate && selectedDate.getTime() === d.dataCompleta.getTime() ? styles.dataBtnAtiva : ''}`}
                            onClick={() => setPageState((prev) => ({ ...prev, selectedDate: d.dataCompleta }))}
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

            {availableDates.length > 0 && (
                <div className={styles.filmeCard}>
                    <div className={styles.filmeImageContainer}>
                        <img src={film.imgUrl} alt={film.nome} className={styles.filmeImage} />
                    </div>
                    <div className={styles.filmeInfo}>
                        <h2 className={styles.filmeNome}>{film.nome}</h2>
                        <p className={styles.filmeMetadata}>
                            <span className={`${styles.classificacao} ${
                                film.classificacaoIndicativa === '1' ? styles.classificacaoLivre :
                                film.classificacaoIndicativa === '6' ? styles.classificacao6 :
                                film.classificacaoIndicativa === '10' ? styles.classificacao10 :
                                film.classificacaoIndicativa === '12' ? styles.classificacao12 :
                                film.classificacaoIndicativa === '14' ? styles.classificacao14 :
                                film.classificacaoIndicativa === '16' ? styles.classificacao16 :
                                film.classificacaoIndicativa === '18' ? styles.classificacao18 : ''
                            }`}>
                                {film.classificacaoIndicativa === '1' ? 'Livre' : film.classificacaoIndicativa}
                            </span>
                            <span>{film.duracaoMinutos}min</span>
                            <span>{film.genero}</span>
                        </p>
                        <div className={styles.sinopseContainer}>
                            {film.sinopse ? (
                                <p className={styles.filmeSinopse}>{film.sinopse}</p>
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
                                    value={form?.nome || ''}
                                    onChange={(event) => handleEditChange('nome', event.target.value)}
                                    required
                                />
                            </label>

                            <label className={styles.editField}>
                                <span>Classificação</span>
                                <select
                                    value={form?.classificacaoIndicativa || ''}
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
                                    value={form?.duracaoMinutos ?? ''}
                                    onChange={(event) => handleEditChange('duracaoMinutos', event.target.value)}
                                    required
                                />
                            </label>

                            <label className={styles.editField}>
                                <span>Gênero</span>
                                <input
                                    type="text"
                                    value={form?.genero || ''}
                                    onChange={(event) => handleEditChange('genero', event.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <label className={styles.editField}>
                            <span>Sinopse</span>
                            <textarea
                                rows={4}
                                value={form?.sinopse || ''}
                                onChange={(event) => handleEditChange('sinopse', event.target.value)}
                                placeholder="Descreva a trama em poucas linhas"
                            />
                        </label>

                        <label className={styles.editField}>
                            <span>Imagem (URL)</span>
                            <input
                                type="url"
                                value={form?.imgUrl || ''}
                                onChange={(event) => handleEditChange('imgUrl', event.target.value)}
                                placeholder="https://exemplo.com/cartaz.jpg"
                            />
                        </label>

                        <div className={styles.editActions}>
                            <div className={styles.actionGroup}>
                                <button type="submit" className={`${styles.actionButton} ${styles.saveButton}`} disabled={saving}>
                                    {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                                <div className={styles.feedbackWrapper}>
                                    {success && <span className={styles.feedbackSuccess}>{success}</span>}
                                    {error && <span className={styles.feedbackError}>{error}</span>}
                                </div>
                            </div>
                            <button
                                type="button"
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                onClick={handleDeleteFilme}
                                disabled={deleting}
                            >
                                {deleting ? 'DELETANDO...' : 'DELETAR'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Sessões disponíveis */}
            {availableDates.length > 0 && (
                <>
                    {!selectedDate ? (
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
