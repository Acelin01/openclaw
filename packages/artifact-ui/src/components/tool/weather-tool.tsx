"use client";

import { Weather } from "../weather";

interface WeatherToolProps {
  part: any;
}

export function WeatherTool({ part }: WeatherToolProps) {
  const { state } = part;

  if (state !== "output-available") {
    return null;
  }

  return <Weather weatherAtLocation={part.output} />;
}
