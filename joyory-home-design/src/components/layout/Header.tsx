import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Heart,
  UserRound,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Scan,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  bagCount?: number;
  onOpenSkinAnalyzer?: () => void;
}

export function Header({ bagCount = 0, onOpenSkinAnalyzer }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md transition-all duration-200">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center gap-4 px-5 md:px-10">
        <Button
          size="icon"
          variant="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>

        <Link to="/" className="mr-auto flex items-center gap-2 group">
          <span className="font-serif text-2xl md:text-3xl font-bold tracking-[0.22em] text-foreground uppercase transition-opacity group-hover:opacity-80">
            Joyory
          </span>
        </Link>

        <label className="hidden h-11 max-w-md flex-1 items-center gap-2 rounded-xl border border-input bg-muted/20 px-3.5 transition-colors focus-within:border-primary/50 md:flex">
          <Search size={18} className="text-muted-foreground" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            placeholder="Search products, brands, clinical skincare..."
          />
        </label>

        <Button size="icon" variant="icon" aria-label="Wishlist" className="relative hover:text-red-500 transition-colors">
          <Heart size={20} />
        </Button>

        <Button size="icon" variant="icon" aria-label="Account" className="hover:text-primary transition-colors">
          <UserRound size={20} />
        </Button>

        <Button size="icon" variant="icon" className="relative hover:text-primary transition-all duration-200" aria-label="Shopping bag">
          <ShoppingBag size={20} />
          {bagCount > 0 && (
            <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground shadow-xs animate-in zoom-in-75">
              {bagCount}
            </span>
          )}
        </Button>
      </div>

      {/* Nav Menu */}
      <nav
        className={`${
          menuOpen ? "flex" : "hidden"
        } flex-col border-t border-border px-5 py-3 md:flex md:h-12 md:flex-row md:items-center md:justify-center md:gap-32 md:border-0 md:p-0`}
      >
        <Link to="/" className="py-2 text-sm font-medium hover:text-primary transition-colors">
          Home
        </Link>
        <a className="py-2 text-sm font-medium hover:text-primary transition-colors" href="/#brands">
          Brands
        </a>
        <a className="py-2 text-sm font-medium hover:text-primary transition-colors" href="/#offers">
          Offers
        </a>

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
                      Dual-engine neural scan (ONNX + Gemini 2.5) for blemish, pores & custom regimen
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>

              {/* Virtual Try-On Option */}
              <DropdownMenuItem asChild>
                <a
                  href="/#features"
                  className="flex items-start gap-3 p-3 cursor-pointer rounded-lg hover:bg-accent transition-colors"
                >
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
          <Link
            to="/optimize-skin"
            className="py-2 text-left flex items-center gap-2 text-primary font-medium cursor-pointer"
            onClick={() => setMenuOpen(false)}
          >
            <Scan size={15} /> Optimize Skin
          </Link>
          <a className="py-2 flex items-center gap-2 text-sm" href="/#features" onClick={() => setMenuOpen(false)}>
            <Camera size={15} /> Virtual Try-On
          </a>
        </div>

        <a className="py-2 text-sm font-medium hover:text-primary transition-colors" href="/#about">
          About us
        </a>
      </nav>
    </header>
  );
}
