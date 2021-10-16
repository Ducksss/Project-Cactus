chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // if done...
    if (changeInfo.status) {
        console.log("Injecting into content.js");
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./content.js"]
        })
            .then((res) => {
                console.log("Injected content JS.");
            })
            .catch((err) => {
                console.log(err)
            });
    }
});