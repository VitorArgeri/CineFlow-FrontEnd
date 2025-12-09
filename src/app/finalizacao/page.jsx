"use client";
import React, { useState, useEffect } from "react";
import SiteHeader from "@/components/Header/page";
import { useRouter } from "next/navigation";
import styles from "./finalizacao.module.css";

const TAXA_SERVICO = 5;

const getTicketInfo = async (sessao) => {
if (!sessao) return { preco: 0, tipo: "Padrão" };

if (sessao.ingresso?.preco !== undefined) return { preco: Number(sessao.ingresso.preco), tipo: sessao.ingresso.tipo };
if (sessao.preco !== undefined) return { preco: Number(sessao.preco), tipo: sessao.tipo };

try {
const url = sessao.ingressoId
? `http://localhost:5000/ingressos/${sessao.ingressoId}`
: `http://localhost:5000/ingressos?tipo=${encodeURIComponent(sessao.tipo)}`;

const res = await fetch(url);
if (res.ok) {
const data = await res.json();
const item = Array.isArray(data) ? data[0] : data;
return { preco: Number(item?.preco || 0), tipo: item?.tipo || sessao.tipo };
}
} catch {}

return { preco: 0, tipo: "Padrão" };
};

const registrarAssentos = async ({ sessaoId, assentosIds, 
	
	pedidoId, headers }) => {
		
	if (!sessaoId || !assentosIds?.length || !pedidoId) return;

	await Promise.all(
		assentosIds.map((assentoId) =>
			fetch("http://localhost:5000/registros-sessao", {
				method: "POST",
				headers,
				body: JSON.stringify({ sessaoId, assentoId, pedidoId })
			}).then((res) => {
				if (!res.ok) throw new Error();
				return res;
			}).catch((error) => {
				console.error("Erro ao registrar assento", assentoId, error);
				return null;
			})
		)
	);
};

