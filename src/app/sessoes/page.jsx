"use client";
import Link from "next/link";
import styles from "./page.module.css";
import Button from "@/components/Button";
import ProfileLink from "@/components/ProfileLink";

export default function Sessoes() {
    // Dados mockados dos filmes em cartaz
    const filmes = [
        {
            id: 1,
            title: 'O Telefone Preto 2',
            image: '/movies/telefone-preto-2.jpg',
            rating: '18',
            duration: '1h54',
            genres: ['Suspense', 'Terror']
        },
        {
            id: 2,
            title: 'Patrulha Canina',
            image: '/movies/patrulha-canina.jpg',
            rating: 'L',
            duration: '1h30',
            genres: ['Animação', 'Aventura']
        },
        {
            id: 3,
            title: 'As Marvels',
            image: '/movies/as-marvels.jpg',
            rating: '12',
            duration: '2h05',
            genres: ['Ação', 'Aventura']
        },
        {
            id: 4,
            title: 'Five Nights at Freddys',
            image: '/movies/five-nights.jpg',
            rating: '14',
            duration: '1h50',
            genres: ['Terror', 'Suspense']
        },
        {
            id: 5,
            title: 'Trolls 3',
            image: '/movies/trolls-3.jpg',
            rating: 'L',
            duration: '1h35',
            genres: ['Animação', 'Comédia']
        },
        {
            id: 6,
            title: 'O Exorcista: O Devoto',
            image: '/movies/exorcista.jpg',
            rating: '16',
            duration: '2h01',
            genres: ['Terror', 'Suspense']
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.backButtonWrapper}>
                <Button href="/Filmes">
                    VOLTAR
                </Button>
            </div>
            <div className={styles.profileWrapper}>
                <ProfileLink />
            </div>
            <h1 className={styles.title}>FILMES EM CARTAZ</h1>

            <div className={styles.grid}>
                {filmes.map((filme) => (
                    <div className={styles.movieCard} key={filme.id}>
                        <img
                            src={filme.image}
                            alt={filme.title}
                            className={styles.movieImage}
                        />
                        <div className={styles.movieInfo}>
                            <h2 className={styles.movieTitle}>{filme.title}</h2>
                            <div className={styles.movieMeta}>
                                <span className={styles.rating}>{filme.rating}</span>
                                <span>{filme.duration}</span>
                                <span>{filme.genres.join(" • ")}</span>
                            </div>
                        </div>
                        <div className={styles.movieActions}>
                            <Link
                                href={`/sessoes/${filme.id}`}
                                className={styles.viewButton}
                            >
                                Ver Sessões
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
