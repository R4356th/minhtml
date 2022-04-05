import require$$0 from 'clean-css';
import require$$1 from 'he';
import require$$3 from 'relateurl';
import require$$5 from 'terser';

var htmlminifier = {};

var htmlparser = {};

var utils$1 = {};

function createMap(values, ignoreCase) {
    var map = {};
    values.forEach(function(value) {
        map[value] = 1;
    });
    return ignoreCase ? function(value) {
        return map[value.toLowerCase()] === 1;
    } : function(value) {
        return map[value] === 1;
    };
}

async function replaceAsync$1(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}


utils$1.createMap = createMap;
utils$1.createMapFromString = function(values, ignoreCase) {
    return createMap(values.split(/,/), ignoreCase);
};

utils$1.replaceAsync = replaceAsync$1;

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

var createMapFromString$1 = utils$1.createMapFromString;
var replaceAsync = utils$1.replaceAsync;

function makeMap(values) {
    return createMapFromString$1(values, true);
}

// Regular Expressions for parsing tags and attributes
var singleAttrIdentifier = /([^\s"'<>/=]+)/,
        singleAttrAssigns = [/=/],
        singleAttrValues = [
            // attr value double quotes
            /"([^"]*)"+/.source,
            // attr value, single quotes
            /'([^']*)'+/.source,
            // attr value, no quotes
            /([^ \t\n\f\r"'`=<>]+)/.source
        ],
        // https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
        qnameCapture = (function() {
            // based on https://www.npmjs.com/package/ncname
            var combiningChar = '\\u0300-\\u0345\\u0360\\u0361\\u0483-\\u0486\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u064B-\\u0652\\u0670\\u06D6-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED\\u0901-\\u0903\\u093C\\u093E-\\u094D\\u0951-\\u0954\\u0962\\u0963\\u0981-\\u0983\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09E2\\u09E3\\u0A02\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A70\\u0A71\\u0A81-\\u0A83\\u0ABC\\u0ABE-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0B01-\\u0B03\\u0B3C\\u0B3E-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B82\\u0B83\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0C01-\\u0C03\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C82\\u0C83\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0D02\\u0D03\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB\\u0EBC\\u0EC8-\\u0ECD\\u0F18\\u0F19\\u0F35\\u0F37\\u0F39\\u0F3E\\u0F3F\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u20D0-\\u20DC\\u20E1\\u302A-\\u302F\\u3099\\u309A';
            var digit = '0-9\\u0660-\\u0669\\u06F0-\\u06F9\\u0966-\\u096F\\u09E6-\\u09EF\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0BE7-\\u0BEF\\u0C66-\\u0C6F\\u0CE6-\\u0CEF\\u0D66-\\u0D6F\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29';
            var extender = '\\xB7\\u02D0\\u02D1\\u0387\\u0640\\u0E46\\u0EC6\\u3005\\u3031-\\u3035\\u309D\\u309E\\u30FC-\\u30FE';
            var letter = 'A-Za-z\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3';
            var ncname = '[' + letter + '_][' + letter + digit + '\\.\\-_' + combiningChar + extender + ']*';
            return '((?:' + ncname + '\\:)?' + ncname + ')';
        })(),
        startTagOpen = new RegExp('^<' + qnameCapture),
        startTagClose = /^\s*(\/?)>/,
        endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>'),
        doctype = /^<!DOCTYPE\s?[^>]+>/i;

var IS_REGEX_CAPTURING_BROKEN = false;
'x'.replace(/x(.)?/g, function(m, g) {
    IS_REGEX_CAPTURING_BROKEN = g === '';
});

// Empty Elements
var empty = makeMap('area,base,basefont,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr');

// Inline Elements
var inline = makeMap('a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,meter,noscript,object,output,q,s,samp,script,select,small,span,strike,strong,sub,sup,svg,textarea,tt,u,var');

// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelf = makeMap('colgroup,dd,dt,li,option,p,td,tfoot,th,thead,tr,source');

// Attributes that have their values filled in disabled='disabled'
var fillAttrs = makeMap('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected');

// Special Elements (can contain anything)
var special = makeMap('script,style');

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var nonPhrasing = makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,ol,optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,title,tr,track,ul');

var reCache = {};

function attrForHandler(handler) {
    var pattern = singleAttrIdentifier.source +
    '(?:\\s*(' + joinSingleAttrAssigns(handler) + ')' +
    '[ \\t\\n\\f\\r]*(?:' + singleAttrValues.join('|') + '))?';
    if (handler.customAttrSurround) {
        var attrClauses = [];
        for (var i = handler.customAttrSurround.length - 1; i >= 0; i--) {
            attrClauses[i] = '(?:' +
        '(' + handler.customAttrSurround[i][0].source + ')\\s*' +
        pattern +
        '\\s*(' + handler.customAttrSurround[i][1].source + ')' +
        ')';
        }
        attrClauses.push('(?:' + pattern + ')');
        pattern = '(?:' + attrClauses.join('|') + ')';
    }
    return new RegExp('^\\s*' + pattern);
}

function joinSingleAttrAssigns(handler) {
    return singleAttrAssigns.concat(
        handler.customAttrAssign || []
    ).map(function(assign) {
        return '(?:' + assign.source + ')';
    }).join('|');
}

class HTMLParser$1 {
    constructor(html, handler) {
        this.html = html;
        this.handler = handler;
    }

    async parse() {
        let html = this.html;
        const handler = this.handler;

        var stack = [], lastTag;
        var attribute = attrForHandler(handler);
        var last, prevTag, nextTag;
        while (html) {
            last = html;
            // Make sure we're not in a script or style element
            if (!lastTag || !special(lastTag)) {
                var textEnd = html.indexOf('<');
                if (textEnd === 0) {
                    // Comment:
                    if (/^<!--/.test(html)) {
                        var commentEnd = html.indexOf('-->');

                        if (commentEnd >= 0) {
                            if (handler.comment) {
                                await handler.comment(html.substring(4, commentEnd));
                            }
                            html = html.substring(commentEnd + 3);
                            prevTag = '';
                            continue;
                        }
                    }

                    // https://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                    if (/^<!\[/.test(html)) {
                        var conditionalEnd = html.indexOf(']>');

                        if (conditionalEnd >= 0) {
                            if (handler.comment) {
                                await handler.comment(html.substring(2, conditionalEnd + 1), true /* non-standard */);
                            }
                            html = html.substring(conditionalEnd + 2);
                            prevTag = '';
                            continue;
                        }
                    }

                    // Doctype:
                    var doctypeMatch = html.match(doctype);
                    if (doctypeMatch) {
                        if (handler.doctype) {
                            handler.doctype(doctypeMatch[0]);
                        }
                        html = html.substring(doctypeMatch[0].length);
                        prevTag = '';
                        continue;
                    }

                    // End tag:
                    var endTagMatch = html.match(endTag);
                    if (endTagMatch) {
                        html = html.substring(endTagMatch[0].length);
                        await replaceAsync(endTagMatch[0], endTag, parseEndTag);
                        prevTag = '/' + endTagMatch[1].toLowerCase();
                        continue;
                    }

                    // Start tag:
                    var startTagMatch = parseStartTag(html);
                    if (startTagMatch) {
                        html = startTagMatch.rest;
                        await handleStartTag(startTagMatch);
                        prevTag = startTagMatch.tagName.toLowerCase();
                        continue;
                    }

                    // Treat `<` as text
                    if (handler.continueOnParseError) {
                        textEnd = html.indexOf('<', 1);
                    }
                }

                var text;
                if (textEnd >= 0) {
                    text = html.substring(0, textEnd);
                    html = html.substring(textEnd);
                }
                else {
                    text = html;
                    html = '';
                }

                // next tag
                var nextTagMatch = parseStartTag(html);
                if (nextTagMatch) {
                    nextTag = nextTagMatch.tagName;
                }
                else {
                    nextTagMatch = html.match(endTag);
                    if (nextTagMatch) {
                        nextTag = '/' + nextTagMatch[1];
                    }
                    else {
                        nextTag = '';
                    }
                }

                if (handler.chars) {
                    await handler.chars(text, prevTag, nextTag);
                }
                prevTag = '';
            }
            else {
                var stackedTag = lastTag.toLowerCase();
                var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)</' + stackedTag + '[^>]*>', 'i'));

                html = await replaceAsync(html, reStackedTag, async(_, text) => {
                    if (stackedTag !== 'script' && stackedTag !== 'style' && stackedTag !== 'noscript') {
                        text = text
                            .replace(/<!--([\s\S]*?)-->/g, '$1')
                            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
                    }


                    if (handler.chars) {
                        await handler.chars(text);
                    }

                    return '';
                });

                await parseEndTag('</' + stackedTag + '>', stackedTag);
            }

            if (html === last) {
                throw new Error('Parse Error: ' + html);
            }
        }

        if (!handler.partialMarkup) {
            // Clean up any remaining tags
            await parseEndTag();
        }

        function parseStartTag(input) {
            var start = input.match(startTagOpen);
            if (start) {
                var match = {
                    tagName: start[1],
                    attrs: []
                };
                input = input.slice(start[0].length);
                var end, attr;
                while (!(end = input.match(startTagClose)) && (attr = input.match(attribute))) {
                    input = input.slice(attr[0].length);
                    match.attrs.push(attr);
                }
                if (end) {
                    match.unarySlash = end[1];
                    match.rest = input.slice(end[0].length);
                    return match;
                }
            }
        }

        async function closeIfFound(tagName) {
            if (findTag(tagName) >= 0) {
                await parseEndTag('', tagName);
                return true;
            }
        }

        async function handleStartTag(match) {
            var tagName = match.tagName;
            var unarySlash = match.unarySlash;

            if (handler.html5) {
                if (lastTag === 'p' && nonPhrasing(tagName)) {
                    await parseEndTag('', lastTag);
                }
                else if (tagName === 'tbody') {
                    await closeIfFound('thead');
                }
                else if (tagName === 'tfoot') {
                    if (!await closeIfFound('tbody')) {
                        await closeIfFound('thead');
                    }
                }
                if (tagName === 'col' && findTag('colgroup') < 0) {
                    lastTag = 'colgroup';
                    stack.push({ tag: lastTag, attrs: [] });
                    if (handler.start) {
                        await handler.start(lastTag, [], false, '');
                    }
                }
            }

            if (!handler.html5 && !inline(tagName)) {
                while (lastTag && inline(lastTag)) {
                    await parseEndTag('', lastTag);
                }
            }

            if (closeSelf(tagName) && lastTag === tagName) {
                await parseEndTag('', tagName);
            }

            var unary = empty(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash;

            var attrs = match.attrs.map(function(args) {
                var name, value, customOpen, customClose, customAssign, quote;
                var ncp = 7; // number of captured parts, scalar

                // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
                if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
                    if (args[3] === '') { delete args[3]; }
                    if (args[4] === '') { delete args[4]; }
                    if (args[5] === '') { delete args[5]; }
                }

                function populate(index) {
                    customAssign = args[index];
                    value = args[index + 1];
                    if (typeof value !== 'undefined') {
                        return '"';
                    }
                    value = args[index + 2];
                    if (typeof value !== 'undefined') {
                        return '\'';
                    }
                    value = args[index + 3];
                    if (typeof value === 'undefined' && fillAttrs(name)) {
                        value = name;
                    }
                    return '';
                }

                var j = 1;
                if (handler.customAttrSurround) {
                    for (var i = 0, l = handler.customAttrSurround.length; i < l; i++, j += ncp) {
                        name = args[j + 1];
                        if (name) {
                            quote = populate(j + 2);
                            customOpen = args[j];
                            customClose = args[j + 6];
                            break;
                        }
                    }
                }

                if (!name && (name = args[j])) {
                    quote = populate(j + 1);
                }

                return {
                    name: name,
                    value: value,
                    customAssign: customAssign || '=',
                    customOpen: customOpen || '',
                    customClose: customClose || '',
                    quote: quote || ''
                };
            });

            if (!unary) {
                stack.push({ tag: tagName, attrs: attrs });
                lastTag = tagName;
                unarySlash = '';
            }

            if (handler.start) {
                await handler.start(tagName, attrs, unary, unarySlash);
            }
        }

        function findTag(tagName) {
            var pos;
            var needle = tagName.toLowerCase();
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos].tag.toLowerCase() === needle) {
                    break;
                }
            }
            return pos;
        }

        async function parseEndTag(tag, tagName) {
            var pos;

            // Find the closest opened tag of the same type
            if (tagName) {
                pos = findTag(tagName);
            }
            // If no tag name is provided, clean shop
            else {
                pos = 0;
            }

            if (pos >= 0) {
                // Close all the open elements, up the stack
                for (var i = stack.length - 1; i >= pos; i--) {
                    if (handler.end) {
                        handler.end(stack[i].tag, stack[i].attrs, i > pos || !tag);
                    }
                }

                // Remove the open elements from the stack
                stack.length = pos;
                lastTag = pos && stack[pos - 1].tag;
            }
            else if (tagName.toLowerCase() === 'br') {
                if (handler.start) {
                    await handler.start(tagName, [], true, '');
                }
            }
            else if (tagName.toLowerCase() === 'p') {
                if (handler.start) {
                    await handler.start(tagName, [], false, '', true);
                }
                if (handler.end) {
                    handler.end(tagName, []);
                }
            }
        }
    }
}

