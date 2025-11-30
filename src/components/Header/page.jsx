"use client";
import Button from "@/components/Button/page";
import ProfileLink from "@/components/ProfileLink/page";
import styles from "./SiteHeader.module.css";
import { useState, useEffect, useCallback } from "react";

export default function SiteHeader({
    backHref = "/",
    backLabel = "VOLTAR",
    onBack,
    rightSlot,
    showProfile = true,
    className = "",
    buttonProps = {}
}) {
    const wrapperClass = [styles.header, className].filter(Boolean).join(" ");

    const [isLogged, setIsLogged] = useState(false);
    const readToken = useCallback(() => {
        try {
            const token = localStorage.getItem("userToken");
            setIsLogged(!!token);
        } catch (_) {}
    }, []);

    useEffect(() => {
        readToken();
        const onStorage = (e) => {
            if (!e || e.key !== "userToken") return;
            readToken();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [readToken]);

    const handleLogout = useCallback(() => {
        try {
            localStorage.removeItem("userToken");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            sessionStorage.removeItem("userName");
        } catch (_) {}
        // redireciona para login
        window.location.href = "/login";
    }, []);

    const handleBackClick = (event) => {
        if (onBack) {
            event.preventDefault();
            onBack();
        }
    };

    const renderBackButton = () => {
        if (onBack) {
            return (
                <Button onClick={handleBackClick} {...buttonProps}>
                    {backLabel}
                </Button>
            );
        }

        return (
            <Button href={backHref} {...buttonProps}>
                {backLabel}
            </Button>
        );
    };

    const renderRightSlot = () => {
        if (rightSlot) return rightSlot;
        if (!showProfile) return null;
        return (
            <div className={styles.userArea}>
                <ProfileLink />
                {isLogged && (
                    <Button onClick={handleLogout} className={styles.logoutBtn}>
                        LOGOUT
                    </Button>
                )}
            </div>
        );
    };

    return (
        <header className={wrapperClass}>
            <div className={`${styles.side} ${styles.leftSide}`}>
                {renderBackButton()}
            </div>
            <div className={styles.logo}>
                <span className={styles.cine}>Cine</span>
                <div className={styles.glasses}>
                    <div className={styles.lensLeft}></div>
                    <div className={styles.lensRight}></div>
                </div>
                <span className={styles.flow}>Flow</span>
            </div>
            <div className={`${styles.side} ${styles.rightSide}`}>
                {renderRightSlot()}
            </div>
        </header>
    );
}
