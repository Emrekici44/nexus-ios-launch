# Architekturgrenze

## Quelle

Die produktive Webanwendung bleibt das alleinige System für Nexus-Webversionen. Die iPhone-App kennt nur die öffentliche Adresse und den read-only Versionsendpunkt.

## Native Hülle

Die App verwaltet ausschließlich gerätebezogene Belange:

- Face ID und Gerätecode
- isolierte, verschlüsselte native Einstellungen
- Lebenszyklus und Wiederherstellung der WebView
- spätere iPhone-Funktionen wie HealthKit, Keychain und Push

## Keine Rückwirkung

- kein Import des Nexus-Webquellcodes
- kein gemeinsames Git-Repository
- kein gemeinsamer Build oder Release-Zähler
- keine Änderung am Hosting der Webanwendung
- keine Zugangsdaten im Projekt

Die einzige Laufzeitbeziehung ist: Die App ruft die bereits veröffentlichte Nexus-URL auf.
