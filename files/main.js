(function(){
var KasperskyLab = {SIGNATURE:"7D8B79A2-8974-4D7B-A76A-F4F29624C06BpMvMjSkRkTvBUokeeKxddY3385gGjo5v-ebXJASDfkycpPZVK32tXqCfwbAzZnJns1zfrO5GAKTrRXFDKte2gg",PREFIX:"/",INJECT_ID:"FD126C42-EBFA-4E12-B309-BB3FDD723AC1",RESOURCE_ID:"E3E8934C-235A-4B0E-825A-35A08381A191",IsWebExtension: function(){return false;}}; var KasperskyLab = (function IeJsonMain(context) 
{
    function GetClass(obj) {
        if (typeof obj === "undefined")
            return "undefined";
        if (obj === null)
            return "null";
        return Object.prototype.toString.call(obj)
            .match(/^\[object\s(.*)\]$/)[1];
    }
    var exports = {}, undef;
    function ObjectToJson(object) {
        if (object === null || object === Infinity || object === -Infinity || object === undef)
            return "null";
        var className = GetClass(object);
        if (className === "Boolean") {
            return "" + object;
        } else if (className === "Number") {
            return window.isNaN(object) ? "null" : "" + object;
        } else if (className === "String") {
            var escapedStr = "" + object;
            return "\"" + escapedStr.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"") + "\"";
        }
        if (typeof object === "object") {
            if (!ObjectToJson.check) ObjectToJson.check = [];
            for (var i=0, chkLen=ObjectToJson.check.length ; i<chkLen ; ++i) {
                if (ObjectToJson.check[i] === object) {
                    throw new TypeError();
                }
            }
            ObjectToJson.check.push(object);
            var str = '';
            if (className === "Array" || className === "Array Iterator") {
                for (var index = 0, length = object.length; index < length; ++index) {
                    str += ObjectToJson(object[index]) + ',';
                }
                ObjectToJson.check.pop();
                return "["+str.slice(0,-1)+"]";
            } else {
                for (var property in object) {
                    if (object.hasOwnProperty(property)) {
                        str += '"' + property + '":' + ObjectToJson(object[property]) + ',';
                    }
                }
                ObjectToJson.check.pop();
                return "{"+str.slice(0,-1)+"}";
            }
        }
        return undef;
    }
    exports.stringify = function stringify(source) {
        return ObjectToJson(source);
    };
    var parser = {
        source : null,
        grammar : /^[\x20\t\n\r]*(?:([,:\[\]{}]|true|false|null)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|"((?:[^\r\n\t\\\"]|\\(?:["\\\/trnfb]|u[0-9a-fA-F]{4}))*)")/,
        ThrowError : function ThrowError() {
            throw new SyntaxError('JSON syntax error');
        },
        NextToken : function NextToken(token) {
            this.source = token.input.slice(token[0].length);
            return this.grammar.exec(this.source);
        },
        ParseArray : function ParseArray(){
            var token = this.grammar.exec(this.source),
                parseItem = token && token[1] !== ']',
                result = [];
            for(;;token = this.NextToken(token)) {
                if (!token)
                    this.ThrowError();
                if (parseItem) {
                    result.push(this.ParseValue(token));
                    token = this.grammar.exec(this.source);
                } else {
                    if (token[1]) {
                        if (token[1] === ']') {
                            break;
                        } else if (token[1] !== ',') {
                            this.ThrowError();
                        }
                    } else {
                        this.ThrowError();
                    }
                }
                parseItem = !parseItem;
            }
            return result;
        },
        ParseObject : function ParseObject(){
            var propertyName, parseProperty = true, result = {};
            for(var token = this.grammar.exec(this.source);;token = this.NextToken(token)) {
                if (!token)
                    this.ThrowError();
                if (parseProperty) {
                    if (token[1] && token[1] === '}') {
                        break;
                    } else if (token[1] || token[2] || !token[3]) {
                        this.ThrowError();
                    }
                    propertyName = token[3];
                    token = this.NextToken(token);
                    if (!token || !token[1] || token[1] !== ':')
                        this.ThrowError();
                    parseProperty = false;
                } else {
                    if (!propertyName)
                        this.ThrowError();
                    result[ propertyName ] = this.ParseValue(token);
                    token = this.NextToken(this.grammar.exec(this.source));
                    if (token[1]) {
                        if (token[1] === '}') {
                            break;
                        } else if (token[1] !== ',') {
                            this.ThrowError();
                        }
                    } else {
                        this.ThrowError();
                    }
                    propertyName = undef;
                    parseProperty = true;
                }
            }
            return result;
        },
        ParseValue : function ParseValue(token){
            if (token[1]) {
                switch (token[1]){
                    case '[' :
                        this.source = this.source.slice(token[0].length);
                        return this.ParseArray();
                    case '{' :
                        this.source = this.source.slice(token[0].length);
                        return this.ParseObject();
                    case 'true' :
                        return true;
                    case 'false' :
                        return false;
                    case 'null' :
                        return null;
                    default:
                        this.ThrowError();
                }
            } else if (token[2]) {
                return  +token[2];
            }
            return token[3].replace(/\\(?:u(.{4})|(["\\\/'bfnrt]))/g, function replaceCallback(substr, utfCode, esc){
                if(utfCode)
                {
                    return String.fromCharCode(parseInt(utfCode, 16));
                }
                else
                {
                    switch(esc) {
                        case 'b': return '\b';
                        case 'f': return '\f';
                        case 'n': return '\n';
                        case 'r': return '\r';
                        case 't': return '\t';
                        default:
                            return esc;
                    }
                }
            });
        },
        Parse : function Parse(str) {
            if ('String' !== GetClass(str))
                throw new TypeError();
            this.source = str;
            var token = this.grammar.exec(this.source);
            if (!token)
                this.ThrowError();
            return this.ParseValue(token);
        }
    };
    exports.parse = function parse(source) {
        return parser.Parse(source);
    };
    var originStringify = JSON.stringify;
    function StringifyWrapper(source)
    {
        if (Array.prototype.toJSON || String.prototype.toJSON)
            return exports.stringify(source);
        return originStringify(source);
    }
    context["JSONStringify"] = JSON.stringify ? StringifyWrapper : exports.stringify;
    context["JSONParse"] = JSON.parse || exports.parse;
    return context;
})(KasperskyLab || {});
(function CommonMain(ns)
{
    ns.XMLHttpRequest = window.XMLHttpRequest;
    ns.XDomainRequest = window.XDomainRequest;
    ns.XMLHttpRequestOpen = window.XMLHttpRequest && window.XMLHttpRequest.prototype.open;
    ns.XMLHttpRequestSend = window.XMLHttpRequest && window.XMLHttpRequest.prototype.send;
    ns.XMLHttpRequestSetRequestHeader = window.XMLHttpRequest && window.XMLHttpRequest.prototype.setRequestHeader;
    ns.EmptyFunc = function EmptyFunc()
    {
    };
    ns.MaxRequestDelay = 2000;
    ns.Log = function Log(message)
    {
        try
        {
            if (!message)
                return;
            console && console.log && console.log(message); 
        }
        catch (e)
        {} 
    };
    ns.SessionLog = ns.Log;
    ns.SessionError = ns.Log;
    function GetHostAndPort(url)
    {
        var hostBeginPos = url.indexOf("//");
        if (hostBeginPos === -1)
        {
            url = document.baseURI || ""; 
            hostBeginPos = url.indexOf("//");
            if (hostBeginPos === -1)
                return "";
        }
        hostBeginPos += 2;
        var hostEndPos = url.indexOf("/", hostBeginPos);
        if (hostEndPos === -1)
            hostEndPos = url.length;
        var originParts = url.substring(0, hostEndPos).split("@");
        var origin = originParts.length > 1 ? originParts[1] : originParts[0];
        return origin[0] === "/" ? document.location.protocol + origin : origin;
    }
    ns.IsCorsRequest = function IsCorsRequest(url, initiator)
    {
        url = typeof url !== "string" ? url.toString() : url; 
        var urlOrigin = GetHostAndPort(url);
        var initiatorOrigin = GetHostAndPort(initiator);
        return Boolean(urlOrigin) && Boolean(initiatorOrigin) && urlOrigin !== initiatorOrigin;
    };
    ns.GetResourceSrc = function GetResourceSrc(resourceName)
    {
        return ns.GetBaseUrl() + ns.RESOURCE_ID + resourceName;
    };
    ns.IsRelativeTransport = function IsRelativeTransport()
    {
        return ns.PREFIX === "/";
    };
    ns.GetBaseUrl = function GetBaseUrl()
    {
        if (!ns.IsRelativeTransport())
            return ns.PREFIX;
        return document.location.protocol + "//" + document.location.host + "/";
    };
    ns.AddEventListener = function AddEventListener(element, name, func)
    {
        if (typeof element.addEventListener === "function")
        {
            element.addEventListener(name, 
                function EventListenerCallback(e) 
                {
                    try
                    {
                        func(e || window.event);
                    }
                    catch (ex)
                    {
                        ns.SessionError(ex);
                    }
                }, 
                true);
        }
        else
        {
            element.attachEvent("on" + name, 
                function EventListenerCallback(e)
                {
                    try
                    {
                        func.call(element, e || window.event);
                    }
                    catch (ex)
                    {
                        ns.SessionError(ex);
                    }
                });
        }
    };
    ns.AddRemovableEventListener = function AddRemovableEventListener(element, name, func)
    {
        if (element.addEventListener)
            element.addEventListener(name, func, true);
        else
            element.attachEvent("on" + name, func);
    };
    ns.RunModule = function RunModule(func, timeout)
    {
        if (document.readyState === "loading")
        {
            if (timeout)
                ns.SetTimeout(func, timeout);
            var delayFunc = function DelayFunc() { ns.SetTimeout(func, 0); };
            if (document.addEventListener)
                ns.AddEventListener(document, "DOMContentLoaded", delayFunc);
            ns.AddEventListener(window, "load", delayFunc);
        }
        else
        {
            try
            {
                func();
            }
            catch (e)
            {
                ns.SessionError(e);
            }
        }
    };
    ns.RemoveEventListener = function RemoveEventListener(element,  name, func)
    {
        if (element.removeEventListener)
            element.removeEventListener(name, func, true);
        else
            element.detachEvent("on" + name, func);
    };
    var oldSetTimeout = setTimeout;
    ns.SetTimeout = function SetTimeout(func, timeout)
    {
        return oldSetTimeout(function TimerCallback()
            {
                try
                {
                    func();
                }
                catch (e)
                {
                    ns.SessionError(e);
                }
            },
            timeout);
    };
    var oldSetInterval = setInterval;
    ns.SetInterval = function SetInterval(func, interval)
    {
        return oldSetInterval(function IntervalCallback()
            {
                try
                {
                    func();
                }
                catch (e)
                {
                    ns.SessionError(e);
                }
            },
            interval);
    };
    function InsertStyleRule(style, rule)
    {
        if (style.styleSheet)
        {
            style.styleSheet.cssText += rule + "\n";
        }
        else
        {
            style.appendChild(document.createTextNode(rule));
            ns.SetTimeout(function TimerCallback()
                {
                    if (!style.sheet)
                        return;
                    var rules = style.sheet.cssRules || style.sheet.rules;
                    if (rules && rules.length === 0)
                        style.sheet.insertRule(rule);
                }, 500);
        }
    }
    function AddDocumentStyles(document, rules)
    {
        if (typeof rules !== "object" || rules.constructor !== Array)
            return [];
        var styles = [];
        for (var i = 0, len = rules.length; i < len;)
        {
            var style = document.createElement("style");
            style.type = "text/css";
            style.setAttribute("nonce", ns.ContentSecurityPolicyNonceAttribute);
            for (var n = 0; n < 4 && i < len; ++n, ++i)
            {
                var rule = rules[i];
                if (document.querySelectorAll)
                {
                    InsertStyleRule(style, rule);
                }
                else
                {
                    var styleBegin = rule.lastIndexOf("{");
                    if (styleBegin === -1)
                        continue;
                    var styleText = rule.substr(styleBegin);
                    var selectors = rule.substr(0, styleBegin).split(",");
                    if (style.styleSheet)
                    {
                        var cssText = "";
                        for (var j = 0; j !== selectors.length; ++j)
                            cssText += selectors[j] + styleText + "\n";
                        style.styleSheet.cssText += cssText;
                    }
                    else
                    {
                        for (var k = 0; k !== selectors.length; ++k)
                            style.appendChild(document.createTextNode(selectors[k] + styleText));
                    }
                }
            }
            if (document.head)
                document.head.appendChild(style);
            else
                document.getElementsByTagName("head")[0].appendChild(style);
            styles.push(style);
        }
        return styles;
    }
    ns.AddStyles = function AddStyles(rules)
    {
        return AddDocumentStyles(document, rules);
    };
    ns.GetCurrentTime = function GetCurrentTime()
    {
        try
        {
            var date = new Date();
            if (date && date.getTime)
                return date.getTime();
            throw new Error("Cannot call getTime for date: " + date);
        }
        catch (e)
        {
            ns.SessionError(e);
            return 0;
        }
    };
    ns.GetPageScroll = function GetPageScroll()
    {
        return {
                left: (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft,
                top: (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop
            };
    };
    ns.GetPageHeight = function GetPageHeight()
    {
        return document.documentElement.clientHeight || document.body.clientHeight;
    };
    ns.GetPageWidth = function GetPageWidth()
    {
        return document.documentElement.clientWidth || document.body.clientWidth;
    };
    ns.IsDefined = function IsDefined(variable)
    {
        return typeof variable !== "undefined";
    };
    ns.StopProcessingEvent = function StopProcessingEvent(evt)
    {
        if (evt.preventDefault)
            evt.preventDefault();
        else
            evt.returnValue = false;
        if (evt.stopPropagation)
            evt.stopPropagation();
        if (ns.IsDefined(evt.cancelBubble))
            evt.cancelBubble = true;
    };
    ns.ToBase64 = function ToBase64(value)
    {
        if (ns.IsDefined(window.btoa))
            return btoa(value);
        var Base64Alphabit = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var plain = value;
        var padLength = 0;
        if (plain.length % 3)
        {
            padLength = 3 - (plain.length % 3);
            for (var j = 0; j < padLength; ++j)
                plain += "\0";
        }
        var result = "";
        for (var i = 0; i < plain.length; i += 3)
        {
            var byte1 = plain.charCodeAt(i);
            var byte2 = plain.charCodeAt(i + 1);
            var byte3 = plain.charCodeAt(i + 2);
            var temp = (byte1 << 16) | (byte2 << 8) | byte3;
            var sixBit1 = (temp >> 18) & 0x3f;
            var sixBit2 = (temp >> 12) & 0x3f;
            var sixBit3 = (temp >> 6) & 0x3f;
            var sixBit4 = temp & 0x3f;
            result += Base64Alphabit.charAt(sixBit1) + Base64Alphabit.charAt(sixBit2) + Base64Alphabit.charAt(sixBit3) + Base64Alphabit.charAt(sixBit4);
        }
        if (padLength > 0)
        {
            result = result.slice(0, result.length - padLength);
            for (var k = 0; k < padLength; ++k)
                result += "=";
        }
        return result;
    };
    ns.StartLocationHref = document.location.href;
    ns.IsTopLevel = window && window === window.top;
    ns.GetPageStartTime = function GetPageStartTime()
    {
        return window && window.performance && window.performance.timing && window.performance.timing.domContentLoadedEventStart
            ? window.performance.timing.domContentLoadedEventStart
            : 0;
    };
    return ns;
})(KasperskyLab);
(function CommonMutation(ns)
{
    function IsElementNode(node)
    {
        return node.nodeType === 1; 
    }
    function IsNodeContainsElementWithTag(node, observeTag)
    {
        try
        {
            return observeTag === "*" || (IsElementNode(node) && ((node.tagName && node.tagName.toLowerCase() === observeTag) || node.getElementsByTagName(observeTag).length > 0));
        }
        catch (e)
        {
            return false;
        }
    }
    function MutationChangeObserver(observeTag)
    {
        var m_observer = null;
        var m_callback = null;
        var m_functionCheckInteresting = observeTag ? function functionCheckInteresting(node) { return IsNodeContainsElementWithTag(node, observeTag); } : IsElementNode;
        function ProcessNodeList(nodeList)
        {
            for (var i = 0; i < nodeList.length; ++i)
            {
                if (m_functionCheckInteresting(nodeList[i]))
                    return true;
            }
            return false;
        }
        function ProcessDomChange(records)
        {
            try
            {
                if (!m_callback)
                    return;
                for (var i = 0; i < records.length; ++i)
                {
                    var record = records[i];
                    if ((record.addedNodes.length && ProcessNodeList(record.addedNodes))
                        || (record.removedNodes.length && ProcessNodeList(record.removedNodes)))
                    {
                        m_callback();
                        return;
                    }
                }
            }
            catch (e)
            {
                ns.SessionError(e);
            }
        }
        this.Start = function Start(callback)
        {
            m_callback = callback;
            m_observer = new MutationObserver(ProcessDomChange);
            m_observer.observe(document, { childList: true, subtree: true });
        };
        this.Stop = function Stop()
        {
            m_observer.disconnect();
            m_callback = null;
        };
    }
    function DomEventsChangeObserver(observeTag)
    {
        var m_callback = null;
        var m_functionCheckInteresting = observeTag ? function functionCheckInteresting(node) { return IsNodeContainsElementWithTag(node, observeTag); } : IsElementNode;
        function ProcessEvent(event)
        {
            try
            {
                if (!m_callback)
                    return;
                if (m_functionCheckInteresting(event.target))
                    m_callback();
            }
            catch (e)
            {
                ns.SessionError(e);
            }
        }
        this.Start = function Start(callback)
        {
            ns.AddRemovableEventListener(window, "DOMNodeInserted", ProcessEvent);
            ns.AddRemovableEventListener(window, "DOMNodeRemoved", ProcessEvent);
            m_callback = callback;
        };
        this.Stop = function Stop()
        {
            ns.RemoveEventListener(window, "DOMNodeInserted", ProcessEvent);
            ns.RemoveEventListener(window, "DOMNodeRemoved", ProcessEvent);
            m_callback = null;
        };
    }
    function TimeoutChangeObserver(observeTag)
    {
        var m_interval = null;
        var m_callback = null;
        var m_tagCount = 0;
        var m_attribute = "klot_" + ns.GetCurrentTime();
        function IsChangesOccure(nodeList)
        {
            for (var i = 0; i < nodeList.length; ++i)
            {
                if (!nodeList[i][m_attribute])
                    return true;
            }
            return false;
        }
        function FillTagInfo(nodeList)
        {
            m_tagCount = nodeList.length;
            for (var i = 0; i < m_tagCount; ++i)
                nodeList[i][m_attribute] = true;
        }
        function TimeoutProcess()
        {
            if (!m_callback)
                return;
            var nodeList = observeTag ? document.getElementsByTagName(observeTag) : document.getElementsByTagName("*");
            if (nodeList.length !== m_tagCount || IsChangesOccure(nodeList))
            {
                FillTagInfo(nodeList);
                m_callback();
            }
        }
        this.Start = function Start(callback)
        {
            m_callback = callback;
            FillTagInfo(document.getElementsByTagName(observeTag));
            m_interval = ns.SetInterval(TimeoutProcess, 10 * 1000);
            if (document.readyState !== "complete")
                ns.AddEventListener(window, "load", TimeoutProcess);
        };
        this.Stop = function Stop()
        {
            clearInterval(m_interval);
            m_callback = null;
        };
    }
    ns.GetDomChangeObserver = function GetDomChangeObserver(observeTag)
    {
        var observeTagLowerCase = observeTag ? observeTag.toLowerCase() : observeTag;
        if (window.MutationObserver && document.documentMode !== 11)    
            return new MutationChangeObserver(observeTagLowerCase);
        if (window.addEventListener)
            return new DomEventsChangeObserver(observeTagLowerCase);
        return new TimeoutChangeObserver(observeTagLowerCase);
    };
    return ns;
})(KasperskyLab);
(function Md5Main(ns) {
    function md5cycle(x, k) {
        var a = x[0],
        b = x[1],
        c = x[2],
        d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }
    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }
    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function hh(a, b, c, d, x, s, t) {
        return cmn(b^c^d, a, b, x, s, t);
    }
    function ii(a, b, c, d, x, s, t) {
        return cmn(c^(b | (~d)), a, b, x, s, t);
    }
    function md51(s) {
        var n = s.length,
        state = [1732584193, -271733879, -1732584194, 271733878],
        i;
        for (i = 64; i <= s.length; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < s.length; i++)
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i++)
                tail[i] = 0;
        }
        tail[14] = n * 8;
        md5cycle(state, tail);
        return state;
    }
    function md5blk(s) {
        var md5blks = [],
        i;
        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) +
                 (s.charCodeAt(i + 1) << 8) +
                 (s.charCodeAt(i + 2) << 16) +
                 (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }
    var hex_chr = '0123456789abcdef'.split('');
    function rhex(n) {
        var s = '',
        j = 0;
        for (; j < 4; j++)
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]+hex_chr[(n >> (j * 8)) & 0x0F];
        return s;
    }
    function hex(x) {
        for (var i = 0; i < x.length; i++)
            x[i] = rhex(x[i]);
        return x.join('');
    }
    ns.md5 = function md5(s) {
        return hex(md51(s));
    };
    function add32(a, b) {
        return (a + b) & 0xFFFFFFFF;
    }
    if (ns.md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
        add32 = function add32(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }
    }
})(KasperskyLab);
(function NmsTransportMain(ns)
{
ns.NMSTransportSupported = false;
return ns;
})(KasperskyLab);
(function AppExtTransportMain(ns)
{
ns.AppExtTransportSupported = false;
return ns;
})(KasperskyLab);
(function AjaxTransportMain(ns)
{
ns.AjaxTransportSupported = true;
var oldEncodeUri = encodeURI;
var ajaxRequestProvider = (function ajaxRequestProvider()
    {
        return {
            GetAsyncRequest: function GetAsyncRequest()
                {
                    var xmlhttp = ns.XDomainRequest ? new ns.XDomainRequest() : new ns.XMLHttpRequest();
                    if (!ns.XDomainRequest)
                    {
                        xmlhttp.open = ns.XMLHttpRequestOpen;
                        xmlhttp.send = ns.XMLHttpRequestSend;
                        xmlhttp.setRequestHeader = ns.XMLHttpRequestSetRequestHeader;
                    }
                    xmlhttp.onprogress = ns.EmptyFunc;
                    return xmlhttp;
                },
            GetSyncRequest: function GetSyncRequest()
                {
                    var xmlhttp = new ns.XMLHttpRequest();
                    xmlhttp.open = ns.XMLHttpRequestOpen;
                    xmlhttp.send = ns.XMLHttpRequestSend;
                    xmlhttp.setRequestHeader = ns.XMLHttpRequestSetRequestHeader;
                    xmlhttp.onprogress = ns.EmptyFunc;
                    return xmlhttp;
                }
        };
    })();
var restoreSessionCallback = ns.EmptyFunc;
var PingPongCallReceiver = function PingPongCallReceiver(caller)
{
    var m_caller = caller;
    var m_isProductConnected = false;
    var m_pingWaitResponse = false;
    var m_requestDelay = ns.MaxRequestDelay;
    var m_requestTimer = null;
    var m_callCallback = ns.EmptyFunc;
    var m_errorCallback = ns.EmptyFunc;
    var m_updateCallback = ns.EmptyFunc;
    function SendRequest()
    {
        try 
        {
            m_caller.Call(
                "from",
                null,
                null,
                 true,
                function CallCallback(result, parameters, method)
                {
                    m_pingWaitResponse = false;
                    m_isProductConnected = true;
                    if (parameters === "undefined" || method === "undefined") 
                    {
                        m_errorCallback("AJAX pong is not received. Product is deactivated");
                        return;
                    }
                    if (method)
                    {
                        ns.SetTimeout(function TimerCallback() { SendRequest(); }, 0);
                        m_callCallback(method, parameters);
                    }
                },
                function ErrorCallback(error)
                {
                    m_pingWaitResponse = false;
                    m_isProductConnected = false;
                    restoreSessionCallback();
                    m_errorCallback(error);
                }
                );
            m_pingWaitResponse = true;
        }
        catch (e)
        {
            m_errorCallback("Ajax send ping exception: " + (e.message || e));
        }
    }
    function Ping()
    {
        try
        {
            if (m_pingWaitResponse)
            {
                m_requestTimer = ns.SetTimeout(Ping, 100);
                return;
            }
            m_requestDelay = m_updateCallback();
            SendRequest();
            m_requestTimer = ns.SetTimeout(Ping, m_requestDelay);
        }
        catch (e)
        {
            m_errorCallback("Send ping request: " + (e.message || e));
        }
    }
    this.StartReceive = function StartReceive(callCallback, errorCallback, updateCallback)
    {
        m_isProductConnected = true;
        m_callCallback = callCallback;
        m_errorCallback = errorCallback;
        m_updateCallback = updateCallback;
        m_requestDelay = m_updateCallback();
        m_requestTimer = ns.SetTimeout(Ping, m_requestDelay);
    };
    this.ForceReceive = function ForceReceive()
    {
        clearTimeout(m_requestTimer);
        m_requestTimer = ns.SetTimeout(Ping, 0);
    };
    this.StopReceive = function StopReceive()
    {
        clearTimeout(m_requestTimer);
        m_requestTimer = null;
        m_callCallback = ns.EmptyFunc;
        m_errorCallback = ns.EmptyFunc;
        m_updateCallback = ns.EmptyFunc;
    };
    this.IsStarted = function IsStarted()
    {
        return m_requestTimer !== null;
    };
    this.IsProductConnected = function IsProductConnected()
    {
        return m_isProductConnected;
    };
};
var LongPoolingReceiver = function LongPoolingReceiver(caller)
{
    var m_caller = caller;
    var m_isProductConnected = false;
    var m_isStarted = false;
    var m_callCallback = ns.EmptyFunc;
    var m_errorCallback = ns.EmptyFunc;
    function SendRequest(onResponseCallback)
    {
        try 
        {
            m_isProductConnected = true;
            m_caller.Call(
                "longpooling",
                null,
                null,
                 true,
                onResponseCallback,
                function ErrorCallback(error)
                {
                    m_isProductConnected = false;
                    restoreSessionCallback();
                    m_errorCallback(error);
                },
                true
                );
        }
        catch (e)
        {
            ns.SessionError(e, "ajax_longpooling");
            m_errorCallback("Ajax send ping exception: " + (e.message || e));
        }
    }
    function OnResponse(result, parameters, method)
    {
        if (!ns.IsDefined(parameters) || !ns.IsDefined(method))
        {
            m_errorCallback("AJAX pong is not received. Product is deactivated");
            return;
        }
        ns.SetTimeout(function TimerCallback() { SendRequest(OnResponse); }, 0);
        if (method)
            m_callCallback(method, parameters);
    }
    this.StartReceive = function StartReceive(callCallback, errorCallback)
    {
        m_isStarted = true;
        m_callCallback = callCallback;
        m_errorCallback = errorCallback;
        SendRequest(OnResponse);
    };
    this.ForceReceive = ns.EmptyFunc;
    this.StopReceive = function StopReceive()
    {
        m_isStarted = false;
        m_callCallback = ns.EmptyFunc;
        m_errorCallback = ns.EmptyFunc;
    };
    this.IsStarted = function IsStarted()
    {
        return m_isStarted;
    };
    this.IsProductConnected = function IsProductConnected()
    {
        return m_isProductConnected;
    };
};
ns.AjaxCaller = function AjaxCaller()
{
    var m_path = ns.GetBaseUrl() + ns.SIGNATURE;
    var m_isLongPooling = false;
    var m_longPoolingRequest = null;
    function NoCacheParameter() 
    {
        return "&nocache=" + Math.floor((1 + Math.random()) * 0x10000).toString(16);
    }
    function PrepareRequestObject(command, commandAttribute, isPost, isAsync)
    {
        var request = isAsync ? ajaxRequestProvider.GetAsyncRequest() : ajaxRequestProvider.GetSyncRequest();
        if (request)
        {
            var urlPath = m_path + "/" + command;
            if (commandAttribute)
                urlPath += "/" + commandAttribute;
            if (isPost)
            {
                request.open("POST", urlPath);
            }
            else
            {
                if (urlPath.indexOf("?") === -1)
                    urlPath += "?get";
                urlPath += NoCacheParameter();
                request.open("GET", urlPath, isAsync);
            }
            if (request.setRequestHeader && ns.IsRelativeTransport())
                request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        }
        return request;
    }
    function ClearRequest(request)
    {
        request.onerror = ns.EmptyFunc;
        request.onload = ns.EmptyFunc;
    }
    function GetResponseText(request)
    {
        try
        {
            if (!ns.IsDefined(request.status) || request.status === 200)
                return request.responseText.toString();
        }
        catch (e)
        {
            ns.SessionLog(e);
        }
        return "";
    }
    function AsyncCall(command, commandAttribute, data, callbackResult, callbackError, isLongPoolingCall)
    {
        try
        {
            var request = PrepareRequestObject(command, commandAttribute, Boolean(data), true);
            if (!request) 
            {
                callbackError && callbackError("Cannot create AJAX request!");
                return;
            }
            var timeout = null;
            if (!m_isLongPooling)
            {
                timeout = ns.SetTimeout(function TimerCallback()
                    {
                        callbackError && callbackError("Cannot send AJAX request for calling " + command + "/" + commandAttribute);
                        request.abort();
                        ClearRequest(request);
                    }, 120000);
            }
            request.onerror = function onerror()
                {
                    clearTimeout(timeout);
                    ClearRequest(request);
                    callbackError && callbackError("AJAX request error for calling " + command + "/" + commandAttribute);
                };
            request.onload = function onload()
                {
                    try
                    {
                        clearTimeout(timeout);
                        ClearRequest(request);
                        var responseText = GetResponseText(request);
                        if (responseText)
                        {
                            if (callbackResult)
                                callbackResult(responseText);
                            return;
                        }
                        if (callbackError)
                            callbackError("AJAX request with unsupported url type!"); 
                    }
                    catch (e)
                    {
                        ns.SessionError(e, "ajax");
                    }
                };
            if (isLongPoolingCall)
                m_longPoolingRequest = request;
            request.send(data);
            ns.Log("Call native function " + command + "/" + commandAttribute);
        }
        catch (e)
        {
            if (callbackError)
                callbackError("AJAX request " + command  + "/" + commandAttribute + " exception: " + (e.message || e));
        }
    }
    function SyncCall(command, commandAttribute, data, callbackResult, callbackError)
    {
        try
        {
            var request = PrepareRequestObject(command, commandAttribute + "?" + oldEncodeUri(data), false, false);
            if (!request)
            {
                callbackError && callbackError("Cannot create AJAX request!");
                return false;
            }
            request.send();
            if (!ns.IsDefined(request.status) || request.status === 200)
            {
                if (callbackResult && request.responseText)
                    callbackResult(request.responseText);
                request = null;
                return true;
            }
        }
        catch (e)
        {
            if (callbackError)
                callbackError("AJAX request " + command + " exception: " + (e.message || e));
        }
        return false;
    }
    this.Start = function Start(callbackSuccess)
    {
        callbackSuccess();
    };
    this.SendLog = function SendLog(message)
    {
        AsyncCall("log?" + encodeURIComponent(message));
    };
    this.SendResult = function SendResult(methodName, data)
    {
        AsyncCall("callResult", methodName, data);
    };
    this.Call = function Call(command, commandAttribute, data, isAsync, callbackResult, callbackError, isLongPoolingCall) 
    {
        var callFunction = (isAsync || !ns.IsDefined(isAsync)) ? AsyncCall : SyncCall;
        return callFunction(
            command,
            commandAttribute,
            data,
            function CallCallback(responseText)
            {
                var commandResponse = ns.JSONParse(responseText);
                if (commandResponse.result === -1610612735)
                {
                    callFunction(
                        command,
                        commandAttribute,
                        data,
                        function callCallback(response)
                        {
                            if (!callbackResult)
                                return;
                            commandResponse = ns.JSONParse(response);
                            callbackResult(commandResponse.result, commandResponse.parameters, commandResponse.method);
                        },
                        callbackError,
                        isLongPoolingCall
                        );
                }
                else if (callbackResult)
                {
                    callbackResult(commandResponse.result, commandResponse.parameters, commandResponse.method);
                }
            },
            callbackError,
            isLongPoolingCall
            );
    };
    this.Shutdown = function Shutdown()
    {
        if (m_longPoolingRequest)
        {
            if (m_longPoolingRequest.abort)
                m_longPoolingRequest.abort();
            ClearRequest(m_longPoolingRequest);
            m_longPoolingRequest = null;
        }
    };
    this.InitCall = function InitCall(initData, callbackResult, callbackError)
    {
        restoreSessionCallback = callbackError;
        if (ns.StartLocationHref === "data:text/html,chromewebdata")
            return callbackError();
        AsyncCall(
            "init?data=" + encodeURIComponent(ns.ToBase64(ns.JSONStringify(initData))),
            null,
            null,
            function AsyncCallCallback(responseText)
            {
                try
                {
                    var initSettings = ns.JSONParse(responseText);
                    m_path = ns.GetBaseUrl() + initSettings.ajaxId + "/" + initSettings.sessionId;
                    m_isLongPooling = initSettings.longPooling;
                    callbackResult(initSettings);
                } 
                catch (e)
                {
                    restoreSessionCallback && restoreSessionCallback("Error " + e.name + ": " + e.message);
                }
            },
            callbackError
            );
    };
    this.GetReceiver = function GetReceiver()
    {
        return m_isLongPooling ? new LongPoolingReceiver(this) : new PingPongCallReceiver(this);
    };
};
return ns;
})(KasperskyLab);
(function WebSocketTransportMain(ns)
{
ns.WebSocketTransportSupported = ns.IsDefined(window.WebSocket);
if (!ns.WebSocketTransportSupported)
    return ns;
var webSocketProvider = (function webSocketProvider()
    {
        var WebSocketObject = WebSocket;
        var WebSocketSend = WebSocket.prototype.send;
        var WebSocketClose = WebSocket.prototype.close;
        return {
            GetWebSocket: function GetWebSocket(path)
            {
                var webSocket = new WebSocketObject(path);
                webSocket.send = WebSocketSend;
                webSocket.close = WebSocketClose;
                return webSocket;
            }
            };
    })();
ns.WebSocketCaller = function WebSocketCaller()
{
    var m_socket = null;
    var m_waitResponse = {};
    var m_callReceiver = ns.EmptyFunc;
    var m_errorCallback = ns.EmptyFunc;
    var m_callReceiverEnabled = false;
    var m_connected = false;
    var m_initialized = false;
    var m_isWaitingReconnect = false;
    var m_deferredCalls = [];
    var m_deferredOutCalls = [];
    var m_wasCallbackErrorCalled = false;
    var m_callId = 0;
    function ClearWebSocket(ws)
    {
        ws.onmessage = ns.EmptyFunc;
        ws.onerror = ns.EmptyFunc;
        ws.onopen = ns.EmptyFunc;
        ws.onclose = ns.EmptyFunc;
    }
    function GetWebSocket(callbackSuccess, callbackError, processMessageCallback)
    {
        var url = ns.GetBaseUrl();
        var webSocketPath = (url.indexOf("https:") === 0) 
            ? "wss" + url.substr(5)
            : "ws" + url.substr(4);
        webSocketPath += ns.SIGNATURE + "/websocket?url=" + encodeURIComponent(ns.ToBase64(ns.StartLocationHref)) + "&nocache=" + (new Date().getTime());
        var webSocket = webSocketProvider.GetWebSocket(webSocketPath);
        webSocket.onmessage = function onmessage(arg)
            {
                processMessageCallback(arg, callbackError);
            };
        webSocket.onerror = function onerror()
            {
                ClearWebSocket(webSocket);
                if (!m_wasCallbackErrorCalled && callbackError)
                    callbackError();
                m_wasCallbackErrorCalled = true;
            };
        webSocket.onopen = function onopen()
            {
                m_wasCallbackErrorCalled = false;
                m_connected = true;
                if (callbackSuccess)
                    callbackSuccess();
            };
        webSocket.onclose = function onclose(closeEvent)
            {
                m_connected = false;
                if (closeEvent && closeEvent.code === 1006)
                    webSocket.onerror(closeEvent);
                ClearWebSocket(webSocket);
                m_errorCallback("websocket closed");
            };
        return webSocket;
    }
    function CallImpl(command, commandAttribute, data, callbackResult, callbackError)
    {
        try
        {
            if (m_isWaitingReconnect)
            {
                m_deferredOutCalls.push({ command: command, commandAttribute: commandAttribute, data: data, callbackResult: callbackResult, callbackError: callbackError });
                return;
            }
            if (++m_callId % 0x100000000 === 0)
                m_callId = 1;
            var callId = m_callId;
            if (callbackResult || callbackError)
            {
                var timeout = ns.SetTimeout(function TimerCallback()
                    {
                        delete m_waitResponse[callId];
                        if (callbackError)
                            callbackError("websocket call timeout for " + command  + "/" + commandAttribute);
                    }, 120000);
                var callWaiter =
                    {
                        callId: callId,
                        callbackResult: callbackResult,
                        timeout: timeout
                    };
                m_waitResponse[callId] = callWaiter;
            }
            m_socket.send(ns.JSONStringify(
                {
                    callId: callId,
                    command: command,
                    commandAttribute: commandAttribute || "",
                    commandData: data || ""
                }
                ));
        }
        catch (e)
        {
            if (callbackError)
                callbackError("websocket call " + command  + "/" + commandAttribute + " exception: " + (e.message || e));
        }
    }
    function ProcessMessage(arg, errorCallback)
    {
        try
        {
            m_wasCallbackErrorCalled = false;
            var response = ns.JSONParse(arg.data);
            if (m_waitResponse[response.callId])
            {
                var callWaiter = m_waitResponse[response.callId];
                delete m_waitResponse[response.callId];
                clearTimeout(callWaiter.timeout);
                if (callWaiter.callbackResult)
                    callWaiter.callbackResult(response.commandData);
                return;
            }
            if (!m_initialized)
            {
                m_deferredCalls.push(arg);
                return;
            }
            if (response.command === "from")
            {
                var command = ns.JSONParse(response.commandData);
                m_callReceiver(command.method, command.parameters);
            }
            else if (response.command === "reconnect")
            {
                m_socket.onmessage = ns.EmptyFunc;
                m_socket.onerror = ns.EmptyFunc;
                m_socket.onopen = ns.EmptyFunc;
                m_socket.onclose = ns.EmptyFunc;
                m_socket.close();
                m_isWaitingReconnect = true;
                m_socket = GetWebSocket(function GetWebSocketCallback()
                    {
                        m_isWaitingReconnect = false;
                        CallImpl("restore", "", response.commandData);
                        for (var i = 0; i < m_deferredOutCalls.length; ++i)
                        {
                            CallImpl(m_deferredOutCalls[i].command, 
                                m_deferredOutCalls[i].commandAttribute, 
                                m_deferredOutCalls[i].data, 
                                m_deferredOutCalls[i].callbackResult, 
                                m_deferredOutCalls[i].callbackError);
                        }
                        m_deferredOutCalls = [];
                    },
                    errorCallback,
                    ProcessMessage);
            }
        }
        catch (e)
        {
            ns.SessionError(e, "websoket");
        }
    }
    this.Start = function Start(callbackSuccess, callbackError)
    {
        try
        {
            m_socket = GetWebSocket(callbackSuccess, callbackError, ProcessMessage);
        }
        catch (e)
        {
            if (callbackError)
                callbackError("websocket start exception: " + (e.message || e));
        }
    };
    this.SendLog = function SendLog(message)
    {
        CallImpl("log", null, message);
    };
    this.SendResult = function SendResult(methodName, data)
    {
        CallImpl("callResult", methodName, data);
    };
    this.Call = function Call(command, commandAttribute, data, isAsync, callbackResult, callbackError)
    {
        if (ns.IsDefined(isAsync) && !isAsync)
            return false;
        CallImpl(
            command,
            commandAttribute,
            data,
            callbackResult
                ?   function callbackResultImpl(responseText)
                    {
                        if (callbackResult)
                        {
                            var response = ns.JSONParse(responseText);
                            callbackResult(response.result, response.parameters, response.method);
                        }
                    }
                : null,
            callbackError
            );
    };
    this.InitCall = function InitCall(initData, callbackResult, callbackError)
    {
        if (ns.StartLocationHref === "data:text/html,chromewebdata")
            return callbackError();
        CallImpl("init", null, ns.JSONStringify(initData), function CallImplCallback(responseText)
            {
                m_initialized = true;
                var initSettings = ns.JSONParse(responseText);
                if (ns.IsDefined(initSettings.Shutdown))
                    return;
                callbackResult(initSettings);
                for (var i = 0; i < m_deferredCalls.length; ++i)
                    ProcessMessage(m_deferredCalls[i], callbackError);
                m_deferredCalls = [];
            }, callbackError);
    };
    this.GetReceiver = function GetReceiver()
    {
        return this;
    };
    this.StartReceive = function StartReceive(callMethod, errorCallback)
    {
        m_callReceiverEnabled = true;
        m_callReceiver = callMethod;
        m_errorCallback = errorCallback;
    };
    this.ForceReceive = ns.EmptyFunc;
    this.StopReceive = function StopReceive()
    {
        m_callReceiverEnabled = false;
        m_callReceiver = ns.EmptyFunc;
        m_errorCallback = ns.EmptyFunc;
        if (m_socket)
        {
            m_connected = false;
            m_socket.onmessage = ns.EmptyFunc;
            m_socket.onerror = ns.EmptyFunc;
            m_socket.onopen = ns.EmptyFunc;
            m_socket.onclose = ns.EmptyFunc;
            m_socket.close();
            m_socket = null;
        }
    };
    this.IsStarted = function IsStarted()
    {
        return m_callReceiverEnabled;
    };
    this.IsProductConnected = function IsProductConnected()
    {
        return m_connected;
    };
};
return ns;
})(KasperskyLab);
var kaspersyLabSessionInstance = null;
(function SessionMain(ns)
{
    var runners = {};
    var lastPostponedInitTime = (new Date()).getTime();
    var postponedInitTimeout = null;
    var ajaxId = "";
    var sessionId = "";
    if (ns.WORK_IDENTIFIERS)
    {
        var workIdentifiers = ns.WORK_IDENTIFIERS.split(",");
        for (var id = 0; id < workIdentifiers.length; ++id)
        {
            if (window[workIdentifiers[id]])
            {
                ns.AddRunner = ns.EmptyFunc;
                ns.AddRunner2 = ns.EmptyFunc;
                return;
            }
            window[workIdentifiers[id]] = true;
        }
    }
    function removeThisScriptElement(injectId)
    {
        var pattern = injectId.toLowerCase();
        for (var i = 0, scriptsCount = document.scripts.length; i < scriptsCount; ++i) 
        {
            var tag = document.scripts[i];
            if (typeof tag.src === "string" && tag.src.length > 45 
                && tag.src.toLowerCase().indexOf(pattern) > 0 
                && (/\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/main.js/).test(tag.src))
            {
                tag.parentElement.removeChild(tag);
                break; 
            }
        }
    }
    if (ns.INJECT_ID)
        removeThisScriptElement(ns.INJECT_ID);
    var CallReceiver = function CallReceiver(caller)
    {
        var m_plugins = {};
        var m_receiver = caller.GetReceiver();
        var m_caller = caller;
        var m_selfMethods = {};
        function GetPluginIdFromMethodName(methodName)
        {
            if (methodName)
            {
                var names = methodName.split(".", 2);
                if (names.length === 2)
                    return names[0];
            }
            return null;
        }
        function GetPluginMethods(pluginId)
        {
            var plugin = m_plugins[pluginId];
            return plugin ? plugin.methods : null;
        }
        function CheckCommonMethodName(methodName)
        {
            if (methodName)
            {
                var names = methodName.split(".", 2);
                if (names.length === 1 && names[0] === methodName)
                    return true;
            }
            return false;
        }
        this.RegisterMethod = function RegisterMethod(methodName, callback)
        {
            var pluginId = GetPluginIdFromMethodName(methodName);
            if (pluginId)
            {
                var methods = GetPluginMethods(pluginId);
                if (methods)
                {
                    if (methods[methodName])
                        throw new Error("Already registered method " + methodName);
                    methods[methodName] = callback;
                }
                else
                {
                    throw new Error("Cannot registered " + methodName);
                }
            }
            else if (CheckCommonMethodName(methodName))
            {
                if (m_selfMethods[methodName])
                    throw new Error("Already registered method " + methodName);
                m_selfMethods[methodName] = callback;
            }
        };
        function CallPluginMethod(pluginId, methodName, args)
        {
            var callback = null;
            if (pluginId)
            {
                var methods = GetPluginMethods(pluginId);
                if (methods) 
                    callback = methods[methodName];
            } 
            else
            {
                callback = m_selfMethods[methodName];
            }
            if (callback)
            {
                var result = {};
                try 
                {
                    if (args)
                        callback(ns.JSONParse(args));
                    else
                        callback();
                    result.success = true;
                    m_caller.SendResult(methodName, ns.JSONStringify(result));
                    return true;
                }
                catch (e)
                {
                    result.success = false;
                    m_caller.SendResult(methodName, ns.JSONStringify(result));
                    m_caller.SendLog("Call " + methodName + " in plugin " + (pluginId ? pluginId : "common") + " error: " + (e.message || e));
                    return false;
                }
            }
            m_caller.SendLog("Cannot call " + methodName + " for plugin " + (pluginId ? pluginId : "common"));
            return false;
        }
        function CallMethod(methodName, args)
        {
            ns.Log("Try to find js callback " + methodName);
            var pluginId = GetPluginIdFromMethodName(methodName);
            if (pluginId || CheckCommonMethodName(methodName))          
                CallPluginMethod(pluginId, methodName, args);
        }
        function ReportPluginError(pluginId, status)
        {
            var onError = m_plugins[pluginId].onError;
            if (onError)
                onError(status);
        }
        function ReportError(status)
        {
            for (var pluginId in m_plugins)
            {
                if (Object.prototype.hasOwnProperty.call(m_plugins, pluginId))
                    ReportPluginError(pluginId, status);
            }
        }
        function UpdateDelay()
        {
            var newDelay = ns.MaxRequestDelay;
            var currentTime = ns.GetCurrentTime();
            for (var pluginId in m_plugins)
            {
                if (!Object.prototype.hasOwnProperty.call(m_plugins, pluginId))
                    continue;
                try 
                {   
                    var onPing = m_plugins[pluginId].onPing;
                    if (onPing)
                    {
                        var delay = onPing(currentTime);
                        if (delay < newDelay && delay > 0 && delay < ns.MaxRequestDelay)
                            newDelay = delay;
                    }
                }
                catch (e)
                {
                    ReportPluginError(pluginId, "UpdateDelay: " + (e.message || e));
                }
            }
            return newDelay;
        }
        this.RegisterPlugin = function RegisterPlugin(pluginId, callbackPing, callbackError)
        {
            if (m_plugins[pluginId])
                return;
            var plugin = {
                onError: callbackError,
                onPing: callbackPing,
                methods: {}
            };
            m_plugins[pluginId] = plugin;
            if (!m_receiver.IsStarted())
                m_receiver.StartReceive(CallMethod, ReportError, UpdateDelay);
        };
        function IsPluginListEmpty()
        {
            for (var key in m_plugins)
            {
                if (Object.prototype.hasOwnProperty.call(m_plugins, key))
                    return false;
            }
            return true;
        }
        this.UnregisterPlugin = function UnregisterPlugin(pluginId)
        {
            delete m_plugins[pluginId];
            if (IsPluginListEmpty())
                m_receiver.StopReceive();
        };
        this.ForceReceive = function ForceReceive()
        {
            m_receiver.ForceReceive();
        };
        this.UnregisterAll = function UnregisterAll()
        {
            if (IsPluginListEmpty())
                return;
            m_receiver.StopReceive();
            m_plugins = {};
        };
        this.IsEmpty = IsPluginListEmpty;
        this.IsProductConnected = function IsProductConnected()
        {
            return m_receiver.IsProductConnected();
        };
    };
    function LocalizationObjectFromDictionary(dictionary)
    {
        if (!dictionary)
            return null;
        var object = {};
        for (var i = 0; i < dictionary.length; i++)
            object[dictionary[i].name] = dictionary[i].value;
        return object;
    }
    var KasperskyLabSessionClass = function KasperskyLabSessionClass(caller)
    {
        var self = this;
        var m_caller = caller;
        var m_callReceiver = new CallReceiver(caller);
        function BeaconSend(command, commandAttribute, data)
        {
            try
            {
                var maxBeaconPackageSize = 64 * 1024;
                var size = maxBeaconPackageSize;
                if (typeof window.TextEncoder === "function")
                    size = (new TextEncoder("utf-8").encode(data)).length;
                if (navigator && navigator.sendBeacon && size < maxBeaconPackageSize)
                {
                    var urlPath = ns.GetBaseUrl() + ajaxId + "/" + sessionId + "/" + command + "/" + commandAttribute;
                    return navigator.sendBeacon(urlPath, data);
                }
            }
            catch (e)
            {
                ns.Log("Error on beacon send " + e);
            }
            return false;
        }
        function CallImpl(methodName, argsObj, callbackResult, callbackError, onUnload)
        {
            if (!m_callReceiver.IsProductConnected())
                return false;
            var data = (argsObj) 
                ? ns.JSONStringify(
                    {
                        result: 0,
                        method: methodName,
                        parameters: ns.JSONStringify(argsObj)
                    }
                    )
                : null;
            if (onUnload && BeaconSend("to", methodName, data))
                return true;
            var callback = function callback(result, args, method)
                {
                    if (callbackResult)
                        callbackResult(result, args ? ns.JSONParse(args) : null, method);
                };
            return m_caller.Call("to", methodName, data, !onUnload, callback, callbackError);
        }
        function Call(methodName, arrayOfArgs, callbackResult, callbackError)
        {
            CallImpl(methodName, arrayOfArgs, callbackResult, callbackError, false);
        }
        function OnUnloadCall(methodName, arrayOfArgs, callbackResult, callbackError)
        {
            return CallImpl(methodName, arrayOfArgs, callbackResult, callbackError, true);
        }
        function Stop()
        {
            try
            {
                m_callReceiver.UnregisterAll();
                ns.Log("session stopped");
                if (m_callReceiver.IsProductConnected())
                {
                    if (!m_caller.Call("shutdown", null, null, false))
                        m_caller.Call("shutdown");
                }
                if (m_caller.Shutdown)
                    m_caller.Shutdown();
            }
            catch (e)
            {
            }
        }
        function DeactivatePlugin(pluginId)
        {
            ns.Log("DeactivatePlugin " + pluginId);
            m_callReceiver.UnregisterPlugin(pluginId);
            if (m_callReceiver.IsEmpty())
                Stop();
        }
        function ActivatePlugin(pluginId, callbackPing, callbackError)
        {
            ns.Log("ActivatePlugin " + pluginId);
            m_callReceiver.RegisterPlugin(pluginId, callbackPing, function RegisterPluginOnError(e)
            {
                callbackError && callbackError(e);
                m_callReceiver.UnregisterPlugin(pluginId);
                if (m_callReceiver.IsEmpty())
                    Stop();
            });
        }
        function RegisterMethod(methodName, callback)
        {
            ns.Log("RegisterMethod " + methodName);
            m_callReceiver.RegisterMethod(methodName, callback);
        }
        function ReloadImpl()
        {
            window.location.reload(true);
        }
        function ReloadPage()
        {
            if (navigator && navigator.serviceWorker && navigator.serviceWorker.controller && navigator.serviceWorker.controller.state === "activated")
            {
                ns.SetTimeout(ReloadImpl, 1000);
                navigator.serviceWorker.getRegistrations()
                    .then(function getRegistrationsThen(regs)
                        {
                            var countUnregistered = 0;
                            var rest = function rest()
                                {
                                    ++countUnregistered;
                                    if (countUnregistered === regs.length)
                                        ReloadImpl();
                                }; 
                            for (var i = 0; i < regs.length; ++i)
                            {
                                regs[i].unregister()
                                    .then(rest)
                                    .catch(rest);
                            }
                        })
                    .catch(ReloadImpl);
            }
            else
            {
                ns.SetTimeout(ReloadImpl, 0);
            }
        }
        function OnStartError(injectorName)
        {
            try 
            {
                var connectionErrorCallback = runners[injectorName].onConnectionError;
                if (connectionErrorCallback)
                    connectionErrorCallback();
            }
            catch (e)
            {
                ns.Log(e);
            }
        }
        function StartInjector(param)
        {
            var pluginStartData = {};
            var runner = runners[param.injectorName];
            if (runner && runner.getParameters)
                pluginStartData = { plugin: runner, parameters: ns.JSONStringify(runner.getParameters()) };
            var startData =
                {
                    url: ns.StartLocationHref,
                    plugins: param.injectorName,
                    data: { data: pluginStartData },
                    isTopLevel: ns.IsTopLevel,
                    pageStartTime: ns.GetPageStartTime()
                };
            m_caller.StartCall(
                startData,
                function StartCallCallback(plugin)
                {
                    if (runner && plugin)
                    {
                        var settings = null;
                        if (ns.IsDefined(plugin.settingsJson))
                            settings = (plugin.settingsJson) ? ns.JSONParse(plugin.settingsJson) : null;
                        else
                            settings = plugin.settings;
                        var localization = ns.IsDefined(plugin.localizationDictionary) ? LocalizationObjectFromDictionary(plugin.localizationDictionary) : null;
                        runner.runner(KasperskyLab, kaspersyLabSessionInstance, settings, localization);
                    }
                },
                function StartCallOnError()
                { 
                    OnStartError(param.injectorName);
                }
                );
        }
        function OnStopError(injectorName)
        {
            ns.Log("Stop " + injectorName + "injector failed");
        }
        function StopInjector(param)
        {
            var runner = runners[param.injectorName];
            m_caller.StopCall(
                param.injectorName,
                function StopCallCallback(plugin)
                {
                    if (runner && plugin && runner.stop)
                        runner.stop(KasperskyLab, kaspersyLabSessionInstance);
                },
                function StopCallOnError() { OnStopError(param.injectorName); }
                );
        }
        RegisterMethod("reload", ReloadPage);
        RegisterMethod("start", StartInjector);
        RegisterMethod("stop", StopInjector);
        this.Reload = function Reload()
        {
            ReloadPage();
        };
        this.Log = function Log(error)
        {
            try
            {
                if (!this.IsProductConnected())
                    return;
                var msg = "";
                if (error instanceof Error)
                {
                    msg = error.message;
                    if (error.stack)
                        msg += "\r\n" + error.stack;
                }
                else if (error instanceof Object)
                {
                    msg = ns.JSONStringify(error);
                }
                else
                {
                    msg = String(error);
                }
                msg && m_caller.SendLog(msg.length <= 2048 ? msg : (msg.substring(0, 2048) + "<...>"));
            }
            catch (e)
            {
                ns.Log(e.message || e);
            }
        };
        this.LogError = function LogError(error, injector)
        {
            try
            {
                if (!m_callReceiver.IsProductConnected())
                    return;
                if (!injector)
                    injector = "common"; 
                var result = { injector: injector };
                if (typeof error === "object")
                {
                    result.error2 = error.message ? error.message : "unknown";
                    result.stack = error.stack;
                    result.details = error.details; 
                    result.error = result.error2;
                    if (result.details)
                        result.error += "\n" + result.details;
                    if (result.stack)
                        result.error += "\n" + result.stack;
                }
                else
                {
                    result.error  = error;
                    var m = error.split("\n");
                    result.error2 = m[0];
                    result.details = m.slice(1).join("\n");
                }
                m_caller.Call("logerr", null, ns.JSONStringify(result));
            }
            catch (e)
            {
                ns.Log(e.message || e);
            }        
        };
        this.UnhandledException = function UnhandledException(e)
        {
            try
            {
                if (!m_callReceiver.IsProductConnected())
                    return;
                if (!e.filename)
                    return;
                if (e.klSkipUnhandled)
                    return;
                var val = ns.INJECT_ID;
                if (!val || e.filename.indexOf(val) === -1)
                    return;
                var errInfo = {};
                errInfo.error = e.message && e.message.length > 1024 ? (e.message.substring(0, 1019) + "<...>") : e.message;
                errInfo.script = e.filename && e.filename.length > 1024 ? (e.filename.substring(0, 1019) + "<...>") : e.filename;
                errInfo.line = e.lineno;
                errInfo.column = e.colno;
                if (e.error)
                    errInfo.stack = e.error.stack && e.error.stack.length > 2048 ? (e.error.stack.substring(0, 2043) + "<...>") : e.error.stack;
                m_caller.Call("except", null, ns.JSONStringify(errInfo));
                return;
            }
            catch (ex)
            {
                ns.Log(ex.message || ex);
            }
        };
        this.ForceReceive = function ForceReceive()
        {
            m_callReceiver.ForceReceive();
        };
        this.IsProductConnected = function IsProductConnected()
        {
            return m_callReceiver.IsProductConnected();
        };
        this.InitializePlugin = function InitializePlugin(init)
        {
            init(
                function OnInitActivatePlugin()
                {
                    ActivatePlugin.apply(self, arguments);
                },
                function OnInitRegisterMethod()
                {
                    RegisterMethod.apply(self, arguments);
                },
                function OnInitCall()
                {
                    Call.apply(self, arguments);
                },
                function OnInitDeactivatePlugin()
                {
                    DeactivatePlugin.apply(self, arguments);
                },
                function OnInitOnUnloadCall()
                {
                    return OnUnloadCall.apply(self, arguments);
                }
            );
        };
        this.GetResource = function GetResource(resourcePostfix, callbackSuccess, callbackError)
        {
            if (!m_caller.ResourceCall)
                throw new Error("Not implemented on transport GetResource");
            m_caller.ResourceCall(resourcePostfix, callbackSuccess, callbackError);
        };
        ns.AddEventListener(window, "unload", function onUnload() 
            {
                if (!m_callReceiver.IsEmpty())
                    Stop();
            });
    };
    ns.AddRunner = function AddRunner(pluginName, runnerFunc, initParameters, onConnectionError)
    {
        var options = {
            name: pluginName,
            runner: runnerFunc
        };
        if (initParameters)
            options.getParameters = function getParameters() { return initParameters; };
        if (onConnectionError)
            options.onConnectionError = onConnectionError;
        ns.AddRunner2(options);
    };
    ns.AddRunner2 = function AddRunner2(options)
    {
        var runnerItem = {
            runner: options.runner
        };
        if (options.onConnectionError)
            runnerItem.onConnectionError = options.onConnectionError;
        if (options.getParameters)
            runnerItem.getParameters = options.getParameters;
        if (options.stop)
            runnerItem.stop = options.stop;
        runners[options.name] = runnerItem;
    };
    ns.SessionLog = function SessionLog(e)
    {
        if (kaspersyLabSessionInstance && kaspersyLabSessionInstance.IsProductConnected())
            kaspersyLabSessionInstance.Log(e);
        else
            ns.Log(e);
    };
    ns.SessionError = function SessionError(e, injector)
    {
        if (kaspersyLabSessionInstance && kaspersyLabSessionInstance.IsProductConnected())
            kaspersyLabSessionInstance.LogError(e, injector);
        else
            ns.Log(e);
    };
    ns.AddEventListener(window, "error", function onError(e)
    {
        if (kaspersyLabSessionInstance)
            kaspersyLabSessionInstance.UnhandledException(e);
        else
            ns.Log(e);
    });
    ns.ContentSecurityPolicyNonceAttribute = ns.CSP_NONCE;
    var SupportedCallerProvider = function SupportedCallerProvider(onInitErrorCallback)
    {
        var m_current = 0;
        var m_supportedCallers = [];
        if (ns.NMSTransportSupported)
            m_supportedCallers.push(new ns.NMSCaller());
        if (ns.WebSocketTransportSupported)
            m_supportedCallers.push(new ns.WebSocketCaller());
        if (ns.AjaxTransportSupported)
            m_supportedCallers.push(new ns.AjaxCaller());
        if (ns.AppExtTransportSupported)
            m_supportedCallers.push(new ns.AppExtCaller());
        function FindSupportedImpl(callbackSuccess)
        {
            if (m_current < m_supportedCallers.length)
            {
                var caller = m_supportedCallers[m_current++];
                caller.Start(function StartCallback() 
                    { 
                        callbackSuccess(caller); 
                    }, 
                    function StartError() 
                    { 
                        FindSupportedImpl(callbackSuccess); 
                    });
            }
            else
            {
                m_current = 0;
                onInitErrorCallback();
            }
        }
        this.FindSupported = function FindSupported(callbackSuccess)
        {
            FindSupportedImpl(callbackSuccess);
        };
    };
    function Init(postponeInitCallback, onInitErrorCallback)
    {
        var callerProvider = new SupportedCallerProvider(onInitErrorCallback);
        callerProvider.FindSupported(
            function FindSupportedCallback(caller) 
            {
                var injectors = "";
                var pluginsInitData = [];
                for (var runner in runners)
                {
                    if (!Object.prototype.hasOwnProperty.call(runners, runner))
                        continue;
                    if (injectors)
                        injectors += "&";
                    injectors += runner;
                    if (runners[runner].getParameters)
                        pluginsInitData.push({ plugin: runner, parameters: ns.JSONStringify(runners[runner].getParameters()) });
                }
                var initData = 
                    {
                        url: ns.StartLocationHref,
                        plugins: injectors,
                        data: { data: pluginsInitData },
                        isTopLevel: ns.IsTopLevel,
                        pageStartTime: ns.GetPageStartTime()
                    };
                caller.InitCall(
                    initData,
                    function InitCallCallback(initSettings)
                    {
                        ns.IsRtl = initSettings.rtl;
                        ajaxId = initSettings.ajaxId;
                        sessionId = initSettings.sessionId;
                        ns.GetCommandSrc = function GetCommandSrc()
                        {
                            return ns.GetBaseUrl() + initSettings.ajaxId + "/" + initSettings.sessionId;
                        };
                        kaspersyLabSessionInstance = new KasperskyLabSessionClass(caller);
                        ns.SetInterval(function IntervalCallback() { if (!kaspersyLabSessionInstance.IsProductConnected()) postponeInitCallback(onInitErrorCallback); }, 60000);
                        var plugins = initSettings.plugins;
                        if (!plugins)
                        {
                            ns.SessionLog("Empty plugins list recieved on init reponse");
                            return;
                        }
                        for (var i = 0, pluginsCount = plugins.length; i < pluginsCount; ++i)
                        {
                            try
                            {
                                var plugin = plugins[i];
                                var runnerItem = runners[plugin.name];
                                if (runnerItem)
                                {
                                    var settings = null;
                                    if (ns.IsDefined(plugin.settingsJson))
                                        settings = (plugin.settingsJson) ? ns.JSONParse(plugin.settingsJson) : null;
                                    else
                                        settings = plugin.settings;
                                    var localization = ns.IsDefined(plugin.localizationDictionary) 
                                        ? LocalizationObjectFromDictionary(plugin.localizationDictionary) 
                                        : plugin.localization;
                                    runnerItem.runner(KasperskyLab, kaspersyLabSessionInstance, settings, localization);
                                }
                            }
                            catch (e)
                            {
                                ns.SessionError(e);
                            }
                        }
                    },
                    onInitErrorCallback
                    );
            }
            );
    }
    function PostponeInit(onInitErrorCallback)
    {
        var nowPostponeTime = (new Date()).getTime();
        var postponeDelay = (nowPostponeTime - lastPostponedInitTime) > 5000 ? 200 : 60 * 1000;
        lastPostponedInitTime = nowPostponeTime;
        clearTimeout(postponedInitTimeout);
        postponedInitTimeout = ns.SetTimeout(function postponedInitTimerCallback() { Init(PostponeInit, onInitErrorCallback); }, postponeDelay);
    }
    function OnInitError()
    {
        PostponeInit(OnInitError);
        for (var runner in runners)
        {
            if (!Object.prototype.hasOwnProperty.call(runners, runner))
                continue;
            try
            {
                var connectionErrorCallback = runners[runner].onConnectionError;
                if (connectionErrorCallback)
                    connectionErrorCallback();
            }
            catch (e)
            {
                ns.Log(e);
            }
        }
    }
    ns.StartSession = function StartSession()
    {
        Init(PostponeInit, OnInitError);
    };
})(KasperskyLab);
KasperskyLab.AddRunner("wnt", function AddRunnerWnt(ns, session)
{
    function OnPing()
    {
        return ns.MaxRequestDelay;
    }
    function Initialize()
    {
        session.InitializePlugin(function InitializePluginWnt(activatePlugin)
            {
                activatePlugin("wnt", OnPing);
            });
    }
    Initialize();
}, { referrer: document.referrer });
KasperskyLab.AddRunner("wsm", function AddRunnerWsm(ns, session)
{
    if (window !== window.top)
        return;
    var m_callFunction = null;
    var m_activatedState = 0;
    var m_activatedStateChangeTimeout = null;
    var m_documentTitleIsAvailable = false;
    var m_stateChangeDelayTimeout = null;
    var m_processActivate = null;
    function OnPing()
    {
        return ns.MaxRequestDelay;
    }
    function ForceRedirect(args)
    {
        ns.SessionLog("Force reload to address: " + args.url);
        document.location.href = args.url;
    }
    function FireDeactivateEventImpl()
    {
        m_callFunction("wsm.sessionDeactivated", { title: document.title }, function SessionDeactivatedCallback()
        {
            if (m_activatedState === 1)
                m_processActivate();
            m_activatedState = 0;
        });
        m_activatedState = 3;
    }
    function FireDeactivateEvent()
    {
        if (m_documentTitleIsAvailable)
            FireDeactivateEventImpl();
        else
            clearTimeout(m_stateChangeDelayTimeout);
    }
    function ProcessDeactivate()
    {
        clearTimeout(m_activatedStateChangeTimeout);
        m_activatedStateChangeTimeout = ns.SetTimeout(function TimerCallback()
            {
                if (m_activatedState === 2)
                    FireDeactivateEvent();
                else if (m_activatedState === 1)
                    m_activatedState = 3;
            }, 0);
    }
    function FireActivateEventImpl()
    {
        m_callFunction("wsm.sessionActivated", { title: document.title }, function SessionActivatedCallback()
        {
            if (m_activatedState === 3)
                ProcessDeactivate();
            m_activatedState = 2;
        });
        m_activatedState = 1;
    }
    function FireActivateEvent()
    {
        clearTimeout(m_stateChangeDelayTimeout);
        if (m_documentTitleIsAvailable || document.title)
        {
            m_documentTitleIsAvailable = true;
            FireActivateEventImpl();
        }
        else
        {
            m_stateChangeDelayTimeout = ns.SetTimeout(function TimerCallback()
                {
                    m_documentTitleIsAvailable = true;
                    m_processActivate();
                }, 500);
        }
    }
    function ProcessActivate()
    {
        clearTimeout(m_activatedStateChangeTimeout);
        m_activatedStateChangeTimeout = ns.SetTimeout(function TimerCallback()
            {
                if (m_activatedState === 0)
                    FireActivateEvent();
                else if (m_activatedState === 3)
                    m_activatedState = 1;
            }, 0);
    }
    function OnFocus()
    {
        if (m_callFunction)
            ProcessActivate();
    }
    function OnBlur()
    {
        if (m_callFunction && !document.hasFocus())
            ProcessDeactivate();
    }
    function Initialize()
    {
        m_processActivate = ProcessActivate;
        session.InitializePlugin(function InitializePluginWsm(activatePlugin, registerMethod, callFunction)
        {
            m_callFunction = callFunction;
            activatePlugin("wsm", OnPing);
            registerMethod("wsm.forceRedirect", ForceRedirect);
        });
    }
    Initialize();
    if (document.hasFocus())
    {
        FireActivateEvent();
        ns.AddEventListener(window, "load", function OnLoad()
            {
                if (!document.hasFocus())
                    ProcessDeactivate();
            });
    }
    if (window.addEventListener)
    {
        ns.AddEventListener(window, "focus", OnFocus);
        ns.AddEventListener(window, "blur", OnBlur);
    }
    else
    {
        ns.AddEventListener(document, "focusin", OnFocus);
        ns.AddEventListener(document, "focusout", OnBlur);
    }
    ns.AddEventListener(window, "unload", function OnUnload()
        {
            clearTimeout(m_activatedStateChangeTimeout);
            m_activatedStateChangeTimeout = null;
            m_callFunction = null;
        });
    if ("onhashchange" in window)
    {
        window.addEventListener("hashchange", function OnHashchange()
        {
            var args = { newLocationUrl: ns.ToBase64(document.location.href), urlEncrypted: true };
             if (m_callFunction)
                m_callFunction("wsm.onHashChange", args);
        });
    }
}, {
    referrer: document.referrer,
    stubId: (function stubId()
    {
        var scripts = [];
        if (document.querySelectorAll)
        {
            scripts = document.querySelectorAll("[stubid]");
        }
        else
        {
            var allElements = document.getElementsByTagName("*");
            for (var i = 0; i < allElements.length; i++)
            {
                if (allElements[i].getAttribute("stubid") !== null)
                    scripts.push(allElements[i]);
            }
        }
        if (scripts && scripts.length > 0)
            return scripts[0].getAttribute("stubid");
        return "";
    })()
});
KasperskyLab.AddRunner("vs", function AddRunnerVs(ns, session)
{
    var VisitedSites = function VisitedSites()
    {
        var m_callFunction = ns.EmptyFunc;
        var m_domParser = ns.GetDomParser(session);
        var m_subscribedElements = [];
        var m_flags = {
            onPasswordEntered: false,
            onAddressEntered: false,
            onCardEntered: false
        };
        function OnPing()
        {
            return ns.MaxRequestDelay;
        }
        function IsElementSubscribed(element)
        {
            for (var i = 0; i < m_subscribedElements.length; ++i)
            {
                if (m_subscribedElements[i] === element)
                    return true;
            }
            return false;
        }
        function MakeCallFunctionCallback(flag, onKeyDown)
        {
            return function callback()
            {
                m_flags[flag] = true;
                if (m_flags.onPasswordEntered && m_flags.onAddressEntered && m_flags.onCardEntered)
                {
                    ns.RemoveEventListener(document, "keydown", onKeyDown);
                    ns.RemoveEventListener(document, "change", onKeyDown);
                }
                m_callFunction("vs." + flag);
            };
        }
        function MakeCallback(flag, target, onKeyDown)
        {
            if (m_flags[flag] || !target)
                return ns.EmptyFunc;
            var flagCallFunction = MakeCallFunctionCallback(flag, onKeyDown);
            return function Callback(result, selectors)
            {
                if (result || m_flags[flag])
                    return;
                for (var i = 0; i < selectors.length; i++)
                {
                    if (m_flags[flag])
                        return;
                    var element = document.querySelector(selectors[i]);
                    if (window.MutationObserver && element && element.tagName && element.tagName.toLowerCase() !== "input" && !IsElementSubscribed(element))
                    {
                        var mutationObserver = new MutationObserver(flagCallFunction);
                        mutationObserver.observe(element, { childList: true, characterData: true, subtree: true });
                        m_subscribedElements.push(element);
                    }
                    if (element && element === target)
                        flagCallFunction();
                }
            };
        }
        function OnKeyDown(evt)
        {
            try 
            {
                if (!evt || !evt.target || !evt.target.tagName || evt.target.tagName.toLowerCase() !== "input")
                    return;
                m_domParser.GetPasswordSelectors(MakeCallback("onPasswordEntered", evt.target, OnKeyDown));
                m_domParser.GetNewPasswordSelectors(MakeCallback("onPasswordEntered", evt.target, OnKeyDown));
                m_domParser.GetAddressSelectors(MakeCallback("onAddressEntered", evt.target, OnKeyDown));
                m_domParser.GetCardSelectors(MakeCallback("onCardEntered", evt.target, OnKeyDown));
            }
            catch (e)
            {
                ns.SessionError(e, "vs");
            }
        }
        function Initialize()
        {
            session.InitializePlugin(function InitializePluginVs(activatePlugin, registerMethod, callFunction)
                {
                    m_callFunction = callFunction;
                    activatePlugin("vs", OnPing);
                    ns.AddRemovableEventListener(document, "keydown", OnKeyDown);
                    ns.AddRemovableEventListener(document, "change", OnKeyDown);
                });
        }
        Initialize();
    };
    var instance = null;
    ns.RunModule(function RunModuleVisitedSites()
    {
        if (!instance)
            instance = new VisitedSites();
    });
});
(function AbpProcessor(ns)
{
function AddSelectorProcessor(selector, processors) 
{
    if (!selector)
        return;
    var str = ((selector[0] === ">") ? ":scope " : "* ") + selector;
    processors.push(function pusher(objects) 
        {
            var resultObjects = [];
            for (var i = 0; i < objects.length; ++i) 
            {
                var list = objects[i].querySelectorAll(str);
                Array.prototype.push.apply(resultObjects, list);
            }
            return resultObjects;
        });
}
function GetTextInsideBracket(queryParts)
{
    var result = "";
    for (var parentheses = 1; queryParts.index < queryParts.parts.length; ++queryParts.index)
    {
        if (!queryParts.parts[queryParts.index])
            continue;
        var part = queryParts.parts[queryParts.index];
        if (part === ")")
        {
            --parentheses;
            if (!parentheses)
                break;
        }
        else if (part === "(")
        {
            ++parentheses;
        }
        result += part;
    }
    return result;
}
function RemoveChilds(objects)
{
    for (var i = 0; i < objects.length;)
    {
        if (objects.some(
            function checker(element)  
            {
                var object = objects[i];
                if (element === object)
                    return false;
                return element.contains(object);
            }
            ))
            objects.splice(i, 1);
        else
            i++;
    }
}
function PreprocessProperties(properties)
{
    if (properties.length >= 2 && properties[0] === "/" && properties[properties.length - 1] === "/")
        return properties.substring(1, properties.length - 1);
    var props = properties.replace(/\*+/g, "*");
    props = props.replace(/\^\|$/, "^");
    props = props.replace(/\W/g, "\\$&");
    props = props.replace(/\\\*/g, ".*");
    props = props.replace(/^\\\|/, "^");
    return props.replace(/\\\|$/, "$");
}
function GetMatcherFromText(inputText)
{
    try 
    {
        var expression = "";
        var flags = ""; 
        var execResult = (/^\/(.*)\/([imu]*)$/).exec(inputText);
        if (execResult)
        {
            expression = execResult[1];
            if (execResult[2])
                flags = execResult[2];
        }
        else
        {
            expression = inputText.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); 
        }
        return new RegExp(expression, flags);
    }
    catch (e)
    {
        return null;
    }
}
function GetMatchedStylesheetSelectors(stylesheet, propertiesMatcher)
{
    var selectors = [];
    try 
    {
        for (var i = 0; i < stylesheet.cssRules.length; ++i)
        {
            var rule = stylesheet.cssRules[i];
            if (rule.type !== rule.STYLE_RULE)
                continue;
            var properties = "";
            for (var j = 0; j < rule.style.length; j++)
            {
                var propertyName = rule.style.item(j);
                properties += propertyName + ": " + rule.style.getPropertyValue(propertyName) + ";";
            }
            if (!propertiesMatcher.test(properties))
                continue;
            selectors.push(rule.selectorText);
        }
    }
    catch (e)
    {
        return [];
    }
    return selectors;
}
function GetDomStylesStrings(propertiesMatcher)
{
    var matcher = new RegExp(propertiesMatcher, "i");
    var selectorsGroup = "";
    for (var i = 0; i < this.document.styleSheets.length; ++i)
    {
        var matchedSelectors = GetMatchedStylesheetSelectors(this.document.styleSheets[i], matcher);
        for (var selectorIndex = 0; selectorIndex < matchedSelectors.length; ++selectorIndex)
            selectorsGroup += matchedSelectors[selectorIndex] + ", ";
    }
    if (selectorsGroup.length)
        selectorsGroup = selectorsGroup.substring(0, selectorsGroup.length - 2);
    return selectorsGroup;
}
function AbpHasProcessorFactory(queryParts, queryParser)
{
    var innerSelectorsProcessor = queryParser(queryParts);
    return function AbpHasProcessor(objects)
    {
        var resultObjects = [];
        for (var i = 0; i < objects.length; ++i)
        {
            if (innerSelectorsProcessor([objects[i]]).length)
                resultObjects.push(objects[i]);
        }
        return resultObjects;
    };
}
function AbpContainsProcessorFactory(queryParts)
{
    var textInsideBracket = GetTextInsideBracket(queryParts);
    var matcher = GetMatcherFromText(textInsideBracket);
    return function AbpContainsProcessor(objects)
        {
            var resultObjects = [];
            if (!matcher)
                return resultObjects;
            RemoveChilds(objects);
            for (var i = 0; i < objects.length; ++i)
            {
                if (matcher.test(objects[i].textContent))
                    resultObjects.push(objects[i]);
            }
            return resultObjects;
        };
}
function IsObjectPropertiesMatch(object, selectors)
{
    var parent = object.parentNode || document;
    if (object === document)
        return false;
    var selectedObjects = Array.from(parent.querySelectorAll(selectors));
    return selectedObjects.some(function checker(item) { return item === object; });
}
function AbpPopertiesProcessorFactory(queryParts)
{
    var textInsideBracket = GetTextInsideBracket(queryParts);
    var selectorRegexp = PreprocessProperties(textInsideBracket);
    var selectorsGroup = GetDomStylesStrings(selectorRegexp);
    return function AbpPopertiesProcessor(objects)
    {
        var resultObjects = [];
        if (!selectorsGroup)
            return resultObjects;
        for (var i = 0; i < objects.length; ++i)
        {
            var object = objects[i];
            if (IsObjectPropertiesMatch(object, selectorsGroup))
                resultObjects.push(object);
        }
        return resultObjects;
    };
}
function ParseQuery(queryParts)
{
    var functions = [];
    var collectedPart = "";
    for (; queryParts.index < queryParts.parts.length; ++queryParts.index)
    {
        if (!queryParts.parts[queryParts.index])
            continue;
        var part = queryParts.parts[queryParts.index];
        if (part === ")")
            break;
        var processorFactory = void 0;
        if (part === ":-abp-has(")
            processorFactory = AbpHasProcessorFactory;
        else if (part === ":-abp-contains(")
            processorFactory = AbpContainsProcessorFactory;
        else if (part === ":-abp-properties(")
            processorFactory = AbpPopertiesProcessorFactory;
        if (processorFactory)
        {
            ++queryParts.index;
            AddSelectorProcessor(collectedPart, functions);
            collectedPart = "";
            functions.push(processorFactory(queryParts, ParseQuery));
            continue;
        }
        if (part === "(")
        {
            ++queryParts.index;
            part += GetTextInsideBracket(queryParts);
            if (queryParts.index < queryParts.parts.length)
                part += queryParts.parts[queryParts.index];
        }
        collectedPart += part;
    }
    AddSelectorProcessor(collectedPart, functions);
    return function parser(objects)
    {
        var outputObjects = objects;
        for (var i = 0; i < functions.length; ++i)
        {
            var tempObjects = functions[i](outputObjects);
            outputObjects = tempObjects;
        }
        return outputObjects;
    };
}
ns.FindElementsByAbpRule = function FindElementsByAbpRule(abpRule)
{
    var result = [];
    try 
    {
        var partsValues = abpRule.split(/(:-abp-has\()|(:-abp-contains\()|(:-abp-properties\()|(\()|(\))/g);
        var operation = ParseQuery({ parts: partsValues, index: 0 });
        result = operation([document]);
    }
    catch (e)
    {
        ns.SessionError({ message: "ERR processing abp rule", details: "rule: " + abpRule + "\r\n" + (e.message || e) }, "ab_abp");
        return [];
    }
    return result;
};
return ns;
})(KasperskyLab);
function GetCommonLink()
{
    var commonLink = KasperskyLab.GetResourceSrc("/abn/main.css");
    if (!KasperskyLab.IsRelativeTransport())
        return commonLink;
    return "/" + commonLink.substr(KasperskyLab.GetBaseUrl().length);
}
function FindCommonLink()
{
    if (document.querySelector)
        return document.querySelector("link[href^=\"" + GetCommonLink() + "\"]");
    for (var i = 0; i < document.styleSheets.length; ++i)
    {
        var currentStyleSheet = document.styleSheets[i];
        if (currentStyleSheet.href && currentStyleSheet.href.indexOf(GetCommonLink()) !== -1)
            return document.styleSheets[i].ownerNode || document.styleSheets[i].owningElement;
    }
    return null;
}
var abnRunner = function abnRunner(ns, session, settings)
{
    function AntiBanner()
    {
        var m_callFunction = ns.EmptyFunc;
        var m_usingStyles = [];
        var m_deferredProcess = null;
        var m_processedIdentifier = "kl_abn_" + ns.GetCurrentTime();
        var m_firstRun = true;
        var m_randColorAttribute = settings.randomColor;
        var m_randBackgroundColorAttribute = settings.randomBackgroundColor;
        var m_observer = null;
        var m_abpRulesApplyTimeout = null;
        function OnPing()
        {
            return ns.MaxRequestDelay;
        }
        function GetOwnerNode(sheet)
        {
            return sheet.ownerNode || sheet.owningElement;
        }
        function GetStyleSheetFromNode(node)
        {
            return node.sheet || node.styleSheet;
        }
        function AddAntiBannerStyleSheet(styleSheet)
        {
            if (!styleSheet)
                return;
            m_usingStyles.push(styleSheet);
        }
        function AddUsingStyle(sheetNodes)
        {
            for (var i = 0; i < document.styleSheets.length; ++i)
            {
                var ownerNode = GetOwnerNode(document.styleSheets[i]);
                if (sheetNodes.indexOf(ownerNode) !== -1)
                    AddAntiBannerStyleSheet(document.styleSheets[i]);
            }
        }
        function SendAntibannerStat(newProcessedCount)
        {
            if (m_firstRun || newProcessedCount !== 0)
            {
                m_callFunction("abn.statInfo", { count: newProcessedCount });
                m_firstRun = false;
            }
        }
        function ApplyAbpRulesDelay(rule)
        {
            ns.SetTimeout(function ApplyAbpRulesTimerCallback()
                {
                    var elements = ns.FindElementsByAbpRule(rule);
                    var newProcessedCount = 0;
                    for (var i = 0; i < elements.length; ++i)
                    {
                        if (!elements[i][m_processedIdentifier])
                        {
                            elements[i][m_processedIdentifier] = true;
                            elements[i].style.display = "none";
                            ++newProcessedCount;
                        }
                    }
                    if (newProcessedCount)
                        SendAntibannerStat(newProcessedCount);
                }, 0);
        }
        function ApplyAbpRules(rules)
        {
            if (!ns.FindElementsByAbpRule)
            {
                ns.SessionError("Function for abp rules is not defined", "ab_abp");
                return;
            }
            for (var i = 0; i < rules.length; i++)
                ApplyAbpRulesDelay(rules[i]);
        }
        function CalculateNewProcessedItemsBySelector(selector)
        {
            var newProcessedCount = 0;
            var elementList = document.querySelectorAll(selector);
            for (var i = 0; i < elementList.length; ++i)
            {
                if (!elementList[i][m_processedIdentifier])
                {
                    elementList[i][m_processedIdentifier] = true;
                    ++newProcessedCount;
                }
            }
            return newProcessedCount;
        }
        function DeferredProcessCssRules(rules, i)
        {
            try
            {
                SendAntibannerStat(CalculateNewProcessedItemsBySelector(rules[i].selectorText));
            }
            catch (e)
            {
                e.details = "number: " + i + "\r\nrule: " + rules[i].selectorText;
                ns.SessionError(e, "abn");
            }
        }
        function GetDeferredHandler(rules, i)
        {
            return function GetDeferredHandlerImpl() { DeferredProcessCssRules(rules, i); };
        }
        function ProcessCssRules(rules)
        {
            for (var i = 0; i < rules.length; ++i)
                ns.SetTimeout(GetDeferredHandler(rules, i), 0);
        }
        function CalculateNewProcessedItemsByStyle()
        {
            var newProcessedCount = 0;
            var elementList = document.getElementsByTagName("*");
            for (var i = 0; i < elementList.length; ++i)
            {
                if (!elementList[i][m_processedIdentifier]
                    && elementList[i].currentStyle.color === m_randColorAttribute
                    && elementList[i].currentStyle.backgroundColor === m_randBackgroundColorAttribute)
                {
                    elementList[i][m_processedIdentifier] = true;
                    ++newProcessedCount;
                }
            }
            return newProcessedCount;
        }
        function CalculateNewProcessedItems()
        {
            if (document.querySelectorAll)
            {
                var atLeastOneStyleExist = false;
                for (var i = 0; i < m_usingStyles.length; ++i)
                {
                    var cssRules = m_usingStyles[i].cssRules || m_usingStyles[i].rules;
                    if (cssRules && cssRules.length)
                    {
                        ProcessCssRules(cssRules);
                        atLeastOneStyleExist = true;
                    }
                }
                if (!atLeastOneStyleExist)
                {
                    SendAntibannerStat(0);
                    ns.SessionLog("No one style exist. Count of using styles nodes: " + m_usingStyles.length);
                }
            }
            else
            {
                SendAntibannerStat(CalculateNewProcessedItemsByStyle());
            }
        }
        function ScheduleCalculateProcessedItems()
        {
            clearTimeout(m_deferredProcess);
            m_deferredProcess = ns.SetTimeout(CalculateNewProcessedItems, 500);
        }
        function SetCss(rules)
        {
            if (rules)
            {
                if (rules.rules)
                {
                    var sheetNodes = ns.AddStyles(rules.rules);
                    ns.SetTimeout(function SetCssTimerCallback() { AddUsingStyle(sheetNodes); }, 0);
                }
                if (rules.abpRules && rules.abpRules.length)
                {
                    var applyRulesFunc = function ApplyAbpRulesFunc() { ApplyAbpRules(rules.abpRules); };
                    applyRulesFunc();
                    ns.AddEventListener(window, "load", applyRulesFunc);
                    if (m_observer)
                        m_observer.Stop();
                    m_observer = ns.GetDomChangeObserver("*");
                    m_observer.Start(function AntiBannerMutationObserver()
                        {
                            clearTimeout(m_abpRulesApplyTimeout);
                            m_abpRulesApplyTimeout = ns.SetTimeout(applyRulesFunc, 2000);
                        });
                }
            }
            ScheduleCalculateProcessedItems();
        }
        function OnLoadCommonCss(arg)
        {
            var target = arg.target || arg.srcElement;
            var sheetNode = GetStyleSheetFromNode(target);
            if (!sheetNode)
            {
                ns.SessionError("OnLoadCommonCss fail with not exist sheet", "abn");
                return;
            }
            AddAntiBannerStyleSheet(sheetNode);
            ScheduleCalculateProcessedItems();
        }
        session.InitializePlugin(
            function InitializePluginABN(activatePlugin, registerMethod, callFunction)
            {
                m_callFunction = callFunction;
                activatePlugin("abn", OnPing);
            }
            );
        var commonLink = FindCommonLink();
        if (commonLink)
        {
            ns.AddEventListener(commonLink, "load", OnLoadCommonCss);
            var sheetNode = GetStyleSheetFromNode(commonLink);
            if (sheetNode)
                AddAntiBannerStyleSheet(sheetNode);
        }
        else
        {
            ns.SessionLog("Not found inserted common link", "abn");
        }
        if (settings.insertCommonLink)
        {
            var link = document.createElement("link");
            link.setAttribute("type", "text/css");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("href", ns.GetResourceSrc("/abn/main.css"));
            link.setAttribute("crossorigin", "anonymous");
            ns.AddEventListener(link, "load", OnLoadCommonCss);
            if (document.head)
                document.head.appendChild(link);
            else
                document.getElementsByTagName("head")[0].appendChild(link);
        }
        SetCss(settings);
    }
    var instance = null;
    ns.RunModule(function RunModuleAB()
    {
        if (!instance)
            instance = new AntiBanner();
    });
};
var abnOptions = {
    name: "abn",
    runner: abnRunner,
    getParameters: function getParameters() { return { isCssUrlInjected: Boolean(FindCommonLink()) }; }
};
KasperskyLab.AddRunner2(abnOptions);
(function UrlAdvisorBalloonMain(ns)
{
ns.UrlAdvisorBalloon = function UrlAdvisorBalloon(session, locales)
{
    var m_balloon = null;
    var m_currentVerdict = null;
    var m_mouseX = 0;
    var m_mouseY = 0;
    var ratingIds = [
        { className: "green", headerNode: locales["UrlAdvisorBalloonHeaderGood"], textNode: locales["UrlAdvisorSetLocalContentOnlineGood"] },
        { className: "grey", headerNode: locales["UrlAdvisorBalloonHeaderSuspicious"], textNode: locales["UrlAdvisorSetLocalContentOnlineSuspicious"] },
        { className: "red", headerNode: locales["UrlAdvisorBalloonHeaderDanger"], textNode: locales["UrlAdvisorSetLocalContentOnlineDanger"] },
        { className: "yellow", headerNode: locales["UrlAdvisorBalloonHeaderWmuf"], textNode: locales["UrlAdvisorSetLocalContentOnlineWmuf"] },
        { className: "orange", headerNode: locales["UrlAdvisorBalloonHeaderCompromised"], textNode: locales["UrlAdvisorSetLocalContentOnlineCompromised"] }
    ];
    function OnCloseHandler(arg)
    {
        if (arg === 0)
            m_balloon.Hide();
    }
    function OnDataReceiveHandler()
    {
    }
    function GetCoord(balloonSize, clientX, clientY)
    {
        var coord = { x: 0, y: 0 };
        var clientWidth = ns.GetPageWidth();
        var halfWidth = balloonSize.width / 2;
        if (halfWidth > clientX)
            coord.x = 0;
        else if (halfWidth + clientX > clientWidth)
            coord.x = clientWidth - balloonSize.width;
        else
            coord.x = clientX - halfWidth;
        var clientHeight = ns.GetPageHeight();
        coord.y = (clientY + balloonSize.height > clientHeight) ? clientY - balloonSize.height : clientY;
        if (coord.y < 0)
            coord.y = 0;
        var scroll = ns.GetPageScroll();
        coord.y += scroll.top;
        coord.x += scroll.left;
        return coord;
    }
    function GetCoordsCallback(balloonSize)
    {
        return GetCoord(balloonSize, m_mouseX, m_mouseY);
    }
    this.HideBalloon = function HideBalloon()
    {
        m_balloon.Hide();
    };
    this.ShowBalloon = function ShowBalloon(clientX, clientY, verdict)
    {
        m_mouseX = clientX;
        m_mouseY = clientY;
        m_currentVerdict = verdict;
        m_balloon.Show(ratingIds[m_currentVerdict.rating - 1].className + " " + ns.md5(verdict.url), { verdict: m_currentVerdict, locales: locales });
    };
    m_balloon = new ns.Balloon2("ua", "/ua/url_advisor_balloon.html", "/ua/balloon.css", session, GetCoordsCallback, OnCloseHandler, locales, OnDataReceiveHandler);
};
})(KasperskyLab || {});
var PostponeCheckAtributeName = "kl_" + KasperskyLab.GetCurrentTime();
var IconName = "kl_" + KasperskyLab.GetCurrentTime();
KasperskyLab.AddRunner("ua", function AddRunnerUa(ns, session, settings, locales)
{
var UrlAdvisor = function UrlAdvisor()
{
    var m_urlAdvisorBalloon = new ns.UrlAdvisorBalloon(session, locales);
    var m_enabled = settings.enable;
    var m_checkOnlySearchResults = settings.mode;
    var m_linkSelector = settings.linkSelector;
    var m_elementAfterSelector = settings.elementAfterSelector;
    var m_emptySearchResultSent = false;
    var m_isVerdictSuitableForContinueFunc = function AlwaysSuitable() { return true; };
    var m_postponeCategorizeStarted = false;
    var m_urlCategorizeRequestTime = 0;
    var m_observer = null;
    var m_callFunction = ns.EmptyFunc;
    var m_categorizingObjects = {};
    var m_clearCategorizingObjectsTimerId = null;
    function AddToCategorizeList(url, linkElement)
    {
        if (url in m_categorizingObjects)
            m_categorizingObjects[url].push(linkElement);
        else
            m_categorizingObjects[url] = [linkElement];
    }
    function OnPing(currentTime)
    {
        var timeFormRequest = (currentTime >= m_urlCategorizeRequestTime) ? currentTime - m_urlCategorizeRequestTime : 0;
        return timeFormRequest <= 10000 ? 500 : ns.MaxRequestDelay;
    }
    function GetHref(link)
    {
        try { return link.href; } 
        catch (e) {}
        try { return link.getAttribute("href"); } 
        catch (e) {}
        return "";
    }
    function CreateIcon()
    {
        var icon = document.createElement("img");
        icon.name = IconName;
        icon.width = 16;
        icon.height = 16;
        icon.style.cssText = "width: 16px!important; height: 16px!important;display: inline !important;";
        icon.onclick = function onclick(evt) { ns.StopProcessingEvent(evt); };
        return icon;
    }
    function GetLinkIcon(linkElement)
    {
        var nextElement = linkElement.nextSibling;
        if (m_elementAfterSelector)
        {
            nextElement = linkElement.querySelector(m_elementAfterSelector);
            if (nextElement)
                nextElement = nextElement.nextSibling;
            else
                nextElement = linkElement.nextSibling;
        }
        return (nextElement !== null && nextElement.name === IconName) ? nextElement : null;
    }
    function GetOrCreateLinkIcon(linkElement)
    {
        var icon = GetLinkIcon(linkElement);
        if (icon)
            return icon;
        var nextElement = linkElement;
        if (m_elementAfterSelector)
        {
            nextElement = linkElement.querySelector(m_elementAfterSelector);
            if (!nextElement)
                nextElement = linkElement;
        }
        nextElement.parentNode.insertBefore(CreateIcon(), nextElement.nextSibling);
        return nextElement.nextSibling;
    }
    function GetLinkElementByIcon(icon)
    {
        if (!m_elementAfterSelector)
            return icon.previousSibling;
        var searchLinks = document.querySelectorAll(m_linkSelector);
        for (var i = 0; i < searchLinks.length; i++)
        {
            var elem = searchLinks[i].querySelector(m_elementAfterSelector);
            if (searchLinks[i].nextSibling === icon || (elem && elem.nextSibling === icon))
                return searchLinks[i];
        }
        return icon.previousSibling;
    }
    function UpdateIconImage(icon, verdict)
    {
        if (verdict.rating === 1)
        {
            icon.src = locales["UrlAdvisorGoodImage.png"];
            icon["kis_status"] = 16;
        }
        else if (verdict.rating === 2)
        {
            icon.src = locales["UrlAdvisorSuspiciousImage.png"];
            icon["kis_status"] = 8;
        } 
        else if (verdict.rating === 3)
        {
            icon.src = locales["UrlAdvisorDangerImage.png"];
            icon["kis_status"] = 4;
        }
        else if (verdict.rating === 4)
        {
            icon.src = locales["UrlAdvisorwmufImage.png"];
        }
        else if (verdict.rating === 5)
        {
            icon.src = locales["UrlAdvisorCompromisedImage.png"];
        }
    }
    function SubscribeIconOnMouseEvents(icon, verdict)
    {
        var balloonTimerId = 0;
        ns.AddEventListener(icon, "mouseout", function OnMouseout()
            {
                if (balloonTimerId)
                {
                    clearTimeout(balloonTimerId);
                    balloonTimerId = 0;
                }
            });
        ns.AddEventListener(icon, "mouseover", function OnMouseover(args)
            {
                if (!balloonTimerId)
                {
                    var clientX = args.clientX;
                    var clientY = args.clientY;
                    balloonTimerId = ns.SetTimeout(function TimerCallback()
                        {
                            m_urlAdvisorBalloon.ShowBalloon(clientX, clientY, verdict);
                            balloonTimerId = 0;
                        }, 300);
                }
            });
    }
    function IsElementEmpty(linkElement)
    {
        return !linkElement.offsetHeight && !linkElement.offsetWidth
            && !linkElement.outerText && !linkElement.text;
    }
    function SetVerdictForUrl(verdict)
    {
        try
        {
            if (!(verdict.url in m_categorizingObjects))
                return;
            var linkElements = m_categorizingObjects[verdict.url];
            for (var linkIndex = 0; linkIndex < linkElements.length; ++linkIndex)
            {
                if (IsElementEmpty(linkElements[linkIndex]))
                    continue;
                linkElements[linkIndex][PostponeCheckAtributeName] = false;
                if (!m_isVerdictSuitableForContinueFunc(verdict))
                    continue;
                var icon = GetOrCreateLinkIcon(linkElements[linkIndex]);
                if (!icon)
                    continue;
                UpdateIconImage(icon, verdict);
                SubscribeIconOnMouseEvents(icon, verdict);
            }
        }
        catch (e)
        {
            ns.SessionError(e, "ua");
        }
        delete m_categorizingObjects[verdict.url];
    }
    function SetVerdict(argument)
    {
        for (var currentVerdict = 0; currentVerdict < argument.verdicts.length; currentVerdict++)
            SetVerdictForUrl(argument.verdicts[currentVerdict]);
    }
    function SetVerdictDelayed(argument)
    {
        ns.SetTimeout(function TimerCallback() { SetVerdict(argument); }, 1000);
    }
    function SetSettingsImpl(argument)
    {
        m_enabled = argument.enable;
        if (!m_enabled)
            return;
        m_checkOnlySearchResults = argument.mode;
    }
    function ClearImages()
    {
        var images = document.getElementsByName(IconName);
        while (images.length > 0)
            images[0].parentNode.removeChild(images[0]);
    }
    function ClearAttributes()
    {
        for (var i = 0; i < document.links.length; ++i)
        {
            if (document.links[i][PostponeCheckAtributeName])
                document.links[i][PostponeCheckAtributeName] = false;
        }
    }
    function IsNeedCategorizeLink(linkElement)
    {
        try
        {
            return !linkElement.isContentEditable && Boolean(linkElement.parentNode)
                && !GetLinkIcon(linkElement) && !linkElement[PostponeCheckAtributeName]
                && !IsElementEmpty(linkElement);
        }
        catch (e)
        {
            ns.SessionLog("check link exception: " + (e.message || e));
            return false;
        }
    }
    function CategorizeUrl()
    {
        try
        {
            if (!m_enabled)
            {
                ns.SessionLog("skip categorize links because UA disabled");
                return;
            }
            ns.SessionLog("UA: collect links for categorize");
            m_postponeCategorizeStarted = false;
            var linksForCategorize = [];
            var linksForCheck = [];
            if (!m_checkOnlySearchResults)
                linksForCheck = document.links;
            else if (m_linkSelector && m_checkOnlySearchResults)
                linksForCheck = document.querySelectorAll(m_linkSelector);
            for (var i = 0; i < linksForCheck.length; i++)
            {
                var link = linksForCheck[i];
                if (IsNeedCategorizeLink(link))
                {
                    link[PostponeCheckAtributeName] = true; 
                    var href = GetHref(link);
                    if (href)
                    {
                        linksForCategorize.push(href); 
                        AddToCategorizeList(href, link);
                    } 
                    else 
                    {
                        ns.Log("access to href blocked by browser"); 
                    }
                }
            }
            var isEmptySearchResult = m_linkSelector && m_checkOnlySearchResults && linksForCheck.length === 0;
            if (isEmptySearchResult || linksForCategorize.length)
            {
                if (isEmptySearchResult)
                {
                    if (m_emptySearchResultSent)
                        return;
                    m_emptySearchResultSent = true;
                }
                var args = { links: linksForCategorize };
                for (var j = 0; j < args.links.length; j++)
                    args.links[j] = ns.ToBase64(args.links[j]);
                args.urlEncrypted = true;
                m_callFunction("ua.categorize", args);
                m_urlCategorizeRequestTime = ns.GetCurrentTime();
                clearTimeout(m_clearCategorizingObjectsTimerId);
                m_clearCategorizingObjectsTimerId = ns.SetTimeout(function TimerCallback()
                {
                    m_categorizingObjects = {};
                }, 1000 * 60 * 5);
            }
            else
            {
                ns.SessionLog("UA not found links for categorization");
            }
        }
        catch (e)
        {
            ns.SessionError(e, "ua");
        }
    }
    function ProcessDomChange()
    {
        try
        {
            ns.SessionLog("UA: Process dom change");
            if (!m_postponeCategorizeStarted)
            {
                ns.SetTimeout(CategorizeUrl, 500);
                m_postponeCategorizeStarted = true;
            }
            var images = document.getElementsByName(IconName);
            for (var i = 0; i < images.length; ++i)
            {
                var linkNode = GetLinkElementByIcon(images[i]);
                if (!linkNode || !linkNode.nodeName || linkNode.nodeName.toLowerCase() !== "a")
                {
                    var imageNode = images[i];
                    imageNode.parentNode.removeChild(imageNode);
                }
            }
        }
        catch (e)
        {
            ns.SessionError(e, "ua");
        }
    }
    function SetSettings(argument)
    {
        ClearImages();
        ClearAttributes();
        SetSettingsImpl(argument);
        CategorizeUrl();
    }
    function Run()
    {
        CategorizeUrl();
        m_observer = ns.GetDomChangeObserver("a");
        m_observer.Start(ProcessDomChange);
        ns.AddEventListener(window, "load", CategorizeUrl);
    }
    session.InitializePlugin(function InitializePluginUa(activatePlugin, registerMethod, callFunction) 
        {
            m_callFunction = callFunction;
            if (settings.needCheckVerdicts)
            {
                m_isVerdictSuitableForContinueFunc = function CheckVerdict(verdict) 
                    {
                        return verdict.rating === 3 || verdict.rating === 4 || verdict.rating === 5;
                    };
            }
            activatePlugin("ua", OnPing);
            registerMethod("ua.verdict", SetVerdictDelayed);
            registerMethod("ua.settings", SetSettings);
        });
    Run();
};
var instance = null;
ns.RunModule(function RunModuleUrlAdvisor()
{
    if (!instance)
        instance = new UrlAdvisor();
}, 2500);
});
KasperskyLab.AddRunner("cb", function AddRunnerCB(ns, session)
{
    function ContentBlocker()
    {
        var m_idleStartTime = ns.GetCurrentTime();
        var m_callFunction = ns.EmptyFunc;
        function OnPing(currentTime)
        {
            var idleTime = (currentTime >= m_idleStartTime) ? currentTime - m_idleStartTime : 0;
            return idleTime <= 10000 ? 500 : ns.MaxRequestDelay;
        }
        function ReloadUrl()
        {
            m_idleStartTime = ns.GetCurrentTime();
            session.Reload();
        }
        function blockImageByPath(url, blockImageResponse)
        {
            var endsWithUrl = function endsWithUrl(pattern)
                {
                    var d = pattern.length - url.length;
                    return d >= 0 && pattern.lastIndexOf(url) === d;
                };
            var images = document.getElementsByTagName("img");
            for (var i = 0; i !== images.length; ++i)
            {
                if (endsWithUrl(images[i].src) && images[i].style.display !== "none")
                {
                    images[i].style.display = "none";
                    ++blockImageResponse.blockedImagesCount;
                }
            }
        }
        function BlockImage(blockImageRequest)
        {
            var blockImageResponse = { blockedImagesCount: 0, requestId: "" };
            var SendResponse = function SendResponseImpl() 
            {
                m_callFunction("cb.BlockResults", blockImageResponse);
                SendResponse = ns.EmptyFunc;
            };
            try
            {
                blockImageResponse.requestId = blockImageRequest.requestId;
                for (var i = 0; i !== blockImageRequest.urls.length; ++i)
                    blockImageByPath(blockImageRequest.urls[i], blockImageResponse);
                SendResponse();
            }
            catch (e)
            {
                SendResponse();
                throw e;
            }
        }
        session.InitializePlugin(function InitializePluginContentBlocker(activatePlugin, registerMethod, callFunction, deactivatePlugin)
        {
            m_callFunction = callFunction;
            activatePlugin("cb", OnPing);
            registerMethod("cb.reloadUrl", ReloadUrl);
            registerMethod("cb.blockImage", BlockImage);
            registerMethod("cb.shutdown",
                function ShutdownCB()
                {
                    deactivatePlugin("cb");
                });
        });
    }
    var m_contentBlocker = new ContentBlocker(); 
});
(function DomParserMain(ns)
{
function DomParser(session)
{
    var m_callFunction = ns.EmptyFunc;
    var m_logins = [];
    var m_passwords = [];
    var m_newPasswords = [];
    var m_address = [];
    var m_card = [];
    var m_cachedFlag = false;
    var m_pathName = document.location.pathname;
    var m_selectorsRequested = false;
    var m_callbacksQueue = [];
    function OnGetFieldsCallback(result, selectors)
    {
        if (result === 0 && selectors)
        {
            if (selectors.loginSelectors)
                Array.prototype.push.apply(m_logins, selectors.loginSelectors);
            if (selectors.passwordSelectors)
                Array.prototype.push.apply(m_passwords, selectors.passwordSelectors);
            if (selectors.newPasswordSelectors)
                Array.prototype.push.apply(m_newPasswords, selectors.newPasswordSelectors);
            if (selectors.addressSelectors)
                Array.prototype.push.apply(m_address, selectors.addressSelectors);
            if (selectors.cardSelectors)
                Array.prototype.push.apply(m_card, selectors.cardSelectors);
            m_cachedFlag = true;
        }
        m_selectorsRequested = false;
        for (var i = 0; i < m_callbacksQueue.length; ++i)
            m_callbacksQueue[i](result);
    }
    function CleanupElements()
    {
        if (!document.querySelectorAll)
            return;
        var elements = document.querySelectorAll("[wfd-id],[wfd-value],[wfd-invisible]");
        for (var i = 0; i < elements.length; ++i)
        {
            var element = elements[i];
            if (element.hasAttribute("wfd-id"))
                element.removeAttribute("wfd-id");
            if (element.hasAttribute("wfd-value"))
                element.removeAttribute("wfd-value");
            if (element.hasAttribute("wfd-invisible"))
                element.removeAttribute("wfd-invisible");
        }
    }
    function CallService(argObject)
    {
        m_callFunction("dp.onGetFields", argObject, OnGetFieldsCallback);
        CleanupElements();
    }
    function IsVisible(element)
    {
        var style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
        return style.display !== "none";
    }
    function ProcessChilds(childNodes)
    {
        for (var i = 0; i < childNodes.length; ++i)
        {
            var element = childNodes[i];
            if (element.nodeType !== Node.ELEMENT_NODE)
                continue;
            if (!IsVisible(element))
                element.setAttribute("wfd-invisible", true);
            else
                ProcessChilds(element.childNodes);
        }
    }
    function ProcessNextGroupElement(tree, finishCallback)
    {
        var counter = 0;
        while (tree.nextNode())
        {
            ++counter;
            tree.currentNode.setAttribute("wfd-invisible", true);
            if (counter === 100)
            {
                ns.SetTimeout(function TimerCallback() { ProcessNextGroupElement(tree, finishCallback); }, 0);
                return;
            }
        }
        finishCallback();
    }
    function GetSelectorsWithTreeWalker()
    {
        if (!document.body)
        {
            ns.AddEventListener(window, "load", GetSelectorsWithTreeWalker);
            return;
        }
        var filter = {
            acceptNode: function acceptNode(node)
            {
                if (node && node.parentNode && node.parentNode.getAttribute("wfd-invisible") === true)
                    return NodeFilter.FILTER_REJECT;
                if (node && !IsVisible(node))
                    return NodeFilter.FILTER_ACCEPT;
                return NodeFilter.FILTER_SKIP;
            }
        };
        var tree = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, filter.acceptNode, false);
        function finishCallback()
        {
            CallService({ dom: "<body>" + document.body.innerHTML + "</body>" });
        }
        ProcessNextGroupElement(tree, finishCallback);
    }
    function GetSelectorsFromService()
    {
        try
        {
            ProcessChilds(document.body.childNodes);
        }
        catch (e)
        {
            ns.SessionLog(e);
        }
        CallService({ dom: document.documentElement.innerHTML });
    }
    function GetSelectorsInternal(callback, selectors)
    {
        if (m_cachedFlag)
        {
            if (selectors.length > 0)
                callback(0, selectors);
            return;
        }
        function clientCallback(result) { callback(result, selectors); }
        m_callbacksQueue.push(clientCallback);
        if (!m_selectorsRequested)
        {
            m_selectorsRequested = true;
            if (document.createTreeWalker)
                GetSelectorsWithTreeWalker();
            else
                GetSelectorsFromService();
        }
    }
    function AddWfdAttribute(input, settings)
    {
        try
        {
            if (!input || !input.value)
                return;
            if (settings && settings.avoidTypes && input.type && settings.avoidTypes.includes(input.type))
                return;
            if (input.type === "password")
                return;
            input.setAttribute("wfd-value", ns.ToBase64(input.value));
        }
        catch (e)
        {
            ns.SessionLog(e);
        }
    }
    this.GetLoginSelectors = function GetLoginSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_logins);
    };
    this.GetPasswordSelectors = function GetPasswordSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_passwords);
    };
    this.GetNewPasswordSelectors = function GetNewPasswordSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_newPasswords);
    };
    this.GetAddressSelectors = function GetAddressSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_address);
    };
    this.GetCardSelectors = function GetCardSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_card);
    };
    this.GetHtmlWithWfd = function GetHtmlWithWfd(settings)
    {
        var inputs = document.getElementsByTagName("input");
        if (inputs)
        {
            for (var i = 0; i < inputs.length; i++)
                AddWfdAttribute(inputs[i], settings);
        }
        if (settings && settings.wfdIdSelector)
        {
            var elements = document.querySelectorAll(settings.wfdIdSelector);
            if (elements)
            {
                var count = 1;
                for (var j = 0; j < elements.length; j++)
                {
                    elements[j].setAttribute("wfd-id", count);
                    count++;
                }
            }
        }
        return document.documentElement.innerHTML;
    };
    function OnPing()
    {
        return ns.MaxRequestDelay;
    }
    function OnInitializeCallback(activatePlugin, registerMethod, callFunction)
    {
        m_callFunction = callFunction;
        activatePlugin("dp", OnPing);
    }
    function ResetCacheFlag()
    {
        m_cachedFlag = false;
    }
    function UpdateLocationPathName()
    {
        if (m_pathName !== document.location.pathname) 
        {
            m_pathName = document.location.pathname;
            ResetCacheFlag();
        }
    }
    var m_originalPushState = ns.EmptyFunc;
    function PushStateWrapper()
    {
        m_originalPushState.apply(window.history, [].slice.call(arguments));
        ResetCacheFlag();
    }
    function InitializePlugin()
    {
        session.InitializePlugin(OnInitializeCallback);
        ns.AddEventListener(window, "popstate", ResetCacheFlag);
        ns.AddEventListener(document, "load", UpdateLocationPathName);
        if (window.history && window.history.pushState)
        {
            m_originalPushState = window.history.pushState;
            window.history.pushState = PushStateWrapper;
        }
    }
    InitializePlugin();
}
var gDomParser = null;
ns.GetDomParser = function GetDomParser(session)
{
    if (!gDomParser)
        gDomParser = new DomParser(session);
    return gDomParser;
};
return ns;
})(KasperskyLab);
var oldFetch = window.fetch;
var xhrProxyEnabled = true;
var processPostAjaxInSession = KasperskyLab.EmptyFunc;
var functionBind = Function.prototype.bind;
function NormalizeUrl(url)
{
    var e = document.createElement("a");
    e.href = url;
    return e.href;
}
function IsInternalUrl(url)
{
    return KasperskyLab.IsRelativeTransport() ? false : url.indexOf(KasperskyLab.PREFIX) === 0;
}
var oldRequest = void 0;
function fetchCallImpl()
{
    var clsNew = function clsNew(Cls)
    {
        return new (functionBind.apply(Cls, arguments))();
    };
    var args = [].slice.call(arguments);
    args.unshift(oldRequest);
    var request = clsNew.apply(this, args);
    if (xhrProxyEnabled && !KasperskyLab.IsCorsRequest(request.url, document.location.href))
        request.headers.append(KasperskyLab.RequestCustomHeader, "Ajax_Request");
    return oldFetch.apply(this, [request]);
}
if (oldFetch)
{
    oldRequest = Request;
    var oldFunctionToString = Function.prototype.toString;
    window.fetch = function fetch() { return fetchCallImpl.apply(this, [].slice.call(arguments)); };
    window.fetch.toString = function toString() { return oldFunctionToString.apply(oldFetch, [].slice.call(arguments)); };
}
var m_requests = {};
var m_idCounter = 0;
function addDescriptor(requestDescriptor)
{
    var id = ++m_idCounter;
    KasperskyLab.SetTimeout(function TimerCallback()
    {
        delete m_requests[id];
    }, 60 * 1000);
    m_requests[id] = requestDescriptor;
}
function findRequestDescriptor(request)
{
    for (var index in m_requests)
    {
        if (m_requests[index].request === request)
            return m_requests[index];
    }
    return null;
}
function deleteDescriptor(request)
{
    for (var index in m_requests)
    {
        if (m_requests[index].request === request)
            delete m_requests[index];
    }
}
function xhrOpenProcessor()
{
    try
    {
        if (xhrProxyEnabled && arguments.length > 1 && typeof (arguments[0]) === "string")
        {
            var requestDescriptor = { request: this, isCORS: KasperskyLab.IsCorsRequest(arguments[1], document.location.href) };
            if (requestDescriptor.isCORS && arguments[0].toLowerCase() === "post" && !IsInternalUrl(NormalizeUrl(arguments[1])))
            {
                var sendCallback = processPostAjaxInSession.apply(this, [].slice.call(arguments));
                if (sendCallback)
                    requestDescriptor.RequestSend = sendCallback;
            }
            addDescriptor(requestDescriptor);
        }
    }
    catch (e)
    {
        KasperskyLab.SessionError(e, "xhr");
    }
    try
    {
        KasperskyLab.XMLHttpRequestOpen.apply(this, [].slice.call(arguments));
    }
    catch (err)
    {
        err.klSkipUnhandled = true;
        throw err;
    }
}
function xhrSetRequestHeaderProcessor()
{
    try
    {
        if (arguments.length && typeof arguments[0] === "string" && arguments[0].toLowerCase().indexOf(KasperskyLab.RequestCustomHeader.toLowerCase()) === 0)
        {
            var requestDescriptor = findRequestDescriptor(this);
            if (requestDescriptor)
            {
                requestDescriptor.headerSet = true;
                delete requestDescriptor.RequestSend;
            }
            else
            {
                requestDescriptor = { request: this, headerSet: true };
                addDescriptor(requestDescriptor);
            }
        }
    }
    catch (e)
    {
        KasperskyLab.SessionError(e, "xhr");
    }
    try
    {
        return KasperskyLab.XMLHttpRequestSetRequestHeader.apply(this, [].slice.call(arguments));
    }
    catch (err)
    {
        err.klSkipUnhandled = true;
        throw err;
    }
}
function xhrSendProcessor()
{
    try
    {
        var requestDescriptor = findRequestDescriptor(this);
        if (xhrProxyEnabled && requestDescriptor)
        {
            deleteDescriptor(this);
            if (!requestDescriptor.isCORS && !requestDescriptor.headerSet)
                KasperskyLab.XMLHttpRequestSetRequestHeader.apply(this, [KasperskyLab.RequestCustomHeader, "Ajax_Request"]);
            if (requestDescriptor.RequestSend)
            {
                requestDescriptor.RequestSend.apply(this, [].slice.call(arguments));
                return;
            }
        }
    }
    catch (e)
    {
        KasperskyLab.SessionError(e, "xhr");
    }
    try
    {
        KasperskyLab.XMLHttpRequestSend.apply(this, [].slice.call(arguments));
    }
    catch (err)
    {
        err.klSkipUnhandled = true;
        throw err;
    }
}
if (KasperskyLab.XMLHttpRequestSend)
{
    window.XMLHttpRequest.prototype.open = function open()
    {
        return xhrOpenProcessor.apply(this, [].slice.call(arguments));
    };
    window.XMLHttpRequest.prototype.send = function send()
    {
        xhrSendProcessor.apply(this, [].slice.call(arguments));
    };
    window.XMLHttpRequest.prototype.setRequestHeader = function setRequestHeader()
    {
        return xhrSetRequestHeaderProcessor.apply(this, [].slice.call(arguments));
    };
}
KasperskyLab.AddRunner("xhr_content", function AddRunnerXhrContent(ns, session)
{
    var m_callFunction = null;
    function OnPing()
    {
        return ns.MaxRequestDelay;
    }
    function OnError()
    {
        xhrProxyEnabled = false;
    }
    function Initialize()
    {
        xhrProxyEnabled = true;
        session.InitializePlugin(function InitializePluginXhrContent(activatePlugin, registerMethod, callFunction) 
        {
            m_callFunction = callFunction;
            activatePlugin("xhr_content", OnPing, OnError);
            processPostAjaxInSession = function processPostAjaxInSession() 
            {
                var sendArguments = "";
                var request = null;
                var notifyComplete = false;
                var async = arguments.length < 3 || typeof arguments[2] !== "boolean" || arguments[2];
                var callback = function callback()
                {
                    if (request)
                    {
                        try
                        {
                            KasperskyLab.XMLHttpRequestSend.apply(request, sendArguments);
                        }
                        catch (e)
                        {
                            ns.SessionLog("Failed origin send + " + e.toString());
                        }
                    }
                    else
                    {
                        notifyComplete = true;
                    }
                };
                var remoteFunctionName = "xhr.ajaxRequestNotify";
                var targetUrl = NormalizeUrl(arguments[1]);
                var remoteFunctionArguments = { url: ns.ToBase64(targetUrl), urlEncrypted: true };
                var result = m_callFunction(remoteFunctionName, remoteFunctionArguments, callback, callback, async);
                if (!result && !async)
                {
                    m_callFunction(remoteFunctionName, remoteFunctionArguments, callback, callback);
                    notifyComplete = true;
                }
                return function processPostAjax()
                {
                    if (notifyComplete)
                    {
                        KasperskyLab.XMLHttpRequestSend.apply(this, [].slice.call(arguments));
                    }
                    else
                    {
                        sendArguments = arguments.length > 0
                            ? [arguments[0] && arguments[0].slice ? arguments[0].slice() : arguments[0]]
                            : [];
                        request = this; 
                    }
                };
            };
        });
    }
    Initialize();
}, { referrer: document.referrer });
(function XhrTrackerConstants(ns)
{
ns.RequestCustomHeader = "X-KL-ksospc-Ajax-Request";
})(KasperskyLab || {});
(function BallonMain(ns)
{
ns.Balloon2 = function Balloon2(pluginName, balloonSrc, balloonCssPostfix, session, getCoordCallback, onCloseHandler, locales, onDataReceiveHandler)
{
    var m_balloon = document.createElement("iframe");
    var m_shadowRoot = null;
    var m_balloonId = pluginName + "_b";
    var m_balloonSize = null;
    var m_sizeCache = {};
    var m_initStyleDataPair = {};
    var m_isInitSent = false;
    var m_updateTimeout = null;
    var m_firstCreate = true;
    var m_isBalloonLoaded = false;
    var m_callQueue = [];
    function ChangeSchemeIfNeed(url)
    {
        if (document.location.protocol === "https:")
            return url.replace("http:", "https:");
        return url;
    }
    function GetResourceUrl()
    {
        return balloonCssPostfix
            ? ns.GetResourceSrc(balloonSrc) + "?cssSrc=" + encodeURIComponent(ChangeSchemeIfNeed(ns["GetResourceSrc"](balloonCssPostfix)))
            : ns.GetResourceSrc(balloonSrc);
    }
    function HideBalloon()
    {
        m_balloon.style.display = "none";
    }
    function InitializeBalloon()
    {
        m_balloon.scrolling = "no";
        m_balloon.frameBorder = "0";
        m_balloon.style.border = "0";
        m_balloon.style.height = "1px";
        m_balloon.style.width = "1px";
        m_balloon.style.left = "1px";
        m_balloon.style.top = "1px";
        m_balloon.allowTransparency = "true"; 
        m_balloon.style.zIndex = "2147483647";
        m_balloon.style.position = "absolute";
        m_balloon.id = "KlIFrameId";
        if (Element.prototype.attachShadow)
        {
            m_shadowRoot = document.createElement("div");
            m_shadowRoot.setAttribute("class", "KlBalloonClass");
            var shadowRoot = m_shadowRoot.attachShadow({ mode: "open" });
            shadowRoot.appendChild(m_balloon);
            document.body.appendChild(m_shadowRoot);
        }
        else
        {
            document.body.appendChild(m_balloon);
        }
        HideBalloon();
    }
    function IsDisplayed()
    {
        return !m_firstCreate && m_balloon.style.display === "";
    }
    function OnPing()
    {
        return IsDisplayed() ? 100 : ns.MaxRequestDelay;
    }
    function SendToFrame(args)
    {
        if (m_isBalloonLoaded)
            m_balloon.contentWindow.postMessage(ns.JSONStringify(args), GetResourceUrl());
        else
            m_callQueue.push(function DeferSend() { m_balloon.contentWindow.postMessage(ns.JSONStringify(args), GetResourceUrl()); });
    }
    function SendInit(dataToFrame)
    {
        dataToFrame.style = m_initStyleDataPair.style;
        dataToFrame.data = m_initStyleDataPair.data;
        m_isInitSent = true;
        SendToFrame(dataToFrame);
        session.ForceReceive();
    }
    function PutSizeInCache(style, size)
    {
        m_sizeCache[style ? style.toString() : ""] = size;
    }
    function PositionBalloon()
    {
        if (!m_balloonSize)
            return;
        var coords = getCoordCallback(m_balloonSize);
        var newHeight = m_balloonSize.height + "px";
        var newWidth = m_balloonSize.width + "px";
        if (newHeight !== m_balloon.style.height 
            || newWidth !== m_balloon.style.width)
        {
            m_balloon.style.height = newHeight;
            m_balloon.style.width = newWidth;
            ns.SessionLog("Change balloon size " + m_balloonId + " height: " + newHeight + " width: " + newWidth);
        }
        var newX = Math.round(coords.x).toString() + "px";
        var newY = Math.round(coords.y).toString() + "px";
        if (newX !== m_balloon.style.left 
            || newY !== m_balloon.style.top)
        {
            m_balloon.style.left = newX;
            m_balloon.style.top = newY;
            ns.SessionLog("Change balloon position " + m_balloonId + " x: " + newX + " y: " + newY);
        }
    }
    function SetupBalloon(balloonSize)
    {
        m_balloonSize = balloonSize;
        PositionBalloon();
    }
    function OnSizeMessage(sizeMessage)
    {
        var size = {
            height: sizeMessage.height,
            width: sizeMessage.width
        };
        if (size.height !== 0 && size.width !== 0)
            PutSizeInCache(sizeMessage.style, size);
        SetupBalloon(size);
    }
    function OnCloseMessage(closeData)
    {
        HideBalloon();
        if (onCloseHandler && closeData.closeAction)
            onCloseHandler(closeData.closeAction);
    }
    function OnDataMessage(data)
    {
        if (onDataReceiveHandler)
            onDataReceiveHandler(data);
    }
    function GetSizeFromCache(style)
    {
        return m_sizeCache[style ? style.toString() : ""];
    }
    function DisplayBalloon()
    {
        m_balloon.style.display = "";
        session.ForceReceive();
    }
    function UpdateBalloon(style, data)
    {
        if (!m_isInitSent)
            m_initStyleDataPair = { style: style, data: data };
        var sizeFromCache = GetSizeFromCache(style);
        clearTimeout(m_updateTimeout);
        if (sizeFromCache)
        {
            m_updateTimeout = ns.SetTimeout(function UpdateTimerCallback() { SetupBalloon(sizeFromCache); }, 0);
        }
        else
        {
            m_balloon.style.height = "1px";
            m_balloon.style.width = "1px";
            m_balloonSize = { height: 1, width: 1 };
        }
        var dataToFrame = {
            command: "update",
            style: style,
            data: data,
            needSize: !sizeFromCache
        };
        SendToFrame(dataToFrame);
    }
    function CreateBalloon(style, data, size)
    {
        if (m_firstCreate)
        {
            InitializeBalloon();
            m_firstCreate = false;
        }
        DisplayBalloon();
        if (m_balloon.src)
        {
            UpdateBalloon(style, data);
            return;
        }
        m_initStyleDataPair = { style: style, data: data };
        m_balloon.src = GetResourceUrl();
        var balloonSize = size ? size : GetSizeFromCache(style);
        var dataToFrame = {
            command: "init",
            pluginName: m_balloonId,
            isRtl: ns.IsRtl,
            needSize: !balloonSize,
            style: style
        };
        if (data)
            dataToFrame.data = data;
        if (size)
            dataToFrame.explicitSize = size;
        if (locales)
            dataToFrame.locales = locales;
        dataToFrame.commandUrl = ChangeSchemeIfNeed(ns.GetCommandSrc());
        ns.AddEventListener(m_balloon, "load", function onLoad()
        { 
            m_isBalloonLoaded = true;
            SendInit(dataToFrame);
            while (m_callQueue.length)
                m_callQueue.shift()();
        });
        if (balloonSize)
        {
            clearTimeout(m_updateTimeout);
            m_updateTimeout = ns.SetTimeout(function UpdateTimerCallback() { SetupBalloon(balloonSize); }, 0);
        }
    }
    function DestroyBalloon()
    {
        m_balloon.blur(); 
        if (m_shadowRoot)
            document.body.removeChild(m_shadowRoot);
        else
            document.body.removeChild(m_balloon);
        m_firstCreate = true;
        m_balloonSize = null;
    }
    this.Show = function Show(style, data)
    {
        CreateBalloon(style, data);
    };
    this.ShowWithSize = function ShowWithSize(style, data, size)
    {
        CreateBalloon(style, data, size);
    };
    this.Resize = function Resize(size)
    {
        SetupBalloon(size);
    };
    this.Hide = function Hide()
    {
        HideBalloon();
    };
    this.Update = function Update(style, data)
    {
        UpdateBalloon(style, data);
    };
    this.UpdatePosition = function UpdatePosition()
    {
        PositionBalloon();
    };
    this.LightUpdatePosition = function LightUpdatePosition(x, y)
    {
        var newX = Math.round(x).toString() + "px";
        var newY = Math.round(y).toString() + "px";
        if (newX !== m_balloon.style.left 
            || newY !== m_balloon.style.top)
        {
            m_balloon.style.left = newX;
            m_balloon.style.top = newY;
        }
        var dataToFrame = {
            command: "update",
            data: {}
        };
        SendToFrame(dataToFrame);
    };
    this.Destroy = function Destroy()
    {
        DestroyBalloon();
    };
    this.IsFocused = function IsFocused()
    {
        if (!m_balloon)
            return false;
        return document.activeElement === m_balloon;
    };
    function OnFrameDataMessage(argument)
    {
        if (!argument)
        {
            ns.SessionLog(m_balloonId + " empty argument");
            return;
        }
        if (!argument.message)
        {
            ns.SessionLog(m_balloonId + " empty message.");
            return;
        }
        var message = ns.JSONParse(argument.message);
        if (message.type === "size")
            OnSizeMessage(message.data);
        else if (message.type === "close")
            OnCloseMessage(message.data);
        else if (message.type === "data")
            OnDataMessage(message.data);
        else if (message.type === "trace")
            ns.SessionLog(message.data);
        else
            ns.SessionError({ message: "Unknown message type", details: "type: " + message.type }, "balloon");
    }
    function Init()
    {
        session.InitializePlugin(function InitializePluginBalloon(activatePlugin, registerMethod)
            {
                activatePlugin(m_balloonId, OnPing);
                registerMethod(m_balloonId + ".message", OnFrameDataMessage);
            });
    }
    Init();
};
return ns;
})(KasperskyLab);
KasperskyLab.StartSession();
 })();
