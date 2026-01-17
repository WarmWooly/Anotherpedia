// Warm_Wooly
// 1/17/26 v1.254
// Get constant variables from pages.js
const PAGE = PAGESTORAGE
const REDIRECT = REDIRECTSTORAGE
const SITUATIONS = SITUATIONSSTORAGE
const MADPAGE = MADPAGESTORAGE
const DATEPAGE = DATEPAGESTORAGE
const GUESSPAGE = GUESSPAGESTORAGE
const GUESSPAGEIMG = GUESSPAGEIMGSTORAGE
const ACHIEVEMENT = ACHIEVEMENTSTORAGE

// https://ui.dev/get-current-url-javascript
function getCurrentURL() {
  return window.location.href
}

// Get root
var root = document.documentElement;

// Check if running on mobile
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var mobileTooltip = false

///// CONST REPLACEMENT TABLES /////
const PAGE_NAME_REPLACEMENTS = {
  "&amp;": "&",
  "á": "a",
  "ç": "c",
  "é": "e",
  "ē": "e",
  "ì": "i",
  "ó": "o",
  "ü": "u",
  "æ": "ae",
  "{{s-u": "",
  "{{s-p": "",
  "{{s-b": "",
  "{{ai": "",
  "{{i": "",
  "}}": "",
  "--": "–",
  "–": "-",
  "&vl": "|",
};

///// CONST STRINGS /////
const BASE_MAKE_INFO = "This site is protected by reCAPTCHA and the Google <<link(src=https://policies.google.com/privacy(text=Privary Policylink>> and <<link(src=https://policies.google.com/terms(text=Terms of Servicelink>> apply.&sp[[Learn|How to Make/Edit pages]] how to make and edit pages."

// Updates text for url and searches
function searchText(search) {
  if (typeof search === "undefined") { return "" }
  
  return Object.keys(PAGE_NAME_REPLACEMENTS).reduce((acc, key) => {
    const regex = new RegExp(key, "g");
    return acc.replace(regex, PAGE_NAME_REPLACEMENTS[key]);
  }, search.toLowerCase());
}

// Decodes URI strings
function urlText(usearch) {
  usearch = decodeURIComponent(usearch);
  return usearch
}

// Check if a string is a page
function validPageType(pageCheck) {
  if (PAGE[searchText(pageCheck)]) {
    return "page"
  } else if (REDIRECT[searchText(pageCheck)]) {
    if (PAGE[searchText(REDIRECT[searchText(pageCheck)].redirect)]) {
      return "redirect"
    }
  }
  
  return false
}

// Returns a bool if a string is a page or redirect
function validPage(pageCheck) {
  if (validPageType(pageCheck)) { return true }
  return false
}

// Redirect conversion functions
function convertRedirect(redirectName) { return redirectName = REDIRECT[searchText(redirectName)].redirect }

function linkConvertCheck(redirectName) {
  if (validPageType(redirectName) == "redirect") { return searchText(redirectName) }
  else { return redirectName }
}

function convertCheck(redirectName) {
  if (validPageType(redirectName) == "redirect") { return searchText(convertRedirect(redirectName)) }
  else { return redirectName }
}

function convertableToRedirect(redirectName) {
  if (validPageType(redirectName) == "redirect") { return convertRedirect(redirectName) }
  else { return false }
}

// Populates an object with users on Anotherpedia
var users = {};
function getUsers() {
  if (Object.keys(users).length <= 0) { // Prevent multiple calls running needlessly
    for (const pageKey in PAGE) { // Runs through every page
      if (PAGE.hasOwnProperty(pageKey)) {
        var creators = PAGE[pageKey].creator.split(",")
        creators.forEach((creator) => {
          if (!(searchText(creator) in users)) { // Checks if the user has been listed
            users[searchText(creator)] = { "pages": []};
          }
          users[searchText(creator)].pages[users[searchText(creator)].pages.length] = pageKey;
        });
      }
    }
  }
}

// Checks if a string is a user on Anotherpedia
function validUser(userCheck) {
  if (Object.keys(users).length <= 0) { // Checks if users have been populated (only runs as needed)
    getUsers(); // Populates the users object
  }
  if (searchText(userCheck) in users) { return true; }
  return false;
}


// https://stackoverflow.com/questions/3730359/extract-url-fragment-using-jquery
var ui, commandid, commandinfo
var command = false // Commands are used to alter the page, currently for getting user submissions through GitHub
function urlId() { // Function to extract information (page, commands) from the url
  var url = getCurrentURL()
  ui = url.split("#")[1]
  commandid = url.split("#")[2]
  commandinfo = url.split("#")[3]

  // Prevent undefined urlid
  if (ui == undefined) {
    ui = searchText(localStorage.getItem('homepage')) // If undefined, go back to the user's homepage
  }
  
  ui = urlText(ui)
  var uiRed = searchText(ui) // uiRed = uiRedirect

  // Redirect page if uiRed is a redirect
  if (REDIRECT[uiRed] != undefined && !PAGE[uiRed]) {
    ui = REDIRECT[uiRed].redirect

    var ui2 = searchText(ui)
    
    if (REDIRECT[uiRed] && PAGE[ui2]) {
      PAGE[ui2].content = "{{red⤷ Redirected from {{b" + REDIRECT[uiRed].name + "}}}}&sp" + PAGE[ui2].content
    }
  }
  
  if (commandid) { // Checks for commands
    if (commandid == "createFromTxt") { commandinfo = decodeURIComponent(commandinfo); command = true }
    else if (commandid == "editFromTxt") { commandinfo = decodeURIComponent(commandinfo); command = true }
  }

  return ui
}

const URL_READ = urlId() // This is the page name with special characters and capitalization (title)
const URL_ID = searchText(URL_READ) // This is the raw version of the title in all plain lowercase
const URL_NEW = validPageType(URL_ID) // This is to check if the page exists or not (for loading user-created pages)

// Check if the page has been visited by the user prior
var pagesVisited = localStorage.getItem("pagesVisited")
if (!pagesVisited.includes(URL_ID)) {
  if (pagesVisited.length < 1) { localStorage.setItem("pagesVisited", JSON.stringify([URL_ID])) }
  else {
    pagesVisited = JSON.parse(pagesVisited);
    pagesVisited[pagesVisited.length] = URL_ID
    localStorage.setItem("pagesVisited", JSON.stringify(pagesVisited));
  }
  
  // Add achievements when visiting
  if (pagesVisited.length >= 250) { awardAchievement("Page Globetrotter") }
  else if (pagesVisited.length >= 100) { awardAchievement("Page Voyager") }
  else if (pagesVisited.length >= 50) { awardAchievement("Page Explorer") }
}

// Check if visited page gives and achievement
if (URL_ID == "first") { awardAchievement("Origin"); };

// Define unwanted terms and unsafe pages
const UNWANTED_TERMS = ["gallery of", "(disambiguation)"];
const UNSAFE_PAGES = ["martini", "marge'arita", "dratini (cocktail)", "dratini in a martini", "gallery of dratini in a martini", "phenylacetone", "4-hydroxyphenylacetone", "methylamine", "norton meth lab explosion", "walter white", "gallery of breaking bad", "ayds", "it's everyday bro", "it's every night sis", "list of all pokemon as tall as walter white", "religious rejection of the theory of evolution", "watermelon used as weapon in bus assault", "youtube poop", "hate or date", "random situations", "rizz (application)", "douchetuber", "copypasta", "rizz", "rizzler", "anti rizzler", "i'm missing my pants (breaking bad)", "psalm 137 niv", "psalm 137:9 niv", "task force baguette", "9/11 (unit)", "going out for milk", "fox news' firing of tucker carlson", "tucker carlson network", "the tucker carlson encounter", "mad pages", "m79 grenade launcher", "m79 firearm (disambiguation)", "m1006 sponge grenade", "not safe for work", "looksmaxxing", "mewing", "mogging", "bone smashing", "ninjew (disambiguation)", "ninjew (god's gang)", "uncyclopedia", "howto:be safe with firearms (uncyclopedia)", "arthur morgan - i love my horsey (feat. john marston, dutch van der linde, and micah bell)", "ring girl", "16 (baby keem song)", "16 (highly suspect song)", "wikipedia's article movement for israel-hamas war", "anotherpedia (miraheze)", "stupidedia", "loss (meme)", "stair force one", "we're gonna be talking about the vine boom sfx", "make america great again", "maga hat", "conservapedia", "wikipedia (conservapedia)", "mark (bokureii)", "bullet penetration", "if you have a problem figuring out whether you’re for me or trump, then you ain’t black", "page guesser", "john oliver", "john oliver's snake", "obamna 🥺👿.... palestine 🇵🇸‼ (hd remaster)", "mark (bokurei the phantump)", "psalm 138 niv", "psalm 136 niv", "the ref (lady ballers)", "cybertrump", "googledebunker", "autistic enterocolitis", "cybertrump (song)", "cybertrump (cryptocurrency)", "the donald trump song (electric needle room song)", "anotherpedia achievements", "talk tuah with haliey welch", "pee pee poo poo (day by dave song)", "sick of it (johnwasnever song)", "sick of it (rizz records song)", "virile", "conservapedia and nato", "yagami backwards", "i said hawk tuah and now i'm here w/ whitney cummings", "arthur morgan - thick of it (ft. john marston)", "kamalatale", "unsafe content on anotherpedia", "wdbittle", "suicide or give up", "wicked doll misprint", "felix fever", "imbrandonfarris milk meme", "sweet baby gang", "lowtiergod's motivational speech", "polterabbitgeist", "luigi mangione and breloom", "jet fall (happy wheels)", "bottle run (happy wheels)", "chess.com bishop name change drama", "tvs are now real", "rationalwiki", "wokipedia (term)", "benoit blanc vs hercule poirot", "worth it or woke", "grifter tier list: who is the biggest scumbag i've debunked?", "breeding harness (better than wolves)", "huzz", "rohuzz", "asgore run over dess", "asgore runs over dess with lyrics (bub8les cover)", "bergentruck 201x", "transvestigation", "i herd u liek mudkips", "number go up (the stupendium song)", "afterglow ampharos", "methyphobia", "illegals in my yard", "trump put the fries in the bag", "trump of the day", "no nut november", "clubs deuce voice acting", "what anotherpedia pages do googlers see!?", "the glep ep", "smiling friends ( fan animation )", "eric (rhiane turtonator)", "pins (rhiane turtonator)", "needles (rhiane turtonator)", "we are charlie kirk", "charlie charlie kirky", "kirkification", "lowkirkenuinly", "jemmysponz", "ai piss filter", "piss filter"];

// Function to remove content markers from page content
function removeContentMarkers(content) {
  return content.replace(/<<safe([\s\S]*?)safe>>/g, "");
}

// Remove pages and unsafe content in safe mode
if (localStorage.getItem("safeMode") === "true") {
  Object.keys(PAGE).forEach((pageKey) => {
    if (!UNSAFE_PAGES.includes(pageKey)) {
      const page = PAGE[pageKey];
      page.content = removeContentMarkers(page.content);
    } else {
      delete PAGE[pageKey];
    }
  });
}

// Gets the page of the day
const START_DAY = 29; const START_MONTH = 8; const START_YEAR = 2023;
const START_DATE = new Date(START_YEAR, START_MONTH, START_DAY);
var currentDate = new Date();
const AGE_DAYS = Math.floor((currentDate - START_DATE) / (1000 * 60 * 60 * 24))
function seededRandom() {
  let x = Math.sin(AGE_DAYS + 1) * 10000;
  return x - Math.floor(x);
}
var randomIndex = Math.floor(seededRandom() * Object.keys(PAGE).length);
var pageoftheday = Object.keys(PAGE)[randomIndex];

// Adds page of the day text to the page of the day
PAGE[pageoftheday].content = "{{b⭐ PAGE OF THE DAY! ⭐}}&sp" + PAGE[pageoftheday].content

var connectionList = {}
var unconnectedList = {}  // For testing and page making
var generatedConnectionList = false;

function findConnections(limiter) {
  const limited = limiter != null && limiter != "dev anotherpedia speedrun" && limiter != "dev unmade pages"
  
  if (!generatedConnectionList) {
    // Set up functions to update and manage connections
    const updateUnconnectedList = (link) => {
      if (unconnectedList[link]) { unconnectedList[link] += 1; }
      else { unconnectedList[link] = 1; }
    };

    const processMatch = (match, pageKey) => {
      const [linkText, displayText] = match[1].includes("|") ? match[1].split("|", 2) : [match[1], match[1]];
      const finalLink = convertCheck(displayText);

      if (!validPage(searchText(finalLink)) && !searchText(finalLink).includes("date: ") && !searchText(finalLink).includes("author: ")) {
        updateUnconnectedList(searchText(finalLink));
      } else { connectionList[pageKey].push(searchText(finalLink)); }
    };

    // Run process on every page
    for (const pageKey in PAGE) {
      if (PAGE.hasOwnProperty(pageKey)) {
        const gottenPage = PAGE[pageKey];
        const regex = /\[\[([^\]]*?)\]\]/g; let match; connectionList[pageKey] = [];
        while ((match = regex.exec(gottenPage.content)) !== null) { processMatch(match, pageKey); }
      }
    }

    // Sort test by quantity
    if (limiter == "dev unmade pages") {
      const unconnectedArray = Object.entries(unconnectedList);
      unconnectedArray.sort(function (a, b) { return b[1] - a[1]; });
      const top100 = unconnectedArray.slice(0, 100);
      return top100;
    }
    
    generatedConnectionList = true;
  }

  if (limiter != "dev anotherpedia speedrun") {
    // Create table for connections
    let connectionsText = "<<table";
    const connectionLinks = [];

    Object.keys(connectionList).forEach((pageKey) => {
      if (PAGE[pageKey] && (!limited || connectionList[pageKey].includes(searchText(limiter)))) {
        connectionsText += `{{i{{b[[${PAGE[pageKey].name}|${pageKey}]]}}}}|`;
        connectionLinks.push(PAGE[pageKey].name);
        const connectionDuplicates = new Set();

        connectionList[pageKey].sort().forEach((connectionShort) => {
          connectionShort = convertCheck(connectionShort);

          if (validPage(connectionShort) && !connectionDuplicates.has(connectionShort)) {
            connectionsText += `[[${PAGE[connectionShort].name}|${connectionShort}]]&ftab`;
            connectionDuplicates.add(connectionShort);
          }
        });

        connectionsText += connectionList[pageKey].length === 0 ? "{{iNo Connections}}||" : "||";
      }
    });

    connectionsText = connectionsText === "<<table" ? connectionsText.slice(0, -7) : connectionsText.slice(0, -2) + "table>>";
    
    return [connectionsText, connectionLinks];
  }
}

// Checks if a speedrun path has a shortcut
function speedrunShortcutChecker(speedrunPath, nextConnection, connectionList) {
  /* What this rule enforces:
  1. Paths may not have shortcuts that skip 2+ pages
      "Ampharos" --> "Flaaffy" --> "Mareep" --> "Pound" is invalid as "Ampharos" --> "Pound" exists
  2. Paths may have shortcuts that skip 1 page to keep things fresh and fair
      "Unit" --> "Measurement" --> "Thing" is valid despite "Unit" --> "Thing" existing
  */

  // Loop through each element to check if its included
  for (let i = speedrunPath.length - 2; i >= 0; i--) {
    if (connectionList[speedrunPath[i]]?.includes(nextConnection)) {
      const skipSize = speedrunPath.length - 1 - i;
      if (skipSize > 1) return true;  // multi-hop shortcut → forbidden
    }
  }

  return false;
}

// Generates a speedrun path using Anotherpedia page link connections
function generateSpeedrun(setRun, setSpeedrunLength) {
  if (!generatedConnectionList) { findConnections("dev anotherpedia speedrun") }

  let speedrunPath = [];

    while (speedrunPath.length < 5) {
      // Set random when setSpeedrunLength is undefined
      if (setSpeedrunLength <= 3) { setSpeedrunLength = null; }

      // If there is no set length, then randomly make a path between 5 and 14 pages long
      let speedrunLength = (setSpeedrunLength == null) ? Math.floor(Math.random() * 10 + 5) : setSpeedrunLength;
      let startPage = [];
      let veryStart;
      const startForce = setRun ? (validPageType(setRun) == "page" ? searchText(setRun) : validPageType(setRun) == "redirect" ? searchText(REDIRECT[searchText(setRun)].redirect) : null) : "";

      if (startForce) { // Forced to start with this page
        veryStart = startForce;
        startPage = connectionList[veryStart];

        if (startPage.length < 1) { return null; } // If found page has no connections, try again
      } else { // Randomly select a starting page
        veryStart = randomPage();
        startPage = connectionList[veryStart];
      }

      let loadAttempts = 0; // Tracks how many generations were preformed with this route
      let pageNode = veryStart;
      let forcedLength = (setSpeedrunLength == null) ? false : true;
      speedrunPath = [veryStart];

      while ((speedrunLength > 0 || pageNode === veryStart) && connectionList[pageNode].length !== 0) {

        // Filters if a page can be added
        const filteredConnections = connectionList[pageNode].filter((conn) => {
          return (
            !speedrunPath.includes(conn) && // Prevent entries already included
            !speedrunShortcutChecker(speedrunPath, conn, connectionList)
          );
        });

        // Grabs a random valid connection
        pageNode = filteredConnections[Math.floor(Math.random() * filteredConnections.length)];

        // Cleans up redirects into pages
        if (REDIRECT[pageNode]) { pageNode = searchText(REDIRECT[pageNode].redirect); }

        if (!pageNode) { // Tries to generate again if a dead end is reached
          loadAttempts += 1;

          if (loadAttempts >= 10) { console.log("Speedrun took 10 attempts to generate and failed each time!"); return null; } // Prevent infinite loop

          veryStart = startForce || randomPage();
          startPage = connectionList[veryStart];
          pageNode = veryStart;
          speedrunPath = [veryStart];
        } else { speedrunPath.push(pageNode); speedrunLength -= 1; }
      }
    }

    return speedrunPath;
}

function reloadSpeedrun() {
  var speedrun = generateSpeedrun(document.getElementById("speedrunText").value, document.getElementById("speedrunLength").value)
  if (speedrun == null) {
    document.getElementById("SpeedrunSpan").innerHTML = wikifyText("&spAn issue occurred generating a speedrun. Try again or choose another page.")
  } else {
    document.getElementById("SpeedrunSpan").innerHTML = wikifyText("&spGenerated speedrun (par: " + (speedrun.length - 1) + " clicks): [[" + PAGE[speedrun[0]].name + "|" + speedrun[0] + "]] --> [[" + PAGE[speedrun[speedrun.length - 1]].name + "|" + speedrun[speedrun.length - 1] + "]]<span class='hidden' id='speedrunPath'>&sp")
    for (var speedrunIndex in speedrun) {
      document.getElementById("speedrunPath").innerHTML += wikifyText("[[" + PAGE[speedrun[speedrunIndex]].name + "]]")
      if (speedrunIndex < speedrun.length - 1) {
        document.getElementById("speedrunPath").innerHTML += wikifyText(" --> ")
      }
    }
  }
}

// Get the working and total links from all pages
function getLinkCount() {
  const connectionList = {}
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (page.name) {
        if (page.content.includes("[[")) {
          connectionList[pageKey] = {working: 0, total: 0}
          const linkList = page.content.split("[[")
          linkList.forEach((link, linkIndex) => {
            if (linkIndex == 0) return;
            
            // Checks for ]] to determine if it includes a link.
            if (link.includes("]]")) {
              const [linkContent] = link.split("]]");
              var finalLink = linkContent.includes("|") ? linkContent.split("|")[1] : linkContent;
              finalLink = noTitleItalic(finalLink);

              const linkText = searchText(finalLink);
              const isValidLink = validPage(linkText) || linkText.includes("date: ") || linkText.includes("author: ") || linkText === "&dailypage" || linkText === "&randompage";

              connectionList[pageKey].total += 1;
              if (isValidLink) { connectionList[pageKey].working += 1; }
            }
          })
        } else { connectionList[page] = []; }
      }
    }
  }
  
  return connectionList
}

// Get the size of the page in characters
function getPageSize() {
  const sizeList = {}
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (page.name) { sizeList[page.name] = page.content.length; }
    }
  }
  
  var sizeArray = Object.entries(sizeList);
  sizeArray.sort((a, b) => { return a[1] - b[1]; });
  
  // Add rank to each page size
  sizeArray.forEach((entry, index) => {
    const rankSmallest = index + 1;
    const rankLargest = sizeArray.length - index;
    entry.push(rankSmallest, rankLargest);
  });
  
  return sizeArray
}

// Get the redirects of the pages
function getPageRedirect() {
  var redirectList = {}
  for (const redirectKey in REDIRECT) {
    if (convertableToRedirect(REDIRECT[redirectKey].name)) {
      if (!redirectList[convertableToRedirect(REDIRECT[redirectKey].name)]) { redirectList[convertableToRedirect(REDIRECT[redirectKey].name)] = [] }
      redirectList[convertableToRedirect(REDIRECT[redirectKey].name)][redirectList[convertableToRedirect(REDIRECT[redirectKey].name)].length] = REDIRECT[redirectKey].name
    }
  }
  
  var redirectArray = Object.entries(redirectList);
  redirectArray.sort();
  
  return redirectArray
}

function findShort(shortPage) { // Used to find the short text in a page
  if (validPageType(shortPage) == "redirect") { shortPage = searchText(REDIRECT[searchText(shortPage)].redirect) }
  if (validPage(shortPage)) {
    if (PAGE[searchText(shortPage)].content.includes("<<short")) {
      var fileList = PAGE[searchText(shortPage)].content.split("<<short")
      for (const file in fileList) {
        if (fileList[file].includes("short>>")) {
          const fileFull = fileList[file].split("short>>")
          return fileFull[0]
        }
      }
    }
  }
  
  return ""
}

// Find pages by date
var firstDate = "2023-08-29";
var firstPageDate = "2023-08-30";
var firstPageYear = 2023;
var firstPageMonth = 7;
var firstPageDay = 29;
var latestDate = firstDate;
var currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);
var todayDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
var todayYear = currentDate.getFullYear();
var todayMonth = currentDate.getMonth();
var todayDay = currentDate.getDate();
var tomorrowDate = new Date();
tomorrowDate.setDate(currentDate.getDate() + 1);
tomorrowDate = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function pagesByDate(searchDate) {
  const foundList = []
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (new Date(page.date) > new Date(latestDate)) { // Get latest made page
        latestDate = page.date
      }

      if (page.date == searchDate) { // Get pages for images
        foundList[foundList.length] = page.name
      }
    }
  }
  return foundList
}

