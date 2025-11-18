'use client'
import { useState } from 'react';
import styles from './page.module.css';
import Button from '@/components/Button';
import ProfileLink from '@/components/ProfileLink';

export default function DetalhesSessao({ params }) {
    const [dataSelecionada, setDataSelecionada] = useState('30/10');

    const datas = [
        { label: 'HOJE', data: '30/10', atual: true },
        { label: 'AMANHÃ', data: '31/10', atual: false },
        { label: 'SÁB', data: '01/11', atual: false },
        { label: 'DOM', data: '02/11', atual: false },
        { label: 'SEG', data: '03/11', atual: false },
        { label: 'TER', data: '04/11', atual: false },
    ];

    // Dados simulados baseados no schema Prisma
    const filmeData = {
        id: parseInt(params.id),
        title: 'O Telefone Preto 2',
        rating: '18',
        duration: '1h54',
        genres: ['Suspense', 'Terror'],
        image: 'https://m.media-amazon.com/images/I/81hWb9h61JL._AC_UF1000,1000_QL80_.jpg',
        description: 'Em O Telefone Preto 2, Finney tenta levar uma vida normal quatro anos após escapar de seu sequestrador, O Pegador, mas luta para superar seu trauma. Sua irmã Gwen, que começa a ter sonhos perturbadores com um acompanhamento e as vítimas do sequestrador, convence Finney a investigar. Durante uma tempestade de neve, eles descobrem uma conexão sinistra entre sua família e O Pegador, que, mesmo após a morte, se torna uma ameaça ainda mais poderosa, forçando Finney a confrontar um mal inimaginável.'
    };

    const dates = [
        { label: 'HOJE', date: '30/10' },
        { label: 'AMANHÃ', date: '31/10' },
        { label: 'SÁB', date: '01/11' },
        { label: 'DOM', date: '02/11' },
        { label: 'SEG', date: '03/11' },
        { label: 'TER', date: '04/11' },
    ];

    const horarios = [
        '14:30',
        '16:45',
        '19:00',
        '21:15',
    ];

    return (
        <main className={styles.main}>
            <div className={styles.backButtonWrapper}>
                <Button href="/sessoes">
                    VOLTAR
                </Button>
            </div>
            <div className={styles.profileWrapper}>
                <ProfileLink />
            </div>
            <section className={styles.selecaoSessao}>
                <h1 className={styles.titulo}>SELECIONE A SESSÃO</h1>
                
                <div className={styles.datasContainer}>
                    {datas.map((data) => (
                        <button
                            key={data.data}
                            className={`${styles.dataBtn} ${data.atual ? styles.atual : ''} ${dataSelecionada === data.data ? styles.selecionada : ''}`}
                            onClick={() => setDataSelecionada(data.data)}
                        >
                            <div className={styles.dataInfo}>
                                <span className={styles.dataLabel}>{data.label}</span>
                                <span className={styles.dataValor}>{data.data}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            <section className={styles.detalhesFilme}>
                <div className={styles.filmeContainer}>
                    <img
                        src={filmeData.image}
                        alt={filmeData.title}
                        className={styles.filmePoster}
                    />
                    <div className={styles.filmeInfo}>
                        <h2 className={styles.filmeTitulo}>{filmeData.title}</h2>
                        <div className={styles.filmeMeta}>
                            <span className={styles.classificacao}>
                                {filmeData.rating}
                            </span>
                            <span className={styles.duracao}>
                                {filmeData.duration}
                            </span>
                            <span className={styles.genero}>
                                {filmeData.genres.join(', ')}
                            </span>
                        </div>
                        <p className={styles.sinopse}>
                            {filmeData.description}
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.sessionsSection}>
                <div className={styles.timeGrid}>
                    {horarios.map((horario) => (
                        <button key={horario} className={styles.timeButton}>
                            {horario}
                        </button>
                    ))}
                </div>
            </section>
        </main>
    );
}