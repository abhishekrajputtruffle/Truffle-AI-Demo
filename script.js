function pushPrechatFields() {
    try {
      if (window.embeddedservice_bootstrap?.prechatAPI?.setHiddenPrechatFields) {
       
        const preChatFields = {"url": window.location.href}
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
				'00DOv00000JA9gb',
				'AI_Web_Chat',
				'https://tierpoint--lassoqa.sandbox.my.site.com/ESWAIWebChat1779711606789',
				{
					scrt2URL: 'https://tierpoint--lassoqa.sandbox.my.salesforce-scrt.com'
				}
			);

      window.addEventListener("onEmbeddedMessagingReady", () => {
        console.log("✅ onEmbeddedMessagingReady");
        pushPrechatFields();
      }
		} catch (err) {
			console.error('Error loading Embedded Messaging: ', err);
		}
	};


