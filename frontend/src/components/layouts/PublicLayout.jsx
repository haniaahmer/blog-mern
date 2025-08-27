import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
};

export default PublicLayout;
