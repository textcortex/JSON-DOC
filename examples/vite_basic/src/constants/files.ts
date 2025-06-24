export interface BackrefOption {
  end_idx: number;
  page_id?: string;
  block_id?: string;
  start_idx: number;
}

export interface FileOption {
  name: string;
  path: string;
  backrefs?: BackrefOption[];
}

export const AVAILABLE_FILES: FileOption[] = [
  { name: "Spacing Test", path: "/spacing_test.json" },
  { name: "Test Document", path: "/test_document.json" },
  {
    name: "Real Document",
    path: "/real_doc.json",
    backrefs: [
      {
        end_idx: 82,
        block_id: "bk_01jxyv2pekf4bs9a82ayxsewga",
        start_idx: 0,
      },
      {
        end_idx: 125,
        block_id: "bk_01jxyv2pemfj3848ncdbap6xsa",
        start_idx: 8,
      },
      {
        end_idx: 100,
        block_id: "bk_01jxyv2pg6f8hbvmc960g8k58m",
        start_idx: 0,
      },
      {
        end_idx: 30,
        block_id: "bk_01jxyv2pepepaam6k48t1s5c1q",
        start_idx: 6,
      },
      {
        end_idx: 20,
        block_id: "bk_01jxyv2peqfx1vv7xa8zq4ajfx",
        start_idx: 0,
      },
      {
        end_idx: 200,
        block_id: "bk_01jxyv2ppcf6xvxsh278d4e2je",
        start_idx: 30,
      },
      {
        end_idx: 11,
        block_id: "bk_01jxyv2pesedv9dfz1e6ekbsj8",
        start_idx: 1,
      },
    ],
  },
  {
    name: "Epic Web",
    path: "/epic-web.json",
    backrefs: [
      {
        end_idx: 68,
        page_id: "pg_01jygn5qmzexnvjrypnh41k8we",
        start_idx: 0,
      },
    ],
  },
];
