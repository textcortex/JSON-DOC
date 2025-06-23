export interface FileOption {
  name: string;
  path: string;
}

export const AVAILABLE_FILES: FileOption[] = [
  { name: "Spacing Test", path: "/spacing_test.json" },
  { name: "Test Document", path: "/test_document.json" },
  { name: "Real Document", path: "/real_doc.json" },
];
