import * as Application from 'expo-application';
import {
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { NEXUS_URL } from './config';

type Props = {
  visible: boolean;
  faceIdEnabled: boolean;
  webRelease: string | null;
  onClose: () => void;
  onFaceIdChange: (enabled: boolean) => void;
  onReload: () => void;
  onResetCache: () => void;
};

function releaseLabel(version: string | null) {
  if (!version) return 'wird beim Start geprüft';
  return `Version ${version}`;
}

export function SettingsSheet({
  visible,
  faceIdEnabled,
  webRelease,
  onClose,
  onFaceIdChange,
  onReload,
  onResetCache,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>NEXUS IOS</Text>
            <Text style={styles.title}>App-Einstellungen</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fertig</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Mit Face ID schützen</Text>
              <Text style={styles.rowSubtitle}>Beim Öffnen und nach dem App-Wechsel entsperren.</Text>
            </View>
            <Switch
              value={faceIdEnabled}
              onValueChange={onFaceIdChange}
              trackColor={{ false: '#3f3f46', true: '#ffffff' }}
              thumbColor={faceIdEnabled ? '#000000' : '#ffffff'}
              ios_backgroundColor="#3f3f46"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Pressable style={styles.action} onPress={onReload}>
            <Text style={styles.actionText}>Nexus neu laden</Text>
          </Pressable>
          <View style={styles.separator} />
          <Pressable style={styles.action} onPress={onResetCache}>
            <Text style={styles.actionText}>Web-Ansicht reparieren</Text>
          </Pressable>
          <View style={styles.separator} />
          <Pressable style={styles.action} onPress={() => void Linking.openURL(NEXUS_URL)}>
            <Text style={styles.actionText}>Nexus in Safari öffnen</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Native App</Text>
          <Text style={styles.infoValue}>
            {Application.nativeApplicationVersion ?? '0.1.1'} ({Application.nativeBuildVersion ?? '2'})
          </Text>
          <Text style={[styles.infoLabel, styles.infoSpacing]}>Nexus-Webstand</Text>
          <Text style={styles.infoValue}>{releaseLabel(webRelease)}</Text>
          <Text style={styles.note}>
            App und Webprojekt bleiben getrennt. Diese App zeigt ausschließlich die veröffentlichte Nexus-Webanwendung an.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
  },
  eyebrow: { color: '#a1a1aa', fontSize: 12, fontWeight: '900', letterSpacing: 1.4 },
  title: { marginTop: 5, color: '#ffffff', fontSize: 26, fontWeight: '800' },
  closeButton: { paddingHorizontal: 12, paddingVertical: 10 },
  closeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  card: {
    marginHorizontal: 18,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#292929',
    borderRadius: 17,
    backgroundColor: '#111111',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18 },
  rowText: { flex: 1 },
  rowTitle: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  rowSubtitle: { marginTop: 5, color: '#a1a1aa', fontSize: 14, lineHeight: 20 },
  action: { paddingHorizontal: 18, paddingVertical: 17 },
  actionText: { color: '#f4f4f5', fontSize: 16, fontWeight: '700' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 18, backgroundColor: '#292929' },
  infoCard: { marginHorizontal: 22, marginTop: 8 },
  infoLabel: { color: '#71717a', fontSize: 12, fontWeight: '800', letterSpacing: 0.7 },
  infoValue: { marginTop: 4, color: '#d4d4d8', fontSize: 14 },
  infoSpacing: { marginTop: 14 },
  note: { marginTop: 20, color: '#71717a', fontSize: 13, lineHeight: 19 },
});
