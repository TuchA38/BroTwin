function enrichTextWithGlossary(root) {
    if (!root || !window.glossaryData) return;

    const termMap = {};
    Object.entries(window.glossaryData).forEach(([key, val]) => {
        termMap[val.title.toLowerCase()] = key;
        termMap[key.toLowerCase()] = key;

        const match = val.title.match(/\(([^)]+)\)/);
        if (match) termMap[match[1].toLowerCase()] = key;

        if (val.aliases) {
            val.aliases.forEach(a => termMap[a.toLowerCase()] = key);
        }
    });
    const terms = Object.keys(termMap).sort((a, b) => b.length - a.length);

    const regex = new RegExp(
        `(?<!\\p{L})(${terms.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')).join("|")})(?!\\p{L})`,
        "giu"
    );

    // Standardowy walker (przetwarza również tekst wewnątrz <i>)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToProcess = [];
    while (node = walker.nextNode()) {
        nodesToProcess.push(node);
    }

    nodesToProcess.forEach(node => {
        const text = node.nodeValue;

        const replaced = text.replace(regex, (match, term, offset) => {
            const key = termMap[term.toLowerCase()];
            if (!key) return match;

            // --- INTELIGENTNY FIX DLA HOMONIMÓW ---
            if (term.toLowerCase() === 'sus') {
                // 1. Sprawdzamy tekst bezpośrednio po słowie w tym samym węźle
                const trailingText = text.slice(offset + match.length).trim();

                // Regex sprawdza, czy następne słowo zaczyna się od małej litery (np. "scrofa", ") domesticus")
                // Pominie znaki interpunkcyjne jak nawiasy
                if (/^\)?\s*\p{Ll}/u.test(trailingText)) {
                    return match; // To nazwa łacińska, nie linkuj
                }

                // 2. Jeśli "Sus" było na końcu węzła, sprawdzamy kod HTML rodzica
                const parentHTML = node.parentNode ? node.parentNode.innerHTML : '';
                // Szukamy wzorca: "Sus" (może być zamkniety tag) i potem słowo z małej litery
                if (/Sus(<\/i>)?(<\/em>)?\)?\s*\p{Ll}/u.test(parentHTML)) {
                    return match; // To nazwa łacińska, nie linkuj
                }
            }
            // ------------------------------------------------------------------------

            return `<span class="glossary-link" data-key="${key}">${term}</span>`;
        });

        if (replaced !== text) {
            const span = document.createElement("span");
            span.innerHTML = replaced;
            node.parentNode.replaceChild(span, node);
        }
    });
}