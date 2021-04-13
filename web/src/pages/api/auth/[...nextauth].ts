import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: null,
  },
  callbacks: {
    signIn: async (profile, account, metaData): Promise<any> => {
      const res = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${account.accessToken}`,
        },
      });
      const emails = await res.json();
      if (!emails || emails.length === 0) {
        return;
      }
      const sortedEmails = emails.sort((a: any, b: any) => b.primary - a.primary);
      profile.email = sortedEmails[0].email;
    },
  },
});
