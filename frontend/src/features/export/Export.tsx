import { useState } from "react";
import { useAuth } from "../auth/store/customHooks";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../shared/ui/select";
import { FileDown, Eye } from "lucide-react";
import { exportReportData } from "../../services/index";
import { downloadBlob } from "../../utils/download";
import { showError, showSuccess } from "../../utils/toast";
import { motion } from "framer-motion";

const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => ({
  label: `${currentYear - i}`,
  value: `${currentYear - i}`,
}));

const exportTypes = [
  { value: "default", label: "Scholarship Reports (default)" },
  { value: "scholars", label: "Scholars Report" },
  { value: "faculty", label: "Faculty Report" },
];

export const Export = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear, setSelectedYear] = useState(`${currentYear}`);
  const [selectedType, setSelectedType] = useState("default");
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (isPreview: boolean) => {
    const month = `${selectedYear}-${selectedMonth}`;
    setIsLoading(true);

    try {
      const blob = await exportReportData(user.id, selectedType, month);
      if (!isPreview) {
        downloadBlob(blob, `${selectedType}-${month}.xlsx`);
        showSuccess("Download completed successfully!");
      } else {
        showSuccess("Preview generated (mock)");
      }
    } catch (error) {
      console.error("Export failed:", error);
      showError("Export failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="container mx-auto p-6 "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Export Data
      </h1>

      <Card className="p-6 bg-white dark:bg-zinc-900 shadow-md rounded-2xl space-y-6 relative z-0">
        {/* Export Type */}
        <div className="space-y-2 z-10">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Export Type
          </label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-64 dark:bg-zinc-800 dark:text-white">
              <SelectValue placeholder="Select Export Type" />
            </SelectTrigger>
            <SelectContent className="z-50 border bg-white text-black dark:bg-zinc-950 dark:text-white">
              {exportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month & Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Month
            </label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full dark:bg-zinc-800 dark:text-white">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent className="z-50 border bg-white text-black dark:bg-zinc-950 dark:text-white">
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Year
            </label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full dark:bg-zinc-800 dark:text-white">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="z-50 border bg-white text-black dark:bg-zinc-950 dark:text-white">
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={() => handleExport(true)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            <Eye className="w-4 h-4" />
            {isLoading ? "Loading..." : "Preview"}
          </Button>
          <Button
            onClick={() => handleExport(false)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            <FileDown className="w-4 h-4" />
            {isLoading ? "Exporting..." : "Download"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
