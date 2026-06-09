// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { Menu, X, ShoppingBag, Search, Heart, User } from "lucide-react";
// import { useCartStore } from "@/store/cartStore";
// import { useWishlistStore } from "@/store/wishlistStore";
// import { useAuthStore } from "@/store/authStore";
// import { useDebounce } from "@/hooks/useDebounce";
// import { useProductsStore } from "@/store/productsStore";
// import ThemeToggle from "@/components/ThemeToggle";
// import navData from "@/data/navigation.json";
// import type { NavLink as NavLinkType } from "@/types/navigation";
// import type { Product } from "@/types/product";
// import logo from "@/assets/asma-perfumes.png";

// const navLinks: NavLinkType[] = navData.navLinks;

// const Navbar = () => {
//   const [scrolled, setScrolled] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const debouncedQuery = useDebounce(searchQuery, 250);
//   const [suggestions, setSuggestions] = useState<Product[]>([]);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const navigate = useNavigate();

//   const toggleCart = useCartStore((s) => s.toggleCart);
//   const cartItems = useCartStore((s) => s.items);
//   const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
//   const wishlistCount = useWishlistStore((s) => s.ids.length);
//   const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
//   const authUser = useAuthStore((s) => s.user);
//   const logout = useAuthStore((s) => s.logout);
//   const products = useProductsStore((s) => s.products);
//   const fetchAllProducts = useProductsStore((s) => s.fetchAll);
//   useEffect(() => { fetchAllProducts(); }, [fetchAllProducts]);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 50);
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   useEffect(() => {
//     if (!debouncedQuery.trim()) {
//       setSuggestions([]);
//       return;
//     }
//     const q = debouncedQuery.toLowerCase();
//     const filtered = products
//       .filter(
//         (p) =>
//           p.name.toLowerCase().includes(q) ||
//           p.collection.toLowerCase().includes(q) ||
//           p.description.toLowerCase().includes(q) ||
//           p.notes.top.toLowerCase().includes(q) ||
//           p.notes.heart.toLowerCase().includes(q) ||
//           p.notes.base.toLowerCase().includes(q) ||
//           p.grade.toLowerCase().includes(q) ||
//           p.season.toLowerCase().includes(q)
//       )
//       .slice(0, 6);
//     setSuggestions(filtered);
//   }, [debouncedQuery]);

//   const handleSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
//       setSearchOpen(false);
//       setSearchQuery("");
//       setSuggestions([]);
//     }
//   };

//   const handleSuggestionClick = (productId: number) => {
//     navigate(`/product/${productId}`);
//     setSearchOpen(false);
//     setSearchQuery("");
//     setSuggestions([]);
//   };

//   return (
//     <>
//       <motion.nav
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
//           scrolled
//             ? "bg-background/80 backdrop-blur-2xl border-b border-border/30 shadow-sm"
//             : "bg-transparent"
//         }`}
//       >
//         <div className="section-padding flex items-center justify-between h-16 sm:h-[72px]">
//           <Link to="/" className="flex items-center gap-2.5 group">
//             <img src={logo} alt="Asma Perfumes" className="h-9 sm:h-10 w-auto transition-opacity duration-300 group-hover:opacity-80" />
//             <span className="hidden sm:inline-block text-[8px] tracking-[0.25em] uppercase text-muted-foreground font-body font-heavy">
//               Asma Perfumes
//             </span>
//           </Link>

//           <div className="hidden md:flex items-center gap-6 lg:gap-10">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.to}
//                 to={link.to}
//                 className="relative text-[11px] tracking-[0.2em] uppercase text-foreground/60 hover:text-primary transition-colors duration-500 font-body font-light group py-1"
//               >
//                 {link.label}
//                 <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary/80 group-hover:w-full transition-all duration-500 ease-out" />
//               </Link>
//             ))}
//           </div>

//           <div className="flex items-center gap-3 sm:gap-5">
//             <ThemeToggle />
//             <button
//               onClick={() => {
//                 setSearchOpen(!searchOpen);
//                 if (!searchOpen) setTimeout(() => inputRef.current?.focus(), 100);
//               }}
//               className="text-foreground/40 hover:text-primary transition-colors duration-400"
//               aria-label="Search"
//             >
//               <Search size={16} strokeWidth={1.5} />
//             </button>
//             <Link
//               to="/wishlist"
//               className="hidden sm:block relative text-foreground/40 hover:text-primary transition-colors duration-400"
//               aria-label="Wishlist"
//             >
//               <Heart size={16} strokeWidth={1.5} />
//               {wishlistCount > 0 && (
//                 <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-body">
//                   {wishlistCount}
//                 </span>
//               )}
//             </Link>
//             <button
//               onClick={toggleCart}
//               className="relative text-foreground/40 hover:text-primary transition-colors duration-400"
//               aria-label="Cart"
//             >
//               <ShoppingBag size={16} strokeWidth={1.5} />
//               {cartCount > 0 && (
//                 <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-body">
//                   {cartCount}
//                 </span>
//               )}
//             </button>
//             {isAuthenticated ? (
//               <Link
//                 to="/profile"
//                 className="hidden sm:flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors duration-400"
//                 aria-label="Profile"
//                 title={authUser ? `${authUser.first_name} ${authUser.last_name}` : "Profile"}
//               >
//                 <User size={16} strokeWidth={1.5} />
//               </Link>
//             ) : (
//               <Link
//                 to="/login"
//                 className="hidden sm:block text-foreground/40 hover:text-primary transition-colors duration-400"
//                 aria-label="Sign in"
//               >
//                 <User size={16} strokeWidth={1.5} />
//               </Link>
//             )}
//             <button
//               className="md:hidden text-foreground/50"
//               onClick={() => setMobileOpen(true)}
//               aria-label="Menu"
//             >
//               <Menu size={20} strokeWidth={1.5} />
//             </button>
//           </div>
//         </div>

//         <AnimatePresence>
//           {searchOpen && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
//               className="overflow-hidden border-t border-border/20"
//             >
//               <div className="section-padding py-4 relative">
//                 <form onSubmit={handleSearchSubmit} role="search" aria-label="Search fragrances">
//                   <input
//                     ref={inputRef}
//                     type="search"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search fragrances by name, notes, or collection..."
//                     className="w-full bg-transparent text-sm font-body font-light tracking-wide text-foreground placeholder:text-muted-foreground outline-none"
//                     aria-label="Search fragrances"
//                   />
//                 </form>

//                 {suggestions.length > 0 && (
//                   <div className="absolute left-0 right-0 top-full bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-lg z-50">
//                     <div className="section-padding py-3 space-y-1">
//                       {suggestions.map((product) => (
//                         <button
//                           key={product.id}
//                           onClick={() => handleSuggestionClick(product.id)}
//                           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-card transition-colors text-left group"
//                         >
//                           <img
//                             src={product.image}
//                             alt={product.name}
//                             className="w-10 h-10 rounded-lg object-cover"
//                             width={40}
//                             height={40}
//                           />
//                           <div className="flex-1 min-w-0">
//                             <p className="text-sm font-display tracking-wider text-foreground group-hover:text-primary transition-colors truncate">
//                               {product.name}
//                             </p>
//                             <p className="text-[10px] text-muted-foreground truncate">
//                               {product.collection} · {product.notes.top}
//                             </p>
//                           </div>
//                           <span className="text-xs text-primary font-display">
//                             KES {product.price.toLocaleString()}
//                           </span>
//                         </button>
//                       ))}
//                       {searchQuery.trim() && (
//                         <button
//                           onClick={handleSearchSubmit as any}
//                           className="w-full text-center text-xs text-primary hover:text-primary/80 py-2 tracking-wider uppercase"
//                         >
//                           View all results for "{searchQuery}"
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.nav>

//       <AnimatePresence>
//         {mobileOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.4 }}
//             className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-xl flex flex-col items-center justify-center gap-10"
//           >
//             <button
//               className="absolute top-6 right-6 text-foreground/50 hover:text-primary transition-colors"
//               onClick={() => setMobileOpen(false)}
//             >
//               <X size={24} strokeWidth={1.5} />
//             </button>

//             {navLinks.map((link, i) => (
//               <motion.div
//                 key={link.to}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: i * 0.08 + 0.1, duration: 0.4 }}
//               >
//                 <Link
//                   to={link.to}
//                   onClick={() => setMobileOpen(false)}
//                   className="font-display text-2xl tracking-[0.15em] text-foreground/70 hover:text-primary transition-colors duration-300"
//                 >
//                   {link.label}
//                 </Link>
//               </motion.div>
//             ))}

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.5 }}
//               className="flex flex-col items-center gap-6 mt-6"
//             >
//               <div className="flex items-center gap-8 text-foreground/40">
//                 <Link to="/wishlist" onClick={() => setMobileOpen(false)}>
//                   <Heart size={18} strokeWidth={1.5} />
//                 </Link>
//               </div>
//               {isAuthenticated ? (
//                 <div className="flex flex-col items-center gap-4">
//                   <Link
//                     to="/profile"
//                     onClick={() => setMobileOpen(false)}
//                     className="font-display text-lg tracking-[0.15em] text-primary hover:text-primary/80 transition-colors"
//                   >
//                     My Profile
//                   </Link>
//                   <button
//                     onClick={() => { logout(); setMobileOpen(false); }}
//                     className="text-sm tracking-[0.15em] uppercase text-foreground/50 hover:text-primary transition-colors font-body"
//                   >
//                     Sign Out
//                   </button>
//                 </div>
//               ) : (
//                 <Link
//                   to="/login"
//                   onClick={() => setMobileOpen(false)}
//                   className="font-display text-lg tracking-[0.15em] text-primary hover:text-primary/80 transition-colors"
//                 >
//                   Sign In
//                 </Link>
//               )}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default Navbar;





