import { motion } from "framer-motion";

export default function BurgerButton({ isOpen, toggle }) {
  return (
    <button
      onClick={toggle}
      className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
      aria-label="تبديل القائمة"
    >
      <motion.div
        className="w-6 h-6 flex justify-center items-center"
        animate={isOpen ? "open" : "closed"}
      >
        <motion.span
          className="absolute w-6 h-0.5 bg-current rounded-full"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: 45, y: 0 },
          }}
        />
        <motion.span
          className="absolute w-6 h-0.5 bg-current rounded-full"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
        />
        <motion.span
          className="absolute w-6 h-0.5 bg-current rounded-full"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: -45, y: 0 },
          }}
        />
      </motion.div>
    </button>
  );
}
