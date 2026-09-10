import { useImperativeHandle, useRef } from "react";
import { Linking, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import {
  isAttributionLink,
  isMapDocument,
  MAP_BASE_URL,
  serializeForScript,
} from "./map-protocol";
import type { MapFrameProps } from "./map-frame-types";

export default function MapFrame({
  html,
  onMessage,
  onError,
  ref,
}: MapFrameProps) {
  const browser = useRef<WebView>(null);
  useImperativeHandle(
    ref,
    () => ({
      send(command) {
        browser.current?.injectJavaScript(
          `window.dpMap && window.dpMap.receive(${serializeForScript(command)}); true;`,
        );
      },
    }),
    [],
  );
  return (
    <WebView
      ref={browser}
      style={styles.frame}
      source={{ html, baseUrl: MAP_BASE_URL }}
      originWhitelist={[
        "about:blank",
        "https://yournexttriptoparadise.com",
        "https://www.openstreetmap.org",
        "https://openstreetmap.org",
        "https://leafletjs.com",
      ]}
      onShouldStartLoadWithRequest={({ url }) => {
        if (isMapDocument(url)) return true;
        if (isAttributionLink(url)) void Linking.openURL(url).catch(onError);
        return false;
      }}
      onMessage={(event) => onMessage(event.nativeEvent.data)}
      onLoadEnd={() =>
        browser.current?.injectJavaScript(
          "window.dpMap && window.dpMap.receive({type: 'ping'}); true;",
        )
      }
      onError={onError}
      onHttpError={onError}
      onContentProcessDidTerminate={onError}
      onRenderProcessGone={onError}
      javaScriptEnabled
      domStorageEnabled={false}
      mixedContentMode="never"
      allowFileAccess={false}
      allowFileAccessFromFileURLs={false}
      allowUniversalAccessFromFileURLs={false}
      setSupportMultipleWindows={false}
      javaScriptCanOpenWindowsAutomatically={false}
      geolocationEnabled={false}
      thirdPartyCookiesEnabled={false}
      sharedCookiesEnabled={false}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      textZoom={100}
      applicationNameForUserAgent="DestinationParadise/1.0 (yournexttriptoparadise.com)"
      accessible
      accessibilityLabel="Interactive destination map"
    />
  );
}
const styles = StyleSheet.create({
  frame: { flex: 1, backgroundColor: "#0b2839" },
});
