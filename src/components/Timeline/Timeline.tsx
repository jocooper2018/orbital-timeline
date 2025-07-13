import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import "./Timeline.css";
import type {
  Data,
  Milestone as MilestoneT,
  Period as PeriodT,
} from "../../types/Data";
import Period from "../Period/Period";
import Milestone from "../Milestone/Milestone";

const Timeline: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const [earliestDate, setEarliestDate] = useState<Date | null>(null);
  const [latestDate, setLatestDate] = useState<Date | null>(null);
  const [scale, setScale] = useState<number>(250000000); // 250000000
  const [graduations, setGraduations] = useState<React.ReactElement[]>([]);

  const api = useFetch();

  const updateGraduations = () => {
    if (earliestDate === null || latestDate === null) {
      setGraduations([]);
      return;
    }
    const graduationsTmp: React.ReactElement[] = [];
    let currentYear = earliestDate.getUTCFullYear() + 1;
    while (currentYear <= latestDate.getUTCFullYear()) {
      graduationsTmp.push(
        <div
          key={`graduation-${currentYear}`}
          style={{
            left: `${
              (new Date(`${currentYear}`).getTime() - earliestDate.getTime()) /
              scale
            }px`,
          }}
        >
          {currentYear}
        </div>
      );
      currentYear++;
    }
    setGraduations(graduationsTmp);
  };

  useEffect(() => {
    (async () => {
      setData(await api.get("/data/events.json"));
    })();
  }, []);

  useEffect(() => {
    if (!data) {
      setEarliestDate(null);
      setLatestDate(null);
      return;
    }
    console.log(data.isolatedMilestones.length)

    const allMilestones: MilestoneT[] = [
      ...data.isolatedMilestones,
      ...data.periods.flatMap((period: PeriodT) => period.milestones),
    ];
    if (allMilestones.length === 0) {
      setEarliestDate(null);
      setLatestDate(null);
      return;
    }
    let earliest = new Date(allMilestones[0].date);
    let latest = new Date(allMilestones[0].date);
    for (const milestone of allMilestones) {
      const currentDate = new Date(milestone.date);
      if (currentDate < earliest) {
        earliest = currentDate;
      }
      if (currentDate > latest) {
        latest = currentDate;
      }
    }
    setEarliestDate(earliest);
    setLatestDate(latest);
  }, [data]);

  useEffect(() => {
    updateGraduations();
  }, [scale, earliestDate, latestDate]);

  useEffect(() => {
    updateGraduations();
  }, []);

  return (
    <div className="timeline-container">
      <div
        className="timeline"
        style={{
          width: `${
            latestDate &&
            earliestDate &&
            (latestDate.getTime() - earliestDate.getTime()) / scale
          }px`,
        }}
      >
        <div>{graduations}</div>
        {!data
          ? "Chargement..."
          : earliestDate && (
              <>
                <div className="period">
                  {data.isolatedMilestones.length !== 0 &&
                    data.isolatedMilestones.map((milestone: MilestoneT) => (
                      <Milestone
                        key={`milestone-${milestone.name}`}
                        ref={null}
                        data={milestone}
                        earliestDate={earliestDate}
                        scale={scale}
                      />
                    ))}
                </div>
                {data.periods.map((period: PeriodT) => (
                  <Period
                    key={`period-${period.name}`}
                    data={period}
                    earliestDate={earliestDate}
                    scale={scale}
                  />
                ))}
              </>
            )}
      </div>
    </div>
  );
};

export default Timeline;
