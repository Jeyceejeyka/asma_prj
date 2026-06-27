import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Minus, Plus, Trash2, Phone, MapPin, User, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import checkoutData from "@/data/checkout.json";
import Footer from "@/components/Footer";
import { useCheckoutStore } from "@/store/checkoutStore";

const steps = checkoutData.steps;

const Checkout = () => {
  const { items, updateQuantity, removeItem, totalPrice, clearCart, fetchCart, checkout } = useCartStore();
  const cstore = useCheckoutStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", location: "", address: "" });

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const grandTotal = totalPrice();

  const isPhoneValid = /^(07|01)\d{8}$/.test(form.phone.replace(/\s/g, ""));
  const isFormValid = form.name.trim().length > 1 && isPhoneValid && form.location && form.address.trim().length > 3;

  const handlePay = async () => {
    if (!isFormValid || cstore.state !== "IDLE") {
      if (!isFormValid) {
        toast.error("Please complete checkout details before paying.");
      }
      return;
    }
    const payload = {
      name: form.name,
      phone: form.phone,
      location: form.location,
      address: form.address,
    };
    console.log("src/pages/Checkout.tsx: handlePay payload=", payload);
    try {
      toast.info(checkoutData.mpesaInstructions);
      await cstore.startCheckout(payload);
    } catch (e: any) {
      console.error("src/pages/Checkout.tsx: handlePay error=", e);
      toast.error(e.message || "Could not place order");
    }
  };

  if (items.length === 0 && cstore.state !== "SUCCESS") {
    return (
      <main className="pt-20 sm:pt-24 min-h-screen">
        <div className="section-padding text-center py-20">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-light mb-6">Your cart is empty.</p>
          <Link to="/" className="btn-gold text-sm px-8 py-3">Shop Now</Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="pt-20 sm:pt-24 min-h-screen">
      <div className="section-padding max-w-4xl mx-auto pb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mb-6">
          <ArrowLeft size={14} /> Continue Shopping
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs tracking-wider transition-all duration-300 ${
                i <= step ? "bg-primary/15 text-primary" : "text-muted-foreground"
              }`}>
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-body ${
                  i < step ? "bg-primary text-primary-foreground" : i === step ? "border-2 border-primary text-primary" : "border border-border text-muted-foreground"
                }`}>
                  {i < step ? <Check size={10} /> : i + 1}
                </div>
                <span className="hidden sm:inline uppercase">{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-6 sm:w-10 h-px mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Cart Review */}
          {step === 0 && (
            <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <h1 className="font-display text-2xl sm:text-3xl tracking-wider mb-6">Review Your Cart</h1>
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-4 p-4 bg-card rounded-xl border border-border/40">
                    <div className="w-16 h-20 sm:w-20 sm:h-24 bg-secondary rounded-lg overflow-hidden shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm tracking-wider truncate">{item.product.name}</h4>
                      <p className="text-muted-foreground text-xs mt-0.5">{item.size}</p>
                      <p className="text-primary text-sm mt-1 font-display">{checkoutData.currency} {item.product.price.toLocaleString()}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-border rounded-lg">
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="p-1.5 text-foreground/40 hover:text-foreground"><Minus size={12} /></button>
                          <span className="px-2 text-xs">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="p-1.5 text-foreground/40 hover:text-foreground"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeItem(item.product.id, item.size)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <p className="text-foreground font-display text-sm self-center">{checkoutData.currency} {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-xl border border-border/40 p-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{checkoutData.currency} {totalPrice().toLocaleString()}</span></div>
                <div className="border-t border-border/40 pt-3 flex justify-between"><span className="font-display tracking-wider">Total</span><span className="font-display text-xl text-primary">{checkoutData.currency} {grandTotal.toLocaleString()}</span></div>
              </div>

              <button onClick={() => setStep(1)} className="w-full btn-gold-solid text-center">Continue to Details</button>
            </motion.div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <h1 className="font-display text-2xl sm:text-3xl tracking-wider mb-6">Your Details</h1>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 flex items-center gap-1.5"><User size={12} /> Full Name</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Jane Wanjiku" className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 flex items-center gap-1.5"><Phone size={12} /> Phone (M-Pesa)</label>
                  <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder={checkoutData.phonePlaceholder} className={`w-full bg-card border rounded-xl px-4 py-3 text-sm font-body focus:outline-none transition-colors ${form.phone && !isPhoneValid ? "border-destructive/60" : "border-border/60 focus:border-primary/50"}`} />
                  {form.phone && !isPhoneValid && <p className="text-destructive text-xs mt-1">Enter valid Kenyan phone (07xx or 01xx)</p>}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 flex items-center gap-1.5"><MapPin size={12} /> Location</label>
                  <select value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                    <option value="">Select city</option>
                    {checkoutData.supportedLocations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5">Delivery Address</label>
                  <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="Building, street, estate..." rows={3} className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(0)} className="btn-gold px-6 py-3">Back</button>
                <button onClick={() => { if(isFormValid) setStep(2); else toast.error("Please fill all fields correctly"); }} className="flex-1 btn-gold-solid text-center">Continue to Payment</button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <h1 className="font-display text-2xl sm:text-3xl tracking-wider mb-6">Payment</h1>

              <div className="bg-card rounded-xl border border-border/40 p-5 mb-6">
                <h3 className="text-xs tracking-wider uppercase text-muted-foreground mb-3">Order Summary</h3>
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm py-1.5">
                    <span className="text-foreground/70">{item.product.name} × {item.quantity}</span>
                    <span>{checkoutData.currency} {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-border/40 mt-3 pt-3 space-y-1.5">
                  <div className="flex justify-between font-display text-lg"><span>Total</span><span className="text-primary">{checkoutData.currency} {grandTotal.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border/40 p-5 mb-6">
                <h3 className="text-xs tracking-wider uppercase text-muted-foreground mb-3">Delivery To</h3>
                <p className="text-sm">{form.name}</p>
                <p className="text-sm text-foreground/60">{form.phone}</p>
                <p className="text-sm text-foreground/60">{form.address}, {form.location}</p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Phone size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm tracking-wider">M-Pesa Payment</h3>
                    <p className="text-xs text-muted-foreground">STK Push to {form.phone}</p>
                  </div>
                </div>
                <p className="text-xs text-foreground/50 leading-relaxed">{checkoutData.mpesaInstructions}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-gold px-6 py-3">Back</button>
                <button onClick={handlePay} disabled={cstore.state !== "IDLE"} className={`flex-1 btn-gold-solid text-center ${cstore.state !== "IDLE" ? "opacity-60 pointer-events-none" : ""}`}>
                  {cstore.state === "IDLE" && `Pay ${checkoutData.currency} ${grandTotal.toLocaleString()}`}
                  {cstore.state === "INITIATING" && "Initiating..."}
                  {cstore.state === "STK_PUSH_SENT" && "STK push sent"}
                  {cstore.state === "PENDING_CONFIRMATION" && "Awaiting confirmation..."}
                  {cstore.state === "SUCCESS" && "Payment confirmed"}
                  {cstore.state === "FAILED" && "Payment failed"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {cstore.state === "SUCCESS" && (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
                <Check size={28} className="text-primary" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl tracking-wider mb-3">Order Confirmed!</h1>
              <p className="text-muted-foreground text-sm mb-2">Order ID: <span className="text-foreground font-mono">{cstore.checkoutRequestId}</span></p>
              <p className="text-foreground/50 text-sm mb-8 max-w-md mx-auto">Thank you for your purchase. You'll receive a confirmation SMS shortly.</p>
              <Link to="/" className="btn-gold text-sm px-10 py-3">Continue Shopping</Link>
            </motion.div>
          )}

          {cstore.state === "FAILED" && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center py-12">
              <h2 className="font-display text-xl mb-3">Payment Failed</h2>
              <p className="text-muted-foreground mb-6">{cstore.message || "Payment could not be completed."}</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => cstore.reset()} className="btn-gold">Try Again</button>
                <Link to="/" className="btn-gold text-sm px-6 py-3">Continue Shopping</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {cstore.state !== "SUCCESS" && <Footer />}
    </main>
  );
};

export default Checkout;
