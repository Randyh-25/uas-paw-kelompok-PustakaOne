import NavBar from "./NavBar";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <NavBar />
      <main className="content">{children}</main>
    </div>
  );
}
