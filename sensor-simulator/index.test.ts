import { encodeWeatherData } from "./encode";
import { decodeWeatherData } from "../infra/cdk/lambda/decode";
import fs from "fs";
import path from "path";

describe("Weather Data Encoding/Decoding", () => {
  test("encodes and decodes weather data correctly", () => {
    const input = {
      deviceId: "simulated-station-1",
      timestamp: 1716825600,
      temperature: 21.56,
      humidity: 63.42,
    };

    const binary = encodeWeatherData(input);
    const output = decodeWeatherData(binary);

    expect(output).toEqual({
      deviceId: input.deviceId,
      timestamp: input.timestamp,
      temperature: parseFloat(input.temperature.toFixed(2)),
      humidity: parseFloat(input.humidity.toFixed(2)),
    });
  });

  test("validates binary output structure", () => {
    const input = {
      deviceId: "test-station",
      timestamp: 1716825600,
      temperature: 21.56,
      humidity: 63.42,
    };

    const binary = encodeWeatherData(input);

    // Test that encoded data is exactly 28 bytes
    expect(binary.length).toBe(28);
    expect(binary).toBeInstanceOf(Uint8Array);
  });

  test("handles maximum device ID length (20 chars)", () => {
    const input = {
      deviceId: "a".repeat(25), // Should truncate to 20
      timestamp: 1716825600,
      temperature: 25.0,
      humidity: 50.0,
    };

    const binary = encodeWeatherData(input);
    const output = decodeWeatherData(binary);

    expect(output.deviceId).toBe("a".repeat(20));
    expect(output.deviceId.length).toBe(20);
  });

  test("handles very large timestamp values", () => {
    const input = {
      deviceId: "test-station",
      timestamp: 2147483647, // Maximum 32-bit signed integer
      temperature: 21.56,
      humidity: 63.42,
    };

    const binary = encodeWeatherData(input);
    const output = decodeWeatherData(binary);

    expect(output.timestamp).toBe(input.timestamp);
  });

  test("handles extreme temperature values", () => {
    // Test very cold temperature
  });

  test("handles extreme humidity values", () => {
    // Test 0% humidity
  });

  test("handles precision loss in temperature/humidity encoding", () => {
    // Test very high precision numbers such as voltage vs resistance
  });

  test("handles empty device ID", () => {
    // Handle empty device ID
  });
});

describe("Input Validation Tests", () => {
  test("encodeWeatherData handles zero values", () => {
    // Handle zero values
  });

  test("encodeWeatherData handles boundary humidity values correctly", () => {
    // Test very low positive humidity (close to 0 but positive)
    // Test maximum realistic humidity (100%)
  });

  test("encodeWeatherData handles very high precision numbers", () => {
    // Test very high precision numbers such as voltage vs resistance
  });
});

describe("File Operations Tests", () => {
  test("reads simulated_payloads.json correctly", () => {
    const payloadsPath = path.join(
      __dirname,
      "seeding/simulated_payloads.json"
    );

    // Check if file exists
    expect(fs.existsSync(payloadsPath)).toBe(true);

    // Read and parse the file
    const payloads = JSON.parse(fs.readFileSync(payloadsPath, "utf-8"));

    // Validate structure
    expect(Array.isArray(payloads)).toBe(true);
    expect(payloads.length).toBeGreaterThan(0);

    // Validate each payload has required fields
    payloads.slice(0, 5).forEach((payload: any) => {
      expect(payload).toHaveProperty("deviceId");
      expect(payload).toHaveProperty("timestamp");
      expect(payload).toHaveProperty("temperature");
      expect(payload).toHaveProperty("humidity");

      expect(typeof payload.deviceId).toBe("string");
      expect(typeof payload.timestamp).toBe("number");
      expect(typeof payload.temperature).toBe("number");
      expect(typeof payload.humidity).toBe("number");
    });
  });

  test("handles missing simulated_payloads.json file", () => {
    const nonExistentPath = path.join(__dirname, "seeding/non_existent.json");

    expect(() => {
      fs.readFileSync(nonExistentPath, "utf-8");
    }).toThrow();
  });

  test("writes binary files correctly", () => {
    const input = {
      deviceId: "test-station",
      timestamp: 1716825600,
      temperature: 21.56,
      humidity: 63.42,
    };

    const binary = encodeWeatherData(input);
    const testFilePath = path.join(__dirname, "test-output.bin");

    // Write binary data to file
    fs.writeFileSync(testFilePath, binary);

    // Read it back
    const readBinary = fs.readFileSync(testFilePath);

    // Compare with original
    expect(readBinary).toEqual(Buffer.from(binary));
    expect(readBinary.length).toBe(28);

    // Decode the read binary to verify integrity
    const decoded = decodeWeatherData(new Uint8Array(readBinary));
    expect(decoded).toEqual({
      deviceId: input.deviceId,
      timestamp: input.timestamp,
      temperature: input.temperature,
      humidity: input.humidity,
    });

    // Clean up test file
    fs.unlinkSync(testFilePath);
  });
});
