export interface SimProcess {
  pid: number;
  killed: boolean;
  ownedPtrs: Set<number>; // ptrs created by this process (used by kill to free all)
}
