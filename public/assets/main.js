window.location.hash&&window.location.replace("/");
try {
    $, jQuery;
} catch(err) {
    var a = document.getElementsByTagName("noscript")[0];
    a.outerHTML = a.innerHTML;
    a = document.getElementById("error");
    a.getElementsByTagName("a")[0].innerText = navigator.userAgent;
    a.getElementsByTagName("div")[1].removeAttribute("hidden");
    a.getElementsByTagName("div")[0].setAttribute("hidden", "");
}
var $inputSettingsApiKey=$("[class='Input.Settings.apiKey']"),
$inputLookUpUUID=$("[class='Input.lookUp.UUID']"),
$buttonSettingsSApiKey=$("[class^='Button.Settings.s_apiKey']"),
$buttonLookUpSubmit=$("[class^='Button.lookUp.submit']"),
$buttonSettingsClearCache=$("[class^='Button.Settings.clearCache']"),
$gameTypes={},
$achievements={},
$endpoint="https://api.hypixel.net",
$isSetup=!1,
$lastLogin=0,
$isOnline=!1,
$currUUID="",
$data = {},
skinRender;
try {
    getItem("");
} catch(err) {
    $alert("Cookies are disabled", "Local Storage is required for the app to function correctly.");
}
$(document).ready(function() {
    $("body").removeAttr("style");
    $("#globalPop").popup();
    setup_chk();
    getServerStats();
    getGameTypes();
    getAchievements();
});
/**
 * Fetches from storage.
 * @param {string} a - Item Name
 * @returns Storage Item.
 */
function getItem(a) {
    a = localStorage.getItem(a);
    try {
        return JSON.parse(a);
    } catch(b) {
        return a;
    }
}
$inputSettingsApiKey.val(getItem("apiKey"));
/**
 * Closes the active popup.
 */
function $alert_close(){
    $("#globalPop").popup("close");
    $("#globalPop button").unbind("click");
}
/**
 * This function creates an iOS 6 popup with assignable message and function.
 * @param {string} a - Message Title : "Message Box"
 * @param {string} b - Message Body : "This is a message box"
 * @param {function} c - Executable Function
 * @param {boolean} d - Has Cancel Button?
 */
function $alert(a,b,c,d){
    b && (b = b.replace(/(\r\n|\r|\n)/g, "<br/>"));
    $("#globalPop .title span").text(a);
    $("#globalPop .text span").html(b);
    /** Fuck jQuery Mobile Popup Module */
    var e = setInterval(function(){
        $("#globalPop").popup("open");
        clearInterval(e);
        1 === d && $("#globalPop button.btn-b").removeAttr("hidden");
        1 !== d && $("#globalPop button.btn-b").attr("hidden", "");
        $("#globalPop button.btn-a").on("click", "function" === typeof c && c || $alert_close);
        $("#globalPop button.btn-b").on("click", $alert_close);
    }, 1);
}
/**
 * Executes functions on app ready.
 */
function app_run(){
    getWatchdogStats();
}
/**
 * Initial app setup.
 */
function setup_run(){
    $isSetup = !0;
    localStorage.setItem("cache", JSON.stringify({}));
    $alert("Welcome!", "Please enter API key to continue.", function(){
        $("#settings a.revert-btn").hide();
        $(".OTHERSETTINGS").hide();
        $.mobile.changePage("#settings");
    });
}
/**
 * Checks if app has been setup.
 */
function setup_chk(){
    getItem("setup") ? app_run() : setup_run();
}
/**
 * Runs when the setup has completed.
 */
function setup_suc(){
    localStorage.setItem("setup", "1");
    $isSetup = !1;
    $alert("API key has been set!", "Enjoy the app!", function(){
        $.mobile.changePage("#Home");
        app_run();
        $("#settings .ui-btn-left").show();
        $(".OTHERSETTINGS").show();
    });
}
/**
 * Oh noes. Something went wrong with the setup, and has been logged in the console. 
 */
