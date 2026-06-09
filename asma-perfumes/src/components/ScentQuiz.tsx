import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useCatalog } from "@/hooks/useCatalog";
import quizData from "@/data/quiz.json";
import type { QuizData } from "@/types/quiz";

const data: QuizData = quizData;

const ScentQuiz = () => {
  const { products } = useCatalog();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentStep < data.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResult(false);
  };

  const resultKey = answers.join("-");
  const result = data.resultMap[resultKey] || data.resultMap["warm-bold-night"];
  const recommendedProducts = result.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;
  const progress = showResult ? 100 : (currentStep / data.steps.length) * 100;

  return (
    <section className="py-20 sm:py-32 section-padding">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="font-display text-2xl sm:text-3xl md:text-5xl tracking-wide text-foreground mb-4">
          Find Your Scent
          <br />
          <span className="italic text-primary">Personality</span>
        </h2>
        <div className="w-16 h-px bg-primary mx-auto mt-4 mb-8 sm:mb-12" />

        <div className="w-full max-w-xs mx-auto h-px bg-border mb-10 sm:mb-16 relative">
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="min-h-[240px] sm:min-h-[280px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase mb-6 sm:mb-8">
                  Step {currentStep + 1} of {data.steps.length}
                </p>
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-foreground mb-8 sm:mb-12">
                  {data.steps[currentStep].question}
                </h3>
                <div className="flex gap-4 sm:gap-6 justify-center">
                  {[data.steps[currentStep].optionA, data.steps[currentStep].optionB].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className="group relative w-28 h-28 sm:w-40 sm:h-40 border border-border rounded-xl flex items-center justify-center transition-all duration-500 hover:border-primary/50 hover:gold-glow"
                    >
                      <span className="font-display text-lg sm:text-xl tracking-wider text-foreground/70 group-hover:text-primary transition-colors duration-300">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full"
              >
                <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase mb-4">
                  Your scent personality
                </p>
                <h3 className="font-display text-xl sm:text-2xl md:text-4xl text-primary mb-8 italic">
                  "{result.personality}"
                </h3>

                <div className="flex gap-4 sm:gap-6 justify-center mb-10">
                  {recommendedProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group text-center"
                    >
                      <div className="w-24 h-32 sm:w-32 sm:h-44 bg-card border border-border rounded-xl flex items-center justify-center mb-3 transition-all duration-500 group-hover:border-primary/30 group-hover:gold-glow overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="font-display text-xs sm:text-sm tracking-wider text-foreground/70 group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">KES {product.price.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>

                <button onClick={reset} className="btn-gold text-xs">
                  Retake Quiz
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default ScentQuiz;
