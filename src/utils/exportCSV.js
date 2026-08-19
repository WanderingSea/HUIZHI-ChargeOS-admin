import { saveAs } from "file-saver";
import downloadCenter from "./downloadCenter";

export function exportToCSV(
  columns,
  data,
  filename = "export",
  recordInfo = {}
) {
  if (!data || !data.length) {
    if (window.Element && Element.prototype.Message) {
      Element.prototype.Message.warning("暂无可导出的数据");
    } else {
      alert("暂无可导出的数据");
    }
    return null;
  }

  const headers = columns.map((col) => col.label);
  const props = columns.map((col) => col.prop);

  const escapeCSV = (value) => {
    if (value === null || value === undefined) {
      return "";
    }
    const str = String(value);
    if (
      str.includes(",") ||
      str.includes('"') ||
      str.includes("\n") ||
      str.includes("\r")
    ) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const BOM = "\uFEFF";
  const csvLines = [];

  csvLines.push(headers.map(escapeCSV).join(","));

  data.forEach((row) => {
    const line = props.map((prop) => {
      const keys = prop.split(".");
      let value = row;
      for (const key of keys) {
        if (value && value.hasOwnProperty(key)) {
          value = value[key];
        } else {
          value = "";
          break;
        }
      }
      return escapeCSV(value);
    });
    csvLines.push(line.join(","));
  });

  const csvContent = BOM + csvLines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(date.getDate()).padStart(2, "0")}`;
  const fullFilename = `${filename}_${dateStr}.csv`;

  saveAs(blob, fullFilename);

  const record = downloadCenter.addRecord({
    filename: fullFilename,
    fileType: "CSV",
    fileSize: blob.size,
    dataCount: data.length,
    pageName: recordInfo.pageName || filename,
    remark: recordInfo.remark || "",
  });

  if (window.Element && Element.prototype.Message) {
    Element.prototype.Message.success(`已成功导出 ${data.length} 条数据`);
  }

  return record;
}

export default exportToCSV;
