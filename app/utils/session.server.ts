import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "remix";
import { db } from "./db.server";

type SignInForm = {
  email: string;
  password: string;
};

export async function register({ email, password }: SignInForm) {
  const passwordHash = await bcrypt.hash(password, 10);
  return db.user.create({
    data: { email, passwordHash, role: "customer" },
  });
}

export async function signIn({ email, password }: SignInForm) {
  // await bcrypt.hash(password, 10)
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null;

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;
  return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "AC_session",
      secure: true,
      secrets: [sessionSecret],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  });

export function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (typeof userId !== "number") return null;
  return userId;
}

export async function requireUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (typeof userId !== "number") throw redirect("/signin");
  return userId;
}

// export async function getUser(request: Request) {
//   const userId = await getUserId(request);
//   if (typeof userId !== "number") return null;

//   try {
//     const user = await db.user.findUnique({ where: { id: userId } });
//     return user;
//   } catch {
//     throw signOut(request);
//   }
// }

export async function signOut(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

export async function createUserSession(
  userId: number,
  email: string,
  role: string,
  redirectTo: string
) {
  const session = await getSession();
  session.set("userId", userId);
  session.set("email", email);
  session.set("role", role);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}
