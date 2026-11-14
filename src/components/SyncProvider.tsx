"use client";

import { useEffect } from "react";
import { startSync } from "@/lib/sync/engine";

/** Avvia la sincronizzazione con il server appena si apre l'app. */
export function SyncProvider() {
  useEffect(() => startSync(), []);
  return null;
}
