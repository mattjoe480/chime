import { useState, useEffect } from "react";

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const Counter = (props: CounterProps) => {
  const [count, setCount] = useState(0);
  const duration = props.duration || 2000;
  const steps = 60;
  const increment = props.end / steps;
  const stepDuration = duration / steps;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= props.end) {
        setCount(props.end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [props.end, increment, stepDuration]);

  return (
    <span className="text-4xl font-bold">
      {props.prefix}
      {count}
      {props.suffix}
    </span>
  );
};

export const StatsSection = () => {
  return (
    <div className="relative py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="container px-4">
        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/50">
            <Counter end={50000} suffix="+" />
            <p className="mt-2 text-sm text-muted-foreground">Happy Patients</p>
          </div>
          <div className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/50">
            <Counter end={1000} suffix="+" />
            <p className="mt-2 text-sm text-muted-foreground">
              Healthcare Providers
            </p>
          </div>
          <div className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/50">
            <Counter end={98} suffix="%" />
            <p className="mt-2 text-sm text-muted-foreground">
              Satisfaction Rate
            </p>
          </div>
          <div className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/50">
            <Counter end={24} prefix="24/" />
            <p className="mt-2 text-sm text-muted-foreground">
              Support Available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
