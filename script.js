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
			console.log("📨 Prechat fields sent:", preChatFields);
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
			console.log("✅ onEmbeddedMessagingReady");
			pushPrechatFields();
		});
	} catch (err) {
		console.error('Error loading Embedded Messaging: ', err);
	}
};