htmlparser.HTMLParser = HTMLParser$1;
htmlparser.HTMLtoXML = function(html) {
    var results = '';

    new HTMLParser$1(html, {
        start: function(tag, attrs, unary) {
            results += '<' + tag;

            for (var i = 0, len = attrs.length; i < len; i++) {
                results += ' ' + attrs[i].name + '="' + (attrs[i].value || '').replace(/"/g, '&#34;') + '"';
            }

            results += (unary ? '/' : '') + '>';
        },
        end: function(tag) {
            results += '</' + tag + '>';
        },
        chars: function(text) {
            results += text;
        },
        comment: function(text) {
            results += '<!--' + text + '-->';
        },
        ignore: function(text) {
            results += text;
        }
    });

    return results;
};

htmlparser.HTMLtoDOM = function(html, doc) {
    // There can be only one of these elements
    var one = {
        html: true,
        head: true,
        body: true,
        title: true
    };

    // Enforce a structure for the document
    var structure = {
        link: 'head',
        base: 'head'
    };

    if (doc) {
        doc = doc.ownerDocument || doc.getOwnerDocument && doc.getOwnerDocument() || doc;
    }
    else if (typeof DOMDocument !== 'undefined') {
        doc = new DOMDocument();
    }
    else if (typeof document !== 'undefined' && document.implementation && document.implementation.createDocument) {
        doc = document.implementation.createDocument('', '', null);
    }
    else if (typeof ActiveX !== 'undefined') {
        doc = new ActiveXObject('Msxml.DOMDocument');
    }

    var elems = [],
            documentElement = doc.documentElement ||
      doc.getDocumentElement && doc.getDocumentElement();

    // If we're dealing with an empty document then we
    // need to pre-populate it with the HTML document structure
    if (!documentElement && doc.createElement) {
        (function() {
            var html = doc.createElement('html');
            var head = doc.createElement('head');
            head.appendChild(doc.createElement('title'));
            html.appendChild(head);
            html.appendChild(doc.createElement('body'));
            doc.appendChild(html);
        })();
    }

    // Find all the unique elements
    if (doc.getElementsByTagName) {
        for (var i in one) {
            one[i] = doc.getElementsByTagName(i)[0];
        }
    }

    // If we're working with a document, inject contents into
    // the body element
    var curParentNode = one.body;

    new HTMLParser$1(html, {
        start: function(tagName, attrs, unary) {
            // If it's a pre-built element, then we can ignore
            // its construction
            if (one[tagName]) {
                curParentNode = one[tagName];
                return;
            }

            var elem = doc.createElement(tagName);

            for (var attr in attrs) {
                elem.setAttribute(attrs[attr].name, attrs[attr].value);
            }

            if (structure[tagName] && typeof one[structure[tagName]] !== 'boolean') {
                one[structure[tagName]].appendChild(elem);
            }
            else if (curParentNode && curParentNode.appendChild) {
                curParentNode.appendChild(elem);
            }

            if (!unary) {
                elems.push(elem);
                curParentNode = elem;
            }
        },
        end: function(/* tag */) {
            elems.length -= 1;

            // Init the new parentNode
            curParentNode = elems[elems.length - 1];
        },
        chars: function(text) {
            curParentNode.appendChild(doc.createTextNode(text));
        },
        comment: function(/* text */) {
            // create comment node
        },
        ignore: function(/* text */) {
            // What to do here?
        }
    });

    return doc;
};

function Sorter() {
}

Sorter.prototype.sort = function(tokens, fromIndex) {
    fromIndex = fromIndex || 0;
    for (var i = 0, len = this.keys.length; i < len; i++) {
        var key = this.keys[i];
        var token = key.slice(1);
        var index = tokens.indexOf(token, fromIndex);
        if (index !== -1) {
            do {
                if (index !== fromIndex) {
                    tokens.splice(index, 1);
                    tokens.splice(fromIndex, 0, token);
                }
                fromIndex++;
            } while ((index = tokens.indexOf(token, fromIndex)) !== -1);
            return this[key].sort(tokens, fromIndex);
        }
    }
    return tokens;
};

function TokenChain$1() {
}

TokenChain$1.prototype = {
    add: function(tokens) {
        var self = this;
        tokens.forEach(function(token) {
            var key = '$' + token;
            if (!self[key]) {
                self[key] = [];
                self[key].processed = 0;
            }
            self[key].push(tokens);
        });
    },
    createSorter: function() {
        var self = this;
        var sorter = new Sorter();
        sorter.keys = Object.keys(self).sort(function(j, k) {
            var m = self[j].length;
            var n = self[k].length;
            return m < n ? 1 : m > n ? -1 : j < k ? -1 : j > k ? 1 : 0;
        }).filter(function(key) {
            if (self[key].processed < self[key].length) {
                var token = key.slice(1);
                var chain = new TokenChain$1();
                self[key].forEach(function(tokens) {
                    var index;
                    while ((index = tokens.indexOf(token)) !== -1) {
                        tokens.splice(index, 1);
                    }
                    tokens.forEach(function(token) {
                        self['$' + token].processed++;
                    });
                    chain.add(tokens.slice(0));
                });
                sorter[key] = chain.createSorter();
                return true;
            }
            return false;
        });
        return sorter;
    }
};

var tokenchain = TokenChain$1;

var CleanCSS = require$$0;
var decode = require$$1.decode;
var HTMLParser = htmlparser.HTMLParser;
var RelateUrl = require$$3;
var TokenChain = tokenchain;
var Terser = require$$5;
var utils = utils$1;

function trimWhitespace(str) {
    return str && str.replace(/^[ \n\r\t\f]+/, '').replace(/[ \n\r\t\f]+$/, '');
}

function collapseWhitespaceAll(str) {
    // Non-breaking space is specifically handled inside the replacer function here:
    return str && str.replace(/[ \n\r\t\f\xA0]+/g, function(spaces) {
        return spaces === '\t' ? '\t' : spaces.replace(/(^|\xA0+)[^\xA0]+/g, '$1 ');
    });
}

function collapseWhitespace(str, options, trimLeft, trimRight, collapseAll) {
    var lineBreakBefore = '', lineBreakAfter = '';

    if (options.preserveLineBreaks) {
        str = str.replace(/^[ \n\r\t\f]*?[\n\r][ \n\r\t\f]*/, function() {
            lineBreakBefore = '\n';
            return '';
        }).replace(/[ \n\r\t\f]*?[\n\r][ \n\r\t\f]*$/, function() {
            lineBreakAfter = '\n';
            return '';
        });
    }

    if (trimLeft) {
    // Non-breaking space is specifically handled inside the replacer function here:
        str = str.replace(/^[ \n\r\t\f\xA0]+/, function(spaces) {
            var conservative = !lineBreakBefore && options.conservativeCollapse;
            if (conservative && spaces === '\t') {
                return '\t';
            }
            return spaces.replace(/^[^\xA0]+/, '').replace(/(\xA0+)[^\xA0]+/g, '$1 ') || (conservative ? ' ' : '');
        });
    }

    if (trimRight) {
    // Non-breaking space is specifically handled inside the replacer function here:
        str = str.replace(/[ \n\r\t\f\xA0]+$/, function(spaces) {
            var conservative = !lineBreakAfter && options.conservativeCollapse;
            if (conservative && spaces === '\t') {
                return '\t';
            }
            return spaces.replace(/[^\xA0]+(\xA0+)/g, ' $1').replace(/[^\xA0]+$/, '') || (conservative ? ' ' : '');
        });
    }

    if (collapseAll) {
    // strip non space whitespace then compress spaces to one
        str = collapseWhitespaceAll(str);
    }

    return lineBreakBefore + str + lineBreakAfter;
}

var createMapFromString = utils.createMapFromString;
// non-empty tags that will maintain whitespace around them
var inlineTags = createMapFromString('a,abbr,acronym,b,bdi,bdo,big,button,cite,code,del,dfn,em,font,i,ins,kbd,label,mark,math,nobr,object,q,rp,rt,rtc,ruby,s,samp,select,small,span,strike,strong,sub,sup,svg,textarea,time,tt,u,var');
// non-empty tags that will maintain whitespace within them
var inlineTextTags = createMapFromString('a,abbr,acronym,b,big,del,em,font,i,ins,kbd,mark,nobr,rp,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var');
// self-closing tags that will maintain whitespace around them
var selfClosingInlineTags = createMapFromString('comment,img,input,wbr');

function collapseWhitespaceSmart(str, prevTag, nextTag, options) {
    var trimLeft = prevTag && !selfClosingInlineTags(prevTag);
    if (trimLeft && !options.collapseInlineTagWhitespace) {
        trimLeft = prevTag.charAt(0) === '/' ? !inlineTags(prevTag.slice(1)) : !inlineTextTags(prevTag);
    }
    var trimRight = nextTag && !selfClosingInlineTags(nextTag);
    if (trimRight && !options.collapseInlineTagWhitespace) {
        trimRight = nextTag.charAt(0) === '/' ? !inlineTextTags(nextTag.slice(1)) : !inlineTags(nextTag);
    }
    return collapseWhitespace(str, options, trimLeft, trimRight, prevTag && nextTag);
}

function isConditionalComment(text) {
    return /^\[if\s[^\]]+]|\[endif]$/.test(text);
}

