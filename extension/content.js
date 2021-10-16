// Quick check to see if it is still working
console.log("Here is still being called");

/**
 * 
 * UTILITY FUCTIONS
 * 
 */
// Function to scan for new tweets
const mutationScanner = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    return function (obj, callback) {
        if (!obj || obj.nodeType !== 1)
            return;
        if (MutationObserver) {
            // New observer
            var mutationObserver = new MutationObserver(callback)
            // Observe changes in children (includes divs)
            mutationObserver.observe(obj, {
                childList: true,
                subtree: false
            });
            return mutationObserver;
        }
        // browser support fallback
        else if (window.addEventListener) {
            obj.addEventListener('DOMNodeInserted', callback, false)
            obj.addEventListener('DOMNodeRemoved', callback, false)
        }
    }
})();

// Scans the content
const contentScanner = (content) => {
    return new Promise((resolve, reject) => {
        try {
            var parsedContent = content.querySelectorAll('div[class="css-901oao r-18jsvk2 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0"] > span[class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0"]')[0];

            // if not null
            if (parsedContent) {
                if (parsedContent.length > 1) {
                    let sentences = '';
                    for (let sentence in parsedContent) {
                        sentences += (sentence.innerText)
                    }

                    resolve(sentences);
                } else {
                    resolve(parsedContent.innerText);
                }
            } else {
                reject("");
            }
        } catch (e) {
            reject("");
        }
    });
};

// Fetch from the database
const fetchDataFromAPI = (cleanedText) => {
    return new Promise(async (resolve, reject) => {
        fetch('https://heroku-cactus.herokuapp.com/predict', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "sentences": [cleanedText]
            })
        })
            .then(res => {
                resolve(res.json());
            })
            .catch((error) => {
                reject({ name: "fetchDataFromAPI", description: "fetchDataFromAPI" })
            })

        // await timeout(1000);
        // resolve([[Math.random()]][0])
    })
};

// Function to call for each element of the homepage
const runScript = async (allNodes) => {
    try {
        for (let node of allNodes) {
            let isNotPreppended = node.querySelectorAll('div[id="delta987"]');

            // prevent backlog pileup error
            if (isNotPreppended.length === 0) {
                let cleanedText = await contentScanner(node)

                // There might just be images with no text... hence this help filter out properly
                if (cleanedText) {
                    const newNode = document.createElement('div');
                    const content = await fetchDataFromAPI(cleanedText);

                    if (content[0] * 100 > 60) {
                        newNode.innerHTML = `<div class="css-1dbjc4n r-18u37iz" id="delta987" style="border: 1px solid var(--petalc);background: #FE5C5C;font: 1rem sans-serif;padding-right: 1rem;padding-top: 1rem;padding-bottom: 1rem;padding-left: 1rem;">Warning... this tweet is ${(content[0] * 100).toFixed(2)}% likely to be fake news</div>`
                    } else {
                        newNode.innerHTML = `<div class="css-1dbjc4n r-18u37iz" id="delta987" style="border: 1px solid var(--petalc);background: #9BFE87;font: 1rem sans-serif;padding-right: 1rem;padding-top: 1rem;padding-bottom: 1rem;padding-left: 1rem;">This news is vetted and is safe!</div>`
                    }

                    node.prepend(newNode);

                    /**
                     * FOR DEBUGGING SAKE
                     */
                    // console.log(content)
                }
            }
        }
    } catch (e) {
        // To be honest, don't need to handle any errors because
        // if its undefined already... will result in callback hell)
        console.log(e)
    }
};

/**
 * 
 * MAIN FUCTIONS
 * 
 */
// Main function
const main = async (getPostsContainer, callback) => {
    // Get all nodes of container
    await getPostsContainer()
        .then((res) => {
            // if undefined, loop this function again until page loads.
            if (res == undefined) {
                setTimeout(() => main(getPostsContainer, callback), 1000);
            }

            // if result exists, call next function
            callback(res);
        })
}

// Gets the overall container of all the posts
const getPostsContainer = async () => {
    return new Promise((resolve, reject) => {
        try {
            resolve(document.querySelectorAll('div[aria-label^="Timeline: Your Home Timeline"] > div')[0]);
        } catch (e) {
            reject({ name: "article container failure", description: "Failed to retrieve" })
        }
    })
};

// After everything has loaded, proceed to this - flagged
const processPostsContainer = async (res) => {
    try {
        // Content that is on load
        runScript(res.children);

        // Content that is on scroll
        // - For any new mutation, scan this
        mutationScanner(res, function (res2) {
            const addedNodes = [];

            // Record down added divs
            res2.forEach(record => {
                record.addedNodes.length & addedNodes.push(...record.addedNodes);
            });

            // Run the script for added nodes
            runScript(addedNodes);

            console.log("scrolling down...");
            console.log('Added:', addedNodes);
        });
    } catch (error) {

    }
}

// Immedatiely invoke this function on launch
(async () => {
    main(getPostsContainer, processPostsContainer);
})();

/**
 * Redudant Code - to be removed on submission
 */
const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}