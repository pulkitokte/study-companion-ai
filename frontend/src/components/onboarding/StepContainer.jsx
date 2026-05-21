import { motion } from "framer-motion";

const StepContainer = ({ children }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -30,
      }}
      transition={{
        duration: 0.4,
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default StepContainer;
