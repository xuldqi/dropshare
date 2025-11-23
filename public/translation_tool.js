document.addEventListener('DOMContentLoaded', () => {
    const sourceLangSelect = document.getElementById('source-lang');
    const targetLangSelect = document.getElementById('target-lang');
    const compareBtn = document.getElementById('compare-btn');
    const loadingDiv = document.getElementById('loading');
    const missingKeysTableBody = document.querySelector('#missing-keys-table tbody');
    const extraKeysTableBody = document.querySelector('#extra-keys-table tbody');

    // Fetch available languages and populate dropdowns
    async function populateLanguages() {
        try {
            const response = await fetch('/api/translations/languages');
            const languages = await response.json();

            languages.forEach(lang => {
                const sourceOption = new Option(lang, lang);
                const targetOption = new Option(lang, lang);
                sourceLangSelect.add(sourceOption);
                targetLangSelect.add(targetOption);
            });

            // Set default selections
            if (languages.length > 1) {
                sourceLangSelect.value = languages[0];
                targetLangSelect.value = languages[1];
            }
        } catch (error) {
            console.error('Failed to load languages:', error);
            alert('Failed to load languages. See console for details.');
        }
    }

    // Perform comparison and display results
    async function compareLanguages() {
        const source = sourceLangSelect.value;
        const target = targetLangSelect.value;

        if (source === target) {
            alert('Source and Target languages cannot be the same.');
            return;
        }

        loadingDiv.style.display = 'block';
        missingKeysTableBody.innerHTML = '';
        extraKeysTableBody.innerHTML = '';

        try {
            const response = await fetch(`/api/translations/compare?source=${source}&target=${target}`);
            const results = await response.json();

            if (response.status !== 200) {
                throw new Error(results.error || 'Failed to fetch comparison data.');
            }

            // Populate missing keys table
            results.missing_in_target.forEach(key => {
                const row = missingKeysTableBody.insertRow();
                const cell = row.insertCell();
                cell.textContent = key;
            });

            // Populate extra keys table
            results.extra_in_target.forEach(key => {
                const row = extraKeysTableBody.insertRow();
                const cell = row.insertCell();
                cell.textContent = key;
            });

        } catch (error) {
            console.error('Comparison failed:', error);
            alert(`Comparison failed: ${error.message}`);
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    compareBtn.addEventListener('click', compareLanguages);

    populateLanguages();
});
