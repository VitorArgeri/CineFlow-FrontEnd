'use client'
import { useEffect, useState } from 'react'
import styles from './bomboniere.module.css'
import axios from 'axios'
import Button from '@/components/Button'

export default function App() {
  const [alimentos, setAlimentos] = useState([])
  const [carrinho, setCarrinho] = useState({}) // Estado para gerenciar quantidades

  useEffect(() => {
    async function buscarAlimentos() {
      try {
        const resposta = await axios.get('http://localhost:5000/alimentos')
        console.log(resposta.data)
        setAlimentos(resposta.data)
        
        const carrinhoInicial = {}
        resposta.data.forEach(alimento => {
          carrinhoInicial[alimento.id] = 0
        })
        setCarrinho(carrinhoInicial)
      } catch (erro) {
        console.error('Erro ao buscar alimentos:', erro)
      }
    }

    buscarAlimentos()
  }, [])

  const adicionarItem = (id) => {
    setCarrinho(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }))
  }

  const removerItem = (id) => {
    setCarrinho(prev => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0)
    }))
  }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.backButtonWrapper}>
                    <Button href="/Filmes">
                        VOLTAR
                    </Button>
                </div>
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
                    {alimentos.map((alimento) => {
                        const quantidade = carrinho[alimento.id] || 0
                        
                        return (
                            <div key={alimento.id} className={styles.alimentoCard}>
                                <div className={styles.alimentoImage}>
                                    <img src={alimento.imgUrl} alt={alimento.nome} />
                                </div>
                                <div className={styles.alimentoContent}>
                                    <h3 className={styles.alimentoName}>{alimento.nome}</h3>
                                    <div className={styles.alimentoFooter}>
                                        <span className={styles.alimentoPrice}>R$ {alimento.preco}</span>
                                        <div className={styles.quantityControls}>
                                            <button 
                                                className={styles.quantityBtn}
                                                onClick={() => removerItem(alimento.id)}
                                                disabled={quantidade === 0}
                                            >
                                                -
                                            </button>
                                            <span className={styles.quantity}>{quantidade}</span>
                                            <button 
                                                className={styles.quantityBtn}
                                                onClick={() => adicionarItem(alimento.id)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {Object.values(carrinho).some(quantidade => quantidade > 0) && (
                    <div className={styles.carrinhoResumo}>
                        <h2 className={styles.carrinhoTitulo}>Resumo do Pedido</h2>
                        <div className={styles.carrinhoItens}>
                            {alimentos.filter(alimento => carrinho[alimento.id] > 0).map(alimento => (
                                <div key={alimento.id} className={styles.carrinhoItem}>
                                    <span className={styles.carrinhoItemNome}>
                                        {alimento.nome} x{carrinho[alimento.id]}
                                    </span>
                                    <span className={styles.carrinhoItemPreco}>
                                        R$ {(alimento.preco * carrinho[alimento.id]).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.carrinhoTotal}>
                            <strong>
                                Total: R$ {
                                    alimentos.reduce((total, alimento) => {
                                        return total + (alimento.preco * (carrinho[alimento.id] || 0))
                                    }, 0).toFixed(2)
                                }
                            </strong>
                        </div>
                        <button className={styles.finalizarBtn}>
                            Finalizar Pedido
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
