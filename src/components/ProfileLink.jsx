import Link from "next/link";
import Image from "next/image";
import styles from "./ProfileLink.module.css";

export default function ProfileLink() {
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
