import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import bcrypt from "bcrypt";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ ok: false, error: "username or password not given." });

  const user = await client.user.findFirst({
    where: {
      username,
    },
  });

  if (!user) {
    return res.status(400).json({ ok: false, error: "User not found." });
  }

  const passwordOk = await bcrypt.compare(password, user.password);

  if (!passwordOk)
    return res.status(400).json({ ok: false, error: "Incorrect password" });

  req.session.user = {
    id: user.id,
  };

  await req.session.save();

  return res.json({ ok: true });
}

export default withApiSession(
  withHandler({ methods: ["POST"], handler, isPrivate: false })
);
