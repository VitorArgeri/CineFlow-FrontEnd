"use client"
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./filmes.module.css";
import Button from "@/components/Button";
import ProfileLink from "@/components/ProfileLink";

export default function Filmes() {
    const [filmes, setFilmes] = useState([]);
    const [activeTab, setActiveTab] = useState('Em Cartaz')
    const [loading, setLoading] = useState(false);

    const searchForFilmes = async () => {
        setLoading(true)
        try {
            const response = await axios.get('http://localhost:5000/filmes')
            const data = response.data;
            console.log('Dados recebidos:', data)
            console.log('Primeiro filme', data[0])
            setFilmes(data)
        } catch (error) {
            console.error('Erro ao buscar filmes:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        searchForFilmes()
    }, [])

    // Filtrar filmes por data de lançamento
    const filmesEmCartaz = filmes.filter(filme => {
        const dataLancamento = new Date(filme.dataLancamento);
        const hoje = new Date();
        return dataLancamento <= hoje;
    });

    const filmesEmBreve = filmes.filter(filme => {
        const dataLancamento = new Date(filme.dataLancamento);
        const hoje = new Date();
        return dataLancamento > hoje;
    });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loadingText}>CARREGANDO FILMES...</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.backButtonContainer}>
                    <Button href="/">
                        VOLTAR
                    </Button>
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
            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tab} ${activeTab === 'Em Cartaz' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('Em Cartaz')}
                >
                    EM CARTAZ
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'Em Breve' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('Em Breve')}
                >
                    EM BREVE
                </button>
            </div>

            <div className={styles.line}></div>

            <div className={styles.contentContainer}>
                {activeTab === 'Em Cartaz' && (
                    <div className={styles.filmesSection}>
                        <div className={styles.grid}>
                            {filmesEmCartaz.length > 0 ? (
                                filmesEmCartaz.map((filme) => (
                                    <div key={filme.id} className={styles.filmesCard}>
                                        <div className={styles.imageContainer}>
                                            <img src={filme.imgUrl} alt={filme.nome} className={styles.filmesImage} />
                                        </div>
                                        <div className={styles.filmesContainer}>
                                            <p className={styles.filmesNome}>{filme.nome}</p>
                                            <p className={styles.filmesInformacoes}>
                                                {filme.duracaoMinutos} min - {filme.classificacaoIndicativa === '1' ? 'Livre' : filme.classificacaoIndicativa}
                                            </p>
                                            <Button href={`/${filme.id}`}>
                                                VER SESSÕES
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noResultsContainer}>
                                    <p className={styles.noResults}>
                                        Nenhum filme em cartaz no momento.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'Em Breve' && (
                    <div className={styles.filmesSection}>
                        <div className={styles.grid}>
                            {filmesEmBreve.length > 0 ? (
                                filmesEmBreve.map((filme) => (
                                    <div key={filme.id} className={styles.filmesCard}>
                                        <div className={styles.imageContainer}>
                                            <img src={filme.imgUrl} alt={filme.nome} className={styles.filmesImage} />
                                        </div>
                                        <div className={styles.filmesContainer}>
                                            <p className={styles.filmesNome}>{filme.nome}</p>
                                            <p className={styles.filmesInformacoes}>
                                                {filme.duracaoMinutos} min - {filme.classificacaoIndicativa === '1' ? 'Livre' : filme.classificacaoIndicativa}
                                            </p>
                                            <Button href={`/${filme.id}`}>
                                                VER SESSÕES
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noResultsContainer}>
                                    <p className={styles.noResults}>
                                        Nenhum filme em breve no momento.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
