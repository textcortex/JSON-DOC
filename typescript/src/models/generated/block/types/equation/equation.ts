import type { BlockBase } from "../../base";

export type EquationBlock = BlockBase & {
  type: "equation";
  equation: {
    expression: string;
  };
};
