import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail } from '../firebase';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailSignIn = () => {
    signInWithEmail(email, password);
  };

  return (
    <div>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button onClick={handleEmailSignIn}>Sign in with Email</button>
    </div>
  );
};

export default Auth;