function setup_err(a){
    console.error(a);
}
/**
 * sucky wuckies uwu
 * 
 * I MEAN- THIS LITTLE BITCH HERE IS EXECUTED WHEN THE API KEY VALIDATION PASSES WITH A GREEN LIGHT, YAY!!
 */
function apikey_suc(){
    if ($isSetup) return setup_suc();
    $alert("Validation Complete", "Your API key is valid");
}
/**
 * Converts Username into UUID using Ashcon.app
 */
function getPlayerUUID(){
    _fetch("GET", "https://api.ashcon.app/mojang/v2/user/" + $inputLookUpUUID.val(), parsePlayerUUID, errorHandler);
}
/**
 * Basically runs getPlayerStats which fetches the player stats.
 * @param {string} a 
 */
function parsePlayerUUID(a){
    getPlayerStats(a.uuid);
}
/**
 * The error handler!! 
 * 
 * Calls upon $alert to warn the user of an error that occurred in a function.
 * @param {*} a - The Error Message
 */
function errorHandler(a){
    a=a.responseText && JSON.parse(a.responseText) || {cause:a};
    a=a.cause||a.reason;
    $buttonLookUpSubmit.attr("data-action-looking", !1);
    setInterval($alert("Error", a), 1);
}
/**
 * Fetches current online players from Krashnz Hypixel API thingy.
 */
function getServerStats(){
    _fetch("GET", "https://hypixel.krashnz.com/api/v3/stats", parseServerStats);
}
/**
 * Inserts the fetched server data into the current online players field.
 */
function parseServerStats(a){
    $("[class='Field.Server.currentPlayers']").text(parseNumber(a.stats[0].value));
}
/**
 * Fetches GameTypes from Hypixel API.
 */
function getGameTypes(){
    _fetch("GET", $endpoint + "/resources/games", function(a){
        $gameTypes = a.games;
    }, errorHandler);
}
/**
 * Fetches WatchDog data from Hypixel API.
 */
function getWatchdogStats(){
    _fetch("GET", $endpoint + "/watchdogstats?key=" + getItem("apiKey"), parseWatchdogStats, errorHandler);
}
/**
 * Inserts the fetched WatchDog data into it's field thing, blah blah blah.
 */
function parseWatchdogStats(a){
    $("[class='Field.Server.Watchdog']").text(parseNumber(a.watchdog_total));
}
/**
 * Fetches all achievements from Hypixel API.
 */
function getAchievements(){
    _fetch("GET", $endpoint + "/resources/achievements", parseAchievements, errorHandler);
}
/**
 * This function parses and inserts the achievements into the Achievements tab.
 * @param {object} a 
 */
function parseAchievements(a){
    var b=$("[id='stats:player:achievements'] [data-role='collapsibleset']"),
    d;
    for(d in a.achievements){
        c=getGame(d.toUpperCase());
        e=a.achievements[d];
        $("<div/>", {
            "data-role": "collapsible",
            "data-name": d,
            html: "<h3>"+c+"</h3><ul class='achievements'></ul>"
        }).appendTo(b);
        for(var f in e.one_time)
            $("<li/>", {
                "data-internal": d + "_" + f.toLowerCase(),
                "data-completed": !1,
                "data-name": e.one_time[f].name,
                "data-description": e.one_time[f].description,
                html: "<a data-rel=\"popup\" href=\"#achievementPop\"><div class='achievementIcon' data-icon='https://hypixel.net/styles/hypixel-uix/hypixel/achievements/" + f + ".svg')></div></a>"
            }).appendTo($("[data-name='"+d+"'] .achievements")),
            $("[data-internal='" + d + "_" + f.toLowerCase() + "']").click(ent_achiv_click);
    }
}
/**
 * This function parses and inserts game stats into the Stats tab.
 * @param {object} b 
 */
