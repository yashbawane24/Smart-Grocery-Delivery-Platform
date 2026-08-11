import { useEffect, useState } from "react";

function getTimeParts(msLeft) {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  return {
    hours: String(Math.floor(total / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
    seconds: String(total % 60).padStart(2, "0"),
  };
}

export default function CountdownTimer({ hours = 6 }) {
  const [target] = useState(() => Date.now() + hours * 60 * 60 * 1000);
  const [time, setTime] = useState(getTimeParts(target - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(getTimeParts(target - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const blocks = [
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ];

  return (
    <div className="flex items-center gap-2.5">
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-2.5">
          <div className="flex flex-col items-center rounded-xl2 bg-white/10 px-3.5 py-2 backdrop-blur-md min-w-[56px]">
            <span className="font-heading text-xl font-bold text-white tabular-nums">
              {b.value}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-white/60">
              {b.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <span className="font-heading text-xl font-bold text-white/40">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
