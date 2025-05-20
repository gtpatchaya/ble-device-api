import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/response";

dayjs.extend(relativeTime);

export const calculationAlgoholValue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { val } = req.params;
    const value = Number(val);
    console.log("value", value);

    if (isNaN(value)) {
      res
        .status(400)
        .json(successResponse(400, "Invalid value parameter", null));
      return;
    }

    let status = "low";
    if (value >= 50) {
      status = "height";
    } else if (value >= 20 && value < 50) {
      status = "medium";
    }

    let waitTime = null;
    if (value > 49) {
      const raw = (value - 49) / 10;
      const hours = Math.floor(raw);
      const minutes = Math.round((raw - hours) * 60);

      // ใช้ dayjs คำนวณเวลาปัจจุบัน + เวลาที่ต้องรอ
      const now = dayjs();
      const waitUntil = now.add(hours, "hour").add(minutes, "minute");

      let display = "";
      if (hours > 0) {
        display += `${hours} ชั่วโมง `;
      }
      display += `${minutes} นาที`;

      waitTime = {
        hours,
        minutes,
        display: display.trim(),
        waitUntil: waitUntil.toISOString(), // ex: "2025-05-21T04:36:00.000Z"
        waitUntilFormatted: waitUntil.format("YYYY-MM-DD HH:mm:ss"), // ex: "2025-05-21 11:36:00"
        waitUntilRelative: waitUntil.fromNow(), // ต้องใช้ plugin "relativeTime"
      };
    }

    const response = {
      value,
      status,
      waitTime,
    };

    res.status(200).json(successResponse(200, "Success", response));
  } catch (error) {
    next(error);
  }
};