function parseStatistics(b){
    var d=$("[id='stats:player:stats'] [data-role='collapsibleset']"),
    f;
    for(f in b){
        c=getGame(f.toUpperCase());
        e=b[f];
        $("<div/>", {
            "data-role": "collapsible",
            "data-name": f,
            html: "<h3>"+c+"</h3><ul class='stats'></ul>"
        }).appendTo(d);
        for(var g in Object.keys(e))
        $("<li/>", {
            "data-internal": f+"_"+g.toLowerCase(),
            html: "<span><b>"+convertObjectName(Object.keys(e)[g])+"</b>: "+e[Object.keys(e)[g]]+"</span>"
        }).appendTo($("[data-name='"+f+"'] .stats"));
    }
}
/**
 * This function removes underscores and caps the first letter of each word on an Object name.
 * @param {string} a - Object Name
 * @returns Converted name.
 */
function convertObjectName(b){
    var d = b.split("_");
    for (b = 0; b < d.length; b++)
    d[b] = d[b].charAt(0).toUpperCase() + d[b].slice(1);
    return d.join(" ");
}
/**
 * Opens tooltip containing information about the selected achievement.
 * @param {*} a 
 */
function ent_achiv_click(a){
    a = a.currentTarget.dataset;
    var b = "true" == a.completed;
    $("#achievementPop").html('<p>' + a.name + '</p><p style="font-size: 14px">' + a.description + '</p><hr/><p class="center" style="font-size: 12px" data-text-color="' + (b ? "GREEN" : "GRAY") + '">' + (b ? "Completed" : "Not Completed") + '</p>');
}
/**
 * This function is a handler that fetches the player's stats, then proceeds to execute assigned function.
 * @param {string} a - Player UUID
 */
function getPlayerStats(a){
    _fetch("GET", $endpoint + "/player?key=" + getItem("apiKey") + "&uuid=" + a, function(b){
        null !== b.player ? (
            $data._default=b.player,
            getPlayerStatus(b.player.uuid)
        ) : errorHandler("Player has never played on Hypixel.");
    }, errorHandler);
}
/**
 * This function parses and inserts player data into the player tab.
 * 
 * Sends you to the player info tab as well.
 * @param {object} a - Player Data.
 */
function parsePlayerStats(a){
    $.mobile.changePage("#stats:player");
    clearField();
    clearAchiev();
    $buttonLookUpSubmit.attr("data-action-looking", !1);
    $lastLogin = a._default.lastLogin;
    $isOnline = a._recentgame.online;
    $currUUID = a._default.playername;
    var b = a._default.prefix || a._default.rank || ("NONE" !== a._default.monthlyPackageRank ? a._default.monthlyPackageRank: !1) || a._default.newPackageRank || "DEFAULT",
    c = a._default.achievementsOneTime;
    getItem("cache")[a._default.playername.toLowerCase()] || addCache(a._default.playername.toLowerCase(), a._default.uuid);
    try {
        skinRender.clearScene();
    } catch(err) {}
    $("[href='#stats:player:view']").on("click", function(a) {
        try {
            skinRender.render($currUUID);
        } catch(err) {
            a.preventDefault();
            $alert("MineRender is not supported");
        }
    });
    // Field.Main
    $("[class='Field.Main.PlayerName']").html(buildName(a._default.displayname, b));
    $("[class='Field.Main.Rank']").html(buildRank(b, a._default.rankPlusColor || "GOLD"));
    $("[class='Field.Main.firstLogin']").text(buildTime(a._default.firstLogin));
    $("[class='Field.Main.lastLogin']").text(buildTime(a._default.lastLogin));
    $("[class='Field.Main.networkExp']").text(parseNumber(a._default.networkExp));
    $("[class='Field.Main.karma']").text(parseNumber(a._default.karma || 0));
    $("[class='Field.Main.achievementPoints']").text(parseNumber(a._default.achievementPoints));
    $("[class='Field.Main.UUID']").text(a._default.uuid);
    $("[class='Field.Main.mostRecentGameType']").text(
        ($isOnline ? getGame(a._recentgame.gameType) : "Not currently online")
    );
    // Field.recentGame
    $("[class='Field.recentGame.gameType']").text(
        ($isOnline ? getGame(a._recentgame.gameType) : "Not currently online")
    );
    $("[class='Field.recentGame.gameMode']").text(getGameMode(a._recentgame.gameType,a._recentgame.mode));
    $("[class='Field.recentGame.gameMap']").text(a._recentgame.map || "Unknown");
    // Field.networkExp
    $("[class='Field.networkExp.Level").text(getNetworkLevel(a._default.networkExp));
    $("[class='Field.networkExp.Experience']").text(parseNumber(a._default.networkExp));
    $("[class='Field.networkExp.expToNextLevel']").text(parseNumber(getLevelUpExp(getNetworkLevel(a._default.networkExp))));
    // Field.stats
    parseStatistics(a._default.stats);
    // Field.achievements
    try {
        for (a = 0; a < c.length; ++a) $("[data-internal='" + c[a] + "']").attr("class", "completed"), $("[data-internal='" + c[a] + "']").attr("data-completed", !0);
    } catch(err) {}
    // switch page
    //$.mobile.changePage("#stats:player");
}
/**
 * This function is a handler that fetches the player's in-game status, then proceeds to execute assigned function.
 * @param {string} a - Player name
 */
