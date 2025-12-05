import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

export const metadata = {
    title: "CineFlow",
    description: "Cineflow",
    icons: {
        icon: "/Icons/3d-glasses.png"
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-br" suppressHydrationWarning>
            <body className={roboto.className}>
                {children}
            </body>
        </html>
    );
}
