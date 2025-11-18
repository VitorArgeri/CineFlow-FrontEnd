"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./cadastros.module.css";
import Button from "@/components/Button";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    function validate() {
        if (!email || !password) {
            setError("Por favor preencha email e senha.");
            return false;
        }
        // simples validação de email
        const re =
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
        if (!re.test(email)) {
            setError("Formato de email inválido.");
            return false;
        }
        setError("");
        return true;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setError("");
        try {
            // ajustável: espera um endpoint POST /api/admin/login que retorne { token }
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const text = await res.text();
                setError(text || "Credenciais inválidas.");
                setLoading(false);
                return;
            }

            const data = await res.json();

            if (data?.token) {
                try {
                    localStorage.setItem("adminToken", data.token);
                } catch (_) { }
                router.push("/admin/dashboard");
            } else {
                setError("Resposta inesperada do servidor.");
            }
        } catch (err) {
            setError("Erro de conexão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={styles.container}>
            <div className={styles.backButtonWrapper}>
                <Button href="/login">
                    VOLTAR
                </Button>
            </div>

            <form className={styles.card} onSubmit={handleSubmit} noValidate>
                <div className={styles.logo}>
                    <span className={styles.cine}>Cine</span>
                    <div className={styles.glasses}>
                        <div className={styles.lensLeft}></div>
                        <div className={styles.lensRight}></div>
                    </div>
                    <span className={styles.flow}>Flow</span>
                </div>
                <h1 className={styles.title}>Cadastro</h1>

                {error && <div className={styles.error}>{error}</div>}

                <label className={styles.label} htmlFor="name">
                    Nome:
                </label>
                <input
                    id="name"
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome..."
                    required
                />

                <label className={styles.label} htmlFor="email">
                    Email:
                </label>
                <input
                    id="email"
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@exemplo.com"
                    required
                />

                <label className={styles.label} htmlFor="password">
                    Senha:
                </label>
                <div className={styles.passwordRow}>
                    <input
                        id="password"
                        className={styles.input}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                </div>

                <label className={styles.label} htmlFor="code">
                    Código de Cadastro:
                </label>
                <input
                    id="code"
                    className={styles.input}
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Digite o código..."
                    required
                />
                <a href="/login" className={styles.forgotPassword}>
                    Já possui uma conta? <span style={{ color: "#989898" }}>Entrar</span>
                </a>

                <Button className={styles.submit} type="submit" disabled={loading}>
                    {loading ? "CADASTRANDO..." : "CADASTRAR"}
                </Button>
            </form>
        </main>
    );
}
