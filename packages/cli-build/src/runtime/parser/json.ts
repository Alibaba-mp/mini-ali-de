export function jsonParse(source: string, filePath: string) {
  let result: any = {};
  try {
    result = JSON.parse(source);
  } catch (e) {
    throw new Error(`JSON parse failed at ${filePath}`);
  }
  return result;
}
