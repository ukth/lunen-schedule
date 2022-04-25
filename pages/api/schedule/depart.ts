import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";
import { OFFICE_IP_ADDRESSES, TYPE_OFFICE, TYPE_OUTSIDE } from "@constants";
import { ScheduleType } from "@prisma/client";

interface DepartParams {
  scheduleId: number;
  type: ScheduleType;
  finishedAt?: Date;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { type, scheduleId }: DepartParams = req.body;

  if (!req.session.user) {
    return res.json({
      ok: false,
      error: "user not found",
    });
  }

  const ipAddress =
    req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || "";

  const schedule = await client.schedule.findUnique({
    where: {
      id: scheduleId,
    },
  });

  if (!schedule) {
    return res.json({
      ok: false,
      error: "schedule not found",
    });
  }

  if (schedule.userId !== req.session.user.id) {
    return res.json({
      ok: false,
      error: "You can modify your own schedule only.",
    });
  }

  let data;

  if (type === TYPE_OFFICE) {
    if (Array.isArray(ipAddress) || !OFFICE_IP_ADDRESSES.includes(ipAddress)) {
      return res.json({
        ok: false,
        error: "Invalid  ip address.",
      });
    }

    data = {
      finishedAt: new Date(),
    };
  } else if (type === TYPE_OUTSIDE) {
    data = {
      type,
      finishedAt: new Date(),
    };
  } else {
    return;
  }

  const modified = await client.schedule.update({
    where: {
      id: scheduleId,
    },
    data,
  });

  if (modified) {
    return res.json({
      ok: true,
    });
  } else {
    return res.json({
      ok: false,
      error: "Schedule not modified!",
    });
  }
}

export default withApiSession(withHandler({ methods: ["POST"], handler }));
