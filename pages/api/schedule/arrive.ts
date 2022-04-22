import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";
import {
  OFFICE_IP_ADDRESSES,
  ScheduleType,
  TYPE_OFFICE,
  TYPE_OUTSIDE,
} from "@constants";

interface ScheduleParams {
  type: ScheduleType;
  startedAt?: Date;
  modified?: boolean;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { type, startedAt, modified }: ScheduleParams = req.body;

  let data;

  if (!req.session.user) {
    return res.json({
      ok: false,
      error: "user not found",
    });
  }

  const ipAddress =
    req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || "";

  if (type === TYPE_OFFICE) {
    if (Array.isArray(ipAddress) || !OFFICE_IP_ADDRESSES.includes(ipAddress)) {
      return res.json({
        ok: false,
        error: "Invalid  ip address.",
      });
    }

    data = {
      type,
      startedAt: new Date(),
      modified: false,
    };
  } else if (type === TYPE_OUTSIDE) {
    data = {
      type,
      startedAt: new Date(),
      modified: false,
    };
  } else {
    return;
  }

  const newSchedule = await client.schedule.create({
    data: {
      ...data,
      user: {
        connect: {
          id: req.session.user.id,
        },
      },
    },
  });

  if (newSchedule) {
    return res.json({
      ok: true,
    });
  } else {
    return res.json({
      ok: false,
      error: "Schedule not created!",
    });
  }
}

export default withApiSession(withHandler({ methods: ["POST"], handler }));
