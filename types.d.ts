import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      platformRole?: "USER" | "ADMIN";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
