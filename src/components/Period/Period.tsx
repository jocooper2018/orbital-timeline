import { useEffect, useRef, useState } from "react";
import type {
  Milestone as MilestoneT,
  Period as PeriodT,
} from "../../types/Data";
import Milestone from "../Milestone/Milestone";
import "./Period.css";

interface PeriodProps {
  readonly data: PeriodT;
  readonly earliestDate: Date;
  readonly scale: number;
}

interface Line {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

const Period: React.FC<PeriodProps> = (props: PeriodProps) => {
  const [lines, setLines] = useState<Line[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const milestonesRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const newLines: Line[] = [];
    for (let i = 0; i < milestonesRefs.current.length - 1; i++) {
      const milestone1 = milestonesRefs.current[i];
      const milestone2 = milestonesRefs.current[i + 1];
      if (milestone1 && milestone2 && containerRef.current) {
        const rect1 = milestone1.getBoundingClientRect();
        const rect2 = milestone2.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        newLines.push({
          x1: rect1.left - containerRect.left + rect1.width / 2,
          y1: rect1.top - containerRect.top + rect1.height / 2,
          x2: rect2.left - containerRect.left + rect2.width / 2,
          y2: rect2.top - containerRect.top + rect2.height / 2,
        });
      }
    }
    setLines(newLines);
  }, []);

  return (
    <div className="period" ref={containerRef}>
      <svg>
        {lines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
          />
        ))}
      </svg>
      {props.data.milestones.map((milestone: MilestoneT, index: number) => (
        <Milestone
          key={`milestone-${milestone.name}`}
          ref={(el) => {
            milestonesRefs.current[index] = el;
          }}
          data={milestone}
          earliestDate={props.earliestDate}
          scale={props.scale}
        />
      ))}
    </div>
  );
};

export default Period;
