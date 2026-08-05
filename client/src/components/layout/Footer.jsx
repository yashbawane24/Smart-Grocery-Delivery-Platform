import {
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const columns = [
  {
    title: "Company",
    links: ["About Us", "Careers", "Press", "Sustainability", "Blog"],
  },
  {
    title: "Products",
    links: ["Vegetables", "Fruits", "Dairy & Eggs", "Bakery", "Organic"],
  },
  {
    title: "Support",
    links: ["Help Center", "Track Order", "Returns", "Delivery Info", "FAQs"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="container-app grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <a href="#" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl2 bg-primary font-heading text-lg font-bold text-white">
              F
            </span>
            <span className="font-heading text-xl font-bold">Farmly</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            Fresh groceries from nearby stores, delivered to your door in
            minutes. Honest prices, careful hands, real people.
          </p>
          <div className="mt-6 space-y-2.5 text-sm text-white/60">
            <div className="flex items-center gap-2.5">
              <FiMapPin size={15} className="text-primary-400" />
              12 Residency Road, Chennai, India
            </div>
            <div className="flex items-center gap-2.5">
              <FiPhone size={15} className="text-primary-400" />
              +91 98765 43210
            </div>
            <div className="flex items-center gap-2.5">
              <FiMail size={15} className="text-primary-400" />
              hello@farmly.app
            </div>
          </div>
          <div className="mt-6 flex gap-2.5">
            {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-primary"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wide text-white/90">
              {col.title}
            </h4>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/50 transition-colors hover:text-primary-400"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-app flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Farmly Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/70">Privacy Policy</a>
            <a href="#" className="hover:text-white/70">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
