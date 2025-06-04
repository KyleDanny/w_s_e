import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App, { type WeatherData } from "../App";

// Mock axios to prevent actual API calls
vi.mock("axios", () => ({
  default: {
    get: vi
      .fn()
      .mockRejectedValue(new Error("Network disabled for component tests")),
  },
}));

// Mock environment variable
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_WEATHER_API_URL: "http://localhost:3000/api/weather",
  },
});

describe("Weather Dashboard Component Tests", () => {
  it("renders dashboard header", () => {
    render(<App />);
    expect(
      screen.getByText("🌤️ Weather Station Dashboard")
    ).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<App />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("renders control buttons", () => {
    render(<App />);
    expect(screen.getByText("Show in °F")).toBeInTheDocument();
    expect(screen.getByText("Download CSV")).toBeInTheDocument();
  });

  it("renders device dropdown with first device selected", () => {
    render(<App />);
    const deviceSelect = screen.getByDisplayValue("simulated-station-1");
    expect(deviceSelect).toBeInTheDocument();
  });

  it("has all device options in dropdown", () => {
    render(<App />);

    expect(
      screen.getByRole("option", { name: "simulated-station-1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "simulated-station-2" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "simulated-station-3" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "simulated-station-4" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "simulated-station-5" })
    ).toBeInTheDocument();
  });

  it("allows changing device selection", async () => {
    render(<App />);
    const user = userEvent.setup();

    const deviceSelect = screen.getByDisplayValue("simulated-station-1");
    await user.selectOptions(deviceSelect, "simulated-station-3");

    expect(screen.getByDisplayValue("simulated-station-3")).toBeInTheDocument();
  });

  it("toggles temperature unit button text", async () => {
    render(<App />);
    const user = userEvent.setup();

    const unitButton = screen.getByText("Show in °F");
    expect(unitButton).toBeInTheDocument();

    await user.click(unitButton);
    expect(screen.getByText("Show in °C")).toBeInTheDocument();

    await user.click(screen.getByText("Show in °C"));
    expect(screen.getByText("Show in °F")).toBeInTheDocument();
  });
});

describe("Weather Data Type Tests", () => {
  it("validates WeatherData interface structure", () => {
    const sampleData: WeatherData[] = [
      {
        deviceId: "test",
        timestamp: 1701000000,
        temperature: 20.5,
        humidity: 65,
      },
      {
        deviceId: "test",
        timestamp: 1701000060,
        temperature: 21.0,
        humidity: 64,
      },
    ];

    expect(sampleData[0]).toHaveProperty("deviceId");
    expect(sampleData[0]).toHaveProperty("timestamp");
    expect(sampleData[0]).toHaveProperty("temperature");
    expect(sampleData[0]).toHaveProperty("humidity");

    expect(typeof sampleData[0].deviceId).toBe("string");
    expect(typeof sampleData[0].timestamp).toBe("number");
    expect(typeof sampleData[0].temperature).toBe("number");
    expect(typeof sampleData[0].humidity).toBe("number");
  });

  it("processes timestamp correctly", () => {
    const timestamp = 1701000000;
    const date = new Date(timestamp * 1000);
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2023);
  });
});
