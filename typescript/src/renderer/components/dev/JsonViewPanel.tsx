import React from "react";

interface JsonViewPanelProps {
  data: any;
  title?: string;
}

export const JsonViewPanel: React.FC<JsonViewPanelProps> = ({
  data,
  title = "Raw JSON Data",
}) => {
  return (
    <div className="w-1/2 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 sticky top-0 bg-gray-50 dark:bg-gray-900 pb-2">
          {title}
        </h4>
        <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
          {data ? JSON.stringify(data, null, 2) : "No data available"}
        </pre>
      </div>
    </div>
  );
};
