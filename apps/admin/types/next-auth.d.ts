import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      churchId?: string | null;
      churchName?: string | null;
      roles?: string[];
    };
  }

  interface User {
    id: string;
    churchId?: string | null;
    churchName?: string | null;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    churchId?: string | null;
    churchName?: string | null;
    roles?: string[];
  }
}
