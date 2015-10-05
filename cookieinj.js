/*
    Copyright 2015 lngost
    See <https://github.com/lngost>
    
    License
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


round = 1;
mousehold = 0; // 0 - no hold, 1 - hold

tmpcookie = {
    "name": "",
    "value": "",
    "domain": "",
    "path": "",
    "secure": false,
    "httpOnly": false,
    "expirationDate": 0
};

trptr = null;

function tmpcookieReset() {
    tmpcookie = {
        "name": "",
        "value": "",
        "domain": "",
        "path": "",
        "secure": false,
        "httpOnly": false,
        "expirationDate": 0
    };
}

function trptrReset() {
    trptr = null;
}

function editenabled() {
    var inurl = $("#editin-url");
    var inexpire = $("#editin-expire");
    var indomain = $("input[name='editin-cookiedm']:first");
    var inpath = $("input[name='editin-path']:first");
    var insecure = $("input[name='editck-secure']:first");
    var inhttponly = $("input[name='editck-httponly']:first");
    var coname = $("input[name='editin-name']:first");
    var covalue = $("input[name='editin-value']:first");
    
    $("#edit-cookie").prop("disabled", true);
    $("#edit-save").prop("disabled", false);
    $("#edit-cancel").prop("disabled", false);
    $("#edit-delete").prop("disabled", false);
    $("#edit-date").prop("disabled", false);
    indomain.prop("readonly", false);
    inpath.prop("readonly", false);
    insecure.prop("disabled", false);
    inhttponly.prop("disabled", false);
    coname.prop("readonly", false);
    covalue.prop("readonly", false);
}

function editdisabled() {
    var inurl = $("#editin-url");
    var inexpire = $("#editin-expire");
    var indomain = $("input[name='editin-cookiedm']:first");
    var inpath = $("input[name='editin-path']:first");
    var insecure = $("input[name='editck-secure']:first");
    var inhttponly = $("input[name='editck-httponly']:first");
    var coname = $("input[name='editin-name']:first");
    var covalue = $("input[name='editin-value']:first");
    
    $("#edit-cookie").prop("disabled", false);
    $("#edit-save").prop("disabled", true);
    $("#edit-cancel").prop("disabled", true);
    $("#edit-delete").prop("disabled", true);
    $("#edit-date").prop("disabled", true);
    indomain.prop("readonly", true);
    inpath.prop("readonly", true);
    insecure.prop("disabled", true);
    inhttponly.prop("disabled", true);
    coname.prop("readonly", true);
    covalue.prop("readonly", true);
}

function cookieinput() {
    $("#input-date").prop("disabled", false);
    var indomain = $("input[name='input-cookiedm']:first").val();
    var inpath = $("input[name='input-path']:first").val();
    var insecure = $("input[name='check-secure']:first").is(":checked");
    
    $("#input-url").html("http" + (insecure ? "s" : "") + "://" + indomain + inpath);
}


function inject() {
    var date = new Date();
    var inurl = $("#input-url").text();
    var inexpire = $("#input-expire").text();
    var indomain = $("input[name='input-cookiedm']:first").val();
    var inpath = $("input[name='input-path']:first").val();
    var insecure = $("input[name='check-secure']:first").is(":checked");
    var inhttponly = $("input[name='check-httponly']:first").is(":checked");
    var incookies = $("textarea[name='input-cookies']:first").val();
    var coexp = Date.parse(inexpire) / 1000;
    
    incookies = incookies.replace(/\s/g, "");
    if(incookies.length <= 0) {
        return;
    }
    var arrcookies = incookies.split(";");
    
    var arrlength = arrcookies.length;
    $("#total-injects-count").text("Total " + arrlength + " input cookies.");
    for(var i=0; i<arrlength; ++i) {
        var coname = arrcookies[i].split("=")[0];
        var covalue = arrcookies[i].split("=")[1];
        
        chrome.cookies.set({
            url: inurl,
            name: coname,
            value: covalue,
            domain: indomain,
            path: inpath,
            secure: insecure,
            httpOnly: inhttponly,
            expirationDate: coexp
        });
    }
    
    // check if cookies were injected successfully or not
    var table = $("#div-info tbody");
    table.empty();
    var resultdate = new Date();
    for(var i=0; i<arrlength; ++i) {
        var coname = arrcookies[i].split("=")[0];
        
        chrome.cookies.get({
            url: inurl,
            name: coname
        }, function(cookie) {
            resultdate.setTime(parseInt(cookie.expirationDate*1000));
            
            table.append("\n\
                <tr>\n\
                    <td>" + cookie.domain + "</td>\n\
                    <td>" + cookie.path + "</td>\n\
                    <td>" + cookie.name + "</td>\n\
                    <td>" + resultdate + "</td>\n\
                    <td>" + (cookie.secure ? "<span class='label label-success'>s</span> " : "")
                          + (cookie.httpOnly ? "<span class='label label-info'>h</span>" : "") + "</td>\n\
                    <td>" + cookie.value + "</td>\n\
            </tr>");
        });
    }
}

function inclear() {
    var inurl = $("#input-url");
    var indomain = $("input[name='input-cookiedm']:first");
    var inpath = $("input[name='input-path']:first");
    var insecure = $("input[name='check-secure']:first");
    var inhttponly = $("input[name='check-httponly']:first");
    var incookies = $("textarea[name='input-cookies']:first");
    var incount = $("#total-injects-count");
    var table = $("#div-info tbody");
    
    inurl.empty();
    indomain.val("");
    inpath.val("/");
    insecure.prop("checked", false);
    inhttponly.prop("checked", false);
    incookies.val("");
    incount.text("");
    table.empty();
    
    indomain.focus();
}

function search() {
    var indomain = $("input[name='input-search']:first").val();
    var table = $("#search-result tbody");
    table.empty();
    
    chrome.cookies.getAll({
        
    }, function(cookies) {
        if(cookies.length <= 0) {
            $("#badge-numfound").text(0);
            return;
        }
        
        var numfound = 0;
        for(var i=0; i<cookies.length; ++i) {
            if(cookies[i].domain.indexOf(indomain) >= 0) {
                ++numfound;
                table.append("\n\
                    <tr class='tr-search'>\n\
                        <td>" + cookies[i].domain + "</td>\n\
                        <td>" + cookies[i].path + "</td>\n\
                        <td>" + cookies[i].name + "</td>\n\
                        <td>" + (cookies[i].secure ? "<span class='label label-success'>s</span> " : "")
                              + (cookies[i].httpOnly ? "<span class='label label-info'>h</span>" : "") + "</td>"
                 + "</tr>");
            }
        }
        $("#badge-numfound").text(numfound);
        
        $("tr.tr-search").each(function() {
            $(this).click(cookiedetail);
        });
        
    });
}

function cookiedetail() {
    $("tr.tr-search").each(function() {
        $(this).removeClass("success");
    });
    trptr = $(this);
    trptr.addClass("success");
    $("#edit-cookie").prop("disabled", false);
    var date = new Date();
    var inurl = $("#editin-url");
    var inexpire = $("#editin-expire");
    var indomain = $("input[name='editin-cookiedm']:first");
    var inpath = $("input[name='editin-path']:first");
    var insecure = $("input[name='editck-secure']:first");
    var inhttponly = $("input[name='editck-httponly']:first");
    var coname = $("input[name='editin-name']:first");
    var covalue = $("input[name='editin-value']:first");
    
    var filterDomain = trptr.children("td:eq(0)").text();
    var filterPath = trptr.children("td:eq(1)").text();
    var filterName = trptr.children("td:eq(2)").text();
    
    chrome.cookies.getAll({
        domain: filterDomain,
        path: filterPath,
        name: filterName
    }, function(cookies) {
        if(cookies.length <= 0) {
            return;
        }
                
        var cook = cookies[0];
        date.setTime(parseInt(cook.expirationDate*1000));
        inexpire.html(date);
        $("#edit-date").show();
        indomain.val(cook.domain);
        inpath.val(cook.path);
        insecure.prop("checked", cook.secure);
        inhttponly.prop("checked", cook.httpOnly);
        coname.val(cook.name);
        covalue.val(cook.value);
        inurl.html("http" + (cook.secure ? "s" : "") + "://" + cook.domain + cook.path);
        
        tmpcookie = {
            "name": cook.name,
            "value": cook.value,
            "domain": cook.domain,
            "path": cook.path,
            "secure": cook.secure,
            "httpOnly": cook.httpOnly,
            "expirationDate": cook.expirationDate
        };
    });
    
    var edgebottom = 166; // this value depends on table height.
    var edgetop = 49; // this value depends on table height.
    var diff = 0;
    var curscrolltop = $("#table-search").scrollTop();
    if(trptr.position().top > edgebottom) {
        diff = trptr.position().top - edgebottom;
        $("#table-search").scrollTop(curscrolltop + diff);
    } else if(trptr.position().top < edgetop) {
        diff = trptr.position().top - edgetop;
        $("#table-search").scrollTop(curscrolltop + diff);
    }
}

function editinput() {
    var indomain = $("input[name='editin-cookiedm']:first").val();
    var inpath = $("input[name='editin-path']:first").val();
    var insecure = $("input[name='editck-secure']:first").is(":checked");
    
    $("#editin-url").html("http" + (insecure ? "s" : "") + "://" + indomain + inpath);
}

function cookieremove(cookie) {
    var inurl = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
    chrome.cookies.remove({
        url: inurl,
        name: cookie.name
    });
}

function editsave() {
    $(".calen").hide();
    $(".calen-cate").hide();

    var inurl = $("#editin-url");
    var inexpire = $("#editin-expire");
    var indomain = $("input[name='editin-cookiedm']:first");
    var inpath = $("input[name='editin-path']:first");
    var insecure = $("input[name='editck-secure']:first");
    var inhttponly = $("input[name='editck-httponly']:first");
    var coname = $("input[name='editin-name']:first");
    var covalue = $("input[name='editin-value']:first");
    var coexp = Date.parse(inexpire.text()) / 1000;
    
    chrome.cookies.set({
            url: inurl.text(),
            name: coname.val(),
            value: covalue.val(),
            domain: indomain.val(),
            path: inpath.val(),
            secure: insecure.is(":checked"),
            httpOnly: inhttponly.is(":checked"),
            expirationDate: coexp
    });
    
    // check if cookie was set successfully
    chrome.cookies.getAll({
        domain: indomain.val(),
        path: inpath.val(),
        name: coname.val()
    }, function(cookies) {
        if(cookies.length <= 0) {
            return;
        }
        
        var cookie = cookies[0];
        if(cookie.domain === tmpcookie.domain 
            && cookie.path === tmpcookie.path
            && cookie.name === tmpcookie.name) {

            trptr.html("<td>" + cookie.domain + "</td>\n\
                        <td>" + cookie.path + "</td>\n\
                        <td>" + cookie.name + "</td>\n\
                        <td>" + (cookie.secure ? "<span class='label label-success'>s</span> " : "")
                              + (cookie.httpOnly ? "<span class='label label-info'>h</span>" : "") + "</td>");
        
            trptr.trigger("click");
        } else {
            var content = "\n\
                    <tr class='tr-search'>\n\
                        <td>" + cookie.domain + "</td>\n\
                        <td>" + cookie.path + "</td>\n\
                        <td>" + cookie.name + "</td>\n\
                        <td>" + (cookie.secure ? "<span class='label label-success'>s</span> " : "")
                              + (cookie.httpOnly ? "<span class='label label-info'>h</span>" : "") + "</td>"
                 + "</tr>";
            $(content).insertAfter(trptr);
            trptr.next().click(cookiedetail);
            trptr.next().trigger("click");
            
        }
    });
    
    editdisabled();
}

function editcancel() {
    var inurl = $("#editin-url");
    var inexpire = $("#editin-expire");
    var indomain = $("input[name='editin-cookiedm']:first");
    var inpath = $("input[name='editin-path']:first");
    var insecure = $("input[name='editck-secure']:first");
    var inhttponly = $("input[name='editck-httponly']:first");
    var coname = $("input[name='editin-name']:first");
    var covalue = $("input[name='editin-value']:first");
    
    editdisabled();
    $(".calen").hide();
    $(".calen-cate").hide();
    var fullurl = "http" + (tmpcookie.secure ? "s" : "") + "://" + tmpcookie.domain + tmpcookie.path;
    var date = new Date();
    date.setTime(parseInt(tmpcookie.expirationDate*1000));
    
    inurl.html(fullurl);
    inexpire.html(date);
    indomain.val(tmpcookie.domain);
    inpath.val(tmpcookie.path);
    insecure.prop("checked", tmpcookie.secure);
    inhttponly.prop("checked", tmpcookie.httpOnly);
    coname.val(tmpcookie.name);
    covalue.val(tmpcookie.value);
}

function editdelete() {    
    cookieremove(tmpcookie);
    trptr.hide();
    trptr.removeClass("success");
    trptrReset();
    
    var inurl = $("#editin-url");
    var inexpire = $("#editin-expire");
    var indomain = $("input[name='editin-cookiedm']:first");
    var inpath = $("input[name='editin-path']:first");
    var insecure = $("input[name='editck-secure']:first");
    var inhttponly = $("input[name='editck-httponly']:first");
    var coname = $("input[name='editin-name']:first");
    var covalue = $("input[name='editin-value']:first");
    
    editdisabled();
    $(".calen").hide();
    $(".calen-cate").hide();
    $("#edit-cookie").prop("disabled", true);
    
    inurl.empty();
    inexpire.empty();
    $("#edit-date").hide();
    indomain.val("");
    inpath.val("");
    insecure.prop("checked", false);
    inhttponly.prop("checked", false);
    coname.val("");
    covalue.val("");
}

function catechange() {
    $(this).hide().removeClass("onshow");
    if($(this).attr("data-cate") === "second") {
        $(this).siblings("button.calen-cate:first").addClass("onshow").show();
    } else {
        $(this).next("button.calen-cate").addClass("onshow").show();
    }
}

function datepick(id) {
    if($(id).is(":hidden")) {
        $(id + " button.calen-cate:eq(0)").show();
        $(id).show();
    } else {
        $(id).hide();
        $(id + " button.calen-cate").hide();
    }
}

function calenchange() {
    mousehold = 1;
    var calen = $(this).parents("div.calen:first").prop("id");
    var field = null;
    if(calen === "dpicker1") {
        field = $("#input-expire");
    } else if(calen === "dpicker2") {
        field = $("#editin-expire");
    } else {
        return;
    }
    var category = $(this).siblings("button.calen-cate.onshow:first").attr("data-cate");
    var date = new Date();
    date.setTime(Date.parse(field.text()));
    
    if($(this).is("button.calen-minus")) {
        if(category === "year") {
            date.setFullYear(date.getFullYear() - 1);
        } else if(category === "month") {
            date.setMonth(date.getMonth() - 1);
        } else if(category === "date") {
            date.setDate(date.getDate() - 1);
        } else if(category === "hour") {
            date.setHours(date.getHours() - 1);
        } else if(category === "minute") {
            date.setMinutes(date.getMinutes() - 1);
        } else if(category === "second") {
            date.setSeconds(date.getSeconds() - 1);
        } else {
            return;
        }
    } else if($(this).is("button.calen-plus")) {
        if(category === "year") {
            date.setFullYear(date.getFullYear() + 1);
        } else if(category === "month") {
            date.setMonth(date.getMonth() + 1);
        } else if(category === "date") {
            date.setDate(date.getDate() + 1);
        } else if(category === "hour") {
            date.setHours(date.getHours() + 1);
        } else if(category === "minute") {
            date.setMinutes(date.getMinutes() + 1);
        } else if(category === "second") {
            date.setSeconds(date.getSeconds() + 1);
        } else {
            return;
        }
    } else {
        return;
    }
    
    field.text(date);
    
    var ptr = $(this);
    var delay = 100;
    if(round === 1) {
        delay = 800;
        ++round;
    }
    setTimeout(function() {
        if(mousehold && ptr.is(":focus")) {
            ptr.trigger("mousedown");
        }
    }, delay);
}

$(document).ready(function() {
    $("#row-inject").show();
    $("#row-search").hide();
    $("#edit-date").hide();
    $(".calen").hide();
    $(".calen-cate").hide();
    
    var date = new Date();
    date.setTime(parseInt(date.getTime() + 365*24*3600*1000));
    $("#input-expire").text(date);

    $("#tab-inject").click(function() {
        $("#tab-search").removeClass("active");
        $("#tab-inject").addClass("active");
        $("#row-search").hide();
        $("#row-inject").show();
        $("input[name='input-cookiedm']:first").focus();
    });
    
    $("#tab-search").click(function() {
        $("#tab-inject").removeClass("active");
        $("#tab-search").addClass("active");
        $("#row-inject").hide();
        $("#row-search").show();
        $("input[name='input-search']:first").focus();
    });
    
    $(".calen-cate").click(catechange);
    $(".calen-minus").mousedown(calenchange);
    $(".calen-plus").mousedown(calenchange);
    $(".calen-minus").mouseup(function() { mousehold = 0; round = 1; });
    $(".calen-plus").mouseup(function() { mousehold = 0; round = 1; });
    $("#input-date").click(function() {
        datepick("#dpicker1");
    });
    $("#edit-date").click(function() {
        datepick("#dpicker2");
    });
    
    $("input[name='input-cookiedm']:first").keyup(cookieinput);
    $("input[name='input-path']:first").keyup(cookieinput);
    $("input[name='check-secure']:first").click(cookieinput);
    $("#inject").click(inject);
    $("#btn-inclear").click(inclear);
    $("#search").click(search);
    $("input[name='input-search']:first").keyup(search);
    
    $("#edit-cookie").click(editenabled);
    $("#edit-save").click(editsave);
    $("#edit-cancel").click(editcancel);
    $("#edit-delete").click(editdelete);
    $("input[name='editin-cookiedm']:first").keyup(editinput);
    $("input[name='editin-path']:first").keyup(editinput);
    $("input[name='editck-secure']:first").click(editinput);
});


