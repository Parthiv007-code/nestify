import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "RentEasy",
  description: "Find or list houses for rent",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
