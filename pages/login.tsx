
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Login request:', { username, password });
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    if (response.ok) {
      router.push('/app');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-xs">
<form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6">
  <h2 className="text-3xl font-extrabold text-center text-gray-900">Login</h2>
  <div>
    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
      Username
    </label>
    <input
      id="username"
      name="username"
      type="text"
      autoComplete="username"
      required
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
  </div>
  <div>
    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
      Password
    </label>
    <input
      id="password"
      name="password"
      type="password"
      autoComplete="current-password"
      required
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>
  <div>
    <button
      type="submit"
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Sign In
    </button>
  </div>
</form>
      </div>
    </div>
  );
}
