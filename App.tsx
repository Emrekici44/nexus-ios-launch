import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NexusWebView, type NexusWebViewHandle } from './src/NexusWebView';
import { SettingsSheet } from './src/SettingsSheet';
import { STORAGE_KEYS } from './src/config';
import { readBoolean, writeBoolean } from './src/native-storage';

export default function App() {
  const webViewRef = useRef<NexusWebViewHandle>(null);
  const authRunningRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [webRelease, setWebRelease] = useState<string | null>(null);

  const unlock = useCallback(async (enabled: boolean) => {
    if (authRunningRef.current) return;
    if (!enabled) {
      setUnlocked(true);
      return;
    }

    authRunningRef.current = true;
    try {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (!hasHardware || !isEnrolled) {
        setUnlocked(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Nexus entsperren',
        fallbackLabel: 'Code verwenden',
        cancelLabel: 'Abbrechen',
      });
      setUnlocked(result.success);
    } finally {
      authRunningRef.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void readBoolean(STORAGE_KEYS.faceIdEnabled, true).then((enabled) => {
      if (!mounted) return;
      setFaceIdEnabled(enabled);
      setPreferencesReady(true);
      void unlock(enabled);
    });
    return () => {
      mounted = false;
    };
  }, [unlock]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previous = appStateRef.current;
      appStateRef.current = nextState;
      if (faceIdEnabled && nextState === 'background') {
        setUnlocked(false);
      }
      if (nextState === 'active' && previous === 'background') {
        void unlock(faceIdEnabled);
        void webViewRef.current?.checkForWebUpdate();
      }
    });
    return () => subscription.remove();
  }, [faceIdEnabled, unlock]);

  const changeFaceId = useCallback((enabled: boolean) => {
    setFaceIdEnabled(enabled);
    setUnlocked(true);
    void writeBoolean(STORAGE_KEYS.faceIdEnabled, enabled);
  }, []);

  if (!preferencesReady || !unlocked) {
    return (
      <SafeAreaView style={styles.lockScreen}>
        <StatusBar style="light" />
        <View style={styles.logo}>
          <View style={[styles.tile, styles.tileLarge]} />
          <View style={[styles.tile, styles.tileTop]} />
          <View style={[styles.tile, styles.tileBottom]} />
        </View>
        <Text style={styles.lockTitle}>Nexus</Text>
        <Text style={styles.lockText}>Dein persönlicher Bereich ist geschützt.</Text>
        {preferencesReady ? (
          <Pressable style={styles.unlockButton} onPress={() => void unlock(faceIdEnabled)}>
            <Text style={styles.unlockButtonText}>Mit Face ID entsperren</Text>
          </Pressable>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="light" />
      <NexusWebView ref={webViewRef} onReleaseChange={setWebRelease} />
      <Pressable
        accessibilityLabel="App-Einstellungen öffnen"
        accessibilityRole="button"
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
      >
        <Text style={styles.settingsGlyph}>•••</Text>
      </Pressable>
      <SettingsSheet
        visible={settingsVisible}
        faceIdEnabled={faceIdEnabled}
        webRelease={webRelease}
        onClose={() => setSettingsVisible(false)}
        onFaceIdChange={changeFaceId}
        onReload={() => {
          setSettingsVisible(false);
          webViewRef.current?.reload();
        }}
        onResetCache={() => {
          setSettingsVisible(false);
          webViewRef.current?.resetWebCache();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#000000' },
  settingsButton: {
    position: 'absolute',
    top: 54,
    right: 13,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a2a2a',
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  settingsGlyph: { marginTop: -6, color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  lockScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#000000',
  },
  logo: { width: 86, height: 86, marginBottom: 24 },
  tile: { position: 'absolute', borderRadius: 12 },
  tileLarge: { left: 0, top: 0, width: 53, height: 53, backgroundColor: '#2e9eff' },
  tileTop: { right: 0, top: 0, width: 27, height: 27, backgroundColor: '#0c79d8' },
  tileBottom: { right: 0, bottom: 0, width: 53, height: 53, backgroundColor: '#68c4ff' },
  lockTitle: { color: '#ffffff', fontSize: 34, fontWeight: '900' },
  lockText: { marginTop: 9, color: '#a1a1aa', fontSize: 16, textAlign: 'center' },
  unlockButton: {
    minWidth: 230,
    marginTop: 30,
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 15,
    backgroundColor: '#2e9eff',
  },
  unlockButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
});
