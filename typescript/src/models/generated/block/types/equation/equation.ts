import type { Block } from "../../block";

export type EquationBlock = Block & {
  type: "equation";
  equation: {
    expression: string;
  };
};
