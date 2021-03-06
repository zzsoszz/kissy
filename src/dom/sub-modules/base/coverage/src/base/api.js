function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/base/api.js']) {
  _$jscoverage['/base/api.js'] = {};
  _$jscoverage['/base/api.js'].lineData = [];
  _$jscoverage['/base/api.js'].lineData[6] = 0;
  _$jscoverage['/base/api.js'].lineData[7] = 0;
  _$jscoverage['/base/api.js'].lineData[80] = 0;
  _$jscoverage['/base/api.js'].lineData[81] = 0;
  _$jscoverage['/base/api.js'].lineData[82] = 0;
  _$jscoverage['/base/api.js'].lineData[84] = 0;
  _$jscoverage['/base/api.js'].lineData[95] = 0;
  _$jscoverage['/base/api.js'].lineData[96] = 0;
  _$jscoverage['/base/api.js'].lineData[97] = 0;
  _$jscoverage['/base/api.js'].lineData[99] = 0;
  _$jscoverage['/base/api.js'].lineData[105] = 0;
  _$jscoverage['/base/api.js'].lineData[118] = 0;
  _$jscoverage['/base/api.js'].lineData[119] = 0;
  _$jscoverage['/base/api.js'].lineData[122] = 0;
  _$jscoverage['/base/api.js'].lineData[124] = 0;
  _$jscoverage['/base/api.js'].lineData[125] = 0;
  _$jscoverage['/base/api.js'].lineData[128] = 0;
  _$jscoverage['/base/api.js'].lineData[130] = 0;
  _$jscoverage['/base/api.js'].lineData[131] = 0;
  _$jscoverage['/base/api.js'].lineData[134] = 0;
  _$jscoverage['/base/api.js'].lineData[143] = 0;
  _$jscoverage['/base/api.js'].lineData[144] = 0;
  _$jscoverage['/base/api.js'].lineData[146] = 0;
  _$jscoverage['/base/api.js'].lineData[147] = 0;
  _$jscoverage['/base/api.js'].lineData[160] = 0;
  _$jscoverage['/base/api.js'].lineData[169] = 0;
  _$jscoverage['/base/api.js'].lineData[172] = 0;
  _$jscoverage['/base/api.js'].lineData[173] = 0;
  _$jscoverage['/base/api.js'].lineData[174] = 0;
  _$jscoverage['/base/api.js'].lineData[175] = 0;
  _$jscoverage['/base/api.js'].lineData[178] = 0;
  _$jscoverage['/base/api.js'].lineData[184] = 0;
}
if (! _$jscoverage['/base/api.js'].functionData) {
  _$jscoverage['/base/api.js'].functionData = [];
  _$jscoverage['/base/api.js'].functionData[0] = 0;
  _$jscoverage['/base/api.js'].functionData[1] = 0;
  _$jscoverage['/base/api.js'].functionData[2] = 0;
  _$jscoverage['/base/api.js'].functionData[3] = 0;
  _$jscoverage['/base/api.js'].functionData[4] = 0;
  _$jscoverage['/base/api.js'].functionData[5] = 0;
  _$jscoverage['/base/api.js'].functionData[6] = 0;
}
if (! _$jscoverage['/base/api.js'].branchData) {
  _$jscoverage['/base/api.js'].branchData = {};
  _$jscoverage['/base/api.js'].branchData['7'] = [];
  _$jscoverage['/base/api.js'].branchData['7'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['80'] = [];
  _$jscoverage['/base/api.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['84'] = [];
  _$jscoverage['/base/api.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['85'] = [];
  _$jscoverage['/base/api.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['95'] = [];
  _$jscoverage['/base/api.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['97'] = [];
  _$jscoverage['/base/api.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['118'] = [];
  _$jscoverage['/base/api.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['124'] = [];
  _$jscoverage['/base/api.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['130'] = [];
  _$jscoverage['/base/api.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['134'] = [];
  _$jscoverage['/base/api.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['143'] = [];
  _$jscoverage['/base/api.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['149'] = [];
  _$jscoverage['/base/api.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['160'] = [];
  _$jscoverage['/base/api.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['160'][3] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['172'] = [];
  _$jscoverage['/base/api.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['174'] = [];
  _$jscoverage['/base/api.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base/api.js'].branchData['174'][2] = new BranchData();
}
_$jscoverage['/base/api.js'].branchData['174'][2].init(90, 20, 'scopeName !== \'HTML\'');
function visit19_174_2(result) {
  _$jscoverage['/base/api.js'].branchData['174'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['174'][1].init(77, 33, 'scopeName && scopeName !== \'HTML\'');
function visit18_174_1(result) {
  _$jscoverage['/base/api.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['172'][1].init(207, 5, 'UA.ie');
function visit17_172_1(result) {
  _$jscoverage['/base/api.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['160'][3].init(348, 23, 'o.item && !o.setTimeout');
function visit16_160_3(result) {
  _$jscoverage['/base/api.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['160'][2].init(333, 38, '!o.nodeType && o.item && !o.setTimeout');
function visit15_160_2(result) {
  _$jscoverage['/base/api.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['160'][1].init(328, 43, 'o && !o.nodeType && o.item && !o.setTimeout');
function visit14_160_1(result) {
  _$jscoverage['/base/api.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['149'][1].init(77, 40, 'elem.nodeType === NodeType.DOCUMENT_NODE');
function visit13_149_1(result) {
  _$jscoverage['/base/api.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['143'][1].init(22, 5, '!elem');
function visit12_143_1(result) {
  _$jscoverage['/base/api.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['134'][1].init(416, 35, 'doc.defaultView || doc.parentWindow');
function visit11_134_1(result) {
  _$jscoverage['/base/api.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['130'][1].init(281, 39, 'doc.nodeType !== NodeType.DOCUMENT_NODE');
function visit10_130_1(result) {
  _$jscoverage['/base/api.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['124'][1].init(150, 16, 'S.isWindow(elem)');
function visit9_124_1(result) {
  _$jscoverage['/base/api.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['118'][1].init(22, 5, '!elem');
function visit8_118_1(result) {
  _$jscoverage['/base/api.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['97'][1].init(97, 32, 'UA.ie && Dom.isCustomDomain(win)');
function visit7_97_1(result) {
  _$jscoverage['/base/api.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['95'][1].init(24, 13, 'win || WINDOW');
function visit6_95_1(result) {
  _$jscoverage['/base/api.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['85'][1].init(43, 33, 'domain !== (\'[\' + hostname + \']\')');
function visit5_85_1(result) {
  _$jscoverage['/base/api.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['84'][2].init(206, 19, 'domain !== hostname');
function visit4_84_2(result) {
  _$jscoverage['/base/api.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['84'][1].init(206, 77, 'domain !== hostname && domain !== (\'[\' + hostname + \']\')');
function visit3_84_1(result) {
  _$jscoverage['/base/api.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['80'][1].init(24, 13, 'win || WINDOW');
function visit2_80_1(result) {
  _$jscoverage['/base/api.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].branchData['7'][1].init(19, 16, 'S.Env.host || {}');
function visit1_7_1(result) {
  _$jscoverage['/base/api.js'].branchData['7'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/api.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/api.js'].functionData[0]++;
  _$jscoverage['/base/api.js'].lineData[7]++;
  var WINDOW = visit1_7_1(S.Env.host || {}), DOCUMENT = WINDOW.document, UA = require('ua'), RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source, NodeType = {
  ELEMENT_NODE: 1, 
  ATTRIBUTE_NODE: 2, 
  TEXT_NODE: 3, 
  CDATA_SECTION_NODE: 4, 
  ENTITY_REFERENCE_NODE: 5, 
  ENTITY_NODE: 6, 
  PROCESSING_INSTRUCTION_NODE: 7, 
  COMMENT_NODE: 8, 
  DOCUMENT_NODE: 9, 
  DOCUMENT_TYPE_NODE: 10, 
  DOCUMENT_FRAGMENT_NODE: 11, 
  NOTATION_NODE: 12}, Dom = {
  isCustomDomain: function(win) {
  _$jscoverage['/base/api.js'].functionData[1]++;
  _$jscoverage['/base/api.js'].lineData[80]++;
  win = visit2_80_1(win || WINDOW);
  _$jscoverage['/base/api.js'].lineData[81]++;
  win = Dom.get(win);
  _$jscoverage['/base/api.js'].lineData[82]++;
  var domain = win.document.domain, hostname = win.location.hostname;
  _$jscoverage['/base/api.js'].lineData[84]++;
  return visit3_84_1(visit4_84_2(domain !== hostname) && visit5_85_1(domain !== ('[' + hostname + ']')));
}, 
  getEmptyIframeSrc: function(win) {
  _$jscoverage['/base/api.js'].functionData[2]++;
  _$jscoverage['/base/api.js'].lineData[95]++;
  win = visit6_95_1(win || WINDOW);
  _$jscoverage['/base/api.js'].lineData[96]++;
  win = Dom.get(win);
  _$jscoverage['/base/api.js'].lineData[97]++;
  if (visit7_97_1(UA.ie && Dom.isCustomDomain(win))) {
    _$jscoverage['/base/api.js'].lineData[99]++;
    return 'javascript:void(function(){' + encodeURIComponent('document.open();' + 'document.domain="' + win.document.domain + '";' + 'document.close();') + '}())';
  }
  _$jscoverage['/base/api.js'].lineData[105]++;
  return '';
}, 
  NodeType: NodeType, 
  getWindow: function(elem) {
  _$jscoverage['/base/api.js'].functionData[3]++;
  _$jscoverage['/base/api.js'].lineData[118]++;
  if (visit8_118_1(!elem)) {
    _$jscoverage['/base/api.js'].lineData[119]++;
    return WINDOW;
  }
  _$jscoverage['/base/api.js'].lineData[122]++;
  elem = Dom.get(elem);
  _$jscoverage['/base/api.js'].lineData[124]++;
  if (visit9_124_1(S.isWindow(elem))) {
    _$jscoverage['/base/api.js'].lineData[125]++;
    return elem;
  }
  _$jscoverage['/base/api.js'].lineData[128]++;
  var doc = elem;
  _$jscoverage['/base/api.js'].lineData[130]++;
  if (visit10_130_1(doc.nodeType !== NodeType.DOCUMENT_NODE)) {
    _$jscoverage['/base/api.js'].lineData[131]++;
    doc = elem.ownerDocument;
  }
  _$jscoverage['/base/api.js'].lineData[134]++;
  return visit11_134_1(doc.defaultView || doc.parentWindow);
}, 
  getDocument: function(elem) {
  _$jscoverage['/base/api.js'].functionData[4]++;
  _$jscoverage['/base/api.js'].lineData[143]++;
  if (visit12_143_1(!elem)) {
    _$jscoverage['/base/api.js'].lineData[144]++;
    return DOCUMENT;
  }
  _$jscoverage['/base/api.js'].lineData[146]++;
  elem = Dom.get(elem);
  _$jscoverage['/base/api.js'].lineData[147]++;
  return S.isWindow(elem) ? elem.document : (visit13_149_1(elem.nodeType === NodeType.DOCUMENT_NODE) ? elem : elem.ownerDocument);
}, 
  isDomNodeList: function(o) {
  _$jscoverage['/base/api.js'].functionData[5]++;
  _$jscoverage['/base/api.js'].lineData[160]++;
  return visit14_160_1(o && visit15_160_2(!o.nodeType && visit16_160_3(o.item && !o.setTimeout)));
}, 
  nodeName: function(selector) {
  _$jscoverage['/base/api.js'].functionData[6]++;
  _$jscoverage['/base/api.js'].lineData[169]++;
  var el = Dom.get(selector), nodeName = el.nodeName.toLowerCase();
  _$jscoverage['/base/api.js'].lineData[172]++;
  if (visit17_172_1(UA.ie)) {
    _$jscoverage['/base/api.js'].lineData[173]++;
    var scopeName = el.scopeName;
    _$jscoverage['/base/api.js'].lineData[174]++;
    if (visit18_174_1(scopeName && visit19_174_2(scopeName !== 'HTML'))) {
      _$jscoverage['/base/api.js'].lineData[175]++;
      nodeName = scopeName.toLowerCase() + ':' + nodeName;
    }
  }
  _$jscoverage['/base/api.js'].lineData[178]++;
  return nodeName;
}, 
  _RE_NUM_NO_PX: new RegExp('^(' + RE_NUM + ')(?!px)[a-z%]+$', 'i')};
  _$jscoverage['/base/api.js'].lineData[184]++;
  return Dom;
});
