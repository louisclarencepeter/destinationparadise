import { useEffect, useImperativeHandle, useRef } from "react";
import { MAP_CHANNEL } from "./map-protocol";
import type { MapFrameProps } from "./map-frame-types";

export default function MapFrame({
  html,
  token,
  onMessage,
  onError,
  ref,
}: MapFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      send(command) {
        frame.current?.contentWindow?.postMessage(
          { channel: MAP_CHANNEL, token, command },
          "*",
        );
      },
    }),
    [token],
  );
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      // srcDoc runs with an opaque origin; only this exact frame may talk to us.
      if (
        event.source === frame.current?.contentWindow &&
        event.origin === "null"
      )
        onMessage(event.data);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onMessage]);
  return (
    <iframe
      ref={frame}
      title="Interactive destination map"
      srcDoc={html}
      sandbox="allow-scripts"
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() =>
        frame.current?.contentWindow?.postMessage(
          { channel: MAP_CHANNEL, token, command: { type: "ping" } },
          "*",
        )
      }
      onError={onError}
      style={{
        border: 0,
        display: "block",
        height: "100%",
        width: "100%",
        background: "#0b2839",
      }}
    />
  );
}
