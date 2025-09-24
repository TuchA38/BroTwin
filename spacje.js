document.addEventListener('DOMContentLoaded', function() {
    function replaceSingleLettersWithNbsp(node) {
        // Sprawdzenie, czy węzeł to tekstowy węzeł i przetworzenie go
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue;

            // 1) Zamień podwójne (i więcej) spacje na pojedyncze
            text = text.replace(/ {2,}/g, ' ');

            // 2) Zadbaj, żeby myślniki i dash'e nie zostawały same:
            //    zmieni " wyraz - wyraz "  lub " wyraz – wyraz " lub " wyraz — wyraz "
            //    na " wyraz&nbsp;-&nbsp;wyraz " (zachowuje oryginalny znak myślnika)
            text = text.replace(/(\s)([-\u2013\u2014])(\s)/g, '\u00A0$2\u00A0');
            text = text.replace(/(\w)-(\w)/g, '$1\u2011$2');

            // 3) Pojedyncze litery (spójnikowe) oraz cyfry — nie mogą zostać na końcu wiersza:
            //    przykłady: "a kot" -> "a&nbsp;kot", "5 psów" -> "5&nbsp;psów"
            //    uwaga: regex dopasowuje literę/liczbę + zwykła spacja (nie dopasuje już nbsp)
            text = text.replace(/(?<=\s)([awziouAWZIOU])\s/g, '$1\u00A0');
            text = text.replace(/([0-9])\s/g, '$1\u00A0');
            // Zapisz zmieniony tekst
            node.nodeValue = text;

        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Sprawdź, czy element jest zabroniony (nie przetwarzamy treści w tych tagach)
            const forbiddenTags = ['A', 'HEADER', 'FOOTER', 'IMG', 'SCRIPT', 'STYLE', 'PRE', 'CODE'];
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

    // Funkcja do monitorowania zmian w divie (np. dynamiczne dodawanie treści)
    function observeInfoDiv() {
        const infoDiv = document.getElementById('info');
        if (infoDiv) {
            const observer = new MutationObserver(() => {
                replaceSingleLettersWithNbsp(infoDiv);
            });
            const config = { childList: true, subtree: true };
            observer.observe(infoDiv, config);
        }
    }

    function observeInformacjaDiv() {
        const informacjaDiv = document.getElementById('informacja');
        if (informacjaDiv) {
            const observer = new MutationObserver(() => {
                replaceSingleLettersWithNbsp(informacjaDiv);
            });
            const config = { childList: true, subtree: true };
            observer.observe(informacjaDiv, config);
        }
    }

    // Przetwórz początkowy stan
    processBodyAndInfo();

    // Rozpocznij obserwację zmian
    observeInfoDiv();
    observeInformacjaDiv();
});