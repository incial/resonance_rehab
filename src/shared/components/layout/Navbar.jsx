import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HamburgerButton from "@/shared/components/ui/HamburgerButton";
import Sidebar from "@/shared/components/ui/Sidebar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogoClick = () => {
    setIsOpen(false);
    if (
      window.location.pathname === "/" ||
      window.location.pathname === "/home"
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className={`navbar main-navbar fixed top-0 left-0 w-full z-9999 px-4 sm:px-6 md:px-0 py-3 sm:py-4 md:py-2 transition-all duration-300 ${
        isOpen ? "nav-open" : ""
      } ${isScrolled ? "bg-white/10 backdrop-blur-xs " : "bg-transparent"}`}
    >
      <Link
        to="/"
        onClick={handleLogoClick}
        className="hidden md:inline-block absolute left-4 top-1/2 -translate-y-1/2 z-10003"
      >
        <img
          src="/images/Hero/logoorg.png"
          alt="Resonance Rehab logo"
          className="h-12 w-auto sm:h-16 md:h-20"
        />
      </Link>
      <Link
        className={`text-primary-color mt-0 md:mt-3 font-editorial text-lg sm:text-xl md:text-2xl relative md:absolute md:left-1/2 md:-translate-x-1/2 z-10002 transition-opacity duration-300 inline-block ${
          isOpen
            ? "md:opacity-0 pointer-events-none text-primary-color!"
            : "md:opacity-100"
        }`}
        to="/"
        onClick={handleLogoClick}
      >
        Resonance Rehab
      </Link>
      <HamburgerButton
        className={`md:ml-auto md:pr-7 z-10001 ml-auto ${
          isOpen ? "[&_span]:bg-primary-color!" : ""
        }`}
        isOpen={isOpen}
        toggle={toggleMenu}
      />

      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default Navbar;