if (URL_ID.includes("date: ")) {
  var searchDate = URL_ID.split("date: ")[1]

  // Prevent the day going too low or too high
  const currentDate = new Date();
  const todayDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  if (new Date(firstDate) > new Date(searchDate)) { searchDate = firstDate;
  } else if (new Date(searchDate) > new Date(todayDate)) { searchDate = todayDate; }
  
  foundList = pagesByDate(searchDate)

  // Function to get the next day
  function updateDate(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
  
  var latestDate = firstDate
  foundList = pagesByDate(searchDate);
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (new Date(page.date) > new Date(latestDate)) { latestDate = page.date; }
    }
  }

  let dateContent = "";

  // Get random image from a page
  dateContent += getImage(foundList)
  
  if (searchDate != "2023-08-29") { dateContent += "[[<<-- Earliest|date: 2023-08-29]]&tab[[<-- Previous|date: " + updateDate(searchDate, -1) + "]]&tab" }
  else { dateContent += "[[<<-- Earliest|date: 2023-08-29]]&tab[[<-- Previous|date: 2023-08-29]]&tab" }
  if (searchDate != todayDate) { dateContent += "[[Today|date: " + todayDate + "]]&tab[[Next -->|date: " + updateDate(searchDate, 1) + "]]&tab" }
  else { dateContent += "[[Today|date: " + todayDate + "]]&tab[[Next -->|date: " + todayDate+ "]]&tab" }
  dateContent += "[[Latest -->>|date: " + latestDate + "]]&sp<input type='date' id='SelectDate' class='date' value='" + todayDate + "' min='2023-08-29' max='" + todayDate + "'>&nbsp<button onclick='dateSearch()'>Search</button>&pThis is a [[list]] in [[alphabetical order]] of all pages made on " + searchDate + ":"

  function dateSearch() { change("Same", false, "date: " + document.getElementById("SelectDate").value) }
  
  PAGE[URL_ID] = {
    name: "List of all pages made on " + searchDate,
    content: dateContent,
    date: "today",
    creator: "automatic generation",
  }
  
  totalFound = 0
  PAGE[URL_ID].content += "<<table";
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (page.date === searchDate) {
        totalFound += 1;
        PAGE[URL_ID].content += `[[${PAGE[pageKey].name}]]|{{i${findShort(PAGE[pageKey].name).replace(/{{i/g, "{{ai")}}}||`;
      }
    }
  }
  if (totalFound == 0) { PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -7) + "&pPages found: " + totalFound; }
  else { PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -2) + "table>>&spPages found: " + totalFound; }
}


// Fill the page that contains all pages
var allPages = false
if (searchText(URL_ID) == "main page") {
  const totalLatestPages = 5;
  var foundLatestPages = 0;
  var latestAge = 0;
  var searchDate = new Date(currentDate);
  searchDate.setHours(0, 0, 0, 0);

  var latestList = "<<table{{bPage}}|{{bMade}}";

  var datedPages = {};
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (datedPages[page.date] === undefined) {
        datedPages[page.date] = []
      }
      datedPages[page.date].push(page.name)
    }
  }
  
  console.log(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate())
  
  while (searchDate > new Date(firstPageDate) && foundLatestPages < totalLatestPages) {
    // Add to the table the latest pages based on the day
    timelineText.push(MONTH_NAMES[searchDate.getMonth()] + " " + searchDate.getDate() + ", " + searchDate.getFullYear() + "|")
    var pagesSearched = datedPages[`${searchDate.getFullYear()}-${String(searchDate.getMonth() + 1).padStart(2, '0')}-${String(searchDate.getDate()).padStart(2, '0')}`] || [];
    if (pagesSearched.length != 0) {
      for (const datedPage of pagesSearched) {
        latestList += `||[[${datedPage}]]|`
        if (latestAge == 0) { latestList += "Today" }
        else if (latestAge == 1) { latestList += "Yesterday" }
        else { latestList += `${latestAge} days ago` }
        foundLatestPages++;
        if (foundLatestPages >= totalLatestPages) { break; }
      }
    }
    
    // Go to previous day
    searchDate.setDate(searchDate.getDate() - 1);
    latestAge++;
  }

  // Combine the total page together
  latestList += "table>>"
  PAGE[URL_ID].content = (PAGE[URL_ID].content).replace("LATEST_PAGE_LIST", latestList);
} else if (searchText(URL_ID) == "all pages") {
  allPages = true
} else if (URL_ID == "page connections") { // How pages connect to each other
  connect = findConnections()
  PAGE[URL_ID].content += connect[0]
} else if (URL_ID == "page links") { // Working links in a page
  connect = getLinkCount()
  var conSorted = []
  for (var con in connect) {
    if (connect[con].total - connect[con].working != NaN) {
      if (!conSorted[connect[con].total - connect[con].working]) {
        conSorted[connect[con].total - connect[con].working] = {}
      }
      conSorted[connect[con].total - connect[con].working][con] = connect[con]
    }
  }
  delete conSorted[NaN]
  
  for (var conNum in conSorted) {
    if (conNum == 1) { PAGE[URL_ID].content += "<<hr " + conNum + " red linkhr>>" }
    else { PAGE[URL_ID].content += "<<hr " + conNum + " red linkshr>>" }
    PAGE[URL_ID].content += "<<table{{bPage}}|{{b{{cWorking}}}}|{{b{{cTotal}}}}||"
    for (con in conSorted[conNum]) {
      PAGE[URL_ID].content += "[[" + PAGE[con].name + "]]|{{c" + conSorted[conNum][con].working + "}}|{{c" + conSorted[conNum][con].total + "}}||"
    }
    PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -2);
    PAGE[URL_ID].content += "table>>Total pages: " + Object.keys(conSorted[conNum]).length
  }
} else if (URL_ID == "page sizes") { // Working links in a page
  var sizes = getPageSize()
  PAGE[URL_ID].content += "<<table{{bPage}}|{{b{{cCharacters}}}}|{{b{{rSmallest}}}}|{{b{{rLargest}}}}||"
  sizes.forEach(([pageSize, sizeValue, rankLeast, rankMost]) => { PAGE[URL_ID].content += "[[" + pageSize + "]]|{{r" + sizeValue + "}}|{{r# " + rankLeast + "|{{r# " + rankMost + "}}||"; });
  PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -2);
  PAGE[URL_ID].content += "table>>"
} else if (URL_ID == "page lookup") { // Find pages via lookup
  var sizes = getPageSize()
  var workingLinks = getLinkCount()
  var redirects = getPageRedirect()
  function pageLookup(lookingPage) {
    // Get page area
    var pageLookupArea = document.getElementById("pageLookupArea")
    
    // Turn user-submitted page into a readable format
    lookingPage = searchText(convertCheck(lookingPage))
    
    // Get the connections to the page
    var connect = findConnections(lookingPage)
    
    // Format the creators list
    var creators = PAGE[lookingPage].creator.split(",")
    var creatorLink
    if (creators.length == 1) { creatorLink = "[[" + PAGE[lookingPage].creator + "|author: " + PAGE[lookingPage].creator + "]]"
    } else if (creators.length == 2) { creatorLink = "[[" + creators[0] + "|author: " + creators[0] + "]] and [[" + creators[1] + "|author: " + creators[1] + "]]"
    } else {
      creatorLink = ""
      for (var creator in creators) {
        if (creator < creators.length - 1) { creatorLink += "[[" + creators[creator] + "|author: " + creators[creator] + "]], "
        } else { creatorLink +=  " and [[" + creators[creator] + "|author: " + creators[creator] + "]]" }
      }
    }
    
    // Get character count
    var characterCount = "{{i???}}"
    var rankSmallest = "{{i???}}"
    var rankLargest = "{{i???}}"
    for (var size of sizes) {
      if (size[0] === PAGE[lookingPage].name) {
        characterCount = size[1];
        rankSmallest = "#" + size[2];
        rankLargest = "#" + size[3];
      }
    }
    
    // Get redirects
    var redirectText = ""
    var redirectFound = false
    redirects.forEach((redirectChecked) => { if (redirectChecked[0] == PAGE[lookingPage].name) { redirectFound = redirectChecked; }});
    if (redirectFound) {
      for (var redAdd in redirectFound[1]) { redirectText += "[[" + redirectFound[1][redAdd] + "]], " };
      redirectText = redirectText.slice(0, -2);
      redirectText += " ({{iTotal:}} " + redirectFound[1].length + ")"
    } else { redirectText = "{{iNone}}"}
    
    // Get external connections
    var connectText = ""
    if (connect[1].length > 0) {
      for (var conAdd in connect[1]) { connectText += "[[" + connect[1][conAdd] + "]], " };
      connectText = connectText.slice(0, -2);
      connectText += " ({{iTotal:}} " + connect[1].length + ")"
    } else { connectText = "{{iNone}}"}
    
    // Compile text into the info
    pageLookupArea.innerHTML = wikifyText("<<hr" + PAGE[lookingPage].name + "hr>><<top" + PAGE[lookingPage].name + "top>>{{bLink:}} [[" + PAGE[lookingPage].name + "]]&sp{{bPlain Name:}} " + lookingPage + "&sp{{bCreation Date:}} [[" + PAGE[lookingPage].date +"|date: " + PAGE[lookingPage].date + "]]&sp{{bAuthors:}} " + creatorLink + "&sp{{bShort text:}} " + findShort(lookingPage) + "&sp{{bCharacter count:}} " + characterCount + "&sp{{bRank (smallest):}} " + rankSmallest + "&sp{{bRank (largest):}} " + rankLargest + "&sp{{bWorking links:}} " + workingLinks[lookingPage].working + "&sp{{bRed links:}} " + (workingLinks[lookingPage].total - workingLinks[lookingPage].working) + "&sp{{bTotal links:}} " + workingLinks[lookingPage].total + "&sp{{bRedirects from:}} " + redirectText + "&sp{{bLinked by:}} " + connectText)
  }
} else if (URL_ID == "page redirects") { // Redirects to a page
  var redirects = getPageRedirect()
  
  PAGE[URL_ID].content += "<<table"
  redirects.forEach((redirectFound) => {
    var redirectsAdded = "";
    redirectFound[1].forEach((redirectRedirectFound) => { redirectsAdded += "[[" + redirectRedirectFound + "]]&ftab"; });
    PAGE[URL_ID].content += "{{b{{i[[" + redirectFound[0] +  "]]}}}}|" + redirectsAdded.slice(0, -5) + "||";
  });
  PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -2);
  PAGE[URL_ID].content += "table>>"
} else if (URL_ID == "timeline of pages made on anotherpedia") { // Timeline of made pages
  var searchDate = new Date(firstPageDate)
  searchDate.setHours(0, 0, 0, 0);
  var monthPageCount

  const timelineText = [];

  timelineText.push(PAGE[URL_ID].content)

  var datedPages = {}
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (datedPages[page.date] === undefined) {
        datedPages[page.date] = []
      }
      datedPages[page.date].push(page.name)
    }
  }
  
  console.log(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate())
  
  while (searchDate <= new Date(tomorrowDate)) {
    // Start section and table at the beginning of the month
    if (searchDate.getDate() === 1 || (searchDate.getFullYear() === firstPageYear && searchDate.getMonth() === firstPageMonth && searchDate.getDate() === firstPageDay)) {
      timelineText.push("<<hr" + MONTH_NAMES[searchDate.getMonth()] + " " + searchDate.getFullYear() + "hr>><<table")
      monthPageCount = 0
    }
    
    // Add to the table throughout the month
    timelineText.push(MONTH_NAMES[searchDate.getMonth()] + " " + searchDate.getDate() + ", " + searchDate.getFullYear() + "|")
    var pagesSearched = datedPages[`${searchDate.getFullYear()}-${String(searchDate.getMonth() + 1).padStart(2, '0')}-${String(searchDate.getDate()).padStart(2, '0')}`] || []
    if (pagesSearched.length == 0) {
      timelineText.push("{{iNo pages made}}")
    } else {
      timelineText.push(
        pagesSearched.map(page => `[[${page}]]`).join("&sp")
      );
    }
    if (pagesSearched.length != 1) { timelineText.push("|" + pagesSearched.length + " pages")
    } else { timelineText.push("|" + pagesSearched.length + " page") }
    
    monthPageCount += pagesSearched.length
    
    // Close table at the end of the month
    if (searchDate.getDate() === new Date(searchDate.getFullYear(), searchDate.getMonth() + 1, 0).getDate() || 
        (searchDate.getFullYear() === todayYear && searchDate.getMonth() === todayMonth && searchDate.getDate() === todayDay)) {
      // Determine if it is the current month (has) or a prior month (had)
      var hasOrHad = (searchDate.getFullYear() === todayYear && searchDate.getMonth() === todayMonth && searchDate.getDate() === todayDay) ? "has" : "had";
      var pagePlural = "pages"
      if (monthPageCount == 1) { pagePlural = "page" };
      timelineText.push("table>>&sp" + MONTH_NAMES[searchDate.getMonth()] + " " + searchDate.getFullYear() + " " + hasOrHad + " a total of " + monthPageCount + " " + pagePlural + " made.")
    } else { timelineText.push("||") }
    
    // Go to next day
    searchDate.setDate(searchDate.getDate() + 1);
  }

  // Combine the total page together
  PAGE[URL_ID].content = timelineText.join("");
} else if (URL_ID == "as ofs in anotherpedia pages") { // All 'as of's on Anotherpedia
  var asofTypes = {};
  var asofList = [];
  var dateList = [];
  var dateWordList = [];
  var wordList = [];
  
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      var asofs = page.content.match(/<<asof.*?>>|<<Asof.*?>>/g);
      if (asofs) {
        for (var asof of asofs) {
          var asofIndex = page.content.indexOf(asof);
          var beforeAsOf = page.content.slice(asofIndex - 9, asofIndex);
          
          // Prevents having unstyled asofs from appearing
          if (beforeAsOf != "<<nostyle") {
            var content = asof.slice(6, -2);
            if (content in asofTypes) {
              if (!(asofTypes[content].includes(page.name))) {
                asofTypes[content][asofTypes[content].length] = page.name; // Only adds to a list once
              }
            } else { // Creates a new list if its a new date
              asofTypes[content] = [];
              asofTypes[content][0] = page.name;
              asofList[asofList.length] = content;
            }
          }
        }
      }
    }
  }
  
  for (var asofListItem in asofList) {
    var parsedDate = Date.parse(asofList[asofListItem]);
    if (parsedDate) {
      dateList[dateList.length] = parsedDate;
      dateWordList[dateWordList.length] = [parsedDate, asofList[asofListItem]];
    } else {
      wordList[wordList.length] = asofList[asofListItem];
    }
  }
  
  dateList.sort();
  wordList.sort();
  asofList = [];
  
  for (var dateListItem in dateList) {
    for (var dateWordListItem in dateWordList) {
      if (dateWordList[dateWordListItem][0] == dateList[dateListItem]) {
        asofList[asofList.length] = dateWordList[dateWordListItem][1];
        break;
      }
    }
  }
  
  for (var wordListItem in wordList) {
    asofList[asofList.length] = wordList[wordListItem];
  }
  
  for (var asofListItem in asofList) {
    PAGE[URL_ID].content += "<<hr " + asofList[asofListItem] + "hr>>;;"
    for (var asofPage in asofTypes[asofList[asofListItem]]) {
      PAGE[URL_ID].content += "[[" + asofTypes[asofList[asofListItem]][asofPage] + "]]|"
    }
    PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -1); // Removes the last character
    PAGE[URL_ID].content += ";;"
  }
} else if (URL_ID == "most linked unmade pages") { // What pages are referenced but not made
  var unmadeList = findConnections("dev unmade pages")
  PAGE[URL_ID].content += "<<table{{bPage}}|{{bLinks}}"
  unmadeList.forEach((unmadePage) => {
    PAGE[URL_ID].content += "||[[" + unmadePage[0] + "]]|{{r" + unmadePage[1] + "}}"; 
  });
  PAGE[URL_ID].content += "table>>"
} else if (URL_ID == "anotherpedia speedrun") { // How pages connect to each other
  var speedrun = generateSpeedrun()
  PAGE[URL_ID].content += "<span id='SpeedrunSpan'></span>"
  
} else if (URL_ID == "anotherpedia achievements") {
  // Get achievements
  var achievements = localStorage.getItem("achievements")
  if (achievements.length > 0) { achievements = JSON.parse(localStorage.getItem("achievements")) }
  else { achievements = [] }
  var achievementText = "Total achievements: " +  achievements.length + "/" + Object.keys(ACHIEVEMENT).length + " (" + Math.round(achievements.length / Object.keys(ACHIEVEMENT).length * 100) + "%)&sp";
  
  // Edit achievement image based on achievement count
  if (achievements.length / Object.keys(ACHIEVEMENT).length < 1/3) { PAGE[URL_ID].content = PAGE[URL_ID].content.replace("achievements.png(cap=this could be u", "achievements none.png(cap=u suck no trophy") }
  else if (achievements.length / Object.keys(ACHIEVEMENT).length < 2/3) { PAGE[URL_ID].content = PAGE[URL_ID].content.replace("achievements.png(cap=this could be u", "achievements third.png(cap=pity trophy keep going") }
  else if (achievements.length / Object.keys(ACHIEVEMENT).length < 3/3) { PAGE[URL_ID].content = PAGE[URL_ID].content.replace("achievements.png(cap=this could be u", "achievements second.png(cap=ur gud but not done yet") }
  else { PAGE[URL_ID].content = PAGE[URL_ID].content.replace("achievements.png(cap=this could be u", "achievements.png(cap=your a winer") }
  
  // Populates achievement list
  Object.keys(ACHIEVEMENT).forEach(achievementKey => {
    // Break up achievements with information-containing headers
    if (achievementKey == "Page Explorer") { achievementText += "<<hr2Page Explorationhr2>>Unique pages found: " + JSON.parse(pagesVisited).length }
    else if (achievementKey == "Pageman Saver") { achievementText += "<<hr2Pagemanhr2>>Pageman wins: " + localStorage.getItem("pagemanWins") }
    else if (achievementKey == "Page Size Guesser") { achievementText += "<<hr2Larger Smallerhr2>>Longest Larger Smaller Streak: " + localStorage.getItem("largerSmallerStreak") }
    else if (achievementKey == "Pick and Choose") { achievementText += "<<hr2Miscellaneoushr2>>These are other achievements for a broader range of things that can be done across Anotherpedia." }
      
    // Display achievements
    if (achievements.includes(achievementKey)) { achievementText += "&sp{{b" + achievementKey + "}}" }
    else { achievementText += "&sp{{b?????}}" }
    achievementText += " - {{i" + ACHIEVEMENT[achievementKey] + "}}"
  });
  
  PAGE[URL_ID].content += achievementText
} else if (URL_ID == "random situations") { // Random Situations Minigame
  var gameState = "Start"
  var lastOption = searchText(localStorage.getItem('homepage'))
  PAGE[URL_ID].content += "<br><span id='StupidGame'><button onclick='playGame(`Random Situations`)'>Start Game</button></span>"
  playGame("Random Situations")
} else if (URL_ID == "hate or date") { // Hate or Date Minigame
  gameState = "Start"
  var pagesToDate = [...DATEPAGE];
  var hated = 0; var hateList = [];
  var dated = 0; var dateList = [];
  var pagesDated = []; var dateAction = "";
  var randomDate = "";
  var left = pagesToDate.length;
  PAGE[URL_ID].content += "<br><span id='HateGame'><button onclick='playGame(`Hate or Date`)'>Start Game</button></span>"
  playGame("Hate or Date")
} else if (URL_ID == "mad pages") { // Mad Pages Minigame
  gameState = "Start"
  var madstory = 0
  PAGE[URL_ID].content += "<br><span id='MadGame'><button onclick='playGame(`Mad Pages`)'>Start Game</button></span>"
  playGame("Mad Pages")
} else if (URL_ID == "page guesser") { // Page Guesser Minigame
  var gameState = "Start"
  var correctGuesses = 0; var incorrectGuesses = 0;
  var lastGuess = ""; var lastGuessState = "";
  var pagesToGuess = [...GUESSPAGE]; var pagesToGuessImg = [...GUESSPAGEIMG]; var left = 0; var pageMode = "normal";
  var guessText = ""
  var lastOption = searchText(localStorage.getItem('homepage'))
  PAGE[URL_ID].content += "<br><span id='GuesserGame'><button onclick='playGame(`Page Guesser`)'>Play Normal</button>&tab<button onclick='playGame(`Page Guesser Image`)'>Play Image</button></span>"
  playGame("Page Guesser")
} else if (URL_ID == "pageman") { // Pageman Minigame
  var gameState = "Start"
  var health = 7;
  var allGuesses = []
  var pageToGuess = ""
  var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
  PAGE[URL_ID].content += "<br><span id='PagemanGame'><button onclick='playGame(`Pageman`)'>Play</button></span>"
  playGame("Pageman")
} else if (URL_ID == "larger smaller") { // Larger or Smaller Minigame
  var gameState = "Start"
  var streak = 0
  var updatePhrase = ""
  var oldPage = ""; var newPage = ""; var oldPageSize = 0; var newPageSize = 0;
  PAGE[URL_ID].content += "<br><span id='LargerSmallerGame'><button onclick='playGame(`Larger Smaller`)'>Play</button></span>"
  playGame("Larger Smaller")
} else if (URL_ID == "settings") { // Hide settings button in settings
  root.style.setProperty("--hideSettings", "none");
}

// Get # of pages made by author
function findAuthorCount(authorFound) {
  let foundList = []
  
  var authorSet = new Set();
  for (var authorKey in PAGE) {
    var creator = PAGE[authorKey].creator;
    if (creator.includes(",")) {
      var multiAuthor = creator.split(",");
      multiAuthor.forEach(author => authorSet.add(author));
    } else {
      authorSet.add(creator);
    }
  }

  // Filter out authors with commas
  var authorList = [...authorSet].filter(author => !author.includes(','));
  var normalizedAuthorFound = searchText(authorFound);
  
  authorList.forEach(author => {
    if (searchText(author) === normalizedAuthorFound) {
      for (const pageKey in PAGE) {
        if (PAGE.hasOwnProperty(pageKey)) {
          var page = PAGE[pageKey];
          var pageCreators = page.creator.split(",").map(searchText);

          if (pageCreators.includes(normalizedAuthorFound)) {
            foundList.push(page.name);
          }
        }
      }
    }
  });
  
  return foundList
}

// Gets CSS class based on author count
function authorStyle(authorCount) {
  if (localStorage.getItem("authorColor") == "disabled" || authorCount.length < 10) { return "" }
  else if (authorCount.length >= 500) { return "another500" }
  else if (authorCount.length >= 200) { return "another200" }
  else if (authorCount.length >= 100) { return "another100" }
  else if (authorCount.length >= 50) { return "another50" }
  else if (authorCount.length >= 25) { return "another25" }
  else if (authorCount.length >= 10) { return "another10" }
}

