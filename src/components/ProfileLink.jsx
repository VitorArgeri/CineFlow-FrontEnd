"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./ProfileLink.module.css";

export default function ProfileLink() {
    const [name, setName] = useState("");

    useEffect(() => {
        try {
            const storedName = localStorage.getItem("userName");
            if (storedName) {
                setName(storedName);
                return;
            }
            // Fallback simples: se não houver userName salvo, mantém imagem.
        } catch (_) {}
    }, []);

    if (name) {
        return (
            <div className={styles.greetingWrapper}>
                <span className={styles.greeting}>
                    Olá, {name.split(" ")[0]}
                </span>
            </div>
        );
    }

    return (
        <Link href="/login" className={styles.profileLink}>
            <Image
                src="/Img/profile.png"
                alt="Perfil"
                width={75}
                height={75}
                className={styles.profileImage}
            />
        </Link>
    );
}
