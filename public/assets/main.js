if (window.location.hash) {
    window.location.replace("/");
}

$(document).ready(function() {
    getServerStats();
});

$("#lookUp").submit(function(e) {
    e.preventDefault();

    $("#popupiOS").popup("open");

    if (!/^[a-zA-Z0-9_]*$/gm.test($("[class='Input.lookUp.UUID']").val()))
    return showError({responseText: "0"});

    $.ajax({
        type: "POST",
        url: "/api",
        headers: {
            "X-Hypixel-Client": "1",
            "X-Hypixel-API-Key": getItem("apiKey")
        },
        data: {
            uuid: $("[class='Input.lookUp.UUID']").val()
        },
        success: parsePlayerStats,
        error: showError
    });

    return !1;
});

$("[class='Input.lookUp.apiKey']").val(getItem("apiKey"));
$("[class='Input.Settings.apiKey']").val(getItem("apiKey"));

$("[class='Input.Settings.apiKey']").keydown(function() {
    localStorage.setItem("apiKey", $("[class='Input.Settings.apiKey']").val());
});

$("[class='Input.Settings.apiKey']").keyup(function() {
    localStorage.setItem("apiKey", $("[class='Input.Settings.apiKey']").val());
});

function convertError(a){
    switch(a) {
        case "0":
            a = "<small>Player name must only contain letters, numbers and underscores!</small>";
            break;
        case "1":
            a = "<small>Either supplied player name or API key is incorrect.</small>";
            break;
        case "2":
            a = "<small>API key is either wrong or hasn't been set yet.</small>";
            break;
        case "3":
            a = "<small>Player does not exist.</small>";
            break;
        default:
            a = "<small>Unknown error occurred.</small>";
    }

    return a;
}

function showError(err) {
    $("[class='Text.lookUp.ErrorMessage']").html(convertError(err.responseText));
    $("#popupiOS").popup("close");
}

function getItem(a) {
    return localStorage.getItem(a);
}

function goTo (param) {
    $.mobile.changePage(param);
}

function buildRank (a, b) {
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

function buildPlayTime(a, b){
    var c = new Date(b-a);
    c = addS("day", c.getDay()) + ", " + addS("hour", c.getHours()) + ", " + addS("minute", c.getMinutes());
    
    if(b||a) c = nHidden();
    return c;
}

function getColor (a) {
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

function addZero(a){
    10 > a && (a="0" + a);
    return a;
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

function getGame (e) {
    switch (e) {
        case "HOUSING":
            e = "Housing";
            break;
        case "BEDWARS":
            e = "Bed Wars";
            break;
        case "SKYWARS":
            e = "Sky Wars";
            break;
        case "MCGO":
            e = "Cops and Crims";
            break;
        case "WALLS3":
            e = "Mega Walls";
            break;
        case "PIT":
            e = "The Hypixel Pit";
            break;
        case "UHC":
            e = "UHC Champions";
            break;
        case "SPEED_UHC":
            e = "Speed UHC";
            break;
        case "WOOL_GAMES":
            e = "Wool Wars";
            break;
        case "MURDER_MYSTERY":
            e = "Murder Mystery";
            break;
        case "PROTOTYPE":
            e = "Prototype";
            break;
        case "TNTGAMES":
            e = "The TNT Games";
            break;
        case "ARCADE":
            e = "Arcade Games";
            break;
        case "BUILD_BATTLE":
            e = "Build Battle";
            break;
        case "DUELS":
            e = "Duels";
            break;
        case "LEGACY":
            e = "Classic Games";
            break;
        case "SUPER_SMASH":
            e = "Smash Heroes";
            break;
        case "BATTLEGROUND":
            e = "Warlords";
            break;
        case "SURVIVAL_GAMES":
            e = "Blitz SG";
            break;
        case "QUAKECRAFT":
            e = "Quakecraft";
            break;
        case "ARENA":
            e = "Arena Brawl";
            break;
        case "VAMPIREZ":
            e = "VampireZ";
            break;
        case "GINGERBREAD":
            e = "Turbo Kart Racers";
            break;
        case "PAINTBALL":
            e = "Paintball";
            break;
        case "WALLS":
            e = "The Walls";
            break;
        default:
            e = "Minigames";
    }
    return e;
}

function reload () {
    window.location.href = "/";
}

function getServerStats() {
    $.ajax({
        type: "GET",
        url: "https://hypixel.krashnz.com/api/v3/stats",
        success: parseServerStats,
        error: showError
    });
}

function parseServerStats(a){
    console.log(a);
    $("[class='Field.Server.currentPlayers']").text(parseNumber(a.stats[0].value));
}

function parsePlayerStats(a){
    console.log(a);
    var b = a.prefix || a.rank || ("NONE" !== a.monthlyPackageRank ? a.monthlyPackageRank: !1) || a.newPackageRank || "DEFAULT";
    $("[class='Field.Main.PlayerName']").html(buildName(a.displayname, b));
    $("[class='Field.Main.Rank']").html(buildRank(b, a.rankPlusColor));
    $("[class='Field.Main.firstLogin']").text(buildTime(a.firstLogin));
    $("[class='Field.Main.lastLogin']").text(buildTime(a.lastLogin));
    $("[class='Field.Main.mostRecentGameType']").text(getGame(a.mostRecentGameType));
    $("[class='Field.Main.timePlaying']").text(buildPlayTime(a.lastLogin, Date.now()));
    $("[class='Field.Main.networkExp']").text(parseNumber(a.networkExp));
    $("[class='Field.Main.karma']").text(parseNumber(a.karma));
    $("[class='Field.Main.achievementPoints']").text(parseNumber(a.achievementPoints));
    $("[class='Field.Main.UUID']").text(a.uuid);
    goTo("#stats:player");
}

/* -- Refresh server stats -- */
setTimeout(getServerStats, 12e4);