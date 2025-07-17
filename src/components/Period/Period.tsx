import "./Period.css";
import { useEffect, useRef, useState } from "react";
import type {
  Milestone as MilestoneT,
  Period as PeriodT,
} from "../../types/Data";
import Milestone from "../Milestone/Milestone";
import { getCssVariableValue, remToPx } from "../../utils/utils";
import MilestoneGroup from "../MilestoneGroup/MilestoneGroup";

interface PeriodProps {
  readonly data: PeriodT;
  readonly earliestDate: Date;
  readonly latestDate: Date;
  readonly scale: number;
  readonly level: number;
  readonly scrollableParentRef: React.RefObject<HTMLElement | null>;
}

const Period: React.FC<PeriodProps> = (props: PeriodProps) => {
  const [milestones, setMilestones] = useState<React.ReactElement[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const milestonesTmp: React.ReactElement[] = [];
    const sortedMilestones: MilestoneT[] = [...props.data.milestones].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let j = 0;
    let milestoneGroup: MilestoneT[] = [];
    for (let i = 0; i < sortedMilestones.length; i++) {
      if (i === sortedMilestones.length - 1) {
        if (
          !milestoneGroup.find(
            (milestone) => milestone.name === sortedMilestones[i].name
          )
        ) {
          milestonesTmp.push(
            <Milestone
              key={`milestone-${sortedMilestones[i].name}`}
              data={sortedMilestones[i]}
              earliestDate={props.earliestDate}
              scale={props.scale}
              scrollableParentRef={props.scrollableParentRef}
            />
          );
          j++;
        } else {
          milestonesTmp.push(
            <MilestoneGroup
              key={`milestone-group-${i}`}
              data={[...milestoneGroup]}
              earliestDate={props.earliestDate}
              scale={props.scale}
              scrollableParentRef={props.scrollableParentRef}
            />
          );
          j++;
          milestoneGroup = [];
        }
        continue;
      }
      const distanceFromNext: number =
        (new Date(sortedMilestones[i + 1].date).getTime() -
          new Date(sortedMilestones[i].date).getTime()) /
        props.scale;
      if (
        distanceFromNext <=
        remToPx(parseFloat(getCssVariableValue("--milestone-marker-size")))
      ) {
        if (
          !milestoneGroup.find(
            (milestone) => milestone.name === sortedMilestones[i].name
          )
        ) {
          milestoneGroup.push(sortedMilestones[i]);
        }
        milestoneGroup.push(sortedMilestones[i + 1]);
      } else if (milestoneGroup.length === 0) {
        milestonesTmp.push(
          <Milestone
            key={`milestone-${sortedMilestones[i].name}`}
            data={sortedMilestones[i]}
            earliestDate={props.earliestDate}
            scale={props.scale}
            scrollableParentRef={props.scrollableParentRef}
          />
        );
        j++;
      } else {
        milestonesTmp.push(
          <MilestoneGroup
            key={`milestone-group-${i}`}
            data={[...milestoneGroup]}
            earliestDate={props.earliestDate}
            scale={props.scale}
            scrollableParentRef={props.scrollableParentRef}
          />
        );
        j++;
        milestoneGroup = [];
      }
      milestonesTmp.push(
        <div
          className="line"
          key={`milestone-line-${sortedMilestones[i].name}`}
          style={{
            left: `${
              (new Date(sortedMilestones[i].date).getTime() -
                new Date(props.earliestDate).getTime()) /
              props.scale
            }px`,
            width: `${distanceFromNext}px`,
          }}
        />
      );
    }
    setMilestones(milestonesTmp);
  }, [props.data, props.scale]);

  return (
    <div
      className="period"
      ref={containerRef}
      style={{
        width: `${
          props.latestDate &&
          props.earliestDate &&
          (props.latestDate.getTime() - props.earliestDate.getTime()) /
            props.scale
        }px`,
        top: `calc(var(--milestone-marker-size) * ${props.level} + 5rem)`,
      }}
    >
      {milestones}
    </div>
  );
};

export default Period;