function isIgnoredComment(text, options) {
    for (var i = 0, len = options.ignoreCustomComments.length; i < len; i++) {
        if (options.ignoreCustomComments[i].test(text)) {
            return true;
        }
    }
    return false;
}

function isEventAttribute(attrName, options) {
    var patterns = options.customEventAttributes;
    if (patterns) {
        for (var i = patterns.length; i--;) {
            if (patterns[i].test(attrName)) {
                return true;
            }
        }
        return false;
    }
    return /^on[a-z]{3,}$/.test(attrName);
}

function canRemoveAttributeQuotes(value) {
    // https://mathiasbynens.be/notes/unquoted-attribute-values
    return /^[^ \t\n\f\r"'`=<>]+$/.test(value);
}

function attributesInclude(attributes, attribute) {
    for (var i = attributes.length; i--;) {
        if (attributes[i].name.toLowerCase() === attribute) {
            return true;
        }
    }
    return false;
}

function isAttributeRedundant(tag, attrName, attrValue, attrs) {
    attrValue = attrValue ? trimWhitespace(attrValue.toLowerCase()) : '';

    return (
        tag === 'script' &&
    attrName === 'language' &&
    attrValue === 'javascript' ||

    tag === 'form' &&
    attrName === 'method' &&
    attrValue === 'get' ||

    tag === 'input' &&
    attrName === 'type' &&
    attrValue === 'text' ||

    tag === 'script' &&
    attrName === 'charset' &&
    !attributesInclude(attrs, 'src') ||

    tag === 'a' &&
    attrName === 'name' &&
    attributesInclude(attrs, 'id') ||

    tag === 'area' &&
    attrName === 'shape' &&
    attrValue === 'rect'
    );
}

// https://mathiasbynens.be/demo/javascript-mime-type
// https://developer.mozilla.org/en/docs/Web/HTML/Element/script#attr-type
var executableScriptsMimetypes = utils.createMap([
    'text/javascript',
    'text/ecmascript',
    'text/jscript',
    'application/javascript',
    'application/x-javascript',
    'application/ecmascript',
    'module'
]);

var keepScriptsMimetypes = utils.createMap([
    'module'
]);

function isScriptTypeAttribute(attrValue) {
    attrValue = trimWhitespace(attrValue.split(/;/, 2)[0]).toLowerCase();
    return attrValue === '' || executableScriptsMimetypes(attrValue);
}

function keepScriptTypeAttribute(attrValue) {
    attrValue = trimWhitespace(attrValue.split(/;/, 2)[0]).toLowerCase();
    return keepScriptsMimetypes(attrValue);
}

function isExecutableScript(tag, attrs) {
    if (tag !== 'script') {
        return false;
    }
    for (var i = 0, len = attrs.length; i < len; i++) {
        var attrName = attrs[i].name.toLowerCase();
        if (attrName === 'type') {
            return isScriptTypeAttribute(attrs[i].value);
        }
    }
    return true;
}

function isStyleLinkTypeAttribute(attrValue) {
    attrValue = trimWhitespace(attrValue).toLowerCase();
    return attrValue === '' || attrValue === 'text/css';
}

function isStyleSheet(tag, attrs) {
    if (tag !== 'style') {
        return false;
    }
    for (var i = 0, len = attrs.length; i < len; i++) {
        var attrName = attrs[i].name.toLowerCase();
        if (attrName === 'type') {
            return isStyleLinkTypeAttribute(attrs[i].value);
        }
    }
    return true;
}

var isSimpleBoolean = createMapFromString('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,truespeed,typemustmatch,visible');
var isBooleanValue = createMapFromString('true,false');

function isBooleanAttribute(attrName, attrValue) {
    return isSimpleBoolean(attrName) || attrName === 'draggable' && !isBooleanValue(attrValue);
}

function isUriTypeAttribute(attrName, tag) {
    return (
        /^(?:a|area|link|base)$/.test(tag) && attrName === 'href' ||
    tag === 'img' && /^(?:src|longdesc|usemap)$/.test(attrName) ||
    tag === 'object' && /^(?:classid|codebase|data|usemap)$/.test(attrName) ||
    tag === 'q' && attrName === 'cite' ||
    tag === 'blockquote' && attrName === 'cite' ||
    (tag === 'ins' || tag === 'del') && attrName === 'cite' ||
    tag === 'form' && attrName === 'action' ||
    tag === 'input' && (attrName === 'src' || attrName === 'usemap') ||
    tag === 'head' && attrName === 'profile' ||
    tag === 'script' && (attrName === 'src' || attrName === 'for')
    );
}

function isNumberTypeAttribute(attrName, tag) {
    return (
        /^(?:a|area|object|button)$/.test(tag) && attrName === 'tabindex' ||
    tag === 'input' && (attrName === 'maxlength' || attrName === 'tabindex') ||
    tag === 'select' && (attrName === 'size' || attrName === 'tabindex') ||
    tag === 'textarea' && /^(?:rows|cols|tabindex)$/.test(attrName) ||
    tag === 'colgroup' && attrName === 'span' ||
    tag === 'col' && attrName === 'span' ||
    (tag === 'th' || tag === 'td') && (attrName === 'rowspan' || attrName === 'colspan')
    );
}

function isLinkType(tag, attrs, value) {
    if (tag !== 'link') {
        return false;
    }
    for (var i = 0, len = attrs.length; i < len; i++) {
        if (attrs[i].name === 'rel' && attrs[i].value === value) {
            return true;
        }
    }
}

function isMediaQuery(tag, attrs, attrName) {
    return attrName === 'media' && (isLinkType(tag, attrs, 'stylesheet') || isStyleSheet(tag, attrs));
}

var srcsetTags = createMapFromString('img,source');

function isSrcset(attrName, tag) {
    return attrName === 'srcset' && srcsetTags(tag);
}

async function cleanAttributeValue(tag, attrName, attrValue, options, attrs) {
    if (isEventAttribute(attrName, options)) {
        attrValue = trimWhitespace(attrValue).replace(/^javascript:\s*/i, '');
        return await options.minifyJS(attrValue, true);
    }
    else if (attrName === 'class') {
        attrValue = trimWhitespace(attrValue);
        if (options.sortClassName) {
            attrValue = options.sortClassName(attrValue);
        }
        else {
            attrValue = collapseWhitespaceAll(attrValue);
        }
        return attrValue;
    }
    else if (isUriTypeAttribute(attrName, tag)) {
        attrValue = trimWhitespace(attrValue);
        return isLinkType(tag, attrs, 'canonical') ? attrValue : options.minifyURLs(attrValue);
    }
    else if (isNumberTypeAttribute(attrName, tag)) {
        return trimWhitespace(attrValue);
    }
    else if (attrName === 'style') {
        attrValue = trimWhitespace(attrValue);
        if (attrValue) {
            if (/;$/.test(attrValue) && !/&#?[0-9a-zA-Z]+;$/.test(attrValue)) {
                attrValue = attrValue.replace(/\s*;$/, ';');
            }
            attrValue = options.minifyCSS(attrValue, 'inline');
        }
        return attrValue;
    }
    else if (isSrcset(attrName, tag)) {
    // https://html.spec.whatwg.org/multipage/embedded-content.html#attr-img-srcset
        attrValue = trimWhitespace(attrValue).split(/\s+,\s*|\s*,\s+/).map(function(candidate) {
            var url = candidate;
            var descriptor = '';
            var match = candidate.match(/\s+([1-9][0-9]*w|[0-9]+(?:\.[0-9]+)?x)$/);
            if (match) {
                url = url.slice(0, -match[0].length);
                var num = +match[1].slice(0, -1);
                var suffix = match[1].slice(-1);
                if (num !== 1 || suffix !== 'x') {
                    descriptor = ' ' + num + suffix;
                }
            }
            return options.minifyURLs(url) + descriptor;
        }).join(', ');
    }
    else if (isMetaViewport(tag, attrs) && attrName === 'content') {
        attrValue = attrValue.replace(/\s+/g, '').replace(/[0-9]+\.[0-9]+/g, function(numString) {
            // "0.90000" -> "0.9"
            // "1.0" -> "1"
            // "1.0001" -> "1.0001" (unchanged)
            return (+numString).toString();
        });
    }
    else if (isContentSecurityPolicy(tag, attrs) && attrName.toLowerCase() === 'content') {
        return collapseWhitespaceAll(attrValue);
    }
    else if (options.customAttrCollapse && options.customAttrCollapse.test(attrName)) {
        attrValue = trimWhitespace(attrValue.replace(/ ?[\n\r]+ ?/g, '').replace(/\s{2,}/g, options.conservativeCollapse ? ' ' : ''));
    }
    else if (tag === 'script' && attrName === 'type') {
        attrValue = trimWhitespace(attrValue.replace(/\s*;\s*/g, ';'));
    }
    else if (isMediaQuery(tag, attrs, attrName)) {
        attrValue = trimWhitespace(attrValue);
        return options.minifyCSS(attrValue, 'media');
    }
    return attrValue;
}

function isMetaViewport(tag, attrs) {
    if (tag !== 'meta') {
        return false;
    }
    for (var i = 0, len = attrs.length; i < len; i++) {
        if (attrs[i].name === 'name' && attrs[i].value === 'viewport') {
            return true;
        }
    }
}

function isContentSecurityPolicy(tag, attrs) {
    if (tag !== 'meta') {
        return false;
    }
    for (var i = 0, len = attrs.length; i < len; i++) {
        if (attrs[i].name.toLowerCase() === 'http-equiv' && attrs[i].value.toLowerCase() === 'content-security-policy') {
            return true;
        }
    }
}

function ignoreCSS(id) {
    return '/* clean-css ignore:start */' + id + '/* clean-css ignore:end */';
}

// Wrap CSS declarations for CleanCSS > 3.x
// See https://github.com/jakubpawlowicz/clean-css/issues/418
function wrapCSS(text, type) {
    switch (type) {
        case 'inline':
            return '*{' + text + '}';
        case 'media':
            return '@media ' + text + '{a{top:0}}';
        default:
            return text;
    }
}

function unwrapCSS(text, type) {
    var matches;
    switch (type) {
        case 'inline':
            matches = text.match(/^\*\{([\s\S]*)\}$/);
            break;
        case 'media':
            matches = text.match(/^@media ([\s\S]*?)\s*{[\s\S]*}$/);
            break;
    }
    return matches ? matches[1] : text;
}

async function cleanConditionalComment(comment, options) {
    return options.processConditionalComments ? await utils.replaceAsync(comment, /^(\[if\s[^\]]+]>)([\s\S]*?)(<!\[endif])$/, async function(match, prefix, text, suffix) {
        return prefix + await minify(text, options, true) + suffix;
    }) : comment;
}

