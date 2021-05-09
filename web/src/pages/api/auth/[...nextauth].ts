import client from '@/../apollo-client';
import { LOGIN, REGISTER } from '@/apollo/Mutations';
import { GetGithubEmail } from '@/auth/GetGithubEmail';
import { generateId } from '@/utils/GenerateId';
import { useToast } from '@chakra-ui/toast';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { useRouter } from 'next/dist/client/router';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      state: false,
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      state: false,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    verifyRequest: '/auth/verify-request',
    newUser: null,
  },

  callbacks: {
    signIn: async (profile, account): Promise<any> => {
      await GetGithubEmail(profile, account);
      try {
        await client.mutate({
          mutation: REGISTER,
          variables: {
            username: profile.name,
            email: profile.email,
            password: generateId(15),
            profile_picture: profile.image,
            id: generateId(24),
            oauth: true,
          },
        });
      } catch (err) {
        console.log(err);
        if (!err.message.includes('Account')) {
          await client.mutate({
            mutation: LOGIN,
            variables: {
              email: profile.email,
            },
          });
        }
      }
    },
  },
});
