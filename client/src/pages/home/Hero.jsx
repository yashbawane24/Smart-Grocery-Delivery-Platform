import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiArrowRight, FiGrid } from "react-icons/fi";
import { stats } from "../../constants/data";

function Counter({ value, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-surface to-surface pt-14 pb-24">
      {/* Ambient leaf shapes */}
      <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-primary-100/60 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-app grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="section-eyebrow">
            <FiGrid size={12} /> Delivering in 25+ cities
          </span>

          <h1 className="mt-5 font-heading text-[2.6rem] leading-[1.08] font-bold text-dark sm:text-5xl lg:text-[3.4rem]">
            Fresh groceries
            <br />
            delivered to your{" "}
            <span className="relative inline-block text-primary-600">
              doorstep
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="10"
                viewBox="0 0 200 10"
                fill="none"
              >
                <path
                  d="M2 8C40 2 160 2 198 8"
                  stroke="#FACC15"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-dark/60 md:text-lg">
            Order from nearby stores with lightning-fast delivery, live
            tracking, secure payments, and produce that's fresh off the
            shelf — not off the truck from last week.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#deals" className="btn-primary">
              Shop Now <FiArrowRight size={16} />
            </a>
            <a href="#categories" className="btn-secondary">
              Explore Categories
            </a>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-2xl font-bold text-dark md:text-3xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs text-dark/50 md:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column — image collage + signature widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto aspect-square w-full max-w-[520px]"
        >
          <div className="absolute inset-0 rounded-[40%] bg-gradient-to-br from-primary-200/50 to-accent/10" />

          <img
            src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=900&auto=format&fit=crop"
            alt="Fresh produce basket"
            className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-xl4 object-cover shadow-float"
          />

          <motion.img
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            src="https://images.unsplash.com/photo-1573246123716-6b1782bfc499?q=80&w=400&auto=format&fit=crop"
            alt="Fresh strawberries"
            className="absolute -left-6 top-6 h-28 w-28 rounded-xl3 object-cover shadow-card md:h-32 md:w-32"
          />

          <motion.img
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            src="https://images.unsplash.com/photo-1557844352-761f2565b576?q=80&w=400&auto=format&fit=crop"
            alt="Delivery rider bag"
            className="absolute -right-4 bottom-10 h-32 w-32 rounded-xl3 object-cover shadow-card md:h-36 md:w-36"
          />

          {/* Discount floating card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 right-6 rounded-xl3 bg-white px-4 py-3 shadow-float"
          >
            <p className="font-heading text-sm font-bold text-primary-600">
              Up to 30% OFF
            </p>
            <p className="text-[11px] text-dark/50">On fresh fruits today</p>
          </motion.div>

          {/* Signature: live delivery route pulse */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute -bottom-6 left-2 w-52 rounded-xl3 bg-white/90 p-4 shadow-float backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-dark/40">
                Live order
              </span>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                8 min
              </span>
            </div>
            <svg viewBox="0 0 200 40" className="mt-2 w-full">
              <path
                d="M10 30 C 60 10, 110 45, 190 12"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M10 30 C 60 10, 110 45, 190 12"
                fill="none"
                stroke="#16A34A"
                strokeWidth="3"
                strokeDasharray="6 6"
                className="animate-dashMove"
              />
              <circle cx="10" cy="30" r="4" fill="#111827" />
              <circle cx="190" cy="12" r="5" fill="#16A34A" />
              <circle cx="190" cy="12" r="9" fill="#16A34A" opacity="0.3" className="animate-pulseDot" />
            </svg>
            <p className="mt-1 text-[11px] text-dark/45">
              Rider is 1.2 km from you
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