function getPlayerStatus(a){
    _fetch("GET", $endpoint + "/status?key=" + getItem("apiKey") + "&uuid=" + a, function(b) {
        $data._recentgame = b.session;
        parsePlayerStats($data);
    }, errorHandler);
}
/**
 * This function clears the fields to avoid incorrect data from being shown.
 */
function clearField(){
    $("[data-role='page']:not([id='stats:server']) .ui-field > p > small").each(function(){
        $(this).text("");
    });
}
/**
 * We don't want previous player achievements shown with the current player's achievements.
 */
function clearAchiev(){
    $("[data-completed='true']").attr("data-completed", !1);
    $("li.completed").removeAttr("class");
}
/**
 * For some reason, I made a function for jQuery Ajax instead of using it directly.
 * @param {*} type - Define HTTP method. (GET, POST, etc)
 * @param {*} url - URL.
 * @param {function} success - Gets called on success aka HTTP Code 200. 
 * @param {function} error - Gets called on error, reason can vary.
 */
function _fetch(type, url, success, error) {
    $.ajax({
        type: type,
        url: url,
        success: success,
        error: error
    });
}
/**
 * This function validates your API Key through a Regex.
 * @param {string} e - API Key
 * @returns boolean
 */
function validateApiKeyRegex(e) {
    return /[a-z0-9][a-z0-9]*-[a-z0-9][a-z0-9]*-[a-z0-9]/.test(e);
}
/**
 * This function adds zero to the start of the number if it's lesser than 10.
 * @param {number} a 
 * @returns number
 */
function addZero(a){
    10 > a && (a="0" + a);
    return a;
}
function sortABC(a,b){
    return a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase() ? 1 : -1;
}
/**
 * As the name suggests, this will attach a "S" to the end of the string if {b} is greater than 1.
 * @param {string} a 
 * @param {number} b 
 * @returns 
 */
function addS(a,b){
    return 1 < b ? b + " " + a + "s" : b + " " + a;
}
/**
 * Returns "Hidden" that's pretty much it.
 * @returns Hidden
 */
function nHidden(){
    return "Hidden";
}
/**
 * This function formats time to AM/PM.
 * @param {number} a 
 * @returns number
 */
function AMorPM(a){
    return 12 > a ? "AM" : "PM";
}
/**
 * Formats the input number.
 * @param {string} a - Number.
 * @returns Parsed number.
 */
function parseNumber(a){
    try {
        return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
    } catch(b) {
        return a;
    }
}
/**
 * Contructs player rank with colored text.
 * @param {*} a 
 * @param {*} b 
 * @returns Player Rank.
 */
