import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { RotateCcw, Sparkles } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import quizData from "@/data/quiz.json";
import type { QuizData } from "@/types/quiz";

const data: QuizData = quizData;

const CircularProgress = ({ progress, size = 120, strokeWidth = 2 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs tracking-wider text-primary font-display">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

const ScentQuiz = () => {
  const { products } = useCatalog();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleAnswer = (value: string) => {
    setSelectedOption(value);
    setTimeout(() => {
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);

      if (currentStep < data.steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 300);
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResult(false);
    setSelectedOption(null);
  };

  const resultKey = answers.join("-");
  const result = data.resultMap[resultKey] || data.resultMap["warm-bold-night"];
  const recommendedProducts = result.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;
  const progress = showResult ? 100 : ((currentStep) / data.steps.length) * 100;

  return (
    <section className="py-24 sm:py-36 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-3xl mx-auto text-center section-padding"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-primary/60 text-[10px] tracking-[0.4em] uppercase mb-4 font-body flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <Sparkles size={12} className="text-primary/50" />
            Scent Discovery
            <Sparkles size={12} className="text-primary/50" />
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide text-foreground mb-4">
            Find Your Scent
            <br />
            <span className="italic text-primary">Personality</span>
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-24 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-6"
          />
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-10 sm:mt-14 mb-10 sm:mb-14">
          <CircularProgress progress={progress} size={100} strokeWidth={1.5} />
        </div>

        {/* Quiz Content */}
        <div className="min-h-[320px] sm:min-h-[380px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <p className="text-muted-foreground text-xs tracking-[0.25em] uppercase mb-8 sm:mb-10 font-body">
                  Question {currentStep + 1} of {data.steps.length}
                </p>
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground mb-10 sm:mb-14 leading-tight">
                  {data.steps[currentStep].question}
                </h3>

                <div className="flex gap-4 sm:gap-6 md:gap-8 justify-center">
                  {[data.steps[currentStep].optionA, data.steps[currentStep].optionB].map((opt, idx) => (
                    <motion.button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${
                        selectedOption === opt.value
                          ? 'border-primary/60 bg-primary/10 gold-glow'
                          : 'border-border/60 bg-card/50 hover:border-primary/40 hover:bg-primary/5'
                      }`}
                      style={{ border: '1px solid' }}
                    >
                      {/* Option Background Gradient */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Decorative Corner */}
                      <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-primary/0 group-hover:border-primary/30 transition-all duration-300 rounded-tl" />
                      <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-primary/0 group-hover:border-primary/30 transition-all duration-300 rounded-br" />

                      <span className={`font-display text-lg sm:text-xl md:text-2xl tracking-wider transition-colors duration-300 text-center px-4 ${
                        selectedOption === opt.value
                          ? 'text-primary'
                          : 'text-foreground/70 group-hover:text-primary'
                      }`}>
                        {opt.label}
                      </span>

                      {/* Selection Indicator */}
                      {selectedOption === opt.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Sparkles size={12} className="text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <Sparkles size={14} className="text-primary" />
                  <p className="text-primary/80 text-xs tracking-[0.25em] uppercase font-body">
                    Your Scent Personality
                  </p>
                  <Sparkles size={14} className="text-primary" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-10 sm:mb-14 italic leading-tight"
                >
                  "{result.personality}"
                </motion.h3>

                {/* Recommended Products */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-4 sm:gap-6 justify-center mb-10 sm:mb-14"
                >
                  {recommendedProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="group block text-center"
                      >
                        <div className="w-28 h-36 sm:w-36 sm:h-48 md:w-40 md:h-52 relative bg-card/50 border border-border/50 rounded-xl overflow-hidden mb-4 transition-all duration-500 group-hover:border-primary/30 group-hover:gold-glow">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-all duration-500" />
                        </div>
                        <p className="font-display text-sm sm:text-base tracking-wider text-foreground/70 group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <p className="text-muted-foreground text-xs mt-1.5">
                          KES {product.price.toLocaleString()}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Retake Button */}
                <motion.button
                  onClick={reset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="group inline-flex items-center gap-2 btn-gold"
                >
                  <RotateCcw size={14} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                  <span>Retake Quiz</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default ScentQuiz;
