export interface BlockBase {
  object: "block";
  id: string;
  parent?: {
    type: string;
    block_id?: string;
    page_id?: string;
  };
  type: string;
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
  archived?: boolean;
  in_trash?: boolean;
  has_children?: boolean;
  metadata?: {};
}
