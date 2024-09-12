document.addEventListener('DOMContentLoaded', function() {
    function replaceSingleLettersWithNbsp(node) {
        // Sprawdzenie, czy węzeł to tekstowy węzeł i przetworzenie go
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue;
            // Zamień podwójne spacje na pojedyncze
            text = text.replace(/ {2,}/g, ' ');
            // Zamień pojedyncze litery na końcu wiersza na nbsp (Unicode U+00A0)
            text = text.replace(/(\b[awziouAWZIOU]|[0-9])\s/g, '$1\u00A0');
            node.nodeValue = text;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Sprawdź, czy element jest zabroniony
            const forbiddenTags = ['A', 'HEADER', 'FOOTER', 'IMG', 'SCRIPT'];
            if (!forbiddenTags.includes(node.tagName)) {
                // Iteruj przez dzieci węzła
                node.childNodes.forEach(child => replaceSingleLettersWithNbsp(child));
            }
        }
    }

    function processBodyAndInfo() {
        // Przetwórz zawartość body
        replaceSingleLettersWithNbsp(document.body);
        // Przetwórz zawartość diva z id="info"
        const infoDiv = document.getElementById('info');
        if (infoDiv) {
            replaceSingleLettersWithNbsp(infoDiv);
        }
        // Przetwórz elementy z klasą "akapit"
        const akapitElements = document.querySelectorAll('.akapit');
        akapitElements.forEach(el => replaceSingleLettersWithNbsp(el));

        const informacjaDiv = document.getElementById('informacja');
        if (informacjaDiv) {
            replaceSingleLettersWithNbsp(informacjaDiv);
        }

    }

    // Funkcja do monitorowania zmian w divie
    function observeInfoDiv() {
        const infoDiv = document.getElementById('info');
        if (infoDiv) {
            // Tworzenie obiektu MutationObserver
            const observer = new MutationObserver(() => {
                replaceSingleLettersWithNbsp(infoDiv);
            });

            // Konfiguracja obserwatora
            const config = { childList: true, subtree: true };
            observer.observe(infoDiv, config);
        }
    }

    function observeInformacjaDiv() {
        const informacjaDiv = document.getElementById('informacja');
        if (informacjaDiv) {
            // Tworzenie obiektu MutationObserver
            const observer = new MutationObserver(() => {
                replaceSingleLettersWithNbsp(informacjaDiv);
            });

            // Konfiguracja obserwatora
            const config = { childList: true, subtree: true };
            observer.observe(informacjaDiv, config);
        }
    }

    // Przetwórz początkowy stan
    processBodyAndInfo();
    // Rozpocznij obserwację zmian w divie
    observeInfoDiv();

    observeInformacjaDiv();
});