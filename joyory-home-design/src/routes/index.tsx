import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, BadgeCheck, Heart, Menu, Search, ShoppingBag, Truck, UserRound, X, ChevronDown, Camera, Scan, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkinAnalyzer } from "@/components/SkinAnalyzer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


import logo from "@/assets/joyory/logo.png.asset.json";
import catMakeup from "@/assets/joyory/cat-makeup.png.asset.json";
import catSkin from "@/assets/joyory/cat-skin.png.asset.json";
import catBody from "@/assets/joyory/cat-body.png.asset.json";
import catFragrance from "@/assets/joyory/cat-fragrance.png.asset.json";
import offerAqua from "@/assets/joyory/offer-aqua.png.asset.json";
import offerConscious from "@/assets/joyory/offer-conscious.png.asset.json";
import offerDotkey from "@/assets/joyory/offer-dotkey.png.asset.json";
import offerGabit from "@/assets/joyory/offer-gabit.png.asset.json";
import offerPilgrim from "@/assets/joyory/offer-pilgrim.png.asset.json";
import offerSheth from "@/assets/joyory/offer-sheth.png.asset.json";
import offerDerma from "@/assets/joyory/offer-derma.png.asset.json";
import tryon from "@/assets/joyory/tryon.png.asset.json";
import niacinamide from "@/assets/joyory/product-niacinamide.png.asset.json";
import spots from "@/assets/joyory/product-spots.png.asset.json";
import lip from "@/assets/joyory/product-lip.png.asset.json";
import vitc from "@/assets/joyory/product-vitc.png.asset.json";
import retinol from "@/assets/joyory/product-retinol.png.asset.json";
import mist from "@/assets/joyory/product-mist.png.asset.json";
import plum from "@/assets/joyory/product-plum.png.asset.json";
import gel from "@/assets/joyory/product-gel.png.asset.json";
import toner from "@/assets/joyory/product-toner.png.asset.json";
import shade from "@/assets/joyory/shade.png.asset.json";
import acne from "@/assets/joyory/skin-acne.png.asset.json";
import dry from "@/assets/joyory/skin-dry.png.asset.json";
import sensitive from "@/assets/joyory/skin-sensitive.png.asset.json";
import help from "@/assets/joyory/help.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Joyory - India's Premium Beauty & Cosmetics Store" },
    { name: "description", content: "Discover makeup, skincare, bath, body and fragrance favorites at Joyory." },
    { property: "og:title", content: "Joyory - India's Premium Beauty & Cosmetics Store" },
    { property: "og:description", content: "Discover makeup, skincare, bath, body and fragrance favorites at Joyory." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: HomePage,
});

const categories = [
  { name: "Makeup", image: catMakeup.url }, { name: "Skin", image: catSkin.url },
  { name: "Bath & Body", image: catBody.url }, { name: "Fragrances", image: catFragrance.url },
];
const offers = [
  offerAqua.url,
  offerConscious.url,
  offerDotkey.url,
  offerGabit.url,
  offerPilgrim.url,
  offerSheth.url,
  offerDerma.url,
];
const recommended = [
  { image: niacinamide.url, brand: "Foxtale", name: "5% Niacinamide Brightening Serum - 30 ML", price: 463, old: 545 },
  { image: spots.url, brand: "Foxtale", name: "Rapid Spot Reduction Drops - 30 ML", price: 506, old: 595 },
  { image: lip.url, brand: "Foxtale", name: "Lip Sleeping Mask with Maracuja Oil - 12 G", price: 378, old: 445 },
  { image: vitc.url, brand: "Foxtale", name: "Vitamin C Serum - 30 ML", price: 548, old: 645 },
  { image: retinol.url, brand: "Foxtale", name: "0.15% Retinol Night Serum - 30 ML", price: 509, old: 599 },
];
const bestsellers = [
  { image: mist.url, brand: "Aqualogica", name: "Refresh+ Dewy Floral Kiss Perfume Body Mist - 150 ML", price: 424, old: 499 },
  { image: plum.url, brand: "Plum", name: "Green Tea Oil-Free Moisturizer For Oily Skin - 50 ML", price: 413, old: 470 },
  { image: gel.url, brand: "Plum", name: "Green Tea Renewed Clarity Night Gel - 50 ML", price: 506, old: 575 },
  { image: toner.url, brand: "Plum", name: "Green Tea Pore Tightening Face Toner - 200 ML", price: 369, old: 420 },
];

