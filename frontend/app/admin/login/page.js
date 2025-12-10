import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Admin Login – Annapurna Hospital',
  description: 'Admin access to Annapurna Hospital dashboard.',
};

export default function AdminLoginPage() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Login</h1>
      <LoginForm />
    </div>
  );
}