// Find pages by author
if (URL_ID.includes("author: ")) {
  var searchAuthor = URL_READ.split("author: ")[1]

  foundList = findAuthorCount(searchAuthor)

  var authorContent = ""

  // Get random image from a page
  authorContent += getImage(foundList)

  // Get all authors and unique values
  var authorSet = new Set();
  for (var authorKey in PAGE) {
    var creator = PAGE[authorKey].creator;
    if (creator.includes(",")) {
      var multiAuthor = creator.split(",");
      multiAuthor.forEach(author => authorSet.add(author));
    } else {
      authorSet.add(creator);
    }
  }

  // Filter out authors with commas
  var authorList = [...authorSet].filter(author => !author.includes(','));
  var searchAuthorList = authorList.map((author, index) => { return { originalAuthor: author, searchedAuthor: searchText(author) }; });
  searchAuthorList.sort((a, b) => { return a.searchedAuthor.localeCompare(b.searchedAuthor); });
  
  var matchIndex = -1
  searchAuthorList.some((authorObj, index) => { if (authorObj.searchedAuthor === searchText(searchAuthor)) { matchIndex = index; return true; } });

  if (matchIndex == -1) {
    authorContent += "This is not a valid author!"
  } else {
    // Get previous and next authors
    if (matchIndex == 0) { authorContent += "[[<-- " + searchAuthorList[searchAuthorList.length - 1].originalAuthor + "|author: " + searchAuthorList[searchAuthorList.length - 1].originalAuthor + "]]" }
    else { authorContent += "[[<-- " + searchAuthorList[matchIndex - 1].originalAuthor + "|author: " + searchAuthorList[matchIndex - 1].originalAuthor + "]]" }
    authorContent += "&tab{{b" + searchAuthorList[matchIndex].originalAuthor + "}}&tab"
    if (matchIndex == searchAuthorList.length - 1) { authorContent += "[[" + searchAuthorList[0].originalAuthor + " -->|author: " + searchAuthorList[0].originalAuthor + "]]" }
    else { authorContent += "[[" + searchAuthorList[matchIndex + 1].originalAuthor + " -->|author: " + searchAuthorList[matchIndex + 1].originalAuthor + "]]" }
    
    authorContent += "&pThis is a [[list]] in [[alphabetical order]] of all pages made by " + searchAuthor + ":"
    
    totalFound = 0
    authorContent += "<<table"
    for (const foundItem in foundList) {
      totalFound += 1
      authorContent += "[[" + PAGE[searchText(foundList[foundItem])].name + "]]|{{i" + findShort(PAGE[searchText(foundList[foundItem])].name).replace(/{{i/g, "{{ai") + "}}||"
    }
    if (totalFound == 0) { authorContent = authorContent.slice(0, -7); authorContent += "&pPages found: " + totalFound; }
    else { authorContent = authorContent.slice(0, -2); authorContent += "table>>&spPages found: " + totalFound; }
  }
  
  PAGE[URL_ID] = {
    name: "List of all pages made by " + searchAuthor,
    content: authorContent,
    date: "today",
    creator: "automatic generation",
  }
}

// Find pages by term
if (URL_ID.includes("includes: ")) {
  var searchTerm = URL_ID.split("includes: ")[1]

  foundList = []
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (page.content.toLowerCase().includes(searchTerm) && !page.name.toLowerCase().includes("list of all pages that includes ")) {
        foundList[foundList.length] = page.name
      }
    }
  }

  var includesContent = ""

  // Get random image from a page
  includesContent += getImage(foundList)

  
  PAGE[URL_ID] = {
    name: "List of all pages that includes " + searchTerm,
    content: includesContent + "This is a [[list]] in [[alphabetical order]] of all pages that includes <<nostyle" + searchTerm + "nostyle>>:",
    date: "today",
    creator: "automatic generation",
  }
  totalFound = 0
  PAGE[URL_ID].content += "<<table"
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (page.content.toLowerCase().includes(searchTerm) && !page.name.toLowerCase().includes("list of all pages that includes ")) {
        totalFound += 1
        PAGE[URL_ID].content += `[[${PAGE[pageKey].name}]]|{{i${findShort(PAGE[pageKey].name).replace(/{{i/g, "{{ai")}}}||`
      }
    }
  }
  if (totalFound == 0) { PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -7); PAGE[URL_ID].content += "&pPages found: " + totalFound; }
  else { PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -2); PAGE[URL_ID].content += "table>>&spPages found: " + totalFound; }
}

// Find pages by increased search
if (URL_ID.includes("search: ")) {
  var searchQuery = URL_ID.split("search: ")[1]

  var foundList = []
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (searchText(page.name).includes(searchQuery) && !searchText(page.name).includes("list of all pages with the search")) {
        foundList[foundList.length] = page.name
      }
    }
  }

  var searchContent = ""

  // Get random image from a page
  searchContent += getImage(foundList)
  
  PAGE[URL_ID] = {
    name: "List of all pages with the search " + searchQuery,
    content: searchContent + "This is a [[list]] in [[alphabetical order]] of all pages with the search " + searchQuery + ":",
    date: "today",
    creator: "automatic generation",
  }
  var totalFound = 0
  PAGE[URL_ID].content += "<<table"
  for (const pageKey in PAGE) {
    if (PAGE.hasOwnProperty(pageKey)) {
      const page = PAGE[pageKey];
      if (searchText(page.name).includes(searchQuery) && !searchText(page.name).includes("list of all pages with the search")) {
        totalFound += 1
        PAGE[URL_ID].content += "[[" + PAGE[pageKey].name + "]]|{{i" + findShort(PAGE[pageKey].name).replace(/{{i/g, "{{ai") + "}}||"
      }
    }
  }
  if (totalFound == 0) { PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -7); PAGE[URL_ID].content += "&pPages found: " + totalFound; }
  else { PAGE[URL_ID].content = PAGE[URL_ID].content.slice(0, -2); PAGE[URL_ID].content += "table>>&spPages found: " + totalFound; }
}

// Find pages by term
if (URL_ID.includes("connects: ")) {
  var connectionTerm = URL_ID.split("connects: ")[1]

  var connectsContent = ""

  // Get random image from a page
  var connect = findConnections(connectionTerm)
  connectsContent += getImage(connect[1])
  connectsContent += connect[0]

  PAGE[URL_ID] = {
    name: "List of all pages that link to " + connectionTerm,
    content: "This is a [[list]] in [[alphabetical order]] of all pages that link to " + connectionTerm + ":" + connectsContent,
    date: "today",
    creator: "automatic generation",
  }
}

//https://replit.com/@WarmWooly/BootstrapProjectAdvanced?s=app

var tooltipsOpen = {}
var isMobileLinkStatement = "if (isMobile && (localStorage.getItem(`tooltip`) == `true` || localStorage.getItem(`tooltip`) == `mobile`)) { event.preventDefault(); };"

// Get possible results
const DATA = []
for (item in PAGE) {
  if (!searchText(PAGE[item].name).includes("list of all pages with the search ") && !searchText(PAGE[item].name).includes("list of all pages made on ") && !searchText(PAGE[item].name).includes("list of all pages made by ") && !searchText(PAGE[item].name).includes("list of all pages that includes ") && !searchText(PAGE[item].name).includes("list of all pages that link to ")) {
    DATA[DATA.length] = PAGE[item].name
  }
}

// Replacement tables
const symbols = {
  "&vl": "|",
  "&quo": '"',
  "&reg": "®",
  "&copy": "©",
  "&trade": "™",
  "&deg": "°",
  "&approx": "≈",
  "&mpi": "π",
  "&mphi": "Φ",
  "&eps": "ϵ",
  "&der": "∂",
  "&pnd": "£",
  "&emf": "&#8496;",
  "&rho": "&#961;",
  "&ang": "∠",
  "&equ": "⇌",
  "&eset": "∅",
  "&uni": "∪",
  "&itr": "∩",
  "&diamondSuit": "♦",
  "&heartSuit": "♥",
  "&spadeSuit": "♠",
  "&clubSuit": "♣",
  "---": "—",
  "-->>": "↠",
  "<<--": "↞",
  "-->": "→",
  "<--": "←",
  "--": "–",
  "&bba": "𝕒",
  "&bbA": "𝔸",
  "&bbb": "𝕓",
  "&bbB": "𝔹",
  "&bbc": "𝕔",
  "&bbC": "ℂ",
  "&bbd": "𝕕",
  "&bbD": "𝔻",
  "&bbe": "𝕖",
  "&bbE": "𝔼",
  "&bbf": "𝕗",
  "&bbF": "𝔽",
  "&bbgamma": "ℽ",
  "&bbGamma": "ℾ",
  "&bbg": "𝕘",
  "&bbG": "𝔾",
  "&bbh": "𝕙",
  "&bbH": "ℍ",
  "&bbi": "𝕚",
  "&bbI": "𝕀",
  "&bbj": "𝕛",
  "&bbJ": "𝕁",
  "&bbk": "𝕜",
  "&bbK": "𝕂",
  "&bbl": "𝕝",
  "&bbL": "𝕃",
  "&bbm": "𝕞",
  "&bbM": "𝕄",
  "&bbn": "𝕟",
  "&bbN": "ℕ",
  "&bbo": "𝕠",
  "&bbO": "𝕆",
  "&bbpi": "ℼ",
  "&bbPi": "ℼ",
  "&bbp": "𝕡",
  "&bbP": "ℙ",
  "&bbq": "𝕢",
  "&bbQ": "ℚ",
  "&bbr": "𝕣",
  "&bbR": "ℝ",
  "&bbsigma": "⅀",
  "&bbSigma": "⅀",
  "&bbs": "𝕤",
  "&bbS": "𝕊",
  "&bbt": "𝕥",
  "&bbT": "𝕋",
  "&bbu": "𝕦",
  "&bbU": "𝕌",
  "&bbv": "𝕧",
  "&bbV": "𝕍",
  "&bbw": "𝕨",
  "&bbW": "𝕎",
  "&bbx": "𝕩",
  "&bbX": "𝕏",
  "&bby": "𝕪",
  "&bbY": "𝕐",
  "&bbz": "𝕫",
  "&bbZ": "ℤ",
  "&bb0": "𝟘",
  "&bb1": "𝟙",
  "&bb2": "𝟚",
  "&bb3": "𝟛",
  "&bb4": "𝟜",
  "&bb5": "𝟝",
  "&bb6": "𝟞",
  "&bb7": "𝟟",
  "&bb8": "𝟠",
  "&bb9": "𝟡",
  "&allPages": DATA.length,
  "&p": "<br><br>",
  "&sp": "<br>",
  "&tab": "&nbsp;&nbsp;&nbsp;",
  "&ftab": "&nbsp; &nbsp;", // Flexible tab
  "&currentAge": AGE_DAYS,
  "&devOR": "||",
  
  // Spans
  "{{ai": "<span class='antiItalicText'>",
  "{{boxx": "<span class='boxText'>",
  "{{b": "<span class='boldText'>",
  "{{code": "<span class='codeText'>",
  "{{c": "<span class='centerText'>",
  "{{l": "<span class='leftText'>",
  "{{red": "<span class='redirectText'>",
  "{{r": "<span class='rightText'>",
  "{{i": "<span class='italicText'>",
  "{{u-d": "<span class='underDottedText'>",
  "{{u-e": "<span class='underErrorText'>",
  "{{u": "<span class='underText'>",
  "{{gal": "<span class='gallery'>",
  "{{s-b": "<span class='subText'>",
  "{{s-u": "<span class='supText'>",
  "{{s-p": "<span class='supText'>",
  "{{s": "<span class='strikeText'>",
  "{{t": "<span class='topText'>",
  "{{n": "<span class='supText noteText'>",
  "}}": "</span>"
};

function checkImageUrl(imgurl) {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.onload = function() { resolve(true); };
    img.onerror = function() { resolve(false); };
    img.src = imgurl;
  });
}

const REDIRECT_DATA = []
for (var item in REDIRECT) {
  REDIRECT_DATA[REDIRECT_DATA.length] = REDIRECT[item].name
}

console.log(DATA.length, "pages")

