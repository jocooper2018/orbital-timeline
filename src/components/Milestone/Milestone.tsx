import "./Milestone.css";
import type { Milestone as MilestoneT } from "../../types/Data";

interface MilestoneProps {
  readonly data: MilestoneT;
  readonly earliestDate: Date;
  readonly scale: number;
}

const Milestone: React.FC<MilestoneProps> = (props: MilestoneProps) => {
  return (
    <div
      className="milestone"
      style={{
        left: `${
          (new Date(props.data.date).getTime() - props.earliestDate.getTime()) /
          props.scale
        }px`,
      }}
      title={props.data.name}
    />
  );
};

export default Milestone;
