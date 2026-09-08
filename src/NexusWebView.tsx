import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import {
  CURRENT_WEB_VERSION,
  NEXUS_ORIGIN,
  NEXUS_URL,
  STORAGE_KEYS,
  VERSION_URL,
} from './config';
import { readText, writeText } from './native-storage';

export type NexusWebViewHandle = {
  reload: () => void;
  resetWebCache: () => void;
  checkForWebUpdate: () => Promise<void>;
};

export type NexusWebViewProps = {
  onReleaseChange: (releaseId: string | null) => void;
};

type VersionResponse = { releaseId?: unknown; version?: unknown };

function freshUrl(reason: string) {
  const url = new URL(NEXUS_URL);
  url.searchParams.set('__nexus_native', 'ios');
  url.searchParams.set('__nexus_resume', `${reason}-${Date.now()}`);
  return url.toString();
}

function isAllowedInWebView(url: string) {
  if (url === 'about:blank') return true;
  try {
    return new URL(url).origin === NEXUS_ORIGIN;
  } catch {
    return false;
  }
}

export const NexusWebView = forwardRef<NexusWebViewHandle, NexusWebViewProps>(
  function NexusWebView({ onReleaseChange }, forwardedRef) {
    const webViewRef = useRef<WebView>(null);
    const [sourceUrl, setSourceUrl] = useState(() => freshUrl('start'));
    const [webViewKey, setWebViewKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const restart = useCallback(async (clearCache: boolean) => {
      if (clearCache) {
        try {
          webViewRef.current?.clearCache(true);
        } catch {
          // Recreating WKWebView is the fallback when cache clearing is unavailable.
        }
      }
      setError(null);
      setLoading(true);
      setSourceUrl(freshUrl(clearCache ? 'cache-reset' : 'reload'));
      setWebViewKey((current) => current + 1);
    }, []);

    const checkForWebUpdate = useCallback(async () => {
      try {
        const response = await fetch(`${VERSION_URL}?native=${Date.now()}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) return;
        const data = (await response.json()) as VersionResponse;
        const releaseId =
          typeof data.releaseId === 'string' ? data.releaseId : null;
        const version =
          typeof data.version === 'string' || typeof data.version === 'number'
            ? String(data.version)
            : CURRENT_WEB_VERSION;
        onReleaseChange(version);
        if (!releaseId) return;

        const previous = await readText(STORAGE_KEYS.lastWebRelease);
        await writeText(STORAGE_KEYS.lastWebRelease, releaseId);
        if (previous && previous !== releaseId) await restart(true);
      } catch {
        // A failed version probe must never hide a web view that is otherwise usable.
      }
    }, [onReleaseChange, restart]);

    useImperativeHandle(
      forwardedRef,
      () => ({
        reload: () => void restart(false),
        resetWebCache: () => void restart(true),
        checkForWebUpdate,
      }),
      [checkForWebUpdate, restart],
    );

    const handleNavigation = useCallback((request: WebViewNavigation) => {
      if (isAllowedInWebView(request.url)) return true;
      if (/^https?:\/\//i.test(request.url)) void Linking.openURL(request.url);
      return false;
    }, []);

    return (
      <View style={styles.root}>
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{ uri: sourceUrl }}
          style={styles.webView}
          originWhitelist={[NEXUS_ORIGIN]}
          onShouldStartLoadWithRequest={handleNavigation}
          onLoadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onLoadEnd={() => {
            setLoading(false);
            void checkForWebUpdate();
          }}
          onError={() => {
            setLoading(false);
            setError('Nexus konnte gerade nicht geladen werden.');
          }}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.statusCode >= 500) {
              setError('Der Nexus-Dienst antwortet gerade nicht zuverlässig.');
            }
          }}
          onContentProcessDidTerminate={() => void restart(true)}
          allowsBackForwardNavigationGestures
          allowsInlineMediaPlayback
          bounces={false}
          cacheEnabled={false}
          domStorageEnabled
          javaScriptEnabled
          pullToRefreshEnabled
          setSupportMultipleWindows={false}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled={false}
          applicationNameForUserAgent="Nexus-iOS/0.1"
        />

        {loading ? (
          <View pointerEvents="none" style={styles.loading}>
            <ActivityIndicator size="large" color="#68c4ff" />
            <Text style={styles.loadingText}>Nexus wird geöffnet …</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorPanel}>
            <Text style={styles.errorTitle}>Verbindung unterbrochen</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.primaryButton} onPress={() => void restart(true)}>
              <Text style={styles.primaryButtonText}>Neu verbinden</Text>
            </Pressable>
            <Pressable onPress={() => void Linking.openURL(NEXUS_URL)}>
              <Text style={styles.link}>In Safari öffnen</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  webView: { flex: 1, backgroundColor: '#000000' },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: '#000000',
  },
  loadingText: { color: '#cbd8e6', fontSize: 15, fontWeight: '600' },
  errorPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 28,
    backgroundColor: '#000000',
  },
  errorTitle: { color: '#ffffff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  errorText: { color: '#aebed0', fontSize: 16, lineHeight: 23, textAlign: 'center' },
  primaryButton: {
    minWidth: 190,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#2e9eff',
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  link: { padding: 8, color: '#68c4ff', fontSize: 15, fontWeight: '700' },
});
