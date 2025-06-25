
import React from 'react';
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 bg-gray-50">
      <div className="container mx-auto px-4">
        <Separator className="mb-4" />
        <div className="text-center text-sm text-gray-600">
          <p>© {currentYear} Green Escape: Return from the Future. All rights reserved.</p>
          <p className="mt-1">Educational escape room game for children aged 8-12</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
