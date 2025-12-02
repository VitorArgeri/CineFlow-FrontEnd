import Link from "next/link";
import styles from "./Button.module.css";

export default function Button({ href, ...props }) {
    const style = `${styles.button} ${props.className || ""}`;

    if (href) {
        return (
            <Link href={href} className={style}>
                {props.children}
            </Link>
        );
    }

    return (
        <button className={style} {...props}>
            {props.children}
        </button>
    );
}