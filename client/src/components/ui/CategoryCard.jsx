import { motion } from "framer-motion";

export default function CategoryCard({ category, index = 0 }) {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group relative block aspect-[4/5] overflow-hidden rounded-xl4 shadow-card transition-shadow duration-500 hover:shadow-float"
    >
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 transition-transform duration-500 group-hover:-translate-y-1">
        <h3 className="font-heading text-lg font-semibold text-white">
          {category.name}
        </h3>
        <p className="mt-0.5 text-xs text-white/70">{category.count}</p>
      </div>
    </motion.a>
  );
}
