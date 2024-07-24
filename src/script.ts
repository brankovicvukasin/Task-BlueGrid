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
    console.log("Data scraped successfuly!");
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
      const [repo, ...rest] = pathParts;
      const filename = rest.pop();
      const repoPath = rest.join("/");

      if (!result[url.hostname]) {
        result[url.hostname] = [];
      }

      let repoEntry = result[url.hostname].find(
        (entry: any) => typeof entry === "object" && entry.hasOwnProperty(repo)
      );
      if (!repoEntry) {
        repoEntry = { [repo]: [] };
        result[url.hostname].push(repoEntry);
      }

      if (repoPath) {
        let pathEntry = repoEntry[repo].find(
          (entry: any) =>
            typeof entry === "object" && entry.hasOwnProperty(repoPath)
        );
        if (!pathEntry) {
          pathEntry = { [repoPath]: [] };
          repoEntry[repo].push(pathEntry);
        }

        pathEntry[repoPath].push(filename);
      } else {
        if (
          repoEntry[repo].length > 0 &&
          typeof repoEntry[repo][0] === "string"
        ) {
          repoEntry[repo] = repoEntry[repo].filter(
            (entry: any) => typeof entry !== "string"
          );
        }
        repoEntry[repo].push(filename);
      }
    }
  });

  Object.keys(result).forEach((hostname) => {
    result[hostname].forEach((repoEntry: any) => {
      Object.keys(repoEntry).forEach((repo) => {
        if (repoEntry[repo].some((entry: any) => typeof entry === "object")) {
          repoEntry[repo] = repoEntry[repo].filter(
            (entry: any) => typeof entry === "object"
          );
        }
      });
    });
  });

  return result;
};
