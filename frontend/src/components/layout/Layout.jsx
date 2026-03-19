import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CampBot from "../ui/CampBot";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-main)" }}
    >
      <Navbar transparent={isHome} />
      <main className={`flex-1 flex flex-col ${!isHome && !isAuthPage ? "pt-20" : isAuthPage ? "pt-16 lg:pt-20" : ""}`}>
        <div className={`page-enter flex-1 flex flex-col`}>
          <Outlet />
        </div>
      </main>
      {!isHome && <Footer />}
      <CampBot />
    </div>
  );
}
