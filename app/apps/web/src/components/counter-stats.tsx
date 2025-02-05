import { useState, useEffect } from "react";
import { MagicCard } from "./ui/magic-card";

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
          <MagicCard
            className="group rounded-2xl border bg-card/50 p-6 transition-all hover:bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 backdrop-blur-sm"
            gradientFrom="#3B82F6"
            gradientTo="#8B5CF6"
            gradientColor="rgb(var(shadow-primary))"
          >
            <Counter end={50000} suffix="+" />
            <p className="mt-2 text-sm text-muted-foreground">Happy Patients</p>
          </MagicCard>

          <MagicCard
            className="group rounded-2xl border bg-card/50 p-6 transition-all hover:bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 backdrop-blur-sm"
            gradientFrom="#8B5CF6"
            gradientTo="#EC4899"
            gradientColor="rgb(var(shadow-primary))"
          >
            <Counter end={1000} suffix="+" />
            <p className="mt-2 text-sm text-muted-foreground">
              Healthcare Providers
            </p>
          </MagicCard>

          <MagicCard
            className="group rounded-2xl border bg-card/50 p-6 transition-all hover:bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 backdrop-blur-sm"
            gradientFrom="#10B981"
            gradientTo="#3B82F6"
            gradientColor="rgb(var(shadow-primary))"
          >
            <Counter end={98} suffix="%" />
            <p className="mt-2 text-sm text-muted-foreground">
              Satisfaction Rate
            </p>
          </MagicCard>

          <MagicCard
            className="group rounded-2xl border bg-card/50 p-6 transition-all hover:bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 backdrop-blur-sm"
            gradientFrom="#F59E0B"
            gradientTo="#8B5CF6"
            gradientColor="rgb(var(shadow-primary))"
          >
            <Counter end={24} prefix="24/" />
            <p className="mt-2 text-sm text-muted-foreground">
              Support Available
            </p>
          </MagicCard>
        </div>
      </div>
    </div>
  );
};