async function processScript(text, options, currentAttrs) {
    for (var i = 0, len = currentAttrs.length; i < len; i++) {
        if (currentAttrs[i].name.toLowerCase() === 'type' &&
        options.processScripts.indexOf(currentAttrs[i].value) > -1) {
            return await minify(text, options);
        }
    }
    return text;
}

// Tag omission rules from https://html.spec.whatwg.org/multipage/syntax.html#optional-tags
// with the following deviations:
// - retain <body> if followed by <noscript>
// - </rb>, </rt>, </rtc>, </rp> & </tfoot> follow https://www.w3.org/TR/html5/syntax.html#optional-tags
// - retain all tags which are adjacent to non-standard HTML tags
var optionalStartTags = createMapFromString('html,head,body,colgroup,tbody');
var optionalEndTags = createMapFromString('html,head,body,li,dt,dd,p,rb,rt,rtc,rp,optgroup,option,colgroup,caption,thead,tbody,tfoot,tr,td,th');
var headerTags = createMapFromString('meta,link,script,style,template,noscript');
var descriptionTags = createMapFromString('dt,dd');
var pBlockTags = createMapFromString('address,article,aside,blockquote,details,div,dl,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,main,menu,nav,ol,p,pre,section,table,ul');
var pInlineTags = createMapFromString('a,audio,del,ins,map,noscript,video');
var rubyTags = createMapFromString('rb,rt,rtc,rp');
var rtcTag = createMapFromString('rb,rtc,rp');
var optionTag = createMapFromString('option,optgroup');
var tableContentTags = createMapFromString('tbody,tfoot');
var tableSectionTags = createMapFromString('thead,tbody,tfoot');
var cellTags = createMapFromString('td,th');
var topLevelTags = createMapFromString('html,head,body');
var compactTags = createMapFromString('html,body');
var looseTags = createMapFromString('head,colgroup,caption');
var trailingTags = createMapFromString('dt,thead');
var htmlTags = createMapFromString('a,abbr,acronym,address,applet,area,article,aside,audio,b,base,basefont,bdi,bdo,bgsound,big,blink,blockquote,body,br,button,canvas,caption,center,cite,code,col,colgroup,command,content,data,datalist,dd,del,details,dfn,dialog,dir,div,dl,dt,element,em,embed,fieldset,figcaption,figure,font,footer,form,frame,frameset,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,i,iframe,image,img,input,ins,isindex,kbd,keygen,label,legend,li,link,listing,main,map,mark,marquee,menu,menuitem,meta,meter,multicol,nav,nobr,noembed,noframes,noscript,object,ol,optgroup,option,output,p,param,picture,plaintext,pre,progress,q,rb,rp,rt,rtc,ruby,s,samp,script,section,select,shadow,small,source,spacer,span,strike,strong,style,sub,summary,sup,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,tt,u,ul,var,video,wbr,xmp');

