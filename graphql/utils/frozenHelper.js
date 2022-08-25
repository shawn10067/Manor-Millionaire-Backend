import { intervalToDuration } from "date-fns";

const frozenHelper = (prev, current) => {
  const intervalFormatted = intervalToDuration({
    start: prev,
    end: current,
  });

  return intervalFormatted.days >= 2;
};

export default frozenHelper;
