import "./Timeline.css";
import { useEffect, useRef, useState } from "react";
import useFetch from "../../hooks/useFetch";
import type {
  Data,
  Milestone as MilestoneT,
  Period as PeriodT,
} from "../../types/Data";
import Period from "../Period/Period";
import Milestone from "../Milestone/Milestone";
import {
  getMonthNames,
  getNumberOfDayInAMonth,
  remToPx,
  sleep,
} from "../../utils/utils";

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
  const [scrollStartDate, setScrollStartDate] = useState<Date | null>(null);
  const [scrollEndDate, setScrollEndDate] = useState<Date | null>(null);

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

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
    if (
      earliestDate === null ||
      latestDate === null ||
      scrollStartDate === null ||
      scrollEndDate === null
    ) {
      setGraduations([]);
      console.error("Dates are null");
      return;
    }
    const graduationsTmp: React.ReactElement[] = [];
    const yearWidth = (Date.UTC(1971) - Date.UTC(1970)) / scale;
    const monthWidth = (Date.UTC(1970, 2) - Date.UTC(1970, 1)) / scale;
    const dayWidth = (Date.UTC(1970, 0, 2) - Date.UTC(1970, 0, 1)) / scale;
    let currentYear = scrollStartDate.getUTCFullYear();
    let currentMonth = scrollStartDate.getUTCMonth();
    let currentDay = scrollStartDate.getUTCDate();
    let nbDays = getNumberOfDayInAMonth(currentYear, currentMonth);
    while (
      Date.UTC(currentYear, currentMonth, currentDay) <=
      Math.min(scrollEndDate.getTime(), latestDate.getTime())
    ) {
      if (currentMonth === 0 && currentDay === 1) {
        graduationsTmp.push(
          <div
            key={`graduation-${currentYear}-${currentMonth + 1}-${currentDay}`}
            id={`graduation-${currentYear}-${currentMonth + 1}-${currentDay}`}
            className={`graduation ${
              currentYear % 10 === 0 ? "decade" : "year"
            }`}
            style={{
              left: `${
                (Date.UTC(currentYear, currentMonth, currentDay) -
                  earliestDate.getTime()) /
                scale
              }px`,
            }}
          >
            {(yearWidth > remToPx(3) || currentYear % 10 === 0) && (
              <span className={currentYear % 10 === 0 ? "decade" : "year"}>
                {currentYear}
              </span>
            )}
            {monthWidth > remToPx(1.5) && (
              <span className="month">
                {
                  getMonthNames(
                    "fr-FR",
                    monthWidth > remToPx(5.5)
                      ? "long"
                      : monthWidth > remToPx(3)
                      ? "short"
                      : "narrow"
                  )[currentMonth]
                }
              </span>
            )}
            {dayWidth > remToPx(2) && <span className="day">{currentDay}</span>}
          </div>
        );
      } else if (currentDay === 1 && monthWidth > remToPx(1)) {
        graduationsTmp.push(
          <div
            key={`graduation-${currentYear}-${currentMonth + 1}-${currentDay}`}
            id={`graduation-${currentYear}-${currentMonth + 1}-${currentDay}`}
            className="graduation month"
            style={{
              left: `${
                (Date.UTC(currentYear, currentMonth, currentDay) -
                  earliestDate.getTime()) /
                scale
              }px`,
            }}
          >
            {monthWidth > remToPx(1.5) && (
              <span className="month">
                {
                  getMonthNames(
                    "fr-FR",
                    monthWidth > remToPx(5.5)
                      ? "long"
                      : monthWidth > remToPx(3)
                      ? "short"
                      : "narrow"
                  )[currentMonth]
                }
              </span>
            )}
            {dayWidth > remToPx(2) && <span className="day">{currentDay}</span>}
          </div>
        );
      } else if (dayWidth > remToPx(1)) {
        graduationsTmp.push(
          <div
            key={`graduation-${currentYear}-${currentMonth + 1}-${currentDay}`}
            id={`graduation-${currentYear}-${currentMonth + 1}-${currentDay}`}
            className="graduation day"
            style={{
              left: `${
                (Date.UTC(currentYear, currentMonth, currentDay) -
                  earliestDate.getTime()) /
                scale
              }px`,
            }}
          >
            {dayWidth > remToPx(2) && <span className="day">{currentDay}</span>}
          </div>
        );
      }
      if (currentDay < nbDays) {
        currentDay++;
      } else if (currentMonth < 11) {
        currentDay = 1;
        currentMonth++;
        nbDays = getNumberOfDayInAMonth(currentYear, currentMonth);
      } else {
        currentDay = 1;
        currentMonth = 0;
        currentYear++;
        nbDays = getNumberOfDayInAMonth(currentYear, currentMonth);
      }
    }
    setGraduations(graduationsTmp);
  };

  const handleScroll = () => {
    if (!timelineContainerRef.current || !earliestDate) return;
    const scroll = timelineContainerRef.current.scrollLeft;
    const containerWidth = timelineContainerRef.current.clientWidth;
    const startDate = new Date(
      (scroll - remToPx(1)) * scale + earliestDate.getTime()
    ); // The remToPx(1) is here to take the timeline padding into account
    const endDate = new Date(startDate.getTime() + containerWidth * scale);
    setScrollStartDate(startDate);
    setScrollEndDate(endDate);
  };

  useEffect(() => {
    (async () => {
      setData(await api.get("/data/events.json"));
    })();
  }, []);

  useEffect(() => {
    updateEarliestAndLatestDates();
    updatePeriodsLevels();
    handleScroll();
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
    setScale(baseScale / Math.pow(zoom, Math.log(zoom + 1)));
  }, [baseScale]);

  useEffect(() => {
    (async () => {
      if (!timelineContainerRef.current || !timelineRef.current) return;
      const oldWidth = timelineRef.current.clientWidth;
      const oldScrollPos = timelineContainerRef.current.scrollLeft;
      const oldCenter = oldScrollPos + window.innerWidth / 2;
      const normalizedCenter = oldCenter / oldWidth;
      setScale(baseScale / Math.pow(zoom, Math.log(zoom + 1)));
      await sleep(0);
      const newWidth = timelineRef.current.clientWidth;
      const newCenter = newWidth * normalizedCenter;
      const newScrollPos = newCenter - window.innerWidth / 2;
      timelineContainerRef.current.scrollLeft = newScrollPos;
    })();
  }, [zoom]);

  useEffect(() => {
    updateGraduations();
  }, [scrollStartDate, scrollEndDate]);

  useEffect(() => {
    handleScroll();
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
      <div
        className="timeline-container"
        ref={timelineContainerRef}
        onScroll={handleScroll}
      >
        <div
          className="timeline"
          ref={timelineRef}
          style={{
            width: `${
              latestDate &&
              earliestDate &&
              (latestDate.getTime() - earliestDate.getTime()) / scale
            }px`,
            minHeight: `calc(var(--milestone-marker-size) * ${levelMax + 1})`,
          }}
        >
          <div className="graduations">{graduations}</div>
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
                          data={milestone}
                          earliestDate={earliestDate}
                          scale={scale}
                          scrollableParentRef={timelineContainerRef}
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
                      scrollableParentRef={timelineContainerRef}
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
