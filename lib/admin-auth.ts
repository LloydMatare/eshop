import { auth } from "@clerk/nextjs/server";
import { authFromRequest } from "./clerk-auth";
import { clerkClient } from "@clerk/nextjs/server";
import { isAdminUser } from "./is-admin";

export async function requireAdmin(req?: Request) {
  let userId: string | null = null;

  if (req) {
    try {
      const { userId: uid, sessionClaims } = await authFromRequest(req);
      userId = uid;

      if (uid && isAdminUser(sessionClaims?.metadata)) {
        return { userId: uid };
      }
    } catch {
      // fall through to API check below
    }
  } else {
    const { sessionClaims, userId: uid } = await auth();
    userId = uid;

    if (userId && isAdminUser(sessionClaims?.metadata)) {
      return { userId };
    }
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    if (!isAdminUser(user.publicMetadata)) {
      throw new Error("Unauthorized");
    }
  } catch {
    throw new Error("Unauthorized");
  }

  return { userId };
}
