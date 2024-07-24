import { Request, Response } from "express";

export const getData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!global.CACHE) {
      res.status(502).json({
        status: "Data is fetching",
        message: "Data is still fetching, please try later!",
      });
    } else {
      res.status(200).json({
        status: "Success",
        data: global.CACHE,
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      status: "Fail",
      message: "Error fetching data",
      error: error.message,
    });
  }
};
