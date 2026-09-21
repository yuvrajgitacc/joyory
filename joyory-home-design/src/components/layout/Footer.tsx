import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-foreground px-5 py-12 text-background md:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-4">
        <div>
          <span className="font-serif text-3xl font-bold tracking-[0.25em] text-background uppercase">
            Joyory
          </span>
          <p className="mt-3 max-w-xs text-xs opacity-70 leading-relaxed">
            Your premium destination for authentic beauty, clinical skincare and luxury fragrance favorites.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-sm">Shop</h3>
          <p className="mt-3 text-xs opacity-70 leading-loose">
            Makeup<br />
            Skincare<br />
            Bath & Body<br />
            Fragrances
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-sm">Support</h3>
          <p className="mt-3 text-xs opacity-70 leading-loose">
            Contact Us<br />
            Track Order<br />
            Shipping & Returns<br />
            Privacy & Terms
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-sm">Stay In Touch</h3>
          <p className="mt-2 text-xs opacity-70">
            Subscribe for early access to product launches and AI beauty tools.
          </p>
          <div className="mt-3 flex">
            <input
              aria-label="Email address"
              placeholder="Your email address"
              className="min-w-0 flex-1 rounded-l-md bg-background px-3 py-2 text-xs text-foreground outline-none"
            />
            <Button className="rounded-l-none text-xs">Join</Button>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-[1440px] border-t border-background/20 pt-6 text-[11px] opacity-60 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 Joyory. All rights reserved.</span>
        <span>Designed with high-performance standards & AI clinical intelligence.</span>
      </p>
    </footer>
  );
}
