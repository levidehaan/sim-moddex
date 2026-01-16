Do these first:
update date/time to be able to add time or remove time from the date value returned
add comfyUI block that enables the user to send requests to a comfyui server

newer additions: 
shodan block to pull info from shodan api with api key, also trigger on alerts.


Then build these:
Complete API Discovery for AI Automation Platforms
Every usable free and affordable API across 15+ categories—with endpoints, authentication, rate limits, pricing, and automation use cases. This exhaustive guide identifies 200+ APIs that can serve as triggers (events starting workflows) or blocks (data sources/actions within workflows). The best free options are highlighted for budget-conscious automation builders.

Grocery & Retail APIs
Grocery and retail APIs are essential for price tracking, inventory monitoring, and coupon automation. Official APIs from major retailers are limited—many require partnership agreements or have no public access.
Kroger API — The gold standard for grocery automation

URL: https://developer.kroger.com
Free tier: Free with rate limits
Authentication: OAuth 2.0 (Client ID + Secret → Access Token, expires 30 min) PublicAPI
Key endpoints: /products/{productId} (search by term/UPC), /locations (stores by ZIP/coordinates), /cart/add (add items), /identity/profile (customer data)
Scopes: product.compact, cart.basic:write, profile.compact GitHub
TRIGGER: Price changes or availability alerts on tracked products
BLOCK: Add items to cart, fetch store hours, retrieve product details

Walmart APIs
Walmart Open API (Consumer/Affiliate)

URL: https://developer.walmartlabs.com
Free tier: Free with API key
Authentication: API Key (query parameter)
Key endpoints: /v1/items/{itemId} (product details), /v1/search (keyword search), /v1/stores (locations) Walmartlabs
TRIGGER: Track price drops on specific products
BLOCK: Look up product details, check inventory, get recommendations

Walmart Marketplace API (Sellers)

URL: https://developer.walmart.com
Authentication: OAuth 2.0 + API Keys
Endpoints: Items, Orders, Inventory, Pricing, Feeds APIs Walmart Marketplace Group

Best Buy API — Excellent free tier

URL: https://developer.bestbuy.com
Free tier: Yes, completely free with registration Steve Sie
Authentication: API Key (query parameter)
Rate limits: 5 requests/second GitHub
Key endpoints: /v1/products (1M+ products), /v1/stores (1,000+ locations), /v1/categories, Open Box API (discounted inventory) Best Buy
TRIGGER: Price drops or inventory changes
BLOCK: Check store inventory, get product specs, find locations

Amazon Product Advertising API 5.0

URL: https://webservices.amazon.com/paapi5/documentation/
Free tier: Yes, but sales-based limits Amazon
Authentication: Access Key + Secret Key (HMAC-SHA256 signing) Elfsight
Initial limits: 1 TPS, 8,640 TPD for first 30 days Amazon
Scaling: 1 TPD per $0.05 shipped revenue Amazon
Operations: GetItems, SearchItems, GetVariations, GetBrowseNodes
TRIGGER: Price drops below threshold
BLOCK: Fetch product details, pricing, reviews

Instacart Developer Platform

URL: https://docs.instacart.com/developer_platform_api/
Free tier: Free to apply (approval required)
Authentication: API Key
Two tiers: Public API (returns Instacart-hosted URLs) and Partner API (real-time product search, requires approval) Instacart
TRIGGER: Recipe ingredient availability triggers shopping list
BLOCK: Generate shopping lists, create shoppable recipe links Instacart

Walgreens API

URL: https://developer.walgreens.com
Free tier: Yes, for approved developers
Authentication: API Key + OAuth
Key endpoints: Prescription Refill/Transfer API, Store Locator (8,000+ stores), Digital Offers API, Store Inventory API Walgreens
TRIGGER: New digital offers available
BLOCK: Find stores, clip coupons, check inventory