function wikifyText(text) {
  var completeText = text
  
  // Remove nostyle tag
  var stylesToReplace = []
  function noStyle() {
    var styleList = completeText.split("<<nostyle")
    completeText = ""
    for (var style in styleList) {
      if (styleList[style].includes("nostyle>>")) {
        var styleFull = styleList[style].split("nostyle>>")
        styleFull[0] = styleFull[0].replace(/\&/g, "&#38;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\|/g, "&vert;")
        stylesToReplace[stylesToReplace.length] = styleFull[0]
        completeText += "replacemewithunstyled" + stylesToReplace.length + styleFull[1]
      } else {
        completeText += styleList[style]
      }
    }
  }
  
  noStyle();
  
  // Remove safe mode tags
  completeText = completeText.replace(/<<safe|safe>>/g, "")
  
  // Remove comments
  completeText = completeText.replace(/<<comment[\s\S]*?comment>>/g, "");
  
  // Remove short tag
  completeText = completeText.replace(/<<short[\s\S]*?short>>/g, "");
  
  // Add disclaimer noticeboxes
  completeText = completeText.replace(/<<nomedical>>/g, "<<notice(type=warn(content=This page is {{bnot}} medical advice and {{bshould not}} be used for diagnosis or treatment. If you have a serious problem, seek medical attention. Please read our [[disclaimer|Anotherpedia disclaimer]] regarding medical information on Anotherpedia.(img=cdn/anotherpedia logo nomedical.svgnotice>>&sp")
  completeText = completeText.replace(/<<nolegal>>/g, "<<notice(type=warn(content=This page is {{bnot}} legal advice and {{bshould not}} be used for legal opinions. If you have a serious problem, seek professional help. Please read our [[disclaimer|Anotherpedia disclaimer]] regarding legal information on Anotherpedia.(img=cdn/anotherpedia logo nolegal.svgnotice>>&sp")
  completeText = completeText.replace(/<<nodanger>>/g, "<<notice(type=warn(content=The content of this page does {{bnot}} support unethical, illegal, or dangerous actions. Please read our [[disclaimer|Anotherpedia disclaimer]] regarding potentially harmful or illegal information on Anotherpedia.(img=cdn/anotherpedia logo nodanger.svgnotice>>&sp")

  // Add WIP noticeboxes
  completeText = completeText.replace(/<<wip>>/g, "<<notice(type=wip(content=This page is a [[work in progress|work in progress (Anotherpedia)]]. You can help by [[editing|how to make/edit pages]] the page.notice>>&sp")
  completeText = completeText.replace(/<<wips>>/g, "<<notice(type=wip(content=This section is a [[work in progress|work in progress (Anotherpedia)]]. You can help by [[editing|how to make/edit pages]] the page.notice>>&sp")

  // Add general noticeboxes
  var boxList = completeText.split("<<notice")
  completeText = ""
  for (var box in boxList) {
    if (boxList[box].includes("notice>>")) {
      var boxFull = boxList[box].split("notice>>")
      var finalBox = boxFull[0].split("(type=")
      var content = finalBox[1].split("(content=")
      var img = [content[1],""];
      if (content[1].includes("(img=")) {
        img = content[1].split("(img=")
      }

      var classes = ""
      if (img[0].includes("(small")) {
        classes += " noticeboxSmall"
        img[0] = img[0].replace("(small", "")
      }

      // Notice type information/default images
      var noticeType = "Info";
      if (content[0] == "warn") {
        if (img[1] == "") { img[1] = "cdn/anotherpedia logo warning.svg" }
        noticeType = "Warn"
      } else if (content[0] == "error") {
        if (img[1] == "") { img[1] = "cdn/anotherpedia logo error.svg" }
        noticeType = "Error"
      } else if (content[0] == "wip") {
        if (img[1] == "") { img[1] = "cdn/anotherpedia logo wip.svg" }
        noticeType = "Warn"
      }
      if (img[1] == "") { img[1] = "cdn/anotherpedia logo info.svg" }

      if (img[1].includes("git/")) { img[1] = img[1] + "?raw=true" }
      img[1] = img[1].replace("git/", "https://warmwooly.github.io/Anotherpedia/files/")
      img[1] = img[1].replace("cdn/", "https://cdn.anotherpedia.com/")
      img[1] = img[1].replace("++", "%2B%2B")
      
      completeText += `<span class="noticebox${classes}"><span class="noticeboxFlare noticeboxFlare${noticeType}"></span><span class="noticeboxImageContainer"><img src="${img[1]}" class="noticeboxImage"></span><span class="noticeboxText"><span>${img[0]}</span></span></span>`

      completeText += boxFull[1]
    } else {
      completeText += boxList[box]
    }
  }

  // Add references
  var references = []
  var refCount = 1
  fileList = completeText.split("<<ref")
  completeText = ""
  for (file in fileList) {
    if (fileList[file]) {
      if (fileList[file].includes("ref>>")) {
        var fileFull = fileList[file].split("ref>>")
        var finalFile = fileFull[0].split("(content=")
        var caption = finalFile[1].split("(text=")
        var textLink = finalFile[0]
        var linkId = Math.floor(Math.random() * 1000000)
        var captionNumber = Math.random() * 1000000 + 100
        if (caption[1] == "refCount") { caption[1] = "{{n[" + refCount + "]}}"; captionNumber = refCount, refCount += 1 }
        else if (caption[1].includes("refCopy")) {
          var captionNum = caption[1].split("refCopy")[1]
          caption[1] = "{{n[" + refCount + "]}}"; refCount += 1;
          caption[0] = references.find(subRef => subRef[subRef.length - 1] == captionNum)[0];
          captionNumber = captionNum
        };
        if (caption[0].startsWith("link|")) {
          caption[0] = caption[0].replace("link|", "")
          caption[0] = "<<link(src=" + caption[0] + "(text=" + caption[0] + "link>>"
        };
        tooltipsOpen[linkId] = "Closed"
        finalFile = '<span style="cursor: pointer;" onmouseenter="linkUpdate(this, <<nostyle`ref|' + caption[0] + '`nostyle>>, `open`)" onmouseleave="linkUpdate(this, <<nostyle`ref|' + caption[0] + '`nostyle>>, `close`)" onclick="scrollFunction(`refArea' + linkId + '`, `NoteRefLink`)" id="' + linkId + '">' + caption[1] + '</span>' + fileFull[1]
        
        references[references.length] = [caption[0], caption[1], linkId, captionNumber]
  
        completeText += finalFile
      } else {
        completeText += fileList[file]
      }
    }
  }
  
  // Add notes
  var notes = []
  var noteCount = 0
  var noteLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
  fileList = completeText.split("<<note")
  completeText = ""
  for (file in fileList) {
    if (fileList[file]) {
      if (fileList[file].includes("note>>")) {
        var fileFull = fileList[file].split("note>>")
        var finalFile = fileFull[0].split("(content=")
        var caption = finalFile[1].split("(text=")
        var textLink = finalFile[0]
        var linkId = Math.floor(Math.random() * 1000000)
        if (caption[1] == "noteCount") { caption[1] = "{{n[" + noteLetters[noteCount] + "]}}"; noteCount += 1 };
        tooltipsOpen[linkId] = "Closed"
        finalFile = '<span style="cursor: pointer;" onmouseenter="linkUpdate(this, <<nostyle`note|' + caption[0] + '`nostyle>>, `open`)" onmouseleave="linkUpdate(this, <<nostyle`note|' + caption[0] + '`nostyle>>, `close`)" onclick="scrollFunction(`notesArea' + linkId + '`, `NoteRefLink`)" id="' + linkId + '">' + caption[1] + '</span>' + fileFull[1]
        
        notes[notes.length] = [caption[0], caption[1], linkId]
  
        completeText += finalFile
      } else {
        completeText += fileList[file]
      }
    }
  }
  
  noStyle();
  
  // Create links
  completeText = completeText.replace(/&randomPage/g, PAGE[randomPage()].name)
  completeText = completeText.replace(/&dailyPage/g, PAGE[pageoftheday].name)
  
  completeText = completeText.replace(/\[\[([^\]]*?)\]\]/g, function(match, content) { // Insane regex
    var linkId = Math.floor(Math.random() * 100000000);
    tooltipsOpen[linkId] = "Closed";
    var textLink, finalLink, validLink = "";
    if (content.includes("|")) {
      var linkParts = content.split("|", 2);
      textLink = linkParts[0];
      finalLink = noTitleItalic(linkParts[1]);
    } else { textLink = content; finalLink = noTitleItalic(textLink); }
    finalLink = linkConvertCheck(finalLink);
    if (!validPage(finalLink) && !searchText(finalLink).includes("date: ") && !searchText(finalLink).includes("author: ") && !searchText(finalLink).includes("&dailypage") && !searchText(finalLink).includes("&randompage")) { validLink = ' class="invalid"'; }
    finalLink = '<a href="#' + finalLink + '" onclick="if (isMobile && (localStorage.getItem(`tooltip`) == `true` &devOR localStorage.getItem(`tooltip`) == `mobile`) && !(`' + finalLink + '`).includes(`date: `) && !(`' + finalLink + '`).includes(`author: `)) { event.preventDefault(); }; change(`Same`, true, `' + finalLink + '`)" onmouseenter="linkUpdate(this, `' + finalLink + '`, `open`)" onmouseleave="linkUpdate(this, `' + finalLink + '`, `close`)" id="' + linkId + '" ' + validLink + '>' + textLink + '</a>';
    return finalLink;
  });

  // Creates images
  var fileList = completeText.split("<<img")
  completeText = ""
  for (var file in fileList) {
    if (fileList[file].includes("img>>")) {
      var fileFull = fileList[file].split("img>>")
      var finalFile = fileFull[0].split("(src=")
      var caption = finalFile[1].split("(cap=")
      var brightness = ""
      var classes = ""
      if (caption[1].includes("(brightImg")) {
        brightness += " brightImage"
        caption[1] = caption[1].replace("(brightImg", "")
      } else if (caption[1].includes("(darkImg")) {
        brightness += " darkImage"
        caption[1] = caption[1].replace("(darkImg", "")
      }
      if (caption[1].includes("(spanImg")) {
        classes += " spanImage"
        caption[1] = caption[1].replace("(spanImg", "")
      }
      if (caption[1].includes("(bigImg")) {
        classes += " bigImage"
        caption[1] = caption[1].replace("(bigImg", "")
      }
      if (caption[1].includes("(smallImg")) {
        classes += " smallImage"
        caption[1] = caption[1].replace("(smallImg", "")
      }
      if (caption[1].includes("(galleryImg")) {
        classes += " galleryImage"
        caption[1] = caption[1].replace("(galleryImg", "")
      }
      if (caption[1].includes("(leftImg")) {
        classes += " leftImage"
        caption[1] = caption[1].replace("(leftImg", "")
      }
      if (caption[1].includes("(deleteImg")) {
        classes += " deleteImage"
        caption[1] = caption[1].replace("(deleteImg", "")
      }
      if (caption[1] != "") {
        var capText = caption[1]
        caption[1] = '<p class="imageText">' + caption[1] + '</p>'
      }
      if (caption[0].includes("git/")) { caption[0] = caption[0] + "?raw=true" }
      caption[0] = caption[0].replace("git/", "https://warmwooly.github.io/Anotherpedia/files/")
      caption[0] = caption[0].replace("cdn/", "https://cdn.anotherpedia.com/")
      caption[0] = caption[0].replace("++", "%2B%2B")
      
      if (localStorage.getItem("toggleImage") == "disabled") { // Hide images if disabled
        finalFile = fileFull[1]
      } else {
        finalFile = '<div class="image' + classes + '"><img onclick="expandImage(`' + caption[0] + '`)"  oncontextmenu="if (true) { popup(`' + caption[0] + '`, `' + brightness +'`, event); event.preventDefault(); }" id="' + caption[0] + '" src="' + caption[0] + '" alt="' + caption[0] + '" class="unexpandedImage ' + brightness + '">' + caption[1] + '</div>' + fileFull[1] 
      }
      
      completeText += finalFile
    } else {
      completeText += fileList[file]
    }
  }
  
  // Creates videos
  var fileList = completeText.split("<<vid")
  completeText = ""
  for (var file in fileList) {
    if (fileList[file].includes("vid>>")) {
      var fileFull = fileList[file].split("vid>>")
      var finalFile = fileFull[0].split("(src=")
      var caption = finalFile[1].split("(cap=")
      if (caption[1] != "") {
        var capText = caption[1]
        caption[1] = '<p class="imageText">' + caption[1] + '</p>'
      }
      if (caption[0].includes("git/")) { caption[0] = caption[0] + "?raw=true" }
      caption[0] = caption[0].replace("git/", "https://warmwooly.github.io/Anotherpedia/files/")
      caption[0] = caption[0].replace("cdn/", "https://cdn.anotherpedia.com/")
      caption[0] = caption[0].replace("++", "%2B%2B")
      
      if (localStorage.getItem("toggleImage") == "disabled") { // Hide videos if disabled
        finalFile = fileFull[1]
      } else {
        finalFile = '<div class="image"><video controls><source src="' + caption[0] + '">Your browser does not support HTML videos.</video>' + caption[1] + '</div>' + fileFull[1] 
      }
      
      completeText += finalFile
    } else {
      completeText += fileList[file]
    }
  }

  // Embed YouTube videos
  completeText = completeText.replace(/<<yt[\s\S]*?yt>>/g, function(match) {
    var parts = match.split("(src=");
    var caption = parts[1].split("(cap=");
    var src = caption[0].trim();
    var cap = "";

    if (caption[1]) {
      cap = '<p class="imageText">' + caption[1].replace("yt>>", "").trim() + '</p>';
    }

    if (localStorage.getItem("youtube") === "disabled") { // Hide YouTube videos if disabled
      return "";
    } else {
      return '<div class="image"><iframe src="' + src + '" allowfullscreen></iframe>' + cap + '</div>';
    }
  });

  // Creates audios
  var fileList = completeText.split("<<aud")
  completeText = ""
  for (var file in fileList) {
    if (fileList[file].includes("aud>>")) {
      var finalFile = fileList[file].split("aud>>")
      caption[0] = finalFile[0]
      
      if (caption[0].includes("git/")) { caption[0] = caption[0] + "?raw=true" }
      caption[0] = caption[0].replace("git/", "https://warmwooly.github.io/Anotherpedia/files/")
      caption[0] = caption[0].replace("cdn/", "https://cdn.anotherpedia.com/")
      caption[0] = caption[0].replace("++", "%2B%2B")
      
      if (localStorage.getItem("audio") == "disabled") { // Hide audio if disabled
        finalFile = finalFile[1]
      } else {
        var audioType = "mpeg"
        if (caption[0].includes(".ogg")) { audioType = "ogg" }
        else if (caption[0].includes(".wav")) { audioType = "wav" }
        finalFile = '<audio controls><source src="' + caption[0] + '" type="audio/' + audioType + '"></audio>' + finalFile[1] 
      }
      
      completeText += finalFile
    } else {
      completeText += fileList[file]
    }
  }

  // Embed graphs
  fileList = completeText.split("<<graph")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("graph>>")) {
      var fileFull = fileList[file].split("graph>>")
      var finalFile = fileFull[0].split("(src=")
      var width = finalFile[1].split("(width=")
      var height = width[1].split("(height=")
      var caption = height[1].split("(cap=")
      
      if (localStorage.getItem("graph") == "disabled") { // Hide graphs if disabled
        finalFile = fileFull[1]
      } else {
        finalFile = '<div class="image" style="max-width: 100%; width: ' + height[0] +  'px;"><iframe src="' + width[0] + '" width="' + height[0] +  '" height= "' + caption[0] + '"></iframe><p class="imageText">' + caption[1] + '</p></div>' + fileFull[1]
      }

      completeText += finalFile
    } else {
      completeText += fileList[file]
    }
  }

  // Embed PDFs
  fileList = completeText.split("<<pdf")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("pdf>>")) {
      var fileFull = fileList[file].split("pdf>>")
      var finalFile = fileFull[0].split("(src=")
      var caption = finalFile[1].split("(cap=")
      if (caption[0].includes("git/")) { caption[0] = caption[0] + "?raw=true" }
      caption[0] = caption[0].replace("git/", "https://warmwooly.github.io/Anotherpedia/files/")
      caption[0] = caption[0].replace("cdn/", "https://cdn.anotherpedia.com/")
      
      if (localStorage.getItem("pdf") == "disabled") { // Hide PDFs if disabled
        finalFile = fileFull[1]
      } else {
        finalFile = '<div class="image"><iframe src="' + caption[0] + '"></iframe><p class="imageText"><a href="' + caption[0] + '" target="_blank" title="This will open the PDF in another tab.">Open PDF 🗗</a><br>' + caption[1] + '</p></div>' + fileFull[1]
      }
      
      completeText += finalFile
    } else {
      completeText += fileList[file]
    }
  }

  // Embed website
  fileList = completeText.split("<<web")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("web>>")) {
      var fileFull = fileList[file].split("web>>")
      var finalFile = fileFull[0].split("(src=")
      var caption = finalFile[1].split("(cap=")
      var webHeight = 500
      var httpCheck = false;
      
      if (caption[1].includes("(embedWeb")) {
        webHeight = 220
        caption[1] = caption[1].replace("(embedWeb", "")
      }
      
      if (caption[0].includes("http://")) { httpCheck = true; }
      
      var websiteId = Math.floor(Math.random() * 1000000)
      
      if (localStorage.getItem("website") == "disabled") { // Hide websites if disabled
        finalFile = fileFull[1]
      } else {
        if (httpCheck) {
          finalFile = `<div class="image fullImage"><p>Sorry, {{b` + caption[0] + `}} couldn't be loaded because it is served over HTTP and not HTTPS.</p></iframe></div>` + fileFull[1]
        } else if (webHeight == 220) {
          finalFile = '<div class="image fullImage"><iframe height="' + webHeight + 'px" src="' + caption[0] + '" id="web' + websiteId + '"></iframe></div>' + fileFull[1]
        } else {
          finalFile = '<div class="image fullImage"><iframe height="' + webHeight + 'px" src="' + caption[0] + '" id="web' + websiteId + '"></iframe> <p class="imageText"><a href="' + caption[0] + '" target="_blank" title="This will open the website in another tab.">Open ' + caption[0] + ' 🗗</a><br>' + caption[1] + '</p></div>' + fileFull[1]
        }
      }
      
      completeText += finalFile
    } else {
      completeText += fileList[file]
    }
  }
  
  noStyle();

  // Add quotes
  fileList = completeText.split("<<quo")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("quo>>")) {
      var fileFull = fileList[file].split("quo>>")
      fileFull = '<div class="quote"><p>' + fileFull[0] + '</p></div>' + fileFull[1]
      
      completeText += fileFull
    } else {
      completeText += fileList[file]
    }
  }

  // Add headers
  fileList = completeText.split("<<hr2")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("hr2>>")) {
      var fileFull = fileList[file].split("hr2>>")
      var headerId = Math.floor(Math.random() * 100000000);
      fileFull = '<h4 class="header subsection" id="section' + searchText(fileFull[0]).replace(/ /g, "").replace(/'/g, "").replace(/"/g, "") + headerId + '">' + fileFull[0] + '</h4>' + fileFull[1]
      
      completeText += fileFull
    } else {
      completeText += fileList[file]
    }
  }
  
  fileList = completeText.split("<<hr3")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("hr3>>")) {
      var fileFull = fileList[file].split("hr3>>")
      var headerId = Math.floor(Math.random() * 100000000);
      fileFull = '<h5 class="header header3 subsubsection" id="section' + searchText(fileFull[0]).replace(/ /g, "").replace(/'/g, "").replace(/"/g, "") + headerId + '">' + fileFull[0] + '</h5>' + fileFull[1]
      
      completeText += fileFull
    } else {
      completeText += fileList[file]
    }
  }

  fileList = completeText.split("<<devTitle")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("devTitle>>")) {
      var fileFull = fileList[file].split("devTitle>>")
      var headerId = Math.floor(Math.random() * 100000000);
      fileFull = '<h2 class="header full-title" id="section' + searchText(fileFull[0]).replace(/ /g, "").replace(/'/g, "").replace(/"/g, "") + headerId + '">' + fileFull[0] + '</h2><hr class="thick-full-width-line">' + fileFull[1]
      
      completeText += fileFull
    } else {
      completeText += fileList[file]
    }
  }

  fileList = completeText.split("<<hr")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("hr>>")) {
      var fileFull = fileList[file].split("hr>>")
      var additionalClasses = ""
      if (fileFull[0].includes("(forceBreak")) {
        fileFull[0] = fileFull[0].replace("(forceBreak", "");
        additionalClasses = " full-title"
      }
      var headerId = Math.floor(Math.random() * 100000000);
      fileFull = '<h3 class="header' + additionalClasses + '" id="section' + searchText(fileFull[0]).replace(/ /g, "").replace(/'/g, "").replace(/"/g, "") + headerId + '">' + fileFull[0] + '</h3><hr class="stop-width-line">' + fileFull[1]
      
      completeText += fileFull
    } else {
      completeText += fileList[file]
    }
  }

  // Add code
  fileList = completeText.split("<<code")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("code>>")) {
      var fileFull = fileList[file].split("code>>")
      fileFull = '<div class="code"><p>' + fileFull[0] + '</p></div>' + fileFull[1]
      
      completeText += fileFull
    } else {
      completeText += fileList[file]
    }
  }
  
  // Add note section
  if (localStorage.getItem("noteArea") == "enabled" && notes.length > 0) {
    var noteText = "<<hrNoteshr>>"
    for (var note in notes) {
      if (note != 0) { noteText += "&sp" }
      noteText += "{{i<span id='notesArea" + notes[note][2] + "' style='cursor: pointer;' onclick='scrollFunction(`" + notes[note][2] + "`, `NoteRefSource`)'>" + notes[note][1] + "</span>}} -- " + notes[note][0]
    }
    completeText += wikifyText(noteText);
  }
  
  // Add reference section
  if (localStorage.getItem("refArea") == "enabled" && references.length > 0) {
    var refText = "<<hrReferenceshr>>"
    var referenceSave = {}
    var completeReferences = []
    for (var reference in references) {
      let foundReferenceKey;
      if (Object.keys(referenceSave).some(referenceKey => {
        if (referenceSave[referenceKey].includes(references[reference][0])) { foundReferenceKey = referenceKey; return true; };
        return false;
      })) {
        completeReferences[foundReferenceKey][0] += "{{i<span id='refArea" + references[reference][2] + "' style='cursor: pointer;' onclick='scrollFunction(`" + references[reference][2] + "`, `NoteRefSource`)'>" + references[reference][1] + "</span>}}"
      } else {
        completeReferences[references[reference][3]] = ["{{i<span id='refArea" + references[reference][2] + "' style='cursor: pointer;' onclick='scrollFunction(`" + references[reference][2] + "`, `NoteRefSource`)'>" + references[reference][1] + "</span>}}", " -- " + references[reference][0]]
        referenceSave[references[reference][3]] = references[reference][0]
      }
    }
    
    for (var completeReference in completeReferences) {
      if (completeReference != 1) { refText += "&sp" }
      refText += completeReferences[completeReference][0] + completeReferences[completeReference][1]
    }
    completeText += wikifyText(refText);
  }

  // Add disambiguation image generator
  fileList = completeText.split("<<disam")
  completeText = ""
  for (file in fileList) {
    if (fileList[file]) {
      if (fileList[file].includes("disam>>")) {
        var fileFull = fileList[file].split("disam>>")
        var finalFile = fileFull[0].split("|")
        finalFile = wikifyText(getImage(finalFile)) + fileFull[1]
  
        completeText += finalFile
      } else {
        completeText += fileList[file]
      }
    }
  }
  
  // Add main image generator
  fileList = completeText.split("<<top")
  completeText = ""
  for (file in fileList) {
    if (fileList[file]) {
      if (fileList[file].includes("top>>")) {
        var fileFull = fileList[file].split("top>>")
        var finalFile = fileFull[0].split("|")
        finalFile = wikifyText(getImage(finalFile, "top")) + fileFull[1]
  
        completeText += finalFile
      } else {
        completeText += fileList[file]
      }
    }
  }

  // Add lists
  var listList = completeText.split("::")
  completeText = ""
  var inList = 1
  for (var list in listList) {
    inList *= -1
    if (listList[list] && inList == 1) {
      var finalListList = listList[list].split("|")
      var finalList = "<ol>"

      for (var listElement in finalListList) {
        finalList += "<li>" + finalListList[listElement] + "</li>"
      }

      finalList += "</ol>"
  
      completeText += finalList
    } else {
      completeText += listList[list]
    }
  }

  listList = completeText.split(";;")
  completeText = ""
  inList = 1
  for (list in listList) {
    inList *= -1
    if (listList[list] && inList == 1) {
      var finalListList = listList[list].split("|")
      finalList = "<ul>"

      for (listElement in finalListList) {
        finalList += "<li>" + finalListList[listElement] + "</li>"
      }

      finalList += "</ul>"

      completeText += finalList
    } else {
      completeText += listList[list]
    }
  }
  
  // Add tables
  var tableList = completeText.split("<<table")
  completeText = ""
  for (var table in tableList) {
    if (tableList[table].includes("table>>")) {
      var tableFull = tableList[table].split("table>>")
      tableFull[0] = tableFull[0].replace(/ \|\| /g, "bruhTextThatMakesMeCry")
      var tableRows = tableFull[0].split("||")
      var completeTable = [] // 2D array. completeTable[x][y] has x = column and y = row
      for (var tableRow in tableRows) {
        var tableColumns = tableRows[tableRow].split("|")
        var currentRow = completeTable.length
        completeTable[currentRow] = []
        for (var tableColumn in tableColumns) {
          tableColumns[tableColumn] = tableColumns[tableColumn].replace(/bruhTextThatMakesMeCry/g, " || ")
          completeTable[currentRow][completeTable[currentRow].length] = tableColumns[tableColumn]
        }
      }
      
      completeText += "<div class='tableWrapper'><table>"
      for (var row in completeTable) {
        completeText += "<tr>"
        for (var column in completeTable[row]) {
          completeText += "<td>" + completeTable[row][column] + "</td>"
        }
        completeText += "</tr>"
      }
      completeText += "</table></div>" + tableFull[1]
    } else {
      completeText += tableList[table]
    }
  }

  // Add infoboxes
  var infoboxList = completeText.split("<<info")
  completeText = ""
  for (var infobox in infoboxList) {
    if (infoboxList[infobox].includes("info>>")) {
      var infoboxFull = infoboxList[infobox].split("info>>")
      infoboxFull[0] = infoboxFull[0].replace(/ \|\| /g, "bruhTextThatMakesMeCry")
      var infoboxRows = infoboxFull[0].split("||")
      var completeInfobox = [] // 2D array. completeInfobox[x][y] has x = column and y = row
      for (var infoboxRow in infoboxRows) {
        var infoboxColumns = infoboxRows[infoboxRow].split("|")
        var currentRow = completeInfobox.length
        completeInfobox[currentRow] = []
        for (var infoboxColumn in infoboxColumns) {
          infoboxColumns[infoboxColumn] = infoboxColumns[infoboxColumn].replace(/bruhTextThatMakesMeCry/g, " || ")
          completeInfobox[currentRow][completeInfobox[currentRow].length] = infoboxColumns[infoboxColumn]
        }
      }
      
      completeText += "<table class='noTableStyle infobox'>"
      for (var row in completeInfobox) {
        completeText += "<tr>"
        for (var column in completeInfobox[row]) {
          let infoboxHeader = ""
          if (completeInfobox[row].length == 1) {
            infoboxHeader = " colspan='2' class='infoboxTitle'"
          }
          completeText += "<td" + infoboxHeader + ">" + completeInfobox[row][column] + "</td>"
        }
        completeText += "</tr>"
      }
      completeText += "</table>" + infoboxFull[1]
    } else {
      completeText += infoboxList[infobox]
    }
  }
  
  // Add external links
  completeText = completeText.replace(/<<link[\s\S]*?link>>/g, function(match) {
    var linkId = Math.floor(Math.random() * 100000000);
    tooltipsOpen[linkId] = "Closed";

    var parts = match.split("(src=");
    var caption = parts[1].split("(text=");
    var link = caption[0].trim();
    var text = caption[1].replace("link>>", "").trim();
    
    var linkTarget = "_blank"
    if (text.includes("(noNew")) { text = text.replace("(noNew", ""); linkTarget = "_self"; }

    if (localStorage.getItem("externalLink") === "disabled") {
      return text;
    } else {
      return '<a href="' + link + '" target="' + linkTarget + '" onmouseenter="linkUpdate(this, `link|' + link + '`, `open`)" onmouseleave="linkUpdate(this, `link|' + link + '`, `close`)" onclick="if (isMobile && (localStorage.getItem(`tooltip`) === `true` &devOR localStorage.getItem(`tooltip`) === `mobile`)) { event.preventDefault(); };" id="' + linkId + '">' + text + '</a>';
    }
  });
  
  // Calculate age
  fileList = completeText.split("<<age")
  completeText = ""
  for (file in fileList) {
    if (fileList[file].includes("age>>")) {
      var fileFull = fileList[file].split("age>>")
      var birthDate = Date.parse(fileFull[0])
      var years = new Date(new Date() - new Date(birthDate)).getFullYear() - 1970;
      
      completeText += years + fileFull[1]
    } else {
      completeText += fileList[file]
    }
  }
  
  // Creates asof
  var asofs = completeText.match(/<<asof.*?>>|<<Asof.*?>>/g);
  if (asofs) {
    for (var asof of asofs) {
      var caseCheck = asof.slice(2, 6);
      var content = asof.slice(6, -2);
      if (caseCheck === "asof") {
        completeText = completeText.replace(asof, "as of " + content);
      } else if (caseCheck === "Asof") {
        completeText = completeText.replace(asof, "As of " + content);
      }
    }
  }
  
  completeText = completeText.replace(/&currentAge/g, AGE_DAYS)

  // Replace with symbols
  const regex = new RegExp(Object.keys(symbols).join('|'), 'g');
  completeText = completeText.replace(regex, match => symbols[match]);
  
  // Read nostyle tag contents
  if (stylesToReplace.length > 0) {
    for (var replaceStyle in stylesToReplace) {
      completeText = completeText.replace("replacemewithunstyled" + (parseInt(replaceStyle) + 1), stylesToReplace[replaceStyle]);
    }
  }

  return completeText
}

// Add editing keybinds
function checkIfEditing() { 
  // Checks if the user is currently editing page title/content through focused inputs
  return ['#TitleInput', '#ContentInput', '#MovingContentInput'].some(selector => document.activeElement.matches(selector));
}

function createKeybindText(selectedInput, textType, variableString, shifting, additionalText, additionalTextShift) {
  // Set any undefined optional values
  additionalText = additionalText || "";
  additionalTextShift = additionalTextShift || 0;
  
  // Creates a tag element based on a key
  if (selectedInput && (selectedInput.tagName === 'INPUT' || selectedInput.tagName === 'TEXTAREA')) {
    event.preventDefault(); // Prevent default Ctrl + key behavior

    const cursorStartPos = selectedInput.selectionStart;
    const cursorEndPos = selectedInput.selectionEnd;
    const selectedText = selectedInput.value.substring(cursorStartPos, cursorEndPos);

    let textToInsert;
    let newCursorPos;

    if (textType == "Styling") {
      if (cursorStartPos == cursorEndPos) {
        textToInsert = `{{${variableString}}}`;
        newCursorPos = cursorStartPos + variableString.length + 2;
      } else {
        textToInsert = `{{${variableString}${selectedText}}}`;
        newCursorPos = -(variableString.length + 4);
      }

      insertTextWithUndo(selectedInput, textToInsert, cursorStartPos, cursorEndPos, newCursorPos);
    } else if (textType == "Tag") {
      if (cursorStartPos == cursorEndPos) {
        textToInsert = `<<${variableString}${additionalText}${variableString}>>`;
        newCursorPos = cursorStartPos + variableString.length + 2 + additionalTextShift;
      } else {
        textToInsert = `<<${variableString}${selectedText}${variableString}>>`;
        newCursorPos = -((variableString.length * 2) + 4);
      }

      insertTextWithUndo(selectedInput, textToInsert, cursorStartPos, cursorEndPos, newCursorPos);
    } else if (textType == "Symbol") {
      if (cursorStartPos == cursorEndPos) {
        textToInsert = `&${variableString}`;
        newCursorPos = cursorStartPos + variableString.length + 1;
      } else {
        textToInsert = `&${variableString}${selectedText}>>`;
        newCursorPos = -(variableString.length + 1);
      }

      insertTextWithUndo(selectedInput, textToInsert, cursorStartPos, cursorEndPos, newCursorPos);
    }
  }
}

