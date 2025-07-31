export const downloadBlob = (blob: Blob, filename = "export.xlsx") => {
  const link = document.createElement("a");
  const url = window.URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