UPC/Barcode Lookup APIs
APIFree TierDatabase SizeAuthenticationOpen Food Facts100% free1.3M+ food productsNone requiredUPCitemdb100 requests/day679M+ barcodesAPI key (paid)Barcode LookupTest accountVariesAPI KeyGo-UPC7-day trial (1,000 req)Multi-formatAPI Key
Open Food Facts is particularly valuable: fully free, includes nutrition facts, ingredients, allergens, Nutri-Score, and eco-scores. Endpoint: GET /api/v2/product/{barcode}.json
Retailers Without Public APIs
No official API access: Costco, Trader Joe's, Publix, H-E-B, Aldi, Target (Circle deals), Home Depot, Lowe's, GasBuddy
Third-party alternatives:

SerpApi offers Home Depot search API (pay-per-search)
BigBox API by Traject Data provides Home Depot/Target data ($15/month)
Apify offers scrapers for most retailers ($0.005/result average)
Safeway/Albertsons has unofficial APIs (JWT via Okta OAuth) Jonlu

Gas Price APIs

GasBuddy: No public API (contact press@gasbuddy.com for enterprise)
MyGasFeed: Base URL https://api.mygasfeed.com with lat/lng endpoints
CollectAPI Gas Prices: https://collectapi.com/api/gasPrice (paid)
Apify GasBuddy Scraper: Third-party scraper available


Financial APIs
Financial APIs offer the deepest free tier options of any category, with government economic data being entirely free.
Stock Data APIs
APIFree TierReal-time?Best ForPolygon.io5 req/min, EOD onlyPaid onlyOptions, dark poolsFinnhub60 calls/minYes (US)News, insider tradingAlpha Vantage25 req/day15-min delayTechnical indicatorsTwelve Data800/day, 8/minYesMulti-asset, WebSocketTiingo500 req/dayVia IEXAffordable EODEOD Historical Data20/day (demo only)15-min delay30+ years history
Finnhub stands out with 86,400 free calls/day (60/min) and real-time US stock data:

URL: https://finnhub.io/docs/api
Authentication: API key via token parameter
Key endpoints: /stock/candle, /quote, /company-news, /stock/insider-transactions, /calendar/earnings
TRIGGER: Real-time news sentiment, earnings tracking, insider activity alerts
BLOCK: Historical data, analyst recommendations

Crypto APIs
APIFree TierBest ForCoinGecko Demo30 calls/min, 10K/monthBroad coverage, DeFi, NFTsCoinMarketCap10,000 credits/monthMarket cap rankingsBinanceUnlimited (free)Real-time trading, WebSocketDeFiLlamaGenerous free tierTVL, yield farming, bridges
DeFiLlama is exceptional—most endpoints are completely free:

URL: https://api-docs.defillama.com/
No authentication for free endpoints
Key endpoints: /api/protocols, /api/tvl/{protocol}, /yields, /stablecoins, /bridges GitHub
TRIGGER: TVL changes, yield opportunities
BLOCK: Protocol analytics, chain comparisons

Prediction Markets
APIFree TierNotesPolymarketFree data endpointsTrading requires USDCKalshiFree public endpointsCFTC-regulated, US-focusedManifold Markets100% freePlay money only
Kalshi provides free market data without authentication: Kalshi

URL: https://docs.kalshi.com/
Endpoints: GET /trade-api/v2/markets, GET /trade-api/v2/markets/{ticker}/orderbook
TRIGGER: Event probability tracking
BLOCK: Election, economic, and weather event data

Economic Data (All Free)
APIRequestsCoverageFREDUnlimitedMacro data, interest rates, inflationBLS500/day (registered)Employment, CPI, wagesBEA1,000/dayGDP, trade, personal incomeTreasury Fiscal DataNo limitNational debt, exchange rates
FRED (Federal Reserve Economic Data) is the gold standard:

URL: https://fred.stlouisfed.org/docs/api/fred/
Authentication: Free API key
Key endpoints: /fred/series/observations, /fred/series/search, /fred/releases
TRIGGER: Economic indicator releases
BLOCK: Macro research, interest rate data

SEC & Alternative Data
SEC EDGAR API (Free):

