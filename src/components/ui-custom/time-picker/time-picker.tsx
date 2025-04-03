"use client";

import type React from "react";

import { useState, useEffect } from "react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  initialValue?: string;
}

export function TimePicker({
  value,
  onChange,
  ariaLabel,
  initialValue = "09:00",
}: TimePickerProps) {
  const [selectedTime, setSelectedTime] = useState(value || initialValue);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedTime(value);
    }
  }, [value]);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    setSelectedTime(newTime);
    onChange(newTime);
  };

  return (
    <input
      type="time"
      value={selectedTime}
      onChange={handleTimeChange}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={ariaLabel}
    />
  );
}
