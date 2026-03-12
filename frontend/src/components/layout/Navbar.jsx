import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Tent,
  Heart,
  LogOut,
  LogIn,
  UserPlus,
  MapPin,
  Plus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../lib/utils";

export default function Navbar({ transparent = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const handleLogout = async () => {
    try {
      await logout();
      addToast("See you out there. Goodbye!");
    } catch (e) {
      // still navigate even if API call failed
    }
    navigate("/");
  };

  const solid = !transparent || scrolled;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        solid ? "bg-forest-800 shadow-soft" : "bg-transparent",
      )}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                solid ? "bg-forest-700" : "bg-white/15",
              )}
            >
              <Tent size={20} className="text-sand-300" />
            </div>
            <span className="font-display text-xl text-white font-medium tracking-tight">
              LetsCamp
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/campgrounds" solid={solid}>
              <MapPin size={14} />
              Campgrounds
            </NavLink>
            {currentUser && (
              <>
                <NavLink to="/campgrounds/new" solid={solid}>
                  <Plus size={14} />
                  New Camp
                </NavLink>
                <NavLink to="/favorites" solid={solid}>
                  <Heart size={14} />
                  Favorites
                </NavLink>
              </>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                <span className="text-white/60 text-sm px-2">
                  {currentUser.username}
                </span>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full",
                    "text-red-300 hover:bg-red-500/20 transition-all duration-200",
                  )}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
                >
                  <LogIn size={14} />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 text-sm font-medium bg-sand-400 hover:bg-sand-300 text-forest-900 px-4 py-2 rounded-full transition-all duration-200"
                >
                  <UserPlus size={14} />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-white/80 hover:text-white"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-forest-900 border-t border-white/10 px-4 py-4 flex flex-col gap-2">
          <MobileLink to="/campgrounds">
            <MapPin size={15} />
            Campgrounds
          </MobileLink>
          {currentUser && (
            <>
              <MobileLink to="/campgrounds/new">
                <Plus size={15} />
                New Campground
              </MobileLink>
              <MobileLink to="/favorites">
                <Heart size={15} />
                Favorites
              </MobileLink>
            </>
          )}
          <div className="border-t border-white/10 pt-2 mt-1">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-300 text-sm font-medium px-3 py-2 w-full"
              >
                <LogOut size={15} />
                Logout
              </button>
            ) : (
              <>
                <MobileLink to="/login">
                  <LogIn size={15} />
                  Login
                </MobileLink>
                <MobileLink to="/register">
                  <UserPlus size={15} />
                  Register
                </MobileLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, solid }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 text-sm text-white/75 hover:text-white hover:bg-white/10 px-3.5 py-2 rounded-full transition-all duration-200"
    >
      {children}
    </Link>
  );
}

function MobileLink({ to, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
    >
      {children}
    </Link>
  );
}
