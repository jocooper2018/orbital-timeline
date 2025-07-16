import "./Timeline.css";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import type {
  Data,
  Milestone as MilestoneT,
  Period as PeriodT,
} from "../../types/Data";
import Period from "../Period/Period";
import Milestone from "../Milestone/Milestone";
import { remToPx } from "../../utils/utils";

const Timeline: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const [periodsLevels, setPeriodsLevels] = useState<
    { period: PeriodT; level: number }[]
  >([]);
  const [levelMax, setLevelMax] = useState<number>(1);
  const [earliestDate, setEarliestDate] = useState<Date | null>(null);
  const [latestDate, setLatestDate] = useState<Date | null>(null);
  const [baseScale, setBaseScale] = useState<number>(250000000);
  const [zoom, setZoom] = useState<number>(1);
  const [scale, setScale] = useState<number>(250000000);
  const [graduations, setGraduations] = useState<React.ReactElement[]>([]);

  const api = useFetch();

  const updateEarliestAndLatestDates = () => {
    if (!data) {
      console.error("no data");
      setEarliestDate(null);
      setLatestDate(null);
      return;
    }

    const allMilestones: MilestoneT[] = [
      ...data.isolatedMilestones,
      ...data.periods.flatMap((period: PeriodT) => period.milestones),
    ];
    if (allMilestones.length === 0) {
      console.error("no milestone");
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
  };

  const updatePeriodsLevels = () => {
    if (!data) {
      return;
    }

    const findPeriodStartAndEndDate = (
      period: PeriodT
    ): { start: Date; end: Date } => {
      if (period.milestones.length === 0) {
        throw new Error("No milestones");
      }
      let start: Date = new Date(period.milestones[0].date);
      let end: Date = new Date(period.milestones[0].date);
      for (const milestone of period.milestones) {
        const date = new Date(milestone.date);
        if (date.getTime() < start.getTime()) {
          start = date;
        }
        if (date.getTime() > end.getTime()) {
          end = date;
        }
      }
      return { start: start, end: end };
    };

    const getOverlappingPeriods = (period: PeriodT): PeriodT[] => {
      const result: PeriodT[] = [];
      const { start, end } = findPeriodStartAndEndDate(period);
      for (const period2 of data.periods) {
        const { start: start2, end: end2 } = findPeriodStartAndEndDate(period2);
        if (period.name === period2.name || end < start2 || end2 < start) {
          continue;
        }
        result.push(period2);
      }
      return result;
    };

    const periodsLevelsTmp: { period: PeriodT; level: number }[] = [];

    for (const period of data.periods) {
      const overlappingPeriods = getOverlappingPeriods(period);
      let level = 1;
      for (const overlappingPeriod of overlappingPeriods) {
        const overlappingPeriodLevel = periodsLevelsTmp.find(
          (_periodLevel) => _periodLevel.period.name === overlappingPeriod.name
        )?.level;
        if (overlappingPeriodLevel === level) {
          level++;
        }
      }
      periodsLevelsTmp.push({ period: period, level: level });
    }

    setPeriodsLevels(periodsLevelsTmp);
  };

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
    updateEarliestAndLatestDates();
    updatePeriodsLevels();
  }, [data]);

  useEffect(() => {
    if (!earliestDate || !latestDate) {
      return;
    }
    setBaseScale(
      (latestDate.getTime() - earliestDate.getTime()) /
        (window.innerWidth - remToPx(2))
    );
  }, [earliestDate, latestDate]);

  useEffect(() => {
    setScale(baseScale / zoom);
  }, [baseScale, zoom]);

  useEffect(() => {
    updateGraduations();
  }, [scale]);

  useEffect(() => {
    let max: number = 1;
    for (const periodLevel of periodsLevels) {
      if (max < periodLevel.level) {
        max = periodLevel.level;
      }
    }
    setLevelMax(max);
  }, [periodsLevels]);

  return (
    <>
      <div className="timeline-commands">
        <label htmlFor="timeline-zoom">
          <span>Zoom&nbsp;: </span>
          <input
            type="number"
            name="timeline-zoom"
            id="timeline-zoom"
            min={1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="timeline-container">
        <div
          className="timeline"
          style={{
            width: `${
              latestDate &&
              earliestDate &&
              (latestDate.getTime() - earliestDate.getTime()) / scale
            }px`,
            minHeight: `calc(var(--milestone-marker-size) * ${levelMax + 1})`,
          }}
        >
          <div>{graduations}</div>
          {!data
            ? "Chargement..."
            : earliestDate &&
              latestDate && (
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
                  {periodsLevels.map((periodLevel) => (
                    <Period
                      key={`period-${periodLevel.period.name}`}
                      data={periodLevel.period}
                      earliestDate={earliestDate}
                      latestDate={latestDate}
                      scale={scale}
                      level={periodLevel.level}
                    />
                  ))}
                </>
              )}
        </div>
      </div>
    </>
  );
};

export default Timeline;
