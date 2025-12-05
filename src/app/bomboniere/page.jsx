"use client"
import { useEffect, useState } from "react"
import styles from "./bomboniere.module.css"
import axios from "axios"
import SiteHeader from "@/components/Header/page"

export default function App() {
    const [alimentos, setAlimentos] = useState([])
    const [carrinho, setCarrinho] = useState({}) // Estado para gerenciar quantidades
    const [pedidoInfo, setPedidoInfo] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [authToken, setAuthToken] = useState(null)
    const [savingAlimentoId, setSavingAlimentoId] = useState(null)
    const [deletingAlimentoId, setDeletingAlimentoId] = useState(null)
    const [adminFeedback, setAdminFeedback] = useState({ type: "", message: "" })

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

    useEffect(() => {
        try {
            const token = localStorage.getItem("userToken")
            setIsAdmin(!!token)
            setAuthToken(token)
        } catch (error) {
            console.warn("Não foi possível verificar o modo administrador", error)
            setIsAdmin(false)
            setAuthToken(null)
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

    const handleAlimentoChange = (id, field, value) => {
        const parsedValue = field === "preco" ? value.replace(/,/g, ".") : value
        setAlimentos(prev => prev.map(alimento => (
            alimento.id === id ? { ...alimento, [field]: parsedValue } : alimento
        )))
    }

    const salvarAlimento = async (alimento) => {
        if (!authToken) return
        setSavingAlimentoId(alimento.id)
        setAdminFeedback({ type: "", message: "" })
        try {
            const payload = {
                nome: alimento.nome,
                preco: Number(alimento.preco),
                imgUrl: alimento.imgUrl
            }
            await axios.put(`http://localhost:5000/alimentos/${alimento.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            })
            setAdminFeedback({ type: "success", message: "Alimento atualizado com sucesso." })
        } catch (error) {
            console.error("Erro ao atualizar alimento", error)
            const message = error?.response?.data?.message || "Não foi possível salvar o alimento."
            setAdminFeedback({ type: "error", message })
        } finally {
            setSavingAlimentoId(null)
        }
    }

    const deletarAlimento = async (alimentoId) => {
        if (!authToken) return
        const confirmed = window.confirm("Deseja realmente deletar este alimento?")
        if (!confirmed) return

        setDeletingAlimentoId(alimentoId)
        setAdminFeedback({ type: "", message: "" })

        try {
            await axios.delete(`http://localhost:5000/alimentos/${alimentoId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            setAlimentos(prev => prev.filter(alimento => alimento.id !== alimentoId))
            setAdminFeedback({ type: "success", message: "Alimento removido com sucesso." })
        } catch (error) {
            console.error("Erro ao deletar alimento", error)
            const message = error?.response?.data?.message || "Não foi possível deletar o alimento."
            setAdminFeedback({ type: "error", message })
        } finally {
            setDeletingAlimentoId(null)
        }
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

    const itensSelecionados = alimentos.filter(alimento => (carrinho[alimento.id] || 0) > 0)
    const totalCarrinho = alimentos.reduce((total, alimento) => (
        total + (alimento.preco * (carrinho[alimento.id] || 0))
    ), 0)

    const finalizarPedido = () => {
        sessionStorage.setItem("cineflow-carrinho", JSON.stringify(carrinho))
        window.location.href = "/finalizacao"
    }

    return (
        <div className={styles.container}>
                <SiteHeader backHref="/Filmes" />

            <main className={styles.main}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>ADICIONE LANCHES AO SEU PEDIDO</h1>
                    <div className={styles.userInfo}>
                                                <span>{resumoSessao}</span>
                                                <span>{resumoIngressos}</span>
                    </div>
                </div>

                {isAdmin && adminFeedback.message && (
                    <div className={`${styles.adminFeedback} ${adminFeedback.type === "error" ? styles.adminFeedbackError : styles.adminFeedbackSuccess}`}>
                        {adminFeedback.message}
                    </div>
                )}

                <div className={styles.alimentosGrid}>
                    {alimentos.map((alimento) => {
                        const quantidade = carrinho[alimento.id] || 0
                        const precoUnitario = Number(alimento.preco) || 0
                        
                        return (
                            <div key={alimento.id} className={styles.alimentoCard}>
                                <div className={styles.alimentoImage}>
                                    <img src={alimento.imgUrl} alt={alimento.nome} />
                                </div>
                                <div className={styles.alimentoContent}>
                                    <h3 className={styles.alimentoName}>{alimento.nome}</h3>
                                    <div className={styles.alimentoFooter}>
                                        <span className={styles.alimentoPrice}>R$ {precoUnitario.toFixed(2)}</span>
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
                                    {isAdmin && (
                                        <div className={styles.adminPanel}>
                                            <label className={styles.adminField}>
                                                <span>Nome</span>
                                                <input
                                                    type="text"
                                                    value={alimento.nome || ""}
                                                    onChange={(event) => handleAlimentoChange(alimento.id, "nome", event.target.value)}
                                                />
                                            </label>
                                            <label className={styles.adminField}>
                                                <span>Preço (R$)</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={alimento.preco ?? ""}
                                                    onChange={(event) => handleAlimentoChange(alimento.id, "preco", event.target.value)}
                                                />
                                            </label>
                                            <div className={styles.adminButtons}>
                                                <button
                                                    type="button"
                                                    className={`${styles.adminButton} ${styles.adminButtonPrimary}`}
                                                    onClick={() => salvarAlimento(alimento)}
                                                    disabled={savingAlimentoId === alimento.id}
                                                >
                                                    {savingAlimentoId === alimento.id ? "SALVANDO..." : "SALVAR"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`${styles.adminButton} ${styles.adminButtonDanger}`}
                                                    onClick={() => deletarAlimento(alimento.id)}
                                                    disabled={deletingAlimentoId === alimento.id}
                                                >
                                                    {deletingAlimentoId === alimento.id ? "DELETANDO..." : "DELETAR"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className={styles.carrinhoResumo}>
                    <h2 className={styles.carrinhoTitulo}>Resumo do Pedido</h2>
                    {itensSelecionados.length > 0 ? (
                        <div className={styles.carrinhoItens}>
                            {itensSelecionados.map(alimento => (
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
                    ) : (
                        <p className={styles.carrinhoVazio}>Nenhum lanche selecionado</p>
                    )}
                    <div className={styles.carrinhoTotal}>
                        <strong>Total: R$ {totalCarrinho.toFixed(2)}</strong>
                    </div>
                    <button 
                        className={styles.finalizarBtn}
                        onClick={finalizarPedido}
                    >
                        Finalizar Pedido
                    </button>
                </div>
            </main>
        </div>
    );
}
