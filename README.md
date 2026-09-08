# Nexus iOS

Eigenständige iPhone-App für Nexus. Dieses Projekt ist bewusst vollständig vom Nexus-Webprojekt getrennt. Es lädt ausschließlich die veröffentlichte Webanwendung unter:

`https://nexus.ekici-emre.chatgpt.site`

## Bereits vorbereitet

- Expo-Projektinhaber: `emrekici`
- iOS Bundle-ID: `com.emreekici.nexus`
- App-Version: `0.1.1`, Build `2`
- EAS-Profile für Entwicklung, interne Vorschau und TestFlight/App Store
- geschützter Nexus-Container mit Face ID bzw. Gerätecode
- automatische Erkennung eines neuen Nexus-Webstands über `/api/version`
- Reparatur der Web-Ansicht ohne Löschen und erneutes Installieren der App
- externe Links werden außerhalb des Nexus-Containers geöffnet
- keinerlei Apple-, Expo-, Nexus- oder E-Mail-Zugangsdaten im Quellcode

## Einmalige Expo-Verknüpfung

Die folgenden Befehle werden in diesem Ordner ausgeführt. Passwörter und Zwei-Faktor-Codes werden nur direkt in den offiziellen Anmeldedialogen eingegeben.

```bash
npm install
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest init
npx eas-cli@latest build:configure
```

Bei `eas init` ein neues Projekt namens **Nexus iOS** im Expo-Account **emrekici** anlegen. EAS ergänzt anschließend automatisch die echte `projectId` in `app.json`.

### Nur mit dem iPhone: GitHub Codespaces

1. Auf GitHub ein leeres **privates** Repository `nexus-ios` anlegen.
2. Dieses Projekt in das Repository einspielen und committen.
3. Auf der Repository-Seite **Code → Codespaces → Create codespace on main** öffnen.
4. Im Codespaces-Terminal `npm install` ausführen.
5. Danach `npx eas-cli@latest login --no-browser` ausführen und Expo-Benutzername, Passwort und gegebenenfalls Zwei-Faktor-Code ausschließlich dort eingeben.
6. Mit `npx eas-cli@latest whoami` kontrollieren, dass `emrekici` angezeigt wird.
7. `npx eas-cli@latest init` ausführen und ein neues Expo-Projekt im Account `emrekici` verknüpfen.

Der Schalter `--no-browser` ist in Codespaces auf dem iPhone wichtig: Ein Browser-Login würde sonst zu `localhost` auf dem iPhone zurückleiten, statt in das Codespace-Terminal.

## Erster TestFlight-Build

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```

Beim ersten Build darf EAS die Apple-Signatur und Zertifikate verwalten. Für die Apple-Anmeldung den bereits aktivierten Apple-Developer-Account verwenden. Keine Zugangsdaten in Dateien oder Chats speichern.

Nach dem erfolgreichen Build in App Store Connect unter **Apps → + → Neue App** den Eintrag anlegen, falls Expo ihn nicht bereits angelegt hat:

- Plattform: iOS
- Name: Nexus
- Primäre Sprache: Deutsch
- Bundle-ID: `com.emreekici.nexus`
- SKU: `nexus-ios-001`

Danach den oben genannten `eas submit`-Befehl ausführen.

Danach erscheint der hochgeladene Build in App Store Connect. Dort unter **TestFlight** die Verarbeitung abwarten und den eigenen Apple-Account als internen Tester hinzufügen. Auf dem iPhone die Apple-App **TestFlight** installieren und Nexus darüber öffnen.

## Lokale Prüfung

```bash
npm run check
npm run doctor
```

Face ID funktioniert auf dem iPhone erst in einem Development- oder TestFlight-Build vollständig; Expo Go unterstützt Face ID auf iOS nicht.

## Expo Go oder TestFlight?

Für dieses Projekt ist **TestFlight der normale Weg**. Expo Go ist nur für schnelle JavaScript-Vorschauen gedacht und zeigt die App nicht als eigenständigen Nexus-Build mit vollständiger Face-ID-Unterstützung. Ein TestFlight-Build hat das eigene Nexus-Symbol, eigenen App-Speicher und verhält sich wie eine eigenständige App. TestFlight-Builds laufen nach 90 Tagen ab; rechtzeitig wird ein neuer Build hochgeladen.

## Klare Projektgrenze

Änderungen in diesem Ordner ändern niemals die Nexus-Webanwendung. Neue veröffentlichte Nexus-Webversionen werden von der App lediglich geladen. Native Funktionen wie HealthKit, Schlüsselbund-basierter WEB.DE-Zugriff oder Push-Mitteilungen werden später ausschließlich hier ergänzt.
