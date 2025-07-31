export const get = (val: string, obj: Record<string, string>, ci = false) => {
  if (!val) return val;
  if (ci) {
    const match = Object.keys(obj).find(
      (k) => k.toLowerCase() === val.toLowerCase()
    );
    return match ? obj[match] : val;
  }
  return obj[val] || val;
};
