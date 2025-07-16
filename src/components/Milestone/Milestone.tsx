import "./Milestone.css";
import type { Milestone as MilestoneT } from "../../types/Data";
import { useProximityToEdge } from "../../hooks/useProximityToEdge";

interface MilestoneProps {
  readonly data: MilestoneT;
  readonly earliestDate: Date;
  readonly scale: number;
  readonly scrollableParentRef: React.RefObject<HTMLElement | null>;
}

const Milestone: React.FC<MilestoneProps> = (props: MilestoneProps) => {
  const { nearEdges, ref } = useProximityToEdge<HTMLDivElement>(
    5,
    [props.scale],
    props.scrollableParentRef
  );

  return (
    <>
      <div
        ref={ref}
        className={`milestone${
          nearEdges.includes("left")
            ? " near-left-edge"
            : nearEdges.includes("right")
            ? " near-right-edge"
            : ""
        }`}
        style={{
          left: `${
            (new Date(props.data.date).getTime() -
              props.earliestDate.getTime()) /
            props.scale
          }px`,
        }}
      />
      <div
        className="name-popup"
        style={{
          left: `${
            (new Date(props.data.date).getTime() -
              props.earliestDate.getTime()) /
            props.scale
          }px`,
        }}
      >
        {props.data.name}
      </div>
    </>
  );
};

export default Milestone;
