
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function App() {
  const [text, setText] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadText = async () => {
      const response = await fetch('/load-text');
      const text = await response.text();
      setText(text);
    };
    loadText();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/save-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
      }),
    });
  };

  const handleLogout = async () => {
    await fetch('/logout');
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Enter Text</h2>
          <div className="mb-4">
            <textarea
              id="textArea"
              name="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="10"
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
