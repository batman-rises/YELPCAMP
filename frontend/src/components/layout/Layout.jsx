import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CampBot from "../ui/CampBot";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-main)" }}
    >
      <Navbar transparent={isHome} />
      <main className={`flex-1 ${isHome ? "" : "pt-20"}`}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
      {!isHome && <Footer />}
      <CampBot />
    </div>
  );
}
