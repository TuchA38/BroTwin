document.addEventListener('DOMContentLoaded', function() {
    const units = ['cm', 'kg', 'm', 'km', 'g', 'mg', 'l', 'ml', 'mm', 's', 'min', 'h'];

    // Funkcja dodająca niełamiące się spacje w odpowiednich miejscach
    function addNonBreakingSpaces(element) {
        let innerHTML = element.innerHTML;

        // Zamiana spacji między liczbami i jednostkami na niełamiące się spacje
        units.forEach(function(unit) {
            const regex = new RegExp('(\\d+)\\s+(' + unit + ')', 'g');
            innerHTML = innerHTML.replace(regex, '$1&nbsp;$2');
        });

        // Dodawanie &nbsp; przed i po słowie 'do'
        innerHTML = innerHTML.replace(/\bdo\b/g, 'do&nbsp;');

        // Usuwanie podwójnych &nbsp; oraz nadmiarowych spacji wokół &nbsp;
        innerHTML = innerHTML.replace(/(&nbsp;)+\s+/g, '&nbsp;');
        innerHTML = innerHTML.replace(/\s+(&nbsp;)+/g, '&nbsp;');

        // Rozbicie tekstu na części oddzielone <br>
        const parts = innerHTML.split('<br>');

        // Przetwarzanie każdego fragmentu oddzielnie
        const updatedParts = parts.map(function(part) {
            // Usuwanie niechcianych &nbsp; na końcu tekstu oraz przed <br>
            part = part.replace(/(&nbsp;)+$/, ''); // Usuwa &nbsp; na końcu tekstu
            return part.trim(); // Usuwamy zbędne spacje
        });

        // Połączone fragmenty z powrotem z <br>
        let finalText = updatedParts.join('<br>');

        // Usuwanie niechcianych &nbsp; przed <br>
        finalText = finalText.replace(/(&nbsp;)+<br>/g, '<br>');

        element.innerHTML = finalText;
    }

    // Znajdź wszystkie elementy z klasą "akapit"
    const paragraphs = document.querySelectorAll('.akapit');

    // Dla każdego paragrafu uruchom funkcję zamiany spacji
    paragraphs.forEach(function(paragraph) {
        addNonBreakingSpaces(paragraph);
    });
});