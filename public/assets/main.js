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
$data = {};
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
/** Get item from storage */
function getItem(a) {
    a = localStorage.getItem(a);
    try {
        return JSON.parse(a);
    } catch(b) {
        return a;
    }
}
$inputSettingsApiKey.val(getItem("apiKey"));
function $alert(a,b,c,d){
    b = b.replace(/(\r\n|\r|\n)/g, "<br/>");
    $("#globalPop .title span").text(a);
    $("#globalPop .text span").html(b);
    /** Fuck jQuery Mobile Popup Module */
    var f = function(){
        $("#globalPop").popup("close");
        $("#globalPop button").unbind("click");
    };
    var e = setInterval(function(){
        $("#globalPop").popup("open");
        clearInterval(e);
        1 === d && $("#globalPop button.btn-b").removeAttr("hidden");
        1 !== d && $("#globalPop button.btn-b").attr("hidden", "");
        $("#globalPop button.btn-a").on("click", "function" === typeof c && c || f);
        $("#globalPop button.btn-b").on("click", f);
    }, 1);
}
function app_run(){
    getWatchdogStats();
}
function setup_run(){
    $isSetup = !0;
    localStorage.setItem("cache", JSON.stringify({}));
    $alert("Welcome!", "Please enter API key to continue.", function(){
        $("#settings a.revert-btn").hide();
        $(".OTHERSETTINGS").hide();
        $.mobile.changePage("#settings");
    });
}
function setup_chk(){
    getItem("setup") ? app_run() : setup_run();
}
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
function setup_err(a){
    console.error(a);
}
function apikey_suc(){
    if ($isSetup) return setup_suc();
    $alert("Validation Complete", "Your API key is valid");
}
function getPlayerUUID(){
    _fetch("GET", "https://api.ashcon.app/mojang/v2/user/" + $inputLookUpUUID.val(), parsePlayerUUID, errorHandler);
}
function parsePlayerUUID(a){
    getPlayerStats(a.uuid);
}
function errorHandler(a){
    a=a.responseText && JSON.parse(a.responseText) || {cause:a};
    a=a.cause||a.reason;
    $buttonLookUpSubmit.attr("data-action-looking", !1);
    setInterval($alert("Error", a), 1);
}
function getServerStats(){
    _fetch("GET", "https://hypixel.krashnz.com/api/v3/stats", parseServerStats);
}
function parseServerStats(a){
    $("[class='Field.Server.currentPlayers']").text(parseNumber(a.stats[0].value));
}
function getGameTypes(){
    _fetch("GET", $endpoint + "/resources/games", function(a){
        $gameTypes = a.games;
    }, errorHandler);
}
function getWatchdogStats(){
    _fetch("GET", $endpoint + "/watchdogstats?key=" + getItem("apiKey"), parseWatchdogStats, errorHandler);
}
function parseWatchdogStats(a){
    $("[class='Field.Server.Watchdog']").text(parseNumber(a.watchdog_total));
}
function getAchievements(){
    _fetch("GET", $endpoint + "/resources/achievements", parseAchievements, errorHandler);
}
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
function ent_achiv_click(a){
    a = a.currentTarget.dataset;
    var b = "true" == a.completed;
    $("#achievementPop").html('<p>' + a.name + '</p><p style="font-size: 14px">' + a.description + '</p><hr/><p class="center" style="font-size: 12px" data-text-color="' + (b ? "GREEN" : "GRAY") + '">' + (b ? "Completed" : "Not Completed") + '</p>');
}
function getPlayerStats(a){
    _fetch("GET", $endpoint + "/player?key=" + getItem("apiKey") + "&uuid=" + a, function(b){
        null !== b.player ? (
            $data._default=b.player,
            getPlayerStatus(b.player.uuid)
        ) : errorHandler("Player has never played on Hypixel.");
    }, errorHandler);
}
function parsePlayerStats(a){
    clearField();
    clearAchiev();
    $buttonLookUpSubmit.attr("data-action-looking", !1);
    $lastLogin = a._default.lastLogin;
    $isOnline = a._recentgame.online;
    var b = a._default.prefix || a._default.rank || ("NONE" !== a._default.monthlyPackageRank ? a._default.monthlyPackageRank: !1) || a._default.newPackageRank || "DEFAULT",
    c = a._default.achievementsOneTime;
    getItem("cache")[a._default.playername.toLowerCase()] || addCache(a._default.playername.toLowerCase(), a._default.uuid);
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
    // Field.achievements
    try {
        for (a = 0; a < c.length; ++a) $("[data-internal='" + c[a] + "']").attr("class", "completed"), $("[data-internal='" + c[a] + "']").attr("data-completed", !0);
    } catch(err) {}
    // switch page
    $.mobile.changePage("#stats:player");
}
function getPlayerStatus(a){
    _fetch("GET", $endpoint + "/status?key=" + getItem("apiKey") + "&uuid=" + a, function(b) {
        $data._recentgame = b.session;
        parsePlayerStats($data);
    }, errorHandler);
}
function clearField(){
    $("[data-role='page']:not([id='stats:server']) .ui-field > p > small").each(function(){
        $(this).text("");
    });
}
function clearAchiev(){
    $("[data-completed='true']").attr("data-completed", !1);
    $("li.completed").removeAttr("class");
}
function _fetch(type, url, success, error) {
    $.ajax({
        type: type,
        url: url,
        success: success,
        error: error
    });
}
function validateApiKeyRegex(e) {
    return /[a-z0-9][a-z0-9]*-[a-z0-9][a-z0-9]*-[a-z0-9]/.test(e);
}
function addZero(a){
    10 > a && (a="0" + a);
    return a;
}
function sortABC(a,b){
    return a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase() ? 1 : -1;
}
function addS(a,b){
    return 1 < b ? b + " " + a + "s" : b + " " + a;
}
function nHidden(){
    return "Hidden";
}
function AMorPM(a){
    return 12 > a ? "AM" : "PM";
}
function parseNumber(a){
    try {
        return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
    } catch(b) {
        return a;
    }
}
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
function buildName(a, b){
    return "<span data-text-color='" + getColor(b) + "'>" + a + "</span>";
}
function buildTime(a){
    if (!a) return nHidden();
    a = new Date(a);
    return (a = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ")[a.getDay()] + ", " + "January February March April May June July August September October November December".split(" ")[a.getMonth()] + " " + a.getDate() + ", " + a.getFullYear() + " at "+ addZero(a.getHours()) + ":" + addZero(a.getMinutes()) + ":" + addZero(a.getSeconds()) + " " + AMorPM(a.getHours()));
}
function buildPlayTime(a, b, c){
    a = b-a;
    a = addS("day",addZero(Math.floor(a/864E5)))+", "+addS("hour", addZero(Math.floor(a%864E5/36E5))) + ", " +addS("minute",addZero(Math.floor(a%36E5/6E4))) + ", "+addS("second",addZero(Math.floor(a%6E4/1E3))); c || (a=nHidden());
    return a;
}
function setPlayTime(){
    $("[class='Field.Main.timePlaying']").text(buildPlayTime($lastLogin, (new Date).getTime(), $isOnline));
}
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
function getNetworkLevel(a){
    return Math.round(Math.sqrt(2 * a + 30625) / 50 - 2.5);
}
function getLevelUpExp(a){
    return 1 > a ? 1E4 : 2500 * (a - 1) + 1E4;
}
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
 * converts type name into clean name
 * @param {string} a
 * @returns string
 */
function getGame(a){
    return $gameTypes[a] && $gameTypes[a].name || getGameList(a);
}
function getGameMode(a, b){
    return $gameTypes[a] && $gameTypes[a].modeNames && $gameTypes[a].modeNames[b] || b;
}
function addCache(a, b){
    var c = getItem("cache");
    c[a] = b;
    localStorage.setItem("cache", JSON.stringify(c));
}
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
    $alert("Confirmation", "Are you sure about clearing cache?", function(){
        localStorage.setItem("cache", JSON.stringify({}));
        $("#globalPop button").unbind("click");
        $("#globalPop").popup("close");
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