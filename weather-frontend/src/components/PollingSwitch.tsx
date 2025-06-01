const PollingSwitch = ({
  polling,
  setPolling,
}: {
  polling: boolean;
  setPolling: (polling: boolean) => void;
}) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-medium">Auto-Refresh:</span>
      <button
        onClick={() => setPolling(!polling)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
          polling ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            polling ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm text-gray-600">
        {polling ? "On (1s)" : "Off"}
      </span>
    </div>
  );
};

export default PollingSwitch;
