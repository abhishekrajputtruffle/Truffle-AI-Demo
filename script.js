// ============================================================
// NetDocuments / TierPoint - Embedded Messaging + Vera Search Bar
// ============================================================
//
// This file handles two things:
//   1. Existing behavior - pushes hidden prechat fields (URL, IP)
//      once the Embedded Messaging widget is ready.
//   2. New behavior - wires up a search bar so that pressing
//      Enter or clicking "Search" opens the Vera chat window
//      and sends the typed text as the user's first message,
//      right after Vera's opening greeting.
// ============================================================


// ============================================================
// CONFIGURATION
// ============================================================

// IDs of the search bar input and button added in index.html
const VERA_SEARCH_INPUT_ID = 'veraSearchInput';
const VERA_SEARCH_BUTTON_ID = 'veraSearchButton';


// ============================================================
// EXISTING - PRECHAT FIELDS
// ============================================================

async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (e) {
        console.warn("IP fetch failed:", e);
        return 'unavailable';
    }
}

async function pushPrechatFields() {
    try {
        if (window.embeddedservice_bootstrap?.prechatAPI?.setHiddenPrechatFields) {
            const ipAddress = await getIPAddress();
            const preChatFields = {
                "url": window.location.href,      // Full URL with UTM params
                "ipAddress": ipAddress             // Visitor IP address
            };
            console.log("Prechat fields sent:", preChatFields);
            embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields(preChatFields);
        }
    } catch (e) {
        console.warn("Prechat push failed:", e);
    }
}

function initEmbeddedMessaging() {
    try {
        embeddedservice_bootstrap.settings.language = 'en_US'; // For example, enter 'en' or 'en-US'
        embeddedservice_bootstrap.init(
            '00DOt000011sVAb',
            'AI_Web_Chat',
            'https://tierpoint--lassoqa.sandbox.my.site.com/ESWAIWebChat1782290128350',
            {
                scrt2URL: 'https://tierpoint--lassoqa.sandbox.my.salesforce-scrt.com'
            }
        );

        window.addEventListener("onEmbeddedMessagingReady", () => {
            console.log("onEmbeddedMessagingReady");
            pushPrechatFields();
            vera_attachSearchBarListeners();
        });

    } catch (err) {
        console.error('Error loading Embedded Messaging: ', err);
    }
};


// ============================================================
// NEW - VERA SEARCH BAR INTEGRATION
// ============================================================

// Holds the search text typed by the user so it can be sent
// to Vera once the chat window is open and she has greeted.
let vera_pendingMessage = '';

// Prevents opening the chat window if it is already open.
let vera_chatIsOpen = false;

// Prevents sending the search text more than once per session.
let vera_messageSent = false;


// ------------------------------------------------------------
// STEP 1 - ATTACH LISTENERS TO THE SEARCH INPUT AND BUTTON
// ------------------------------------------------------------

function vera_attachSearchBarListeners() {
    const searchInput = document.getElementById(VERA_SEARCH_INPUT_ID);
    const searchButton = document.getElementById(VERA_SEARCH_BUTTON_ID);

    if (!searchInput) {
        console.warn('[Vera Search] Search input not found. Expected id:', VERA_SEARCH_INPUT_ID);
        return;
    }

    searchInput.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') return;
        vera_handleSearchTrigger(searchInput.value);
    });

    if (searchButton) {
        searchButton.addEventListener('click', function () {
            vera_handleSearchTrigger(searchInput.value);
        });
    } else {
        console.warn('[Vera Search] Search button not found. Expected id:', VERA_SEARCH_BUTTON_ID);
    }

    console.log('[Vera Search] Search bar listeners attached successfully.');
}

// Shared handler for both the Enter key and the button click.
function vera_handleSearchTrigger(rawText) {
    const searchText = (rawText || '').trim();

    // Do nothing if the search bar is empty.
    if (!searchText) return;

    // Save the search text - it gets sent to Vera once the
    // chat window is open and she has greeted the user.
    vera_pendingMessage = searchText;
    vera_messageSent = false;

    console.log('[Vera Search] Search text captured:', vera_pendingMessage);

    vera_openChat();
}


// ------------------------------------------------------------
// STEP 2 - OPEN THE VERA CHAT WINDOW
// ------------------------------------------------------------

function vera_openChat() {
    if (vera_chatIsOpen) {
        console.log('[Vera Search] Chat is already open - skipping launch.');
        return;
    }

    try {
        embeddedservice_bootstrap.utilAPI.launchChat();
        vera_chatIsOpen = true;
        console.log('[Vera Search] Chat window launched.');
    } catch (err) {
        console.error('[Vera Search] Failed to open chat window.', err);
    }
}


// ------------------------------------------------------------
// STEP 3 - SEND THE SEARCH TEXT AFTER VERA'S FIRST GREETING
// ------------------------------------------------------------

window.addEventListener('onEmbeddedMessagingFirstBotMessageSent', function () {
    console.log('[Vera Search] Vera sent her greeting message.');

    if (vera_pendingMessage && !vera_messageSent) {
        vera_messageSent = true;

        console.log('[Vera Search] Sending search text to Vera:', vera_pendingMessage);
        embeddedservice_bootstrap.utilAPI.sendTextMessage(vera_pendingMessage);

        vera_pendingMessage = '';
    }
});


// ------------------------------------------------------------
// STEP 4 - RESET STATE WHEN THE CHAT WINDOW IS CLOSED
// ------------------------------------------------------------

window.addEventListener('onEmbeddedMessagingWindowClosed', function () {
    console.log('[Vera Search] Chat window closed. Resetting state for next interaction.');

    vera_chatIsOpen = false;
    vera_messageSent = false;
    vera_pendingMessage = '';
});
