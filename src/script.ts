import axios from "axios";

interface FileItem {
  fileUrl: string;
}

interface DataResponse {
  items: FileItem[];
}

declare global {
  var CACHE: any;
}

global.CACHE = null;

export const scrapeData = async (): Promise<void> => {
  try {
    console.log(
      "Scraping has started!, please wait 10 seconds while data is fetched!"
    );

    const response = await axios.get<DataResponse>(
      "https://rest-test-eight.vercel.app/api/test"
    );
    const data = response.data;

    global.CACHE = transformData(data.items);
    console.log("Data scraped successfully!");
  } catch (error: any) {
    console.error("Error fetching data:", error.message);
  }
};

const transformData = (data: FileItem[]): any => {
  const result: any = {};

  data.forEach((item) => {
    const url = new URL(item.fileUrl);
    const pathParts = url.pathname.split("/").filter((part) => part);

    if (pathParts.length > 1) {
      let currentLevel = (result[url.hostname] = result[url.hostname] || []);

      pathParts.forEach((part, index) => {
        if (index === pathParts.length - 1) {
          if (Array.isArray(currentLevel)) {
            currentLevel.push(part);
          } else {
            currentLevel[part] = part;
          }
        } else {
          let nextLevel = currentLevel.find(
            (entry: any) =>
              typeof entry === "object" && entry.hasOwnProperty(part)
          );
          if (!nextLevel) {
            nextLevel = { [part]: [] };
            currentLevel.push(nextLevel);
          }
          currentLevel = nextLevel[part];
        }
      });
    }
  });

  for (const host in result) {
    result[host] = removeDuplicates(result[host]);
  }

  return result;
};

const removeDuplicates = (array: any[]): any[] => {
  return array.map((item) => {
    if (typeof item === "object" && !Array.isArray(item)) {
      const key = Object.keys(item)[0];
      const value = item[key];
      if (Array.isArray(value)) {
        item[key] = value
          .filter(
            (subItem) =>
              !(
                typeof subItem === "string" &&
                value.some(
                  (v) => typeof v === "object" && v.hasOwnProperty(subItem)
                )
              )
          )
          .map((subItem) => {
            if (typeof subItem === "object") {
              return removeDuplicates([subItem])[0];
            }
            return subItem;
          });
      }
    }
    return item;
  });
};
