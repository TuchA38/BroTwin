window.DATA = {
    home: null,
    footer: null,

    async load() {
        if (!this.home) {
            const res = await fetch("data/home.json");
            this.home = await res.json();
        }

        if (!this.footer) {
            const res = await fetch("data/footer.json");
            this.footer = await res.json();
        }
    }
};