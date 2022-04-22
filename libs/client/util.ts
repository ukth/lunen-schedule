import { TYPE_OFFICE } from "@constants";
import { schedule } from "@prisma/client";

export const joinClassNames = (...classnames: string[]) => {
  return classnames.join(" ");
};

export const parseTimeMS = (ms: number) => {
  const hour = Math.floor(ms / (60 * 60 * 1000));
  const min = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const sec = Math.floor((ms % (60 * 1000)) / 1000);

  return { hour, min, sec };
};

export const analyzeSchedules = (schedules: schedule[]) => {
  let workDays = schedules.length;
  let workTime = 0;
  let calcDays = 0;

  for (let i = 0; i < schedules.length; i++) {
    const schedule = schedules[i];
    if (schedule.type === TYPE_OFFICE && schedule.finishedAt) {
      workTime += schedule.finishedAt.valueOf() - schedule.startedAt.valueOf();
      calcDays += 1;
    }
  }

  return {
    workDays,
    avgWorkTime: calcDays === 0 ? 0 : workTime / calcDays,
  };
};
