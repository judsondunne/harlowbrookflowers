import { rmSync } from "node:fs";

/** Removes the temporary default database the app connection uses during tests. */
export default function setup() {
  return () => {
    const url = process.env.HB_TEST_DB_URL ?? "";
    if (!url.startsWith("file:")) return;
    const file = url.slice("file:".length);
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${file}${suffix}`, { force: true });
  };
}
