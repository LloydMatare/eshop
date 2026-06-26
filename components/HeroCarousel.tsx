"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type HeroBanner = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

export default function HeroCarousel({
  banners,
  autoplayDelay = 5000,
}: {
  banners: HeroBanner[];
  autoplayDelay?: number;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Keep the dot indicators in sync with the active slide.
  useEffect(() => {
    if (!api) return;

    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  // Autoplay: advance on an interval, pausing on hover/focus. The interval is
  // reset whenever the active slide changes so each slide gets a full delay.
  useEffect(() => {
    if (!api || isPaused || banners.length <= 1) return;

    const id = setInterval(() => api.scrollNext(), autoplayDelay);
    return () => clearInterval(id);
  }, [api, isPaused, autoplayDelay, banners.length, selectedIndex]);

  const scrollTo = useCallback(
    (index: number) => api?.scrollTo(index),
    [api]
  );

  if (banners.length === 0) return null;

  return (
    <Carousel
      className="w-full"
      opts={{ loop: true }}
      setApi={setApi}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <CarouselContent className="ml-0">
        {banners.map((banner) => (
          <CarouselItem key={banner.id} className="pl-0">
            <Link
              href={`/banner/${banner.id}`}
              className="group relative block h-[500px] w-full overflow-hidden lg:h-[600px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image}
                alt={banner.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent">
                <div className="container mx-auto flex h-full items-center px-4">
                  <div className="max-w-2xl text-white drop-shadow-lg">
                    <div className="mb-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg">
                      🔥 Featured Product
                    </div>
                    <h1 className="mb-4 text-5xl leading-tight font-bold drop-shadow-2xl lg:text-6xl">
                      {banner.name}
                    </h1>
                    <p className="mb-6 text-xl text-white/90 drop-shadow-md">
                      Premium IT solutions for modern businesses
                    </p>
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-2xl transition-transform group-hover:scale-105">
                      Shop Now
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {banners.length > 1 && (
        <>
          <CarouselPrevious
            variant="default"
            className="left-4 z-20 size-11 shadow-xl [&_svg]:size-5"
          />
          <CarouselNext
            variant="default"
            className="right-4 z-20 size-11 shadow-xl [&_svg]:size-5"
          />

          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selectedIndex}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === selectedIndex
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-white/60 hover:bg-white"
                )}
              />
            ))}
          </div>
        </>
      )}
    </Carousel>
  );
}
