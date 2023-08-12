// The DOMContentLoaded event ensures that the script runs after the document's DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function () {

    // Fetch all open Chrome windows and their tabs
    let windows = await chrome.windows.getAll({ populate: true });

    // Get the main 'windows' div where the current instances will be displayed
    let windowsDiv = document.getElementById('windows');

    // Loop through each Chrome window
    for (let i = 0; i < windows.length; i++) {

        // Create a 'details' element for each window (or instance)
        let details = document.createElement('details');
        details.className = 'window';

        // The 'summary' element represents the visible title of each 'details' element
        let summary = document.createElement('summary');

        // Create an input field to allow renaming the instance
        let input = document.createElement('input');
        input.type = 'text';
        input.value = 'Instance ' + (i + 1);
        input.className = 'instance-name';

        summary.appendChild(input);

        // The 'ul' will contain all the tabs for this window
        let ul = document.createElement('ul');
        let urls = []; // This array will store the URLs of all tabs in the current window

        // Loop through each tab of the current window
        for (let tab of windows[i].tabs) {

            // Create a list item for each tab
            let li = document.createElement('li');

            // Display the favicon of the website in the tab
            let img = document.createElement('img');
            img.src = tab.favIconUrl;
            img.style.width = '16px';
            img.style.height = '16px';
            img.style.marginRight = '10px';

            li.appendChild(img);

            // Display the title of the website in the tab and link it to the actual URL
            let a = document.createElement('a');
            a.textContent = tab.title;
            a.href = tab.url;
            a.target = '_blank';
            li.appendChild(a);
            ul.appendChild(li);

            urls.push(tab.url);
        }

        // Create a save button to save the current window's tabs
        let saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', function () {
            let instanceName = input.value;
            chrome.storage.sync.set({ [instanceName]: urls }, function () {
                alert('Instance saved!');
            });
        });

        // Append all elements to the main 'details' element
        details.appendChild(summary);
        details.appendChild(ul);
        details.appendChild(saveButton);

        // Append the 'details' element to the main 'windows' div
        windowsDiv.appendChild(details);
    }

    // Function to load and display all saved instances
    function loadSavedInstances() {

        // Get the div where the saved instances will be displayed
        let savedInstancesDiv = document.getElementById('savedInstances');

        // Clear out any previously displayed saved instances
        savedInstancesDiv.innerHTML = '';

        // Fetch all items from Chrome storage
        chrome.storage.sync.get(null, function (items) {
            for (let key in items) {

                // Similar to the above code, create a 'details' element for each saved instance
                let details = document.createElement('details');
                details.className = 'window';

                let summary = document.createElement('summary');
                let input = document.createElement('input');
                input.type = 'text';
                input.value = key; // Name of the saved instance
                input.className = 'instance-name';

                summary.appendChild(input);
                let ul = document.createElement('ul');

                // Display each saved URL
                for (let url of items[key]) {
                    let li = document.createElement('li');
                    li.textContent = url;
                    ul.appendChild(li);
                }

                // Create an 'Open' button to open all tabs of the saved instance
                let openButton = document.createElement('button');
                openButton.textContent = 'Open';
                openButton.addEventListener('click', function () {
                    chrome.windows.create({ url: items[key] });
                });
                details.appendChild(openButton);

                // Create a 'Delete' button to remove the saved instance from storage
                let deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function () {
                    chrome.storage.sync.remove(key, function () {
                        loadSavedInstances(); // Reload the saved instances list after deletion
                    });
                });
                details.appendChild(deleteButton);

                // Append all elements to the main 'details' element
                details.appendChild(summary);
                details.appendChild(ul);

                // Append the 'details' element to the main 'savedInstances' div
                savedInstancesDiv.appendChild(details);
            }
        });
    }

    // Load the saved instances when the popup is first opened
    loadSavedInstances();

    // Update the list of saved instances when something in Chrome storage changes
    chrome.storage.onChanged.addListener(loadSavedInstances);
});
