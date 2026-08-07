import SectionHeading from "../../components/ui/SectionHeading";
import CategoryCard from "../../components/ui/CategoryCard";
import { categories } from "../../constants/data";

export default function Categories() {
  return (
    <section id="categories" className="bg-muted/50 py-24">
      <div className="container-app">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Shop by category"
            title="Everything you need, sorted neatly"
            subtitle="From the produce aisle to the freezer — browse categories built around how you actually shop."
          />
          <a
            href="#"
            className="hidden font-heading text-sm font-semibold text-primary-700 hover:underline sm:block"
          >
            View all categories →
          </a>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
