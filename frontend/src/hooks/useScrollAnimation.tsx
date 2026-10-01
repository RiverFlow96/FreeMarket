import { useIntersectionObserver } from "./useScrollAnimation.ts";

export function ScrollFade({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`scroll-fade-in ${isVisible ? "visible" : ""}`}
      style={{ transitionDelay: delay ? `${delay * 0.1}s` : "0s" }}
    >
      {children}
    </div>
  );
}

export function ScrollFadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`scroll-fade-in ${isVisible ? "visible" : ""}`}
      style={{ transitionDelay: delay ? `${delay * 0.1}s` : "0s" }}
    >
      {children}
    </div>
  );
}
