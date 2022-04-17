import { joinClassNames } from "@libs/client/util";
import React from "react";
import Seo from "./Seo";

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
  whiteBackground?: boolean;
}

const Layout = ({ title, children, whiteBackground = false }: LayoutProps) => {
  return (
    <div
      className={joinClassNames(
        "h-full overflow-y-scroll",
        whiteBackground ? "bg-white" : "bg-[#fafafb]"
      )}
    >
      <Seo title={title} />
      {children}
    </div>
  );
};

export default Layout;