URL: https://www.sec.gov/developer
Authentication: User-Agent header only
Rate limit: 10 requests/second
Key endpoints: Company submissions (data.sec.gov/submissions/CIK##########.json), XBRL company facts, full-text search SEC.govSEC
TRIGGER: New filings (10-K, 10-Q, 8-K, insider Forms 3,4,5)
BLOCK: Financial data extraction, ownership analysis

Alternative data sources:

Unusual Whales: $48/month — options flow, dark pools, Congress trading Luxalgo
Quiver Quant: Premium subscription — Congress trades, lobbying, WSB sentiment
SEC-API.io: Real-time filing alerts, XBRL-to-JSON conversion PyPIGitHub


News & Media APIs
News Aggregation APIs
APIFree TierSourcesDelayNewsAPI.org100 req/day80,000+24 hoursGNewsNon-commercial60,000+NoneMediaStackLimited calls7,500+NoneNewsData.io200 credits/day87,000+12 hoursTheNewsAPI200 credits/dayVaries12 hours
NewsAPI.org pricing reality:

Free: 100 requests/day, 24-hour delay, non-commercial only
Developer: $149/month
Business: $449/month

Hacker News API — Best free news API

URL: https://hacker-news.firebaseio.com/v0/
Free tier: 100% free, no authentication, no rate limit GitHub
Endpoints: /topstories, /newstories, /beststories, /item/{id}, /user/{id}
TRIGGER: Monitor trending tech news by keyword
BLOCK: Fetch story details, user data, comments

Podcast APIs
APIFree TierCoverageListen Notes300 req/monthMost comprehensiveSpotify Podcast APIFreeSpotify catalogPodchaser25,000 points/monthCharts, sponsorsApple Podcasts (iTunes)~20 req/minRSS feeds only

Social Media APIs
Platform Comparison
PlatformFree TierAuthenticationNotesReddit100 QPM (non-commercial)OAuth 2.0$0.24/1K calls commercialTwitter/X500 posts/month write-onlyOAuth 2.0Read access requires $200/monthDiscord BotUnlimitedBot Token50 req/sec globalTelegram BotUnlimitedBot Token30 msg/sec broadcastMastodon300/5 minOAuth 2.0Fully open, decentralizedBluesky5,000 pts/hourJWTCan self-host for unlimitedYouTube Data10,000 units/dayAPI KeySearch costs 100 unitsThreads250 posts/dayOAuth 2.0500 searches/week
Best Free Social APIs
Discord Bot API:

URL: https://discord.com/developers/docs
Rate limits: 50 requests/second global, 5 per endpoint per 5 seconds
TRIGGER: Monitor server activity, new messages
BLOCK: Send messages, manage channels, automate moderation

Telegram Bot API:

URL: https://core.telegram.org/bots/api
Rate limits: 30 msg/sec to different chats, 1/sec to same chat
TRIGGER: Incoming messages via webhook or polling
BLOCK: Send messages, media, inline keyboards

Mastodon API:

URL: https://docs.joinmastodon.org/api/
Rate limits: 300 requests/5 min per account
TRIGGER: Monitor federated timeline, track hashtags
BLOCK: Post statuses, follow users, search content

Bluesky AT Protocol:

URL: https://docs.bsky.app/
Rate limits: 5,000 points/hour, can bypass by self-hosting
TRIGGER: Monitor posts, track mentions
BLOCK: Post, follow, build custom feeds

Sentiment Analysis (Free/Open Source)
ToolTypeBest ForVADERPython librarySocial media, emojis, slangTextBlobPython libraryQuick polarity scoringspaCyPython libraryIndustrial NLP, entity extractionHugging FaceAPI + modelsState-of-the-art transformers

Government & Public Data APIs
All government APIs are free with generous or unlimited access. These are among the most valuable resources for automation.
Federal Government APIs
APIRate LimitBest ForSEC EDGAR10/secFinancial filingsUSPTOVariesPatents, trademarksOpenFDA240/min (with key)Drug/device safety, recallsUSDA FoodData1,000/hourNutrition dataCensus BureauUnlimited (with key)Demographics, economicsBLS500/dayLabor statisticsEPA10/minAir/water qualityNOAA/NWSGenerousWeather, climate
OpenFDA — Essential for health automation

URL: https://open.fda.gov/
Free tier: 120,000 calls/day with API key (1,000 without)
Rate limit: 240 requests/minute
Key endpoints:

/drug/event.json — Adverse events (FAERS) Microsoft Learn
/drug/enforcement.json — Drug recalls Microsoft Learn
/device/510k.json — Medical device clearances
/food/enforcement.json — Food recalls PublicAPI


TRIGGER: New drug recall or adverse event for tracked medication
BLOCK: Drug labeling data, safety research

Legal & Political APIs
APIFree TierCoverageCongress.gov5,000/hourFederal legislationOpenFEC1,000/hourCampaign financeCourtListenerTieredCase law, PACEROpen StatesTieredState legislationProPublica Campaign Finance5,000/dayEnhanced FEC data
Congress.gov API:

URL: https://api.congress.gov/
Authentication: Free API key via api.data.gov
Endpoints: /v3/bill, /v3/member, /v3/committee, /v3/nomination
TRIGGER: Bill status changes, new committee actions
BLOCK: Track legislation, member voting records

International Data
APIAuthenticationCoverageWorld BankNone required200+ countries, development indicatorsOECDNoneEconomic indicatorsEurostatNoneEU statistics

Weather & Environment APIs
Weather API Comparison
APIFree TierForecastHistoricalNWS (National Weather Service)UnlimitedYesLimitedOpen-Meteo10,000/day16 days80+ yearsOpenWeatherMap1,000/day8 daysPaidWeatherAPI.com1M/month14 days1 dayVisual Crossing1,000/dayYesYesTomorrow.ioLimited14 daysYes
NWS API — Best completely free weather API

URL: https://api.weather.gov
Free tier: Unlimited, no API key required
Authentication: User-Agent header recommended
Key endpoints:

/points/{lat},{lon} — Get grid coordinates
/gridpoints/{office}/{x},{y}/forecast — 12-hour periods
/alerts/active — Active weather alerts


TRIGGER: Severe weather alerts for user's location
BLOCK: Get forecasts, current conditions

Open-Meteo — Best for historical data

URL: https://open-meteo.com
Free tier: 10,000 requests/day (soft limit), no key required
Key endpoints: /v1/forecast, /v1/historical (80+ years), /v1/air-quality, /v1/marine
TRIGGER: Daily weather summary at scheduled time
BLOCK: Historical weather analysis, multi-day forecasts

Air Quality APIs
APIFree TierCoverageAirNow (EPA)FreeUS, Canada, MexicoAQICN1,000/sec (!)GlobalIQAir500/dayGlobalAmbee1,000/day trialGlobal + pollen
Earthquake & Fire APIs
USGS Earthquake API:

URL: https://earthquake.usgs.gov/fdsnws/event/1/
Free tier: 100% free, no authentication
Rate limit: 20,000 results max per query
TRIGGER: Earthquake magnitude 4.0+ within radius of user
BLOCK: Seismic data analysis

NASA FIRMS (Wildfires):

URL: https://firms.modaps.eosdis.nasa.gov/api/
Free tier: Free with NASA Earthdata account
Updates: Every 3 hours (US/Canada within 1 minute)
TRIGGER: Active fire detected within miles of property
BLOCK: Wildfire monitoring, evacuation planning


Transportation & Logistics APIs
Flight Tracking
APIFree TierReal-timeOpenSky Network4,000 credits/dayYesFlightAware AeroAPITrial onlyYesAviation EdgeTrialYes
OpenSky Network:

URL: https://openskynetwork.github.io/opensky-api/
Free tier: 4,000 credits/day (8,000 if contributing data)
Authentication: OAuth2 for registered users
Endpoints: /api/states/all, /api/flights/aircraft, /api/tracks/all
TRIGGER: Specific aircraft enters airspace
BLOCK: Real-time flight tracking, historical data

Shipping APIs (All Free to Integrate)
CarrierAuthenticationKey FeaturesFedExOAuth 2.0Tracking, labels, rates, webhooksUPSOAuth 2.0Tracking, shipping, ratesUSPSAPI KeyTracking, address validation, labelsEasyPostAPI KeyMulti-carrier (100+ carriers), $0.02/label
Mapping & Geocoding
APIFree TierBest ForTomTom50K tiles/day + 2,500 APITraffic, routingHERE250,000/monthEnterprise featuresMapbox50,000 loads/monthCustom stylingGoogle Maps$200/month creditBroadest adoptionCensus GeocoderUnlimitedUS addresses only
EV Charging APIs
APIFree TierCoverageNREL AFDC1,000/hourUS government dataOpenChargeMapFree (attribution)Global, crowdsourcedPlugSharePartnership requiredMost comprehensive

Sports, Entertainment & IoT APIs
Sports Data
APIFree TierCoverageThe Odds API500 credits/monthBetting oddsAPI-Football100/daySoccer worldwideSleeperUnlimited freeFantasy sportsFootball-Data.org10 req/minEuropean leaguesMLB Stats APIFree (unofficial)BaseballNHL APIFree (unofficial)HockeyPandaScore1,000/hourEsports
Entertainment APIs
APIFree TierDatabaseTMDbUnlimited (attribution)Movies/TVTV MazeUnlimitedTV schedulesOMDb1,000/dayMoviesSpotify Web APIFree (rate limited)MusicIGDBFree (via Twitch)Video gamesTwitch800 points/minStreamingTicketmaster5,000/dayEvents
IoT & Smart Home
APIFree TierTypeHome Assistant RESTUnlimitedSelf-hosted hubSmartThingsFreeSamsung ecosystemPhilips HueFreeLightingIFTTT WebhooksPro required ($3.49/mo)AutomationTasmotaUnlimitedSelf-hosted devicesESPHomeUnlimitedSelf-hosted sensorsMQTTFree (self-hosted)Protocol
Home Assistant REST API:

URL: https://developers.home-assistant.io/docs/api/rest/
Free tier: Unlimited (self-hosted)
Authentication: Long-Lived Access Token
Key endpoints: /api/states, /api/services/{domain}/{service}, /api/events
TRIGGER: Device state changes (door opened, motion detected)
BLOCK: Control lights, thermostats, run automations


Real Estate, Health & Marketplace APIs
Real Estate APIs
APIFree TierFocusRentCast50 calls/monthRent estimatesWalk Score5,000/dayWalkabilityHUD APIsUnlimitedFair market rentsATTOM30-day trialProperty data
Note: Zillow's public API is deprecated. Access requires partnership through Bridge Interactive.
Health & Wellness APIs
APIFree TierCoverageOpenFDA120K/dayDrug/device safetyNIH E-utilities10 req/secPubMed, researchClinicalTrials.gov~50/minClinical trialsFitbitFree (150/hour/user)Activity, sleepStravaFree (2,000/day)Athletic activitiesOuraWith membershipSleep, readinessSpoonacularLimited freeRecipes, nutritionEdamamLimited freeNutrition analysis
Marketplace APIs
PlatformAPI StatusAlternativeeBayFree Browse APIOfficialEtsyFree (10K/day)OfficialAmazon PA-APIFree (with sales)OfficialAmazon SP-APIFree until Jan 2026OfficialCraigslistNo APIApify scrapersMercariNo public APIUnofficial PythonPoshmarkNo APIApify scrapersFacebook MarketplaceNo APINone reliable

Communication & Notification APIs
Comparison by Channel
ServiceFree TierCost AfterTwilio SMSTrial credits$0.0079/msg DesignGurusSendGrid100/day forever$19.95/moMailgun5,000/month$35/moPostmark100/month$15/moAmazon SES3,000/month (12mo)$0.10/1KPushover$5 one-time10K msg/mo includedNtfy.shUnlimited (self-hosted)$5/mo hosted GitHubGotifyUnlimited (self-hosted)FreeDiscord WebhooksUnlimitedFreeTelegram BotUnlimitedFree
Best Free Notification Options
Ntfy.sh:

URL: https://ntfy.sh
Free tier: Unlimited if self-hosted ntfy
Authentication: None for public topics
Endpoints: POST /topic-name, GET /topic-name/json
TRIGGER: Subscribe via SSE/WebSocket
BLOCK: Push notifications via simple HTTP POST

Discord Webhooks:

Rate limit: 30 requests/minute per webhook
TRIGGER: Interactions API for commands
BLOCK: Send embeds, messages, files


Utility APIs
URL Shorteners
ServiceFree TierTrackingBitly5 links/month ClearVoiceLimitedTinyURLUnlimitedPaid onlyShort.io1,000 links Short.ioYes
Translation APIs
ServiceFree TierQualityGoogle Translate500K chars/monthGoodDeepL500K chars/monthExcellentLibreTranslateUnlimited (self-hosted)Decent
IP Geolocation
ServiceFree TierAccuracyIPinfoUnlimited (country only)HighIP-API45/min (no HTTPS)Goodipstack100/monthGood
OCR & Image APIs
ServiceFree TierUse CaseGoogle Cloud Vision1,000/monthOCR, object detectionOCR.spaceLimited freeText extractionCloudinary25 credits/month CapterraImage processingImgBB32GB storage FilestackImage hosting

Search & Scraping APIs
SERP APIs
ServiceFree TierSpeedSerper.dev2,500 queriesFast (1-2 sec)SerpAPI100/monthMulti-engineJina AI Reader1M tokensLLM-ready
Web Scraping
ServiceFree TierFeaturesFirecrawl500 creditsLLM markdown extractionScrapingBee1,000 credits ApifyJS renderingApifyPay-as-you-goPre-built scrapersBrowserlessLimitedPuppeteer/Playwright
Firecrawl:

URL: https://www.firecrawl.dev
Free tier: 500 credits (1 credit = 1 page)
Paid: $20/mo for 3K credits
Authentication: Bearer token
Endpoints: /scrape, /crawl, /map, /extract
TRIGGER: Crawl completion webhooks
BLOCK: Convert websites to LLM-ready markdown

Jina AI Reader:

URL: https://r.jina.ai/{url}
Free tier: Up to 1 million tokens, no account needed
BLOCK: Convert any URL to clean markdown for AI processing


Quick Reference: Top Free APIs by Category
CategoryBest Free OptionDaily/Monthly LimitGroceryKroger APIRate-limitedRetailBest Buy API5 req/secStock DataFinnhub60/minCryptoCoinGecko Demo10K/monthDeFiDeFiLlamaGenerousEconomic DataFREDUnlimitedNewsHacker News APINo limitSocialTelegram BotUnlimitedSocialDiscord Bot50/secWeatherNWSUnlimitedWeather (Global)Open-Meteo10K/dayAir QualityAQICN1,000/secGovernmentSEC EDGAR10/secDrug SafetyOpenFDA120K/dayResearchNIH E-utilities10/secFlight TrackingOpenSky4K credits/dayShippingUSPSUnlimitedMovies/TVTV Maze2/secGamingIGDBFreeSmart HomeHome AssistantUnlimitedPush NotificationsNtfy.shUnlimitedEmailSendGrid100/dayTranslationGoogle Translate500K chars/moSearchSerper.dev2,500 totalScrapingFirecrawl500 credits

Conclusion
This comprehensive API catalog reveals 200+ integration opportunities across every category relevant to AI automation platforms. The most valuable finding: government APIs (SEC EDGAR, FRED, FDA, Census, NWS) provide unlimited free access to authoritative data. For commercial applications, Finnhub (stocks), CoinGecko (crypto), Open-Meteo (weather), and Telegram/Discord (notifications) offer the most generous free tiers.
Key strategic insights:

Grocery APIs are limited — Kroger and Best Buy are the only major retailers with robust public APIs
Financial data is abundant — Free government sources rival expensive commercial options
Social media is expensive — Twitter/X requires $200+/month for meaningful read access
Push notifications are free — Discord webhooks, Telegram bots, and ntfy.sh cost nothing
Web scraping is evolving — LLM-focused tools like Firecrawl and Jina AI Reader are the new standard