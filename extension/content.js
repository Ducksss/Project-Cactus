// Quick check to see if it is still working
console.log("Here is still being called");

/**
 * 
 * UTILITY FUCTIONS
 * 
 */
// Scans the content
const contentScanner = async (content) => {
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
const fetchDataFromAPI = async (cleanedText) => {
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
    })
};

// Function to call for each element of the homepage
const runTweetCheck = async (allNodes) => {
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
                        // fake news
                        newNode.innerHTML = `
                                            <div class="css-1dbjc4n r-18u37iz" id="delta987"
                                                style="background: #FE5C5C;font: 1rem sans-serif;padding-left: 1rem;padding-right: 1rem;padding-top: 1rem;padding-bottom: 1rem;">
                                                <div style="text-align: start;display: block; font-style: italic;">
                                                    Be cautious... this tweet is ${(content[0] * 100).toFixed(2)}% likely to be fake news!
                                                </div>
                                                <div style="text-align: end;flex: auto;font-size: 15px;text-decoration: underline;display: block;" class="btn">
                                                    <a href="https://project-cactus-c9549.web.app/?news=${cleanedText}" target="_blank" waprocessedanchor="true">
                                                        Not right?</a>
                                                </div>
                                            </div>`
                    } else {
                        // factual news
                        newNode.innerHTML = `
                                            <div class="css-1dbjc4n r-18u37iz" id="delta987"
                                                style="background: #9BFE87;font: 1rem sans-serif;padding-left: 1rem;padding-right: 1rem;padding-top: 1rem;padding-bottom: 1rem;">
                                                <div style="text-align: start; display: block; font-style: italic;">
                                                    Hmm... this news looks good and safe!
                                                </div>
                                                <div style="text-align: end;flex: auto;/* color: rgb(29, 155, 240); */font-size: 15px;text-decoration: underline;display: block;"
                                                    class="btn">
                                                    <a href="https://project-cactus-c9549.web.app/?news=${cleanedText}" target="_blank">
                                                        Not right?</a>
                                                </div>
                                            </div>`
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

// Function to scan for new tweets
const mutationScanner = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    return function (obj, callback) {
        if (!obj || obj.nodeType !== 1)
            return;
        if (MutationObserver) {
            var mutationObserver = new MutationObserver(callback)
            mutationObserver.observe(obj, {
                childList: true,
                subtree: false
            });
            return mutationObserver;
        }
        else if (window.addEventListener) {
            obj.addEventListener('DOMNodeInserted', callback, false)
            obj.addEventListener('DOMNodeRemoved', callback, false)
        }
    }
})();

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
        runTweetCheck(res.children);

        // Content that is on scroll
        // - For any new mutation, scan this
        mutationScanner(res, function (res2) {
            const addedNodes = [];

            res2.forEach(record => {
                record.addedNodes.length & addedNodes.push(...record.addedNodes);
            });

            // Run the script for the newly added nodes
            runTweetCheck(addedNodes);

            /**
             * FOR DEBUGGING SAKE 
             */
            // console.log("scrolling down...");
            // console.log('Added:', addedNodes);
        });
    } catch (error) {

    }
}

// Immedatiely invoke this function on launch
(async () => {
    main(getPostsContainer, processPostsContainer);
})();