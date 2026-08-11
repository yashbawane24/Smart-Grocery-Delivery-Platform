import { motion } from "framer-motion";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={align === "center" ? "text-center mx-auto max-w-2xl" : ""}
    >
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-dark leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-dark/60 text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
