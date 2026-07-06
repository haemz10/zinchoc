import { HeartEyeMark } from "./HeartEyeMark";
import { formatAud, type Product } from "../../lib/types";

// A single collection piece. The whole tile is the garment: hover lifts it and
// draws the gold underline beneath "Order this piece", which leads to the order
// flow with the piece preselected. When image_key is set the tile shows the
// photo; otherwise a deliberately composed brand tile: ink-navy ground, small
// silver heart-and-eye mark, product name in Marcellus.

export function ProductTile({ product }: { product: Product }) {
  const noun = product.unit.toLowerCase().includes("box") ? "boxes" : "pieces";

  return (
    <a
      href={`/order?piece=${encodeURIComponent(product.slug)}`}
      className="group flex flex-col transition-transform duration-300 hover:-translate-y-1"
    >
      {product.image_key ? (
        <img
          src={`/img/${product.image_key}`}
          alt={`${product.name}, a Zin Choc wedding chocolate piece`}
          className="aspect-[4/5] w-full rounded-sm object-cover"
        />
      ) : (
        <div className="relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden rounded-sm bg-ink">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 38%, #B9BCC2 0%, transparent 55%)",
            }}
          />
          <HeartEyeMark variant="silver" className="h-14 w-14 opacity-90" />
          <p className="mt-6 px-6 text-center font-display text-2xl text-beige">{product.name}</p>
          <p className="mt-2 font-body text-[0.7rem] uppercase tracking-[0.25em] text-silver">
            Photograph to come
          </p>
        </div>
      )}

      <div className="mt-5">
        <h3 className="font-display text-2xl text-ink">{product.name}</h3>
        <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-ink/70">
          {product.description}
        </p>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <div>
            <span className="font-body text-sm font-medium text-ink">
              {formatAud(product.price_cents)} {product.unit}
            </span>
            <p className="mt-1 font-body text-xs uppercase tracking-[0.15em] text-ink/50">
              Minimum order {product.min_order} {noun}
            </p>
          </div>
          <span className="inline-block border-b border-transparent pb-1 font-body text-sm font-medium text-gold transition-colors duration-200 group-hover:border-gold">
            Order this piece
          </span>
        </div>
      </div>
    </a>
  );
}