// Tricks the browser into thinking that the user wrote the text to allow undo/redo
function insertTextWithUndo(input, text, start, end, cursorPos) {
  // Replace selected text or insert at cursor
  const originalValue = input.value;

  const before = originalValue.substring(0, start);
  const after = originalValue.substring(end);
  const newValue = before + text + after;

  // Update input value and let the browser handle the undo stack
  input.focus(); // Ensure the input is focused
  if (document.execCommand) {
    // Use execCommand if available to insert text
    input.setSelectionRange(start, end); // Select the range to be replaced
    document.execCommand('insertText', false, text);
  } else {
    // Fallback for browsers not supporting execCommand
    input.value = newValue;
  }
  
  // Set the cursor position
  if (cursorPos < 0) {
    input.setSelectionRange(start, end - cursorPos);
  } else {
    input.setSelectionRange(cursorPos, cursorPos);
  }

  // Trigger input event to notify listeners of the change
  input.dispatchEvent(new Event('input', { bubbles: true }));
}


document.addEventListener('keydown', (event) => {
  if (checkIfEditing()) { 
    // Verifies the user is trying to edit
    const selectedInput = document.activeElement;
    if (event.ctrlKey && event.key === 'b') { // Add bold
      createKeybindText(selectedInput, "Styling", "b", event.shiftKey);
    } else if (event.ctrlKey && event.key === 'i') { // Add italics
      createKeybindText(selectedInput, "Styling", "i", event.shiftKey);
    } else if (event.ctrlKey && event.key === 'u') { // Add underline
      createKeybindText(selectedInput, "Styling", "u", event.shiftKey);
    } else if (event.ctrlKey && event.key === '.') { // Add superscript
      createKeybindText(selectedInput, "Styling", "s-u", event.shiftKey);
    } else if (event.ctrlKey && event.key === ',') { // Add subscript
      createKeybindText(selectedInput, "Styling", "s-b", event.shiftKey);
    } else if (event.ctrlKey && event.key === 'q') { // Add topper
      createKeybindText(selectedInput, "Styling", "t", event.shiftKey);
    } else if (event.ctrlKey && event.key === 'e') { // Add anti-italic
      createKeybindText(selectedInput, "Styling", "ai", event.shiftKey);
    } else if (event.ctrlKey && event.key === 'k') { // Add code
      createKeybindText(selectedInput, "Styling", "code", event.shiftKey);
    } else if (event.altKey && event.key === '1') { // Add <<hr>>
      createKeybindText(selectedInput, "Tag", "hr", event.shiftKey);
    } else if (event.altKey && event.key === '2') { // Add <<hr2>>
      createKeybindText(selectedInput, "Tag", "hr2", event.shiftKey);
    } else if (event.altKey && event.key === '3') { // Add <<hr3>>
      createKeybindText(selectedInput, "Tag", "hr3", event.shiftKey);
    } else if (event.altKey && event.key === 't') { // Add <<table>>
      createKeybindText(selectedInput, "Tag", "table", event.shiftKey);
    } else if (event.altKey && event.key === 'k') { // Add <<code>>
      createKeybindText(selectedInput, "Tag", "code", event.shiftKey);
    } else if (event.altKey && event.key === 'h') { // Add <<short>>
      createKeybindText(selectedInput, "Tag", "short", event.shiftKey);
    } else if (event.altKey && event.key === 'q') { // Add <<quo>>
      createKeybindText(selectedInput, "Tag", "quo", event.shiftKey);
    } else if (event.altKey && event.key === 'n') { // Add <<nostyle>>
      createKeybindText(selectedInput, "Tag", "nostyle", event.shiftKey);
    } else if (event.altKey && event.key === 'm') { // Add <<comment>>
      createKeybindText(selectedInput, "Tag", "comment", event.shiftKey);
    } else if (event.altKey && event.key === 'f') { // Add <<safe>>
      createKeybindText(selectedInput, "Tag", "safe", event.shiftKey);
    } else if (event.altKey && event.key === 'u') { // Add <<aud>>
      createKeybindText(selectedInput, "Tag", "aud", event.shiftKey);
    } else if (event.altKey && event.key === 'i') { // Add <<img>>
      createKeybindText(selectedInput, "Tag", "img", event.shiftKey, "(src=(cap=", 5);
    } else if (event.altKey && event.key === 'v') { // Add <<vid>>
      createKeybindText(selectedInput, "Tag", "vid", event.shiftKey, "(src=(cap=", 5);
    } else if (event.altKey && event.key === 'y') { // Add <<yt>>
      createKeybindText(selectedInput, "Tag", "yt", event.shiftKey, "(src=https://www.youtube.com/embed/(cap=", 35);
    } else if (event.altKey && event.key === 'r') { // Add <<ref>>
      createKeybindText(selectedInput, "Tag", "ref", event.shiftKey, "(content=(text=refCount", 9);
    } else if (event.altKey && event.key === 'o') { // Add <<note>>
      createKeybindText(selectedInput, "Tag", "note", event.shiftKey, "(content=(text=noteCount", 9);
    } else if (event.altKey && event.key === 'p') { // Add &p
      createKeybindText(selectedInput, "Symbol", "p", "", event.shiftKey);
    } else if (event.altKey && event.key === 's') { // Add &sp
      createKeybindText(selectedInput, "Symbol", "sp", "", event.shiftKey);
    } else if (event.altKey && event.key === 'c') { // Copy code
      copyCode('copy');
    } else if (event.altKey && event.key === 'g') { // Regenerate sections
      regenerateScrollSections();
    }
  }
});

// Determine if the page exists, and if not, create a message
var pageType = undefined
var editHistory
if (!validPage(URL_ID)) {
  var completeText = "Sorry, but this page does not exist!"
  // Set elements in the page
  var pageType = "New"
  document.getElementById("PageTitle").innerHTML = urlText(ui).replace("&vl", "|") + " (New Page)"
  document.getElementById("Title").innerHTML = urlText(ui)
  document.getElementById("Date").innerHTML = "Not made yet!"
  document.getElementById("Content").innerHTML = wikifyText(completeText)
  document.getElementById("PageCreator").classList.remove("hidden")
  root.style.setProperty("--hideEdit", "none");
  
  restoreCode()
} else {
  var pageType = "Page"
  updatePage()
}

function noTitleItalic(italicTitle) {
  if (italicTitle) {
    return italicTitle.replace(/{{i/g, "").replace(/{{ai/g, "").replace(/}}/g, "")
  } else {
    return null
  }
}

// Set elements in the page
function updatePage() {
  const pageSuffixes = { "Page": "", "New": " (New Page)", "Editing": " (Editing)", "Edited": " (Edited)", "Copied": " (Copied)" };
  document.getElementById("PageTitle").innerHTML = noTitleItalic(PAGE[URL_ID].name).replace("&vl", "|") + pageSuffixes[pageType];
  document.getElementById("Title").innerHTML = wikifyText(PAGE[URL_ID].name);

  var dateLink = ""
  var creatorLink = ""
  
  if (PAGE[URL_ID].date != "today") {
    dateLink = "<span class='clickableh5' onclick='change(`Same`, false, `date: " + PAGE[URL_ID].date + "`)' oncontextmenu='change(`New`, false, `date: " + PAGE[URL_ID].date + "`)'>" + PAGE[URL_ID].date + "</span>"
  }

  if (PAGE[URL_ID].creator != "automatic generation") {
    var creators = PAGE[URL_ID].creator.split(",")
    if (creators.length == 1) {
      creatorLink = "<span class='clickableh5 " + authorStyle(findAuthorCount(PAGE[URL_ID].creator)) + "' onclick='change(`Same`, false, `author: " + PAGE[URL_ID].creator + "`)' oncontextmenu='change(`New`, false, `author: " + PAGE[URL_ID].creator + "`)'>" + PAGE[URL_ID].creator + "</span>"
    } else if (creators.length == 2) {
      creatorLink = "<span class='clickableh5 " + authorStyle(findAuthorCount(creators[0])) + "' onclick='change(`Same`, false, `author: " + creators[0] + "`)' oncontextmenu='change(`New`, false, `author: " + creators[0] + "`)'>" + creators[0] + "</span> and <span class='clickableh5 " + authorStyle(findAuthorCount(creators[1])) + "' onclick='change(`Same`, false, `author: " + creators[1] + "`)' oncontextmenu='change(`New`, false, `author: " + creators[1] + "`)'>" + creators[1] + "</span>"
    } else {
      creatorLink = ""
      for (var creator in creators) {
        if (creator < creators.length - 1) {
          creatorLink += "<span class='clickableh5 " + authorStyle(findAuthorCount(creators[creator])) + "' onclick='change(`Same`, false, `author: " + creators[creator] + "`)' oncontextmenu='change(`New`, false, `author: " + creators[creator] + "`)'>" + creators[creator] + "</span>, "
        } else {
          creatorLink +=  " and <span class='clickableh5 " + authorStyle(findAuthorCount(creators[creator])) + "' onclick='change(`Same`, false, `author: " + creators[creator] + "`)' oncontextmenu='change(`New`, false, `author: " + creators[creator] + "`)'>" + creators[creator] + "</span>"
        }
      }
    }
  }

  if (PAGE[URL_ID].date != "today") { document.getElementById("Date").innerHTML = "Created on " + dateLink + " by " + creatorLink
  } else { document.getElementById("Date").innerHTML = "Automatically generated page" }
  
  document.getElementById("Content").innerHTML = wikifyText(PAGE[URL_ID].content)
}

// Reload the page on a link click
function change(changeType, mobileCheck, page) {
  if (mobileCheck == false || isMobile == false) {
    if (changeType == "Same") {
      window.location.hash = "#" + page;
      
      window.location.reload();
      
      // Scroll to top
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    } else if (changeType == "New") {
      window.open("https://warmwooly.github.io/Anotherpedia/#" + page.toLowerCase(), "_blank");
    }
  }
}

// Get search elements
const searchBar = document.getElementById("SearchBar");
const resultsList = document.getElementById("Results");
var mobileSearching = false

if (isMobile) {
  if (window.innerWidth <= 800) { document.getElementById("enableSearch").classList.remove("hidden"); }
  document.getElementById("SearchBar").classList.add('mobile');

  function mobileSearch(searchState, searchUpdateCause) { // Determines if the search bar should be displayed on mobile
    mobileSearching = searchState;
    console.log(searchUpdateCause);
    console.log(mobileSearching);
    if (mobileSearching) {
      document.querySelectorAll('.headerButton').forEach(element => element.classList.add("hidden"));
      document.querySelectorAll('.enableSearchButton').forEach(element => element.classList.add("hidden"));
      if (searchUpdateCause == "window_resize_larger") { // If screen size large, hide search bar hide button
        document.querySelectorAll('.disableSearchButton').forEach(element => element.classList.add("hidden"));
      } else {
        document.querySelectorAll('.disableSearchButton').forEach(element => element.classList.remove("hidden"));
      }
      root.style.setProperty("--searchHidden", 'default');
    } else if (searchUpdateCause == "window_resize_smaller" && Array.from(document.querySelectorAll('.disableSearchButton')).some(element => element.classList.contains("hidden")) || searchUpdateCause == "button_close") {
      resultsList.classList.remove("showResults");
      document.querySelectorAll('.headerButton').forEach(element => element.classList.remove("hidden"));
      document.querySelectorAll('.enableSearchButton').forEach(element => element.classList.remove("hidden"));
      document.querySelectorAll('.disableSearchButton').forEach(element => element.classList.add("hidden"));
      root.style.setProperty("--searchHidden", 'none');
    }
  }
}

function toggleMobileSidebar() {
  if (document.getElementById("Sidebar").classList.contains('hiddenSidebar')) {
    document.getElementById("Sidebar").classList.remove('hiddenSidebar');
  } else {
    document.getElementById("Sidebar").classList.add('hiddenSidebar');
  }
}

// Detect when the search bar is interacted with
let searchTimeout;
searchBar.addEventListener("input", function () {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch(this.value);
  }, 100); // Prevents input spam lagging
});

searchBar.addEventListener("focus", () => {
  if (!mobileSearching) {
    resultsList.classList.add("showResults");
    document.querySelectorAll('.headerButton').forEach(element => element.classList.add("hidden"));
    performSearch(searchBar.value)
  }
});

let isListClicked = false;

resultsList.addEventListener("mousedown", () => {
  isListClicked = true;
});

resultsList.addEventListener("mouseup", () => {
  isListClicked = false;
});

searchBar.addEventListener("blur", () => {
  setTimeout(() => {
    if (!mobileSearching) {
      if (!isListClicked) {
        resultsList.classList.remove("showResults");
      }
      if (!isMobile) {
        document.querySelectorAll('.headerButton').forEach(element => element.classList.remove("hidden"));
      }
    }
  }, 10);
});

searchBar.addEventListener("keyup", event => {
  if (event.key === "Enter") {
    const content = event.target.value;
    if (content != "") {
      change("Same", false, liSearch(searchText(content), "Enter"))
    }
  }
});

document.getElementById("Home").addEventListener("keyup", event => {
  if (event.key === "Enter") {
    change("Same", false, searchText(localStorage.getItem('homepage')))
  }
});

var currentSearches = [searchText(localStorage.getItem('homepage'))]

function liSearch(liQuery, searchType) {
  if (searchType == "Click") {
    if (liQuery.includes("See More for ")) {
        liQuery = liQuery.replace("See More for ", "search: ")
    }
    if (liQuery.includes("Make Page for ")) {
        liQuery = liQuery.replace("Make Page for ", "")
    }

    liQuery = noTitleItalic(liQuery)
    return liQuery
  } else {
    if (currentSearches[0].includes("new: ")) {
      currentSearches[0] = currentSearches[0].replace("new: ", "")
    }
    
    currentSearches[0] = noTitleItalic(currentSearches[0])
    return currentSearches[0]
  }
  searchBar.value = ""
}

// Searching functionality
function performSearch(query) {
  resultsList.innerHTML = ""; // Clear previous results

  const searchLimit = 10; // Make changable in settings? | THIS IS ONLY A MAXIMUM
  var totalFound = 0;

  var filteredData = [];
  var foundPages = [];
  
  // Prevent same entries getting added
  function checkFilteredData(citem, checkReason) {
    if (checkReason == "starts" || checkReason == "includes") {
      if (filteredData.includes(citem)) { return false; };
    } else if (checkReason == "redirect") {
      if (filteredData.includes(REDIRECT[searchText(citem)].redirect)) { return false; };
      filteredData.forEach(fitem => { if (convertableToRedirect(fitem) == convertableToRedirect(citem) && convertableToRedirect(citem)) { return false; }; });
    } else if (checkReason == "short") {
      if (filteredData.includes(citem)) { return false; };
      filteredData.forEach(fitem => { if (convertableToRedirect(fitem) == citem) { return false; }; });
    };
    return true;
  };

  // Pre-set search item
  const searchQuery = searchText(query)

  // 1. Loop through pages matching the text
  DATA.forEach(item => {
    if (totalFound >= searchLimit) { return }; // Early exit when limit is reached
    if (searchText(item) == searchQuery) { // If it matches exactly, push it
      filteredData.push(item);
      foundPages.push(item);
      totalFound++;
    }
  });

  // 2. Loop through redirects matching the text
  REDIRECT_DATA.forEach(item => {
    if (totalFound >= searchLimit) { return }; // Early exit when limit is reached
    if (validPageType(item) == "redirect") { // Verifies the item is a working redirect
      if (checkFilteredData(item, "redirect")) { // Verifies item is not a duplicate
        if (searchText(item) == searchQuery) { // If it matches exactly, prepare to push it
          var redirectPush = true
          filteredData.forEach(fitem => {
            if (REDIRECT[searchText(fitem)]) {
              // Ensures there's no duplicates
              if (searchText(fitem) == searchText(REDIRECT[searchText(item)].redirect)) {
                redirectPush = false
              }
            }
          })
          if (redirectPush) {
            filteredData.push(REDIRECT[searchText(item)].redirect);
            foundPages.push(item);
            totalFound++;
          }
        }
      }
    }
  });
  
  // 3. Loop through pages starting with the same text
  DATA.forEach(item => {
    if (totalFound >= searchLimit) { return }; // Early exit when limit is reached
    if (checkFilteredData(item, "starts")) { // Verifies item is not a duplicate
      if (searchText(item).startsWith(searchQuery)) { // If it starts the same, push it
        filteredData.push(item);
        foundPages.push(item);
        totalFound++;
      }
    }
  });

  // 4. Loop through redirects starting with the same text
  REDIRECT_DATA.forEach(item => {
    if (totalFound >= searchLimit) { return }; // Early exit when limit is reached
    if (validPageType(item) == "redirect") { // Verifies the item is a working redirect
      if (checkFilteredData(item, "redirect")) { // Verifies item is not a duplicate
        if (searchText(item).startsWith(searchQuery)) { // If it starts the same, prepare to push it
          var redirectPush = true
          filteredData.forEach(fitem => {
            if (REDIRECT[searchText(fitem)]) {
              // Ensures there's no duplicates
              if (searchText(fitem) == searchText(REDIRECT[searchText(item)].redirect)) {
                redirectPush = false  
              }
            }
          })
          if (redirectPush) {
            filteredData.push(REDIRECT[searchText(item)].redirect);
            foundPages.push(item);
            totalFound++;
          }
        }
      }
    }
  });

  // 5. Loop through pages containing the text
  DATA.forEach(item => {
    if (totalFound >= searchLimit) { return }; // Early exit when limit is reached
    if (checkFilteredData(item, "includes")) { // Verifies item is not a duplicate
      if (searchText(item).includes(searchQuery)) { // If it contains the same, push it
        filteredData.push(item);
        foundPages.push(item);
        totalFound++;
      }
    }
  });
  
  // 6. Loop through redirect pages when original page isn't there
  REDIRECT_DATA.forEach(item => {
    if (totalFound >= searchLimit) { return }; // Early exit when limit is reached
    if (validPageType(item) == "redirect") { // Verifies the item is a working redirect
      if (checkFilteredData(item, "redirect")) { // Verifies item is not a duplicate
        if (searchText(item).includes(searchQuery)) { // If it contains the same, prepare to push it
          var redirectPush = true
          filteredData.forEach(fitem => {
            if (REDIRECT[searchText(fitem)]) {
              // Ensures there's no duplicates
              if (searchText(fitem) == searchText(REDIRECT[searchText(item)].redirect)) {
                redirectPush = false  
              }
            }
          })
          if (redirectPush) {
            filteredData.push(REDIRECT[searchText(item)].redirect);
            foundPages.push(item);
            totalFound++;
          }
        }
      }
    }
  });
  
  // 7. Loop through pages' short text (if enabled)
  if (localStorage.getItem("shortText") == "true" && localStorage.getItem("searchShort") == "true") {
    DATA.forEach(item => {
      if (totalFound >= searchLimit) { return }; // Early exit when limit is reached
      if (checkFilteredData(item, "short")) { // Verifies item is not a duplicate
        if (validPageType(item) == "page") {
          if (searchText(findShort(item)).includes(searchQuery)) {
            filteredData.push(item);
            foundPages.push(item);
            totalFound++;
          }
        }
      }
    });
  }

  // 8. Loop through pages containing the text in the page (if enabled)
  if (localStorage.getItem("searchPage") == "true") {
    DATA.forEach(item => {
      if (totalFound >= searchLimit) { return }; // Early exit when limit is reached
      if (!filteredData.includes(item)) {
        if (searchText(PAGE[searchText(item)].content).includes(searchQuery) && totalFound < searchLimit) {
          filteredData.push(item);
          foundPages.push(item);
          totalFound++;
        }
      }
    });
  }

  if (totalFound >= searchLimit) {
    foundPages.push("search: " + searchQuery);
  }

  if (foundPages[0]) {
    if (searchQuery != searchText(foundPages[0])) {
      if (REDIRECT[searchQuery]) {
        if (validPageType(query) == "redirect") {
          if (foundPages.includes(PAGE[searchText(REDIRECT[searchQuery].redirect)].name)) {
            // Nothing happens
          } else {
            //foundPages.push(REDIRECT[searchQuery].redirect);
          }
        } else {
          foundPages.push("newR: " + REDIRECT[searchQuery].redirect);
        }
      } else {
        foundPages.push("new: " + searchQuery);
      }
    }
  } else {
    if (REDIRECT[searchQuery]) {
      if (validPageType(query) == "redirect") {
        if (foundPages.includes(PAGE[searchText(REDIRECT[searchQuery].redirect)].name)) {
          
        } else {
          foundPages.push(REDIRECT[searchQuery].redirect);
        }
      } else {
        foundPages.push("newR: " + REDIRECT[searchQuery].redirect);
      }
    } else {
     foundPages.push("new: " + searchQuery);
    }
  }

  resultsList.classList.add("showResults"); // Shows results before trying to calculate size

  currentSearches = foundPages
  const searchResults = document.createDocumentFragment();
  let startingSearchHeight = resultsList.getBoundingClientRect().bottom
  foundPages.forEach(item => {
    const li = document.createElement("li");
    li.classList.add("searchList")
    const span = document.createElement("span");
    const textDiv = document.createElement("div");
    textDiv.classList.add("searchText");
    if (localStorage.getItem("searchImage") == "true") {
      if (getImage([item], "source").length > 0) {
        var imageClasses = "searchImageBox";
        if (item.includes("(disambiguation)")) { imageClasses += " searchImageDisam"; }
        if (item.includes("Gallery of") || item.includes("gallery of")) { imageClasses += " searchImageGallery"; }
        li.innerHTML = '<div class="' + imageClasses + '"><img class="searchImage" src="' + getImage([item], "source") + '"></div>';
        li.appendChild(textDiv);
        textDiv.appendChild(span);
        span.classList.add("searchTitle");
        span.innerHTML = item.replace("&vl", "|");
      }
    }
    if (!li.firstChild) { // If there are no children, then this hasn't been populated yet with an image
      li.appendChild(textDiv);
      textDiv.appendChild(span);
      span.classList.add("searchTitle");
      span.innerHTML = item.replace("&vl", "|");
    }
    
    li.tabIndex = "10";
    
    li.addEventListener("click", function() {
      change("Same", false, liSearch(span.innerHTML, "Click"))
    });

    li.addEventListener("contextmenu", function(menu) {
      menu.preventDefault()
      change("New", false, liSearch(span.innerHTML, "Click"))
      resultsList.classList.remove("showResults");
      searchBar.value = "";
    });

    // Add see more capability
    var spanName = span.innerHTML
    if (spanName.includes("search: ")) { span.innerHTML = "See More for " + query }
    else if (spanName.includes("new: ")) { span.innerHTML = "Make Page for " + query }
    else if (spanName.includes("newR: ")) { span.innerHTML = "Make Page for " + REDIRECT[searchQuery].redirect }
    else if (PAGE[searchText(spanName)]) {
      if (PAGE[searchText(spanName)].content.includes("<<short")) { // Add short text to pages
        
        var shortText = PAGE[searchText(spanName)].content
        var fileList = shortText.split("<<short")
        shortText = ""
        for (var file in fileList) {
          if (fileList[file].includes("short>>")) {
            var fileFull = fileList[file].split("short>>")
            shortText = wikifyText(fileFull[0])
          } else {
            shortText = ""
          }
        }
        if (shortText != "" && localStorage.getItem("shortText") == "true") {
          textDiv.innerHTML += "<span class='searchShortText'>" + shortText + "</span>"
        }
      }
    } else if (REDIRECT[searchText(spanName)]) { // Short text for redirects
      if (PAGE[searchText(REDIRECT[searchText(spanName)].redirect)].content.includes("<<short")) { // Add short text to pages
        
        shortText = PAGE[searchText(REDIRECT[searchText(spanName)].redirect)].content
        fileList = shortText.split("<<short")
        shortText = ""
        for (file in fileList) {
          if (fileList[file].includes("short>>")) {
            var fileFull = fileList[file].split("short>>")
            shortText = wikifyText(fileFull[0])
          } else {
            shortText = ""
          }
        }
        if (shortText != "" && localStorage.getItem("shortText") == "true") {
          textDiv.innerHTML = wikifyText(textDiv.innerHTML)
          textDiv.innerHTML += "<span class='searchShortText'>" + shortText + "</span>"
        }
      }
    }
    
    // Add italics to search
    li.innerHTML = wikifyText(li.innerHTML)
    span.innerHTML = noTitleItalic(span.innerHTML)

    // Remove entry if it overflows
    resultsList.appendChild(li);
    let resultsListBottom = resultsList.getBoundingClientRect().bottom;

    let windowScalingMargin = 2; // Magic number for scaling
    if (window.innerHeight < 350) {
      windowScalingMargin = 1.6
    } else if (window.innerHeight < 600) {
      windowScalingMargin = 1.8
    }

    startingSearchHeight += resultsListBottom;

    if ((window.innerHeight * windowScalingMargin) < startingSearchHeight && !item.includes("search: ") && !item.includes("new: ") && !item.includes("newR: ")) {
      resultsList.removeChild(li); // Removed overflowed entry
      startingSearchHeight -= resultsListBottom;

      // Second check for seeing pages beyond the query
      if (!foundPages.some(item => item.includes("search: "))) {
        foundPages.push("search: " + searchQuery);
      }
      return;
    }
    
    searchResults.appendChild(li);
  });
  resultsList.appendChild(searchResults);

  if (foundPages.length == 0 || query === "") {
    resultsList.classList.remove("showResults");
  } else {
    resultsList.classList.add("showResults");
  }
}

