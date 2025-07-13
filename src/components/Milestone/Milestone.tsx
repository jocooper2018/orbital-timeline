import type { Milestone as MilestoneT } from "../../types/Data";
import "./Milestone.css";

interface MilestoneProps {
  readonly data: MilestoneT;
  readonly earliestDate: Date;
  readonly scale: number;
  readonly ref: React.Ref<HTMLDivElement | null>;
}

const Milestone: React.FC<MilestoneProps> = (props: MilestoneProps) => {
  return (
    <div
      ref={props.ref}
      className="milestone"
      style={{
        left: `${
          (new Date(props.data.date).getTime() - props.earliestDate.getTime()) /
          props.scale
        }px`,
      }}
      title={props.data.name}
    >
      {/* {props.data.name} */}
    </div>
  );
};

export default Milestone;
