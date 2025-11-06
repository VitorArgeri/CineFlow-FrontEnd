'use client'
import { useEffect, useState } from 'react'
import styles from './bomboniere.module.css'
import axios from 'axios'

export default function App() {
  const [alimentos, setAlimentos] = useState([])

  useEffect(() => {
    async function buscarAlimentos() {
      try {
        const resposta = await axios.get('http://localhost:5000/alimentos')
        console.log(resposta.data)
        setAlimentos(resposta.data)
      } catch (erro) {
        console.error('Erro ao buscar alimentos:', erro)
      }
    }

    buscarAlimentos()
  }, [])

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <span className={styles.logoText}>
                        <span className={styles.cine}>Cine</span>
                        <div className={styles.glasses}>
                            <div className={styles.lensLeft}></div>
                            <div className={styles.lensRight}></div>
                        </div>
                        <span className={styles.flow}>Flow</span>
                    </span>
                </div>
                <div className={styles.userInfo}>
                    <span>FILME: EU AINDA ESTOU AQUI | SESSÃO: 21:00H | INGRESSOS: R$ 6</span>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>ADICIONE LANCHES AO SEU PEDIDO</h1>
                </div>

                <div className={styles.alimentosGrid}>
                    {alimentos.map((alimento) => (  
                        <div key={alimento.id} className={styles.alimentoCard}>
                            <div className={styles.alimentoImage}>
                                <img src={alimento.imgUrl} alt={alimento.nome} />
                            </div>
                            <div className={styles.alimentoContent}>
                                <h3 className={styles.alimentoName}>{alimento.nome}</h3>
                                <div className={styles.alimentoFooter}>
                                    <span className={styles.alimentoPrice}>R$ {alimento.preco}</span>
                                    <div className={styles.quantityControls}>
                                        <button className={styles.quantityBtn}>-</button>
                                        <span className={styles.quantity}>1</span>
                                        <button className={styles.quantityBtn}>+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
