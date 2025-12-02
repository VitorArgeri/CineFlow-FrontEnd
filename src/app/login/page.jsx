"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import Button from "@/components/Button/page";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function validate() {
    if (!email || !password) {
      setError("Por favor preencha email e senha.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
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
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Credenciais inválidas.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data?.token) {
        try {
          localStorage.setItem("userToken", data.token);
          localStorage.setItem("userId", data.userId);
          const resolvedName =
            data.name ||
            data.nome ||
            data.user?.name ||
            data.user?.nome ||
            data.usuario?.name ||
            data.usuario?.nome ||
            "";
          if (resolvedName) {
            localStorage.setItem("userName", resolvedName);
            sessionStorage.setItem("userName", resolvedName);
          }
        } catch (_) { }
        router.push("/Filmes");
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
        <Button href="/Filmes">
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
        <h1 className={styles.title}>Login de Usuário</h1>

        {error && <div className={styles.error}>{error}</div>}

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

        <a href="/cadastros" className={styles.forgotPassword}>
          Não possui um cadastro? <span style={{ color: "#989898" }}>Cadastre-se</span>
        </a>

        <Button className={styles.submit} type="submit" disabled={loading}>
          {loading ? "ENTRANDO..." : "ENTRAR"}
        </Button>
      </form>
    </main>
  );
}