// Copy the value of the new article
const SPAM_LIMITER = 15 // Time (seconds) per page send if it went through successfully
const ERROR_LIMITER = 5 // Time (seconds) per page send if there is an error
var currentSendLimit = 0 // Time (seconds) remaining for the send limit
async function copyCode(copyType) {
  var titleCopy = document.getElementById("TitleInput").value
  var contentCopy = document.getElementById("ContentInput").value
  var dateCopy = document.getElementById("DateInput").value
  var creatorCopy = document.getElementById("CreatorInput").value
  var editorCopy = document.getElementById("EditorInput").value

  var copyText = '"' + URL_ID + '": {\n    name: "' + titleCopy + '",\n    content: `' + contentCopy + '`,\n    date: "' + dateCopy + '",\n    creator: "' + creatorCopy + '",\n  },'
  
  if (copyType == 'copy') { // Copy to clipboard
    navigator.clipboard.writeText(copyText).then(function() {
    }).catch(function(err) {
      console.error("Error copying text to clipboard: ", err);
    });
  } else if (copyType == 'txt') { // Download a .txt file
    // Create blob for file
    const blob = new Blob([copyText], { type: "text/plain" });
    const link = document.createElement("a");

    // Download the file
    link.href = URL.createObjectURL(blob);
    link.download = URL_ID + " " + todayDay + "/" + todayMonth + "/" + todayYear + ".txt";
    link.click();

    URL.revokeObjectURL(link.href);
  } else if (copyType === 'discord' && currentSendLimit <= 0) { // Send to Discord
    currentSendLimit = 1; // Prevent spam while it gets processed
    document.getElementById("SubmitButton").innerText = "< ... >";
    const blob = new Blob([copyText], { type: "text/plain" });
    const file = new File([blob], `${URL_ID}_${todayDay}-${todayMonth}-${todayYear}.txt`, {
      type: "text/plain"
    });

    const formData = new FormData();
    formData.append("file", file);

    let cloudFlareURL = "https://anotherpedia-backend.alx-shapiro.workers.dev/";
    let requestType = "edit";
    if (!URL_NEW) {
      cloudFlareURL += "?type=create";
      requestType = "creation";
    }

    formData.append("content", `<@&1267964613119443116> A page ${requestType} request for \`${titleCopy || "Untitled"}\` by \`${editorCopy || "Unknown"}\` was made!`);

    // Run reCAPTCHA before sending page to Discord
    const captchaToken = await grecaptcha.execute("6LdiXuMrAAAAABj0URwV2QVAaFxLb8uyfgM5ACWQ", { action: "submit" });
    formData.append("captchaToken", captchaToken);

    try {
      const response = await fetch(cloudFlareURL, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        console.log(".TXT was sent to Discord");

        currentSendLimit = SPAM_LIMITER;
        document.getElementById("makeInfo").innerHTML = wikifyText("Page successfully sent! You are now on cooldown.&p" + BASE_MAKE_INFO)
        limitSendTimer()
      } else {
        console.log(".TXT was NOT sent to Discord");
        currentSendLimit = ERROR_LIMITER;
        document.getElementById("makeInfo").innerHTML = wikifyText("Page failed to sent! Try again shortly.&p" + BASE_MAKE_INFO)
        limitSendTimer()
      }
    } catch (err) {
      console.error(err);
      console.error("There was an error sending the .TXT to Discord");
      currentSendLimit = ERROR_LIMITER;
      document.getElementById("makeInfo").innerHTML = wikifyText("Page failed to sent! Try again shortly.&p" + BASE_MAKE_INFO)
      limitSendTimer()
    }
  }

  pageType = "Copied"
  updatePage()
}

function limitSendTimer() {
  document.getElementById("SubmitButton").innerText = "< " + currentSendLimit + " >";
  let timer = setInterval(function() {
    if (currentSendLimit > 0) {
      currentSendLimit -= 1;
      document.getElementById("SubmitButton").innerText = "< " + currentSendLimit + " >";
    } else {
      clearInterval(timer);
      document.getElementById("makeInfo").innerHTML = wikifyText(BASE_MAKE_INFO);
      document.getElementById("SubmitButton").innerText = "Submit";
    }
  }, 1000);
}

function restoreCode() {
  editHistory = JSON.parse(localStorage.getItem("editHistory"))
  
  if (editHistory[URL_ID]) {
    document.getElementById("TitleInput").value = editHistory[URL_ID].name
    if (editHistory[URL_ID].content.startsWith("It seems this [[page|page (Anotherpedia)]] hasn't been made yet!")) { editHistory[URL_ID].content = "" }
    document.getElementById("ContentInput").value = editHistory[URL_ID].content
    document.getElementById("MovingContentInput").value = editHistory[URL_ID].content
    if (editHistory[URL_ID].date == "unset date") { editHistory[URL_ID].date = "" }
    document.getElementById("DateInput").value = editHistory[URL_ID].date
    if (editHistory[URL_ID].creator == "unknown creator") { editHistory[URL_ID].creator = "" }
    document.getElementById("CreatorInput").value = editHistory[URL_ID].creator
  }
  
  testArticle()
}

function dropCode(dropAreaID) {
  const dropArea = document.getElementById(dropAreaID);
  if (!dropArea) return;

  // Highlight on drag over
  dropArea.addEventListener("dragover", (event_object) => {
    event_object.preventDefault();
    dropArea.classList.add("dragover");
  });

  // Remove highlight when leaving
  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
  });

  // Handle file drop
  var dropTimeout;
  dropArea.addEventListener("drop", (event_object) => {
    event_object.preventDefault();
    dropArea.classList.remove("dragover");

    const file = event_object.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          // Reads the .txt file
          let textFileContents = event.target.result;

          // Fill the form fields
          document.getElementById("TitleInput").value = textFileContents.split('name: "')[1].split('",\n')[0];
          document.getElementById("DateInput").value = textFileContents.split('date: "')[1].split('",\n')[0];
          document.getElementById("CreatorInput").value = textFileContents.split('creator: "')[1].split('",\n')[0];
          document.getElementById("ContentInput").value = textFileContents.split('content: `')[1].split('`,\n')[0];
          document.getElementById("MovingContentInput").value = document.getElementById("ContentInput").value;

          clearTimeout(dropTimeout);
          dropTimeout = setTimeout(function() {
            updatePage();
            regenerateScrollSections();
          }, 250);
        } catch (err) {
          console.error("Failed to parse .txt file: ", err);
        }
      };
      reader.readAsText(file);
    } else {
      console.error("Attempted to read non-.txt file.");
    }
  });
}
dropCode("ContentInput");
dropCode("MovingContentInput");

document.getElementById("TitleInput").addEventListener("input", event => { testArticle(); });
document.getElementById("ContentInput").addEventListener("input", event => { document.getElementById("MovingContentInput").value = document.getElementById("ContentInput").value; testArticle(); });
document.getElementById("MovingContentInput").addEventListener("input", event => { document.getElementById("ContentInput").value = document.getElementById("MovingContentInput").value; testArticle(); });
document.getElementById("DateInput").addEventListener("input", event => { testArticle(); });
document.getElementById("CreatorInput").addEventListener("input", event => { testArticle(); });

var debounceTimeout;
function testArticle(disableSave) {
  pageType = "Editing";
  var titleCopy = document.getElementById("TitleInput").value;
  var contentCopy = document.getElementById("ContentInput").value;
  var dateCopy = document.getElementById("DateInput").value;
  var creatorCopy = document.getElementById("CreatorInput").value;

  if (PAGE[URL_ID] == undefined) {
    PAGE[URL_ID] = {};
  }
  if (titleCopy == "") { titleCopy = URL_ID; }
  if (contentCopy == "") {
    if (URL_ID.includes("(minecraft)")) { contentCopy = "It seems this [[page|page (Anotherpedia)]] hasn't been made yet! Feel free to [[make it|how to make/edit pages]] or check to see if there is a corresponding article on the [[Minecraft Wiki]] (<<link(src=https://minecraft.wiki/w/" + URL_READ.replace(" (minecraft)", "").replace(" (Minecraft)", "") + "(text=minecraft.wiki/w/" + URL_READ.replace(" (minecraft)", "").replace(" (Minecraft)", "") + "(noNewlink>>)."; }
    else { contentCopy = "It seems this [[page|page (Anotherpedia)]] hasn't been made yet! Feel free to [[make it|how to make/edit pages]] or check to see if there is a corresponding article on [[Wikipedia]] (<<link(src=https://en.wikipedia.org/wiki/" + URL_READ + "(text=en.wikipedia.org/wiki/" + URL_READ + "(noNewlink>>)."; }
  }
  if (dateCopy == "") { dateCopy = "unset date"; }
  if (creatorCopy == "") { creatorCopy = "unknown creator"; }
  
  PAGE[URL_ID].name = titleCopy;
  PAGE[URL_ID].content = contentCopy;
  PAGE[URL_ID].date = dateCopy;
  PAGE[URL_ID].creator = creatorCopy;
  
  // Locally save edits
  if (!disableSave) {
    editHistory = JSON.parse(localStorage.getItem("editHistory"));
    if (editHistory == undefined || editHistory == {}) { editHistory = {historyFiller: {name: 'historyFiller', content: 'a', date: 'unset date', creator: 'unknown creator'} }; }
    editHistory[URL_ID] = PAGE[URL_ID];
    localStorage.setItem("editHistory", JSON.stringify(editHistory));
  }
  
  // Debounce updatePage() function
  if (contentCopy.length > 10000) { 
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(function() {
      updatePage();
    }, 250);
  } else { updatePage(); }
}

var scrollTimeout; var tooltip;

function linkUpdate(link, linkName, state) { // function tooltip
  if (localStorage.getItem("tooltip") == "true" || localStorage.getItem("tooltip") == "mobile") {
    var mouseX = event.clientX;
    var mouseY = event.clientY;
    
    if (localStorage.getItem("flipped") == "-1") { // Flips X position in flipped mode
      mouseX = window.innerWidth - mouseX
    }
    
    if (state === "open") {
  
      if (tooltipsOpen[link.id] == "Closed"/* && !mobileTooltip*/) {
        tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");
        tooltip.id = link.id + "tt";
        tooltipsOpen[link.id] = "Link";
        document.getElementById("Body").appendChild(tooltip);
        mobileTooltip = true
  
        const scrollY = window.scrollY || window.pageYOffset;
  
        if (REDIRECT[searchText(linkName)] != undefined) {
          linkName = REDIRECT[searchText(linkName)].redirect;
        }

        var toolText
        var lowerLinkName = searchText(linkName).replace("</td><td>", "|").replace("</li><li>", "|")
        if (lowerLinkName.includes("link|")) {
          linkName = linkName.replace("link|", "");
          if (localStorage.getItem("externalLinkPreview") == "enabled") { toolText = "{{iExternal Link}} <span style=''>🗗</span>&sp<<nostyle" + linkName + "nostyle>>&spThis link is {{bNOT}} moderated by Anotherpedia<<web(src=" + linkName + "(cap=(embedWebweb>>";
          } else { toolText = "{{iExternal Link}} <span style=''>🗗</span>&sp" + linkName + "&spThis link is {{bNOT}} moderated by Anotherpedia"; };
        } else if (lowerLinkName.includes("info|")) {
          linkName = linkName.replace("info|", "");
          toolText = "{{iInfo}}&sp" + linkName;
        } else if (lowerLinkName.includes("note|")) {
          linkName = linkName.replace("note|", "");
          toolText = "{{iNote}}&sp" + linkName;
        } else if (lowerLinkName.includes("ref|")) {
          linkName = linkName.replace("ref|", "");
          toolText = "{{iReference}}&sp" + linkName;
        } else if (lowerLinkName.includes("date: ")) {
          toolText = "{{i" + linkName + "}}&spThis lists all pages made on {{b" + linkName.replace("date: ", "") + "}}";
          } else if (lowerLinkName.includes("author: ")) {
            toolText = "{{i" + linkName + "}}&spThis lists all pages made by {{b" + linkName.replace("author: ", "") + "}}";
        } else if (!validPage(lowerLinkName)) {
          toolText = "{{i" + linkName + "}}&spThis page has not been made yet!";
        } else {
          var cont = PAGE[lowerLinkName].content;
          toolText = "{{i" + PAGE[lowerLinkName].name + "}}&sp" + cont;
        }

        tooltip.innerHTML = wikifyText(toolText);
        
        if (window.innerWidth <= 500) { // Mobile fixing
          tooltip.style.left = 5 + "px"
        } else if (mouseX < 230) { // Prevent overflow left
          tooltip.style.left = 230 - tooltip.clientWidth / 2 + "px";
        } else if (mouseX + tooltip.clientWidth / 2 > window.innerWidth - 30) { // Prevent overflow right
          tooltip.style.left = window.innerWidth - tooltip.clientWidth - 30 + "px";
        } else {
          tooltip.style.left = mouseX - tooltip.clientWidth / 2 + "px";
        }
        
        if (localStorage.getItem("tooltip") == "true") {
          if (window.innerHeight - mouseY < 320) {
            tooltip.style.top = mouseY + scrollY - tooltip.clientHeight - 10 + "px";
          } else {
            tooltip.style.top = mouseY + scrollY + 10 + "px";
          }
        } else { // For new mobile tooltips
          if (window.innerHeight - mouseY < 320) {
            tooltip.style.top = mouseY + scrollY - tooltip.clientHeight - 10 + "px";
          } else {
            tooltip.style.top = mouseY + scrollY + 10 + "px";
          }
          //tooltip.style.position = "fixed";
          //tooltip.style.height = "300px";
          //tooltip.style.maxWidth = "calc(100% - 0px);";
          //tooltip.style.width = "100%";
          //tooltip.style.left = "5px";
          //tooltip.style.top = window.innerHeight - tooltip.clientHeight + "px";
        }
        
        if (localStorage.getItem("tooltipScroll") <= 0 && !isMobile) { tooltip.style.overflow = "hidden"; }

        // Set a timeout to start scrolling after 2.5 seconds
        const scrollSpeed = parseInt(localStorage.getItem("tooltipScroll")); // Scroll speed in pixels per second
        const scrollDelay = parseInt(localStorage.getItem("tooltipScrollSpeed")); // Scroll delay in milliseconds
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function () {
          var scrollDirection = 1
  
          function updateTooltipPosition(timestamp) {
            if (tooltipsOpen[link.id] == "Closing" || tooltipsOpen[link.id] == "Closed" || tooltipsOpen[link.id] == "Scrolling") {
              return; // Stop the animation if the tooltip is closed
            }
  
            tooltip.scrollBy(0, scrollSpeed * scrollDirection);
    
            requestAnimationFrame(updateTooltipPosition);
          }
  
          if (localStorage.getItem("tooltipScroll") > 0 && !isMobile) { requestAnimationFrame(updateTooltipPosition); }
        }, scrollDelay);
      }
    } else if (state === "close") {
      // Check if it was over the tooltip to open a new page
      if (isMobile && (localStorage.getItem("tooltip") == "true" || localStorage.getItem("tooltip") == "mobile")) {
        if (mouseX > parseInt(tooltip.style.left) && mouseX < parseInt(tooltip.style.left) + tooltip.clientWidth && mouseY + window.scrollY > parseInt(tooltip.style.top) && mouseY + window.scrollY < parseInt(tooltip.style.top) + tooltip.clientHeight) {
          if (linkName.includes("link|")) {
            linkName = linkName.replace("link|", "");
            window.open(linkName, "_blank");
          } else if (linkName.includes("note|")) {
            scrollFunction("notesArea" + link.id, "NoteRefSource");
          } else if (linkName.includes("ref|")) {
            // Updates reference links for mobile compatability
            if (isMobile && linkName.includes("<<link")) {
              linkName = linkName.split("(src=")[1].split("(text=")[0];
              window.open(linkName, "_blank");
            } else {
              scrollFunction("refArea" + link.id, "NoteRefSource");
            }
          } else {
            change("Same", false, linkName)
          }
        }
      }
      
      tooltipsOpen[link.id] = "Closing";
      tooltip = document.getElementById(link.id + "tt");
      if (tooltip) {
        tooltip.remove();
        tooltip.scrollBy(0, 0);
      }
      
      tooltipsOpen[link.id] = "Closed";
      

      // Close all other tooltips to prevent bugs
      var tooltipClose = document.getElementsByClassName("tooltip");
      for (var tip in tooltipClose) {
        if (tooltipClose.length !== 0) {
          // Prevent running when empty
          tooltipClose[tip].remove();
        }
      }

      // Clear timeout when closing the tooltip
      clearTimeout(scrollTimeout);
      
      setTimeout(function () { mobileTooltip = false }, 50); // Slight delay before link/image interaction
    }
  }
}

// Enable page editing
function editPage() {
  if (pageType == "Editing" || pageType == "Copied") {
    pageType = "Edited"
    document.getElementById("PageCreator").classList.add("hidden")
    document.getElementById("PageTitle").innerHTML = noTitleItalic(PAGE[URL_ID].name).replace("&vl", "|") + " (Edited)"
    regenerateScrollSections()
  } else {
    pageType = "Editing"
    document.getElementById("PageCreator").classList.remove("hidden")
    document.getElementById("PageTitle").innerHTML = noTitleItalic(PAGE[URL_ID].name).replace("&vl", "|") + " (Editing)"
    document.getElementById("TitleInput").value = PAGE[URL_ID].name
    document.getElementById("DateInput").value = PAGE[URL_ID].date
    document.getElementById("CreatorInput").value = PAGE[URL_ID].creator
    document.getElementById("ContentInput").value = PAGE[URL_ID].content
    document.getElementById("MovingContentInput").value = PAGE[URL_ID].content
    regenerateScrollSections()
  }
}

// Go to a random page
function randomPage(randomType) {
  if (randomType) {
    if (randomType == "Minigame") {
      var RANDPAGE = {}
      for (const pageKey in PAGE) {
        if (PAGE.hasOwnProperty(pageKey)) {
          const page = PAGE[pageKey];
          if (!UNWANTED_TERMS.some(item => pageKey.includes(item))) {
            RANDPAGE[pageKey] = PAGE[pageKey]
          }
        }
      }
      var pageNames = Object.keys(RANDPAGE);
    }
  } else {
    var pageNames = Object.keys(PAGE);
  }
  
  var randomIndex = Math.floor(Math.random() * pageNames.length);
  var randomPageName = pageNames[randomIndex];
  return randomPageName
}

// Get a random user
function randomUser() {
  if (Object.keys(users).length <= 0) { // Checks if users have been populated (only runs as needed)
    getUsers(); // Populates the users object
  }
  let userArray = Object.keys(users);
  return userArray[userArray.length * Math.random()];
}

// Detect when the user changes a page
window.addEventListener('popstate', function(event) {
  if (URL_ID != urlId()) {
    window.location.reload();
  }
});

// Prevent leaving before copy (currently disabled)
/*window.addEventListener('beforeunload', (event) => {
  if (pageType != "Page" && pageType != "Copied" && pageType != "New") {
    pageType = "Page"
    event.returnValue = "bye"
  }
});*/

// Open up and close images
function expandImage(source) {
  if (mobileTooltip == false || !isMobile) {
    document.getElementById("ExpandedImage").src = source;
    document.getElementById("ImageExpander").classList.remove("hidden");
  }
}

function unexpandImage(source) {
  document.getElementById("ImageExpander").classList.add("hidden");
}

function popup(source, color, ent) {
  var randomNumber = Math.floor(Math.random() * 1000) + 1
  var colorTag = ""
  if (color.includes("brightImage")) { colorTag = "#bright" }
  else if (color.includes("darkImage")) { colorTag = "#dark" }
  window.open('https://warmwooly.github.io/Anotherpedia/popup.html#' + source + colorTag, '_blank', 'width=400,height=400,top=' + (ent.clientY + 200) + ',left=' + (ent.clientX - 200))
}

// Add page creation info
document.getElementById("makeInfo").innerHTML = wikifyText(BASE_MAKE_INFO)

