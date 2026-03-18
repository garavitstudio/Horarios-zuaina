import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;

        const validUser = process.env.AUTH_USERNAME ?? "zuaina";
        const validPass = process.env.AUTH_PASSWORD ?? "Horarioszuaina";

        const userMatch = username.toLowerCase() === validUser.toLowerCase();
        const passMatch = password === validPass;

        if (userMatch && passMatch) {
          return {
            id: "1",
            name: "Zuaina Admin",
            email: "admin@zuaina.es",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  trustHost: true,
});
