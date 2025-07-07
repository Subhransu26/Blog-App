const Spinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      {/* Spinner */}
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="absolute w-4 h-4 bg-blue-500 rounded-full" />
      </div>

      {/* Message */}
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Spinner;
