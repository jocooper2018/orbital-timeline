import { useEffect, useRef, useState } from "react";

type Edge = "top" | "bottom" | "left" | "right";

interface ProximityResult<T extends HTMLElement> {
  isNearEdge: boolean;
  nearEdges: Edge[];
  ref: React.RefObject<T | null>;
}

export function useProximityToEdge<T extends HTMLElement>(
  thresholdRem: number,
  deps: React.DependencyList,
  scrollableParentRef?: React.RefObject<HTMLElement | null>
): ProximityResult<T> {
  const ref = useRef<T>(null);
  const [isNearEdge, setIsNearEdge] = useState<boolean>(false);
  const [nearEdges, setNearEdges] = useState<Edge[]>([]);

  useEffect(() => {
    function checkProximity() {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const thresholdPx =
        thresholdRem *
        parseFloat(getComputedStyle(document.documentElement).fontSize);

      const edges: Edge[] = [];

      if (rect.top < thresholdPx) edges.push("top");
      if (window.innerHeight - rect.bottom < thresholdPx) edges.push("bottom");
      if (rect.left < thresholdPx) edges.push("left");
      if (window.innerWidth - rect.right < thresholdPx) edges.push("right");

      setIsNearEdge(edges.length > 0);
      setNearEdges(edges);
    }

    checkProximity();

    if (scrollableParentRef?.current) {
      scrollableParentRef.current.addEventListener("scroll", checkProximity);
      scrollableParentRef.current.addEventListener("resize", checkProximity);
    } else {
      window.addEventListener("scroll", checkProximity);
      window.addEventListener("resize", checkProximity);
    }

    return () => {
      if (scrollableParentRef?.current) {
        scrollableParentRef.current.addEventListener("scroll", checkProximity);
        scrollableParentRef.current.addEventListener("resize", checkProximity);
      } else {
        window.removeEventListener("scroll", checkProximity);
        window.removeEventListener("resize", checkProximity);
      }
    };
  }, [thresholdRem, ...deps]);

  return { isNearEdge, nearEdges, ref };
}
