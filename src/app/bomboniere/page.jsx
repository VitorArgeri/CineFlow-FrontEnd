'use client'
import { useEffect, useState } from 'react'
import styles from './bomboniere.module.css'
import axios from 'axios'

export default function App() {
  const [alimentos, setAlimentos] = useState([])
  const [carrinho, setCarrinho] = useState({}) // Estado para gerenciar quantidades
  const [mostrarBotaoCarrinho, setMostrarBotaoCarrinho] = useState(true)

  useEffect(() => {
    async function buscarAlimentos() {
      try {
        const resposta = await axios.get('http://localhost:5000/alimentos')
        console.log(resposta.data)
        
        // Verificar se a resposta tem dados válidos
        if (resposta.data && Array.isArray(resposta.data)) {
          setAlimentos(resposta.data)
          
          const carrinhoInicial = {}
          resposta.data.forEach(alimento => {
            if (alimento && alimento.id) {
              carrinhoInicial[alimento.id] = 0
            }
          })
          setCarrinho(carrinhoInicial)
        }
      } catch (erro) {
        console.error('Erro ao buscar alimentos:', erro)
        setAlimentos([])
        setCarrinho({})
      }
    }

    buscarAlimentos()
  }, [])

  // Detectar quando o usuário está na seção do carrinho
  useEffect(() => {
    const handleScroll = () => {
      const carrinhoElement = document.querySelector(`.${styles.carrinhoResumo}`)
      if (carrinhoElement) {
        const rect = carrinhoElement.getBoundingClientRect()
        const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0
        setMostrarBotaoCarrinho(!isVisible)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Verificar inicialmente

    return () => window.removeEventListener('scroll', handleScroll)
  }, [carrinho])

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

  const scrollSuaveParaCarrinho = () => {
    const carrinhoElement = document.querySelector(`.${styles.carrinhoResumo}`)
    if (carrinhoElement) {
      const targetPosition = carrinhoElement.offsetTop - 50 // 50px de margem do topo
      const startPosition = window.pageYOffset
      const distance = targetPosition - startPosition
      const duration = 1200 // 1.2 segundos para um scroll bem suave
      let start = null

      function animation(currentTime) {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const progress = Math.min(timeElapsed / duration, 1)
        
        // Função de easing para um movimento mais natural
        const ease = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2

        window.scrollTo(0, startPosition + (distance * ease))

        if (timeElapsed < duration) {
          requestAnimationFrame(animation)
        }
      }

      requestAnimationFrame(animation)
    }
  }

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
                    {alimentos && alimentos.length > 0 ? alimentos.map((alimento) => {
                        if (!alimento || !alimento.id) return null
                        
                        const quantidade = carrinho[alimento.id] || 0
                        
                        return (
                            <div key={`alimento-${alimento.id}`} className={styles.alimentoCard}>
                                <div className={styles.alimentoImage}>
                                    {alimento.imgUrl && (
                                        <img 
                                            src={alimento.imgUrl} 
                                            alt={alimento.nome || 'Alimento'} 
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                            }}
                                        />
                                    )}
                                </div>
                                <div className={styles.alimentoContent}>
                                    <h3 className={styles.alimentoName}>
                                        {alimento.nome || 'Nome não disponível'}
                                    </h3>
                                    <div className={styles.alimentoFooter}>
                                        <span className={styles.alimentoPrice}>
                                            R$ {alimento.preco ? Number(alimento.preco).toFixed(2) : '0.00'}
                                        </span>
                                        <div className={styles.quantityControls}>
                                            <button 
                                                className={styles.quantityBtn}
                                                onClick={() => removerItem(alimento.id)}
                                                disabled={quantidade === 0}
                                                type="button"
                                            >
                                                -
                                            </button>
                                            <span className={styles.quantity}>{quantidade}</span>
                                            <button 
                                                className={styles.quantityBtn}
                                                onClick={() => adicionarItem(alimento.id)}
                                                type="button"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }).filter(Boolean) : (
                        <div>Carregando alimentos...</div>
                    )}
                </div>

                {carrinho && Object.values(carrinho).some(quantidade => quantidade > 0) && (
                    <div className={styles.carrinhoResumo}>
                        <h2 className={styles.carrinhoTitulo}>Resumo do Pedido</h2>
                        <div className={styles.carrinhoItens}>
                            {alimentos && alimentos.length > 0 && alimentos
                                .filter(alimento => alimento && alimento.id && carrinho[alimento.id] > 0)
                                .map(alimento => (
                                    <div key={`carrinho-${alimento.id}`} className={styles.carrinhoItem}>
                                        <span className={styles.carrinhoItemNome}>
                                            {alimento.nome || 'Item'} x{carrinho[alimento.id]}
                                        </span>
                                        <span className={styles.carrinhoItemPreco}>
                                            R$ {(
                                                (Number(alimento.preco) || 0) * (carrinho[alimento.id] || 0)
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                        <div className={styles.carrinhoTotal}>
                            <strong>
                                Total: R$ {
                                    alimentos && alimentos.length > 0 ? alimentos.reduce((total, alimento) => {
                                        if (!alimento || !alimento.id || !alimento.preco) return total
                                        return total + ((Number(alimento.preco) || 0) * (carrinho[alimento.id] || 0))
                                    }, 0).toFixed(2) : '0.00'
                                }
                            </strong>
                        </div>
                        <button className={styles.finalizarBtn} type="button">
                            Finalizar Pedido
                        </button>
                    </div>
                )}
            </main>

            {/* Botão flutuante do carrinho */}
            {carrinho && Object.values(carrinho).some(quantidade => quantidade > 0) && mostrarBotaoCarrinho && (
                <button 
                    className={styles.carrinhoFloating}
                    onClick={scrollSuaveParaCarrinho}
                    type="button"
                >
                    <img src="/Bomboniere/icons8-carrinho-de-compras-64 (1).png" alt="Carrinho" width={25} height={25} />
                    <span className={styles.carrinhoCount}>
                        {Object.values(carrinho).reduce((total, quantidade) => total + quantidade, 0)}
                    </span>
                </button>
            )}
        </div>
    );
}