import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Search, Heart, User } from "lucide-react";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductsStore } from "@/store/productsStore";

import ThemeToggle from "@/components/ThemeToggle";

import navData from "@/data/navigation.json";

import type { NavLink as NavLinkType } from "@/types/navigation";
import type { Product } from "@/types/product";

import logo from "@/assets/asma-perfumes.png";

const navLinks: NavLinkType[] = navData.navLinks;

const Navbar = () => {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery, 250);

  const [suggestions, setSuggestions] = useState<Product[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const toggleCart = useCartStore((s) => s.toggleCart);
  const cartItems = useCartStore((s) => s.items);

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const wishlistCount = useWishlistStore((s) => s.ids.length);

  const isAuthenticated = useAuthStore(
    (s) => s.isAuthenticated
  );

  const authUser = useAuthStore((s) => s.user);

  const logout = useAuthStore((s) => s.logout);

  const products = useProductsStore((s) => s.products);

  const fetchAllProducts = useProductsStore(
    (s) => s.fetchAll
  );

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const q = debouncedQuery.toLowerCase();

    const filtered = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.notes.top.toLowerCase().includes(q) ||
          p.notes.heart.toLowerCase().includes(q) ||
          p.notes.base.toLowerCase().includes(q) ||
          p.grade.toLowerCase().includes(q) ||
          p.season.toLowerCase().includes(q)
      )
      .slice(0, 6);

    setSuggestions(filtered);
  }, [debouncedQuery, products]);

  const handleSearchSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(
        `/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );

      setSearchOpen(false);
      setSearchQuery("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (
    productId: number
  ) => {
    navigate(`/product/${productId}`);

    setSearchOpen(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={`fixed left-0 right-0 top-0 z-50 overflow-x-clip transition-all duration-700 ${
          scrolled
            ? "border-b border-border/30 bg-background/80 shadow-sm backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="section-padding mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-2 sm:h-16 sm:gap-4 lg:h-[72px]">
          {/* Logo */}
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <img
              src={logo}
              alt="Asma Perfumes"
              className="h-7 w-auto shrink-0 transition-opacity duration-300 group-hover:opacity-80 sm:h-8 md:h-9 lg:h-10"
            />

            <span className="hidden truncate font-body font-heavy text-[8px] uppercase tracking-[0.22em] text-muted-foreground md:block lg:text-[9px]">
              Asma Perfumes
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-5 lg:flex xl:gap-8 2xl:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="
                  group
                  relative
                  whitespace-nowrap
                  py-1
                  font-body
                  text-[10px]
                  uppercase
                  tracking-[0.18em]
                  text-foreground/70
                  transition-colors
                  duration-300
                  hover:text-primary
                  xl:text-[11px]
                "
              >
                {link.label}

                <span className="absolute -bottom-0.5 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-primary/80 transition-all duration-500 ease-out group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            <ThemeToggle />

            {/* Search */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);

                if (!searchOpen) {
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 100);
                }
              }}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-foreground/50
                transition-all
                duration-300
                hover:bg-primary/5
                hover:text-primary
              "
              aria-label="Search"
            >
              <Search size={17} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="
                relative
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-foreground/50
                transition-all
                duration-300
                hover:bg-primary/5
                hover:text-primary
                sm:flex
              "
              aria-label="Wishlist"
            >
              <Heart size={17} strokeWidth={1.5} />

              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="
                relative
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-foreground/50
                transition-all
                duration-300
                hover:bg-primary/5
                hover:text-primary
              "
              aria-label="Cart"
            >
              <ShoppingBag
                size={17}
                strokeWidth={1.5}
              />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="
                  hidden
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-foreground/50
                  transition-all
                  duration-300
                  hover:bg-primary/5
                  hover:text-primary
                  sm:flex
                "
                aria-label="Profile"
                title={
                  authUser
                    ? `${authUser.first_name} ${authUser.last_name}`
                    : "Profile"
                }
              >
                <User size={17} strokeWidth={1.5} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="
                  hidden
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-foreground/50
                  transition-all
                  duration-300
                  hover:bg-primary/5
                  hover:text-primary
                  sm:flex
                "
                aria-label="Sign In"
              >
                <User size={17} strokeWidth={1.5} />
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-foreground/60
                transition-all
                duration-300
                hover:bg-primary/5
                hover:text-primary
                lg:hidden
              "
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Search Dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.35,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="overflow-hidden border-t border-border/20"
            >
              <div className="section-padding relative py-3 sm:py-4">
                <form
                  onSubmit={handleSearchSubmit}
                  role="search"
                  aria-label="Search fragrances"
                >
                  <input
                    ref={inputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    placeholder="Search fragrances by name, notes, or collection..."
                    className="
                      w-full
                      bg-transparent
                      py-2
                      font-body
                      text-sm
                      font-light
                      tracking-wide
                      text-foreground
                      outline-none
                      placeholder:text-muted-foreground
                      sm:text-base
                    "
                  />
                </form>

                {suggestions.length > 0 && (
                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      top-full
                      z-50
                      max-h-[70vh]
                      overflow-y-auto
                      border-b
                      border-border/30
                      bg-background/95
                      shadow-2xl
                      backdrop-blur-xl
                    "
                  >
                    <div className="section-padding space-y-1 py-3">
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          onClick={() =>
                            handleSuggestionClick(
                              product.id
                            )
                          }
                          className="
                            group
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-2
                            py-2.5
                            text-left
                            transition-colors
                            hover:bg-card
                            sm:px-3
                          "
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="
                              h-10
                              w-10
                              shrink-0
                              rounded-lg
                              object-cover
                              sm:h-11
                              sm:w-11
                            "
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-sm tracking-wider text-foreground transition-colors group-hover:text-primary">
                              {product.name}
                            </p>

                            <p className="truncate text-[10px] text-muted-foreground">
                              {product.collection} ·{" "}
                              {product.notes.top}
                            </p>
                          </div>

                          <span className="whitespace-nowrap font-display text-xs text-primary">
                            KES{" "}
                            {product.price.toLocaleString()}
                          </span>
                        </button>
                      ))}

                      {searchQuery.trim() && (
                        <button
                          onClick={
                            handleSearchSubmit as any
                          }
                          className="
                            w-full
                            py-2
                            text-center
                            text-xs
                            uppercase
                            tracking-wider
                            text-primary
                            transition-colors
                            hover:text-primary/80
                          "
                        >
                          View all results for "
                          {searchQuery}"
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="
              fixed
              inset-0
              z-[60]
              flex
              flex-col
              items-center
              justify-center
              gap-8
              overflow-y-auto
              bg-background/95
              px-6
              py-20
              backdrop-blur-2xl
            "
          >
            <button
              className="
                absolute
                right-6
                top-6
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-foreground/60
                transition-all
                duration-300
                hover:bg-primary/5
                hover:text-primary
              "
              onClick={() => setMobileOpen(false)}
            >
              <X size={24} strokeWidth={1.5} />
            </button>

            {navLinks.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: i * 0.08 + 0.1,
                  duration: 0.4,
                }}
              >
                <Link
                  to={link.to}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="
                    font-display
                    text-2xl
                    tracking-[0.12em]
                    text-foreground/70
                    transition-colors
                    duration-300
                    hover:text-primary
                    sm:text-3xl
                  "
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-col items-center gap-6"
            >
              <div className="flex items-center gap-8 text-foreground/40">
                <Link
                  to="/wishlist"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="transition-colors hover:text-primary"
                >
                  <Heart
                    size={20}
                    strokeWidth={1.5}
                  />
                </Link>
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col items-center gap-4">
                  <Link
                    to="/profile"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="
                      font-display
                      text-lg
                      tracking-[0.15em]
                      text-primary
                      transition-colors
                      hover:text-primary/80
                    "
                  >
                    My Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="
                      font-body
                      text-sm
                      uppercase
                      tracking-[0.15em]
                      text-foreground/50
                      transition-colors
                      hover:text-primary
                    "
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="
                    font-display
                    text-lg
                    tracking-[0.15em]
                    text-primary
                    transition-colors
                    hover:text-primary/80
                  "
                >
                  Sign In
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;