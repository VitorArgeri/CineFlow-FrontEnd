import Link from "next/link";
import Image from "next/image";
import styles from "./ProfileLink.module.css";

export default function ProfileLink() {
    return (
        <Link href="/login" className={styles.profileLink}>
            <Image 
                src="/Img/profile.png" 
                alt="Perfil" 
                width={125} 
                height={125} 
                className={styles.profileImage}
            />
        </Link>
    );
}
