import type { RichTextText } from "../block/types/rich_text/text";
import type { Block } from "../block";

export interface Page {
  object: "page";
  id: string;
  parent?: {
    type: string;
    page_id?: string;
  };
  created_time: string;
  created_by?: {
    object: "user";
    id: string;
  };
  last_edited_time?: string;
  last_edited_by?: {
    object: "user";
    id: string;
  };
  icon?: {
    type: "emoji";
    emoji: string;
  };
  archived?: boolean;
  in_trash?: boolean;
  properties: {
    title?: {
      id?: string;
      type?: "title";
      title?: RichTextText[];
    };
  };
  children: Block[];
}
