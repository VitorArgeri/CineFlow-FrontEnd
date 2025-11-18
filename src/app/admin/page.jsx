"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function AdminLoginPage() {
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
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
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
        } catch (_) {}
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
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>Login Administrador</h1>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">
            Email
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
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            Senha
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
        </div>

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className={styles.hint}>
          A página espera um endpoint POST em <code>/api/admin/login</code> que retorne JSON com um campo <code>token</code>.
        </p>
      </form>
    </main>
  );
}
