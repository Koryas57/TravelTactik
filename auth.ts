import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getSql } from "./lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  // v4: OK d'utiliser secret ici
  secret: process.env.AUTH_SECRET,

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      const sql = getSql();

      const rows = await sql`
        insert into users (email, name, image)
        values (${email}, ${user.name ?? null}, ${user.image ?? null})
        on conflict (email)
        do update set
          name = excluded.name,
          image = excluded.image,
          updated_at = now()
        returning id;
      `;

      const userId = rows?.[0]?.id;

      if (userId) {
        await sql`
          update leads
          set user_id = ${userId}
          where user_id is null
            and lower(email) = ${email};
        `;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) token.email = user.email.toLowerCase();
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = String(token.email);
      }
      return session;
    },
  },
};
