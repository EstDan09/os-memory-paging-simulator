export interface Page {
  id: number;
  pid: number;
  ptr: number;
  ptrPageIndex: number; // 0-based index of this page within the ptr's allocation
  usedBytes: number;    // actual bytes used (rest is internal fragmentation)
  inRam: boolean;
  frameIndex: number | null; // RAM frame (0-99), null if on disk
  diskAddress: number;       // disk address (always set, pageId * PAGE_SIZE)
  loadedAt: number;          // clock value when loaded into RAM
  lastUsed: number;          // clock value of last access (for LRU/MRU)
  mark: number;             // second-chance reference bit (for SC algorithm)
}
