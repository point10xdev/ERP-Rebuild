import React, { useState } from "react";
import axios from "axios";
import { Button } from "../../../shared/ui/Button";
import { format, subMonths } from "date-fns";
import * as XLSX from "xlsx";

interface ExportData {
  exportType: "scholarships" | "faculty" | "students";
  dateRange: string;
  startDate?: Date;
  endDate?: Date;
}

export const Export: React.FC = () => {
  const [exportData, setExportData] = useState<ExportData>({
    exportType: "scholarships",
    dateRange: "this_month",
  });
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Get current month and previous month names
  const currentMonth = format(new Date(), "MMMM");
  const previousMonth = format(subMonths(new Date(), 1), "MMMM");

  const dateRangeOptions = [
    { value: currentMonth, label: "This Month" },
    { value: previousMonth, label: "Previous Month" },
    { value: "custom", label: "Custom Range" },
  ];

  const handlePreview = async () => {
    setLoading(true);
    try {
      let response;
      switch (exportData.exportType) {
        case "scholarships":
          response = await axios.get(
            `http://127.0.0.1:8000/api/scholarships/manage/?type=${exportData.dateRange}`
          );
          response = response.data.scholarships;
          break;
        case "faculty":
          response = await axios.get(
            "http://127.0.0.1:8000/api/users/faculty/"
          );
          response = response.data;
          break;
        case "students":
          response = await axios.get(
            "http://127.0.0.1:8000/api/users/student/"
          );
          response = response.data;
          break;
        default:
          throw new Error("Invalid export type");
      }
      setPreviewData(response);
    } catch (error) {
      console.error("Preview failed:", error);
      alert("Failed to fetch preview data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (previewData.length === 0) {
      alert("Please preview the data first");
      return;
    }

    try {
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(previewData);

      // Create workbook and add worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${exportData.exportType}_export_${format(
          new Date(),
          "yyyy-MM-dd"
        )}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data.");
    }
  };

  return (
    <div className="container mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Export Data</h1>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exportData.exportType === "scholarships" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Date Range
              </label>
              <select
                className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600"
                value={exportData.dateRange}
                onChange={(e) =>
                  setExportData((prev) => ({
                    ...prev,
                    dateRange: e.target.value,
                  }))
                }
              >
                {dateRangeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Export Type
            </label>
            <select
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600"
              value={exportData.exportType}
              onChange={(e) =>
                setExportData((prev) => ({
                  ...prev,
                  exportType: e.target.value as ExportData["exportType"],
                }))
              }
            >
              <option value="scholarships">Scholarships</option>
              <option value="faculty">Faculty</option>
              <option value="students">Students</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handlePreview}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Loading..." : "Preview Data"}
          </Button>

          <Button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
            disabled={previewData.length === 0}
          >
            Export to Excel
          </Button>
        </div>

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="mt-8 overflow-x-auto border border-gray-700 rounded-md">
            <table className="min-w-full table-auto text-sm text-left">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 border-b border-gray-600"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-900 text-white">
                {previewData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td
                        key={j}
                        className="px-4 py-2 border-b border-gray-700"
                      >
                        {String(val ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
