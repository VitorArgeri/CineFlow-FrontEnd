"use client";
import Button from "@/components/Button/page";
import ProfileLink from "@/components/ProfileLink/page";
import styles from "./SiteHeader.module.css";

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
        return <ProfileLink />;
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
