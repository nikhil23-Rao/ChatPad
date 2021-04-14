import { REGISTER } from '@/apollo/Mutations';
import client from '../../apollo-client';
import { useRouter } from 'next/dist/client/router';

export const Register = async (
  profile: { image?: string | null | undefined; name?: string | null | undefined; email?: string | null | undefined },
  account: Record<string, unknown>,
) => {
  try {
    if (profile.image?.includes('https://avatars.githubusercontent')) {
      // Get Email From Github API
      const res = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${account.accessToken}`,
        },
      });
      const emails = await res.json();
      if (!emails || emails.length === 0) {
        return;
      }
      const sortedEmails = emails.sort((a: { primary: number }, b: { primary: number }) => b.primary - a.primary);
      profile.email = sortedEmails[0].email;
    }
  } catch (err) {
    console.log(err.message);
  }
};