function ProductRow({ 
  title, 
  products, 
  onAdd,
  wishlist = new Set<string>(),
  toggleWishlist = () => {}
}: { 
  title: string; 
  products: typeof recommended; 
  onAdd: () => void;
  wishlist?: Set<string>;
  toggleWishlist?: (name: string) => void;
}) {
  const row = useRef<HTMLDivElement>(null);
  const slide = (direction: number) => row.current?.scrollBy({ left: direction * 560, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-10 md:py-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">Clinically tested & curated for visible results</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <Button aria-label="Previous products" size="icon" variant="outline" className="rounded-full size-9 hover:border-primary/50 transition-colors" onClick={() => slide(-1)}>
            <ArrowLeft size={16} />
          </Button>
          <Button aria-label="Next products" size="icon" variant="outline" className="rounded-full size-9 hover:border-primary/50 transition-colors" onClick={() => slide(1)}>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
      <div ref={row} className="scrollbar-none flex snap-x gap-4 overflow-x-auto pb-4 md:gap-6">
        {products.map((product) => {
          const isWishlisted = Boolean(wishlist?.has(product.name));
          return (
            <article 
              key={product.name} 
              className="w-[70vw] max-w-[280px] shrink-0 snap-start rounded-2xl border border-border bg-card p-3.5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md gpu-accelerated group flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/30 p-4 flex items-center justify-center">
                <img 
                  className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105" 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy"
                />
                <button 
                  aria-label="Toggle wishlist" 
                  onClick={() => toggleWishlist(product.name)}
                  className={`absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-background/90 backdrop-blur-xs shadow-xs transition-transform duration-200 active:scale-90 ${
                    isWishlisted ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart size={16} className={isWishlisted ? "fill-red-500" : ""} />
                </button>
                <div className="absolute left-2.5 top-2.5 rounded-full bg-secondary/90 px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground shadow-xs">
                  15% OFF
                </div>
              </div>
              <div className="pt-4 flex flex-col justify-between flex-1">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
                  <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-medium leading-snug">{product.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-base font-semibold">₹{product.price}</span>
                    <span className="text-xs text-muted-foreground line-through">₹{product.old}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Get {Math.round(product.price / 10) * 10} Joy Points
                  </p>
                </div>
                <Button 
                  className="mt-4 w-full gap-2 rounded-xl transition-transform duration-150 active:scale-[0.98]" 
                  onClick={onAdd}
                >
                  Add to Bag <ShoppingBag size={15}/>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const [bagBounce, setBagBounce] = useState(false);
  const [skinAnalyzerOpen, setSkinAnalyzerOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const total = document.documentElement.scrollHeight - window.innerHeight;
          if (total > 0) {
            setScrollProgress(Math.min(1, Math.max(0, window.scrollY / total)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToBag = () => {
    setBagCount((c) => c + 1);
    setBagBounce(true);
    setTimeout(() => setBagBounce(false), 300);
  };

  const toggleWishlist = (name: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/20 selection:text-primary">
      {/* ⚡ Smooth Scroll Progress Bar at top (Cheat Code #2 & #3) */}
      <div 
        className="fixed top-0 left-0 right-0 h-[2.5px] z-[70] bg-gradient-to-r from-primary via-secondary to-primary pointer-events-none origin-left gpu-accelerated" 
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md transition-all duration-200">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center gap-4 px-5 md:px-10">
          <Button size="icon" variant="icon" className="md:hidden" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X/> : <Menu/>}
          </Button>
          <a href="#top" className="mr-auto flex items-center gap-2 group">
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-[0.22em] text-foreground uppercase transition-opacity group-hover:opacity-80">
              Joyory
            </span>
          </a>
          <label className="hidden h-11 max-w-md flex-1 items-center gap-2 rounded-xl border border-input bg-muted/20 px-3.5 transition-colors focus-within:border-primary/50 md:flex">
            <Search size={18} className="text-muted-foreground" />
            <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70" placeholder="Search products, brands, categories..." />
          </label>
          <Button size="icon" variant="icon" aria-label="Wishlist" className="relative hover:text-red-500 transition-colors">
            <Heart size={20} className={wishlist.size > 0 ? "fill-red-500 text-red-500" : ""} />
            {wishlist.size > 0 && (
              <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-in zoom-in-50">
                {wishlist.size}
              </span>
            )}
          </Button>
          <Button size="icon" variant="icon" aria-label="Account" className="hover:text-primary transition-colors">
            <UserRound size={20} />
          </Button>
          <Button 
            size="icon" 
            variant="icon" 
            className={`relative hover:text-primary transition-all duration-200 ${bagBounce ? "scale-125" : "scale-100"}`} 
            aria-label="Shopping bag"
          >
            <ShoppingBag size={20} />
            {bagCount > 0 && (
              <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground shadow-xs animate-in zoom-in-75">
                {bagCount}
              </span>
            )}
          </Button>
        </div>
        <nav className={`${menuOpen ? "flex" : "hidden"} flex-col border-t border-border px-5 py-3 md:flex md:h-12 md:flex-row md:items-center md:justify-center md:gap-32 md:border-0 md:p-0`}>
          <a className="py-2 text-sm font-medium hover:text-primary transition-colors" href="#brands">Brands</a>
          <a className="py-2 text-sm font-medium hover:text-primary transition-colors" href="#offers">Offers</a>
          {/* AI Beauty Features Dropdown in Navbar */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer outline-none">
                <span>AI Beauty Features</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-80 p-2 shadow-xl border-border bg-popover z-50 rounded-xl"
              >
                {/* Optimize Skin Option Button */}
                <DropdownMenuItem asChild>
                  <Link
                    to="/optimize-skin"
                    className="flex items-start gap-3 p-3 cursor-pointer rounded-lg focus:bg-accent focus:text-accent-foreground transition-colors"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                      <Scan size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Optimize Skin</span>
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary-foreground">
                          Live AI
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                        Upload photo for clinical skin analysis, pore mapping & custom routine
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                {/* Virtual Try-On Option */}
                <DropdownMenuItem asChild>
                  <a href="#features" className="flex items-start gap-3 p-3 cursor-pointer rounded-lg hover:bg-accent transition-colors">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Camera size={18} />
                    </div>
                    <div>
                      <span className="font-semibold text-sm">Virtual Try-On</span>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                        Real-time lip shade, blush & foundation simulation
                      </p>
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Mobile menu fallback for features */}
          <div className="md:hidden flex flex-col gap-1 py-1">
            <Link to="/optimize-skin" className="py-2 text-left flex items-center gap-2 text-primary font-medium cursor-pointer">
              <Scan size={15}/> Optimize Skin
            </Link>
            <a className="py-2 flex items-center gap-2 text-sm" href="#features">
              <Camera size={15}/> Virtual Try-On
            </a>
          </div>
          <a className="py-2 text-sm font-medium hover:text-primary transition-colors" href="#about">About us</a>
        </nav>
      </header>

      {/* Marquee Banner with Pause on Hover */}
      <div className="overflow-hidden bg-secondary py-2 text-xs font-medium text-secondary-foreground group">
        <div className="flex min-w-max animate-[marquee_25s_linear_infinite] group-hover:[animation-play-state:paused] gap-24 px-8 gpu-accelerated">
          <span>* Upto 20% Cashback on successful payment. Added to your wallet.</span>
          <span>* 100% Authentic Products Sourced Directly From Brands</span>
          <span>* Get Joy Points equal to what you spend on this order.</span>
          <span>* Free Shipping On All Orders Above ₹499</span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section id="top" className="relative overflow-hidden bg-accent">
        <img 
          src={logo.url} 
          alt="Joyory - India's Premium Beauty & Cosmetics Store" 
          className="mx-auto max-h-[520px] w-full max-w-[1600px] object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.01]" 
        />
      </section>

      {/* Top Categories */}
      <section id="brands" className="mx-auto max-w-[1440px] px-5 py-10 md:px-10 md:py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">Top Categories</h2>
            <p className="mt-1 text-xs text-muted-foreground">Explore essentials by department</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {categories.map((category) => (
            <a href="#recommended" key={category.name} className="group text-center">
              <div className="aspect-square overflow-hidden rounded-full bg-muted shadow-xs ring-2 ring-primary/0 ring-offset-4 transition-all duration-300 group-hover:ring-primary/20 group-hover:scale-105">
                <img className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" src={category.image} alt={category.name} loading="lazy" />
              </div>
              <h3 className="mt-3 text-sm font-medium tracking-wide transition-colors group-hover:text-primary">{category.name}</h3>
            </a>
          ))}
        </div>
      </section>

      {/* Offers Carousel */}
      <section id="offers" className="bg-muted/40 py-10 md:py-16 border-y border-border/40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="mb-6 flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-medium tracking-tight md:text-3xl">Exclusive Offers</h2>
              <p className="mt-1 text-xs text-muted-foreground">Special deals curated for your skincare journey</p>
            </div>
          </div>
          <div className="scrollbar-none flex snap-x gap-4 overflow-x-auto pb-4">
            {offers.map((image, index) => (
              <div key={image} className="w-[85vw] max-w-xl shrink-0 snap-start overflow-hidden rounded-2xl shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gpu-accelerated group">
                <img
                  src={image}
                  alt={`Beauty offer ${index + 1}`}
                  className="aspect-[147/61] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Beauty Features Banner */}
      <section id="features" className="mx-auto max-w-[1440px] px-5 pt-10 md:px-10 md:pt-16">
        <div className="overflow-hidden rounded-3xl shadow-sm transition-all duration-500 hover:shadow-md">
          <img src={tryon.url} alt="Try beauty products virtually" className="aspect-[3/1] w-full object-cover transition-transform duration-700 hover:scale-[1.01]" loading="lazy" />
        </div>
      </section>

      {/* Recommended Products */}
      <div id="recommended">
        <ProductRow 
          title="Recommended For You" 
          products={recommended} 
          onAdd={handleAddToBag}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
        />
      </div>

      {/* Shade Finder Banner */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="overflow-hidden rounded-3xl shadow-sm transition-all duration-500 hover:shadow-md">
          <img src={shade.url} alt="Find your perfect shade" className="aspect-[3/1] w-full object-cover transition-transform duration-700 hover:scale-[1.01]" loading="lazy" />
        </div>
      </section>

      {/* Best Sellers */}
      <ProductRow 
        title="Best Sellers" 
        products={bestsellers} 
        onAdd={handleAddToBag}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />

      {/* Shop By Skin Types */}
      <section className="bg-muted/40 py-10 md:py-16 border-y border-border/40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="mb-7">
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">Shop By Skin Type</h2>
            <p className="mt-1 text-xs text-muted-foreground">Targeted formulas designed specifically for your skin's unique needs</p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-7">
            {[[acne,"Acne Prone Skin"],[dry,"Dry Skin"],[sensitive,"Sensitive Skin"]].map(([image,name]) => (
              <div key={name as string} className="group relative overflow-hidden rounded-2xl shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gpu-accelerated">
                <img
                  src={(image as typeof acne).url}
                  alt={name as string}
                  className="aspect-[568/400] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-xs md:text-sm font-semibold tracking-wide drop-shadow-sm">{name as string}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Banner */}
      <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-10 md:py-16">
        <div className="overflow-hidden rounded-3xl shadow-sm transition-all duration-500 hover:shadow-md">
          <img src={help.url} alt="Not sure where to start? Let us help" className="aspect-[3/1] w-full object-cover transition-transform duration-700 hover:scale-[1.01]" loading="lazy" />
        </div>
      </section>

      {/* About Pillars Grid */}
      <section id="about" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-5 md:grid-cols-4 md:px-10">
          {[
            [BadgeCheck, "100% Authentic", "Directly sourced from verified brands"],
            [Truck, "Free Shipping", "On all orders above ₹499 across India"],
            [UserRound, "Beauty Advisors", "Get clinical & custom consultations"],
            [ArrowRight, "Easy Returns", "Hassle-free 7-day pick-ups and refunds"]
          ].map(([Icon, title, text]) => { 
            const FeatureIcon = Icon as typeof BadgeCheck; 
            return (
              <div key={title as string} className="border-border p-6 md:border-r md:p-8 last:border-r-0 transition-colors hover:bg-muted/20">
                <FeatureIcon className="mb-3 text-primary" size={22} />
                <h3 className="font-semibold text-sm">{title as string}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground px-5 py-12 text-background md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-4">
          <div>
            <span className="font-serif text-3xl font-bold tracking-[0.25em] text-background uppercase">Joyory</span>
            <p className="mt-3 max-w-xs text-xs opacity-70 leading-relaxed">Your premium destination for authentic beauty, clinical skincare and luxury fragrance favorites.</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Shop</h3>
            <p className="mt-3 text-xs opacity-70 leading-loose">Makeup<br/>Skincare<br/>Bath & Body<br/>Fragrances</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Support</h3>
            <p className="mt-3 text-xs opacity-70 leading-loose">Contact Us<br/>Track Order<br/>Shipping & Returns<br/>Privacy & Terms</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Stay In Touch</h3>
            <p className="mt-2 text-xs opacity-70">Subscribe for early access to product launches.</p>
            <div className="mt-3 flex">
              <input aria-label="Email address" placeholder="Your email address" className="min-w-0 flex-1 rounded-l-md bg-background px-3 py-2 text-xs text-foreground outline-none" />
              <Button className="rounded-l-none text-xs">Join</Button>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-[1440px] border-t border-background/20 pt-6 text-[11px] opacity-60 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Joyory. All rights reserved.</span>
          <span>Designed with high-performance standards.</span>
        </p>
      </footer>

      {/* ⚡ Smooth Floating Back-to-Top Button */}
      {scrollProgress > 0.12 && (
        <button
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 grid size-10 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary/50 active:scale-95 animate-in fade-in zoom-in-75 gpu-accelerated"
        >
          <ArrowUp size={17} />
        </button>
      )}

      {/* Skin Diagnostic Modal */}
      <SkinAnalyzer open={skinAnalyzerOpen} onClose={() => setSkinAnalyzerOpen(false)} />
    </main>
  );
}