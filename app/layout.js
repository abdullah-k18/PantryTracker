import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pantry Tracker",
  description: "Manage your Pantry",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Pantry Tracker</title>
        <link rel="shortcut icon" href="https://www.svgrepo.com/show/449636/boxes.svg" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
