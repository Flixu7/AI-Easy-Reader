# Instrukcja Instalacji - English Simplifier

## 🚀 Szybka Instalacja

### Krok 1: Pobierz Rozszerzenie
1. Pobierz wszystkie pliki rozszerzenia do jednego folderu
2. Upewnij się, że masz wszystkie pliki:
   - `manifest.json`
   - `popup.html`
   - `popup.js`
   - `contentScript.js`
   - `background.js`
   - `images/` (folder z ikonami)

### Krok 2: Zainstaluj w Chrome
1. Otwórz Chrome i przejdź do `chrome://extensions/`
2. Włącz "Tryb programisty" (Developer mode) - przełącznik w prawym górnym rogu
3. Kliknij "Załaduj rozpakowane" (Load unpacked)
4. Wybierz folder z plikami rozszerzenia
5. Rozszerzenie powinno się pojawić na liście

### Krok 3: Skonfiguruj API Key
1. Kliknij ikonę rozszerzenia w pasku narzędzi Chrome
2. W polu "API Key" wprowadź swój klucz OpenAI
3. Kliknij "Save API Key"
4. Gotowe! 🎉

## 🔑 Jak Uzyskać API Key OpenAI

1. Przejdź na [platform.openai.com](https://platform.openai.com)
2. Zaloguj się lub utwórz konto
3. Przejdź do sekcji "API Keys"
4. Kliknij "Create new secret key"
5. Skopiuj wygenerowany klucz (zaczyna się od `sk-`)

## 🛡️ Bezpieczeństwo

- **API Key jest przechowywany lokalnie** w Chrome storage
- **Nie jest wysyłany** do żadnych innych serwerów
- **Możesz go łatwo zmienić** w ustawieniach rozszerzenia
- **Nie jest hardkodowany** w plikach rozszerzenia

## 🎯 Jak Używać

1. Przejdź na stronę z angielskim tekstem
2. Kliknij ikonę rozszerzenia
3. Wybierz poziom uproszczenia (A1-C1)
4. Kliknij "Simplify Text"
5. Poczekaj na przetworzenie przez AI

## 🔧 Rozwiązywanie Problemów

### Rozszerzenie się nie ładuje
- Sprawdź czy wszystkie pliki są w jednym folderze
- Upewnij się, że `manifest.json` jest poprawny
- Spróbuj przeładować rozszerzenie

### API Key nie działa
- Sprawdź czy klucz zaczyna się od `sk-`
- Upewnij się, że masz środki na koncie OpenAI
- Spróbuj wygenerować nowy klucz

### Tekst się nie upraszcza
- Sprawdź czy strona ma angielski tekst
- Upewnij się, że API Key jest poprawny
- Sprawdź połączenie z internetem

## 💰 Koszty

Rozszerzenie używa OpenAI API, które jest płatne:
- **GPT-3.5-turbo**: ~$0.15 za 1M tokenów wejściowych
- **Typowa strona**: ~$0.01-0.05 za uproszczenie

## 📞 Wsparcie

Jeśli masz problemy:
1. Sprawdź instrukcje powyżej
2. Upewnij się, że wszystkie pliki są obecne
3. Spróbuj przeinstalować rozszerzenie

---

**Uwaga**: To rozszerzenie jest przeznaczone do edukacyjnego użytku. Używaj odpowiedzialnie i zgodnie z warunkami OpenAI.