// Run games
var currentresponse, responses, currentmad, miniText, random1, random2
function playGame(game) {
  if (game == "Random Situations") {
    var ssgame = document.getElementById("StupidGame")
    if (gameState == "Start") {
      gameState = "Running";
    } else if (gameState == "Running") {
      document.querySelectorAll('.deleteImage').forEach(element => element.remove());
      random1 = lastOption; random2 = lastOption;
      while (random1 == lastOption) { random1 = randomPage("Minigame") }
      while (random2 == lastOption || random2 == random1) { random2 = randomPage("Minigame") }
      var situation = SITUATIONS[Math.floor(Math.random()*SITUATIONS.length)].replace("//LastOption//", "[[" + PAGE[lastOption].name + "|" + lastOption + "]]")
      if (isMobile) {
         ssgame.innerHTML = wikifyText("<br>" + situation + "<br>[[" + PAGE[random1].name + "|" + random1 + "]] or [[" + PAGE[random2].name + "|" + random2 + "]]<br><br><button onclick='lastOption = random1; playGame(`Random Situations`)'>" + PAGE[random1].name + "</button><br><button onclick='lastOption = random2; playGame(`Random Situations`)'>" + PAGE[random2].name + "</button><br><button onclick='playGame(`Random Situations`)'>New Question</button>&sp" + getImage([PAGE[random1].name], "top") + getImage([PAGE[random2].name], "top"))
      } else {
        ssgame.innerHTML = wikifyText(getImage([PAGE[random1].name], "top") + getImage([PAGE[random2].name], "top") + "<br>" + situation + "<br>[[" + PAGE[random1].name + "|" + random1 + "]] or [[" + PAGE[random2].name + "|" + random2 + "]]<br><br><button onclick='lastOption = random1; playGame(`Random Situations`)'>" + PAGE[random1].name + "</button><br><button onclick='lastOption = random2; playGame(`Random Situations`)'>" + PAGE[random2].name + "</button><br><button onclick='playGame(`Random Situations`)'>New Question</button>")
      }
    }
  } else if (game == "Hate or Date") {
    var hodgame = document.getElementById("HateGame")
    if (gameState == "Start") {
      gameState = "Running";
      pagesToDate = shuffleArray(pagesToDate)
    } else if (gameState == "Running") {
      if (left > 0) {
        document.querySelectorAll('.deleteImage').forEach(element => element.remove());
        if (dateAction != "undo") {
          if (randomDate != "") { pagesDated[pagesDated.length] = [randomDate, dateAction] }
          randomDate = pagesToDate[pagesToDate.length - 1];
        }
        
        pagesToDate.splice(pagesToDate.indexOf(randomDate), 1)

        if (isMobile) {
          hodgame.innerHTML = wikifyText("<br><<table{{bLeft}}|{{bHated}}|{{bDated}}|{{bTotal}}||{{c" + left + "}}|{{c" + hated + "}}|{{c" + dated + "}}|{{c" + (hated + dated) + "}}table>><br>Would you go on a date with " + randomDate[0].replace("(brightImg", "") + "?<br><button onclick='hate()'>Hate</button>&tab<button onclick='date()'>Date</button><br><button onclick='undo()'>Undo</button>&tab<button onclick='left = 0; playGame(`Hate or Date`)'>End Game</button><<img(src=" + randomDate[1] + "(cap={{b{{i" + randomDate[0] + "}}}}img>>")
        } else {
          hodgame.innerHTML = wikifyText("<<img(src=" + randomDate[1] + "(cap={{b{{i" + randomDate[0] + "}}}}img>><br><<table{{bLeft}}|{{bHated}}|{{bDated}}|{{bTotal}}||{{c" + left + "}}|{{c" + hated + "}}|{{c" + dated + "}}|{{c" + (hated + dated) + "}}table>><br>Would you go on a date with " + randomDate[0].replace("(brightImg", "") + "?<br><button onclick='hate()'>Hate</button>&tab<button onclick='date()'>Date</button><br><button onclick='undo()'>Undo</button>&tab<button onclick='left = 0; playGame(`Hate or Date`)'>End Game</button>")
        }
      } else {
        var hodText = "Hated: " + hated + "&tabDated: " + dated + "&tabTotal: " + (hated + dated) + "&spHere are your results. Good job? (Reload to play again.)<<hrDateshr>>"
        if (pagesToDate <= 0) { awardAchievement("Pick and Choose") }
        var dateList2 = []; var imageDateList = []; var dateStats = {total: 0, guy: 0, gal: 0, animal: 0, pokemon: 0, planet: 0, scp: 0, object: 0};
        if (dateList.length == 0) {
          hodText += "No Dates..."
        } else {
          hodText += "{{gal"
          dateList = dateList.sort();
          for (var date in dateList) {
            hodText += "<<img(src=" + dateList[date][1] + "(cap={{b{{i" + dateList[date][0] + "}}}}(galleryImg(smallImgimg>>"
            dateStats[dateList[date][2]] += 1;
            dateStats.total += 1;
          }
          
          
          hodText += "}}"
        }

        hodText += "<<hrHateshr>>"
        var hateList2 = []; var imageHateList = [];
        if (hateList.length == 0) {
          hodText += "No Hates..."
        } else {
          hodText += "{{gal"
          hateList = hateList.sort();
          for (var hate in hateList) { hodText += "<<img(src=" + hateList[hate][1] + "(cap={{b{{i" + hateList[hate][0] + "}}}}(galleryImg(smallImgimg>>" }
          hodText += "}}"
        }
        
        if (dateList.length != 0) {
          hodText += "<<hrStatshr>>"
          if (dateStats.guy) { hodText += "Guys: " + dateStats.guy + "&sp" };
          if (dateStats.gal) { hodText += "Gals: " + dateStats.gal + "&sp" };
          if (dateStats.animal) { hodText += "Animals: " + dateStats.animal + "&sp" };
          if (dateStats.pokemon) { hodText += "Pokémon: " + dateStats.pokemon + "&sp" };
          if (dateStats.pokemon) { hodText += "SCPs: " + dateStats.scp + "&sp" };
          if (dateStats.object) { hodText += "Objects: " + dateStats.object + "&sp" };
          if (dateStats.planet) { hodText += "Planets: " + dateStats.planet + "&sp" };
        }
        
        hodgame.innerHTML = wikifyText(hodText)
      }
    }
  } else if (game == "Mad Pages") {
    var madgame = document.getElementById("MadGame")
    if (gameState == "Start") {
      gameState = "Responding";
      if (madstory == 0) {
        madstory = Math.floor(Math.random()*MADPAGE.length) + 1
      }
      currentmad = MADPAGE[madstory - 1]
      madstory = 0
      currentresponse = 0
      responses = []
    } else if (gameState == "Responding") {
      if (currentresponse >= currentmad.fills.length) {
        var madPromptResult = madify(currentmad.prompt)
        
        madgame.innerHTML = wikifyText("<br>" + madPromptResult + `<br><br><button onclick='playGame("Mad Pages"); playGame("Mad Pages");'>Replay</button>`)
        gameState = "Start"
      } else {
        document.querySelectorAll('.deleteImage').forEach(element => element.remove());
        miniText = "Minigame"
        madgame.innerHTML = wikifyText(`<br>Story #` + currentmad.num + `<br>(` + (currentresponse + 1) + `/` + currentmad.fills.length + `) Input ` + anCheck(currentmad.fills[currentresponse]) + ` ` + madify(currentmad.fills[currentresponse]) + `:<br><input type="text" autocomplete="off" id="madresponse" placeholder="Response Here" oninput="if (validPage(this.value)) { this.style.color = <<nostyle'var(--linkBlue)' } else { this.style.color = 'var(--white)'nostyle>> };" onkeydown="if (event.keyCode === 13) { checkMad(); };"><br><button onclick='madValue(randomPage(miniText))'>Random Page</button>&tab<button onclick='checkMad()'>Submit Page</button>&tab<input type="number" autocomplete="off" id="madstory" placeholder="#" class="smallInput" oninput="if (this.value < 0) { this.value = 0 } else if (this.value > MADPAGE.length) { this.value = MADPAGE.length }; madstory = this.value;">&tab<button onclick='gameState = "Start"; playGame("Mad Pages"); playGame("Mad Pages")'>New Story</button>`)
        
        // Automatically focus on the text box
        document.getElementById("madresponse").focus()
        document.getElementById("madresponse").select()
      }
    }
  } else if (game == "Page Guesser") {
    var guessgame = document.getElementById("GuesserGame")
    if (gameState == "Start") {
      pagesToGuess = shuffleArray(pagesToGuess)
      left = pagesToGuess.length
      gameState = "Answering";
    } else if (gameState == "Answering") {
      var guessTable = "<<table{{bLeft}}|{{bCorrect}}|{{bIncorrect}}|{{bTotal}}||{{c" + left + "}}|{{c" + correctGuesses + "}}|{{c" + incorrectGuesses + "}}|{{c" + (correctGuesses + incorrectGuesses) + "}}table>>"
      
      if (lastGuessState == "Correct") {
        guessText = `Your last answer of [[` + lastGuess + `]] was {{bcorrect}}!<br>`
      } else if (lastGuessState == "Incorrect") {
        guessText = `Your last answer of [[` + lastGuess + `]] was {{bincorrect}}! The correct answer was [[` + pagesToGuess[left][0] + `]].<br>`
      }
      
      if (left > 0) {
        document.querySelectorAll('.deleteImage').forEach(element => element.remove());
        if (pageMode == "normal") {
          guessgame.innerHTML = wikifyText(guessTable + guessText + `<<quo` + pagesToGuess[left - 1][1] + `quo>><input type="text" autocomplete="off" id="guessanswer" placeholder="Answer Here" oninput="if (validPage(this.value)) { this.style.color = <<nostyle'var(--linkBlue)' } else { this.style.color = 'var(--white)'nostyle>> };" onkeydown="if (event.keyCode === 13) { checkGuess(); };"><br><button onclick='checkGuess()'>Submit Page</button>`)
        } else if (pageMode == "image") {
          guessgame.innerHTML = wikifyText(guessTable + guessText + `<<img(src=` + pagesToGuess[left - 1][1] + `(cap=Guess me!` + pagesToGuess[left - 1][2] + `(leftImgimg>><input type="text" autocomplete="off" id="guessanswer" placeholder="Answer Here" oninput="if (validPage(this.value)) { this.style.color = <<nostyle'var(--linkBlue)' } else { this.style.color = 'var(--white)'nostyle>> };" onkeydown="if (event.keyCode === 13) { checkGuess(); };"><br><button onclick='checkGuess()'>Submit Page</button>`)
        }
        
        // Automatically focus on the text box
        document.getElementById("guessanswer").focus()
        document.getElementById("guessanswer").select()
      } else {
        guessgame.innerHTML = wikifyText(guessText + `&sp{{bCorrect:}} ` + correctGuesses + `&sp{{bIncorrect:}} ` + incorrectGuesses + `&sp{{bTotal:}} ` + (correctGuesses + incorrectGuesses) + `&p(Reload to play again.)`)
      }
    }
  } else if (game == "Page Guesser Image") {
    pagesToGuess = shuffleArray(pagesToGuessImg)
    left = pagesToGuess.length
    pageMode = "image"
    playGame("Page Guesser")
  } else if (game == "Pageman") {
    var pagemangame = document.getElementById("PagemanGame")
    if (gameState == "Start") {
      var findingPage = true
      while (findingPage) {
        pageToGuess = randomPage()
        for (var pageGuessLetter in pageToGuess) { if (letters.includes(pageToGuess[pageGuessLetter])) { findingPage = false; break; } }
        if (pageToGuess.length < 3) { findingPage = true };
      }
      health = 7
      allGuesses = []
      gameState = "Running"
    } else if (gameState == "Running") {
      document.querySelectorAll('.deleteImage').forEach(element => element.remove());
      var body = ["\\","/","|","\\","/","|","O",""]
      for (var bodyPart in body) { if (bodyPart < health + 1) { body[bodyPart - 1] = "&nbsp" }; };
      var hangMan = `&spTotal wins: ${localStorage.getItem("pagemanWins")}&p&nbsp&nbsp&nbsp&nbsp---------+&sp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp${body[6]}&sp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp${body[4]}${body[5]}${body[3]}&sp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp${body[2]}&sp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp${body[1]}&nbsp${body[0]}&sp&nbsp&nbsp&nbsp&nbsp|&sp&nbsp&nbsp-----------------`
      var showGuess = ""
      for (var everyHide in pageToGuess) {
        if (letters.includes(pageToGuess[everyHide]) && !allGuesses.includes(pageToGuess[everyHide])) { showGuess += "_ "}
        else if (pageToGuess[everyHide] == " ") { showGuess += "&tab" }
        else { showGuess += pageToGuess[everyHide] }
      }
      var showLettersGuessed = ""
      for (var everyGuess in allGuesses) { showLettersGuessed += allGuesses[everyGuess] + " " }
      
      pagemangame.innerHTML = wikifyText(`${hangMan}&p&tab${showGuess}&pLetters used: ${showLettersGuessed}&p<input type="text" autocomplete="off" id="letterGuessed" placeholder="Answer Here" oninput="if (letters.includes((this.value).toLowerCase()) && !allGuesses.includes((this.value).toLowerCase())) { this.style.color = <<nostyle'var(--green)' } else { this.style.color = 'var(--red)'nostyle>> };" onkeydown="if (event.keyCode === 13) { checkLetter(); };"><br><button onclick='checkLetter()'>Submit Guess</button>&tab<button onclick='document.getElementById("letterGuessed").value = "giveUp"; checkLetter()'>Give Up</button>`)
      // Automatically focus on the text box
      document.getElementById("letterGuessed").focus()
      document.getElementById("letterGuessed").select()
    } else if (gameState == "Lose") {
      var hangMan = `&p&nbsp&nbsp&nbsp&nbsp---------+&sp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspO&sp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp/|\\&sp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp|&sp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp/&nbsp\\&sp&nbsp&nbsp&nbsp&nbsp|&sp&nbsp&nbsp-----------------`
      pagemangame.innerHTML = wikifyText(`<<disam${PAGE[pageToGuess].name}disam>>${hangMan}&p{{bGAME OVER!}}&pThe answer was [[${pageToGuess}]].&p<button onclick='playGame("Pageman")'>Play Again</button>`)
      gameState = "Start"
      playGame("Pageman")
    } else if (gameState == "Win") {
      localStorage.setItem("pagemanWins", parseInt(localStorage.getItem("pagemanWins")) + 1)
      if (parseInt(localStorage.getItem("pagemanWins")) >= 15) { awardAchievement("Pageman Guardian") }
      else if (parseInt(localStorage.getItem("pagemanWins")) >= 5) { awardAchievement("Pageman Protector") }
      else if (parseInt(localStorage.getItem("pagemanWins")) >= 1) { awardAchievement("Pageman Saver") }
      pagemangame.innerHTML = wikifyText(`<<disam${PAGE[pageToGuess].name}disam>>&sp{{bYOU WON!}}&pYou correctly guessed [[${pageToGuess}]]!&p<button onclick='playGame("Pageman")'>Play Again</button>`)
      gameState = "Start"
      playGame("Pageman")
    }
  } else if (game == "Larger Smaller") {
    var largersmallergame = document.getElementById("LargerSmallerGame")
    if (gameState == "Start") {
      streak = 0;
      oldPage = randomPage();
      newPage = oldPage;
      while (oldPage == newPage) { newPage = randomPage() };
      oldPageSize = PAGE[oldPage].content.length;
      newPageSize = PAGE[newPage].content.length;
      updatePhrase = "";
      gameState = "Running"
    } else if (gameState == "Running") {
      document.querySelectorAll('.deleteImage').forEach(element => element.remove());
      
      largersmallergame.innerHTML = wikifyText(`&sp{{bStreak:}} ${streak}${updatePhrase}&pIs {{b${PAGE[newPage].name}}} larger or smaller than [[${PAGE[oldPage].name}]]?&sp<button onclick='checkLargerSmaller("Larger")'>Larger</button>&tab<button onclick='checkLargerSmaller("Smaller")'>Smaller</button>`)
    } else if (gameState == "Lose") {
      // Check the longest streak and award achievements
      if (parseInt(localStorage.getItem("largerSmallerStreak")) < streak) {
      localStorage.setItem("largerSmallerStreak", streak); }
      if (parseInt(localStorage.getItem("largerSmallerStreak")) >= 3) { awardAchievement("Page Size Guesser") }
      if (parseInt(localStorage.getItem("largerSmallerStreak")) >= 8) { awardAchievement("Page Size Ponderer") }
      if (parseInt(localStorage.getItem("largerSmallerStreak")) >= 12) { awardAchievement("Page Size Predictor") }
      
      // Update the lose streak and award advancements
      var loseStreak = ""
      if (streak == 0) { localStorage.setItem("largerSmallerLoseStreak", parseInt(localStorage.getItem("largerSmallerLoseStreak")) + 1); }
      else { localStorage.setItem("largerSmallerLoseStreak", 0); }
      if (parseInt(localStorage.getItem("largerSmallerLoseStreak")) > 0) { loseStreak = "&sp{{bInstant Loss Streak:}} " + localStorage.getItem("largerSmallerLoseStreak") }
      if (parseInt(localStorage.getItem("largerSmallerLoseStreak")) >= 5) { awardAchievement("So Bad It's Good") }
      
      // Print to screen and reset
      largersmallergame.innerHTML = wikifyText(`&sp{{bStreak:}} ${streak}&sp{{bLongest Streak:}} ${parseInt(localStorage.getItem("largerSmallerStreak"))}${loseStreak}${updatePhrase}&p{{bGAME OVER!}}&p<button onclick='playGame("Larger Smaller")'>Play Again</button>`)
      gameState = "Start"
      playGame("Larger Smaller")
    }
  }
}

// For Hate or Date minigame
function hate() { hated += 1; left -= 1; dateAction = `hated`; hateList[hateList.length] = randomDate; playGame(`Hate or Date`) }
function date() { dated += 1; left -= 1; dateAction = `dated`; dateList[dateList.length] = randomDate; playGame(`Hate or Date`) }
function undo() {
  if (pagesDated.length != 0) {
    left += 1;
    if (pagesDated[pagesDated.length - 1][1] == "hated") { hated -= 1; ; hateList.splice(hateList.indexOf(pagesDated[pagesDated.length - 1]), 1) }
    else { dated -= 1; dateList.splice(dateList.indexOf(pagesDated[pagesDated.length - 1]), 1) };
    pagesToDate[pagesToDate.length] = randomDate
    pagesToDate[pagesToDate.length] = pagesDated[pagesDated.length - 1][0]
    dateAction = `undo`
    randomDate = pagesDated[pagesDated.length - 1][0]
    pagesDated.splice(pagesDated.indexOf(pagesDated[pagesDated.length - 1]), 1)
    playGame(`Hate or Date`)
  }
}

