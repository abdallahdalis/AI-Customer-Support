import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase';

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/auth');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Welcome to the Chat</h1>
      {/* Your chat component goes here */}
    </div>
  );
}