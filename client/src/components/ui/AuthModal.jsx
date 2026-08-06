import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiLock, FiMail, FiUser, FiShield, FiTruck, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { authService } from "../../services";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const sampleAccounts = [
    {
      role: "Admin",
      icon: FiShield,
      color: "bg-purple-100 text-purple-700 border-purple-200",
      email: "admin@farmly.app",
      pass: "Admin@12345",
    },
    {
      role: "Customer",
      icon: FiUser,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      email: "customer@farmly.app",
      pass: "User@12345",
    },
    {
      role: "Delivery",
      icon: FiTruck,
      color: "bg-blue-100 text-blue-700 border-blue-200",
      email: "delivery@farmly.app",
      pass: "Delivery@12345",
    },
  ];

  const handleQuickFill = (acc) => {
    setIsRegister(false);
    setEmail(acc.email);
    setPassword(acc.pass);
    toast.success(`Loaded ${acc.role} credentials! Click Sign In.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await authService.register({ name, email, password });
        toast.success("Account created successfully!");
      } else {
        res = await authService.login({ email, password });
        toast.success(`Welcome back, ${res.data.user.name}!`);
      }

      if (onAuthSuccess) onAuthSuccess(res.data.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-dark/50 hover:text-dark rounded-full hover:bg-muted transition"
          >
            <FiX size={20} />
          </button>

          {/* Title */}
          <div className="text-center mb-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold text-xl mb-2">
              F
            </span>
            <h2 className="text-2xl font-bold font-heading text-dark">
              {isRegister ? "Create Account" : "Sign In to Farmly"}
            </h2>
            <p className="text-sm text-dark/60 mt-1">
              Fresh organic groceries delivered in 15 minutes
            </p>
          </div>

          {/* Quick-fill Sample Accounts */}
          {!isRegister && (
            <div className="mb-6 p-3 bg-muted/60 rounded-xl border border-dark/5">
              <span className="text-xs font-semibold text-dark/70 block mb-2">
                ⚡ Quick Demo Sign-In (Click to Auto-Fill):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {sampleAccounts.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition hover:scale-[1.02] active:scale-95 ${acc.color}`}
                    >
                      <Icon className="mb-1" size={14} />
                      {acc.role}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-dark/70 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-dark/40" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-dark/70 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-dark/40" size={16} />
                <input
                  type="email"
                  required
                  placeholder="admin@farmly.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark/70 mb-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-dark/40" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-dark text-white font-heading font-semibold rounded-xl hover:bg-dark/90 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Toggle Register / Sign In */}
          <div className="mt-6 text-center text-xs text-dark/60">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-primary font-bold hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-primary font-bold hover:underline"
                >
                  Create one
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
