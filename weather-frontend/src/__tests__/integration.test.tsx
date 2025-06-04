import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import App from "../App";

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockAxiosGet = (axios as typeof axios).get as ReturnType<typeof vi.fn>;

// Mock data
const mockWeatherData = [
  {
    deviceId: "simulated-station-1",
    timestamp: 1701000000,
    temperature: 23.5,
    humidity: 65.2,
  },
  {
    deviceId: "simulated-station-1",
    timestamp: 1701000060,
    temperature: 24.1,
    humidity: 64.8,
  },
];

const mockStation2Data = [
  {
    deviceId: "simulated-station-2",
    timestamp: 1701000000,
    temperature: 18.2,
    humidity: 70.1,
  },
];

describe("Weather Dashboard Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("loads and displays weather data successfully", async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: mockWeatherData });

    render(<App />);

    // Initially shows loading
    expect(screen.getByText("Loading data...")).toBeInTheDocument();

    // API should be called
    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining("simulated-station-1")
      );
    });

    // Data should be displayed
    await waitFor(() => {
      expect(screen.getByText("📈 Live Data Charts")).toBeInTheDocument();
    });

    // Loading should be gone
    expect(screen.queryByText("Loading data...")).not.toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error("Network error"));

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load weather data/)
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("📈 Live Data Charts")).not.toBeInTheDocument();
  });

  it("switches devices and refetches data", async () => {
    // First call for initial load
    mockAxiosGet.mockResolvedValueOnce({ data: mockWeatherData });
    // Second call for device switch
    mockAxiosGet.mockResolvedValueOnce({ data: mockStation2Data });

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("📈 Live Data Charts")).toBeInTheDocument();
    });

    const user = userEvent.setup();

    // Switch device
    const deviceSelect = screen.getByDisplayValue("simulated-station-1");
    await user.selectOptions(deviceSelect, "simulated-station-2");

    // Should make new API call
    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining("simulated-station-2")
      );
    });

    expect(mockAxiosGet).toHaveBeenCalledTimes(2);
  });

  it("exports CSV data correctly", async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: mockWeatherData });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("📈 Live Data Charts")).toBeInTheDocument();
    });

    // Mock URL.createObjectURL and document methods after render
    const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    const mockRevokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });

    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    const mockElement = {
      href: "",
      download: "",
      setAttribute: vi.fn(),
      click: mockClick,
    };

    vi.spyOn(document, "createElement").mockReturnValue(
      mockElement as unknown as HTMLElement
    );
    vi.spyOn(document.body, "appendChild").mockImplementation(mockAppendChild);
    vi.spyOn(document.body, "removeChild").mockImplementation(mockRemoveChild);

    const user = userEvent.setup();

    // Click download button
    const downloadButton = screen.getByText("Download CSV");
    await user.click(downloadButton);

    // Verify CSV export process
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      "download",
      "simulated-station-1_weather_data.csv"
    );
    expect(mockClick).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
    expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
  });

  it("temperature unit conversion affects display", async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: mockWeatherData });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("📈 Live Data Charts")).toBeInTheDocument();
    });

    const user = userEvent.setup();

    // Initially shows Celsius option
    expect(screen.getByText("Show in °F")).toBeInTheDocument();

    // Click to switch to Fahrenheit
    await user.click(screen.getByText("Show in °F"));

    // Button should now show Celsius option
    expect(screen.getByText("Show in °C")).toBeInTheDocument();
    expect(screen.queryByText("Show in °F")).not.toBeInTheDocument();
  });

  it("handles polling mode correctly", async () => {
    // Mock multiple API calls for polling
    mockAxiosGet.mockResolvedValue({ data: mockWeatherData });

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("📈 Live Data Charts")).toBeInTheDocument();
    });

    const user = userEvent.setup();

    // Enable polling - find the polling switch button
    const pollingSwitch = screen.getByText("Off")
      .previousElementSibling as HTMLElement;
    await user.click(pollingSwitch);

    // Should have made initial call + one more when polling enabled
    expect(mockAxiosGet).toHaveBeenCalledTimes(2);

    // Just verify polling text changes to "On (1s)"
    expect(screen.getByText("On (1s)")).toBeInTheDocument();

    // Disable polling
    await user.click(pollingSwitch);
    expect(screen.getByText("Off")).toBeInTheDocument();
  });
});