export default function FinalizacaoPage() {
const router = useRouter();
const [resumo, setResumo] = useState({ ingressos: [], lanches: [], total: 0, linkVoltar: "/" });
const [loading, setLoading] = useState(true);

const limparProgressoPedido = () => {
	try {
		sessionStorage.removeItem("cineflow-assentos-selecionados");
		sessionStorage.removeItem("cineflow-carrinho");
	} catch (_) {
		// noop
	}
};

const handleCancelarPedido = () => {
	limparProgressoPedido();
	router.push("/");
};

useEffect(() => {
const carregar = async () => {
const sessaoData = JSON.parse(sessionStorage.getItem("cineflow-assentos-selecionados")) || {};
const carrinhoData = JSON.parse(sessionStorage.getItem("cineflow-carrinho")) || {};

const [resSessao, resAlimentos] = await Promise.all([
sessaoData.sessaoId ? fetch(`http://localhost:5000/sessoes/${sessaoData.sessaoId}`) : null,
fetch("http://localhost:5000/alimentos")
]);

const sessao = resSessao?.ok ? await resSessao.json() : null;
const alimentos = resAlimentos?.ok ? await resAlimentos.json() : [];
const info = await getTicketInfo(sessao);

const dataObj = new Date(sessao?.dataHora || sessaoData.dataHora || Date.now());

const ingressos = (sessaoData.assentos || []).map(a => ({
filme: sessaoData.filmeNome || "Filme",
data: dataObj.toLocaleDateString("pt-BR"),
hora: dataObj.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
sala: sessao?.salaId || sessaoData.salaId || "N/A",
posicao: a.posicao || a.id,
tipo: info.tipo,
preco: info.preco
}));

const lanches = Object.entries(carrinhoData).map(([id, qtd]) => {
const item = alimentos.find(a => a.id === Number(id));
return item && qtd > 0 ? { ...item, quantidade: qtd, total: item.preco * qtd } : null;
}).filter(Boolean);

const totalIngressos = ingressos.reduce((acc, i) => acc + i.preco, 0);
const totalLanches = lanches.reduce((acc, i) => acc + i.total, 0);

setResumo({
ingressos,
lanches,
subIngressos: totalIngressos,
subLanches: totalLanches,
totalFinal: totalIngressos + totalLanches + TAXA_SERVICO,
linkVoltar: "/bomboniere"
});
setLoading(false);
};
carregar();
}, []);

const handleCheckout = async () => {
const sessaoStored = sessionStorage.getItem("cineflow-assentos-selecionados");
if (!sessaoStored) {
alert("Selecione uma sessão antes de finalizar o pedido.");
router.push("/Filmes");
return;
}

setLoading(true);

try {
const sessaoData = JSON.parse(sessaoStored) || {};
const possuiAssentos = Array.isArray(sessaoData.assentos) && sessaoData.assentos.length > 0;

if (!sessaoData.sessaoId || !possuiAssentos) {
alert("Não foi possível identificar os assentos selecionados. Escolha novamente a sessão.");
setLoading(false);
router.push("/Filmes");
return;
}

const carrinhoData = JSON.parse(sessionStorage.getItem("cineflow-carrinho")) || {};
const userIdRaw = localStorage.getItem("userId");
const parsedUserId = userIdRaw && !Number.isNaN(Number(userIdRaw)) ? Number(userIdRaw) : undefined;
const token = localStorage.getItem("userToken");

const assentosIds = sessaoData.assentos
	.map((assento) => Number(assento?.id))
	.filter((id) => !Number.isNaN(id));

if (!assentosIds.length) {
alert("Nenhum assento válido foi selecionado. Escolha novamente a sessão.");
setLoading(false);
router.push(`/${sessaoData.filmeId || ""}`);
return;
}

const registrosRes = await fetch(`http://localhost:5000/registros-sessao?sessaoId=${sessaoData.sessaoId}`);
if (registrosRes.ok) {
	const registros = await registrosRes.json();
	const ocupados = new Set(
		(Array.isArray(registros) ? registros : [])
			.map((registro) => Number(registro?.assentoId))
			.filter((id) => !Number.isNaN(id))
	);

	if (assentosIds.some((id) => ocupados.has(id))) {
		alert("Alguns dos assentos selecionados já foram escolhidos. Volte e escolha outros.");
		setLoading(false);
		router.push(`/sessoes/${sessaoData.sessaoId}`);
		return;
	}
}

const alimentosIds = Object.entries(carrinhoData)
	.filter(([, qtd]) => Number(qtd) > 0)
	.flatMap(([id, qtd]) => Array(Number(qtd)).fill(Number(id)))
	.filter((id) => !Number.isNaN(id));

const payload = {
sessaoId: sessaoData.sessaoId,
userId: parsedUserId,
assentosIds,
alimentosIds
};

const headers = { "Content-Type": "application/json" };
if (token) headers.Authorization = `Bearer ${token}`;

const res = await fetch("http://localhost:5000/pedidos", {
method: "POST",
headers,
body: JSON.stringify(payload)
});

let respostaJson = null;
try {
	respostaJson = await res.json();
} catch (_) {
	respostaJson = null;
}

if (!res.ok) {
const message = respostaJson?.message || "Erro ao finalizar pedido.";
throw new Error(message);
}

const pedidoId = respostaJson?.id || respostaJson?.pedidoId || respostaJson?.pedido?.id;

if (!pedidoId) {
throw new Error("Não foi possível identificar o pedido gerado. Tente novamente.");
}

await registrarAssentos({ sessaoId: sessaoData.sessaoId, assentosIds, pedidoId, headers });

limparProgressoPedido();
router.push("/PedidoGerado");

} catch (error) {
console.error("Erro ao finalizar pedido", error);
alert(error?.message || "Erro ao finalizar pedido.");
setLoading(false);
}
};

if (loading) {
return (
<div className={styles.container}>
<SiteHeader backHref={resumo.linkVoltar} backLabel="VOLTAR" />
<div className={styles.content}>
<p style={{ textAlign: "center", color: "white", marginTop: 50 }}>Processando...</p>
</div>
</div>
);
}

return (
<div className={styles.container}>
<SiteHeader backHref={resumo.linkVoltar} backLabel="VOLTAR" />

<div className={styles.content}>
<h1 className={styles.title}>RESUMO DO PEDIDO</h1>

<section className={styles.section}>
<h2 className={styles.sectionTitle}>🎬 INGRESSOS</h2>
<div className={styles.grid}>
{resumo.ingressos.length > 0 ? (
resumo.ingressos.map((item, i) => (
<div key={i} className={styles.card}>
<div className={styles.info}>
<h3>{item.filme}</h3>
<p>{item.data} às {item.hora}</p>
<p>Sala {item.sala} - Assento {item.posicao}</p>
<p>{item.tipo}</p>
</div>
<div className={styles.price}>R$ {item.preco.toFixed(2)}</div>
</div>
))
) : <p className={styles.empty}>Nenhum ingresso selecionado</p>}
</div>
{resumo.ingressos.length > 0 && (
<div className={styles.subtotal}>Subtotal: <strong>R$ {resumo.subIngressos.toFixed(2)}</strong></div>
)}
</section>

<section className={styles.section}>
<h2 className={styles.sectionTitle}>🍿 LANCHES</h2>
<div className={styles.grid}>
{resumo.lanches.length > 0 ? (
resumo.lanches.map((item, i) => (
<div key={i} className={styles.card}>
<div className={styles.info}>
<h3>{item.nome}</h3>
<p>Qtd: {item.quantidade}</p>
</div>
<div className={styles.price}>R$ {item.total.toFixed(2)}</div>
</div>
))
) : <p className={styles.empty}>Nenhum lanche selecionado</p>}
</div>
{resumo.lanches.length > 0 && (
<div className={styles.subtotal}>Subtotal: <strong>R$ {resumo.subLanches.toFixed(2)}</strong></div>
)}
</section>

<section className={styles.totalSection}>
<h2 className={styles.sectionTitle}>💳 RESUMO FINANCEIRO</h2>
<div className={styles.totalRow}><span>Ingressos</span><span>R$ {resumo.subIngressos.toFixed(2)}</span></div>
<div className={styles.totalRow}><span>Lanches</span><span>R$ {resumo.subLanches.toFixed(2)}</span></div>
<div className={styles.totalRow}><span>Taxa de Serviço</span><span>R$ {TAXA_SERVICO.toFixed(2)}</span></div>
<div className={`${styles.totalRow} ${styles.finalTotal}`}><span>TOTAL</span><span>R$ {resumo.totalFinal.toFixed(2)}</span></div>

<button onClick={handleCheckout} className={styles.pagarButton}>
CONFIRMAR PAGAMENTO
</button>

<button type="button" onClick={handleCancelarPedido} className={styles.cancelButton}>
Cancelar e voltar ao início
</button>
</section>
</div>
</div>
);
}