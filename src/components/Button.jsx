import Link from "next/link";
import styles from "./Button.module.css";

export default function Button({ href, children, onClick }) {
    if (href) {
        return (
            <Link href={href} className={styles.button}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={styles.button}>
            {children}
        </button>
    );
}