function canRemoveParentTag(optionalStartTag, tag) {
    switch (optionalStartTag) {
        case 'html':
        case 'head':
            return true;
        case 'body':
            return !headerTags(tag);
        case 'colgroup':
            return tag === 'col';
        case 'tbody':
            return tag === 'tr';
    }
    return false;
}

function isStartTagMandatory(optionalEndTag, tag) {
    switch (tag) {
        case 'colgroup':
            return optionalEndTag === 'colgroup';
        case 'tbody':
            return tableSectionTags(optionalEndTag);
    }
    return false;
}

function canRemovePrecedingTag(optionalEndTag, tag) {
    switch (optionalEndTag) {
        case 'html':
        case 'head':
        case 'body':
        case 'colgroup':
        case 'caption':
            return true;
        case 'li':
        case 'optgroup':
        case 'tr':
            return tag === optionalEndTag;
        case 'dt':
        case 'dd':
            return descriptionTags(tag);
        case 'p':
            return pBlockTags(tag);
        case 'rb':
        case 'rt':
        case 'rp':
            return rubyTags(tag);
        case 'rtc':
            return rtcTag(tag);
        case 'option':
            return optionTag(tag);
        case 'thead':
        case 'tbody':
            return tableContentTags(tag);
        case 'tfoot':
            return tag === 'tbody';
        case 'td':
        case 'th':
            return cellTags(tag);
    }
    return false;
}

var reEmptyAttribute = new RegExp(
    '^(?:class|id|style|title|lang|dir|on(?:focus|blur|change|click|dblclick|mouse(' +
    '?:down|up|over|move|out)|key(?:press|down|up)))$');

function canDeleteEmptyAttribute(tag, attrName, attrValue, options) {
    var isValueEmpty = !attrValue || /^\s*$/.test(attrValue);
    if (!isValueEmpty) {
        return false;
    }
    if (typeof options.removeEmptyAttributes === 'function') {
        return options.removeEmptyAttributes(attrName, tag);
    }
    return tag === 'input' && attrName === 'value' || reEmptyAttribute.test(attrName);
}

function hasAttrName(name, attrs) {
    for (var i = attrs.length - 1; i >= 0; i--) {
        if (attrs[i].name === name) {
            return true;
        }
    }
    return false;
}

function canRemoveElement(tag, attrs) {
    switch (tag) {
        case 'textarea':
            return false;
        case 'audio':
        case 'script':
        case 'video':
            if (hasAttrName('src', attrs)) {
                return false;
            }
            break;
        case 'iframe':
            if (hasAttrName('src', attrs) || hasAttrName('srcdoc', attrs)) {
                return false;
            }
            break;
        case 'object':
            if (hasAttrName('data', attrs)) {
                return false;
            }
            break;
        case 'applet':
            if (hasAttrName('code', attrs)) {
                return false;
            }
            break;
    }
    return true;
}

function canCollapseWhitespace(tag) {
    return !/^(?:script|style|pre|textarea)$/.test(tag);
}

function canTrimWhitespace(tag) {
    return !/^(?:pre|textarea)$/.test(tag);
}

