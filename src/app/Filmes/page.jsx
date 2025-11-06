"use client"
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./filmes.module.css";
import Link from "next/link"

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

    if (loading) {
        return <p className={styles.loadingText}>Carregando filmes...</p>
    }

    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <span className={styles.cine}>Cine</span>
                <div className={styles.glasses}>
                    <div className={styles.lensLeft}></div>
                    <div className={styles.lensRight}></div>
                </div>
                <span className={styles.flow}>Flow</span>
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
                        <h2 className={styles.sectionTitle}>Em Cartaz</h2>
                        <div className={styles.grid}>
                            {filmes.length > 0 ? (
                                filmes.map((filmes) => (
                                    <Link key={filmes.id} href={`/${filmes.id}`} className={styles.filmesCard} >
                                        <div className={styles.imageContainer}>
                                            <img src={filmes.imgUrl} alt={filmes.nome} className={styles.filmesImage} />
                                        </div>
                                        <p className={styles.filmesNome}>{filmes.nome}</p>
                                        <p>{filmes.duracaoMinutos} - {filmes.classificacaoIndicativa}</p>
                                        <button className={styles.verSessoes}>VER SESSÕES</button>
                                    </Link>
                                ))
                            ) : (
                                <p className={styles.noResults}>
                                    {filmes ? "Nenhum filme encontrada." : "Busque os dados para exibi-los."}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'Em Breve' && (
                    <div className={styles.filmesSection}>
                        <h2 className={styles.sectionTitle}>Em Breve</h2>
                        <div className={styles.grid}>
                            {filmes.length > 0 ? (
                                filmes.map((filmes) => (
                                    <Link key={filmes.id} href={`/${filmes.id}`} className={styles.filmesCard} >
                                        <div className={styles.imageContainer}>
                                            <img src={filmes.imgUrl} alt={filmes.nome} className={styles.filmesImage} />
                                        </div>
                                        <p className={styles.filmesNome}>{filmes.nome}</p>
                                        <p>{filmes.duracaoMinutos} - {filmes.classificacaoIndicativa}</p>
                                        <button className={styles.verSessoes}>VER SESSÕES</button>
                                    </Link>
                                ))
                            ) : (
                                <p className={styles.noResults}>
                                    {filmes ? "Nenhum filme encontrada." : "Busque os dados para exibi-los."}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
