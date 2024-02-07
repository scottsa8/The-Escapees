import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

// const splitString =  "Data ID: 1, Timestamp: 2023-01-31 16:00:00.0, Temperature: 25.00, Noise Level: 0.00, Light Level: 10.00!Data ID: 2, Timestamp: 2023-01-31 16:30:00.0, Temperature: 22.00, Noise Level: 1.00, Light Level: 5.00!".split("!");
//     // console.log(JSON.parse(splitString[splitString.length - 1])) // Last element is most recent
// console.log("{" + splitString[splitString.length - 2] + "}")

// const list = async() => {
//   const response = await fetch("http://localhost:5500/getEnv");
//   const data = await response.json()
//   return data
// };
// console.log(list())

export const network = {
  ip: "localhost",
  port: "8080"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
