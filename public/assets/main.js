window.location.hash&&window.location.replace("/");
var $inputSettingsApiKey=$("[class='Input.Settings.apiKey']"),
$inputLookUpUUID=$("[class='Input.lookUp.UUID']"),
$buttonSettingsSApiKey=$("[class^='Button.Settings.s_apiKey']"),
$textSettingsApiKeyErrMsg=$("[class='Text.Settings.apiKey.ErrorMessage'] > small"),
$textlookUpErrMsg=$("[class='Text.lookUp.ErrorMessage'] > small"),
gameTypes={},
endpoint="https://api.hypixel.net",
isSetup=!1,
$lastLogin=0,
$isOnline=!1,
$data = {};
$(document).ready(function() {
    setup_chk();
    getServerStats();
    getGameTypes();
    getAchievements();
});
function getItem(a) {
    return localStorage.getItem(a);
}
$inputSettingsApiKey.val(getItem("apiKey"));
function app_run(){
    getWatchdogStats();
}
function setup_run(){
    isSetup = !0;
    $.mobile.changePage("#settings");
    $("#settings .ui-btn-left").hide();
    $buttonSettingsSApiKey.text("Continue");
    alert("Welcome!\nPlease enter API key to continue.");
}
function setup_chk(){
    getItem("setup") ? app_run() : setup_run();
}
function setup_suc(){
    localStorage.setItem("setup", "1");
    isSetup = !1;
    alert("API key has been set!\nEnjoy the app!");
    $.mobile.changePage("#Home");
    $("#settings .ui-btn-left").show();
    $textSettingsApiKeyErrMsg.text("");
}
function setup_err(a){
    console.error(a);
}
function apikey_suc(){
    if (isSetup) return setup_suc();
}
function apikey_err(a){
    a=JSON.parse(a.responseText);
    $textSettingsApiKeyErrMsg.text(a.cause);
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
    $textlookUpErrMsg.text(a);
    try{
        $("#popupiOS").popup("close");
    } catch(err) {}
}
function getServerStats(){
    _fetch("GET", "https://hypixel.krashnz.com/api/v3/stats", parseServerStats);
}
function parseServerStats(a){
    $("[class='Field.Server.currentPlayers']").text(parseNumber(a.stats[0].value));
}
function getGameTypes(){
    _fetch("GET", endpoint + "/resources/games", function(e){
        gameTypes = e.games;
    }, errorHandler);
}
function getWatchdogStats(){
    _fetch("GET", endpoint + "/watchdogstats?key=" + getItem("apiKey"), parseWatchdogStats, errorHandler);
}
function parseWatchdogStats(a){
    $("[class='Field.Server.Watchdog']").text(parseNumber(a.watchdog_total));
}
function getAchievements(){
    _fetch("GET", endpoint + "/resources/achievements", parseAchievements, errorHandler);
}
function parseAchievements(a){
    // to-be-added
}
function getPlayerStats(a){
    _fetch("GET", endpoint + "/player?key=" + getItem("apiKey") + "&uuid=" + a, function(b){
        "object"===typeof b.player?($data._default=b.player,getPlayerStatus(b.player.uuid)):errorHandler("Player has never played on Hypixel.");
    }, errorHandler);
}
function parsePlayerStats(a){
    console.log(a);
    clearErr();
    clearField();
    $lastLogin = a._default.lastLogin;
    $isOnline = a._recentgame.online;
    var b = a._default.prefix || a._default.rank || ("NONE" !== a._default.monthlyPackageRank ? a._default.monthlyPackageRank: !1) || a._default.newPackageRank || "DEFAULT";
    $("[class='Field.Main.PlayerName']").html(buildName(a._default.displayname, b));
    $("[class='Field.Main.Rank']").html(buildRank(b, a._default.rankPlusColor));
    $("[class='Field.Main.firstLogin']").text(buildTime(a._default.firstLogin));
    $("[class='Field.Main.lastLogin']").text(buildTime(a._default.lastLogin));
    $("[class='Field.Main.networkExp']").text(parseNumber(a._default.networkExp));
    $("[class='Field.Main.karma']").text(parseNumber(a._default.karma || 0));
    $("[class='Field.Main.achievementPoints']").text(parseNumber(a._default.achievementPoints));
    $("[class='Field.Main.UUID']").text(a._default.uuid);
    $("[class='Field.Main.mostRecentGameType']").text(getGame(a._recentgame.gameType));
    $("[class='Field.recentGame.gameType']").text(getGame(a._recentgame.gameType));
    $("[class='Field.recentGame.gameMode']").text(getGameMode(a._recentgame.gameType,a._recentgame.mode));
    $("[class='Field.recentGame.gameMap']").text(a._recentgame.map || "Unknown");
    $("[class='Field.networkExp.Level").text(getNetworkLevel(a._default.networkExp));
    $("[class='Field.networkExp.Experience']").text(parseNumber(a._default.networkExp));
    $("[class='Field.networkExp.expToNextLevel']").text(parseNumber(getLevelUpExp(getNetworkLevel(a._default.networkExp))));
    $.mobile.changePage("#stats:player");
}
function getPlayerStatus(a){
    _fetch("GET", endpoint + "/status?key=" + getItem("apiKey") + "&uuid=" + a, function(b) {
        $data._recentgame = b.session;
        parsePlayerStats($data);
    }, errorHandler);
}
function clearField(){
    $("[data-role='page']:not([id='stats:server']) .ui-field > p > small").each(function(){
        $(this).text("");
    });
}
function clearErr(){
    $("p[data-text-color='RED'] > small").each(function(){
        $(this).text("");
    });
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
    return (a = a.replace("§c[OWNER]", "<span data-text-color='" + getColor("OWNER") + "'>OWNER</span>")
    .replace("ADMIN", "<span data-text-color='" + getColor("OWNER") + "'>ADMIN</span>")
    .replace("GAME_MASTER", "<span data-text-color='" + getColor("GAME_MASTER") + "'>GM</span>")
    .replace("YOU", "<span data-text-color='" + getColor("YOU") + "'>You</span>")
    .replace("TUBER", "<span data-text-color='" + getColor("TUBER") + "'>Tuber</span>")
    .replace("VIP", "<span data-text-color='" + getColor("VIP") + "'>VIP</span>")
    .replace("MVP", "<span data-text-color='" + getColor("MVP") + "'>MVP</span>")
    .replace("SUPERSTAR", "<span data-text-color='" + getColor("SUPERSTAR") + "'>MVP</span>_PLUS_PLUS")
    .replace("DEFAULT", "<span data-text-color='" + getColor("DEFAULT") + "'>Default</span>")
    .replace(/_PLUS/g, "<span data-text-color='" + b + "'>+</span>"));
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
    a = addS("hour", addZero(Math.floor(a%864E5/36E5))) + ", " +addS("minute",addZero(Math.floor(a%36E5/6E4))) + ", "+addS("second",addZero(Math.floor(a%6E4/1E3))); c || (a=nHidden());
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
    return Math.round((Math.sqrt((2 * a) + 30625) / 50) - 2.5);
}
function getLevelUpExp(a){
    return a < 1 ? 10000 : 2500 * (a - 1) + 10000;
}
function getGame(a){
    return gameTypes[a] && gameTypes[a].name || "Not playing right now";
}
function getGameMode(a, b){
    return gameTypes[a] && gameTypes[a].modeNames && gameTypes[a].modeNames[b] || b;
}
$inputSettingsApiKey.on("input", function(){
    localStorage.setItem("apiKey", $inputSettingsApiKey.val());
});
$buttonSettingsSApiKey.click(function(){
    validateApiKeyRegex($inputSettingsApiKey.val())&&36===$inputSettingsApiKey.val().length?_fetch("GET",endpoint+"/key?key="+getItem("apiKey"),apikey_suc,apikey_err):apikey_err;
});
$("#lookUp").submit(function(a) {
    a.preventDefault();
    $("#popupiOS").popup("open");
    if (!/^[a-zA-Z0-9_]*$/gm.test($inputLookUpUUID.val()))
    return errorHandler("Player name must only contain letters, numbers and underscores!");
    getPlayerUUID();
    return !1;
});
setTimeout(getServerStats, 12e4);
setTimeout(getWatchdogStats, 12e4);
setInterval(setPlayTime);