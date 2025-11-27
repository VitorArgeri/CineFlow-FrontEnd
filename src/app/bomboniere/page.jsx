"use client"
import { useEffect, useState } from "react"
import styles from "./bomboniere.module.css"
import axios from "axios"
import SiteHeader from "@/components/SiteHeader"

export default function App() {
    const [alimentos, setAlimentos] = useState([])
    const [carrinho, setCarrinho] = useState({}) // Estado para gerenciar quantidades
    const [pedidoInfo, setPedidoInfo] = useState(null)

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

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("cineflow-assentos-selecionados")
            if (stored) {
                setPedidoInfo(JSON.parse(stored))
            }
        } catch (error) {
            console.warn("Não foi possível carregar o resumo da sessão", error)
        }
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

    const formatarHora = (dataIso) => {
        if (!dataIso) return "--:--"
        return new Date(dataIso).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const resumoSessao = pedidoInfo
        ? `FILME: ${pedidoInfo.filmeNome || "-"} | SESSÃO: ${formatarHora(pedidoInfo.dataHora)} | SALA: ${pedidoInfo.salaId || "-"}`
        : "FILME: .... | SESSÃO: --:-- | SALA: --"

        const resumoIngressos = pedidoInfo?.quantidade
            ? `ASSENTOS: ${pedidoInfo.assentos?.map(seat => seat.posicao || seat.id).join(", ") || pedidoInfo.quantidade} | INGRESSOS: ${pedidoInfo.quantidade}`
            : "ASSENTOS: -- | INGRESSOS: --"

    return (
        <div className={styles.container}>
                        <SiteHeader className={styles.header} backHref="/Filmes" />

            <main className={styles.main}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>ADICIONE LANCHES AO SEU PEDIDO</h1>
                    <div className={styles.userInfo}>
                                                <span>{resumoSessao}</span>
                                                <span>{resumoIngressos}</span>
                    </div>
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
