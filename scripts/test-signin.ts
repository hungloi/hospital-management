import { signIn } from '../src/auth';

async function test() {
  try {
    await signIn('credentials', { email: 'letan1@bvhungloi.vn', password: 'password123', redirect: false });
    console.log('SignIn completed without throw');
  } catch (error: any) {
    console.log('SignIn threw:', error.name, error.type, error.message);
  }
}

test();
