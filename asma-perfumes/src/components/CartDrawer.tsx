import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, totalPrice } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 z-[70] bg-background/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[80] w-full max-w-md bg-card border-l border-border flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl tracking-wider">Your Cart</h2>
              <button onClick={toggleCart} className="text-foreground/50 hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm mt-12 font-light">Your cart is empty.</p>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
                      <div className="w-20 h-24 bg-secondary rounded-sm flex items-center justify-center shrink-0">
                        <span className="font-display text-2xl text-foreground/10">{item.product.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-display text-sm tracking-wider">{item.product.name}</h4>
                        <p className="text-muted-foreground text-xs mt-1">{item.size}</p>
                        <p className="text-primary text-sm mt-1">KES {item.product.price.toLocaleString()}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                            className="text-foreground/40 hover:text-foreground transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                            className="text-foreground/40 hover:text-foreground transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border">
                <div className="flex justify-between mb-6">
                  <span className="text-muted-foreground text-sm">Subtotal</span>
                  <span className="text-foreground font-display text-lg">KES {totalPrice().toLocaleString()}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={toggleCart}
                  className="block w-full text-center btn-gold-solid"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
