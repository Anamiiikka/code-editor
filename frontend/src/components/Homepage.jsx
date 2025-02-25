import React, { useEffect } from "react";
import { Button, Typography, Container, Box } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // Redirect authenticated users to the dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container maxWidth="xl"
      
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
    {/* Abstract Background Shapes */}
    <Box
        sx={{
          position: "absolute",
          top: "-50px",
          left: "-80px",
          width: "250px",
          height: "200px",
          background: "linear-gradient(135deg, #BBE613, #D4FF2A)",
          borderRadius: "50%",
          filter: "blur(80px)",
          zIndex: -1,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-60px",
          right: "-90px",
          width: "250px",
          height: "250px",
          background: "linear-gradient(135deg, #BBE613, #D4FF2A)",
          borderRadius: "50%",
          filter: "blur(100px)",
          zIndex: -1,
        }}
      />
     

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Welcome to <span style={{ color: "#E0FF66" }}>CODEV</span>
      </Typography>
      <Typography variant="h6" color="text.secondary" maxWidth="600px" mb={3}>
      "Your AI pair programmer – faster, smarter, better!"
      </Typography>

      {/* Login Button */}
      <Button
        variant="contained"
        onClick={() => loginWithRedirect()}
        sx={{
          backgroundColor: "#E0FF66",
          color: "black",
          fontWeight: "bold",
          padding: "12px 24px",
          borderRadius: "8px",
          transition: "0.3s",
          "&:hover": {
            backgroundColor: "#D4FF2A",
          },
        }}
      >
        Get Started
      </Button>

      {/* Illustration */}
      <Box mt={4}>
        <img
          src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/programmer.gif"
          alt="Coding Illustration"
          width="500px"
        />
      </Box>
    </Container>
  );
};

export default Homepage;