function buildRank(a, b) {
    return a.replace("§c[OWNER]", "<span data-text-color='" + getColor("OWNER") + "'>OWNER</span>")
    .replace("ADMIN", "<span data-text-color='" + getColor("OWNER") + "'>ADMIN</span>")
    .replace("GAME_MASTER", "<span data-text-color='" + getColor("GAME_MASTER") + "'>GM</span>")
    .replace("YOU", "<span data-text-color='" + getColor("YOU") + "'>You</span>")
    .replace("TUBER", "<span data-text-color='" + getColor("TUBER") + "'>Tuber</span>")
    .replace("VIP", "<span data-text-color='" + getColor("VIP") + "'>VIP</span>")
    .replace("MVP", "<span data-text-color='" + getColor("MVP") + "'>MVP</span>")
    .replace("SUPERSTAR", "<span data-text-color='" + getColor("SUPERSTAR") + "'>MVP</span>_PLUS_PLUS")
    .replace("DEFAULT", "<span data-text-color='" + getColor("DEFAULT") + "'>Default</span>")
    .replace(/_PLUS/g, "<span data-text-color='" + b + "'>+</span>");
}
/**
 * Contructs player name with rank color.
 * @param {string} a - Player Name
 * @param {string} b - Rank Color
 * @returns Player Name.
 */
function buildName(a, b){
    return "<span data-text-color='" + getColor(b) + "'>" + a + "</span>";
}
/**
 * Contructs the time format used for first and last login.
 * 
 * DAY, MONTH DATE, YEAR at HOUR:MINUTE:SECOND AM/PM
 * @param {?} a 
 * @returns Formatted time.
 */
