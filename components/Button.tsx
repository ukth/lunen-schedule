import { joinClassNames } from "@libs/client/util";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  styles?: string;
  onClick: () => void;
}

export const Button = ({ children, styles, onClick }: ButtonProps) => {
  return (
    <button
      className={joinClassNames(
        `flex justify-center items-center px-5 h-8 rounded-md 
     text-lg text-white hover:ring-2 ring-offset-1 ring-blue-400 bg-blue-400`,
        styles ?? ""
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
