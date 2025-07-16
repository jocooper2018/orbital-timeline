import "./MilestoneGroup.css";
import { useEffect, useState } from "react";
import type { Milestone as MilestoneT } from "../../types/Data";
import { useProximityToEdge } from "../../hooks/useProximityToEdge";

interface MilestoneProps {
  readonly data: MilestoneT[];
  readonly earliestDate: Date;
  readonly scale: number;
  readonly scrollableParentRef: React.RefObject<HTMLElement | null>;
}

const MilestoneGroup: React.FC<MilestoneProps> = (props: MilestoneProps) => {
  const [earliestMilestone, setEarliestMilestone] = useState<MilestoneT | null>(
    null
  );
  const [latestMilestone, setLatestMilestone] = useState<MilestoneT | null>(
    null
  );

  const { nearEdges, ref } = useProximityToEdge<HTMLDivElement>(
    5,
    [props.scale],
    props.scrollableParentRef
  );

  useEffect(() => {
    if (!props.data || props.data.length < 2) {
      setEarliestMilestone(null);
      setLatestMilestone(null);
      console.error("No milestone");
      return;
    }
    let earliest: MilestoneT = props.data[0];
    let latest: MilestoneT = props.data[0];
    for (let i = 1; i < props.data.length; i++) {
      if (new Date(props.data[i].date) < new Date(earliest.date)) {
        earliest = props.data[i];
      }
      if (new Date(props.data[i].date) > new Date(latest.date)) {
        latest = props.data[i];
      }
    }
    setEarliestMilestone(earliest);
    setLatestMilestone(latest);
  }, [props.data]);

  if (!earliestMilestone || !latestMilestone) {
    return <div className="milestone-group" />;
  }

  return (
    <>
      <div
        ref={ref}
        className={`milestone-group${
          nearEdges.includes("left")
            ? " near-left-edge"
            : nearEdges.includes("right")
            ? " near-right-edge"
            : ""
        }`}
        style={{
          left: `calc(${
            (new Date(earliestMilestone.date).getTime() -
              props.earliestDate.getTime()) /
            props.scale
          }px - (var(--milestone-marker-size) / 4))`,
          width: `calc(${
            (new Date(latestMilestone.date).getTime() -
              new Date(earliestMilestone.date).getTime()) /
            props.scale
          }px + (var(--milestone-marker-size) / 2))`,
        }}
      />
      <div
        className="milestone-list"
        style={{
          left: `calc(${
            (new Date(earliestMilestone.date).getTime() -
              props.earliestDate.getTime()) /
            props.scale
          }px - (var(--milestone-marker-size) / 4))`,
        }}
      >
        <ul>
          {props.data.map((milestone) => (
            <li>{milestone.name}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default MilestoneGroup;
