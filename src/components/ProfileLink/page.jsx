"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./ProfileLink.module.css";

export default function ProfileLink() {
    const [name, setName] = useState("");
    const router = useRouter();

    const syncName = () => {
        try {
            const storedName = localStorage.getItem("userName") || sessionStorage.getItem("userName");
            if (storedName) {
                setName(storedName);
            } else {
                setName("");
            }
        } catch (_) {
            setName("");
        }
    };

    useEffect(() => {
        syncName();
        const handleStorage = () => syncName();
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const firstName = name ? name.trim().split(" ")[0] : "";

    const handleLogout = () => {
        try {
            localStorage.removeItem("userToken");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            sessionStorage.removeItem("userName");
        } catch (_) {}
        setName("");
        router.push("/login");
    };

    if (firstName) {
        return (
            <div className={styles.greetingWrapper}>
                <div className={styles.greetingBlock}>
                    <span className={styles.greeting}>Olá, {firstName}</span>
                    <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
                <div className={styles.avatarWrapper}>
                    <Image
                        src="/Img/profile.png"
                        alt="Perfil"
                        width={75}
                        height={75}
                        className={styles.profileImage}
                    />
                </div>
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
