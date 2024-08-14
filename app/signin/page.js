"use client"; // Mark this as a Client Component

import { Box, Button, Typography, Stack } from "@mui/material";
import { signInWithGoogle, signInWithEmail } from "../firebase"; // Adjust the path

export default function SignIn() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();

      // Redirect to the protected route
      window.location.href = "/";
    } catch (error) {
      console.error("Google Sign In Error", error);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      alignContent={"center"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Stack direction={"column"} spacing={2} alignItems={"center"}>
        <Typography variant="h1" align="center" color="primary.main">
          Sign In
        </Typography>
        <Button variant="contained" onClick={handleGoogleSignIn} align="center">
          Sign in with Google
        </Button>
      </Stack>
    </Box>
  );
}
