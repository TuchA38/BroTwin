const AppState = {
    key: "zoopedia-version",

    get() {
        return localStorage.getItem(this.key) || "pz1pc";
    },

    set(version) {
        localStorage.setItem(this.key, version);
        document.documentElement.dataset.gameVersion = version;
        document.dispatchEvent(new CustomEvent("versionChanged", {
            detail: version
        }));
    },

    init() {
        document.documentElement.dataset.gameVersion = this.get();
    }
};

AppState.init();