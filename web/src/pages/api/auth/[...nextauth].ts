import client from '@/../apollo-client';
import { REGISTER } from '@/apollo/Mutations';
import { GetGithubEmail } from '@/auth/GetGithubEmail';
import { generateId } from '@/utils/GenerateId';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
    signIn: async (profile, account): Promise<any> => {
      try {
        await GetGithubEmail(profile, account);

        await client.mutate({
          mutation: REGISTER,
          variables: {
            username: profile.name,
            email: profile.email,
            password: generateId(15),
            profile_picture: profile.image,
            id: generateId(24),
          },
        });
        
      } catch (err) {
        console.log(err);
      }
    },
  },
});