function shuffleArray(array) { // Thanks ChatGPT
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// For Mad Pages minigame
function madValue(val) {
  document.getElementById("madresponse").style.color = "lime"
  document.getElementById("madresponse").value = PAGE[searchText(val)].name
}

function checkMad() {
  if (document.getElementById("madresponse").value != "") {
    currentresponse += 1;
    responses[responses.length] = document.getElementById("madresponse").value
    playGame("Mad Pages");
  }
}

function madify(madText) {

  var generateList = madText.split("{{{")
  madText = ""
  for (var generateLocation in generateList) {
    if (generateList[generateLocation].includes("}}}")) {
      var generateFull = generateList[generateLocation].split("}}}")


      if (validPage(responses[parseInt(generateFull[0]) - 1])) {
        madText += "[[" + responses[parseInt(generateFull[0]) - 1] + "]]" + generateFull[1]
      } else {
        madText += "{{b" + responses[parseInt(generateFull[0]) - 1] + "}}" + generateFull[1]
      }
    } else {
      madText += generateList[generateLocation]
    }
  }
  
  return madText
}

function checkGuess() {
  if (document.getElementById("guessanswer").value != ""/* && validPage(document.getElementById("guessanswer").value)*/) {
    lastGuess = document.getElementById("guessanswer").value
    while (lastGuess[lastGuess.length - 1] == " ") { lastGuess = lastGuess.slice(0, -1); };
    if (pagesToGuess[left - 1][pagesToGuess[left - 1].length - 1].includes(searchText(convertCheck(lastGuess))) && Array.isArray(pagesToGuess[left - 1][pagesToGuess[left - 1].length - 1])) { lastGuess = pagesToGuess[left - 1][0] }
    if (searchText(convertCheck(lastGuess)) == searchText(pagesToGuess[left - 1][0])) { correctGuesses += 1; lastGuessState = "Correct";
    } else { incorrectGuesses += 1; lastGuessState = "Incorrect"; }
    left -= 1;
    playGame("Page Guesser");
  }
}

function checkLetter() {
  if (document.getElementById("letterGuessed").value != "" && letters.includes((document.getElementById("letterGuessed").value).toLowerCase()) && !allGuesses.includes((document.getElementById("letterGuessed").value).toLowerCase())) {
    var guessedLetter = (document.getElementById("letterGuessed").value).toLowerCase()
    allGuesses[allGuesses.length] = guessedLetter
    if (!pageToGuess.includes(guessedLetter)) { health -= 1; }
    document.getElementById("letterGuessed").value = ""
    if (health <= 0) { gameState = "Lose" }
    var won = true
    for (var everyHide in pageToGuess) { if (letters.includes(pageToGuess[everyHide]) && !allGuesses.includes(pageToGuess[everyHide])) { won = false } }
    if (won) { gameState = "Win" }
    playGame("Pageman")
  } else if (document.getElementById("letterGuessed").value == "giveUp") { // Starts a new game
    console.log(document.getElementById("letterGuessed").value);
    gameState = "Lose";
    playGame("Pageman");
  } else {
    document.getElementById("letterGuessed").value = ""
  }
}

function checkLargerSmaller(lsguess) {
  if (oldPageSize == newPageSize) {
    updatePhrase = `&p[[${PAGE[newPage].name}]] and [[${PAGE[oldPage].name}]] are the {{isame size}} (${newPageSize})! {{bFreebie!!!}}`
    streak += 1
  } else if (oldPageSize > newPageSize && lsguess == "Smaller") {
    updatePhrase = `&p{{bCorrect!}} [[${PAGE[newPage].name}]] (${newPageSize}) is {{ismaller}} than [[${PAGE[oldPage].name}]] (${oldPageSize})!`
    streak += 1
  } else if (oldPageSize > newPageSize && lsguess == "Larger") {
    updatePhrase = `<<disam${PAGE[newPage].name}disam>>&p{{bIncorrect!}} [[${PAGE[newPage].name}]] (${newPageSize}) is {{ismaller}} than [[${PAGE[oldPage].name}]] (${oldPageSize})!`
    gameState = "Lose"
  } else if (oldPageSize < newPageSize && lsguess == "Smaller") {
    updatePhrase = `<<disam${PAGE[newPage].name}disam>>&p{{bIncorrect!}} [[${PAGE[newPage].name}]] (${newPageSize}) is {{ilarger}} than [[${PAGE[oldPage].name}]] (${oldPageSize})!`
    gameState = "Lose"
  } else if (oldPageSize < newPageSize && lsguess == "Larger") {
    updatePhrase = `&p{{bCorrect!}} [[${PAGE[newPage].name}]] (${newPageSize}) is {{ilarger}} than [[${PAGE[oldPage].name}]] (${oldPageSize})!`
    streak += 1
  }
  
  oldPage = newPage;
  newPage = oldPage;
  while (oldPage == newPage) { newPage = randomPage() };
  oldPageSize = PAGE[oldPage].content.length;
  newPageSize = PAGE[newPage].content.length;
  playGame("Larger Smaller");
}

function anCheck(anTerm) {
  if (anTerm.charAt(0) == "a" || anTerm.charAt(0) == "e" || anTerm.charAt(0) == "i" || anTerm.charAt(0) == "o" || anTerm.charAt(0) == "u" || anTerm.charAt(0) == "A" || anTerm.charAt(0) == "E" || anTerm.charAt(0) == "I" || anTerm.charAt(0) == "O" || anTerm.charAt(0) == "U" || anTerm.charAt(0) == "8") {
    return "an"
  } else {
    return "a"
  }
}

// If settings, set sliders
if (URL_ID == "settings") {
  function updateSettings() {
    var selectedButtons = document.querySelectorAll(".selectedButton")
    selectedButtons.forEach(function(foundButton) { foundButton.classList.remove("selectedButton") })
    var buttonSelections = [["theme", localStorage.getItem('theme')], ["font", localStorage.getItem('font')], ["authorColors", localStorage.getItem('authorColor')], ["toggleImage", localStorage.getItem('toggleImage')], ["pdf", localStorage.getItem('pdf')], ["graph", localStorage.getItem('graph')], ["youtube", localStorage.getItem('youtube')], ["audio", localStorage.getItem('audio')], ["website", localStorage.getItem('website')], ["externalLink", localStorage.getItem('externalLink')], ["externalLinkPreview", localStorage.getItem('externalLinkPreview')], ["tooltip", localStorage.getItem('tooltip')], ["shortText", localStorage.getItem('shortText')], ["searchImage", localStorage.getItem('searchImage')], ["searchShort", localStorage.getItem('searchShort')], ["searchPage", localStorage.getItem('searchPage')], ["noteArea", localStorage.getItem('noteArea')], ["refArea", localStorage.getItem('refArea')], ["safeMode", localStorage.getItem('safeMode')], ["advanced", localStorage.getItem('advanced')], ["links", localStorage.getItem('links')], ["askew", localStorage.getItem('askew')], ["chase", localStorage.getItem('chase')]]
    for (var buttonIndex in buttonSelections) { if (document.getElementById(buttonSelections[buttonIndex][0] + buttonSelections[buttonIndex][1])) { document.getElementById(buttonSelections[buttonIndex][0] + buttonSelections[buttonIndex][1]).classList.add("selectedButton") }; };
    
    var inputValues = [["sizeSlider", localStorage.getItem('size')], ["dimSlider", localStorage.getItem('dim')], ["scrollSlider", localStorage.getItem('tooltipScroll')], ["scrollSpeedSlider", localStorage.getItem('tooltipScrollSpeed') / 100], ["homepage", localStorage.getItem('homepage')], ["searchSlider", localStorage.getItem('searchSize')], ["sidebarSizeSlider", localStorage.getItem('sidebarSize')],]
    for (var inputIndex in inputValues) { if (document.getElementById(inputValues[inputIndex][0])) { document.getElementById(inputValues[inputIndex][0]).value = inputValues[inputIndex][1] }; };
  }

  if (isMobile == true) {
    document.getElementById("autoScroll").classList.add("hidden");
    document.getElementById("chaseSpan").classList.add("hidden");
  }

  propertyUpdate()
  regenerateScrollSections()
}

// Generate a random neon color
function neonColor() {
  var colors = [
    {r: 255, g: 255, b: 0},
    {r: 255, g: 0, b: 255},
    {r: 0, g: 255, b: 255},
    {r: 255, g: 0, b: 0},
    {r: 0, g: 0, b: 255},
    {r: 0, g: 255, b: 0},
    {r: 255, g: 102, b: 0},
    {r: 110, g: 13, b: 208},
  ]
  var rgb = colors[Math.floor(Math.random() * colors.length)]
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

// Much wow
function createMuchWow(allElements, element) {
  var numElements
  if (allElements.length <= 10) { numElements = 10
  } else if (allElements.length <= 20) { numElements = 7
  } else if (allElements.length <= 35) { numElements = 6
  } else if (allElements.length <= 75) { numElements = 4
  } else if (allElements.length <= 500) { numElements = 3
  } else { numElements = 1 }
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < numElements; i++) {
    if (element.id != "HomeSmall") {
      const clone = element.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = `${Math.random() * 95}%`;
      clone.style.top = `${Math.random() * 95}%`;
      clone.style.fontFamily = `'Comic Sans MS', 'Comic Sans', 'Comic Neue', cursive`;
      clone.style.color = neonColor();
      clone.classList.add("muchWow")
      clone.classList.remove("invalid")
      fragment.appendChild(clone);
    }
  }

  document.body.appendChild(fragment);
}

function muchWow() {
  var allLinks = document.querySelectorAll('a');
  allLinks.forEach((element) => {
    // Prevent home or learn links
    if (element.id != "Home" && element.innerHTML != "Learn" && element.id != "HomeSmall") {
      createMuchWow(allLinks, element);
    }
  });
}

if (localStorage.getItem("links") == "true") { muchWow() }

function killWow() { // Deletes all the much wow
  var allLinks = document.querySelectorAll('a');
  allLinks.forEach((element) => {
    // Delete much wow (much buzzkill)
    if (element.classList.contains("muchWow")) {
      element.remove()
    }
  });
}


// Make the page askew
function makeAskew(deg) {
  var allElements = document.querySelectorAll('a, img, button, input, ul, p, h1, h2, h3, h4, h5, h6, span, hr');
  if (allElements.length > 250 && deg != 0) {
    document.getElementById("Content").innerHTML = wikifyText("{{redThis page is too large to be set askew!}}&sp") + document.getElementById("Content").innerHTML
  } else {
    allElements.forEach((element) => {
      var rotX = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * deg)
      element.style.transform = "rotate(" + rotX + "deg)"
    });
  }
}

if (localStorage.getItem("askew") == "true") { makeAskew(3) }

function makeChase() {
  var allLinks = document.querySelectorAll('a');
  if (allLinks.length > 100) {
    document.getElementById("Content").innerHTML = wikifyText("{{redThis page has too many links to be chased!}}&sp") + document.getElementById("Content").innerHTML
  } else {
    allLinks.forEach((element) => {
      // Prevent home or learn links
      if (element.id != "Home" && element.innerHTML != "Learn" && element.id != "HomeSmall") {
        // Create floating links
        var elementClone = element.cloneNode(true);
        elementClone.style.top = element.getBoundingClientRect().top + "px";
        elementClone.style.left = element.getBoundingClientRect().left + "px";
        elementClone.style.position = "absolute";
        elementClone.style.display = "block";
        elementClone.value = (Math.random() * 10 + 1)
        elementClone.classList.add("chasing")
        document.getElementById("Body").appendChild(elementClone);

        // Make old links into spans
        if (!element.classList.contains("muchWow") && !element.classList.contains("chasing")) {
          var spanElement = document.createElement('span');
          spanElement.classList.add("boldText")
          spanElement.innerHTML = element.innerHTML
          element.parentNode.replaceChild(spanElement, element);
        } else {
          element.remove();
        }
      }
    });

    allLinks = document.querySelectorAll('a');
    
    document.addEventListener("mousemove", (event) => {
      if (localStorage.getItem("chase") == "true") {
        var mouseX = event.clientX; // X coordinate of the mouse pointer
        var mouseY = event.clientY + window.scrollY; // Y coordinate of the mouse pointer
        
        if (localStorage.getItem("flipped") == "-1") { // Flips X position in flipped mode
          mouseX = window.innerWidth - mouseX
        }
  
        // Now you can use mouseX and mouseY in your code
        allLinks.forEach((element) => {
          // Prevent home or learn links
          if (element.id != "Home" && element.innerHTML != "Learn" && element.id != "HomeSmall") {
            if (mouseX > parseInt(element.style.left)) {
              element.style.left = (parseInt(element.style.left) + element.value) + "px"
            } else if (mouseX < parseInt(element.style.left) + element.clientWidth) {
              element.style.left = (parseInt(element.style.left) - element.value) + "px"
            }
  
            if (mouseY > parseInt(element.style.top)) {
              element.style.top = (parseInt(element.style.top) + element.value) + "px"
            } else if (mouseY < parseInt(element.style.top) + element.clientHeight) {
              element.style.top = (parseInt(element.style.top) - element.value) + "px"
            }
          }
        });
      }
    });
  }
}

if (localStorage.getItem("chase") == "true") { makeChase() }

// Get images from links
function getImage(links, getType) {
  var images = {}
  
  for (var link in links) {
    var searchLink = searchText(links[link])
    
    if (searchLink == "pageoftheday") {
      searchLink = pageoftheday
      links[link] = PAGE[pageoftheday].name
    }
    
    var redirectable = false
    if (REDIRECT[searchLink]) { if (validPageType(searchLink) == "redirect") { redirectable = true }}
  
    function imageFind(pageContent) {
      var returnList = []
      var imageList = pageContent.split("<<img")
      for (var imageLocation in imageList) {
        if (imageList[imageLocation].includes("img>>")) {
          var imageFull = imageList[imageLocation].split("img>>")

          imageFull[0] = imageFull[0].replace("(leftImg", "")
          imageFull[0] = imageFull[0].replace("(galleryImg", "")
          imageFull[0] = imageFull[0].replace("(spanImg", "(bigImg")
          
          // Remove notes
          var fileList = imageFull[0].split("<<note")
          imageFull[0] = ""
          for (var file in fileList) {
            if (fileList[file]) {
              if (fileList[file].includes("note>>")) { var finalFile = ""; imageFull[0] += finalFile;
              } else { imageFull[0] += fileList[file]; }
            }
          }
          
          // Remove references
          var fileList = imageFull[0].split("<<ref")
          imageFull[0] = ""
          for (var file in fileList) {
            if (fileList[file]) {
              if (fileList[file].includes("ref>>")) { var finalFile = ""; imageFull[0] += finalFile;
              } else { imageFull[0] += fileList[file]; }
            }
          }
  
          returnList[returnList.length] = "<<img" + imageFull[0] + "&sp{{i{{b[[" + links[link] + "]]}}}}img>>"
        }
      }

      imageList = pageContent.split("<<disam")
      for (imageLocation in imageList) {
        if (imageList[imageLocation].includes("disam>>")) {
          var imageFull = imageList[imageLocation].split("disam>>")
          var finalImage = imageFull[0].split("|")
          returnList[returnList.length] = getImage(finalImage)
        }
      }
  
      if (returnList.length > 0) { return returnList } else { return false }
    }
    
    if (validPageType(searchLink) == "page") {
      var imageGet = imageFind(PAGE[searchLink].content)
      if (imageGet) { images[searchLink] = imageGet }
    } else if (redirectable) {
      imageGet = imageFind(PAGE[searchText(REDIRECT[searchLink].redirect)].content)
      if (imageGet) { images[searchLink] = imageGet }
    }
  }

  const randomTerm = Object.keys(images)[Math.floor(Math.random() * Object.keys(images).length)];
  if (images[randomTerm]) {
    if (getType == "top") {
      return images[randomTerm][0]
    } else if (getType == "source") {
      return images[randomTerm][0].split("(src=")[1].split("(cap=")[0].replace("git/", "https://warmwooly.github.io/Anotherpedia/files/").replace("cdn/", "https://cdn.anotherpedia.com/");
    } else { // random
      return images[randomTerm][Math.floor(Math.random() * images[randomTerm].length)]
    }
  }
  else { return "" }
}

// Scroll to the element based on the scroll button
function scrollFunction(sectionToScrollTo, scrollType) {
  if (!(scrollType == "NoteRefLink" && isMobile)) {
    const targetElement = document.getElementById(sectionToScrollTo);
    if (targetElement) {
      const topPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const adjustedScrollPosition = topPosition - 115;
      window.scrollTo({ top: adjustedScrollPosition, behavior: 'smooth' });
    } 
  }
}

// Generate side links to sections if it can scroll
var settingsFix = 0
function generateScrollSections(editField) {
  if (URL_ID == "settings" && settingsFix == 0) {settingsFix = 1; return; }
  if (isScrollbarVisible()) {
    document.getElementById("MovingSidebar").innerHTML += `<button onclick="scrollFunction('Title', 'Section')" id="jumpTitle" class="listButton jumpPage">(Top)</button>`

    let sectionElements = document.querySelectorAll('[id^="section"]');
    var additionalSectionText = ""
    sectionElements.forEach(function(element) {
      if (element.style.display !== "none") {
        if (URL_ID == "settings") { // Remove subsections for the settings
          if (element.classList.contains('subsubsection') || element.classList.contains('subsection')) { return }
          document.getElementById("MovingSidebar").innerHTML += `<button onclick="scrollFunction('` + element.id + `', 'Section')" class="listButton jumpPage" id="jump` + element.id + `">` + element.innerHTML + `</button>`
        } else {
          if (element.classList.contains('subsubsection')) { additionalSectionText = ">> " }
          else if (element.classList.contains('subsection')) { additionalSectionText = "> " }
          else { additionalSectionText = "" }
          document.getElementById("MovingSidebar").innerHTML += `<button onclick="scrollFunction('` + element.id + `', 'Section')" class="listButton jumpPage" id="jump` + element.id + `">` + additionalSectionText + element.innerHTML + `</button>`
        }
      }
    });
    
    if (editField && pageType != "Page" && pageType != "Edited") { document.getElementById("MovingSidebar").innerHTML += `<button onclick="scrollFunction('TitleInput', 'Section')" class="listButton jumpPage">Edit field</button>` }
  }
  
  if (!document.getElementById("noSectionsAvailable")) {
    document.getElementById("MovingSidebar").innerHTML += `<span id="noSectionsAvailable">): No sections to show</span>`;
  }
  if (window.innerWidth > 800 || document.getElementById("MovingSidebar").childElementCount > 4) { document.getElementById("noSectionsAvailable").classList.add("hidden");
  }
}

generateScrollSections(false)

// Regenerates sections on editing
function regenerateScrollSections() {
  var elements = document.querySelectorAll('.jumpPage');
  elements.forEach(function(element) { element.parentNode.removeChild(element); });
  generateScrollSections(true)
  checkSidebarScroll(true)
}

function isScrollbarVisible() { return document.documentElement.scrollHeight > window.innerHeight; }

// Adds hovering effect when scrolling through sections
function checkSidebarScroll(forceCheck) {
  var headers = document.querySelectorAll('.header');
  
  var closestHeader = null;
  var closestDistance = Infinity;
  var currentHeaderId = null;

  //header.classList.contains('subsection')
  headers.forEach(function(header) {
    var id = header.getAttribute('id');
    var section = document.getElementById(id);
    
    var rect = section.getBoundingClientRect();
    var distance = Math.abs(rect.top);
    
    if (rect.top <= 120 && distance < closestDistance) {
      closestHeader = header;
      closestDistance = distance;
      currentHeaderId = id;
    }
  });

  // Detect if the user is not under any headers
  if (!closestHeader) {
    closestHeader = document.getElementById("Title");
    currentHeaderId = "Title";
  }

  if ((currentHeaderId !== window.currentHeaderId || forceCheck) && document.getElementById("jump" + closestHeader.id)) {
    window.currentHeaderId = currentHeaderId;
    headers.forEach(function(header) {
      if (document.getElementById("jump" + header.id)) {
        document.getElementById("jump" + header.id).classList.remove('highlight');
      }
    });

    // Add 'highlight' class to the closest header
    if (document.getElementById("jump" + closestHeader.id)) {
      document.getElementById("jump" + closestHeader.id).classList.add('highlight');
    }
  }
}

document.addEventListener('scroll', function() { checkSidebarScroll(false) });
checkSidebarScroll(true)

// Add draggable edit area
var draggable = document.getElementById('dragArea');
var dragHandle = document.getElementById('dragHandle');
var offsetX, offsetY;

dragHandle.addEventListener('mousedown', function(e) {
  e.preventDefault();
  offsetX = e.clientX - draggable.getBoundingClientRect().left;
  offsetY = e.clientY - draggable.getBoundingClientRect().top;

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
  draggable.style.left = (e.clientX - offsetX) + 'px';
  draggable.style.top = (e.clientY - offsetY) + 'px';
}

function onMouseUp() {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

// Load all pages
if (allPages) {
  let pageKeys = Object.keys(PAGE); // Get the keys first to maintain order
  let index = 0; // Initialize index
  
  const loadPageWithDelay = () => {
    if (index < pageKeys.length) {
      const pageKey = pageKeys[index];
      const page = PAGE[pageKey];
      if (page.name != "All pages") {
        if (page.content.includes("<<disam")) { 
          page.content = page.content.split("disam>>")[1]; 
        }
        if (page.date != "today") {
          var dateLink = "<span class='clickableh5' onclick='change(`Same`, false, `date: " + page.date + "`)' oncontextmenu='change(`New`, false, `date: " + page.date + "`)'>" + page.date + "</span>"
        } else { dateLink = page.date }

        if (page.creator != "automatic generation") {
          var creators = PAGE[URL_ID].creator.split(",")
          var creatorLink = ""
          if (creators.length == 1) {
            creatorLink = "<span class='clickableh5 " + authorStyle(findAuthorCount(PAGE[URL_ID].creator)) + "' onclick='change(`Same`, false, `author: " + PAGE[URL_ID].creator + "`)' oncontextmenu='change(`New`, false, `author: " + PAGE[URL_ID].creator + "`)'>" + PAGE[URL_ID].creator + "</span>"
          } else if (creators.length == 2) {
            creatorLink = "<span class='clickableh5 " + authorStyle(findAuthorCount(creators[0])) + "' onclick='change(`Same`, false, `author: " + creators[0] + "`)' oncontextmenu='change(`New`, false, `author: " + creators[0] + "`)'>" + creators[0] + "</span> and <span class='clickableh5 " + authorStyle(findAuthorCount(creators[1])) + "' onclick='change(`Same`, false, `author: " + creators[1] + "`)' oncontextmenu='change(`New`, false, `author: " + creators[1] + "`)'>" + creators[1] + "</span>"
          } else {
            creatorLink = ""
            for (var creator in creators) {
              if (creator < creators.length - 1) {
                creatorLink += "<span class='clickableh5 " + authorStyle(findAuthorCount(creators[creator])) + "' onclick='change(`Same`, false, `author: " + creators[creator] + "`)' oncontextmenu='change(`New`, false, `author: " + creators[creator] + "`)'>" + creators[creator] + "</span>, "
              } else {
                creatorLink +=  " and <span class='clickableh5 " + authorStyle(findAuthorCount(creators[creator])) + "' onclick='change(`Same`, false, `author: " + creators[creator] + "`)' oncontextmenu='change(`New`, false, `author: " + creators[creator] + "`)'>" + creators[creator] + "</span>"
              }
            }
          }
        } else { creatorLink = page.creator }

        document.getElementById("Content").innerHTML += wikifyText("<br><br><section><<devTitle" + page.name + "devTitle>>" + page.content + "<h5>Created on " + dateLink + " by " + creatorLink + "</h5></section>")
      }
      
      index++;
      setTimeout(loadPageWithDelay, 100);
    }
  };
  
  loadPageWithDelay(); // Start the loop
}

// Add and display achievements
function awardAchievement(achievementName) {
  var achievements = localStorage.getItem("achievements")
  if (!achievements.includes(achievementName)) {
    // Add achievement to localStorage
    if (achievements.length < 1) { localStorage.setItem("achievements", JSON.stringify([achievementName])) }
    else {
      achievements = JSON.parse(achievements);
      achievements[achievements.length] = achievementName
      localStorage.setItem("achievements", JSON.stringify(achievements));
    }
    
    // Display achievement on the screen
    var achievementElement = document.getElementById("Achievement");
    achievementElement.innerHTML = "<b>Achievement:</b> " + achievementName
    if (localStorage.getItem("safeMode") === "false") { achievementElement.style.display = "block"; } // Hide achievements appearing in safe mode
  }
}

// Set footer
document.getElementById("Footer").innerHTML = wikifyText("[[Anotherpedia]] is hosted on <<link(src=https://www.github.com(text=github.comlink>>. Please read our [[disclaimer|Anotherpedia disclaimer]].")

// Run commands to get pages from GitHub << NO LONGER USED; MAY REWORK IN THE FUTURE >>
/*if (command) {
  console.log("https://raw.githubusercontent.com/WarmWooly/Anotherpedia.txt/main/messages/" + commandinfo + ".json")
  
  fetch("https://raw.githubusercontent.com/WarmWooly/Anotherpedia.txt/main/messages/" + commandinfo + ".json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data["text"])
        commandinfo = data["text"]

        if (commandid == "createFromTxt") { 
          editPage()

          commandinfo = commandinfo.split("#$$$#")
          document.getElementById("TitleInput").value = commandinfo[0]
          document.getElementById("ContentInput").value = commandinfo[1]
          document.getElementById("MovingContentInput").value = commandinfo[1]
          document.getElementById("DateInput").value = commandinfo[2]
          document.getElementById("CreatorInput").value = commandinfo[3]
          document.getElementById("EditDateInput").value = commandinfo[4]
          document.getElementById("EditorInput").value = commandinfo[5]
          testArticle(true)
          document.getElementById("PageCreator").classList.remove("hidden")
        } else if (commandid == "editFromTxt") {
          editPage()

          commandinfo = commandinfo.split("#$$$#")
          document.getElementById("TitleInput").value = commandinfo[0]
          document.getElementById("ContentInput").value = commandinfo[1]
          document.getElementById("MovingContentInput").value = commandinfo[1]
          document.getElementById("DateInput").value = commandinfo[2]
          document.getElementById("CreatorInput").value = commandinfo[3]
          document.getElementById("EditDateInput").value = commandinfo[4]
          document.getElementById("EditorInput").value = commandinfo[5]
          testArticle(true)
          document.getElementById("PageCreator").classList.remove("hidden")
        }
    })
    .catch(error => {
      console.error('Error fetching JSON:', error);
      document.getElementById("TitleInput").value = "{{iError locating saved file for page on GitHub.}}"
      testArticle(true)
    });
}
*/