const DeviceDropdown = ({
  deviceId,
  setDeviceId,
  deviceIds,
}: {
  deviceId: string;
  setDeviceId: (deviceId: string) => void;
  deviceIds: string[];
}) => {
  return (
    <div>
      <label className="mr-2 font-medium">Select Device:</label>
      <select
        value={deviceId}
        onChange={(e) => setDeviceId(e.target.value)}
        className="border p-2 rounded"
      >
        {deviceIds.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DeviceDropdown;
