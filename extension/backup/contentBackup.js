// Quick check to see if it is still woprking
console.log("Here is still being called")

// Function to scan for new tweets
const scanDiv = (function () {
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

// Function to append advisory
const addWarning = (function () {
    return function (el, score) {
        // Get the tweet from this element
        var twt = el.querySelectorAll('article div[data-testid="tweet"]')[0];
        if (twt) twt.style.setProperty("flex-wrap", "wrap");

        // What message to pass
        if (score < 0) {
            // score range [-0.5,0.5]
            // negative is -0.5 which should show 100%
            // so the formula is 1-(score+0.5) = 0.5-score
            var ps = 0.5 - score;
            var tx = "This tweet has been flagged as " + (100 * ps).toFixed(1) + "% negative!";

            // Make new div with class .adv and HTML content from string tx
            var advisory = document.createElement("div");
            advisory.classList = "adv";
            advisory.innerHTML = tx;

            // Add to original element
            if (twt)
                twt.prepend(advisory);
        }
    }
})();

// Scans the content
const contentScanner = function (content) {
    return new Promise((resolve, reject) => {
        try {
            var parsedContent = content.querySelectorAll('div[class="css-901oao r-18jsvk2 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0"] > span[class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0"]')[0];

            // if not null
            if (parsedContent && parsedContent != undefined) {
                if (parsedContent.length > 1) {
                    let sentences = '';
                    for (let sentence in parsedContent) {
                        sentences += (sentence.innerText)
                    }

                    resolve(sentences)
                } else {
                    resolve(parsedContent.innerText)
                }
            } else {
                reject("");
            }
        } catch (e) {
            reject("");
        }
    });
}

// Function to call for each element of the homepage
const runScript = (function () {
    return async function (allNodes) {
        for (i = 0; i < allNodes.length; i++) {
            // Get tweet's text content
            let node = allNodes[i];
            let cleanedText = await contentScanner(node)
                .catch(() => {
                    // to be honest, don't need to handle any errors because
                    // if its undefined already... will result in callback hell
                })

            // There might just be images with no text... hence this help filter out properly
            if (cleanedText) {
                console.log(cleanedText);

                var score = Math.random() * 100;;

                console.log(score)
                addWarning(node, score);
            }
        }
    }
}());

// Gets the overall container of all the posts
const getPostsContainer = function () {
    return new Promise((resolve, reject) => {
        try {
            resolve(document.querySelectorAll('div[aria-label="Timeline: Your Home Timeline"] > div')[0]);
        } catch (e) {
            reject({ name: "article container failure", description: "Failed to retrieve" })
        }
    })
};

// Main function
const waitFor = async (getPostsContainer, next) => {
    // Get all nodes of container
    await getPostsContainer()
        .then((res) => {
            // if undefined, loop this function again until page loads.
            if (res == undefined) {
                setTimeout(() => waitFor(getPostsContainer, next), 1000);
            }

            // if result exists, proceed to next function.
            next(res);
        })
}

const next = async (wrapper) => {
    // Content that is on load
    const tweets = wrapper.children;
    runScript(tweets);

    // Content that is on scroll
    scanDiv(wrapper, function (el) {
        const addedNodes = [];

        // Record down added divs
        el.forEach(record => {
            record.addedNodes.length & addedNodes.push(...record.addedNodes);
        });

        // Run the script for added nodes
        runScript(addedNodes);

        console.log("scrolling down...");
        console.log('Added:', addedNodes);
    });
}

// Immedatiely invoke this function on launch
(async () => {
    // Get all nodes of container
    await getPostsContainer()
        .then((res) => {
            // if undefined, loop this function again until page loads.
            if (res == undefined) {
                setTimeout(() => waitFor(getPostsContainer, next), 1000);
            }

            // if result exists, proceed to next function.
            next(res);
        })
})();