function buildTime(a){
    if (!a) return nHidden();
    a = new Date(a);
    return (a = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ")[a.getDay()] + ", " + "January February March April May June July August September October November December".split(" ")[a.getMonth()] + " " + a.getDate() + ", " + a.getFullYear() + " at "+ addZero(a.getHours()) + ":" + addZero(a.getMinutes()) + ":" + addZero(a.getSeconds()) + " " + AMorPM(a.getHours()));
}
/**
 * Contructs the time format used for connectivity duration.
 * @param {*} a 
 * @param {*} b 
 * @param {*} c 
 * @returns Formatted time.
 */
function buildPlayTime(a, b, c){
    a = b-a;
    a = addS("day",addZero(Math.floor(a/864E5)))+", "+addS("hour", addZero(Math.floor(a%864E5/36E5))) + ", " +addS("minute",addZero(Math.floor(a%36E5/6E4))) + ", "+addS("second",addZero(Math.floor(a%6E4/1E3))); c || (a=nHidden());
    return a;
}
/**
 * Updates "Time Playing"
 */
function setPlayTime(){
    $("[class='Field.Main.timePlaying']").text(buildPlayTime($lastLogin, (new Date).getTime(), $isOnline));
}
/**
 * This function assigns a color to player rank.
 * @param {string} a 
 * @returns 
 */
function getColor(a) {
    switch (!0) {
        case /OWNER|ADMIN|YOU/.test(a):
            a = "RED";
            break;
        case /GAME_MASTER|VIP/.test(a):
            a = "GREEN";
            break;
        case /TUBER/.test(a):
            a = "WHITE";
            break;
        case /SUPERSTAR/.test(a):
            a = "GOLD";
            break;
        case /MVP/.test(a):
            a = "AQUA";
            break;
        default:
            a = "GRAY";
            break;
    }
    return a;
}
/**
 * This function calculates the Player's Network Level from their EXP.
 * @param {number} a - Player EXP
 * @returns Network Level
 */
function getNetworkLevel(a){
    return Math.round(Math.sqrt(2 * a + 30625) / 50 - 2.5);
}
/**
 * Calculates how much EXP the player needs to level up.
 * @param {number} a - Player EXP
 * @returns 
 */
function getLevelUpExp(a){
    return 1 > a ? 1E4 : 2500 * (a - 1) + 1E4;
}
/**
 * This function is used for converting a different name type for games into their public name.
 * @param {string} a - Database Name.
 * @returns Public Name.
 */
function getGameList(a){
    switch (a) {
        case "BLITZ":
            a = "Blitz Survival Games";
            break;
        case "BUILDBATTLE":
            a = "Build Battle";
            break;
        case "COPSANDCRIMS":
            a = "Cops and Crims";
            break;
        case "HUNGERGAMES":
            a = "Survival Games";
            break;
        case "EASTER":
            a = "Easter";
            break;
        case "GENERAL":
            a = "General";
            break;
        case "MURDERMYSTERY":
            a = "Murder Mystery";
            break;
        case "QUAKE":
            a = "Quake";
            break;
        case "SPEEDUHC":
            a = "Speed UHC";
            break;
        case "SUMMER":
            a = "Summer";
            break;
        case "SUPERSMASH":
            a = "Smash Heroes";
            break;
        case "TRUECOMBAT":
            a = "Crazy Walls";
            break;
        case "WARLORDS":
            a = "Warlords";
            break;
        case "WOOLGAMES":
            a = "Wool Games";
    }
    return a;
}
/**
 * This function converts the game's internal name into it's public name.
 * Example: MCGO -> Cops and Crims.
 * @param {string} a - Internal Name.
 * @returns Public Name.
 */
function getGame(a){
    return $gameTypes[a] && $gameTypes[a].name || getGameList(a);
}
/**
 * This function does something with the game mode the player is in.
 * 
 * I got really lazy with writing proper descriptions lol.
 * @param {*} a 
 * @param {*} b 
 * @returns Game Mode
 */
function getGameMode(a, b){
    return $gameTypes[a] && $gameTypes[a].modeNames && $gameTypes[a].modeNames[b] || b;
}
/**
 * Stores converted UUID to cache.
 * @param {string} a - Player Name
 * @param {string} b - Player UUID 
 */
function addCache(a, b){
    var c = getItem("cache");
    c[a] = b;
    localStorage.setItem("cache", JSON.stringify(c));
}
/**
 * This function checks whenever the lookup name is an username or UUID.
 * @param {string} a 
 * @returns boolean - true/false
 */
function isUUID(a){
    var b = /^[0-9a-f]{32}$/i;
    a = a.replace(/-/g, '');
    return b.test(a);
}
$inputSettingsApiKey.on("input", function(){
    localStorage.setItem("apiKey", $inputSettingsApiKey.val());
});
$buttonSettingsSApiKey.click(function(){
    validateApiKeyRegex($inputSettingsApiKey.val())&&36===$inputSettingsApiKey.val().length?_fetch("GET",$endpoint+"/key?key="+$inputSettingsApiKey.val(),apikey_suc,errorHandler):errorHandler("Invalid API key");
});
$buttonSettingsClearCache.click(function(){
    $alert("Confirmation", "Are you sure you want to clear the cache?", function(){
        localStorage.setItem("cache", JSON.stringify({}));
        $alert_close();
        setTimeout(function(){$alert("Done", "Cache Storage has been emptied");}, 1000);
    }, 1);
});
$("#lookUp").submit(function(a) {
    a.preventDefault();
    $buttonLookUpSubmit.attr("data-action-looking", !0);
    if ($inputLookUpUUID.val().length < 2)
    return errorHandler("Field cannot be empty.");
    if (!/^[a-zA-Z0-9_-]*$/gm.test($inputLookUpUUID.val()))
    return errorHandler("Player name must only contain letters, numbers and underscores!");
    if (getItem("cache")[$inputLookUpUUID.val().toLowerCase()])
    return getPlayerStats(getItem("cache")[$inputLookUpUUID.val().toLowerCase()]);
    isUUID($inputLookUpUUID.val()) ? getPlayerStats($inputLookUpUUID.val()) : getPlayerUUID();
    return !1;
});
setInterval(getServerStats, 12e4);
setInterval(getWatchdogStats, 12e4);
setInterval(setPlayTime);