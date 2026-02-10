/**
 * Import/Export Utilities
 * Handles CSV and Excel file parsing and generation
 */

export interface ImportResult<T = any> {
  success: boolean;
  data: T[];
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

/**
 * Parse CSV file to JSON
 */
export async function parseCSV<T = any>(
  file: File,
  options: {
    delimiter?: string;
    hasHeader?: boolean;
    validator?: (row: any, index: number) => string | null;
  } = {},
): Promise<ImportResult<T>> {
  const { delimiter = ",", hasHeader = true, validator } = options;

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const data: T[] = [];
      const errors: Array<{ row: number; field?: string; message: string }> =
        [];
      let headers: string[] = [];

      lines.forEach((line, index) => {
        // Parse line
        const values = line
          .split(delimiter)
          .map((v) => v.trim().replace(/^"|"$/g, ""));

        // First row - headers
        if (index === 0 && hasHeader) {
          headers = values;
          return;
        }

        // Create row object
        const row: any = {};
        if (hasHeader) {
          headers.forEach((header, i) => {
            row[header] = values[i] || "";
          });
        } else {
          values.forEach((value, i) => {
            row[`column_${i}`] = value;
          });
        }

        // Validate row
        if (validator) {
          const error = validator(row, index);
          if (error) {
            errors.push({
              row: index + 1,
              message: error,
            });
            return;
          }
        }

        data.push(row as T);
      });

      resolve({
        success: errors.length === 0,
        data,
        errors,
        stats: {
          totalRows: lines.length - (hasHeader ? 1 : 0),
          validRows: data.length,
          invalidRows: errors.length,
        },
      });
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: [{ row: 0, message: "Failed to read file" }],
        stats: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
        },
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  options: {
    columns?: Array<{ key: keyof T; header: string }>;
  } = {},
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Determine columns
  const columns =
    options.columns ||
    Object.keys(data[0]).map((key) => ({
      key: key as keyof T,
      header: key,
    }));

  // Create CSV content
  const headers = columns.map((col) => col.header).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        // Escape and quote if necessary
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      })
      .join(","),
  );

  const csvContent = [headers, ...rows].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to JSON
 */
export function exportToJSON<T = any>(data: T[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".json") ? filename : `${filename}.json`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download template CSV for import
 */
export function downloadImportTemplate(
  columns: Array<{ key: string; header: string; example?: string }>,
  filename: string,
): void {
  // Create header row
  const headers = columns.map((col) => col.header).join(",");

  // Create example row
  const exampleRow = columns.map((col) => col.example || "").join(",");

  const csvContent = [headers, exampleRow].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
