'use client'
import styles from './bomboniere.module.css';

export default function Bomboniere() {

    const combos = [
        {
            id: 1,
            name: 'COMBO MEGA',
            description: 'Pipoca grande + 3 Refrigerantes de lata  + Doces (Chocolate, balas, chicletes, )',
            price: 25.90,
            image: '/Bomboniere/combomega1.jpg',
            type: 'combo'
        },
        {
            id: 2,
            name: 'COMBO FAMÍLIA',
            description: 'Pipoca média + 2 Refrigerantes de lata + Nachos',
            price: 32.90,
            image: '/Bomboniere/combofamilia1.jpg',
            type: 'combo'
        },
        {
            id: 3,
            name: 'COMBO KIDS',
            description: 'Pipoca pequena + Suco + Chocolate ',
            price: 18.90,
            image: '/Bomboniere/combokids1.jpg',
            type: 'combo'
        },
        {
            id: 4,
            name: 'PIPOCA P',
            description: 'Pipoca Pequena',
            price: 22.90,
            image: '/Bomboniere/pipocaP.jpg',
            type: 'popcorn'
        },
        {
            id: 5,
            name: 'PIPOCA M',
            description: 'Pipoca Média',
            price: 15.90,
            image: '/Bomboniere/pipocaM.jpg',
            type: 'popcorn'
        },
        {
            id: 6,
            name: 'PIPOCA G',
            description: 'Pipoca Grande',
            price: 35.90,
            image: '/Bomboniere/pipocaG.jpg',
            type: 'popcorn'
        },
        {
            id: 7,
            name: 'PIPOCA GG',
            description: 'Pipoca Extra Grande',
            price: 35.90,
            image: '/Bomboniere/pipocaGG.jpg',
            type: 'popcorn'
        },
        {
            id: 8,
            name: 'REFRI LATA',
            description: 'Refrigerante Lata',
            price: 5.90,
            image: '/Bomboniere/refriesuco.jpg'
        },
        {
            id: 9,
            name: 'SUCO LATA',
            description: 'Suco Lata',
            price: 5.90,
            image: '/Bomboniere/refriesuco.jpg'
        },
        {
            id: 10,
            name: 'CHOCOLATE',
            description: 'Chocolate',
            price: 4.90,
            image: '/Bomboniere/chocolate.jpg'
        },
    ];


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <span className={styles.logoText}>
                        <span className={styles.cine}>Cine</span>
                        <span className={styles.flow}>Flow</span>
                    </span>
                </div>
                <div className={styles.userInfo}>
                    <span>FILME: EU AINDA ESTOU AQUI | SESSÃO: 21:00H | INGRESSOS: R$ 6</span>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>ADICIONE LANCHES AO SEU PEDIDO</h1>
                </div>

                {/* Combos Grid */}
                <div className={styles.combosGrid}>
                    {combos.map((combo) => (
                        <div key={combo.id} className={styles.comboCard}>
                            <div className={styles.comboImage}>
                                <img src={combo.image} alt={combo.name} />
                            </div>
                            <div className={styles.comboContent}>
                                <h3 className={styles.comboName}>{combo.name}</h3>
                                <p className={styles.comboDescription}>{combo.description}</p>
                                <div className={styles.comboFooter}>
                                    <span className={styles.comboPrice}>R$ {combo.price.toFixed(2)}</span>
                                    <div className={styles.quantityControls}>
                                        <button className={styles.quantityBtn}>-</button>
                                        <span className={styles.quantity}>1</span>
                                        <button className={styles.quantityBtn}>+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
