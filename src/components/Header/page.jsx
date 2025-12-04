"use client"
import { useState, useEffect } from 'react'
import Button from '@/components/Button/page.jsx'
import ProfileLink from '@/components/ProfileLink/page.jsx'
import styles from './SiteHeader.module.css'

export default function SiteHeader({ 
    backHref = "/", 
    backLabel = "VOLTAR", 
    onBack, 
    rightSlot, 
    showProfile = true, 
    className = "",
    ...props 
}) {
    const [isLogged, setIsLogged] = useState(false);

    useEffect(() => {
        setIsLogged(!!localStorage.getItem("userToken"));
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <header className={`${styles.header} ${className}`}>
            <div className={`${styles.side} ${styles.leftSide}`}>
                <Button 
                    href={onBack ? undefined : backHref} 
                    onClick={onBack}
                    {...props}
                >
                    {backLabel}
                </Button>
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
                {rightSlot ? rightSlot : (
                    showProfile && (
                        <div className={styles.userArea}>
                            <ProfileLink />
                            {isLogged && (
                                <Button onClick={handleLogout} className={styles.logoutBtn}>
                                    LOGOUT
                                </Button>
                            )}
                        </div>
                    )
                )}
            </div>
        </header>
    );
}