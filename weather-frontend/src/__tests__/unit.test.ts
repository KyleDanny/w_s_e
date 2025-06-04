import { describe, it, expect } from "vitest";

describe("Temperature Conversion Unit Tests", () => {
  const convertTemp = (c: number, unit: "C" | "F") =>
    unit === "C" ? c : (c * 9) / 5 + 32;

  it("converts Celsius to Fahrenheit correctly", () => {
    expect(convertTemp(0, "F")).toBe(32);
    expect(convertTemp(100, "F")).toBe(212);
    expect(convertTemp(23.5, "F")).toBeCloseTo(74.3);
  });

  it("returns Celsius when unit is C", () => {
    expect(convertTemp(23.5, "C")).toBe(23.5);
    expect(convertTemp(0, "C")).toBe(0);
  });
});

describe("CSV Export Logic Unit Tests", () => {
  const mockData = [
    {
      deviceId: "test",
      timestamp: 1701000000,
      temperature: 23.5,
      humidity: 65.2,
    },
    {
      deviceId: "test",
      timestamp: 1701000060,
      temperature: 24.1,
      humidity: 64.8,
    },
  ];

  it("formats CSV data correctly", () => {
    const headers = ["timestamp", "temperature(°C)", "humidity(%)"];
    const rows = mockData.map((entry) => [
      new Date(entry.timestamp * 1000).toISOString(),
      entry.temperature.toFixed(2),
      entry.humidity.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    expect(csvContent).toContain("timestamp,temperature(°C),humidity(%)");
    expect(csvContent).toContain("23.50,65.20");
    expect(csvContent).toContain("24.10,64.80");
  });

  it("generates ISO timestamp format", () => {
    const timestamp = 1701000000;
    const date = new Date(timestamp * 1000);
    const isoString = date.toISOString();

    expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    expect(isoString).toContain("2023-11-26T");
  });
});
