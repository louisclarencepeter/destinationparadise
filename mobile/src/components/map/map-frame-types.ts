import type { Ref } from "react";
import type { MapCommand } from "./map-protocol";
export type MapFrameHandle = { send: (command: MapCommand) => void };
export type MapFrameProps = {
  html: string;
  token: string;
  onMessage: (raw: unknown) => void;
  onError: () => void;
  ref?: Ref<MapFrameHandle>;
};
