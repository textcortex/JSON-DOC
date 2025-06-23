import React, { createContext, useContext, ReactNode, useState } from "react";

interface RendererContextValue {
  devMode?: boolean;
  resolveImageUrl?: (url: string) => Promise<string>;
  showBackrefs: boolean;
  toggleBackrefs: () => void;
}

const RendererContext = createContext<RendererContextValue>({
  showBackrefs: true,
  toggleBackrefs: () => {},
});

export const useRenderer = () => {
  return useContext(RendererContext);
};

interface RendererProviderProps {
  children: ReactNode;
  value: Omit<RendererContextValue, "showBackrefs" | "toggleBackrefs">;
}

export const RendererProvider: React.FC<RendererProviderProps> = ({
  children,
  value,
}) => {
  const [showBackrefs, setShowBackrefs] = useState(true);

  const toggleBackrefs = () => {
    setShowBackrefs((prev) => !prev);
  };

  const contextValue: RendererContextValue = {
    ...value,
    showBackrefs,
    toggleBackrefs,
  };

  return (
    <RendererContext.Provider value={contextValue}>
      {children}
    </RendererContext.Provider>
  );
};
//
