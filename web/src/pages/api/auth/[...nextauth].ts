import client from '@/../apollo-client';
import { REGISTER } from '@/apollo/Mutations';
import { GetGithubEmail } from '@/auth/GetGithubEmail';
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
        console.log(profile);
        function makeid(length: number) {
          var result = [];
          var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          var charactersLength = characters.length;
          for (var i = 0; i < length; i++) {
            result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
          }
          return result.join('');
        }

        await client.mutate({
          mutation: REGISTER,
          variables: {
            username: profile.name,
            email: profile.email,
            password: makeid(15),
            profile_picture: profile.image,
            id: makeid(24),
          },
        });
      } catch (err) {
        console.log(err);
      }
    },
  },
});
