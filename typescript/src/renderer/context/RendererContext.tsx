import React, { createContext, useContext, ReactNode } from "react";

interface RendererContextValue {
  devMode?: boolean;
  resolveImageUrl?: (url: string) => Promise<string>;
}

const RendererContext = createContext<RendererContextValue>({});

export const useRenderer = () => {
  return useContext(RendererContext);
};

interface RendererProviderProps {
  children: ReactNode;
  value: RendererContextValue;
}

export const RendererProvider: React.FC<RendererProviderProps> = ({
  children,
  value,
}) => {
  return (
    <RendererContext.Provider value={value}>
      {children}
    </RendererContext.Provider>
  );
};
