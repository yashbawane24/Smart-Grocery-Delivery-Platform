import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiMapPin,
  FiLogOut,
  FiShield,
} from "react-icons/fi";
import AuthModal from "../ui/AuthModal";
import { authService } from "../../services";
import toast from "react-hot-toast";

const links = [
  { label: "Home", href: "#" },
  { label: "Categories", href: "#categories" },
  { label: "Deals", href: "#deals" },
  { label: "How It Works", href: "#how-it-works" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("farmly_token");
    if (token) {
      authService
        .me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("farmly_token");
          setUser(null);
        });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    }
    localStorage.removeItem("farmly_token");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-lg shadow-soft"
            : "bg-transparent"
        }`}
      >
        <div className="container-app flex h-20 items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl2 bg-primary font-heading text-lg font-bold text-white">
              F
            </span>
            <span className="font-heading text-xl font-bold text-dark">
              Farmly
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-2 font-heading text-sm font-medium text-dark/70 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-muted px-4 py-2.5 text-xs text-dark/50 min-w-[190px]">
            <FiMapPin className="text-primary-600" size={14} />
            Deliver to <span className="font-medium text-dark">New York</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              aria-label="Search"
              className="hidden sm:grid h-10 w-10 place-items-center rounded-full text-dark/70 transition-colors hover:bg-muted hover:text-dark"
            >
              <FiSearch size={18} />
            </button>
            <button
              aria-label="Wishlist"
              className="hidden sm:grid h-10 w-10 place-items-center rounded-full text-dark/70 transition-colors hover:bg-muted hover:text-dark"
            >
              <FiHeart size={18} />
            </button>
            <button
              aria-label="Cart"
              className="relative grid h-10 w-10 place-items-center rounded-full text-dark/70 transition-colors hover:bg-muted hover:text-dark"
            >
              <FiShoppingBag size={18} />
              <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] font-semibold text-white">
                3
              </span>
            </button>

            {user ? (
              <div className="ml-2 flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 border border-primary-200">
                  <div className="h-7 w-7 rounded-full bg-primary text-white font-bold grid place-items-center text-xs">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-dark leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-primary uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="grid h-9 w-9 place-items-center rounded-full text-dark/60 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <FiLogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="ml-1 hidden md:inline-flex items-center gap-2 rounded-full bg-dark px-5 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
              >
                <FiUser size={15} /> Sign In
              </button>
            )}

            <button
              aria-label="Menu"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-dark lg:hidden"
            >
              <FiMenu size={20} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-dark/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 h-full w-[78%] max-w-sm bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-lg font-bold">Menu</span>
                  <button onClick={() => setOpen(false)} aria-label="Close menu">
                    <FiX size={22} />
                  </button>
                </div>
                <div className="mt-8 flex flex-col gap-1">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-xl2 px-4 py-3 font-heading text-sm font-medium text-dark/80 hover:bg-primary-50"
                    >
                      {link.label}
                    </a>
                  ))}
                  {user ? (
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 font-semibold py-3"
                    >
                      <FiLogOut size={16} /> Sign Out ({user.name})
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="btn-primary mt-4 w-full"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />
    </>
  );
}
