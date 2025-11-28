import Link from "next/link";
import styles from "./Button.module.css";

export default function Button({ href, children, onClick, className, type, disabled, ...rest }) {
    const classNames = [styles.button, className].filter(Boolean).join(" ");

    if (href) {
        return (
            <Link href={href} className={classNames} {...rest}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={classNames} type={type} disabled={disabled} {...rest}>
            {children}
        </button>
    );
}