async function normalizeAttr(attr, attrs, tag, options) {
    var attrName = options.name(attr.name),
            attrValue = attr.value;

    if (options.decodeEntities && attrValue) {
        attrValue = decode(attrValue, { isAttributeValue: true });
    }

    if (options.removeRedundantAttributes &&
    isAttributeRedundant(tag, attrName, attrValue, attrs) ||
    options.removeScriptTypeAttributes && tag === 'script' &&
    attrName === 'type' && isScriptTypeAttribute(attrValue) && !keepScriptTypeAttribute(attrValue) ||
    options.removeStyleLinkTypeAttributes && (tag === 'style' || tag === 'link') &&
    attrName === 'type' && isStyleLinkTypeAttribute(attrValue)) {
        return;
    }

    if (attrValue) {
        attrValue = await cleanAttributeValue(tag, attrName, attrValue, options, attrs);
    }

    if (options.removeEmptyAttributes &&
      canDeleteEmptyAttribute(tag, attrName, attrValue, options)) {
        return;
    }

    if (options.decodeEntities && attrValue) {
        attrValue = attrValue.replace(/&(#?[0-9a-zA-Z]+;)/g, '&amp;$1');
    }

    return {
        attr: attr,
        name: attrName,
        value: attrValue
    };
}

function buildAttr(normalized, hasUnarySlash, options, isLast, uidAttr) {
    var attrName = normalized.name,
            attrValue = normalized.value,
            attr = normalized.attr,
            attrQuote = attr.quote,
            attrFragment,
            emittedAttrValue;

    if (typeof attrValue !== 'undefined' && (!options.removeAttributeQuotes ||
      ~attrValue.indexOf(uidAttr) || !canRemoveAttributeQuotes(attrValue))) {
        if (!options.preventAttributesEscaping) {
            if (typeof options.quoteCharacter === 'undefined') {
                var apos = (attrValue.match(/'/g) || []).length;
                var quot = (attrValue.match(/"/g) || []).length;
                attrQuote = apos < quot ? '\'' : '"';
            }
            else {
                attrQuote = options.quoteCharacter === '\'' ? '\'' : '"';
            }
            if (attrQuote === '"') {
                attrValue = attrValue.replace(/"/g, '&#34;');
            }
            else {
                attrValue = attrValue.replace(/'/g, '&#39;');
            }
        }
        emittedAttrValue = attrQuote + attrValue + attrQuote;
        if (!isLast && !options.removeTagWhitespace) {
            emittedAttrValue += ' ';
        }
    }
    // make sure trailing slash is not interpreted as HTML self-closing tag
    else if (isLast && !hasUnarySlash && !/\/$/.test(attrValue)) {
        emittedAttrValue = attrValue;
    }
    else {
        emittedAttrValue = attrValue + ' ';
    }

    if (typeof attrValue === 'undefined' || options.collapseBooleanAttributes &&
      isBooleanAttribute(attrName.toLowerCase(), attrValue.toLowerCase())) {
        attrFragment = attrName;
        if (!isLast) {
            attrFragment += ' ';
        }
    }
    else {
        attrFragment = attrName + attr.customAssign + emittedAttrValue;
    }

    return attr.customOpen + attrFragment + attr.customClose;
}

function identity(value) {
    return value;
}

function processOptions(values) {
    var options = {
        name: function(name) {
            return name.toLowerCase();
        },
        canCollapseWhitespace: canCollapseWhitespace,
        canTrimWhitespace: canTrimWhitespace,
        html5: true,
        ignoreCustomComments: [
            /^!/,
            /^\s*#/
        ],
        ignoreCustomFragments: [
            /<%[\s\S]*?%>/,
            /<\?[\s\S]*?\?>/
        ],
        includeAutoGeneratedTags: true,
        log: identity,
        minifyCSS: identity,
        minifyJS: identity,
        minifyURLs: identity
    };
    Object.keys(values).forEach(function(key) {
        var value = values[key];
        if (key === 'caseSensitive') {
            if (value) {
                options.name = identity;
            }
        }
        else if (key === 'log') {
            if (typeof value === 'function') {
                options.log = value;
            }
        }
        else if (key === 'minifyCSS' && typeof value !== 'function') {
            if (!value) {
                return;
            }
            if (typeof value !== 'object') {
                value = {};
            }
            options.minifyCSS = function(text, type) {
                text = text.replace(/(url\s*\(\s*)("|'|)(.*?)\2(\s*\))/ig, function(match, prefix, quote, url, suffix) {
                    return prefix + quote + options.minifyURLs(url) + quote + suffix;
                });
                var cleanCssOutput = new CleanCSS(value).minify(wrapCSS(text, type));
                if (cleanCssOutput.errors.length > 0) {
                    cleanCssOutput.errors.forEach(options.log);
                    return text;
                }
                return unwrapCSS(cleanCssOutput.styles, type);
            };
        }
        else if (key === 'minifyJS' && typeof value !== 'function') {
            if (!value) {
                return;
            }
            if (typeof value !== 'object') {
                value = {};
            }
            (value.parse || (value.parse = {})).bare_returns = false;
            options.minifyJS = async function(text, inline) {
                var start = text.match(/^\s*<!--.*/);
                var code = start ? text.slice(start[0].length).replace(/\n\s*-->\s*$/, '') : text;
                value.parse.bare_returns = inline;
                try {
                    const result = await Terser.minify(code, value);
                    return result.code.replace(/;$/, '');
                }
                catch (error) {
                    options.log(error);
                    return text;
                }
            };
        }
        else if (key === 'minifyURLs' && typeof value !== 'function') {
            if (!value) {
                return;
            }
            if (typeof value === 'string') {
                value = { site: value };
            }
            else if (typeof value !== 'object') {
                value = {};
            }
            options.minifyURLs = function(text) {
                try {
                    return RelateUrl.relate(text, value);
                }
                catch (err) {
                    options.log(err);
                    return text;
                }
            };
        }
        else {
            options[key] = value;
        }
    });
    return options;
}

function uniqueId(value) {
    var id;
    do {
        id = Math.random().toString(36).replace(/^0\.[0-9]*/, '');
    } while (~value.indexOf(id));
    return id;
}

var specialContentTags = createMapFromString('script,style');

async function createSortFns(value, options, uidIgnore, uidAttr) {
    var attrChains = options.sortAttributes && Object.create(null);
    var classChain = options.sortClassName && new TokenChain();

    function attrNames(attrs) {
        return attrs.map(function(attr) {
            return options.name(attr.name);
        });
    }

    function shouldSkipUID(token, uid) {
        return !uid || token.indexOf(uid) === -1;
    }

    function shouldSkipUIDs(token) {
        return shouldSkipUID(token, uidIgnore) && shouldSkipUID(token, uidAttr);
    }

    async function scan(input) {
        var currentTag, currentType;
        const parser = new HTMLParser(input, {
            start: function(tag, attrs) {
                if (attrChains) {
                    if (!attrChains[tag]) {
                        attrChains[tag] = new TokenChain();
                    }
                    attrChains[tag].add(attrNames(attrs).filter(shouldSkipUIDs));
                }
                for (var i = 0, len = attrs.length; i < len; i++) {
                    var attr = attrs[i];
                    if (classChain && attr.value && options.name(attr.name) === 'class') {
                        classChain.add(trimWhitespace(attr.value).split(/[ \t\n\f\r]+/).filter(shouldSkipUIDs));
                    }
                    else if (options.processScripts && attr.name.toLowerCase() === 'type') {
                        currentTag = tag;
                        currentType = attr.value;
                    }
                }
            },
            end: function() {
                currentTag = '';
            },
            chars: async function(text) {
                if (options.processScripts && specialContentTags(currentTag) &&
            options.processScripts.indexOf(currentType) > -1) {
                    await scan(text);
                }
            }
        });

        await parser.parse();
    }

    var log = options.log;
    options.log = identity;
    options.sortAttributes = false;
    options.sortClassName = false;
    await scan(await minify(value, options));
    options.log = log;
    if (attrChains) {
        var attrSorters = Object.create(null);
        for (var tag in attrChains) {
            attrSorters[tag] = attrChains[tag].createSorter();
        }
        options.sortAttributes = function(tag, attrs) {
            var sorter = attrSorters[tag];
            if (sorter) {
                var attrMap = Object.create(null);
                var names = attrNames(attrs);
                names.forEach(function(name, index) {
                    (attrMap[name] || (attrMap[name] = [])).push(attrs[index]);
                });
                sorter.sort(names).forEach(function(name, index) {
                    attrs[index] = attrMap[name].shift();
                });
            }
        };
    }
    if (classChain) {
        var sorter = classChain.createSorter();
        options.sortClassName = function(value) {
            return sorter.sort(value.split(/[ \n\f\r]+/)).join(' ');
        };
    }
}

async function minify(value, options, partialMarkup) {
    if (options.collapseWhitespace) {
        value = collapseWhitespace(value, options, true, true);
    }

    var buffer = [],
            charsPrevTag,
            currentChars = '',
            hasChars,
            currentTag = '',
            currentAttrs = [],
            stackNoTrimWhitespace = [],
            stackNoCollapseWhitespace = [],
            optionalStartTag = '',
            optionalEndTag = '',
            ignoredMarkupChunks = [],
            ignoredCustomMarkupChunks = [],
            uidIgnore,
            uidAttr,
            uidPattern;

    // temporarily replace ignored chunks with comments,
    // so that we don't have to worry what's there.
    // for all we care there might be
    // completely-horribly-broken-alien-non-html-emoj-cthulhu-filled content
    value = value.replace(/<!-- htmlmin:ignore -->([\s\S]*?)<!-- htmlmin:ignore -->/g, function(match, group1) {
        if (!uidIgnore) {
            uidIgnore = uniqueId(value);
            var pattern = new RegExp('^' + uidIgnore + '([0-9]+)$');
            if (options.ignoreCustomComments) {
                options.ignoreCustomComments = options.ignoreCustomComments.slice();
            }
            else {
                options.ignoreCustomComments = [];
            }
            options.ignoreCustomComments.push(pattern);
        }
        var token = '<!--' + uidIgnore + ignoredMarkupChunks.length + '-->';
        ignoredMarkupChunks.push(group1);
        return token;
    });

    var customFragments = options.ignoreCustomFragments.map(function(re) {
        return re.source;
    });
    if (customFragments.length) {
        var reCustomIgnore = new RegExp('\\s*(?:' + customFragments.join('|') + ')+\\s*', 'g');
        // temporarily replace custom ignored fragments with unique attributes
        value = value.replace(reCustomIgnore, function(match) {
            if (!uidAttr) {
                uidAttr = uniqueId(value);
                uidPattern = new RegExp('(\\s*)' + uidAttr + '([0-9]+)' + uidAttr + '(\\s*)', 'g');
                if (options.minifyCSS) {
                    options.minifyCSS = (function(fn) {
                        return function(text, type) {
                            text = text.replace(uidPattern, function(match, prefix, index) {
                                var chunks = ignoredCustomMarkupChunks[+index];
                                return chunks[1] + uidAttr + index + uidAttr + chunks[2];
                            });
                            var ids = [];
                            new CleanCSS().minify(wrapCSS(text, type)).warnings.forEach(function(warning) {
                                var match = uidPattern.exec(warning);
                                if (match) {
                                    var id = uidAttr + match[2] + uidAttr;
                                    text = text.replace(id, ignoreCSS(id));
                                    ids.push(id);
                                }
                            });
                            text = fn(text, type);
                            ids.forEach(function(id) {
                                text = text.replace(ignoreCSS(id), id);
                            });
                            return text;
                        };
                    })(options.minifyCSS);
                }
                if (options.minifyJS) {
                    options.minifyJS = (function(fn) {
                        return function(text, type) {
                            return fn(text.replace(uidPattern, function(match, prefix, index) {
                                var chunks = ignoredCustomMarkupChunks[+index];
                                return chunks[1] + uidAttr + index + uidAttr + chunks[2];
                            }), type);
                        };
                    })(options.minifyJS);
                }
            }
            var token = uidAttr + ignoredCustomMarkupChunks.length + uidAttr;
            ignoredCustomMarkupChunks.push(/^(\s*)[\s\S]*?(\s*)$/.exec(match));
            return '\t' + token + '\t';
        });
    }

    if (options.sortAttributes && typeof options.sortAttributes !== 'function' ||
      options.sortClassName && typeof options.sortClassName !== 'function') {
        await createSortFns(value, options, uidIgnore, uidAttr);
    }

    function _canCollapseWhitespace(tag, attrs) {
        return options.canCollapseWhitespace(tag, attrs, canCollapseWhitespace);
    }

    function _canTrimWhitespace(tag, attrs) {
        return options.canTrimWhitespace(tag, attrs, canTrimWhitespace);
    }

    function removeStartTag() {
        var index = buffer.length - 1;
        while (index > 0 && !/^<[^/!]/.test(buffer[index])) {
            index--;
        }
        buffer.length = Math.max(0, index);
    }

    function removeEndTag() {
        var index = buffer.length - 1;
        while (index > 0 && !/^<\//.test(buffer[index])) {
            index--;
        }
        buffer.length = Math.max(0, index);
    }

    // look for trailing whitespaces, bypass any inline tags
    function trimTrailingWhitespace(index, nextTag) {
        for (var endTag = null; index >= 0 && _canTrimWhitespace(endTag); index--) {
            var str = buffer[index];
            var match = str.match(/^<\/([\w:-]+)>$/);
            if (match) {
                endTag = match[1];
            }
            else if (/>$/.test(str) || (buffer[index] = collapseWhitespaceSmart(str, null, nextTag, options))) {
                break;
            }
        }
    }

    // look for trailing whitespaces from previously processed text
    // which may not be trimmed due to a following comment or an empty
    // element which has now been removed
    function squashTrailingWhitespace(nextTag) {
        var charsIndex = buffer.length - 1;
        if (buffer.length > 1) {
            var item = buffer[buffer.length - 1];
            if (/^(?:<!|$)/.test(item) && item.indexOf(uidIgnore) === -1) {
                charsIndex--;
            }
        }
        trimTrailingWhitespace(charsIndex, nextTag);
    }

    const parser = new HTMLParser(value, {
        partialMarkup: partialMarkup,
        continueOnParseError: options.continueOnParseError,
        customAttrAssign: options.customAttrAssign,
        customAttrSurround: options.customAttrSurround,
        html5: options.html5,

        start: async function(tag, attrs, unary, unarySlash, autoGenerated) {
            if (tag.toLowerCase() === 'svg') {
                options = Object.create(options);
                options.caseSensitive = true;
                options.keepClosingSlash = true;
                options.name = identity;
            }
            tag = options.name(tag);
            currentTag = tag;
            charsPrevTag = tag;
            if (!inlineTextTags(tag)) {
                currentChars = '';
            }
            hasChars = false;
            currentAttrs = attrs;

            var optional = options.removeOptionalTags;
            if (optional) {
                var htmlTag = htmlTags(tag);
                // <html> may be omitted if first thing inside is not comment
                // <head> may be omitted if first thing inside is an element
                // <body> may be omitted if first thing inside is not space, comment, <meta>, <link>, <script>, <style> or <template>
                // <colgroup> may be omitted if first thing inside is <col>
                // <tbody> may be omitted if first thing inside is <tr>
                if (htmlTag && canRemoveParentTag(optionalStartTag, tag)) {
                    removeStartTag();
                }
                optionalStartTag = '';
                // end-tag-followed-by-start-tag omission rules
                if (htmlTag && canRemovePrecedingTag(optionalEndTag, tag)) {
                    removeEndTag();
                    // <colgroup> cannot be omitted if preceding </colgroup> is omitted
                    // <tbody> cannot be omitted if preceding </tbody>, </thead> or </tfoot> is omitted
                    optional = !isStartTagMandatory(optionalEndTag, tag);
                }
                optionalEndTag = '';
            }

            // set whitespace flags for nested tags (eg. <code> within a <pre>)
            if (options.collapseWhitespace) {
                if (!stackNoTrimWhitespace.length) {
                    squashTrailingWhitespace(tag);
                }
                if (!unary) {
                    if (!_canTrimWhitespace(tag, attrs) || stackNoTrimWhitespace.length) {
                        stackNoTrimWhitespace.push(tag);
                    }
                    if (!_canCollapseWhitespace(tag, attrs) || stackNoCollapseWhitespace.length) {
                        stackNoCollapseWhitespace.push(tag);
                    }
                }
            }

            var openTag = '<' + tag;
            var hasUnarySlash = unarySlash && options.keepClosingSlash;

            buffer.push(openTag);

            if (options.sortAttributes) {
                options.sortAttributes(tag, attrs);
            }

            var parts = [];
            for (var i = attrs.length, isLast = true; --i >= 0;) {
                var normalized = await normalizeAttr(attrs[i], attrs, tag, options);
                if (normalized) {
                    parts.unshift(buildAttr(normalized, hasUnarySlash, options, isLast, uidAttr));
                    isLast = false;
                }
            }
            if (parts.length > 0) {
                buffer.push(' ');
                buffer.push.apply(buffer, parts);
            }
            // start tag must never be omitted if it has any attributes
            else if (optional && optionalStartTags(tag)) {
                optionalStartTag = tag;
            }

            buffer.push(buffer.pop() + (hasUnarySlash ? '/' : '') + '>');

            if (autoGenerated && !options.includeAutoGeneratedTags) {
                removeStartTag();
                optionalStartTag = '';
            }
        },
        end: function(tag, attrs, autoGenerated) {
            if (tag.toLowerCase() === 'svg') {
                options = Object.getPrototypeOf(options);
            }
            tag = options.name(tag);

            // check if current tag is in a whitespace stack
            if (options.collapseWhitespace) {
                if (stackNoTrimWhitespace.length) {
                    if (tag === stackNoTrimWhitespace[stackNoTrimWhitespace.length - 1]) {
                        stackNoTrimWhitespace.pop();
                    }
                }
                else {
                    squashTrailingWhitespace('/' + tag);
                }
                if (stackNoCollapseWhitespace.length &&
          tag === stackNoCollapseWhitespace[stackNoCollapseWhitespace.length - 1]) {
                    stackNoCollapseWhitespace.pop();
                }
            }

            var isElementEmpty = false;
            if (tag === currentTag) {
                currentTag = '';
                isElementEmpty = !hasChars;
            }

            if (options.removeOptionalTags) {
                // <html>, <head> or <body> may be omitted if the element is empty
                if (isElementEmpty && topLevelTags(optionalStartTag)) {
                    removeStartTag();
                }
                optionalStartTag = '';
                // </html> or </body> may be omitted if not followed by comment
                // </head> may be omitted if not followed by space or comment
                // </p> may be omitted if no more content in non-</a> parent
                // except for </dt> or </thead>, end tags may be omitted if no more content in parent element
                if (htmlTags(tag) && optionalEndTag && !trailingTags(optionalEndTag) && (optionalEndTag !== 'p' || !pInlineTags(tag))) {
                    removeEndTag();
                }
                optionalEndTag = optionalEndTags(tag) ? tag : '';
            }

            if (options.removeEmptyElements && isElementEmpty && canRemoveElement(tag, attrs)) {
                // remove last "element" from buffer
                removeStartTag();
                optionalStartTag = '';
                optionalEndTag = '';
            }
            else {
                if (autoGenerated && !options.includeAutoGeneratedTags) {
                    optionalEndTag = '';
                }
                else {
                    buffer.push('</' + tag + '>');
                }
                charsPrevTag = '/' + tag;
                if (!inlineTags(tag)) {
                    currentChars = '';
                }
                else if (isElementEmpty) {
                    currentChars += '|';
                }
            }
        },
        chars: async function(text, prevTag, nextTag) {
            prevTag = prevTag === '' ? 'comment' : prevTag;
            nextTag = nextTag === '' ? 'comment' : nextTag;
            if (options.decodeEntities && text && !specialContentTags(currentTag)) {
                text = decode(text);
            }
            if (options.collapseWhitespace) {
                if (!stackNoTrimWhitespace.length) {
                    if (prevTag === 'comment') {
                        var prevComment = buffer[buffer.length - 1];
                        if (prevComment.indexOf(uidIgnore) === -1) {
                            if (!prevComment) {
                                prevTag = charsPrevTag;
                            }
                            if (buffer.length > 1 && (!prevComment || !options.conservativeCollapse && / $/.test(currentChars))) {
                                var charsIndex = buffer.length - 2;
                                buffer[charsIndex] = buffer[charsIndex].replace(/\s+$/, function(trailingSpaces) {
                                    text = trailingSpaces + text;
                                    return '';
                                });
                            }
                        }
                    }
                    if (prevTag) {
                        if (prevTag === '/nobr' || prevTag === 'wbr') {
                            if (/^\s/.test(text)) {
                                var tagIndex = buffer.length - 1;
                                while (tagIndex > 0 && buffer[tagIndex].lastIndexOf('<' + prevTag) !== 0) {
                                    tagIndex--;
                                }
                                trimTrailingWhitespace(tagIndex - 1, 'br');
                            }
                        }
                        else if (inlineTextTags(prevTag.charAt(0) === '/' ? prevTag.slice(1) : prevTag)) {
                            text = collapseWhitespace(text, options, /(?:^|\s)$/.test(currentChars));
                        }
                    }
                    if (prevTag || nextTag) {
                        text = collapseWhitespaceSmart(text, prevTag, nextTag, options);
                    }
                    else {
                        text = collapseWhitespace(text, options, true, true);
                    }
                    if (!text && /\s$/.test(currentChars) && prevTag && prevTag.charAt(0) === '/') {
                        trimTrailingWhitespace(buffer.length - 1, nextTag);
                    }
                }
                if (!stackNoCollapseWhitespace.length && nextTag !== 'html' && !(prevTag && nextTag)) {
                    text = collapseWhitespace(text, options, false, false, true);
                }
            }
            if (options.processScripts && specialContentTags(currentTag)) {
                text = await processScript(text, options, currentAttrs);
            }
            if (isExecutableScript(currentTag, currentAttrs)) {
                text = await options.minifyJS(text);
            }
            if (isStyleSheet(currentTag, currentAttrs)) {
                text = options.minifyCSS(text);
            }
            if (options.removeOptionalTags && text) {
                // <html> may be omitted if first thing inside is not comment
                // <body> may be omitted if first thing inside is not space, comment, <meta>, <link>, <script>, <style> or <template>
                if (optionalStartTag === 'html' || optionalStartTag === 'body' && !/^\s/.test(text)) {
                    removeStartTag();
                }
                optionalStartTag = '';
                // </html> or </body> may be omitted if not followed by comment
                // </head>, </colgroup> or </caption> may be omitted if not followed by space or comment
                if (compactTags(optionalEndTag) || looseTags(optionalEndTag) && !/^\s/.test(text)) {
                    removeEndTag();
                }
                optionalEndTag = '';
            }
            charsPrevTag = /^\s*$/.test(text) ? prevTag : 'comment';
            if (options.decodeEntities && text && !specialContentTags(currentTag)) {
                // Escape any `&` symbols that start either:
                // 1) a legacy named character reference (i.e. one that doesn't end with `;`)
                // 2) or any other character reference (i.e. one that does end with `;`)
                // Note that `&` can be escaped as `&amp`, without the semi-colon.
                // https://mathiasbynens.be/notes/ambiguous-ampersands
                text = text.replace(/&((?:Iacute|aacute|uacute|plusmn|Otilde|otilde|agrave|Agrave|Yacute|yacute|Oslash|oslash|atilde|Atilde|brvbar|ccedil|Ccedil|Ograve|curren|divide|eacute|Eacute|ograve|Oacute|egrave|Egrave|Ugrave|frac12|frac14|frac34|ugrave|oacute|iacute|Ntilde|ntilde|Uacute|middot|igrave|Igrave|iquest|Aacute|cedil|laquo|micro|iexcl|Icirc|icirc|acirc|Ucirc|Ecirc|ocirc|Ocirc|ecirc|ucirc|Aring|aring|AElig|aelig|acute|pound|raquo|Acirc|times|THORN|szlig|thorn|COPY|auml|ordf|ordm|Uuml|macr|uuml|Auml|ouml|Ouml|para|nbsp|euml|quot|QUOT|Euml|yuml|cent|sect|copy|sup1|sup2|sup3|iuml|Iuml|ETH|shy|reg|not|yen|amp|AMP|REG|uml|eth|deg|gt|GT|LT|lt)(?!;)|(?:#?[0-9a-zA-Z]+;))/g, '&amp$1').replace(/</g, '&lt;');
            }
            if (uidPattern && options.collapseWhitespace && stackNoTrimWhitespace.length) {
                text = text.replace(uidPattern, function(match, prefix, index) {
                    return ignoredCustomMarkupChunks[+index][0];
                });
            }
            currentChars += text;
            if (text) {
                hasChars = true;
            }
            buffer.push(text);
        },
        comment: async function(text, nonStandard) {
            var prefix = nonStandard ? '<!' : '<!--';
            var suffix = nonStandard ? '>' : '-->';
            if (isConditionalComment(text)) {
                text = prefix + await cleanConditionalComment(text, options) + suffix;
            }
            else if (options.removeComments) {
                if (isIgnoredComment(text, options)) {
                    text = '<!--' + text + '-->';
                }
                else {
                    text = '';
                }
            }
            else {
                text = prefix + text + suffix;
            }
            if (options.removeOptionalTags && text) {
                // preceding comments suppress tag omissions
                optionalStartTag = '';
                optionalEndTag = '';
            }
            buffer.push(text);
        },
        doctype: function(doctype) {
            buffer.push(options.useShortDoctype ? '<!doctype' +
        (options.removeTagWhitespace ? '' : ' ') + 'html>' :
                collapseWhitespaceAll(doctype));
        }
    });

    await parser.parse();

    if (options.removeOptionalTags) {
    // <html> may be omitted if first thing inside is not comment
    // <head> or <body> may be omitted if empty
        if (topLevelTags(optionalStartTag)) {
            removeStartTag();
        }
        // except for </dt> or </thead>, end tags may be omitted if no more content in parent element
        if (optionalEndTag && !trailingTags(optionalEndTag)) {
            removeEndTag();
        }
    }
    if (options.collapseWhitespace) {
        squashTrailingWhitespace('br');
    }

    return joinResultSegments(buffer, options, uidPattern ? function(str) {
        return str.replace(uidPattern, function(match, prefix, index, suffix) {
            var chunk = ignoredCustomMarkupChunks[+index][0];
            if (options.collapseWhitespace) {
                if (prefix !== '\t') {
                    chunk = prefix + chunk;
                }
                if (suffix !== '\t') {
                    chunk += suffix;
                }
                return collapseWhitespace(chunk, {
                    preserveLineBreaks: options.preserveLineBreaks,
                    conservativeCollapse: !options.trimCustomFragments
                }, /^[ \n\r\t\f]/.test(chunk), /[ \n\r\t\f]$/.test(chunk));
            }
            return chunk;
        });
    } : identity, uidIgnore ? function(str) {
        return str.replace(new RegExp('<!--' + uidIgnore + '([0-9]+)-->', 'g'), function(match, index) {
            return ignoredMarkupChunks[+index];
        });
    } : identity);
}

function joinResultSegments(results, options, restoreCustom, restoreIgnore) {
    var str;
    var maxLineLength = options.maxLineLength;
    if (maxLineLength) {
        var line = '', lines = [];
        while (results.length) {
            var len = line.length;
            var end = results[0].indexOf('\n');
            if (end < 0) {
                line += restoreIgnore(restoreCustom(results.shift()));
            }
            else {
                line += restoreIgnore(restoreCustom(results[0].slice(0, end)));
                results[0] = results[0].slice(end + 1);
            }
            if (len > 0 && line.length > maxLineLength) {
                lines.push(line.slice(0, len));
                line = line.slice(len);
            }
            else if (end >= 0) {
                lines.push(line);
                line = '';
            }
        }
        if (line) {
            lines.push(line);
        }
        str = lines.join('\n');
    }
    else {
        str = restoreIgnore(restoreCustom(results.join('')));
    }
    return options.collapseWhitespace ? collapseWhitespace(str, options, true, true) : str;
}

var minify_1 = htmlminifier.minify = async function(value, options) {
    var start = Date.now();
    options = processOptions(options || {});
    var result = await minify(value, options);
    options.log('minified in: ' + (Date.now() - start) + 'ms');
    return result;
};

export { htmlminifier as default, minify_1 as minify };
