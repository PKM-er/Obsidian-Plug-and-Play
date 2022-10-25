'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const regEmoji = new RegExp(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\uFE0E-\uFE0F]/, "g");
function allAlphabets(text) {
    return Boolean(text.match(/^[a-zA-Z0-9_-]+$/));
}
function excludeEmoji(text) {
    return text.replace(regEmoji, "");
}
function encodeSpace(text) {
    return text.replace(/ /g, "%20");
}
function lowerIncludes(one, other) {
    return one.toLowerCase().includes(other.toLowerCase());
}
function lowerStartsWith(a, b) {
    return a.toLowerCase().startsWith(b.toLowerCase());
}
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function startsSmallLetterOnlyFirst(str) {
    return Boolean(str.match(/^[A-Z][^A-Z]+$/));
}
function* splitRaw(text, regexp) {
    let previousIndex = 0;
    for (let r of text.matchAll(regexp)) {
        if (previousIndex !== r.index) {
            yield text.slice(previousIndex, r.index);
        }
        yield text[r.index];
        previousIndex = r.index + 1;
    }
    if (previousIndex !== text.length) {
        yield text.slice(previousIndex, text.length);
    }
}

function pickTokens(content, trimPattern) {
    return content.split(trimPattern).filter((x) => x !== "");
}
const TRIM_CHAR_PATTERN = /[\n\t\[\]$/:?!=()<>"'.,|;*~ `]/g;
class DefaultTokenizer {
    tokenize(content, raw) {
        return raw
            ? Array.from(splitRaw(content, this.getTrimPattern())).filter((x) => x !== " ")
            : pickTokens(content, this.getTrimPattern());
    }
    recursiveTokenize(content) {
        const trimIndexes = Array.from(content.matchAll(this.getTrimPattern()))
            .sort((a, b) => a.index - b.index)
            .map((x) => x.index);
        return [
            { word: content, offset: 0 },
            ...trimIndexes.map((i) => ({
                word: content.slice(i + 1),
                offset: i + 1,
            })),
        ];
    }
    getTrimPattern() {
        return TRIM_CHAR_PATTERN;
    }
    shouldIgnoreOnCurrent(str) {
        return false;
    }
}

const ARABIC_TRIM_CHAR_PATTERN = /[\n\t\[\]$/:?!=()<>"'.,|;*~ `،؛]/g;
class ArabicTokenizer extends DefaultTokenizer {
    getTrimPattern() {
        return ARABIC_TRIM_CHAR_PATTERN;
    }
}

// @ts-nocheck
// Because this code is originally javascript code.
// noinspection FunctionTooLongJS,FunctionWithMultipleLoopsJS,EqualityComparisonWithCoercionJS,PointlessBooleanExpressionJS,JSDeclarationsAtScopeStart
// TinySegmenter 0.1 -- Super compact Japanese tokenizer in Javascript
// (c) 2008 Taku Kudo <taku@chasen.org>
// TinySegmenter is freely distributable under the terms of a new BSD licence.
// For details, see http://chasen.org/~taku/software/TinySegmenter/LICENCE.txt
function TinySegmenter() {
    var patterns = {
        "[一二三四五六七八九十百千万億兆]": "M",
        "[一-龠々〆ヵヶ]": "H",
        "[ぁ-ん]": "I",
        "[ァ-ヴーｱ-ﾝﾞｰ]": "K",
        "[a-zA-Zａ-ｚＡ-Ｚ]": "A",
        "[0-9０-９]": "N",
    };
    this.chartype_ = [];
    for (var i in patterns) {
        var regexp = new RegExp();
        regexp.compile(i);
        this.chartype_.push([regexp, patterns[i]]);
    }
    this.BIAS__ = -332;
    this.BC1__ = { HH: 6, II: 2461, KH: 406, OH: -1378 };
    this.BC2__ = {
        AA: -3267,
        AI: 2744,
        AN: -878,
        HH: -4070,
        HM: -1711,
        HN: 4012,
        HO: 3761,
        IA: 1327,
        IH: -1184,
        II: -1332,
        IK: 1721,
        IO: 5492,
        KI: 3831,
        KK: -8741,
        MH: -3132,
        MK: 3334,
        OO: -2920,
    };
    this.BC3__ = {
        HH: 996,
        HI: 626,
        HK: -721,
        HN: -1307,
        HO: -836,
        IH: -301,
        KK: 2762,
        MK: 1079,
        MM: 4034,
        OA: -1652,
        OH: 266,
    };
    this.BP1__ = { BB: 295, OB: 304, OO: -125, UB: 352 };
    this.BP2__ = { BO: 60, OO: -1762 };
    this.BQ1__ = {
        BHH: 1150,
        BHM: 1521,
        BII: -1158,
        BIM: 886,
        BMH: 1208,
        BNH: 449,
        BOH: -91,
        BOO: -2597,
        OHI: 451,
        OIH: -296,
        OKA: 1851,
        OKH: -1020,
        OKK: 904,
        OOO: 2965,
    };
    this.BQ2__ = {
        BHH: 118,
        BHI: -1159,
        BHM: 466,
        BIH: -919,
        BKK: -1720,
        BKO: 864,
        OHH: -1139,
        OHM: -181,
        OIH: 153,
        UHI: -1146,
    };
    this.BQ3__ = {
        BHH: -792,
        BHI: 2664,
        BII: -299,
        BKI: 419,
        BMH: 937,
        BMM: 8335,
        BNN: 998,
        BOH: 775,
        OHH: 2174,
        OHM: 439,
        OII: 280,
        OKH: 1798,
        OKI: -793,
        OKO: -2242,
        OMH: -2402,
        OOO: 11699,
    };
    this.BQ4__ = {
        BHH: -3895,
        BIH: 3761,
        BII: -4654,
        BIK: 1348,
        BKK: -1806,
        BMI: -3385,
        BOO: -12396,
        OAH: 926,
        OHH: 266,
        OHK: -2036,
        ONN: -973,
    };
    this.BW1__ = {
        ",と": 660,
        ",同": 727,
        B1あ: 1404,
        B1同: 542,
        "、と": 660,
        "、同": 727,
        "」と": 1682,
        あっ: 1505,
        いう: 1743,
        いっ: -2055,
        いる: 672,
        うし: -4817,
        うん: 665,
        から: 3472,
        がら: 600,
        こう: -790,
        こと: 2083,
        こん: -1262,
        さら: -4143,
        さん: 4573,
        した: 2641,
        して: 1104,
        すで: -3399,
        そこ: 1977,
        それ: -871,
        たち: 1122,
        ため: 601,
        った: 3463,
        つい: -802,
        てい: 805,
        てき: 1249,
        でき: 1127,
        です: 3445,
        では: 844,
        とい: -4915,
        とみ: 1922,
        どこ: 3887,
        ない: 5713,
        なっ: 3015,
        など: 7379,
        なん: -1113,
        にし: 2468,
        には: 1498,
        にも: 1671,
        に対: -912,
        の一: -501,
        の中: 741,
        ませ: 2448,
        まで: 1711,
        まま: 2600,
        まる: -2155,
        やむ: -1947,
        よっ: -2565,
        れた: 2369,
        れで: -913,
        をし: 1860,
        を見: 731,
        亡く: -1886,
        京都: 2558,
        取り: -2784,
        大き: -2604,
        大阪: 1497,
        平方: -2314,
        引き: -1336,
        日本: -195,
        本当: -2423,
        毎日: -2113,
        目指: -724,
        Ｂ１あ: 1404,
        Ｂ１同: 542,
        "｣と": 1682,
    };
    this.BW2__ = {
        "..": -11822,
        11: -669,
        "――": -5730,
        "−−": -13175,
        いう: -1609,
        うか: 2490,
        かし: -1350,
        かも: -602,
        から: -7194,
        かれ: 4612,
        がい: 853,
        がら: -3198,
        きた: 1941,
        くな: -1597,
        こと: -8392,
        この: -4193,
        させ: 4533,
        され: 13168,
        さん: -3977,
        しい: -1819,
        しか: -545,
        した: 5078,
        して: 972,
        しな: 939,
        その: -3744,
        たい: -1253,
        たた: -662,
        ただ: -3857,
        たち: -786,
        たと: 1224,
        たは: -939,
        った: 4589,
        って: 1647,
        っと: -2094,
        てい: 6144,
        てき: 3640,
        てく: 2551,
        ては: -3110,
        ても: -3065,
        でい: 2666,
        でき: -1528,
        でし: -3828,
        です: -4761,
        でも: -4203,
        とい: 1890,
        とこ: -1746,
        とと: -2279,
        との: 720,
        とみ: 5168,
        とも: -3941,
        ない: -2488,
        なが: -1313,
        など: -6509,
        なの: 2614,
        なん: 3099,
        にお: -1615,
        にし: 2748,
        にな: 2454,
        によ: -7236,
        に対: -14943,
        に従: -4688,
        に関: -11388,
        のか: 2093,
        ので: -7059,
        のに: -6041,
        のの: -6125,
        はい: 1073,
        はが: -1033,
        はず: -2532,
        ばれ: 1813,
        まし: -1316,
        まで: -6621,
        まれ: 5409,
        めて: -3153,
        もい: 2230,
        もの: -10713,
        らか: -944,
        らし: -1611,
        らに: -1897,
        りし: 651,
        りま: 1620,
        れた: 4270,
        れて: 849,
        れば: 4114,
        ろう: 6067,
        われ: 7901,
        を通: -11877,
        んだ: 728,
        んな: -4115,
        一人: 602,
        一方: -1375,
        一日: 970,
        一部: -1051,
        上が: -4479,
        会社: -1116,
        出て: 2163,
        分の: -7758,
        同党: 970,
        同日: -913,
        大阪: -2471,
        委員: -1250,
        少な: -1050,
        年度: -8669,
        年間: -1626,
        府県: -2363,
        手権: -1982,
        新聞: -4066,
        日新: -722,
        日本: -7068,
        日米: 3372,
        曜日: -601,
        朝鮮: -2355,
        本人: -2697,
        東京: -1543,
        然と: -1384,
        社会: -1276,
        立て: -990,
        第に: -1612,
        米国: -4268,
        "１１": -669,
    };
    this.BW3__ = {
        あた: -2194,
        あり: 719,
        ある: 3846,
        "い.": -1185,
        "い。": -1185,
        いい: 5308,
        いえ: 2079,
        いく: 3029,
        いた: 2056,
        いっ: 1883,
        いる: 5600,
        いわ: 1527,
        うち: 1117,
        うと: 4798,
        えと: 1454,
        "か.": 2857,
        "か。": 2857,
        かけ: -743,
        かっ: -4098,
        かに: -669,
        から: 6520,
        かり: -2670,
        "が,": 1816,
        "が、": 1816,
        がき: -4855,
        がけ: -1127,
        がっ: -913,
        がら: -4977,
        がり: -2064,
        きた: 1645,
        けど: 1374,
        こと: 7397,
        この: 1542,
        ころ: -2757,
        さい: -714,
        さを: 976,
        "し,": 1557,
        "し、": 1557,
        しい: -3714,
        した: 3562,
        して: 1449,
        しな: 2608,
        しま: 1200,
        "す.": -1310,
        "す。": -1310,
        する: 6521,
        "ず,": 3426,
        "ず、": 3426,
        ずに: 841,
        そう: 428,
        "た.": 8875,
        "た。": 8875,
        たい: -594,
        たの: 812,
        たり: -1183,
        たる: -853,
        "だ.": 4098,
        "だ。": 4098,
        だっ: 1004,
        った: -4748,
        って: 300,
        てい: 6240,
        てお: 855,
        ても: 302,
        です: 1437,
        でに: -1482,
        では: 2295,
        とう: -1387,
        とし: 2266,
        との: 541,
        とも: -3543,
        どう: 4664,
        ない: 1796,
        なく: -903,
        など: 2135,
        "に,": -1021,
        "に、": -1021,
        にし: 1771,
        にな: 1906,
        には: 2644,
        "の,": -724,
        "の、": -724,
        の子: -1000,
        "は,": 1337,
        "は、": 1337,
        べき: 2181,
        まし: 1113,
        ます: 6943,
        まっ: -1549,
        まで: 6154,
        まれ: -793,
        らし: 1479,
        られ: 6820,
        るる: 3818,
        "れ,": 854,
        "れ、": 854,
        れた: 1850,
        れて: 1375,
        れば: -3246,
        れる: 1091,
        われ: -605,
        んだ: 606,
        んで: 798,
        カ月: 990,
        会議: 860,
        入り: 1232,
        大会: 2217,
        始め: 1681,
        市: 965,
        新聞: -5055,
        "日,": 974,
        "日、": 974,
        社会: 2024,
        ｶ月: 990,
    };
    this.TC1__ = {
        AAA: 1093,
        HHH: 1029,
        HHM: 580,
        HII: 998,
        HOH: -390,
        HOM: -331,
        IHI: 1169,
        IOH: -142,
        IOI: -1015,
        IOM: 467,
        MMH: 187,
        OOI: -1832,
    };
    this.TC2__ = {
        HHO: 2088,
        HII: -1023,
        HMM: -1154,
        IHI: -1965,
        KKH: 703,
        OII: -2649,
    };
    this.TC3__ = {
        AAA: -294,
        HHH: 346,
        HHI: -341,
        HII: -1088,
        HIK: 731,
        HOH: -1486,
        IHH: 128,
        IHI: -3041,
        IHO: -1935,
        IIH: -825,
        IIM: -1035,
        IOI: -542,
        KHH: -1216,
        KKA: 491,
        KKH: -1217,
        KOK: -1009,
        MHH: -2694,
        MHM: -457,
        MHO: 123,
        MMH: -471,
        NNH: -1689,
        NNO: 662,
        OHO: -3393,
    };
    this.TC4__ = {
        HHH: -203,
        HHI: 1344,
        HHK: 365,
        HHM: -122,
        HHN: 182,
        HHO: 669,
        HIH: 804,
        HII: 679,
        HOH: 446,
        IHH: 695,
        IHO: -2324,
        IIH: 321,
        III: 1497,
        IIO: 656,
        IOO: 54,
        KAK: 4845,
        KKA: 3386,
        KKK: 3065,
        MHH: -405,
        MHI: 201,
        MMH: -241,
        MMM: 661,
        MOM: 841,
    };
    this.TQ1__ = {
        BHHH: -227,
        BHHI: 316,
        BHIH: -132,
        BIHH: 60,
        BIII: 1595,
        BNHH: -744,
        BOHH: 225,
        BOOO: -908,
        OAKK: 482,
        OHHH: 281,
        OHIH: 249,
        OIHI: 200,
        OIIH: -68,
    };
    this.TQ2__ = { BIHH: -1401, BIII: -1033, BKAK: -543, BOOO: -5591 };
    this.TQ3__ = {
        BHHH: 478,
        BHHM: -1073,
        BHIH: 222,
        BHII: -504,
        BIIH: -116,
        BIII: -105,
        BMHI: -863,
        BMHM: -464,
        BOMH: 620,
        OHHH: 346,
        OHHI: 1729,
        OHII: 997,
        OHMH: 481,
        OIHH: 623,
        OIIH: 1344,
        OKAK: 2792,
        OKHH: 587,
        OKKA: 679,
        OOHH: 110,
        OOII: -685,
    };
    this.TQ4__ = {
        BHHH: -721,
        BHHM: -3604,
        BHII: -966,
        BIIH: -607,
        BIII: -2181,
        OAAA: -2763,
        OAKK: 180,
        OHHH: -294,
        OHHI: 2446,
        OHHO: 480,
        OHIH: -1573,
        OIHH: 1935,
        OIHI: -493,
        OIIH: 626,
        OIII: -4007,
        OKAK: -8156,
    };
    this.TW1__ = { につい: -4681, 東京都: 2026 };
    this.TW2__ = {
        ある程: -2049,
        いった: -1256,
        ころが: -2434,
        しょう: 3873,
        その後: -4430,
        だって: -1049,
        ていた: 1833,
        として: -4657,
        ともに: -4517,
        もので: 1882,
        一気に: -792,
        初めて: -1512,
        同時に: -8097,
        大きな: -1255,
        対して: -2721,
        社会党: -3216,
    };
    this.TW3__ = {
        いただ: -1734,
        してい: 1314,
        として: -4314,
        につい: -5483,
        にとっ: -5989,
        に当た: -6247,
        "ので,": -727,
        "ので、": -727,
        のもの: -600,
        れから: -3752,
        十二月: -2287,
    };
    this.TW4__ = {
        "いう.": 8576,
        "いう。": 8576,
        からな: -2348,
        してい: 2958,
        "たが,": 1516,
        "たが、": 1516,
        ている: 1538,
        という: 1349,
        ました: 5543,
        ません: 1097,
        ようと: -4258,
        よると: 5865,
    };
    this.UC1__ = { A: 484, K: 93, M: 645, O: -505 };
    this.UC2__ = { A: 819, H: 1059, I: 409, M: 3987, N: 5775, O: 646 };
    this.UC3__ = { A: -1370, I: 2311 };
    this.UC4__ = {
        A: -2643,
        H: 1809,
        I: -1032,
        K: -3450,
        M: 3565,
        N: 3876,
        O: 6646,
    };
    this.UC5__ = { H: 313, I: -1238, K: -799, M: 539, O: -831 };
    this.UC6__ = { H: -506, I: -253, K: 87, M: 247, O: -387 };
    this.UP1__ = { O: -214 };
    this.UP2__ = { B: 69, O: 935 };
    this.UP3__ = { B: 189 };
    this.UQ1__ = {
        BH: 21,
        BI: -12,
        BK: -99,
        BN: 142,
        BO: -56,
        OH: -95,
        OI: 477,
        OK: 410,
        OO: -2422,
    };
    this.UQ2__ = { BH: 216, BI: 113, OK: 1759 };
    this.UQ3__ = {
        BA: -479,
        BH: 42,
        BI: 1913,
        BK: -7198,
        BM: 3160,
        BN: 6427,
        BO: 14761,
        OI: -827,
        ON: -3212,
    };
    this.UW1__ = {
        ",": 156,
        "、": 156,
        "「": -463,
        あ: -941,
        う: -127,
        が: -553,
        き: 121,
        こ: 505,
        で: -201,
        と: -547,
        ど: -123,
        に: -789,
        の: -185,
        は: -847,
        も: -466,
        や: -470,
        よ: 182,
        ら: -292,
        り: 208,
        れ: 169,
        を: -446,
        ん: -137,
        "・": -135,
        主: -402,
        京: -268,
        区: -912,
        午: 871,
        国: -460,
        大: 561,
        委: 729,
        市: -411,
        日: -141,
        理: 361,
        生: -408,
        県: -386,
        都: -718,
        "｢": -463,
        "･": -135,
    };
    this.UW2__ = {
        ",": -829,
        "、": -829,
        〇: 892,
        "「": -645,
        "」": 3145,
        あ: -538,
        い: 505,
        う: 134,
        お: -502,
        か: 1454,
        が: -856,
        く: -412,
        こ: 1141,
        さ: 878,
        ざ: 540,
        し: 1529,
        す: -675,
        せ: 300,
        そ: -1011,
        た: 188,
        だ: 1837,
        つ: -949,
        て: -291,
        で: -268,
        と: -981,
        ど: 1273,
        な: 1063,
        に: -1764,
        の: 130,
        は: -409,
        ひ: -1273,
        べ: 1261,
        ま: 600,
        も: -1263,
        や: -402,
        よ: 1639,
        り: -579,
        る: -694,
        れ: 571,
        を: -2516,
        ん: 2095,
        ア: -587,
        カ: 306,
        キ: 568,
        ッ: 831,
        三: -758,
        不: -2150,
        世: -302,
        中: -968,
        主: -861,
        事: 492,
        人: -123,
        会: 978,
        保: 362,
        入: 548,
        初: -3025,
        副: -1566,
        北: -3414,
        区: -422,
        大: -1769,
        天: -865,
        太: -483,
        子: -1519,
        学: 760,
        実: 1023,
        小: -2009,
        市: -813,
        年: -1060,
        強: 1067,
        手: -1519,
        揺: -1033,
        政: 1522,
        文: -1355,
        新: -1682,
        日: -1815,
        明: -1462,
        最: -630,
        朝: -1843,
        本: -1650,
        東: -931,
        果: -665,
        次: -2378,
        民: -180,
        気: -1740,
        理: 752,
        発: 529,
        目: -1584,
        相: -242,
        県: -1165,
        立: -763,
        第: 810,
        米: 509,
        自: -1353,
        行: 838,
        西: -744,
        見: -3874,
        調: 1010,
        議: 1198,
        込: 3041,
        開: 1758,
        間: -1257,
        "｢": -645,
        "｣": 3145,
        ｯ: 831,
        ｱ: -587,
        ｶ: 306,
        ｷ: 568,
    };
    this.UW3__ = {
        ",": 4889,
        1: -800,
        "−": -1723,
        "、": 4889,
        々: -2311,
        〇: 5827,
        "」": 2670,
        "〓": -3573,
        あ: -2696,
        い: 1006,
        う: 2342,
        え: 1983,
        お: -4864,
        か: -1163,
        が: 3271,
        く: 1004,
        け: 388,
        げ: 401,
        こ: -3552,
        ご: -3116,
        さ: -1058,
        し: -395,
        す: 584,
        せ: 3685,
        そ: -5228,
        た: 842,
        ち: -521,
        っ: -1444,
        つ: -1081,
        て: 6167,
        で: 2318,
        と: 1691,
        ど: -899,
        な: -2788,
        に: 2745,
        の: 4056,
        は: 4555,
        ひ: -2171,
        ふ: -1798,
        へ: 1199,
        ほ: -5516,
        ま: -4384,
        み: -120,
        め: 1205,
        も: 2323,
        や: -788,
        よ: -202,
        ら: 727,
        り: 649,
        る: 5905,
        れ: 2773,
        わ: -1207,
        を: 6620,
        ん: -518,
        ア: 551,
        グ: 1319,
        ス: 874,
        ッ: -1350,
        ト: 521,
        ム: 1109,
        ル: 1591,
        ロ: 2201,
        ン: 278,
        "・": -3794,
        一: -1619,
        下: -1759,
        世: -2087,
        両: 3815,
        中: 653,
        主: -758,
        予: -1193,
        二: 974,
        人: 2742,
        今: 792,
        他: 1889,
        以: -1368,
        低: 811,
        何: 4265,
        作: -361,
        保: -2439,
        元: 4858,
        党: 3593,
        全: 1574,
        公: -3030,
        六: 755,
        共: -1880,
        円: 5807,
        再: 3095,
        分: 457,
        初: 2475,
        別: 1129,
        前: 2286,
        副: 4437,
        力: 365,
        動: -949,
        務: -1872,
        化: 1327,
        北: -1038,
        区: 4646,
        千: -2309,
        午: -783,
        協: -1006,
        口: 483,
        右: 1233,
        各: 3588,
        合: -241,
        同: 3906,
        和: -837,
        員: 4513,
        国: 642,
        型: 1389,
        場: 1219,
        外: -241,
        妻: 2016,
        学: -1356,
        安: -423,
        実: -1008,
        家: 1078,
        小: -513,
        少: -3102,
        州: 1155,
        市: 3197,
        平: -1804,
        年: 2416,
        広: -1030,
        府: 1605,
        度: 1452,
        建: -2352,
        当: -3885,
        得: 1905,
        思: -1291,
        性: 1822,
        戸: -488,
        指: -3973,
        政: -2013,
        教: -1479,
        数: 3222,
        文: -1489,
        新: 1764,
        日: 2099,
        旧: 5792,
        昨: -661,
        時: -1248,
        曜: -951,
        最: -937,
        月: 4125,
        期: 360,
        李: 3094,
        村: 364,
        東: -805,
        核: 5156,
        森: 2438,
        業: 484,
        氏: 2613,
        民: -1694,
        決: -1073,
        法: 1868,
        海: -495,
        無: 979,
        物: 461,
        特: -3850,
        生: -273,
        用: 914,
        町: 1215,
        的: 7313,
        直: -1835,
        省: 792,
        県: 6293,
        知: -1528,
        私: 4231,
        税: 401,
        立: -960,
        第: 1201,
        米: 7767,
        系: 3066,
        約: 3663,
        級: 1384,
        統: -4229,
        総: 1163,
        線: 1255,
        者: 6457,
        能: 725,
        自: -2869,
        英: 785,
        見: 1044,
        調: -562,
        財: -733,
        費: 1777,
        車: 1835,
        軍: 1375,
        込: -1504,
        通: -1136,
        選: -681,
        郎: 1026,
        郡: 4404,
        部: 1200,
        金: 2163,
        長: 421,
        開: -1432,
        間: 1302,
        関: -1282,
        雨: 2009,
        電: -1045,
        非: 2066,
        駅: 1620,
        "１": -800,
        "｣": 2670,
        "･": -3794,
        ｯ: -1350,
        ｱ: 551,
        ｸﾞ: 1319,
        ｽ: 874,
        ﾄ: 521,
        ﾑ: 1109,
        ﾙ: 1591,
        ﾛ: 2201,
        ﾝ: 278,
    };
    this.UW4__ = {
        ",": 3930,
        ".": 3508,
        "―": -4841,
        "、": 3930,
        "。": 3508,
        〇: 4999,
        "「": 1895,
        "」": 3798,
        "〓": -5156,
        あ: 4752,
        い: -3435,
        う: -640,
        え: -2514,
        お: 2405,
        か: 530,
        が: 6006,
        き: -4482,
        ぎ: -3821,
        く: -3788,
        け: -4376,
        げ: -4734,
        こ: 2255,
        ご: 1979,
        さ: 2864,
        し: -843,
        じ: -2506,
        す: -731,
        ず: 1251,
        せ: 181,
        そ: 4091,
        た: 5034,
        だ: 5408,
        ち: -3654,
        っ: -5882,
        つ: -1659,
        て: 3994,
        で: 7410,
        と: 4547,
        な: 5433,
        に: 6499,
        ぬ: 1853,
        ね: 1413,
        の: 7396,
        は: 8578,
        ば: 1940,
        ひ: 4249,
        び: -4134,
        ふ: 1345,
        へ: 6665,
        べ: -744,
        ほ: 1464,
        ま: 1051,
        み: -2082,
        む: -882,
        め: -5046,
        も: 4169,
        ゃ: -2666,
        や: 2795,
        ょ: -1544,
        よ: 3351,
        ら: -2922,
        り: -9726,
        る: -14896,
        れ: -2613,
        ろ: -4570,
        わ: -1783,
        を: 13150,
        ん: -2352,
        カ: 2145,
        コ: 1789,
        セ: 1287,
        ッ: -724,
        ト: -403,
        メ: -1635,
        ラ: -881,
        リ: -541,
        ル: -856,
        ン: -3637,
        "・": -4371,
        ー: -11870,
        一: -2069,
        中: 2210,
        予: 782,
        事: -190,
        井: -1768,
        人: 1036,
        以: 544,
        会: 950,
        体: -1286,
        作: 530,
        側: 4292,
        先: 601,
        党: -2006,
        共: -1212,
        内: 584,
        円: 788,
        初: 1347,
        前: 1623,
        副: 3879,
        力: -302,
        動: -740,
        務: -2715,
        化: 776,
        区: 4517,
        協: 1013,
        参: 1555,
        合: -1834,
        和: -681,
        員: -910,
        器: -851,
        回: 1500,
        国: -619,
        園: -1200,
        地: 866,
        場: -1410,
        塁: -2094,
        士: -1413,
        多: 1067,
        大: 571,
        子: -4802,
        学: -1397,
        定: -1057,
        寺: -809,
        小: 1910,
        屋: -1328,
        山: -1500,
        島: -2056,
        川: -2667,
        市: 2771,
        年: 374,
        庁: -4556,
        後: 456,
        性: 553,
        感: 916,
        所: -1566,
        支: 856,
        改: 787,
        政: 2182,
        教: 704,
        文: 522,
        方: -856,
        日: 1798,
        時: 1829,
        最: 845,
        月: -9066,
        木: -485,
        来: -442,
        校: -360,
        業: -1043,
        氏: 5388,
        民: -2716,
        気: -910,
        沢: -939,
        済: -543,
        物: -735,
        率: 672,
        球: -1267,
        生: -1286,
        産: -1101,
        田: -2900,
        町: 1826,
        的: 2586,
        目: 922,
        省: -3485,
        県: 2997,
        空: -867,
        立: -2112,
        第: 788,
        米: 2937,
        系: 786,
        約: 2171,
        経: 1146,
        統: -1169,
        総: 940,
        線: -994,
        署: 749,
        者: 2145,
        能: -730,
        般: -852,
        行: -792,
        規: 792,
        警: -1184,
        議: -244,
        谷: -1000,
        賞: 730,
        車: -1481,
        軍: 1158,
        輪: -1433,
        込: -3370,
        近: 929,
        道: -1291,
        選: 2596,
        郎: -4866,
        都: 1192,
        野: -1100,
        銀: -2213,
        長: 357,
        間: -2344,
        院: -2297,
        際: -2604,
        電: -878,
        領: -1659,
        題: -792,
        館: -1984,
        首: 1749,
        高: 2120,
        "｢": 1895,
        "｣": 3798,
        "･": -4371,
        ｯ: -724,
        ｰ: -11870,
        ｶ: 2145,
        ｺ: 1789,
        ｾ: 1287,
        ﾄ: -403,
        ﾒ: -1635,
        ﾗ: -881,
        ﾘ: -541,
        ﾙ: -856,
        ﾝ: -3637,
    };
    this.UW5__ = {
        ",": 465,
        ".": -299,
        1: -514,
        E2: -32768,
        "]": -2762,
        "、": 465,
        "。": -299,
        "「": 363,
        あ: 1655,
        い: 331,
        う: -503,
        え: 1199,
        お: 527,
        か: 647,
        が: -421,
        き: 1624,
        ぎ: 1971,
        く: 312,
        げ: -983,
        さ: -1537,
        し: -1371,
        す: -852,
        だ: -1186,
        ち: 1093,
        っ: 52,
        つ: 921,
        て: -18,
        で: -850,
        と: -127,
        ど: 1682,
        な: -787,
        に: -1224,
        の: -635,
        は: -578,
        べ: 1001,
        み: 502,
        め: 865,
        ゃ: 3350,
        ょ: 854,
        り: -208,
        る: 429,
        れ: 504,
        わ: 419,
        を: -1264,
        ん: 327,
        イ: 241,
        ル: 451,
        ン: -343,
        中: -871,
        京: 722,
        会: -1153,
        党: -654,
        務: 3519,
        区: -901,
        告: 848,
        員: 2104,
        大: -1296,
        学: -548,
        定: 1785,
        嵐: -1304,
        市: -2991,
        席: 921,
        年: 1763,
        思: 872,
        所: -814,
        挙: 1618,
        新: -1682,
        日: 218,
        月: -4353,
        査: 932,
        格: 1356,
        機: -1508,
        氏: -1347,
        田: 240,
        町: -3912,
        的: -3149,
        相: 1319,
        省: -1052,
        県: -4003,
        研: -997,
        社: -278,
        空: -813,
        統: 1955,
        者: -2233,
        表: 663,
        語: -1073,
        議: 1219,
        選: -1018,
        郎: -368,
        長: 786,
        間: 1191,
        題: 2368,
        館: -689,
        "１": -514,
        Ｅ２: -32768,
        "｢": 363,
        ｲ: 241,
        ﾙ: 451,
        ﾝ: -343,
    };
    this.UW6__ = {
        ",": 227,
        ".": 808,
        1: -270,
        E1: 306,
        "、": 227,
        "。": 808,
        あ: -307,
        う: 189,
        か: 241,
        が: -73,
        く: -121,
        こ: -200,
        じ: 1782,
        す: 383,
        た: -428,
        っ: 573,
        て: -1014,
        で: 101,
        と: -105,
        な: -253,
        に: -149,
        の: -417,
        は: -236,
        も: -206,
        り: 187,
        る: -135,
        を: 195,
        ル: -673,
        ン: -496,
        一: -277,
        中: 201,
        件: -800,
        会: 624,
        前: 302,
        区: 1792,
        員: -1212,
        委: 798,
        学: -960,
        市: 887,
        広: -695,
        後: 535,
        業: -697,
        相: 753,
        社: -507,
        福: 974,
        空: -822,
        者: 1811,
        連: 463,
        郎: 1082,
        "１": -270,
        Ｅ１: 306,
        ﾙ: -673,
        ﾝ: -496,
    };
    return this;
}
TinySegmenter.prototype.ctype_ = function (str) {
    for (var i in this.chartype_) {
        if (str.match(this.chartype_[i][0])) {
            return this.chartype_[i][1];
        }
    }
    return "O";
};
TinySegmenter.prototype.ts_ = function (v) {
    if (v) {
        return v;
    }
    return 0;
};
TinySegmenter.prototype.segment = function (input) {
    if (input == null || input == undefined || input == "") {
        return [];
    }
    var result = [];
    var seg = ["B3", "B2", "B1"];
    var ctype = ["O", "O", "O"];
    var o = input.split("");
    for (i = 0; i < o.length; ++i) {
        seg.push(o[i]);
        ctype.push(this.ctype_(o[i]));
    }
    seg.push("E1");
    seg.push("E2");
    seg.push("E3");
    ctype.push("O");
    ctype.push("O");
    ctype.push("O");
    var word = seg[3];
    var p1 = "U";
    var p2 = "U";
    var p3 = "U";
    for (var i = 4; i < seg.length - 3; ++i) {
        var score = this.BIAS__;
        var w1 = seg[i - 3];
        var w2 = seg[i - 2];
        var w3 = seg[i - 1];
        var w4 = seg[i];
        var w5 = seg[i + 1];
        var w6 = seg[i + 2];
        var c1 = ctype[i - 3];
        var c2 = ctype[i - 2];
        var c3 = ctype[i - 1];
        var c4 = ctype[i];
        var c5 = ctype[i + 1];
        var c6 = ctype[i + 2];
        score += this.ts_(this.UP1__[p1]);
        score += this.ts_(this.UP2__[p2]);
        score += this.ts_(this.UP3__[p3]);
        score += this.ts_(this.BP1__[p1 + p2]);
        score += this.ts_(this.BP2__[p2 + p3]);
        score += this.ts_(this.UW1__[w1]);
        score += this.ts_(this.UW2__[w2]);
        score += this.ts_(this.UW3__[w3]);
        score += this.ts_(this.UW4__[w4]);
        score += this.ts_(this.UW5__[w5]);
        score += this.ts_(this.UW6__[w6]);
        score += this.ts_(this.BW1__[w2 + w3]);
        score += this.ts_(this.BW2__[w3 + w4]);
        score += this.ts_(this.BW3__[w4 + w5]);
        score += this.ts_(this.TW1__[w1 + w2 + w3]);
        score += this.ts_(this.TW2__[w2 + w3 + w4]);
        score += this.ts_(this.TW3__[w3 + w4 + w5]);
        score += this.ts_(this.TW4__[w4 + w5 + w6]);
        score += this.ts_(this.UC1__[c1]);
        score += this.ts_(this.UC2__[c2]);
        score += this.ts_(this.UC3__[c3]);
        score += this.ts_(this.UC4__[c4]);
        score += this.ts_(this.UC5__[c5]);
        score += this.ts_(this.UC6__[c6]);
        score += this.ts_(this.BC1__[c2 + c3]);
        score += this.ts_(this.BC2__[c3 + c4]);
        score += this.ts_(this.BC3__[c4 + c5]);
        score += this.ts_(this.TC1__[c1 + c2 + c3]);
        score += this.ts_(this.TC2__[c2 + c3 + c4]);
        score += this.ts_(this.TC3__[c3 + c4 + c5]);
        score += this.ts_(this.TC4__[c4 + c5 + c6]);
        //  score += this.ts_(this.TC5__[c4 + c5 + c6]);
        score += this.ts_(this.UQ1__[p1 + c1]);
        score += this.ts_(this.UQ2__[p2 + c2]);
        score += this.ts_(this.UQ3__[p3 + c3]);
        score += this.ts_(this.BQ1__[p2 + c2 + c3]);
        score += this.ts_(this.BQ2__[p2 + c3 + c4]);
        score += this.ts_(this.BQ3__[p3 + c2 + c3]);
        score += this.ts_(this.BQ4__[p3 + c3 + c4]);
        score += this.ts_(this.TQ1__[p2 + c1 + c2 + c3]);
        score += this.ts_(this.TQ2__[p2 + c2 + c3 + c4]);
        score += this.ts_(this.TQ3__[p3 + c1 + c2 + c3]);
        score += this.ts_(this.TQ4__[p3 + c2 + c3 + c4]);
        var p = "O";
        if (score > 0) {
            result.push(word);
            word = "";
            p = "B";
        }
        p1 = p2;
        p2 = p3;
        p3 = p;
        word += seg[i];
    }
    result.push(word);
    return result;
};

// @ts-ignore
const segmenter = new TinySegmenter();
function pickTokensAsJapanese(content, trimPattern) {
    return content
        .split(trimPattern)
        .filter((x) => x !== "")
        .flatMap((x) => segmenter.segment(x));
}
/**
 * Japanese needs original logic.
 */
class JapaneseTokenizer {
    tokenize(content, raw) {
        return pickTokensAsJapanese(content, raw ? / /g : this.getTrimPattern());
    }
    recursiveTokenize(content) {
        const tokens = segmenter
            .segment(content)
            // https://github.com/tadashi-aikawa/obsidian-various-complements-plugin/issues/77
            .flatMap((x) => x === " " ? x : x.split(" ").map((t) => (t === "" ? " " : t)));
        const ret = [];
        for (let i = 0; i < tokens.length; i++) {
            if (i === 0 ||
                tokens[i].length !== 1 ||
                !Boolean(tokens[i].match(this.getTrimPattern()))) {
                ret.push({
                    word: tokens.slice(i).join(""),
                    offset: tokens.slice(0, i).join("").length,
                });
            }
        }
        return ret;
    }
    getTrimPattern() {
        return TRIM_CHAR_PATTERN;
    }
    shouldIgnoreOnCurrent(str) {
        return Boolean(str.match(/^[ぁ-んａ-ｚＡ-Ｚ。、ー　]*$/));
    }
}

const ENGLISH_PATTERN = /[a-zA-Z0-9_\-\\]/;
class EnglishOnlyTokenizer extends DefaultTokenizer {
    tokenize(content, raw) {
        const tokenized = Array.from(this._tokenize(content)).filter((x) => x.word.match(ENGLISH_PATTERN));
        return raw
            ? tokenized.map((x) => x.word)
            : tokenized
                .map((x) => x.word)
                .filter((x) => !x.match(this.getTrimPattern()));
    }
    recursiveTokenize(content) {
        const offsets = Array.from(this._tokenize(content))
            .filter((x) => !x.word.match(this.getTrimPattern()))
            .map((x) => x.offset);
        return [
            ...offsets.map((i) => ({
                word: content.slice(i),
                offset: i,
            })),
        ];
    }
    *_tokenize(content) {
        let startIndex = 0;
        let previousType = "none";
        for (let i = 0; i < content.length; i++) {
            if (content[i].match(super.getTrimPattern())) {
                yield { word: content.slice(startIndex, i), offset: startIndex };
                previousType = "trim";
                startIndex = i;
                continue;
            }
            if (content[i].match(ENGLISH_PATTERN)) {
                if (previousType === "english" || previousType === "none") {
                    previousType = "english";
                    continue;
                }
                yield { word: content.slice(startIndex, i), offset: startIndex };
                previousType = "english";
                startIndex = i;
                continue;
            }
            if (previousType === "others" || previousType === "none") {
                previousType = "others";
                continue;
            }
            yield { word: content.slice(startIndex, i), offset: startIndex };
            previousType = "others";
            startIndex = i;
        }
        yield {
            word: content.slice(startIndex, content.length),
            offset: startIndex,
        };
    }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var main = {};

var prettifyPinyin = {};

// Quick guide for typing Chinese pinyin on Mac OS X

// Tone 1 (flat) mā – Option + a, then hit a vowel key
// Tone 2 (rising) má – Option + e, then hit a vowel key
// Tone 3 (falling-rising) mǎ – Option + v, then hit a vowel key
// Tone 4 (falling) mà – Option + `, then hit a vowel key

// ǚ – Option + V, then hit V (submitted by QA)
// ǜ – Option + `, then hit V (submitted by QA)


var replacements = {
  'a': ['ā', 'á', 'ǎ', 'à'],
  'e': ['ē', 'é', 'ě', 'è'],
  'u': ['ū', 'ú', 'ǔ', 'ù'],
  'i': ['ī', 'í', 'ǐ', 'ì'],
  'o': ['ō', 'ó', 'ǒ', 'ò'],
  'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ']
};

var medials = ['i', 'u', 'ü'];

var prettify$1 = function(str){
  str = str.replace('v', 'ü');
  var syllables = str.split(' ');

  for (var i = 0; i < syllables.length; i++){
    var syllable = syllables[i];
    var tone = parseInt(syllable[syllable.length-1]);
    
    if (tone <= 0 || tone > 5) {
      console.error('invalid tone number:', tone, 'in', syllable);
    } else if (tone === 5){
      syllables[i] = syllable.slice(0, syllable.length - 1);
    } else {
      for (var j = 0; j < syllable.length; j++){
        var currentLetter = syllable[j];
        var nextLetter = syllable[j + 1];

        // found a vowel
        if (replacements[currentLetter]){
          var replaced;
          var letterToReplace;

          // two consecutive vowels
          if (replacements[nextLetter] && medials.indexOf(currentLetter) >= 0){
            letterToReplace = nextLetter;
          } else {
            letterToReplace = currentLetter;
          }

          replaced = syllable.replace(letterToReplace, replacements[letterToReplace][tone - 1]);
          syllables[i] = replaced.slice(0, replaced.length - 1);
          break;
        }
      }  
    }

  }
  return syllables.join(' ');
};

prettifyPinyin.prettify = prettify$1;

class Trie$1 {
    constructor() {
        this.content = {};
    }

    getKeyObject(key, create = false) {
        key = key.toString();

        let chars = key === '' ? [key] : Array.from(key);
        let obj = this.content;

        for (let char of chars) {
            if (obj[char] == null) {
                if (create) obj[char] = {};
                else return {}
            }

            obj = obj[char];
        }

        return obj
    }

    get(key) {
        let obj = this.getKeyObject(key);

        return obj.values || []
    }

    getPrefix(key) {
        let inner = (key, obj = null) => {
            if (obj == null) obj = this.getKeyObject(key);
            let result = obj.values ? [...obj.values] : [];

            for (let char in obj) {
                if (char === 'values' || obj[char] == null) continue

                result.push(...inner(key + char, obj[char]));
            }

            return result
        };

        return inner(key)
    }

    push(key, value) {
        let obj = this.getKeyObject(key, true);

        if (obj.values == null) obj.values = [];
        if (!obj.values.includes(value)) obj.values.push(value);

        return this
    }
}

var trie = Trie$1;

const {prettify} = prettifyPinyin;
const Trie = trie;

function parseLine(line) {
    let match = line.match(/^(\S+)\s(\S+)\s\[([^\]]+)\]\s\/(.+)\//);
    if (match == null) return

    let [, traditional, simplified, pinyin, english] = match;

    pinyin = pinyin.replace(/u:/g, 'ü');
    let pinyinPretty = prettify(pinyin);

    return {traditional, simplified, pinyin, pinyinPretty, english}
}

class Cedict$1 {
    load(contents) {
        this.simplifiedTrie = new Trie();
        this.traditionalTrie = new Trie();

        let lines = contents.split('\n');

        for (let line of lines) {
            if (line.trim() === '' || line[0] === '#') continue

            let entry = parseLine(line);
            if (entry == null) continue

            this.simplifiedTrie.push(entry.simplified, entry);
            this.traditionalTrie.push(entry.traditional, entry);
        }
    }

    get(word, traditional = false) {
        return traditional ? this.traditionalTrie.get(word) : this.simplifiedTrie.get(word)
    }

    getPrefix(word, traditional = false) {
        return traditional ? this.traditionalTrie.getPrefix(word) : this.simplifiedTrie.getPrefix(word)
    }
}

var cedict = Cedict$1;

const Cedict = cedict;

const chinesePunctuation = [
  "·",
  "×",
  "—",
  "‘",
  "’",
  "“",
  "”",
  "…",
  "、",
  "。",
  "《",
  "》",
  "『",
  "』",
  "【",
  "】",
  "！",
  "（",
  "）",
  "，",
  "：",
  "；",
  "？",
];

main.load = function (contents) {
  let dictionary = new Cedict();
  dictionary.load(contents);

  return function tokenize(text) {
    text = Array.from(text.replace(/\r/g, ""));

    let result = [];
    let i = 0;
    let [offset, line, column] = [0, 1, 1];
    let [simplifiedPreference, traditionalPreference] = [0, 0];

    let pushToken = (word) => {
      let simplifiedEntries = dictionary.get(word, false);
      let traditionalEntries = dictionary.get(word, true);

      let entries =
        simplifiedEntries.length === 0
          ? traditionalEntries
          : traditionalEntries.length === 0
          ? simplifiedEntries
          : simplifiedPreference < traditionalPreference
          ? traditionalEntries
          : simplifiedPreference > traditionalPreference
          ? simplifiedEntries
          : traditionalEntries;

      if (traditionalEntries.length === 0 && simplifiedEntries.length > 0) {
        simplifiedPreference++;
      } else if (
        simplifiedEntries.length === 0 &&
        traditionalEntries.length > 0
      ) {
        traditionalPreference++;
      }

      result.push({
        text: word,
        traditional: entries[0] ? entries[0].traditional : word,
        simplified: entries[0] ? entries[0].simplified : word,

        position: {
          offset,
          line,
          column,
        },

        matches: entries.map(({ pinyin, pinyinPretty, english }) => ({
          pinyin,
          pinyinPretty,
          english,
        })),
      });

      let wordArr = Array.from(word);
      let lastLineBreakIndex = word.lastIndexOf("\n");

      i += wordArr.length;
      offset += word.length;
      line += wordArr.filter((x) => x === "\n").length;
      column =
        lastLineBreakIndex >= 0
          ? word.length - lastLineBreakIndex
          : column + word.length;
    };

    while (i < text.length) {
      // Try to match two or more characters

      if (i !== text.length - 1) {
        let getTwo = text.slice(i, i + 2).join("");
        let simplifiedEntries = dictionary.getPrefix(getTwo, false);
        let traditionalEntries = dictionary.getPrefix(getTwo, true);
        let foundWord = null;
        let foundEntries = null;

        for (let entries of [traditionalEntries, simplifiedEntries]) {
          for (let entry of entries) {
            let matchText =
              entries === traditionalEntries
                ? entry.traditional
                : entry.simplified;
            let word = text.slice(i, i + Array.from(matchText).length).join("");

            if (
              matchText === word &&
              (foundWord == null ||
                Array.from(word).length > Array.from(foundWord).length)
            ) {
              foundWord = word;
              foundEntries = entries;
            }
          }
        }

        if (foundWord != null) {
          pushToken(foundWord);

          if (foundEntries === simplifiedEntries) {
            simplifiedPreference++;
          } else if (foundEntries === traditionalEntries) {
            traditionalPreference++;
          }

          continue;
        }
      }

      // If it fails, match one character

      let character = text[i];
      let isChinese = (character) =>
        chinesePunctuation.includes(character) ||
        dictionary.get(character, false).length > 0 ||
        dictionary.get(character, true).length > 0;

      if (isChinese(character) || character.match(/\s/) != null) {
        pushToken(character);
        continue;
      }

      // Handle non-Chinese characters

      let end = i + 1;

      for (; end < text.length; end++) {
        if (text[end].match(/\s/) != null || isChinese(text[end])) break;
      }

      let word = text.slice(i, end).join("");
      pushToken(word);
    }

    return result;
  };
};

/**
 * Chinese needs original logic.
 */
class ChineseTokenizer {
    static create(dict) {
        const ins = new ChineseTokenizer();
        ins._tokenize = main.load(dict);
        return ins;
    }
    tokenize(content, raw) {
        return content
            .split(raw ? / /g : this.getTrimPattern())
            .filter((x) => x !== "")
            .flatMap((x) => this._tokenize(x))
            .map((x) => x.text);
    }
    recursiveTokenize(content) {
        const tokens = this._tokenize(content).map((x) => x.text);
        const ret = [];
        for (let i = 0; i < tokens.length; i++) {
            if (i === 0 ||
                tokens[i].length !== 1 ||
                !Boolean(tokens[i].match(this.getTrimPattern()))) {
                ret.push({
                    word: tokens.slice(i).join(""),
                    offset: tokens.slice(0, i).join("").length,
                });
            }
        }
        return ret;
    }
    getTrimPattern() {
        return TRIM_CHAR_PATTERN;
    }
    shouldIgnoreOnCurrent(str) {
        return false;
    }
}

function createTokenizer(strategy, app) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (strategy.name) {
            case "default":
                return new DefaultTokenizer();
            case "english-only":
                return new EnglishOnlyTokenizer();
            case "arabic":
                return new ArabicTokenizer();
            case "japanese":
                return new JapaneseTokenizer();
            case "chinese":
                const hasCedict = yield app.vault.adapter.exists("./cedict_ts.u8");
                if (!hasCedict) {
                    return Promise.reject(new Error("cedict_ts.U8 doesn't exist in your vault root."));
                }
                const dict = yield app.vault.adapter.read("./cedict_ts.u8");
                return ChineseTokenizer.create(dict);
        }
    });
}

class TokenizeStrategy {
    constructor(name, triggerThreshold, indexingThreshold) {
        this.name = name;
        this.triggerThreshold = triggerThreshold;
        this.indexingThreshold = indexingThreshold;
        TokenizeStrategy._values.push(this);
    }
    static fromName(name) {
        return TokenizeStrategy._values.find((x) => x.name === name);
    }
    static values() {
        return TokenizeStrategy._values;
    }
}
TokenizeStrategy._values = [];
TokenizeStrategy.DEFAULT = new TokenizeStrategy("default", 3, 5);
TokenizeStrategy.ENGLISH_ONLY = new TokenizeStrategy("english-only", 3, 5);
TokenizeStrategy.JAPANESE = new TokenizeStrategy("japanese", 2, 2);
TokenizeStrategy.ARABIC = new TokenizeStrategy("arabic", 3, 3);
TokenizeStrategy.CHINESE = new TokenizeStrategy("chinese", 1, 2);

class AppHelper {
    constructor(app) {
        this.unsafeApp = app;
    }
    equalsAsEditorPostion(one, other) {
        return one.line === other.line && one.ch === other.ch;
    }
    getAliases(file) {
        var _a, _b;
        return ((_b = obsidian.parseFrontMatterAliases((_a = this.unsafeApp.metadataCache.getFileCache(file)) === null || _a === void 0 ? void 0 : _a.frontmatter)) !== null && _b !== void 0 ? _b : []);
    }
    getFrontMatter(file) {
        var _a, _b, _c, _d;
        const frontMatter = (_a = this.unsafeApp.metadataCache.getFileCache(file)) === null || _a === void 0 ? void 0 : _a.frontmatter;
        if (!frontMatter) {
            return undefined;
        }
        // remove #
        const tags = (_c = (_b = obsidian.parseFrontMatterTags(frontMatter)) === null || _b === void 0 ? void 0 : _b.map((x) => x.slice(1))) !== null && _c !== void 0 ? _c : [];
        const aliases = (_d = obsidian.parseFrontMatterAliases(frontMatter)) !== null && _d !== void 0 ? _d : [];
        const rest = __rest(frontMatter, ["position"]);
        return Object.assign(Object.assign({}, Object.fromEntries(Object.entries(rest).map(([k, _v]) => [
            k,
            obsidian.parseFrontMatterStringArray(frontMatter, k),
        ]))), { tags, tag: tags, aliases, alias: aliases });
    }
    getMarkdownViewInActiveLeaf() {
        if (!this.unsafeApp.workspace.getActiveViewOfType(obsidian.MarkdownView)) {
            return null;
        }
        return this.unsafeApp.workspace.activeLeaf.view;
    }
    getActiveFile() {
        return this.unsafeApp.workspace.getActiveFile();
    }
    isActiveFile(file) {
        var _a;
        return ((_a = this.getActiveFile()) === null || _a === void 0 ? void 0 : _a.path) === file.path;
    }
    getPreviousFile() {
        var _a;
        const fName = (_a = this.unsafeApp.workspace.getLastOpenFiles()) === null || _a === void 0 ? void 0 : _a[1];
        if (!fName) {
            return null;
        }
        return this.getMarkdownFileByPath(fName);
    }
    getCurrentDirname() {
        var _a, _b;
        return (_b = (_a = this.getActiveFile()) === null || _a === void 0 ? void 0 : _a.parent.path) !== null && _b !== void 0 ? _b : null;
    }
    getCurrentEditor() {
        var _a, _b;
        return (_b = (_a = this.getMarkdownViewInActiveLeaf()) === null || _a === void 0 ? void 0 : _a.editor) !== null && _b !== void 0 ? _b : null;
    }
    getSelection() {
        var _a;
        return (_a = this.getCurrentEditor()) === null || _a === void 0 ? void 0 : _a.getSelection();
    }
    getCurrentOffset(editor) {
        return editor.posToOffset(editor.getCursor());
    }
    getCurrentLine(editor) {
        return editor.getLine(editor.getCursor().line);
    }
    getCurrentLineUntilCursor(editor) {
        return this.getCurrentLine(editor).slice(0, editor.getCursor().ch);
    }
    optimizeMarkdownLinkText(linkText) {
        const activeFile = this.getActiveFile();
        if (!activeFile) {
            return null;
        }
        const path = this.linkText2Path(linkText);
        if (!path) {
            return linkText;
        }
        const file = this.getMarkdownFileByPath(path);
        if (!file) {
            return null;
        }
        const markdownLink = this.unsafeApp.fileManager.generateMarkdownLink(file, activeFile.path);
        return markdownLink.startsWith("[[")
            ? markdownLink.replace("[[", "").replace("]]", "")
            : markdownLink.replace("[", "").replace(/\]\(.+\)/g, "");
    }
    linkText2Path(linkText) {
        var _a, _b;
        const activeFile = this.getActiveFile();
        if (!activeFile) {
            return null;
        }
        return ((_b = (_a = this.unsafeApp.metadataCache.getFirstLinkpathDest(linkText, activeFile.path)) === null || _a === void 0 ? void 0 : _a.path) !== null && _b !== void 0 ? _b : null);
    }
    searchPhantomLinks() {
        return Object.entries(this.unsafeApp.metadataCache.unresolvedLinks).flatMap(([path, obj]) => Object.keys(obj).map((link) => ({ path, link })));
    }
    getMarkdownFileByPath(path) {
        if (!path.endsWith(".md")) {
            return null;
        }
        const abstractFile = this.unsafeApp.vault.getAbstractFileByPath(path);
        if (!abstractFile) {
            return null;
        }
        return abstractFile;
    }
    openMarkdownFile(file, newLeaf, offset = 0) {
        var _a;
        const leaf = this.unsafeApp.workspace.getLeaf(newLeaf);
        leaf
            .openFile(file, (_a = this.unsafeApp.workspace.activeLeaf) === null || _a === void 0 ? void 0 : _a.getViewState())
            .then(() => {
            this.unsafeApp.workspace.setActiveLeaf(leaf, true, true);
            const viewOfType = this.unsafeApp.workspace.getActiveViewOfType(obsidian.MarkdownView);
            if (viewOfType) {
                const editor = viewOfType.editor;
                const pos = editor.offsetToPos(offset);
                editor.setCursor(pos);
                editor.scrollIntoView({ from: pos, to: pos }, true);
            }
        });
    }
    getCurrentFrontMatter() {
        const editor = this.getCurrentEditor();
        if (!editor) {
            return null;
        }
        if (!this.getActiveFile()) {
            return null;
        }
        if (editor.getLine(0) !== "---") {
            return null;
        }
        const endPosition = editor.getValue().indexOf("---", 3);
        const currentOffset = this.getCurrentOffset(editor);
        if (endPosition !== -1 && currentOffset >= endPosition) {
            return null;
        }
        const keyLocations = Array.from(editor.getValue().matchAll(/.+:/g));
        if (keyLocations.length === 0) {
            return null;
        }
        const currentKeyLocation = keyLocations
            .filter((x) => x.index < currentOffset)
            .last();
        if (!currentKeyLocation) {
            return null;
        }
        return currentKeyLocation[0].split(":")[0];
    }
    /**
     * Unsafe method
     */
    isIMEOn() {
        var _a, _b, _c;
        if (!this.unsafeApp.workspace.getActiveViewOfType(obsidian.MarkdownView)) {
            return false;
        }
        const markdownView = this.unsafeApp.workspace.activeLeaf
            .view;
        const cm5or6 = markdownView.editor.cm;
        // cm6
        if (((_a = cm5or6 === null || cm5or6 === void 0 ? void 0 : cm5or6.inputState) === null || _a === void 0 ? void 0 : _a.composing) > 0) {
            return true;
        }
        // cm5
        return !!((_c = (_b = cm5or6 === null || cm5or6 === void 0 ? void 0 : cm5or6.display) === null || _b === void 0 ? void 0 : _b.input) === null || _c === void 0 ? void 0 : _c.composing);
    }
    writeLog(log) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.unsafeApp.vault.adapter.append(obsidian.normalizePath("log.md"), log);
        });
    }
    get useWikiLinks() {
        return !this.unsafeApp.vault.config.useMarkdownLinks;
    }
}

const groupBy = (values, toKey) => values.reduce((prev, cur, _1, _2, k = toKey(cur)) => ((prev[k] || (prev[k] = [])).push(cur), prev), {});
function uniq(values) {
    return [...new Set(values)];
}
function uniqBy(values, fn) {
    const m = new Map();
    values.forEach((x) => {
        const k = fn(x);
        if (!m.has(k)) {
            m.set(k, x);
        }
    });
    return Array.from(m.values());
}
function uniqWith(arr, fn) {
    return arr.filter((element, index) => arr.findIndex((step) => fn(element, step)) === index);
}
function mirrorMap(collection, toValue) {
    return collection.reduce((p, c) => (Object.assign(Object.assign({}, p), { [toValue(c)]: toValue(c) })), {});
}
function max(collection, emptyValue) {
    const select = (a, b) => (a >= b ? a : b);
    return collection.reduce(select, emptyValue);
}

class WordTypeMeta {
    constructor(type, priority, group) {
        this.type = type;
        this.priority = priority;
        this.group = group;
        WordTypeMeta._values.push(this);
        WordTypeMeta._dict[type] = this;
    }
    static of(type) {
        return WordTypeMeta._dict[type];
    }
    static values() {
        return WordTypeMeta._values;
    }
}
WordTypeMeta._values = [];
WordTypeMeta._dict = {};
WordTypeMeta.FRONT_MATTER = new WordTypeMeta("frontMatter", 100, "frontMatter");
WordTypeMeta.INTERNAL_LINK = new WordTypeMeta("internalLink", 90, "internalLink");
WordTypeMeta.CUSTOM_DICTIONARY = new WordTypeMeta("customDictionary", 80, "suggestion");
WordTypeMeta.CURRENT_FILE = new WordTypeMeta("currentFile", 70, "suggestion");
WordTypeMeta.CURRENT_VAULT = new WordTypeMeta("currentVault", 60, "suggestion");

function suggestionUniqPredicate(a, b) {
    if (a.value !== b.value) {
        return false;
    }
    if (WordTypeMeta.of(a.type).group !== WordTypeMeta.of(b.type).group) {
        return false;
    }
    if (a.type === "internalLink" &&
        !a.phantom &&
        a.createdPath !== b.createdPath) {
        return false;
    }
    return true;
}
function pushWord(wordsByFirstLetter, key, word) {
    if (wordsByFirstLetter[key] === undefined) {
        wordsByFirstLetter[key] = [word];
        return;
    }
    wordsByFirstLetter[key].push(word);
}
// Public for tests
function judge(word, query, queryStartWithUpper) {
    var _a;
    if (query === "") {
        return {
            word: Object.assign(Object.assign({}, word), { hit: word.value }),
            value: word.value,
            alias: false,
        };
    }
    if (lowerStartsWith(word.value, query)) {
        if (queryStartWithUpper &&
            word.type !== "internalLink" &&
            word.type !== "frontMatter") {
            const c = capitalizeFirstLetter(word.value);
            return {
                word: Object.assign(Object.assign({}, word), { value: c, hit: c }),
                value: c,
                alias: false,
            };
        }
        else {
            return {
                word: Object.assign(Object.assign({}, word), { hit: word.value }),
                value: word.value,
                alias: false,
            };
        }
    }
    const matchedAlias = (_a = word.aliases) === null || _a === void 0 ? void 0 : _a.find((a) => lowerStartsWith(a, query));
    if (matchedAlias) {
        return {
            word: Object.assign(Object.assign({}, word), { hit: matchedAlias }),
            value: matchedAlias,
            alias: true,
        };
    }
    return {
        word,
        alias: false,
    };
}
function suggestWords(indexedWords, query, maxNum, option = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const { frontMatter, selectionHistoryStorage } = option;
    const queryStartWithUpper = capitalizeFirstLetter(query) === query;
    const flattenFrontMatterWords = () => {
        var _a, _b;
        if (frontMatter === "alias" || frontMatter === "aliases") {
            return [];
        }
        if (frontMatter && ((_a = indexedWords.frontMatter) === null || _a === void 0 ? void 0 : _a[frontMatter])) {
            return Object.values((_b = indexedWords.frontMatter) === null || _b === void 0 ? void 0 : _b[frontMatter]).flat();
        }
        return [];
    };
    const words = queryStartWithUpper
        ? frontMatter
            ? flattenFrontMatterWords()
            : [
                ...((_a = indexedWords.currentFile[query.charAt(0)]) !== null && _a !== void 0 ? _a : []),
                ...((_b = indexedWords.currentFile[query.charAt(0).toLowerCase()]) !== null && _b !== void 0 ? _b : []),
                ...((_c = indexedWords.currentVault[query.charAt(0)]) !== null && _c !== void 0 ? _c : []),
                ...((_d = indexedWords.currentVault[query.charAt(0).toLowerCase()]) !== null && _d !== void 0 ? _d : []),
                ...((_e = indexedWords.customDictionary[query.charAt(0)]) !== null && _e !== void 0 ? _e : []),
                ...((_f = indexedWords.customDictionary[query.charAt(0).toLowerCase()]) !== null && _f !== void 0 ? _f : []),
                ...((_g = indexedWords.internalLink[query.charAt(0)]) !== null && _g !== void 0 ? _g : []),
                ...((_h = indexedWords.internalLink[query.charAt(0).toLowerCase()]) !== null && _h !== void 0 ? _h : []),
            ]
        : frontMatter
            ? flattenFrontMatterWords()
            : [
                ...((_j = indexedWords.currentFile[query.charAt(0)]) !== null && _j !== void 0 ? _j : []),
                ...((_k = indexedWords.currentFile[query.charAt(0).toUpperCase()]) !== null && _k !== void 0 ? _k : []),
                ...((_l = indexedWords.currentVault[query.charAt(0)]) !== null && _l !== void 0 ? _l : []),
                ...((_m = indexedWords.currentVault[query.charAt(0).toUpperCase()]) !== null && _m !== void 0 ? _m : []),
                ...((_o = indexedWords.customDictionary[query.charAt(0)]) !== null && _o !== void 0 ? _o : []),
                ...((_p = indexedWords.customDictionary[query.charAt(0).toUpperCase()]) !== null && _p !== void 0 ? _p : []),
                ...((_q = indexedWords.internalLink[query.charAt(0)]) !== null && _q !== void 0 ? _q : []),
                ...((_r = indexedWords.internalLink[query.charAt(0).toUpperCase()]) !== null && _r !== void 0 ? _r : []),
            ];
    const filteredJudgement = Array.from(words)
        .map((x) => judge(x, query, queryStartWithUpper))
        .filter((x) => x.value !== undefined);
    const latestUpdated = max(filteredJudgement.map((x) => {
        var _a, _b;
        return (_b = (_a = selectionHistoryStorage === null || selectionHistoryStorage === void 0 ? void 0 : selectionHistoryStorage.getSelectionHistory(x.word)) === null || _a === void 0 ? void 0 : _a.lastUpdated) !== null && _b !== void 0 ? _b : 0;
    }), 0);
    const candidate = filteredJudgement
        .sort((a, b) => {
        const aWord = a.word;
        const bWord = b.word;
        const notSameWordType = aWord.type !== bWord.type;
        if (frontMatter && notSameWordType) {
            return bWord.type === "frontMatter" ? 1 : -1;
        }
        if (selectionHistoryStorage) {
            const ret = selectionHistoryStorage.compare(aWord, bWord, latestUpdated);
            if (ret !== 0) {
                return ret;
            }
        }
        if (a.value.length !== b.value.length) {
            return a.value.length > b.value.length ? 1 : -1;
        }
        if (notSameWordType) {
            return WordTypeMeta.of(bWord.type).priority >
                WordTypeMeta.of(aWord.type).priority
                ? 1
                : -1;
        }
        if (a.alias !== b.alias) {
            return a.alias ? 1 : -1;
        }
        return 0;
    })
        .map((x) => x.word)
        .slice(0, maxNum);
    // XXX: There is no guarantee that equals with max, but it is important for performance
    return uniqWith(candidate, suggestionUniqPredicate);
}
// TODO: refactoring
// Public for tests
function judgeByPartialMatch(word, query, queryStartWithUpper) {
    var _a, _b;
    if (query === "") {
        return {
            word: Object.assign(Object.assign({}, word), { hit: word.value }),
            value: word.value,
            alias: false,
        };
    }
    if (lowerStartsWith(word.value, query)) {
        if (queryStartWithUpper &&
            word.type !== "internalLink" &&
            word.type !== "frontMatter") {
            const c = capitalizeFirstLetter(word.value);
            return { word: Object.assign(Object.assign({}, word), { value: c, hit: c }), value: c, alias: false };
        }
        else {
            return {
                word: Object.assign(Object.assign({}, word), { hit: word.value }),
                value: word.value,
                alias: false,
            };
        }
    }
    const matchedAliasStarts = (_a = word.aliases) === null || _a === void 0 ? void 0 : _a.find((a) => lowerStartsWith(a, query));
    if (matchedAliasStarts) {
        return {
            word: Object.assign(Object.assign({}, word), { hit: matchedAliasStarts }),
            value: matchedAliasStarts,
            alias: true,
        };
    }
    if (lowerIncludes(word.value, query)) {
        return {
            word: Object.assign(Object.assign({}, word), { hit: word.value }),
            value: word.value,
            alias: false,
        };
    }
    const matchedAliasIncluded = (_b = word.aliases) === null || _b === void 0 ? void 0 : _b.find((a) => lowerIncludes(a, query));
    if (matchedAliasIncluded) {
        return {
            word: Object.assign(Object.assign({}, word), { hit: matchedAliasIncluded }),
            value: matchedAliasIncluded,
            alias: true,
        };
    }
    return { word: word, alias: false };
}
function suggestWordsByPartialMatch(indexedWords, query, maxNum, option = {}) {
    const { frontMatter, selectionHistoryStorage } = option;
    const queryStartWithUpper = capitalizeFirstLetter(query) === query;
    const flatObjectValues = (object) => Object.values(object).flat();
    const flattenFrontMatterWords = () => {
        var _a, _b;
        if (frontMatter === "alias" || frontMatter === "aliases") {
            return [];
        }
        if (frontMatter && ((_a = indexedWords.frontMatter) === null || _a === void 0 ? void 0 : _a[frontMatter])) {
            return Object.values((_b = indexedWords.frontMatter) === null || _b === void 0 ? void 0 : _b[frontMatter]).flat();
        }
        return [];
    };
    const words = frontMatter
        ? flattenFrontMatterWords()
        : [
            ...flatObjectValues(indexedWords.currentFile),
            ...flatObjectValues(indexedWords.currentVault),
            ...flatObjectValues(indexedWords.customDictionary),
            ...flatObjectValues(indexedWords.internalLink),
        ];
    const filteredJudgement = Array.from(words)
        .map((x) => judgeByPartialMatch(x, query, queryStartWithUpper))
        .filter((x) => x.value !== undefined);
    const latestUpdated = max(filteredJudgement.map((x) => {
        var _a, _b;
        return (_b = (_a = selectionHistoryStorage === null || selectionHistoryStorage === void 0 ? void 0 : selectionHistoryStorage.getSelectionHistory(x.word)) === null || _a === void 0 ? void 0 : _a.lastUpdated) !== null && _b !== void 0 ? _b : 0;
    }), 0);
    const candidate = filteredJudgement
        .sort((a, b) => {
        const aWord = a.word;
        const bWord = b.word;
        const notSameWordType = aWord.type !== bWord.type;
        if (frontMatter && notSameWordType) {
            return bWord.type === "frontMatter" ? 1 : -1;
        }
        if (selectionHistoryStorage) {
            const ret = selectionHistoryStorage.compare(aWord, bWord, latestUpdated);
            if (ret !== 0) {
                return ret;
            }
        }
        const as = lowerStartsWith(a.value, query);
        const bs = lowerStartsWith(b.value, query);
        if (as !== bs) {
            return bs ? 1 : -1;
        }
        if (a.value.length !== b.value.length) {
            return a.value.length > b.value.length ? 1 : -1;
        }
        if (notSameWordType) {
            return WordTypeMeta.of(bWord.type).priority >
                WordTypeMeta.of(aWord.type).priority
                ? 1
                : -1;
        }
        if (a.alias !== b.alias) {
            return a.alias ? 1 : -1;
        }
        return 0;
    })
        .map((x) => x.word)
        .slice(0, maxNum);
    // XXX: There is no guarantee that equals with max, but it is important for performance
    return uniqWith(candidate, suggestionUniqPredicate);
}

function basename(path, ext) {
    var _a, _b;
    const name = (_b = (_a = path.match(/.+[\\/]([^\\/]+)[\\/]?$/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : path;
    return ext && name.endsWith(ext) ? name.replace(ext, "") : name;
}
function dirname(path) {
    var _a, _b;
    return (_b = (_a = path.match(/(.+)[\\/].+$/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : ".";
}
function isURL(path) {
    return Boolean(path.match(new RegExp("^https?://")));
}

function escape(value) {
    // This tricky logics for Safari
    // https://github.com/tadashi-aikawa/obsidian-various-complements-plugin/issues/56
    return value
        .replace(/\\/g, "__VariousComplementsEscape__")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t")
        .replace(/__VariousComplementsEscape__/g, "\\\\");
}
function unescape(value) {
    // This tricky logics for Safari
    // https://github.com/tadashi-aikawa/obsidian-various-complements-plugin/issues/56
    return value
        .replace(/\\\\/g, "__VariousComplementsEscape__")
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/__VariousComplementsEscape__/g, "\\");
}
function jsonToWords(json, path, systemCaretSymbol) {
    return json.words.map((x) => {
        var _a;
        return ({
            value: x.displayed || x.value,
            description: x.description,
            aliases: x.aliases,
            type: "customDictionary",
            createdPath: path,
            insertedText: x.displayed ? x.value : undefined,
            caretSymbol: (_a = json.caretSymbol) !== null && _a !== void 0 ? _a : systemCaretSymbol,
            ignoreSpaceAfterCompletion: json.ignoreSpaceAfterCompletion,
        });
    });
}
function lineToWord(line, delimiter, path, delimiterForDisplay, delimiterForHide, systemCaretSymbol) {
    const [v, description, ...aliases] = line.split(delimiter.value);
    let value = unescape(v);
    let insertedText;
    let displayedText = value;
    if (delimiterForDisplay && value.includes(delimiterForDisplay)) {
        [displayedText, insertedText] = value.split(delimiterForDisplay);
    }
    if (delimiterForHide && value.includes(delimiterForHide)) {
        insertedText = value.replace(delimiterForHide, "");
        displayedText = `${value.split(delimiterForHide)[0]} ...`;
    }
    return {
        value: displayedText,
        description,
        aliases,
        type: "customDictionary",
        createdPath: path,
        insertedText,
        caretSymbol: systemCaretSymbol,
    };
}
function wordToLine(word, delimiter, dividerForDisplay) {
    const value = word.insertedText && dividerForDisplay
        ? `${word.value}${dividerForDisplay}${word.insertedText}`
        : word.value;
    const escapedValue = escape(value);
    if (!word.description && !word.aliases) {
        return escapedValue;
    }
    if (!word.aliases) {
        return [escapedValue, word.description].join(delimiter.value);
    }
    return [escapedValue, word.description, ...word.aliases].join(delimiter.value);
}
function synonymAliases$1(name) {
    const lessEmojiValue = excludeEmoji(name);
    return name === lessEmojiValue ? [] : [lessEmojiValue];
}
class CustomDictionaryWordProvider {
    constructor(app, appHelper) {
        this.words = [];
        this.wordByValue = {};
        this.wordsByFirstLetter = {};
        this.appHelper = appHelper;
        this.fileSystemAdapter = app.vault.adapter;
    }
    get editablePaths() {
        return this.paths.filter((x) => !isURL(x) && !x.endsWith(".json"));
    }
    loadWords(path, option) {
        return __awaiter(this, void 0, void 0, function* () {
            const contents = isURL(path)
                ? yield obsidian.request({ url: path })
                : yield this.fileSystemAdapter.read(path);
            const words = path.endsWith(".json")
                ? jsonToWords(JSON.parse(contents), path, option.caretSymbol)
                : contents
                    .split(/\r\n|\n/)
                    .map((x) => x.replace(/%%.*%%/g, ""))
                    .filter((x) => x)
                    .map((x) => lineToWord(x, this.delimiter, path, option.delimiterForDisplay, option.delimiterForHide, option.caretSymbol));
            return words.filter((x) => !option.regexp || x.value.match(new RegExp(option.regexp)));
        });
    }
    refreshCustomWords(option) {
        return __awaiter(this, void 0, void 0, function* () {
            this.clearWords();
            for (const path of this.paths) {
                try {
                    const words = yield this.loadWords(path, option);
                    words.forEach((x) => this.addWord(x));
                }
                catch (e) {
                    // noinspection ObjectAllocationIgnored
                    new obsidian.Notice(`⚠ Fail to load ${path} -- Various Complements Plugin -- \n ${e}`, 0);
                }
            }
        });
    }
    addWordWithDictionary(word, dictionaryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.addWord(word);
            yield this.fileSystemAdapter.append(dictionaryPath, "\n" + wordToLine(word, this.delimiter, this.dividerForDisplay));
        });
    }
    addWord(word) {
        var _a, _b;
        this.words.push(word);
        // Add aliases as a synonym
        const wordWithSynonym = Object.assign(Object.assign({}, word), { aliases: [...((_a = word.aliases) !== null && _a !== void 0 ? _a : []), ...synonymAliases$1(word.value)] });
        this.wordByValue[wordWithSynonym.value] = wordWithSynonym;
        pushWord(this.wordsByFirstLetter, wordWithSynonym.value.charAt(0), wordWithSynonym);
        (_b = wordWithSynonym.aliases) === null || _b === void 0 ? void 0 : _b.forEach((a) => pushWord(this.wordsByFirstLetter, a.charAt(0), wordWithSynonym));
    }
    clearWords() {
        this.words = [];
        this.wordByValue = {};
        this.wordsByFirstLetter = {};
    }
    get wordCount() {
        return this.words.length;
    }
    setSettings(paths, delimiter, dividerForDisplay) {
        this.paths = paths;
        this.delimiter = delimiter;
        this.dividerForDisplay = dividerForDisplay;
    }
}

class CurrentFileWordProvider {
    constructor(app, appHelper) {
        this.app = app;
        this.appHelper = appHelper;
        this.wordsByFirstLetter = {};
        this.words = [];
    }
    refreshWords(onlyEnglish, minNumberOfCharacters) {
        return __awaiter(this, void 0, void 0, function* () {
            this.clearWords();
            const editor = this.appHelper.getCurrentEditor();
            if (!editor) {
                return;
            }
            const file = this.app.workspace.getActiveFile();
            if (!file) {
                return;
            }
            const currentToken = this.tokenizer
                .tokenize(editor.getLine(editor.getCursor().line).slice(0, editor.getCursor().ch))
                .last();
            const content = yield this.app.vault.cachedRead(file);
            const tokens = this.tokenizer
                .tokenize(content)
                .filter((x) => {
                if (x.length < minNumberOfCharacters) {
                    return false;
                }
                if (this.tokenizer.shouldIgnoreOnCurrent(x)) {
                    return false;
                }
                return onlyEnglish ? allAlphabets(x) : true;
            })
                .map((x) => (startsSmallLetterOnlyFirst(x) ? x.toLowerCase() : x));
            this.words = uniq(tokens)
                .filter((x) => x !== currentToken)
                .map((x) => ({
                value: x,
                type: "currentFile",
                createdPath: file.path,
            }));
            this.wordsByFirstLetter = groupBy(this.words, (x) => x.value.charAt(0));
        });
    }
    clearWords() {
        this.words = [];
        this.wordsByFirstLetter = {};
    }
    get wordCount() {
        return this.words.length;
    }
    setSettings(tokenizer) {
        this.tokenizer = tokenizer;
    }
}

class InternalLinkWordProvider {
    constructor(app, appHelper) {
        this.app = app;
        this.appHelper = appHelper;
        this.words = [];
        this.wordsByFirstLetter = {};
    }
    refreshWords(wordAsInternalLinkAlias, excludePathPrefixPatterns) {
        var _a;
        this.clearWords();
        const synonymAliases = (name) => {
            const lessEmojiValue = excludeEmoji(name);
            return name === lessEmojiValue ? [] : [lessEmojiValue];
        };
        const resolvedInternalLinkWords = this.app.vault
            .getMarkdownFiles()
            .filter((f) => excludePathPrefixPatterns.every((x) => !f.path.startsWith(x)))
            .flatMap((x) => {
            const aliases = this.appHelper.getAliases(x);
            if (wordAsInternalLinkAlias) {
                return [
                    {
                        value: x.basename,
                        type: "internalLink",
                        createdPath: x.path,
                        aliases: synonymAliases(x.basename),
                        description: x.path,
                    },
                    ...aliases.map((a) => ({
                        value: a,
                        type: "internalLink",
                        createdPath: x.path,
                        aliases: synonymAliases(a),
                        description: x.path,
                        aliasMeta: {
                            origin: x.path,
                        },
                    })),
                ];
            }
            else {
                return [
                    {
                        value: x.basename,
                        type: "internalLink",
                        createdPath: x.path,
                        aliases: [
                            ...synonymAliases(x.basename),
                            ...aliases,
                            ...aliases.flatMap(synonymAliases),
                        ],
                        description: x.path,
                    },
                ];
            }
        });
        const unresolvedInternalLinkWords = this.appHelper
            .searchPhantomLinks()
            .map(({ path, link }) => {
            return {
                value: link,
                type: "internalLink",
                createdPath: path,
                aliases: synonymAliases(link),
                description: `Appeared in -> ${path}`,
                phantom: true,
            };
        });
        this.words = [...resolvedInternalLinkWords, ...unresolvedInternalLinkWords];
        for (const word of this.words) {
            pushWord(this.wordsByFirstLetter, word.value.charAt(0), word);
            (_a = word.aliases) === null || _a === void 0 ? void 0 : _a.forEach((a) => pushWord(this.wordsByFirstLetter, a.charAt(0), word));
        }
    }
    clearWords() {
        this.words = [];
        this.wordsByFirstLetter = {};
    }
    get wordCount() {
        return this.words.length;
    }
}

class MatchStrategy {
    constructor(name, handler) {
        this.name = name;
        this.handler = handler;
        MatchStrategy._values.push(this);
    }
    static fromName(name) {
        return MatchStrategy._values.find((x) => x.name === name);
    }
    static values() {
        return MatchStrategy._values;
    }
}
MatchStrategy._values = [];
MatchStrategy.PREFIX = new MatchStrategy("prefix", suggestWords);
MatchStrategy.PARTIAL = new MatchStrategy("partial", suggestWordsByPartialMatch);

class CycleThroughSuggestionsKeys {
    constructor(name, nextKey, previousKey) {
        this.name = name;
        this.nextKey = nextKey;
        this.previousKey = previousKey;
        CycleThroughSuggestionsKeys._values.push(this);
    }
    static fromName(name) {
        return CycleThroughSuggestionsKeys._values.find((x) => x.name === name);
    }
    static values() {
        return CycleThroughSuggestionsKeys._values;
    }
}
CycleThroughSuggestionsKeys._values = [];
CycleThroughSuggestionsKeys.NONE = new CycleThroughSuggestionsKeys("None", { modifiers: [], key: null }, { modifiers: [], key: null });
CycleThroughSuggestionsKeys.TAB = new CycleThroughSuggestionsKeys("Tab, Shift+Tab", { modifiers: [], key: "Tab" }, { modifiers: ["Shift"], key: "Tab" });
CycleThroughSuggestionsKeys.EMACS = new CycleThroughSuggestionsKeys("Ctrl/Cmd+N, Ctrl/Cmd+P", { modifiers: ["Mod"], key: "N" }, { modifiers: ["Mod"], key: "P" });
CycleThroughSuggestionsKeys.VIM = new CycleThroughSuggestionsKeys("Ctrl/Cmd+J, Ctrl/Cmd+K", { modifiers: ["Mod"], key: "J" }, { modifiers: ["Mod"], key: "K" });

class ColumnDelimiter {
    constructor(name, value) {
        this.name = name;
        this.value = value;
        ColumnDelimiter._values.push(this);
    }
    static fromName(name) {
        return ColumnDelimiter._values.find((x) => x.name === name);
    }
    static values() {
        return ColumnDelimiter._values;
    }
}
ColumnDelimiter._values = [];
ColumnDelimiter.TAB = new ColumnDelimiter("Tab", "\t");
ColumnDelimiter.COMMA = new ColumnDelimiter("Comma", ",");
ColumnDelimiter.PIPE = new ColumnDelimiter("Pipe", "|");

class SelectSuggestionKey {
    constructor(name, keyBind) {
        this.name = name;
        this.keyBind = keyBind;
        SelectSuggestionKey._values.push(this);
    }
    static fromName(name) {
        return SelectSuggestionKey._values.find((x) => x.name === name);
    }
    static values() {
        return SelectSuggestionKey._values;
    }
}
SelectSuggestionKey._values = [];
SelectSuggestionKey.ENTER = new SelectSuggestionKey("Enter", {
    modifiers: [],
    key: "Enter",
});
SelectSuggestionKey.TAB = new SelectSuggestionKey("Tab", {
    modifiers: [],
    key: "Tab",
});
SelectSuggestionKey.MOD_ENTER = new SelectSuggestionKey("Ctrl/Cmd+Enter", {
    modifiers: ["Mod"],
    key: "Enter",
});
SelectSuggestionKey.ALT_ENTER = new SelectSuggestionKey("Alt+Enter", {
    modifiers: ["Alt"],
    key: "Enter",
});
SelectSuggestionKey.SHIFT_ENTER = new SelectSuggestionKey("Shift+Enter", {
    modifiers: ["Shift"],
    key: "Enter",
});
SelectSuggestionKey.SPACE = new SelectSuggestionKey("Space", {
    modifiers: [],
    key: " ",
});
SelectSuggestionKey.SHIFT_SPACE = new SelectSuggestionKey("Shift+Space", {
    modifiers: ["Shift"],
    key: " ",
});
SelectSuggestionKey.BACKQUOTE = new SelectSuggestionKey("Backquote", {
    modifiers: [],
    key: "`",
});
SelectSuggestionKey.None = new SelectSuggestionKey("None", {
    modifiers: [],
    key: "",
});

class CurrentVaultWordProvider {
    constructor(app, appHelper) {
        this.app = app;
        this.appHelper = appHelper;
        this.wordsByFirstLetter = {};
        this.words = [];
    }
    refreshWords(minNumberOfCharacters) {
        return __awaiter(this, void 0, void 0, function* () {
            this.clearWords();
            const currentDirname = this.appHelper.getCurrentDirname();
            const markdownFilePaths = this.app.vault
                .getMarkdownFiles()
                .map((x) => x.path)
                .filter((p) => this.includePrefixPatterns.every((x) => p.startsWith(x)))
                .filter((p) => this.excludePrefixPatterns.every((x) => !p.startsWith(x)))
                .filter((p) => !this.onlyUnderCurrentDirectory || dirname(p) === currentDirname);
            let wordByValue = {};
            for (const path of markdownFilePaths) {
                const content = yield this.app.vault.adapter.read(path);
                const tokens = this.tokenizer
                    .tokenize(content)
                    .filter((x) => x.length >= minNumberOfCharacters &&
                    !this.tokenizer.shouldIgnoreOnCurrent(x))
                    .map((x) => (startsSmallLetterOnlyFirst(x) ? x.toLowerCase() : x));
                for (const token of tokens) {
                    wordByValue[token] = {
                        value: token,
                        type: "currentVault",
                        createdPath: path,
                        description: path,
                    };
                }
            }
            this.words = Object.values(wordByValue);
            this.wordsByFirstLetter = groupBy(this.words, (x) => x.value.charAt(0));
        });
    }
    clearWords() {
        this.words = [];
        this.wordsByFirstLetter = {};
    }
    get wordCount() {
        return this.words.length;
    }
    setSettings(tokenizer, includePrefixPatterns, excludePrefixPatterns, onlyUnderCurrentDirectory) {
        this.tokenizer = tokenizer;
        this.includePrefixPatterns = includePrefixPatterns;
        this.excludePrefixPatterns = excludePrefixPatterns;
        this.onlyUnderCurrentDirectory = onlyUnderCurrentDirectory;
    }
}

class OpenSourceFileKeys {
    constructor(name, keyBind) {
        this.name = name;
        this.keyBind = keyBind;
        OpenSourceFileKeys._values.push(this);
    }
    static fromName(name) {
        return OpenSourceFileKeys._values.find((x) => x.name === name);
    }
    static values() {
        return OpenSourceFileKeys._values;
    }
}
OpenSourceFileKeys._values = [];
OpenSourceFileKeys.NONE = new OpenSourceFileKeys("None", {
    modifiers: [],
    key: null,
});
OpenSourceFileKeys.MOD_ENTER = new OpenSourceFileKeys("Ctrl/Cmd+Enter", {
    modifiers: ["Mod"],
    key: "Enter",
});
OpenSourceFileKeys.ALT_ENTER = new OpenSourceFileKeys("Alt+Enter", {
    modifiers: ["Alt"],
    key: "Enter",
});
OpenSourceFileKeys.SHIFT_ENTER = new OpenSourceFileKeys("Shift+Enter", {
    modifiers: ["Shift"],
    key: "Enter",
});

class DescriptionOnSuggestion {
    constructor(name, toDisplay) {
        this.name = name;
        this.toDisplay = toDisplay;
        DescriptionOnSuggestion._values.push(this);
    }
    static fromName(name) {
        return DescriptionOnSuggestion._values.find((x) => x.name === name);
    }
    static values() {
        return DescriptionOnSuggestion._values;
    }
}
DescriptionOnSuggestion._values = [];
DescriptionOnSuggestion.NONE = new DescriptionOnSuggestion("None", () => null);
DescriptionOnSuggestion.SHORT = new DescriptionOnSuggestion("Short", (word) => {
    if (!word.description) {
        return null;
    }
    return word.type === "customDictionary"
        ? word.description
        : basename(word.description);
});
DescriptionOnSuggestion.FULL = new DescriptionOnSuggestion("Full", (word) => { var _a; return (_a = word.description) !== null && _a !== void 0 ? _a : null; });

function synonymAliases(name) {
    const lessEmojiValue = excludeEmoji(name);
    return name === lessEmojiValue ? [] : [lessEmojiValue];
}
function frontMatterToWords(file, key, values) {
    return values.map((x) => ({
        key,
        value: x,
        type: "frontMatter",
        createdPath: file.path,
        aliases: synonymAliases(x),
    }));
}
function pickWords(file, fm) {
    return Object.entries(fm)
        .filter(([_key, value]) => value != null &&
        (typeof value === "string" || typeof value[0] === "string"))
        .flatMap(([key, value]) => frontMatterToWords(file, key, value));
}
// noinspection FunctionWithMultipleLoopsJS
function extractAndUniqWords(wordsByCreatedPath) {
    return uniqBy(Object.values(wordsByCreatedPath).flat(), (w) => w.key + w.value.toLowerCase());
}
function indexingWords(words) {
    const wordsByKey = groupBy(words, (x) => x.key);
    return Object.fromEntries(Object.entries(wordsByKey).map(([key, words]) => [
        key,
        groupBy(words, (w) => w.value.charAt(0)),
    ]));
}
class FrontMatterWordProvider {
    constructor(app, appHelper) {
        this.app = app;
        this.appHelper = appHelper;
        this.wordsByCreatedPath = {};
    }
    refreshWords() {
        this.clearWords();
        this.app.vault.getMarkdownFiles().forEach((f) => {
            const fm = this.appHelper.getFrontMatter(f);
            if (!fm) {
                return;
            }
            this.wordsByCreatedPath[f.path] = pickWords(f, fm);
        });
        this.words = extractAndUniqWords(this.wordsByCreatedPath);
        this.wordsByFirstLetterByKey = indexingWords(this.words);
    }
    updateWordIndex(file) {
        const fm = this.appHelper.getFrontMatter(file);
        if (!fm) {
            return;
        }
        this.wordsByCreatedPath[file.path] = pickWords(file, fm);
    }
    updateWords() {
        this.words = extractAndUniqWords(this.wordsByCreatedPath);
        this.wordsByFirstLetterByKey = indexingWords(this.words);
    }
    clearWords() {
        this.wordsByCreatedPath = {};
        this.words = [];
        this.wordsByFirstLetterByKey = {};
    }
    get wordCount() {
        return this.words.length;
    }
}

const neverUsedHandler = (..._args) => [];
class SpecificMatchStrategy {
    constructor(name, handler) {
        this.name = name;
        this.handler = handler;
        SpecificMatchStrategy._values.push(this);
    }
    static fromName(name) {
        return SpecificMatchStrategy._values.find((x) => x.name === name);
    }
    static values() {
        return SpecificMatchStrategy._values;
    }
}
SpecificMatchStrategy._values = [];
SpecificMatchStrategy.INHERIT = new SpecificMatchStrategy("inherit", neverUsedHandler);
SpecificMatchStrategy.PREFIX = new SpecificMatchStrategy("prefix", suggestWords);
SpecificMatchStrategy.PARTIAL = new SpecificMatchStrategy("partial", suggestWordsByPartialMatch);

const SEC = 1000;
const MIN = SEC * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
function calcScore(history, latestUpdated) {
    if (!history) {
        return 0;
    }
    if (history.lastUpdated === latestUpdated) {
        return Number.MAX_SAFE_INTEGER;
    }
    const behind = Date.now() - history.lastUpdated;
    // noinspection IfStatementWithTooManyBranchesJS
    if (behind < MIN) {
        return 8 * history.count;
    }
    else if (behind < HOUR) {
        return 4 * history.count;
    }
    else if (behind < DAY) {
        return 2 * history.count;
    }
    else if (behind < WEEK) {
        return 0.5 * history.count;
    }
    else {
        return 0.25 * history.count;
    }
}
class SelectionHistoryStorage {
    constructor(data = {}, maxDaysToKeepHistory, maxNumberOfHistoryToKeep) {
        this.data = data;
        const now = Date.now();
        this.version = now;
        this.persistedVersion = now;
        this.maxDaysToKeepHistory = maxDaysToKeepHistory;
        this.maxNumberOfHistoryToKeep = maxNumberOfHistoryToKeep;
    }
    // noinspection FunctionWithMultipleLoopsJS
    purge() {
        var _a;
        const now = Date.now();
        const times = [];
        for (const hit of Object.keys(this.data)) {
            for (const value of Object.keys(this.data[hit])) {
                for (const kind of Object.keys(this.data[hit][value])) {
                    if (this.maxDaysToKeepHistory &&
                        now - this.data[hit][value][kind].lastUpdated >
                            this.maxDaysToKeepHistory * DAY) {
                        delete this.data[hit][value][kind];
                    }
                    else {
                        times.push(this.data[hit][value][kind].lastUpdated);
                    }
                }
                if (Object.isEmpty(this.data[hit][value])) {
                    delete this.data[hit][value];
                }
            }
            if (Object.isEmpty(this.data[hit])) {
                delete this.data[hit];
            }
        }
        if (this.maxNumberOfHistoryToKeep) {
            const threshold = (_a = times
                .sort((a, b) => (a > b ? -1 : 1))
                .slice(0, this.maxNumberOfHistoryToKeep)
                .at(-1)) !== null && _a !== void 0 ? _a : 0;
            for (const hit of Object.keys(this.data)) {
                for (const value of Object.keys(this.data[hit])) {
                    for (const kind of Object.keys(this.data[hit][value])) {
                        if (this.data[hit][value][kind].lastUpdated < threshold) {
                            delete this.data[hit][value][kind];
                        }
                    }
                    if (Object.isEmpty(this.data[hit][value])) {
                        delete this.data[hit][value];
                    }
                }
                if (Object.isEmpty(this.data[hit])) {
                    delete this.data[hit];
                }
            }
        }
    }
    getSelectionHistory(word) {
        var _a, _b;
        return (_b = (_a = this.data[word.hit]) === null || _a === void 0 ? void 0 : _a[word.value]) === null || _b === void 0 ? void 0 : _b[word.type];
    }
    increment(word) {
        if (!this.data[word.hit]) {
            this.data[word.hit] = {};
        }
        if (!this.data[word.hit][word.value]) {
            this.data[word.hit][word.value] = {};
        }
        if (this.data[word.hit][word.value][word.type]) {
            this.data[word.hit][word.value][word.type] = {
                count: this.data[word.hit][word.value][word.type].count + 1,
                lastUpdated: Date.now(),
            };
        }
        else {
            this.data[word.hit][word.value][word.type] = {
                count: 1,
                lastUpdated: Date.now(),
            };
        }
        this.version = Date.now();
    }
    compare(w1, w2, latestUpdated) {
        const score1 = calcScore(this.getSelectionHistory(w1), latestUpdated);
        const score2 = calcScore(this.getSelectionHistory(w2), latestUpdated);
        if (score1 === score2) {
            return 0;
        }
        return score1 > score2 ? -1 : 1;
    }
    get shouldPersist() {
        return this.version > this.persistedVersion;
    }
    syncPersistVersion() {
        this.persistedVersion = this.version;
    }
}

function buildLogMessage(message, msec) {
    return `${message}: ${Math.round(msec)}[ms]`;
}
class AutoCompleteSuggest extends obsidian.EditorSuggest {
    constructor(app, statusBar) {
        super(app);
        this.previousCurrentLine = "";
        this.keymapEventHandler = [];
        this.appHelper = new AppHelper(app);
        this.statusBar = statusBar;
    }
    triggerComplete() {
        const editor = this.appHelper.getCurrentEditor();
        const activeFile = this.app.workspace.getActiveFile();
        if (!editor || !activeFile) {
            return;
        }
        // XXX: Unsafe
        this.runManually = true;
        this.trigger(editor, activeFile, true);
    }
    static new(app, settings, statusBar, onPersistSelectionHistory) {
        return __awaiter(this, void 0, void 0, function* () {
            const ins = new AutoCompleteSuggest(app, statusBar);
            ins.currentFileWordProvider = new CurrentFileWordProvider(ins.app, ins.appHelper);
            ins.currentVaultWordProvider = new CurrentVaultWordProvider(ins.app, ins.appHelper);
            ins.customDictionaryWordProvider = new CustomDictionaryWordProvider(ins.app, ins.appHelper);
            ins.internalLinkWordProvider = new InternalLinkWordProvider(ins.app, ins.appHelper);
            ins.frontMatterWordProvider = new FrontMatterWordProvider(ins.app, ins.appHelper);
            ins.selectionHistoryStorage = new SelectionHistoryStorage(settings.selectionHistoryTree, settings.intelligentSuggestionPrioritization.maxDaysToKeepHistory, settings.intelligentSuggestionPrioritization.maxNumberOfHistoryToKeep);
            ins.selectionHistoryStorage.purge();
            yield ins.updateSettings(settings);
            ins.modifyEventRef = app.vault.on("modify", (_) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                yield ins.refreshCurrentFileTokens();
                if ((_a = ins.selectionHistoryStorage) === null || _a === void 0 ? void 0 : _a.shouldPersist) {
                    ins.settings.selectionHistoryTree = ins.selectionHistoryStorage.data;
                    ins.selectionHistoryStorage.syncPersistVersion();
                    onPersistSelectionHistory();
                }
            }));
            ins.activeLeafChangeRef = app.workspace.on("active-leaf-change", (_) => __awaiter(this, void 0, void 0, function* () {
                yield ins.refreshCurrentFileTokens();
                ins.refreshInternalLinkTokens();
                ins.updateFrontMatterToken();
            }));
            ins.metadataCacheChangeRef = app.metadataCache.on("changed", (f) => {
                ins.updateFrontMatterTokenIndex(f);
                if (!ins.appHelper.isActiveFile(f)) {
                    ins.updateFrontMatterToken();
                }
            });
            // Avoid referring to incorrect cache
            const cacheResolvedRef = app.metadataCache.on("resolved", () => __awaiter(this, void 0, void 0, function* () {
                ins.refreshInternalLinkTokens();
                ins.refreshFrontMatterTokens();
                // noinspection ES6MissingAwait
                ins.refreshCustomDictionaryTokens();
                // noinspection ES6MissingAwait
                ins.refreshCurrentVaultTokens();
                ins.app.metadataCache.offref(cacheResolvedRef);
            }));
            return ins;
        });
    }
    predictableComplete() {
        const editor = this.appHelper.getCurrentEditor();
        if (!editor) {
            return;
        }
        const cursor = editor.getCursor();
        const currentToken = this.tokenizer
            .tokenize(editor.getLine(cursor.line).slice(0, cursor.ch))
            .last();
        if (!currentToken) {
            return;
        }
        let suggestion = this.tokenizer
            .tokenize(editor.getRange({ line: Math.max(cursor.line - 50, 0), ch: 0 }, cursor))
            .reverse()
            .slice(1)
            .find((x) => x.startsWith(currentToken));
        if (!suggestion) {
            suggestion = this.tokenizer
                .tokenize(editor.getRange(cursor, {
                line: Math.min(cursor.line + 50, editor.lineCount() - 1),
                ch: 0,
            }))
                .find((x) => x.startsWith(currentToken));
        }
        if (!suggestion) {
            return;
        }
        editor.replaceRange(suggestion, { line: cursor.line, ch: cursor.ch - currentToken.length }, { line: cursor.line, ch: cursor.ch });
        this.close();
        this.debounceClose();
    }
    unregister() {
        this.app.vault.offref(this.modifyEventRef);
        this.app.workspace.offref(this.activeLeafChangeRef);
        this.app.metadataCache.offref(this.metadataCacheChangeRef);
    }
    // settings getters
    get tokenizerStrategy() {
        return TokenizeStrategy.fromName(this.settings.strategy);
    }
    get matchStrategy() {
        return MatchStrategy.fromName(this.settings.matchStrategy);
    }
    get frontMatterComplementStrategy() {
        return SpecificMatchStrategy.fromName(this.settings.frontMatterComplementMatchStrategy);
    }
    get minNumberTriggered() {
        return (this.settings.minNumberOfCharactersTriggered ||
            this.tokenizerStrategy.triggerThreshold);
    }
    get currentFileMinNumberOfCharacters() {
        return (this.settings.currentFileMinNumberOfCharacters ||
            this.tokenizerStrategy.indexingThreshold);
    }
    get currentVaultMinNumberOfCharacters() {
        return (this.settings.currentVaultMinNumberOfCharacters ||
            this.tokenizerStrategy.indexingThreshold);
    }
    get descriptionOnSuggestion() {
        return DescriptionOnSuggestion.fromName(this.settings.descriptionOnSuggestion);
    }
    get excludeInternalLinkPrefixPathPatterns() {
        return this.settings.excludeInternalLinkPathPrefixPatterns
            .split("\n")
            .filter((x) => x);
    }
    // --- end ---
    get indexedWords() {
        return {
            currentFile: this.currentFileWordProvider.wordsByFirstLetter,
            currentVault: this.currentVaultWordProvider.wordsByFirstLetter,
            customDictionary: this.customDictionaryWordProvider.wordsByFirstLetter,
            internalLink: this.internalLinkWordProvider.wordsByFirstLetter,
            frontMatter: this.frontMatterWordProvider.wordsByFirstLetterByKey,
        };
    }
    updateSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = settings;
            this.statusBar.setMatchStrategy(this.matchStrategy);
            this.statusBar.setComplementAutomatically(this.settings.complementAutomatically);
            try {
                this.tokenizer = yield createTokenizer(this.tokenizerStrategy, this.app);
            }
            catch (e) {
                new obsidian.Notice(e.message, 0);
            }
            this.currentFileWordProvider.setSettings(this.tokenizer);
            this.currentVaultWordProvider.setSettings(this.tokenizer, settings.includeCurrentVaultPathPrefixPatterns
                .split("\n")
                .filter((x) => x), settings.excludeCurrentVaultPathPrefixPatterns
                .split("\n")
                .filter((x) => x), settings.includeCurrentVaultOnlyFilesUnderCurrentDirectory);
            this.customDictionaryWordProvider.setSettings(settings.customDictionaryPaths.split("\n").filter((x) => x), ColumnDelimiter.fromName(settings.columnDelimiter), settings.delimiterToDivideSuggestionsForDisplayFromInsertion || null);
            this.debounceGetSuggestions = obsidian.debounce((context, cb) => {
                const start = performance.now();
                this.showDebugLog(() => `[context.query]: ${context.query}`);
                const parsedQuery = JSON.parse(context.query);
                const words = parsedQuery.queries
                    .filter((x, i, xs) => parsedQuery.currentFrontMatter ||
                    (this.settings.minNumberOfWordsTriggeredPhrase + i - 1 <
                        xs.length &&
                        x.word.length >= this.minNumberTriggered &&
                        !x.word.endsWith(" ")))
                    .map((q) => {
                    const handler = parsedQuery.currentFrontMatter &&
                        this.frontMatterComplementStrategy !==
                            SpecificMatchStrategy.INHERIT
                        ? this.frontMatterComplementStrategy.handler
                        : this.matchStrategy.handler;
                    return handler(this.indexedWords, q.word, this.settings.maxNumberOfSuggestions, {
                        frontMatter: parsedQuery.currentFrontMatter,
                        selectionHistoryStorage: this.selectionHistoryStorage,
                    }).map((word) => (Object.assign(Object.assign({}, word), { offset: q.offset })));
                })
                    .flat();
                cb(uniqWith(words, suggestionUniqPredicate).slice(0, this.settings.maxNumberOfSuggestions));
                this.showDebugLog(() => buildLogMessage("Get suggestions", performance.now() - start));
            }, this.settings.delayMilliSeconds, true);
            this.debounceClose = obsidian.debounce(() => {
                this.close();
            }, this.settings.delayMilliSeconds + 50);
            this.registerKeymaps();
        });
    }
    registerKeymaps() {
        const registerKeyAsIgnored = (modifiers, key) => {
            this.keymapEventHandler.push(this.scope.register(modifiers, key, () => {
                this.close();
                return true;
            }));
        };
        // Clear
        this.keymapEventHandler.forEach((x) => this.scope.unregister(x));
        this.keymapEventHandler = [];
        this.scope.unregister(this.scope.keys.find((x) => x.key === "Enter"));
        this.scope.unregister(this.scope.keys.find((x) => x.key === "ArrowUp"));
        this.scope.unregister(this.scope.keys.find((x) => x.key === "ArrowDown"));
        // selectSuggestionKeys
        const selectSuggestionKey = SelectSuggestionKey.fromName(this.settings.selectSuggestionKeys);
        if (selectSuggestionKey !== SelectSuggestionKey.ENTER) {
            registerKeyAsIgnored(SelectSuggestionKey.ENTER.keyBind.modifiers, SelectSuggestionKey.ENTER.keyBind.key);
        }
        if (selectSuggestionKey !== SelectSuggestionKey.TAB) {
            registerKeyAsIgnored(SelectSuggestionKey.TAB.keyBind.modifiers, SelectSuggestionKey.TAB.keyBind.key);
        }
        if (selectSuggestionKey !== SelectSuggestionKey.None) {
            this.keymapEventHandler.push(this.scope.register(selectSuggestionKey.keyBind.modifiers, selectSuggestionKey.keyBind.key, () => {
                this.suggestions.useSelectedItem({});
                return false;
            }));
        }
        // propagateESC
        this.scope.keys.find((x) => x.key === "Escape").func = () => {
            this.close();
            return this.settings.propagateEsc;
        };
        // cycleThroughSuggestionsKeys
        const selectNext = (evt) => {
            this.suggestions.setSelectedItem(this.suggestions.selectedItem + 1, evt);
            return false;
        };
        const selectPrevious = (evt) => {
            this.suggestions.setSelectedItem(this.suggestions.selectedItem - 1, evt);
            return false;
        };
        const cycleThroughSuggestionsKeys = CycleThroughSuggestionsKeys.fromName(this.settings.additionalCycleThroughSuggestionsKeys);
        if (this.settings.disableUpDownKeysForCycleThroughSuggestionsKeys) {
            this.keymapEventHandler.push(this.scope.register([], "ArrowDown", () => {
                this.close();
                return true;
            }), this.scope.register([], "ArrowUp", () => {
                this.close();
                return true;
            }));
        }
        else {
            this.keymapEventHandler.push(this.scope.register([], "ArrowDown", selectNext), this.scope.register([], "ArrowUp", selectPrevious));
        }
        if (cycleThroughSuggestionsKeys !== CycleThroughSuggestionsKeys.NONE) {
            if (cycleThroughSuggestionsKeys === CycleThroughSuggestionsKeys.TAB) {
                this.scope.unregister(this.scope.keys.find((x) => x.modifiers === "" && x.key === "Tab"));
            }
            this.keymapEventHandler.push(this.scope.register(cycleThroughSuggestionsKeys.nextKey.modifiers, cycleThroughSuggestionsKeys.nextKey.key, selectNext), this.scope.register(cycleThroughSuggestionsKeys.previousKey.modifiers, cycleThroughSuggestionsKeys.previousKey.key, selectPrevious));
        }
        const openSourceFileKey = OpenSourceFileKeys.fromName(this.settings.openSourceFileKey);
        if (openSourceFileKey !== OpenSourceFileKeys.NONE) {
            this.keymapEventHandler.push(this.scope.register(openSourceFileKey.keyBind.modifiers, openSourceFileKey.keyBind.key, () => {
                const item = this.suggestions.values[this.suggestions.selectedItem];
                if (item.type !== "currentVault" &&
                    item.type !== "internalLink" &&
                    item.type !== "frontMatter") {
                    return false;
                }
                const markdownFile = this.appHelper.getMarkdownFileByPath(item.createdPath);
                if (!markdownFile) {
                    // noinspection ObjectAllocationIgnored
                    new obsidian.Notice(`Can't open ${item.createdPath}`);
                    return false;
                }
                this.appHelper.openMarkdownFile(markdownFile, true);
                return false;
            }));
        }
    }
    refreshCurrentFileTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            this.statusBar.setCurrentFileIndexing();
            if (!this.settings.enableCurrentFileComplement) {
                this.statusBar.setCurrentFileDisabled();
                this.currentFileWordProvider.clearWords();
                this.showDebugLog(() => buildLogMessage("👢 Skip: Index current file tokens", performance.now() - start));
                return;
            }
            yield this.currentFileWordProvider.refreshWords(this.settings.onlyComplementEnglishOnCurrentFileComplement, this.currentFileMinNumberOfCharacters);
            this.statusBar.setCurrentFileIndexed(this.currentFileWordProvider.wordCount);
            this.showDebugLog(() => buildLogMessage("Index current file tokens", performance.now() - start));
        });
    }
    refreshCurrentVaultTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            this.statusBar.setCurrentVaultIndexing();
            if (!this.settings.enableCurrentVaultComplement) {
                this.statusBar.setCurrentVaultDisabled();
                this.currentVaultWordProvider.clearWords();
                this.showDebugLog(() => buildLogMessage("👢 Skip: Index current vault tokens", performance.now() - start));
                return;
            }
            yield this.currentVaultWordProvider.refreshWords(this.currentVaultMinNumberOfCharacters);
            this.statusBar.setCurrentVaultIndexed(this.currentVaultWordProvider.wordCount);
            this.showDebugLog(() => buildLogMessage("Index current vault tokens", performance.now() - start));
        });
    }
    refreshCustomDictionaryTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            this.statusBar.setCustomDictionaryIndexing();
            if (!this.settings.enableCustomDictionaryComplement) {
                this.statusBar.setCustomDictionaryDisabled();
                this.customDictionaryWordProvider.clearWords();
                this.showDebugLog(() => buildLogMessage("👢Skip: Index custom dictionary tokens", performance.now() - start));
                return;
            }
            yield this.customDictionaryWordProvider.refreshCustomWords({
                regexp: this.settings.customDictionaryWordRegexPattern,
                delimiterForHide: this.settings.delimiterToHideSuggestion || undefined,
                delimiterForDisplay: this.settings.delimiterToDivideSuggestionsForDisplayFromInsertion ||
                    undefined,
                caretSymbol: this.settings.caretLocationSymbolAfterComplement || undefined,
            });
            this.statusBar.setCustomDictionaryIndexed(this.customDictionaryWordProvider.wordCount);
            this.showDebugLog(() => buildLogMessage("Index custom dictionary tokens", performance.now() - start));
        });
    }
    refreshInternalLinkTokens() {
        const start = performance.now();
        this.statusBar.setInternalLinkIndexing();
        if (!this.settings.enableInternalLinkComplement) {
            this.statusBar.setInternalLinkDisabled();
            this.internalLinkWordProvider.clearWords();
            this.showDebugLog(() => buildLogMessage("👢Skip: Index internal link tokens", performance.now() - start));
            return;
        }
        this.internalLinkWordProvider.refreshWords(this.settings.suggestInternalLinkWithAlias, this.excludeInternalLinkPrefixPathPatterns);
        this.statusBar.setInternalLinkIndexed(this.internalLinkWordProvider.wordCount);
        this.showDebugLog(() => buildLogMessage("Index internal link tokens", performance.now() - start));
    }
    refreshFrontMatterTokens() {
        const start = performance.now();
        this.statusBar.setFrontMatterIndexing();
        if (!this.settings.enableFrontMatterComplement) {
            this.statusBar.setFrontMatterDisabled();
            this.frontMatterWordProvider.clearWords();
            this.showDebugLog(() => buildLogMessage("👢Skip: Index front matter tokens", performance.now() - start));
            return;
        }
        this.frontMatterWordProvider.refreshWords();
        this.statusBar.setFrontMatterIndexed(this.frontMatterWordProvider.wordCount);
        this.showDebugLog(() => buildLogMessage("Index front matter tokens", performance.now() - start));
    }
    updateFrontMatterTokenIndex(file) {
        const start = performance.now();
        if (!this.settings.enableFrontMatterComplement) {
            this.showDebugLog(() => buildLogMessage("👢Skip: Update front matter token index", performance.now() - start));
            return;
        }
        this.frontMatterWordProvider.updateWordIndex(file);
        this.showDebugLog(() => buildLogMessage("Update front matter token index", performance.now() - start));
    }
    updateFrontMatterToken() {
        const start = performance.now();
        if (!this.settings.enableFrontMatterComplement) {
            this.showDebugLog(() => buildLogMessage("👢Skip: Update front matter token", performance.now() - start));
            return;
        }
        this.frontMatterWordProvider.updateWords();
        this.statusBar.setFrontMatterIndexed(this.frontMatterWordProvider.wordCount);
        this.showDebugLog(() => buildLogMessage("Update front matter token", performance.now() - start));
    }
    onTrigger(cursor, editor, file) {
        var _a, _b, _c, _d, _e, _f;
        const start = performance.now();
        const showDebugLog = (message) => {
            this.showDebugLog(() => `[onTrigger] ${message}`);
        };
        const onReturnNull = (message) => {
            showDebugLog(message);
            this.runManually = false;
            this.close();
        };
        if (!this.settings.complementAutomatically &&
            !this.isOpen &&
            !this.runManually) {
            onReturnNull("Don't show suggestions");
            return null;
        }
        if (this.settings.disableSuggestionsDuringImeOn &&
            this.appHelper.isIMEOn() &&
            !this.runManually) {
            onReturnNull("Don't show suggestions for IME");
            return null;
        }
        const cl = this.appHelper.getCurrentLine(editor);
        if (this.previousCurrentLine === cl && !this.runManually) {
            this.previousCurrentLine = cl;
            onReturnNull("Don't show suggestions because there are no changes");
            return null;
        }
        this.previousCurrentLine = cl;
        const currentLineUntilCursor = this.appHelper.getCurrentLineUntilCursor(editor);
        if (currentLineUntilCursor.startsWith("---")) {
            onReturnNull("Don't show suggestions because it supposes front matter or horizontal line");
            return null;
        }
        if (currentLineUntilCursor.startsWith("~~~") ||
            currentLineUntilCursor.startsWith("```")) {
            onReturnNull("Don't show suggestions because it supposes front code block");
            return null;
        }
        const tokens = this.tokenizer.tokenize(currentLineUntilCursor, true);
        showDebugLog(`tokens is ${tokens}`);
        const tokenized = this.tokenizer.recursiveTokenize(currentLineUntilCursor);
        const currentTokens = tokenized.slice(tokenized.length > this.settings.maxNumberOfWordsAsPhrase
            ? tokenized.length - this.settings.maxNumberOfWordsAsPhrase
            : 0);
        showDebugLog(`currentTokens is ${JSON.stringify(currentTokens)}`);
        const currentToken = (_a = currentTokens[0]) === null || _a === void 0 ? void 0 : _a.word;
        showDebugLog(`currentToken is ${currentToken}`);
        if (!currentToken) {
            onReturnNull(`Don't show suggestions because currentToken is empty`);
            return null;
        }
        const currentTokenSeparatedWhiteSpace = (_b = currentLineUntilCursor.split(" ").last()) !== null && _b !== void 0 ? _b : "";
        if (new RegExp(`^[${this.settings.firstCharactersDisableSuggestions}]`).test(currentTokenSeparatedWhiteSpace)) {
            onReturnNull(`Don't show suggestions for avoiding to conflict with the other commands.`);
            return null;
        }
        if (currentToken.length === 1 &&
            Boolean(currentToken.match(this.tokenizer.getTrimPattern()))) {
            onReturnNull(`Don't show suggestions because currentToken is TRIM_PATTERN`);
            return null;
        }
        const currentFrontMatter = this.settings.enableFrontMatterComplement
            ? this.appHelper.getCurrentFrontMatter()
            : undefined;
        showDebugLog(`Current front matter is ${currentFrontMatter}`);
        if (!this.runManually &&
            !currentFrontMatter &&
            currentToken.length < this.minNumberTriggered) {
            onReturnNull("Don't show suggestions because currentToken is less than minNumberTriggered option");
            return null;
        }
        showDebugLog(buildLogMessage("onTrigger", performance.now() - start));
        this.runManually = false;
        // Hack implementation for Front matter complement
        if (currentFrontMatter && ((_c = currentTokens.last()) === null || _c === void 0 ? void 0 : _c.word.match(/[^ ] $/))) {
            currentTokens.push({ word: "", offset: currentLineUntilCursor.length });
        }
        // For multi-word completion
        this.contextStartCh = cursor.ch - currentToken.length;
        return {
            start: {
                ch: cursor.ch - ((_f = (_e = (_d = currentTokens.last()) === null || _d === void 0 ? void 0 : _d.word) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0),
                line: cursor.line,
            },
            end: cursor,
            query: JSON.stringify({
                currentFrontMatter,
                queries: currentTokens.map((x) => (Object.assign(Object.assign({}, x), { offset: x.offset - currentTokens[0].offset }))),
            }),
        };
    }
    getSuggestions(context) {
        return new Promise((resolve) => {
            this.debounceGetSuggestions(context, (words) => {
                resolve(words);
            });
        });
    }
    renderSuggestion(word, el) {
        const base = createDiv();
        let text = word.value;
        if (word.type === "customDictionary" &&
            word.insertedText &&
            this.settings.displayedTextSuffix) {
            text += this.settings.displayedTextSuffix;
        }
        base.createDiv({
            text,
            cls: word.type === "internalLink" && word.aliasMeta
                ? "various-complements__suggestion-item__content__alias"
                : undefined,
        });
        const description = this.descriptionOnSuggestion.toDisplay(word);
        if (description) {
            base.createDiv({
                cls: "various-complements__suggestion-item__description",
                text: `${description}`,
            });
        }
        el.appendChild(base);
        el.addClass("various-complements__suggestion-item");
        switch (word.type) {
            case "currentFile":
                el.addClass("various-complements__suggestion-item__current-file");
                break;
            case "currentVault":
                el.addClass("various-complements__suggestion-item__current-vault");
                break;
            case "customDictionary":
                el.addClass("various-complements__suggestion-item__custom-dictionary");
                break;
            case "internalLink":
                el.addClass("various-complements__suggestion-item__internal-link");
                if (word.phantom) {
                    el.addClass("various-complements__suggestion-item__phantom");
                }
                break;
            case "frontMatter":
                el.addClass("various-complements__suggestion-item__front-matter");
                break;
        }
    }
    selectSuggestion(word, evt) {
        var _a, _b;
        if (!this.context) {
            return;
        }
        let insertedText = word.value;
        if (word.type === "internalLink") {
            if (this.settings.suggestInternalLinkWithAlias && word.aliasMeta) {
                const linkText = this.appHelper.optimizeMarkdownLinkText(word.aliasMeta.origin);
                insertedText = this.appHelper.useWikiLinks
                    ? `[[${linkText}|${word.value}]]`
                    : `[${word.value}](${encodeSpace(linkText)}.md)`;
            }
            else {
                const linkText = this.appHelper.optimizeMarkdownLinkText(word.phantom ? word.value : word.createdPath);
                insertedText = this.appHelper.useWikiLinks
                    ? `[[${linkText}]]`
                    : `[${linkText}](${encodeSpace(linkText)}.md)`;
            }
        }
        if (word.type === "frontMatter" &&
            this.settings.insertCommaAfterFrontMatterCompletion) {
            insertedText = `${insertedText}, `;
        }
        else {
            if (this.settings.insertAfterCompletion &&
                !(word.type === "customDictionary" && word.ignoreSpaceAfterCompletion)) {
                insertedText = `${insertedText} `;
            }
        }
        let positionToMove = -1;
        if (word.type === "customDictionary") {
            if (word.insertedText) {
                insertedText = word.insertedText;
            }
            const caret = word.caretSymbol;
            if (caret) {
                positionToMove = insertedText.indexOf(caret);
                insertedText = insertedText.replace(caret, "");
            }
        }
        const editor = this.context.editor;
        editor.replaceRange(insertedText, Object.assign(Object.assign({}, this.context.start), { ch: this.contextStartCh + word.offset }), this.context.end);
        if (positionToMove !== -1) {
            editor.setCursor(editor.offsetToPos(editor.posToOffset(editor.getCursor()) -
                insertedText.length +
                positionToMove));
        }
        // The workaround of strange behavior for that cursor doesn't move after completion only if it doesn't input any word.
        if (this.appHelper.equalsAsEditorPostion(this.context.start, this.context.end)) {
            editor.setCursor(editor.offsetToPos(editor.posToOffset(editor.getCursor()) + insertedText.length));
        }
        (_a = this.selectionHistoryStorage) === null || _a === void 0 ? void 0 : _a.increment(word);
        if (this.settings.showLogAboutPerformanceInConsole) {
            console.log("--- history ---");
            console.log((_b = this.selectionHistoryStorage) === null || _b === void 0 ? void 0 : _b.data);
        }
        this.close();
        this.debounceClose();
    }
    showDebugLog(toMessage) {
        if (this.settings.showLogAboutPerformanceInConsole) {
            console.log(toMessage());
        }
    }
}

const DEFAULT_SETTINGS = {
    // general
    strategy: "default",
    matchStrategy: "prefix",
    maxNumberOfSuggestions: 5,
    maxNumberOfWordsAsPhrase: 3,
    minNumberOfCharactersTriggered: 0,
    minNumberOfWordsTriggeredPhrase: 1,
    complementAutomatically: true,
    delayMilliSeconds: 0,
    disableSuggestionsDuringImeOn: false,
    insertAfterCompletion: true,
    firstCharactersDisableSuggestions: ":/^",
    // appearance
    showMatchStrategy: true,
    showComplementAutomatically: true,
    showIndexingStatus: true,
    descriptionOnSuggestion: "Short",
    // key customization
    selectSuggestionKeys: "Enter",
    additionalCycleThroughSuggestionsKeys: "None",
    disableUpDownKeysForCycleThroughSuggestionsKeys: false,
    openSourceFileKey: "None",
    propagateEsc: false,
    // current file complement
    enableCurrentFileComplement: true,
    currentFileMinNumberOfCharacters: 0,
    onlyComplementEnglishOnCurrentFileComplement: false,
    // current vault complement
    enableCurrentVaultComplement: false,
    currentVaultMinNumberOfCharacters: 0,
    includeCurrentVaultPathPrefixPatterns: "",
    excludeCurrentVaultPathPrefixPatterns: "",
    includeCurrentVaultOnlyFilesUnderCurrentDirectory: false,
    // custom dictionary complement
    enableCustomDictionaryComplement: false,
    customDictionaryPaths: `https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt`,
    columnDelimiter: "Tab",
    customDictionaryWordRegexPattern: "",
    delimiterToHideSuggestion: "",
    delimiterToDivideSuggestionsForDisplayFromInsertion: "",
    caretLocationSymbolAfterComplement: "",
    displayedTextSuffix: " => ...",
    // internal link complement
    enableInternalLinkComplement: true,
    suggestInternalLinkWithAlias: false,
    excludeInternalLinkPathPrefixPatterns: "",
    // front matter complement
    enableFrontMatterComplement: true,
    frontMatterComplementMatchStrategy: "inherit",
    insertCommaAfterFrontMatterCompletion: false,
    intelligentSuggestionPrioritization: {
        maxDaysToKeepHistory: 30,
        maxNumberOfHistoryToKeep: 0,
    },
    // debug
    showLogAboutPerformanceInConsole: false,
    // others
    selectionHistoryTree: {},
};
class VariousComplementsSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Various Complements - Settings" });
        this.addMainSettings(containerEl);
        this.addAppearanceSettings(containerEl);
        this.addKeyCustomizationSettings(containerEl);
        this.addCurrentFileComplementSettings(containerEl);
        this.addCurrentVaultComplementSettings(containerEl);
        this.addCustomDictionaryComplementSettings(containerEl);
        this.addInternalLinkComplementSettings(containerEl);
        this.addFrontMatterComplementSettings(containerEl);
        this.addIntelligentSuggestionPrioritizationSettings(containerEl);
        this.addDebugSettings(containerEl);
    }
    addMainSettings(containerEl) {
        containerEl.createEl("h3", { text: "Main" });
        new obsidian.Setting(containerEl).setName("Strategy").addDropdown((tc) => tc
            .addOptions(mirrorMap(TokenizeStrategy.values(), (x) => x.name))
            .setValue(this.plugin.settings.strategy)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.strategy = value;
            this.display();
            yield this.plugin.saveSettings({
                currentFile: true,
                currentVault: true,
            });
        })));
        if (this.plugin.settings.strategy === TokenizeStrategy.CHINESE.name) {
            const el = containerEl.createEl("div", {
                cls: "various-complements__settings__warning",
            });
            el.createSpan({
                text: "⚠ You need to download `cedict_ts.u8` from",
            });
            el.createEl("a", {
                href: "https://www.mdbg.net/chinese/dictionary?page=cc-cedict",
                text: " the site ",
            });
            el.createSpan({
                text: "and store it in vault root.",
            });
        }
        new obsidian.Setting(containerEl).setName("Match strategy").addDropdown((tc) => tc
            .addOptions(mirrorMap(MatchStrategy.values(), (x) => x.name))
            .setValue(this.plugin.settings.matchStrategy)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.matchStrategy = value;
            yield this.plugin.saveSettings();
            this.display();
        })));
        if (this.plugin.settings.matchStrategy === MatchStrategy.PARTIAL.name) {
            containerEl.createEl("div", {
                text: "⚠ `partial` is more than 10 times slower than `prefix`",
                cls: "various-complements__settings__warning",
            });
        }
        new obsidian.Setting(containerEl)
            .setName("Max number of suggestions")
            .addSlider((sc) => sc
            .setLimits(1, 255, 1)
            .setValue(this.plugin.settings.maxNumberOfSuggestions)
            .setDynamicTooltip()
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.maxNumberOfSuggestions = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Max number of words as a phrase")
            .setDesc(`[⚠Warning] It makes slower more than N times (N is set value)`)
            .addSlider((sc) => sc
            .setLimits(1, 10, 1)
            .setValue(this.plugin.settings.maxNumberOfWordsAsPhrase)
            .setDynamicTooltip()
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.maxNumberOfWordsAsPhrase = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Min number of characters for trigger")
            .setDesc("It uses a default value of Strategy if set 0.")
            .addSlider((sc) => sc
            .setLimits(0, 10, 1)
            .setValue(this.plugin.settings.minNumberOfCharactersTriggered)
            .setDynamicTooltip()
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.minNumberOfCharactersTriggered = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Min number of words for trigger")
            .addSlider((sc) => sc
            .setLimits(1, 10, 1)
            .setValue(this.plugin.settings.minNumberOfWordsTriggeredPhrase)
            .setDynamicTooltip()
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.minNumberOfWordsTriggeredPhrase = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Complement automatically")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.complementAutomatically).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.complementAutomatically = value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName("Delay milli-seconds for trigger")
            .addSlider((sc) => sc
            .setLimits(0, 1000, 10)
            .setValue(this.plugin.settings.delayMilliSeconds)
            .setDynamicTooltip()
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.delayMilliSeconds = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Disable suggestions during IME on")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.disableSuggestionsDuringImeOn).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.disableSuggestionsDuringImeOn = value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName("Insert space after completion")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.insertAfterCompletion).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.insertAfterCompletion = value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName("First characters to disable suggestions")
            .addText((cb) => {
            cb.setValue(this.plugin.settings.firstCharactersDisableSuggestions).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.firstCharactersDisableSuggestions = value;
                yield this.plugin.saveSettings();
            }));
        });
    }
    addAppearanceSettings(containerEl) {
        containerEl.createEl("h3", { text: "Appearance" });
        new obsidian.Setting(containerEl)
            .setName("Show Match strategy")
            .setDesc("Show Match strategy at the status bar. Changing this option requires a restart to take effect.")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.showMatchStrategy).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.showMatchStrategy = value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName("Show Complement automatically")
            .setDesc("Show complement automatically at the status bar. Changing this option requires a restart to take effect.")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.showComplementAutomatically).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.showComplementAutomatically = value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName("Show Indexing status")
            .setDesc("Show indexing status at the status bar. Changing this option requires a restart to take effect.")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.showIndexingStatus).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.showIndexingStatus = value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName("Description on a suggestion")
            .addDropdown((tc) => tc
            .addOptions(mirrorMap(DescriptionOnSuggestion.values(), (x) => x.name))
            .setValue(this.plugin.settings.descriptionOnSuggestion)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.descriptionOnSuggestion = value;
            yield this.plugin.saveSettings();
        })));
    }
    addKeyCustomizationSettings(containerEl) {
        containerEl.createEl("h3", { text: "Key customization" });
        new obsidian.Setting(containerEl)
            .setName("Select a suggestion key")
            .addDropdown((tc) => tc
            .addOptions(mirrorMap(SelectSuggestionKey.values(), (x) => x.name))
            .setValue(this.plugin.settings.selectSuggestionKeys)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.selectSuggestionKeys = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Additional cycle through suggestions keys")
            .addDropdown((tc) => tc
            .addOptions(mirrorMap(CycleThroughSuggestionsKeys.values(), (x) => x.name))
            .setValue(this.plugin.settings.additionalCycleThroughSuggestionsKeys)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.additionalCycleThroughSuggestionsKeys = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Disable the up/down keys for cycle through suggestions keys")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.disableUpDownKeysForCycleThroughSuggestionsKeys).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.disableUpDownKeysForCycleThroughSuggestionsKeys =
                    value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl).setName("Open source file key").addDropdown((tc) => tc
            .addOptions(mirrorMap(OpenSourceFileKeys.values(), (x) => x.name))
            .setValue(this.plugin.settings.openSourceFileKey)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.openSourceFileKey = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Propagate ESC")
            .setDesc("It is handy if you use Vim mode because you can switch to Normal mode by one ESC, whether it shows suggestions or not.")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.propagateEsc).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.propagateEsc = value;
                yield this.plugin.saveSettings();
            }));
        });
    }
    addCurrentFileComplementSettings(containerEl) {
        containerEl.createEl("h3", {
            text: "Current file complement",
            cls: "various-complements__settings__header various-complements__settings__header__current-file",
        });
        new obsidian.Setting(containerEl)
            .setName("Enable Current file complement")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.enableCurrentFileComplement).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.enableCurrentFileComplement = value;
                yield this.plugin.saveSettings({ currentFile: true });
                this.display();
            }));
        });
        if (this.plugin.settings.enableCurrentFileComplement) {
            new obsidian.Setting(containerEl)
                .setName("Min number of characters for indexing")
                .setDesc("It uses a default value of Strategy if set 0.")
                .addSlider((sc) => sc
                .setLimits(0, 15, 1)
                .setValue(this.plugin.settings.currentFileMinNumberOfCharacters)
                .setDynamicTooltip()
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.currentFileMinNumberOfCharacters = value;
                yield this.plugin.saveSettings({ currentFile: true });
            })));
            new obsidian.Setting(containerEl)
                .setName("Only complement English on current file complement")
                .addToggle((tc) => {
                tc.setValue(this.plugin.settings.onlyComplementEnglishOnCurrentFileComplement).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.onlyComplementEnglishOnCurrentFileComplement =
                        value;
                    yield this.plugin.saveSettings({ currentFile: true });
                }));
            });
        }
    }
    addCurrentVaultComplementSettings(containerEl) {
        containerEl.createEl("h3", {
            text: "Current vault complement",
            cls: "various-complements__settings__header various-complements__settings__header__current-vault",
        });
        new obsidian.Setting(containerEl)
            .setName("Enable Current vault complement")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.enableCurrentVaultComplement).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.enableCurrentVaultComplement = value;
                this.display();
                yield this.plugin.saveSettings({ currentVault: true });
            }));
        });
        if (this.plugin.settings.enableCurrentVaultComplement) {
            new obsidian.Setting(containerEl)
                .setName("Min number of characters for indexing")
                .setDesc("It uses a default value of Strategy if set 0.")
                .addSlider((sc) => sc
                .setLimits(0, 15, 1)
                .setValue(this.plugin.settings.currentVaultMinNumberOfCharacters)
                .setDynamicTooltip()
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.currentVaultMinNumberOfCharacters = value;
                yield this.plugin.saveSettings();
            })));
            new obsidian.Setting(containerEl)
                .setName("Include prefix path patterns")
                .setDesc("Prefix match path patterns to include files.")
                .addTextArea((tac) => {
                const el = tac
                    .setValue(this.plugin.settings.includeCurrentVaultPathPrefixPatterns)
                    .setPlaceholder("Private/")
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.includeCurrentVaultPathPrefixPatterns =
                        value;
                    yield this.plugin.saveSettings();
                }));
                el.inputEl.className =
                    "various-complements__settings__text-area-path";
                return el;
            });
            new obsidian.Setting(containerEl)
                .setName("Exclude prefix path patterns")
                .setDesc("Prefix match path patterns to exclude files.")
                .addTextArea((tac) => {
                const el = tac
                    .setValue(this.plugin.settings.excludeCurrentVaultPathPrefixPatterns)
                    .setPlaceholder("Private/")
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.excludeCurrentVaultPathPrefixPatterns =
                        value;
                    yield this.plugin.saveSettings();
                }));
                el.inputEl.className =
                    "various-complements__settings__text-area-path";
                return el;
            });
            new obsidian.Setting(containerEl)
                .setName("Include only files under current directory")
                .addToggle((tc) => {
                tc.setValue(this.plugin.settings
                    .includeCurrentVaultOnlyFilesUnderCurrentDirectory).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.includeCurrentVaultOnlyFilesUnderCurrentDirectory =
                        value;
                    yield this.plugin.saveSettings();
                }));
            });
        }
    }
    addCustomDictionaryComplementSettings(containerEl) {
        containerEl.createEl("h3", {
            text: "Custom dictionary complement",
            cls: "various-complements__settings__header various-complements__settings__header__custom-dictionary",
        });
        new obsidian.Setting(containerEl)
            .setName("Enable Custom dictionary complement")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.enableCustomDictionaryComplement).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.enableCustomDictionaryComplement = value;
                yield this.plugin.saveSettings({ customDictionary: true });
                this.display();
            }));
        });
        if (this.plugin.settings.enableCustomDictionaryComplement) {
            new obsidian.Setting(containerEl)
                .setName("Custom dictionary paths")
                .setDesc("Specify either a relative path from Vault root or URL for each line.")
                .addTextArea((tac) => {
                const el = tac
                    .setValue(this.plugin.settings.customDictionaryPaths)
                    .setPlaceholder("dictionary.md")
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.customDictionaryPaths = value;
                    yield this.plugin.saveSettings();
                }));
                el.inputEl.className =
                    "various-complements__settings__text-area-path";
                return el;
            });
            new obsidian.Setting(containerEl).setName("Column delimiter").addDropdown((tc) => tc
                .addOptions(mirrorMap(ColumnDelimiter.values(), (x) => x.name))
                .setValue(this.plugin.settings.columnDelimiter)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.columnDelimiter = value;
                yield this.plugin.saveSettings();
            })));
            new obsidian.Setting(containerEl)
                .setName("Word regex pattern")
                .setDesc("Only load words that match the regular expression pattern.")
                .addText((cb) => {
                cb.setValue(this.plugin.settings.customDictionaryWordRegexPattern).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.customDictionaryWordRegexPattern = value;
                    yield this.plugin.saveSettings();
                }));
            });
            new obsidian.Setting(containerEl)
                .setName("Delimiter to hide a suggestion")
                .setDesc("If set ';;;', 'abcd;;;efg' is shown as 'abcd' on suggestions, but completes to 'abcdefg'.")
                .addText((cb) => {
                cb.setValue(this.plugin.settings.delimiterToHideSuggestion).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.delimiterToHideSuggestion = value;
                    yield this.plugin.saveSettings();
                }));
            });
            new obsidian.Setting(containerEl)
                .setName("Delimiter to divide suggestions for display from ones for insertion")
                .setDesc("If set ' >>> ', 'displayed >>> inserted' is shown as 'displayed' on suggestions, but completes to 'inserted'.")
                .addText((cb) => {
                cb.setValue(this.plugin.settings
                    .delimiterToDivideSuggestionsForDisplayFromInsertion).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.delimiterToDivideSuggestionsForDisplayFromInsertion =
                        value;
                    yield this.plugin.saveSettings();
                }));
            });
            new obsidian.Setting(containerEl)
                .setName("Caret location symbol after complement")
                .setDesc("If set '<CARET>' and there is '<li><CARET></li>' in custom dictionary, it complements '<li></li>' and move a caret where between '<li>' and `</li>`.")
                .addText((cb) => {
                cb.setValue(this.plugin.settings.caretLocationSymbolAfterComplement).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.caretLocationSymbolAfterComplement = value;
                    yield this.plugin.saveSettings();
                }));
            });
            new obsidian.Setting(containerEl)
                .setName("Displayed text suffix")
                .setDesc("It shows as a suffix of displayed text if there is a difference between displayed and inserted")
                .addText((cb) => {
                cb.setValue(this.plugin.settings.displayedTextSuffix).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.displayedTextSuffix = value;
                    yield this.plugin.saveSettings();
                }));
            });
        }
    }
    addInternalLinkComplementSettings(containerEl) {
        containerEl.createEl("h3", {
            text: "Internal link complement",
            cls: "various-complements__settings__header various-complements__settings__header__internal-link",
        });
        new obsidian.Setting(containerEl)
            .setName("Enable Internal link complement")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.enableInternalLinkComplement).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.enableInternalLinkComplement = value;
                yield this.plugin.saveSettings({ internalLink: true });
                this.display();
            }));
        });
        if (this.plugin.settings.enableInternalLinkComplement) {
            new obsidian.Setting(containerEl)
                .setName("Suggest with an alias")
                .addToggle((tc) => {
                tc.setValue(this.plugin.settings.suggestInternalLinkWithAlias).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.suggestInternalLinkWithAlias = value;
                    yield this.plugin.saveSettings({ internalLink: true });
                }));
            });
            new obsidian.Setting(containerEl)
                .setName("Exclude prefix path patterns")
                .setDesc("Prefix match path patterns to exclude files.")
                .addTextArea((tac) => {
                const el = tac
                    .setValue(this.plugin.settings.excludeInternalLinkPathPrefixPatterns)
                    .setPlaceholder("Private/")
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.excludeInternalLinkPathPrefixPatterns =
                        value;
                    yield this.plugin.saveSettings();
                }));
                el.inputEl.className =
                    "various-complements__settings__text-area-path";
                return el;
            });
        }
    }
    addFrontMatterComplementSettings(containerEl) {
        containerEl.createEl("h3", {
            text: "Front matter complement",
            cls: "various-complements__settings__header various-complements__settings__header__front-matter",
        });
        new obsidian.Setting(containerEl)
            .setName("Enable Front matter complement")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.enableFrontMatterComplement).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.enableFrontMatterComplement = value;
                yield this.plugin.saveSettings({ frontMatter: true });
                this.display();
            }));
        });
        if (this.plugin.settings.enableFrontMatterComplement) {
            new obsidian.Setting(containerEl)
                .setName("Match strategy in the front matter")
                .addDropdown((tc) => tc
                .addOptions(mirrorMap(SpecificMatchStrategy.values(), (x) => x.name))
                .setValue(this.plugin.settings.frontMatterComplementMatchStrategy)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.frontMatterComplementMatchStrategy = value;
                yield this.plugin.saveSettings();
            })));
            new obsidian.Setting(containerEl)
                .setName("Insert comma after completion")
                .addToggle((tc) => {
                tc.setValue(this.plugin.settings.insertCommaAfterFrontMatterCompletion).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    this.plugin.settings.insertCommaAfterFrontMatterCompletion = value;
                    yield this.plugin.saveSettings();
                }));
            });
        }
    }
    addIntelligentSuggestionPrioritizationSettings(containerEl) {
        containerEl.createEl("h3", {
            text: "Intelligent suggestion prioritization",
            cls: "various-complements__settings__header various-complements__settings__header__intelligent-suggestion-prioritization",
        });
        new obsidian.Setting(containerEl)
            .setName("Max days to keep history")
            .setDesc("If set 0, it will never remove")
            .addSlider((sc) => sc
            .setLimits(0, 365, 1)
            .setValue(this.plugin.settings.intelligentSuggestionPrioritization
            .maxDaysToKeepHistory)
            .setDynamicTooltip()
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.intelligentSuggestionPrioritization.maxDaysToKeepHistory =
                value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Max number of history to keep")
            .setDesc("If set 0, it will never remove")
            .addSlider((sc) => sc
            .setLimits(0, 10000, 1)
            .setValue(this.plugin.settings.intelligentSuggestionPrioritization
            .maxNumberOfHistoryToKeep)
            .setDynamicTooltip()
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.intelligentSuggestionPrioritization.maxNumberOfHistoryToKeep =
                value;
            yield this.plugin.saveSettings();
        })));
    }
    addDebugSettings(containerEl) {
        containerEl.createEl("h3", { text: "Debug" });
        new obsidian.Setting(containerEl)
            .setName("Show log about performance in a console")
            .addToggle((tc) => {
            tc.setValue(this.plugin.settings.showLogAboutPerformanceInConsole).onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.showLogAboutPerformanceInConsole = value;
                yield this.plugin.saveSettings();
            }));
        });
    }
    toggleMatchStrategy() {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.plugin.settings.matchStrategy) {
                case "prefix":
                    this.plugin.settings.matchStrategy = "partial";
                    break;
                case "partial":
                    this.plugin.settings.matchStrategy = "prefix";
                    break;
                default:
                    // noinspection ObjectAllocationIgnored
                    new obsidian.Notice("⚠Unexpected error");
            }
            yield this.plugin.saveSettings();
        });
    }
    toggleComplementAutomatically() {
        return __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.complementAutomatically =
                !this.plugin.settings.complementAutomatically;
            yield this.plugin.saveSettings();
        });
    }
    ensureCustomDictionaryPath(path, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this.plugin.settings.customDictionaryPaths.split("\n");
            const exists = paths.some((x) => x === path);
            if ((exists && state === "present") || (!exists && state === "absent")) {
                return false;
            }
            const newPaths = state === "present" ? [...paths, path] : paths.filter((x) => x !== path);
            this.plugin.settings.customDictionaryPaths = newPaths.join("\n");
            yield this.plugin.saveSettings({ customDictionary: true });
            return true;
        });
    }
    getPluginSettingsAsJsonString() {
        return JSON.stringify({
            version: this.plugin.manifest.version,
            mobile: this.app.isMobile,
            settings: Object.assign(Object.assign({}, this.plugin.settings), { selectionHistoryTree: null }),
        }, null, 4);
    }
}

class ProviderStatusBar {
    constructor(currentFile, currentVault, customDictionary, internalLink, frontMatter, matchStrategy, complementAutomatically) {
        this.currentFile = currentFile;
        this.currentVault = currentVault;
        this.customDictionary = customDictionary;
        this.internalLink = internalLink;
        this.frontMatter = frontMatter;
        this.matchStrategy = matchStrategy;
        this.complementAutomatically = complementAutomatically;
    }
    static new(statusBar, showMatchStrategy, showIndexingStatus, showComplementAutomatically) {
        const currentFile = showIndexingStatus
            ? statusBar.createEl("span", {
                text: "---",
                cls: "various-complements__footer various-complements__footer__current-file",
            })
            : null;
        const currentVault = showIndexingStatus
            ? statusBar.createEl("span", {
                text: "---",
                cls: "various-complements__footer various-complements__footer__current-vault",
            })
            : null;
        const customDictionary = showIndexingStatus
            ? statusBar.createEl("span", {
                text: "---",
                cls: "various-complements__footer various-complements__footer__custom-dictionary",
            })
            : null;
        const internalLink = showIndexingStatus
            ? statusBar.createEl("span", {
                text: "---",
                cls: "various-complements__footer various-complements__footer__internal-link",
            })
            : null;
        const frontMatter = showIndexingStatus
            ? statusBar.createEl("span", {
                text: "---",
                cls: "various-complements__footer various-complements__footer__front-matter",
            })
            : null;
        const matchStrategy = showMatchStrategy
            ? statusBar.createEl("span", {
                text: "---",
                cls: "various-complements__footer various-complements__footer__match-strategy",
            })
            : null;
        const complementAutomatically = showComplementAutomatically
            ? statusBar.createEl("span", {
                text: "---",
                cls: "various-complements__footer various-complements__footer__complement-automatically",
            })
            : null;
        return new ProviderStatusBar(currentFile, currentVault, customDictionary, internalLink, frontMatter, matchStrategy, complementAutomatically);
    }
    setOnClickStrategyListener(listener) {
        var _a;
        (_a = this.matchStrategy) === null || _a === void 0 ? void 0 : _a.addEventListener("click", listener);
    }
    setOnClickComplementAutomatically(listener) {
        var _a;
        (_a = this.complementAutomatically) === null || _a === void 0 ? void 0 : _a.addEventListener("click", listener);
    }
    setCurrentFileDisabled() {
        var _a;
        (_a = this.currentFile) === null || _a === void 0 ? void 0 : _a.setText("---");
    }
    setCurrentVaultDisabled() {
        var _a;
        (_a = this.currentVault) === null || _a === void 0 ? void 0 : _a.setText("---");
    }
    setCustomDictionaryDisabled() {
        var _a;
        (_a = this.customDictionary) === null || _a === void 0 ? void 0 : _a.setText("---");
    }
    setInternalLinkDisabled() {
        var _a;
        (_a = this.internalLink) === null || _a === void 0 ? void 0 : _a.setText("---");
    }
    setFrontMatterDisabled() {
        var _a;
        (_a = this.frontMatter) === null || _a === void 0 ? void 0 : _a.setText("---");
    }
    setCurrentFileIndexing() {
        var _a;
        (_a = this.currentFile) === null || _a === void 0 ? void 0 : _a.setText("indexing...");
    }
    setCurrentVaultIndexing() {
        var _a;
        (_a = this.currentVault) === null || _a === void 0 ? void 0 : _a.setText("indexing...");
    }
    setCustomDictionaryIndexing() {
        var _a;
        (_a = this.customDictionary) === null || _a === void 0 ? void 0 : _a.setText("indexing...");
    }
    setInternalLinkIndexing() {
        var _a;
        (_a = this.internalLink) === null || _a === void 0 ? void 0 : _a.setText("indexing...");
    }
    setFrontMatterIndexing() {
        var _a;
        (_a = this.frontMatter) === null || _a === void 0 ? void 0 : _a.setText("indexing...");
    }
    setCurrentFileIndexed(count) {
        var _a;
        (_a = this.currentFile) === null || _a === void 0 ? void 0 : _a.setText(String(count));
    }
    setCurrentVaultIndexed(count) {
        var _a;
        (_a = this.currentVault) === null || _a === void 0 ? void 0 : _a.setText(String(count));
    }
    setCustomDictionaryIndexed(count) {
        var _a;
        (_a = this.customDictionary) === null || _a === void 0 ? void 0 : _a.setText(String(count));
    }
    setInternalLinkIndexed(count) {
        var _a;
        (_a = this.internalLink) === null || _a === void 0 ? void 0 : _a.setText(String(count));
    }
    setFrontMatterIndexed(count) {
        var _a;
        (_a = this.frontMatter) === null || _a === void 0 ? void 0 : _a.setText(String(count));
    }
    setMatchStrategy(strategy) {
        var _a;
        (_a = this.matchStrategy) === null || _a === void 0 ? void 0 : _a.setText(strategy.name);
    }
    setComplementAutomatically(automatically) {
        var _a;
        (_a = this.complementAutomatically) === null || _a === void 0 ? void 0 : _a.setText(automatically ? "auto" : "manual");
    }
}

function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function compute_rest_props(props, keys) {
    const rest = {};
    keys = new Set(keys);
    for (const k in props)
        if (!keys.has(k) && k[0] !== '$')
            rest[k] = props[k];
    return rest;
}
function null_to_empty(value) {
    return value == null ? '' : value;
}
function append(target, node) {
    target.appendChild(node);
}
function append_styles(target, style_sheet_id, styles) {
    const append_styles_to = get_root_for_style(target);
    if (!append_styles_to.getElementById(style_sheet_id)) {
        const style = element('style');
        style.id = style_sheet_id;
        style.textContent = styles;
        append_stylesheet(append_styles_to, style);
    }
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
    return style.sheet;
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_svg_attributes(node, attributes) {
    for (const key in attributes) {
        attr(node, key, attributes[key]);
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function set_style(node, key, value, important) {
    if (value === null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}
function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        if (option.__value === value) {
            option.selected = true;
            return;
        }
    }
    select.selectedIndex = -1; // no option should be selected
}
function select_value(select) {
    const selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs#run-time-svelte-onmount
 */
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
/**
 * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 *
 * Component events created with `createEventDispatcher` create a
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
 * property and can contain any type of data.
 *
 * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
 */
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail, { cancelable = false } = {}) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail, { cancelable });
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
            return !event.defaultPrevented;
        }
        return true;
    };
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        while (flushidx < dirty_components.length) {
            const component = dirty_components[flushidx];
            flushidx++;
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
    else if (callback) {
        callback();
    }
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
            // if the component was destroyed immediately
            // it will update the `$$.on_destroy` reference to `null`.
            // the destructured on_destroy may still reference to the old array
            if (component.$$.on_destroy) {
                component.$$.on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        if (!is_function(callback)) {
            return noop;
        }
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

/* src/ui/component/ObsidianButton.svelte generated by Svelte v3.52.0 */

function create_fragment$3(ctx) {
	let button;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	return {
		c() {
			button = element("button");
			if (default_slot) default_slot.c();
			attr(button, "aria-label", /*popup*/ ctx[0]);
			button.disabled = /*disabled*/ ctx[1];
			toggle_class(button, "mod-cta", !/*disabled*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (default_slot) {
				default_slot.m(button, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen(button, "click", /*handleClick*/ ctx[2]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[3],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*popup*/ 1) {
				attr(button, "aria-label", /*popup*/ ctx[0]);
			}

			if (!current || dirty & /*disabled*/ 2) {
				button.disabled = /*disabled*/ ctx[1];
			}

			if (!current || dirty & /*disabled*/ 2) {
				toggle_class(button, "mod-cta", !/*disabled*/ ctx[1]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { popup } = $$props;
	let { disabled = false } = $$props;
	const dispatcher = createEventDispatcher();

	const handleClick = () => {
		dispatcher("click");
	};

	$$self.$$set = $$props => {
		if ('popup' in $$props) $$invalidate(0, popup = $$props.popup);
		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
	};

	return [popup, disabled, handleClick, $$scope, slots];
}

class ObsidianButton extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { popup: 0, disabled: 1 });
	}
}

/* node_modules/svelte-lucide-icons/icons/File.svelte generated by Svelte v3.52.0 */

function create_fragment$2(ctx) {
	let svg;
	let path;
	let polyline;
	let current;
	const default_slot_template = /*#slots*/ ctx[3].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

	let svg_levels = [
		{ xmlns: "http://www.w3.org/2000/svg" },
		{ width: /*size*/ ctx[0] },
		{ height: /*size*/ ctx[0] },
		{ viewBox: "0 0 24 24" },
		{ fill: "none" },
		{ stroke: "currentColor" },
		{ "stroke-width": "2" },
		{ "stroke-linecap": "round" },
		{ "stroke-linejoin": "round" },
		/*$$restProps*/ ctx[1]
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	return {
		c() {
			svg = svg_element("svg");
			if (default_slot) default_slot.c();
			path = svg_element("path");
			polyline = svg_element("polyline");
			attr(path, "d", "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z");
			attr(polyline, "points", "14 2 14 8 20 8");
			set_svg_attributes(svg, svg_data);
		},
		m(target, anchor) {
			insert(target, svg, anchor);

			if (default_slot) {
				default_slot.m(svg, null);
			}

			append(svg, path);
			append(svg, polyline);
			current = true;
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[2],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
						null
					);
				}
			}

			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				{ xmlns: "http://www.w3.org/2000/svg" },
				(!current || dirty & /*size*/ 1) && { width: /*size*/ ctx[0] },
				(!current || dirty & /*size*/ 1) && { height: /*size*/ ctx[0] },
				{ viewBox: "0 0 24 24" },
				{ fill: "none" },
				{ stroke: "currentColor" },
				{ "stroke-width": "2" },
				{ "stroke-linecap": "round" },
				{ "stroke-linejoin": "round" },
				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]
			]));
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(svg);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	const omit_props_names = ["size"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { size = 24 } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
	};

	return [size, $$restProps, $$scope, slots];
}

class File extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { size: 0 });
	}
}

/* src/ui/component/ObsidianIconButton.svelte generated by Svelte v3.52.0 */

function add_css(target) {
	append_styles(target, "svelte-12yh6aw", ".wrapper.svelte-12yh6aw{display:flex;justify-content:center;margin:0}.button-enabled.svelte-12yh6aw:hover{color:var(--interactive-accent)}.button-disabled.svelte-12yh6aw{color:var(--text-muted)}");
}

function create_fragment$1(ctx) {
	let div;
	let button;
	let button_class_value;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	return {
		c() {
			div = element("div");
			button = element("button");
			if (default_slot) default_slot.c();
			attr(button, "aria-label", /*popup*/ ctx[0]);
			button.disabled = /*disabled*/ ctx[1];

			attr(button, "class", button_class_value = "" + (null_to_empty(/*disabled*/ ctx[1]
			? "button-disabled"
			: "button-enabled") + " svelte-12yh6aw"));

			set_style(button, "background-color", "transparent");
			set_style(button, "padding", "0");
			attr(div, "class", "wrapper svelte-12yh6aw");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, button);

			if (default_slot) {
				default_slot.m(button, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen(button, "click", /*handleClick*/ ctx[2]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[3],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*popup*/ 1) {
				attr(button, "aria-label", /*popup*/ ctx[0]);
			}

			if (!current || dirty & /*disabled*/ 2) {
				button.disabled = /*disabled*/ ctx[1];
			}

			if (!current || dirty & /*disabled*/ 2 && button_class_value !== (button_class_value = "" + (null_to_empty(/*disabled*/ ctx[1]
			? "button-disabled"
			: "button-enabled") + " svelte-12yh6aw"))) {
				attr(button, "class", button_class_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { popup } = $$props;
	let { disabled = false } = $$props;
	const dispatcher = createEventDispatcher();

	const handleClick = () => {
		if (!disabled) {
			dispatcher("click");
		}
	};

	$$self.$$set = $$props => {
		if ('popup' in $$props) $$invalidate(0, popup = $$props.popup);
		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
	};

	return [popup, disabled, handleClick, $$scope, slots];
}

class ObsidianIconButton extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { popup: 0, disabled: 1 }, add_css);
	}
}

/* src/ui/component/CustomDictionaryWordAdd.svelte generated by Svelte v3.52.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[26] = list[i];
	return child_ctx;
}

// (48:6) {#each dictionaries as dictionary}
function create_each_block(ctx) {
	let option;
	let t0_value = /*dictionary*/ ctx[26].path + "";
	let t0;
	let t1;
	let option_value_value;

	return {
		c() {
			option = element("option");
			t0 = text(t0_value);
			t1 = space();
			option.__value = option_value_value = /*dictionary*/ ctx[26];
			option.value = option.__value;
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t0);
			append(option, t1);
		},
		p(ctx, dirty) {
			if (dirty & /*dictionaries*/ 32 && t0_value !== (t0_value = /*dictionary*/ ctx[26].path + "")) set_data(t0, t0_value);

			if (dirty & /*dictionaries*/ 32 && option_value_value !== (option_value_value = /*dictionary*/ ctx[26])) {
				option.__value = option_value_value;
				option.value = option.__value;
			}
		},
		d(detaching) {
			if (detaching) detach(option);
		}
	};
}

// (54:4) <ObsidianIconButton       popup="Open the file"       on:click={() => onClickFileIcon(selectedDictionary.path)}     >
function create_default_slot_1(ctx) {
	let file;
	let current;
	file = new File({});

	return {
		c() {
			create_component(file.$$.fragment);
		},
		m(target, anchor) {
			mount_component(file, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(file.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(file.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(file, detaching);
		}
	};
}

// (70:2) {#if enableDisplayedWord}
function create_if_block_1(ctx) {
	let label;
	let input;
	let t;
	let mounted;
	let dispose;

	return {
		c() {
			label = element("label");
			input = element("input");
			t = text("\n      Distinguish between display and insertion");
			attr(input, "type", "checkbox");
		},
		m(target, anchor) {
			insert(target, label, anchor);
			append(label, input);
			input.checked = /*useDisplayedWord*/ ctx[1];
			append(label, t);

			if (!mounted) {
				dispose = listen(input, "change", /*input_change_handler*/ ctx[21]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*useDisplayedWord*/ 2) {
				input.checked = /*useDisplayedWord*/ ctx[1];
			}
		},
		d(detaching) {
			if (detaching) detach(label);
			mounted = false;
			dispose();
		}
	};
}

// (77:2) {#if useDisplayedWord}
function create_if_block(ctx) {
	let h3;
	let t1;
	let textarea;
	let mounted;
	let dispose;

	return {
		c() {
			h3 = element("h3");
			h3.textContent = "Displayed Word";
			t1 = space();
			textarea = element("textarea");
			set_style(textarea, "width", "100%");
			attr(textarea, "rows", "3");
		},
		m(target, anchor) {
			insert(target, h3, anchor);
			insert(target, t1, anchor);
			insert(target, textarea, anchor);
			set_input_value(textarea, /*displayedWord*/ ctx[3]);
			/*textarea_binding*/ ctx[23](textarea);

			if (!mounted) {
				dispose = listen(textarea, "input", /*textarea_input_handler*/ ctx[22]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*displayedWord*/ 8) {
				set_input_value(textarea, /*displayedWord*/ ctx[3]);
			}
		},
		d(detaching) {
			if (detaching) detach(h3);
			if (detaching) detach(t1);
			if (detaching) detach(textarea);
			/*textarea_binding*/ ctx[23](null);
			mounted = false;
			dispose();
		}
	};
}

// (94:4) <ObsidianButton disabled={!enableSubmit} on:click={handleSubmit}       >
function create_default_slot(ctx) {
	let t;

	return {
		c() {
			t = text("Submit");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

function create_fragment(ctx) {
	let div2;
	let h2;
	let t1;
	let h30;
	let t3;
	let div0;
	let select;
	let t4;
	let obsidianiconbutton;
	let t5;
	let h31;
	let t6;
	let t7;
	let textarea0;
	let t8;
	let t9;
	let t10;
	let h32;
	let t12;
	let input;
	let t13;
	let h33;
	let t15;
	let textarea1;
	let t16;
	let div1;
	let obsidianbutton;
	let current;
	let mounted;
	let dispose;
	let each_value = /*dictionaries*/ ctx[5];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	obsidianiconbutton = new ObsidianIconButton({
			props: {
				popup: "Open the file",
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			}
		});

	obsidianiconbutton.$on("click", /*click_handler*/ ctx[18]);
	let if_block0 = /*enableDisplayedWord*/ ctx[11] && create_if_block_1(ctx);
	let if_block1 = /*useDisplayedWord*/ ctx[1] && create_if_block(ctx);

	obsidianbutton = new ObsidianButton({
			props: {
				disabled: !/*enableSubmit*/ ctx[12],
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			}
		});

	obsidianbutton.$on("click", /*handleSubmit*/ ctx[13]);

	return {
		c() {
			div2 = element("div");
			h2 = element("h2");
			h2.textContent = "Add a word to a custom dictionary";
			t1 = space();
			h30 = element("h3");
			h30.textContent = "Dictionary";
			t3 = space();
			div0 = element("div");
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t4 = space();
			create_component(obsidianiconbutton.$$.fragment);
			t5 = space();
			h31 = element("h3");
			t6 = text(/*firstWordTitle*/ ctx[10]);
			t7 = space();
			textarea0 = element("textarea");
			t8 = space();
			if (if_block0) if_block0.c();
			t9 = space();
			if (if_block1) if_block1.c();
			t10 = space();
			h32 = element("h3");
			h32.textContent = "Description";
			t12 = space();
			input = element("input");
			t13 = space();
			h33 = element("h3");
			h33.textContent = "Aliases (for each line)";
			t15 = space();
			textarea1 = element("textarea");
			t16 = space();
			div1 = element("div");
			create_component(obsidianbutton.$$.fragment);
			attr(select, "class", "dropdown");
			if (/*selectedDictionary*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[17].call(select));
			set_style(div0, "display", "flex");
			set_style(div0, "gap", "10px");
			set_style(textarea0, "width", "100%");
			attr(textarea0, "rows", "3");
			attr(input, "type", "text");
			set_style(input, "width", "100%");
			set_style(textarea1, "width", "100%");
			attr(textarea1, "rows", "3");
			set_style(div1, "text-align", "center");
			set_style(div1, "width", "100%");
			set_style(div1, "padding-top", "15px");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, h2);
			append(div2, t1);
			append(div2, h30);
			append(div2, t3);
			append(div2, div0);
			append(div0, select);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			select_option(select, /*selectedDictionary*/ ctx[2]);
			append(div0, t4);
			mount_component(obsidianiconbutton, div0, null);
			append(div2, t5);
			append(div2, h31);
			append(h31, t6);
			append(div2, t7);
			append(div2, textarea0);
			set_input_value(textarea0, /*inputWord*/ ctx[0]);
			/*textarea0_binding*/ ctx[20](textarea0);
			append(div2, t8);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t9);
			if (if_block1) if_block1.m(div2, null);
			append(div2, t10);
			append(div2, h32);
			append(div2, t12);
			append(div2, input);
			set_input_value(input, /*description*/ ctx[4]);
			append(div2, t13);
			append(div2, h33);
			append(div2, t15);
			append(div2, textarea1);
			set_input_value(textarea1, /*aliasesStr*/ ctx[8]);
			append(div2, t16);
			append(div2, div1);
			mount_component(obsidianbutton, div1, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen(select, "change", /*select_change_handler*/ ctx[17]),
					listen(textarea0, "input", /*textarea0_input_handler*/ ctx[19]),
					listen(input, "input", /*input_input_handler*/ ctx[24]),
					listen(textarea1, "input", /*textarea1_input_handler*/ ctx[25])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*dictionaries*/ 32) {
				each_value = /*dictionaries*/ ctx[5];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*selectedDictionary, dictionaries*/ 36) {
				select_option(select, /*selectedDictionary*/ ctx[2]);
			}

			const obsidianiconbutton_changes = {};

			if (dirty & /*$$scope*/ 536870912) {
				obsidianiconbutton_changes.$$scope = { dirty, ctx };
			}

			obsidianiconbutton.$set(obsidianiconbutton_changes);
			if (!current || dirty & /*firstWordTitle*/ 1024) set_data(t6, /*firstWordTitle*/ ctx[10]);

			if (dirty & /*inputWord*/ 1) {
				set_input_value(textarea0, /*inputWord*/ ctx[0]);
			}

			if (/*enableDisplayedWord*/ ctx[11]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_1(ctx);
					if_block0.c();
					if_block0.m(div2, t9);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*useDisplayedWord*/ ctx[1]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block(ctx);
					if_block1.c();
					if_block1.m(div2, t10);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*description*/ 16 && input.value !== /*description*/ ctx[4]) {
				set_input_value(input, /*description*/ ctx[4]);
			}

			if (dirty & /*aliasesStr*/ 256) {
				set_input_value(textarea1, /*aliasesStr*/ ctx[8]);
			}

			const obsidianbutton_changes = {};
			if (dirty & /*enableSubmit*/ 4096) obsidianbutton_changes.disabled = !/*enableSubmit*/ ctx[12];

			if (dirty & /*$$scope*/ 536870912) {
				obsidianbutton_changes.$$scope = { dirty, ctx };
			}

			obsidianbutton.$set(obsidianbutton_changes);
		},
		i(local) {
			if (current) return;
			transition_in(obsidianiconbutton.$$.fragment, local);
			transition_in(obsidianbutton.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(obsidianiconbutton.$$.fragment, local);
			transition_out(obsidianbutton.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			destroy_each(each_blocks, detaching);
			destroy_component(obsidianiconbutton);
			/*textarea0_binding*/ ctx[20](null);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			destroy_component(obsidianbutton);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let enableSubmit;
	let enableDisplayedWord;
	let firstWordTitle;
	let { dictionaries } = $$props;
	let { selectedDictionary } = $$props;
	let { inputWord = "" } = $$props;
	let { useDisplayedWord = false } = $$props;
	let { displayedWord = "" } = $$props;
	let { description = "" } = $$props;
	let { aliases = [] } = $$props;
	let { dividerForDisplay = "" } = $$props;
	let { onSubmit } = $$props;
	let { onClickFileIcon } = $$props;
	let aliasesStr = aliases.join("\n");
	let wordRef = null;
	let displayedWordRef = null;

	const handleSubmit = () => {
		onSubmit(selectedDictionary.path, {
			value: displayedWord || inputWord,
			description,
			aliases: aliasesStr.split("\n"),
			type: "customDictionary",
			createdPath: selectedDictionary.path,
			insertedText: displayedWord ? inputWord : undefined
		});
	};

	onMount(() => {
		setTimeout(() => wordRef.focus(), 50);
	});

	function select_change_handler() {
		selectedDictionary = select_value(this);
		$$invalidate(2, selectedDictionary);
		$$invalidate(5, dictionaries);
	}

	const click_handler = () => onClickFileIcon(selectedDictionary.path);

	function textarea0_input_handler() {
		inputWord = this.value;
		$$invalidate(0, inputWord);
	}

	function textarea0_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			wordRef = $$value;
			$$invalidate(9, wordRef);
		});
	}

	function input_change_handler() {
		useDisplayedWord = this.checked;
		$$invalidate(1, useDisplayedWord);
	}

	function textarea_input_handler() {
		displayedWord = this.value;
		$$invalidate(3, displayedWord);
	}

	function textarea_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			displayedWordRef = $$value;
			$$invalidate(7, displayedWordRef);
		});
	}

	function input_input_handler() {
		description = this.value;
		$$invalidate(4, description);
	}

	function textarea1_input_handler() {
		aliasesStr = this.value;
		$$invalidate(8, aliasesStr);
	}

	$$self.$$set = $$props => {
		if ('dictionaries' in $$props) $$invalidate(5, dictionaries = $$props.dictionaries);
		if ('selectedDictionary' in $$props) $$invalidate(2, selectedDictionary = $$props.selectedDictionary);
		if ('inputWord' in $$props) $$invalidate(0, inputWord = $$props.inputWord);
		if ('useDisplayedWord' in $$props) $$invalidate(1, useDisplayedWord = $$props.useDisplayedWord);
		if ('displayedWord' in $$props) $$invalidate(3, displayedWord = $$props.displayedWord);
		if ('description' in $$props) $$invalidate(4, description = $$props.description);
		if ('aliases' in $$props) $$invalidate(14, aliases = $$props.aliases);
		if ('dividerForDisplay' in $$props) $$invalidate(15, dividerForDisplay = $$props.dividerForDisplay);
		if ('onSubmit' in $$props) $$invalidate(16, onSubmit = $$props.onSubmit);
		if ('onClickFileIcon' in $$props) $$invalidate(6, onClickFileIcon = $$props.onClickFileIcon);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*inputWord*/ 1) {
			$$invalidate(12, enableSubmit = inputWord.length > 0);
		}

		if ($$self.$$.dirty & /*dividerForDisplay*/ 32768) {
			$$invalidate(11, enableDisplayedWord = Boolean(dividerForDisplay));
		}

		if ($$self.$$.dirty & /*useDisplayedWord*/ 2) {
			$$invalidate(10, firstWordTitle = useDisplayedWord ? "Inserted word" : "Word");
		}

		if ($$self.$$.dirty & /*useDisplayedWord, displayedWordRef*/ 130) {
			{
				if (useDisplayedWord) {
					displayedWordRef === null || displayedWordRef === void 0
					? void 0
					: displayedWordRef.focus();
				}
			}
		}
	};

	return [
		inputWord,
		useDisplayedWord,
		selectedDictionary,
		displayedWord,
		description,
		dictionaries,
		onClickFileIcon,
		displayedWordRef,
		aliasesStr,
		wordRef,
		firstWordTitle,
		enableDisplayedWord,
		enableSubmit,
		handleSubmit,
		aliases,
		dividerForDisplay,
		onSubmit,
		select_change_handler,
		click_handler,
		textarea0_input_handler,
		textarea0_binding,
		input_change_handler,
		textarea_input_handler,
		textarea_binding,
		input_input_handler,
		textarea1_input_handler
	];
}

class CustomDictionaryWordAdd extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			dictionaries: 5,
			selectedDictionary: 2,
			inputWord: 0,
			useDisplayedWord: 1,
			displayedWord: 3,
			description: 4,
			aliases: 14,
			dividerForDisplay: 15,
			onSubmit: 16,
			onClickFileIcon: 6
		});
	}
}

class CustomDictionaryWordAddModal extends obsidian.Modal {
    constructor(app, dictionaryPaths, initialValue = "", dividerForDisplay = "", onSubmit) {
        super(app);
        const appHelper = new AppHelper(app);
        const dictionaries = dictionaryPaths.map((x) => ({ id: x, path: x }));
        const { contentEl } = this;
        this.component = new CustomDictionaryWordAdd({
            target: contentEl,
            props: {
                dictionaries,
                selectedDictionary: dictionaries[0],
                inputWord: initialValue,
                dividerForDisplay,
                onSubmit,
                onClickFileIcon: (dictionaryPath) => {
                    const markdownFile = appHelper.getMarkdownFileByPath(dictionaryPath);
                    if (!markdownFile) {
                        // noinspection ObjectAllocationIgnored
                        new obsidian.Notice(`Can't open ${dictionaryPath}`);
                        return;
                    }
                    this.close();
                    appHelper.openMarkdownFile(markdownFile, true);
                },
            },
        });
    }
    onClose() {
        super.onClose();
        this.component.$destroy();
    }
}

var dist = {};

var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(dist, "__esModule", { value: true });
// istanbul ignore next
var isObject = function (obj) {
    if (typeof obj === "object" && obj !== null) {
        if (typeof Object.getPrototypeOf === "function") {
            var prototype = Object.getPrototypeOf(obj);
            return prototype === Object.prototype || prototype === null;
        }
        return Object.prototype.toString.call(obj) === "[object Object]";
    }
    return false;
};
var merge = function () {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objects[_i] = arguments[_i];
    }
    return objects.reduce(function (result, current) {
        if (Array.isArray(current)) {
            throw new TypeError("Arguments provided to ts-deepmerge must be objects, not arrays.");
        }
        Object.keys(current).forEach(function (key) {
            if (["__proto__", "constructor", "prototype"].includes(key)) {
                return;
            }
            if (Array.isArray(result[key]) && Array.isArray(current[key])) {
                result[key] = merge.options.mergeArrays
                    ? Array.from(new Set(result[key].concat(current[key])))
                    : current[key];
            }
            else if (isObject(result[key]) && isObject(current[key])) {
                result[key] = merge(result[key], current[key]);
            }
            else {
                result[key] = current[key];
            }
        });
        return result;
    }, {});
};
var defaultOptions = {
    mergeArrays: true,
};
merge.options = defaultOptions;
merge.withOptions = function (options) {
    var objects = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objects[_i - 1] = arguments[_i];
    }
    merge.options = __assign({ mergeArrays: true }, options);
    var result = merge.apply(void 0, __spreadArray([], __read(objects), false));
    merge.options = defaultOptions;
    return result;
};
var _default = dist.default = merge;

class VariousComponents extends obsidian.Plugin {
    onunload() {
        super.onunload();
        this.suggester.unregister();
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.appHelper = new AppHelper(this.app);
            this.registerEvent(this.app.workspace.on("editor-menu", (menu) => {
                if (!this.appHelper.getSelection()) {
                    return;
                }
                menu.addItem((item) => item
                    .setTitle("Add to custom dictionary")
                    .setIcon("stacked-levels")
                    .onClick(() => {
                    this.addWordToCustomDictionary();
                }));
            }));
            yield this.loadSettings();
            this.settingTab = new VariousComplementsSettingTab(this.app, this);
            this.addSettingTab(this.settingTab);
            this.statusBar = ProviderStatusBar.new(this.addStatusBarItem(), this.settings.showMatchStrategy, this.settings.showIndexingStatus, this.settings.showComplementAutomatically);
            this.statusBar.setOnClickStrategyListener(() => __awaiter(this, void 0, void 0, function* () {
                yield this.settingTab.toggleMatchStrategy();
            }));
            this.statusBar.setOnClickComplementAutomatically(() => __awaiter(this, void 0, void 0, function* () {
                yield this.settingTab.toggleComplementAutomatically();
            }));
            const debouncedSaveData = obsidian.debounce(() => __awaiter(this, void 0, void 0, function* () {
                yield this.saveData(this.settings);
            }), 5000);
            this.suggester = yield AutoCompleteSuggest.new(this.app, this.settings, this.statusBar, debouncedSaveData);
            this.registerEditorSuggest(this.suggester);
            this.addCommand({
                id: "reload-custom-dictionaries",
                name: "Reload custom dictionaries",
                hotkeys: [{ modifiers: ["Mod", "Shift"], key: "r" }],
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    yield this.suggester.refreshCustomDictionaryTokens();
                }),
            });
            this.addCommand({
                id: "reload-current-vault",
                name: "Reload current vault",
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    yield this.suggester.refreshCurrentVaultTokens();
                }),
            });
            this.addCommand({
                id: "toggle-match-strategy",
                name: "Toggle Match strategy",
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    yield this.settingTab.toggleMatchStrategy();
                }),
            });
            this.addCommand({
                id: "toggle-complement-automatically",
                name: "Toggle Complement automatically",
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    yield this.settingTab.toggleComplementAutomatically();
                }),
            });
            this.addCommand({
                id: "show-suggestions",
                name: "Show suggestions",
                hotkeys: [{ modifiers: ["Mod"], key: " " }],
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    this.suggester.triggerComplete();
                }),
            });
            this.addCommand({
                id: "add-word-custom-dictionary",
                name: "Add a word to a custom dictionary",
                hotkeys: [{ modifiers: ["Mod", "Shift"], key: " " }],
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    this.addWordToCustomDictionary();
                }),
            });
            this.addCommand({
                id: "predictable-complements",
                name: "Predictable complement",
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    this.suggester.predictableComplete();
                }),
            });
            this.addCommand({
                id: "copy-plugin-settings",
                name: "Copy plugin settings",
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    yield navigator.clipboard.writeText(this.settingTab.getPluginSettingsAsJsonString());
                    // noinspection ObjectAllocationIgnored
                    new obsidian.Notice("Copy settings of Various Complements");
                }),
            });
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentSettings = yield this.loadData();
            this.settings = _default(DEFAULT_SETTINGS, currentSettings !== null && currentSettings !== void 0 ? currentSettings : {});
        });
    }
    saveSettings(needUpdateTokens = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
            yield this.suggester.updateSettings(this.settings);
            if (needUpdateTokens.currentFile) {
                yield this.suggester.refreshCurrentFileTokens();
            }
            if (needUpdateTokens.currentVault) {
                yield this.suggester.refreshCurrentVaultTokens();
            }
            if (needUpdateTokens.customDictionary) {
                yield this.suggester.refreshCustomDictionaryTokens();
            }
            if (needUpdateTokens.internalLink) {
                yield this.suggester.refreshInternalLinkTokens();
            }
            if (needUpdateTokens.frontMatter) {
                yield this.suggester.refreshFrontMatterTokens();
            }
        });
    }
    addWordToCustomDictionary() {
        const selectedWord = this.appHelper.getSelection();
        const provider = this.suggester.customDictionaryWordProvider;
        const modal = new CustomDictionaryWordAddModal(this.app, provider.editablePaths, selectedWord, this.settings.delimiterToDivideSuggestionsForDisplayFromInsertion, (dictionaryPath, _word) => __awaiter(this, void 0, void 0, function* () {
            // TODO: If support for JSON, this implementation doesn't work correctly
            const word = Object.assign(Object.assign({}, _word), { caretSymbol: this.settings.caretLocationSymbolAfterComplement });
            if (provider.wordByValue[word.value]) {
                // noinspection ObjectAllocationIgnored
                new obsidian.Notice(`⚠ ${word.value} already exists`, 0);
                return;
            }
            yield provider.addWordWithDictionary(word, dictionaryPath);
            // noinspection ObjectAllocationIgnored
            new obsidian.Notice(`Added ${word.value}`);
            modal.close();
        }));
        modal.open();
    }
}

module.exports = VariousComponents;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInNyYy91dGlsL3N0cmluZ3MudHMiLCJzcmMvdG9rZW5pemVyL3Rva2VuaXplcnMvRGVmYXVsdFRva2VuaXplci50cyIsInNyYy90b2tlbml6ZXIvdG9rZW5pemVycy9BcmFiaWNUb2tlbml6ZXIudHMiLCJzcmMvZXh0ZXJuYWwvdGlueS1zZWdtZW50ZXIudHMiLCJzcmMvdG9rZW5pemVyL3Rva2VuaXplcnMvSmFwYW5lc2VUb2tlbml6ZXIudHMiLCJzcmMvdG9rZW5pemVyL3Rva2VuaXplcnMvRW5nbGlzaE9ubHlUb2tlbml6ZXIudHMiLCJub2RlX21vZHVsZXMvcHJldHRpZnktcGlueWluL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoaW5lc2UtdG9rZW5pemVyL3NyYy90cmllLmpzIiwibm9kZV9tb2R1bGVzL2NoaW5lc2UtdG9rZW5pemVyL3NyYy9jZWRpY3QuanMiLCJub2RlX21vZHVsZXMvY2hpbmVzZS10b2tlbml6ZXIvc3JjL21haW4uanMiLCJzcmMvdG9rZW5pemVyL3Rva2VuaXplcnMvQ2hpbmVzZVRva2VuaXplci50cyIsInNyYy90b2tlbml6ZXIvdG9rZW5pemVyLnRzIiwic3JjL3Rva2VuaXplci9Ub2tlbml6ZVN0cmF0ZWd5LnRzIiwic3JjL2FwcC1oZWxwZXIudHMiLCJzcmMvdXRpbC9jb2xsZWN0aW9uLWhlbHBlci50cyIsInNyYy9tb2RlbC9Xb3JkLnRzIiwic3JjL3Byb3ZpZGVyL3N1Z2dlc3Rlci50cyIsInNyYy91dGlsL3BhdGgudHMiLCJzcmMvcHJvdmlkZXIvQ3VzdG9tRGljdGlvbmFyeVdvcmRQcm92aWRlci50cyIsInNyYy9wcm92aWRlci9DdXJyZW50RmlsZVdvcmRQcm92aWRlci50cyIsInNyYy9wcm92aWRlci9JbnRlcm5hbExpbmtXb3JkUHJvdmlkZXIudHMiLCJzcmMvcHJvdmlkZXIvTWF0Y2hTdHJhdGVneS50cyIsInNyYy9vcHRpb24vQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzLnRzIiwic3JjL29wdGlvbi9Db2x1bW5EZWxpbWl0ZXIudHMiLCJzcmMvb3B0aW9uL1NlbGVjdFN1Z2dlc3Rpb25LZXkudHMiLCJzcmMvcHJvdmlkZXIvQ3VycmVudFZhdWx0V29yZFByb3ZpZGVyLnRzIiwic3JjL29wdGlvbi9PcGVuU291cmNlRmlsZUtleXMudHMiLCJzcmMvb3B0aW9uL0Rlc2NyaXB0aW9uT25TdWdnZXN0aW9uLnRzIiwic3JjL3Byb3ZpZGVyL0Zyb250TWF0dGVyV29yZFByb3ZpZGVyLnRzIiwic3JjL3Byb3ZpZGVyL1NwZWNpZmljTWF0Y2hTdHJhdGVneS50cyIsInNyYy9zdG9yYWdlL1NlbGVjdGlvbkhpc3RvcnlTdG9yYWdlLnRzIiwic3JjL3VpL0F1dG9Db21wbGV0ZVN1Z2dlc3QudHMiLCJzcmMvc2V0dGluZy9zZXR0aW5ncy50cyIsInNyYy91aS9Qcm92aWRlclN0YXR1c0Jhci50cyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvaW50ZXJuYWwvaW5kZXgubWpzIiwic3JjL3VpL2NvbXBvbmVudC9PYnNpZGlhbkJ1dHRvbi5zdmVsdGUiLCJub2RlX21vZHVsZXMvc3ZlbHRlLWx1Y2lkZS1pY29ucy9pY29ucy9GaWxlLnN2ZWx0ZSIsInNyYy91aS9jb21wb25lbnQvT2JzaWRpYW5JY29uQnV0dG9uLnN2ZWx0ZSIsInNyYy91aS9jb21wb25lbnQvQ3VzdG9tRGljdGlvbmFyeVdvcmRBZGQuc3ZlbHRlIiwic3JjL3VpL0N1c3RvbURpY3Rpb25hcnlXb3JkQWRkTW9kYWwudHMiLCJub2RlX21vZHVsZXMvdHMtZGVlcG1lcmdlL2Rpc3QvaW5kZXguanMiLCJzcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcclxuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XHJcbiAgICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4oc3RhdGUsIHJlY2VpdmVyKSB7XHJcbiAgICBpZiAocmVjZWl2ZXIgPT09IG51bGwgfHwgKHR5cGVvZiByZWNlaXZlciAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVjZWl2ZXIgIT09IFwiZnVuY3Rpb25cIikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlICdpbicgb3BlcmF0b3Igb24gbm9uLW9iamVjdFwiKTtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyID09PSBzdGF0ZSA6IHN0YXRlLmhhcyhyZWNlaXZlcik7XHJcbn1cclxuIiwiY29uc3QgcmVnRW1vamkgPSBuZXcgUmVnRXhwKFxuICAvW1xcdTI3MDAtXFx1MjdCRl18W1xcdUUwMDAtXFx1RjhGRl18XFx1RDgzQ1tcXHVEQzAwLVxcdURGRkZdfFxcdUQ4M0RbXFx1REMwMC1cXHVERkZGXXxbXFx1MjAxMS1cXHUyNkZGXXxcXHVEODNFW1xcdUREMTAtXFx1RERGRl18W1xcdUZFMEUtXFx1RkUwRl0vLFxuICBcImdcIlxuKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFsbEFscGhhYmV0cyh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIEJvb2xlYW4odGV4dC5tYXRjaCgvXlthLXpBLVowLTlfLV0rJC8pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVFbW9qaSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ0Vtb2ppLCBcIlwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVTcGFjZSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdGV4dC5yZXBsYWNlKC8gL2csIFwiXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlU3BhY2UodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHRleHQucmVwbGFjZSgvIC9nLCBcIiUyMFwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvd2VySW5jbHVkZXMob25lOiBzdHJpbmcsIG90aGVyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9uZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKG90aGVyLnRvTG93ZXJDYXNlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG93ZXJJbmNsdWRlc1dpdGhvdXRTcGFjZShvbmU6IHN0cmluZywgb3RoZXI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbG93ZXJJbmNsdWRlcyhleGNsdWRlU3BhY2Uob25lKSwgZXhjbHVkZVNwYWNlKG90aGVyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb3dlclN0YXJ0c1dpdGgoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGEudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKGIudG9Mb3dlckNhc2UoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb3dlclN0YXJ0c1dpdGhvdXRTcGFjZShvbmU6IHN0cmluZywgb3RoZXI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbG93ZXJTdGFydHNXaXRoKGV4Y2x1ZGVTcGFjZShvbmUpLCBleGNsdWRlU3BhY2Uob3RoZXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemVGaXJzdExldHRlcihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydHNTbWFsbExldHRlck9ubHlGaXJzdChzdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gQm9vbGVhbihzdHIubWF0Y2goL15bQS1aXVteQS1aXSskLykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIHNwbGl0UmF3KFxuICB0ZXh0OiBzdHJpbmcsXG4gIHJlZ2V4cDogUmVnRXhwXG4pOiBJdGVyYWJsZUl0ZXJhdG9yPHN0cmluZz4ge1xuICBsZXQgcHJldmlvdXNJbmRleCA9IDA7XG4gIGZvciAobGV0IHIgb2YgdGV4dC5tYXRjaEFsbChyZWdleHApKSB7XG4gICAgaWYgKHByZXZpb3VzSW5kZXggIT09IHIuaW5kZXghKSB7XG4gICAgICB5aWVsZCB0ZXh0LnNsaWNlKHByZXZpb3VzSW5kZXgsIHIuaW5kZXghKTtcbiAgICB9XG4gICAgeWllbGQgdGV4dFtyLmluZGV4IV07XG4gICAgcHJldmlvdXNJbmRleCA9IHIuaW5kZXghICsgMTtcbiAgfVxuXG4gIGlmIChwcmV2aW91c0luZGV4ICE9PSB0ZXh0Lmxlbmd0aCkge1xuICAgIHlpZWxkIHRleHQuc2xpY2UocHJldmlvdXNJbmRleCwgdGV4dC5sZW5ndGgpO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IFRva2VuaXplciB9IGZyb20gXCIuLi90b2tlbml6ZXJcIjtcbmltcG9ydCB7IHNwbGl0UmF3IH0gZnJvbSBcIi4uLy4uL3V0aWwvc3RyaW5nc1wiO1xuXG5mdW5jdGlvbiBwaWNrVG9rZW5zKGNvbnRlbnQ6IHN0cmluZywgdHJpbVBhdHRlcm46IFJlZ0V4cCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIGNvbnRlbnQuc3BsaXQodHJpbVBhdHRlcm4pLmZpbHRlcigoeCkgPT4geCAhPT0gXCJcIik7XG59XG5cbmV4cG9ydCBjb25zdCBUUklNX0NIQVJfUEFUVEVSTiA9IC9bXFxuXFx0XFxbXFxdJC86PyE9KCk8PlwiJy4sfDsqfiBgXS9nO1xuZXhwb3J0IGNsYXNzIERlZmF1bHRUb2tlbml6ZXIgaW1wbGVtZW50cyBUb2tlbml6ZXIge1xuICB0b2tlbml6ZShjb250ZW50OiBzdHJpbmcsIHJhdz86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHJhd1xuICAgICAgPyBBcnJheS5mcm9tKHNwbGl0UmF3KGNvbnRlbnQsIHRoaXMuZ2V0VHJpbVBhdHRlcm4oKSkpLmZpbHRlcihcbiAgICAgICAgICAoeCkgPT4geCAhPT0gXCIgXCJcbiAgICAgICAgKVxuICAgICAgOiBwaWNrVG9rZW5zKGNvbnRlbnQsIHRoaXMuZ2V0VHJpbVBhdHRlcm4oKSk7XG4gIH1cblxuICByZWN1cnNpdmVUb2tlbml6ZShjb250ZW50OiBzdHJpbmcpOiB7IHdvcmQ6IHN0cmluZzsgb2Zmc2V0OiBudW1iZXIgfVtdIHtcbiAgICBjb25zdCB0cmltSW5kZXhlcyA9IEFycmF5LmZyb20oY29udGVudC5tYXRjaEFsbCh0aGlzLmdldFRyaW1QYXR0ZXJuKCkpKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGEuaW5kZXghIC0gYi5pbmRleCEpXG4gICAgICAubWFwKCh4KSA9PiB4LmluZGV4ISk7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgd29yZDogY29udGVudCwgb2Zmc2V0OiAwIH0sXG4gICAgICAuLi50cmltSW5kZXhlcy5tYXAoKGkpID0+ICh7XG4gICAgICAgIHdvcmQ6IGNvbnRlbnQuc2xpY2UoaSArIDEpLFxuICAgICAgICBvZmZzZXQ6IGkgKyAxLFxuICAgICAgfSkpLFxuICAgIF07XG4gIH1cblxuICBnZXRUcmltUGF0dGVybigpOiBSZWdFeHAge1xuICAgIHJldHVybiBUUklNX0NIQVJfUEFUVEVSTjtcbiAgfVxuXG4gIHNob3VsZElnbm9yZU9uQ3VycmVudChzdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgRGVmYXVsdFRva2VuaXplciB9IGZyb20gXCIuL0RlZmF1bHRUb2tlbml6ZXJcIjtcblxuY29uc3QgQVJBQklDX1RSSU1fQ0hBUl9QQVRURVJOID0gL1tcXG5cXHRcXFtcXF0kLzo/IT0oKTw+XCInLix8Oyp+IGDYjNibXS9nO1xuZXhwb3J0IGNsYXNzIEFyYWJpY1Rva2VuaXplciBleHRlbmRzIERlZmF1bHRUb2tlbml6ZXIge1xuICBnZXRUcmltUGF0dGVybigpOiBSZWdFeHAge1xuICAgIHJldHVybiBBUkFCSUNfVFJJTV9DSEFSX1BBVFRFUk47XG4gIH1cbn1cbiIsIi8vIEB0cy1ub2NoZWNrXG4vLyBCZWNhdXNlIHRoaXMgY29kZSBpcyBvcmlnaW5hbGx5IGphdmFzY3JpcHQgY29kZS5cbi8vIG5vaW5zcGVjdGlvbiBGdW5jdGlvblRvb0xvbmdKUyxGdW5jdGlvbldpdGhNdWx0aXBsZUxvb3BzSlMsRXF1YWxpdHlDb21wYXJpc29uV2l0aENvZXJjaW9uSlMsUG9pbnRsZXNzQm9vbGVhbkV4cHJlc3Npb25KUyxKU0RlY2xhcmF0aW9uc0F0U2NvcGVTdGFydFxuXG4vLyBUaW55U2VnbWVudGVyIDAuMSAtLSBTdXBlciBjb21wYWN0IEphcGFuZXNlIHRva2VuaXplciBpbiBKYXZhc2NyaXB0XG4vLyAoYykgMjAwOCBUYWt1IEt1ZG8gPHRha3VAY2hhc2VuLm9yZz5cbi8vIFRpbnlTZWdtZW50ZXIgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIGEgbmV3IEJTRCBsaWNlbmNlLlxuLy8gRm9yIGRldGFpbHMsIHNlZSBodHRwOi8vY2hhc2VuLm9yZy9+dGFrdS9zb2Z0d2FyZS9UaW55U2VnbWVudGVyL0xJQ0VOQ0UudHh0XG5cbmZ1bmN0aW9uIFRpbnlTZWdtZW50ZXIoKSB7XG4gIHZhciBwYXR0ZXJucyA9IHtcbiAgICBcIlvkuIDkuozkuInlm5vkupTlha3kuIPlhavkuZ3ljYHnmb7ljYPkuIflhITlhYZdXCI6IFwiTVwiLFxuICAgIFwiW+S4gC3pvqDjgIXjgIbjg7Xjg7ZdXCI6IFwiSFwiLFxuICAgIFwiW+OBgS3jgpNdXCI6IFwiSVwiLFxuICAgIFwiW+OCoS3jg7Tjg7zvvbEt776d776e772wXVwiOiBcIktcIixcbiAgICBcIlthLXpBLVrvvYEt772a77yhLe+8ul1cIjogXCJBXCIsXG4gICAgXCJbMC0577yQLe+8mV1cIjogXCJOXCIsXG4gIH07XG4gIHRoaXMuY2hhcnR5cGVfID0gW107XG4gIGZvciAodmFyIGkgaW4gcGF0dGVybnMpIHtcbiAgICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgIHJlZ2V4cC5jb21waWxlKGkpO1xuICAgIHRoaXMuY2hhcnR5cGVfLnB1c2goW3JlZ2V4cCwgcGF0dGVybnNbaV1dKTtcbiAgfVxuXG4gIHRoaXMuQklBU19fID0gLTMzMjtcbiAgdGhpcy5CQzFfXyA9IHsgSEg6IDYsIElJOiAyNDYxLCBLSDogNDA2LCBPSDogLTEzNzggfTtcbiAgdGhpcy5CQzJfXyA9IHtcbiAgICBBQTogLTMyNjcsXG4gICAgQUk6IDI3NDQsXG4gICAgQU46IC04NzgsXG4gICAgSEg6IC00MDcwLFxuICAgIEhNOiAtMTcxMSxcbiAgICBITjogNDAxMixcbiAgICBITzogMzc2MSxcbiAgICBJQTogMTMyNyxcbiAgICBJSDogLTExODQsXG4gICAgSUk6IC0xMzMyLFxuICAgIElLOiAxNzIxLFxuICAgIElPOiA1NDkyLFxuICAgIEtJOiAzODMxLFxuICAgIEtLOiAtODc0MSxcbiAgICBNSDogLTMxMzIsXG4gICAgTUs6IDMzMzQsXG4gICAgT086IC0yOTIwLFxuICB9O1xuICB0aGlzLkJDM19fID0ge1xuICAgIEhIOiA5OTYsXG4gICAgSEk6IDYyNixcbiAgICBISzogLTcyMSxcbiAgICBITjogLTEzMDcsXG4gICAgSE86IC04MzYsXG4gICAgSUg6IC0zMDEsXG4gICAgS0s6IDI3NjIsXG4gICAgTUs6IDEwNzksXG4gICAgTU06IDQwMzQsXG4gICAgT0E6IC0xNjUyLFxuICAgIE9IOiAyNjYsXG4gIH07XG4gIHRoaXMuQlAxX18gPSB7IEJCOiAyOTUsIE9COiAzMDQsIE9POiAtMTI1LCBVQjogMzUyIH07XG4gIHRoaXMuQlAyX18gPSB7IEJPOiA2MCwgT086IC0xNzYyIH07XG4gIHRoaXMuQlExX18gPSB7XG4gICAgQkhIOiAxMTUwLFxuICAgIEJITTogMTUyMSxcbiAgICBCSUk6IC0xMTU4LFxuICAgIEJJTTogODg2LFxuICAgIEJNSDogMTIwOCxcbiAgICBCTkg6IDQ0OSxcbiAgICBCT0g6IC05MSxcbiAgICBCT086IC0yNTk3LFxuICAgIE9ISTogNDUxLFxuICAgIE9JSDogLTI5NixcbiAgICBPS0E6IDE4NTEsXG4gICAgT0tIOiAtMTAyMCxcbiAgICBPS0s6IDkwNCxcbiAgICBPT086IDI5NjUsXG4gIH07XG4gIHRoaXMuQlEyX18gPSB7XG4gICAgQkhIOiAxMTgsXG4gICAgQkhJOiAtMTE1OSxcbiAgICBCSE06IDQ2NixcbiAgICBCSUg6IC05MTksXG4gICAgQktLOiAtMTcyMCxcbiAgICBCS086IDg2NCxcbiAgICBPSEg6IC0xMTM5LFxuICAgIE9ITTogLTE4MSxcbiAgICBPSUg6IDE1MyxcbiAgICBVSEk6IC0xMTQ2LFxuICB9O1xuICB0aGlzLkJRM19fID0ge1xuICAgIEJISDogLTc5MixcbiAgICBCSEk6IDI2NjQsXG4gICAgQklJOiAtMjk5LFxuICAgIEJLSTogNDE5LFxuICAgIEJNSDogOTM3LFxuICAgIEJNTTogODMzNSxcbiAgICBCTk46IDk5OCxcbiAgICBCT0g6IDc3NSxcbiAgICBPSEg6IDIxNzQsXG4gICAgT0hNOiA0MzksXG4gICAgT0lJOiAyODAsXG4gICAgT0tIOiAxNzk4LFxuICAgIE9LSTogLTc5MyxcbiAgICBPS086IC0yMjQyLFxuICAgIE9NSDogLTI0MDIsXG4gICAgT09POiAxMTY5OSxcbiAgfTtcbiAgdGhpcy5CUTRfXyA9IHtcbiAgICBCSEg6IC0zODk1LFxuICAgIEJJSDogMzc2MSxcbiAgICBCSUk6IC00NjU0LFxuICAgIEJJSzogMTM0OCxcbiAgICBCS0s6IC0xODA2LFxuICAgIEJNSTogLTMzODUsXG4gICAgQk9POiAtMTIzOTYsXG4gICAgT0FIOiA5MjYsXG4gICAgT0hIOiAyNjYsXG4gICAgT0hLOiAtMjAzNixcbiAgICBPTk46IC05NzMsXG4gIH07XG4gIHRoaXMuQlcxX18gPSB7XG4gICAgXCIs44GoXCI6IDY2MCxcbiAgICBcIizlkIxcIjogNzI3LFxuICAgIEIx44GCOiAxNDA0LFxuICAgIEIx5ZCMOiA1NDIsXG4gICAgXCLjgIHjgahcIjogNjYwLFxuICAgIFwi44CB5ZCMXCI6IDcyNyxcbiAgICBcIuOAjeOBqFwiOiAxNjgyLFxuICAgIOOBguOBozogMTUwNSxcbiAgICDjgYTjgYY6IDE3NDMsXG4gICAg44GE44GjOiAtMjA1NSxcbiAgICDjgYTjgos6IDY3MixcbiAgICDjgYbjgZc6IC00ODE3LFxuICAgIOOBhuOCkzogNjY1LFxuICAgIOOBi+OCiTogMzQ3MixcbiAgICDjgYzjgok6IDYwMCxcbiAgICDjgZPjgYY6IC03OTAsXG4gICAg44GT44GoOiAyMDgzLFxuICAgIOOBk+OCkzogLTEyNjIsXG4gICAg44GV44KJOiAtNDE0MyxcbiAgICDjgZXjgpM6IDQ1NzMsXG4gICAg44GX44GfOiAyNjQxLFxuICAgIOOBl+OBpjogMTEwNCxcbiAgICDjgZnjgac6IC0zMzk5LFxuICAgIOOBneOBkzogMTk3NyxcbiAgICDjgZ3jgow6IC04NzEsXG4gICAg44Gf44GhOiAxMTIyLFxuICAgIOOBn+OCgTogNjAxLFxuICAgIOOBo+OBnzogMzQ2MyxcbiAgICDjgaTjgYQ6IC04MDIsXG4gICAg44Gm44GEOiA4MDUsXG4gICAg44Gm44GNOiAxMjQ5LFxuICAgIOOBp+OBjTogMTEyNyxcbiAgICDjgafjgZk6IDM0NDUsXG4gICAg44Gn44GvOiA4NDQsXG4gICAg44Go44GEOiAtNDkxNSxcbiAgICDjgajjgb86IDE5MjIsXG4gICAg44Gp44GTOiAzODg3LFxuICAgIOOBquOBhDogNTcxMyxcbiAgICDjgarjgaM6IDMwMTUsXG4gICAg44Gq44GpOiA3Mzc5LFxuICAgIOOBquOCkzogLTExMTMsXG4gICAg44Gr44GXOiAyNDY4LFxuICAgIOOBq+OBrzogMTQ5OCxcbiAgICDjgavjgoI6IDE2NzEsXG4gICAg44Gr5a++OiAtOTEyLFxuICAgIOOBruS4gDogLTUwMSxcbiAgICDjga7kuK06IDc0MSxcbiAgICDjgb7jgZs6IDI0NDgsXG4gICAg44G+44GnOiAxNzExLFxuICAgIOOBvuOBvjogMjYwMCxcbiAgICDjgb7jgos6IC0yMTU1LFxuICAgIOOChOOCgDogLTE5NDcsXG4gICAg44KI44GjOiAtMjU2NSxcbiAgICDjgozjgZ86IDIzNjksXG4gICAg44KM44GnOiAtOTEzLFxuICAgIOOCkuOBlzogMTg2MCxcbiAgICDjgpLopos6IDczMSxcbiAgICDkuqHjgY86IC0xODg2LFxuICAgIOS6rOmDvTogMjU1OCxcbiAgICDlj5bjgoo6IC0yNzg0LFxuICAgIOWkp+OBjTogLTI2MDQsXG4gICAg5aSn6ZiqOiAxNDk3LFxuICAgIOW5s+aWuTogLTIzMTQsXG4gICAg5byV44GNOiAtMTMzNixcbiAgICDml6XmnKw6IC0xOTUsXG4gICAg5pys5b2TOiAtMjQyMyxcbiAgICDmr47ml6U6IC0yMTEzLFxuICAgIOebruaMhzogLTcyNCxcbiAgICDvvKLvvJHjgYI6IDE0MDQsXG4gICAg77yi77yR5ZCMOiA1NDIsXG4gICAgXCLvvaPjgahcIjogMTY4MixcbiAgfTtcbiAgdGhpcy5CVzJfXyA9IHtcbiAgICBcIi4uXCI6IC0xMTgyMixcbiAgICAxMTogLTY2OSxcbiAgICBcIuKAleKAlVwiOiAtNTczMCxcbiAgICBcIuKIkuKIklwiOiAtMTMxNzUsXG4gICAg44GE44GGOiAtMTYwOSxcbiAgICDjgYbjgYs6IDI0OTAsXG4gICAg44GL44GXOiAtMTM1MCxcbiAgICDjgYvjgoI6IC02MDIsXG4gICAg44GL44KJOiAtNzE5NCxcbiAgICDjgYvjgow6IDQ2MTIsXG4gICAg44GM44GEOiA4NTMsXG4gICAg44GM44KJOiAtMzE5OCxcbiAgICDjgY3jgZ86IDE5NDEsXG4gICAg44GP44GqOiAtMTU5NyxcbiAgICDjgZPjgag6IC04MzkyLFxuICAgIOOBk+OBrjogLTQxOTMsXG4gICAg44GV44GbOiA0NTMzLFxuICAgIOOBleOCjDogMTMxNjgsXG4gICAg44GV44KTOiAtMzk3NyxcbiAgICDjgZfjgYQ6IC0xODE5LFxuICAgIOOBl+OBizogLTU0NSxcbiAgICDjgZfjgZ86IDUwNzgsXG4gICAg44GX44GmOiA5NzIsXG4gICAg44GX44GqOiA5MzksXG4gICAg44Gd44GuOiAtMzc0NCxcbiAgICDjgZ/jgYQ6IC0xMjUzLFxuICAgIOOBn+OBnzogLTY2MixcbiAgICDjgZ/jgaA6IC0zODU3LFxuICAgIOOBn+OBoTogLTc4NixcbiAgICDjgZ/jgag6IDEyMjQsXG4gICAg44Gf44GvOiAtOTM5LFxuICAgIOOBo+OBnzogNDU4OSxcbiAgICDjgaPjgaY6IDE2NDcsXG4gICAg44Gj44GoOiAtMjA5NCxcbiAgICDjgabjgYQ6IDYxNDQsXG4gICAg44Gm44GNOiAzNjQwLFxuICAgIOOBpuOBjzogMjU1MSxcbiAgICDjgabjga86IC0zMTEwLFxuICAgIOOBpuOCgjogLTMwNjUsXG4gICAg44Gn44GEOiAyNjY2LFxuICAgIOOBp+OBjTogLTE1MjgsXG4gICAg44Gn44GXOiAtMzgyOCxcbiAgICDjgafjgZk6IC00NzYxLFxuICAgIOOBp+OCgjogLTQyMDMsXG4gICAg44Go44GEOiAxODkwLFxuICAgIOOBqOOBkzogLTE3NDYsXG4gICAg44Go44GoOiAtMjI3OSxcbiAgICDjgajjga46IDcyMCxcbiAgICDjgajjgb86IDUxNjgsXG4gICAg44Go44KCOiAtMzk0MSxcbiAgICDjgarjgYQ6IC0yNDg4LFxuICAgIOOBquOBjDogLTEzMTMsXG4gICAg44Gq44GpOiAtNjUwOSxcbiAgICDjgarjga46IDI2MTQsXG4gICAg44Gq44KTOiAzMDk5LFxuICAgIOOBq+OBijogLTE2MTUsXG4gICAg44Gr44GXOiAyNzQ4LFxuICAgIOOBq+OBqjogMjQ1NCxcbiAgICDjgavjgog6IC03MjM2LFxuICAgIOOBq+WvvjogLTE0OTQzLFxuICAgIOOBq+W+kzogLTQ2ODgsXG4gICAg44Gr6ZaiOiAtMTEzODgsXG4gICAg44Gu44GLOiAyMDkzLFxuICAgIOOBruOBpzogLTcwNTksXG4gICAg44Gu44GrOiAtNjA0MSxcbiAgICDjga7jga46IC02MTI1LFxuICAgIOOBr+OBhDogMTA3MyxcbiAgICDjga/jgYw6IC0xMDMzLFxuICAgIOOBr+OBmjogLTI1MzIsXG4gICAg44Gw44KMOiAxODEzLFxuICAgIOOBvuOBlzogLTEzMTYsXG4gICAg44G+44GnOiAtNjYyMSxcbiAgICDjgb7jgow6IDU0MDksXG4gICAg44KB44GmOiAtMzE1MyxcbiAgICDjgoLjgYQ6IDIyMzAsXG4gICAg44KC44GuOiAtMTA3MTMsXG4gICAg44KJ44GLOiAtOTQ0LFxuICAgIOOCieOBlzogLTE2MTEsXG4gICAg44KJ44GrOiAtMTg5NyxcbiAgICDjgorjgZc6IDY1MSxcbiAgICDjgorjgb46IDE2MjAsXG4gICAg44KM44GfOiA0MjcwLFxuICAgIOOCjOOBpjogODQ5LFxuICAgIOOCjOOBsDogNDExNCxcbiAgICDjgo3jgYY6IDYwNjcsXG4gICAg44KP44KMOiA3OTAxLFxuICAgIOOCkumAmjogLTExODc3LFxuICAgIOOCk+OBoDogNzI4LFxuICAgIOOCk+OBqjogLTQxMTUsXG4gICAg5LiA5Lq6OiA2MDIsXG4gICAg5LiA5pa5OiAtMTM3NSxcbiAgICDkuIDml6U6IDk3MCxcbiAgICDkuIDpg6g6IC0xMDUxLFxuICAgIOS4iuOBjDogLTQ0NzksXG4gICAg5Lya56S+OiAtMTExNixcbiAgICDlh7rjgaY6IDIxNjMsXG4gICAg5YiG44GuOiAtNzc1OCxcbiAgICDlkIzlhZo6IDk3MCxcbiAgICDlkIzml6U6IC05MTMsXG4gICAg5aSn6ZiqOiAtMjQ3MSxcbiAgICDlp5Tlk6E6IC0xMjUwLFxuICAgIOWwkeOBqjogLTEwNTAsXG4gICAg5bm05bqmOiAtODY2OSxcbiAgICDlubTplpM6IC0xNjI2LFxuICAgIOW6nOecjDogLTIzNjMsXG4gICAg5omL5qipOiAtMTk4MixcbiAgICDmlrDogZ46IC00MDY2LFxuICAgIOaXpeaWsDogLTcyMixcbiAgICDml6XmnKw6IC03MDY4LFxuICAgIOaXpeexszogMzM3MixcbiAgICDmm5zml6U6IC02MDEsXG4gICAg5pyd6a6uOiAtMjM1NSxcbiAgICDmnKzkuro6IC0yNjk3LFxuICAgIOadseS6rDogLTE1NDMsXG4gICAg54S244GoOiAtMTM4NCxcbiAgICDnpL7kvJo6IC0xMjc2LFxuICAgIOeri+OBpjogLTk5MCxcbiAgICDnrKzjgas6IC0xNjEyLFxuICAgIOexs+WbvTogLTQyNjgsXG4gICAgXCLvvJHvvJFcIjogLTY2OSxcbiAgfTtcbiAgdGhpcy5CVzNfXyA9IHtcbiAgICDjgYLjgZ86IC0yMTk0LFxuICAgIOOBguOCijogNzE5LFxuICAgIOOBguOCizogMzg0NixcbiAgICBcIuOBhC5cIjogLTExODUsXG4gICAgXCLjgYTjgIJcIjogLTExODUsXG4gICAg44GE44GEOiA1MzA4LFxuICAgIOOBhOOBiDogMjA3OSxcbiAgICDjgYTjgY86IDMwMjksXG4gICAg44GE44GfOiAyMDU2LFxuICAgIOOBhOOBozogMTg4MyxcbiAgICDjgYTjgos6IDU2MDAsXG4gICAg44GE44KPOiAxNTI3LFxuICAgIOOBhuOBoTogMTExNyxcbiAgICDjgYbjgag6IDQ3OTgsXG4gICAg44GI44GoOiAxNDU0LFxuICAgIFwi44GLLlwiOiAyODU3LFxuICAgIFwi44GL44CCXCI6IDI4NTcsXG4gICAg44GL44GROiAtNzQzLFxuICAgIOOBi+OBozogLTQwOTgsXG4gICAg44GL44GrOiAtNjY5LFxuICAgIOOBi+OCiTogNjUyMCxcbiAgICDjgYvjgoo6IC0yNjcwLFxuICAgIFwi44GMLFwiOiAxODE2LFxuICAgIFwi44GM44CBXCI6IDE4MTYsXG4gICAg44GM44GNOiAtNDg1NSxcbiAgICDjgYzjgZE6IC0xMTI3LFxuICAgIOOBjOOBozogLTkxMyxcbiAgICDjgYzjgok6IC00OTc3LFxuICAgIOOBjOOCijogLTIwNjQsXG4gICAg44GN44GfOiAxNjQ1LFxuICAgIOOBkeOBqTogMTM3NCxcbiAgICDjgZPjgag6IDczOTcsXG4gICAg44GT44GuOiAxNTQyLFxuICAgIOOBk+OCjTogLTI3NTcsXG4gICAg44GV44GEOiAtNzE0LFxuICAgIOOBleOCkjogOTc2LFxuICAgIFwi44GXLFwiOiAxNTU3LFxuICAgIFwi44GX44CBXCI6IDE1NTcsXG4gICAg44GX44GEOiAtMzcxNCxcbiAgICDjgZfjgZ86IDM1NjIsXG4gICAg44GX44GmOiAxNDQ5LFxuICAgIOOBl+OBqjogMjYwOCxcbiAgICDjgZfjgb46IDEyMDAsXG4gICAgXCLjgZkuXCI6IC0xMzEwLFxuICAgIFwi44GZ44CCXCI6IC0xMzEwLFxuICAgIOOBmeOCizogNjUyMSxcbiAgICBcIuOBmixcIjogMzQyNixcbiAgICBcIuOBmuOAgVwiOiAzNDI2LFxuICAgIOOBmuOBqzogODQxLFxuICAgIOOBneOBhjogNDI4LFxuICAgIFwi44GfLlwiOiA4ODc1LFxuICAgIFwi44Gf44CCXCI6IDg4NzUsXG4gICAg44Gf44GEOiAtNTk0LFxuICAgIOOBn+OBrjogODEyLFxuICAgIOOBn+OCijogLTExODMsXG4gICAg44Gf44KLOiAtODUzLFxuICAgIFwi44GgLlwiOiA0MDk4LFxuICAgIFwi44Gg44CCXCI6IDQwOTgsXG4gICAg44Gg44GjOiAxMDA0LFxuICAgIOOBo+OBnzogLTQ3NDgsXG4gICAg44Gj44GmOiAzMDAsXG4gICAg44Gm44GEOiA2MjQwLFxuICAgIOOBpuOBijogODU1LFxuICAgIOOBpuOCgjogMzAyLFxuICAgIOOBp+OBmTogMTQzNyxcbiAgICDjgafjgas6IC0xNDgyLFxuICAgIOOBp+OBrzogMjI5NSxcbiAgICDjgajjgYY6IC0xMzg3LFxuICAgIOOBqOOBlzogMjI2NixcbiAgICDjgajjga46IDU0MSxcbiAgICDjgajjgoI6IC0zNTQzLFxuICAgIOOBqeOBhjogNDY2NCxcbiAgICDjgarjgYQ6IDE3OTYsXG4gICAg44Gq44GPOiAtOTAzLFxuICAgIOOBquOBqTogMjEzNSxcbiAgICBcIuOBqyxcIjogLTEwMjEsXG4gICAgXCLjgavjgIFcIjogLTEwMjEsXG4gICAg44Gr44GXOiAxNzcxLFxuICAgIOOBq+OBqjogMTkwNixcbiAgICDjgavjga86IDI2NDQsXG4gICAgXCLjga4sXCI6IC03MjQsXG4gICAgXCLjga7jgIFcIjogLTcyNCxcbiAgICDjga7lrZA6IC0xMDAwLFxuICAgIFwi44GvLFwiOiAxMzM3LFxuICAgIFwi44Gv44CBXCI6IDEzMzcsXG4gICAg44G544GNOiAyMTgxLFxuICAgIOOBvuOBlzogMTExMyxcbiAgICDjgb7jgZk6IDY5NDMsXG4gICAg44G+44GjOiAtMTU0OSxcbiAgICDjgb7jgac6IDYxNTQsXG4gICAg44G+44KMOiAtNzkzLFxuICAgIOOCieOBlzogMTQ3OSxcbiAgICDjgonjgow6IDY4MjAsXG4gICAg44KL44KLOiAzODE4LFxuICAgIFwi44KMLFwiOiA4NTQsXG4gICAgXCLjgozjgIFcIjogODU0LFxuICAgIOOCjOOBnzogMTg1MCxcbiAgICDjgozjgaY6IDEzNzUsXG4gICAg44KM44GwOiAtMzI0NixcbiAgICDjgozjgos6IDEwOTEsXG4gICAg44KP44KMOiAtNjA1LFxuICAgIOOCk+OBoDogNjA2LFxuICAgIOOCk+OBpzogNzk4LFxuICAgIOOCq+aciDogOTkwLFxuICAgIOS8muitsDogODYwLFxuICAgIOWFpeOCijogMTIzMixcbiAgICDlpKfkvJo6IDIyMTcsXG4gICAg5aeL44KBOiAxNjgxLFxuICAgIOW4gjogOTY1LFxuICAgIOaWsOiBnjogLTUwNTUsXG4gICAgXCLml6UsXCI6IDk3NCxcbiAgICBcIuaXpeOAgVwiOiA5NzQsXG4gICAg56S+5LyaOiAyMDI0LFxuICAgIO+9tuaciDogOTkwLFxuICB9O1xuICB0aGlzLlRDMV9fID0ge1xuICAgIEFBQTogMTA5MyxcbiAgICBISEg6IDEwMjksXG4gICAgSEhNOiA1ODAsXG4gICAgSElJOiA5OTgsXG4gICAgSE9IOiAtMzkwLFxuICAgIEhPTTogLTMzMSxcbiAgICBJSEk6IDExNjksXG4gICAgSU9IOiAtMTQyLFxuICAgIElPSTogLTEwMTUsXG4gICAgSU9NOiA0NjcsXG4gICAgTU1IOiAxODcsXG4gICAgT09JOiAtMTgzMixcbiAgfTtcbiAgdGhpcy5UQzJfXyA9IHtcbiAgICBISE86IDIwODgsXG4gICAgSElJOiAtMTAyMyxcbiAgICBITU06IC0xMTU0LFxuICAgIElISTogLTE5NjUsXG4gICAgS0tIOiA3MDMsXG4gICAgT0lJOiAtMjY0OSxcbiAgfTtcbiAgdGhpcy5UQzNfXyA9IHtcbiAgICBBQUE6IC0yOTQsXG4gICAgSEhIOiAzNDYsXG4gICAgSEhJOiAtMzQxLFxuICAgIEhJSTogLTEwODgsXG4gICAgSElLOiA3MzEsXG4gICAgSE9IOiAtMTQ4NixcbiAgICBJSEg6IDEyOCxcbiAgICBJSEk6IC0zMDQxLFxuICAgIElITzogLTE5MzUsXG4gICAgSUlIOiAtODI1LFxuICAgIElJTTogLTEwMzUsXG4gICAgSU9JOiAtNTQyLFxuICAgIEtISDogLTEyMTYsXG4gICAgS0tBOiA0OTEsXG4gICAgS0tIOiAtMTIxNyxcbiAgICBLT0s6IC0xMDA5LFxuICAgIE1ISDogLTI2OTQsXG4gICAgTUhNOiAtNDU3LFxuICAgIE1ITzogMTIzLFxuICAgIE1NSDogLTQ3MSxcbiAgICBOTkg6IC0xNjg5LFxuICAgIE5OTzogNjYyLFxuICAgIE9ITzogLTMzOTMsXG4gIH07XG4gIHRoaXMuVEM0X18gPSB7XG4gICAgSEhIOiAtMjAzLFxuICAgIEhISTogMTM0NCxcbiAgICBISEs6IDM2NSxcbiAgICBISE06IC0xMjIsXG4gICAgSEhOOiAxODIsXG4gICAgSEhPOiA2NjksXG4gICAgSElIOiA4MDQsXG4gICAgSElJOiA2NzksXG4gICAgSE9IOiA0NDYsXG4gICAgSUhIOiA2OTUsXG4gICAgSUhPOiAtMjMyNCxcbiAgICBJSUg6IDMyMSxcbiAgICBJSUk6IDE0OTcsXG4gICAgSUlPOiA2NTYsXG4gICAgSU9POiA1NCxcbiAgICBLQUs6IDQ4NDUsXG4gICAgS0tBOiAzMzg2LFxuICAgIEtLSzogMzA2NSxcbiAgICBNSEg6IC00MDUsXG4gICAgTUhJOiAyMDEsXG4gICAgTU1IOiAtMjQxLFxuICAgIE1NTTogNjYxLFxuICAgIE1PTTogODQxLFxuICB9O1xuICB0aGlzLlRRMV9fID0ge1xuICAgIEJISEg6IC0yMjcsXG4gICAgQkhISTogMzE2LFxuICAgIEJISUg6IC0xMzIsXG4gICAgQklISDogNjAsXG4gICAgQklJSTogMTU5NSxcbiAgICBCTkhIOiAtNzQ0LFxuICAgIEJPSEg6IDIyNSxcbiAgICBCT09POiAtOTA4LFxuICAgIE9BS0s6IDQ4MixcbiAgICBPSEhIOiAyODEsXG4gICAgT0hJSDogMjQ5LFxuICAgIE9JSEk6IDIwMCxcbiAgICBPSUlIOiAtNjgsXG4gIH07XG4gIHRoaXMuVFEyX18gPSB7IEJJSEg6IC0xNDAxLCBCSUlJOiAtMTAzMywgQktBSzogLTU0MywgQk9PTzogLTU1OTEgfTtcbiAgdGhpcy5UUTNfXyA9IHtcbiAgICBCSEhIOiA0NzgsXG4gICAgQkhITTogLTEwNzMsXG4gICAgQkhJSDogMjIyLFxuICAgIEJISUk6IC01MDQsXG4gICAgQklJSDogLTExNixcbiAgICBCSUlJOiAtMTA1LFxuICAgIEJNSEk6IC04NjMsXG4gICAgQk1ITTogLTQ2NCxcbiAgICBCT01IOiA2MjAsXG4gICAgT0hISDogMzQ2LFxuICAgIE9ISEk6IDE3MjksXG4gICAgT0hJSTogOTk3LFxuICAgIE9ITUg6IDQ4MSxcbiAgICBPSUhIOiA2MjMsXG4gICAgT0lJSDogMTM0NCxcbiAgICBPS0FLOiAyNzkyLFxuICAgIE9LSEg6IDU4NyxcbiAgICBPS0tBOiA2NzksXG4gICAgT09ISDogMTEwLFxuICAgIE9PSUk6IC02ODUsXG4gIH07XG4gIHRoaXMuVFE0X18gPSB7XG4gICAgQkhISDogLTcyMSxcbiAgICBCSEhNOiAtMzYwNCxcbiAgICBCSElJOiAtOTY2LFxuICAgIEJJSUg6IC02MDcsXG4gICAgQklJSTogLTIxODEsXG4gICAgT0FBQTogLTI3NjMsXG4gICAgT0FLSzogMTgwLFxuICAgIE9ISEg6IC0yOTQsXG4gICAgT0hISTogMjQ0NixcbiAgICBPSEhPOiA0ODAsXG4gICAgT0hJSDogLTE1NzMsXG4gICAgT0lISDogMTkzNSxcbiAgICBPSUhJOiAtNDkzLFxuICAgIE9JSUg6IDYyNixcbiAgICBPSUlJOiAtNDAwNyxcbiAgICBPS0FLOiAtODE1NixcbiAgfTtcbiAgdGhpcy5UVzFfXyA9IHsg44Gr44Gk44GEOiAtNDY4MSwg5p2x5Lqs6YO9OiAyMDI2IH07XG4gIHRoaXMuVFcyX18gPSB7XG4gICAg44GC44KL56iLOiAtMjA0OSxcbiAgICDjgYTjgaPjgZ86IC0xMjU2LFxuICAgIOOBk+OCjeOBjDogLTI0MzQsXG4gICAg44GX44KH44GGOiAzODczLFxuICAgIOOBneOBruW+jDogLTQ0MzAsXG4gICAg44Gg44Gj44GmOiAtMTA0OSxcbiAgICDjgabjgYTjgZ86IDE4MzMsXG4gICAg44Go44GX44GmOiAtNDY1NyxcbiAgICDjgajjgoLjgas6IC00NTE3LFxuICAgIOOCguOBruOBpzogMTg4MixcbiAgICDkuIDmsJfjgas6IC03OTIsXG4gICAg5Yid44KB44GmOiAtMTUxMixcbiAgICDlkIzmmYLjgas6IC04MDk3LFxuICAgIOWkp+OBjeOBqjogLTEyNTUsXG4gICAg5a++44GX44GmOiAtMjcyMSxcbiAgICDnpL7kvJrlhZo6IC0zMjE2LFxuICB9O1xuICB0aGlzLlRXM19fID0ge1xuICAgIOOBhOOBn+OBoDogLTE3MzQsXG4gICAg44GX44Gm44GEOiAxMzE0LFxuICAgIOOBqOOBl+OBpjogLTQzMTQsXG4gICAg44Gr44Gk44GEOiAtNTQ4MyxcbiAgICDjgavjgajjgaM6IC01OTg5LFxuICAgIOOBq+W9k+OBnzogLTYyNDcsXG4gICAgXCLjga7jgacsXCI6IC03MjcsXG4gICAgXCLjga7jgafjgIFcIjogLTcyNyxcbiAgICDjga7jgoLjga46IC02MDAsXG4gICAg44KM44GL44KJOiAtMzc1MixcbiAgICDljYHkuozmnIg6IC0yMjg3LFxuICB9O1xuICB0aGlzLlRXNF9fID0ge1xuICAgIFwi44GE44GGLlwiOiA4NTc2LFxuICAgIFwi44GE44GG44CCXCI6IDg1NzYsXG4gICAg44GL44KJ44GqOiAtMjM0OCxcbiAgICDjgZfjgabjgYQ6IDI5NTgsXG4gICAgXCLjgZ/jgYwsXCI6IDE1MTYsXG4gICAgXCLjgZ/jgYzjgIFcIjogMTUxNixcbiAgICDjgabjgYTjgos6IDE1MzgsXG4gICAg44Go44GE44GGOiAxMzQ5LFxuICAgIOOBvuOBl+OBnzogNTU0MyxcbiAgICDjgb7jgZvjgpM6IDEwOTcsXG4gICAg44KI44GG44GoOiAtNDI1OCxcbiAgICDjgojjgovjgag6IDU4NjUsXG4gIH07XG4gIHRoaXMuVUMxX18gPSB7IEE6IDQ4NCwgSzogOTMsIE06IDY0NSwgTzogLTUwNSB9O1xuICB0aGlzLlVDMl9fID0geyBBOiA4MTksIEg6IDEwNTksIEk6IDQwOSwgTTogMzk4NywgTjogNTc3NSwgTzogNjQ2IH07XG4gIHRoaXMuVUMzX18gPSB7IEE6IC0xMzcwLCBJOiAyMzExIH07XG4gIHRoaXMuVUM0X18gPSB7XG4gICAgQTogLTI2NDMsXG4gICAgSDogMTgwOSxcbiAgICBJOiAtMTAzMixcbiAgICBLOiAtMzQ1MCxcbiAgICBNOiAzNTY1LFxuICAgIE46IDM4NzYsXG4gICAgTzogNjY0NixcbiAgfTtcbiAgdGhpcy5VQzVfXyA9IHsgSDogMzEzLCBJOiAtMTIzOCwgSzogLTc5OSwgTTogNTM5LCBPOiAtODMxIH07XG4gIHRoaXMuVUM2X18gPSB7IEg6IC01MDYsIEk6IC0yNTMsIEs6IDg3LCBNOiAyNDcsIE86IC0zODcgfTtcbiAgdGhpcy5VUDFfXyA9IHsgTzogLTIxNCB9O1xuICB0aGlzLlVQMl9fID0geyBCOiA2OSwgTzogOTM1IH07XG4gIHRoaXMuVVAzX18gPSB7IEI6IDE4OSB9O1xuICB0aGlzLlVRMV9fID0ge1xuICAgIEJIOiAyMSxcbiAgICBCSTogLTEyLFxuICAgIEJLOiAtOTksXG4gICAgQk46IDE0MixcbiAgICBCTzogLTU2LFxuICAgIE9IOiAtOTUsXG4gICAgT0k6IDQ3NyxcbiAgICBPSzogNDEwLFxuICAgIE9POiAtMjQyMixcbiAgfTtcbiAgdGhpcy5VUTJfXyA9IHsgQkg6IDIxNiwgQkk6IDExMywgT0s6IDE3NTkgfTtcbiAgdGhpcy5VUTNfXyA9IHtcbiAgICBCQTogLTQ3OSxcbiAgICBCSDogNDIsXG4gICAgQkk6IDE5MTMsXG4gICAgQks6IC03MTk4LFxuICAgIEJNOiAzMTYwLFxuICAgIEJOOiA2NDI3LFxuICAgIEJPOiAxNDc2MSxcbiAgICBPSTogLTgyNyxcbiAgICBPTjogLTMyMTIsXG4gIH07XG4gIHRoaXMuVVcxX18gPSB7XG4gICAgXCIsXCI6IDE1NixcbiAgICBcIuOAgVwiOiAxNTYsXG4gICAgXCLjgIxcIjogLTQ2MyxcbiAgICDjgYI6IC05NDEsXG4gICAg44GGOiAtMTI3LFxuICAgIOOBjDogLTU1MyxcbiAgICDjgY06IDEyMSxcbiAgICDjgZM6IDUwNSxcbiAgICDjgac6IC0yMDEsXG4gICAg44GoOiAtNTQ3LFxuICAgIOOBqTogLTEyMyxcbiAgICDjgas6IC03ODksXG4gICAg44GuOiAtMTg1LFxuICAgIOOBrzogLTg0NyxcbiAgICDjgoI6IC00NjYsXG4gICAg44KEOiAtNDcwLFxuICAgIOOCiDogMTgyLFxuICAgIOOCiTogLTI5MixcbiAgICDjgoo6IDIwOCxcbiAgICDjgow6IDE2OSxcbiAgICDjgpI6IC00NDYsXG4gICAg44KTOiAtMTM3LFxuICAgIFwi44O7XCI6IC0xMzUsXG4gICAg5Li7OiAtNDAyLFxuICAgIOS6rDogLTI2OCxcbiAgICDljLo6IC05MTIsXG4gICAg5Y2IOiA4NzEsXG4gICAg5Zu9OiAtNDYwLFxuICAgIOWkpzogNTYxLFxuICAgIOWnlDogNzI5LFxuICAgIOW4gjogLTQxMSxcbiAgICDml6U6IC0xNDEsXG4gICAg55CGOiAzNjEsXG4gICAg55SfOiAtNDA4LFxuICAgIOecjDogLTM4NixcbiAgICDpg706IC03MTgsXG4gICAgXCLvvaJcIjogLTQ2MyxcbiAgICBcIu+9pVwiOiAtMTM1LFxuICB9O1xuICB0aGlzLlVXMl9fID0ge1xuICAgIFwiLFwiOiAtODI5LFxuICAgIFwi44CBXCI6IC04MjksXG4gICAg44CHOiA4OTIsXG4gICAgXCLjgIxcIjogLTY0NSxcbiAgICBcIuOAjVwiOiAzMTQ1LFxuICAgIOOBgjogLTUzOCxcbiAgICDjgYQ6IDUwNSxcbiAgICDjgYY6IDEzNCxcbiAgICDjgYo6IC01MDIsXG4gICAg44GLOiAxNDU0LFxuICAgIOOBjDogLTg1NixcbiAgICDjgY86IC00MTIsXG4gICAg44GTOiAxMTQxLFxuICAgIOOBlTogODc4LFxuICAgIOOBljogNTQwLFxuICAgIOOBlzogMTUyOSxcbiAgICDjgZk6IC02NzUsXG4gICAg44GbOiAzMDAsXG4gICAg44GdOiAtMTAxMSxcbiAgICDjgZ86IDE4OCxcbiAgICDjgaA6IDE4MzcsXG4gICAg44GkOiAtOTQ5LFxuICAgIOOBpjogLTI5MSxcbiAgICDjgac6IC0yNjgsXG4gICAg44GoOiAtOTgxLFxuICAgIOOBqTogMTI3MyxcbiAgICDjgao6IDEwNjMsXG4gICAg44GrOiAtMTc2NCxcbiAgICDjga46IDEzMCxcbiAgICDjga86IC00MDksXG4gICAg44GyOiAtMTI3MyxcbiAgICDjgbk6IDEyNjEsXG4gICAg44G+OiA2MDAsXG4gICAg44KCOiAtMTI2MyxcbiAgICDjgoQ6IC00MDIsXG4gICAg44KIOiAxNjM5LFxuICAgIOOCijogLTU3OSxcbiAgICDjgos6IC02OTQsXG4gICAg44KMOiA1NzEsXG4gICAg44KSOiAtMjUxNixcbiAgICDjgpM6IDIwOTUsXG4gICAg44KiOiAtNTg3LFxuICAgIOOCqzogMzA2LFxuICAgIOOCrTogNTY4LFxuICAgIOODgzogODMxLFxuICAgIOS4iTogLTc1OCxcbiAgICDkuI06IC0yMTUwLFxuICAgIOS4ljogLTMwMixcbiAgICDkuK06IC05NjgsXG4gICAg5Li7OiAtODYxLFxuICAgIOS6izogNDkyLFxuICAgIOS6ujogLTEyMyxcbiAgICDkvJo6IDk3OCxcbiAgICDkv506IDM2MixcbiAgICDlhaU6IDU0OCxcbiAgICDliJ06IC0zMDI1LFxuICAgIOWJrzogLTE1NjYsXG4gICAg5YyXOiAtMzQxNCxcbiAgICDljLo6IC00MjIsXG4gICAg5aSnOiAtMTc2OSxcbiAgICDlpKk6IC04NjUsXG4gICAg5aSqOiAtNDgzLFxuICAgIOWtkDogLTE1MTksXG4gICAg5a2mOiA3NjAsXG4gICAg5a6fOiAxMDIzLFxuICAgIOWwjzogLTIwMDksXG4gICAg5biCOiAtODEzLFxuICAgIOW5tDogLTEwNjAsXG4gICAg5by3OiAxMDY3LFxuICAgIOaJizogLTE1MTksXG4gICAg5o+6OiAtMTAzMyxcbiAgICDmlL86IDE1MjIsXG4gICAg5paHOiAtMTM1NSxcbiAgICDmlrA6IC0xNjgyLFxuICAgIOaXpTogLTE4MTUsXG4gICAg5piOOiAtMTQ2MixcbiAgICDmnIA6IC02MzAsXG4gICAg5pydOiAtMTg0MyxcbiAgICDmnKw6IC0xNjUwLFxuICAgIOadsTogLTkzMSxcbiAgICDmnpw6IC02NjUsXG4gICAg5qyhOiAtMjM3OCxcbiAgICDmsJE6IC0xODAsXG4gICAg5rCXOiAtMTc0MCxcbiAgICDnkIY6IDc1MixcbiAgICDnmbo6IDUyOSxcbiAgICDnm646IC0xNTg0LFxuICAgIOebuDogLTI0MixcbiAgICDnnIw6IC0xMTY1LFxuICAgIOerizogLTc2MyxcbiAgICDnrKw6IDgxMCxcbiAgICDnsbM6IDUwOSxcbiAgICDoh6o6IC0xMzUzLFxuICAgIOihjDogODM4LFxuICAgIOilvzogLTc0NCxcbiAgICDopos6IC0zODc0LFxuICAgIOiqvzogMTAxMCxcbiAgICDorbA6IDExOTgsXG4gICAg6L68OiAzMDQxLFxuICAgIOmWizogMTc1OCxcbiAgICDplpM6IC0xMjU3LFxuICAgIFwi772iXCI6IC02NDUsXG4gICAgXCLvvaNcIjogMzE0NSxcbiAgICDvva86IDgzMSxcbiAgICDvvbE6IC01ODcsXG4gICAg7722OiAzMDYsXG4gICAg7723OiA1NjgsXG4gIH07XG4gIHRoaXMuVVczX18gPSB7XG4gICAgXCIsXCI6IDQ4ODksXG4gICAgMTogLTgwMCxcbiAgICBcIuKIklwiOiAtMTcyMyxcbiAgICBcIuOAgVwiOiA0ODg5LFxuICAgIOOAhTogLTIzMTEsXG4gICAg44CHOiA1ODI3LFxuICAgIFwi44CNXCI6IDI2NzAsXG4gICAgXCLjgJNcIjogLTM1NzMsXG4gICAg44GCOiAtMjY5NixcbiAgICDjgYQ6IDEwMDYsXG4gICAg44GGOiAyMzQyLFxuICAgIOOBiDogMTk4MyxcbiAgICDjgYo6IC00ODY0LFxuICAgIOOBizogLTExNjMsXG4gICAg44GMOiAzMjcxLFxuICAgIOOBjzogMTAwNCxcbiAgICDjgZE6IDM4OCxcbiAgICDjgZI6IDQwMSxcbiAgICDjgZM6IC0zNTUyLFxuICAgIOOBlDogLTMxMTYsXG4gICAg44GVOiAtMTA1OCxcbiAgICDjgZc6IC0zOTUsXG4gICAg44GZOiA1ODQsXG4gICAg44GbOiAzNjg1LFxuICAgIOOBnTogLTUyMjgsXG4gICAg44GfOiA4NDIsXG4gICAg44GhOiAtNTIxLFxuICAgIOOBozogLTE0NDQsXG4gICAg44GkOiAtMTA4MSxcbiAgICDjgaY6IDYxNjcsXG4gICAg44GnOiAyMzE4LFxuICAgIOOBqDogMTY5MSxcbiAgICDjgak6IC04OTksXG4gICAg44GqOiAtMjc4OCxcbiAgICDjgas6IDI3NDUsXG4gICAg44GuOiA0MDU2LFxuICAgIOOBrzogNDU1NSxcbiAgICDjgbI6IC0yMTcxLFxuICAgIOOBtTogLTE3OTgsXG4gICAg44G4OiAxMTk5LFxuICAgIOOBuzogLTU1MTYsXG4gICAg44G+OiAtNDM4NCxcbiAgICDjgb86IC0xMjAsXG4gICAg44KBOiAxMjA1LFxuICAgIOOCgjogMjMyMyxcbiAgICDjgoQ6IC03ODgsXG4gICAg44KIOiAtMjAyLFxuICAgIOOCiTogNzI3LFxuICAgIOOCijogNjQ5LFxuICAgIOOCizogNTkwNSxcbiAgICDjgow6IDI3NzMsXG4gICAg44KPOiAtMTIwNyxcbiAgICDjgpI6IDY2MjAsXG4gICAg44KTOiAtNTE4LFxuICAgIOOCojogNTUxLFxuICAgIOOCsDogMTMxOSxcbiAgICDjgrk6IDg3NCxcbiAgICDjg4M6IC0xMzUwLFxuICAgIOODiDogNTIxLFxuICAgIOODoDogMTEwOSxcbiAgICDjg6s6IDE1OTEsXG4gICAg44OtOiAyMjAxLFxuICAgIOODszogMjc4LFxuICAgIFwi44O7XCI6IC0zNzk0LFxuICAgIOS4gDogLTE2MTksXG4gICAg5LiLOiAtMTc1OSxcbiAgICDkuJY6IC0yMDg3LFxuICAgIOS4oTogMzgxNSxcbiAgICDkuK06IDY1MyxcbiAgICDkuLs6IC03NTgsXG4gICAg5LqIOiAtMTE5MyxcbiAgICDkuow6IDk3NCxcbiAgICDkuro6IDI3NDIsXG4gICAg5LuKOiA3OTIsXG4gICAg5LuWOiAxODg5LFxuICAgIOS7pTogLTEzNjgsXG4gICAg5L2OOiA4MTEsXG4gICAg5L2VOiA0MjY1LFxuICAgIOS9nDogLTM2MSxcbiAgICDkv506IC0yNDM5LFxuICAgIOWFgzogNDg1OCxcbiAgICDlhZo6IDM1OTMsXG4gICAg5YWoOiAxNTc0LFxuICAgIOWFrDogLTMwMzAsXG4gICAg5YWtOiA3NTUsXG4gICAg5YWxOiAtMTg4MCxcbiAgICDlhoY6IDU4MDcsXG4gICAg5YaNOiAzMDk1LFxuICAgIOWIhjogNDU3LFxuICAgIOWInTogMjQ3NSxcbiAgICDliKU6IDExMjksXG4gICAg5YmNOiAyMjg2LFxuICAgIOWJrzogNDQzNyxcbiAgICDlips6IDM2NSxcbiAgICDli5U6IC05NDksXG4gICAg5YuZOiAtMTg3MixcbiAgICDljJY6IDEzMjcsXG4gICAg5YyXOiAtMTAzOCxcbiAgICDljLo6IDQ2NDYsXG4gICAg5Y2DOiAtMjMwOSxcbiAgICDljYg6IC03ODMsXG4gICAg5Y2UOiAtMTAwNixcbiAgICDlj6M6IDQ4MyxcbiAgICDlj7M6IDEyMzMsXG4gICAg5ZCEOiAzNTg4LFxuICAgIOWQiDogLTI0MSxcbiAgICDlkIw6IDM5MDYsXG4gICAg5ZKMOiAtODM3LFxuICAgIOWToTogNDUxMyxcbiAgICDlm706IDY0MixcbiAgICDlnos6IDEzODksXG4gICAg5aC0OiAxMjE5LFxuICAgIOWkljogLTI0MSxcbiAgICDlprs6IDIwMTYsXG4gICAg5a2mOiAtMTM1NixcbiAgICDlrok6IC00MjMsXG4gICAg5a6fOiAtMTAwOCxcbiAgICDlrrY6IDEwNzgsXG4gICAg5bCPOiAtNTEzLFxuICAgIOWwkTogLTMxMDIsXG4gICAg5beeOiAxMTU1LFxuICAgIOW4gjogMzE5NyxcbiAgICDlubM6IC0xODA0LFxuICAgIOW5tDogMjQxNixcbiAgICDluoM6IC0xMDMwLFxuICAgIOW6nDogMTYwNSxcbiAgICDluqY6IDE0NTIsXG4gICAg5bu6OiAtMjM1MixcbiAgICDlvZM6IC0zODg1LFxuICAgIOW+lzogMTkwNSxcbiAgICDmgJ06IC0xMjkxLFxuICAgIOaApzogMTgyMixcbiAgICDmiLg6IC00ODgsXG4gICAg5oyHOiAtMzk3MyxcbiAgICDmlL86IC0yMDEzLFxuICAgIOaVmTogLTE0NzksXG4gICAg5pWwOiAzMjIyLFxuICAgIOaWhzogLTE0ODksXG4gICAg5pawOiAxNzY0LFxuICAgIOaXpTogMjA5OSxcbiAgICDml6c6IDU3OTIsXG4gICAg5pioOiAtNjYxLFxuICAgIOaZgjogLTEyNDgsXG4gICAg5pucOiAtOTUxLFxuICAgIOacgDogLTkzNyxcbiAgICDmnIg6IDQxMjUsXG4gICAg5pyfOiAzNjAsXG4gICAg5p2OOiAzMDk0LFxuICAgIOadkTogMzY0LFxuICAgIOadsTogLTgwNSxcbiAgICDmoLg6IDUxNTYsXG4gICAg5qOuOiAyNDM4LFxuICAgIOalrTogNDg0LFxuICAgIOawjzogMjYxMyxcbiAgICDmsJE6IC0xNjk0LFxuICAgIOaxujogLTEwNzMsXG4gICAg5rOVOiAxODY4LFxuICAgIOa1tzogLTQ5NSxcbiAgICDnhKE6IDk3OSxcbiAgICDniak6IDQ2MSxcbiAgICDnibk6IC0zODUwLFxuICAgIOeUnzogLTI3MyxcbiAgICDnlKg6IDkxNCxcbiAgICDnlLo6IDEyMTUsXG4gICAg55qEOiA3MzEzLFxuICAgIOebtDogLTE4MzUsXG4gICAg55yBOiA3OTIsXG4gICAg55yMOiA2MjkzLFxuICAgIOefpTogLTE1MjgsXG4gICAg56eBOiA0MjMxLFxuICAgIOeojjogNDAxLFxuICAgIOerizogLTk2MCxcbiAgICDnrKw6IDEyMDEsXG4gICAg57GzOiA3NzY3LFxuICAgIOezuzogMzA2NixcbiAgICDntIQ6IDM2NjMsXG4gICAg57SaOiAxMzg0LFxuICAgIOe1sTogLTQyMjksXG4gICAg57ePOiAxMTYzLFxuICAgIOe3mjogMTI1NSxcbiAgICDogIU6IDY0NTcsXG4gICAg6IO9OiA3MjUsXG4gICAg6IeqOiAtMjg2OSxcbiAgICDoi7E6IDc4NSxcbiAgICDopos6IDEwNDQsXG4gICAg6Kq/OiAtNTYyLFxuICAgIOiyoTogLTczMyxcbiAgICDosrs6IDE3NzcsXG4gICAg6LuKOiAxODM1LFxuICAgIOi7jTogMTM3NSxcbiAgICDovrw6IC0xNTA0LFxuICAgIOmAmjogLTExMzYsXG4gICAg6YG4OiAtNjgxLFxuICAgIOmDjjogMTAyNixcbiAgICDpg6E6IDQ0MDQsXG4gICAg6YOoOiAxMjAwLFxuICAgIOmHkTogMjE2MyxcbiAgICDplbc6IDQyMSxcbiAgICDplos6IC0xNDMyLFxuICAgIOmWkzogMTMwMixcbiAgICDplqI6IC0xMjgyLFxuICAgIOmbqDogMjAwOSxcbiAgICDpm7s6IC0xMDQ1LFxuICAgIOmdnjogMjA2NixcbiAgICDpp4U6IDE2MjAsXG4gICAgXCLvvJFcIjogLTgwMCxcbiAgICBcIu+9o1wiOiAyNjcwLFxuICAgIFwi772lXCI6IC0zNzk0LFxuICAgIO+9rzogLTEzNTAsXG4gICAg772xOiA1NTEsXG4gICAg7724776eOiAxMzE5LFxuICAgIO+9vTogODc0LFxuICAgIO++hDogNTIxLFxuICAgIO++kTogMTEwOSxcbiAgICDvvpk6IDE1OTEsXG4gICAg776bOiAyMjAxLFxuICAgIO++nTogMjc4LFxuICB9O1xuICB0aGlzLlVXNF9fID0ge1xuICAgIFwiLFwiOiAzOTMwLFxuICAgIFwiLlwiOiAzNTA4LFxuICAgIFwi4oCVXCI6IC00ODQxLFxuICAgIFwi44CBXCI6IDM5MzAsXG4gICAgXCLjgIJcIjogMzUwOCxcbiAgICDjgIc6IDQ5OTksXG4gICAgXCLjgIxcIjogMTg5NSxcbiAgICBcIuOAjVwiOiAzNzk4LFxuICAgIFwi44CTXCI6IC01MTU2LFxuICAgIOOBgjogNDc1MixcbiAgICDjgYQ6IC0zNDM1LFxuICAgIOOBhjogLTY0MCxcbiAgICDjgYg6IC0yNTE0LFxuICAgIOOBijogMjQwNSxcbiAgICDjgYs6IDUzMCxcbiAgICDjgYw6IDYwMDYsXG4gICAg44GNOiAtNDQ4MixcbiAgICDjgY46IC0zODIxLFxuICAgIOOBjzogLTM3ODgsXG4gICAg44GROiAtNDM3NixcbiAgICDjgZI6IC00NzM0LFxuICAgIOOBkzogMjI1NSxcbiAgICDjgZQ6IDE5NzksXG4gICAg44GVOiAyODY0LFxuICAgIOOBlzogLTg0MyxcbiAgICDjgZg6IC0yNTA2LFxuICAgIOOBmTogLTczMSxcbiAgICDjgZo6IDEyNTEsXG4gICAg44GbOiAxODEsXG4gICAg44GdOiA0MDkxLFxuICAgIOOBnzogNTAzNCxcbiAgICDjgaA6IDU0MDgsXG4gICAg44GhOiAtMzY1NCxcbiAgICDjgaM6IC01ODgyLFxuICAgIOOBpDogLTE2NTksXG4gICAg44GmOiAzOTk0LFxuICAgIOOBpzogNzQxMCxcbiAgICDjgag6IDQ1NDcsXG4gICAg44GqOiA1NDMzLFxuICAgIOOBqzogNjQ5OSxcbiAgICDjgaw6IDE4NTMsXG4gICAg44GtOiAxNDEzLFxuICAgIOOBrjogNzM5NixcbiAgICDjga86IDg1NzgsXG4gICAg44GwOiAxOTQwLFxuICAgIOOBsjogNDI0OSxcbiAgICDjgbM6IC00MTM0LFxuICAgIOOBtTogMTM0NSxcbiAgICDjgbg6IDY2NjUsXG4gICAg44G5OiAtNzQ0LFxuICAgIOOBuzogMTQ2NCxcbiAgICDjgb46IDEwNTEsXG4gICAg44G/OiAtMjA4MixcbiAgICDjgoA6IC04ODIsXG4gICAg44KBOiAtNTA0NixcbiAgICDjgoI6IDQxNjksXG4gICAg44KDOiAtMjY2NixcbiAgICDjgoQ6IDI3OTUsXG4gICAg44KHOiAtMTU0NCxcbiAgICDjgog6IDMzNTEsXG4gICAg44KJOiAtMjkyMixcbiAgICDjgoo6IC05NzI2LFxuICAgIOOCizogLTE0ODk2LFxuICAgIOOCjDogLTI2MTMsXG4gICAg44KNOiAtNDU3MCxcbiAgICDjgo86IC0xNzgzLFxuICAgIOOCkjogMTMxNTAsXG4gICAg44KTOiAtMjM1MixcbiAgICDjgqs6IDIxNDUsXG4gICAg44KzOiAxNzg5LFxuICAgIOOCuzogMTI4NyxcbiAgICDjg4M6IC03MjQsXG4gICAg44OIOiAtNDAzLFxuICAgIOODoTogLTE2MzUsXG4gICAg44OpOiAtODgxLFxuICAgIOODqjogLTU0MSxcbiAgICDjg6s6IC04NTYsXG4gICAg44OzOiAtMzYzNyxcbiAgICBcIuODu1wiOiAtNDM3MSxcbiAgICDjg7w6IC0xMTg3MCxcbiAgICDkuIA6IC0yMDY5LFxuICAgIOS4rTogMjIxMCxcbiAgICDkuog6IDc4MixcbiAgICDkuos6IC0xOTAsXG4gICAg5LqVOiAtMTc2OCxcbiAgICDkuro6IDEwMzYsXG4gICAg5LulOiA1NDQsXG4gICAg5LyaOiA5NTAsXG4gICAg5L2TOiAtMTI4NixcbiAgICDkvZw6IDUzMCxcbiAgICDlgbQ6IDQyOTIsXG4gICAg5YWIOiA2MDEsXG4gICAg5YWaOiAtMjAwNixcbiAgICDlhbE6IC0xMjEyLFxuICAgIOWGhTogNTg0LFxuICAgIOWGhjogNzg4LFxuICAgIOWInTogMTM0NyxcbiAgICDliY06IDE2MjMsXG4gICAg5YmvOiAzODc5LFxuICAgIOWKmzogLTMwMixcbiAgICDli5U6IC03NDAsXG4gICAg5YuZOiAtMjcxNSxcbiAgICDljJY6IDc3NixcbiAgICDljLo6IDQ1MTcsXG4gICAg5Y2UOiAxMDEzLFxuICAgIOWPgjogMTU1NSxcbiAgICDlkIg6IC0xODM0LFxuICAgIOWSjDogLTY4MSxcbiAgICDlk6E6IC05MTAsXG4gICAg5ZmoOiAtODUxLFxuICAgIOWbnjogMTUwMCxcbiAgICDlm706IC02MTksXG4gICAg5ZySOiAtMTIwMCxcbiAgICDlnLA6IDg2NixcbiAgICDloLQ6IC0xNDEwLFxuICAgIOWhgTogLTIwOTQsXG4gICAg5aOrOiAtMTQxMyxcbiAgICDlpJo6IDEwNjcsXG4gICAg5aSnOiA1NzEsXG4gICAg5a2QOiAtNDgwMixcbiAgICDlraY6IC0xMzk3LFxuICAgIOWumjogLTEwNTcsXG4gICAg5a+6OiAtODA5LFxuICAgIOWwjzogMTkxMCxcbiAgICDlsYs6IC0xMzI4LFxuICAgIOWxsTogLTE1MDAsXG4gICAg5bO2OiAtMjA1NixcbiAgICDlt506IC0yNjY3LFxuICAgIOW4gjogMjc3MSxcbiAgICDlubQ6IDM3NCxcbiAgICDluoE6IC00NTU2LFxuICAgIOW+jDogNDU2LFxuICAgIOaApzogNTUzLFxuICAgIOaEnzogOTE2LFxuICAgIOaJgDogLTE1NjYsXG4gICAg5pSvOiA4NTYsXG4gICAg5pS5OiA3ODcsXG4gICAg5pS/OiAyMTgyLFxuICAgIOaVmTogNzA0LFxuICAgIOaWhzogNTIyLFxuICAgIOaWuTogLTg1NixcbiAgICDml6U6IDE3OTgsXG4gICAg5pmCOiAxODI5LFxuICAgIOacgDogODQ1LFxuICAgIOaciDogLTkwNjYsXG4gICAg5pyoOiAtNDg1LFxuICAgIOadpTogLTQ0MixcbiAgICDmoKE6IC0zNjAsXG4gICAg5qWtOiAtMTA0MyxcbiAgICDmsI86IDUzODgsXG4gICAg5rCROiAtMjcxNixcbiAgICDmsJc6IC05MTAsXG4gICAg5rKiOiAtOTM5LFxuICAgIOa4iDogLTU0MyxcbiAgICDniak6IC03MzUsXG4gICAg546HOiA2NzIsXG4gICAg55CDOiAtMTI2NyxcbiAgICDnlJ86IC0xMjg2LFxuICAgIOeUozogLTExMDEsXG4gICAg55SwOiAtMjkwMCxcbiAgICDnlLo6IDE4MjYsXG4gICAg55qEOiAyNTg2LFxuICAgIOebrjogOTIyLFxuICAgIOecgTogLTM0ODUsXG4gICAg55yMOiAyOTk3LFxuICAgIOepujogLTg2NyxcbiAgICDnq4s6IC0yMTEyLFxuICAgIOesrDogNzg4LFxuICAgIOexszogMjkzNyxcbiAgICDns7s6IDc4NixcbiAgICDntIQ6IDIxNzEsXG4gICAg57WMOiAxMTQ2LFxuICAgIOe1sTogLTExNjksXG4gICAg57ePOiA5NDAsXG4gICAg57eaOiAtOTk0LFxuICAgIOe9sjogNzQ5LFxuICAgIOiAhTogMjE0NSxcbiAgICDog706IC03MzAsXG4gICAg6IisOiAtODUyLFxuICAgIOihjDogLTc5MixcbiAgICDopo86IDc5MixcbiAgICDoraY6IC0xMTg0LFxuICAgIOitsDogLTI0NCxcbiAgICDosLc6IC0xMDAwLFxuICAgIOiznjogNzMwLFxuICAgIOi7ijogLTE0ODEsXG4gICAg6LuNOiAxMTU4LFxuICAgIOi8qjogLTE0MzMsXG4gICAg6L68OiAtMzM3MCxcbiAgICDov5E6IDkyOSxcbiAgICDpgZM6IC0xMjkxLFxuICAgIOmBuDogMjU5NixcbiAgICDpg446IC00ODY2LFxuICAgIOmDvTogMTE5MixcbiAgICDph446IC0xMTAwLFxuICAgIOmKgDogLTIyMTMsXG4gICAg6ZW3OiAzNTcsXG4gICAg6ZaTOiAtMjM0NCxcbiAgICDpmaI6IC0yMjk3LFxuICAgIOmamzogLTI2MDQsXG4gICAg6Zu7OiAtODc4LFxuICAgIOmgmDogLTE2NTksXG4gICAg6aGMOiAtNzkyLFxuICAgIOmkqDogLTE5ODQsXG4gICAg6aaWOiAxNzQ5LFxuICAgIOmrmDogMjEyMCxcbiAgICBcIu+9olwiOiAxODk1LFxuICAgIFwi772jXCI6IDM3OTgsXG4gICAgXCLvvaVcIjogLTQzNzEsXG4gICAg772vOiAtNzI0LFxuICAgIO+9sDogLTExODcwLFxuICAgIO+9tjogMjE0NSxcbiAgICDvvbo6IDE3ODksXG4gICAg772+OiAxMjg3LFxuICAgIO++hDogLTQwMyxcbiAgICDvvpI6IC0xNjM1LFxuICAgIO++lzogLTg4MSxcbiAgICDvvpg6IC01NDEsXG4gICAg776ZOiAtODU2LFxuICAgIO++nTogLTM2MzcsXG4gIH07XG4gIHRoaXMuVVc1X18gPSB7XG4gICAgXCIsXCI6IDQ2NSxcbiAgICBcIi5cIjogLTI5OSxcbiAgICAxOiAtNTE0LFxuICAgIEUyOiAtMzI3NjgsXG4gICAgXCJdXCI6IC0yNzYyLFxuICAgIFwi44CBXCI6IDQ2NSxcbiAgICBcIuOAglwiOiAtMjk5LFxuICAgIFwi44CMXCI6IDM2MyxcbiAgICDjgYI6IDE2NTUsXG4gICAg44GEOiAzMzEsXG4gICAg44GGOiAtNTAzLFxuICAgIOOBiDogMTE5OSxcbiAgICDjgYo6IDUyNyxcbiAgICDjgYs6IDY0NyxcbiAgICDjgYw6IC00MjEsXG4gICAg44GNOiAxNjI0LFxuICAgIOOBjjogMTk3MSxcbiAgICDjgY86IDMxMixcbiAgICDjgZI6IC05ODMsXG4gICAg44GVOiAtMTUzNyxcbiAgICDjgZc6IC0xMzcxLFxuICAgIOOBmTogLTg1MixcbiAgICDjgaA6IC0xMTg2LFxuICAgIOOBoTogMTA5MyxcbiAgICDjgaM6IDUyLFxuICAgIOOBpDogOTIxLFxuICAgIOOBpjogLTE4LFxuICAgIOOBpzogLTg1MCxcbiAgICDjgag6IC0xMjcsXG4gICAg44GpOiAxNjgyLFxuICAgIOOBqjogLTc4NyxcbiAgICDjgas6IC0xMjI0LFxuICAgIOOBrjogLTYzNSxcbiAgICDjga86IC01NzgsXG4gICAg44G5OiAxMDAxLFxuICAgIOOBvzogNTAyLFxuICAgIOOCgTogODY1LFxuICAgIOOCgzogMzM1MCxcbiAgICDjgoc6IDg1NCxcbiAgICDjgoo6IC0yMDgsXG4gICAg44KLOiA0MjksXG4gICAg44KMOiA1MDQsXG4gICAg44KPOiA0MTksXG4gICAg44KSOiAtMTI2NCxcbiAgICDjgpM6IDMyNyxcbiAgICDjgqQ6IDI0MSxcbiAgICDjg6s6IDQ1MSxcbiAgICDjg7M6IC0zNDMsXG4gICAg5LitOiAtODcxLFxuICAgIOS6rDogNzIyLFxuICAgIOS8mjogLTExNTMsXG4gICAg5YWaOiAtNjU0LFxuICAgIOWLmTogMzUxOSxcbiAgICDljLo6IC05MDEsXG4gICAg5ZGKOiA4NDgsXG4gICAg5ZOhOiAyMTA0LFxuICAgIOWkpzogLTEyOTYsXG4gICAg5a2mOiAtNTQ4LFxuICAgIOWumjogMTc4NSxcbiAgICDltZA6IC0xMzA0LFxuICAgIOW4gjogLTI5OTEsXG4gICAg5bitOiA5MjEsXG4gICAg5bm0OiAxNzYzLFxuICAgIOaAnTogODcyLFxuICAgIOaJgDogLTgxNCxcbiAgICDmjJk6IDE2MTgsXG4gICAg5pawOiAtMTY4MixcbiAgICDml6U6IDIxOCxcbiAgICDmnIg6IC00MzUzLFxuICAgIOafuzogOTMyLFxuICAgIOagvDogMTM1NixcbiAgICDmqZ86IC0xNTA4LFxuICAgIOawjzogLTEzNDcsXG4gICAg55SwOiAyNDAsXG4gICAg55S6OiAtMzkxMixcbiAgICDnmoQ6IC0zMTQ5LFxuICAgIOebuDogMTMxOSxcbiAgICDnnIE6IC0xMDUyLFxuICAgIOecjDogLTQwMDMsXG4gICAg56CUOiAtOTk3LFxuICAgIOekvjogLTI3OCxcbiAgICDnqbo6IC04MTMsXG4gICAg57WxOiAxOTU1LFxuICAgIOiAhTogLTIyMzMsXG4gICAg6KGoOiA2NjMsXG4gICAg6KqeOiAtMTA3MyxcbiAgICDorbA6IDEyMTksXG4gICAg6YG4OiAtMTAxOCxcbiAgICDpg446IC0zNjgsXG4gICAg6ZW3OiA3ODYsXG4gICAg6ZaTOiAxMTkxLFxuICAgIOmhjDogMjM2OCxcbiAgICDppKg6IC02ODksXG4gICAgXCLvvJFcIjogLTUxNCxcbiAgICDvvKXvvJI6IC0zMjc2OCxcbiAgICBcIu+9olwiOiAzNjMsXG4gICAg772yOiAyNDEsXG4gICAg776ZOiA0NTEsXG4gICAg776dOiAtMzQzLFxuICB9O1xuICB0aGlzLlVXNl9fID0ge1xuICAgIFwiLFwiOiAyMjcsXG4gICAgXCIuXCI6IDgwOCxcbiAgICAxOiAtMjcwLFxuICAgIEUxOiAzMDYsXG4gICAgXCLjgIFcIjogMjI3LFxuICAgIFwi44CCXCI6IDgwOCxcbiAgICDjgYI6IC0zMDcsXG4gICAg44GGOiAxODksXG4gICAg44GLOiAyNDEsXG4gICAg44GMOiAtNzMsXG4gICAg44GPOiAtMTIxLFxuICAgIOOBkzogLTIwMCxcbiAgICDjgZg6IDE3ODIsXG4gICAg44GZOiAzODMsXG4gICAg44GfOiAtNDI4LFxuICAgIOOBozogNTczLFxuICAgIOOBpjogLTEwMTQsXG4gICAg44GnOiAxMDEsXG4gICAg44GoOiAtMTA1LFxuICAgIOOBqjogLTI1MyxcbiAgICDjgas6IC0xNDksXG4gICAg44GuOiAtNDE3LFxuICAgIOOBrzogLTIzNixcbiAgICDjgoI6IC0yMDYsXG4gICAg44KKOiAxODcsXG4gICAg44KLOiAtMTM1LFxuICAgIOOCkjogMTk1LFxuICAgIOODqzogLTY3MyxcbiAgICDjg7M6IC00OTYsXG4gICAg5LiAOiAtMjc3LFxuICAgIOS4rTogMjAxLFxuICAgIOS7tjogLTgwMCxcbiAgICDkvJo6IDYyNCxcbiAgICDliY06IDMwMixcbiAgICDljLo6IDE3OTIsXG4gICAg5ZOhOiAtMTIxMixcbiAgICDlp5Q6IDc5OCxcbiAgICDlraY6IC05NjAsXG4gICAg5biCOiA4ODcsXG4gICAg5bqDOiAtNjk1LFxuICAgIOW+jDogNTM1LFxuICAgIOalrTogLTY5NyxcbiAgICDnm7g6IDc1MyxcbiAgICDnpL46IC01MDcsXG4gICAg56aPOiA5NzQsXG4gICAg56m6OiAtODIyLFxuICAgIOiAhTogMTgxMSxcbiAgICDpgKM6IDQ2MyxcbiAgICDpg446IDEwODIsXG4gICAgXCLvvJFcIjogLTI3MCxcbiAgICDvvKXvvJE6IDMwNixcbiAgICDvvpk6IC02NzMsXG4gICAg776dOiAtNDk2LFxuICB9O1xuXG4gIHJldHVybiB0aGlzO1xufVxuXG5UaW55U2VnbWVudGVyLnByb3RvdHlwZS5jdHlwZV8gPSBmdW5jdGlvbiAoc3RyKSB7XG4gIGZvciAodmFyIGkgaW4gdGhpcy5jaGFydHlwZV8pIHtcbiAgICBpZiAoc3RyLm1hdGNoKHRoaXMuY2hhcnR5cGVfW2ldWzBdKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcnR5cGVfW2ldWzFdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gXCJPXCI7XG59O1xuXG5UaW55U2VnbWVudGVyLnByb3RvdHlwZS50c18gPSBmdW5jdGlvbiAodikge1xuICBpZiAodikge1xuICAgIHJldHVybiB2O1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuVGlueVNlZ21lbnRlci5wcm90b3R5cGUuc2VnbWVudCA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICBpZiAoaW5wdXQgPT0gbnVsbCB8fCBpbnB1dCA9PSB1bmRlZmluZWQgfHwgaW5wdXQgPT0gXCJcIikge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBzZWcgPSBbXCJCM1wiLCBcIkIyXCIsIFwiQjFcIl07XG4gIHZhciBjdHlwZSA9IFtcIk9cIiwgXCJPXCIsIFwiT1wiXTtcbiAgdmFyIG8gPSBpbnB1dC5zcGxpdChcIlwiKTtcbiAgZm9yIChpID0gMDsgaSA8IG8ubGVuZ3RoOyArK2kpIHtcbiAgICBzZWcucHVzaChvW2ldKTtcbiAgICBjdHlwZS5wdXNoKHRoaXMuY3R5cGVfKG9baV0pKTtcbiAgfVxuICBzZWcucHVzaChcIkUxXCIpO1xuICBzZWcucHVzaChcIkUyXCIpO1xuICBzZWcucHVzaChcIkUzXCIpO1xuICBjdHlwZS5wdXNoKFwiT1wiKTtcbiAgY3R5cGUucHVzaChcIk9cIik7XG4gIGN0eXBlLnB1c2goXCJPXCIpO1xuICB2YXIgd29yZCA9IHNlZ1szXTtcbiAgdmFyIHAxID0gXCJVXCI7XG4gIHZhciBwMiA9IFwiVVwiO1xuICB2YXIgcDMgPSBcIlVcIjtcbiAgZm9yICh2YXIgaSA9IDQ7IGkgPCBzZWcubGVuZ3RoIC0gMzsgKytpKSB7XG4gICAgdmFyIHNjb3JlID0gdGhpcy5CSUFTX187XG4gICAgdmFyIHcxID0gc2VnW2kgLSAzXTtcbiAgICB2YXIgdzIgPSBzZWdbaSAtIDJdO1xuICAgIHZhciB3MyA9IHNlZ1tpIC0gMV07XG4gICAgdmFyIHc0ID0gc2VnW2ldO1xuICAgIHZhciB3NSA9IHNlZ1tpICsgMV07XG4gICAgdmFyIHc2ID0gc2VnW2kgKyAyXTtcbiAgICB2YXIgYzEgPSBjdHlwZVtpIC0gM107XG4gICAgdmFyIGMyID0gY3R5cGVbaSAtIDJdO1xuICAgIHZhciBjMyA9IGN0eXBlW2kgLSAxXTtcbiAgICB2YXIgYzQgPSBjdHlwZVtpXTtcbiAgICB2YXIgYzUgPSBjdHlwZVtpICsgMV07XG4gICAgdmFyIGM2ID0gY3R5cGVbaSArIDJdO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVVAxX19bcDFdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlVQMl9fW3AyXSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5VUDNfX1twM10pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuQlAxX19bcDEgKyBwMl0pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuQlAyX19bcDIgKyBwM10pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVVcxX19bdzFdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlVXMl9fW3cyXSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5VVzNfX1t3M10pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVVc0X19bdzRdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlVXNV9fW3c1XSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5VVzZfX1t3Nl0pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuQlcxX19bdzIgKyB3M10pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuQlcyX19bdzMgKyB3NF0pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuQlczX19bdzQgKyB3NV0pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVFcxX19bdzEgKyB3MiArIHczXSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5UVzJfX1t3MiArIHczICsgdzRdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlRXM19fW3czICsgdzQgKyB3NV0pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVFc0X19bdzQgKyB3NSArIHc2XSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5VQzFfX1tjMV0pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVUMyX19bYzJdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlVDM19fW2MzXSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5VQzRfX1tjNF0pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVUM1X19bYzVdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlVDNl9fW2M2XSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5CQzFfX1tjMiArIGMzXSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5CQzJfX1tjMyArIGM0XSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5CQzNfX1tjNCArIGM1XSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5UQzFfX1tjMSArIGMyICsgYzNdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlRDMl9fW2MyICsgYzMgKyBjNF0pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVEMzX19bYzMgKyBjNCArIGM1XSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5UQzRfX1tjNCArIGM1ICsgYzZdKTtcbiAgICAvLyAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5UQzVfX1tjNCArIGM1ICsgYzZdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlVRMV9fW3AxICsgYzFdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlVRMl9fW3AyICsgYzJdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlVRM19fW3AzICsgYzNdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLkJRMV9fW3AyICsgYzIgKyBjM10pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuQlEyX19bcDIgKyBjMyArIGM0XSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5CUTNfX1twMyArIGMyICsgYzNdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLkJRNF9fW3AzICsgYzMgKyBjNF0pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVFExX19bcDIgKyBjMSArIGMyICsgYzNdKTtcbiAgICBzY29yZSArPSB0aGlzLnRzXyh0aGlzLlRRMl9fW3AyICsgYzIgKyBjMyArIGM0XSk7XG4gICAgc2NvcmUgKz0gdGhpcy50c18odGhpcy5UUTNfX1twMyArIGMxICsgYzIgKyBjM10pO1xuICAgIHNjb3JlICs9IHRoaXMudHNfKHRoaXMuVFE0X19bcDMgKyBjMiArIGMzICsgYzRdKTtcbiAgICB2YXIgcCA9IFwiT1wiO1xuICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgIHJlc3VsdC5wdXNoKHdvcmQpO1xuICAgICAgd29yZCA9IFwiXCI7XG4gICAgICBwID0gXCJCXCI7XG4gICAgfVxuICAgIHAxID0gcDI7XG4gICAgcDIgPSBwMztcbiAgICBwMyA9IHA7XG4gICAgd29yZCArPSBzZWdbaV07XG4gIH1cbiAgcmVzdWx0LnB1c2god29yZCk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRpbnlTZWdtZW50ZXI7XG4iLCJpbXBvcnQgVGlueVNlZ21lbnRlciBmcm9tIFwiLi4vLi4vZXh0ZXJuYWwvdGlueS1zZWdtZW50ZXJcIjtcbmltcG9ydCB7IFRSSU1fQ0hBUl9QQVRURVJOIH0gZnJvbSBcIi4vRGVmYXVsdFRva2VuaXplclwiO1xuaW1wb3J0IHR5cGUgeyBUb2tlbml6ZXIgfSBmcm9tIFwiLi4vdG9rZW5pemVyXCI7XG4vLyBAdHMtaWdub3JlXG5jb25zdCBzZWdtZW50ZXIgPSBuZXcgVGlueVNlZ21lbnRlcigpO1xuXG5mdW5jdGlvbiBwaWNrVG9rZW5zQXNKYXBhbmVzZShjb250ZW50OiBzdHJpbmcsIHRyaW1QYXR0ZXJuOiBSZWdFeHApOiBzdHJpbmdbXSB7XG4gIHJldHVybiBjb250ZW50XG4gICAgLnNwbGl0KHRyaW1QYXR0ZXJuKVxuICAgIC5maWx0ZXIoKHgpID0+IHggIT09IFwiXCIpXG4gICAgLmZsYXRNYXA8c3RyaW5nPigoeCkgPT4gc2VnbWVudGVyLnNlZ21lbnQoeCkpO1xufVxuXG4vKipcbiAqIEphcGFuZXNlIG5lZWRzIG9yaWdpbmFsIGxvZ2ljLlxuICovXG5leHBvcnQgY2xhc3MgSmFwYW5lc2VUb2tlbml6ZXIgaW1wbGVtZW50cyBUb2tlbml6ZXIge1xuICB0b2tlbml6ZShjb250ZW50OiBzdHJpbmcsIHJhdz86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHBpY2tUb2tlbnNBc0phcGFuZXNlKGNvbnRlbnQsIHJhdyA/IC8gL2cgOiB0aGlzLmdldFRyaW1QYXR0ZXJuKCkpO1xuICB9XG5cbiAgcmVjdXJzaXZlVG9rZW5pemUoY29udGVudDogc3RyaW5nKTogeyB3b3JkOiBzdHJpbmc7IG9mZnNldDogbnVtYmVyIH1bXSB7XG4gICAgY29uc3QgdG9rZW5zOiBzdHJpbmdbXSA9IHNlZ21lbnRlclxuICAgICAgLnNlZ21lbnQoY29udGVudClcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YWRhc2hpLWFpa2F3YS9vYnNpZGlhbi12YXJpb3VzLWNvbXBsZW1lbnRzLXBsdWdpbi9pc3N1ZXMvNzdcbiAgICAgIC5mbGF0TWFwKCh4OiBzdHJpbmcpID0+XG4gICAgICAgIHggPT09IFwiIFwiID8geCA6IHguc3BsaXQoXCIgXCIpLm1hcCgodCkgPT4gKHQgPT09IFwiXCIgPyBcIiBcIiA6IHQpKVxuICAgICAgKTtcblxuICAgIGNvbnN0IHJldCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGkgPT09IDAgfHxcbiAgICAgICAgdG9rZW5zW2ldLmxlbmd0aCAhPT0gMSB8fFxuICAgICAgICAhQm9vbGVhbih0b2tlbnNbaV0ubWF0Y2godGhpcy5nZXRUcmltUGF0dGVybigpKSlcbiAgICAgICkge1xuICAgICAgICByZXQucHVzaCh7XG4gICAgICAgICAgd29yZDogdG9rZW5zLnNsaWNlKGkpLmpvaW4oXCJcIiksXG4gICAgICAgICAgb2Zmc2V0OiB0b2tlbnMuc2xpY2UoMCwgaSkuam9pbihcIlwiKS5sZW5ndGgsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBnZXRUcmltUGF0dGVybigpOiBSZWdFeHAge1xuICAgIHJldHVybiBUUklNX0NIQVJfUEFUVEVSTjtcbiAgfVxuXG4gIHNob3VsZElnbm9yZU9uQ3VycmVudChzdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBCb29sZWFuKHN0ci5tYXRjaCgvXlvjgYEt44KT772BLe+9mu+8oS3vvLrjgILjgIHjg7zjgIBdKiQvKSk7XG4gIH1cbn1cbiIsImltcG9ydCB7IERlZmF1bHRUb2tlbml6ZXIgfSBmcm9tIFwiLi9EZWZhdWx0VG9rZW5pemVyXCI7XG5cbnR5cGUgUHJldmlvdXNUeXBlID0gXCJub25lXCIgfCBcInRyaW1cIiB8IFwiZW5nbGlzaFwiIHwgXCJvdGhlcnNcIjtcbmNvbnN0IEVOR0xJU0hfUEFUVEVSTiA9IC9bYS16QS1aMC05X1xcLVxcXFxdLztcbmV4cG9ydCBjbGFzcyBFbmdsaXNoT25seVRva2VuaXplciBleHRlbmRzIERlZmF1bHRUb2tlbml6ZXIge1xuICB0b2tlbml6ZShjb250ZW50OiBzdHJpbmcsIHJhdz86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgdG9rZW5pemVkID0gQXJyYXkuZnJvbSh0aGlzLl90b2tlbml6ZShjb250ZW50KSkuZmlsdGVyKCh4KSA9PlxuICAgICAgeC53b3JkLm1hdGNoKEVOR0xJU0hfUEFUVEVSTilcbiAgICApO1xuICAgIHJldHVybiByYXdcbiAgICAgID8gdG9rZW5pemVkLm1hcCgoeCkgPT4geC53b3JkKVxuICAgICAgOiB0b2tlbml6ZWRcbiAgICAgICAgICAubWFwKCh4KSA9PiB4LndvcmQpXG4gICAgICAgICAgLmZpbHRlcigoeCkgPT4gIXgubWF0Y2godGhpcy5nZXRUcmltUGF0dGVybigpKSk7XG4gIH1cblxuICByZWN1cnNpdmVUb2tlbml6ZShjb250ZW50OiBzdHJpbmcpOiB7IHdvcmQ6IHN0cmluZzsgb2Zmc2V0OiBudW1iZXIgfVtdIHtcbiAgICBjb25zdCBvZmZzZXRzID0gQXJyYXkuZnJvbSh0aGlzLl90b2tlbml6ZShjb250ZW50KSlcbiAgICAgIC5maWx0ZXIoKHgpID0+ICF4LndvcmQubWF0Y2godGhpcy5nZXRUcmltUGF0dGVybigpKSlcbiAgICAgIC5tYXAoKHgpID0+IHgub2Zmc2V0KTtcbiAgICByZXR1cm4gW1xuICAgICAgLi4ub2Zmc2V0cy5tYXAoKGkpID0+ICh7XG4gICAgICAgIHdvcmQ6IGNvbnRlbnQuc2xpY2UoaSksXG4gICAgICAgIG9mZnNldDogaSxcbiAgICAgIH0pKSxcbiAgICBdO1xuICB9XG5cbiAgcHJpdmF0ZSAqX3Rva2VuaXplKFxuICAgIGNvbnRlbnQ6IHN0cmluZ1xuICApOiBJdGVyYWJsZTx7IHdvcmQ6IHN0cmluZzsgb2Zmc2V0OiBudW1iZXIgfT4ge1xuICAgIGxldCBzdGFydEluZGV4ID0gMDtcbiAgICBsZXQgcHJldmlvdXNUeXBlOiBQcmV2aW91c1R5cGUgPSBcIm5vbmVcIjtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGVudC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNvbnRlbnRbaV0ubWF0Y2goc3VwZXIuZ2V0VHJpbVBhdHRlcm4oKSkpIHtcbiAgICAgICAgeWllbGQgeyB3b3JkOiBjb250ZW50LnNsaWNlKHN0YXJ0SW5kZXgsIGkpLCBvZmZzZXQ6IHN0YXJ0SW5kZXggfTtcbiAgICAgICAgcHJldmlvdXNUeXBlID0gXCJ0cmltXCI7XG4gICAgICAgIHN0YXJ0SW5kZXggPSBpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbnRlbnRbaV0ubWF0Y2goRU5HTElTSF9QQVRURVJOKSkge1xuICAgICAgICBpZiAocHJldmlvdXNUeXBlID09PSBcImVuZ2xpc2hcIiB8fCBwcmV2aW91c1R5cGUgPT09IFwibm9uZVwiKSB7XG4gICAgICAgICAgcHJldmlvdXNUeXBlID0gXCJlbmdsaXNoXCI7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB5aWVsZCB7IHdvcmQ6IGNvbnRlbnQuc2xpY2Uoc3RhcnRJbmRleCwgaSksIG9mZnNldDogc3RhcnRJbmRleCB9O1xuICAgICAgICBwcmV2aW91c1R5cGUgPSBcImVuZ2xpc2hcIjtcbiAgICAgICAgc3RhcnRJbmRleCA9IGk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJldmlvdXNUeXBlID09PSBcIm90aGVyc1wiIHx8IHByZXZpb3VzVHlwZSA9PT0gXCJub25lXCIpIHtcbiAgICAgICAgcHJldmlvdXNUeXBlID0gXCJvdGhlcnNcIjtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHlpZWxkIHsgd29yZDogY29udGVudC5zbGljZShzdGFydEluZGV4LCBpKSwgb2Zmc2V0OiBzdGFydEluZGV4IH07XG4gICAgICBwcmV2aW91c1R5cGUgPSBcIm90aGVyc1wiO1xuICAgICAgc3RhcnRJbmRleCA9IGk7XG4gICAgfVxuXG4gICAgeWllbGQge1xuICAgICAgd29yZDogY29udGVudC5zbGljZShzdGFydEluZGV4LCBjb250ZW50Lmxlbmd0aCksXG4gICAgICBvZmZzZXQ6IHN0YXJ0SW5kZXgsXG4gICAgfTtcbiAgfVxufVxuIiwiLy8gUXVpY2sgZ3VpZGUgZm9yIHR5cGluZyBDaGluZXNlIHBpbnlpbiBvbiBNYWMgT1MgWFxuXG4vLyBUb25lIDEgKGZsYXQpIG3EgSDigJMgT3B0aW9uICsgYSwgdGhlbiBoaXQgYSB2b3dlbCBrZXlcbi8vIFRvbmUgMiAocmlzaW5nKSBtw6Eg4oCTIE9wdGlvbiArIGUsIHRoZW4gaGl0IGEgdm93ZWwga2V5XG4vLyBUb25lIDMgKGZhbGxpbmctcmlzaW5nKSBtx44g4oCTIE9wdGlvbiArIHYsIHRoZW4gaGl0IGEgdm93ZWwga2V5XG4vLyBUb25lIDQgKGZhbGxpbmcpIG3DoCDigJMgT3B0aW9uICsgYCwgdGhlbiBoaXQgYSB2b3dlbCBrZXlcblxuLy8gx5og4oCTIE9wdGlvbiArIFYsIHRoZW4gaGl0IFYgKHN1Ym1pdHRlZCBieSBRQSlcbi8vIMecIOKAkyBPcHRpb24gKyBgLCB0aGVuIGhpdCBWIChzdWJtaXR0ZWQgYnkgUUEpXG5cblxudmFyIHJlcGxhY2VtZW50cyA9IHtcbiAgJ2EnOiBbJ8SBJywgJ8OhJywgJ8eOJywgJ8OgJ10sXG4gICdlJzogWyfEkycsICfDqScsICfEmycsICfDqCddLFxuICAndSc6IFsnxasnLCAnw7onLCAnx5QnLCAnw7knXSxcbiAgJ2knOiBbJ8SrJywgJ8OtJywgJ8eQJywgJ8OsJ10sXG4gICdvJzogWyfFjScsICfDsycsICfHkicsICfDsiddLFxuICAnw7wnOiBbJ8eWJywgJ8eYJywgJ8eaJywgJ8ecJ11cbn07XG5cbnZhciBtZWRpYWxzID0gWydpJywgJ3UnLCAnw7wnXTtcblxudmFyIHByZXR0aWZ5ID0gZnVuY3Rpb24oc3RyKXtcbiAgc3RyID0gc3RyLnJlcGxhY2UoJ3YnLCAnw7wnKTtcbiAgdmFyIHN5bGxhYmxlcyA9IHN0ci5zcGxpdCgnICcpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3lsbGFibGVzLmxlbmd0aDsgaSsrKXtcbiAgICB2YXIgc3lsbGFibGUgPSBzeWxsYWJsZXNbaV07XG4gICAgdmFyIHRvbmUgPSBwYXJzZUludChzeWxsYWJsZVtzeWxsYWJsZS5sZW5ndGgtMV0pO1xuICAgIFxuICAgIGlmICh0b25lIDw9IDAgfHwgdG9uZSA+IDUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2ludmFsaWQgdG9uZSBudW1iZXI6JywgdG9uZSwgJ2luJywgc3lsbGFibGUpO1xuICAgIH0gZWxzZSBpZiAodG9uZSA9PT0gNSl7XG4gICAgICBzeWxsYWJsZXNbaV0gPSBzeWxsYWJsZS5zbGljZSgwLCBzeWxsYWJsZS5sZW5ndGggLSAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzeWxsYWJsZS5sZW5ndGg7IGorKyl7XG4gICAgICAgIHZhciBjdXJyZW50TGV0dGVyID0gc3lsbGFibGVbal07XG4gICAgICAgIHZhciBuZXh0TGV0dGVyID0gc3lsbGFibGVbaiArIDFdO1xuXG4gICAgICAgIC8vIGZvdW5kIGEgdm93ZWxcbiAgICAgICAgaWYgKHJlcGxhY2VtZW50c1tjdXJyZW50TGV0dGVyXSl7XG4gICAgICAgICAgdmFyIHJlcGxhY2VkO1xuICAgICAgICAgIHZhciBsZXR0ZXJUb1JlcGxhY2U7XG5cbiAgICAgICAgICAvLyB0d28gY29uc2VjdXRpdmUgdm93ZWxzXG4gICAgICAgICAgaWYgKHJlcGxhY2VtZW50c1tuZXh0TGV0dGVyXSAmJiBtZWRpYWxzLmluZGV4T2YoY3VycmVudExldHRlcikgPj0gMCl7XG4gICAgICAgICAgICBsZXR0ZXJUb1JlcGxhY2UgPSBuZXh0TGV0dGVyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXR0ZXJUb1JlcGxhY2UgPSBjdXJyZW50TGV0dGVyO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlcGxhY2VkID0gc3lsbGFibGUucmVwbGFjZShsZXR0ZXJUb1JlcGxhY2UsIHJlcGxhY2VtZW50c1tsZXR0ZXJUb1JlcGxhY2VdW3RvbmUgLSAxXSk7XG4gICAgICAgICAgc3lsbGFibGVzW2ldID0gcmVwbGFjZWQuc2xpY2UoMCwgcmVwbGFjZWQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gIFxuICAgIH1cblxuICB9XG4gIHJldHVybiBzeWxsYWJsZXMuam9pbignICcpO1xufTtcblxubW9kdWxlLmV4cG9ydHMucHJldHRpZnkgPSBwcmV0dGlmeTtcblxuXG4iLCJjbGFzcyBUcmllIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb250ZW50ID0ge31cbiAgICB9XG5cbiAgICBnZXRLZXlPYmplY3Qoa2V5LCBjcmVhdGUgPSBmYWxzZSkge1xuICAgICAgICBrZXkgPSBrZXkudG9TdHJpbmcoKVxuXG4gICAgICAgIGxldCBjaGFycyA9IGtleSA9PT0gJycgPyBba2V5XSA6IEFycmF5LmZyb20oa2V5KVxuICAgICAgICBsZXQgb2JqID0gdGhpcy5jb250ZW50XG5cbiAgICAgICAgZm9yIChsZXQgY2hhciBvZiBjaGFycykge1xuICAgICAgICAgICAgaWYgKG9ialtjaGFyXSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0ZSkgb2JqW2NoYXJdID0ge31cbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiB7fVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYmogPSBvYmpbY2hhcl1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvYmpcbiAgICB9XG5cbiAgICBnZXQoa2V5KSB7XG4gICAgICAgIGxldCBvYmogPSB0aGlzLmdldEtleU9iamVjdChrZXkpXG5cbiAgICAgICAgcmV0dXJuIG9iai52YWx1ZXMgfHwgW11cbiAgICB9XG5cbiAgICBnZXRQcmVmaXgoa2V5KSB7XG4gICAgICAgIGxldCBpbm5lciA9IChrZXksIG9iaiA9IG51bGwpID0+IHtcbiAgICAgICAgICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gdGhpcy5nZXRLZXlPYmplY3Qoa2V5KVxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IG9iai52YWx1ZXMgPyBbLi4ub2JqLnZhbHVlc10gOiBbXVxuXG4gICAgICAgICAgICBmb3IgKGxldCBjaGFyIGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmIChjaGFyID09PSAndmFsdWVzJyB8fCBvYmpbY2hhcl0gPT0gbnVsbCkgY29udGludWVcblxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKC4uLmlubmVyKGtleSArIGNoYXIsIG9ialtjaGFyXSkpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbm5lcihrZXkpXG4gICAgfVxuXG4gICAgcHVzaChrZXksIHZhbHVlKSB7XG4gICAgICAgIGxldCBvYmogPSB0aGlzLmdldEtleU9iamVjdChrZXksIHRydWUpXG5cbiAgICAgICAgaWYgKG9iai52YWx1ZXMgPT0gbnVsbCkgb2JqLnZhbHVlcyA9IFtdXG4gICAgICAgIGlmICghb2JqLnZhbHVlcy5pbmNsdWRlcyh2YWx1ZSkpIG9iai52YWx1ZXMucHVzaCh2YWx1ZSlcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmllXG4iLCJjb25zdCB7cHJldHRpZnl9ID0gcmVxdWlyZSgncHJldHRpZnktcGlueWluJylcbmNvbnN0IFRyaWUgPSByZXF1aXJlKCcuL3RyaWUnKVxuXG5mdW5jdGlvbiBwYXJzZUxpbmUobGluZSkge1xuICAgIGxldCBtYXRjaCA9IGxpbmUubWF0Y2goL14oXFxTKylcXHMoXFxTKylcXHNcXFsoW15cXF1dKylcXF1cXHNcXC8oLispXFwvLylcbiAgICBpZiAobWF0Y2ggPT0gbnVsbCkgcmV0dXJuXG5cbiAgICBsZXQgWywgdHJhZGl0aW9uYWwsIHNpbXBsaWZpZWQsIHBpbnlpbiwgZW5nbGlzaF0gPSBtYXRjaFxuXG4gICAgcGlueWluID0gcGlueWluLnJlcGxhY2UoL3U6L2csICfDvCcpXG4gICAgbGV0IHBpbnlpblByZXR0eSA9IHByZXR0aWZ5KHBpbnlpbilcblxuICAgIHJldHVybiB7dHJhZGl0aW9uYWwsIHNpbXBsaWZpZWQsIHBpbnlpbiwgcGlueWluUHJldHR5LCBlbmdsaXNofVxufVxuXG5jbGFzcyBDZWRpY3Qge1xuICAgIGxvYWQoY29udGVudHMpIHtcbiAgICAgICAgdGhpcy5zaW1wbGlmaWVkVHJpZSA9IG5ldyBUcmllKClcbiAgICAgICAgdGhpcy50cmFkaXRpb25hbFRyaWUgPSBuZXcgVHJpZSgpXG5cbiAgICAgICAgbGV0IGxpbmVzID0gY29udGVudHMuc3BsaXQoJ1xcbicpXG5cbiAgICAgICAgZm9yIChsZXQgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgaWYgKGxpbmUudHJpbSgpID09PSAnJyB8fCBsaW5lWzBdID09PSAnIycpIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGxldCBlbnRyeSA9IHBhcnNlTGluZShsaW5lKVxuICAgICAgICAgICAgaWYgKGVudHJ5ID09IG51bGwpIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIHRoaXMuc2ltcGxpZmllZFRyaWUucHVzaChlbnRyeS5zaW1wbGlmaWVkLCBlbnRyeSlcbiAgICAgICAgICAgIHRoaXMudHJhZGl0aW9uYWxUcmllLnB1c2goZW50cnkudHJhZGl0aW9uYWwsIGVudHJ5KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0KHdvcmQsIHRyYWRpdGlvbmFsID0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIHRyYWRpdGlvbmFsID8gdGhpcy50cmFkaXRpb25hbFRyaWUuZ2V0KHdvcmQpIDogdGhpcy5zaW1wbGlmaWVkVHJpZS5nZXQod29yZClcbiAgICB9XG5cbiAgICBnZXRQcmVmaXgod29yZCwgdHJhZGl0aW9uYWwgPSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gdHJhZGl0aW9uYWwgPyB0aGlzLnRyYWRpdGlvbmFsVHJpZS5nZXRQcmVmaXgod29yZCkgOiB0aGlzLnNpbXBsaWZpZWRUcmllLmdldFByZWZpeCh3b3JkKVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDZWRpY3RcbiIsImNvbnN0IENlZGljdCA9IHJlcXVpcmUoXCIuL2NlZGljdFwiKTtcblxuY29uc3QgY2hpbmVzZVB1bmN0dWF0aW9uID0gW1xuICBcIsK3XCIsXG4gIFwiw5dcIixcbiAgXCLigJRcIixcbiAgXCLigJhcIixcbiAgXCLigJlcIixcbiAgXCLigJxcIixcbiAgXCLigJ1cIixcbiAgXCLigKZcIixcbiAgXCLjgIFcIixcbiAgXCLjgIJcIixcbiAgXCLjgIpcIixcbiAgXCLjgItcIixcbiAgXCLjgI5cIixcbiAgXCLjgI9cIixcbiAgXCLjgJBcIixcbiAgXCLjgJFcIixcbiAgXCLvvIFcIixcbiAgXCLvvIhcIixcbiAgXCLvvIlcIixcbiAgXCLvvIxcIixcbiAgXCLvvJpcIixcbiAgXCLvvJtcIixcbiAgXCLvvJ9cIixcbl07XG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uIChjb250ZW50cykge1xuICBsZXQgZGljdGlvbmFyeSA9IG5ldyBDZWRpY3QoKTtcbiAgZGljdGlvbmFyeS5sb2FkKGNvbnRlbnRzKTtcblxuICByZXR1cm4gZnVuY3Rpb24gdG9rZW5pemUodGV4dCkge1xuICAgIHRleHQgPSBBcnJheS5mcm9tKHRleHQucmVwbGFjZSgvXFxyL2csIFwiXCIpKTtcblxuICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IFtvZmZzZXQsIGxpbmUsIGNvbHVtbl0gPSBbMCwgMSwgMV07XG4gICAgbGV0IFtzaW1wbGlmaWVkUHJlZmVyZW5jZSwgdHJhZGl0aW9uYWxQcmVmZXJlbmNlXSA9IFswLCAwXTtcblxuICAgIGxldCBwdXNoVG9rZW4gPSAod29yZCkgPT4ge1xuICAgICAgbGV0IHNpbXBsaWZpZWRFbnRyaWVzID0gZGljdGlvbmFyeS5nZXQod29yZCwgZmFsc2UpO1xuICAgICAgbGV0IHRyYWRpdGlvbmFsRW50cmllcyA9IGRpY3Rpb25hcnkuZ2V0KHdvcmQsIHRydWUpO1xuXG4gICAgICBsZXQgZW50cmllcyA9XG4gICAgICAgIHNpbXBsaWZpZWRFbnRyaWVzLmxlbmd0aCA9PT0gMFxuICAgICAgICAgID8gdHJhZGl0aW9uYWxFbnRyaWVzXG4gICAgICAgICAgOiB0cmFkaXRpb25hbEVudHJpZXMubGVuZ3RoID09PSAwXG4gICAgICAgICAgPyBzaW1wbGlmaWVkRW50cmllc1xuICAgICAgICAgIDogc2ltcGxpZmllZFByZWZlcmVuY2UgPCB0cmFkaXRpb25hbFByZWZlcmVuY2VcbiAgICAgICAgICA/IHRyYWRpdGlvbmFsRW50cmllc1xuICAgICAgICAgIDogc2ltcGxpZmllZFByZWZlcmVuY2UgPiB0cmFkaXRpb25hbFByZWZlcmVuY2VcbiAgICAgICAgICA/IHNpbXBsaWZpZWRFbnRyaWVzXG4gICAgICAgICAgOiB0cmFkaXRpb25hbEVudHJpZXM7XG5cbiAgICAgIGlmICh0cmFkaXRpb25hbEVudHJpZXMubGVuZ3RoID09PSAwICYmIHNpbXBsaWZpZWRFbnRyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2ltcGxpZmllZFByZWZlcmVuY2UrKztcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHNpbXBsaWZpZWRFbnRyaWVzLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICB0cmFkaXRpb25hbEVudHJpZXMubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIHRyYWRpdGlvbmFsUHJlZmVyZW5jZSsrO1xuICAgICAgfVxuXG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIHRleHQ6IHdvcmQsXG4gICAgICAgIHRyYWRpdGlvbmFsOiBlbnRyaWVzWzBdID8gZW50cmllc1swXS50cmFkaXRpb25hbCA6IHdvcmQsXG4gICAgICAgIHNpbXBsaWZpZWQ6IGVudHJpZXNbMF0gPyBlbnRyaWVzWzBdLnNpbXBsaWZpZWQgOiB3b3JkLFxuXG4gICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgIGxpbmUsXG4gICAgICAgICAgY29sdW1uLFxuICAgICAgICB9LFxuXG4gICAgICAgIG1hdGNoZXM6IGVudHJpZXMubWFwKCh7IHBpbnlpbiwgcGlueWluUHJldHR5LCBlbmdsaXNoIH0pID0+ICh7XG4gICAgICAgICAgcGlueWluLFxuICAgICAgICAgIHBpbnlpblByZXR0eSxcbiAgICAgICAgICBlbmdsaXNoLFxuICAgICAgICB9KSksXG4gICAgICB9KTtcblxuICAgICAgbGV0IHdvcmRBcnIgPSBBcnJheS5mcm9tKHdvcmQpO1xuICAgICAgbGV0IGxhc3RMaW5lQnJlYWtJbmRleCA9IHdvcmQubGFzdEluZGV4T2YoXCJcXG5cIik7XG5cbiAgICAgIGkgKz0gd29yZEFyci5sZW5ndGg7XG4gICAgICBvZmZzZXQgKz0gd29yZC5sZW5ndGg7XG4gICAgICBsaW5lICs9IHdvcmRBcnIuZmlsdGVyKCh4KSA9PiB4ID09PSBcIlxcblwiKS5sZW5ndGg7XG4gICAgICBjb2x1bW4gPVxuICAgICAgICBsYXN0TGluZUJyZWFrSW5kZXggPj0gMFxuICAgICAgICAgID8gd29yZC5sZW5ndGggLSBsYXN0TGluZUJyZWFrSW5kZXhcbiAgICAgICAgICA6IGNvbHVtbiArIHdvcmQubGVuZ3RoO1xuICAgIH07XG5cbiAgICB3aGlsZSAoaSA8IHRleHQubGVuZ3RoKSB7XG4gICAgICAvLyBUcnkgdG8gbWF0Y2ggdHdvIG9yIG1vcmUgY2hhcmFjdGVyc1xuXG4gICAgICBpZiAoaSAhPT0gdGV4dC5sZW5ndGggLSAxKSB7XG4gICAgICAgIGxldCBnZXRUd28gPSB0ZXh0LnNsaWNlKGksIGkgKyAyKS5qb2luKFwiXCIpO1xuICAgICAgICBsZXQgc2ltcGxpZmllZEVudHJpZXMgPSBkaWN0aW9uYXJ5LmdldFByZWZpeChnZXRUd28sIGZhbHNlKTtcbiAgICAgICAgbGV0IHRyYWRpdGlvbmFsRW50cmllcyA9IGRpY3Rpb25hcnkuZ2V0UHJlZml4KGdldFR3bywgdHJ1ZSk7XG4gICAgICAgIGxldCBmb3VuZFdvcmQgPSBudWxsO1xuICAgICAgICBsZXQgZm91bmRFbnRyaWVzID0gbnVsbDtcblxuICAgICAgICBmb3IgKGxldCBlbnRyaWVzIG9mIFt0cmFkaXRpb25hbEVudHJpZXMsIHNpbXBsaWZpZWRFbnRyaWVzXSkge1xuICAgICAgICAgIGZvciAobGV0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgIGxldCBtYXRjaFRleHQgPVxuICAgICAgICAgICAgICBlbnRyaWVzID09PSB0cmFkaXRpb25hbEVudHJpZXNcbiAgICAgICAgICAgICAgICA/IGVudHJ5LnRyYWRpdGlvbmFsXG4gICAgICAgICAgICAgICAgOiBlbnRyeS5zaW1wbGlmaWVkO1xuICAgICAgICAgICAgbGV0IHdvcmQgPSB0ZXh0LnNsaWNlKGksIGkgKyBBcnJheS5mcm9tKG1hdGNoVGV4dCkubGVuZ3RoKS5qb2luKFwiXCIpO1xuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIG1hdGNoVGV4dCA9PT0gd29yZCAmJlxuICAgICAgICAgICAgICAoZm91bmRXb3JkID09IG51bGwgfHxcbiAgICAgICAgICAgICAgICBBcnJheS5mcm9tKHdvcmQpLmxlbmd0aCA+IEFycmF5LmZyb20oZm91bmRXb3JkKS5sZW5ndGgpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgZm91bmRXb3JkID0gd29yZDtcbiAgICAgICAgICAgICAgZm91bmRFbnRyaWVzID0gZW50cmllcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZm91bmRXb3JkICE9IG51bGwpIHtcbiAgICAgICAgICBwdXNoVG9rZW4oZm91bmRXb3JkKTtcblxuICAgICAgICAgIGlmIChmb3VuZEVudHJpZXMgPT09IHNpbXBsaWZpZWRFbnRyaWVzKSB7XG4gICAgICAgICAgICBzaW1wbGlmaWVkUHJlZmVyZW5jZSsrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZm91bmRFbnRyaWVzID09PSB0cmFkaXRpb25hbEVudHJpZXMpIHtcbiAgICAgICAgICAgIHRyYWRpdGlvbmFsUHJlZmVyZW5jZSsrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGl0IGZhaWxzLCBtYXRjaCBvbmUgY2hhcmFjdGVyXG5cbiAgICAgIGxldCBjaGFyYWN0ZXIgPSB0ZXh0W2ldO1xuICAgICAgbGV0IGlzQ2hpbmVzZSA9IChjaGFyYWN0ZXIpID0+XG4gICAgICAgIGNoaW5lc2VQdW5jdHVhdGlvbi5pbmNsdWRlcyhjaGFyYWN0ZXIpIHx8XG4gICAgICAgIGRpY3Rpb25hcnkuZ2V0KGNoYXJhY3RlciwgZmFsc2UpLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgZGljdGlvbmFyeS5nZXQoY2hhcmFjdGVyLCB0cnVlKS5sZW5ndGggPiAwO1xuXG4gICAgICBpZiAoaXNDaGluZXNlKGNoYXJhY3RlcikgfHwgY2hhcmFjdGVyLm1hdGNoKC9cXHMvKSAhPSBudWxsKSB7XG4gICAgICAgIHB1c2hUb2tlbihjaGFyYWN0ZXIpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gSGFuZGxlIG5vbi1DaGluZXNlIGNoYXJhY3RlcnNcblxuICAgICAgbGV0IGVuZCA9IGkgKyAxO1xuXG4gICAgICBmb3IgKDsgZW5kIDwgdGV4dC5sZW5ndGg7IGVuZCsrKSB7XG4gICAgICAgIGlmICh0ZXh0W2VuZF0ubWF0Y2goL1xccy8pICE9IG51bGwgfHwgaXNDaGluZXNlKHRleHRbZW5kXSkpIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBsZXQgd29yZCA9IHRleHQuc2xpY2UoaSwgZW5kKS5qb2luKFwiXCIpO1xuICAgICAgcHVzaFRva2VuKHdvcmQpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59O1xuIiwiaW1wb3J0IHsgVFJJTV9DSEFSX1BBVFRFUk4gfSBmcm9tIFwiLi9EZWZhdWx0VG9rZW5pemVyXCI7XG5pbXBvcnQgdHlwZSB7IFRva2VuaXplciB9IGZyb20gXCIuLi90b2tlbml6ZXJcIjtcbmltcG9ydCBjaGluZXNlVG9rZW5pemVyIGZyb20gXCJjaGluZXNlLXRva2VuaXplclwiO1xuXG4vKipcbiAqIENoaW5lc2UgbmVlZHMgb3JpZ2luYWwgbG9naWMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGluZXNlVG9rZW5pemVyIGltcGxlbWVudHMgVG9rZW5pemVyIHtcbiAgX3Rva2VuaXplOiBSZXR1cm5UeXBlPHR5cGVvZiBjaGluZXNlVG9rZW5pemVyLmxvYWQ+O1xuXG4gIHN0YXRpYyBjcmVhdGUoZGljdDogc3RyaW5nKTogQ2hpbmVzZVRva2VuaXplciB7XG4gICAgY29uc3QgaW5zID0gbmV3IENoaW5lc2VUb2tlbml6ZXIoKTtcbiAgICBpbnMuX3Rva2VuaXplID0gY2hpbmVzZVRva2VuaXplci5sb2FkKGRpY3QpO1xuICAgIHJldHVybiBpbnM7XG4gIH1cblxuICB0b2tlbml6ZShjb250ZW50OiBzdHJpbmcsIHJhdz86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGNvbnRlbnRcbiAgICAgIC5zcGxpdChyYXcgPyAvIC9nIDogdGhpcy5nZXRUcmltUGF0dGVybigpKVxuICAgICAgLmZpbHRlcigoeCkgPT4geCAhPT0gXCJcIilcbiAgICAgIC5mbGF0TWFwKCh4KSA9PiB0aGlzLl90b2tlbml6ZSh4KSlcbiAgICAgIC5tYXAoKHgpID0+IHgudGV4dCk7XG4gIH1cblxuICByZWN1cnNpdmVUb2tlbml6ZShjb250ZW50OiBzdHJpbmcpOiB7IHdvcmQ6IHN0cmluZzsgb2Zmc2V0OiBudW1iZXIgfVtdIHtcbiAgICBjb25zdCB0b2tlbnM6IHN0cmluZ1tdID0gdGhpcy5fdG9rZW5pemUoY29udGVudCkubWFwKCh4KSA9PiB4LnRleHQpO1xuXG4gICAgY29uc3QgcmV0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChcbiAgICAgICAgaSA9PT0gMCB8fFxuICAgICAgICB0b2tlbnNbaV0ubGVuZ3RoICE9PSAxIHx8XG4gICAgICAgICFCb29sZWFuKHRva2Vuc1tpXS5tYXRjaCh0aGlzLmdldFRyaW1QYXR0ZXJuKCkpKVxuICAgICAgKSB7XG4gICAgICAgIHJldC5wdXNoKHtcbiAgICAgICAgICB3b3JkOiB0b2tlbnMuc2xpY2UoaSkuam9pbihcIlwiKSxcbiAgICAgICAgICBvZmZzZXQ6IHRva2Vucy5zbGljZSgwLCBpKS5qb2luKFwiXCIpLmxlbmd0aCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGdldFRyaW1QYXR0ZXJuKCk6IFJlZ0V4cCB7XG4gICAgcmV0dXJuIFRSSU1fQ0hBUl9QQVRURVJOO1xuICB9XG5cbiAgc2hvdWxkSWdub3JlT25DdXJyZW50KHN0cjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iLCJpbXBvcnQgeyBBcmFiaWNUb2tlbml6ZXIgfSBmcm9tIFwiLi90b2tlbml6ZXJzL0FyYWJpY1Rva2VuaXplclwiO1xuaW1wb3J0IHsgRGVmYXVsdFRva2VuaXplciB9IGZyb20gXCIuL3Rva2VuaXplcnMvRGVmYXVsdFRva2VuaXplclwiO1xuaW1wb3J0IHsgSmFwYW5lc2VUb2tlbml6ZXIgfSBmcm9tIFwiLi90b2tlbml6ZXJzL0phcGFuZXNlVG9rZW5pemVyXCI7XG5pbXBvcnQgdHlwZSB7IFRva2VuaXplU3RyYXRlZ3kgfSBmcm9tIFwiLi9Ub2tlbml6ZVN0cmF0ZWd5XCI7XG5pbXBvcnQgeyBFbmdsaXNoT25seVRva2VuaXplciB9IGZyb20gXCIuL3Rva2VuaXplcnMvRW5nbGlzaE9ubHlUb2tlbml6ZXJcIjtcbmltcG9ydCB0eXBlIHsgQXBwIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBDaGluZXNlVG9rZW5pemVyIH0gZnJvbSBcIi4vdG9rZW5pemVycy9DaGluZXNlVG9rZW5pemVyXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVG9rZW5pemVyIHtcbiAgdG9rZW5pemUoY29udGVudDogc3RyaW5nLCByYXc/OiBib29sZWFuKTogc3RyaW5nW107XG4gIHJlY3Vyc2l2ZVRva2VuaXplKGNvbnRlbnQ6IHN0cmluZyk6IHsgd29yZDogc3RyaW5nOyBvZmZzZXQ6IG51bWJlciB9W107XG4gIGdldFRyaW1QYXR0ZXJuKCk6IFJlZ0V4cDtcbiAgc2hvdWxkSWdub3JlT25DdXJyZW50KHF1ZXJ5OiBzdHJpbmcpOiBib29sZWFuO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVG9rZW5pemVyKFxuICBzdHJhdGVneTogVG9rZW5pemVTdHJhdGVneSxcbiAgYXBwOiBBcHBcbik6IFByb21pc2U8VG9rZW5pemVyPiB7XG4gIHN3aXRjaCAoc3RyYXRlZ3kubmFtZSkge1xuICAgIGNhc2UgXCJkZWZhdWx0XCI6XG4gICAgICByZXR1cm4gbmV3IERlZmF1bHRUb2tlbml6ZXIoKTtcbiAgICBjYXNlIFwiZW5nbGlzaC1vbmx5XCI6XG4gICAgICByZXR1cm4gbmV3IEVuZ2xpc2hPbmx5VG9rZW5pemVyKCk7XG4gICAgY2FzZSBcImFyYWJpY1wiOlxuICAgICAgcmV0dXJuIG5ldyBBcmFiaWNUb2tlbml6ZXIoKTtcbiAgICBjYXNlIFwiamFwYW5lc2VcIjpcbiAgICAgIHJldHVybiBuZXcgSmFwYW5lc2VUb2tlbml6ZXIoKTtcbiAgICBjYXNlIFwiY2hpbmVzZVwiOlxuICAgICAgY29uc3QgaGFzQ2VkaWN0ID0gYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKFwiLi9jZWRpY3RfdHMudThcIik7XG4gICAgICBpZiAoIWhhc0NlZGljdCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXG4gICAgICAgICAgbmV3IEVycm9yKFwiY2VkaWN0X3RzLlU4IGRvZXNuJ3QgZXhpc3QgaW4geW91ciB2YXVsdCByb290LlwiKVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgY29uc3QgZGljdCA9IGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLnJlYWQoXCIuL2NlZGljdF90cy51OFwiKTtcbiAgICAgIHJldHVybiBDaGluZXNlVG9rZW5pemVyLmNyZWF0ZShkaWN0KTtcbiAgfVxufVxuIiwidHlwZSBOYW1lID0gXCJkZWZhdWx0XCIgfCBcImVuZ2xpc2gtb25seVwiIHwgXCJqYXBhbmVzZVwiIHwgXCJhcmFiaWNcIiB8IFwiY2hpbmVzZVwiO1xuXG5leHBvcnQgY2xhc3MgVG9rZW5pemVTdHJhdGVneSB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF92YWx1ZXM6IFRva2VuaXplU3RyYXRlZ3lbXSA9IFtdO1xuXG4gIHN0YXRpYyByZWFkb25seSBERUZBVUxUID0gbmV3IFRva2VuaXplU3RyYXRlZ3koXCJkZWZhdWx0XCIsIDMsIDUpO1xuICBzdGF0aWMgcmVhZG9ubHkgRU5HTElTSF9PTkxZID0gbmV3IFRva2VuaXplU3RyYXRlZ3koXCJlbmdsaXNoLW9ubHlcIiwgMywgNSk7XG4gIHN0YXRpYyByZWFkb25seSBKQVBBTkVTRSA9IG5ldyBUb2tlbml6ZVN0cmF0ZWd5KFwiamFwYW5lc2VcIiwgMiwgMik7XG4gIHN0YXRpYyByZWFkb25seSBBUkFCSUMgPSBuZXcgVG9rZW5pemVTdHJhdGVneShcImFyYWJpY1wiLCAzLCAzKTtcbiAgc3RhdGljIHJlYWRvbmx5IENISU5FU0UgPSBuZXcgVG9rZW5pemVTdHJhdGVneShcImNoaW5lc2VcIiwgMSwgMik7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBuYW1lOiBOYW1lLFxuICAgIHJlYWRvbmx5IHRyaWdnZXJUaHJlc2hvbGQ6IG51bWJlcixcbiAgICByZWFkb25seSBpbmRleGluZ1RocmVzaG9sZDogbnVtYmVyXG4gICkge1xuICAgIFRva2VuaXplU3RyYXRlZ3kuX3ZhbHVlcy5wdXNoKHRoaXMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21OYW1lKG5hbWU6IHN0cmluZyk6IFRva2VuaXplU3RyYXRlZ3kge1xuICAgIHJldHVybiBUb2tlbml6ZVN0cmF0ZWd5Ll92YWx1ZXMuZmluZCgoeCkgPT4geC5uYW1lID09PSBuYW1lKSE7XG4gIH1cblxuICBzdGF0aWMgdmFsdWVzKCk6IFRva2VuaXplU3RyYXRlZ3lbXSB7XG4gICAgcmV0dXJuIFRva2VuaXplU3RyYXRlZ3kuX3ZhbHVlcztcbiAgfVxufVxuIiwiaW1wb3J0IHtcbiAgQXBwLFxuICBFZGl0b3IsXG4gIHR5cGUgRWRpdG9yUG9zaXRpb24sXG4gIE1hcmtkb3duVmlldyxcbiAgbm9ybWFsaXplUGF0aCxcbiAgcGFyc2VGcm9udE1hdHRlckFsaWFzZXMsXG4gIHBhcnNlRnJvbnRNYXR0ZXJTdHJpbmdBcnJheSxcbiAgcGFyc2VGcm9udE1hdHRlclRhZ3MsXG4gIFRGaWxlLFxuICBWYXVsdCxcbn0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbmludGVyZmFjZSBVbnNhZmVBcHBJbnRlcmZhY2Uge1xuICB2YXVsdDogVmF1bHQgJiB7XG4gICAgY29uZmlnOiB7XG4gICAgICBzcGVsbGNoZWNrRGljdGlvbmFyeT86IHN0cmluZ1tdO1xuICAgICAgdXNlTWFya2Rvd25MaW5rcz86IGZhbHNlO1xuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIEZyb250TWF0dGVyVmFsdWUgPSBzdHJpbmdbXTtcblxuZXhwb3J0IGNsYXNzIEFwcEhlbHBlciB7XG4gIHByaXZhdGUgdW5zYWZlQXBwOiBBcHAgJiBVbnNhZmVBcHBJbnRlcmZhY2U7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHApIHtcbiAgICB0aGlzLnVuc2FmZUFwcCA9IGFwcCBhcyBhbnk7XG4gIH1cblxuICBlcXVhbHNBc0VkaXRvclBvc3Rpb24ob25lOiBFZGl0b3JQb3NpdGlvbiwgb3RoZXI6IEVkaXRvclBvc2l0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG9uZS5saW5lID09PSBvdGhlci5saW5lICYmIG9uZS5jaCA9PT0gb3RoZXIuY2g7XG4gIH1cblxuICBnZXRBbGlhc2VzKGZpbGU6IFRGaWxlKTogc3RyaW5nW10ge1xuICAgIHJldHVybiAoXG4gICAgICBwYXJzZUZyb250TWF0dGVyQWxpYXNlcyhcbiAgICAgICAgdGhpcy51bnNhZmVBcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk/LmZyb250bWF0dGVyXG4gICAgICApID8/IFtdXG4gICAgKTtcbiAgfVxuXG4gIGdldEZyb250TWF0dGVyKGZpbGU6IFRGaWxlKTogeyBba2V5OiBzdHJpbmddOiBGcm9udE1hdHRlclZhbHVlIH0gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGZyb250TWF0dGVyID1cbiAgICAgIHRoaXMudW5zYWZlQXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpPy5mcm9udG1hdHRlcjtcbiAgICBpZiAoIWZyb250TWF0dGVyKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSAjXG4gICAgY29uc3QgdGFncyA9XG4gICAgICBwYXJzZUZyb250TWF0dGVyVGFncyhmcm9udE1hdHRlcik/Lm1hcCgoeCkgPT4geC5zbGljZSgxKSkgPz8gW107XG4gICAgY29uc3QgYWxpYXNlcyA9IHBhcnNlRnJvbnRNYXR0ZXJBbGlhc2VzKGZyb250TWF0dGVyKSA/PyBbXTtcbiAgICBjb25zdCB7IHBvc2l0aW9uLCAuLi5yZXN0IH0gPSBmcm9udE1hdHRlcjtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyhyZXN0KS5tYXAoKFtrLCBfdl0pID0+IFtcbiAgICAgICAgICBrLFxuICAgICAgICAgIHBhcnNlRnJvbnRNYXR0ZXJTdHJpbmdBcnJheShmcm9udE1hdHRlciwgayksXG4gICAgICAgIF0pXG4gICAgICApLFxuICAgICAgdGFncyxcbiAgICAgIHRhZzogdGFncyxcbiAgICAgIGFsaWFzZXMsXG4gICAgICBhbGlhczogYWxpYXNlcyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0TWFya2Rvd25WaWV3SW5BY3RpdmVMZWFmKCk6IE1hcmtkb3duVmlldyB8IG51bGwge1xuICAgIGlmICghdGhpcy51bnNhZmVBcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudW5zYWZlQXBwLndvcmtzcGFjZS5hY3RpdmVMZWFmIS52aWV3IGFzIE1hcmtkb3duVmlldztcbiAgfVxuXG4gIGdldEFjdGl2ZUZpbGUoKTogVEZpbGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy51bnNhZmVBcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgfVxuXG4gIGlzQWN0aXZlRmlsZShmaWxlOiBURmlsZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldEFjdGl2ZUZpbGUoKT8ucGF0aCA9PT0gZmlsZS5wYXRoO1xuICB9XG5cbiAgZ2V0UHJldmlvdXNGaWxlKCk6IFRGaWxlIHwgbnVsbCB7XG4gICAgY29uc3QgZk5hbWUgPSB0aGlzLnVuc2FmZUFwcC53b3Jrc3BhY2UuZ2V0TGFzdE9wZW5GaWxlcygpPy5bMV07XG4gICAgaWYgKCFmTmFtZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFya2Rvd25GaWxlQnlQYXRoKGZOYW1lKTtcbiAgfVxuXG4gIGdldEN1cnJlbnREaXJuYW1lKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmdldEFjdGl2ZUZpbGUoKT8ucGFyZW50LnBhdGggPz8gbnVsbDtcbiAgfVxuXG4gIGdldEN1cnJlbnRFZGl0b3IoKTogRWRpdG9yIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFya2Rvd25WaWV3SW5BY3RpdmVMZWFmKCk/LmVkaXRvciA/PyBudWxsO1xuICB9XG5cbiAgZ2V0U2VsZWN0aW9uKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudEVkaXRvcigpPy5nZXRTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIGdldEN1cnJlbnRPZmZzZXQoZWRpdG9yOiBFZGl0b3IpOiBudW1iZXIge1xuICAgIHJldHVybiBlZGl0b3IucG9zVG9PZmZzZXQoZWRpdG9yLmdldEN1cnNvcigpKTtcbiAgfVxuXG4gIGdldEN1cnJlbnRMaW5lKGVkaXRvcjogRWRpdG9yKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZWRpdG9yLmdldExpbmUoZWRpdG9yLmdldEN1cnNvcigpLmxpbmUpO1xuICB9XG5cbiAgZ2V0Q3VycmVudExpbmVVbnRpbEN1cnNvcihlZGl0b3I6IEVkaXRvcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudExpbmUoZWRpdG9yKS5zbGljZSgwLCBlZGl0b3IuZ2V0Q3Vyc29yKCkuY2gpO1xuICB9XG5cbiAgb3B0aW1pemVNYXJrZG93bkxpbmtUZXh0KGxpbmtUZXh0OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBhY3RpdmVGaWxlID0gdGhpcy5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKCFhY3RpdmVGaWxlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBwYXRoID0gdGhpcy5saW5rVGV4dDJQYXRoKGxpbmtUZXh0KTtcbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgIHJldHVybiBsaW5rVGV4dDtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlID0gdGhpcy5nZXRNYXJrZG93bkZpbGVCeVBhdGgocGF0aCk7XG4gICAgaWYgKCFmaWxlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBtYXJrZG93bkxpbmsgPSB0aGlzLnVuc2FmZUFwcC5maWxlTWFuYWdlci5nZW5lcmF0ZU1hcmtkb3duTGluayhcbiAgICAgIGZpbGUsXG4gICAgICBhY3RpdmVGaWxlLnBhdGhcbiAgICApO1xuXG4gICAgcmV0dXJuIG1hcmtkb3duTGluay5zdGFydHNXaXRoKFwiW1tcIilcbiAgICAgID8gbWFya2Rvd25MaW5rLnJlcGxhY2UoXCJbW1wiLCBcIlwiKS5yZXBsYWNlKFwiXV1cIiwgXCJcIilcbiAgICAgIDogbWFya2Rvd25MaW5rLnJlcGxhY2UoXCJbXCIsIFwiXCIpLnJlcGxhY2UoL1xcXVxcKC4rXFwpL2csIFwiXCIpO1xuICB9XG5cbiAgbGlua1RleHQyUGF0aChsaW5rVGV4dDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgYWN0aXZlRmlsZSA9IHRoaXMuZ2V0QWN0aXZlRmlsZSgpO1xuICAgIGlmICghYWN0aXZlRmlsZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMudW5zYWZlQXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Rmlyc3RMaW5rcGF0aERlc3QoXG4gICAgICAgIGxpbmtUZXh0LFxuICAgICAgICBhY3RpdmVGaWxlLnBhdGhcbiAgICAgICk/LnBhdGggPz8gbnVsbFxuICAgICk7XG4gIH1cblxuICBzZWFyY2hQaGFudG9tTGlua3MoKTogeyBwYXRoOiBzdHJpbmc7IGxpbms6IHN0cmluZyB9W10ge1xuICAgIHJldHVybiBPYmplY3QuZW50cmllcyh0aGlzLnVuc2FmZUFwcC5tZXRhZGF0YUNhY2hlLnVucmVzb2x2ZWRMaW5rcykuZmxhdE1hcChcbiAgICAgIChbcGF0aCwgb2JqXSkgPT4gT2JqZWN0LmtleXMob2JqKS5tYXAoKGxpbmspID0+ICh7IHBhdGgsIGxpbmsgfSkpXG4gICAgKTtcbiAgfVxuXG4gIGdldE1hcmtkb3duRmlsZUJ5UGF0aChwYXRoOiBzdHJpbmcpOiBURmlsZSB8IG51bGwge1xuICAgIGlmICghcGF0aC5lbmRzV2l0aChcIi5tZFwiKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYWJzdHJhY3RGaWxlID0gdGhpcy51bnNhZmVBcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuICAgIGlmICghYWJzdHJhY3RGaWxlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gYWJzdHJhY3RGaWxlIGFzIFRGaWxlO1xuICB9XG5cbiAgb3Blbk1hcmtkb3duRmlsZShmaWxlOiBURmlsZSwgbmV3TGVhZjogYm9vbGVhbiwgb2Zmc2V0OiBudW1iZXIgPSAwKSB7XG4gICAgY29uc3QgbGVhZiA9IHRoaXMudW5zYWZlQXBwLndvcmtzcGFjZS5nZXRMZWFmKG5ld0xlYWYpO1xuXG4gICAgbGVhZlxuICAgICAgLm9wZW5GaWxlKGZpbGUsIHRoaXMudW5zYWZlQXBwLndvcmtzcGFjZS5hY3RpdmVMZWFmPy5nZXRWaWV3U3RhdGUoKSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy51bnNhZmVBcHAud29ya3NwYWNlLnNldEFjdGl2ZUxlYWYobGVhZiwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHZpZXdPZlR5cGUgPVxuICAgICAgICAgIHRoaXMudW5zYWZlQXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgICAgIGlmICh2aWV3T2ZUeXBlKSB7XG4gICAgICAgICAgY29uc3QgZWRpdG9yID0gdmlld09mVHlwZS5lZGl0b3I7XG4gICAgICAgICAgY29uc3QgcG9zID0gZWRpdG9yLm9mZnNldFRvUG9zKG9mZnNldCk7XG4gICAgICAgICAgZWRpdG9yLnNldEN1cnNvcihwb3MpO1xuICAgICAgICAgIGVkaXRvci5zY3JvbGxJbnRvVmlldyh7IGZyb206IHBvcywgdG86IHBvcyB9LCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBnZXRDdXJyZW50RnJvbnRNYXR0ZXIoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5nZXRDdXJyZW50RWRpdG9yKCk7XG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5nZXRBY3RpdmVGaWxlKCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChlZGl0b3IuZ2V0TGluZSgwKSAhPT0gXCItLS1cIikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGVuZFBvc2l0aW9uID0gZWRpdG9yLmdldFZhbHVlKCkuaW5kZXhPZihcIi0tLVwiLCAzKTtcblxuICAgIGNvbnN0IGN1cnJlbnRPZmZzZXQgPSB0aGlzLmdldEN1cnJlbnRPZmZzZXQoZWRpdG9yKTtcbiAgICBpZiAoZW5kUG9zaXRpb24gIT09IC0xICYmIGN1cnJlbnRPZmZzZXQgPj0gZW5kUG9zaXRpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGtleUxvY2F0aW9ucyA9IEFycmF5LmZyb20oZWRpdG9yLmdldFZhbHVlKCkubWF0Y2hBbGwoLy4rOi9nKSk7XG4gICAgaWYgKGtleUxvY2F0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRLZXlMb2NhdGlvbiA9IGtleUxvY2F0aW9uc1xuICAgICAgLmZpbHRlcigoeCkgPT4geC5pbmRleCEgPCBjdXJyZW50T2Zmc2V0KVxuICAgICAgLmxhc3QoKTtcbiAgICBpZiAoIWN1cnJlbnRLZXlMb2NhdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGN1cnJlbnRLZXlMb2NhdGlvblswXS5zcGxpdChcIjpcIilbMF07XG4gIH1cblxuICAvKipcbiAgICogVW5zYWZlIG1ldGhvZFxuICAgKi9cbiAgaXNJTUVPbigpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMudW5zYWZlQXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBtYXJrZG93blZpZXcgPSB0aGlzLnVuc2FmZUFwcC53b3Jrc3BhY2UuYWN0aXZlTGVhZiFcbiAgICAgIC52aWV3IGFzIE1hcmtkb3duVmlldztcbiAgICBjb25zdCBjbTVvcjY6IGFueSA9IChtYXJrZG93blZpZXcuZWRpdG9yIGFzIGFueSkuY207XG5cbiAgICAvLyBjbTZcbiAgICBpZiAoY201b3I2Py5pbnB1dFN0YXRlPy5jb21wb3NpbmcgPiAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBjbTVcbiAgICByZXR1cm4gISFjbTVvcjY/LmRpc3BsYXk/LmlucHV0Py5jb21wb3Npbmc7XG4gIH1cblxuICBhc3luYyB3cml0ZUxvZyhsb2c6IHN0cmluZykge1xuICAgIGF3YWl0IHRoaXMudW5zYWZlQXBwLnZhdWx0LmFkYXB0ZXIuYXBwZW5kKG5vcm1hbGl6ZVBhdGgoXCJsb2cubWRcIiksIGxvZyk7XG4gIH1cblxuICBnZXQgdXNlV2lraUxpbmtzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy51bnNhZmVBcHAudmF1bHQuY29uZmlnLnVzZU1hcmtkb3duTGlua3M7XG4gIH1cbn1cbiIsImV4cG9ydCBjb25zdCBrZXlCeSA9IDxUPihcbiAgdmFsdWVzOiBUW10sXG4gIHRvS2V5OiAodDogVCkgPT4gc3RyaW5nXG4pOiB7IFtrZXk6IHN0cmluZ106IFQgfSA9PlxuICB2YWx1ZXMucmVkdWNlKFxuICAgIChwcmV2LCBjdXIsIF8xLCBfMiwgayA9IHRvS2V5KGN1cikpID0+ICgocHJldltrXSA9IGN1ciksIHByZXYpLFxuICAgIHt9IGFzIHsgW2tleTogc3RyaW5nXTogVCB9XG4gICk7XG5cbmV4cG9ydCBjb25zdCBncm91cEJ5ID0gPFQ+KFxuICB2YWx1ZXM6IFRbXSxcbiAgdG9LZXk6ICh0OiBUKSA9PiBzdHJpbmdcbik6IHsgW2tleTogc3RyaW5nXTogVFtdIH0gPT5cbiAgdmFsdWVzLnJlZHVjZShcbiAgICAocHJldiwgY3VyLCBfMSwgXzIsIGsgPSB0b0tleShjdXIpKSA9PiAoXG4gICAgICAocHJldltrXSB8fCAocHJldltrXSA9IFtdKSkucHVzaChjdXIpLCBwcmV2XG4gICAgKSxcbiAgICB7fSBhcyB7IFtrZXk6IHN0cmluZ106IFRbXSB9XG4gICk7XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmlxPFQ+KHZhbHVlczogVFtdKTogVFtdIHtcbiAgcmV0dXJuIFsuLi5uZXcgU2V0KHZhbHVlcyldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5pcUJ5PFQ+KHZhbHVlczogVFtdLCBmbjogKHg6IFQpID0+IHN0cmluZyB8IG51bWJlcik6IFRbXSB7XG4gIGNvbnN0IG0gPSBuZXcgTWFwPHN0cmluZyB8IG51bWJlciwgVD4oKTtcbiAgdmFsdWVzLmZvckVhY2goKHgpID0+IHtcbiAgICBjb25zdCBrID0gZm4oeCk7XG4gICAgaWYgKCFtLmhhcyhrKSkge1xuICAgICAgbS5zZXQoaywgeCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIEFycmF5LmZyb20obS52YWx1ZXMoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmlxV2l0aDxUPihhcnI6IFRbXSwgZm46IChvbmU6IFQsIG90aGVyOiBUKSA9PiBib29sZWFuKSB7XG4gIHJldHVybiBhcnIuZmlsdGVyKFxuICAgIChlbGVtZW50LCBpbmRleCkgPT4gYXJyLmZpbmRJbmRleCgoc3RlcCkgPT4gZm4oZWxlbWVudCwgc3RlcCkpID09PSBpbmRleFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlFcXVhbHMoXG4gIGFycjE6IHVua25vd25bXSxcbiAgYXJyMjogdW5rbm93bltdLFxuICBsZW5ndGg/OiBudW1iZXJcbik6IGJvb2xlYW4ge1xuICBsZXQgbCA9IE1hdGgubWF4KGFycjEubGVuZ3RoLCBhcnIyLmxlbmd0aCk7XG4gIGlmIChsZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgIGwgPSBNYXRoLm1pbihsLCBsZW5ndGgpO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoYXJyMVtpXSAhPT0gYXJyMltpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlFcXVhbHNVbnRpbChhcnIxOiB1bmtub3duW10sIGFycjI6IHVua25vd25bXSk6IG51bWJlciB7XG4gIGxldCBsID0gTWF0aC5taW4oYXJyMS5sZW5ndGgsIGFycjIubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoYXJyMVtpXSAhPT0gYXJyMltpXSkge1xuICAgICAgcmV0dXJuIGkgLSAxO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsIC0gMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1pcnJvck1hcDxUPihcbiAgY29sbGVjdGlvbjogVFtdLFxuICB0b1ZhbHVlOiAodDogVCkgPT4gc3RyaW5nXG4pOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IHtcbiAgcmV0dXJuIGNvbGxlY3Rpb24ucmVkdWNlKChwLCBjKSA9PiAoeyAuLi5wLCBbdG9WYWx1ZShjKV06IHRvVmFsdWUoYykgfSksIHt9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1heChjb2xsZWN0aW9uOiBudW1iZXJbXSwgZW1wdHlWYWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3Qgc2VsZWN0ID0gKGE6IG51bWJlciwgYjogbnVtYmVyKSA9PiAoYSA+PSBiID8gYSA6IGIpO1xuICByZXR1cm4gY29sbGVjdGlvbi5yZWR1Y2Uoc2VsZWN0LCBlbXB0eVZhbHVlKTtcbn1cbiIsImV4cG9ydCB0eXBlIFdvcmRUeXBlID1cbiAgfCBcImN1cnJlbnRGaWxlXCJcbiAgfCBcImN1cnJlbnRWYXVsdFwiXG4gIHwgXCJjdXN0b21EaWN0aW9uYXJ5XCJcbiAgfCBcImludGVybmFsTGlua1wiXG4gIHwgXCJmcm9udE1hdHRlclwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRXb3JkIHtcbiAgdmFsdWU6IHN0cmluZztcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIGFsaWFzZXM/OiBzdHJpbmdbXTtcbiAgdHlwZTogV29yZFR5cGU7XG4gIGNyZWF0ZWRQYXRoOiBzdHJpbmc7XG4gIC8vIEFkZCBhZnRlciBqdWRnZVxuICBvZmZzZXQ/OiBudW1iZXI7XG4gIGhpdD86IHN0cmluZztcbn1cbmV4cG9ydCBpbnRlcmZhY2UgQ3VycmVudEZpbGVXb3JkIGV4dGVuZHMgRGVmYXVsdFdvcmQge1xuICB0eXBlOiBcImN1cnJlbnRGaWxlXCI7XG59XG5leHBvcnQgaW50ZXJmYWNlIEN1cnJlbnRWYXVsdFdvcmQgZXh0ZW5kcyBEZWZhdWx0V29yZCB7XG4gIHR5cGU6IFwiY3VycmVudFZhdWx0XCI7XG59XG5leHBvcnQgaW50ZXJmYWNlIEN1c3RvbURpY3Rpb25hcnlXb3JkIGV4dGVuZHMgRGVmYXVsdFdvcmQge1xuICB0eXBlOiBcImN1c3RvbURpY3Rpb25hcnlcIjtcbiAgY2FyZXRTeW1ib2w/OiBzdHJpbmc7XG4gIC8qKiBVc2UgZm9yIGluc2VydGluZyBpbnN0ZWFkIG9mIHZhbHVlICoqL1xuICBpbnNlcnRlZFRleHQ/OiBzdHJpbmc7XG4gIC8qKiBJZiB0cnVlLCBpZ25vcmUgYEluc2VydCBzcGFjZSBhZnRlciBjb21wbGV0aW9uYCBvcHRpb24gKiovXG4gIGlnbm9yZVNwYWNlQWZ0ZXJDb21wbGV0aW9uPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJuYWxMaW5rV29yZCBleHRlbmRzIERlZmF1bHRXb3JkIHtcbiAgdHlwZTogXCJpbnRlcm5hbExpbmtcIjtcbiAgcGhhbnRvbT86IGJvb2xlYW47XG4gIGFsaWFzTWV0YT86IHtcbiAgICAvLyBwYXRoXG4gICAgb3JpZ2luOiBzdHJpbmc7XG4gIH07XG59XG5leHBvcnQgaW50ZXJmYWNlIEZyb250TWF0dGVyV29yZCBleHRlbmRzIERlZmF1bHRXb3JkIHtcbiAgdHlwZTogXCJmcm9udE1hdHRlclwiO1xuICBrZXk6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgV29yZCA9XG4gIHwgQ3VycmVudEZpbGVXb3JkXG4gIHwgQ3VycmVudFZhdWx0V29yZFxuICB8IEN1c3RvbURpY3Rpb25hcnlXb3JkXG4gIHwgSW50ZXJuYWxMaW5rV29yZFxuICB8IEZyb250TWF0dGVyV29yZDtcblxuZXhwb3J0IGNsYXNzIFdvcmRUeXBlTWV0YSB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF92YWx1ZXM6IFdvcmRUeXBlTWV0YVtdID0gW107XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF9kaWN0OiB7IFt0eXBlOiBzdHJpbmddOiBXb3JkVHlwZU1ldGEgfSA9IHt9O1xuXG4gIHN0YXRpYyByZWFkb25seSBGUk9OVF9NQVRURVIgPSBuZXcgV29yZFR5cGVNZXRhKFxuICAgIFwiZnJvbnRNYXR0ZXJcIixcbiAgICAxMDAsXG4gICAgXCJmcm9udE1hdHRlclwiXG4gICk7XG4gIHN0YXRpYyByZWFkb25seSBJTlRFUk5BTF9MSU5LID0gbmV3IFdvcmRUeXBlTWV0YShcbiAgICBcImludGVybmFsTGlua1wiLFxuICAgIDkwLFxuICAgIFwiaW50ZXJuYWxMaW5rXCJcbiAgKTtcbiAgc3RhdGljIHJlYWRvbmx5IENVU1RPTV9ESUNUSU9OQVJZID0gbmV3IFdvcmRUeXBlTWV0YShcbiAgICBcImN1c3RvbURpY3Rpb25hcnlcIixcbiAgICA4MCxcbiAgICBcInN1Z2dlc3Rpb25cIlxuICApO1xuICBzdGF0aWMgcmVhZG9ubHkgQ1VSUkVOVF9GSUxFID0gbmV3IFdvcmRUeXBlTWV0YShcbiAgICBcImN1cnJlbnRGaWxlXCIsXG4gICAgNzAsXG4gICAgXCJzdWdnZXN0aW9uXCJcbiAgKTtcbiAgc3RhdGljIHJlYWRvbmx5IENVUlJFTlRfVkFVTFQgPSBuZXcgV29yZFR5cGVNZXRhKFxuICAgIFwiY3VycmVudFZhdWx0XCIsXG4gICAgNjAsXG4gICAgXCJzdWdnZXN0aW9uXCJcbiAgKTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHR5cGU6IFdvcmRUeXBlLFxuICAgIHJlYWRvbmx5IHByaW9yaXR5OiBudW1iZXIsXG4gICAgcmVhZG9ubHkgZ3JvdXA6IFwiZnJvbnRNYXR0ZXJcIiB8IFwiaW50ZXJuYWxMaW5rXCIgfCBcInN1Z2dlc3Rpb25cIlxuICApIHtcbiAgICBXb3JkVHlwZU1ldGEuX3ZhbHVlcy5wdXNoKHRoaXMpO1xuICAgIFdvcmRUeXBlTWV0YS5fZGljdFt0eXBlXSA9IHRoaXM7XG4gIH1cblxuICBzdGF0aWMgb2YodHlwZTogV29yZFR5cGUpOiBXb3JkVHlwZU1ldGEge1xuICAgIHJldHVybiBXb3JkVHlwZU1ldGEuX2RpY3RbdHlwZV07XG4gIH1cblxuICBzdGF0aWMgdmFsdWVzKCk6IFdvcmRUeXBlTWV0YVtdIHtcbiAgICByZXR1cm4gV29yZFR5cGVNZXRhLl92YWx1ZXM7XG4gIH1cbn1cbiIsImltcG9ydCB7XG4gIGNhcGl0YWxpemVGaXJzdExldHRlcixcbiAgbG93ZXJJbmNsdWRlcyxcbiAgbG93ZXJTdGFydHNXaXRoLFxufSBmcm9tIFwiLi4vdXRpbC9zdHJpbmdzXCI7XG5pbXBvcnQgdHlwZSB7IEluZGV4ZWRXb3JkcyB9IGZyb20gXCIuLi91aS9BdXRvQ29tcGxldGVTdWdnZXN0XCI7XG5pbXBvcnQgeyBtYXgsIHVuaXFXaXRoIH0gZnJvbSBcIi4uL3V0aWwvY29sbGVjdGlvbi1oZWxwZXJcIjtcbmltcG9ydCB7IHR5cGUgV29yZCwgV29yZFR5cGVNZXRhIH0gZnJvbSBcIi4uL21vZGVsL1dvcmRcIjtcbmltcG9ydCB0eXBlIHtcbiAgSGl0V29yZCxcbiAgU2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2UsXG59IGZyb20gXCIuLi9zdG9yYWdlL1NlbGVjdGlvbkhpc3RvcnlTdG9yYWdlXCI7XG5cbmV4cG9ydCB0eXBlIFdvcmRzQnlGaXJzdExldHRlciA9IHsgW2ZpcnN0TGV0dGVyOiBzdHJpbmddOiBXb3JkW10gfTtcblxuaW50ZXJmYWNlIEp1ZGdlbWVudCB7XG4gIC8vIFRPRE86IHdhbnQgdG8gcmVwbGFjZSB0byBIaXRXb3JkXG4gIHdvcmQ6IFdvcmQ7XG4gIC8vIFRPRE86IHJlbW92ZSB2YWx1ZS4gdXNlIHdvcmQuaGl0IGluc3RlYWRcbiAgdmFsdWU/OiBzdHJpbmc7XG4gIGFsaWFzOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGlvblVuaXFQcmVkaWNhdGUoYTogV29yZCwgYjogV29yZCkge1xuICBpZiAoYS52YWx1ZSAhPT0gYi52YWx1ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChXb3JkVHlwZU1ldGEub2YoYS50eXBlKS5ncm91cCAhPT0gV29yZFR5cGVNZXRhLm9mKGIudHlwZSkuZ3JvdXApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoXG4gICAgYS50eXBlID09PSBcImludGVybmFsTGlua1wiICYmXG4gICAgIWEucGhhbnRvbSAmJlxuICAgIGEuY3JlYXRlZFBhdGggIT09IGIuY3JlYXRlZFBhdGhcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwdXNoV29yZChcbiAgd29yZHNCeUZpcnN0TGV0dGVyOiBXb3Jkc0J5Rmlyc3RMZXR0ZXIsXG4gIGtleTogc3RyaW5nLFxuICB3b3JkOiBXb3JkXG4pIHtcbiAgaWYgKHdvcmRzQnlGaXJzdExldHRlcltrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICB3b3Jkc0J5Rmlyc3RMZXR0ZXJba2V5XSA9IFt3b3JkXTtcbiAgICByZXR1cm47XG4gIH1cblxuICB3b3Jkc0J5Rmlyc3RMZXR0ZXJba2V5XS5wdXNoKHdvcmQpO1xufVxuXG4vLyBQdWJsaWMgZm9yIHRlc3RzXG5leHBvcnQgZnVuY3Rpb24ganVkZ2UoXG4gIHdvcmQ6IFdvcmQsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIHF1ZXJ5U3RhcnRXaXRoVXBwZXI6IGJvb2xlYW5cbik6IEp1ZGdlbWVudCB7XG4gIGlmIChxdWVyeSA9PT0gXCJcIikge1xuICAgIHJldHVybiB7XG4gICAgICB3b3JkOiB7XG4gICAgICAgIC4uLndvcmQsXG4gICAgICAgIGhpdDogd29yZC52YWx1ZSxcbiAgICAgIH0sXG4gICAgICB2YWx1ZTogd29yZC52YWx1ZSxcbiAgICAgIGFsaWFzOiBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgaWYgKGxvd2VyU3RhcnRzV2l0aCh3b3JkLnZhbHVlLCBxdWVyeSkpIHtcbiAgICBpZiAoXG4gICAgICBxdWVyeVN0YXJ0V2l0aFVwcGVyICYmXG4gICAgICB3b3JkLnR5cGUgIT09IFwiaW50ZXJuYWxMaW5rXCIgJiZcbiAgICAgIHdvcmQudHlwZSAhPT0gXCJmcm9udE1hdHRlclwiXG4gICAgKSB7XG4gICAgICBjb25zdCBjID0gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHdvcmQudmFsdWUpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd29yZDoge1xuICAgICAgICAgIC4uLndvcmQsXG4gICAgICAgICAgdmFsdWU6IGMsXG4gICAgICAgICAgaGl0OiBjLFxuICAgICAgICB9LFxuICAgICAgICB2YWx1ZTogYyxcbiAgICAgICAgYWxpYXM6IGZhbHNlLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd29yZDoge1xuICAgICAgICAgIC4uLndvcmQsXG4gICAgICAgICAgaGl0OiB3b3JkLnZhbHVlLFxuICAgICAgICB9LFxuICAgICAgICB2YWx1ZTogd29yZC52YWx1ZSxcbiAgICAgICAgYWxpYXM6IGZhbHNlLFxuICAgICAgfTtcbiAgICB9XG4gIH1cbiAgY29uc3QgbWF0Y2hlZEFsaWFzID0gd29yZC5hbGlhc2VzPy5maW5kKChhKSA9PiBsb3dlclN0YXJ0c1dpdGgoYSwgcXVlcnkpKTtcbiAgaWYgKG1hdGNoZWRBbGlhcykge1xuICAgIHJldHVybiB7XG4gICAgICB3b3JkOiB7XG4gICAgICAgIC4uLndvcmQsXG4gICAgICAgIGhpdDogbWF0Y2hlZEFsaWFzLFxuICAgICAgfSxcbiAgICAgIHZhbHVlOiBtYXRjaGVkQWxpYXMsXG4gICAgICBhbGlhczogdHJ1ZSxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB3b3JkLFxuICAgIGFsaWFzOiBmYWxzZSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Z2dlc3RXb3JkcyhcbiAgaW5kZXhlZFdvcmRzOiBJbmRleGVkV29yZHMsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIG1heE51bTogbnVtYmVyLFxuICBvcHRpb246IHtcbiAgICBmcm9udE1hdHRlcj86IHN0cmluZztcbiAgICBzZWxlY3Rpb25IaXN0b3J5U3RvcmFnZT86IFNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlO1xuICB9ID0ge31cbik6IFdvcmRbXSB7XG4gIGNvbnN0IHsgZnJvbnRNYXR0ZXIsIHNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlIH0gPSBvcHRpb247XG4gIGNvbnN0IHF1ZXJ5U3RhcnRXaXRoVXBwZXIgPSBjYXBpdGFsaXplRmlyc3RMZXR0ZXIocXVlcnkpID09PSBxdWVyeTtcblxuICBjb25zdCBmbGF0dGVuRnJvbnRNYXR0ZXJXb3JkcyA9ICgpID0+IHtcbiAgICBpZiAoZnJvbnRNYXR0ZXIgPT09IFwiYWxpYXNcIiB8fCBmcm9udE1hdHRlciA9PT0gXCJhbGlhc2VzXCIpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKGZyb250TWF0dGVyICYmIGluZGV4ZWRXb3Jkcy5mcm9udE1hdHRlcj8uW2Zyb250TWF0dGVyXSkge1xuICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoaW5kZXhlZFdvcmRzLmZyb250TWF0dGVyPy5bZnJvbnRNYXR0ZXJdKS5mbGF0KCk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfTtcblxuICBjb25zdCB3b3JkcyA9IHF1ZXJ5U3RhcnRXaXRoVXBwZXJcbiAgICA/IGZyb250TWF0dGVyXG4gICAgICA/IGZsYXR0ZW5Gcm9udE1hdHRlcldvcmRzKClcbiAgICAgIDogW1xuICAgICAgICAgIC4uLihpbmRleGVkV29yZHMuY3VycmVudEZpbGVbcXVlcnkuY2hhckF0KDApXSA/PyBbXSksXG4gICAgICAgICAgLi4uKGluZGV4ZWRXb3Jkcy5jdXJyZW50RmlsZVtxdWVyeS5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKV0gPz8gW10pLFxuICAgICAgICAgIC4uLihpbmRleGVkV29yZHMuY3VycmVudFZhdWx0W3F1ZXJ5LmNoYXJBdCgwKV0gPz8gW10pLFxuICAgICAgICAgIC4uLihpbmRleGVkV29yZHMuY3VycmVudFZhdWx0W3F1ZXJ5LmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpXSA/PyBbXSksXG4gICAgICAgICAgLi4uKGluZGV4ZWRXb3Jkcy5jdXN0b21EaWN0aW9uYXJ5W3F1ZXJ5LmNoYXJBdCgwKV0gPz8gW10pLFxuICAgICAgICAgIC4uLihpbmRleGVkV29yZHMuY3VzdG9tRGljdGlvbmFyeVtxdWVyeS5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKV0gPz9cbiAgICAgICAgICAgIFtdKSxcbiAgICAgICAgICAuLi4oaW5kZXhlZFdvcmRzLmludGVybmFsTGlua1txdWVyeS5jaGFyQXQoMCldID8/IFtdKSxcbiAgICAgICAgICAuLi4oaW5kZXhlZFdvcmRzLmludGVybmFsTGlua1txdWVyeS5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKV0gPz8gW10pLFxuICAgICAgICBdXG4gICAgOiBmcm9udE1hdHRlclxuICAgID8gZmxhdHRlbkZyb250TWF0dGVyV29yZHMoKVxuICAgIDogW1xuICAgICAgICAuLi4oaW5kZXhlZFdvcmRzLmN1cnJlbnRGaWxlW3F1ZXJ5LmNoYXJBdCgwKV0gPz8gW10pLFxuICAgICAgICAuLi4oaW5kZXhlZFdvcmRzLmN1cnJlbnRGaWxlW3F1ZXJ5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpXSA/PyBbXSksXG4gICAgICAgIC4uLihpbmRleGVkV29yZHMuY3VycmVudFZhdWx0W3F1ZXJ5LmNoYXJBdCgwKV0gPz8gW10pLFxuICAgICAgICAuLi4oaW5kZXhlZFdvcmRzLmN1cnJlbnRWYXVsdFtxdWVyeS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKV0gPz8gW10pLFxuICAgICAgICAuLi4oaW5kZXhlZFdvcmRzLmN1c3RvbURpY3Rpb25hcnlbcXVlcnkuY2hhckF0KDApXSA/PyBbXSksXG4gICAgICAgIC4uLihpbmRleGVkV29yZHMuY3VzdG9tRGljdGlvbmFyeVtxdWVyeS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKV0gPz8gW10pLFxuICAgICAgICAuLi4oaW5kZXhlZFdvcmRzLmludGVybmFsTGlua1txdWVyeS5jaGFyQXQoMCldID8/IFtdKSxcbiAgICAgICAgLi4uKGluZGV4ZWRXb3Jkcy5pbnRlcm5hbExpbmtbcXVlcnkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCldID8/IFtdKSxcbiAgICAgIF07XG5cbiAgY29uc3QgZmlsdGVyZWRKdWRnZW1lbnQgPSBBcnJheS5mcm9tKHdvcmRzKVxuICAgIC5tYXAoKHgpID0+IGp1ZGdlKHgsIHF1ZXJ5LCBxdWVyeVN0YXJ0V2l0aFVwcGVyKSlcbiAgICAuZmlsdGVyKCh4KSA9PiB4LnZhbHVlICE9PSB1bmRlZmluZWQpO1xuXG4gIGNvbnN0IGxhdGVzdFVwZGF0ZWQgPSBtYXgoXG4gICAgZmlsdGVyZWRKdWRnZW1lbnQubWFwKFxuICAgICAgKHgpID0+XG4gICAgICAgIHNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlPy5nZXRTZWxlY3Rpb25IaXN0b3J5KHgud29yZCBhcyBIaXRXb3JkKVxuICAgICAgICAgID8ubGFzdFVwZGF0ZWQgPz8gMFxuICAgICksXG4gICAgMFxuICApO1xuXG4gIGNvbnN0IGNhbmRpZGF0ZSA9IGZpbHRlcmVkSnVkZ2VtZW50XG4gICAgLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGNvbnN0IGFXb3JkID0gYS53b3JkIGFzIEhpdFdvcmQ7XG4gICAgICBjb25zdCBiV29yZCA9IGIud29yZCBhcyBIaXRXb3JkO1xuXG4gICAgICBjb25zdCBub3RTYW1lV29yZFR5cGUgPSBhV29yZC50eXBlICE9PSBiV29yZC50eXBlO1xuICAgICAgaWYgKGZyb250TWF0dGVyICYmIG5vdFNhbWVXb3JkVHlwZSkge1xuICAgICAgICByZXR1cm4gYldvcmQudHlwZSA9PT0gXCJmcm9udE1hdHRlclwiID8gMSA6IC0xO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2UpIHtcbiAgICAgICAgY29uc3QgcmV0ID0gc2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2UuY29tcGFyZShcbiAgICAgICAgICBhV29yZCxcbiAgICAgICAgICBiV29yZCxcbiAgICAgICAgICBsYXRlc3RVcGRhdGVkXG4gICAgICAgICk7XG4gICAgICAgIGlmIChyZXQgIT09IDApIHtcbiAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChhLnZhbHVlIS5sZW5ndGggIT09IGIudmFsdWUhLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gYS52YWx1ZSEubGVuZ3RoID4gYi52YWx1ZSEubGVuZ3RoID8gMSA6IC0xO1xuICAgICAgfVxuICAgICAgaWYgKG5vdFNhbWVXb3JkVHlwZSkge1xuICAgICAgICByZXR1cm4gV29yZFR5cGVNZXRhLm9mKGJXb3JkLnR5cGUpLnByaW9yaXR5ID5cbiAgICAgICAgICBXb3JkVHlwZU1ldGEub2YoYVdvcmQudHlwZSkucHJpb3JpdHlcbiAgICAgICAgICA/IDFcbiAgICAgICAgICA6IC0xO1xuICAgICAgfVxuICAgICAgaWYgKGEuYWxpYXMgIT09IGIuYWxpYXMpIHtcbiAgICAgICAgcmV0dXJuIGEuYWxpYXMgPyAxIDogLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gMDtcbiAgICB9KVxuICAgIC5tYXAoKHgpID0+IHgud29yZClcbiAgICAuc2xpY2UoMCwgbWF4TnVtKTtcblxuICAvLyBYWFg6IFRoZXJlIGlzIG5vIGd1YXJhbnRlZSB0aGF0IGVxdWFscyB3aXRoIG1heCwgYnV0IGl0IGlzIGltcG9ydGFudCBmb3IgcGVyZm9ybWFuY2VcbiAgcmV0dXJuIHVuaXFXaXRoKGNhbmRpZGF0ZSwgc3VnZ2VzdGlvblVuaXFQcmVkaWNhdGUpO1xufVxuXG4vLyBUT0RPOiByZWZhY3RvcmluZ1xuLy8gUHVibGljIGZvciB0ZXN0c1xuZXhwb3J0IGZ1bmN0aW9uIGp1ZGdlQnlQYXJ0aWFsTWF0Y2goXG4gIHdvcmQ6IFdvcmQsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIHF1ZXJ5U3RhcnRXaXRoVXBwZXI6IGJvb2xlYW5cbik6IEp1ZGdlbWVudCB7XG4gIGlmIChxdWVyeSA9PT0gXCJcIikge1xuICAgIHJldHVybiB7XG4gICAgICB3b3JkOiB7IC4uLndvcmQsIGhpdDogd29yZC52YWx1ZSB9LFxuICAgICAgdmFsdWU6IHdvcmQudmFsdWUsXG4gICAgICBhbGlhczogZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIGlmIChsb3dlclN0YXJ0c1dpdGgod29yZC52YWx1ZSwgcXVlcnkpKSB7XG4gICAgaWYgKFxuICAgICAgcXVlcnlTdGFydFdpdGhVcHBlciAmJlxuICAgICAgd29yZC50eXBlICE9PSBcImludGVybmFsTGlua1wiICYmXG4gICAgICB3b3JkLnR5cGUgIT09IFwiZnJvbnRNYXR0ZXJcIlxuICAgICkge1xuICAgICAgY29uc3QgYyA9IGNhcGl0YWxpemVGaXJzdExldHRlcih3b3JkLnZhbHVlKTtcbiAgICAgIHJldHVybiB7IHdvcmQ6IHsgLi4ud29yZCwgdmFsdWU6IGMsIGhpdDogYyB9LCB2YWx1ZTogYywgYWxpYXM6IGZhbHNlIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdvcmQ6IHsgLi4ud29yZCwgaGl0OiB3b3JkLnZhbHVlIH0sXG4gICAgICAgIHZhbHVlOiB3b3JkLnZhbHVlLFxuICAgICAgICBhbGlhczogZmFsc2UsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1hdGNoZWRBbGlhc1N0YXJ0cyA9IHdvcmQuYWxpYXNlcz8uZmluZCgoYSkgPT5cbiAgICBsb3dlclN0YXJ0c1dpdGgoYSwgcXVlcnkpXG4gICk7XG4gIGlmIChtYXRjaGVkQWxpYXNTdGFydHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd29yZDogeyAuLi53b3JkLCBoaXQ6IG1hdGNoZWRBbGlhc1N0YXJ0cyB9LFxuICAgICAgdmFsdWU6IG1hdGNoZWRBbGlhc1N0YXJ0cyxcbiAgICAgIGFsaWFzOiB0cnVlLFxuICAgIH07XG4gIH1cblxuICBpZiAobG93ZXJJbmNsdWRlcyh3b3JkLnZhbHVlLCBxdWVyeSkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd29yZDogeyAuLi53b3JkLCBoaXQ6IHdvcmQudmFsdWUgfSxcbiAgICAgIHZhbHVlOiB3b3JkLnZhbHVlLFxuICAgICAgYWxpYXM6IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICBjb25zdCBtYXRjaGVkQWxpYXNJbmNsdWRlZCA9IHdvcmQuYWxpYXNlcz8uZmluZCgoYSkgPT5cbiAgICBsb3dlckluY2x1ZGVzKGEsIHF1ZXJ5KVxuICApO1xuICBpZiAobWF0Y2hlZEFsaWFzSW5jbHVkZWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd29yZDogeyAuLi53b3JkLCBoaXQ6IG1hdGNoZWRBbGlhc0luY2x1ZGVkIH0sXG4gICAgICB2YWx1ZTogbWF0Y2hlZEFsaWFzSW5jbHVkZWQsXG4gICAgICBhbGlhczogdHJ1ZSxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHsgd29yZDogd29yZCwgYWxpYXM6IGZhbHNlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWdnZXN0V29yZHNCeVBhcnRpYWxNYXRjaChcbiAgaW5kZXhlZFdvcmRzOiBJbmRleGVkV29yZHMsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIG1heE51bTogbnVtYmVyLFxuICBvcHRpb246IHtcbiAgICBmcm9udE1hdHRlcj86IHN0cmluZztcbiAgICBzZWxlY3Rpb25IaXN0b3J5U3RvcmFnZT86IFNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlO1xuICB9ID0ge31cbik6IFdvcmRbXSB7XG4gIGNvbnN0IHsgZnJvbnRNYXR0ZXIsIHNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlIH0gPSBvcHRpb247XG4gIGNvbnN0IHF1ZXJ5U3RhcnRXaXRoVXBwZXIgPSBjYXBpdGFsaXplRmlyc3RMZXR0ZXIocXVlcnkpID09PSBxdWVyeTtcblxuICBjb25zdCBmbGF0T2JqZWN0VmFsdWVzID0gKG9iamVjdDogeyBbZmlyc3RMZXR0ZXI6IHN0cmluZ106IFdvcmRbXSB9KSA9PlxuICAgIE9iamVjdC52YWx1ZXMob2JqZWN0KS5mbGF0KCk7XG5cbiAgY29uc3QgZmxhdHRlbkZyb250TWF0dGVyV29yZHMgPSAoKSA9PiB7XG4gICAgaWYgKGZyb250TWF0dGVyID09PSBcImFsaWFzXCIgfHwgZnJvbnRNYXR0ZXIgPT09IFwiYWxpYXNlc1wiKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmIChmcm9udE1hdHRlciAmJiBpbmRleGVkV29yZHMuZnJvbnRNYXR0ZXI/Lltmcm9udE1hdHRlcl0pIHtcbiAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKGluZGV4ZWRXb3Jkcy5mcm9udE1hdHRlcj8uW2Zyb250TWF0dGVyXSkuZmxhdCgpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH07XG5cbiAgY29uc3Qgd29yZHMgPSBmcm9udE1hdHRlclxuICAgID8gZmxhdHRlbkZyb250TWF0dGVyV29yZHMoKVxuICAgIDogW1xuICAgICAgICAuLi5mbGF0T2JqZWN0VmFsdWVzKGluZGV4ZWRXb3Jkcy5jdXJyZW50RmlsZSksXG4gICAgICAgIC4uLmZsYXRPYmplY3RWYWx1ZXMoaW5kZXhlZFdvcmRzLmN1cnJlbnRWYXVsdCksXG4gICAgICAgIC4uLmZsYXRPYmplY3RWYWx1ZXMoaW5kZXhlZFdvcmRzLmN1c3RvbURpY3Rpb25hcnkpLFxuICAgICAgICAuLi5mbGF0T2JqZWN0VmFsdWVzKGluZGV4ZWRXb3Jkcy5pbnRlcm5hbExpbmspLFxuICAgICAgXTtcbiAgY29uc3QgZmlsdGVyZWRKdWRnZW1lbnQgPSBBcnJheS5mcm9tKHdvcmRzKVxuICAgIC5tYXAoKHgpID0+IGp1ZGdlQnlQYXJ0aWFsTWF0Y2goeCwgcXVlcnksIHF1ZXJ5U3RhcnRXaXRoVXBwZXIpKVxuICAgIC5maWx0ZXIoKHgpID0+IHgudmFsdWUgIT09IHVuZGVmaW5lZCk7XG5cbiAgY29uc3QgbGF0ZXN0VXBkYXRlZCA9IG1heChcbiAgICBmaWx0ZXJlZEp1ZGdlbWVudC5tYXAoXG4gICAgICAoeCkgPT5cbiAgICAgICAgc2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2U/LmdldFNlbGVjdGlvbkhpc3RvcnkoeC53b3JkIGFzIEhpdFdvcmQpXG4gICAgICAgICAgPy5sYXN0VXBkYXRlZCA/PyAwXG4gICAgKSxcbiAgICAwXG4gICk7XG5cbiAgY29uc3QgY2FuZGlkYXRlID0gZmlsdGVyZWRKdWRnZW1lbnRcbiAgICAuc29ydCgoYSwgYikgPT4ge1xuICAgICAgY29uc3QgYVdvcmQgPSBhLndvcmQgYXMgSGl0V29yZDtcbiAgICAgIGNvbnN0IGJXb3JkID0gYi53b3JkIGFzIEhpdFdvcmQ7XG5cbiAgICAgIGNvbnN0IG5vdFNhbWVXb3JkVHlwZSA9IGFXb3JkLnR5cGUgIT09IGJXb3JkLnR5cGU7XG4gICAgICBpZiAoZnJvbnRNYXR0ZXIgJiYgbm90U2FtZVdvcmRUeXBlKSB7XG4gICAgICAgIHJldHVybiBiV29yZC50eXBlID09PSBcImZyb250TWF0dGVyXCIgPyAxIDogLTE7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxlY3Rpb25IaXN0b3J5U3RvcmFnZSkge1xuICAgICAgICBjb25zdCByZXQgPSBzZWxlY3Rpb25IaXN0b3J5U3RvcmFnZS5jb21wYXJlKFxuICAgICAgICAgIGFXb3JkLFxuICAgICAgICAgIGJXb3JkLFxuICAgICAgICAgIGxhdGVzdFVwZGF0ZWRcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHJldCAhPT0gMCkge1xuICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgYXMgPSBsb3dlclN0YXJ0c1dpdGgoYS52YWx1ZSEsIHF1ZXJ5KTtcbiAgICAgIGNvbnN0IGJzID0gbG93ZXJTdGFydHNXaXRoKGIudmFsdWUhLCBxdWVyeSk7XG4gICAgICBpZiAoYXMgIT09IGJzKSB7XG4gICAgICAgIHJldHVybiBicyA/IDEgOiAtMTtcbiAgICAgIH1cblxuICAgICAgaWYgKGEudmFsdWUhLmxlbmd0aCAhPT0gYi52YWx1ZSEubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBhLnZhbHVlIS5sZW5ndGggPiBiLnZhbHVlIS5sZW5ndGggPyAxIDogLTE7XG4gICAgICB9XG4gICAgICBpZiAobm90U2FtZVdvcmRUeXBlKSB7XG4gICAgICAgIHJldHVybiBXb3JkVHlwZU1ldGEub2YoYldvcmQudHlwZSkucHJpb3JpdHkgPlxuICAgICAgICAgIFdvcmRUeXBlTWV0YS5vZihhV29yZC50eXBlKS5wcmlvcml0eVxuICAgICAgICAgID8gMVxuICAgICAgICAgIDogLTE7XG4gICAgICB9XG4gICAgICBpZiAoYS5hbGlhcyAhPT0gYi5hbGlhcykge1xuICAgICAgICByZXR1cm4gYS5hbGlhcyA/IDEgOiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAwO1xuICAgIH0pXG4gICAgLm1hcCgoeCkgPT4geC53b3JkKVxuICAgIC5zbGljZSgwLCBtYXhOdW0pO1xuXG4gIC8vIFhYWDogVGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgZXF1YWxzIHdpdGggbWF4LCBidXQgaXQgaXMgaW1wb3J0YW50IGZvciBwZXJmb3JtYW5jZVxuICByZXR1cm4gdW5pcVdpdGgoY2FuZGlkYXRlLCBzdWdnZXN0aW9uVW5pcVByZWRpY2F0ZSk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gYmFzZW5hbWUocGF0aDogc3RyaW5nLCBleHQ/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBuYW1lID0gcGF0aC5tYXRjaCgvLitbXFxcXC9dKFteXFxcXC9dKylbXFxcXC9dPyQvKT8uWzFdID8/IHBhdGg7XG4gIHJldHVybiBleHQgJiYgbmFtZS5lbmRzV2l0aChleHQpID8gbmFtZS5yZXBsYWNlKGV4dCwgXCJcIikgOiBuYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0bmFtZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBleHQgPSBiYXNlbmFtZShwYXRoKS5zcGxpdChcIi5cIikuc2xpY2UoMSkucG9wKCk7XG4gIHJldHVybiBleHQgPyBgLiR7ZXh0fWAgOiBcIlwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlybmFtZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcGF0aC5tYXRjaCgvKC4rKVtcXFxcL10uKyQvKT8uWzFdID8/IFwiLlwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNVUkwocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBCb29sZWFuKHBhdGgubWF0Y2gobmV3IFJlZ0V4cChcIl5odHRwcz86Ly9cIikpKTtcbn1cbiIsImltcG9ydCB7IEFwcCwgRmlsZVN5c3RlbUFkYXB0ZXIsIE5vdGljZSwgcmVxdWVzdCB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHsgcHVzaFdvcmQsIHR5cGUgV29yZHNCeUZpcnN0TGV0dGVyIH0gZnJvbSBcIi4vc3VnZ2VzdGVyXCI7XG5pbXBvcnQgdHlwZSB7IENvbHVtbkRlbGltaXRlciB9IGZyb20gXCIuLi9vcHRpb24vQ29sdW1uRGVsaW1pdGVyXCI7XG5pbXBvcnQgeyBpc1VSTCB9IGZyb20gXCIuLi91dGlsL3BhdGhcIjtcbmltcG9ydCB0eXBlIHsgQ3VzdG9tRGljdGlvbmFyeVdvcmQgfSBmcm9tIFwiLi4vbW9kZWwvV29yZFwiO1xuaW1wb3J0IHsgZXhjbHVkZUVtb2ppIH0gZnJvbSBcIi4uL3V0aWwvc3RyaW5nc1wiO1xuaW1wb3J0IHR5cGUgeyBBcHBIZWxwZXIgfSBmcm9tIFwiLi4vYXBwLWhlbHBlclwiO1xuXG50eXBlIEpzb25EaWN0aW9uYXJ5ID0ge1xuICAvKiogSWYgc2V0LCB0YWtlIHByZWNlZGVuY2Ugb3ZlciBbXCJDYXJldCBsb2NhdGlvbiBzeW1ib2wgYWZ0ZXIgY29tcGxlbWVudFwiXShodHRwczovL3RhZGFzaGktYWlrYXdhLmdpdGh1Yi5pby9kb2NzLW9ic2lkaWFuLXZhcmlvdXMtY29tcGxlbWVudHMtcGx1Z2luLzQuJTIwT3B0aW9ucy80LjYuJTIwQ3VzdG9tJTIwZGljdGlvbmFyeSUyMGNvbXBsZW1lbnQvJUUyJTlBJTk5JUVGJUI4JThGQ2FyZXQlMjBsb2NhdGlvbiUyMHN5bWJvbCUyMGFmdGVyJTIwY29tcGxlbWVudC8pICovXG4gIGNhcmV0U3ltYm9sPzogc3RyaW5nO1xuICAvKiogSWYgc2V0LCBpZ25vcmUgW1wiSW5zZXJ0IHNwYWNlIGFmdGVyIGNvbXBsZXRpb25cIl0oaHR0cHM6Ly90YWRhc2hpLWFpa2F3YS5naXRodWIuaW8vZG9jcy1vYnNpZGlhbi12YXJpb3VzLWNvbXBsZW1lbnRzLXBsdWdpbi80LiUyME9wdGlvbnMvNC4xLiUyME1haW4vJUUyJTlBJTk5JUVGJUI4JThGSW5zZXJ0JTIwc3BhY2UlMjBhZnRlciUyMGNvbXBsZXRpb24vKSAqL1xuICBpZ25vcmVTcGFjZUFmdGVyQ29tcGxldGlvbj86IGJvb2xlYW47XG4gIHdvcmRzOiB7XG4gICAgdmFsdWU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgICBhbGlhc2VzPzogc3RyaW5nW107XG4gICAgLyoqIElmIHNldCwgdXNlIHRoaXMgdmFsdWUgZm9yIHNlYXJjaGluZyBhbmQgcmVuZGVyaW5nIGluc3RlYWQgb2YgYHZhbHVlYCAqL1xuICAgIGRpc3BsYXllZD86IHN0cmluZztcbiAgfVtdO1xufTtcblxuZnVuY3Rpb24gZXNjYXBlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBUaGlzIHRyaWNreSBsb2dpY3MgZm9yIFNhZmFyaVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGFkYXNoaS1haWthd2Evb2JzaWRpYW4tdmFyaW91cy1jb21wbGVtZW50cy1wbHVnaW4vaXNzdWVzLzU2XG4gIHJldHVybiB2YWx1ZVxuICAgIC5yZXBsYWNlKC9cXFxcL2csIFwiX19WYXJpb3VzQ29tcGxlbWVudHNFc2NhcGVfX1wiKVxuICAgIC5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKVxuICAgIC5yZXBsYWNlKC9cXHQvZywgXCJcXFxcdFwiKVxuICAgIC5yZXBsYWNlKC9fX1ZhcmlvdXNDb21wbGVtZW50c0VzY2FwZV9fL2csIFwiXFxcXFxcXFxcIik7XG59XG5cbmZ1bmN0aW9uIHVuZXNjYXBlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBUaGlzIHRyaWNreSBsb2dpY3MgZm9yIFNhZmFyaVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGFkYXNoaS1haWthd2Evb2JzaWRpYW4tdmFyaW91cy1jb21wbGVtZW50cy1wbHVnaW4vaXNzdWVzLzU2XG4gIHJldHVybiB2YWx1ZVxuICAgIC5yZXBsYWNlKC9cXFxcXFxcXC9nLCBcIl9fVmFyaW91c0NvbXBsZW1lbnRzRXNjYXBlX19cIilcbiAgICAucmVwbGFjZSgvXFxcXG4vZywgXCJcXG5cIilcbiAgICAucmVwbGFjZSgvXFxcXHQvZywgXCJcXHRcIilcbiAgICAucmVwbGFjZSgvX19WYXJpb3VzQ29tcGxlbWVudHNFc2NhcGVfXy9nLCBcIlxcXFxcIik7XG59XG5cbmZ1bmN0aW9uIGpzb25Ub1dvcmRzKFxuICBqc29uOiBKc29uRGljdGlvbmFyeSxcbiAgcGF0aDogc3RyaW5nLFxuICBzeXN0ZW1DYXJldFN5bWJvbD86IHN0cmluZ1xuKTogQ3VzdG9tRGljdGlvbmFyeVdvcmRbXSB7XG4gIHJldHVybiBqc29uLndvcmRzLm1hcCgoeCkgPT4gKHtcbiAgICB2YWx1ZTogeC5kaXNwbGF5ZWQgfHwgeC52YWx1ZSxcbiAgICBkZXNjcmlwdGlvbjogeC5kZXNjcmlwdGlvbixcbiAgICBhbGlhc2VzOiB4LmFsaWFzZXMsXG4gICAgdHlwZTogXCJjdXN0b21EaWN0aW9uYXJ5XCIsXG4gICAgY3JlYXRlZFBhdGg6IHBhdGgsXG4gICAgaW5zZXJ0ZWRUZXh0OiB4LmRpc3BsYXllZCA/IHgudmFsdWUgOiB1bmRlZmluZWQsXG4gICAgY2FyZXRTeW1ib2w6IGpzb24uY2FyZXRTeW1ib2wgPz8gc3lzdGVtQ2FyZXRTeW1ib2wsXG4gICAgaWdub3JlU3BhY2VBZnRlckNvbXBsZXRpb246IGpzb24uaWdub3JlU3BhY2VBZnRlckNvbXBsZXRpb24sXG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gbGluZVRvV29yZChcbiAgbGluZTogc3RyaW5nLFxuICBkZWxpbWl0ZXI6IENvbHVtbkRlbGltaXRlcixcbiAgcGF0aDogc3RyaW5nLFxuICBkZWxpbWl0ZXJGb3JEaXNwbGF5Pzogc3RyaW5nLFxuICBkZWxpbWl0ZXJGb3JIaWRlPzogc3RyaW5nLFxuICBzeXN0ZW1DYXJldFN5bWJvbD86IHN0cmluZ1xuKTogQ3VzdG9tRGljdGlvbmFyeVdvcmQge1xuICBjb25zdCBbdiwgZGVzY3JpcHRpb24sIC4uLmFsaWFzZXNdID0gbGluZS5zcGxpdChkZWxpbWl0ZXIudmFsdWUpO1xuXG4gIGxldCB2YWx1ZSA9IHVuZXNjYXBlKHYpO1xuICBsZXQgaW5zZXJ0ZWRUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGxldCBkaXNwbGF5ZWRUZXh0ID0gdmFsdWU7XG5cbiAgaWYgKGRlbGltaXRlckZvckRpc3BsYXkgJiYgdmFsdWUuaW5jbHVkZXMoZGVsaW1pdGVyRm9yRGlzcGxheSkpIHtcbiAgICBbZGlzcGxheWVkVGV4dCwgaW5zZXJ0ZWRUZXh0XSA9IHZhbHVlLnNwbGl0KGRlbGltaXRlckZvckRpc3BsYXkpO1xuICB9XG4gIGlmIChkZWxpbWl0ZXJGb3JIaWRlICYmIHZhbHVlLmluY2x1ZGVzKGRlbGltaXRlckZvckhpZGUpKSB7XG4gICAgaW5zZXJ0ZWRUZXh0ID0gdmFsdWUucmVwbGFjZShkZWxpbWl0ZXJGb3JIaWRlLCBcIlwiKTtcbiAgICBkaXNwbGF5ZWRUZXh0ID0gYCR7dmFsdWUuc3BsaXQoZGVsaW1pdGVyRm9ySGlkZSlbMF19IC4uLmA7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHZhbHVlOiBkaXNwbGF5ZWRUZXh0LFxuICAgIGRlc2NyaXB0aW9uLFxuICAgIGFsaWFzZXMsXG4gICAgdHlwZTogXCJjdXN0b21EaWN0aW9uYXJ5XCIsXG4gICAgY3JlYXRlZFBhdGg6IHBhdGgsXG4gICAgaW5zZXJ0ZWRUZXh0LFxuICAgIGNhcmV0U3ltYm9sOiBzeXN0ZW1DYXJldFN5bWJvbCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gd29yZFRvTGluZShcbiAgd29yZDogQ3VzdG9tRGljdGlvbmFyeVdvcmQsXG4gIGRlbGltaXRlcjogQ29sdW1uRGVsaW1pdGVyLFxuICBkaXZpZGVyRm9yRGlzcGxheTogc3RyaW5nIHwgbnVsbFxuKTogc3RyaW5nIHtcbiAgY29uc3QgdmFsdWUgPVxuICAgIHdvcmQuaW5zZXJ0ZWRUZXh0ICYmIGRpdmlkZXJGb3JEaXNwbGF5XG4gICAgICA/IGAke3dvcmQudmFsdWV9JHtkaXZpZGVyRm9yRGlzcGxheX0ke3dvcmQuaW5zZXJ0ZWRUZXh0fWBcbiAgICAgIDogd29yZC52YWx1ZTtcblxuICBjb25zdCBlc2NhcGVkVmFsdWUgPSBlc2NhcGUodmFsdWUpO1xuICBpZiAoIXdvcmQuZGVzY3JpcHRpb24gJiYgIXdvcmQuYWxpYXNlcykge1xuICAgIHJldHVybiBlc2NhcGVkVmFsdWU7XG4gIH1cbiAgaWYgKCF3b3JkLmFsaWFzZXMpIHtcbiAgICByZXR1cm4gW2VzY2FwZWRWYWx1ZSwgd29yZC5kZXNjcmlwdGlvbl0uam9pbihkZWxpbWl0ZXIudmFsdWUpO1xuICB9XG4gIHJldHVybiBbZXNjYXBlZFZhbHVlLCB3b3JkLmRlc2NyaXB0aW9uLCAuLi53b3JkLmFsaWFzZXNdLmpvaW4oXG4gICAgZGVsaW1pdGVyLnZhbHVlXG4gICk7XG59XG5cbmZ1bmN0aW9uIHN5bm9ueW1BbGlhc2VzKG5hbWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgbGVzc0Vtb2ppVmFsdWUgPSBleGNsdWRlRW1vamkobmFtZSk7XG4gIHJldHVybiBuYW1lID09PSBsZXNzRW1vamlWYWx1ZSA/IFtdIDogW2xlc3NFbW9qaVZhbHVlXTtcbn1cblxudHlwZSBPcHRpb24gPSB7XG4gIHJlZ2V4cDogc3RyaW5nO1xuICBkZWxpbWl0ZXJGb3JIaWRlPzogc3RyaW5nO1xuICBkZWxpbWl0ZXJGb3JEaXNwbGF5Pzogc3RyaW5nO1xuICBjYXJldFN5bWJvbD86IHN0cmluZztcbn07XG5cbmV4cG9ydCBjbGFzcyBDdXN0b21EaWN0aW9uYXJ5V29yZFByb3ZpZGVyIHtcbiAgcHJpdmF0ZSB3b3JkczogQ3VzdG9tRGljdGlvbmFyeVdvcmRbXSA9IFtdO1xuICB3b3JkQnlWYWx1ZTogeyBbdmFsdWU6IHN0cmluZ106IEN1c3RvbURpY3Rpb25hcnlXb3JkIH0gPSB7fTtcbiAgd29yZHNCeUZpcnN0TGV0dGVyOiBXb3Jkc0J5Rmlyc3RMZXR0ZXIgPSB7fTtcblxuICBwcml2YXRlIGFwcEhlbHBlcjogQXBwSGVscGVyO1xuICBwcml2YXRlIGZpbGVTeXN0ZW1BZGFwdGVyOiBGaWxlU3lzdGVtQWRhcHRlcjtcbiAgcHJpdmF0ZSBwYXRoczogc3RyaW5nW107XG4gIHByaXZhdGUgZGVsaW1pdGVyOiBDb2x1bW5EZWxpbWl0ZXI7XG4gIHByaXZhdGUgZGl2aWRlckZvckRpc3BsYXk6IHN0cmluZyB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGFwcEhlbHBlcjogQXBwSGVscGVyKSB7XG4gICAgdGhpcy5hcHBIZWxwZXIgPSBhcHBIZWxwZXI7XG4gICAgdGhpcy5maWxlU3lzdGVtQWRhcHRlciA9IGFwcC52YXVsdC5hZGFwdGVyIGFzIEZpbGVTeXN0ZW1BZGFwdGVyO1xuICB9XG5cbiAgZ2V0IGVkaXRhYmxlUGF0aHMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnBhdGhzLmZpbHRlcigoeCkgPT4gIWlzVVJMKHgpICYmICF4LmVuZHNXaXRoKFwiLmpzb25cIikpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBsb2FkV29yZHMoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIG9wdGlvbjogT3B0aW9uXG4gICk6IFByb21pc2U8Q3VzdG9tRGljdGlvbmFyeVdvcmRbXT4ge1xuICAgIGNvbnN0IGNvbnRlbnRzID0gaXNVUkwocGF0aClcbiAgICAgID8gYXdhaXQgcmVxdWVzdCh7IHVybDogcGF0aCB9KVxuICAgICAgOiBhd2FpdCB0aGlzLmZpbGVTeXN0ZW1BZGFwdGVyLnJlYWQocGF0aCk7XG5cbiAgICBjb25zdCB3b3JkcyA9IHBhdGguZW5kc1dpdGgoXCIuanNvblwiKVxuICAgICAgPyBqc29uVG9Xb3JkcyhKU09OLnBhcnNlKGNvbnRlbnRzKSwgcGF0aCwgb3B0aW9uLmNhcmV0U3ltYm9sKVxuICAgICAgOiBjb250ZW50c1xuICAgICAgICAgIC5zcGxpdCgvXFxyXFxufFxcbi8pXG4gICAgICAgICAgLm1hcCgoeCkgPT4geC5yZXBsYWNlKC8lJS4qJSUvZywgXCJcIikpXG4gICAgICAgICAgLmZpbHRlcigoeCkgPT4geClcbiAgICAgICAgICAubWFwKCh4KSA9PlxuICAgICAgICAgICAgbGluZVRvV29yZChcbiAgICAgICAgICAgICAgeCxcbiAgICAgICAgICAgICAgdGhpcy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgIHBhdGgsXG4gICAgICAgICAgICAgIG9wdGlvbi5kZWxpbWl0ZXJGb3JEaXNwbGF5LFxuICAgICAgICAgICAgICBvcHRpb24uZGVsaW1pdGVyRm9ySGlkZSxcbiAgICAgICAgICAgICAgb3B0aW9uLmNhcmV0U3ltYm9sXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgIHJldHVybiB3b3Jkcy5maWx0ZXIoXG4gICAgICAoeCkgPT4gIW9wdGlvbi5yZWdleHAgfHwgeC52YWx1ZS5tYXRjaChuZXcgUmVnRXhwKG9wdGlvbi5yZWdleHApKVxuICAgICk7XG4gIH1cblxuICBhc3luYyByZWZyZXNoQ3VzdG9tV29yZHMob3B0aW9uOiBPcHRpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNsZWFyV29yZHMoKTtcblxuICAgIGZvciAoY29uc3QgcGF0aCBvZiB0aGlzLnBhdGhzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB3b3JkcyA9IGF3YWl0IHRoaXMubG9hZFdvcmRzKHBhdGgsIG9wdGlvbik7XG4gICAgICAgIHdvcmRzLmZvckVhY2goKHgpID0+IHRoaXMuYWRkV29yZCh4KSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIG5vaW5zcGVjdGlvbiBPYmplY3RBbGxvY2F0aW9uSWdub3JlZFxuICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgIGDimqAgRmFpbCB0byBsb2FkICR7cGF0aH0gLS0gVmFyaW91cyBDb21wbGVtZW50cyBQbHVnaW4gLS0gXFxuICR7ZX1gLFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBhZGRXb3JkV2l0aERpY3Rpb25hcnkoXG4gICAgd29yZDogQ3VzdG9tRGljdGlvbmFyeVdvcmQsXG4gICAgZGljdGlvbmFyeVBhdGg6IHN0cmluZ1xuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmFkZFdvcmQod29yZCk7XG4gICAgYXdhaXQgdGhpcy5maWxlU3lzdGVtQWRhcHRlci5hcHBlbmQoXG4gICAgICBkaWN0aW9uYXJ5UGF0aCxcbiAgICAgIFwiXFxuXCIgKyB3b3JkVG9MaW5lKHdvcmQsIHRoaXMuZGVsaW1pdGVyLCB0aGlzLmRpdmlkZXJGb3JEaXNwbGF5KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFkZFdvcmQod29yZDogQ3VzdG9tRGljdGlvbmFyeVdvcmQpIHtcbiAgICB0aGlzLndvcmRzLnB1c2god29yZCk7XG5cbiAgICAvLyBBZGQgYWxpYXNlcyBhcyBhIHN5bm9ueW1cbiAgICBjb25zdCB3b3JkV2l0aFN5bm9ueW0gPSB7XG4gICAgICAuLi53b3JkLFxuICAgICAgYWxpYXNlczogWy4uLih3b3JkLmFsaWFzZXMgPz8gW10pLCAuLi5zeW5vbnltQWxpYXNlcyh3b3JkLnZhbHVlKV0sXG4gICAgfTtcblxuICAgIHRoaXMud29yZEJ5VmFsdWVbd29yZFdpdGhTeW5vbnltLnZhbHVlXSA9IHdvcmRXaXRoU3lub255bTtcbiAgICBwdXNoV29yZChcbiAgICAgIHRoaXMud29yZHNCeUZpcnN0TGV0dGVyLFxuICAgICAgd29yZFdpdGhTeW5vbnltLnZhbHVlLmNoYXJBdCgwKSxcbiAgICAgIHdvcmRXaXRoU3lub255bVxuICAgICk7XG4gICAgd29yZFdpdGhTeW5vbnltLmFsaWFzZXM/LmZvckVhY2goKGEpID0+XG4gICAgICBwdXNoV29yZCh0aGlzLndvcmRzQnlGaXJzdExldHRlciwgYS5jaGFyQXQoMCksIHdvcmRXaXRoU3lub255bSlcbiAgICApO1xuICB9XG5cbiAgY2xlYXJXb3JkcygpOiB2b2lkIHtcbiAgICB0aGlzLndvcmRzID0gW107XG4gICAgdGhpcy53b3JkQnlWYWx1ZSA9IHt9O1xuICAgIHRoaXMud29yZHNCeUZpcnN0TGV0dGVyID0ge307XG4gIH1cblxuICBnZXQgd29yZENvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMud29yZHMubGVuZ3RoO1xuICB9XG5cbiAgc2V0U2V0dGluZ3MoXG4gICAgcGF0aHM6IHN0cmluZ1tdLFxuICAgIGRlbGltaXRlcjogQ29sdW1uRGVsaW1pdGVyLFxuICAgIGRpdmlkZXJGb3JEaXNwbGF5OiBzdHJpbmcgfCBudWxsXG4gICkge1xuICAgIHRoaXMucGF0aHMgPSBwYXRocztcbiAgICB0aGlzLmRlbGltaXRlciA9IGRlbGltaXRlcjtcbiAgICB0aGlzLmRpdmlkZXJGb3JEaXNwbGF5ID0gZGl2aWRlckZvckRpc3BsYXk7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQXBwIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBncm91cEJ5LCB1bmlxIH0gZnJvbSBcIi4uL3V0aWwvY29sbGVjdGlvbi1oZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgV29yZHNCeUZpcnN0TGV0dGVyIH0gZnJvbSBcIi4vc3VnZ2VzdGVyXCI7XG5pbXBvcnQgdHlwZSB7IFRva2VuaXplciB9IGZyb20gXCIuLi90b2tlbml6ZXIvdG9rZW5pemVyXCI7XG5pbXBvcnQgdHlwZSB7IEFwcEhlbHBlciB9IGZyb20gXCIuLi9hcHAtaGVscGVyXCI7XG5pbXBvcnQgeyBhbGxBbHBoYWJldHMsIHN0YXJ0c1NtYWxsTGV0dGVyT25seUZpcnN0IH0gZnJvbSBcIi4uL3V0aWwvc3RyaW5nc1wiO1xuaW1wb3J0IHR5cGUgeyBXb3JkIH0gZnJvbSBcIi4uL21vZGVsL1dvcmRcIjtcblxuZXhwb3J0IGNsYXNzIEN1cnJlbnRGaWxlV29yZFByb3ZpZGVyIHtcbiAgd29yZHNCeUZpcnN0TGV0dGVyOiBXb3Jkc0J5Rmlyc3RMZXR0ZXIgPSB7fTtcbiAgcHJpdmF0ZSB3b3JkczogV29yZFtdID0gW107XG4gIHByaXZhdGUgdG9rZW5pemVyOiBUb2tlbml6ZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBhcHA6IEFwcCwgcHJpdmF0ZSBhcHBIZWxwZXI6IEFwcEhlbHBlcikge31cblxuICBhc3luYyByZWZyZXNoV29yZHMoXG4gICAgb25seUVuZ2xpc2g6IGJvb2xlYW4sXG4gICAgbWluTnVtYmVyT2ZDaGFyYWN0ZXJzOiBudW1iZXJcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5jbGVhcldvcmRzKCk7XG5cbiAgICBjb25zdCBlZGl0b3IgPSB0aGlzLmFwcEhlbHBlci5nZXRDdXJyZW50RWRpdG9yKCk7XG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50VG9rZW4gPSB0aGlzLnRva2VuaXplclxuICAgICAgLnRva2VuaXplKFxuICAgICAgICBlZGl0b3IuZ2V0TGluZShlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSkuc2xpY2UoMCwgZWRpdG9yLmdldEN1cnNvcigpLmNoKVxuICAgICAgKVxuICAgICAgLmxhc3QoKTtcblxuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jYWNoZWRSZWFkKGZpbGUpO1xuICAgIGNvbnN0IHRva2VucyA9IHRoaXMudG9rZW5pemVyXG4gICAgICAudG9rZW5pemUoY29udGVudClcbiAgICAgIC5maWx0ZXIoKHgpID0+IHtcbiAgICAgICAgaWYgKHgubGVuZ3RoIDwgbWluTnVtYmVyT2ZDaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRva2VuaXplci5zaG91bGRJZ25vcmVPbkN1cnJlbnQoeCkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ubHlFbmdsaXNoID8gYWxsQWxwaGFiZXRzKHgpIDogdHJ1ZTtcbiAgICAgIH0pXG4gICAgICAubWFwKCh4KSA9PiAoc3RhcnRzU21hbGxMZXR0ZXJPbmx5Rmlyc3QoeCkgPyB4LnRvTG93ZXJDYXNlKCkgOiB4KSk7XG4gICAgdGhpcy53b3JkcyA9IHVuaXEodG9rZW5zKVxuICAgICAgLmZpbHRlcigoeCkgPT4geCAhPT0gY3VycmVudFRva2VuKVxuICAgICAgLm1hcCgoeCkgPT4gKHtcbiAgICAgICAgdmFsdWU6IHgsXG4gICAgICAgIHR5cGU6IFwiY3VycmVudEZpbGVcIixcbiAgICAgICAgY3JlYXRlZFBhdGg6IGZpbGUucGF0aCxcbiAgICAgIH0pKTtcbiAgICB0aGlzLndvcmRzQnlGaXJzdExldHRlciA9IGdyb3VwQnkodGhpcy53b3JkcywgKHgpID0+IHgudmFsdWUuY2hhckF0KDApKTtcbiAgfVxuXG4gIGNsZWFyV29yZHMoKTogdm9pZCB7XG4gICAgdGhpcy53b3JkcyA9IFtdO1xuICAgIHRoaXMud29yZHNCeUZpcnN0TGV0dGVyID0ge307XG4gIH1cblxuICBnZXQgd29yZENvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMud29yZHMubGVuZ3RoO1xuICB9XG5cbiAgc2V0U2V0dGluZ3ModG9rZW5pemVyOiBUb2tlbml6ZXIpIHtcbiAgICB0aGlzLnRva2VuaXplciA9IHRva2VuaXplcjtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBBcHAgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IHB1c2hXb3JkLCB0eXBlIFdvcmRzQnlGaXJzdExldHRlciB9IGZyb20gXCIuL3N1Z2dlc3RlclwiO1xuaW1wb3J0IHR5cGUgeyBBcHBIZWxwZXIgfSBmcm9tIFwiLi4vYXBwLWhlbHBlclwiO1xuaW1wb3J0IHsgZXhjbHVkZUVtb2ppIH0gZnJvbSBcIi4uL3V0aWwvc3RyaW5nc1wiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbExpbmtXb3JkLCBXb3JkIH0gZnJvbSBcIi4uL21vZGVsL1dvcmRcIjtcblxuZXhwb3J0IGNsYXNzIEludGVybmFsTGlua1dvcmRQcm92aWRlciB7XG4gIHByaXZhdGUgd29yZHM6IFdvcmRbXSA9IFtdO1xuICB3b3Jkc0J5Rmlyc3RMZXR0ZXI6IFdvcmRzQnlGaXJzdExldHRlciA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYXBwOiBBcHAsIHByaXZhdGUgYXBwSGVscGVyOiBBcHBIZWxwZXIpIHt9XG5cbiAgcmVmcmVzaFdvcmRzKFxuICAgIHdvcmRBc0ludGVybmFsTGlua0FsaWFzOiBib29sZWFuLFxuICAgIGV4Y2x1ZGVQYXRoUHJlZml4UGF0dGVybnM6IHN0cmluZ1tdXG4gICk6IHZvaWQge1xuICAgIHRoaXMuY2xlYXJXb3JkcygpO1xuXG4gICAgY29uc3Qgc3lub255bUFsaWFzZXMgPSAobmFtZTogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICAgICAgY29uc3QgbGVzc0Vtb2ppVmFsdWUgPSBleGNsdWRlRW1vamkobmFtZSk7XG4gICAgICByZXR1cm4gbmFtZSA9PT0gbGVzc0Vtb2ppVmFsdWUgPyBbXSA6IFtsZXNzRW1vamlWYWx1ZV07XG4gICAgfTtcblxuICAgIGNvbnN0IHJlc29sdmVkSW50ZXJuYWxMaW5rV29yZHM6IEludGVybmFsTGlua1dvcmRbXSA9IHRoaXMuYXBwLnZhdWx0XG4gICAgICAuZ2V0TWFya2Rvd25GaWxlcygpXG4gICAgICAuZmlsdGVyKChmKSA9PlxuICAgICAgICBleGNsdWRlUGF0aFByZWZpeFBhdHRlcm5zLmV2ZXJ5KCh4KSA9PiAhZi5wYXRoLnN0YXJ0c1dpdGgoeCkpXG4gICAgICApXG4gICAgICAuZmxhdE1hcCgoeCkgPT4ge1xuICAgICAgICBjb25zdCBhbGlhc2VzID0gdGhpcy5hcHBIZWxwZXIuZ2V0QWxpYXNlcyh4KTtcblxuICAgICAgICBpZiAod29yZEFzSW50ZXJuYWxMaW5rQWxpYXMpIHtcbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogeC5iYXNlbmFtZSxcbiAgICAgICAgICAgICAgdHlwZTogXCJpbnRlcm5hbExpbmtcIixcbiAgICAgICAgICAgICAgY3JlYXRlZFBhdGg6IHgucGF0aCxcbiAgICAgICAgICAgICAgYWxpYXNlczogc3lub255bUFsaWFzZXMoeC5iYXNlbmFtZSksXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB4LnBhdGgsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLi4uYWxpYXNlcy5tYXAoKGEpID0+ICh7XG4gICAgICAgICAgICAgIHZhbHVlOiBhLFxuICAgICAgICAgICAgICB0eXBlOiBcImludGVybmFsTGlua1wiLFxuICAgICAgICAgICAgICBjcmVhdGVkUGF0aDogeC5wYXRoLFxuICAgICAgICAgICAgICBhbGlhc2VzOiBzeW5vbnltQWxpYXNlcyhhKSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHgucGF0aCxcbiAgICAgICAgICAgICAgYWxpYXNNZXRhOiB7XG4gICAgICAgICAgICAgICAgb3JpZ2luOiB4LnBhdGgsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgXSBhcyBJbnRlcm5hbExpbmtXb3JkW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdmFsdWU6IHguYmFzZW5hbWUsXG4gICAgICAgICAgICAgIHR5cGU6IFwiaW50ZXJuYWxMaW5rXCIsXG4gICAgICAgICAgICAgIGNyZWF0ZWRQYXRoOiB4LnBhdGgsXG4gICAgICAgICAgICAgIGFsaWFzZXM6IFtcbiAgICAgICAgICAgICAgICAuLi5zeW5vbnltQWxpYXNlcyh4LmJhc2VuYW1lKSxcbiAgICAgICAgICAgICAgICAuLi5hbGlhc2VzLFxuICAgICAgICAgICAgICAgIC4uLmFsaWFzZXMuZmxhdE1hcChzeW5vbnltQWxpYXNlcyksXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB4LnBhdGgsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0gYXMgSW50ZXJuYWxMaW5rV29yZFtdO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIGNvbnN0IHVucmVzb2x2ZWRJbnRlcm5hbExpbmtXb3JkczogSW50ZXJuYWxMaW5rV29yZFtdID0gdGhpcy5hcHBIZWxwZXJcbiAgICAgIC5zZWFyY2hQaGFudG9tTGlua3MoKVxuICAgICAgLm1hcCgoeyBwYXRoLCBsaW5rIH0pID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZTogbGluayxcbiAgICAgICAgICB0eXBlOiBcImludGVybmFsTGlua1wiLFxuICAgICAgICAgIGNyZWF0ZWRQYXRoOiBwYXRoLFxuICAgICAgICAgIGFsaWFzZXM6IHN5bm9ueW1BbGlhc2VzKGxpbmspLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBgQXBwZWFyZWQgaW4gLT4gJHtwYXRofWAsXG4gICAgICAgICAgcGhhbnRvbTogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy53b3JkcyA9IFsuLi5yZXNvbHZlZEludGVybmFsTGlua1dvcmRzLCAuLi51bnJlc29sdmVkSW50ZXJuYWxMaW5rV29yZHNdO1xuICAgIGZvciAoY29uc3Qgd29yZCBvZiB0aGlzLndvcmRzKSB7XG4gICAgICBwdXNoV29yZCh0aGlzLndvcmRzQnlGaXJzdExldHRlciwgd29yZC52YWx1ZS5jaGFyQXQoMCksIHdvcmQpO1xuICAgICAgd29yZC5hbGlhc2VzPy5mb3JFYWNoKChhKSA9PlxuICAgICAgICBwdXNoV29yZCh0aGlzLndvcmRzQnlGaXJzdExldHRlciwgYS5jaGFyQXQoMCksIHdvcmQpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNsZWFyV29yZHMoKTogdm9pZCB7XG4gICAgdGhpcy53b3JkcyA9IFtdO1xuICAgIHRoaXMud29yZHNCeUZpcnN0TGV0dGVyID0ge307XG4gIH1cblxuICBnZXQgd29yZENvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMud29yZHMubGVuZ3RoO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IEluZGV4ZWRXb3JkcyB9IGZyb20gXCIuLi91aS9BdXRvQ29tcGxldGVTdWdnZXN0XCI7XG5pbXBvcnQgeyBzdWdnZXN0V29yZHMsIHN1Z2dlc3RXb3Jkc0J5UGFydGlhbE1hdGNoIH0gZnJvbSBcIi4vc3VnZ2VzdGVyXCI7XG5pbXBvcnQgdHlwZSB7IFdvcmQgfSBmcm9tIFwiLi4vbW9kZWwvV29yZFwiO1xuaW1wb3J0IHR5cGUgeyBTZWxlY3Rpb25IaXN0b3J5U3RvcmFnZSB9IGZyb20gXCIuLi9zdG9yYWdlL1NlbGVjdGlvbkhpc3RvcnlTdG9yYWdlXCI7XG5cbnR5cGUgTmFtZSA9IFwicHJlZml4XCIgfCBcInBhcnRpYWxcIjtcblxudHlwZSBIYW5kbGVyID0gKFxuICBpbmRleGVkV29yZHM6IEluZGV4ZWRXb3JkcyxcbiAgcXVlcnk6IHN0cmluZyxcbiAgbWF4OiBudW1iZXIsXG4gIG9wdGlvbjoge1xuICAgIGZyb250TWF0dGVyPzogc3RyaW5nO1xuICAgIHNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlPzogU2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2U7XG4gIH1cbikgPT4gV29yZFtdO1xuXG5leHBvcnQgY2xhc3MgTWF0Y2hTdHJhdGVneSB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF92YWx1ZXM6IE1hdGNoU3RyYXRlZ3lbXSA9IFtdO1xuXG4gIHN0YXRpYyByZWFkb25seSBQUkVGSVggPSBuZXcgTWF0Y2hTdHJhdGVneShcInByZWZpeFwiLCBzdWdnZXN0V29yZHMpO1xuICBzdGF0aWMgcmVhZG9ubHkgUEFSVElBTCA9IG5ldyBNYXRjaFN0cmF0ZWd5KFxuICAgIFwicGFydGlhbFwiLFxuICAgIHN1Z2dlc3RXb3Jkc0J5UGFydGlhbE1hdGNoXG4gICk7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihyZWFkb25seSBuYW1lOiBOYW1lLCByZWFkb25seSBoYW5kbGVyOiBIYW5kbGVyKSB7XG4gICAgTWF0Y2hTdHJhdGVneS5fdmFsdWVzLnB1c2godGhpcyk7XG4gIH1cblxuICBzdGF0aWMgZnJvbU5hbWUobmFtZTogc3RyaW5nKTogTWF0Y2hTdHJhdGVneSB7XG4gICAgcmV0dXJuIE1hdGNoU3RyYXRlZ3kuX3ZhbHVlcy5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IG5hbWUpITtcbiAgfVxuXG4gIHN0YXRpYyB2YWx1ZXMoKTogTWF0Y2hTdHJhdGVneVtdIHtcbiAgICByZXR1cm4gTWF0Y2hTdHJhdGVneS5fdmFsdWVzO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IE1vZGlmaWVyIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbnR5cGUgTmFtZSA9XG4gIHwgXCJOb25lXCJcbiAgfCBcIlRhYiwgU2hpZnQrVGFiXCJcbiAgfCBcIkN0cmwvQ21kK04sIEN0cmwvQ21kK1BcIlxuICB8IFwiQ3RybC9DbWQrSiwgQ3RybC9DbWQrS1wiO1xuaW50ZXJmYWNlIEtleUJpbmQge1xuICBtb2RpZmllcnM6IE1vZGlmaWVyW107XG4gIGtleTogc3RyaW5nIHwgbnVsbDtcbn1cblxuZXhwb3J0IGNsYXNzIEN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5cyB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF92YWx1ZXM6IEN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5c1tdID0gW107XG5cbiAgc3RhdGljIHJlYWRvbmx5IE5PTkUgPSBuZXcgQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzKFxuICAgIFwiTm9uZVwiLFxuICAgIHsgbW9kaWZpZXJzOiBbXSwga2V5OiBudWxsIH0sXG4gICAgeyBtb2RpZmllcnM6IFtdLCBrZXk6IG51bGwgfVxuICApO1xuICBzdGF0aWMgcmVhZG9ubHkgVEFCID0gbmV3IEN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5cyhcbiAgICBcIlRhYiwgU2hpZnQrVGFiXCIsXG4gICAgeyBtb2RpZmllcnM6IFtdLCBrZXk6IFwiVGFiXCIgfSxcbiAgICB7IG1vZGlmaWVyczogW1wiU2hpZnRcIl0sIGtleTogXCJUYWJcIiB9XG4gICk7XG4gIHN0YXRpYyByZWFkb25seSBFTUFDUyA9IG5ldyBDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMoXG4gICAgXCJDdHJsL0NtZCtOLCBDdHJsL0NtZCtQXCIsXG4gICAgeyBtb2RpZmllcnM6IFtcIk1vZFwiXSwga2V5OiBcIk5cIiB9LFxuICAgIHsgbW9kaWZpZXJzOiBbXCJNb2RcIl0sIGtleTogXCJQXCIgfVxuICApO1xuICBzdGF0aWMgcmVhZG9ubHkgVklNID0gbmV3IEN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5cyhcbiAgICBcIkN0cmwvQ21kK0osIEN0cmwvQ21kK0tcIixcbiAgICB7IG1vZGlmaWVyczogW1wiTW9kXCJdLCBrZXk6IFwiSlwiIH0sXG4gICAgeyBtb2RpZmllcnM6IFtcIk1vZFwiXSwga2V5OiBcIktcIiB9XG4gICk7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBuYW1lOiBOYW1lLFxuICAgIHJlYWRvbmx5IG5leHRLZXk6IEtleUJpbmQsXG4gICAgcmVhZG9ubHkgcHJldmlvdXNLZXk6IEtleUJpbmRcbiAgKSB7XG4gICAgQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzLl92YWx1ZXMucHVzaCh0aGlzKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tTmFtZShuYW1lOiBzdHJpbmcpOiBDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMge1xuICAgIHJldHVybiBDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMuX3ZhbHVlcy5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IG5hbWUpITtcbiAgfVxuXG4gIHN0YXRpYyB2YWx1ZXMoKTogQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzW10ge1xuICAgIHJldHVybiBDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMuX3ZhbHVlcztcbiAgfVxufVxuIiwidHlwZSBEZWxpbWl0ZXIgPSBcIlxcdFwiIHwgXCIsXCIgfCBcInxcIjtcblxuZXhwb3J0IGNsYXNzIENvbHVtbkRlbGltaXRlciB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF92YWx1ZXM6IENvbHVtbkRlbGltaXRlcltdID0gW107XG5cbiAgc3RhdGljIHJlYWRvbmx5IFRBQiA9IG5ldyBDb2x1bW5EZWxpbWl0ZXIoXCJUYWJcIiwgXCJcXHRcIik7XG4gIHN0YXRpYyByZWFkb25seSBDT01NQSA9IG5ldyBDb2x1bW5EZWxpbWl0ZXIoXCJDb21tYVwiLCBcIixcIik7XG4gIHN0YXRpYyByZWFkb25seSBQSVBFID0gbmV3IENvbHVtbkRlbGltaXRlcihcIlBpcGVcIiwgXCJ8XCIpO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IocmVhZG9ubHkgbmFtZTogc3RyaW5nLCByZWFkb25seSB2YWx1ZTogRGVsaW1pdGVyKSB7XG4gICAgQ29sdW1uRGVsaW1pdGVyLl92YWx1ZXMucHVzaCh0aGlzKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tTmFtZShuYW1lOiBzdHJpbmcpOiBDb2x1bW5EZWxpbWl0ZXIge1xuICAgIHJldHVybiBDb2x1bW5EZWxpbWl0ZXIuX3ZhbHVlcy5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IG5hbWUpITtcbiAgfVxuXG4gIHN0YXRpYyB2YWx1ZXMoKTogQ29sdW1uRGVsaW1pdGVyW10ge1xuICAgIHJldHVybiBDb2x1bW5EZWxpbWl0ZXIuX3ZhbHVlcztcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBNb2RpZmllciB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG50eXBlIE5hbWUgPVxuICB8IFwiRW50ZXJcIlxuICB8IFwiVGFiXCJcbiAgfCBcIkN0cmwvQ21kK0VudGVyXCJcbiAgfCBcIkFsdCtFbnRlclwiXG4gIHwgXCJTaGlmdCtFbnRlclwiXG4gIHwgXCJTcGFjZVwiXG4gIHwgXCJTaGlmdCtTcGFjZVwiXG4gIHwgXCJCYWNrcXVvdGVcIlxuICB8IFwiTm9uZVwiO1xuaW50ZXJmYWNlIEtleUJpbmQge1xuICBtb2RpZmllcnM6IE1vZGlmaWVyW107XG4gIGtleTogc3RyaW5nIHwgbnVsbDtcbn1cblxuZXhwb3J0IGNsYXNzIFNlbGVjdFN1Z2dlc3Rpb25LZXkge1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBfdmFsdWVzOiBTZWxlY3RTdWdnZXN0aW9uS2V5W10gPSBbXTtcblxuICBzdGF0aWMgcmVhZG9ubHkgRU5URVIgPSBuZXcgU2VsZWN0U3VnZ2VzdGlvbktleShcIkVudGVyXCIsIHtcbiAgICBtb2RpZmllcnM6IFtdLFxuICAgIGtleTogXCJFbnRlclwiLFxuICB9KTtcbiAgc3RhdGljIHJlYWRvbmx5IFRBQiA9IG5ldyBTZWxlY3RTdWdnZXN0aW9uS2V5KFwiVGFiXCIsIHtcbiAgICBtb2RpZmllcnM6IFtdLFxuICAgIGtleTogXCJUYWJcIixcbiAgfSk7XG4gIHN0YXRpYyByZWFkb25seSBNT0RfRU5URVIgPSBuZXcgU2VsZWN0U3VnZ2VzdGlvbktleShcIkN0cmwvQ21kK0VudGVyXCIsIHtcbiAgICBtb2RpZmllcnM6IFtcIk1vZFwiXSxcbiAgICBrZXk6IFwiRW50ZXJcIixcbiAgfSk7XG4gIHN0YXRpYyByZWFkb25seSBBTFRfRU5URVIgPSBuZXcgU2VsZWN0U3VnZ2VzdGlvbktleShcIkFsdCtFbnRlclwiLCB7XG4gICAgbW9kaWZpZXJzOiBbXCJBbHRcIl0sXG4gICAga2V5OiBcIkVudGVyXCIsXG4gIH0pO1xuICBzdGF0aWMgcmVhZG9ubHkgU0hJRlRfRU5URVIgPSBuZXcgU2VsZWN0U3VnZ2VzdGlvbktleShcIlNoaWZ0K0VudGVyXCIsIHtcbiAgICBtb2RpZmllcnM6IFtcIlNoaWZ0XCJdLFxuICAgIGtleTogXCJFbnRlclwiLFxuICB9KTtcbiAgc3RhdGljIHJlYWRvbmx5IFNQQUNFID0gbmV3IFNlbGVjdFN1Z2dlc3Rpb25LZXkoXCJTcGFjZVwiLCB7XG4gICAgbW9kaWZpZXJzOiBbXSxcbiAgICBrZXk6IFwiIFwiLFxuICB9KTtcbiAgc3RhdGljIHJlYWRvbmx5IFNISUZUX1NQQUNFID0gbmV3IFNlbGVjdFN1Z2dlc3Rpb25LZXkoXCJTaGlmdCtTcGFjZVwiLCB7XG4gICAgbW9kaWZpZXJzOiBbXCJTaGlmdFwiXSxcbiAgICBrZXk6IFwiIFwiLFxuICB9KTtcbiAgc3RhdGljIHJlYWRvbmx5IEJBQ0tRVU9URSA9IG5ldyBTZWxlY3RTdWdnZXN0aW9uS2V5KFwiQmFja3F1b3RlXCIsIHtcbiAgICBtb2RpZmllcnM6IFtdLFxuICAgIGtleTogXCJgXCIsXG4gIH0pO1xuICBzdGF0aWMgcmVhZG9ubHkgTm9uZSA9IG5ldyBTZWxlY3RTdWdnZXN0aW9uS2V5KFwiTm9uZVwiLCB7XG4gICAgbW9kaWZpZXJzOiBbXSxcbiAgICBrZXk6IFwiXCIsXG4gIH0pO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IocmVhZG9ubHkgbmFtZTogTmFtZSwgcmVhZG9ubHkga2V5QmluZDogS2V5QmluZCkge1xuICAgIFNlbGVjdFN1Z2dlc3Rpb25LZXkuX3ZhbHVlcy5wdXNoKHRoaXMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21OYW1lKG5hbWU6IHN0cmluZyk6IFNlbGVjdFN1Z2dlc3Rpb25LZXkge1xuICAgIHJldHVybiBTZWxlY3RTdWdnZXN0aW9uS2V5Ll92YWx1ZXMuZmluZCgoeCkgPT4geC5uYW1lID09PSBuYW1lKSE7XG4gIH1cblxuICBzdGF0aWMgdmFsdWVzKCk6IFNlbGVjdFN1Z2dlc3Rpb25LZXlbXSB7XG4gICAgcmV0dXJuIFNlbGVjdFN1Z2dlc3Rpb25LZXkuX3ZhbHVlcztcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBBcHAgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IGdyb3VwQnkgfSBmcm9tIFwiLi4vdXRpbC9jb2xsZWN0aW9uLWhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBXb3Jkc0J5Rmlyc3RMZXR0ZXIgfSBmcm9tIFwiLi9zdWdnZXN0ZXJcIjtcbmltcG9ydCB0eXBlIHsgVG9rZW5pemVyIH0gZnJvbSBcIi4uL3Rva2VuaXplci90b2tlbml6ZXJcIjtcbmltcG9ydCB0eXBlIHsgQXBwSGVscGVyIH0gZnJvbSBcIi4uL2FwcC1oZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgV29yZCB9IGZyb20gXCIuLi9tb2RlbC9Xb3JkXCI7XG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSBcIi4uL3V0aWwvcGF0aFwiO1xuaW1wb3J0IHsgc3RhcnRzU21hbGxMZXR0ZXJPbmx5Rmlyc3QgfSBmcm9tIFwiLi4vdXRpbC9zdHJpbmdzXCI7XG5cbmV4cG9ydCBjbGFzcyBDdXJyZW50VmF1bHRXb3JkUHJvdmlkZXIge1xuICB3b3Jkc0J5Rmlyc3RMZXR0ZXI6IFdvcmRzQnlGaXJzdExldHRlciA9IHt9O1xuICBwcml2YXRlIHdvcmRzOiBXb3JkW10gPSBbXTtcbiAgcHJpdmF0ZSB0b2tlbml6ZXI6IFRva2VuaXplcjtcbiAgcHJpdmF0ZSBpbmNsdWRlUHJlZml4UGF0dGVybnM6IHN0cmluZ1tdO1xuICBwcml2YXRlIGV4Y2x1ZGVQcmVmaXhQYXR0ZXJuczogc3RyaW5nW107XG4gIHByaXZhdGUgb25seVVuZGVyQ3VycmVudERpcmVjdG9yeTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcDogQXBwLCBwcml2YXRlIGFwcEhlbHBlcjogQXBwSGVscGVyKSB7fVxuXG4gIGFzeW5jIHJlZnJlc2hXb3JkcyhtaW5OdW1iZXJPZkNoYXJhY3RlcnM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuY2xlYXJXb3JkcygpO1xuXG4gICAgY29uc3QgY3VycmVudERpcm5hbWUgPSB0aGlzLmFwcEhlbHBlci5nZXRDdXJyZW50RGlybmFtZSgpO1xuXG4gICAgY29uc3QgbWFya2Rvd25GaWxlUGF0aHMgPSB0aGlzLmFwcC52YXVsdFxuICAgICAgLmdldE1hcmtkb3duRmlsZXMoKVxuICAgICAgLm1hcCgoeCkgPT4geC5wYXRoKVxuICAgICAgLmZpbHRlcigocCkgPT4gdGhpcy5pbmNsdWRlUHJlZml4UGF0dGVybnMuZXZlcnkoKHgpID0+IHAuc3RhcnRzV2l0aCh4KSkpXG4gICAgICAuZmlsdGVyKChwKSA9PiB0aGlzLmV4Y2x1ZGVQcmVmaXhQYXR0ZXJucy5ldmVyeSgoeCkgPT4gIXAuc3RhcnRzV2l0aCh4KSkpXG4gICAgICAuZmlsdGVyKFxuICAgICAgICAocCkgPT4gIXRoaXMub25seVVuZGVyQ3VycmVudERpcmVjdG9yeSB8fCBkaXJuYW1lKHApID09PSBjdXJyZW50RGlybmFtZVxuICAgICAgKTtcblxuICAgIGxldCB3b3JkQnlWYWx1ZTogeyBbdmFsdWU6IHN0cmluZ106IFdvcmQgfSA9IHt9O1xuICAgIGZvciAoY29uc3QgcGF0aCBvZiBtYXJrZG93bkZpbGVQYXRocykge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcblxuICAgICAgY29uc3QgdG9rZW5zID0gdGhpcy50b2tlbml6ZXJcbiAgICAgICAgLnRva2VuaXplKGNvbnRlbnQpXG4gICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgKHgpID0+XG4gICAgICAgICAgICB4Lmxlbmd0aCA+PSBtaW5OdW1iZXJPZkNoYXJhY3RlcnMgJiZcbiAgICAgICAgICAgICF0aGlzLnRva2VuaXplci5zaG91bGRJZ25vcmVPbkN1cnJlbnQoeClcbiAgICAgICAgKVxuICAgICAgICAubWFwKCh4KSA9PiAoc3RhcnRzU21hbGxMZXR0ZXJPbmx5Rmlyc3QoeCkgPyB4LnRvTG93ZXJDYXNlKCkgOiB4KSk7XG4gICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgICB3b3JkQnlWYWx1ZVt0b2tlbl0gPSB7XG4gICAgICAgICAgdmFsdWU6IHRva2VuLFxuICAgICAgICAgIHR5cGU6IFwiY3VycmVudFZhdWx0XCIsXG4gICAgICAgICAgY3JlYXRlZFBhdGg6IHBhdGgsXG4gICAgICAgICAgZGVzY3JpcHRpb246IHBhdGgsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy53b3JkcyA9IE9iamVjdC52YWx1ZXMod29yZEJ5VmFsdWUpO1xuICAgIHRoaXMud29yZHNCeUZpcnN0TGV0dGVyID0gZ3JvdXBCeSh0aGlzLndvcmRzLCAoeCkgPT4geC52YWx1ZS5jaGFyQXQoMCkpO1xuICB9XG5cbiAgY2xlYXJXb3JkcygpOiB2b2lkIHtcbiAgICB0aGlzLndvcmRzID0gW107XG4gICAgdGhpcy53b3Jkc0J5Rmlyc3RMZXR0ZXIgPSB7fTtcbiAgfVxuXG4gIGdldCB3b3JkQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy53b3Jkcy5sZW5ndGg7XG4gIH1cblxuICBzZXRTZXR0aW5ncyhcbiAgICB0b2tlbml6ZXI6IFRva2VuaXplcixcbiAgICBpbmNsdWRlUHJlZml4UGF0dGVybnM6IHN0cmluZ1tdLFxuICAgIGV4Y2x1ZGVQcmVmaXhQYXR0ZXJuczogc3RyaW5nW10sXG4gICAgb25seVVuZGVyQ3VycmVudERpcmVjdG9yeTogYm9vbGVhblxuICApIHtcbiAgICB0aGlzLnRva2VuaXplciA9IHRva2VuaXplcjtcbiAgICB0aGlzLmluY2x1ZGVQcmVmaXhQYXR0ZXJucyA9IGluY2x1ZGVQcmVmaXhQYXR0ZXJucztcbiAgICB0aGlzLmV4Y2x1ZGVQcmVmaXhQYXR0ZXJucyA9IGV4Y2x1ZGVQcmVmaXhQYXR0ZXJucztcbiAgICB0aGlzLm9ubHlVbmRlckN1cnJlbnREaXJlY3RvcnkgPSBvbmx5VW5kZXJDdXJyZW50RGlyZWN0b3J5O1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IE1vZGlmaWVyIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbnR5cGUgTmFtZSA9IFwiTm9uZVwiIHwgXCJDdHJsL0NtZCtFbnRlclwiIHwgXCJBbHQrRW50ZXJcIiB8IFwiU2hpZnQrRW50ZXJcIjtcbmludGVyZmFjZSBLZXlCaW5kIHtcbiAgbW9kaWZpZXJzOiBNb2RpZmllcltdO1xuICBrZXk6IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBjbGFzcyBPcGVuU291cmNlRmlsZUtleXMge1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBfdmFsdWVzOiBPcGVuU291cmNlRmlsZUtleXNbXSA9IFtdO1xuXG4gIHN0YXRpYyByZWFkb25seSBOT05FID0gbmV3IE9wZW5Tb3VyY2VGaWxlS2V5cyhcIk5vbmVcIiwge1xuICAgIG1vZGlmaWVyczogW10sXG4gICAga2V5OiBudWxsLFxuICB9KTtcbiAgc3RhdGljIHJlYWRvbmx5IE1PRF9FTlRFUiA9IG5ldyBPcGVuU291cmNlRmlsZUtleXMoXCJDdHJsL0NtZCtFbnRlclwiLCB7XG4gICAgbW9kaWZpZXJzOiBbXCJNb2RcIl0sXG4gICAga2V5OiBcIkVudGVyXCIsXG4gIH0pO1xuICBzdGF0aWMgcmVhZG9ubHkgQUxUX0VOVEVSID0gbmV3IE9wZW5Tb3VyY2VGaWxlS2V5cyhcIkFsdCtFbnRlclwiLCB7XG4gICAgbW9kaWZpZXJzOiBbXCJBbHRcIl0sXG4gICAga2V5OiBcIkVudGVyXCIsXG4gIH0pO1xuICBzdGF0aWMgcmVhZG9ubHkgU0hJRlRfRU5URVIgPSBuZXcgT3BlblNvdXJjZUZpbGVLZXlzKFwiU2hpZnQrRW50ZXJcIiwge1xuICAgIG1vZGlmaWVyczogW1wiU2hpZnRcIl0sXG4gICAga2V5OiBcIkVudGVyXCIsXG4gIH0pO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IocmVhZG9ubHkgbmFtZTogTmFtZSwgcmVhZG9ubHkga2V5QmluZDogS2V5QmluZCkge1xuICAgIE9wZW5Tb3VyY2VGaWxlS2V5cy5fdmFsdWVzLnB1c2godGhpcyk7XG4gIH1cblxuICBzdGF0aWMgZnJvbU5hbWUobmFtZTogc3RyaW5nKTogT3BlblNvdXJjZUZpbGVLZXlzIHtcbiAgICByZXR1cm4gT3BlblNvdXJjZUZpbGVLZXlzLl92YWx1ZXMuZmluZCgoeCkgPT4geC5uYW1lID09PSBuYW1lKSE7XG4gIH1cblxuICBzdGF0aWMgdmFsdWVzKCk6IE9wZW5Tb3VyY2VGaWxlS2V5c1tdIHtcbiAgICByZXR1cm4gT3BlblNvdXJjZUZpbGVLZXlzLl92YWx1ZXM7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgV29yZCB9IGZyb20gXCIuLi9tb2RlbC9Xb3JkXCI7XG5pbXBvcnQgeyBiYXNlbmFtZSB9IGZyb20gXCIuLi91dGlsL3BhdGhcIjtcblxuZXhwb3J0IGNsYXNzIERlc2NyaXB0aW9uT25TdWdnZXN0aW9uIHtcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX3ZhbHVlczogRGVzY3JpcHRpb25PblN1Z2dlc3Rpb25bXSA9IFtdO1xuXG4gIHN0YXRpYyByZWFkb25seSBOT05FID0gbmV3IERlc2NyaXB0aW9uT25TdWdnZXN0aW9uKFwiTm9uZVwiLCAoKSA9PiBudWxsKTtcbiAgc3RhdGljIHJlYWRvbmx5IFNIT1JUID0gbmV3IERlc2NyaXB0aW9uT25TdWdnZXN0aW9uKFwiU2hvcnRcIiwgKHdvcmQpID0+IHtcbiAgICBpZiAoIXdvcmQuZGVzY3JpcHRpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gd29yZC50eXBlID09PSBcImN1c3RvbURpY3Rpb25hcnlcIlxuICAgICAgPyB3b3JkLmRlc2NyaXB0aW9uXG4gICAgICA6IGJhc2VuYW1lKHdvcmQuZGVzY3JpcHRpb24pO1xuICB9KTtcbiAgc3RhdGljIHJlYWRvbmx5IEZVTEwgPSBuZXcgRGVzY3JpcHRpb25PblN1Z2dlc3Rpb24oXG4gICAgXCJGdWxsXCIsXG4gICAgKHdvcmQpID0+IHdvcmQuZGVzY3JpcHRpb24gPz8gbnVsbFxuICApO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuICAgIHJlYWRvbmx5IHRvRGlzcGxheTogKHdvcmQ6IFdvcmQpID0+IHN0cmluZyB8IG51bGxcbiAgKSB7XG4gICAgRGVzY3JpcHRpb25PblN1Z2dlc3Rpb24uX3ZhbHVlcy5wdXNoKHRoaXMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21OYW1lKG5hbWU6IHN0cmluZyk6IERlc2NyaXB0aW9uT25TdWdnZXN0aW9uIHtcbiAgICByZXR1cm4gRGVzY3JpcHRpb25PblN1Z2dlc3Rpb24uX3ZhbHVlcy5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IG5hbWUpITtcbiAgfVxuXG4gIHN0YXRpYyB2YWx1ZXMoKTogRGVzY3JpcHRpb25PblN1Z2dlc3Rpb25bXSB7XG4gICAgcmV0dXJuIERlc2NyaXB0aW9uT25TdWdnZXN0aW9uLl92YWx1ZXM7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQXBwLCBURmlsZSB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgeyBXb3Jkc0J5Rmlyc3RMZXR0ZXIgfSBmcm9tIFwiLi9zdWdnZXN0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQXBwSGVscGVyLCBGcm9udE1hdHRlclZhbHVlIH0gZnJvbSBcIi4uL2FwcC1oZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRnJvbnRNYXR0ZXJXb3JkIH0gZnJvbSBcIi4uL21vZGVsL1dvcmRcIjtcbmltcG9ydCB7IGV4Y2x1ZGVFbW9qaSB9IGZyb20gXCIuLi91dGlsL3N0cmluZ3NcIjtcbmltcG9ydCB7IGdyb3VwQnksIHVuaXFCeSB9IGZyb20gXCIuLi91dGlsL2NvbGxlY3Rpb24taGVscGVyXCI7XG5cbmZ1bmN0aW9uIHN5bm9ueW1BbGlhc2VzKG5hbWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgbGVzc0Vtb2ppVmFsdWUgPSBleGNsdWRlRW1vamkobmFtZSk7XG4gIHJldHVybiBuYW1lID09PSBsZXNzRW1vamlWYWx1ZSA/IFtdIDogW2xlc3NFbW9qaVZhbHVlXTtcbn1cblxuZnVuY3Rpb24gZnJvbnRNYXR0ZXJUb1dvcmRzKFxuICBmaWxlOiBURmlsZSxcbiAga2V5OiBzdHJpbmcsXG4gIHZhbHVlczogRnJvbnRNYXR0ZXJWYWx1ZVxuKTogRnJvbnRNYXR0ZXJXb3JkW10ge1xuICByZXR1cm4gdmFsdWVzLm1hcCgoeCkgPT4gKHtcbiAgICBrZXksXG4gICAgdmFsdWU6IHgsXG4gICAgdHlwZTogXCJmcm9udE1hdHRlclwiLFxuICAgIGNyZWF0ZWRQYXRoOiBmaWxlLnBhdGgsXG4gICAgYWxpYXNlczogc3lub255bUFsaWFzZXMoeCksXG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gcGlja1dvcmRzKGZpbGU6IFRGaWxlLCBmbTogeyBba2V5OiBzdHJpbmddOiBGcm9udE1hdHRlclZhbHVlIH0pIHtcbiAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKGZtKVxuICAgIC5maWx0ZXIoXG4gICAgICAoW19rZXksIHZhbHVlXSkgPT5cbiAgICAgICAgdmFsdWUgIT0gbnVsbCAmJlxuICAgICAgICAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiB2YWx1ZVswXSA9PT0gXCJzdHJpbmdcIilcbiAgICApXG4gICAgLmZsYXRNYXAoKFtrZXksIHZhbHVlXSkgPT4gZnJvbnRNYXR0ZXJUb1dvcmRzKGZpbGUsIGtleSwgdmFsdWUpKTtcbn1cblxuLy8gbm9pbnNwZWN0aW9uIEZ1bmN0aW9uV2l0aE11bHRpcGxlTG9vcHNKU1xuZnVuY3Rpb24gZXh0cmFjdEFuZFVuaXFXb3JkcyhcbiAgd29yZHNCeUNyZWF0ZWRQYXRoOiBGcm9udE1hdHRlcldvcmRQcm92aWRlcltcIndvcmRzQnlDcmVhdGVkUGF0aFwiXVxuKTogRnJvbnRNYXR0ZXJXb3JkW10ge1xuICByZXR1cm4gdW5pcUJ5KFxuICAgIE9iamVjdC52YWx1ZXMod29yZHNCeUNyZWF0ZWRQYXRoKS5mbGF0KCksXG4gICAgKHcpID0+IHcua2V5ICsgdy52YWx1ZS50b0xvd2VyQ2FzZSgpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGluZGV4aW5nV29yZHMoXG4gIHdvcmRzOiBGcm9udE1hdHRlcldvcmRbXVxuKTogRnJvbnRNYXR0ZXJXb3JkUHJvdmlkZXJbXCJ3b3Jkc0J5Rmlyc3RMZXR0ZXJCeUtleVwiXSB7XG4gIGNvbnN0IHdvcmRzQnlLZXkgPSBncm91cEJ5KHdvcmRzLCAoeCkgPT4geC5rZXkpO1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHdvcmRzQnlLZXkpLm1hcChcbiAgICAgIChba2V5LCB3b3Jkc106IFtzdHJpbmcsIEZyb250TWF0dGVyV29yZFtdXSkgPT4gW1xuICAgICAgICBrZXksXG4gICAgICAgIGdyb3VwQnkod29yZHMsICh3KSA9PiB3LnZhbHVlLmNoYXJBdCgwKSksXG4gICAgICBdXG4gICAgKVxuICApO1xufVxuXG5leHBvcnQgY2xhc3MgRnJvbnRNYXR0ZXJXb3JkUHJvdmlkZXIge1xuICBwcml2YXRlIHdvcmRzQnlDcmVhdGVkUGF0aDogeyBbcGF0aDogc3RyaW5nXTogRnJvbnRNYXR0ZXJXb3JkW10gfSA9IHt9O1xuICB3b3JkczogRnJvbnRNYXR0ZXJXb3JkW107XG4gIHdvcmRzQnlGaXJzdExldHRlckJ5S2V5OiB7IFtrZXk6IHN0cmluZ106IFdvcmRzQnlGaXJzdExldHRlciB9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYXBwOiBBcHAsIHByaXZhdGUgYXBwSGVscGVyOiBBcHBIZWxwZXIpIHt9XG5cbiAgcmVmcmVzaFdvcmRzKCk6IHZvaWQge1xuICAgIHRoaXMuY2xlYXJXb3JkcygpO1xuXG4gICAgdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpLmZvckVhY2goKGYpID0+IHtcbiAgICAgIGNvbnN0IGZtID0gdGhpcy5hcHBIZWxwZXIuZ2V0RnJvbnRNYXR0ZXIoZik7XG4gICAgICBpZiAoIWZtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy53b3Jkc0J5Q3JlYXRlZFBhdGhbZi5wYXRoXSA9IHBpY2tXb3JkcyhmLCBmbSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLndvcmRzID0gZXh0cmFjdEFuZFVuaXFXb3Jkcyh0aGlzLndvcmRzQnlDcmVhdGVkUGF0aCk7XG4gICAgdGhpcy53b3Jkc0J5Rmlyc3RMZXR0ZXJCeUtleSA9IGluZGV4aW5nV29yZHModGhpcy53b3Jkcyk7XG4gIH1cblxuICB1cGRhdGVXb3JkSW5kZXgoZmlsZTogVEZpbGUpOiB2b2lkIHtcbiAgICBjb25zdCBmbSA9IHRoaXMuYXBwSGVscGVyLmdldEZyb250TWF0dGVyKGZpbGUpO1xuICAgIGlmICghZm0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLndvcmRzQnlDcmVhdGVkUGF0aFtmaWxlLnBhdGhdID0gcGlja1dvcmRzKGZpbGUsIGZtKTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmRzKCk6IHZvaWQge1xuICAgIHRoaXMud29yZHMgPSBleHRyYWN0QW5kVW5pcVdvcmRzKHRoaXMud29yZHNCeUNyZWF0ZWRQYXRoKTtcbiAgICB0aGlzLndvcmRzQnlGaXJzdExldHRlckJ5S2V5ID0gaW5kZXhpbmdXb3Jkcyh0aGlzLndvcmRzKTtcbiAgfVxuXG4gIGNsZWFyV29yZHMoKTogdm9pZCB7XG4gICAgdGhpcy53b3Jkc0J5Q3JlYXRlZFBhdGggPSB7fTtcbiAgICB0aGlzLndvcmRzID0gW107XG4gICAgdGhpcy53b3Jkc0J5Rmlyc3RMZXR0ZXJCeUtleSA9IHt9O1xuICB9XG5cbiAgZ2V0IHdvcmRDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLndvcmRzLmxlbmd0aDtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBJbmRleGVkV29yZHMgfSBmcm9tIFwiLi4vdWkvQXV0b0NvbXBsZXRlU3VnZ2VzdFwiO1xuaW1wb3J0IHsgc3VnZ2VzdFdvcmRzLCBzdWdnZXN0V29yZHNCeVBhcnRpYWxNYXRjaCB9IGZyb20gXCIuL3N1Z2dlc3RlclwiO1xuaW1wb3J0IHR5cGUgeyBXb3JkIH0gZnJvbSBcIi4uL21vZGVsL1dvcmRcIjtcbmltcG9ydCB0eXBlIHsgU2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2UgfSBmcm9tIFwiLi4vc3RvcmFnZS9TZWxlY3Rpb25IaXN0b3J5U3RvcmFnZVwiO1xuXG50eXBlIE5hbWUgPSBcImluaGVyaXRcIiB8IFwicHJlZml4XCIgfCBcInBhcnRpYWxcIjtcblxudHlwZSBIYW5kbGVyID0gKFxuICBpbmRleGVkV29yZHM6IEluZGV4ZWRXb3JkcyxcbiAgcXVlcnk6IHN0cmluZyxcbiAgbWF4OiBudW1iZXIsXG4gIG9wdGlvbjoge1xuICAgIGZyb250TWF0dGVyPzogc3RyaW5nO1xuICAgIHNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlPzogU2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2U7XG4gIH1cbikgPT4gV29yZFtdO1xuXG5jb25zdCBuZXZlclVzZWRIYW5kbGVyID0gKC4uLl9hcmdzOiBhbnlbXSkgPT4gW107XG5cbmV4cG9ydCBjbGFzcyBTcGVjaWZpY01hdGNoU3RyYXRlZ3kge1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBfdmFsdWVzOiBTcGVjaWZpY01hdGNoU3RyYXRlZ3lbXSA9IFtdO1xuXG4gIHN0YXRpYyByZWFkb25seSBJTkhFUklUID0gbmV3IFNwZWNpZmljTWF0Y2hTdHJhdGVneShcbiAgICBcImluaGVyaXRcIixcbiAgICBuZXZlclVzZWRIYW5kbGVyXG4gICk7XG4gIHN0YXRpYyByZWFkb25seSBQUkVGSVggPSBuZXcgU3BlY2lmaWNNYXRjaFN0cmF0ZWd5KFwicHJlZml4XCIsIHN1Z2dlc3RXb3Jkcyk7XG4gIHN0YXRpYyByZWFkb25seSBQQVJUSUFMID0gbmV3IFNwZWNpZmljTWF0Y2hTdHJhdGVneShcbiAgICBcInBhcnRpYWxcIixcbiAgICBzdWdnZXN0V29yZHNCeVBhcnRpYWxNYXRjaFxuICApO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IocmVhZG9ubHkgbmFtZTogTmFtZSwgcmVhZG9ubHkgaGFuZGxlcjogSGFuZGxlcikge1xuICAgIFNwZWNpZmljTWF0Y2hTdHJhdGVneS5fdmFsdWVzLnB1c2godGhpcyk7XG4gIH1cblxuICBzdGF0aWMgZnJvbU5hbWUobmFtZTogc3RyaW5nKTogU3BlY2lmaWNNYXRjaFN0cmF0ZWd5IHtcbiAgICByZXR1cm4gU3BlY2lmaWNNYXRjaFN0cmF0ZWd5Ll92YWx1ZXMuZmluZCgoeCkgPT4geC5uYW1lID09PSBuYW1lKSE7XG4gIH1cblxuICBzdGF0aWMgdmFsdWVzKCk6IFNwZWNpZmljTWF0Y2hTdHJhdGVneVtdIHtcbiAgICByZXR1cm4gU3BlY2lmaWNNYXRjaFN0cmF0ZWd5Ll92YWx1ZXM7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgV29yZCB9IGZyb20gXCIuLi9tb2RlbC9Xb3JkXCI7XG5pbXBvcnQgdHlwZSB7IFBhcnRpYWxSZXF1aXJlZCB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5leHBvcnQgdHlwZSBIaXRXb3JkID0gUGFydGlhbFJlcXVpcmVkPFdvcmQsIFwiaGl0XCI+O1xuZXhwb3J0IHR5cGUgU2VsZWN0aW9uSGlzdG9yeSA9IHtcbiAgY291bnQ6IG51bWJlcjtcbiAgbGFzdFVwZGF0ZWQ6IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFNlbGVjdGlvbkhpc3RvcnlUcmVlID0ge1xuICBbaGl0OiBzdHJpbmddOiB7XG4gICAgW3ZhbHVlOiBzdHJpbmddOiB7XG4gICAgICBbdHlwZTogc3RyaW5nXTogU2VsZWN0aW9uSGlzdG9yeTtcbiAgICB9O1xuICB9O1xufTtcblxuY29uc3QgU0VDID0gMTAwMDtcbmNvbnN0IE1JTiA9IFNFQyAqIDYwO1xuY29uc3QgSE9VUiA9IE1JTiAqIDYwO1xuY29uc3QgREFZID0gSE9VUiAqIDI0O1xuY29uc3QgV0VFSyA9IERBWSAqIDc7XG5cbmZ1bmN0aW9uIGNhbGNTY29yZShcbiAgaGlzdG9yeTogU2VsZWN0aW9uSGlzdG9yeSB8IHVuZGVmaW5lZCxcbiAgbGF0ZXN0VXBkYXRlZDogbnVtYmVyXG4pOiBudW1iZXIge1xuICBpZiAoIWhpc3RvcnkpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGlmIChoaXN0b3J5Lmxhc3RVcGRhdGVkID09PSBsYXRlc3RVcGRhdGVkKSB7XG4gICAgcmV0dXJuIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICB9XG5cbiAgY29uc3QgYmVoaW5kID0gRGF0ZS5ub3coKSAtIGhpc3RvcnkubGFzdFVwZGF0ZWQ7XG5cbiAgLy8gbm9pbnNwZWN0aW9uIElmU3RhdGVtZW50V2l0aFRvb01hbnlCcmFuY2hlc0pTXG4gIGlmIChiZWhpbmQgPCBNSU4pIHtcbiAgICByZXR1cm4gOCAqIGhpc3RvcnkuY291bnQ7XG4gIH0gZWxzZSBpZiAoYmVoaW5kIDwgSE9VUikge1xuICAgIHJldHVybiA0ICogaGlzdG9yeS5jb3VudDtcbiAgfSBlbHNlIGlmIChiZWhpbmQgPCBEQVkpIHtcbiAgICByZXR1cm4gMiAqIGhpc3RvcnkuY291bnQ7XG4gIH0gZWxzZSBpZiAoYmVoaW5kIDwgV0VFSykge1xuICAgIHJldHVybiAwLjUgKiBoaXN0b3J5LmNvdW50O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwLjI1ICogaGlzdG9yeS5jb3VudDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2Uge1xuICBkYXRhOiBTZWxlY3Rpb25IaXN0b3J5VHJlZTtcbiAgdmVyc2lvbjogbnVtYmVyO1xuICBwZXJzaXN0ZWRWZXJzaW9uOiBudW1iZXI7XG4gIC8vIDAgbWVhbnMgbm90IGRlZmluZWRcbiAgbWF4RGF5c1RvS2VlcEhpc3Rvcnk6IG51bWJlcjtcbiAgLy8gMCBtZWFucyBub3QgZGVmaW5lZFxuICBtYXhOdW1iZXJPZkhpc3RvcnlUb0tlZXA6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkYXRhOiBTZWxlY3Rpb25IaXN0b3J5VHJlZSA9IHt9LFxuICAgIG1heERheXNUb0tlZXBIaXN0b3J5OiBudW1iZXIsXG4gICAgbWF4TnVtYmVyT2ZIaXN0b3J5VG9LZWVwOiBudW1iZXJcbiAgKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgdGhpcy52ZXJzaW9uID0gbm93O1xuICAgIHRoaXMucGVyc2lzdGVkVmVyc2lvbiA9IG5vdztcblxuICAgIHRoaXMubWF4RGF5c1RvS2VlcEhpc3RvcnkgPSBtYXhEYXlzVG9LZWVwSGlzdG9yeTtcbiAgICB0aGlzLm1heE51bWJlck9mSGlzdG9yeVRvS2VlcCA9IG1heE51bWJlck9mSGlzdG9yeVRvS2VlcDtcbiAgfVxuXG4gIC8vIG5vaW5zcGVjdGlvbiBGdW5jdGlvbldpdGhNdWx0aXBsZUxvb3BzSlNcbiAgcHVyZ2UoKSB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCB0aW1lczogbnVtYmVyW10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgaGl0IG9mIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkpIHtcbiAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgT2JqZWN0LmtleXModGhpcy5kYXRhW2hpdF0pKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2luZCBvZiBPYmplY3Qua2V5cyh0aGlzLmRhdGFbaGl0XVt2YWx1ZV0pKSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5tYXhEYXlzVG9LZWVwSGlzdG9yeSAmJlxuICAgICAgICAgICAgbm93IC0gdGhpcy5kYXRhW2hpdF1bdmFsdWVdW2tpbmRdLmxhc3RVcGRhdGVkID5cbiAgICAgICAgICAgICAgdGhpcy5tYXhEYXlzVG9LZWVwSGlzdG9yeSAqIERBWVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGF0YVtoaXRdW3ZhbHVlXVtraW5kXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGltZXMucHVzaCh0aGlzLmRhdGFbaGl0XVt2YWx1ZV1ba2luZF0ubGFzdFVwZGF0ZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChPYmplY3QuaXNFbXB0eSh0aGlzLmRhdGFbaGl0XVt2YWx1ZV0pKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuZGF0YVtoaXRdW3ZhbHVlXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoT2JqZWN0LmlzRW1wdHkodGhpcy5kYXRhW2hpdF0pKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmRhdGFbaGl0XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5tYXhOdW1iZXJPZkhpc3RvcnlUb0tlZXApIHtcbiAgICAgIGNvbnN0IHRocmVzaG9sZCA9XG4gICAgICAgIHRpbWVzXG4gICAgICAgICAgLnNvcnQoKGEsIGIpID0+IChhID4gYiA/IC0xIDogMSkpXG4gICAgICAgICAgLnNsaWNlKDAsIHRoaXMubWF4TnVtYmVyT2ZIaXN0b3J5VG9LZWVwKVxuICAgICAgICAgIC5hdCgtMSkgPz8gMDtcblxuICAgICAgZm9yIChjb25zdCBoaXQgb2YgT2JqZWN0LmtleXModGhpcy5kYXRhKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC5rZXlzKHRoaXMuZGF0YVtoaXRdKSkge1xuICAgICAgICAgIGZvciAoY29uc3Qga2luZCBvZiBPYmplY3Qua2V5cyh0aGlzLmRhdGFbaGl0XVt2YWx1ZV0pKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhW2hpdF1bdmFsdWVdW2tpbmRdLmxhc3RVcGRhdGVkIDwgdGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRhdGFbaGl0XVt2YWx1ZV1ba2luZF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKE9iamVjdC5pc0VtcHR5KHRoaXMuZGF0YVtoaXRdW3ZhbHVlXSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRhdGFbaGl0XVt2YWx1ZV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE9iamVjdC5pc0VtcHR5KHRoaXMuZGF0YVtoaXRdKSkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmRhdGFbaGl0XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFNlbGVjdGlvbkhpc3Rvcnkod29yZDogSGl0V29yZCk6IFNlbGVjdGlvbkhpc3RvcnkgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmRhdGFbd29yZC5oaXRdPy5bd29yZC52YWx1ZV0/Llt3b3JkLnR5cGVdO1xuICB9XG5cbiAgaW5jcmVtZW50KHdvcmQ6IEhpdFdvcmQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZGF0YVt3b3JkLmhpdF0pIHtcbiAgICAgIHRoaXMuZGF0YVt3b3JkLmhpdF0gPSB7fTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmRhdGFbd29yZC5oaXRdW3dvcmQudmFsdWVdKSB7XG4gICAgICB0aGlzLmRhdGFbd29yZC5oaXRdW3dvcmQudmFsdWVdID0ge307XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGF0YVt3b3JkLmhpdF1bd29yZC52YWx1ZV1bd29yZC50eXBlXSkge1xuICAgICAgdGhpcy5kYXRhW3dvcmQuaGl0XVt3b3JkLnZhbHVlXVt3b3JkLnR5cGVdID0ge1xuICAgICAgICBjb3VudDogdGhpcy5kYXRhW3dvcmQuaGl0XVt3b3JkLnZhbHVlXVt3b3JkLnR5cGVdLmNvdW50ICsgMSxcbiAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGUubm93KCksXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRhdGFbd29yZC5oaXRdW3dvcmQudmFsdWVdW3dvcmQudHlwZV0gPSB7XG4gICAgICAgIGNvdW50OiAxLFxuICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZS5ub3coKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy52ZXJzaW9uID0gRGF0ZS5ub3coKTtcbiAgfVxuXG4gIGNvbXBhcmUodzE6IEhpdFdvcmQsIHcyOiBIaXRXb3JkLCBsYXRlc3RVcGRhdGVkOiBudW1iZXIpOiAtMSB8IDAgfCAxIHtcbiAgICBjb25zdCBzY29yZTEgPSBjYWxjU2NvcmUodGhpcy5nZXRTZWxlY3Rpb25IaXN0b3J5KHcxKSwgbGF0ZXN0VXBkYXRlZCk7XG4gICAgY29uc3Qgc2NvcmUyID0gY2FsY1Njb3JlKHRoaXMuZ2V0U2VsZWN0aW9uSGlzdG9yeSh3MiksIGxhdGVzdFVwZGF0ZWQpO1xuXG4gICAgaWYgKHNjb3JlMSA9PT0gc2NvcmUyKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2NvcmUxID4gc2NvcmUyID8gLTEgOiAxO1xuICB9XG5cbiAgZ2V0IHNob3VsZFBlcnNpc3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudmVyc2lvbiA+IHRoaXMucGVyc2lzdGVkVmVyc2lvbjtcbiAgfVxuXG4gIHN5bmNQZXJzaXN0VmVyc2lvbigpOiB2b2lkIHtcbiAgICB0aGlzLnBlcnNpc3RlZFZlcnNpb24gPSB0aGlzLnZlcnNpb247XG4gIH1cbn1cbiIsImltcG9ydCB7XG4gIEFwcCxcbiAgZGVib3VuY2UsXG4gIHR5cGUgRGVib3VuY2VyLFxuICBFZGl0b3IsXG4gIHR5cGUgRWRpdG9yUG9zaXRpb24sXG4gIEVkaXRvclN1Z2dlc3QsXG4gIHR5cGUgRWRpdG9yU3VnZ2VzdENvbnRleHQsXG4gIHR5cGUgRWRpdG9yU3VnZ2VzdFRyaWdnZXJJbmZvLFxuICB0eXBlIEV2ZW50UmVmLFxuICB0eXBlIEtleW1hcEV2ZW50SGFuZGxlcixcbiAgdHlwZSBNb2RpZmllcixcbiAgTm90aWNlLFxuICBTY29wZSxcbiAgVEZpbGUsXG59IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHsgY3JlYXRlVG9rZW5pemVyLCB0eXBlIFRva2VuaXplciB9IGZyb20gXCIuLi90b2tlbml6ZXIvdG9rZW5pemVyXCI7XG5pbXBvcnQgeyBUb2tlbml6ZVN0cmF0ZWd5IH0gZnJvbSBcIi4uL3Rva2VuaXplci9Ub2tlbml6ZVN0cmF0ZWd5XCI7XG5pbXBvcnQgdHlwZSB7IFNldHRpbmdzIH0gZnJvbSBcIi4uL3NldHRpbmcvc2V0dGluZ3NcIjtcbmltcG9ydCB7IEFwcEhlbHBlciB9IGZyb20gXCIuLi9hcHAtaGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFdvcmRzQnlGaXJzdExldHRlciB9IGZyb20gXCIuLi9wcm92aWRlci9zdWdnZXN0ZXJcIjtcbmltcG9ydCB7IEN1c3RvbURpY3Rpb25hcnlXb3JkUHJvdmlkZXIgfSBmcm9tIFwiLi4vcHJvdmlkZXIvQ3VzdG9tRGljdGlvbmFyeVdvcmRQcm92aWRlclwiO1xuaW1wb3J0IHsgQ3VycmVudEZpbGVXb3JkUHJvdmlkZXIgfSBmcm9tIFwiLi4vcHJvdmlkZXIvQ3VycmVudEZpbGVXb3JkUHJvdmlkZXJcIjtcbmltcG9ydCB7IEludGVybmFsTGlua1dvcmRQcm92aWRlciB9IGZyb20gXCIuLi9wcm92aWRlci9JbnRlcm5hbExpbmtXb3JkUHJvdmlkZXJcIjtcbmltcG9ydCB7IE1hdGNoU3RyYXRlZ3kgfSBmcm9tIFwiLi4vcHJvdmlkZXIvTWF0Y2hTdHJhdGVneVwiO1xuaW1wb3J0IHsgQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzIH0gZnJvbSBcIi4uL29wdGlvbi9DeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXNcIjtcbmltcG9ydCB7IENvbHVtbkRlbGltaXRlciB9IGZyb20gXCIuLi9vcHRpb24vQ29sdW1uRGVsaW1pdGVyXCI7XG5pbXBvcnQgeyBTZWxlY3RTdWdnZXN0aW9uS2V5IH0gZnJvbSBcIi4uL29wdGlvbi9TZWxlY3RTdWdnZXN0aW9uS2V5XCI7XG5pbXBvcnQgeyB1bmlxV2l0aCB9IGZyb20gXCIuLi91dGlsL2NvbGxlY3Rpb24taGVscGVyXCI7XG5pbXBvcnQgeyBDdXJyZW50VmF1bHRXb3JkUHJvdmlkZXIgfSBmcm9tIFwiLi4vcHJvdmlkZXIvQ3VycmVudFZhdWx0V29yZFByb3ZpZGVyXCI7XG5pbXBvcnQgdHlwZSB7IFByb3ZpZGVyU3RhdHVzQmFyIH0gZnJvbSBcIi4vUHJvdmlkZXJTdGF0dXNCYXJcIjtcbmltcG9ydCB0eXBlIHsgV29yZCB9IGZyb20gXCIuLi9tb2RlbC9Xb3JkXCI7XG5pbXBvcnQgeyBPcGVuU291cmNlRmlsZUtleXMgfSBmcm9tIFwiLi4vb3B0aW9uL09wZW5Tb3VyY2VGaWxlS2V5c1wiO1xuaW1wb3J0IHsgRGVzY3JpcHRpb25PblN1Z2dlc3Rpb24gfSBmcm9tIFwiLi4vb3B0aW9uL0Rlc2NyaXB0aW9uT25TdWdnZXN0aW9uXCI7XG5pbXBvcnQgeyBGcm9udE1hdHRlcldvcmRQcm92aWRlciB9IGZyb20gXCIuLi9wcm92aWRlci9Gcm9udE1hdHRlcldvcmRQcm92aWRlclwiO1xuaW1wb3J0IHsgU3BlY2lmaWNNYXRjaFN0cmF0ZWd5IH0gZnJvbSBcIi4uL3Byb3ZpZGVyL1NwZWNpZmljTWF0Y2hTdHJhdGVneVwiO1xuaW1wb3J0IHtcbiAgdHlwZSBIaXRXb3JkLFxuICBTZWxlY3Rpb25IaXN0b3J5U3RvcmFnZSxcbn0gZnJvbSBcIi4uL3N0b3JhZ2UvU2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2VcIjtcbmltcG9ydCB7IHN1Z2dlc3Rpb25VbmlxUHJlZGljYXRlIH0gZnJvbSBcIi4uL3Byb3ZpZGVyL3N1Z2dlc3RlclwiO1xuaW1wb3J0IHsgZW5jb2RlU3BhY2UgfSBmcm9tIFwiLi4vdXRpbC9zdHJpbmdzXCI7XG5cbmZ1bmN0aW9uIGJ1aWxkTG9nTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcsIG1zZWM6IG51bWJlcikge1xuICByZXR1cm4gYCR7bWVzc2FnZX06ICR7TWF0aC5yb3VuZChtc2VjKX1bbXNdYDtcbn1cblxuZXhwb3J0IHR5cGUgSW5kZXhlZFdvcmRzID0ge1xuICBjdXJyZW50RmlsZTogV29yZHNCeUZpcnN0TGV0dGVyO1xuICBjdXJyZW50VmF1bHQ6IFdvcmRzQnlGaXJzdExldHRlcjtcbiAgY3VzdG9tRGljdGlvbmFyeTogV29yZHNCeUZpcnN0TGV0dGVyO1xuICBpbnRlcm5hbExpbms6IFdvcmRzQnlGaXJzdExldHRlcjtcbiAgZnJvbnRNYXR0ZXI6IHsgW2tleTogc3RyaW5nXTogV29yZHNCeUZpcnN0TGV0dGVyIH07XG59O1xuXG4vLyBUaGlzIGlzIGFuIHVuc2FmZSBjb2RlLi4hIVxuaW50ZXJmYWNlIFVuc2FmZUVkaXRvclN1Z2dlc3RJbnRlcmZhY2Uge1xuICBzY29wZTogU2NvcGUgJiB7IGtleXM6IChLZXltYXBFdmVudEhhbmRsZXIgJiB7IGZ1bmM6IENhbGxhYmxlRnVuY3Rpb24gfSlbXSB9O1xuICBzdWdnZXN0aW9uczoge1xuICAgIHNlbGVjdGVkSXRlbTogbnVtYmVyO1xuICAgIHVzZVNlbGVjdGVkSXRlbShldjogUGFydGlhbDxLZXlib2FyZEV2ZW50Pik6IHZvaWQ7XG4gICAgc2V0U2VsZWN0ZWRJdGVtKHNlbGVjdGVkOiBudW1iZXIsIGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZDtcbiAgICB2YWx1ZXM6IFdvcmRbXTtcbiAgfTtcbiAgaXNPcGVuOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgQXV0b0NvbXBsZXRlU3VnZ2VzdFxuICBleHRlbmRzIEVkaXRvclN1Z2dlc3Q8V29yZD5cbiAgaW1wbGVtZW50cyBVbnNhZmVFZGl0b3JTdWdnZXN0SW50ZXJmYWNlXG57XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogU2V0dGluZ3M7XG4gIGFwcEhlbHBlcjogQXBwSGVscGVyO1xuICBzdGF0dXNCYXI6IFByb3ZpZGVyU3RhdHVzQmFyO1xuXG4gIGN1cnJlbnRGaWxlV29yZFByb3ZpZGVyOiBDdXJyZW50RmlsZVdvcmRQcm92aWRlcjtcbiAgY3VycmVudFZhdWx0V29yZFByb3ZpZGVyOiBDdXJyZW50VmF1bHRXb3JkUHJvdmlkZXI7XG4gIGN1c3RvbURpY3Rpb25hcnlXb3JkUHJvdmlkZXI6IEN1c3RvbURpY3Rpb25hcnlXb3JkUHJvdmlkZXI7XG4gIGludGVybmFsTGlua1dvcmRQcm92aWRlcjogSW50ZXJuYWxMaW5rV29yZFByb3ZpZGVyO1xuICBmcm9udE1hdHRlcldvcmRQcm92aWRlcjogRnJvbnRNYXR0ZXJXb3JkUHJvdmlkZXI7XG4gIHNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlOiBTZWxlY3Rpb25IaXN0b3J5U3RvcmFnZSB8IHVuZGVmaW5lZDtcblxuICB0b2tlbml6ZXI6IFRva2VuaXplcjtcbiAgZGVib3VuY2VHZXRTdWdnZXN0aW9uczogRGVib3VuY2VyPFxuICAgIFtFZGl0b3JTdWdnZXN0Q29udGV4dCwgKHRva2VuczogV29yZFtdKSA9PiB2b2lkXSxcbiAgICB2b2lkXG4gID47XG4gIGRlYm91bmNlQ2xvc2U6IERlYm91bmNlcjxbXSwgdm9pZD47XG5cbiAgcnVuTWFudWFsbHk6IGJvb2xlYW47XG4gIGRlY2xhcmUgaXNPcGVuOiBib29sZWFuO1xuXG4gIGNvbnRleHRTdGFydENoOiBudW1iZXI7XG5cbiAgcHJldmlvdXNDdXJyZW50TGluZSA9IFwiXCI7XG5cbiAgLy8gdW5zYWZlISFcbiAgc2NvcGU6IFVuc2FmZUVkaXRvclN1Z2dlc3RJbnRlcmZhY2VbXCJzY29wZVwiXTtcbiAgc3VnZ2VzdGlvbnM6IFVuc2FmZUVkaXRvclN1Z2dlc3RJbnRlcmZhY2VbXCJzdWdnZXN0aW9uc1wiXTtcblxuICBrZXltYXBFdmVudEhhbmRsZXI6IEtleW1hcEV2ZW50SGFuZGxlcltdID0gW107XG4gIG1vZGlmeUV2ZW50UmVmOiBFdmVudFJlZjtcbiAgYWN0aXZlTGVhZkNoYW5nZVJlZjogRXZlbnRSZWY7XG4gIG1ldGFkYXRhQ2FjaGVDaGFuZ2VSZWY6IEV2ZW50UmVmO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IoYXBwOiBBcHAsIHN0YXR1c0JhcjogUHJvdmlkZXJTdGF0dXNCYXIpIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMuYXBwSGVscGVyID0gbmV3IEFwcEhlbHBlcihhcHApO1xuICAgIHRoaXMuc3RhdHVzQmFyID0gc3RhdHVzQmFyO1xuICB9XG5cbiAgdHJpZ2dlckNvbXBsZXRlKCkge1xuICAgIGNvbnN0IGVkaXRvciA9IHRoaXMuYXBwSGVscGVyLmdldEN1cnJlbnRFZGl0b3IoKTtcbiAgICBjb25zdCBhY3RpdmVGaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICBpZiAoIWVkaXRvciB8fCAhYWN0aXZlRmlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFhYWDogVW5zYWZlXG4gICAgdGhpcy5ydW5NYW51YWxseSA9IHRydWU7XG4gICAgKHRoaXMgYXMgYW55KS50cmlnZ2VyKGVkaXRvciwgYWN0aXZlRmlsZSwgdHJ1ZSk7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgbmV3KFxuICAgIGFwcDogQXBwLFxuICAgIHNldHRpbmdzOiBTZXR0aW5ncyxcbiAgICBzdGF0dXNCYXI6IFByb3ZpZGVyU3RhdHVzQmFyLFxuICAgIG9uUGVyc2lzdFNlbGVjdGlvbkhpc3Rvcnk6ICgpID0+IHZvaWRcbiAgKTogUHJvbWlzZTxBdXRvQ29tcGxldGVTdWdnZXN0PiB7XG4gICAgY29uc3QgaW5zID0gbmV3IEF1dG9Db21wbGV0ZVN1Z2dlc3QoYXBwLCBzdGF0dXNCYXIpO1xuXG4gICAgaW5zLmN1cnJlbnRGaWxlV29yZFByb3ZpZGVyID0gbmV3IEN1cnJlbnRGaWxlV29yZFByb3ZpZGVyKFxuICAgICAgaW5zLmFwcCxcbiAgICAgIGlucy5hcHBIZWxwZXJcbiAgICApO1xuICAgIGlucy5jdXJyZW50VmF1bHRXb3JkUHJvdmlkZXIgPSBuZXcgQ3VycmVudFZhdWx0V29yZFByb3ZpZGVyKFxuICAgICAgaW5zLmFwcCxcbiAgICAgIGlucy5hcHBIZWxwZXJcbiAgICApO1xuICAgIGlucy5jdXN0b21EaWN0aW9uYXJ5V29yZFByb3ZpZGVyID0gbmV3IEN1c3RvbURpY3Rpb25hcnlXb3JkUHJvdmlkZXIoXG4gICAgICBpbnMuYXBwLFxuICAgICAgaW5zLmFwcEhlbHBlclxuICAgICk7XG4gICAgaW5zLmludGVybmFsTGlua1dvcmRQcm92aWRlciA9IG5ldyBJbnRlcm5hbExpbmtXb3JkUHJvdmlkZXIoXG4gICAgICBpbnMuYXBwLFxuICAgICAgaW5zLmFwcEhlbHBlclxuICAgICk7XG4gICAgaW5zLmZyb250TWF0dGVyV29yZFByb3ZpZGVyID0gbmV3IEZyb250TWF0dGVyV29yZFByb3ZpZGVyKFxuICAgICAgaW5zLmFwcCxcbiAgICAgIGlucy5hcHBIZWxwZXJcbiAgICApO1xuXG4gICAgaW5zLnNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlID0gbmV3IFNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlKFxuICAgICAgc2V0dGluZ3Muc2VsZWN0aW9uSGlzdG9yeVRyZWUsXG4gICAgICBzZXR0aW5ncy5pbnRlbGxpZ2VudFN1Z2dlc3Rpb25Qcmlvcml0aXphdGlvbi5tYXhEYXlzVG9LZWVwSGlzdG9yeSxcbiAgICAgIHNldHRpbmdzLmludGVsbGlnZW50U3VnZ2VzdGlvblByaW9yaXRpemF0aW9uLm1heE51bWJlck9mSGlzdG9yeVRvS2VlcFxuICAgICk7XG4gICAgaW5zLnNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlLnB1cmdlKCk7XG5cbiAgICBhd2FpdCBpbnMudXBkYXRlU2V0dGluZ3Moc2V0dGluZ3MpO1xuXG4gICAgaW5zLm1vZGlmeUV2ZW50UmVmID0gYXBwLnZhdWx0Lm9uKFwibW9kaWZ5XCIsIGFzeW5jIChfKSA9PiB7XG4gICAgICBhd2FpdCBpbnMucmVmcmVzaEN1cnJlbnRGaWxlVG9rZW5zKCk7XG4gICAgICBpZiAoaW5zLnNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlPy5zaG91bGRQZXJzaXN0KSB7XG4gICAgICAgIGlucy5zZXR0aW5ncy5zZWxlY3Rpb25IaXN0b3J5VHJlZSA9IGlucy5zZWxlY3Rpb25IaXN0b3J5U3RvcmFnZS5kYXRhO1xuICAgICAgICBpbnMuc2VsZWN0aW9uSGlzdG9yeVN0b3JhZ2Uuc3luY1BlcnNpc3RWZXJzaW9uKCk7XG4gICAgICAgIG9uUGVyc2lzdFNlbGVjdGlvbkhpc3RvcnkoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpbnMuYWN0aXZlTGVhZkNoYW5nZVJlZiA9IGFwcC53b3Jrc3BhY2Uub24oXG4gICAgICBcImFjdGl2ZS1sZWFmLWNoYW5nZVwiLFxuICAgICAgYXN5bmMgKF8pID0+IHtcbiAgICAgICAgYXdhaXQgaW5zLnJlZnJlc2hDdXJyZW50RmlsZVRva2VucygpO1xuICAgICAgICBpbnMucmVmcmVzaEludGVybmFsTGlua1Rva2VucygpO1xuICAgICAgICBpbnMudXBkYXRlRnJvbnRNYXR0ZXJUb2tlbigpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICBpbnMubWV0YWRhdGFDYWNoZUNoYW5nZVJlZiA9IGFwcC5tZXRhZGF0YUNhY2hlLm9uKFwiY2hhbmdlZFwiLCAoZikgPT4ge1xuICAgICAgaW5zLnVwZGF0ZUZyb250TWF0dGVyVG9rZW5JbmRleChmKTtcbiAgICAgIGlmICghaW5zLmFwcEhlbHBlci5pc0FjdGl2ZUZpbGUoZikpIHtcbiAgICAgICAgaW5zLnVwZGF0ZUZyb250TWF0dGVyVG9rZW4oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEF2b2lkIHJlZmVycmluZyB0byBpbmNvcnJlY3QgY2FjaGVcbiAgICBjb25zdCBjYWNoZVJlc29sdmVkUmVmID0gYXBwLm1ldGFkYXRhQ2FjaGUub24oXCJyZXNvbHZlZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBpbnMucmVmcmVzaEludGVybmFsTGlua1Rva2VucygpO1xuICAgICAgaW5zLnJlZnJlc2hGcm9udE1hdHRlclRva2VucygpO1xuICAgICAgLy8gbm9pbnNwZWN0aW9uIEVTNk1pc3NpbmdBd2FpdFxuICAgICAgaW5zLnJlZnJlc2hDdXN0b21EaWN0aW9uYXJ5VG9rZW5zKCk7XG4gICAgICAvLyBub2luc3BlY3Rpb24gRVM2TWlzc2luZ0F3YWl0XG4gICAgICBpbnMucmVmcmVzaEN1cnJlbnRWYXVsdFRva2VucygpO1xuXG4gICAgICBpbnMuYXBwLm1ldGFkYXRhQ2FjaGUub2ZmcmVmKGNhY2hlUmVzb2x2ZWRSZWYpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGlucztcbiAgfVxuXG4gIHByZWRpY3RhYmxlQ29tcGxldGUoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5hcHBIZWxwZXIuZ2V0Q3VycmVudEVkaXRvcigpO1xuICAgIGlmICghZWRpdG9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgIGNvbnN0IGN1cnJlbnRUb2tlbiA9IHRoaXMudG9rZW5pemVyXG4gICAgICAudG9rZW5pemUoZWRpdG9yLmdldExpbmUoY3Vyc29yLmxpbmUpLnNsaWNlKDAsIGN1cnNvci5jaCkpXG4gICAgICAubGFzdCgpO1xuICAgIGlmICghY3VycmVudFRva2VuKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHN1Z2dlc3Rpb24gPSB0aGlzLnRva2VuaXplclxuICAgICAgLnRva2VuaXplKFxuICAgICAgICBlZGl0b3IuZ2V0UmFuZ2UoeyBsaW5lOiBNYXRoLm1heChjdXJzb3IubGluZSAtIDUwLCAwKSwgY2g6IDAgfSwgY3Vyc29yKVxuICAgICAgKVxuICAgICAgLnJldmVyc2UoKVxuICAgICAgLnNsaWNlKDEpXG4gICAgICAuZmluZCgoeCkgPT4geC5zdGFydHNXaXRoKGN1cnJlbnRUb2tlbikpO1xuICAgIGlmICghc3VnZ2VzdGlvbikge1xuICAgICAgc3VnZ2VzdGlvbiA9IHRoaXMudG9rZW5pemVyXG4gICAgICAgIC50b2tlbml6ZShcbiAgICAgICAgICBlZGl0b3IuZ2V0UmFuZ2UoY3Vyc29yLCB7XG4gICAgICAgICAgICBsaW5lOiBNYXRoLm1pbihjdXJzb3IubGluZSArIDUwLCBlZGl0b3IubGluZUNvdW50KCkgLSAxKSxcbiAgICAgICAgICAgIGNoOiAwLFxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgICAgLmZpbmQoKHgpID0+IHguc3RhcnRzV2l0aChjdXJyZW50VG9rZW4pKTtcbiAgICB9XG4gICAgaWYgKCFzdWdnZXN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWRpdG9yLnJlcGxhY2VSYW5nZShcbiAgICAgIHN1Z2dlc3Rpb24sXG4gICAgICB7IGxpbmU6IGN1cnNvci5saW5lLCBjaDogY3Vyc29yLmNoIC0gY3VycmVudFRva2VuLmxlbmd0aCB9LFxuICAgICAgeyBsaW5lOiBjdXJzb3IubGluZSwgY2g6IGN1cnNvci5jaCB9XG4gICAgKTtcblxuICAgIHRoaXMuY2xvc2UoKTtcbiAgICB0aGlzLmRlYm91bmNlQ2xvc2UoKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXIoKSB7XG4gICAgdGhpcy5hcHAudmF1bHQub2ZmcmVmKHRoaXMubW9kaWZ5RXZlbnRSZWYpO1xuICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vZmZyZWYodGhpcy5hY3RpdmVMZWFmQ2hhbmdlUmVmKTtcbiAgICB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLm9mZnJlZih0aGlzLm1ldGFkYXRhQ2FjaGVDaGFuZ2VSZWYpO1xuICB9XG5cbiAgLy8gc2V0dGluZ3MgZ2V0dGVyc1xuICBnZXQgdG9rZW5pemVyU3RyYXRlZ3koKTogVG9rZW5pemVTdHJhdGVneSB7XG4gICAgcmV0dXJuIFRva2VuaXplU3RyYXRlZ3kuZnJvbU5hbWUodGhpcy5zZXR0aW5ncy5zdHJhdGVneSk7XG4gIH1cblxuICBnZXQgbWF0Y2hTdHJhdGVneSgpOiBNYXRjaFN0cmF0ZWd5IHtcbiAgICByZXR1cm4gTWF0Y2hTdHJhdGVneS5mcm9tTmFtZSh0aGlzLnNldHRpbmdzLm1hdGNoU3RyYXRlZ3kpO1xuICB9XG5cbiAgZ2V0IGZyb250TWF0dGVyQ29tcGxlbWVudFN0cmF0ZWd5KCk6IFNwZWNpZmljTWF0Y2hTdHJhdGVneSB7XG4gICAgcmV0dXJuIFNwZWNpZmljTWF0Y2hTdHJhdGVneS5mcm9tTmFtZShcbiAgICAgIHRoaXMuc2V0dGluZ3MuZnJvbnRNYXR0ZXJDb21wbGVtZW50TWF0Y2hTdHJhdGVneVxuICAgICk7XG4gIH1cblxuICBnZXQgbWluTnVtYmVyVHJpZ2dlcmVkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuc2V0dGluZ3MubWluTnVtYmVyT2ZDaGFyYWN0ZXJzVHJpZ2dlcmVkIHx8XG4gICAgICB0aGlzLnRva2VuaXplclN0cmF0ZWd5LnRyaWdnZXJUaHJlc2hvbGRcbiAgICApO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRGaWxlTWluTnVtYmVyT2ZDaGFyYWN0ZXJzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuc2V0dGluZ3MuY3VycmVudEZpbGVNaW5OdW1iZXJPZkNoYXJhY3RlcnMgfHxcbiAgICAgIHRoaXMudG9rZW5pemVyU3RyYXRlZ3kuaW5kZXhpbmdUaHJlc2hvbGRcbiAgICApO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRWYXVsdE1pbk51bWJlck9mQ2hhcmFjdGVycygpOiBudW1iZXIge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnNldHRpbmdzLmN1cnJlbnRWYXVsdE1pbk51bWJlck9mQ2hhcmFjdGVycyB8fFxuICAgICAgdGhpcy50b2tlbml6ZXJTdHJhdGVneS5pbmRleGluZ1RocmVzaG9sZFxuICAgICk7XG4gIH1cblxuICBnZXQgZGVzY3JpcHRpb25PblN1Z2dlc3Rpb24oKTogRGVzY3JpcHRpb25PblN1Z2dlc3Rpb24ge1xuICAgIHJldHVybiBEZXNjcmlwdGlvbk9uU3VnZ2VzdGlvbi5mcm9tTmFtZShcbiAgICAgIHRoaXMuc2V0dGluZ3MuZGVzY3JpcHRpb25PblN1Z2dlc3Rpb25cbiAgICApO1xuICB9XG5cbiAgZ2V0IGV4Y2x1ZGVJbnRlcm5hbExpbmtQcmVmaXhQYXRoUGF0dGVybnMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnNldHRpbmdzLmV4Y2x1ZGVJbnRlcm5hbExpbmtQYXRoUHJlZml4UGF0dGVybnNcbiAgICAgIC5zcGxpdChcIlxcblwiKVxuICAgICAgLmZpbHRlcigoeCkgPT4geCk7XG4gIH1cblxuICAvLyAtLS0gZW5kIC0tLVxuXG4gIGdldCBpbmRleGVkV29yZHMoKTogSW5kZXhlZFdvcmRzIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3VycmVudEZpbGU6IHRoaXMuY3VycmVudEZpbGVXb3JkUHJvdmlkZXIud29yZHNCeUZpcnN0TGV0dGVyLFxuICAgICAgY3VycmVudFZhdWx0OiB0aGlzLmN1cnJlbnRWYXVsdFdvcmRQcm92aWRlci53b3Jkc0J5Rmlyc3RMZXR0ZXIsXG4gICAgICBjdXN0b21EaWN0aW9uYXJ5OiB0aGlzLmN1c3RvbURpY3Rpb25hcnlXb3JkUHJvdmlkZXIud29yZHNCeUZpcnN0TGV0dGVyLFxuICAgICAgaW50ZXJuYWxMaW5rOiB0aGlzLmludGVybmFsTGlua1dvcmRQcm92aWRlci53b3Jkc0J5Rmlyc3RMZXR0ZXIsXG4gICAgICBmcm9udE1hdHRlcjogdGhpcy5mcm9udE1hdHRlcldvcmRQcm92aWRlci53b3Jkc0J5Rmlyc3RMZXR0ZXJCeUtleSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgdXBkYXRlU2V0dGluZ3Moc2V0dGluZ3M6IFNldHRpbmdzKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG4gICAgdGhpcy5zdGF0dXNCYXIuc2V0TWF0Y2hTdHJhdGVneSh0aGlzLm1hdGNoU3RyYXRlZ3kpO1xuICAgIHRoaXMuc3RhdHVzQmFyLnNldENvbXBsZW1lbnRBdXRvbWF0aWNhbGx5KFxuICAgICAgdGhpcy5zZXR0aW5ncy5jb21wbGVtZW50QXV0b21hdGljYWxseVxuICAgICk7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy50b2tlbml6ZXIgPSBhd2FpdCBjcmVhdGVUb2tlbml6ZXIodGhpcy50b2tlbml6ZXJTdHJhdGVneSwgdGhpcy5hcHApO1xuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgbmV3IE5vdGljZShlLm1lc3NhZ2UsIDApO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRGaWxlV29yZFByb3ZpZGVyLnNldFNldHRpbmdzKHRoaXMudG9rZW5pemVyKTtcbiAgICB0aGlzLmN1cnJlbnRWYXVsdFdvcmRQcm92aWRlci5zZXRTZXR0aW5ncyhcbiAgICAgIHRoaXMudG9rZW5pemVyLFxuICAgICAgc2V0dGluZ3MuaW5jbHVkZUN1cnJlbnRWYXVsdFBhdGhQcmVmaXhQYXR0ZXJuc1xuICAgICAgICAuc3BsaXQoXCJcXG5cIilcbiAgICAgICAgLmZpbHRlcigoeCkgPT4geCksXG4gICAgICBzZXR0aW5ncy5leGNsdWRlQ3VycmVudFZhdWx0UGF0aFByZWZpeFBhdHRlcm5zXG4gICAgICAgIC5zcGxpdChcIlxcblwiKVxuICAgICAgICAuZmlsdGVyKCh4KSA9PiB4KSxcbiAgICAgIHNldHRpbmdzLmluY2x1ZGVDdXJyZW50VmF1bHRPbmx5RmlsZXNVbmRlckN1cnJlbnREaXJlY3RvcnlcbiAgICApO1xuICAgIHRoaXMuY3VzdG9tRGljdGlvbmFyeVdvcmRQcm92aWRlci5zZXRTZXR0aW5ncyhcbiAgICAgIHNldHRpbmdzLmN1c3RvbURpY3Rpb25hcnlQYXRocy5zcGxpdChcIlxcblwiKS5maWx0ZXIoKHgpID0+IHgpLFxuICAgICAgQ29sdW1uRGVsaW1pdGVyLmZyb21OYW1lKHNldHRpbmdzLmNvbHVtbkRlbGltaXRlciksXG4gICAgICBzZXR0aW5ncy5kZWxpbWl0ZXJUb0RpdmlkZVN1Z2dlc3Rpb25zRm9yRGlzcGxheUZyb21JbnNlcnRpb24gfHwgbnVsbFxuICAgICk7XG5cbiAgICB0aGlzLmRlYm91bmNlR2V0U3VnZ2VzdGlvbnMgPSBkZWJvdW5jZShcbiAgICAgIChjb250ZXh0OiBFZGl0b3JTdWdnZXN0Q29udGV4dCwgY2I6ICh3b3JkczogV29yZFtdKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgdGhpcy5zaG93RGVidWdMb2coKCkgPT4gYFtjb250ZXh0LnF1ZXJ5XTogJHtjb250ZXh0LnF1ZXJ5fWApO1xuICAgICAgICBjb25zdCBwYXJzZWRRdWVyeSA9IEpTT04ucGFyc2UoY29udGV4dC5xdWVyeSkgYXMge1xuICAgICAgICAgIGN1cnJlbnRGcm9udE1hdHRlcj86IHN0cmluZztcbiAgICAgICAgICBxdWVyaWVzOiB7XG4gICAgICAgICAgICB3b3JkOiBzdHJpbmc7XG4gICAgICAgICAgICBvZmZzZXQ6IG51bWJlcjtcbiAgICAgICAgICB9W107XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgd29yZHMgPSBwYXJzZWRRdWVyeS5xdWVyaWVzXG4gICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICh4LCBpLCB4cykgPT5cbiAgICAgICAgICAgICAgcGFyc2VkUXVlcnkuY3VycmVudEZyb250TWF0dGVyIHx8XG4gICAgICAgICAgICAgICh0aGlzLnNldHRpbmdzLm1pbk51bWJlck9mV29yZHNUcmlnZ2VyZWRQaHJhc2UgKyBpIC0gMSA8XG4gICAgICAgICAgICAgICAgeHMubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgeC53b3JkLmxlbmd0aCA+PSB0aGlzLm1pbk51bWJlclRyaWdnZXJlZCAmJlxuICAgICAgICAgICAgICAgICF4LndvcmQuZW5kc1dpdGgoXCIgXCIpKVxuICAgICAgICAgIClcbiAgICAgICAgICAubWFwKChxKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID1cbiAgICAgICAgICAgICAgcGFyc2VkUXVlcnkuY3VycmVudEZyb250TWF0dGVyICYmXG4gICAgICAgICAgICAgIHRoaXMuZnJvbnRNYXR0ZXJDb21wbGVtZW50U3RyYXRlZ3kgIT09XG4gICAgICAgICAgICAgICAgU3BlY2lmaWNNYXRjaFN0cmF0ZWd5LklOSEVSSVRcbiAgICAgICAgICAgICAgICA/IHRoaXMuZnJvbnRNYXR0ZXJDb21wbGVtZW50U3RyYXRlZ3kuaGFuZGxlclxuICAgICAgICAgICAgICAgIDogdGhpcy5tYXRjaFN0cmF0ZWd5LmhhbmRsZXI7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlcihcbiAgICAgICAgICAgICAgdGhpcy5pbmRleGVkV29yZHMsXG4gICAgICAgICAgICAgIHEud29yZCxcbiAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5tYXhOdW1iZXJPZlN1Z2dlc3Rpb25zLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZnJvbnRNYXR0ZXI6IHBhcnNlZFF1ZXJ5LmN1cnJlbnRGcm9udE1hdHRlcixcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25IaXN0b3J5U3RvcmFnZTogdGhpcy5zZWxlY3Rpb25IaXN0b3J5U3RvcmFnZSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5tYXAoKHdvcmQpID0+ICh7IC4uLndvcmQsIG9mZnNldDogcS5vZmZzZXQgfSkpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZsYXQoKTtcblxuICAgICAgICBjYihcbiAgICAgICAgICB1bmlxV2l0aCh3b3Jkcywgc3VnZ2VzdGlvblVuaXFQcmVkaWNhdGUpLnNsaWNlKFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MubWF4TnVtYmVyT2ZTdWdnZXN0aW9uc1xuICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnNob3dEZWJ1Z0xvZygoKSA9PlxuICAgICAgICAgIGJ1aWxkTG9nTWVzc2FnZShcIkdldCBzdWdnZXN0aW9uc1wiLCBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0KVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHRoaXMuc2V0dGluZ3MuZGVsYXlNaWxsaVNlY29uZHMsXG4gICAgICB0cnVlXG4gICAgKTtcblxuICAgIHRoaXMuZGVib3VuY2VDbG9zZSA9IGRlYm91bmNlKCgpID0+IHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9LCB0aGlzLnNldHRpbmdzLmRlbGF5TWlsbGlTZWNvbmRzICsgNTApO1xuXG4gICAgdGhpcy5yZWdpc3RlcktleW1hcHMoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJLZXltYXBzKCkge1xuICAgIGNvbnN0IHJlZ2lzdGVyS2V5QXNJZ25vcmVkID0gKFxuICAgICAgbW9kaWZpZXJzOiBNb2RpZmllcltdLFxuICAgICAga2V5OiBzdHJpbmcgfCBudWxsXG4gICAgKSA9PiB7XG4gICAgICB0aGlzLmtleW1hcEV2ZW50SGFuZGxlci5wdXNoKFxuICAgICAgICB0aGlzLnNjb3BlLnJlZ2lzdGVyKG1vZGlmaWVycywga2V5LCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gQ2xlYXJcbiAgICB0aGlzLmtleW1hcEV2ZW50SGFuZGxlci5mb3JFYWNoKCh4KSA9PiB0aGlzLnNjb3BlLnVucmVnaXN0ZXIoeCkpO1xuICAgIHRoaXMua2V5bWFwRXZlbnRIYW5kbGVyID0gW107XG4gICAgdGhpcy5zY29wZS51bnJlZ2lzdGVyKHRoaXMuc2NvcGUua2V5cy5maW5kKCh4KSA9PiB4LmtleSA9PT0gXCJFbnRlclwiKSEpO1xuICAgIHRoaXMuc2NvcGUudW5yZWdpc3Rlcih0aGlzLnNjb3BlLmtleXMuZmluZCgoeCkgPT4geC5rZXkgPT09IFwiQXJyb3dVcFwiKSEpO1xuICAgIHRoaXMuc2NvcGUudW5yZWdpc3Rlcih0aGlzLnNjb3BlLmtleXMuZmluZCgoeCkgPT4geC5rZXkgPT09IFwiQXJyb3dEb3duXCIpISk7XG5cbiAgICAvLyBzZWxlY3RTdWdnZXN0aW9uS2V5c1xuICAgIGNvbnN0IHNlbGVjdFN1Z2dlc3Rpb25LZXkgPSBTZWxlY3RTdWdnZXN0aW9uS2V5LmZyb21OYW1lKFxuICAgICAgdGhpcy5zZXR0aW5ncy5zZWxlY3RTdWdnZXN0aW9uS2V5c1xuICAgICk7XG4gICAgaWYgKHNlbGVjdFN1Z2dlc3Rpb25LZXkgIT09IFNlbGVjdFN1Z2dlc3Rpb25LZXkuRU5URVIpIHtcbiAgICAgIHJlZ2lzdGVyS2V5QXNJZ25vcmVkKFxuICAgICAgICBTZWxlY3RTdWdnZXN0aW9uS2V5LkVOVEVSLmtleUJpbmQubW9kaWZpZXJzLFxuICAgICAgICBTZWxlY3RTdWdnZXN0aW9uS2V5LkVOVEVSLmtleUJpbmQua2V5XG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoc2VsZWN0U3VnZ2VzdGlvbktleSAhPT0gU2VsZWN0U3VnZ2VzdGlvbktleS5UQUIpIHtcbiAgICAgIHJlZ2lzdGVyS2V5QXNJZ25vcmVkKFxuICAgICAgICBTZWxlY3RTdWdnZXN0aW9uS2V5LlRBQi5rZXlCaW5kLm1vZGlmaWVycyxcbiAgICAgICAgU2VsZWN0U3VnZ2VzdGlvbktleS5UQUIua2V5QmluZC5rZXlcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChzZWxlY3RTdWdnZXN0aW9uS2V5ICE9PSBTZWxlY3RTdWdnZXN0aW9uS2V5Lk5vbmUpIHtcbiAgICAgIHRoaXMua2V5bWFwRXZlbnRIYW5kbGVyLnB1c2goXG4gICAgICAgIHRoaXMuc2NvcGUucmVnaXN0ZXIoXG4gICAgICAgICAgc2VsZWN0U3VnZ2VzdGlvbktleS5rZXlCaW5kLm1vZGlmaWVycyxcbiAgICAgICAgICBzZWxlY3RTdWdnZXN0aW9uS2V5LmtleUJpbmQua2V5LFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMudXNlU2VsZWN0ZWRJdGVtKHt9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gcHJvcGFnYXRlRVNDXG4gICAgdGhpcy5zY29wZS5rZXlzLmZpbmQoKHgpID0+IHgua2V5ID09PSBcIkVzY2FwZVwiKSEuZnVuYyA9ICgpID0+IHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHJldHVybiB0aGlzLnNldHRpbmdzLnByb3BhZ2F0ZUVzYztcbiAgICB9O1xuXG4gICAgLy8gY3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzXG4gICAgY29uc3Qgc2VsZWN0TmV4dCA9IChldnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIHRoaXMuc3VnZ2VzdGlvbnMuc2V0U2VsZWN0ZWRJdGVtKHRoaXMuc3VnZ2VzdGlvbnMuc2VsZWN0ZWRJdGVtICsgMSwgZXZ0KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIGNvbnN0IHNlbGVjdFByZXZpb3VzID0gKGV2dDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgdGhpcy5zdWdnZXN0aW9ucy5zZXRTZWxlY3RlZEl0ZW0odGhpcy5zdWdnZXN0aW9ucy5zZWxlY3RlZEl0ZW0gLSAxLCBldnQpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBjb25zdCBjeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMgPSBDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMuZnJvbU5hbWUoXG4gICAgICB0aGlzLnNldHRpbmdzLmFkZGl0aW9uYWxDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXNcbiAgICApO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmRpc2FibGVVcERvd25LZXlzRm9yQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzKSB7XG4gICAgICB0aGlzLmtleW1hcEV2ZW50SGFuZGxlci5wdXNoKFxuICAgICAgICB0aGlzLnNjb3BlLnJlZ2lzdGVyKFtdLCBcIkFycm93RG93blwiLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5zY29wZS5yZWdpc3RlcihbXSwgXCJBcnJvd1VwXCIsICgpID0+IHtcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmtleW1hcEV2ZW50SGFuZGxlci5wdXNoKFxuICAgICAgICB0aGlzLnNjb3BlLnJlZ2lzdGVyKFtdLCBcIkFycm93RG93blwiLCBzZWxlY3ROZXh0KSxcbiAgICAgICAgdGhpcy5zY29wZS5yZWdpc3RlcihbXSwgXCJBcnJvd1VwXCIsIHNlbGVjdFByZXZpb3VzKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5cyAhPT0gQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzLk5PTkUpIHtcbiAgICAgIGlmIChjeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMgPT09IEN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5cy5UQUIpIHtcbiAgICAgICAgdGhpcy5zY29wZS51bnJlZ2lzdGVyKFxuICAgICAgICAgIHRoaXMuc2NvcGUua2V5cy5maW5kKCh4KSA9PiB4Lm1vZGlmaWVycyA9PT0gXCJcIiAmJiB4LmtleSA9PT0gXCJUYWJcIikhXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLmtleW1hcEV2ZW50SGFuZGxlci5wdXNoKFxuICAgICAgICB0aGlzLnNjb3BlLnJlZ2lzdGVyKFxuICAgICAgICAgIGN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5cy5uZXh0S2V5Lm1vZGlmaWVycyxcbiAgICAgICAgICBjeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMubmV4dEtleS5rZXksXG4gICAgICAgICAgc2VsZWN0TmV4dFxuICAgICAgICApLFxuICAgICAgICB0aGlzLnNjb3BlLnJlZ2lzdGVyKFxuICAgICAgICAgIGN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5cy5wcmV2aW91c0tleS5tb2RpZmllcnMsXG4gICAgICAgICAgY3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzLnByZXZpb3VzS2V5LmtleSxcbiAgICAgICAgICBzZWxlY3RQcmV2aW91c1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wZW5Tb3VyY2VGaWxlS2V5ID0gT3BlblNvdXJjZUZpbGVLZXlzLmZyb21OYW1lKFxuICAgICAgdGhpcy5zZXR0aW5ncy5vcGVuU291cmNlRmlsZUtleVxuICAgICk7XG4gICAgaWYgKG9wZW5Tb3VyY2VGaWxlS2V5ICE9PSBPcGVuU291cmNlRmlsZUtleXMuTk9ORSkge1xuICAgICAgdGhpcy5rZXltYXBFdmVudEhhbmRsZXIucHVzaChcbiAgICAgICAgdGhpcy5zY29wZS5yZWdpc3RlcihcbiAgICAgICAgICBvcGVuU291cmNlRmlsZUtleS5rZXlCaW5kLm1vZGlmaWVycyxcbiAgICAgICAgICBvcGVuU291cmNlRmlsZUtleS5rZXlCaW5kLmtleSxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5zdWdnZXN0aW9ucy52YWx1ZXNbdGhpcy5zdWdnZXN0aW9ucy5zZWxlY3RlZEl0ZW1dO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBpdGVtLnR5cGUgIT09IFwiY3VycmVudFZhdWx0XCIgJiZcbiAgICAgICAgICAgICAgaXRlbS50eXBlICE9PSBcImludGVybmFsTGlua1wiICYmXG4gICAgICAgICAgICAgIGl0ZW0udHlwZSAhPT0gXCJmcm9udE1hdHRlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtYXJrZG93bkZpbGUgPSB0aGlzLmFwcEhlbHBlci5nZXRNYXJrZG93bkZpbGVCeVBhdGgoXG4gICAgICAgICAgICAgIGl0ZW0uY3JlYXRlZFBhdGhcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoIW1hcmtkb3duRmlsZSkge1xuICAgICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gT2JqZWN0QWxsb2NhdGlvbklnbm9yZWRcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShgQ2FuJ3Qgb3BlbiAke2l0ZW0uY3JlYXRlZFBhdGh9YCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYXBwSGVscGVyLm9wZW5NYXJrZG93bkZpbGUobWFya2Rvd25GaWxlLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVmcmVzaEN1cnJlbnRGaWxlVG9rZW5zKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5zdGF0dXNCYXIuc2V0Q3VycmVudEZpbGVJbmRleGluZygpO1xuXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLmVuYWJsZUN1cnJlbnRGaWxlQ29tcGxlbWVudCkge1xuICAgICAgdGhpcy5zdGF0dXNCYXIuc2V0Q3VycmVudEZpbGVEaXNhYmxlZCgpO1xuICAgICAgdGhpcy5jdXJyZW50RmlsZVdvcmRQcm92aWRlci5jbGVhcldvcmRzKCk7XG4gICAgICB0aGlzLnNob3dEZWJ1Z0xvZygoKSA9PlxuICAgICAgICBidWlsZExvZ01lc3NhZ2UoXG4gICAgICAgICAgXCLwn5GiIFNraXA6IEluZGV4IGN1cnJlbnQgZmlsZSB0b2tlbnNcIixcbiAgICAgICAgICBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5jdXJyZW50RmlsZVdvcmRQcm92aWRlci5yZWZyZXNoV29yZHMoXG4gICAgICB0aGlzLnNldHRpbmdzLm9ubHlDb21wbGVtZW50RW5nbGlzaE9uQ3VycmVudEZpbGVDb21wbGVtZW50LFxuICAgICAgdGhpcy5jdXJyZW50RmlsZU1pbk51bWJlck9mQ2hhcmFjdGVyc1xuICAgICk7XG5cbiAgICB0aGlzLnN0YXR1c0Jhci5zZXRDdXJyZW50RmlsZUluZGV4ZWQoXG4gICAgICB0aGlzLmN1cnJlbnRGaWxlV29yZFByb3ZpZGVyLndvcmRDb3VudFxuICAgICk7XG4gICAgdGhpcy5zaG93RGVidWdMb2coKCkgPT5cbiAgICAgIGJ1aWxkTG9nTWVzc2FnZShcIkluZGV4IGN1cnJlbnQgZmlsZSB0b2tlbnNcIiwgcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydClcbiAgICApO1xuICB9XG5cbiAgYXN5bmMgcmVmcmVzaEN1cnJlbnRWYXVsdFRva2VucygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuc3RhdHVzQmFyLnNldEN1cnJlbnRWYXVsdEluZGV4aW5nKCk7XG5cbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MuZW5hYmxlQ3VycmVudFZhdWx0Q29tcGxlbWVudCkge1xuICAgICAgdGhpcy5zdGF0dXNCYXIuc2V0Q3VycmVudFZhdWx0RGlzYWJsZWQoKTtcbiAgICAgIHRoaXMuY3VycmVudFZhdWx0V29yZFByb3ZpZGVyLmNsZWFyV29yZHMoKTtcbiAgICAgIHRoaXMuc2hvd0RlYnVnTG9nKCgpID0+XG4gICAgICAgIGJ1aWxkTG9nTWVzc2FnZShcbiAgICAgICAgICBcIvCfkaIgU2tpcDogSW5kZXggY3VycmVudCB2YXVsdCB0b2tlbnNcIixcbiAgICAgICAgICBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5jdXJyZW50VmF1bHRXb3JkUHJvdmlkZXIucmVmcmVzaFdvcmRzKFxuICAgICAgdGhpcy5jdXJyZW50VmF1bHRNaW5OdW1iZXJPZkNoYXJhY3RlcnNcbiAgICApO1xuXG4gICAgdGhpcy5zdGF0dXNCYXIuc2V0Q3VycmVudFZhdWx0SW5kZXhlZChcbiAgICAgIHRoaXMuY3VycmVudFZhdWx0V29yZFByb3ZpZGVyLndvcmRDb3VudFxuICAgICk7XG4gICAgdGhpcy5zaG93RGVidWdMb2coKCkgPT5cbiAgICAgIGJ1aWxkTG9nTWVzc2FnZShcIkluZGV4IGN1cnJlbnQgdmF1bHQgdG9rZW5zXCIsIHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnQpXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIHJlZnJlc2hDdXN0b21EaWN0aW9uYXJ5VG9rZW5zKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5zdGF0dXNCYXIuc2V0Q3VzdG9tRGljdGlvbmFyeUluZGV4aW5nKCk7XG5cbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MuZW5hYmxlQ3VzdG9tRGljdGlvbmFyeUNvbXBsZW1lbnQpIHtcbiAgICAgIHRoaXMuc3RhdHVzQmFyLnNldEN1c3RvbURpY3Rpb25hcnlEaXNhYmxlZCgpO1xuICAgICAgdGhpcy5jdXN0b21EaWN0aW9uYXJ5V29yZFByb3ZpZGVyLmNsZWFyV29yZHMoKTtcbiAgICAgIHRoaXMuc2hvd0RlYnVnTG9nKCgpID0+XG4gICAgICAgIGJ1aWxkTG9nTWVzc2FnZShcbiAgICAgICAgICBcIvCfkaJTa2lwOiBJbmRleCBjdXN0b20gZGljdGlvbmFyeSB0b2tlbnNcIixcbiAgICAgICAgICBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5jdXN0b21EaWN0aW9uYXJ5V29yZFByb3ZpZGVyLnJlZnJlc2hDdXN0b21Xb3Jkcyh7XG4gICAgICByZWdleHA6IHRoaXMuc2V0dGluZ3MuY3VzdG9tRGljdGlvbmFyeVdvcmRSZWdleFBhdHRlcm4sXG4gICAgICBkZWxpbWl0ZXJGb3JIaWRlOiB0aGlzLnNldHRpbmdzLmRlbGltaXRlclRvSGlkZVN1Z2dlc3Rpb24gfHwgdW5kZWZpbmVkLFxuICAgICAgZGVsaW1pdGVyRm9yRGlzcGxheTpcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5kZWxpbWl0ZXJUb0RpdmlkZVN1Z2dlc3Rpb25zRm9yRGlzcGxheUZyb21JbnNlcnRpb24gfHxcbiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgY2FyZXRTeW1ib2w6XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuY2FyZXRMb2NhdGlvblN5bWJvbEFmdGVyQ29tcGxlbWVudCB8fCB1bmRlZmluZWQsXG4gICAgfSk7XG5cbiAgICB0aGlzLnN0YXR1c0Jhci5zZXRDdXN0b21EaWN0aW9uYXJ5SW5kZXhlZChcbiAgICAgIHRoaXMuY3VzdG9tRGljdGlvbmFyeVdvcmRQcm92aWRlci53b3JkQ291bnRcbiAgICApO1xuICAgIHRoaXMuc2hvd0RlYnVnTG9nKCgpID0+XG4gICAgICBidWlsZExvZ01lc3NhZ2UoXG4gICAgICAgIFwiSW5kZXggY3VzdG9tIGRpY3Rpb25hcnkgdG9rZW5zXCIsXG4gICAgICAgIHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgcmVmcmVzaEludGVybmFsTGlua1Rva2VucygpOiB2b2lkIHtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuc3RhdHVzQmFyLnNldEludGVybmFsTGlua0luZGV4aW5nKCk7XG5cbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MuZW5hYmxlSW50ZXJuYWxMaW5rQ29tcGxlbWVudCkge1xuICAgICAgdGhpcy5zdGF0dXNCYXIuc2V0SW50ZXJuYWxMaW5rRGlzYWJsZWQoKTtcbiAgICAgIHRoaXMuaW50ZXJuYWxMaW5rV29yZFByb3ZpZGVyLmNsZWFyV29yZHMoKTtcbiAgICAgIHRoaXMuc2hvd0RlYnVnTG9nKCgpID0+XG4gICAgICAgIGJ1aWxkTG9nTWVzc2FnZShcbiAgICAgICAgICBcIvCfkaJTa2lwOiBJbmRleCBpbnRlcm5hbCBsaW5rIHRva2Vuc1wiLFxuICAgICAgICAgIHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmludGVybmFsTGlua1dvcmRQcm92aWRlci5yZWZyZXNoV29yZHMoXG4gICAgICB0aGlzLnNldHRpbmdzLnN1Z2dlc3RJbnRlcm5hbExpbmtXaXRoQWxpYXMsXG4gICAgICB0aGlzLmV4Y2x1ZGVJbnRlcm5hbExpbmtQcmVmaXhQYXRoUGF0dGVybnNcbiAgICApO1xuXG4gICAgdGhpcy5zdGF0dXNCYXIuc2V0SW50ZXJuYWxMaW5rSW5kZXhlZChcbiAgICAgIHRoaXMuaW50ZXJuYWxMaW5rV29yZFByb3ZpZGVyLndvcmRDb3VudFxuICAgICk7XG4gICAgdGhpcy5zaG93RGVidWdMb2coKCkgPT5cbiAgICAgIGJ1aWxkTG9nTWVzc2FnZShcIkluZGV4IGludGVybmFsIGxpbmsgdG9rZW5zXCIsIHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnQpXG4gICAgKTtcbiAgfVxuXG4gIHJlZnJlc2hGcm9udE1hdHRlclRva2VucygpOiB2b2lkIHtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuc3RhdHVzQmFyLnNldEZyb250TWF0dGVySW5kZXhpbmcoKTtcblxuICAgIGlmICghdGhpcy5zZXR0aW5ncy5lbmFibGVGcm9udE1hdHRlckNvbXBsZW1lbnQpIHtcbiAgICAgIHRoaXMuc3RhdHVzQmFyLnNldEZyb250TWF0dGVyRGlzYWJsZWQoKTtcbiAgICAgIHRoaXMuZnJvbnRNYXR0ZXJXb3JkUHJvdmlkZXIuY2xlYXJXb3JkcygpO1xuICAgICAgdGhpcy5zaG93RGVidWdMb2coKCkgPT5cbiAgICAgICAgYnVpbGRMb2dNZXNzYWdlKFxuICAgICAgICAgIFwi8J+RolNraXA6IEluZGV4IGZyb250IG1hdHRlciB0b2tlbnNcIixcbiAgICAgICAgICBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5mcm9udE1hdHRlcldvcmRQcm92aWRlci5yZWZyZXNoV29yZHMoKTtcblxuICAgIHRoaXMuc3RhdHVzQmFyLnNldEZyb250TWF0dGVySW5kZXhlZChcbiAgICAgIHRoaXMuZnJvbnRNYXR0ZXJXb3JkUHJvdmlkZXIud29yZENvdW50XG4gICAgKTtcbiAgICB0aGlzLnNob3dEZWJ1Z0xvZygoKSA9PlxuICAgICAgYnVpbGRMb2dNZXNzYWdlKFwiSW5kZXggZnJvbnQgbWF0dGVyIHRva2Vuc1wiLCBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0KVxuICAgICk7XG4gIH1cblxuICB1cGRhdGVGcm9udE1hdHRlclRva2VuSW5kZXgoZmlsZTogVEZpbGUpOiB2b2lkIHtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5lbmFibGVGcm9udE1hdHRlckNvbXBsZW1lbnQpIHtcbiAgICAgIHRoaXMuc2hvd0RlYnVnTG9nKCgpID0+XG4gICAgICAgIGJ1aWxkTG9nTWVzc2FnZShcbiAgICAgICAgICBcIvCfkaJTa2lwOiBVcGRhdGUgZnJvbnQgbWF0dGVyIHRva2VuIGluZGV4XCIsXG4gICAgICAgICAgcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFxuICAgICAgICApXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZnJvbnRNYXR0ZXJXb3JkUHJvdmlkZXIudXBkYXRlV29yZEluZGV4KGZpbGUpO1xuXG4gICAgdGhpcy5zaG93RGVidWdMb2coKCkgPT5cbiAgICAgIGJ1aWxkTG9nTWVzc2FnZShcbiAgICAgICAgXCJVcGRhdGUgZnJvbnQgbWF0dGVyIHRva2VuIGluZGV4XCIsXG4gICAgICAgIHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgdXBkYXRlRnJvbnRNYXR0ZXJUb2tlbigpOiB2b2lkIHtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5lbmFibGVGcm9udE1hdHRlckNvbXBsZW1lbnQpIHtcbiAgICAgIHRoaXMuc2hvd0RlYnVnTG9nKCgpID0+XG4gICAgICAgIGJ1aWxkTG9nTWVzc2FnZShcbiAgICAgICAgICBcIvCfkaJTa2lwOiBVcGRhdGUgZnJvbnQgbWF0dGVyIHRva2VuXCIsXG4gICAgICAgICAgcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFxuICAgICAgICApXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZnJvbnRNYXR0ZXJXb3JkUHJvdmlkZXIudXBkYXRlV29yZHMoKTtcbiAgICB0aGlzLnN0YXR1c0Jhci5zZXRGcm9udE1hdHRlckluZGV4ZWQoXG4gICAgICB0aGlzLmZyb250TWF0dGVyV29yZFByb3ZpZGVyLndvcmRDb3VudFxuICAgICk7XG5cbiAgICB0aGlzLnNob3dEZWJ1Z0xvZygoKSA9PlxuICAgICAgYnVpbGRMb2dNZXNzYWdlKFwiVXBkYXRlIGZyb250IG1hdHRlciB0b2tlblwiLCBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0KVxuICAgICk7XG4gIH1cblxuICBvblRyaWdnZXIoXG4gICAgY3Vyc29yOiBFZGl0b3JQb3NpdGlvbixcbiAgICBlZGl0b3I6IEVkaXRvcixcbiAgICBmaWxlOiBURmlsZVxuICApOiBFZGl0b3JTdWdnZXN0VHJpZ2dlckluZm8gfCBudWxsIHtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgY29uc3Qgc2hvd0RlYnVnTG9nID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgdGhpcy5zaG93RGVidWdMb2coKCkgPT4gYFtvblRyaWdnZXJdICR7bWVzc2FnZX1gKTtcbiAgICB9O1xuICAgIGNvbnN0IG9uUmV0dXJuTnVsbCA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgIHNob3dEZWJ1Z0xvZyhtZXNzYWdlKTtcbiAgICAgIHRoaXMucnVuTWFudWFsbHkgPSBmYWxzZTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9O1xuXG4gICAgaWYgKFxuICAgICAgIXRoaXMuc2V0dGluZ3MuY29tcGxlbWVudEF1dG9tYXRpY2FsbHkgJiZcbiAgICAgICF0aGlzLmlzT3BlbiAmJlxuICAgICAgIXRoaXMucnVuTWFudWFsbHlcbiAgICApIHtcbiAgICAgIG9uUmV0dXJuTnVsbChcIkRvbid0IHNob3cgc3VnZ2VzdGlvbnNcIik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLnNldHRpbmdzLmRpc2FibGVTdWdnZXN0aW9uc0R1cmluZ0ltZU9uICYmXG4gICAgICB0aGlzLmFwcEhlbHBlci5pc0lNRU9uKCkgJiZcbiAgICAgICF0aGlzLnJ1bk1hbnVhbGx5XG4gICAgKSB7XG4gICAgICBvblJldHVybk51bGwoXCJEb24ndCBzaG93IHN1Z2dlc3Rpb25zIGZvciBJTUVcIik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjbCA9IHRoaXMuYXBwSGVscGVyLmdldEN1cnJlbnRMaW5lKGVkaXRvcik7XG4gICAgaWYgKHRoaXMucHJldmlvdXNDdXJyZW50TGluZSA9PT0gY2wgJiYgIXRoaXMucnVuTWFudWFsbHkpIHtcbiAgICAgIHRoaXMucHJldmlvdXNDdXJyZW50TGluZSA9IGNsO1xuICAgICAgb25SZXR1cm5OdWxsKFwiRG9uJ3Qgc2hvdyBzdWdnZXN0aW9ucyBiZWNhdXNlIHRoZXJlIGFyZSBubyBjaGFuZ2VzXCIpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMucHJldmlvdXNDdXJyZW50TGluZSA9IGNsO1xuXG4gICAgY29uc3QgY3VycmVudExpbmVVbnRpbEN1cnNvciA9XG4gICAgICB0aGlzLmFwcEhlbHBlci5nZXRDdXJyZW50TGluZVVudGlsQ3Vyc29yKGVkaXRvcik7XG4gICAgaWYgKGN1cnJlbnRMaW5lVW50aWxDdXJzb3Iuc3RhcnRzV2l0aChcIi0tLVwiKSkge1xuICAgICAgb25SZXR1cm5OdWxsKFxuICAgICAgICBcIkRvbid0IHNob3cgc3VnZ2VzdGlvbnMgYmVjYXVzZSBpdCBzdXBwb3NlcyBmcm9udCBtYXR0ZXIgb3IgaG9yaXpvbnRhbCBsaW5lXCJcbiAgICAgICk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgY3VycmVudExpbmVVbnRpbEN1cnNvci5zdGFydHNXaXRoKFwifn5+XCIpIHx8XG4gICAgICBjdXJyZW50TGluZVVudGlsQ3Vyc29yLnN0YXJ0c1dpdGgoXCJgYGBcIilcbiAgICApIHtcbiAgICAgIG9uUmV0dXJuTnVsbChcbiAgICAgICAgXCJEb24ndCBzaG93IHN1Z2dlc3Rpb25zIGJlY2F1c2UgaXQgc3VwcG9zZXMgZnJvbnQgY29kZSBibG9ja1wiXG4gICAgICApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgdG9rZW5zID0gdGhpcy50b2tlbml6ZXIudG9rZW5pemUoY3VycmVudExpbmVVbnRpbEN1cnNvciwgdHJ1ZSk7XG4gICAgc2hvd0RlYnVnTG9nKGB0b2tlbnMgaXMgJHt0b2tlbnN9YCk7XG5cbiAgICBjb25zdCB0b2tlbml6ZWQgPSB0aGlzLnRva2VuaXplci5yZWN1cnNpdmVUb2tlbml6ZShjdXJyZW50TGluZVVudGlsQ3Vyc29yKTtcbiAgICBjb25zdCBjdXJyZW50VG9rZW5zID0gdG9rZW5pemVkLnNsaWNlKFxuICAgICAgdG9rZW5pemVkLmxlbmd0aCA+IHRoaXMuc2V0dGluZ3MubWF4TnVtYmVyT2ZXb3Jkc0FzUGhyYXNlXG4gICAgICAgID8gdG9rZW5pemVkLmxlbmd0aCAtIHRoaXMuc2V0dGluZ3MubWF4TnVtYmVyT2ZXb3Jkc0FzUGhyYXNlXG4gICAgICAgIDogMFxuICAgICk7XG4gICAgc2hvd0RlYnVnTG9nKGBjdXJyZW50VG9rZW5zIGlzICR7SlNPTi5zdHJpbmdpZnkoY3VycmVudFRva2Vucyl9YCk7XG5cbiAgICBjb25zdCBjdXJyZW50VG9rZW4gPSBjdXJyZW50VG9rZW5zWzBdPy53b3JkO1xuICAgIHNob3dEZWJ1Z0xvZyhgY3VycmVudFRva2VuIGlzICR7Y3VycmVudFRva2VufWApO1xuICAgIGlmICghY3VycmVudFRva2VuKSB7XG4gICAgICBvblJldHVybk51bGwoYERvbid0IHNob3cgc3VnZ2VzdGlvbnMgYmVjYXVzZSBjdXJyZW50VG9rZW4gaXMgZW1wdHlgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRUb2tlblNlcGFyYXRlZFdoaXRlU3BhY2UgPVxuICAgICAgY3VycmVudExpbmVVbnRpbEN1cnNvci5zcGxpdChcIiBcIikubGFzdCgpID8/IFwiXCI7XG4gICAgaWYgKFxuICAgICAgbmV3IFJlZ0V4cChgXlske3RoaXMuc2V0dGluZ3MuZmlyc3RDaGFyYWN0ZXJzRGlzYWJsZVN1Z2dlc3Rpb25zfV1gKS50ZXN0KFxuICAgICAgICBjdXJyZW50VG9rZW5TZXBhcmF0ZWRXaGl0ZVNwYWNlXG4gICAgICApXG4gICAgKSB7XG4gICAgICBvblJldHVybk51bGwoXG4gICAgICAgIGBEb24ndCBzaG93IHN1Z2dlc3Rpb25zIGZvciBhdm9pZGluZyB0byBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBjb21tYW5kcy5gXG4gICAgICApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgY3VycmVudFRva2VuLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgQm9vbGVhbihjdXJyZW50VG9rZW4ubWF0Y2godGhpcy50b2tlbml6ZXIuZ2V0VHJpbVBhdHRlcm4oKSkpXG4gICAgKSB7XG4gICAgICBvblJldHVybk51bGwoXG4gICAgICAgIGBEb24ndCBzaG93IHN1Z2dlc3Rpb25zIGJlY2F1c2UgY3VycmVudFRva2VuIGlzIFRSSU1fUEFUVEVSTmBcbiAgICAgICk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50RnJvbnRNYXR0ZXIgPSB0aGlzLnNldHRpbmdzLmVuYWJsZUZyb250TWF0dGVyQ29tcGxlbWVudFxuICAgICAgPyB0aGlzLmFwcEhlbHBlci5nZXRDdXJyZW50RnJvbnRNYXR0ZXIoKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gICAgc2hvd0RlYnVnTG9nKGBDdXJyZW50IGZyb250IG1hdHRlciBpcyAke2N1cnJlbnRGcm9udE1hdHRlcn1gKTtcblxuICAgIGlmIChcbiAgICAgICF0aGlzLnJ1bk1hbnVhbGx5ICYmXG4gICAgICAhY3VycmVudEZyb250TWF0dGVyICYmXG4gICAgICBjdXJyZW50VG9rZW4ubGVuZ3RoIDwgdGhpcy5taW5OdW1iZXJUcmlnZ2VyZWRcbiAgICApIHtcbiAgICAgIG9uUmV0dXJuTnVsbChcbiAgICAgICAgXCJEb24ndCBzaG93IHN1Z2dlc3Rpb25zIGJlY2F1c2UgY3VycmVudFRva2VuIGlzIGxlc3MgdGhhbiBtaW5OdW1iZXJUcmlnZ2VyZWQgb3B0aW9uXCJcbiAgICAgICk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBzaG93RGVidWdMb2coYnVpbGRMb2dNZXNzYWdlKFwib25UcmlnZ2VyXCIsIHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnQpKTtcbiAgICB0aGlzLnJ1bk1hbnVhbGx5ID0gZmFsc2U7XG5cbiAgICAvLyBIYWNrIGltcGxlbWVudGF0aW9uIGZvciBGcm9udCBtYXR0ZXIgY29tcGxlbWVudFxuICAgIGlmIChjdXJyZW50RnJvbnRNYXR0ZXIgJiYgY3VycmVudFRva2Vucy5sYXN0KCk/LndvcmQubWF0Y2goL1teIF0gJC8pKSB7XG4gICAgICBjdXJyZW50VG9rZW5zLnB1c2goeyB3b3JkOiBcIlwiLCBvZmZzZXQ6IGN1cnJlbnRMaW5lVW50aWxDdXJzb3IubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIEZvciBtdWx0aS13b3JkIGNvbXBsZXRpb25cbiAgICB0aGlzLmNvbnRleHRTdGFydENoID0gY3Vyc29yLmNoIC0gY3VycmVudFRva2VuLmxlbmd0aDtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhcnQ6IHtcbiAgICAgICAgY2g6IGN1cnNvci5jaCAtIChjdXJyZW50VG9rZW5zLmxhc3QoKT8ud29yZD8ubGVuZ3RoID8/IDApLCAvLyBGb3IgbXVsdGktd29yZCBjb21wbGV0aW9uXG4gICAgICAgIGxpbmU6IGN1cnNvci5saW5lLFxuICAgICAgfSxcbiAgICAgIGVuZDogY3Vyc29yLFxuICAgICAgcXVlcnk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY3VycmVudEZyb250TWF0dGVyLFxuICAgICAgICBxdWVyaWVzOiBjdXJyZW50VG9rZW5zLm1hcCgoeCkgPT4gKHtcbiAgICAgICAgICAuLi54LFxuICAgICAgICAgIG9mZnNldDogeC5vZmZzZXQgLSBjdXJyZW50VG9rZW5zWzBdLm9mZnNldCxcbiAgICAgICAgfSkpLFxuICAgICAgfSksXG4gICAgfTtcbiAgfVxuXG4gIGdldFN1Z2dlc3Rpb25zKGNvbnRleHQ6IEVkaXRvclN1Z2dlc3RDb250ZXh0KTogV29yZFtdIHwgUHJvbWlzZTxXb3JkW10+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuZGVib3VuY2VHZXRTdWdnZXN0aW9ucyhjb250ZXh0LCAod29yZHMpID0+IHtcbiAgICAgICAgcmVzb2x2ZSh3b3Jkcyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlclN1Z2dlc3Rpb24od29yZDogV29yZCwgZWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgYmFzZSA9IGNyZWF0ZURpdigpO1xuXG4gICAgbGV0IHRleHQgPSB3b3JkLnZhbHVlO1xuICAgIGlmIChcbiAgICAgIHdvcmQudHlwZSA9PT0gXCJjdXN0b21EaWN0aW9uYXJ5XCIgJiZcbiAgICAgIHdvcmQuaW5zZXJ0ZWRUZXh0ICYmXG4gICAgICB0aGlzLnNldHRpbmdzLmRpc3BsYXllZFRleHRTdWZmaXhcbiAgICApIHtcbiAgICAgIHRleHQgKz0gdGhpcy5zZXR0aW5ncy5kaXNwbGF5ZWRUZXh0U3VmZml4O1xuICAgIH1cblxuICAgIGJhc2UuY3JlYXRlRGl2KHtcbiAgICAgIHRleHQsXG4gICAgICBjbHM6XG4gICAgICAgIHdvcmQudHlwZSA9PT0gXCJpbnRlcm5hbExpbmtcIiAmJiB3b3JkLmFsaWFzTWV0YVxuICAgICAgICAgID8gXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19zdWdnZXN0aW9uLWl0ZW1fX2NvbnRlbnRfX2FsaWFzXCJcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5kZXNjcmlwdGlvbk9uU3VnZ2VzdGlvbi50b0Rpc3BsYXkod29yZCk7XG4gICAgaWYgKGRlc2NyaXB0aW9uKSB7XG4gICAgICBiYXNlLmNyZWF0ZURpdih7XG4gICAgICAgIGNsczogXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19zdWdnZXN0aW9uLWl0ZW1fX2Rlc2NyaXB0aW9uXCIsXG4gICAgICAgIHRleHQ6IGAke2Rlc2NyaXB0aW9ufWAsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBlbC5hcHBlbmRDaGlsZChiYXNlKTtcblxuICAgIGVsLmFkZENsYXNzKFwidmFyaW91cy1jb21wbGVtZW50c19fc3VnZ2VzdGlvbi1pdGVtXCIpO1xuICAgIHN3aXRjaCAod29yZC50eXBlKSB7XG4gICAgICBjYXNlIFwiY3VycmVudEZpbGVcIjpcbiAgICAgICAgZWwuYWRkQ2xhc3MoXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19zdWdnZXN0aW9uLWl0ZW1fX2N1cnJlbnQtZmlsZVwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiY3VycmVudFZhdWx0XCI6XG4gICAgICAgIGVsLmFkZENsYXNzKFwidmFyaW91cy1jb21wbGVtZW50c19fc3VnZ2VzdGlvbi1pdGVtX19jdXJyZW50LXZhdWx0XCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJjdXN0b21EaWN0aW9uYXJ5XCI6XG4gICAgICAgIGVsLmFkZENsYXNzKFwidmFyaW91cy1jb21wbGVtZW50c19fc3VnZ2VzdGlvbi1pdGVtX19jdXN0b20tZGljdGlvbmFyeVwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiaW50ZXJuYWxMaW5rXCI6XG4gICAgICAgIGVsLmFkZENsYXNzKFwidmFyaW91cy1jb21wbGVtZW50c19fc3VnZ2VzdGlvbi1pdGVtX19pbnRlcm5hbC1saW5rXCIpO1xuICAgICAgICBpZiAod29yZC5waGFudG9tKSB7XG4gICAgICAgICAgZWwuYWRkQ2xhc3MoXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19zdWdnZXN0aW9uLWl0ZW1fX3BoYW50b21cIik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZnJvbnRNYXR0ZXJcIjpcbiAgICAgICAgZWwuYWRkQ2xhc3MoXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19zdWdnZXN0aW9uLWl0ZW1fX2Zyb250LW1hdHRlclwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgc2VsZWN0U3VnZ2VzdGlvbih3b3JkOiBXb3JkLCBldnQ6IE1vdXNlRXZlbnQgfCBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNvbnRleHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgaW5zZXJ0ZWRUZXh0ID0gd29yZC52YWx1ZTtcbiAgICBpZiAod29yZC50eXBlID09PSBcImludGVybmFsTGlua1wiKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5zdWdnZXN0SW50ZXJuYWxMaW5rV2l0aEFsaWFzICYmIHdvcmQuYWxpYXNNZXRhKSB7XG4gICAgICAgIGNvbnN0IGxpbmtUZXh0ID0gdGhpcy5hcHBIZWxwZXIub3B0aW1pemVNYXJrZG93bkxpbmtUZXh0KFxuICAgICAgICAgIHdvcmQuYWxpYXNNZXRhLm9yaWdpblxuICAgICAgICApITtcbiAgICAgICAgaW5zZXJ0ZWRUZXh0ID0gdGhpcy5hcHBIZWxwZXIudXNlV2lraUxpbmtzXG4gICAgICAgICAgPyBgW1ske2xpbmtUZXh0fXwke3dvcmQudmFsdWV9XV1gXG4gICAgICAgICAgOiBgWyR7d29yZC52YWx1ZX1dKCR7ZW5jb2RlU3BhY2UobGlua1RleHQpfS5tZClgO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlua1RleHQgPSB0aGlzLmFwcEhlbHBlci5vcHRpbWl6ZU1hcmtkb3duTGlua1RleHQoXG4gICAgICAgICAgd29yZC5waGFudG9tID8gd29yZC52YWx1ZSA6IHdvcmQuY3JlYXRlZFBhdGhcbiAgICAgICAgKSE7XG4gICAgICAgIGluc2VydGVkVGV4dCA9IHRoaXMuYXBwSGVscGVyLnVzZVdpa2lMaW5rc1xuICAgICAgICAgID8gYFtbJHtsaW5rVGV4dH1dXWBcbiAgICAgICAgICA6IGBbJHtsaW5rVGV4dH1dKCR7ZW5jb2RlU3BhY2UobGlua1RleHQpfS5tZClgO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHdvcmQudHlwZSA9PT0gXCJmcm9udE1hdHRlclwiICYmXG4gICAgICB0aGlzLnNldHRpbmdzLmluc2VydENvbW1hQWZ0ZXJGcm9udE1hdHRlckNvbXBsZXRpb25cbiAgICApIHtcbiAgICAgIGluc2VydGVkVGV4dCA9IGAke2luc2VydGVkVGV4dH0sIGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5pbnNlcnRBZnRlckNvbXBsZXRpb24gJiZcbiAgICAgICAgISh3b3JkLnR5cGUgPT09IFwiY3VzdG9tRGljdGlvbmFyeVwiICYmIHdvcmQuaWdub3JlU3BhY2VBZnRlckNvbXBsZXRpb24pXG4gICAgICApIHtcbiAgICAgICAgaW5zZXJ0ZWRUZXh0ID0gYCR7aW5zZXJ0ZWRUZXh0fSBgO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBwb3NpdGlvblRvTW92ZSA9IC0xO1xuXG4gICAgaWYgKHdvcmQudHlwZSA9PT0gXCJjdXN0b21EaWN0aW9uYXJ5XCIpIHtcbiAgICAgIGlmICh3b3JkLmluc2VydGVkVGV4dCkge1xuICAgICAgICBpbnNlcnRlZFRleHQgPSB3b3JkLmluc2VydGVkVGV4dDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2FyZXQgPSB3b3JkLmNhcmV0U3ltYm9sO1xuICAgICAgaWYgKGNhcmV0KSB7XG4gICAgICAgIHBvc2l0aW9uVG9Nb3ZlID0gaW5zZXJ0ZWRUZXh0LmluZGV4T2YoY2FyZXQpO1xuICAgICAgICBpbnNlcnRlZFRleHQgPSBpbnNlcnRlZFRleHQucmVwbGFjZShjYXJldCwgXCJcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5jb250ZXh0LmVkaXRvcjtcbiAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFxuICAgICAgaW5zZXJ0ZWRUZXh0LFxuICAgICAge1xuICAgICAgICAuLi50aGlzLmNvbnRleHQuc3RhcnQsXG4gICAgICAgIGNoOiB0aGlzLmNvbnRleHRTdGFydENoICsgd29yZC5vZmZzZXQhLFxuICAgICAgfSxcbiAgICAgIHRoaXMuY29udGV4dC5lbmRcbiAgICApO1xuXG4gICAgaWYgKHBvc2l0aW9uVG9Nb3ZlICE9PSAtMSkge1xuICAgICAgZWRpdG9yLnNldEN1cnNvcihcbiAgICAgICAgZWRpdG9yLm9mZnNldFRvUG9zKFxuICAgICAgICAgIGVkaXRvci5wb3NUb09mZnNldChlZGl0b3IuZ2V0Q3Vyc29yKCkpIC1cbiAgICAgICAgICAgIGluc2VydGVkVGV4dC5sZW5ndGggK1xuICAgICAgICAgICAgcG9zaXRpb25Ub01vdmVcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgd29ya2Fyb3VuZCBvZiBzdHJhbmdlIGJlaGF2aW9yIGZvciB0aGF0IGN1cnNvciBkb2Vzbid0IG1vdmUgYWZ0ZXIgY29tcGxldGlvbiBvbmx5IGlmIGl0IGRvZXNuJ3QgaW5wdXQgYW55IHdvcmQuXG4gICAgaWYgKFxuICAgICAgdGhpcy5hcHBIZWxwZXIuZXF1YWxzQXNFZGl0b3JQb3N0aW9uKHRoaXMuY29udGV4dC5zdGFydCwgdGhpcy5jb250ZXh0LmVuZClcbiAgICApIHtcbiAgICAgIGVkaXRvci5zZXRDdXJzb3IoXG4gICAgICAgIGVkaXRvci5vZmZzZXRUb1BvcyhcbiAgICAgICAgICBlZGl0b3IucG9zVG9PZmZzZXQoZWRpdG9yLmdldEN1cnNvcigpKSArIGluc2VydGVkVGV4dC5sZW5ndGhcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlPy5pbmNyZW1lbnQod29yZCBhcyBIaXRXb3JkKTtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zaG93TG9nQWJvdXRQZXJmb3JtYW5jZUluQ29uc29sZSkge1xuICAgICAgY29uc29sZS5sb2coXCItLS0gaGlzdG9yeSAtLS1cIik7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnNlbGVjdGlvbkhpc3RvcnlTdG9yYWdlPy5kYXRhKTtcbiAgICB9XG5cbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy5kZWJvdW5jZUNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIHNob3dEZWJ1Z0xvZyh0b01lc3NhZ2U6ICgpID0+IHN0cmluZykge1xuICAgIGlmICh0aGlzLnNldHRpbmdzLnNob3dMb2dBYm91dFBlcmZvcm1hbmNlSW5Db25zb2xlKSB7XG4gICAgICBjb25zb2xlLmxvZyh0b01lc3NhZ2UoKSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBBcHAsIE5vdGljZSwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgVmFyaW91c0NvbXBvbmVudHMgZnJvbSBcIi4uL21haW5cIjtcbmltcG9ydCB7IFRva2VuaXplU3RyYXRlZ3kgfSBmcm9tIFwiLi4vdG9rZW5pemVyL1Rva2VuaXplU3RyYXRlZ3lcIjtcbmltcG9ydCB7IE1hdGNoU3RyYXRlZ3kgfSBmcm9tIFwiLi4vcHJvdmlkZXIvTWF0Y2hTdHJhdGVneVwiO1xuaW1wb3J0IHsgQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzIH0gZnJvbSBcIi4uL29wdGlvbi9DeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXNcIjtcbmltcG9ydCB7IENvbHVtbkRlbGltaXRlciB9IGZyb20gXCIuLi9vcHRpb24vQ29sdW1uRGVsaW1pdGVyXCI7XG5pbXBvcnQgeyBTZWxlY3RTdWdnZXN0aW9uS2V5IH0gZnJvbSBcIi4uL29wdGlvbi9TZWxlY3RTdWdnZXN0aW9uS2V5XCI7XG5pbXBvcnQgeyBtaXJyb3JNYXAgfSBmcm9tIFwiLi4vdXRpbC9jb2xsZWN0aW9uLWhlbHBlclwiO1xuaW1wb3J0IHsgT3BlblNvdXJjZUZpbGVLZXlzIH0gZnJvbSBcIi4uL29wdGlvbi9PcGVuU291cmNlRmlsZUtleXNcIjtcbmltcG9ydCB7IERlc2NyaXB0aW9uT25TdWdnZXN0aW9uIH0gZnJvbSBcIi4uL29wdGlvbi9EZXNjcmlwdGlvbk9uU3VnZ2VzdGlvblwiO1xuaW1wb3J0IHsgU3BlY2lmaWNNYXRjaFN0cmF0ZWd5IH0gZnJvbSBcIi4uL3Byb3ZpZGVyL1NwZWNpZmljTWF0Y2hTdHJhdGVneVwiO1xuaW1wb3J0IHR5cGUgeyBTZWxlY3Rpb25IaXN0b3J5VHJlZSB9IGZyb20gXCIuLi9zdG9yYWdlL1NlbGVjdGlvbkhpc3RvcnlTdG9yYWdlXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3Mge1xuICAvLyBnZW5lcmFsXG4gIHN0cmF0ZWd5OiBzdHJpbmc7XG4gIG1hdGNoU3RyYXRlZ3k6IHN0cmluZztcbiAgbWF4TnVtYmVyT2ZTdWdnZXN0aW9uczogbnVtYmVyO1xuICBtYXhOdW1iZXJPZldvcmRzQXNQaHJhc2U6IG51bWJlcjtcbiAgbWluTnVtYmVyT2ZDaGFyYWN0ZXJzVHJpZ2dlcmVkOiBudW1iZXI7XG4gIG1pbk51bWJlck9mV29yZHNUcmlnZ2VyZWRQaHJhc2U6IG51bWJlcjtcbiAgY29tcGxlbWVudEF1dG9tYXRpY2FsbHk6IGJvb2xlYW47XG4gIGRlbGF5TWlsbGlTZWNvbmRzOiBudW1iZXI7XG4gIGRpc2FibGVTdWdnZXN0aW9uc0R1cmluZ0ltZU9uOiBib29sZWFuO1xuICAvLyBGSVhNRTogUmVuYW1lIGF0IG5leHQgbWFqb3IgdmVyc2lvbiB1cFxuICBpbnNlcnRBZnRlckNvbXBsZXRpb246IGJvb2xlYW47XG4gIGZpcnN0Q2hhcmFjdGVyc0Rpc2FibGVTdWdnZXN0aW9uczogc3RyaW5nO1xuXG4gIC8vIGFwcGVhcmFuY2VcbiAgc2hvd01hdGNoU3RyYXRlZ3k6IGJvb2xlYW47XG4gIHNob3dDb21wbGVtZW50QXV0b21hdGljYWxseTogYm9vbGVhbjtcbiAgc2hvd0luZGV4aW5nU3RhdHVzOiBib29sZWFuO1xuICBkZXNjcmlwdGlvbk9uU3VnZ2VzdGlvbjogc3RyaW5nO1xuXG4gIC8vIGtleSBjdXN0b21pemF0aW9uXG4gIHNlbGVjdFN1Z2dlc3Rpb25LZXlzOiBzdHJpbmc7XG4gIGFkZGl0aW9uYWxDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXM6IHN0cmluZztcbiAgZGlzYWJsZVVwRG93bktleXNGb3JDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXM6IGJvb2xlYW47XG4gIG9wZW5Tb3VyY2VGaWxlS2V5OiBzdHJpbmc7XG4gIHByb3BhZ2F0ZUVzYzogYm9vbGVhbjtcblxuICAvLyBjdXJyZW50IGZpbGUgY29tcGxlbWVudFxuICBlbmFibGVDdXJyZW50RmlsZUNvbXBsZW1lbnQ6IGJvb2xlYW47XG4gIGN1cnJlbnRGaWxlTWluTnVtYmVyT2ZDaGFyYWN0ZXJzOiBudW1iZXI7XG4gIG9ubHlDb21wbGVtZW50RW5nbGlzaE9uQ3VycmVudEZpbGVDb21wbGVtZW50OiBib29sZWFuO1xuXG4gIC8vIGN1cnJlbnQgdmF1bHQgY29tcGxlbWVudFxuICBlbmFibGVDdXJyZW50VmF1bHRDb21wbGVtZW50OiBib29sZWFuO1xuICBjdXJyZW50VmF1bHRNaW5OdW1iZXJPZkNoYXJhY3RlcnM6IG51bWJlcjtcbiAgaW5jbHVkZUN1cnJlbnRWYXVsdFBhdGhQcmVmaXhQYXR0ZXJuczogc3RyaW5nO1xuICBleGNsdWRlQ3VycmVudFZhdWx0UGF0aFByZWZpeFBhdHRlcm5zOiBzdHJpbmc7XG4gIGluY2x1ZGVDdXJyZW50VmF1bHRPbmx5RmlsZXNVbmRlckN1cnJlbnREaXJlY3Rvcnk6IGJvb2xlYW47XG5cbiAgLy8gY3VzdG9tIGRpY3Rpb25hcnkgY29tcGxlbWVudFxuICBlbmFibGVDdXN0b21EaWN0aW9uYXJ5Q29tcGxlbWVudDogYm9vbGVhbjtcbiAgY3VzdG9tRGljdGlvbmFyeVBhdGhzOiBzdHJpbmc7XG4gIGNvbHVtbkRlbGltaXRlcjogc3RyaW5nO1xuICBjdXN0b21EaWN0aW9uYXJ5V29yZFJlZ2V4UGF0dGVybjogc3RyaW5nO1xuICBkZWxpbWl0ZXJUb0hpZGVTdWdnZXN0aW9uOiBzdHJpbmc7XG4gIGRlbGltaXRlclRvRGl2aWRlU3VnZ2VzdGlvbnNGb3JEaXNwbGF5RnJvbUluc2VydGlvbjogc3RyaW5nO1xuICBjYXJldExvY2F0aW9uU3ltYm9sQWZ0ZXJDb21wbGVtZW50OiBzdHJpbmc7XG4gIGRpc3BsYXllZFRleHRTdWZmaXg6IHN0cmluZztcblxuICAvLyBpbnRlcm5hbCBsaW5rIGNvbXBsZW1lbnRcbiAgZW5hYmxlSW50ZXJuYWxMaW5rQ29tcGxlbWVudDogYm9vbGVhbjtcbiAgc3VnZ2VzdEludGVybmFsTGlua1dpdGhBbGlhczogYm9vbGVhbjtcbiAgZXhjbHVkZUludGVybmFsTGlua1BhdGhQcmVmaXhQYXR0ZXJuczogc3RyaW5nO1xuXG4gIC8vIGZyb250IG1hdHRlciBjb21wbGVtZW50XG4gIGVuYWJsZUZyb250TWF0dGVyQ29tcGxlbWVudDogYm9vbGVhbjtcbiAgZnJvbnRNYXR0ZXJDb21wbGVtZW50TWF0Y2hTdHJhdGVneTogc3RyaW5nO1xuICBpbnNlcnRDb21tYUFmdGVyRnJvbnRNYXR0ZXJDb21wbGV0aW9uOiBib29sZWFuO1xuXG4gIGludGVsbGlnZW50U3VnZ2VzdGlvblByaW9yaXRpemF0aW9uOiB7XG4gICAgLy8gSWYgc2V0IDAsIGl0IHdpbGwgbmV2ZXIgcmVtb3ZlXG4gICAgbWF4RGF5c1RvS2VlcEhpc3Rvcnk6IG51bWJlcjtcbiAgICAvLyBJZiBzZXQgMCwgaXQgd2lsbCBuZXZlciByZW1vdmVcbiAgICBtYXhOdW1iZXJPZkhpc3RvcnlUb0tlZXA6IG51bWJlcjtcbiAgfTtcblxuICAvLyBkZWJ1Z1xuICBzaG93TG9nQWJvdXRQZXJmb3JtYW5jZUluQ29uc29sZTogYm9vbGVhbjtcblxuICAvLyBvdGhlcnNcbiAgc2VsZWN0aW9uSGlzdG9yeVRyZWU6IFNlbGVjdGlvbkhpc3RvcnlUcmVlO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogU2V0dGluZ3MgPSB7XG4gIC8vIGdlbmVyYWxcbiAgc3RyYXRlZ3k6IFwiZGVmYXVsdFwiLFxuICBtYXRjaFN0cmF0ZWd5OiBcInByZWZpeFwiLFxuXG4gIG1heE51bWJlck9mU3VnZ2VzdGlvbnM6IDUsXG4gIG1heE51bWJlck9mV29yZHNBc1BocmFzZTogMyxcbiAgbWluTnVtYmVyT2ZDaGFyYWN0ZXJzVHJpZ2dlcmVkOiAwLFxuICBtaW5OdW1iZXJPZldvcmRzVHJpZ2dlcmVkUGhyYXNlOiAxLFxuICBjb21wbGVtZW50QXV0b21hdGljYWxseTogdHJ1ZSxcbiAgZGVsYXlNaWxsaVNlY29uZHM6IDAsXG4gIGRpc2FibGVTdWdnZXN0aW9uc0R1cmluZ0ltZU9uOiBmYWxzZSxcbiAgaW5zZXJ0QWZ0ZXJDb21wbGV0aW9uOiB0cnVlLFxuICBmaXJzdENoYXJhY3RlcnNEaXNhYmxlU3VnZ2VzdGlvbnM6IFwiOi9eXCIsXG5cbiAgLy8gYXBwZWFyYW5jZVxuICBzaG93TWF0Y2hTdHJhdGVneTogdHJ1ZSxcbiAgc2hvd0NvbXBsZW1lbnRBdXRvbWF0aWNhbGx5OiB0cnVlLFxuICBzaG93SW5kZXhpbmdTdGF0dXM6IHRydWUsXG4gIGRlc2NyaXB0aW9uT25TdWdnZXN0aW9uOiBcIlNob3J0XCIsXG5cbiAgLy8ga2V5IGN1c3RvbWl6YXRpb25cbiAgc2VsZWN0U3VnZ2VzdGlvbktleXM6IFwiRW50ZXJcIixcbiAgYWRkaXRpb25hbEN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5czogXCJOb25lXCIsXG4gIGRpc2FibGVVcERvd25LZXlzRm9yQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzOiBmYWxzZSxcbiAgb3BlblNvdXJjZUZpbGVLZXk6IFwiTm9uZVwiLFxuICBwcm9wYWdhdGVFc2M6IGZhbHNlLFxuXG4gIC8vIGN1cnJlbnQgZmlsZSBjb21wbGVtZW50XG4gIGVuYWJsZUN1cnJlbnRGaWxlQ29tcGxlbWVudDogdHJ1ZSxcbiAgY3VycmVudEZpbGVNaW5OdW1iZXJPZkNoYXJhY3RlcnM6IDAsXG4gIG9ubHlDb21wbGVtZW50RW5nbGlzaE9uQ3VycmVudEZpbGVDb21wbGVtZW50OiBmYWxzZSxcblxuICAvLyBjdXJyZW50IHZhdWx0IGNvbXBsZW1lbnRcbiAgZW5hYmxlQ3VycmVudFZhdWx0Q29tcGxlbWVudDogZmFsc2UsXG4gIGN1cnJlbnRWYXVsdE1pbk51bWJlck9mQ2hhcmFjdGVyczogMCxcbiAgaW5jbHVkZUN1cnJlbnRWYXVsdFBhdGhQcmVmaXhQYXR0ZXJuczogXCJcIixcbiAgZXhjbHVkZUN1cnJlbnRWYXVsdFBhdGhQcmVmaXhQYXR0ZXJuczogXCJcIixcbiAgaW5jbHVkZUN1cnJlbnRWYXVsdE9ubHlGaWxlc1VuZGVyQ3VycmVudERpcmVjdG9yeTogZmFsc2UsXG5cbiAgLy8gY3VzdG9tIGRpY3Rpb25hcnkgY29tcGxlbWVudFxuICBlbmFibGVDdXN0b21EaWN0aW9uYXJ5Q29tcGxlbWVudDogZmFsc2UsXG4gIGN1c3RvbURpY3Rpb25hcnlQYXRoczogYGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9maXJzdDIwaG91cnMvZ29vZ2xlLTEwMDAwLWVuZ2xpc2gvbWFzdGVyL2dvb2dsZS0xMDAwMC1lbmdsaXNoLW5vLXN3ZWFycy50eHRgLFxuICBjb2x1bW5EZWxpbWl0ZXI6IFwiVGFiXCIsXG4gIGN1c3RvbURpY3Rpb25hcnlXb3JkUmVnZXhQYXR0ZXJuOiBcIlwiLFxuICBkZWxpbWl0ZXJUb0hpZGVTdWdnZXN0aW9uOiBcIlwiLFxuICBkZWxpbWl0ZXJUb0RpdmlkZVN1Z2dlc3Rpb25zRm9yRGlzcGxheUZyb21JbnNlcnRpb246IFwiXCIsXG4gIGNhcmV0TG9jYXRpb25TeW1ib2xBZnRlckNvbXBsZW1lbnQ6IFwiXCIsXG4gIGRpc3BsYXllZFRleHRTdWZmaXg6IFwiID0+IC4uLlwiLFxuXG4gIC8vIGludGVybmFsIGxpbmsgY29tcGxlbWVudFxuICBlbmFibGVJbnRlcm5hbExpbmtDb21wbGVtZW50OiB0cnVlLFxuICBzdWdnZXN0SW50ZXJuYWxMaW5rV2l0aEFsaWFzOiBmYWxzZSxcbiAgZXhjbHVkZUludGVybmFsTGlua1BhdGhQcmVmaXhQYXR0ZXJuczogXCJcIixcblxuICAvLyBmcm9udCBtYXR0ZXIgY29tcGxlbWVudFxuICBlbmFibGVGcm9udE1hdHRlckNvbXBsZW1lbnQ6IHRydWUsXG4gIGZyb250TWF0dGVyQ29tcGxlbWVudE1hdGNoU3RyYXRlZ3k6IFwiaW5oZXJpdFwiLFxuICBpbnNlcnRDb21tYUFmdGVyRnJvbnRNYXR0ZXJDb21wbGV0aW9uOiBmYWxzZSxcblxuICBpbnRlbGxpZ2VudFN1Z2dlc3Rpb25Qcmlvcml0aXphdGlvbjoge1xuICAgIG1heERheXNUb0tlZXBIaXN0b3J5OiAzMCxcbiAgICBtYXhOdW1iZXJPZkhpc3RvcnlUb0tlZXA6IDAsXG4gIH0sXG5cbiAgLy8gZGVidWdcbiAgc2hvd0xvZ0Fib3V0UGVyZm9ybWFuY2VJbkNvbnNvbGU6IGZhbHNlLFxuXG4gIC8vIG90aGVyc1xuICBzZWxlY3Rpb25IaXN0b3J5VHJlZToge30sXG59O1xuXG5leHBvcnQgY2xhc3MgVmFyaW91c0NvbXBsZW1lbnRzU2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IFZhcmlvdXNDb21wb25lbnRzO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFZhcmlvdXNDb21wb25lbnRzKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBsZXQgeyBjb250YWluZXJFbCB9ID0gdGhpcztcblxuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJWYXJpb3VzIENvbXBsZW1lbnRzIC0gU2V0dGluZ3NcIiB9KTtcbiAgICB0aGlzLmFkZE1haW5TZXR0aW5ncyhjb250YWluZXJFbCk7XG4gICAgdGhpcy5hZGRBcHBlYXJhbmNlU2V0dGluZ3MoY29udGFpbmVyRWwpO1xuICAgIHRoaXMuYWRkS2V5Q3VzdG9taXphdGlvblNldHRpbmdzKGNvbnRhaW5lckVsKTtcbiAgICB0aGlzLmFkZEN1cnJlbnRGaWxlQ29tcGxlbWVudFNldHRpbmdzKGNvbnRhaW5lckVsKTtcbiAgICB0aGlzLmFkZEN1cnJlbnRWYXVsdENvbXBsZW1lbnRTZXR0aW5ncyhjb250YWluZXJFbCk7XG4gICAgdGhpcy5hZGRDdXN0b21EaWN0aW9uYXJ5Q29tcGxlbWVudFNldHRpbmdzKGNvbnRhaW5lckVsKTtcbiAgICB0aGlzLmFkZEludGVybmFsTGlua0NvbXBsZW1lbnRTZXR0aW5ncyhjb250YWluZXJFbCk7XG4gICAgdGhpcy5hZGRGcm9udE1hdHRlckNvbXBsZW1lbnRTZXR0aW5ncyhjb250YWluZXJFbCk7XG4gICAgdGhpcy5hZGRJbnRlbGxpZ2VudFN1Z2dlc3Rpb25Qcmlvcml0aXphdGlvblNldHRpbmdzKGNvbnRhaW5lckVsKTtcbiAgICB0aGlzLmFkZERlYnVnU2V0dGluZ3MoY29udGFpbmVyRWwpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRNYWluU2V0dGluZ3MoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KSB7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiTWFpblwiIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJTdHJhdGVneVwiKS5hZGREcm9wZG93bigodGMpID0+XG4gICAgICB0Y1xuICAgICAgICAuYWRkT3B0aW9ucyhtaXJyb3JNYXAoVG9rZW5pemVTdHJhdGVneS52YWx1ZXMoKSwgKHgpID0+IHgubmFtZSkpXG4gICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zdHJhdGVneSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN0cmF0ZWd5ID0gdmFsdWU7XG4gICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKHtcbiAgICAgICAgICAgIGN1cnJlbnRGaWxlOiB0cnVlLFxuICAgICAgICAgICAgY3VycmVudFZhdWx0OiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICk7XG4gICAgaWYgKHRoaXMucGx1Z2luLnNldHRpbmdzLnN0cmF0ZWd5ID09PSBUb2tlbml6ZVN0cmF0ZWd5LkNISU5FU0UubmFtZSkge1xuICAgICAgY29uc3QgZWwgPSBjb250YWluZXJFbC5jcmVhdGVFbChcImRpdlwiLCB7XG4gICAgICAgIGNsczogXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19zZXR0aW5nc19fd2FybmluZ1wiLFxuICAgICAgfSk7XG4gICAgICBlbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogXCLimqAgWW91IG5lZWQgdG8gZG93bmxvYWQgYGNlZGljdF90cy51OGAgZnJvbVwiLFxuICAgICAgfSk7XG4gICAgICBlbC5jcmVhdGVFbChcImFcIiwge1xuICAgICAgICBocmVmOiBcImh0dHBzOi8vd3d3Lm1kYmcubmV0L2NoaW5lc2UvZGljdGlvbmFyeT9wYWdlPWNjLWNlZGljdFwiLFxuICAgICAgICB0ZXh0OiBcIiB0aGUgc2l0ZSBcIixcbiAgICAgIH0pO1xuICAgICAgZWwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IFwiYW5kIHN0b3JlIGl0IGluIHZhdWx0IHJvb3QuXCIsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZShcIk1hdGNoIHN0cmF0ZWd5XCIpLmFkZERyb3Bkb3duKCh0YykgPT5cbiAgICAgIHRjXG4gICAgICAgIC5hZGRPcHRpb25zKG1pcnJvck1hcChNYXRjaFN0cmF0ZWd5LnZhbHVlcygpLCAoeCkgPT4geC5uYW1lKSlcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm1hdGNoU3RyYXRlZ3kpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5tYXRjaFN0cmF0ZWd5ID0gdmFsdWU7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgIH0pXG4gICAgKTtcbiAgICBpZiAodGhpcy5wbHVnaW4uc2V0dGluZ3MubWF0Y2hTdHJhdGVneSA9PT0gTWF0Y2hTdHJhdGVneS5QQVJUSUFMLm5hbWUpIHtcbiAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiZGl2XCIsIHtcbiAgICAgICAgdGV4dDogXCLimqAgYHBhcnRpYWxgIGlzIG1vcmUgdGhhbiAxMCB0aW1lcyBzbG93ZXIgdGhhbiBgcHJlZml4YFwiLFxuICAgICAgICBjbHM6IFwidmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX3dhcm5pbmdcIixcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJNYXggbnVtYmVyIG9mIHN1Z2dlc3Rpb25zXCIpXG4gICAgICAuYWRkU2xpZGVyKChzYykgPT5cbiAgICAgICAgc2NcbiAgICAgICAgICAuc2V0TGltaXRzKDEsIDI1NSwgMSlcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4TnVtYmVyT2ZTdWdnZXN0aW9ucylcbiAgICAgICAgICAuc2V0RHluYW1pY1Rvb2x0aXAoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm1heE51bWJlck9mU3VnZ2VzdGlvbnMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIk1heCBudW1iZXIgb2Ygd29yZHMgYXMgYSBwaHJhc2VcIilcbiAgICAgIC5zZXREZXNjKGBb4pqgV2FybmluZ10gSXQgbWFrZXMgc2xvd2VyIG1vcmUgdGhhbiBOIHRpbWVzIChOIGlzIHNldCB2YWx1ZSlgKVxuICAgICAgLmFkZFNsaWRlcigoc2MpID0+XG4gICAgICAgIHNjXG4gICAgICAgICAgLnNldExpbWl0cygxLCAxMCwgMSlcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4TnVtYmVyT2ZXb3Jkc0FzUGhyYXNlKVxuICAgICAgICAgIC5zZXREeW5hbWljVG9vbHRpcCgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4TnVtYmVyT2ZXb3Jkc0FzUGhyYXNlID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJNaW4gbnVtYmVyIG9mIGNoYXJhY3RlcnMgZm9yIHRyaWdnZXJcIilcbiAgICAgIC5zZXREZXNjKFwiSXQgdXNlcyBhIGRlZmF1bHQgdmFsdWUgb2YgU3RyYXRlZ3kgaWYgc2V0IDAuXCIpXG4gICAgICAuYWRkU2xpZGVyKChzYykgPT5cbiAgICAgICAgc2NcbiAgICAgICAgICAuc2V0TGltaXRzKDAsIDEwLCAxKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5taW5OdW1iZXJPZkNoYXJhY3RlcnNUcmlnZ2VyZWQpXG4gICAgICAgICAgLnNldER5bmFtaWNUb29sdGlwKClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5taW5OdW1iZXJPZkNoYXJhY3RlcnNUcmlnZ2VyZWQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIk1pbiBudW1iZXIgb2Ygd29yZHMgZm9yIHRyaWdnZXJcIilcbiAgICAgIC5hZGRTbGlkZXIoKHNjKSA9PlxuICAgICAgICBzY1xuICAgICAgICAgIC5zZXRMaW1pdHMoMSwgMTAsIDEpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm1pbk51bWJlck9mV29yZHNUcmlnZ2VyZWRQaHJhc2UpXG4gICAgICAgICAgLnNldER5bmFtaWNUb29sdGlwKClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5taW5OdW1iZXJPZldvcmRzVHJpZ2dlcmVkUGhyYXNlID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJDb21wbGVtZW50IGF1dG9tYXRpY2FsbHlcIilcbiAgICAgIC5hZGRUb2dnbGUoKHRjKSA9PiB7XG4gICAgICAgIHRjLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbXBsZW1lbnRBdXRvbWF0aWNhbGx5KS5vbkNoYW5nZShcbiAgICAgICAgICBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbXBsZW1lbnRBdXRvbWF0aWNhbGx5ID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJEZWxheSBtaWxsaS1zZWNvbmRzIGZvciB0cmlnZ2VyXCIpXG4gICAgICAuYWRkU2xpZGVyKChzYykgPT5cbiAgICAgICAgc2NcbiAgICAgICAgICAuc2V0TGltaXRzKDAsIDEwMDAsIDEwKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWxheU1pbGxpU2Vjb25kcylcbiAgICAgICAgICAuc2V0RHluYW1pY1Rvb2x0aXAoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlbGF5TWlsbGlTZWNvbmRzID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJEaXNhYmxlIHN1Z2dlc3Rpb25zIGR1cmluZyBJTUUgb25cIilcbiAgICAgIC5hZGRUb2dnbGUoKHRjKSA9PiB7XG4gICAgICAgIHRjLnNldFZhbHVlKFxuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRpc2FibGVTdWdnZXN0aW9uc0R1cmluZ0ltZU9uXG4gICAgICAgICkub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGlzYWJsZVN1Z2dlc3Rpb25zRHVyaW5nSW1lT24gPSB2YWx1ZTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJJbnNlcnQgc3BhY2UgYWZ0ZXIgY29tcGxldGlvblwiKVxuICAgICAgLmFkZFRvZ2dsZSgodGMpID0+IHtcbiAgICAgICAgdGMuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuaW5zZXJ0QWZ0ZXJDb21wbGV0aW9uKS5vbkNoYW5nZShcbiAgICAgICAgICBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmluc2VydEFmdGVyQ29tcGxldGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiRmlyc3QgY2hhcmFjdGVycyB0byBkaXNhYmxlIHN1Z2dlc3Rpb25zXCIpXG4gICAgICAuYWRkVGV4dCgoY2IpID0+IHtcbiAgICAgICAgY2Iuc2V0VmFsdWUoXG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZmlyc3RDaGFyYWN0ZXJzRGlzYWJsZVN1Z2dlc3Rpb25zXG4gICAgICAgICkub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZmlyc3RDaGFyYWN0ZXJzRGlzYWJsZVN1Z2dlc3Rpb25zID0gdmFsdWU7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFkZEFwcGVhcmFuY2VTZXR0aW5ncyhjb250YWluZXJFbDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJBcHBlYXJhbmNlXCIgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiU2hvdyBNYXRjaCBzdHJhdGVneVwiKVxuICAgICAgLnNldERlc2MoXG4gICAgICAgIFwiU2hvdyBNYXRjaCBzdHJhdGVneSBhdCB0aGUgc3RhdHVzIGJhci4gQ2hhbmdpbmcgdGhpcyBvcHRpb24gcmVxdWlyZXMgYSByZXN0YXJ0IHRvIHRha2UgZWZmZWN0LlwiXG4gICAgICApXG4gICAgICAuYWRkVG9nZ2xlKCh0YykgPT4ge1xuICAgICAgICB0Yy5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaG93TWF0Y2hTdHJhdGVneSkub25DaGFuZ2UoXG4gICAgICAgICAgYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaG93TWF0Y2hTdHJhdGVneSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiU2hvdyBDb21wbGVtZW50IGF1dG9tYXRpY2FsbHlcIilcbiAgICAgIC5zZXREZXNjKFxuICAgICAgICBcIlNob3cgY29tcGxlbWVudCBhdXRvbWF0aWNhbGx5IGF0IHRoZSBzdGF0dXMgYmFyLiBDaGFuZ2luZyB0aGlzIG9wdGlvbiByZXF1aXJlcyBhIHJlc3RhcnQgdG8gdGFrZSBlZmZlY3QuXCJcbiAgICAgIClcbiAgICAgIC5hZGRUb2dnbGUoKHRjKSA9PiB7XG4gICAgICAgIHRjLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dDb21wbGVtZW50QXV0b21hdGljYWxseSkub25DaGFuZ2UoXG4gICAgICAgICAgYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaG93Q29tcGxlbWVudEF1dG9tYXRpY2FsbHkgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIlNob3cgSW5kZXhpbmcgc3RhdHVzXCIpXG4gICAgICAuc2V0RGVzYyhcbiAgICAgICAgXCJTaG93IGluZGV4aW5nIHN0YXR1cyBhdCB0aGUgc3RhdHVzIGJhci4gQ2hhbmdpbmcgdGhpcyBvcHRpb24gcmVxdWlyZXMgYSByZXN0YXJ0IHRvIHRha2UgZWZmZWN0LlwiXG4gICAgICApXG4gICAgICAuYWRkVG9nZ2xlKCh0YykgPT4ge1xuICAgICAgICB0Yy5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaG93SW5kZXhpbmdTdGF0dXMpLm9uQ2hhbmdlKFxuICAgICAgICAgIGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2hvd0luZGV4aW5nU3RhdHVzID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJEZXNjcmlwdGlvbiBvbiBhIHN1Z2dlc3Rpb25cIilcbiAgICAgIC5hZGREcm9wZG93bigodGMpID0+XG4gICAgICAgIHRjXG4gICAgICAgICAgLmFkZE9wdGlvbnMoXG4gICAgICAgICAgICBtaXJyb3JNYXAoRGVzY3JpcHRpb25PblN1Z2dlc3Rpb24udmFsdWVzKCksICh4KSA9PiB4Lm5hbWUpXG4gICAgICAgICAgKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXNjcmlwdGlvbk9uU3VnZ2VzdGlvbilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXNjcmlwdGlvbk9uU3VnZ2VzdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFkZEtleUN1c3RvbWl6YXRpb25TZXR0aW5ncyhjb250YWluZXJFbDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJLZXkgY3VzdG9taXphdGlvblwiIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIlNlbGVjdCBhIHN1Z2dlc3Rpb24ga2V5XCIpXG4gICAgICAuYWRkRHJvcGRvd24oKHRjKSA9PlxuICAgICAgICB0Y1xuICAgICAgICAgIC5hZGRPcHRpb25zKG1pcnJvck1hcChTZWxlY3RTdWdnZXN0aW9uS2V5LnZhbHVlcygpLCAoeCkgPT4geC5uYW1lKSlcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc2VsZWN0U3VnZ2VzdGlvbktleXMpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2VsZWN0U3VnZ2VzdGlvbktleXMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIkFkZGl0aW9uYWwgY3ljbGUgdGhyb3VnaCBzdWdnZXN0aW9ucyBrZXlzXCIpXG4gICAgICAuYWRkRHJvcGRvd24oKHRjKSA9PlxuICAgICAgICB0Y1xuICAgICAgICAgIC5hZGRPcHRpb25zKFxuICAgICAgICAgICAgbWlycm9yTWFwKEN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5cy52YWx1ZXMoKSwgKHgpID0+IHgubmFtZSlcbiAgICAgICAgICApXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFkZGl0aW9uYWxDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYWRkaXRpb25hbEN5Y2xlVGhyb3VnaFN1Z2dlc3Rpb25zS2V5cyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiRGlzYWJsZSB0aGUgdXAvZG93biBrZXlzIGZvciBjeWNsZSB0aHJvdWdoIHN1Z2dlc3Rpb25zIGtleXNcIilcbiAgICAgIC5hZGRUb2dnbGUoKHRjKSA9PiB7XG4gICAgICAgIHRjLnNldFZhbHVlKFxuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRpc2FibGVVcERvd25LZXlzRm9yQ3ljbGVUaHJvdWdoU3VnZ2VzdGlvbnNLZXlzXG4gICAgICAgICkub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGlzYWJsZVVwRG93bktleXNGb3JDeWNsZVRocm91Z2hTdWdnZXN0aW9uc0tleXMgPVxuICAgICAgICAgICAgdmFsdWU7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZShcIk9wZW4gc291cmNlIGZpbGUga2V5XCIpLmFkZERyb3Bkb3duKCh0YykgPT5cbiAgICAgIHRjXG4gICAgICAgIC5hZGRPcHRpb25zKG1pcnJvck1hcChPcGVuU291cmNlRmlsZUtleXMudmFsdWVzKCksICh4KSA9PiB4Lm5hbWUpKVxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mub3BlblNvdXJjZUZpbGVLZXkpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5vcGVuU291cmNlRmlsZUtleSA9IHZhbHVlO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICB9KVxuICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiUHJvcGFnYXRlIEVTQ1wiKVxuICAgICAgLnNldERlc2MoXG4gICAgICAgIFwiSXQgaXMgaGFuZHkgaWYgeW91IHVzZSBWaW0gbW9kZSBiZWNhdXNlIHlvdSBjYW4gc3dpdGNoIHRvIE5vcm1hbCBtb2RlIGJ5IG9uZSBFU0MsIHdoZXRoZXIgaXQgc2hvd3Mgc3VnZ2VzdGlvbnMgb3Igbm90LlwiXG4gICAgICApXG4gICAgICAuYWRkVG9nZ2xlKCh0YykgPT4ge1xuICAgICAgICB0Yy5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5wcm9wYWdhdGVFc2MpLm9uQ2hhbmdlKFxuICAgICAgICAgIGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvcGFnYXRlRXNjID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkQ3VycmVudEZpbGVDb21wbGVtZW50U2V0dGluZ3MoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KSB7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoM1wiLCB7XG4gICAgICB0ZXh0OiBcIkN1cnJlbnQgZmlsZSBjb21wbGVtZW50XCIsXG4gICAgICBjbHM6IFwidmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX2hlYWRlciB2YXJpb3VzLWNvbXBsZW1lbnRzX19zZXR0aW5nc19faGVhZGVyX19jdXJyZW50LWZpbGVcIixcbiAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJFbmFibGUgQ3VycmVudCBmaWxlIGNvbXBsZW1lbnRcIilcbiAgICAgIC5hZGRUb2dnbGUoKHRjKSA9PiB7XG4gICAgICAgIHRjLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZUN1cnJlbnRGaWxlQ29tcGxlbWVudCkub25DaGFuZ2UoXG4gICAgICAgICAgYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVDdXJyZW50RmlsZUNvbXBsZW1lbnQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncyh7IGN1cnJlbnRGaWxlOiB0cnVlIH0pO1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICBpZiAodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlQ3VycmVudEZpbGVDb21wbGVtZW50KSB7XG4gICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgLnNldE5hbWUoXCJNaW4gbnVtYmVyIG9mIGNoYXJhY3RlcnMgZm9yIGluZGV4aW5nXCIpXG4gICAgICAgIC5zZXREZXNjKFwiSXQgdXNlcyBhIGRlZmF1bHQgdmFsdWUgb2YgU3RyYXRlZ3kgaWYgc2V0IDAuXCIpXG4gICAgICAgIC5hZGRTbGlkZXIoKHNjKSA9PlxuICAgICAgICAgIHNjXG4gICAgICAgICAgICAuc2V0TGltaXRzKDAsIDE1LCAxKVxuICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmN1cnJlbnRGaWxlTWluTnVtYmVyT2ZDaGFyYWN0ZXJzKVxuICAgICAgICAgICAgLnNldER5bmFtaWNUb29sdGlwKClcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY3VycmVudEZpbGVNaW5OdW1iZXJPZkNoYXJhY3RlcnMgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKHsgY3VycmVudEZpbGU6IHRydWUgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgLnNldE5hbWUoXCJPbmx5IGNvbXBsZW1lbnQgRW5nbGlzaCBvbiBjdXJyZW50IGZpbGUgY29tcGxlbWVudFwiKVxuICAgICAgICAuYWRkVG9nZ2xlKCh0YykgPT4ge1xuICAgICAgICAgIHRjLnNldFZhbHVlKFxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mub25seUNvbXBsZW1lbnRFbmdsaXNoT25DdXJyZW50RmlsZUNvbXBsZW1lbnRcbiAgICAgICAgICApLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mub25seUNvbXBsZW1lbnRFbmdsaXNoT25DdXJyZW50RmlsZUNvbXBsZW1lbnQgPVxuICAgICAgICAgICAgICB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncyh7IGN1cnJlbnRGaWxlOiB0cnVlIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkZEN1cnJlbnRWYXVsdENvbXBsZW1lbnRTZXR0aW5ncyhjb250YWluZXJFbDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgzXCIsIHtcbiAgICAgIHRleHQ6IFwiQ3VycmVudCB2YXVsdCBjb21wbGVtZW50XCIsXG4gICAgICBjbHM6IFwidmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX2hlYWRlciB2YXJpb3VzLWNvbXBsZW1lbnRzX19zZXR0aW5nc19faGVhZGVyX19jdXJyZW50LXZhdWx0XCIsXG4gICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiRW5hYmxlIEN1cnJlbnQgdmF1bHQgY29tcGxlbWVudFwiKVxuICAgICAgLmFkZFRvZ2dsZSgodGMpID0+IHtcbiAgICAgICAgdGMuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlQ3VycmVudFZhdWx0Q29tcGxlbWVudCkub25DaGFuZ2UoXG4gICAgICAgICAgYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVDdXJyZW50VmF1bHRDb21wbGVtZW50ID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncyh7IGN1cnJlbnRWYXVsdDogdHJ1ZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgIGlmICh0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVDdXJyZW50VmF1bHRDb21wbGVtZW50KSB7XG4gICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgLnNldE5hbWUoXCJNaW4gbnVtYmVyIG9mIGNoYXJhY3RlcnMgZm9yIGluZGV4aW5nXCIpXG4gICAgICAgIC5zZXREZXNjKFwiSXQgdXNlcyBhIGRlZmF1bHQgdmFsdWUgb2YgU3RyYXRlZ3kgaWYgc2V0IDAuXCIpXG4gICAgICAgIC5hZGRTbGlkZXIoKHNjKSA9PlxuICAgICAgICAgIHNjXG4gICAgICAgICAgICAuc2V0TGltaXRzKDAsIDE1LCAxKVxuICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmN1cnJlbnRWYXVsdE1pbk51bWJlck9mQ2hhcmFjdGVycylcbiAgICAgICAgICAgIC5zZXREeW5hbWljVG9vbHRpcCgpXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmN1cnJlbnRWYXVsdE1pbk51bWJlck9mQ2hhcmFjdGVycyA9IHZhbHVlO1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAuc2V0TmFtZShcIkluY2x1ZGUgcHJlZml4IHBhdGggcGF0dGVybnNcIilcbiAgICAgICAgLnNldERlc2MoXCJQcmVmaXggbWF0Y2ggcGF0aCBwYXR0ZXJucyB0byBpbmNsdWRlIGZpbGVzLlwiKVxuICAgICAgICAuYWRkVGV4dEFyZWEoKHRhYykgPT4ge1xuICAgICAgICAgIGNvbnN0IGVsID0gdGFjXG4gICAgICAgICAgICAuc2V0VmFsdWUoXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmluY2x1ZGVDdXJyZW50VmF1bHRQYXRoUHJlZml4UGF0dGVybnNcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlByaXZhdGUvXCIpXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmluY2x1ZGVDdXJyZW50VmF1bHRQYXRoUHJlZml4UGF0dGVybnMgPVxuICAgICAgICAgICAgICAgIHZhbHVlO1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsLmlucHV0RWwuY2xhc3NOYW1lID1cbiAgICAgICAgICAgIFwidmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX3RleHQtYXJlYS1wYXRoXCI7XG4gICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9KTtcbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAuc2V0TmFtZShcIkV4Y2x1ZGUgcHJlZml4IHBhdGggcGF0dGVybnNcIilcbiAgICAgICAgLnNldERlc2MoXCJQcmVmaXggbWF0Y2ggcGF0aCBwYXR0ZXJucyB0byBleGNsdWRlIGZpbGVzLlwiKVxuICAgICAgICAuYWRkVGV4dEFyZWEoKHRhYykgPT4ge1xuICAgICAgICAgIGNvbnN0IGVsID0gdGFjXG4gICAgICAgICAgICAuc2V0VmFsdWUoXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmV4Y2x1ZGVDdXJyZW50VmF1bHRQYXRoUHJlZml4UGF0dGVybnNcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlByaXZhdGUvXCIpXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmV4Y2x1ZGVDdXJyZW50VmF1bHRQYXRoUHJlZml4UGF0dGVybnMgPVxuICAgICAgICAgICAgICAgIHZhbHVlO1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsLmlucHV0RWwuY2xhc3NOYW1lID1cbiAgICAgICAgICAgIFwidmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX3RleHQtYXJlYS1wYXRoXCI7XG4gICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9KTtcbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAuc2V0TmFtZShcIkluY2x1ZGUgb25seSBmaWxlcyB1bmRlciBjdXJyZW50IGRpcmVjdG9yeVwiKVxuICAgICAgICAuYWRkVG9nZ2xlKCh0YykgPT4ge1xuICAgICAgICAgIHRjLnNldFZhbHVlKFxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3NcbiAgICAgICAgICAgICAgLmluY2x1ZGVDdXJyZW50VmF1bHRPbmx5RmlsZXNVbmRlckN1cnJlbnREaXJlY3RvcnlcbiAgICAgICAgICApLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaW5jbHVkZUN1cnJlbnRWYXVsdE9ubHlGaWxlc1VuZGVyQ3VycmVudERpcmVjdG9yeSA9XG4gICAgICAgICAgICAgIHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkQ3VzdG9tRGljdGlvbmFyeUNvbXBsZW1lbnRTZXR0aW5ncyhjb250YWluZXJFbDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgzXCIsIHtcbiAgICAgIHRleHQ6IFwiQ3VzdG9tIGRpY3Rpb25hcnkgY29tcGxlbWVudFwiLFxuICAgICAgY2xzOiBcInZhcmlvdXMtY29tcGxlbWVudHNfX3NldHRpbmdzX19oZWFkZXIgdmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX2hlYWRlcl9fY3VzdG9tLWRpY3Rpb25hcnlcIixcbiAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJFbmFibGUgQ3VzdG9tIGRpY3Rpb25hcnkgY29tcGxlbWVudFwiKVxuICAgICAgLmFkZFRvZ2dsZSgodGMpID0+IHtcbiAgICAgICAgdGMuc2V0VmFsdWUoXG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlQ3VzdG9tRGljdGlvbmFyeUNvbXBsZW1lbnRcbiAgICAgICAgKS5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVDdXN0b21EaWN0aW9uYXJ5Q29tcGxlbWVudCA9IHZhbHVlO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncyh7IGN1c3RvbURpY3Rpb25hcnk6IHRydWUgfSk7XG4gICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICBpZiAodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlQ3VzdG9tRGljdGlvbmFyeUNvbXBsZW1lbnQpIHtcbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAuc2V0TmFtZShcIkN1c3RvbSBkaWN0aW9uYXJ5IHBhdGhzXCIpXG4gICAgICAgIC5zZXREZXNjKFxuICAgICAgICAgIFwiU3BlY2lmeSBlaXRoZXIgYSByZWxhdGl2ZSBwYXRoIGZyb20gVmF1bHQgcm9vdCBvciBVUkwgZm9yIGVhY2ggbGluZS5cIlxuICAgICAgICApXG4gICAgICAgIC5hZGRUZXh0QXJlYSgodGFjKSA9PiB7XG4gICAgICAgICAgY29uc3QgZWwgPSB0YWNcbiAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jdXN0b21EaWN0aW9uYXJ5UGF0aHMpXG4gICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJkaWN0aW9uYXJ5Lm1kXCIpXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmN1c3RvbURpY3Rpb25hcnlQYXRocyA9IHZhbHVlO1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsLmlucHV0RWwuY2xhc3NOYW1lID1cbiAgICAgICAgICAgIFwidmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX3RleHQtYXJlYS1wYXRoXCI7XG4gICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9KTtcblxuICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJDb2x1bW4gZGVsaW1pdGVyXCIpLmFkZERyb3Bkb3duKCh0YykgPT5cbiAgICAgICAgdGNcbiAgICAgICAgICAuYWRkT3B0aW9ucyhtaXJyb3JNYXAoQ29sdW1uRGVsaW1pdGVyLnZhbHVlcygpLCAoeCkgPT4geC5uYW1lKSlcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY29sdW1uRGVsaW1pdGVyKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbHVtbkRlbGltaXRlciA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAuc2V0TmFtZShcIldvcmQgcmVnZXggcGF0dGVyblwiKVxuICAgICAgICAuc2V0RGVzYyhcIk9ubHkgbG9hZCB3b3JkcyB0aGF0IG1hdGNoIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gcGF0dGVybi5cIilcbiAgICAgICAgLmFkZFRleHQoKGNiKSA9PiB7XG4gICAgICAgICAgY2Iuc2V0VmFsdWUoXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jdXN0b21EaWN0aW9uYXJ5V29yZFJlZ2V4UGF0dGVyblxuICAgICAgICAgICkub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jdXN0b21EaWN0aW9uYXJ5V29yZFJlZ2V4UGF0dGVybiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgLnNldE5hbWUoXCJEZWxpbWl0ZXIgdG8gaGlkZSBhIHN1Z2dlc3Rpb25cIilcbiAgICAgICAgLnNldERlc2MoXG4gICAgICAgICAgXCJJZiBzZXQgJzs7OycsICdhYmNkOzs7ZWZnJyBpcyBzaG93biBhcyAnYWJjZCcgb24gc3VnZ2VzdGlvbnMsIGJ1dCBjb21wbGV0ZXMgdG8gJ2FiY2RlZmcnLlwiXG4gICAgICAgIClcbiAgICAgICAgLmFkZFRleHQoKGNiKSA9PiB7XG4gICAgICAgICAgY2Iuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsaW1pdGVyVG9IaWRlU3VnZ2VzdGlvbikub25DaGFuZ2UoXG4gICAgICAgICAgICBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsaW1pdGVyVG9IaWRlU3VnZ2VzdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgIC5zZXROYW1lKFxuICAgICAgICAgIFwiRGVsaW1pdGVyIHRvIGRpdmlkZSBzdWdnZXN0aW9ucyBmb3IgZGlzcGxheSBmcm9tIG9uZXMgZm9yIGluc2VydGlvblwiXG4gICAgICAgIClcbiAgICAgICAgLnNldERlc2MoXG4gICAgICAgICAgXCJJZiBzZXQgJyA+Pj4gJywgJ2Rpc3BsYXllZCA+Pj4gaW5zZXJ0ZWQnIGlzIHNob3duIGFzICdkaXNwbGF5ZWQnIG9uIHN1Z2dlc3Rpb25zLCBidXQgY29tcGxldGVzIHRvICdpbnNlcnRlZCcuXCJcbiAgICAgICAgKVxuICAgICAgICAuYWRkVGV4dCgoY2IpID0+IHtcbiAgICAgICAgICBjYi5zZXRWYWx1ZShcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzXG4gICAgICAgICAgICAgIC5kZWxpbWl0ZXJUb0RpdmlkZVN1Z2dlc3Rpb25zRm9yRGlzcGxheUZyb21JbnNlcnRpb25cbiAgICAgICAgICApLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsaW1pdGVyVG9EaXZpZGVTdWdnZXN0aW9uc0ZvckRpc3BsYXlGcm9tSW5zZXJ0aW9uID1cbiAgICAgICAgICAgICAgdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAuc2V0TmFtZShcIkNhcmV0IGxvY2F0aW9uIHN5bWJvbCBhZnRlciBjb21wbGVtZW50XCIpXG4gICAgICAgIC5zZXREZXNjKFxuICAgICAgICAgIFwiSWYgc2V0ICc8Q0FSRVQ+JyBhbmQgdGhlcmUgaXMgJzxsaT48Q0FSRVQ+PC9saT4nIGluIGN1c3RvbSBkaWN0aW9uYXJ5LCBpdCBjb21wbGVtZW50cyAnPGxpPjwvbGk+JyBhbmQgbW92ZSBhIGNhcmV0IHdoZXJlIGJldHdlZW4gJzxsaT4nIGFuZCBgPC9saT5gLlwiXG4gICAgICAgIClcbiAgICAgICAgLmFkZFRleHQoKGNiKSA9PiB7XG4gICAgICAgICAgY2Iuc2V0VmFsdWUoXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYXJldExvY2F0aW9uU3ltYm9sQWZ0ZXJDb21wbGVtZW50XG4gICAgICAgICAgKS5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNhcmV0TG9jYXRpb25TeW1ib2xBZnRlckNvbXBsZW1lbnQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgIC5zZXROYW1lKFwiRGlzcGxheWVkIHRleHQgc3VmZml4XCIpXG4gICAgICAgIC5zZXREZXNjKFxuICAgICAgICAgIFwiSXQgc2hvd3MgYXMgYSBzdWZmaXggb2YgZGlzcGxheWVkIHRleHQgaWYgdGhlcmUgaXMgYSBkaWZmZXJlbmNlIGJldHdlZW4gZGlzcGxheWVkIGFuZCBpbnNlcnRlZFwiXG4gICAgICAgIClcbiAgICAgICAgLmFkZFRleHQoKGNiKSA9PiB7XG4gICAgICAgICAgY2Iuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGlzcGxheWVkVGV4dFN1ZmZpeCkub25DaGFuZ2UoXG4gICAgICAgICAgICBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGlzcGxheWVkVGV4dFN1ZmZpeCA9IHZhbHVlO1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkZEludGVybmFsTGlua0NvbXBsZW1lbnRTZXR0aW5ncyhjb250YWluZXJFbDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgzXCIsIHtcbiAgICAgIHRleHQ6IFwiSW50ZXJuYWwgbGluayBjb21wbGVtZW50XCIsXG4gICAgICBjbHM6IFwidmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX2hlYWRlciB2YXJpb3VzLWNvbXBsZW1lbnRzX19zZXR0aW5nc19faGVhZGVyX19pbnRlcm5hbC1saW5rXCIsXG4gICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiRW5hYmxlIEludGVybmFsIGxpbmsgY29tcGxlbWVudFwiKVxuICAgICAgLmFkZFRvZ2dsZSgodGMpID0+IHtcbiAgICAgICAgdGMuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlSW50ZXJuYWxMaW5rQ29tcGxlbWVudCkub25DaGFuZ2UoXG4gICAgICAgICAgYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVJbnRlcm5hbExpbmtDb21wbGVtZW50ID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoeyBpbnRlcm5hbExpbms6IHRydWUgfSk7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgIGlmICh0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVJbnRlcm5hbExpbmtDb21wbGVtZW50KSB7XG4gICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgLnNldE5hbWUoXCJTdWdnZXN0IHdpdGggYW4gYWxpYXNcIilcbiAgICAgICAgLmFkZFRvZ2dsZSgodGMpID0+IHtcbiAgICAgICAgICB0Yy5zZXRWYWx1ZShcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN1Z2dlc3RJbnRlcm5hbExpbmtXaXRoQWxpYXNcbiAgICAgICAgICApLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3VnZ2VzdEludGVybmFsTGlua1dpdGhBbGlhcyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKHsgaW50ZXJuYWxMaW5rOiB0cnVlIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAuc2V0TmFtZShcIkV4Y2x1ZGUgcHJlZml4IHBhdGggcGF0dGVybnNcIilcbiAgICAgICAgLnNldERlc2MoXCJQcmVmaXggbWF0Y2ggcGF0aCBwYXR0ZXJucyB0byBleGNsdWRlIGZpbGVzLlwiKVxuICAgICAgICAuYWRkVGV4dEFyZWEoKHRhYykgPT4ge1xuICAgICAgICAgIGNvbnN0IGVsID0gdGFjXG4gICAgICAgICAgICAuc2V0VmFsdWUoXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmV4Y2x1ZGVJbnRlcm5hbExpbmtQYXRoUHJlZml4UGF0dGVybnNcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlByaXZhdGUvXCIpXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmV4Y2x1ZGVJbnRlcm5hbExpbmtQYXRoUHJlZml4UGF0dGVybnMgPVxuICAgICAgICAgICAgICAgIHZhbHVlO1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsLmlucHV0RWwuY2xhc3NOYW1lID1cbiAgICAgICAgICAgIFwidmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX3RleHQtYXJlYS1wYXRoXCI7XG4gICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkZEZyb250TWF0dGVyQ29tcGxlbWVudFNldHRpbmdzKGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDNcIiwge1xuICAgICAgdGV4dDogXCJGcm9udCBtYXR0ZXIgY29tcGxlbWVudFwiLFxuICAgICAgY2xzOiBcInZhcmlvdXMtY29tcGxlbWVudHNfX3NldHRpbmdzX19oZWFkZXIgdmFyaW91cy1jb21wbGVtZW50c19fc2V0dGluZ3NfX2hlYWRlcl9fZnJvbnQtbWF0dGVyXCIsXG4gICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiRW5hYmxlIEZyb250IG1hdHRlciBjb21wbGVtZW50XCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0YykgPT4ge1xuICAgICAgICB0Yy5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVGcm9udE1hdHRlckNvbXBsZW1lbnQpLm9uQ2hhbmdlKFxuICAgICAgICAgIGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlRnJvbnRNYXR0ZXJDb21wbGVtZW50ID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoeyBmcm9udE1hdHRlcjogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgaWYgKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZUZyb250TWF0dGVyQ29tcGxlbWVudCkge1xuICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgIC5zZXROYW1lKFwiTWF0Y2ggc3RyYXRlZ3kgaW4gdGhlIGZyb250IG1hdHRlclwiKVxuICAgICAgICAuYWRkRHJvcGRvd24oKHRjKSA9PlxuICAgICAgICAgIHRjXG4gICAgICAgICAgICAuYWRkT3B0aW9ucyhcbiAgICAgICAgICAgICAgbWlycm9yTWFwKFNwZWNpZmljTWF0Y2hTdHJhdGVneS52YWx1ZXMoKSwgKHgpID0+IHgubmFtZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5mcm9udE1hdHRlckNvbXBsZW1lbnRNYXRjaFN0cmF0ZWd5KVxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5mcm9udE1hdHRlckNvbXBsZW1lbnRNYXRjaFN0cmF0ZWd5ID0gdmFsdWU7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgIC5zZXROYW1lKFwiSW5zZXJ0IGNvbW1hIGFmdGVyIGNvbXBsZXRpb25cIilcbiAgICAgICAgLmFkZFRvZ2dsZSgodGMpID0+IHtcbiAgICAgICAgICB0Yy5zZXRWYWx1ZShcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmluc2VydENvbW1hQWZ0ZXJGcm9udE1hdHRlckNvbXBsZXRpb25cbiAgICAgICAgICApLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaW5zZXJ0Q29tbWFBZnRlckZyb250TWF0dGVyQ29tcGxldGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkSW50ZWxsaWdlbnRTdWdnZXN0aW9uUHJpb3JpdGl6YXRpb25TZXR0aW5ncyhcbiAgICBjb250YWluZXJFbDogSFRNTEVsZW1lbnRcbiAgKSB7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoM1wiLCB7XG4gICAgICB0ZXh0OiBcIkludGVsbGlnZW50IHN1Z2dlc3Rpb24gcHJpb3JpdGl6YXRpb25cIixcbiAgICAgIGNsczogXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19zZXR0aW5nc19faGVhZGVyIHZhcmlvdXMtY29tcGxlbWVudHNfX3NldHRpbmdzX19oZWFkZXJfX2ludGVsbGlnZW50LXN1Z2dlc3Rpb24tcHJpb3JpdGl6YXRpb25cIixcbiAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJNYXggZGF5cyB0byBrZWVwIGhpc3RvcnlcIilcbiAgICAgIC5zZXREZXNjKFwiSWYgc2V0IDAsIGl0IHdpbGwgbmV2ZXIgcmVtb3ZlXCIpXG4gICAgICAuYWRkU2xpZGVyKChzYykgPT5cbiAgICAgICAgc2NcbiAgICAgICAgICAuc2V0TGltaXRzKDAsIDM2NSwgMSlcbiAgICAgICAgICAuc2V0VmFsdWUoXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5pbnRlbGxpZ2VudFN1Z2dlc3Rpb25Qcmlvcml0aXphdGlvblxuICAgICAgICAgICAgICAubWF4RGF5c1RvS2VlcEhpc3RvcnlcbiAgICAgICAgICApXG4gICAgICAgICAgLnNldER5bmFtaWNUb29sdGlwKClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5pbnRlbGxpZ2VudFN1Z2dlc3Rpb25Qcmlvcml0aXphdGlvbi5tYXhEYXlzVG9LZWVwSGlzdG9yeSA9XG4gICAgICAgICAgICAgIHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiTWF4IG51bWJlciBvZiBoaXN0b3J5IHRvIGtlZXBcIilcbiAgICAgIC5zZXREZXNjKFwiSWYgc2V0IDAsIGl0IHdpbGwgbmV2ZXIgcmVtb3ZlXCIpXG4gICAgICAuYWRkU2xpZGVyKChzYykgPT5cbiAgICAgICAgc2NcbiAgICAgICAgICAuc2V0TGltaXRzKDAsIDEwMDAwLCAxKVxuICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmludGVsbGlnZW50U3VnZ2VzdGlvblByaW9yaXRpemF0aW9uXG4gICAgICAgICAgICAgIC5tYXhOdW1iZXJPZkhpc3RvcnlUb0tlZXBcbiAgICAgICAgICApXG4gICAgICAgICAgLnNldER5bmFtaWNUb29sdGlwKClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5pbnRlbGxpZ2VudFN1Z2dlc3Rpb25Qcmlvcml0aXphdGlvbi5tYXhOdW1iZXJPZkhpc3RvcnlUb0tlZXAgPVxuICAgICAgICAgICAgICB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGREZWJ1Z1NldHRpbmdzKGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIkRlYnVnXCIgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiU2hvdyBsb2cgYWJvdXQgcGVyZm9ybWFuY2UgaW4gYSBjb25zb2xlXCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0YykgPT4ge1xuICAgICAgICB0Yy5zZXRWYWx1ZShcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaG93TG9nQWJvdXRQZXJmb3JtYW5jZUluQ29uc29sZVxuICAgICAgICApLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dMb2dBYm91dFBlcmZvcm1hbmNlSW5Db25zb2xlID0gdmFsdWU7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBhc3luYyB0b2dnbGVNYXRjaFN0cmF0ZWd5KCkge1xuICAgIHN3aXRjaCAodGhpcy5wbHVnaW4uc2V0dGluZ3MubWF0Y2hTdHJhdGVneSkge1xuICAgICAgY2FzZSBcInByZWZpeFwiOlxuICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5tYXRjaFN0cmF0ZWd5ID0gXCJwYXJ0aWFsXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInBhcnRpYWxcIjpcbiAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubWF0Y2hTdHJhdGVneSA9IFwicHJlZml4XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gbm9pbnNwZWN0aW9uIE9iamVjdEFsbG9jYXRpb25JZ25vcmVkXG4gICAgICAgIG5ldyBOb3RpY2UoXCLimqBVbmV4cGVjdGVkIGVycm9yXCIpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgfVxuXG4gIGFzeW5jIHRvZ2dsZUNvbXBsZW1lbnRBdXRvbWF0aWNhbGx5KCkge1xuICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbXBsZW1lbnRBdXRvbWF0aWNhbGx5ID1cbiAgICAgICF0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb21wbGVtZW50QXV0b21hdGljYWxseTtcbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgfVxuXG4gIGFzeW5jIGVuc3VyZUN1c3RvbURpY3Rpb25hcnlQYXRoKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBzdGF0ZTogXCJwcmVzZW50XCIgfCBcImFic2VudFwiXG4gICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHBhdGhzID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuY3VzdG9tRGljdGlvbmFyeVBhdGhzLnNwbGl0KFwiXFxuXCIpO1xuICAgIGNvbnN0IGV4aXN0cyA9IHBhdGhzLnNvbWUoKHgpID0+IHggPT09IHBhdGgpO1xuICAgIGlmICgoZXhpc3RzICYmIHN0YXRlID09PSBcInByZXNlbnRcIikgfHwgKCFleGlzdHMgJiYgc3RhdGUgPT09IFwiYWJzZW50XCIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3UGF0aHMgPVxuICAgICAgc3RhdGUgPT09IFwicHJlc2VudFwiID8gWy4uLnBhdGhzLCBwYXRoXSA6IHBhdGhzLmZpbHRlcigoeCkgPT4geCAhPT0gcGF0aCk7XG4gICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY3VzdG9tRGljdGlvbmFyeVBhdGhzID0gbmV3UGF0aHMuam9pbihcIlxcblwiKTtcbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoeyBjdXN0b21EaWN0aW9uYXJ5OiB0cnVlIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXRQbHVnaW5TZXR0aW5nc0FzSnNvblN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShcbiAgICAgIHtcbiAgICAgICAgdmVyc2lvbjogdGhpcy5wbHVnaW4ubWFuaWZlc3QudmVyc2lvbixcbiAgICAgICAgbW9iaWxlOiAodGhpcy5hcHAgYXMgYW55KS5pc01vYmlsZSxcbiAgICAgICAgc2V0dGluZ3M6IHsgLi4udGhpcy5wbHVnaW4uc2V0dGluZ3MsIHNlbGVjdGlvbkhpc3RvcnlUcmVlOiBudWxsIH0sXG4gICAgICB9LFxuICAgICAgbnVsbCxcbiAgICAgIDRcbiAgICApO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IE1hdGNoU3RyYXRlZ3kgfSBmcm9tIFwiLi4vcHJvdmlkZXIvTWF0Y2hTdHJhdGVneVwiO1xuXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJTdGF0dXNCYXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgY3VycmVudEZpbGU6IEhUTUxFbGVtZW50IHwgbnVsbCxcbiAgICBwdWJsaWMgY3VycmVudFZhdWx0OiBIVE1MRWxlbWVudCB8IG51bGwsXG4gICAgcHVibGljIGN1c3RvbURpY3Rpb25hcnk6IEhUTUxFbGVtZW50IHwgbnVsbCxcbiAgICBwdWJsaWMgaW50ZXJuYWxMaW5rOiBIVE1MRWxlbWVudCB8IG51bGwsXG4gICAgcHVibGljIGZyb250TWF0dGVyOiBIVE1MRWxlbWVudCB8IG51bGwsXG4gICAgcHVibGljIG1hdGNoU3RyYXRlZ3k6IEhUTUxFbGVtZW50IHwgbnVsbCxcbiAgICBwdWJsaWMgY29tcGxlbWVudEF1dG9tYXRpY2FsbHk6IEhUTUxFbGVtZW50IHwgbnVsbFxuICApIHt9XG5cbiAgc3RhdGljIG5ldyhcbiAgICBzdGF0dXNCYXI6IEhUTUxFbGVtZW50LFxuICAgIHNob3dNYXRjaFN0cmF0ZWd5OiBib29sZWFuLFxuICAgIHNob3dJbmRleGluZ1N0YXR1czogYm9vbGVhbixcbiAgICBzaG93Q29tcGxlbWVudEF1dG9tYXRpY2FsbHk6IGJvb2xlYW5cbiAgKTogUHJvdmlkZXJTdGF0dXNCYXIge1xuICAgIGNvbnN0IGN1cnJlbnRGaWxlID0gc2hvd0luZGV4aW5nU3RhdHVzXG4gICAgICA/IHN0YXR1c0Jhci5jcmVhdGVFbChcInNwYW5cIiwge1xuICAgICAgICAgIHRleHQ6IFwiLS0tXCIsXG4gICAgICAgICAgY2xzOiBcInZhcmlvdXMtY29tcGxlbWVudHNfX2Zvb3RlciB2YXJpb3VzLWNvbXBsZW1lbnRzX19mb290ZXJfX2N1cnJlbnQtZmlsZVwiLFxuICAgICAgICB9KVxuICAgICAgOiBudWxsO1xuICAgIGNvbnN0IGN1cnJlbnRWYXVsdCA9IHNob3dJbmRleGluZ1N0YXR1c1xuICAgICAgPyBzdGF0dXNCYXIuY3JlYXRlRWwoXCJzcGFuXCIsIHtcbiAgICAgICAgICB0ZXh0OiBcIi0tLVwiLFxuICAgICAgICAgIGNsczogXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19mb290ZXIgdmFyaW91cy1jb21wbGVtZW50c19fZm9vdGVyX19jdXJyZW50LXZhdWx0XCIsXG4gICAgICAgIH0pXG4gICAgICA6IG51bGw7XG4gICAgY29uc3QgY3VzdG9tRGljdGlvbmFyeSA9IHNob3dJbmRleGluZ1N0YXR1c1xuICAgICAgPyBzdGF0dXNCYXIuY3JlYXRlRWwoXCJzcGFuXCIsIHtcbiAgICAgICAgICB0ZXh0OiBcIi0tLVwiLFxuICAgICAgICAgIGNsczogXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19mb290ZXIgdmFyaW91cy1jb21wbGVtZW50c19fZm9vdGVyX19jdXN0b20tZGljdGlvbmFyeVwiLFxuICAgICAgICB9KVxuICAgICAgOiBudWxsO1xuICAgIGNvbnN0IGludGVybmFsTGluayA9IHNob3dJbmRleGluZ1N0YXR1c1xuICAgICAgPyBzdGF0dXNCYXIuY3JlYXRlRWwoXCJzcGFuXCIsIHtcbiAgICAgICAgICB0ZXh0OiBcIi0tLVwiLFxuICAgICAgICAgIGNsczogXCJ2YXJpb3VzLWNvbXBsZW1lbnRzX19mb290ZXIgdmFyaW91cy1jb21wbGVtZW50c19fZm9vdGVyX19pbnRlcm5hbC1saW5rXCIsXG4gICAgICAgIH0pXG4gICAgICA6IG51bGw7XG4gICAgY29uc3QgZnJvbnRNYXR0ZXIgPSBzaG93SW5kZXhpbmdTdGF0dXNcbiAgICAgID8gc3RhdHVzQmFyLmNyZWF0ZUVsKFwic3BhblwiLCB7XG4gICAgICAgICAgdGV4dDogXCItLS1cIixcbiAgICAgICAgICBjbHM6IFwidmFyaW91cy1jb21wbGVtZW50c19fZm9vdGVyIHZhcmlvdXMtY29tcGxlbWVudHNfX2Zvb3Rlcl9fZnJvbnQtbWF0dGVyXCIsXG4gICAgICAgIH0pXG4gICAgICA6IG51bGw7XG5cbiAgICBjb25zdCBtYXRjaFN0cmF0ZWd5ID0gc2hvd01hdGNoU3RyYXRlZ3lcbiAgICAgID8gc3RhdHVzQmFyLmNyZWF0ZUVsKFwic3BhblwiLCB7XG4gICAgICAgICAgdGV4dDogXCItLS1cIixcbiAgICAgICAgICBjbHM6IFwidmFyaW91cy1jb21wbGVtZW50c19fZm9vdGVyIHZhcmlvdXMtY29tcGxlbWVudHNfX2Zvb3Rlcl9fbWF0Y2gtc3RyYXRlZ3lcIixcbiAgICAgICAgfSlcbiAgICAgIDogbnVsbDtcblxuICAgIGNvbnN0IGNvbXBsZW1lbnRBdXRvbWF0aWNhbGx5ID0gc2hvd0NvbXBsZW1lbnRBdXRvbWF0aWNhbGx5XG4gICAgICA/IHN0YXR1c0Jhci5jcmVhdGVFbChcInNwYW5cIiwge1xuICAgICAgICAgIHRleHQ6IFwiLS0tXCIsXG4gICAgICAgICAgY2xzOiBcInZhcmlvdXMtY29tcGxlbWVudHNfX2Zvb3RlciB2YXJpb3VzLWNvbXBsZW1lbnRzX19mb290ZXJfX2NvbXBsZW1lbnQtYXV0b21hdGljYWxseVwiLFxuICAgICAgICB9KVxuICAgICAgOiBudWxsO1xuXG4gICAgcmV0dXJuIG5ldyBQcm92aWRlclN0YXR1c0JhcihcbiAgICAgIGN1cnJlbnRGaWxlLFxuICAgICAgY3VycmVudFZhdWx0LFxuICAgICAgY3VzdG9tRGljdGlvbmFyeSxcbiAgICAgIGludGVybmFsTGluayxcbiAgICAgIGZyb250TWF0dGVyLFxuICAgICAgbWF0Y2hTdHJhdGVneSxcbiAgICAgIGNvbXBsZW1lbnRBdXRvbWF0aWNhbGx5XG4gICAgKTtcbiAgfVxuXG4gIHNldE9uQ2xpY2tTdHJhdGVneUxpc3RlbmVyKGxpc3RlbmVyOiAoKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5tYXRjaFN0cmF0ZWd5Py5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbGlzdGVuZXIpO1xuICB9XG4gIHNldE9uQ2xpY2tDb21wbGVtZW50QXV0b21hdGljYWxseShsaXN0ZW5lcjogKCkgPT4gdm9pZCkge1xuICAgIHRoaXMuY29tcGxlbWVudEF1dG9tYXRpY2FsbHk/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBsaXN0ZW5lcik7XG4gIH1cblxuICBzZXRDdXJyZW50RmlsZURpc2FibGVkKCkge1xuICAgIHRoaXMuY3VycmVudEZpbGU/LnNldFRleHQoXCItLS1cIik7XG4gIH1cbiAgc2V0Q3VycmVudFZhdWx0RGlzYWJsZWQoKSB7XG4gICAgdGhpcy5jdXJyZW50VmF1bHQ/LnNldFRleHQoXCItLS1cIik7XG4gIH1cbiAgc2V0Q3VzdG9tRGljdGlvbmFyeURpc2FibGVkKCkge1xuICAgIHRoaXMuY3VzdG9tRGljdGlvbmFyeT8uc2V0VGV4dChcIi0tLVwiKTtcbiAgfVxuICBzZXRJbnRlcm5hbExpbmtEaXNhYmxlZCgpIHtcbiAgICB0aGlzLmludGVybmFsTGluaz8uc2V0VGV4dChcIi0tLVwiKTtcbiAgfVxuICBzZXRGcm9udE1hdHRlckRpc2FibGVkKCkge1xuICAgIHRoaXMuZnJvbnRNYXR0ZXI/LnNldFRleHQoXCItLS1cIik7XG4gIH1cblxuICBzZXRDdXJyZW50RmlsZUluZGV4aW5nKCkge1xuICAgIHRoaXMuY3VycmVudEZpbGU/LnNldFRleHQoXCJpbmRleGluZy4uLlwiKTtcbiAgfVxuICBzZXRDdXJyZW50VmF1bHRJbmRleGluZygpIHtcbiAgICB0aGlzLmN1cnJlbnRWYXVsdD8uc2V0VGV4dChcImluZGV4aW5nLi4uXCIpO1xuICB9XG4gIHNldEN1c3RvbURpY3Rpb25hcnlJbmRleGluZygpIHtcbiAgICB0aGlzLmN1c3RvbURpY3Rpb25hcnk/LnNldFRleHQoXCJpbmRleGluZy4uLlwiKTtcbiAgfVxuICBzZXRJbnRlcm5hbExpbmtJbmRleGluZygpIHtcbiAgICB0aGlzLmludGVybmFsTGluaz8uc2V0VGV4dChcImluZGV4aW5nLi4uXCIpO1xuICB9XG4gIHNldEZyb250TWF0dGVySW5kZXhpbmcoKSB7XG4gICAgdGhpcy5mcm9udE1hdHRlcj8uc2V0VGV4dChcImluZGV4aW5nLi4uXCIpO1xuICB9XG5cbiAgc2V0Q3VycmVudEZpbGVJbmRleGVkKGNvdW50OiBhbnkpIHtcbiAgICB0aGlzLmN1cnJlbnRGaWxlPy5zZXRUZXh0KFN0cmluZyhjb3VudCkpO1xuICB9XG4gIHNldEN1cnJlbnRWYXVsdEluZGV4ZWQoY291bnQ6IGFueSkge1xuICAgIHRoaXMuY3VycmVudFZhdWx0Py5zZXRUZXh0KFN0cmluZyhjb3VudCkpO1xuICB9XG4gIHNldEN1c3RvbURpY3Rpb25hcnlJbmRleGVkKGNvdW50OiBhbnkpIHtcbiAgICB0aGlzLmN1c3RvbURpY3Rpb25hcnk/LnNldFRleHQoU3RyaW5nKGNvdW50KSk7XG4gIH1cbiAgc2V0SW50ZXJuYWxMaW5rSW5kZXhlZChjb3VudDogYW55KSB7XG4gICAgdGhpcy5pbnRlcm5hbExpbms/LnNldFRleHQoU3RyaW5nKGNvdW50KSk7XG4gIH1cbiAgc2V0RnJvbnRNYXR0ZXJJbmRleGVkKGNvdW50OiBhbnkpIHtcbiAgICB0aGlzLmZyb250TWF0dGVyPy5zZXRUZXh0KFN0cmluZyhjb3VudCkpO1xuICB9XG5cbiAgc2V0TWF0Y2hTdHJhdGVneShzdHJhdGVneTogTWF0Y2hTdHJhdGVneSkge1xuICAgIHRoaXMubWF0Y2hTdHJhdGVneT8uc2V0VGV4dChzdHJhdGVneS5uYW1lKTtcbiAgfVxuICBzZXRDb21wbGVtZW50QXV0b21hdGljYWxseShhdXRvbWF0aWNhbGx5OiBib29sZWFuKSB7XG4gICAgdGhpcy5jb21wbGVtZW50QXV0b21hdGljYWxseT8uc2V0VGV4dChhdXRvbWF0aWNhbGx5ID8gXCJhdXRvXCIgOiBcIm1hbnVhbFwiKTtcbiAgfVxufVxuIiwiZnVuY3Rpb24gbm9vcCgpIHsgfVxuY29uc3QgaWRlbnRpdHkgPSB4ID0+IHg7XG5mdW5jdGlvbiBhc3NpZ24odGFyLCBzcmMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgZm9yIChjb25zdCBrIGluIHNyYylcbiAgICAgICAgdGFyW2tdID0gc3JjW2tdO1xuICAgIHJldHVybiB0YXI7XG59XG5mdW5jdGlvbiBpc19wcm9taXNlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBhZGRfbG9jYXRpb24oZWxlbWVudCwgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyKSB7XG4gICAgZWxlbWVudC5fX3N2ZWx0ZV9tZXRhID0ge1xuICAgICAgICBsb2M6IHsgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gcnVuKGZuKSB7XG4gICAgcmV0dXJuIGZuKCk7XG59XG5mdW5jdGlvbiBibGFua19vYmplY3QoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5mdW5jdGlvbiBydW5fYWxsKGZucykge1xuICAgIGZucy5mb3JFYWNoKHJ1bik7XG59XG5mdW5jdGlvbiBpc19mdW5jdGlvbih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBzYWZlX25vdF9lcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT0gYSA/IGIgPT0gYiA6IGEgIT09IGIgfHwgKChhICYmIHR5cGVvZiBhID09PSAnb2JqZWN0JykgfHwgdHlwZW9mIGEgPT09ICdmdW5jdGlvbicpO1xufVxubGV0IHNyY191cmxfZXF1YWxfYW5jaG9yO1xuZnVuY3Rpb24gc3JjX3VybF9lcXVhbChlbGVtZW50X3NyYywgdXJsKSB7XG4gICAgaWYgKCFzcmNfdXJsX2VxdWFsX2FuY2hvcikge1xuICAgICAgICBzcmNfdXJsX2VxdWFsX2FuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICB9XG4gICAgc3JjX3VybF9lcXVhbF9hbmNob3IuaHJlZiA9IHVybDtcbiAgICByZXR1cm4gZWxlbWVudF9zcmMgPT09IHNyY191cmxfZXF1YWxfYW5jaG9yLmhyZWY7XG59XG5mdW5jdGlvbiBub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiO1xufVxuZnVuY3Rpb24gaXNfZW1wdHkob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVfc3RvcmUoc3RvcmUsIG5hbWUpIHtcbiAgICBpZiAoc3RvcmUgIT0gbnVsbCAmJiB0eXBlb2Ygc3RvcmUuc3Vic2NyaWJlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7bmFtZX0nIGlzIG5vdCBhIHN0b3JlIHdpdGggYSAnc3Vic2NyaWJlJyBtZXRob2RgKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzdWJzY3JpYmUoc3RvcmUsIC4uLmNhbGxiYWNrcykge1xuICAgIGlmIChzdG9yZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBub29wO1xuICAgIH1cbiAgICBjb25zdCB1bnN1YiA9IHN0b3JlLnN1YnNjcmliZSguLi5jYWxsYmFja3MpO1xuICAgIHJldHVybiB1bnN1Yi51bnN1YnNjcmliZSA/ICgpID0+IHVuc3ViLnVuc3Vic2NyaWJlKCkgOiB1bnN1Yjtcbn1cbmZ1bmN0aW9uIGdldF9zdG9yZV92YWx1ZShzdG9yZSkge1xuICAgIGxldCB2YWx1ZTtcbiAgICBzdWJzY3JpYmUoc3RvcmUsIF8gPT4gdmFsdWUgPSBfKSgpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGNvbXBvbmVudF9zdWJzY3JpYmUoY29tcG9uZW50LCBzdG9yZSwgY2FsbGJhY2spIHtcbiAgICBjb21wb25lbnQuJCQub25fZGVzdHJveS5wdXNoKHN1YnNjcmliZShzdG9yZSwgY2FsbGJhY2spKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9zbG90KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvbikge1xuICAgICAgICBjb25zdCBzbG90X2N0eCA9IGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbik7XG4gICAgICAgIHJldHVybiBkZWZpbml0aW9uWzBdKHNsb3RfY3R4KTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jb250ZXh0KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvblsxXSAmJiBmblxuICAgICAgICA/IGFzc2lnbigkJHNjb3BlLmN0eC5zbGljZSgpLCBkZWZpbml0aW9uWzFdKGZuKGN0eCkpKVxuICAgICAgICA6ICQkc2NvcGUuY3R4O1xufVxuZnVuY3Rpb24gZ2V0X3Nsb3RfY2hhbmdlcyhkZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvblsyXSAmJiBmbikge1xuICAgICAgICBjb25zdCBsZXRzID0gZGVmaW5pdGlvblsyXShmbihkaXJ0eSkpO1xuICAgICAgICBpZiAoJCRzY29wZS5kaXJ0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbGV0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGxldHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KCQkc2NvcGUuZGlydHkubGVuZ3RoLCBsZXRzLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbWVyZ2VkW2ldID0gJCRzY29wZS5kaXJ0eVtpXSB8IGxldHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkJHNjb3BlLmRpcnR5IHwgbGV0cztcbiAgICB9XG4gICAgcmV0dXJuICQkc2NvcGUuZGlydHk7XG59XG5mdW5jdGlvbiB1cGRhdGVfc2xvdF9iYXNlKHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBzbG90X2NoYW5nZXMsIGdldF9zbG90X2NvbnRleHRfZm4pIHtcbiAgICBpZiAoc2xvdF9jaGFuZ2VzKSB7XG4gICAgICAgIGNvbnN0IHNsb3RfY29udGV4dCA9IGdldF9zbG90X2NvbnRleHQoc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGdldF9zbG90X2NvbnRleHRfZm4pO1xuICAgICAgICBzbG90LnAoc2xvdF9jb250ZXh0LCBzbG90X2NoYW5nZXMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZV9zbG90KHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbiwgZ2V0X3Nsb3RfY29udGV4dF9mbikge1xuICAgIGNvbnN0IHNsb3RfY2hhbmdlcyA9IGdldF9zbG90X2NoYW5nZXMoc2xvdF9kZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbik7XG4gICAgdXBkYXRlX3Nsb3RfYmFzZShzbG90LCBzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgc2xvdF9jaGFuZ2VzLCBnZXRfc2xvdF9jb250ZXh0X2ZuKTtcbn1cbmZ1bmN0aW9uIGdldF9hbGxfZGlydHlfZnJvbV9zY29wZSgkJHNjb3BlKSB7XG4gICAgaWYgKCQkc2NvcGUuY3R4Lmxlbmd0aCA+IDMyKSB7XG4gICAgICAgIGNvbnN0IGRpcnR5ID0gW107XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9ICQkc2NvcGUuY3R4Lmxlbmd0aCAvIDMyO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkaXJ0eVtpXSA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkaXJ0eTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZnVuY3Rpb24gZXhjbHVkZV9pbnRlcm5hbF9wcm9wcyhwcm9wcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3QgayBpbiBwcm9wcylcbiAgICAgICAgaWYgKGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3VsdFtrXSA9IHByb3BzW2tdO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjb21wdXRlX3Jlc3RfcHJvcHMocHJvcHMsIGtleXMpIHtcbiAgICBjb25zdCByZXN0ID0ge307XG4gICAga2V5cyA9IG5ldyBTZXQoa2V5cyk7XG4gICAgZm9yIChjb25zdCBrIGluIHByb3BzKVxuICAgICAgICBpZiAoIWtleXMuaGFzKGspICYmIGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3Rba10gPSBwcm9wc1trXTtcbiAgICByZXR1cm4gcmVzdDtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVfc2xvdHMoc2xvdHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBzbG90cykge1xuICAgICAgICByZXN1bHRba2V5XSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgbGV0IHJhbiA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAocmFuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByYW4gPSB0cnVlO1xuICAgICAgICBmbi5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH07XG59XG5mdW5jdGlvbiBudWxsX3RvX2VtcHR5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X3N0b3JlX3ZhbHVlKHN0b3JlLCByZXQsIHZhbHVlKSB7XG4gICAgc3RvcmUuc2V0KHZhbHVlKTtcbiAgICByZXR1cm4gcmV0O1xufVxuY29uc3QgaGFzX3Byb3AgPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbmZ1bmN0aW9uIGFjdGlvbl9kZXN0cm95ZXIoYWN0aW9uX3Jlc3VsdCkge1xuICAgIHJldHVybiBhY3Rpb25fcmVzdWx0ICYmIGlzX2Z1bmN0aW9uKGFjdGlvbl9yZXN1bHQuZGVzdHJveSkgPyBhY3Rpb25fcmVzdWx0LmRlc3Ryb3kgOiBub29wO1xufVxuXG5jb25zdCBpc19jbGllbnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbmxldCBub3cgPSBpc19jbGllbnRcbiAgICA/ICgpID0+IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxuICAgIDogKCkgPT4gRGF0ZS5ub3coKTtcbmxldCByYWYgPSBpc19jbGllbnQgPyBjYiA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2IpIDogbm9vcDtcbi8vIHVzZWQgaW50ZXJuYWxseSBmb3IgdGVzdGluZ1xuZnVuY3Rpb24gc2V0X25vdyhmbikge1xuICAgIG5vdyA9IGZuO1xufVxuZnVuY3Rpb24gc2V0X3JhZihmbikge1xuICAgIHJhZiA9IGZuO1xufVxuXG5jb25zdCB0YXNrcyA9IG5ldyBTZXQoKTtcbmZ1bmN0aW9uIHJ1bl90YXNrcyhub3cpIHtcbiAgICB0YXNrcy5mb3JFYWNoKHRhc2sgPT4ge1xuICAgICAgICBpZiAoIXRhc2suYyhub3cpKSB7XG4gICAgICAgICAgICB0YXNrcy5kZWxldGUodGFzayk7XG4gICAgICAgICAgICB0YXNrLmYoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICh0YXNrcy5zaXplICE9PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbn1cbi8qKlxuICogRm9yIHRlc3RpbmcgcHVycG9zZXMgb25seSFcbiAqL1xuZnVuY3Rpb24gY2xlYXJfbG9vcHMoKSB7XG4gICAgdGFza3MuY2xlYXIoKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB0YXNrIHRoYXQgcnVucyBvbiBlYWNoIHJhZiBmcmFtZVxuICogdW50aWwgaXQgcmV0dXJucyBhIGZhbHN5IHZhbHVlIG9yIGlzIGFib3J0ZWRcbiAqL1xuZnVuY3Rpb24gbG9vcChjYWxsYmFjaykge1xuICAgIGxldCB0YXNrO1xuICAgIGlmICh0YXNrcy5zaXplID09PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBuZXcgUHJvbWlzZShmdWxmaWxsID0+IHtcbiAgICAgICAgICAgIHRhc2tzLmFkZCh0YXNrID0geyBjOiBjYWxsYmFjaywgZjogZnVsZmlsbCB9KTtcbiAgICAgICAgfSksXG4gICAgICAgIGFib3J0KCkge1xuICAgICAgICAgICAgdGFza3MuZGVsZXRlKHRhc2spO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuLy8gVHJhY2sgd2hpY2ggbm9kZXMgYXJlIGNsYWltZWQgZHVyaW5nIGh5ZHJhdGlvbi4gVW5jbGFpbWVkIG5vZGVzIGNhbiB0aGVuIGJlIHJlbW92ZWQgZnJvbSB0aGUgRE9NXG4vLyBhdCB0aGUgZW5kIG9mIGh5ZHJhdGlvbiB3aXRob3V0IHRvdWNoaW5nIHRoZSByZW1haW5pbmcgbm9kZXMuXG5sZXQgaXNfaHlkcmF0aW5nID0gZmFsc2U7XG5mdW5jdGlvbiBzdGFydF9oeWRyYXRpbmcoKSB7XG4gICAgaXNfaHlkcmF0aW5nID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGVuZF9oeWRyYXRpbmcoKSB7XG4gICAgaXNfaHlkcmF0aW5nID0gZmFsc2U7XG59XG5mdW5jdGlvbiB1cHBlcl9ib3VuZChsb3csIGhpZ2gsIGtleSwgdmFsdWUpIHtcbiAgICAvLyBSZXR1cm4gZmlyc3QgaW5kZXggb2YgdmFsdWUgbGFyZ2VyIHRoYW4gaW5wdXQgdmFsdWUgaW4gdGhlIHJhbmdlIFtsb3csIGhpZ2gpXG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgICAgY29uc3QgbWlkID0gbG93ICsgKChoaWdoIC0gbG93KSA+PiAxKTtcbiAgICAgICAgaWYgKGtleShtaWQpIDw9IHZhbHVlKSB7XG4gICAgICAgICAgICBsb3cgPSBtaWQgKyAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaGlnaCA9IG1pZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbG93O1xufVxuZnVuY3Rpb24gaW5pdF9oeWRyYXRlKHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQuaHlkcmF0ZV9pbml0KVxuICAgICAgICByZXR1cm47XG4gICAgdGFyZ2V0Lmh5ZHJhdGVfaW5pdCA9IHRydWU7XG4gICAgLy8gV2Uga25vdyB0aGF0IGFsbCBjaGlsZHJlbiBoYXZlIGNsYWltX29yZGVyIHZhbHVlcyBzaW5jZSB0aGUgdW5jbGFpbWVkIGhhdmUgYmVlbiBkZXRhY2hlZCBpZiB0YXJnZXQgaXMgbm90IDxoZWFkPlxuICAgIGxldCBjaGlsZHJlbiA9IHRhcmdldC5jaGlsZE5vZGVzO1xuICAgIC8vIElmIHRhcmdldCBpcyA8aGVhZD4sIHRoZXJlIG1heSBiZSBjaGlsZHJlbiB3aXRob3V0IGNsYWltX29yZGVyXG4gICAgaWYgKHRhcmdldC5ub2RlTmFtZSA9PT0gJ0hFQUQnKSB7XG4gICAgICAgIGNvbnN0IG15Q2hpbGRyZW4gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKG5vZGUuY2xhaW1fb3JkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG15Q2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlbiA9IG15Q2hpbGRyZW47XG4gICAgfVxuICAgIC8qXG4gICAgKiBSZW9yZGVyIGNsYWltZWQgY2hpbGRyZW4gb3B0aW1hbGx5LlxuICAgICogV2UgY2FuIHJlb3JkZXIgY2xhaW1lZCBjaGlsZHJlbiBvcHRpbWFsbHkgYnkgZmluZGluZyB0aGUgbG9uZ2VzdCBzdWJzZXF1ZW5jZSBvZlxuICAgICogbm9kZXMgdGhhdCBhcmUgYWxyZWFkeSBjbGFpbWVkIGluIG9yZGVyIGFuZCBvbmx5IG1vdmluZyB0aGUgcmVzdC4gVGhlIGxvbmdlc3RcbiAgICAqIHN1YnNlcXVlbmNlIHN1YnNlcXVlbmNlIG9mIG5vZGVzIHRoYXQgYXJlIGNsYWltZWQgaW4gb3JkZXIgY2FuIGJlIGZvdW5kIGJ5XG4gICAgKiBjb21wdXRpbmcgdGhlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSBvZiAuY2xhaW1fb3JkZXIgdmFsdWVzLlxuICAgICpcbiAgICAqIFRoaXMgYWxnb3JpdGhtIGlzIG9wdGltYWwgaW4gZ2VuZXJhdGluZyB0aGUgbGVhc3QgYW1vdW50IG9mIHJlb3JkZXIgb3BlcmF0aW9uc1xuICAgICogcG9zc2libGUuXG4gICAgKlxuICAgICogUHJvb2Y6XG4gICAgKiBXZSBrbm93IHRoYXQsIGdpdmVuIGEgc2V0IG9mIHJlb3JkZXJpbmcgb3BlcmF0aW9ucywgdGhlIG5vZGVzIHRoYXQgZG8gbm90IG1vdmVcbiAgICAqIGFsd2F5cyBmb3JtIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2UsIHNpbmNlIHRoZXkgZG8gbm90IG1vdmUgYW1vbmcgZWFjaCBvdGhlclxuICAgICogbWVhbmluZyB0aGF0IHRoZXkgbXVzdCBiZSBhbHJlYWR5IG9yZGVyZWQgYW1vbmcgZWFjaCBvdGhlci4gVGh1cywgdGhlIG1heGltYWxcbiAgICAqIHNldCBvZiBub2RlcyB0aGF0IGRvIG5vdCBtb3ZlIGZvcm0gYSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2UuXG4gICAgKi9cbiAgICAvLyBDb21wdXRlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZVxuICAgIC8vIG06IHN1YnNlcXVlbmNlIGxlbmd0aCBqID0+IGluZGV4IGsgb2Ygc21hbGxlc3QgdmFsdWUgdGhhdCBlbmRzIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2YgbGVuZ3RoIGpcbiAgICBjb25zdCBtID0gbmV3IEludDMyQXJyYXkoY2hpbGRyZW4ubGVuZ3RoICsgMSk7XG4gICAgLy8gUHJlZGVjZXNzb3IgaW5kaWNlcyArIDFcbiAgICBjb25zdCBwID0gbmV3IEludDMyQXJyYXkoY2hpbGRyZW4ubGVuZ3RoKTtcbiAgICBtWzBdID0gLTE7XG4gICAgbGV0IGxvbmdlc3QgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGNoaWxkcmVuW2ldLmNsYWltX29yZGVyO1xuICAgICAgICAvLyBGaW5kIHRoZSBsYXJnZXN0IHN1YnNlcXVlbmNlIGxlbmd0aCBzdWNoIHRoYXQgaXQgZW5kcyBpbiBhIHZhbHVlIGxlc3MgdGhhbiBvdXIgY3VycmVudCB2YWx1ZVxuICAgICAgICAvLyB1cHBlcl9ib3VuZCByZXR1cm5zIGZpcnN0IGdyZWF0ZXIgdmFsdWUsIHNvIHdlIHN1YnRyYWN0IG9uZVxuICAgICAgICAvLyB3aXRoIGZhc3QgcGF0aCBmb3Igd2hlbiB3ZSBhcmUgb24gdGhlIGN1cnJlbnQgbG9uZ2VzdCBzdWJzZXF1ZW5jZVxuICAgICAgICBjb25zdCBzZXFMZW4gPSAoKGxvbmdlc3QgPiAwICYmIGNoaWxkcmVuW21bbG9uZ2VzdF1dLmNsYWltX29yZGVyIDw9IGN1cnJlbnQpID8gbG9uZ2VzdCArIDEgOiB1cHBlcl9ib3VuZCgxLCBsb25nZXN0LCBpZHggPT4gY2hpbGRyZW5bbVtpZHhdXS5jbGFpbV9vcmRlciwgY3VycmVudCkpIC0gMTtcbiAgICAgICAgcFtpXSA9IG1bc2VxTGVuXSArIDE7XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IHNlcUxlbiArIDE7XG4gICAgICAgIC8vIFdlIGNhbiBndWFyYW50ZWUgdGhhdCBjdXJyZW50IGlzIHRoZSBzbWFsbGVzdCB2YWx1ZS4gT3RoZXJ3aXNlLCB3ZSB3b3VsZCBoYXZlIGdlbmVyYXRlZCBhIGxvbmdlciBzZXF1ZW5jZS5cbiAgICAgICAgbVtuZXdMZW5dID0gaTtcbiAgICAgICAgbG9uZ2VzdCA9IE1hdGgubWF4KG5ld0xlbiwgbG9uZ2VzdCk7XG4gICAgfVxuICAgIC8vIFRoZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2Ygbm9kZXMgKGluaXRpYWxseSByZXZlcnNlZClcbiAgICBjb25zdCBsaXMgPSBbXTtcbiAgICAvLyBUaGUgcmVzdCBvZiB0aGUgbm9kZXMsIG5vZGVzIHRoYXQgd2lsbCBiZSBtb3ZlZFxuICAgIGNvbnN0IHRvTW92ZSA9IFtdO1xuICAgIGxldCBsYXN0ID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTtcbiAgICBmb3IgKGxldCBjdXIgPSBtW2xvbmdlc3RdICsgMTsgY3VyICE9IDA7IGN1ciA9IHBbY3VyIC0gMV0pIHtcbiAgICAgICAgbGlzLnB1c2goY2hpbGRyZW5bY3VyIC0gMV0pO1xuICAgICAgICBmb3IgKDsgbGFzdCA+PSBjdXI7IGxhc3QtLSkge1xuICAgICAgICAgICAgdG9Nb3ZlLnB1c2goY2hpbGRyZW5bbGFzdF0pO1xuICAgICAgICB9XG4gICAgICAgIGxhc3QtLTtcbiAgICB9XG4gICAgZm9yICg7IGxhc3QgPj0gMDsgbGFzdC0tKSB7XG4gICAgICAgIHRvTW92ZS5wdXNoKGNoaWxkcmVuW2xhc3RdKTtcbiAgICB9XG4gICAgbGlzLnJldmVyc2UoKTtcbiAgICAvLyBXZSBzb3J0IHRoZSBub2RlcyBiZWluZyBtb3ZlZCB0byBndWFyYW50ZWUgdGhhdCB0aGVpciBpbnNlcnRpb24gb3JkZXIgbWF0Y2hlcyB0aGUgY2xhaW0gb3JkZXJcbiAgICB0b01vdmUuc29ydCgoYSwgYikgPT4gYS5jbGFpbV9vcmRlciAtIGIuY2xhaW1fb3JkZXIpO1xuICAgIC8vIEZpbmFsbHksIHdlIG1vdmUgdGhlIG5vZGVzXG4gICAgZm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgdG9Nb3ZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHdoaWxlIChqIDwgbGlzLmxlbmd0aCAmJiB0b01vdmVbaV0uY2xhaW1fb3JkZXIgPj0gbGlzW2pdLmNsYWltX29yZGVyKSB7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYW5jaG9yID0gaiA8IGxpcy5sZW5ndGggPyBsaXNbal0gOiBudWxsO1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKHRvTW92ZVtpXSwgYW5jaG9yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhcHBlbmQodGFyZ2V0LCBub2RlKSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKG5vZGUpO1xufVxuZnVuY3Rpb24gYXBwZW5kX3N0eWxlcyh0YXJnZXQsIHN0eWxlX3NoZWV0X2lkLCBzdHlsZXMpIHtcbiAgICBjb25zdCBhcHBlbmRfc3R5bGVzX3RvID0gZ2V0X3Jvb3RfZm9yX3N0eWxlKHRhcmdldCk7XG4gICAgaWYgKCFhcHBlbmRfc3R5bGVzX3RvLmdldEVsZW1lbnRCeUlkKHN0eWxlX3NoZWV0X2lkKSkge1xuICAgICAgICBjb25zdCBzdHlsZSA9IGVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIHN0eWxlLmlkID0gc3R5bGVfc2hlZXRfaWQ7XG4gICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgICAgICBhcHBlbmRfc3R5bGVzaGVldChhcHBlbmRfc3R5bGVzX3RvLCBzdHlsZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpIHtcbiAgICBpZiAoIW5vZGUpXG4gICAgICAgIHJldHVybiBkb2N1bWVudDtcbiAgICBjb25zdCByb290ID0gbm9kZS5nZXRSb290Tm9kZSA/IG5vZGUuZ2V0Um9vdE5vZGUoKSA6IG5vZGUub3duZXJEb2N1bWVudDtcbiAgICBpZiAocm9vdCAmJiByb290Lmhvc3QpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgfVxuICAgIHJldHVybiBub2RlLm93bmVyRG9jdW1lbnQ7XG59XG5mdW5jdGlvbiBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldChub2RlKSB7XG4gICAgY29uc3Qgc3R5bGVfZWxlbWVudCA9IGVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgYXBwZW5kX3N0eWxlc2hlZXQoZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpLCBzdHlsZV9lbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGVfZWxlbWVudC5zaGVldDtcbn1cbmZ1bmN0aW9uIGFwcGVuZF9zdHlsZXNoZWV0KG5vZGUsIHN0eWxlKSB7XG4gICAgYXBwZW5kKG5vZGUuaGVhZCB8fCBub2RlLCBzdHlsZSk7XG4gICAgcmV0dXJuIHN0eWxlLnNoZWV0O1xufVxuZnVuY3Rpb24gYXBwZW5kX2h5ZHJhdGlvbih0YXJnZXQsIG5vZGUpIHtcbiAgICBpZiAoaXNfaHlkcmF0aW5nKSB7XG4gICAgICAgIGluaXRfaHlkcmF0ZSh0YXJnZXQpO1xuICAgICAgICBpZiAoKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkID09PSB1bmRlZmluZWQpIHx8ICgodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgIT09IG51bGwpICYmICh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZC5wYXJlbnROb2RlICE9PSB0YXJnZXQpKSkge1xuICAgICAgICAgICAgdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgPSB0YXJnZXQuZmlyc3RDaGlsZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBTa2lwIG5vZGVzIG9mIHVuZGVmaW5lZCBvcmRlcmluZ1xuICAgICAgICB3aGlsZSAoKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkICE9PSBudWxsKSAmJiAodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQuY2xhaW1fb3JkZXIgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkID0gdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUgIT09IHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkKSB7XG4gICAgICAgICAgICAvLyBXZSBvbmx5IGluc2VydCBpZiB0aGUgb3JkZXJpbmcgb2YgdGhpcyBub2RlIHNob3VsZCBiZSBtb2RpZmllZCBvciB0aGUgcGFyZW50IG5vZGUgaXMgbm90IHRhcmdldFxuICAgICAgICAgICAgaWYgKG5vZGUuY2xhaW1fb3JkZXIgIT09IHVuZGVmaW5lZCB8fCBub2RlLnBhcmVudE5vZGUgIT09IHRhcmdldCkge1xuICAgICAgICAgICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUobm9kZSwgdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG5vZGUucGFyZW50Tm9kZSAhPT0gdGFyZ2V0IHx8IG5vZGUubmV4dFNpYmxpbmcgIT09IG51bGwpIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIHRhcmdldC5pbnNlcnRCZWZvcmUobm9kZSwgYW5jaG9yIHx8IG51bGwpO1xufVxuZnVuY3Rpb24gaW5zZXJ0X2h5ZHJhdGlvbih0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIGlmIChpc19oeWRyYXRpbmcgJiYgIWFuY2hvcikge1xuICAgICAgICBhcHBlbmRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG5vZGUucGFyZW50Tm9kZSAhPT0gdGFyZ2V0IHx8IG5vZGUubmV4dFNpYmxpbmcgIT0gYW5jaG9yKSB7XG4gICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUobm9kZSwgYW5jaG9yIHx8IG51bGwpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaChub2RlKSB7XG4gICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xufVxuZnVuY3Rpb24gZGVzdHJveV9lYWNoKGl0ZXJhdGlvbnMsIGRldGFjaGluZykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoaXRlcmF0aW9uc1tpXSlcbiAgICAgICAgICAgIGl0ZXJhdGlvbnNbaV0uZChkZXRhY2hpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGVsZW1lbnQobmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpO1xufVxuZnVuY3Rpb24gZWxlbWVudF9pcyhuYW1lLCBpcykge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUsIHsgaXMgfSk7XG59XG5mdW5jdGlvbiBvYmplY3Rfd2l0aG91dF9wcm9wZXJ0aWVzKG9iaiwgZXhjbHVkZSkge1xuICAgIGNvbnN0IHRhcmdldCA9IHt9O1xuICAgIGZvciAoY29uc3QgayBpbiBvYmopIHtcbiAgICAgICAgaWYgKGhhc19wcm9wKG9iaiwgaylcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICYmIGV4Y2x1ZGUuaW5kZXhPZihrKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHRhcmdldFtrXSA9IG9ialtrXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuZnVuY3Rpb24gc3ZnX2VsZW1lbnQobmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbmFtZSk7XG59XG5mdW5jdGlvbiB0ZXh0KGRhdGEpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSk7XG59XG5mdW5jdGlvbiBzcGFjZSgpIHtcbiAgICByZXR1cm4gdGV4dCgnICcpO1xufVxuZnVuY3Rpb24gZW1wdHkoKSB7XG4gICAgcmV0dXJuIHRleHQoJycpO1xufVxuZnVuY3Rpb24gbGlzdGVuKG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbiAgICByZXR1cm4gKCkgPT4gbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHByZXZlbnRfZGVmYXVsdChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHN0b3BfcHJvcGFnYXRpb24oZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gc2VsZihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzKVxuICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRydXN0ZWQoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZClcbiAgICAgICAgICAgIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICBlbHNlIGlmIChub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSlcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBzZXRfYXR0cmlidXRlcyhub2RlLCBhdHRyaWJ1dGVzKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMobm9kZS5fX3Byb3RvX18pO1xuICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXNba2V5XSA9PSBudWxsKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgICAgbm9kZS5zdHlsZS5jc3NUZXh0ID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ19fdmFsdWUnKSB7XG4gICAgICAgICAgICBub2RlLnZhbHVlID0gbm9kZVtrZXldID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRlc2NyaXB0b3JzW2tleV0gJiYgZGVzY3JpcHRvcnNba2V5XS5zZXQpIHtcbiAgICAgICAgICAgIG5vZGVba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGF0dHIobm9kZSwga2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X3N2Z19hdHRyaWJ1dGVzKG5vZGUsIGF0dHJpYnV0ZXMpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGF0dHIobm9kZSwga2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9jdXN0b21fZWxlbWVudF9kYXRhX21hcChub2RlLCBkYXRhX21hcCkge1xuICAgIE9iamVjdC5rZXlzKGRhdGFfbWFwKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgc2V0X2N1c3RvbV9lbGVtZW50X2RhdGEobm9kZSwga2V5LCBkYXRhX21hcFtrZXldKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIHNldF9jdXN0b21fZWxlbWVudF9kYXRhKG5vZGUsIHByb3AsIHZhbHVlKSB7XG4gICAgaWYgKHByb3AgaW4gbm9kZSkge1xuICAgICAgICBub2RlW3Byb3BdID0gdHlwZW9mIG5vZGVbcHJvcF0gPT09ICdib29sZWFuJyAmJiB2YWx1ZSA9PT0gJycgPyB0cnVlIDogdmFsdWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhdHRyKG5vZGUsIHByb3AsIHZhbHVlKTtcbiAgICB9XG59XG5mdW5jdGlvbiB4bGlua19hdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBub2RlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgYXR0cmlidXRlLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBnZXRfYmluZGluZ19ncm91cF92YWx1ZShncm91cCwgX192YWx1ZSwgY2hlY2tlZCkge1xuICAgIGNvbnN0IHZhbHVlID0gbmV3IFNldCgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ3JvdXAubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGdyb3VwW2ldLmNoZWNrZWQpXG4gICAgICAgICAgICB2YWx1ZS5hZGQoZ3JvdXBbaV0uX192YWx1ZSk7XG4gICAgfVxuICAgIGlmICghY2hlY2tlZCkge1xuICAgICAgICB2YWx1ZS5kZWxldGUoX192YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBBcnJheS5mcm9tKHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHRvX251bWJlcih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gJycgPyBudWxsIDogK3ZhbHVlO1xufVxuZnVuY3Rpb24gdGltZV9yYW5nZXNfdG9fYXJyYXkocmFuZ2VzKSB7XG4gICAgY29uc3QgYXJyYXkgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhcnJheS5wdXNoKHsgc3RhcnQ6IHJhbmdlcy5zdGFydChpKSwgZW5kOiByYW5nZXMuZW5kKGkpIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG59XG5mdW5jdGlvbiBjaGlsZHJlbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5jaGlsZE5vZGVzKTtcbn1cbmZ1bmN0aW9uIGluaXRfY2xhaW1faW5mbyhub2Rlcykge1xuICAgIGlmIChub2Rlcy5jbGFpbV9pbmZvID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbm9kZXMuY2xhaW1faW5mbyA9IHsgbGFzdF9pbmRleDogMCwgdG90YWxfY2xhaW1lZDogMCB9O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsYWltX25vZGUobm9kZXMsIHByZWRpY2F0ZSwgcHJvY2Vzc05vZGUsIGNyZWF0ZU5vZGUsIGRvbnRVcGRhdGVMYXN0SW5kZXggPSBmYWxzZSkge1xuICAgIC8vIFRyeSB0byBmaW5kIG5vZGVzIGluIGFuIG9yZGVyIHN1Y2ggdGhhdCB3ZSBsZW5ndGhlbiB0aGUgbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlXG4gICAgaW5pdF9jbGFpbV9pbmZvKG5vZGVzKTtcbiAgICBjb25zdCByZXN1bHROb2RlID0gKCgpID0+IHtcbiAgICAgICAgLy8gV2UgZmlyc3QgdHJ5IHRvIGZpbmQgYW4gZWxlbWVudCBhZnRlciB0aGUgcHJldmlvdXMgb25lXG4gICAgICAgIGZvciAobGV0IGkgPSBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXg7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShub2RlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gcHJvY2Vzc05vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0gPSByZXBsYWNlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFkb250VXBkYXRlTGFzdEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgd2UgdHJ5IHRvIGZpbmQgb25lIGJlZm9yZVxuICAgICAgICAvLyBXZSBpdGVyYXRlIGluIHJldmVyc2Ugc28gdGhhdCB3ZSBkb24ndCBnbyB0b28gZmFyIGJhY2tcbiAgICAgICAgZm9yIChsZXQgaSA9IG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBwcm9jZXNzTm9kZShub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAocmVwbGFjZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXSA9IHJlcGxhY2VtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWRvbnRVcGRhdGVMYXN0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4ID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVwbGFjZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB3ZSBzcGxpY2VkIGJlZm9yZSB0aGUgbGFzdF9pbmRleCwgd2UgZGVjcmVhc2UgaXRcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4LS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIElmIHdlIGNhbid0IGZpbmQgYW55IG1hdGNoaW5nIG5vZGUsIHdlIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgcmV0dXJuIGNyZWF0ZU5vZGUoKTtcbiAgICB9KSgpO1xuICAgIHJlc3VsdE5vZGUuY2xhaW1fb3JkZXIgPSBub2Rlcy5jbGFpbV9pbmZvLnRvdGFsX2NsYWltZWQ7XG4gICAgbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkICs9IDE7XG4gICAgcmV0dXJuIHJlc3VsdE5vZGU7XG59XG5mdW5jdGlvbiBjbGFpbV9lbGVtZW50X2Jhc2Uobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMsIGNyZWF0ZV9lbGVtZW50KSB7XG4gICAgcmV0dXJuIGNsYWltX25vZGUobm9kZXMsIChub2RlKSA9PiBub2RlLm5vZGVOYW1lID09PSBuYW1lLCAobm9kZSkgPT4ge1xuICAgICAgICBjb25zdCByZW1vdmUgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IG5vZGUuYXR0cmlidXRlc1tqXTtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGUubmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZW1vdmUucHVzaChhdHRyaWJ1dGUubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlLmZvckVhY2godiA9PiBub2RlLnJlbW92ZUF0dHJpYnV0ZSh2KSk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSwgKCkgPT4gY3JlYXRlX2VsZW1lbnQobmFtZSkpO1xufVxuZnVuY3Rpb24gY2xhaW1fZWxlbWVudChub2RlcywgbmFtZSwgYXR0cmlidXRlcykge1xuICAgIHJldHVybiBjbGFpbV9lbGVtZW50X2Jhc2Uobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMsIGVsZW1lbnQpO1xufVxuZnVuY3Rpb24gY2xhaW1fc3ZnX2VsZW1lbnQobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgICByZXR1cm4gY2xhaW1fZWxlbWVudF9iYXNlKG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBzdmdfZWxlbWVudCk7XG59XG5mdW5jdGlvbiBjbGFpbV90ZXh0KG5vZGVzLCBkYXRhKSB7XG4gICAgcmV0dXJuIGNsYWltX25vZGUobm9kZXMsIChub2RlKSA9PiBub2RlLm5vZGVUeXBlID09PSAzLCAobm9kZSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhU3RyID0gJycgKyBkYXRhO1xuICAgICAgICBpZiAobm9kZS5kYXRhLnN0YXJ0c1dpdGgoZGF0YVN0cikpIHtcbiAgICAgICAgICAgIGlmIChub2RlLmRhdGEubGVuZ3RoICE9PSBkYXRhU3RyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub2RlLnNwbGl0VGV4dChkYXRhU3RyLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBub2RlLmRhdGEgPSBkYXRhU3RyO1xuICAgICAgICB9XG4gICAgfSwgKCkgPT4gdGV4dChkYXRhKSwgdHJ1ZSAvLyBUZXh0IG5vZGVzIHNob3VsZCBub3QgdXBkYXRlIGxhc3QgaW5kZXggc2luY2UgaXQgaXMgbGlrZWx5IG5vdCB3b3J0aCBpdCB0byBlbGltaW5hdGUgYW4gaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSBvZiBhY3R1YWwgZWxlbWVudHNcbiAgICApO1xufVxuZnVuY3Rpb24gY2xhaW1fc3BhY2Uobm9kZXMpIHtcbiAgICByZXR1cm4gY2xhaW1fdGV4dChub2RlcywgJyAnKTtcbn1cbmZ1bmN0aW9uIGZpbmRfY29tbWVudChub2RlcywgdGV4dCwgc3RhcnQpIHtcbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBub2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSA4IC8qIGNvbW1lbnQgbm9kZSAqLyAmJiBub2RlLnRleHRDb250ZW50LnRyaW0oKSA9PT0gdGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzLmxlbmd0aDtcbn1cbmZ1bmN0aW9uIGNsYWltX2h0bWxfdGFnKG5vZGVzLCBpc19zdmcpIHtcbiAgICAvLyBmaW5kIGh0bWwgb3BlbmluZyB0YWdcbiAgICBjb25zdCBzdGFydF9pbmRleCA9IGZpbmRfY29tbWVudChub2RlcywgJ0hUTUxfVEFHX1NUQVJUJywgMCk7XG4gICAgY29uc3QgZW5kX2luZGV4ID0gZmluZF9jb21tZW50KG5vZGVzLCAnSFRNTF9UQUdfRU5EJywgc3RhcnRfaW5kZXgpO1xuICAgIGlmIChzdGFydF9pbmRleCA9PT0gZW5kX2luZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgSHRtbFRhZ0h5ZHJhdGlvbih1bmRlZmluZWQsIGlzX3N2Zyk7XG4gICAgfVxuICAgIGluaXRfY2xhaW1faW5mbyhub2Rlcyk7XG4gICAgY29uc3QgaHRtbF90YWdfbm9kZXMgPSBub2Rlcy5zcGxpY2Uoc3RhcnRfaW5kZXgsIGVuZF9pbmRleCAtIHN0YXJ0X2luZGV4ICsgMSk7XG4gICAgZGV0YWNoKGh0bWxfdGFnX25vZGVzWzBdKTtcbiAgICBkZXRhY2goaHRtbF90YWdfbm9kZXNbaHRtbF90YWdfbm9kZXMubGVuZ3RoIC0gMV0pO1xuICAgIGNvbnN0IGNsYWltZWRfbm9kZXMgPSBodG1sX3RhZ19ub2Rlcy5zbGljZSgxLCBodG1sX3RhZ19ub2Rlcy5sZW5ndGggLSAxKTtcbiAgICBmb3IgKGNvbnN0IG4gb2YgY2xhaW1lZF9ub2Rlcykge1xuICAgICAgICBuLmNsYWltX29yZGVyID0gbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkO1xuICAgICAgICBub2Rlcy5jbGFpbV9pbmZvLnRvdGFsX2NsYWltZWQgKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBIdG1sVGFnSHlkcmF0aW9uKGNsYWltZWRfbm9kZXMsIGlzX3N2Zyk7XG59XG5mdW5jdGlvbiBzZXRfZGF0YSh0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC53aG9sZVRleHQgIT09IGRhdGEpXG4gICAgICAgIHRleHQuZGF0YSA9IGRhdGE7XG59XG5mdW5jdGlvbiBzZXRfaW5wdXRfdmFsdWUoaW5wdXQsIHZhbHVlKSB7XG4gICAgaW5wdXQudmFsdWUgPSB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF90eXBlKGlucHV0LCB0eXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaW5wdXQudHlwZSA9IHR5cGU7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfc3R5bGUobm9kZSwga2V5LCB2YWx1ZSwgaW1wb3J0YW50KSB7XG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIG5vZGUuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vZGUuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgaW1wb3J0YW50ID8gJ2ltcG9ydGFudCcgOiAnJyk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2VsZWN0X29wdGlvbihzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgaWYgKG9wdGlvbi5fX3ZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZWxlY3Quc2VsZWN0ZWRJbmRleCA9IC0xOyAvLyBubyBvcHRpb24gc2hvdWxkIGJlIHNlbGVjdGVkXG59XG5mdW5jdGlvbiBzZWxlY3Rfb3B0aW9ucyhzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gfnZhbHVlLmluZGV4T2Yob3B0aW9uLl9fdmFsdWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNlbGVjdF92YWx1ZShzZWxlY3QpIHtcbiAgICBjb25zdCBzZWxlY3RlZF9vcHRpb24gPSBzZWxlY3QucXVlcnlTZWxlY3RvcignOmNoZWNrZWQnKSB8fCBzZWxlY3Qub3B0aW9uc1swXTtcbiAgICByZXR1cm4gc2VsZWN0ZWRfb3B0aW9uICYmIHNlbGVjdGVkX29wdGlvbi5fX3ZhbHVlO1xufVxuZnVuY3Rpb24gc2VsZWN0X211bHRpcGxlX3ZhbHVlKHNlbGVjdCkge1xuICAgIHJldHVybiBbXS5tYXAuY2FsbChzZWxlY3QucXVlcnlTZWxlY3RvckFsbCgnOmNoZWNrZWQnKSwgb3B0aW9uID0+IG9wdGlvbi5fX3ZhbHVlKTtcbn1cbi8vIHVuZm9ydHVuYXRlbHkgdGhpcyBjYW4ndCBiZSBhIGNvbnN0YW50IGFzIHRoYXQgd291bGRuJ3QgYmUgdHJlZS1zaGFrZWFibGVcbi8vIHNvIHdlIGNhY2hlIHRoZSByZXN1bHQgaW5zdGVhZFxubGV0IGNyb3Nzb3JpZ2luO1xuZnVuY3Rpb24gaXNfY3Jvc3NvcmlnaW4oKSB7XG4gICAgaWYgKGNyb3Nzb3JpZ2luID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY3Jvc3NvcmlnaW4gPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdm9pZCB3aW5kb3cucGFyZW50LmRvY3VtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY3Jvc3NvcmlnaW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcm9zc29yaWdpbjtcbn1cbmZ1bmN0aW9uIGFkZF9yZXNpemVfbGlzdGVuZXIobm9kZSwgZm4pIHtcbiAgICBjb25zdCBjb21wdXRlZF9zdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgaWYgKGNvbXB1dGVkX3N0eWxlLnBvc2l0aW9uID09PSAnc3RhdGljJykge1xuICAgICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcbiAgICB9XG4gICAgY29uc3QgaWZyYW1lID0gZWxlbWVudCgnaWZyYW1lJyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTogYmxvY2s7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAwOyBsZWZ0OiAwOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlOyAnICtcbiAgICAgICAgJ292ZXJmbG93OiBoaWRkZW47IGJvcmRlcjogMDsgb3BhY2l0eTogMDsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHotaW5kZXg6IC0xOycpO1xuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICBpZnJhbWUudGFiSW5kZXggPSAtMTtcbiAgICBjb25zdCBjcm9zc29yaWdpbiA9IGlzX2Nyb3Nzb3JpZ2luKCk7XG4gICAgbGV0IHVuc3Vic2NyaWJlO1xuICAgIGlmIChjcm9zc29yaWdpbikge1xuICAgICAgICBpZnJhbWUuc3JjID0gXCJkYXRhOnRleHQvaHRtbCw8c2NyaXB0Pm9ucmVzaXplPWZ1bmN0aW9uKCl7cGFyZW50LnBvc3RNZXNzYWdlKDAsJyonKX08L3NjcmlwdD5cIjtcbiAgICAgICAgdW5zdWJzY3JpYmUgPSBsaXN0ZW4od2luZG93LCAnbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZSA9PT0gaWZyYW1lLmNvbnRlbnRXaW5kb3cpXG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZnJhbWUuc3JjID0gJ2Fib3V0OmJsYW5rJztcbiAgICAgICAgaWZyYW1lLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlID0gbGlzdGVuKGlmcmFtZS5jb250ZW50V2luZG93LCAncmVzaXplJywgZm4pO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBhcHBlbmQobm9kZSwgaWZyYW1lKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAoY3Jvc3NvcmlnaW4pIHtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodW5zdWJzY3JpYmUgJiYgaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGV0YWNoKGlmcmFtZSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRvZ2dsZV9jbGFzcyhlbGVtZW50LCBuYW1lLCB0b2dnbGUpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdFt0b2dnbGUgPyAnYWRkJyA6ICdyZW1vdmUnXShuYW1lKTtcbn1cbmZ1bmN0aW9uIGN1c3RvbV9ldmVudCh0eXBlLCBkZXRhaWwsIHsgYnViYmxlcyA9IGZhbHNlLCBjYW5jZWxhYmxlID0gZmFsc2UgfSA9IHt9KSB7XG4gICAgY29uc3QgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGJ1YmJsZXMsIGNhbmNlbGFibGUsIGRldGFpbCk7XG4gICAgcmV0dXJuIGU7XG59XG5mdW5jdGlvbiBxdWVyeV9zZWxlY3Rvcl9hbGwoc2VsZWN0b3IsIHBhcmVudCA9IGRvY3VtZW50LmJvZHkpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShwYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xufVxuZnVuY3Rpb24gaGVhZF9zZWxlY3Rvcihub2RlSWQsIGhlYWQpIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBsZXQgc3RhcnRlZCA9IDA7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIGhlYWQuY2hpbGROb2Rlcykge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCAvKiBjb21tZW50IG5vZGUgKi8pIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1lbnQgPSBub2RlLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICAgICAgICAgIGlmIChjb21tZW50ID09PSBgSEVBRF8ke25vZGVJZH1fRU5EYCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ZWQgLT0gMTtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNvbW1lbnQgPT09IGBIRUFEXyR7bm9kZUlkfV9TVEFSVGApIHtcbiAgICAgICAgICAgICAgICBzdGFydGVkICs9IDE7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc3RhcnRlZCA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5jbGFzcyBIdG1sVGFnIHtcbiAgICBjb25zdHJ1Y3Rvcihpc19zdmcgPSBmYWxzZSkge1xuICAgICAgICB0aGlzLmlzX3N2ZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzX3N2ZyA9IGlzX3N2ZztcbiAgICAgICAgdGhpcy5lID0gdGhpcy5uID0gbnVsbDtcbiAgICB9XG4gICAgYyhodG1sKSB7XG4gICAgICAgIHRoaXMuaChodG1sKTtcbiAgICB9XG4gICAgbShodG1sLCB0YXJnZXQsIGFuY2hvciA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzX3N2ZylcbiAgICAgICAgICAgICAgICB0aGlzLmUgPSBzdmdfZWxlbWVudCh0YXJnZXQubm9kZU5hbWUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZSA9IGVsZW1lbnQodGFyZ2V0Lm5vZGVOYW1lKTtcbiAgICAgICAgICAgIHRoaXMudCA9IHRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuYyhodG1sKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmkoYW5jaG9yKTtcbiAgICB9XG4gICAgaChodG1sKSB7XG4gICAgICAgIHRoaXMuZS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB0aGlzLm4gPSBBcnJheS5mcm9tKHRoaXMuZS5jaGlsZE5vZGVzKTtcbiAgICB9XG4gICAgaShhbmNob3IpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGluc2VydCh0aGlzLnQsIHRoaXMubltpXSwgYW5jaG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwKGh0bWwpIHtcbiAgICAgICAgdGhpcy5kKCk7XG4gICAgICAgIHRoaXMuaChodG1sKTtcbiAgICAgICAgdGhpcy5pKHRoaXMuYSk7XG4gICAgfVxuICAgIGQoKSB7XG4gICAgICAgIHRoaXMubi5mb3JFYWNoKGRldGFjaCk7XG4gICAgfVxufVxuY2xhc3MgSHRtbFRhZ0h5ZHJhdGlvbiBleHRlbmRzIEh0bWxUYWcge1xuICAgIGNvbnN0cnVjdG9yKGNsYWltZWRfbm9kZXMsIGlzX3N2ZyA9IGZhbHNlKSB7XG4gICAgICAgIHN1cGVyKGlzX3N2Zyk7XG4gICAgICAgIHRoaXMuZSA9IHRoaXMubiA9IG51bGw7XG4gICAgICAgIHRoaXMubCA9IGNsYWltZWRfbm9kZXM7XG4gICAgfVxuICAgIGMoaHRtbCkge1xuICAgICAgICBpZiAodGhpcy5sKSB7XG4gICAgICAgICAgICB0aGlzLm4gPSB0aGlzLmw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5jKGh0bWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGkoYW5jaG9yKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5uLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpbnNlcnRfaHlkcmF0aW9uKHRoaXMudCwgdGhpcy5uW2ldLCBhbmNob3IpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYXR0cmlidXRlX3RvX29iamVjdChhdHRyaWJ1dGVzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgYXR0cmlidXRlcykge1xuICAgICAgICByZXN1bHRbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlLnZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZ2V0X2N1c3RvbV9lbGVtZW50c19zbG90cyhlbGVtZW50KSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZWxlbWVudC5jaGlsZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgcmVzdWx0W25vZGUuc2xvdCB8fCAnZGVmYXVsdCddID0gdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY29uc3RydWN0X3N2ZWx0ZV9jb21wb25lbnQoY29tcG9uZW50LCBwcm9wcykge1xuICAgIHJldHVybiBuZXcgY29tcG9uZW50KHByb3BzKTtcbn1cblxuLy8gd2UgbmVlZCB0byBzdG9yZSB0aGUgaW5mb3JtYXRpb24gZm9yIG11bHRpcGxlIGRvY3VtZW50cyBiZWNhdXNlIGEgU3ZlbHRlIGFwcGxpY2F0aW9uIGNvdWxkIGFsc28gY29udGFpbiBpZnJhbWVzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc3ZlbHRlanMvc3ZlbHRlL2lzc3Vlcy8zNjI0XG5jb25zdCBtYW5hZ2VkX3N0eWxlcyA9IG5ldyBNYXAoKTtcbmxldCBhY3RpdmUgPSAwO1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Rhcmtza3lhcHAvc3RyaW5nLWhhc2gvYmxvYi9tYXN0ZXIvaW5kZXguanNcbmZ1bmN0aW9uIGhhc2goc3RyKSB7XG4gICAgbGV0IGhhc2ggPSA1MzgxO1xuICAgIGxldCBpID0gc3RyLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgXiBzdHIuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9zdHlsZV9pbmZvcm1hdGlvbihkb2MsIG5vZGUpIHtcbiAgICBjb25zdCBpbmZvID0geyBzdHlsZXNoZWV0OiBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldChub2RlKSwgcnVsZXM6IHt9IH07XG4gICAgbWFuYWdlZF9zdHlsZXMuc2V0KGRvYywgaW5mbyk7XG4gICAgcmV0dXJuIGluZm87XG59XG5mdW5jdGlvbiBjcmVhdGVfcnVsZShub2RlLCBhLCBiLCBkdXJhdGlvbiwgZGVsYXksIGVhc2UsIGZuLCB1aWQgPSAwKSB7XG4gICAgY29uc3Qgc3RlcCA9IDE2LjY2NiAvIGR1cmF0aW9uO1xuICAgIGxldCBrZXlmcmFtZXMgPSAne1xcbic7XG4gICAgZm9yIChsZXQgcCA9IDA7IHAgPD0gMTsgcCArPSBzdGVwKSB7XG4gICAgICAgIGNvbnN0IHQgPSBhICsgKGIgLSBhKSAqIGVhc2UocCk7XG4gICAgICAgIGtleWZyYW1lcyArPSBwICogMTAwICsgYCV7JHtmbih0LCAxIC0gdCl9fVxcbmA7XG4gICAgfVxuICAgIGNvbnN0IHJ1bGUgPSBrZXlmcmFtZXMgKyBgMTAwJSB7JHtmbihiLCAxIC0gYil9fVxcbn1gO1xuICAgIGNvbnN0IG5hbWUgPSBgX19zdmVsdGVfJHtoYXNoKHJ1bGUpfV8ke3VpZH1gO1xuICAgIGNvbnN0IGRvYyA9IGdldF9yb290X2Zvcl9zdHlsZShub2RlKTtcbiAgICBjb25zdCB7IHN0eWxlc2hlZXQsIHJ1bGVzIH0gPSBtYW5hZ2VkX3N0eWxlcy5nZXQoZG9jKSB8fCBjcmVhdGVfc3R5bGVfaW5mb3JtYXRpb24oZG9jLCBub2RlKTtcbiAgICBpZiAoIXJ1bGVzW25hbWVdKSB7XG4gICAgICAgIHJ1bGVzW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgc3R5bGVzaGVldC5pbnNlcnRSdWxlKGBAa2V5ZnJhbWVzICR7bmFtZX0gJHtydWxlfWAsIHN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICB9XG4gICAgY29uc3QgYW5pbWF0aW9uID0gbm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJyc7XG4gICAgbm9kZS5zdHlsZS5hbmltYXRpb24gPSBgJHthbmltYXRpb24gPyBgJHthbmltYXRpb259LCBgIDogJyd9JHtuYW1lfSAke2R1cmF0aW9ufW1zIGxpbmVhciAke2RlbGF5fW1zIDEgYm90aGA7XG4gICAgYWN0aXZlICs9IDE7XG4gICAgcmV0dXJuIG5hbWU7XG59XG5mdW5jdGlvbiBkZWxldGVfcnVsZShub2RlLCBuYW1lKSB7XG4gICAgY29uc3QgcHJldmlvdXMgPSAobm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJycpLnNwbGl0KCcsICcpO1xuICAgIGNvbnN0IG5leHQgPSBwcmV2aW91cy5maWx0ZXIobmFtZVxuICAgICAgICA/IGFuaW0gPT4gYW5pbS5pbmRleE9mKG5hbWUpIDwgMCAvLyByZW1vdmUgc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgICAgIDogYW5pbSA9PiBhbmltLmluZGV4T2YoJ19fc3ZlbHRlJykgPT09IC0xIC8vIHJlbW92ZSBhbGwgU3ZlbHRlIGFuaW1hdGlvbnNcbiAgICApO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBwcmV2aW91cy5sZW5ndGggLSBuZXh0Lmxlbmd0aDtcbiAgICBpZiAoZGVsZXRlZCkge1xuICAgICAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IG5leHQuam9pbignLCAnKTtcbiAgICAgICAgYWN0aXZlIC09IGRlbGV0ZWQ7XG4gICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgY2xlYXJfcnVsZXMoKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhcl9ydWxlcygpIHtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgICBpZiAoYWN0aXZlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBtYW5hZ2VkX3N0eWxlcy5mb3JFYWNoKGluZm8gPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBvd25lck5vZGUgfSA9IGluZm8uc3R5bGVzaGVldDtcbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIG5vIG93bmVyTm9kZSBpZiBpdCBydW5zIG9uIGpzZG9tLlxuICAgICAgICAgICAgaWYgKG93bmVyTm9kZSlcbiAgICAgICAgICAgICAgICBkZXRhY2gob3duZXJOb2RlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1hbmFnZWRfc3R5bGVzLmNsZWFyKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZV9hbmltYXRpb24obm9kZSwgZnJvbSwgZm4sIHBhcmFtcykge1xuICAgIGlmICghZnJvbSlcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgY29uc3QgdG8gPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChmcm9tLmxlZnQgPT09IHRvLmxlZnQgJiYgZnJvbS5yaWdodCA9PT0gdG8ucmlnaHQgJiYgZnJvbS50b3AgPT09IHRvLnRvcCAmJiBmcm9tLmJvdHRvbSA9PT0gdG8uYm90dG9tKVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCBcbiAgICAvLyBAdHMtaWdub3JlIHRvZG86IHNob3VsZCB0aGlzIGJlIHNlcGFyYXRlZCBmcm9tIGRlc3RydWN0dXJpbmc/IE9yIHN0YXJ0L2VuZCBhZGRlZCB0byBwdWJsaWMgYXBpIGFuZCBkb2N1bWVudGF0aW9uP1xuICAgIHN0YXJ0OiBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheSwgXG4gICAgLy8gQHRzLWlnbm9yZSB0b2RvOlxuICAgIGVuZCA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbiwgdGljayA9IG5vb3AsIGNzcyB9ID0gZm4obm9kZSwgeyBmcm9tLCB0byB9LCBwYXJhbXMpO1xuICAgIGxldCBydW5uaW5nID0gdHJ1ZTtcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xuICAgIGxldCBuYW1lO1xuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICBuYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMCwgMSwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZWxheSkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIG5hbWUpO1xuICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIGxvb3Aobm93ID0+IHtcbiAgICAgICAgaWYgKCFzdGFydGVkICYmIG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhcnRlZCAmJiBub3cgPj0gZW5kKSB7XG4gICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydGVkKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gbm93IC0gc3RhcnRfdGltZTtcbiAgICAgICAgICAgIGNvbnN0IHQgPSAwICsgMSAqIGVhc2luZyhwIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgc3RhcnQoKTtcbiAgICB0aWNrKDAsIDEpO1xuICAgIHJldHVybiBzdG9wO1xufVxuZnVuY3Rpb24gZml4X3Bvc2l0aW9uKG5vZGUpIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgaWYgKHN0eWxlLnBvc2l0aW9uICE9PSAnYWJzb2x1dGUnICYmIHN0eWxlLnBvc2l0aW9uICE9PSAnZml4ZWQnKSB7XG4gICAgICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gc3R5bGU7XG4gICAgICAgIGNvbnN0IGEgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgbm9kZS5zdHlsZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICBub2RlLnN0eWxlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgYWRkX3RyYW5zZm9ybShub2RlLCBhKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhZGRfdHJhbnNmb3JtKG5vZGUsIGEpIHtcbiAgICBjb25zdCBiID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoYS5sZWZ0ICE9PSBiLmxlZnQgfHwgYS50b3AgIT09IGIudG9wKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgbm9kZS5zdHlsZS50cmFuc2Zvcm0gPSBgJHt0cmFuc2Zvcm19IHRyYW5zbGF0ZSgke2EubGVmdCAtIGIubGVmdH1weCwgJHthLnRvcCAtIGIudG9wfXB4KWA7XG4gICAgfVxufVxuXG5sZXQgY3VycmVudF9jb21wb25lbnQ7XG5mdW5jdGlvbiBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgY3VycmVudF9jb21wb25lbnQgPSBjb21wb25lbnQ7XG59XG5mdW5jdGlvbiBnZXRfY3VycmVudF9jb21wb25lbnQoKSB7XG4gICAgaWYgKCFjdXJyZW50X2NvbXBvbmVudClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGdW5jdGlvbiBjYWxsZWQgb3V0c2lkZSBjb21wb25lbnQgaW5pdGlhbGl6YXRpb24nKTtcbiAgICByZXR1cm4gY3VycmVudF9jb21wb25lbnQ7XG59XG4vKipcbiAqIFNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHJ1biBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGNvbXBvbmVudCBpcyB1cGRhdGVkIGFmdGVyIGFueSBzdGF0ZSBjaGFuZ2UuXG4gKlxuICogVGhlIGZpcnN0IHRpbWUgdGhlIGNhbGxiYWNrIHJ1bnMgd2lsbCBiZSBiZWZvcmUgdGhlIGluaXRpYWwgYG9uTW91bnRgXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLWJlZm9yZXVwZGF0ZVxuICovXG5mdW5jdGlvbiBiZWZvcmVVcGRhdGUoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5iZWZvcmVfdXBkYXRlLnB1c2goZm4pO1xufVxuLyoqXG4gKiBUaGUgYG9uTW91bnRgIGZ1bmN0aW9uIHNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHJ1biBhcyBzb29uIGFzIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gbW91bnRlZCB0byB0aGUgRE9NLlxuICogSXQgbXVzdCBiZSBjYWxsZWQgZHVyaW5nIHRoZSBjb21wb25lbnQncyBpbml0aWFsaXNhdGlvbiAoYnV0IGRvZXNuJ3QgbmVlZCB0byBsaXZlICppbnNpZGUqIHRoZSBjb21wb25lbnQ7XG4gKiBpdCBjYW4gYmUgY2FsbGVkIGZyb20gYW4gZXh0ZXJuYWwgbW9kdWxlKS5cbiAqXG4gKiBgb25Nb3VudGAgZG9lcyBub3QgcnVuIGluc2lkZSBhIFtzZXJ2ZXItc2lkZSBjb21wb25lbnRdKC9kb2NzI3J1bi10aW1lLXNlcnZlci1zaWRlLWNvbXBvbmVudC1hcGkpLlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzI3J1bi10aW1lLXN2ZWx0ZS1vbm1vdW50XG4gKi9cbmZ1bmN0aW9uIG9uTW91bnQoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5vbl9tb3VudC5wdXNoKGZuKTtcbn1cbi8qKlxuICogU2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gcnVuIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gdXBkYXRlZC5cbiAqXG4gKiBUaGUgZmlyc3QgdGltZSB0aGUgY2FsbGJhY2sgcnVucyB3aWxsIGJlIGFmdGVyIHRoZSBpbml0aWFsIGBvbk1vdW50YFxuICovXG5mdW5jdGlvbiBhZnRlclVwZGF0ZShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmFmdGVyX3VwZGF0ZS5wdXNoKGZuKTtcbn1cbi8qKlxuICogU2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gcnVuIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgY29tcG9uZW50IGlzIHVubW91bnRlZC5cbiAqXG4gKiBPdXQgb2YgYG9uTW91bnRgLCBgYmVmb3JlVXBkYXRlYCwgYGFmdGVyVXBkYXRlYCBhbmQgYG9uRGVzdHJveWAsIHRoaXMgaXMgdGhlXG4gKiBvbmx5IG9uZSB0aGF0IHJ1bnMgaW5zaWRlIGEgc2VydmVyLXNpZGUgY29tcG9uZW50LlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzI3J1bi10aW1lLXN2ZWx0ZS1vbmRlc3Ryb3lcbiAqL1xuZnVuY3Rpb24gb25EZXN0cm95KGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQub25fZGVzdHJveS5wdXNoKGZuKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhbiBldmVudCBkaXNwYXRjaGVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGlzcGF0Y2ggW2NvbXBvbmVudCBldmVudHNdKC9kb2NzI3RlbXBsYXRlLXN5bnRheC1jb21wb25lbnQtZGlyZWN0aXZlcy1vbi1ldmVudG5hbWUpLlxuICogRXZlbnQgZGlzcGF0Y2hlcnMgYXJlIGZ1bmN0aW9ucyB0aGF0IGNhbiB0YWtlIHR3byBhcmd1bWVudHM6IGBuYW1lYCBhbmQgYGRldGFpbGAuXG4gKlxuICogQ29tcG9uZW50IGV2ZW50cyBjcmVhdGVkIHdpdGggYGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcmAgY3JlYXRlIGFcbiAqIFtDdXN0b21FdmVudF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50KS5cbiAqIFRoZXNlIGV2ZW50cyBkbyBub3QgW2J1YmJsZV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9KYXZhU2NyaXB0L0J1aWxkaW5nX2Jsb2Nrcy9FdmVudHMjRXZlbnRfYnViYmxpbmdfYW5kX2NhcHR1cmUpLlxuICogVGhlIGBkZXRhaWxgIGFyZ3VtZW50IGNvcnJlc3BvbmRzIHRvIHRoZSBbQ3VzdG9tRXZlbnQuZGV0YWlsXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQvZGV0YWlsKVxuICogcHJvcGVydHkgYW5kIGNhbiBjb250YWluIGFueSB0eXBlIG9mIGRhdGEuXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLWNyZWF0ZWV2ZW50ZGlzcGF0Y2hlclxuICovXG5mdW5jdGlvbiBjcmVhdGVFdmVudERpc3BhdGNoZXIoKSB7XG4gICAgY29uc3QgY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgcmV0dXJuICh0eXBlLCBkZXRhaWwsIHsgY2FuY2VsYWJsZSA9IGZhbHNlIH0gPSB7fSkgPT4ge1xuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSBjb21wb25lbnQuJCQuY2FsbGJhY2tzW3R5cGVdO1xuICAgICAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGFyZSB0aGVyZSBzaXR1YXRpb25zIHdoZXJlIGV2ZW50cyBjb3VsZCBiZSBkaXNwYXRjaGVkXG4gICAgICAgICAgICAvLyBpbiBhIHNlcnZlciAobm9uLURPTSkgZW52aXJvbm1lbnQ/XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGN1c3RvbV9ldmVudCh0eXBlLCBkZXRhaWwsIHsgY2FuY2VsYWJsZSB9KTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4ge1xuICAgICAgICAgICAgICAgIGZuLmNhbGwoY29tcG9uZW50LCBldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAhZXZlbnQuZGVmYXVsdFByZXZlbnRlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xufVxuLyoqXG4gKiBBc3NvY2lhdGVzIGFuIGFyYml0cmFyeSBgY29udGV4dGAgb2JqZWN0IHdpdGggdGhlIGN1cnJlbnQgY29tcG9uZW50IGFuZCB0aGUgc3BlY2lmaWVkIGBrZXlgXG4gKiBhbmQgcmV0dXJucyB0aGF0IG9iamVjdC4gVGhlIGNvbnRleHQgaXMgdGhlbiBhdmFpbGFibGUgdG8gY2hpbGRyZW4gb2YgdGhlIGNvbXBvbmVudFxuICogKGluY2x1ZGluZyBzbG90dGVkIGNvbnRlbnQpIHdpdGggYGdldENvbnRleHRgLlxuICpcbiAqIExpa2UgbGlmZWN5Y2xlIGZ1bmN0aW9ucywgdGhpcyBtdXN0IGJlIGNhbGxlZCBkdXJpbmcgY29tcG9uZW50IGluaXRpYWxpc2F0aW9uLlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzI3J1bi10aW1lLXN2ZWx0ZS1zZXRjb250ZXh0XG4gKi9cbmZ1bmN0aW9uIHNldENvbnRleHQoa2V5LCBjb250ZXh0KSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5zZXQoa2V5LCBjb250ZXh0KTtcbiAgICByZXR1cm4gY29udGV4dDtcbn1cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjb250ZXh0IHRoYXQgYmVsb25ncyB0byB0aGUgY2xvc2VzdCBwYXJlbnQgY29tcG9uZW50IHdpdGggdGhlIHNwZWNpZmllZCBga2V5YC5cbiAqIE11c3QgYmUgY2FsbGVkIGR1cmluZyBjb21wb25lbnQgaW5pdGlhbGlzYXRpb24uXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLWdldGNvbnRleHRcbiAqL1xuZnVuY3Rpb24gZ2V0Q29udGV4dChrZXkpIHtcbiAgICByZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5nZXQoa2V5KTtcbn1cbi8qKlxuICogUmV0cmlldmVzIHRoZSB3aG9sZSBjb250ZXh0IG1hcCB0aGF0IGJlbG9uZ3MgdG8gdGhlIGNsb3Nlc3QgcGFyZW50IGNvbXBvbmVudC5cbiAqIE11c3QgYmUgY2FsbGVkIGR1cmluZyBjb21wb25lbnQgaW5pdGlhbGlzYXRpb24uIFVzZWZ1bCwgZm9yIGV4YW1wbGUsIGlmIHlvdVxuICogcHJvZ3JhbW1hdGljYWxseSBjcmVhdGUgYSBjb21wb25lbnQgYW5kIHdhbnQgdG8gcGFzcyB0aGUgZXhpc3RpbmcgY29udGV4dCB0byBpdC5cbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcyNydW4tdGltZS1zdmVsdGUtZ2V0YWxsY29udGV4dHNcbiAqL1xuZnVuY3Rpb24gZ2V0QWxsQ29udGV4dHMoKSB7XG4gICAgcmV0dXJuIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQ7XG59XG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gYGtleWAgaGFzIGJlZW4gc2V0IGluIHRoZSBjb250ZXh0IG9mIGEgcGFyZW50IGNvbXBvbmVudC5cbiAqIE11c3QgYmUgY2FsbGVkIGR1cmluZyBjb21wb25lbnQgaW5pdGlhbGlzYXRpb24uXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLWhhc2NvbnRleHRcbiAqL1xuZnVuY3Rpb24gaGFzQ29udGV4dChrZXkpIHtcbiAgICByZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5oYXMoa2V5KTtcbn1cbi8vIFRPRE8gZmlndXJlIG91dCBpZiB3ZSBzdGlsbCB3YW50IHRvIHN1cHBvcnRcbi8vIHNob3J0aGFuZCBldmVudHMsIG9yIGlmIHdlIHdhbnQgdG8gaW1wbGVtZW50XG4vLyBhIHJlYWwgYnViYmxpbmcgbWVjaGFuaXNtXG5mdW5jdGlvbiBidWJibGUoY29tcG9uZW50LCBldmVudCkge1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbZXZlbnQudHlwZV07XG4gICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4gZm4uY2FsbCh0aGlzLCBldmVudCkpO1xuICAgIH1cbn1cblxuY29uc3QgZGlydHlfY29tcG9uZW50cyA9IFtdO1xuY29uc3QgaW50cm9zID0geyBlbmFibGVkOiBmYWxzZSB9O1xuY29uc3QgYmluZGluZ19jYWxsYmFja3MgPSBbXTtcbmNvbnN0IHJlbmRlcl9jYWxsYmFja3MgPSBbXTtcbmNvbnN0IGZsdXNoX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgcmVzb2x2ZWRfcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xubGV0IHVwZGF0ZV9zY2hlZHVsZWQgPSBmYWxzZTtcbmZ1bmN0aW9uIHNjaGVkdWxlX3VwZGF0ZSgpIHtcbiAgICBpZiAoIXVwZGF0ZV9zY2hlZHVsZWQpIHtcbiAgICAgICAgdXBkYXRlX3NjaGVkdWxlZCA9IHRydWU7XG4gICAgICAgIHJlc29sdmVkX3Byb21pc2UudGhlbihmbHVzaCk7XG4gICAgfVxufVxuZnVuY3Rpb24gdGljaygpIHtcbiAgICBzY2hlZHVsZV91cGRhdGUoKTtcbiAgICByZXR1cm4gcmVzb2x2ZWRfcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGFkZF9yZW5kZXJfY2FsbGJhY2soZm4pIHtcbiAgICByZW5kZXJfY2FsbGJhY2tzLnB1c2goZm4pO1xufVxuZnVuY3Rpb24gYWRkX2ZsdXNoX2NhbGxiYWNrKGZuKSB7XG4gICAgZmx1c2hfY2FsbGJhY2tzLnB1c2goZm4pO1xufVxuLy8gZmx1c2goKSBjYWxscyBjYWxsYmFja3MgaW4gdGhpcyBvcmRlcjpcbi8vIDEuIEFsbCBiZWZvcmVVcGRhdGUgY2FsbGJhY2tzLCBpbiBvcmRlcjogcGFyZW50cyBiZWZvcmUgY2hpbGRyZW5cbi8vIDIuIEFsbCBiaW5kOnRoaXMgY2FsbGJhY2tzLCBpbiByZXZlcnNlIG9yZGVyOiBjaGlsZHJlbiBiZWZvcmUgcGFyZW50cy5cbi8vIDMuIEFsbCBhZnRlclVwZGF0ZSBjYWxsYmFja3MsIGluIG9yZGVyOiBwYXJlbnRzIGJlZm9yZSBjaGlsZHJlbi4gRVhDRVBUXG4vLyAgICBmb3IgYWZ0ZXJVcGRhdGVzIGNhbGxlZCBkdXJpbmcgdGhlIGluaXRpYWwgb25Nb3VudCwgd2hpY2ggYXJlIGNhbGxlZCBpblxuLy8gICAgcmV2ZXJzZSBvcmRlcjogY2hpbGRyZW4gYmVmb3JlIHBhcmVudHMuXG4vLyBTaW5jZSBjYWxsYmFja3MgbWlnaHQgdXBkYXRlIGNvbXBvbmVudCB2YWx1ZXMsIHdoaWNoIGNvdWxkIHRyaWdnZXIgYW5vdGhlclxuLy8gY2FsbCB0byBmbHVzaCgpLCB0aGUgZm9sbG93aW5nIHN0ZXBzIGd1YXJkIGFnYWluc3QgdGhpczpcbi8vIDEuIER1cmluZyBiZWZvcmVVcGRhdGUsIGFueSB1cGRhdGVkIGNvbXBvbmVudHMgd2lsbCBiZSBhZGRlZCB0byB0aGVcbi8vICAgIGRpcnR5X2NvbXBvbmVudHMgYXJyYXkgYW5kIHdpbGwgY2F1c2UgYSByZWVudHJhbnQgY2FsbCB0byBmbHVzaCgpLiBCZWNhdXNlXG4vLyAgICB0aGUgZmx1c2ggaW5kZXggaXMga2VwdCBvdXRzaWRlIHRoZSBmdW5jdGlvbiwgdGhlIHJlZW50cmFudCBjYWxsIHdpbGwgcGlja1xuLy8gICAgdXAgd2hlcmUgdGhlIGVhcmxpZXIgY2FsbCBsZWZ0IG9mZiBhbmQgZ28gdGhyb3VnaCBhbGwgZGlydHkgY29tcG9uZW50cy4gVGhlXG4vLyAgICBjdXJyZW50X2NvbXBvbmVudCB2YWx1ZSBpcyBzYXZlZCBhbmQgcmVzdG9yZWQgc28gdGhhdCB0aGUgcmVlbnRyYW50IGNhbGwgd2lsbFxuLy8gICAgbm90IGludGVyZmVyZSB3aXRoIHRoZSBcInBhcmVudFwiIGZsdXNoKCkgY2FsbC5cbi8vIDIuIGJpbmQ6dGhpcyBjYWxsYmFja3MgY2Fubm90IHRyaWdnZXIgbmV3IGZsdXNoKCkgY2FsbHMuXG4vLyAzLiBEdXJpbmcgYWZ0ZXJVcGRhdGUsIGFueSB1cGRhdGVkIGNvbXBvbmVudHMgd2lsbCBOT1QgaGF2ZSB0aGVpciBhZnRlclVwZGF0ZVxuLy8gICAgY2FsbGJhY2sgY2FsbGVkIGEgc2Vjb25kIHRpbWU7IHRoZSBzZWVuX2NhbGxiYWNrcyBzZXQsIG91dHNpZGUgdGhlIGZsdXNoKClcbi8vICAgIGZ1bmN0aW9uLCBndWFyYW50ZWVzIHRoaXMgYmVoYXZpb3IuXG5jb25zdCBzZWVuX2NhbGxiYWNrcyA9IG5ldyBTZXQoKTtcbmxldCBmbHVzaGlkeCA9IDA7IC8vIERvICpub3QqIG1vdmUgdGhpcyBpbnNpZGUgdGhlIGZsdXNoKCkgZnVuY3Rpb25cbmZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIGNvbnN0IHNhdmVkX2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuICAgIGRvIHtcbiAgICAgICAgLy8gZmlyc3QsIGNhbGwgYmVmb3JlVXBkYXRlIGZ1bmN0aW9uc1xuICAgICAgICAvLyBhbmQgdXBkYXRlIGNvbXBvbmVudHNcbiAgICAgICAgd2hpbGUgKGZsdXNoaWR4IDwgZGlydHlfY29tcG9uZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGRpcnR5X2NvbXBvbmVudHNbZmx1c2hpZHhdO1xuICAgICAgICAgICAgZmx1c2hpZHgrKztcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGNvbXBvbmVudC4kJCk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCA9IDA7XG4gICAgICAgIGZsdXNoaWR4ID0gMDtcbiAgICAgICAgd2hpbGUgKGJpbmRpbmdfY2FsbGJhY2tzLmxlbmd0aClcbiAgICAgICAgICAgIGJpbmRpbmdfY2FsbGJhY2tzLnBvcCgpKCk7XG4gICAgICAgIC8vIHRoZW4sIG9uY2UgY29tcG9uZW50cyBhcmUgdXBkYXRlZCwgY2FsbFxuICAgICAgICAvLyBhZnRlclVwZGF0ZSBmdW5jdGlvbnMuIFRoaXMgbWF5IGNhdXNlXG4gICAgICAgIC8vIHN1YnNlcXVlbnQgdXBkYXRlcy4uLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbmRlcl9jYWxsYmFja3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gcmVuZGVyX2NhbGxiYWNrc1tpXTtcbiAgICAgICAgICAgIGlmICghc2Vlbl9jYWxsYmFja3MuaGFzKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIC8vIC4uLnNvIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgICAgICAgICBzZWVuX2NhbGxiYWNrcy5hZGQoY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGggPSAwO1xuICAgIH0gd2hpbGUgKGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoKTtcbiAgICB3aGlsZSAoZmx1c2hfY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICBmbHVzaF9jYWxsYmFja3MucG9wKCkoKTtcbiAgICB9XG4gICAgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIHNlZW5fY2FsbGJhY2tzLmNsZWFyKCk7XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHNhdmVkX2NvbXBvbmVudCk7XG59XG5mdW5jdGlvbiB1cGRhdGUoJCQpIHtcbiAgICBpZiAoJCQuZnJhZ21lbnQgIT09IG51bGwpIHtcbiAgICAgICAgJCQudXBkYXRlKCk7XG4gICAgICAgIHJ1bl9hbGwoJCQuYmVmb3JlX3VwZGF0ZSk7XG4gICAgICAgIGNvbnN0IGRpcnR5ID0gJCQuZGlydHk7XG4gICAgICAgICQkLmRpcnR5ID0gWy0xXTtcbiAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQucCgkJC5jdHgsIGRpcnR5KTtcbiAgICAgICAgJCQuYWZ0ZXJfdXBkYXRlLmZvckVhY2goYWRkX3JlbmRlcl9jYWxsYmFjayk7XG4gICAgfVxufVxuXG5sZXQgcHJvbWlzZTtcbmZ1bmN0aW9uIHdhaXQoKSB7XG4gICAgaWYgKCFwcm9taXNlKSB7XG4gICAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHByb21pc2UgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBkaXNwYXRjaChub2RlLCBkaXJlY3Rpb24sIGtpbmQpIHtcbiAgICBub2RlLmRpc3BhdGNoRXZlbnQoY3VzdG9tX2V2ZW50KGAke2RpcmVjdGlvbiA/ICdpbnRybycgOiAnb3V0cm8nfSR7a2luZH1gKSk7XG59XG5jb25zdCBvdXRyb2luZyA9IG5ldyBTZXQoKTtcbmxldCBvdXRyb3M7XG5mdW5jdGlvbiBncm91cF9vdXRyb3MoKSB7XG4gICAgb3V0cm9zID0ge1xuICAgICAgICByOiAwLFxuICAgICAgICBjOiBbXSxcbiAgICAgICAgcDogb3V0cm9zIC8vIHBhcmVudCBncm91cFxuICAgIH07XG59XG5mdW5jdGlvbiBjaGVja19vdXRyb3MoKSB7XG4gICAgaWYgKCFvdXRyb3Mucikge1xuICAgICAgICBydW5fYWxsKG91dHJvcy5jKTtcbiAgICB9XG4gICAgb3V0cm9zID0gb3V0cm9zLnA7XG59XG5mdW5jdGlvbiB0cmFuc2l0aW9uX2luKGJsb2NrLCBsb2NhbCkge1xuICAgIGlmIChibG9jayAmJiBibG9jay5pKSB7XG4gICAgICAgIG91dHJvaW5nLmRlbGV0ZShibG9jayk7XG4gICAgICAgIGJsb2NrLmkobG9jYWwpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHRyYW5zaXRpb25fb3V0KGJsb2NrLCBsb2NhbCwgZGV0YWNoLCBjYWxsYmFjaykge1xuICAgIGlmIChibG9jayAmJiBibG9jay5vKSB7XG4gICAgICAgIGlmIChvdXRyb2luZy5oYXMoYmxvY2spKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBvdXRyb2luZy5hZGQoYmxvY2spO1xuICAgICAgICBvdXRyb3MuYy5wdXNoKCgpID0+IHtcbiAgICAgICAgICAgIG91dHJvaW5nLmRlbGV0ZShibG9jayk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoZGV0YWNoKVxuICAgICAgICAgICAgICAgICAgICBibG9jay5kKDEpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBibG9jay5vKGxvY2FsKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG59XG5jb25zdCBudWxsX3RyYW5zaXRpb24gPSB7IGR1cmF0aW9uOiAwIH07XG5mdW5jdGlvbiBjcmVhdGVfaW5fdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSBmYWxzZTtcbiAgICBsZXQgYW5pbWF0aW9uX25hbWU7XG4gICAgbGV0IHRhc2s7XG4gICAgbGV0IHVpZCA9IDA7XG4gICAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnbygpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMCwgMSwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcywgdWlkKyspO1xuICAgICAgICB0aWNrKDAsIDEpO1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG4gICAgICAgIGlmICh0YXNrKVxuICAgICAgICAgICAgdGFzay5hYm9ydCgpO1xuICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCB0cnVlLCAnc3RhcnQnKSk7XG4gICAgICAgIHRhc2sgPSBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gZW5kX3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGljaygxLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgdHJ1ZSwgJ2VuZCcpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gc3RhcnRfdGltZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ID0gZWFzaW5nKChub3cgLSBzdGFydF90aW1lKSAvIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmc7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0KCkge1xuICAgICAgICAgICAgaWYgKHN0YXJ0ZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlKTtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oZ28pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5kKCkge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9vdXRfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBjb25zdCBncm91cCA9IG91dHJvcztcbiAgICBncm91cC5yICs9IDE7XG4gICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDEsIDAsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdzdGFydCcpKTtcbiAgICAgICAgbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGVuZF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIGZhbHNlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghLS1ncm91cC5yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgcmVzdWx0IGluIGBlbmQoKWAgYmVpbmcgY2FsbGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3QgbmVlZCB0byBjbGVhbiB1cCBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5fYWxsKGdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEgLSB0LCB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgIHdhaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnbygpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBlbmQocmVzZXQpIHtcbiAgICAgICAgICAgIGlmIChyZXNldCAmJiBjb25maWcudGljaykge1xuICAgICAgICAgICAgICAgIGNvbmZpZy50aWNrKDEsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIGFuaW1hdGlvbl9uYW1lKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX2JpZGlyZWN0aW9uYWxfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zLCBpbnRybykge1xuICAgIGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMpO1xuICAgIGxldCB0ID0gaW50cm8gPyAwIDogMTtcbiAgICBsZXQgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgYW5pbWF0aW9uX25hbWUgPSBudWxsO1xuICAgIGZ1bmN0aW9uIGNsZWFyX2FuaW1hdGlvbigpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbml0KHByb2dyYW0sIGR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGQgPSAocHJvZ3JhbS5iIC0gdCk7XG4gICAgICAgIGR1cmF0aW9uICo9IE1hdGguYWJzKGQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYTogdCxcbiAgICAgICAgICAgIGI6IHByb2dyYW0uYixcbiAgICAgICAgICAgIGQsXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIHN0YXJ0OiBwcm9ncmFtLnN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBwcm9ncmFtLnN0YXJ0ICsgZHVyYXRpb24sXG4gICAgICAgICAgICBncm91cDogcHJvZ3JhbS5ncm91cFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBnbyhiKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSB7XG4gICAgICAgICAgICBzdGFydDogbm93KCkgKyBkZWxheSxcbiAgICAgICAgICAgIGJcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFiKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHRvZG86IGltcHJvdmUgdHlwaW5nc1xuICAgICAgICAgICAgcHJvZ3JhbS5ncm91cCA9IG91dHJvcztcbiAgICAgICAgICAgIG91dHJvcy5yICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgIHBlbmRpbmdfcHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGlzIGlzIGFuIGludHJvLCBhbmQgdGhlcmUncyBhIGRlbGF5LCB3ZSBuZWVkIHRvIGRvXG4gICAgICAgICAgICAvLyBhbiBpbml0aWFsIHRpY2sgYW5kL29yIGFwcGx5IENTUyBhbmltYXRpb24gaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIHQsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGIpXG4gICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IGluaXQocHJvZ3JhbSwgZHVyYXRpb24pO1xuICAgICAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBiLCAnc3RhcnQnKSk7XG4gICAgICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdfcHJvZ3JhbSAmJiBub3cgPiBwZW5kaW5nX3Byb2dyYW0uc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gaW5pdChwZW5kaW5nX3Byb2dyYW0sIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgdCwgcnVubmluZ19wcm9ncmFtLmIsIHJ1bm5pbmdfcHJvZ3JhbS5kdXJhdGlvbiwgMCwgZWFzaW5nLCBjb25maWcuY3NzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0ID0gcnVubmluZ19wcm9ncmFtLmIsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHJ1bm5pbmdfcHJvZ3JhbS5iLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBlbmRpbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtLmIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW50cm8g4oCUIHdlIGNhbiB0aWR5IHVwIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3V0cm8g4oCUIG5lZWRzIHRvIGJlIGNvb3JkaW5hdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghLS1ydW5uaW5nX3Byb2dyYW0uZ3JvdXAucilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwocnVubmluZ19wcm9ncmFtLmdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobm93ID49IHJ1bm5pbmdfcHJvZ3JhbS5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcCA9IG5vdyAtIHJ1bm5pbmdfcHJvZ3JhbS5zdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBydW5uaW5nX3Byb2dyYW0uYSArIHJ1bm5pbmdfcHJvZ3JhbS5kICogZWFzaW5nKHAgLyBydW5uaW5nX3Byb2dyYW0uZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcnVuKGIpIHtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICBnbyhiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdvKGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVfcHJvbWlzZShwcm9taXNlLCBpbmZvKSB7XG4gICAgY29uc3QgdG9rZW4gPSBpbmZvLnRva2VuID0ge307XG4gICAgZnVuY3Rpb24gdXBkYXRlKHR5cGUsIGluZGV4LCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmIChpbmZvLnRva2VuICE9PSB0b2tlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaW5mby5yZXNvbHZlZCA9IHZhbHVlO1xuICAgICAgICBsZXQgY2hpbGRfY3R4ID0gaW5mby5jdHg7XG4gICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hpbGRfY3R4ID0gY2hpbGRfY3R4LnNsaWNlKCk7XG4gICAgICAgICAgICBjaGlsZF9jdHhba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJsb2NrID0gdHlwZSAmJiAoaW5mby5jdXJyZW50ID0gdHlwZSkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IG5lZWRzX2ZsdXNoID0gZmFsc2U7XG4gICAgICAgIGlmIChpbmZvLmJsb2NrKSB7XG4gICAgICAgICAgICBpZiAoaW5mby5ibG9ja3MpIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2Nrcy5mb3JFYWNoKChibG9jaywgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaW5kZXggJiYgYmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbl9vdXQoYmxvY2ssIDEsIDEsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5ibG9ja3NbaV0gPT09IGJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uYmxvY2tzW2ldID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2NrLmQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBibG9jay5jKCk7XG4gICAgICAgICAgICB0cmFuc2l0aW9uX2luKGJsb2NrLCAxKTtcbiAgICAgICAgICAgIGJsb2NrLm0oaW5mby5tb3VudCgpLCBpbmZvLmFuY2hvcik7XG4gICAgICAgICAgICBuZWVkc19mbHVzaCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5ibG9jayA9IGJsb2NrO1xuICAgICAgICBpZiAoaW5mby5ibG9ja3MpXG4gICAgICAgICAgICBpbmZvLmJsb2Nrc1tpbmRleF0gPSBibG9jaztcbiAgICAgICAgaWYgKG5lZWRzX2ZsdXNoKSB7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpc19wcm9taXNlKHByb21pc2UpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgICAgIHByb21pc2UudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8uY2F0Y2gsIDIsIGluZm8uZXJyb3IsIGVycm9yKTtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgICAgIGlmICghaW5mby5oYXNDYXRjaCkge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gaWYgd2UgcHJldmlvdXNseSBoYWQgYSB0aGVuL2NhdGNoIGJsb2NrLCBkZXN0cm95IGl0XG4gICAgICAgIGlmIChpbmZvLmN1cnJlbnQgIT09IGluZm8ucGVuZGluZykge1xuICAgICAgICAgICAgdXBkYXRlKGluZm8ucGVuZGluZywgMCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGluZm8uY3VycmVudCAhPT0gaW5mby50aGVuKSB7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby50aGVuLCAxLCBpbmZvLnZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGluZm8ucmVzb2x2ZWQgPSBwcm9taXNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZV9hd2FpdF9ibG9ja19icmFuY2goaW5mbywgY3R4LCBkaXJ0eSkge1xuICAgIGNvbnN0IGNoaWxkX2N0eCA9IGN0eC5zbGljZSgpO1xuICAgIGNvbnN0IHsgcmVzb2x2ZWQgfSA9IGluZm87XG4gICAgaWYgKGluZm8uY3VycmVudCA9PT0gaW5mby50aGVuKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLnZhbHVlXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpZiAoaW5mby5jdXJyZW50ID09PSBpbmZvLmNhdGNoKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLmVycm9yXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpbmZvLmJsb2NrLnAoY2hpbGRfY3R4LCBkaXJ0eSk7XG59XG5cbmNvbnN0IGdsb2JhbHMgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gZ2xvYmFsVGhpc1xuICAgICAgICA6IGdsb2JhbCk7XG5cbmZ1bmN0aW9uIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmQoMSk7XG4gICAgbG9va3VwLmRlbGV0ZShibG9jay5rZXkpO1xufVxuZnVuY3Rpb24gb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgIGxvb2t1cC5kZWxldGUoYmxvY2sua2V5KTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZpeF9hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZigpO1xuICAgIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5mKCk7XG4gICAgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiB1cGRhdGVfa2V5ZWRfZWFjaChvbGRfYmxvY2tzLCBkaXJ0eSwgZ2V0X2tleSwgZHluYW1pYywgY3R4LCBsaXN0LCBsb29rdXAsIG5vZGUsIGRlc3Ryb3ksIGNyZWF0ZV9lYWNoX2Jsb2NrLCBuZXh0LCBnZXRfY29udGV4dCkge1xuICAgIGxldCBvID0gb2xkX2Jsb2Nrcy5sZW5ndGg7XG4gICAgbGV0IG4gPSBsaXN0Lmxlbmd0aDtcbiAgICBsZXQgaSA9IG87XG4gICAgY29uc3Qgb2xkX2luZGV4ZXMgPSB7fTtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBvbGRfaW5kZXhlc1tvbGRfYmxvY2tzW2ldLmtleV0gPSBpO1xuICAgIGNvbnN0IG5ld19ibG9ja3MgPSBbXTtcbiAgICBjb25zdCBuZXdfbG9va3VwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGRlbHRhcyA9IG5ldyBNYXAoKTtcbiAgICBpID0gbjtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkX2N0eCA9IGdldF9jb250ZXh0KGN0eCwgbGlzdCwgaSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IGJsb2NrID0gbG9va3VwLmdldChrZXkpO1xuICAgICAgICBpZiAoIWJsb2NrKSB7XG4gICAgICAgICAgICBibG9jayA9IGNyZWF0ZV9lYWNoX2Jsb2NrKGtleSwgY2hpbGRfY3R4KTtcbiAgICAgICAgICAgIGJsb2NrLmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkeW5hbWljKSB7XG4gICAgICAgICAgICBibG9jay5wKGNoaWxkX2N0eCwgZGlydHkpO1xuICAgICAgICB9XG4gICAgICAgIG5ld19sb29rdXAuc2V0KGtleSwgbmV3X2Jsb2Nrc1tpXSA9IGJsb2NrKTtcbiAgICAgICAgaWYgKGtleSBpbiBvbGRfaW5kZXhlcylcbiAgICAgICAgICAgIGRlbHRhcy5zZXQoa2V5LCBNYXRoLmFicyhpIC0gb2xkX2luZGV4ZXNba2V5XSkpO1xuICAgIH1cbiAgICBjb25zdCB3aWxsX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgZGlkX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gaW5zZXJ0KGJsb2NrKSB7XG4gICAgICAgIHRyYW5zaXRpb25faW4oYmxvY2ssIDEpO1xuICAgICAgICBibG9jay5tKG5vZGUsIG5leHQpO1xuICAgICAgICBsb29rdXAuc2V0KGJsb2NrLmtleSwgYmxvY2spO1xuICAgICAgICBuZXh0ID0gYmxvY2suZmlyc3Q7XG4gICAgICAgIG4tLTtcbiAgICB9XG4gICAgd2hpbGUgKG8gJiYgbikge1xuICAgICAgICBjb25zdCBuZXdfYmxvY2sgPSBuZXdfYmxvY2tzW24gLSAxXTtcbiAgICAgICAgY29uc3Qgb2xkX2Jsb2NrID0gb2xkX2Jsb2Nrc1tvIC0gMV07XG4gICAgICAgIGNvbnN0IG5ld19rZXkgPSBuZXdfYmxvY2sua2V5O1xuICAgICAgICBjb25zdCBvbGRfa2V5ID0gb2xkX2Jsb2NrLmtleTtcbiAgICAgICAgaWYgKG5ld19ibG9jayA9PT0gb2xkX2Jsb2NrKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICBuZXh0ID0gbmV3X2Jsb2NrLmZpcnN0O1xuICAgICAgICAgICAgby0tO1xuICAgICAgICAgICAgbi0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFuZXdfbG9va3VwLmhhcyhvbGRfa2V5KSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIG9sZCBibG9ja1xuICAgICAgICAgICAgZGVzdHJveShvbGRfYmxvY2ssIGxvb2t1cCk7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWxvb2t1cC5oYXMobmV3X2tleSkgfHwgd2lsbF9tb3ZlLmhhcyhuZXdfa2V5KSkge1xuICAgICAgICAgICAgaW5zZXJ0KG5ld19ibG9jayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlkX21vdmUuaGFzKG9sZF9rZXkpKSB7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVsdGFzLmdldChuZXdfa2V5KSA+IGRlbHRhcy5nZXQob2xkX2tleSkpIHtcbiAgICAgICAgICAgIGRpZF9tb3ZlLmFkZChuZXdfa2V5KTtcbiAgICAgICAgICAgIGluc2VydChuZXdfYmxvY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2lsbF9tb3ZlLmFkZChvbGRfa2V5KTtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoby0tKSB7XG4gICAgICAgIGNvbnN0IG9sZF9ibG9jayA9IG9sZF9ibG9ja3Nbb107XG4gICAgICAgIGlmICghbmV3X2xvb2t1cC5oYXMob2xkX2Jsb2NrLmtleSkpXG4gICAgICAgICAgICBkZXN0cm95KG9sZF9ibG9jaywgbG9va3VwKTtcbiAgICB9XG4gICAgd2hpbGUgKG4pXG4gICAgICAgIGluc2VydChuZXdfYmxvY2tzW24gLSAxXSk7XG4gICAgcmV0dXJuIG5ld19ibG9ja3M7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2tleXMoY3R4LCBsaXN0LCBnZXRfY29udGV4dCwgZ2V0X2tleSkge1xuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKSk7XG4gICAgICAgIGlmIChrZXlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYXZlIGR1cGxpY2F0ZSBrZXlzIGluIGEga2V5ZWQgZWFjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGtleXMuYWRkKGtleSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRfc3ByZWFkX3VwZGF0ZShsZXZlbHMsIHVwZGF0ZXMpIHtcbiAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICBjb25zdCB0b19udWxsX291dCA9IHt9O1xuICAgIGNvbnN0IGFjY291bnRlZF9mb3IgPSB7ICQkc2NvcGU6IDEgfTtcbiAgICBsZXQgaSA9IGxldmVscy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjb25zdCBvID0gbGV2ZWxzW2ldO1xuICAgICAgICBjb25zdCBuID0gdXBkYXRlc1tpXTtcbiAgICAgICAgaWYgKG4pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gbikpXG4gICAgICAgICAgICAgICAgICAgIHRvX251bGxfb3V0W2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbikge1xuICAgICAgICAgICAgICAgIGlmICghYWNjb3VudGVkX2ZvcltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gbltrZXldO1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldmVsc1tpXSA9IG47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudGVkX2ZvcltrZXldID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0b19udWxsX291dCkge1xuICAgICAgICBpZiAoIShrZXkgaW4gdXBkYXRlKSlcbiAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlO1xufVxuZnVuY3Rpb24gZ2V0X3NwcmVhZF9vYmplY3Qoc3ByZWFkX3Byb3BzKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzcHJlYWRfcHJvcHMgPT09ICdvYmplY3QnICYmIHNwcmVhZF9wcm9wcyAhPT0gbnVsbCA/IHNwcmVhZF9wcm9wcyA6IHt9O1xufVxuXG4vLyBzb3VyY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZGljZXMuaHRtbFxuY29uc3QgYm9vbGVhbl9hdHRyaWJ1dGVzID0gbmV3IFNldChbXG4gICAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICAgJ2FsbG93cGF5bWVudHJlcXVlc3QnLFxuICAgICdhc3luYycsXG4gICAgJ2F1dG9mb2N1cycsXG4gICAgJ2F1dG9wbGF5JyxcbiAgICAnY2hlY2tlZCcsXG4gICAgJ2NvbnRyb2xzJyxcbiAgICAnZGVmYXVsdCcsXG4gICAgJ2RlZmVyJyxcbiAgICAnZGlzYWJsZWQnLFxuICAgICdmb3Jtbm92YWxpZGF0ZScsXG4gICAgJ2hpZGRlbicsXG4gICAgJ2luZXJ0JyxcbiAgICAnaXNtYXAnLFxuICAgICdpdGVtc2NvcGUnLFxuICAgICdsb29wJyxcbiAgICAnbXVsdGlwbGUnLFxuICAgICdtdXRlZCcsXG4gICAgJ25vbW9kdWxlJyxcbiAgICAnbm92YWxpZGF0ZScsXG4gICAgJ29wZW4nLFxuICAgICdwbGF5c2lubGluZScsXG4gICAgJ3JlYWRvbmx5JyxcbiAgICAncmVxdWlyZWQnLFxuICAgICdyZXZlcnNlZCcsXG4gICAgJ3NlbGVjdGVkJ1xuXSk7XG5cbi8qKiByZWdleCBvZiBhbGwgaHRtbCB2b2lkIGVsZW1lbnQgbmFtZXMgKi9cbmNvbnN0IHZvaWRfZWxlbWVudF9uYW1lcyA9IC9eKD86YXJlYXxiYXNlfGJyfGNvbHxjb21tYW5kfGVtYmVkfGhyfGltZ3xpbnB1dHxrZXlnZW58bGlua3xtZXRhfHBhcmFtfHNvdXJjZXx0cmFja3x3YnIpJC87XG5mdW5jdGlvbiBpc192b2lkKG5hbWUpIHtcbiAgICByZXR1cm4gdm9pZF9lbGVtZW50X25hbWVzLnRlc3QobmFtZSkgfHwgbmFtZS50b0xvd2VyQ2FzZSgpID09PSAnIWRvY3R5cGUnO1xufVxuXG5jb25zdCBpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3RlciA9IC9bXFxzJ1wiPi89XFx1e0ZERDB9LVxcdXtGREVGfVxcdXtGRkZFfVxcdXtGRkZGfVxcdXsxRkZGRX1cXHV7MUZGRkZ9XFx1ezJGRkZFfVxcdXsyRkZGRn1cXHV7M0ZGRkV9XFx1ezNGRkZGfVxcdXs0RkZGRX1cXHV7NEZGRkZ9XFx1ezVGRkZFfVxcdXs1RkZGRn1cXHV7NkZGRkV9XFx1ezZGRkZGfVxcdXs3RkZGRX1cXHV7N0ZGRkZ9XFx1ezhGRkZFfVxcdXs4RkZGRn1cXHV7OUZGRkV9XFx1ezlGRkZGfVxcdXtBRkZGRX1cXHV7QUZGRkZ9XFx1e0JGRkZFfVxcdXtCRkZGRn1cXHV7Q0ZGRkV9XFx1e0NGRkZGfVxcdXtERkZGRX1cXHV7REZGRkZ9XFx1e0VGRkZFfVxcdXtFRkZGRn1cXHV7RkZGRkV9XFx1e0ZGRkZGfVxcdXsxMEZGRkV9XFx1ezEwRkZGRn1dL3U7XG4vLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGVzLTJcbi8vIGh0dHBzOi8vaW5mcmEuc3BlYy53aGF0d2cub3JnLyNub25jaGFyYWN0ZXJcbmZ1bmN0aW9uIHNwcmVhZChhcmdzLCBhdHRyc190b19hZGQpIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbih7fSwgLi4uYXJncyk7XG4gICAgaWYgKGF0dHJzX3RvX2FkZCkge1xuICAgICAgICBjb25zdCBjbGFzc2VzX3RvX2FkZCA9IGF0dHJzX3RvX2FkZC5jbGFzc2VzO1xuICAgICAgICBjb25zdCBzdHlsZXNfdG9fYWRkID0gYXR0cnNfdG9fYWRkLnN0eWxlcztcbiAgICAgICAgaWYgKGNsYXNzZXNfdG9fYWRkKSB7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy5jbGFzcyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyA9IGNsYXNzZXNfdG9fYWRkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyArPSAnICcgKyBjbGFzc2VzX3RvX2FkZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc3R5bGVzX3RvX2FkZCkge1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMuc3R5bGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuc3R5bGUgPSBzdHlsZV9vYmplY3RfdG9fc3RyaW5nKHN0eWxlc190b19hZGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5zdHlsZSA9IHN0eWxlX29iamVjdF90b19zdHJpbmcobWVyZ2Vfc3NyX3N0eWxlcyhhdHRyaWJ1dGVzLnN0eWxlLCBzdHlsZXNfdG9fYWRkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgIGlmIChpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3Rlci50ZXN0KG5hbWUpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGF0dHJpYnV0ZXNbbmFtZV07XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSlcbiAgICAgICAgICAgIHN0ciArPSAnICcgKyBuYW1lO1xuICAgICAgICBlbHNlIGlmIChib29sZWFuX2F0dHJpYnV0ZXMuaGFzKG5hbWUudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSlcbiAgICAgICAgICAgICAgICBzdHIgKz0gJyAnICsgbmFtZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBzdHIgKz0gYCAke25hbWV9PVwiJHt2YWx1ZX1cImA7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc3RyO1xufVxuZnVuY3Rpb24gbWVyZ2Vfc3NyX3N0eWxlcyhzdHlsZV9hdHRyaWJ1dGUsIHN0eWxlX2RpcmVjdGl2ZSkge1xuICAgIGNvbnN0IHN0eWxlX29iamVjdCA9IHt9O1xuICAgIGZvciAoY29uc3QgaW5kaXZpZHVhbF9zdHlsZSBvZiBzdHlsZV9hdHRyaWJ1dGUuc3BsaXQoJzsnKSkge1xuICAgICAgICBjb25zdCBjb2xvbl9pbmRleCA9IGluZGl2aWR1YWxfc3R5bGUuaW5kZXhPZignOicpO1xuICAgICAgICBjb25zdCBuYW1lID0gaW5kaXZpZHVhbF9zdHlsZS5zbGljZSgwLCBjb2xvbl9pbmRleCkudHJpbSgpO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGluZGl2aWR1YWxfc3R5bGUuc2xpY2UoY29sb25faW5kZXggKyAxKS50cmltKCk7XG4gICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBzdHlsZV9vYmplY3RbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBuYW1lIGluIHN0eWxlX2RpcmVjdGl2ZSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHN0eWxlX2RpcmVjdGl2ZVtuYW1lXTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBzdHlsZV9vYmplY3RbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSBzdHlsZV9vYmplY3RbbmFtZV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0eWxlX29iamVjdDtcbn1cbmNvbnN0IEFUVFJfUkVHRVggPSAvWyZcIl0vZztcbmNvbnN0IENPTlRFTlRfUkVHRVggPSAvWyY8XS9nO1xuLyoqXG4gKiBOb3RlOiB0aGlzIG1ldGhvZCBpcyBwZXJmb3JtYW5jZSBzZW5zaXRpdmUgYW5kIGhhcyBiZWVuIG9wdGltaXplZFxuICogaHR0cHM6Ly9naXRodWIuY29tL3N2ZWx0ZWpzL3N2ZWx0ZS9wdWxsLzU3MDFcbiAqL1xuZnVuY3Rpb24gZXNjYXBlKHZhbHVlLCBpc19hdHRyID0gZmFsc2UpIHtcbiAgICBjb25zdCBzdHIgPSBTdHJpbmcodmFsdWUpO1xuICAgIGNvbnN0IHBhdHRlcm4gPSBpc19hdHRyID8gQVRUUl9SRUdFWCA6IENPTlRFTlRfUkVHRVg7XG4gICAgcGF0dGVybi5sYXN0SW5kZXggPSAwO1xuICAgIGxldCBlc2NhcGVkID0gJyc7XG4gICAgbGV0IGxhc3QgPSAwO1xuICAgIHdoaWxlIChwYXR0ZXJuLnRlc3Qoc3RyKSkge1xuICAgICAgICBjb25zdCBpID0gcGF0dGVybi5sYXN0SW5kZXggLSAxO1xuICAgICAgICBjb25zdCBjaCA9IHN0cltpXTtcbiAgICAgICAgZXNjYXBlZCArPSBzdHIuc3Vic3RyaW5nKGxhc3QsIGkpICsgKGNoID09PSAnJicgPyAnJmFtcDsnIDogKGNoID09PSAnXCInID8gJyZxdW90OycgOiAnJmx0OycpKTtcbiAgICAgICAgbGFzdCA9IGkgKyAxO1xuICAgIH1cbiAgICByZXR1cm4gZXNjYXBlZCArIHN0ci5zdWJzdHJpbmcobGFzdCk7XG59XG5mdW5jdGlvbiBlc2NhcGVfYXR0cmlidXRlX3ZhbHVlKHZhbHVlKSB7XG4gICAgLy8ga2VlcCBib29sZWFucywgbnVsbCwgYW5kIHVuZGVmaW5lZCBmb3IgdGhlIHNha2Ugb2YgYHNwcmVhZGBcbiAgICBjb25zdCBzaG91bGRfZXNjYXBlID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jyk7XG4gICAgcmV0dXJuIHNob3VsZF9lc2NhcGUgPyBlc2NhcGUodmFsdWUsIHRydWUpIDogdmFsdWU7XG59XG5mdW5jdGlvbiBlc2NhcGVfb2JqZWN0KG9iaikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgICAgICByZXN1bHRba2V5XSA9IGVzY2FwZV9hdHRyaWJ1dGVfdmFsdWUob2JqW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZWFjaChpdGVtcywgZm4pIHtcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdHIgKz0gZm4oaXRlbXNbaV0sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgbWlzc2luZ19jb21wb25lbnQgPSB7XG4gICAgJCRyZW5kZXI6ICgpID0+ICcnXG59O1xuZnVuY3Rpb24gdmFsaWRhdGVfY29tcG9uZW50KGNvbXBvbmVudCwgbmFtZSkge1xuICAgIGlmICghY29tcG9uZW50IHx8ICFjb21wb25lbnQuJCRyZW5kZXIpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdzdmVsdGU6Y29tcG9uZW50JylcbiAgICAgICAgICAgIG5hbWUgKz0gJyB0aGlzPXsuLi59JztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGA8JHtuYW1lfT4gaXMgbm90IGEgdmFsaWQgU1NSIGNvbXBvbmVudC4gWW91IG1heSBuZWVkIHRvIHJldmlldyB5b3VyIGJ1aWxkIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBkZXBlbmRlbmNpZXMgYXJlIGNvbXBpbGVkLCByYXRoZXIgdGhhbiBpbXBvcnRlZCBhcyBwcmUtY29tcGlsZWQgbW9kdWxlcy4gT3RoZXJ3aXNlIHlvdSBtYXkgbmVlZCB0byBmaXggYSA8JHtuYW1lfT4uYCk7XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnQ7XG59XG5mdW5jdGlvbiBkZWJ1ZyhmaWxlLCBsaW5lLCBjb2x1bW4sIHZhbHVlcykge1xuICAgIGNvbnNvbGUubG9nKGB7QGRlYnVnfSAke2ZpbGUgPyBmaWxlICsgJyAnIDogJyd9KCR7bGluZX06JHtjb2x1bW59KWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyh2YWx1ZXMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICByZXR1cm4gJyc7XG59XG5sZXQgb25fZGVzdHJveTtcbmZ1bmN0aW9uIGNyZWF0ZV9zc3JfY29tcG9uZW50KGZuKSB7XG4gICAgZnVuY3Rpb24gJCRyZW5kZXIocmVzdWx0LCBwcm9wcywgYmluZGluZ3MsIHNsb3RzLCBjb250ZXh0KSB7XG4gICAgICAgIGNvbnN0IHBhcmVudF9jb21wb25lbnQgPSBjdXJyZW50X2NvbXBvbmVudDtcbiAgICAgICAgY29uc3QgJCQgPSB7XG4gICAgICAgICAgICBvbl9kZXN0cm95LFxuICAgICAgICAgICAgY29udGV4dDogbmV3IE1hcChjb250ZXh0IHx8IChwYXJlbnRfY29tcG9uZW50ID8gcGFyZW50X2NvbXBvbmVudC4kJC5jb250ZXh0IDogW10pKSxcbiAgICAgICAgICAgIC8vIHRoZXNlIHdpbGwgYmUgaW1tZWRpYXRlbHkgZGlzY2FyZGVkXG4gICAgICAgICAgICBvbl9tb3VudDogW10sXG4gICAgICAgICAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICAgICAgICAgIGFmdGVyX3VwZGF0ZTogW10sXG4gICAgICAgICAgICBjYWxsYmFja3M6IGJsYW5rX29iamVjdCgpXG4gICAgICAgIH07XG4gICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudCh7ICQkIH0pO1xuICAgICAgICBjb25zdCBodG1sID0gZm4ocmVzdWx0LCBwcm9wcywgYmluZGluZ3MsIHNsb3RzKTtcbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHBhcmVudF9jb21wb25lbnQpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVuZGVyOiAocHJvcHMgPSB7fSwgeyAkJHNsb3RzID0ge30sIGNvbnRleHQgPSBuZXcgTWFwKCkgfSA9IHt9KSA9PiB7XG4gICAgICAgICAgICBvbl9kZXN0cm95ID0gW107XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7IHRpdGxlOiAnJywgaGVhZDogJycsIGNzczogbmV3IFNldCgpIH07XG4gICAgICAgICAgICBjb25zdCBodG1sID0gJCRyZW5kZXIocmVzdWx0LCBwcm9wcywge30sICQkc2xvdHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgcnVuX2FsbChvbl9kZXN0cm95KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaHRtbCxcbiAgICAgICAgICAgICAgICBjc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogQXJyYXkuZnJvbShyZXN1bHQuY3NzKS5tYXAoY3NzID0+IGNzcy5jb2RlKS5qb2luKCdcXG4nKSxcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBudWxsIC8vIFRPRE9cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGhlYWQ6IHJlc3VsdC50aXRsZSArIHJlc3VsdC5oZWFkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAkJHJlbmRlclxuICAgIH07XG59XG5mdW5jdGlvbiBhZGRfYXR0cmlidXRlKG5hbWUsIHZhbHVlLCBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwgfHwgKGJvb2xlYW4gJiYgIXZhbHVlKSlcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIGNvbnN0IGFzc2lnbm1lbnQgPSAoYm9vbGVhbiAmJiB2YWx1ZSA9PT0gdHJ1ZSkgPyAnJyA6IGA9XCIke2VzY2FwZSh2YWx1ZSwgdHJ1ZSl9XCJgO1xuICAgIHJldHVybiBgICR7bmFtZX0ke2Fzc2lnbm1lbnR9YDtcbn1cbmZ1bmN0aW9uIGFkZF9jbGFzc2VzKGNsYXNzZXMpIHtcbiAgICByZXR1cm4gY2xhc3NlcyA/IGAgY2xhc3M9XCIke2NsYXNzZXN9XCJgIDogJyc7XG59XG5mdW5jdGlvbiBzdHlsZV9vYmplY3RfdG9fc3RyaW5nKHN0eWxlX29iamVjdCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzdHlsZV9vYmplY3QpXG4gICAgICAgIC5maWx0ZXIoa2V5ID0+IHN0eWxlX29iamVjdFtrZXldKVxuICAgICAgICAubWFwKGtleSA9PiBgJHtrZXl9OiAke3N0eWxlX29iamVjdFtrZXldfTtgKVxuICAgICAgICAuam9pbignICcpO1xufVxuZnVuY3Rpb24gYWRkX3N0eWxlcyhzdHlsZV9vYmplY3QpIHtcbiAgICBjb25zdCBzdHlsZXMgPSBzdHlsZV9vYmplY3RfdG9fc3RyaW5nKHN0eWxlX29iamVjdCk7XG4gICAgcmV0dXJuIHN0eWxlcyA/IGAgc3R5bGU9XCIke3N0eWxlc31cImAgOiAnJztcbn1cblxuZnVuY3Rpb24gYmluZChjb21wb25lbnQsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaW5kZXggPSBjb21wb25lbnQuJCQucHJvcHNbbmFtZV07XG4gICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29tcG9uZW50LiQkLmJvdW5kW2luZGV4XSA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayhjb21wb25lbnQuJCQuY3R4W2luZGV4XSk7XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlX2NvbXBvbmVudChibG9jaykge1xuICAgIGJsb2NrICYmIGJsb2NrLmMoKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2NvbXBvbmVudChibG9jaywgcGFyZW50X25vZGVzKSB7XG4gICAgYmxvY2sgJiYgYmxvY2subChwYXJlbnRfbm9kZXMpO1xufVxuZnVuY3Rpb24gbW91bnRfY29tcG9uZW50KGNvbXBvbmVudCwgdGFyZ2V0LCBhbmNob3IsIGN1c3RvbUVsZW1lbnQpIHtcbiAgICBjb25zdCB7IGZyYWdtZW50LCBhZnRlcl91cGRhdGUgfSA9IGNvbXBvbmVudC4kJDtcbiAgICBmcmFnbWVudCAmJiBmcmFnbWVudC5tKHRhcmdldCwgYW5jaG9yKTtcbiAgICBpZiAoIWN1c3RvbUVsZW1lbnQpIHtcbiAgICAgICAgLy8gb25Nb3VudCBoYXBwZW5zIGJlZm9yZSB0aGUgaW5pdGlhbCBhZnRlclVwZGF0ZVxuICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld19vbl9kZXN0cm95ID0gY29tcG9uZW50LiQkLm9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgICAgICAvLyBpZiB0aGUgY29tcG9uZW50IHdhcyBkZXN0cm95ZWQgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIC8vIGl0IHdpbGwgdXBkYXRlIHRoZSBgJCQub25fZGVzdHJveWAgcmVmZXJlbmNlIHRvIGBudWxsYC5cbiAgICAgICAgICAgIC8vIHRoZSBkZXN0cnVjdHVyZWQgb25fZGVzdHJveSBtYXkgc3RpbGwgcmVmZXJlbmNlIHRvIHRoZSBvbGQgYXJyYXlcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuJCQub25fZGVzdHJveSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC4kJC5vbl9kZXN0cm95LnB1c2goLi4ubmV3X29uX2Rlc3Ryb3kpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRWRnZSBjYXNlIC0gY29tcG9uZW50IHdhcyBkZXN0cm95ZWQgaW1tZWRpYXRlbHksXG4gICAgICAgICAgICAgICAgLy8gbW9zdCBsaWtlbHkgYXMgYSByZXN1bHQgb2YgYSBiaW5kaW5nIGluaXRpYWxpc2luZ1xuICAgICAgICAgICAgICAgIHJ1bl9hbGwobmV3X29uX2Rlc3Ryb3kpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50LiQkLm9uX21vdW50ID0gW107XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGRlc3Ryb3lfY29tcG9uZW50KGNvbXBvbmVudCwgZGV0YWNoaW5nKSB7XG4gICAgY29uc3QgJCQgPSBjb21wb25lbnQuJCQ7XG4gICAgaWYgKCQkLmZyYWdtZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHJ1bl9hbGwoJCQub25fZGVzdHJveSk7XG4gICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LmQoZGV0YWNoaW5nKTtcbiAgICAgICAgLy8gVE9ETyBudWxsIG91dCBvdGhlciByZWZzLCBpbmNsdWRpbmcgY29tcG9uZW50LiQkIChidXQgbmVlZCB0b1xuICAgICAgICAvLyBwcmVzZXJ2ZSBmaW5hbCBzdGF0ZT8pXG4gICAgICAgICQkLm9uX2Rlc3Ryb3kgPSAkJC5mcmFnbWVudCA9IG51bGw7XG4gICAgICAgICQkLmN0eCA9IFtdO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1ha2VfZGlydHkoY29tcG9uZW50LCBpKSB7XG4gICAgaWYgKGNvbXBvbmVudC4kJC5kaXJ0eVswXSA9PT0gLTEpIHtcbiAgICAgICAgZGlydHlfY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgIHNjaGVkdWxlX3VwZGF0ZSgpO1xuICAgICAgICBjb21wb25lbnQuJCQuZGlydHkuZmlsbCgwKTtcbiAgICB9XG4gICAgY29tcG9uZW50LiQkLmRpcnR5WyhpIC8gMzEpIHwgMF0gfD0gKDEgPDwgKGkgJSAzMSkpO1xufVxuZnVuY3Rpb24gaW5pdChjb21wb25lbnQsIG9wdGlvbnMsIGluc3RhbmNlLCBjcmVhdGVfZnJhZ21lbnQsIG5vdF9lcXVhbCwgcHJvcHMsIGFwcGVuZF9zdHlsZXMsIGRpcnR5ID0gWy0xXSkge1xuICAgIGNvbnN0IHBhcmVudF9jb21wb25lbnQgPSBjdXJyZW50X2NvbXBvbmVudDtcbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KTtcbiAgICBjb25zdCAkJCA9IGNvbXBvbmVudC4kJCA9IHtcbiAgICAgICAgZnJhZ21lbnQ6IG51bGwsXG4gICAgICAgIGN0eDogW10sXG4gICAgICAgIC8vIHN0YXRlXG4gICAgICAgIHByb3BzLFxuICAgICAgICB1cGRhdGU6IG5vb3AsXG4gICAgICAgIG5vdF9lcXVhbCxcbiAgICAgICAgYm91bmQ6IGJsYW5rX29iamVjdCgpLFxuICAgICAgICAvLyBsaWZlY3ljbGVcbiAgICAgICAgb25fbW91bnQ6IFtdLFxuICAgICAgICBvbl9kZXN0cm95OiBbXSxcbiAgICAgICAgb25fZGlzY29ubmVjdDogW10sXG4gICAgICAgIGJlZm9yZV91cGRhdGU6IFtdLFxuICAgICAgICBhZnRlcl91cGRhdGU6IFtdLFxuICAgICAgICBjb250ZXh0OiBuZXcgTWFwKG9wdGlvbnMuY29udGV4dCB8fCAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IFtdKSksXG4gICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZVxuICAgICAgICBjYWxsYmFja3M6IGJsYW5rX29iamVjdCgpLFxuICAgICAgICBkaXJ0eSxcbiAgICAgICAgc2tpcF9ib3VuZDogZmFsc2UsXG4gICAgICAgIHJvb3Q6IG9wdGlvbnMudGFyZ2V0IHx8IHBhcmVudF9jb21wb25lbnQuJCQucm9vdFxuICAgIH07XG4gICAgYXBwZW5kX3N0eWxlcyAmJiBhcHBlbmRfc3R5bGVzKCQkLnJvb3QpO1xuICAgIGxldCByZWFkeSA9IGZhbHNlO1xuICAgICQkLmN0eCA9IGluc3RhbmNlXG4gICAgICAgID8gaW5zdGFuY2UoY29tcG9uZW50LCBvcHRpb25zLnByb3BzIHx8IHt9LCAoaSwgcmV0LCAuLi5yZXN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlc3QubGVuZ3RoID8gcmVzdFswXSA6IHJldDtcbiAgICAgICAgICAgIGlmICgkJC5jdHggJiYgbm90X2VxdWFsKCQkLmN0eFtpXSwgJCQuY3R4W2ldID0gdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkJC5za2lwX2JvdW5kICYmICQkLmJvdW5kW2ldKVxuICAgICAgICAgICAgICAgICAgICAkJC5ib3VuZFtpXSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlYWR5KVxuICAgICAgICAgICAgICAgICAgICBtYWtlX2RpcnR5KGNvbXBvbmVudCwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9KVxuICAgICAgICA6IFtdO1xuICAgICQkLnVwZGF0ZSgpO1xuICAgIHJlYWR5ID0gdHJ1ZTtcbiAgICBydW5fYWxsKCQkLmJlZm9yZV91cGRhdGUpO1xuICAgIC8vIGBmYWxzZWAgYXMgYSBzcGVjaWFsIGNhc2Ugb2Ygbm8gRE9NIGNvbXBvbmVudFxuICAgICQkLmZyYWdtZW50ID0gY3JlYXRlX2ZyYWdtZW50ID8gY3JlYXRlX2ZyYWdtZW50KCQkLmN0eCkgOiBmYWxzZTtcbiAgICBpZiAob3B0aW9ucy50YXJnZXQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaHlkcmF0ZSkge1xuICAgICAgICAgICAgc3RhcnRfaHlkcmF0aW5nKCk7XG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IGNoaWxkcmVuKG9wdGlvbnMudGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5sKG5vZGVzKTtcbiAgICAgICAgICAgIG5vZGVzLmZvckVhY2goZGV0YWNoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5jKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuaW50cm8pXG4gICAgICAgICAgICB0cmFuc2l0aW9uX2luKGNvbXBvbmVudC4kJC5mcmFnbWVudCk7XG4gICAgICAgIG1vdW50X2NvbXBvbmVudChjb21wb25lbnQsIG9wdGlvbnMudGFyZ2V0LCBvcHRpb25zLmFuY2hvciwgb3B0aW9ucy5jdXN0b21FbGVtZW50KTtcbiAgICAgICAgZW5kX2h5ZHJhdGluZygpO1xuICAgICAgICBmbHVzaCgpO1xuICAgIH1cbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG59XG5sZXQgU3ZlbHRlRWxlbWVudDtcbmlmICh0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBTdmVsdGVFbGVtZW50ID0gY2xhc3MgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgY29uc3QgeyBvbl9tb3VudCB9ID0gdGhpcy4kJDtcbiAgICAgICAgICAgIHRoaXMuJCQub25fZGlzY29ubmVjdCA9IG9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHRvZG86IGltcHJvdmUgdHlwaW5nc1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy4kJC5zbG90dGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuJCQuc2xvdHRlZFtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0ciwgX29sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpc1thdHRyXSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgcnVuX2FsbCh0aGlzLiQkLm9uX2Rpc2Nvbm5lY3QpO1xuICAgICAgICB9XG4gICAgICAgICRkZXN0cm95KCkge1xuICAgICAgICAgICAgZGVzdHJveV9jb21wb25lbnQodGhpcywgMSk7XG4gICAgICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICAgICAgfVxuICAgICAgICAkb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIFRPRE8gc2hvdWxkIHRoaXMgZGVsZWdhdGUgdG8gYWRkRXZlbnRMaXN0ZW5lcj9cbiAgICAgICAgICAgIGlmICghaXNfZnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuJCRzZXQgJiYgIWlzX2VtcHR5KCQkcHJvcHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgU3ZlbHRlIGNvbXBvbmVudHMuIFVzZWQgd2hlbiBkZXY9ZmFsc2UuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgJGRlc3Ryb3koKSB7XG4gICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICB9XG4gICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghaXNfZnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9vcDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAkc2V0KCQkcHJvcHMpIHtcbiAgICAgICAgaWYgKHRoaXMuJCRzZXQgJiYgIWlzX2VtcHR5KCQkcHJvcHMpKSB7XG4gICAgICAgICAgICB0aGlzLiQkLnNraXBfYm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy4kJHNldCgkJHByb3BzKTtcbiAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkaXNwYXRjaF9kZXYodHlwZSwgZGV0YWlsKSB7XG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChjdXN0b21fZXZlbnQodHlwZSwgT2JqZWN0LmFzc2lnbih7IHZlcnNpb246ICczLjUyLjAnIH0sIGRldGFpbCksIHsgYnViYmxlczogdHJ1ZSB9KSk7XG59XG5mdW5jdGlvbiBhcHBlbmRfZGV2KHRhcmdldCwgbm9kZSkge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUgfSk7XG4gICAgYXBwZW5kKHRhcmdldCwgbm9kZSk7XG59XG5mdW5jdGlvbiBhcHBlbmRfaHlkcmF0aW9uX2Rldih0YXJnZXQsIG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlIH0pO1xuICAgIGFwcGVuZF9oeWRyYXRpb24odGFyZ2V0LCBub2RlKTtcbn1cbmZ1bmN0aW9uIGluc2VydF9kZXYodGFyZ2V0LCBub2RlLCBhbmNob3IpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlLCBhbmNob3IgfSk7XG4gICAgaW5zZXJ0KHRhcmdldCwgbm9kZSwgYW5jaG9yKTtcbn1cbmZ1bmN0aW9uIGluc2VydF9oeWRyYXRpb25fZGV2KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSwgYW5jaG9yIH0pO1xuICAgIGluc2VydF9oeWRyYXRpb24odGFyZ2V0LCBub2RlLCBhbmNob3IpO1xufVxuZnVuY3Rpb24gZGV0YWNoX2Rldihub2RlKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmUnLCB7IG5vZGUgfSk7XG4gICAgZGV0YWNoKG5vZGUpO1xufVxuZnVuY3Rpb24gZGV0YWNoX2JldHdlZW5fZGV2KGJlZm9yZSwgYWZ0ZXIpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nICYmIGJlZm9yZS5uZXh0U2libGluZyAhPT0gYWZ0ZXIpIHtcbiAgICAgICAgZGV0YWNoX2RldihiZWZvcmUubmV4dFNpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaF9iZWZvcmVfZGV2KGFmdGVyKSB7XG4gICAgd2hpbGUgKGFmdGVyLnByZXZpb3VzU2libGluZykge1xuICAgICAgICBkZXRhY2hfZGV2KGFmdGVyLnByZXZpb3VzU2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGV0YWNoX2FmdGVyX2RldihiZWZvcmUpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBsaXN0ZW5fZGV2KG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zLCBoYXNfcHJldmVudF9kZWZhdWx0LCBoYXNfc3RvcF9wcm9wYWdhdGlvbikge1xuICAgIGNvbnN0IG1vZGlmaWVycyA9IG9wdGlvbnMgPT09IHRydWUgPyBbJ2NhcHR1cmUnXSA6IG9wdGlvbnMgPyBBcnJheS5mcm9tKE9iamVjdC5rZXlzKG9wdGlvbnMpKSA6IFtdO1xuICAgIGlmIChoYXNfcHJldmVudF9kZWZhdWx0KVxuICAgICAgICBtb2RpZmllcnMucHVzaCgncHJldmVudERlZmF1bHQnKTtcbiAgICBpZiAoaGFzX3N0b3BfcHJvcGFnYXRpb24pXG4gICAgICAgIG1vZGlmaWVycy5wdXNoKCdzdG9wUHJvcGFnYXRpb24nKTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUFkZEV2ZW50TGlzdGVuZXInLCB7IG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBtb2RpZmllcnMgfSk7XG4gICAgY29uc3QgZGlzcG9zZSA9IGxpc3Rlbihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmVFdmVudExpc3RlbmVyJywgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGF0dHJfZGV2KG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKVxuICAgICAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVJlbW92ZUF0dHJpYnV0ZScsIHsgbm9kZSwgYXR0cmlidXRlIH0pO1xuICAgIGVsc2VcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXRBdHRyaWJ1dGUnLCB7IG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBwcm9wX2Rldihub2RlLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICBub2RlW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0UHJvcGVydHknLCB7IG5vZGUsIHByb3BlcnR5LCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIGRhdGFzZXRfZGV2KG5vZGUsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIG5vZGUuZGF0YXNldFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldERhdGFzZXQnLCB7IG5vZGUsIHByb3BlcnR5LCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhX2Rldih0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC53aG9sZVRleHQgPT09IGRhdGEpXG4gICAgICAgIHJldHVybjtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldERhdGEnLCB7IG5vZGU6IHRleHQsIGRhdGEgfSk7XG4gICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX2VhY2hfYXJndW1lbnQoYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdzdHJpbmcnICYmICEoYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmICdsZW5ndGgnIGluIGFyZykpIHtcbiAgICAgICAgbGV0IG1zZyA9ICd7I2VhY2h9IG9ubHkgaXRlcmF0ZXMgb3ZlciBhcnJheS1saWtlIG9iamVjdHMuJztcbiAgICAgICAgaWYgKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgYXJnICYmIFN5bWJvbC5pdGVyYXRvciBpbiBhcmcpIHtcbiAgICAgICAgICAgIG1zZyArPSAnIFlvdSBjYW4gdXNlIGEgc3ByZWFkIHRvIGNvbnZlcnQgdGhpcyBpdGVyYWJsZSBpbnRvIGFuIGFycmF5Lic7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVfc2xvdHMobmFtZSwgc2xvdCwga2V5cykge1xuICAgIGZvciAoY29uc3Qgc2xvdF9rZXkgb2YgT2JqZWN0LmtleXMoc2xvdCkpIHtcbiAgICAgICAgaWYgKCF+a2V5cy5pbmRleE9mKHNsb3Rfa2V5KSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGA8JHtuYW1lfT4gcmVjZWl2ZWQgYW4gdW5leHBlY3RlZCBzbG90IFwiJHtzbG90X2tleX1cIi5gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX2R5bmFtaWNfZWxlbWVudCh0YWcpIHtcbiAgICBjb25zdCBpc19zdHJpbmcgPSB0eXBlb2YgdGFnID09PSAnc3RyaW5nJztcbiAgICBpZiAodGFnICYmICFpc19zdHJpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCc8c3ZlbHRlOmVsZW1lbnQ+IGV4cGVjdHMgXCJ0aGlzXCIgYXR0cmlidXRlIHRvIGJlIGEgc3RyaW5nLicpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX3ZvaWRfZHluYW1pY19lbGVtZW50KHRhZykge1xuICAgIGlmICh0YWcgJiYgaXNfdm9pZCh0YWcpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgPHN2ZWx0ZTplbGVtZW50IHRoaXM9XCIke3RhZ31cIj4gaXMgc2VsZi1jbG9zaW5nIGFuZCBjYW5ub3QgaGF2ZSBjb250ZW50LmApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNvbnN0cnVjdF9zdmVsdGVfY29tcG9uZW50X2Rldihjb21wb25lbnQsIHByb3BzKSB7XG4gICAgY29uc3QgZXJyb3JfbWVzc2FnZSA9ICd0aGlzPXsuLi59IG9mIDxzdmVsdGU6Y29tcG9uZW50PiBzaG91bGQgc3BlY2lmeSBhIFN2ZWx0ZSBjb21wb25lbnQuJztcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBjb21wb25lbnQocHJvcHMpO1xuICAgICAgICBpZiAoIWluc3RhbmNlLiQkIHx8ICFpbnN0YW5jZS4kc2V0IHx8ICFpbnN0YW5jZS4kb24gfHwgIWluc3RhbmNlLiRkZXN0cm95KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JfbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSB9ID0gZXJyO1xuICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnICYmIG1lc3NhZ2UuaW5kZXhPZignaXMgbm90IGEgY29uc3RydWN0b3InKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcl9tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgU3ZlbHRlIGNvbXBvbmVudHMgd2l0aCBzb21lIG1pbm9yIGRldi1lbmhhbmNlbWVudHMuIFVzZWQgd2hlbiBkZXY9dHJ1ZS5cbiAqL1xuY2xhc3MgU3ZlbHRlQ29tcG9uZW50RGV2IGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIGlmICghb3B0aW9ucyB8fCAoIW9wdGlvbnMudGFyZ2V0ICYmICFvcHRpb25zLiQkaW5saW5lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3RhcmdldCcgaXMgYSByZXF1aXJlZCBvcHRpb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG4gICAgJGRlc3Ryb3koKSB7XG4gICAgICAgIHN1cGVyLiRkZXN0cm95KCk7XG4gICAgICAgIHRoaXMuJGRlc3Ryb3kgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCB3YXMgYWxyZWFkeSBkZXN0cm95ZWQnKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgIH07XG4gICAgfVxuICAgICRjYXB0dXJlX3N0YXRlKCkgeyB9XG4gICAgJGluamVjdF9zdGF0ZSgpIHsgfVxufVxuLyoqXG4gKiBCYXNlIGNsYXNzIHRvIGNyZWF0ZSBzdHJvbmdseSB0eXBlZCBTdmVsdGUgY29tcG9uZW50cy5cbiAqIFRoaXMgb25seSBleGlzdHMgZm9yIHR5cGluZyBwdXJwb3NlcyBhbmQgc2hvdWxkIGJlIHVzZWQgaW4gYC5kLnRzYCBmaWxlcy5cbiAqXG4gKiAjIyMgRXhhbXBsZTpcbiAqXG4gKiBZb3UgaGF2ZSBjb21wb25lbnQgbGlicmFyeSBvbiBucG0gY2FsbGVkIGBjb21wb25lbnQtbGlicmFyeWAsIGZyb20gd2hpY2hcbiAqIHlvdSBleHBvcnQgYSBjb21wb25lbnQgY2FsbGVkIGBNeUNvbXBvbmVudGAuIEZvciBTdmVsdGUrVHlwZVNjcmlwdCB1c2VycyxcbiAqIHlvdSB3YW50IHRvIHByb3ZpZGUgdHlwaW5ncy4gVGhlcmVmb3JlIHlvdSBjcmVhdGUgYSBgaW5kZXguZC50c2A6XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgU3ZlbHRlQ29tcG9uZW50VHlwZWQgfSBmcm9tIFwic3ZlbHRlXCI7XG4gKiBleHBvcnQgY2xhc3MgTXlDb21wb25lbnQgZXh0ZW5kcyBTdmVsdGVDb21wb25lbnRUeXBlZDx7Zm9vOiBzdHJpbmd9PiB7fVxuICogYGBgXG4gKiBUeXBpbmcgdGhpcyBtYWtlcyBpdCBwb3NzaWJsZSBmb3IgSURFcyBsaWtlIFZTIENvZGUgd2l0aCB0aGUgU3ZlbHRlIGV4dGVuc2lvblxuICogdG8gcHJvdmlkZSBpbnRlbGxpc2Vuc2UgYW5kIHRvIHVzZSB0aGUgY29tcG9uZW50IGxpa2UgdGhpcyBpbiBhIFN2ZWx0ZSBmaWxlXG4gKiB3aXRoIFR5cGVTY3JpcHQ6XG4gKiBgYGBzdmVsdGVcbiAqIDxzY3JpcHQgbGFuZz1cInRzXCI+XG4gKiBcdGltcG9ydCB7IE15Q29tcG9uZW50IH0gZnJvbSBcImNvbXBvbmVudC1saWJyYXJ5XCI7XG4gKiA8L3NjcmlwdD5cbiAqIDxNeUNvbXBvbmVudCBmb289eydiYXInfSAvPlxuICogYGBgXG4gKlxuICogIyMjIyBXaHkgbm90IG1ha2UgdGhpcyBwYXJ0IG9mIGBTdmVsdGVDb21wb25lbnQoRGV2KWA/XG4gKiBCZWNhdXNlXG4gKiBgYGB0c1xuICogY2xhc3MgQVN1YmNsYXNzT2ZTdmVsdGVDb21wb25lbnQgZXh0ZW5kcyBTdmVsdGVDb21wb25lbnQ8e2Zvbzogc3RyaW5nfT4ge31cbiAqIGNvbnN0IGNvbXBvbmVudDogdHlwZW9mIFN2ZWx0ZUNvbXBvbmVudCA9IEFTdWJjbGFzc09mU3ZlbHRlQ29tcG9uZW50O1xuICogYGBgXG4gKiB3aWxsIHRocm93IGEgdHlwZSBlcnJvciwgc28gd2UgbmVlZCB0byBzZXBhcmF0ZSB0aGUgbW9yZSBzdHJpY3RseSB0eXBlZCBjbGFzcy5cbiAqL1xuY2xhc3MgU3ZlbHRlQ29tcG9uZW50VHlwZWQgZXh0ZW5kcyBTdmVsdGVDb21wb25lbnREZXYge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgfVxufVxuZnVuY3Rpb24gbG9vcF9ndWFyZCh0aW1lb3V0KSB7XG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmIChEYXRlLm5vdygpIC0gc3RhcnQgPiB0aW1lb3V0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luZmluaXRlIGxvb3AgZGV0ZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCB7IEh0bWxUYWcsIEh0bWxUYWdIeWRyYXRpb24sIFN2ZWx0ZUNvbXBvbmVudCwgU3ZlbHRlQ29tcG9uZW50RGV2LCBTdmVsdGVDb21wb25lbnRUeXBlZCwgU3ZlbHRlRWxlbWVudCwgYWN0aW9uX2Rlc3Ryb3llciwgYWRkX2F0dHJpYnV0ZSwgYWRkX2NsYXNzZXMsIGFkZF9mbHVzaF9jYWxsYmFjaywgYWRkX2xvY2F0aW9uLCBhZGRfcmVuZGVyX2NhbGxiYWNrLCBhZGRfcmVzaXplX2xpc3RlbmVyLCBhZGRfc3R5bGVzLCBhZGRfdHJhbnNmb3JtLCBhZnRlclVwZGF0ZSwgYXBwZW5kLCBhcHBlbmRfZGV2LCBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldCwgYXBwZW5kX2h5ZHJhdGlvbiwgYXBwZW5kX2h5ZHJhdGlvbl9kZXYsIGFwcGVuZF9zdHlsZXMsIGFzc2lnbiwgYXR0ciwgYXR0cl9kZXYsIGF0dHJpYnV0ZV90b19vYmplY3QsIGJlZm9yZVVwZGF0ZSwgYmluZCwgYmluZGluZ19jYWxsYmFja3MsIGJsYW5rX29iamVjdCwgYnViYmxlLCBjaGVja19vdXRyb3MsIGNoaWxkcmVuLCBjbGFpbV9jb21wb25lbnQsIGNsYWltX2VsZW1lbnQsIGNsYWltX2h0bWxfdGFnLCBjbGFpbV9zcGFjZSwgY2xhaW1fc3ZnX2VsZW1lbnQsIGNsYWltX3RleHQsIGNsZWFyX2xvb3BzLCBjb21wb25lbnRfc3Vic2NyaWJlLCBjb21wdXRlX3Jlc3RfcHJvcHMsIGNvbXB1dGVfc2xvdHMsIGNvbnN0cnVjdF9zdmVsdGVfY29tcG9uZW50LCBjb25zdHJ1Y3Rfc3ZlbHRlX2NvbXBvbmVudF9kZXYsIGNyZWF0ZUV2ZW50RGlzcGF0Y2hlciwgY3JlYXRlX2FuaW1hdGlvbiwgY3JlYXRlX2JpZGlyZWN0aW9uYWxfdHJhbnNpdGlvbiwgY3JlYXRlX2NvbXBvbmVudCwgY3JlYXRlX2luX3RyYW5zaXRpb24sIGNyZWF0ZV9vdXRfdHJhbnNpdGlvbiwgY3JlYXRlX3Nsb3QsIGNyZWF0ZV9zc3JfY29tcG9uZW50LCBjdXJyZW50X2NvbXBvbmVudCwgY3VzdG9tX2V2ZW50LCBkYXRhc2V0X2RldiwgZGVidWcsIGRlc3Ryb3lfYmxvY2ssIGRlc3Ryb3lfY29tcG9uZW50LCBkZXN0cm95X2VhY2gsIGRldGFjaCwgZGV0YWNoX2FmdGVyX2RldiwgZGV0YWNoX2JlZm9yZV9kZXYsIGRldGFjaF9iZXR3ZWVuX2RldiwgZGV0YWNoX2RldiwgZGlydHlfY29tcG9uZW50cywgZGlzcGF0Y2hfZGV2LCBlYWNoLCBlbGVtZW50LCBlbGVtZW50X2lzLCBlbXB0eSwgZW5kX2h5ZHJhdGluZywgZXNjYXBlLCBlc2NhcGVfYXR0cmlidXRlX3ZhbHVlLCBlc2NhcGVfb2JqZWN0LCBleGNsdWRlX2ludGVybmFsX3Byb3BzLCBmaXhfYW5kX2Rlc3Ryb3lfYmxvY2ssIGZpeF9hbmRfb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2ssIGZpeF9wb3NpdGlvbiwgZmx1c2gsIGdldEFsbENvbnRleHRzLCBnZXRDb250ZXh0LCBnZXRfYWxsX2RpcnR5X2Zyb21fc2NvcGUsIGdldF9iaW5kaW5nX2dyb3VwX3ZhbHVlLCBnZXRfY3VycmVudF9jb21wb25lbnQsIGdldF9jdXN0b21fZWxlbWVudHNfc2xvdHMsIGdldF9yb290X2Zvcl9zdHlsZSwgZ2V0X3Nsb3RfY2hhbmdlcywgZ2V0X3NwcmVhZF9vYmplY3QsIGdldF9zcHJlYWRfdXBkYXRlLCBnZXRfc3RvcmVfdmFsdWUsIGdsb2JhbHMsIGdyb3VwX291dHJvcywgaGFuZGxlX3Byb21pc2UsIGhhc0NvbnRleHQsIGhhc19wcm9wLCBoZWFkX3NlbGVjdG9yLCBpZGVudGl0eSwgaW5pdCwgaW5zZXJ0LCBpbnNlcnRfZGV2LCBpbnNlcnRfaHlkcmF0aW9uLCBpbnNlcnRfaHlkcmF0aW9uX2RldiwgaW50cm9zLCBpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3RlciwgaXNfY2xpZW50LCBpc19jcm9zc29yaWdpbiwgaXNfZW1wdHksIGlzX2Z1bmN0aW9uLCBpc19wcm9taXNlLCBpc192b2lkLCBsaXN0ZW4sIGxpc3Rlbl9kZXYsIGxvb3AsIGxvb3BfZ3VhcmQsIG1lcmdlX3Nzcl9zdHlsZXMsIG1pc3NpbmdfY29tcG9uZW50LCBtb3VudF9jb21wb25lbnQsIG5vb3AsIG5vdF9lcXVhbCwgbm93LCBudWxsX3RvX2VtcHR5LCBvYmplY3Rfd2l0aG91dF9wcm9wZXJ0aWVzLCBvbkRlc3Ryb3ksIG9uTW91bnQsIG9uY2UsIG91dHJvX2FuZF9kZXN0cm95X2Jsb2NrLCBwcmV2ZW50X2RlZmF1bHQsIHByb3BfZGV2LCBxdWVyeV9zZWxlY3Rvcl9hbGwsIHJhZiwgcnVuLCBydW5fYWxsLCBzYWZlX25vdF9lcXVhbCwgc2NoZWR1bGVfdXBkYXRlLCBzZWxlY3RfbXVsdGlwbGVfdmFsdWUsIHNlbGVjdF9vcHRpb24sIHNlbGVjdF9vcHRpb25zLCBzZWxlY3RfdmFsdWUsIHNlbGYsIHNldENvbnRleHQsIHNldF9hdHRyaWJ1dGVzLCBzZXRfY3VycmVudF9jb21wb25lbnQsIHNldF9jdXN0b21fZWxlbWVudF9kYXRhLCBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YV9tYXAsIHNldF9kYXRhLCBzZXRfZGF0YV9kZXYsIHNldF9pbnB1dF90eXBlLCBzZXRfaW5wdXRfdmFsdWUsIHNldF9ub3csIHNldF9yYWYsIHNldF9zdG9yZV92YWx1ZSwgc2V0X3N0eWxlLCBzZXRfc3ZnX2F0dHJpYnV0ZXMsIHNwYWNlLCBzcHJlYWQsIHNyY191cmxfZXF1YWwsIHN0YXJ0X2h5ZHJhdGluZywgc3RvcF9wcm9wYWdhdGlvbiwgc3Vic2NyaWJlLCBzdmdfZWxlbWVudCwgdGV4dCwgdGljaywgdGltZV9yYW5nZXNfdG9fYXJyYXksIHRvX251bWJlciwgdG9nZ2xlX2NsYXNzLCB0cmFuc2l0aW9uX2luLCB0cmFuc2l0aW9uX291dCwgdHJ1c3RlZCwgdXBkYXRlX2F3YWl0X2Jsb2NrX2JyYW5jaCwgdXBkYXRlX2tleWVkX2VhY2gsIHVwZGF0ZV9zbG90LCB1cGRhdGVfc2xvdF9iYXNlLCB2YWxpZGF0ZV9jb21wb25lbnQsIHZhbGlkYXRlX2R5bmFtaWNfZWxlbWVudCwgdmFsaWRhdGVfZWFjaF9hcmd1bWVudCwgdmFsaWRhdGVfZWFjaF9rZXlzLCB2YWxpZGF0ZV9zbG90cywgdmFsaWRhdGVfc3RvcmUsIHZhbGlkYXRlX3ZvaWRfZHluYW1pY19lbGVtZW50LCB4bGlua19hdHRyIH07XG4iLCI8c2NyaXB0IGxhbmc9XCJ0c1wiPlxuICBpbXBvcnQgeyBjcmVhdGVFdmVudERpc3BhdGNoZXIgfSBmcm9tIFwic3ZlbHRlXCI7XG5cbiAgZXhwb3J0IGxldCBwb3B1cDogc3RyaW5nO1xuICBleHBvcnQgbGV0IGRpc2FibGVkID0gZmFsc2U7XG5cbiAgY29uc3QgZGlzcGF0Y2hlciA9IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpO1xuICBjb25zdCBoYW5kbGVDbGljayA9ICgpID0+IHtcbiAgICBkaXNwYXRjaGVyKFwiY2xpY2tcIik7XG4gIH07XG48L3NjcmlwdD5cblxuPGJ1dHRvblxuICBhcmlhLWxhYmVsPXtwb3B1cH1cbiAgY2xhc3M6bW9kLWN0YT17IWRpc2FibGVkfVxuICB7ZGlzYWJsZWR9XG4gIG9uOmNsaWNrPXtoYW5kbGVDbGlja31cbj5cbiAgPHNsb3QgLz5cbjwvYnV0dG9uPlxuIiwiPHNjcmlwdD5cbiAgZXhwb3J0IGxldCBzaXplID0gMjRcbjwvc2NyaXB0PlxuPHN2Z1xuICB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcbiAgd2lkdGg9e3NpemV9XG4gIGhlaWdodD17c2l6ZX1cbiAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gIGZpbGw9XCJub25lXCJcbiAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgc3Ryb2tlLXdpZHRoPVwiMlwiXG4gIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIlxuICBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiXG4gIHsuLi4kJHJlc3RQcm9wc31cbj5cbiAgPHNsb3QgLz5cbiAgPHBhdGggZD1cIk0xNC41IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY3LjVMMTQuNSAyelwiIC8+XG4gIDxwb2x5bGluZSBwb2ludHM9XCIxNCAyIDE0IDggMjAgOFwiIC8+XG48L3N2Zz4iLCI8c2NyaXB0IGxhbmc9XCJ0c1wiPlxuICBpbXBvcnQgeyBjcmVhdGVFdmVudERpc3BhdGNoZXIgfSBmcm9tIFwic3ZlbHRlXCI7XG5cbiAgZXhwb3J0IGxldCBwb3B1cDogc3RyaW5nO1xuICBleHBvcnQgbGV0IGRpc2FibGVkID0gZmFsc2U7XG5cbiAgY29uc3QgZGlzcGF0Y2hlciA9IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpO1xuICBjb25zdCBoYW5kbGVDbGljayA9ICgpID0+IHtcbiAgICBpZiAoIWRpc2FibGVkKSB7XG4gICAgICBkaXNwYXRjaGVyKFwiY2xpY2tcIik7XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG5cbjxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+XG4gIDxidXR0b25cbiAgICBhcmlhLWxhYmVsPXtwb3B1cH1cbiAgICB7ZGlzYWJsZWR9XG4gICAgb246Y2xpY2s9e2hhbmRsZUNsaWNrfVxuICAgIGNsYXNzPXtkaXNhYmxlZCA/IFwiYnV0dG9uLWRpc2FibGVkXCIgOiBcImJ1dHRvbi1lbmFibGVkXCJ9XG4gICAgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgcGFkZGluZzogMFwiXG4gID5cbiAgICA8c2xvdCAvPlxuICA8L2J1dHRvbj5cbjwvZGl2PlxuXG48c3R5bGU+XG4gIC53cmFwcGVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIG1hcmdpbjogMDtcbiAgfVxuICAuYnV0dG9uLWVuYWJsZWQ6aG92ZXIge1xuICAgIC8qbm9pbnNwZWN0aW9uIENzc1VucmVzb2x2ZWRDdXN0b21Qcm9wZXJ0eSovXG4gICAgY29sb3I6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCk7XG4gIH1cbiAgLmJ1dHRvbi1kaXNhYmxlZCB7XG4gICAgLypub2luc3BlY3Rpb24gQ3NzVW5yZXNvbHZlZEN1c3RvbVByb3BlcnR5Ki9cbiAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7XG4gIH1cbjwvc3R5bGU+XG4iLCI8IS0tc3VwcHJlc3MgTGFiZWxlZFN0YXRlbWVudEpTIC0tPlxuPHNjcmlwdCBsYW5nPVwidHNcIj5cbiAgaW1wb3J0IE9ic2lkaWFuQnV0dG9uIGZyb20gXCIuL09ic2lkaWFuQnV0dG9uLnN2ZWx0ZVwiO1xuICBpbXBvcnQgeyBGaWxlIH0gZnJvbSBcInN2ZWx0ZS1sdWNpZGUtaWNvbnNcIjtcbiAgaW1wb3J0IE9ic2lkaWFuSWNvbkJ1dHRvbiBmcm9tIFwiLi9PYnNpZGlhbkljb25CdXR0b24uc3ZlbHRlXCI7XG4gIGltcG9ydCB0eXBlIHsgQ3VzdG9tRGljdGlvbmFyeVdvcmQgfSBmcm9tIFwiLi4vLi4vbW9kZWwvV29yZFwiO1xuICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuXG4gIHR5cGUgRGljdGlvbmFyeSA9IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHBhdGg6IHN0cmluZztcbiAgfTtcblxuICBleHBvcnQgbGV0IGRpY3Rpb25hcmllczogRGljdGlvbmFyeVtdO1xuICBleHBvcnQgbGV0IHNlbGVjdGVkRGljdGlvbmFyeTogRGljdGlvbmFyeTtcbiAgZXhwb3J0IGxldCBpbnB1dFdvcmQ6IHN0cmluZyA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgdXNlRGlzcGxheWVkV29yZCA9IGZhbHNlO1xuICBleHBvcnQgbGV0IGRpc3BsYXllZFdvcmQ6IHN0cmluZyA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgYWxpYXNlczogc3RyaW5nW10gPSBbXTtcbiAgZXhwb3J0IGxldCBkaXZpZGVyRm9yRGlzcGxheSA9IFwiXCI7XG5cbiAgZXhwb3J0IGxldCBvblN1Ym1pdDogKFxuICAgIGRpY3Rpb25hcnlQYXRoOiBzdHJpbmcsXG4gICAgd29yZDogQ3VzdG9tRGljdGlvbmFyeVdvcmRcbiAgKSA9PiB2b2lkO1xuICBleHBvcnQgbGV0IG9uQ2xpY2tGaWxlSWNvbjogKGRpY3Rpb25hcnlQYXRoOiBzdHJpbmcpID0+IHZvaWQ7XG5cbiAgbGV0IGFsaWFzZXNTdHIgPSBhbGlhc2VzLmpvaW4oXCJcXG5cIik7XG4gIGxldCB3b3JkUmVmID0gbnVsbDtcbiAgbGV0IGRpc3BsYXllZFdvcmRSZWYgPSBudWxsO1xuXG4gICQ6IGVuYWJsZVN1Ym1pdCA9IGlucHV0V29yZC5sZW5ndGggPiAwO1xuICAkOiBlbmFibGVEaXNwbGF5ZWRXb3JkID0gQm9vbGVhbihkaXZpZGVyRm9yRGlzcGxheSk7XG4gICQ6IGZpcnN0V29yZFRpdGxlID0gdXNlRGlzcGxheWVkV29yZCA/IFwiSW5zZXJ0ZWQgd29yZFwiIDogXCJXb3JkXCI7XG4gICQ6IHtcbiAgICBpZiAodXNlRGlzcGxheWVkV29yZCkge1xuICAgICAgZGlzcGxheWVkV29yZFJlZj8uZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSAoKSA9PiB7XG4gICAgb25TdWJtaXQoc2VsZWN0ZWREaWN0aW9uYXJ5LnBhdGgsIHtcbiAgICAgIHZhbHVlOiBkaXNwbGF5ZWRXb3JkIHx8IGlucHV0V29yZCxcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgYWxpYXNlczogYWxpYXNlc1N0ci5zcGxpdChcIlxcblwiKSxcbiAgICAgIHR5cGU6IFwiY3VzdG9tRGljdGlvbmFyeVwiLFxuICAgICAgY3JlYXRlZFBhdGg6IHNlbGVjdGVkRGljdGlvbmFyeS5wYXRoLFxuICAgICAgaW5zZXJ0ZWRUZXh0OiBkaXNwbGF5ZWRXb3JkID8gaW5wdXRXb3JkIDogdW5kZWZpbmVkLFxuICAgIH0pO1xuICB9O1xuXG4gIG9uTW91bnQoKCkgPT4ge1xuICAgIHNldFRpbWVvdXQoKCkgPT4gd29yZFJlZi5mb2N1cygpLCA1MCk7XG4gIH0pO1xuPC9zY3JpcHQ+XG5cbjxkaXY+XG4gIDxoMj5BZGQgYSB3b3JkIHRvIGEgY3VzdG9tIGRpY3Rpb25hcnk8L2gyPlxuXG4gIDxoMz5EaWN0aW9uYXJ5PC9oMz5cbiAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGdhcDogMTBweFwiPlxuICAgIDxzZWxlY3QgYmluZDp2YWx1ZT17c2VsZWN0ZWREaWN0aW9uYXJ5fSBjbGFzcz1cImRyb3Bkb3duXCI+XG4gICAgICB7I2VhY2ggZGljdGlvbmFyaWVzIGFzIGRpY3Rpb25hcnl9XG4gICAgICAgIDxvcHRpb24gdmFsdWU9e2RpY3Rpb25hcnl9PlxuICAgICAgICAgIHtkaWN0aW9uYXJ5LnBhdGh9XG4gICAgICAgIDwvb3B0aW9uPlxuICAgICAgey9lYWNofVxuICAgIDwvc2VsZWN0PlxuICAgIDxPYnNpZGlhbkljb25CdXR0b25cbiAgICAgIHBvcHVwPVwiT3BlbiB0aGUgZmlsZVwiXG4gICAgICBvbjpjbGljaz17KCkgPT4gb25DbGlja0ZpbGVJY29uKHNlbGVjdGVkRGljdGlvbmFyeS5wYXRoKX1cbiAgICA+XG4gICAgICA8RmlsZSAvPlxuICAgIDwvT2JzaWRpYW5JY29uQnV0dG9uPlxuICA8L2Rpdj5cblxuICA8aDM+e2ZpcnN0V29yZFRpdGxlfTwvaDM+XG4gIDx0ZXh0YXJlYVxuICAgIGJpbmQ6dmFsdWU9e2lucHV0V29yZH1cbiAgICBzdHlsZT1cIndpZHRoOiAxMDAlO1wiXG4gICAgcm93cz1cIjNcIlxuICAgIGJpbmQ6dGhpcz17d29yZFJlZn1cbiAgLz5cblxuICB7I2lmIGVuYWJsZURpc3BsYXllZFdvcmR9XG4gICAgPGxhYmVsPlxuICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGJpbmQ6Y2hlY2tlZD17dXNlRGlzcGxheWVkV29yZH0gLz5cbiAgICAgIERpc3Rpbmd1aXNoIGJldHdlZW4gZGlzcGxheSBhbmQgaW5zZXJ0aW9uXG4gICAgPC9sYWJlbD5cbiAgey9pZn1cblxuICB7I2lmIHVzZURpc3BsYXllZFdvcmR9XG4gICAgPGgzPkRpc3BsYXllZCBXb3JkPC9oMz5cbiAgICA8dGV4dGFyZWFcbiAgICAgIGJpbmQ6dmFsdWU9e2Rpc3BsYXllZFdvcmR9XG4gICAgICBzdHlsZT1cIndpZHRoOiAxMDAlO1wiXG4gICAgICByb3dzPVwiM1wiXG4gICAgICBiaW5kOnRoaXM9e2Rpc3BsYXllZFdvcmRSZWZ9XG4gICAgLz5cbiAgey9pZn1cblxuICA8aDM+RGVzY3JpcHRpb248L2gzPlxuICA8aW5wdXQgdHlwZT1cInRleHRcIiBiaW5kOnZhbHVlPXtkZXNjcmlwdGlvbn0gc3R5bGU9XCJ3aWR0aDogMTAwJTtcIiAvPlxuXG4gIDxoMz5BbGlhc2VzIChmb3IgZWFjaCBsaW5lKTwvaDM+XG4gIDx0ZXh0YXJlYSBiaW5kOnZhbHVlPXthbGlhc2VzU3RyfSBzdHlsZT1cIndpZHRoOiAxMDAlO1wiIHJvd3M9XCIzXCIgLz5cblxuICA8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyOyB3aWR0aDogMTAwJTsgcGFkZGluZy10b3A6IDE1cHg7XCI+XG4gICAgPE9ic2lkaWFuQnV0dG9uIGRpc2FibGVkPXshZW5hYmxlU3VibWl0fSBvbjpjbGljaz17aGFuZGxlU3VibWl0fVxuICAgICAgPlN1Ym1pdDwvT2JzaWRpYW5CdXR0b25cbiAgICA+XG4gIDwvZGl2PlxuPC9kaXY+XG5cbjxzdHlsZT5cbjwvc3R5bGU+XG4iLCJpbXBvcnQgeyBBcHAsIE1vZGFsLCBOb3RpY2UgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IEFwcEhlbHBlciB9IGZyb20gXCIuLi9hcHAtaGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IEN1c3RvbURpY3Rpb25hcnlXb3JkIH0gZnJvbSBcIi4uL21vZGVsL1dvcmRcIjtcbmltcG9ydCBDdXN0b21EaWN0aW9uYXJ5V29yZEFkZCBmcm9tIFwiLi9jb21wb25lbnQvQ3VzdG9tRGljdGlvbmFyeVdvcmRBZGQuc3ZlbHRlXCI7XG5cbmV4cG9ydCBjbGFzcyBDdXN0b21EaWN0aW9uYXJ5V29yZEFkZE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBjb21wb25lbnQ6IEN1c3RvbURpY3Rpb25hcnlXb3JkQWRkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIGRpY3Rpb25hcnlQYXRoczogc3RyaW5nW10sXG4gICAgaW5pdGlhbFZhbHVlOiBzdHJpbmcgPSBcIlwiLFxuICAgIGRpdmlkZXJGb3JEaXNwbGF5OiBzdHJpbmcgPSBcIlwiLFxuICAgIG9uU3VibWl0OiAoZGljdGlvbmFyeVBhdGg6IHN0cmluZywgd29yZDogQ3VzdG9tRGljdGlvbmFyeVdvcmQpID0+IHZvaWRcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICBjb25zdCBhcHBIZWxwZXIgPSBuZXcgQXBwSGVscGVyKGFwcCk7XG5cbiAgICBjb25zdCBkaWN0aW9uYXJpZXMgPSBkaWN0aW9uYXJ5UGF0aHMubWFwKCh4KSA9PiAoeyBpZDogeCwgcGF0aDogeCB9KSk7XG5cbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICB0aGlzLmNvbXBvbmVudCA9IG5ldyBDdXN0b21EaWN0aW9uYXJ5V29yZEFkZCh7XG4gICAgICB0YXJnZXQ6IGNvbnRlbnRFbCxcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGRpY3Rpb25hcmllcyxcbiAgICAgICAgc2VsZWN0ZWREaWN0aW9uYXJ5OiBkaWN0aW9uYXJpZXNbMF0sXG4gICAgICAgIGlucHV0V29yZDogaW5pdGlhbFZhbHVlLFxuICAgICAgICBkaXZpZGVyRm9yRGlzcGxheSxcbiAgICAgICAgb25TdWJtaXQsXG4gICAgICAgIG9uQ2xpY2tGaWxlSWNvbjogKGRpY3Rpb25hcnlQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBjb25zdCBtYXJrZG93bkZpbGUgPSBhcHBIZWxwZXIuZ2V0TWFya2Rvd25GaWxlQnlQYXRoKGRpY3Rpb25hcnlQYXRoKTtcbiAgICAgICAgICBpZiAoIW1hcmtkb3duRmlsZSkge1xuICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIE9iamVjdEFsbG9jYXRpb25JZ25vcmVkXG4gICAgICAgICAgICBuZXcgTm90aWNlKGBDYW4ndCBvcGVuICR7ZGljdGlvbmFyeVBhdGh9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIGFwcEhlbHBlci5vcGVuTWFya2Rvd25GaWxlKG1hcmtkb3duRmlsZSwgdHJ1ZSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgb25DbG9zZSgpIHtcbiAgICBzdXBlci5vbkNsb3NlKCk7XG4gICAgdGhpcy5jb21wb25lbnQuJGRlc3Ryb3koKTtcbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcclxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufTtcclxudmFyIF9fcmVhZCA9ICh0aGlzICYmIHRoaXMuX19yZWFkKSB8fCBmdW5jdGlvbiAobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59O1xyXG52YXIgX19zcHJlYWRBcnJheSA9ICh0aGlzICYmIHRoaXMuX19zcHJlYWRBcnJheSkgfHwgZnVuY3Rpb24gKHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbi8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XHJcbnZhciBpc09iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcclxuICAgIGlmICh0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgT2JqZWN0LmdldFByb3RvdHlwZU9mID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xyXG4gICAgICAgICAgICByZXR1cm4gcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlIHx8IHByb3RvdHlwZSA9PT0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgT2JqZWN0XVwiO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG52YXIgbWVyZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBvYmplY3RzW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2JqZWN0cy5yZWR1Y2UoZnVuY3Rpb24gKHJlc3VsdCwgY3VycmVudCkge1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGN1cnJlbnQpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudHMgcHJvdmlkZWQgdG8gdHMtZGVlcG1lcmdlIG11c3QgYmUgb2JqZWN0cywgbm90IGFycmF5cy5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIE9iamVjdC5rZXlzKGN1cnJlbnQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICBpZiAoW1wiX19wcm90b19fXCIsIFwiY29uc3RydWN0b3JcIiwgXCJwcm90b3R5cGVcIl0uaW5jbHVkZXMoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdFtrZXldKSAmJiBBcnJheS5pc0FycmF5KGN1cnJlbnRba2V5XSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uub3B0aW9ucy5tZXJnZUFycmF5c1xyXG4gICAgICAgICAgICAgICAgICAgID8gQXJyYXkuZnJvbShuZXcgU2V0KHJlc3VsdFtrZXldLmNvbmNhdChjdXJyZW50W2tleV0pKSlcclxuICAgICAgICAgICAgICAgICAgICA6IGN1cnJlbnRba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpc09iamVjdChyZXN1bHRba2V5XSkgJiYgaXNPYmplY3QoY3VycmVudFtrZXldKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgY3VycmVudFtrZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gY3VycmVudFtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0sIHt9KTtcclxufTtcclxudmFyIGRlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgbWVyZ2VBcnJheXM6IHRydWUsXHJcbn07XHJcbm1lcmdlLm9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcclxubWVyZ2Uud2l0aE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgdmFyIG9iamVjdHMgPSBbXTtcclxuICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgb2JqZWN0c1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcclxuICAgIH1cclxuICAgIG1lcmdlLm9wdGlvbnMgPSBfX2Fzc2lnbih7IG1lcmdlQXJyYXlzOiB0cnVlIH0sIG9wdGlvbnMpO1xyXG4gICAgdmFyIHJlc3VsdCA9IG1lcmdlLmFwcGx5KHZvaWQgMCwgX19zcHJlYWRBcnJheShbXSwgX19yZWFkKG9iamVjdHMpLCBmYWxzZSkpO1xyXG4gICAgbWVyZ2Uub3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuZXhwb3J0cy5kZWZhdWx0ID0gbWVyZ2U7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsImltcG9ydCB7IGRlYm91bmNlLCBOb3RpY2UsIFBsdWdpbiB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHsgQXV0b0NvbXBsZXRlU3VnZ2VzdCB9IGZyb20gXCIuL3VpL0F1dG9Db21wbGV0ZVN1Z2dlc3RcIjtcbmltcG9ydCB7XG4gIERFRkFVTFRfU0VUVElOR1MsXG4gIHR5cGUgU2V0dGluZ3MsXG4gIFZhcmlvdXNDb21wbGVtZW50c1NldHRpbmdUYWIsXG59IGZyb20gXCIuL3NldHRpbmcvc2V0dGluZ3NcIjtcbmltcG9ydCB7IEFwcEhlbHBlciB9IGZyb20gXCIuL2FwcC1oZWxwZXJcIjtcbmltcG9ydCB7IFByb3ZpZGVyU3RhdHVzQmFyIH0gZnJvbSBcIi4vdWkvUHJvdmlkZXJTdGF0dXNCYXJcIjtcbmltcG9ydCB7IEN1c3RvbURpY3Rpb25hcnlXb3JkQWRkTW9kYWwgfSBmcm9tIFwiLi91aS9DdXN0b21EaWN0aW9uYXJ5V29yZEFkZE1vZGFsXCI7XG5pbXBvcnQgbWVyZ2UgZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWYXJpb3VzQ29tcG9uZW50cyBleHRlbmRzIFBsdWdpbiB7XG4gIGFwcEhlbHBlcjogQXBwSGVscGVyO1xuICBzZXR0aW5nczogU2V0dGluZ3M7XG4gIHNldHRpbmdUYWI6IFZhcmlvdXNDb21wbGVtZW50c1NldHRpbmdUYWI7XG4gIHN1Z2dlc3RlcjogQXV0b0NvbXBsZXRlU3VnZ2VzdDtcbiAgc3RhdHVzQmFyPzogUHJvdmlkZXJTdGF0dXNCYXI7XG5cbiAgb251bmxvYWQoKSB7XG4gICAgc3VwZXIub251bmxvYWQoKTtcbiAgICB0aGlzLnN1Z2dlc3Rlci51bnJlZ2lzdGVyKCk7XG4gIH1cblxuICBhc3luYyBvbmxvYWQoKSB7XG4gICAgdGhpcy5hcHBIZWxwZXIgPSBuZXcgQXBwSGVscGVyKHRoaXMuYXBwKTtcblxuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbihcImVkaXRvci1tZW51XCIsIChtZW51KSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5hcHBIZWxwZXIuZ2V0U2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBtZW51LmFkZEl0ZW0oKGl0ZW0pID0+XG4gICAgICAgICAgaXRlbVxuICAgICAgICAgICAgLnNldFRpdGxlKFwiQWRkIHRvIGN1c3RvbSBkaWN0aW9uYXJ5XCIpXG4gICAgICAgICAgICAuc2V0SWNvbihcInN0YWNrZWQtbGV2ZWxzXCIpXG4gICAgICAgICAgICAub25DbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuYWRkV29yZFRvQ3VzdG9tRGljdGlvbmFyeSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICB0aGlzLnNldHRpbmdUYWIgPSBuZXcgVmFyaW91c0NvbXBsZW1lbnRzU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcyk7XG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKHRoaXMuc2V0dGluZ1RhYik7XG5cbiAgICB0aGlzLnN0YXR1c0JhciA9IFByb3ZpZGVyU3RhdHVzQmFyLm5ldyhcbiAgICAgIHRoaXMuYWRkU3RhdHVzQmFySXRlbSgpLFxuICAgICAgdGhpcy5zZXR0aW5ncy5zaG93TWF0Y2hTdHJhdGVneSxcbiAgICAgIHRoaXMuc2V0dGluZ3Muc2hvd0luZGV4aW5nU3RhdHVzLFxuICAgICAgdGhpcy5zZXR0aW5ncy5zaG93Q29tcGxlbWVudEF1dG9tYXRpY2FsbHlcbiAgICApO1xuICAgIHRoaXMuc3RhdHVzQmFyLnNldE9uQ2xpY2tTdHJhdGVneUxpc3RlbmVyKGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuc2V0dGluZ1RhYi50b2dnbGVNYXRjaFN0cmF0ZWd5KCk7XG4gICAgfSk7XG4gICAgdGhpcy5zdGF0dXNCYXIuc2V0T25DbGlja0NvbXBsZW1lbnRBdXRvbWF0aWNhbGx5KGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuc2V0dGluZ1RhYi50b2dnbGVDb21wbGVtZW50QXV0b21hdGljYWxseSgpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZGVib3VuY2VkU2F2ZURhdGEgPSBkZWJvdW5jZShhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgIH0sIDUwMDApO1xuXG4gICAgdGhpcy5zdWdnZXN0ZXIgPSBhd2FpdCBBdXRvQ29tcGxldGVTdWdnZXN0Lm5ldyhcbiAgICAgIHRoaXMuYXBwLFxuICAgICAgdGhpcy5zZXR0aW5ncyxcbiAgICAgIHRoaXMuc3RhdHVzQmFyLFxuICAgICAgZGVib3VuY2VkU2F2ZURhdGFcbiAgICApO1xuICAgIHRoaXMucmVnaXN0ZXJFZGl0b3JTdWdnZXN0KHRoaXMuc3VnZ2VzdGVyKTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogXCJyZWxvYWQtY3VzdG9tLWRpY3Rpb25hcmllc1wiLFxuICAgICAgbmFtZTogXCJSZWxvYWQgY3VzdG9tIGRpY3Rpb25hcmllc1wiLFxuICAgICAgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbXCJNb2RcIiwgXCJTaGlmdFwiXSwga2V5OiBcInJcIiB9XSxcbiAgICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuc3VnZ2VzdGVyLnJlZnJlc2hDdXN0b21EaWN0aW9uYXJ5VG9rZW5zKCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcInJlbG9hZC1jdXJyZW50LXZhdWx0XCIsXG4gICAgICBuYW1lOiBcIlJlbG9hZCBjdXJyZW50IHZhdWx0XCIsXG4gICAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLnN1Z2dlc3Rlci5yZWZyZXNoQ3VycmVudFZhdWx0VG9rZW5zKCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcInRvZ2dsZS1tYXRjaC1zdHJhdGVneVwiLFxuICAgICAgbmFtZTogXCJUb2dnbGUgTWF0Y2ggc3RyYXRlZ3lcIixcbiAgICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2V0dGluZ1RhYi50b2dnbGVNYXRjaFN0cmF0ZWd5KCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcInRvZ2dsZS1jb21wbGVtZW50LWF1dG9tYXRpY2FsbHlcIixcbiAgICAgIG5hbWU6IFwiVG9nZ2xlIENvbXBsZW1lbnQgYXV0b21hdGljYWxseVwiLFxuICAgICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zZXR0aW5nVGFiLnRvZ2dsZUNvbXBsZW1lbnRBdXRvbWF0aWNhbGx5KCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcInNob3ctc3VnZ2VzdGlvbnNcIixcbiAgICAgIG5hbWU6IFwiU2hvdyBzdWdnZXN0aW9uc1wiLFxuICAgICAgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbXCJNb2RcIl0sIGtleTogXCIgXCIgfV0sXG4gICAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLnN1Z2dlc3Rlci50cmlnZ2VyQ29tcGxldGUoKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6IFwiYWRkLXdvcmQtY3VzdG9tLWRpY3Rpb25hcnlcIixcbiAgICAgIG5hbWU6IFwiQWRkIGEgd29yZCB0byBhIGN1c3RvbSBkaWN0aW9uYXJ5XCIsXG4gICAgICBob3RrZXlzOiBbeyBtb2RpZmllcnM6IFtcIk1vZFwiLCBcIlNoaWZ0XCJdLCBrZXk6IFwiIFwiIH1dLFxuICAgICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5hZGRXb3JkVG9DdXN0b21EaWN0aW9uYXJ5KCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcInByZWRpY3RhYmxlLWNvbXBsZW1lbnRzXCIsXG4gICAgICBuYW1lOiBcIlByZWRpY3RhYmxlIGNvbXBsZW1lbnRcIixcbiAgICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGVyLnByZWRpY3RhYmxlQ29tcGxldGUoKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6IFwiY29weS1wbHVnaW4tc2V0dGluZ3NcIixcbiAgICAgIG5hbWU6IFwiQ29weSBwbHVnaW4gc2V0dGluZ3NcIixcbiAgICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KFxuICAgICAgICAgIHRoaXMuc2V0dGluZ1RhYi5nZXRQbHVnaW5TZXR0aW5nc0FzSnNvblN0cmluZygpXG4gICAgICAgICk7XG4gICAgICAgIC8vIG5vaW5zcGVjdGlvbiBPYmplY3RBbGxvY2F0aW9uSWdub3JlZFxuICAgICAgICBuZXcgTm90aWNlKFwiQ29weSBzZXR0aW5ncyBvZiBWYXJpb3VzIENvbXBsZW1lbnRzXCIpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjdXJyZW50U2V0dGluZ3MgPSBhd2FpdCB0aGlzLmxvYWREYXRhKCk7XG4gICAgdGhpcy5zZXR0aW5ncyA9IG1lcmdlKERFRkFVTFRfU0VUVElOR1MsIGN1cnJlbnRTZXR0aW5ncyA/PyB7fSk7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoXG4gICAgbmVlZFVwZGF0ZVRva2Vuczoge1xuICAgICAgY3VycmVudEZpbGU/OiBib29sZWFuO1xuICAgICAgY3VycmVudFZhdWx0PzogYm9vbGVhbjtcbiAgICAgIGN1c3RvbURpY3Rpb25hcnk/OiBib29sZWFuO1xuICAgICAgaW50ZXJuYWxMaW5rPzogYm9vbGVhbjtcbiAgICAgIGZyb250TWF0dGVyPzogYm9vbGVhbjtcbiAgICB9ID0ge31cbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgICBhd2FpdCB0aGlzLnN1Z2dlc3Rlci51cGRhdGVTZXR0aW5ncyh0aGlzLnNldHRpbmdzKTtcbiAgICBpZiAobmVlZFVwZGF0ZVRva2Vucy5jdXJyZW50RmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5zdWdnZXN0ZXIucmVmcmVzaEN1cnJlbnRGaWxlVG9rZW5zKCk7XG4gICAgfVxuICAgIGlmIChuZWVkVXBkYXRlVG9rZW5zLmN1cnJlbnRWYXVsdCkge1xuICAgICAgYXdhaXQgdGhpcy5zdWdnZXN0ZXIucmVmcmVzaEN1cnJlbnRWYXVsdFRva2VucygpO1xuICAgIH1cbiAgICBpZiAobmVlZFVwZGF0ZVRva2Vucy5jdXN0b21EaWN0aW9uYXJ5KSB7XG4gICAgICBhd2FpdCB0aGlzLnN1Z2dlc3Rlci5yZWZyZXNoQ3VzdG9tRGljdGlvbmFyeVRva2VucygpO1xuICAgIH1cbiAgICBpZiAobmVlZFVwZGF0ZVRva2Vucy5pbnRlcm5hbExpbmspIHtcbiAgICAgIGF3YWl0IHRoaXMuc3VnZ2VzdGVyLnJlZnJlc2hJbnRlcm5hbExpbmtUb2tlbnMoKTtcbiAgICB9XG4gICAgaWYgKG5lZWRVcGRhdGVUb2tlbnMuZnJvbnRNYXR0ZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3VnZ2VzdGVyLnJlZnJlc2hGcm9udE1hdHRlclRva2VucygpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFdvcmRUb0N1c3RvbURpY3Rpb25hcnkoKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRXb3JkID0gdGhpcy5hcHBIZWxwZXIuZ2V0U2VsZWN0aW9uKCk7XG4gICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLnN1Z2dlc3Rlci5jdXN0b21EaWN0aW9uYXJ5V29yZFByb3ZpZGVyO1xuICAgIGNvbnN0IG1vZGFsID0gbmV3IEN1c3RvbURpY3Rpb25hcnlXb3JkQWRkTW9kYWwoXG4gICAgICB0aGlzLmFwcCxcbiAgICAgIHByb3ZpZGVyLmVkaXRhYmxlUGF0aHMsXG4gICAgICBzZWxlY3RlZFdvcmQsXG4gICAgICB0aGlzLnNldHRpbmdzLmRlbGltaXRlclRvRGl2aWRlU3VnZ2VzdGlvbnNGb3JEaXNwbGF5RnJvbUluc2VydGlvbixcbiAgICAgIGFzeW5jIChkaWN0aW9uYXJ5UGF0aCwgX3dvcmQpID0+IHtcbiAgICAgICAgLy8gVE9ETzogSWYgc3VwcG9ydCBmb3IgSlNPTiwgdGhpcyBpbXBsZW1lbnRhdGlvbiBkb2Vzbid0IHdvcmsgY29ycmVjdGx5XG4gICAgICAgIGNvbnN0IHdvcmQgPSB7XG4gICAgICAgICAgLi4uX3dvcmQsXG4gICAgICAgICAgY2FyZXRTeW1ib2w6IHRoaXMuc2V0dGluZ3MuY2FyZXRMb2NhdGlvblN5bWJvbEFmdGVyQ29tcGxlbWVudCxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocHJvdmlkZXIud29yZEJ5VmFsdWVbd29yZC52YWx1ZV0pIHtcbiAgICAgICAgICAvLyBub2luc3BlY3Rpb24gT2JqZWN0QWxsb2NhdGlvbklnbm9yZWRcbiAgICAgICAgICBuZXcgTm90aWNlKGDimqAgJHt3b3JkLnZhbHVlfSBhbHJlYWR5IGV4aXN0c2AsIDApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHByb3ZpZGVyLmFkZFdvcmRXaXRoRGljdGlvbmFyeSh3b3JkLCBkaWN0aW9uYXJ5UGF0aCk7XG4gICAgICAgIC8vIG5vaW5zcGVjdGlvbiBPYmplY3RBbGxvY2F0aW9uSWdub3JlZFxuICAgICAgICBuZXcgTm90aWNlKGBBZGRlZCAke3dvcmQudmFsdWV9YCk7XG4gICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIG1vZGFsLm9wZW4oKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbInByZXR0aWZ5IiwiVHJpZSIsInJlcXVpcmUkJDAiLCJyZXF1aXJlJCQxIiwiQ2VkaWN0IiwiY2hpbmVzZVRva2VuaXplciIsInBhcnNlRnJvbnRNYXR0ZXJBbGlhc2VzIiwicGFyc2VGcm9udE1hdHRlclRhZ3MiLCJwYXJzZUZyb250TWF0dGVyU3RyaW5nQXJyYXkiLCJNYXJrZG93blZpZXciLCJub3JtYWxpemVQYXRoIiwic3lub255bUFsaWFzZXMiLCJyZXF1ZXN0IiwiTm90aWNlIiwiRWRpdG9yU3VnZ2VzdCIsImRlYm91bmNlIiwiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciLCJNb2RhbCIsInRoaXMiLCJQbHVnaW4iLCJtZXJnZSJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE0QkE7QUFDTyxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzdCLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2YsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ3ZGLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxPQUFPLE1BQU0sQ0FBQyxxQkFBcUIsS0FBSyxVQUFVO0FBQ3ZFLFFBQVEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNoRixZQUFZLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRixnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxTQUFTO0FBQ1QsSUFBSSxPQUFPLENBQUMsQ0FBQztBQUNiLENBQUM7QUFnQkQ7QUFDTyxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUU7QUFDN0QsSUFBSSxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssWUFBWSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDaEgsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDL0QsUUFBUSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ25HLFFBQVEsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ3RHLFFBQVEsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ3RILFFBQVEsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlFLEtBQUssQ0FB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LFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO0tBQ1YsQ0FBQztJQUNGLElBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxRQUFBLEVBQUUsRUFBRSxHQUFHO0FBQ1AsUUFBQSxFQUFFLEVBQUUsR0FBRztRQUNQLEVBQUUsRUFBRSxDQUFDLEdBQUc7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsR0FBRztRQUNSLEVBQUUsRUFBRSxDQUFDLEdBQUc7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsR0FBRztLQUNSLENBQUM7SUFDRixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDckQsSUFBQSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsUUFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULFFBQUEsR0FBRyxFQUFFLElBQUk7UUFDVCxHQUFHLEVBQUUsQ0FBQyxJQUFJO0FBQ1YsUUFBQSxHQUFHLEVBQUUsR0FBRztBQUNSLFFBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxRQUFBLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLENBQUMsRUFBRTtRQUNSLEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNULFFBQUEsR0FBRyxFQUFFLElBQUk7UUFDVCxHQUFHLEVBQUUsQ0FBQyxJQUFJO0FBQ1YsUUFBQSxHQUFHLEVBQUUsR0FBRztBQUNSLFFBQUEsR0FBRyxFQUFFLElBQUk7S0FDVixDQUFDO0lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLFFBQUEsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsQ0FBQyxJQUFJO0FBQ1YsUUFBQSxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxDQUFDLEdBQUc7UUFDVCxHQUFHLEVBQUUsQ0FBQyxJQUFJO0FBQ1YsUUFBQSxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxDQUFDLElBQUk7UUFDVixHQUFHLEVBQUUsQ0FBQyxHQUFHO0FBQ1QsUUFBQSxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxDQUFDLElBQUk7S0FDWCxDQUFDO0lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRztRQUNYLEdBQUcsRUFBRSxDQUFDLEdBQUc7QUFDVCxRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNULFFBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULFFBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULFFBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxDQUFDLEdBQUc7UUFDVCxHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsR0FBRyxFQUFFLENBQUMsSUFBSTtBQUNWLFFBQUEsR0FBRyxFQUFFLEtBQUs7S0FDWCxDQUFDO0lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRztRQUNYLEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLENBQUMsSUFBSTtBQUNWLFFBQUEsR0FBRyxFQUFFLElBQUk7UUFDVCxHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLEdBQUcsRUFBRSxDQUFDLEtBQUs7QUFDWCxRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxDQUFDLElBQUk7UUFDVixHQUFHLEVBQUUsQ0FBQyxHQUFHO0tBQ1YsQ0FBQztJQUNGLElBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxRQUFBLElBQUksRUFBRSxHQUFHO0FBQ1QsUUFBQSxJQUFJLEVBQUUsR0FBRztBQUNULFFBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxJQUFJLEVBQUUsR0FBRztBQUNULFFBQUEsSUFBSSxFQUFFLEdBQUc7QUFDVCxRQUFBLElBQUksRUFBRSxJQUFJO0FBQ1YsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsR0FBRztRQUNQLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxHQUFHO0FBQ1AsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7UUFDUCxFQUFFLEVBQUUsQ0FBQyxHQUFHO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxHQUFHO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsR0FBRztBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxHQUFHO1FBQ1AsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLEdBQUc7UUFDUixFQUFFLEVBQUUsQ0FBQyxHQUFHO0FBQ1IsUUFBQSxFQUFFLEVBQUUsR0FBRztBQUNQLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxHQUFHO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7UUFDUCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsR0FBRztRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsR0FBRztBQUNSLFFBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxJQUFJLEVBQUUsSUFBSTtLQUNYLENBQUM7SUFDRixJQUFJLENBQUMsS0FBSyxHQUFHO1FBQ1gsSUFBSSxFQUFFLENBQUMsS0FBSztRQUNaLEVBQUUsRUFBRSxDQUFDLEdBQUc7UUFDUixJQUFJLEVBQUUsQ0FBQyxJQUFJO1FBQ1gsSUFBSSxFQUFFLENBQUMsS0FBSztRQUNaLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLEdBQUc7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7UUFDUCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxLQUFLO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxHQUFHO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLEVBQUUsRUFBRSxHQUFHO1FBQ1AsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxHQUFHO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLEdBQUc7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsR0FBRztBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxHQUFHO0FBQ1AsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxLQUFLO1FBQ1YsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLEtBQUs7QUFDVixRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsS0FBSztRQUNWLEVBQUUsRUFBRSxDQUFDLEdBQUc7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxLQUFLO0FBQ1YsUUFBQSxFQUFFLEVBQUUsR0FBRztRQUNQLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxHQUFHO1FBQ1AsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLEdBQUc7UUFDUCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLEdBQUc7UUFDUCxFQUFFLEVBQUUsQ0FBQyxHQUFHO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxHQUFHO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxHQUFHO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxFQUFFLEVBQUUsQ0FBQyxHQUFHO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLElBQUk7UUFDVCxJQUFJLEVBQUUsQ0FBQyxHQUFHO0tBQ1gsQ0FBQztJQUNGLElBQUksQ0FBQyxLQUFLLEdBQUc7UUFDWCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxFQUFFLEVBQUUsR0FBRztBQUNQLFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixJQUFJLEVBQUUsQ0FBQyxJQUFJO1FBQ1gsSUFBSSxFQUFFLENBQUMsSUFBSTtBQUNYLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLElBQUksRUFBRSxJQUFJO0FBQ1YsUUFBQSxJQUFJLEVBQUUsSUFBSTtRQUNWLEVBQUUsRUFBRSxDQUFDLEdBQUc7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsR0FBRztBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ1QsUUFBQSxJQUFJLEVBQUUsSUFBSTtBQUNWLFFBQUEsSUFBSSxFQUFFLElBQUk7UUFDVixFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtRQUNULEVBQUUsRUFBRSxDQUFDLEdBQUc7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsR0FBRztBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLElBQUksRUFBRSxJQUFJO0FBQ1YsUUFBQSxJQUFJLEVBQUUsSUFBSTtRQUNWLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsSUFBSSxFQUFFLENBQUMsSUFBSTtRQUNYLElBQUksRUFBRSxDQUFDLElBQUk7QUFDWCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxJQUFJLEVBQUUsSUFBSTtBQUNWLFFBQUEsSUFBSSxFQUFFLElBQUk7QUFDVixRQUFBLEVBQUUsRUFBRSxHQUFHO0FBQ1AsUUFBQSxFQUFFLEVBQUUsR0FBRztBQUNQLFFBQUEsSUFBSSxFQUFFLElBQUk7QUFDVixRQUFBLElBQUksRUFBRSxJQUFJO1FBQ1YsRUFBRSxFQUFFLENBQUMsR0FBRztBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7UUFDUCxFQUFFLEVBQUUsQ0FBQyxJQUFJO1FBQ1QsRUFBRSxFQUFFLENBQUMsR0FBRztBQUNSLFFBQUEsSUFBSSxFQUFFLElBQUk7QUFDVixRQUFBLElBQUksRUFBRSxJQUFJO0FBQ1YsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxHQUFHO0FBQ1AsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLEVBQUUsRUFBRSxHQUFHO0FBQ1AsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxHQUFHO1FBQ1AsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsR0FBRztBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixJQUFJLEVBQUUsQ0FBQyxJQUFJO1FBQ1gsSUFBSSxFQUFFLENBQUMsSUFBSTtBQUNYLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLElBQUksRUFBRSxDQUFDLEdBQUc7UUFDVixJQUFJLEVBQUUsQ0FBQyxHQUFHO1FBQ1YsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsSUFBSSxFQUFFLElBQUk7QUFDVixRQUFBLElBQUksRUFBRSxJQUFJO0FBQ1YsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsRUFBRSxFQUFFLElBQUk7UUFDUixFQUFFLEVBQUUsQ0FBQyxHQUFHO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxJQUFJLEVBQUUsR0FBRztBQUNULFFBQUEsSUFBSSxFQUFFLEdBQUc7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO1FBQ1IsRUFBRSxFQUFFLENBQUMsR0FBRztBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLEVBQUUsRUFBRSxHQUFHO0FBQ1AsUUFBQSxFQUFFLEVBQUUsR0FBRztBQUNQLFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sRUFBRSxFQUFFLENBQUMsSUFBSTtBQUNULFFBQUEsSUFBSSxFQUFFLEdBQUc7QUFDVCxRQUFBLElBQUksRUFBRSxHQUFHO0FBQ1QsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLEdBQUc7S0FDUixDQUFDO0lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLFFBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxRQUFBLEdBQUcsRUFBRSxJQUFJO0FBQ1QsUUFBQSxHQUFHLEVBQUUsR0FBRztBQUNSLFFBQUEsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsQ0FBQyxHQUFHO1FBQ1QsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNULFFBQUEsR0FBRyxFQUFFLElBQUk7UUFDVCxHQUFHLEVBQUUsQ0FBQyxHQUFHO1FBQ1QsR0FBRyxFQUFFLENBQUMsSUFBSTtBQUNWLFFBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixRQUFBLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLENBQUMsSUFBSTtLQUNYLENBQUM7SUFDRixJQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsUUFBQSxHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxDQUFDLElBQUk7UUFDVixHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsR0FBRyxFQUFFLENBQUMsSUFBSTtBQUNWLFFBQUEsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsQ0FBQyxJQUFJO0tBQ1gsQ0FBQztJQUNGLElBQUksQ0FBQyxLQUFLLEdBQUc7UUFDWCxHQUFHLEVBQUUsQ0FBQyxHQUFHO0FBQ1QsUUFBQSxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxDQUFDLEdBQUc7UUFDVCxHQUFHLEVBQUUsQ0FBQyxJQUFJO0FBQ1YsUUFBQSxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLEdBQUcsRUFBRSxDQUFDLElBQUk7UUFDVixHQUFHLEVBQUUsQ0FBQyxHQUFHO1FBQ1QsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLEdBQUcsRUFBRSxDQUFDLEdBQUc7UUFDVCxHQUFHLEVBQUUsQ0FBQyxJQUFJO0FBQ1YsUUFBQSxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxDQUFDLElBQUk7UUFDVixHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLEdBQUcsRUFBRSxDQUFDLEdBQUc7QUFDVCxRQUFBLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLENBQUMsR0FBRztRQUNULEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLENBQUMsSUFBSTtLQUNYLENBQUM7SUFDRixJQUFJLENBQUMsS0FBSyxHQUFHO1FBQ1gsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNULFFBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxRQUFBLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNULFFBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxHQUFHLEVBQUUsR0FBRztBQUNSLFFBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULFFBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixRQUFBLEdBQUcsRUFBRSxFQUFFO0FBQ1AsUUFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULFFBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNULFFBQUEsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsQ0FBQyxHQUFHO0FBQ1QsUUFBQSxHQUFHLEVBQUUsR0FBRztBQUNSLFFBQUEsR0FBRyxFQUFFLEdBQUc7S0FDVCxDQUFDO0lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRztRQUNYLElBQUksRUFBRSxDQUFDLEdBQUc7QUFDVixRQUFBLElBQUksRUFBRSxHQUFHO1FBQ1QsSUFBSSxFQUFFLENBQUMsR0FBRztBQUNWLFFBQUEsSUFBSSxFQUFFLEVBQUU7QUFDUixRQUFBLElBQUksRUFBRSxJQUFJO1FBQ1YsSUFBSSxFQUFFLENBQUMsR0FBRztBQUNWLFFBQUEsSUFBSSxFQUFFLEdBQUc7UUFDVCxJQUFJLEVBQUUsQ0FBQyxHQUFHO0FBQ1YsUUFBQSxJQUFJLEVBQUUsR0FBRztBQUNULFFBQUEsSUFBSSxFQUFFLEdBQUc7QUFDVCxRQUFBLElBQUksRUFBRSxHQUFHO0FBQ1QsUUFBQSxJQUFJLEVBQUUsR0FBRztRQUNULElBQUksRUFBRSxDQUFDLEVBQUU7S0FDVixDQUFDO0lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ25FLElBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxRQUFBLElBQUksRUFBRSxHQUFHO1FBQ1QsSUFBSSxFQUFFLENBQUMsSUFBSTtBQUNYLFFBQUEsSUFBSSxFQUFFLEdBQUc7UUFDVCxJQUFJLEVBQUUsQ0FBQyxHQUFHO1FBQ1YsSUFBSSxFQUFFLENBQUMsR0FBRztRQUNWLElBQUksRUFBRSxDQUFDLEdBQUc7UUFDVixJQUFJLEVBQUUsQ0FBQyxHQUFHO1FBQ1YsSUFBSSxFQUFFLENBQUMsR0FBRztBQUNWLFFBQUEsSUFBSSxFQUFFLEdBQUc7QUFDVCxRQUFBLElBQUksRUFBRSxHQUFHO0FBQ1QsUUFBQSxJQUFJLEVBQUUsSUFBSTtBQUNWLFFBQUEsSUFBSSxFQUFFLEdBQUc7QUFDVCxRQUFBLElBQUksRUFBRSxHQUFHO0FBQ1QsUUFBQSxJQUFJLEVBQUUsR0FBRztBQUNULFFBQUEsSUFBSSxFQUFFLElBQUk7QUFDVixRQUFBLElBQUksRUFBRSxJQUFJO0FBQ1YsUUFBQSxJQUFJLEVBQUUsR0FBRztBQUNULFFBQUEsSUFBSSxFQUFFLEdBQUc7QUFDVCxRQUFBLElBQUksRUFBRSxHQUFHO1FBQ1QsSUFBSSxFQUFFLENBQUMsR0FBRztLQUNYLENBQUM7SUFDRixJQUFJLENBQUMsS0FBSyxHQUFHO1FBQ1gsSUFBSSxFQUFFLENBQUMsR0FBRztRQUNWLElBQUksRUFBRSxDQUFDLElBQUk7UUFDWCxJQUFJLEVBQUUsQ0FBQyxHQUFHO1FBQ1YsSUFBSSxFQUFFLENBQUMsR0FBRztRQUNWLElBQUksRUFBRSxDQUFDLElBQUk7UUFDWCxJQUFJLEVBQUUsQ0FBQyxJQUFJO0FBQ1gsUUFBQSxJQUFJLEVBQUUsR0FBRztRQUNULElBQUksRUFBRSxDQUFDLEdBQUc7QUFDVixRQUFBLElBQUksRUFBRSxJQUFJO0FBQ1YsUUFBQSxJQUFJLEVBQUUsR0FBRztRQUNULElBQUksRUFBRSxDQUFDLElBQUk7QUFDWCxRQUFBLElBQUksRUFBRSxJQUFJO1FBQ1YsSUFBSSxFQUFFLENBQUMsR0FBRztBQUNWLFFBQUEsSUFBSSxFQUFFLEdBQUc7UUFDVCxJQUFJLEVBQUUsQ0FBQyxJQUFJO1FBQ1gsSUFBSSxFQUFFLENBQUMsSUFBSTtLQUNaLENBQUM7QUFDRixJQUFBLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUc7UUFDWCxHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLENBQUMsR0FBRztRQUNULEdBQUcsRUFBRSxDQUFDLElBQUk7UUFDVixHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLEdBQUcsRUFBRSxDQUFDLElBQUk7UUFDVixHQUFHLEVBQUUsQ0FBQyxJQUFJO0tBQ1gsQ0FBQztJQUNGLElBQUksQ0FBQyxLQUFLLEdBQUc7UUFDWCxHQUFHLEVBQUUsQ0FBQyxJQUFJO0FBQ1YsUUFBQSxHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxDQUFDLElBQUk7UUFDVixHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLEdBQUcsRUFBRSxDQUFDLElBQUk7UUFDVixLQUFLLEVBQUUsQ0FBQyxHQUFHO1FBQ1gsS0FBSyxFQUFFLENBQUMsR0FBRztRQUNYLEdBQUcsRUFBRSxDQUFDLEdBQUc7UUFDVCxHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsR0FBRyxFQUFFLENBQUMsSUFBSTtLQUNYLENBQUM7SUFDRixJQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsUUFBQSxLQUFLLEVBQUUsSUFBSTtBQUNYLFFBQUEsS0FBSyxFQUFFLElBQUk7UUFDWCxHQUFHLEVBQUUsQ0FBQyxJQUFJO0FBQ1YsUUFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULFFBQUEsS0FBSyxFQUFFLElBQUk7QUFDWCxRQUFBLEtBQUssRUFBRSxJQUFJO0FBQ1gsUUFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULFFBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxRQUFBLEdBQUcsRUFBRSxJQUFJO0FBQ1QsUUFBQSxHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxJQUFJO0tBQ1YsQ0FBQztJQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNoRCxJQUFBLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ25FLElBQUEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRztRQUNYLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7S0FDUixDQUFDO0lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzVELElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMxRCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekIsSUFBQSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsUUFBQSxFQUFFLEVBQUUsRUFBRTtRQUNOLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDUCxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ1AsUUFBQSxFQUFFLEVBQUUsR0FBRztRQUNQLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDUCxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ1AsUUFBQSxFQUFFLEVBQUUsR0FBRztBQUNQLFFBQUEsRUFBRSxFQUFFLEdBQUc7UUFDUCxFQUFFLEVBQUUsQ0FBQyxJQUFJO0tBQ1YsQ0FBQztBQUNGLElBQUEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDNUMsSUFBSSxDQUFDLEtBQUssR0FBRztRQUNYLEVBQUUsRUFBRSxDQUFDLEdBQUc7QUFDUixRQUFBLEVBQUUsRUFBRSxFQUFFO0FBQ04sUUFBQSxFQUFFLEVBQUUsSUFBSTtRQUNSLEVBQUUsRUFBRSxDQUFDLElBQUk7QUFDVCxRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxFQUFFLEVBQUUsSUFBSTtBQUNSLFFBQUEsRUFBRSxFQUFFLEtBQUs7UUFDVCxFQUFFLEVBQUUsQ0FBQyxHQUFHO1FBQ1IsRUFBRSxFQUFFLENBQUMsSUFBSTtLQUNWLENBQUM7SUFDRixJQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsUUFBQSxHQUFHLEVBQUUsR0FBRztBQUNSLFFBQUEsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsQ0FBQyxHQUFHO1FBQ1QsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLEdBQUcsRUFBRSxDQUFDLEdBQUc7UUFDVCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsR0FBRyxFQUFFLENBQUMsR0FBRztRQUNULEdBQUcsRUFBRSxDQUFDLEdBQUc7S0FDVixDQUFDO0lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRztRQUNYLEdBQUcsRUFBRSxDQUFDLEdBQUc7UUFDVCxHQUFHLEVBQUUsQ0FBQyxHQUFHO0FBQ1QsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLEdBQUcsRUFBRSxDQUFDLEdBQUc7QUFDVCxRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNULFFBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO0tBQ1AsQ0FBQztJQUNGLElBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsR0FBRyxFQUFFLENBQUMsR0FBRztBQUNULFFBQUEsR0FBRyxFQUFFLElBQUk7UUFDVCxHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLEVBQUUsRUFBRSxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO0tBQ1AsQ0FBQztJQUNGLElBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxRQUFBLEdBQUcsRUFBRSxJQUFJO0FBQ1QsUUFBQSxHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLEdBQUcsRUFBRSxJQUFJO0FBQ1QsUUFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLEdBQUcsRUFBRSxJQUFJO0FBQ1QsUUFBQSxHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxDQUFDLElBQUk7QUFDVixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEtBQUs7UUFDVCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxLQUFLO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ1YsQ0FBQyxFQUFFLENBQUMsS0FBSztRQUNULENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxRQUFBLEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNWLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxLQUFLO0FBQ1QsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0tBQ1QsQ0FBQztJQUNGLElBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxRQUFBLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLENBQUMsR0FBRztRQUNULENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxFQUFFLEVBQUUsQ0FBQyxLQUFLO1FBQ1YsR0FBRyxFQUFFLENBQUMsSUFBSTtBQUNWLFFBQUEsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsQ0FBQyxHQUFHO0FBQ1QsUUFBQSxHQUFHLEVBQUUsR0FBRztBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxFQUFFO0FBQ0wsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7UUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLElBQUk7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxDQUFDLEVBQUUsQ0FBQyxJQUFJO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsSUFBSTtRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxHQUFHLEVBQUUsQ0FBQyxHQUFHO1FBQ1QsRUFBRSxFQUFFLENBQUMsS0FBSztBQUNWLFFBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7S0FDUixDQUFDO0lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLFFBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixRQUFBLEdBQUcsRUFBRSxHQUFHO1FBQ1IsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsRUFBRSxFQUFFLEdBQUc7QUFDUCxRQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsUUFBQSxHQUFHLEVBQUUsR0FBRztRQUNSLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO0FBQ04sUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLElBQUk7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ1IsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO1FBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLEdBQUc7QUFDTixRQUFBLENBQUMsRUFBRSxJQUFJO1FBQ1AsQ0FBQyxFQUFFLENBQUMsSUFBSTtBQUNSLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNQLFFBQUEsQ0FBQyxFQUFFLEdBQUc7UUFDTixDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDUCxRQUFBLENBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBQSxDQUFDLEVBQUUsR0FBRztBQUNOLFFBQUEsQ0FBQyxFQUFFLElBQUk7UUFDUCxHQUFHLEVBQUUsQ0FBQyxHQUFHO0FBQ1QsUUFBQSxFQUFFLEVBQUUsR0FBRztRQUNQLENBQUMsRUFBRSxDQUFDLEdBQUc7UUFDUCxDQUFDLEVBQUUsQ0FBQyxHQUFHO0tBQ1IsQ0FBQztBQUVGLElBQUEsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxHQUFHLEVBQUE7QUFDNUMsSUFBQSxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDNUIsUUFBQSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixTQUFBO0FBQ0YsS0FBQTtBQUNELElBQUEsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUM7QUFFRixhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsRUFBQTtBQUN2QyxJQUFBLElBQUksQ0FBQyxFQUFFO0FBQ0wsUUFBQSxPQUFPLENBQUMsQ0FBQztBQUNWLEtBQUE7QUFDRCxJQUFBLE9BQU8sQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFDO0FBRUYsYUFBYSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQUE7SUFDL0MsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxTQUFTLElBQUksS0FBSyxJQUFJLEVBQUUsRUFBRTtBQUN0RCxRQUFBLE9BQU8sRUFBRSxDQUFDO0FBQ1gsS0FBQTtJQUNELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsSUFBQSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDN0IsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNmLFFBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsS0FBQTtBQUNELElBQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLElBQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLElBQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLElBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQixJQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsSUFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLElBQUEsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUNiLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUNiLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNiLElBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ3ZDLFFBQUEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN4QixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwQixRQUFBLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEIsUUFBQSxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUU1QyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUMsUUFBQSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QyxRQUFBLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVDLFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELFFBQUEsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFD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R0FBRyxDQUFDO0FBQzNCLENBQUMsQ0FBQztBQUNGO0FBQ0EsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzlCO0FBQ0EsSUFBSUEsVUFBUSxHQUFHLFNBQVMsR0FBRyxDQUFDO0FBQzVCLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLEVBQUUsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQztBQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDNUMsSUFBSSxJQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsSUFBSSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRDtBQUNBLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7QUFDL0IsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbEUsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQztBQUMxQixNQUFNLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVELEtBQUssTUFBTTtBQUNYLE1BQU0sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDL0MsUUFBUSxJQUFJLGFBQWEsR0FBRyxRQUFR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RUFBQSxDQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdEUsU0FBQTtBQUNELFFBQUEsT0FBTyxFQUFFLENBQUM7QUFDWixLQUFDLENBQUM7SUFFRixNQUFNLEtBQUssR0FBRyxtQkFBbUI7QUFDL0IsVUFBRSxXQUFXO2NBQ1QsdUJBQXVCLEVBQUU7QUFDM0IsY0FBRTtBQUNFLGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksRUFBRSxDQUFDO0FBQ3BELGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksRUFBRSxDQUFDO0FBQ2xFLGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksRUFBRSxDQUFDO0FBQ3JELGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksRUFBRSxDQUFDO0FBQ25FLGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBSSxFQUFFLENBQUM7QUFDekQsZ0JBQUEsSUFBSSxDQUFBLEVBQUEsR0FBQSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxHQUM5RCxFQUFFLENBQUM7QUFDTCxnQkFBQSxJQUFJLENBQUEsRUFBQSxHQUFBLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFJLEVBQUUsQ0FBQztBQUNyRCxnQkFBQSxJQUFJLENBQUEsRUFBQSxHQUFBLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFJLEVBQUUsQ0FBQztBQUNwRSxhQUFBO0FBQ0wsVUFBRSxXQUFXO2NBQ1gsdUJBQXVCLEVBQUU7QUFDM0IsY0FBRTtBQUNFLGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksRUFBRSxDQUFDO0FBQ3BELGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksRUFBRSxDQUFDO0FBQ2xFLGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksRUFBRSxDQUFDO0FBQ3JELGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksRUFBRSxDQUFDO0FBQ25FLGdCQUFBLElBQUksQ0FBQSxFQUFBLEdBQUEsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBSSxFQUFFLENBQUM7QUFDekQsZ0JBQUEsSUFBSSxDQUFBLEVBQUEsR0FBQSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFJLEVBQUUsQ0FBQztBQUN2RSxnQkFBQSxJQUFJLENBQUEsRUFBQSxHQUFBLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFJLEVBQUUsQ0FBQztBQUNyRCxnQkFBQSxJQUFJLENBQUEsRUFBQSxHQUFBLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFJLEVBQUUsQ0FBQzthQUNwRSxDQUFDO0FBRU4sSUFBQSxNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3hDLFNBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDaEQsU0FBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQztJQUV4QyxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQ3ZCLGlCQUFpQixDQUFDLEdBQUcsQ0FDbkIsQ0FBQyxDQUFDLEtBQUk7O0FBQ0osUUFBQSxPQUFBLE1BQUEsQ0FBQSxFQUFBLEdBQUEsdUJBQXVCLGFBQXZCLHVCQUF1QixLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUF2Qix1QkFBdUIsQ0FBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBZSxDQUFDLDBDQUMzRCxXQUFXLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksQ0FBQyxDQUFBO0tBQUEsQ0FDdkIsRUFDRCxDQUFDLENBQ0YsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFHLGlCQUFpQjtBQUNoQyxTQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUk7QUFDYixRQUFBLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFlLENBQUM7QUFDaEMsUUFBQSxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBZSxDQUFDO1FBRWhDLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQztRQUNsRCxJQUFJLFdBQVcsSUFBSSxlQUFlLEVBQUU7QUFDbEMsWUFBQSxPQUFPLEtBQUssQ0FBQyxJQUFJLEtBQUssYUFBYSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5QyxTQUFBO0FBRUQsUUFBQSxJQUFJLHVCQUF1QixFQUFFO0FBQzNCLFlBQUEsTUFBTSxHQUFHLEdBQUcsdUJBQXVCLENBQUMsT0FBTyxDQUN6QyxLQUFLLEVBQ0wsS0FBSyxFQUNMLGFBQWEsQ0FDZCxDQUFDO1lBQ0YsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO0FBQ2IsZ0JBQUEsT0FBTyxHQUFHLENBQUM7QUFDWixhQUFBO0FBQ0YsU0FBQTtRQUVELElBQUksQ0FBQyxDQUFDLEtBQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLEtBQU0sQ0FBQyxNQUFNLEVBQUU7WUFDdkMsT0FBTyxDQUFDLENBQUMsS0FBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkQsU0FBQTtBQUNELFFBQUEsSUFBSSxlQUFlLEVBQUU7WUFDbkIsT0FBTyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRO2dCQUN6QyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRO0FBQ3BDLGtCQUFFLENBQUM7a0JBQ0QsQ0FBQyxDQUFDLENBQUM7QUFDUixTQUFBO0FBQ0QsUUFBQSxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRTtBQUN2QixZQUFBLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekIsU0FBQTtBQUNELFFBQUEsT0FBTyxDQUFDLENBQUM7QUFDWCxLQUFDLENBQUM7U0FDRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNsQixTQUFBLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBR3BCLElBQUEsT0FBTyxRQUFRLENBQUMsU0FBUyxFQUFFLHVCQUF1QixDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUVEO0FBQ0E7U0FDZ0IsbUJBQW1CLENBQ2pDLElBQVUsRUFDVixLQUFhLEVBQ2IsbUJBQTRCLEVBQUE7O0lBRTVCLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtRQUNoQixPQUFPO1lBQ0wsSUFBSSxFQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQU8sSUFBSSxDQUFFLEVBQUEsRUFBQSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO1lBQ2xDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztBQUNqQixZQUFBLEtBQUssRUFBRSxLQUFLO1NBQ2IsQ0FBQztBQUNILEtBQUE7SUFFRCxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ3RDLFFBQUEsSUFDRSxtQkFBbUI7WUFDbkIsSUFBSSxDQUFDLElBQUksS0FBSyxjQUFjO0FBQzVCLFlBQUEsSUFBSSxDQUFDLElBQUksS0FBSyxhQUFhLEVBQzNCO1lBQ0EsTUFBTSxDQUFDLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVDLE9BQU8sRUFBRSxJQUFJLEVBQU8sTUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFJLEtBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUN4RSxTQUFBO0FBQU0sYUFBQTtZQUNMLE9BQU87Z0JBQ0wsSUFBSSxFQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQU8sSUFBSSxDQUFFLEVBQUEsRUFBQSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO2dCQUNsQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7QUFDakIsZ0JBQUEsS0FBSyxFQUFFLEtBQUs7YUFDYixDQUFDO0FBQ0gsU0FBQTtBQUNGLEtBQUE7SUFFRCxNQUFNLGtCQUFrQixHQUFHLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxPQUFPLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUM5QyxlQUFlLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUMxQixDQUFDO0FBQ0YsSUFBQSxJQUFJLGtCQUFrQixFQUFFO1FBQ3RCLE9BQU87QUFDTCxZQUFBLElBQUksa0NBQU8sSUFBSSxDQUFBLEVBQUEsRUFBRSxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQTtBQUMxQyxZQUFBLEtBQUssRUFBRSxrQkFBa0I7QUFDekIsWUFBQSxLQUFLLEVBQUUsSUFBSTtTQUNaLENBQUM7QUFDSCxLQUFBO0lBRUQsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRTtRQUNwQyxPQUFPO1lBQ0wsSUFBSSxFQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQU8sSUFBSSxDQUFFLEVBQUEsRUFBQSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO1lBQ2xDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztBQUNqQixZQUFBLEtBQUssRUFBRSxLQUFLO1NBQ2IsQ0FBQztBQUNILEtBQUE7SUFFRCxNQUFNLG9CQUFvQixHQUFHLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxPQUFPLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUNoRCxhQUFhLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUN4QixDQUFDO0FBQ0YsSUFBQSxJQUFJLG9CQUFvQixFQUFFO1FBQ3hCLE9BQU87QUFDTCxZQUFBLElBQUksa0NBQU8sSUFBSSxDQUFBLEVBQUEsRUFBRSxHQUFHLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQTtBQUM1QyxZQUFBLEtBQUssRUFBRSxvQkFBb0I7QUFDM0IsWUFBQSxLQUFLLEVBQUUsSUFBSTtTQUNaLENBQUM7QUFDSCxLQUFBO0lBRUQsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3RDLENBQUM7QUFFSyxTQUFVLDBCQUEwQixDQUN4QyxZQUEwQixFQUMxQixLQUFhLEVBQ2IsTUFBYyxFQUNkLE1BQUEsR0FHSSxFQUFFLEVBQUE7QUFFTixJQUFBLE1BQU0sRUFBRSxXQUFXLEVBQUUsdUJBQXVCLEVBQUUsR0FBRyxNQUFNLENBQUM7SUFDeEQsTUFBTSxtQkFBbUIsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUM7QUFFbkUsSUFBQSxNQUFNLGdCQUFnQixHQUFHLENBQUMsTUFBeUMsS0FDakUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUUvQixNQUFNLHVCQUF1QixHQUFHLE1BQUs7O0FBQ25DLFFBQUEsSUFBSSxXQUFXLEtBQUssT0FBTyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7QUFDeEQsWUFBQSxPQUFPLEVBQUUsQ0FBQztBQUNYLFNBQUE7UUFDRCxJQUFJLFdBQVcsS0FBSSxDQUFBLEVBQUEsR0FBQSxZQUFZLENBQUMsV0FBVyxNQUFHLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLFdBQVcsQ0FBQyxDQUFBLEVBQUU7QUFDMUQsWUFBQSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBQSxZQUFZLENBQUMsV0FBVyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdEUsU0FBQTtBQUNELFFBQUEsT0FBTyxFQUFFLENBQUM7QUFDWixLQUFDLENBQUM7SUFFRixNQUFNLEtBQUssR0FBRyxXQUFXO1VBQ3JCLHVCQUF1QixFQUFFO0FBQzNCLFVBQUU7QUFDRSxZQUFBLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQztBQUM3QyxZQUFBLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQztBQUM5QyxZQUFBLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDO0FBQ2xELFlBQUEsR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDO1NBQy9DLENBQUM7QUFDTixJQUFBLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDeEMsU0FBQSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssbUJBQW1CLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQzlELFNBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUM7SUFFeEMsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUN2QixpQkFBaUIsQ0FBQyxHQUFHLENBQ25CLENBQUMsQ0FBQyxLQUFJOztBQUNKLFFBQUEsT0FBQSxNQUFBLENBQUEsRUFBQSxHQUFBLHVCQUF1QixhQUF2Qix1QkFBdUIsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBdkIsdUJBQXVCLENBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQWUsQ0FBQywwQ0FDM0QsV0FBVyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFJLENBQUMsQ0FBQTtLQUFBLENBQ3ZCLEVBQ0QsQ0FBQyxDQUNGLENBQUM7SUFFRixNQUFNLFNBQVMsR0FBRyxpQkFBaUI7QUFDaEMsU0FBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFJO0FBQ2IsUUFBQSxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBZSxDQUFDO0FBQ2hDLFFBQUEsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQWUsQ0FBQztRQUVoQyxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDbEQsSUFBSSxXQUFXLElBQUksZUFBZSxFQUFFO0FBQ2xDLFlBQUEsT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLGFBQWEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUMsU0FBQTtBQUVELFFBQUEsSUFBSSx1QkFBdUIsRUFBRTtBQUMzQixZQUFBLE1BQU0sR0FBRyxHQUFHLHVCQUF1QixDQUFDLE9BQU8sQ0FDekMsS0FBSyxFQUNMLEtBQUssRUFDTCxhQUFhLENBQ2QsQ0FBQztZQUNGLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtBQUNiLGdCQUFBLE9BQU8sR0FBRyxDQUFDO0FBQ1osYUFBQTtBQUNGLFNBQUE7UUFFRCxNQUFNLEVBQUUsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QyxNQUFNLEVBQUUsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDYixPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEIsU0FBQTtRQUVELElBQUksQ0FBQyxDQUFDLEtBQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLEtBQU0sQ0FBQyxNQUFNLEVBQUU7WUFDdkMsT0FBTyxDQUFDLENBQUMsS0FBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkQsU0FBQTtBQUNELFFBQUEsSUFBSSxlQUFlLEVBQUU7WUFDbkIsT0FBTyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRO2dCQUN6QyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRO0FBQ3BDLGtCQUFFLENBQUM7a0JBQ0QsQ0FBQyxDQUFDLENBQUM7QUFDUixTQUFBO0FBQ0QsUUFBQSxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRTtBQUN2QixZQUFBLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekIsU0FBQTtBQUNELFFBQUEsT0FBTyxDQUFDLENBQUM7QUFDWCxLQUFDLENBQUM7U0FDRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNsQixTQUFBLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBR3BCLElBQUEsT0FBTyxRQUFRLENBQUMsU0FBUyxFQUFFLHVCQUF1QixDQUFDLENBQUM7QUFDdEQ7O0FDM1hnQixTQUFBLFFBQVEsQ0FBQyxJQUFZLEVBQUUsR0FBWSxFQUFBOztBQUNqRCxJQUFBLE1BQU0sSUFBSSxHQUFHLENBQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsTUFBRyxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFDLENBQUMsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBSSxJQUFJLENBQUM7SUFDaEUsT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDbEUsQ0FBQztBQU9LLFNBQVUsT0FBTyxDQUFDLElBQVksRUFBQTs7QUFDbEMsSUFBQSxPQUFPLENBQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQUcsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQyxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksR0FBRyxDQUFDO0FBQ2hELENBQUM7QUFFSyxTQUFVLEtBQUssQ0FBQyxJQUFZLEVBQUE7QUFDaEMsSUFBQSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RDs7QUNNQSxTQUFTLE1BQU0sQ0FBQyxLQUFhLEVBQUE7OztBQUczQixJQUFBLE9BQU8sS0FBSztBQUNULFNBQUEsT0FBTyxDQUFDLEtBQUssRUFBRSw4QkFBOEIsQ0FBQztBQUM5QyxTQUFBLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO0FBQ3JCLFNBQUEsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7QUFDckIsU0FBQSxPQUFPLENBQUMsK0JBQStCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFDLEtBQWEsRUFBQTs7O0FBRzdCLElBQUEsT0FBTyxLQUFLO0FBQ1QsU0FBQSxPQUFPLENBQUMsT0FBTyxFQUFFLDhCQUE4QixDQUFDO0FBQ2hELFNBQUEsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7QUFDckIsU0FBQSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztBQUNyQixTQUFBLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQ2xCLElBQW9CLEVBQ3BCLElBQVksRUFDWixpQkFBMEIsRUFBQTtJQUUxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFJOztBQUFDLFFBQUEsUUFBQztBQUM1QixZQUFBLEtBQUssRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxLQUFLO1lBQzdCLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztZQUMxQixPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87QUFDbEIsWUFBQSxJQUFJLEVBQUUsa0JBQWtCO0FBQ3hCLFlBQUEsV0FBVyxFQUFFLElBQUk7QUFDakIsWUFBQSxZQUFZLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVM7QUFDL0MsWUFBQSxXQUFXLEVBQUUsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLFdBQVcsbUNBQUksaUJBQWlCO1lBQ2xELDBCQUEwQixFQUFFLElBQUksQ0FBQywwQkFBMEI7QUFDNUQsU0FBQSxFQUFDO0FBQUEsS0FBQSxDQUFDLENBQUM7QUFDTixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQ2pCLElBQVksRUFDWixTQUEwQixFQUMxQixJQUFZLEVBQ1osbUJBQTRCLEVBQzVCLGdCQUF5QixFQUN6QixpQkFBMEIsRUFBQTtBQUUxQixJQUFBLE1BQU0sQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFakUsSUFBQSxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsSUFBQSxJQUFJLFlBQWdDLENBQUM7SUFDckMsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBRTFCLElBQUksbUJBQW1CLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO1FBQzlELENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNsRSxLQUFBO0lBQ0QsSUFBSSxnQkFBZ0IsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7UUFDeEQsWUFBWSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDbkQsUUFBQSxhQUFhLEdBQUcsQ0FBQSxFQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFBLENBQU0sQ0FBQztBQUMzRCxLQUFBO0lBRUQsT0FBTztBQUNMLFFBQUEsS0FBSyxFQUFFLGFBQWE7UUFDcEIsV0FBVztRQUNYLE9BQU87QUFDUCxRQUFBLElBQUksRUFBRSxrQkFBa0I7QUFDeEIsUUFBQSxXQUFXLEVBQUUsSUFBSTtRQUNqQixZQUFZO0FBQ1osUUFBQSxXQUFXLEVBQUUsaUJBQWlCO0tBQy9CLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQ2pCLElBQTBCLEVBQzFCLFNBQTBCLEVBQzFCLGlCQUFnQyxFQUFBO0FBRWhDLElBQUEsTUFBTSxLQUFLLEdBQ1QsSUFBSSxDQUFDLFlBQVksSUFBSSxpQkFBaUI7VUFDbEMsQ0FBRyxFQUFBLElBQUksQ0FBQyxLQUFLLENBQUcsRUFBQSxpQkFBaUIsQ0FBRyxFQUFBLElBQUksQ0FBQyxZQUFZLENBQUUsQ0FBQTtBQUN6RCxVQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7QUFFakIsSUFBQSxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ3RDLFFBQUEsT0FBTyxZQUFZLENBQUM7QUFDckIsS0FBQTtBQUNELElBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDakIsUUFBQSxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9ELEtBQUE7QUFDRCxJQUFBLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQzNELFNBQVMsQ0FBQyxLQUFLLENBQ2hCLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBU0MsZ0JBQWMsQ0FBQyxJQUFZLEVBQUE7QUFDbEMsSUFBQSxNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsSUFBQSxPQUFPLElBQUksS0FBSyxjQUFjLEdBQUcsRUFBRSxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDekQsQ0FBQztNQVNZLDRCQUE0QixDQUFBO0lBV3ZDLFdBQVksQ0FBQSxHQUFRLEVBQUUsU0FBb0IsRUFBQTtRQVZsQyxJQUFLLENBQUEsS0FBQSxHQUEyQixFQUFFLENBQUM7UUFDM0MsSUFBVyxDQUFBLFdBQUEsR0FBOEMsRUFBRSxDQUFDO1FBQzVELElBQWtCLENBQUEsa0JBQUEsR0FBdUIsRUFBRSxDQUFDO0FBUzFDLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBNEIsQ0FBQztLQUNqRTtBQUVELElBQUEsSUFBSSxhQUFhLEdBQUE7UUFDZixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ3BFO0lBRWEsU0FBUyxDQUNyQixJQUFZLEVBQ1osTUFBYyxFQUFBOztBQUVkLFlBQUEsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztrQkFDeEIsTUFBTUMsZ0JBQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztrQkFDNUIsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRTVDLFlBQUEsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7QUFDbEMsa0JBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDN0Qsa0JBQUUsUUFBUTtxQkFDTCxLQUFLLENBQUMsU0FBUyxDQUFDO0FBQ2hCLHFCQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNwQyxxQkFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hCLHFCQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FDTCxVQUFVLENBQ1IsQ0FBQyxFQUNELElBQUksQ0FBQyxTQUFTLEVBQ2QsSUFBSSxFQUNKLE1BQU0sQ0FBQyxtQkFBbUIsRUFDMUIsTUFBTSxDQUFDLGdCQUFnQixFQUN2QixNQUFNLENBQUMsV0FBVyxDQUNuQixDQUNGLENBQUM7QUFFUixZQUFBLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FDakIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNsRSxDQUFDO1NBQ0gsQ0FBQSxDQUFBO0FBQUEsS0FBQTtBQUVLLElBQUEsa0JBQWtCLENBQUMsTUFBYyxFQUFBOztZQUNyQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFFbEIsWUFBQSxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQzdCLElBQUk7b0JBQ0YsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNqRCxvQkFBQSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxpQkFBQTtBQUFDLGdCQUFBLE9BQU8sQ0FBQyxFQUFFOztvQkFFVixJQUFJQyxlQUFNLENBQ1IsQ0FBQSxlQUFBLEVBQWtCLElBQUksQ0FBQSxxQ0FBQSxFQUF3QyxDQUFDLENBQUUsQ0FBQSxFQUNqRSxDQUFDLENBQ0YsQ0FBQztBQUNILGlCQUFBO0FBQ0YsYUFBQTtTQUNGLENBQUEsQ0FBQTtBQUFBLEtBQUE7SUFFSyxxQkFBcUIsQ0FDekIsSUFBMEIsRUFDMUIsY0FBc0IsRUFBQTs7QUFFdEIsWUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25CLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FDakMsY0FBYyxFQUNkLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQ2hFLENBQUM7U0FDSCxDQUFBLENBQUE7QUFBQSxLQUFBO0FBRU8sSUFBQSxPQUFPLENBQUMsSUFBMEIsRUFBQTs7QUFDeEMsUUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7UUFHdEIsTUFBTSxlQUFlLEdBQ2hCLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsSUFBSSxDQUNQLEVBQUEsRUFBQSxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxPQUFPLG1DQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUdGLGdCQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUEsQ0FDbEUsQ0FBQztRQUVGLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQWUsQ0FBQztBQUMxRCxRQUFBLFFBQVEsQ0FDTixJQUFJLENBQUMsa0JBQWtCLEVBQ3ZCLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUMvQixlQUFlLENBQ2hCLENBQUM7UUFDRixDQUFBLEVBQUEsR0FBQSxlQUFlLENBQUMsT0FBTyxNQUFFLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FDakMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUNoRSxDQUFDO0tBQ0g7SUFFRCxVQUFVLEdBQUE7QUFDUixRQUFBLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUEsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBQSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0tBQzlCO0FBRUQsSUFBQSxJQUFJLFNBQVMsR0FBQTtBQUNYLFFBQUEsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUMxQjtBQUVELElBQUEsV0FBVyxDQUNULEtBQWUsRUFDZixTQUEwQixFQUMxQixpQkFBZ0MsRUFBQTtBQUVoQyxRQUFBLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBQSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7S0FDNUM7QUFDRjs7TUMzT1ksdUJBQXVCLENBQUE7SUFLbEMsV0FBb0IsQ0FBQSxHQUFRLEVBQVUsU0FBb0IsRUFBQTtRQUF0QyxJQUFHLENBQUEsR0FBQSxHQUFILEdBQUcsQ0FBSztRQUFVLElBQVMsQ0FBQSxTQUFBLEdBQVQsU0FBUyxDQUFXO1FBSjFELElBQWtCLENBQUEsa0JBQUEsR0FBdUIsRUFBRSxDQUFDO1FBQ3BDLElBQUssQ0FBQSxLQUFBLEdBQVcsRUFBRSxDQUFDO0tBR21DO0lBRXhELFlBQVksQ0FDaEIsV0FBb0IsRUFDcEIscUJBQTZCLEVBQUE7O1lBRTdCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUVsQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWCxPQUFPO0FBQ1IsYUFBQTtZQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1QsT0FBTztBQUNSLGFBQUE7QUFFRCxZQUFBLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTO2lCQUNoQyxRQUFRLENBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQ3hFO0FBQ0EsaUJBQUEsSUFBSSxFQUFFLENBQUM7QUFFVixZQUFBLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELFlBQUEsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVM7aUJBQzFCLFFBQVEsQ0FBQyxPQUFPLENBQUM7QUFDakIsaUJBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFJO0FBQ1osZ0JBQUEsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLHFCQUFxQixFQUFFO0FBQ3BDLG9CQUFBLE9BQU8sS0FBSyxDQUFDO0FBQ2QsaUJBQUE7Z0JBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzNDLG9CQUFBLE9BQU8sS0FBSyxDQUFDO0FBQ2QsaUJBQUE7QUFDRCxnQkFBQSxPQUFPLFdBQVcsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzlDLGFBQUMsQ0FBQztpQkFDRCxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sMEJBQTBCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsWUFBQSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7aUJBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssWUFBWSxDQUFDO0FBQ2pDLGlCQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNYLGdCQUFBLEtBQUssRUFBRSxDQUFDO0FBQ1IsZ0JBQUEsSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSTtBQUN2QixhQUFBLENBQUMsQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekUsQ0FBQSxDQUFBO0FBQUEsS0FBQTtJQUVELFVBQVUsR0FBQTtBQUNSLFFBQUEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBQSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0tBQzlCO0FBRUQsSUFBQSxJQUFJLFNBQVMsR0FBQTtBQUNYLFFBQUEsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUMxQjtBQUVELElBQUEsV0FBVyxDQUFDLFNBQW9CLEVBQUE7QUFDOUIsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztLQUM1QjtBQUNGOztNQ2xFWSx3QkFBd0IsQ0FBQTtJQUluQyxXQUFvQixDQUFBLEdBQVEsRUFBVSxTQUFvQixFQUFBO1FBQXRDLElBQUcsQ0FBQSxHQUFBLEdBQUgsR0FBRyxDQUFLO1FBQVUsSUFBUyxDQUFBLFNBQUEsR0FBVCxTQUFTLENBQVc7UUFIbEQsSUFBSyxDQUFBLEtBQUEsR0FBVyxFQUFFLENBQUM7UUFDM0IsSUFBa0IsQ0FBQSxrQkFBQSxHQUF1QixFQUFFLENBQUM7S0FFa0I7SUFFOUQsWUFBWSxDQUNWLHVCQUFnQyxFQUNoQyx5QkFBbUMsRUFBQTs7UUFFbkMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBRWxCLFFBQUEsTUFBTSxjQUFjLEdBQUcsQ0FBQyxJQUFZLEtBQWM7QUFDaEQsWUFBQSxNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsWUFBQSxPQUFPLElBQUksS0FBSyxjQUFjLEdBQUcsRUFBRSxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDekQsU0FBQyxDQUFDO0FBRUYsUUFBQSxNQUFNLHlCQUF5QixHQUF1QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUs7QUFDakUsYUFBQSxnQkFBZ0IsRUFBRTthQUNsQixNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQ1IseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDOUQ7QUFDQSxhQUFBLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSTtZQUNiLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRTdDLFlBQUEsSUFBSSx1QkFBdUIsRUFBRTtnQkFDM0IsT0FBTztBQUNMLG9CQUFBO3dCQUNFLEtBQUssRUFBRSxDQUFDLENBQUMsUUFBUTtBQUNqQix3QkFBQSxJQUFJLEVBQUUsY0FBYzt3QkFDcEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxJQUFJO0FBQ25CLHdCQUFBLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQzt3QkFDbkMsV0FBVyxFQUFFLENBQUMsQ0FBQyxJQUFJO0FBQ3BCLHFCQUFBO29CQUNELEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNyQix3QkFBQSxLQUFLLEVBQUUsQ0FBQztBQUNSLHdCQUFBLElBQUksRUFBRSxjQUFjO3dCQUNwQixXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUk7QUFDbkIsd0JBQUEsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7d0JBQzFCLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSTtBQUNuQix3QkFBQSxTQUFTLEVBQUU7NEJBQ1QsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJO0FBQ2YseUJBQUE7QUFDRixxQkFBQSxDQUFDLENBQUM7aUJBQ2tCLENBQUM7QUFDekIsYUFBQTtBQUFNLGlCQUFBO2dCQUNMLE9BQU87QUFDTCxvQkFBQTt3QkFDRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLFFBQVE7QUFDakIsd0JBQUEsSUFBSSxFQUFFLGNBQWM7d0JBQ3BCLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSTtBQUNuQix3QkFBQSxPQUFPLEVBQUU7QUFDUCw0QkFBQSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQzdCLDRCQUFBLEdBQUcsT0FBTztBQUNWLDRCQUFBLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7QUFDbkMseUJBQUE7d0JBQ0QsV0FBVyxFQUFFLENBQUMsQ0FBQyxJQUFJO0FBQ3BCLHFCQUFBO2lCQUNvQixDQUFDO0FBQ3pCLGFBQUE7QUFDSCxTQUFDLENBQUMsQ0FBQztBQUVMLFFBQUEsTUFBTSwyQkFBMkIsR0FBdUIsSUFBSSxDQUFDLFNBQVM7QUFDbkUsYUFBQSxrQkFBa0IsRUFBRTthQUNwQixHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSTtZQUN0QixPQUFPO0FBQ0wsZ0JBQUEsS0FBSyxFQUFFLElBQUk7QUFDWCxnQkFBQSxJQUFJLEVBQUUsY0FBYztBQUNwQixnQkFBQSxXQUFXLEVBQUUsSUFBSTtBQUNqQixnQkFBQSxPQUFPLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQztnQkFDN0IsV0FBVyxFQUFFLENBQWtCLGVBQUEsRUFBQSxJQUFJLENBQUUsQ0FBQTtBQUNyQyxnQkFBQSxPQUFPLEVBQUUsSUFBSTthQUNkLENBQUM7QUFDSixTQUFDLENBQUMsQ0FBQztRQUVMLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLHlCQUF5QixFQUFFLEdBQUcsMkJBQTJCLENBQUMsQ0FBQztBQUM1RSxRQUFBLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUM3QixZQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUQsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLE9BQU8sTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQ3RCLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FDckQsQ0FBQztBQUNILFNBQUE7S0FDRjtJQUVELFVBQVUsR0FBQTtBQUNSLFFBQUEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBQSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0tBQzlCO0FBRUQsSUFBQSxJQUFJLFNBQVMsR0FBQTtBQUNYLFFBQUEsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUMxQjtBQUNGOztNQ2pGWSxhQUFhLENBQUE7SUFTeEIsV0FBNkIsQ0FBQSxJQUFVLEVBQVcsT0FBZ0IsRUFBQTtRQUFyQyxJQUFJLENBQUEsSUFBQSxHQUFKLElBQUksQ0FBTTtRQUFXLElBQU8sQ0FBQSxPQUFBLEdBQVAsT0FBTyxDQUFTO0FBQ2hFLFFBQUEsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbEM7SUFFRCxPQUFPLFFBQVEsQ0FBQyxJQUFZLEVBQUE7QUFDMUIsUUFBQSxPQUFPLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFFLENBQUM7S0FDNUQ7QUFFRCxJQUFBLE9BQU8sTUFBTSxHQUFBO1FBQ1gsT0FBTyxhQUFhLENBQUMsT0FBTyxDQUFDO0tBQzlCOztBQWxCdUIsYUFBTyxDQUFBLE9BQUEsR0FBb0IsRUFBRSxDQUFDO0FBRXRDLGFBQU0sQ0FBQSxNQUFBLEdBQUcsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ25ELGFBQU8sQ0FBQSxPQUFBLEdBQUcsSUFBSSxhQUFhLENBQ3pDLFNBQVMsRUFDVCwwQkFBMEIsQ0FDM0I7O01DWlUsMkJBQTJCLENBQUE7QUF3QnRDLElBQUEsV0FBQSxDQUNXLElBQVUsRUFDVixPQUFnQixFQUNoQixXQUFvQixFQUFBO1FBRnBCLElBQUksQ0FBQSxJQUFBLEdBQUosSUFBSSxDQUFNO1FBQ1YsSUFBTyxDQUFBLE9BQUEsR0FBUCxPQUFPLENBQVM7UUFDaEIsSUFBVyxDQUFBLFdBQUEsR0FBWCxXQUFXLENBQVM7QUFFN0IsUUFBQSwyQkFBMkIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hEO0lBRUQsT0FBTyxRQUFRLENBQUMsSUFBWSxFQUFBO0FBQzFCLFFBQUEsT0FBTywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFFLENBQUM7S0FDMUU7QUFFRCxJQUFBLE9BQU8sTUFBTSxHQUFBO1FBQ1gsT0FBTywyQkFBMkIsQ0FBQyxPQUFPLENBQUM7S0FDNUM7O0FBckN1QiwyQkFBTyxDQUFBLE9BQUEsR0FBa0MsRUFBRSxDQUFDO0FBRXBELDJCQUFJLENBQUEsSUFBQSxHQUFHLElBQUksMkJBQTJCLENBQ3BELE1BQU0sRUFDTixFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUM1QixFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUM3QixDQUFDO0FBQ2MsMkJBQUEsQ0FBQSxHQUFHLEdBQUcsSUFBSSwyQkFBMkIsQ0FDbkQsZ0JBQWdCLEVBQ2hCLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQzdCLEVBQUUsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUNyQyxDQUFDO0FBQ2MsMkJBQUEsQ0FBQSxLQUFLLEdBQUcsSUFBSSwyQkFBMkIsQ0FDckQsd0JBQXdCLEVBQ3hCLEVBQUUsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUNoQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FDakMsQ0FBQztBQUNjLDJCQUFBLENBQUEsR0FBRyxHQUFHLElBQUksMkJBQTJCLENBQ25ELHdCQUF3QixFQUN4QixFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDaEMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQ2pDOztNQ2hDVSxlQUFlLENBQUE7SUFPMUIsV0FBNkIsQ0FBQSxJQUFZLEVBQVcsS0FBZ0IsRUFBQTtRQUF2QyxJQUFJLENBQUEsSUFBQSxHQUFKLElBQUksQ0FBUTtRQUFXLElBQUssQ0FBQSxLQUFBLEdBQUwsS0FBSyxDQUFXO0FBQ2xFLFFBQUEsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDcEM7SUFFRCxPQUFPLFFBQVEsQ0FBQyxJQUFZLEVBQUE7QUFDMUIsUUFBQSxPQUFPLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFFLENBQUM7S0FDOUQ7QUFFRCxJQUFBLE9BQU8sTUFBTSxHQUFBO1FBQ1gsT0FBTyxlQUFlLENBQUMsT0FBTyxDQUFDO0tBQ2hDOztBQWhCdUIsZUFBTyxDQUFBLE9BQUEsR0FBc0IsRUFBRSxDQUFDO0FBRXhDLGVBQUcsQ0FBQSxHQUFBLEdBQUcsSUFBSSxlQUFlLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLGVBQUssQ0FBQSxLQUFBLEdBQUcsSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzFDLGVBQUksQ0FBQSxJQUFBLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQzs7TUNVNUMsbUJBQW1CLENBQUE7SUF3QzlCLFdBQTZCLENBQUEsSUFBVSxFQUFXLE9BQWdCLEVBQUE7UUFBckMsSUFBSSxDQUFBLElBQUEsR0FBSixJQUFJLENBQU07UUFBVyxJQUFPLENBQUEsT0FBQSxHQUFQLE9BQU8sQ0FBUztBQUNoRSxRQUFBLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDeEM7SUFFRCxPQUFPLFFBQVEsQ0FBQyxJQUFZLEVBQUE7QUFDMUIsUUFBQSxPQUFPLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUUsQ0FBQztLQUNsRTtBQUVELElBQUEsT0FBTyxNQUFNLEdBQUE7UUFDWCxPQUFPLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztLQUNwQzs7QUFqRHVCLG1CQUFPLENBQUEsT0FBQSxHQUEwQixFQUFFLENBQUM7QUFFNUMsbUJBQUEsQ0FBQSxLQUFLLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxPQUFPLEVBQUU7QUFDdkQsSUFBQSxTQUFTLEVBQUUsRUFBRTtBQUNiLElBQUEsR0FBRyxFQUFFLE9BQU87QUFDYixDQUFBLENBQUMsQ0FBQztBQUNhLG1CQUFBLENBQUEsR0FBRyxHQUFHLElBQUksbUJBQW1CLENBQUMsS0FBSyxFQUFFO0FBQ25ELElBQUEsU0FBUyxFQUFFLEVBQUU7QUFDYixJQUFBLEdBQUcsRUFBRSxLQUFLO0FBQ1gsQ0FBQSxDQUFDLENBQUM7QUFDYSxtQkFBQSxDQUFBLFNBQVMsR0FBRyxJQUFJLG1CQUFtQixDQUFDLGdCQUFnQixFQUFFO0lBQ3BFLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNsQixJQUFBLEdBQUcsRUFBRSxPQUFPO0FBQ2IsQ0FBQSxDQUFDLENBQUM7QUFDYSxtQkFBQSxDQUFBLFNBQVMsR0FBRyxJQUFJLG1CQUFtQixDQUFDLFdBQVcsRUFBRTtJQUMvRCxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDbEIsSUFBQSxHQUFHLEVBQUUsT0FBTztBQUNiLENBQUEsQ0FBQyxDQUFDO0FBQ2EsbUJBQUEsQ0FBQSxXQUFXLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxhQUFhLEVBQUU7SUFDbkUsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ3BCLElBQUEsR0FBRyxFQUFFLE9BQU87QUFDYixDQUFBLENBQUMsQ0FBQztBQUNhLG1CQUFBLENBQUEsS0FBSyxHQUFHLElBQUksbUJBQW1CLENBQUMsT0FBTyxFQUFFO0FBQ3ZELElBQUEsU0FBUyxFQUFFLEVBQUU7QUFDYixJQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1QsQ0FBQSxDQUFDLENBQUM7QUFDYSxtQkFBQSxDQUFBLFdBQVcsR0FBRyxJQUFJLG1CQUFtQixDQUFDLGFBQWEsRUFBRTtJQUNuRSxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDcEIsSUFBQSxHQUFHLEVBQUUsR0FBRztBQUNULENBQUEsQ0FBQyxDQUFDO0FBQ2EsbUJBQUEsQ0FBQSxTQUFTLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxXQUFXLEVBQUU7QUFDL0QsSUFBQSxTQUFTLEVBQUUsRUFBRTtBQUNiLElBQUEsR0FBRyxFQUFFLEdBQUc7QUFDVCxDQUFBLENBQUMsQ0FBQztBQUNhLG1CQUFBLENBQUEsSUFBSSxHQUFHLElBQUksbUJBQW1CLENBQUMsTUFBTSxFQUFFO0FBQ3JELElBQUEsU0FBUyxFQUFFLEVBQUU7QUFDYixJQUFBLEdBQUcsRUFBRSxFQUFFO0FBQ1IsQ0FBQSxDQUFDOztNQzlDUyx3QkFBd0IsQ0FBQTtJQVFuQyxXQUFvQixDQUFBLEdBQVEsRUFBVSxTQUFvQixFQUFBO1FBQXRDLElBQUcsQ0FBQSxHQUFBLEdBQUgsR0FBRyxDQUFLO1FBQVUsSUFBUyxDQUFBLFNBQUEsR0FBVCxTQUFTLENBQVc7UUFQMUQsSUFBa0IsQ0FBQSxrQkFBQSxHQUF1QixFQUFFLENBQUM7UUFDcEMsSUFBSyxDQUFBLEtBQUEsR0FBVyxFQUFFLENBQUM7S0FNbUM7QUFFeEQsSUFBQSxZQUFZLENBQUMscUJBQTZCLEVBQUE7O1lBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUVsQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFFMUQsWUFBQSxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSztBQUNyQyxpQkFBQSxnQkFBZ0IsRUFBRTtpQkFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7aUJBQ2xCLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkUsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEUsaUJBQUEsTUFBTSxDQUNMLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHlCQUF5QixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxjQUFjLENBQ3hFLENBQUM7WUFFSixJQUFJLFdBQVcsR0FBOEIsRUFBRSxDQUFDO0FBQ2hELFlBQUEsS0FBSyxNQUFNLElBQUksSUFBSSxpQkFBaUIsRUFBRTtBQUNwQyxnQkFBQSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFeEQsZ0JBQUEsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVM7cUJBQzFCLFFBQVEsQ0FBQyxPQUFPLENBQUM7cUJBQ2pCLE1BQU0sQ0FDTCxDQUFDLENBQUMsS0FDQSxDQUFDLENBQUMsTUFBTSxJQUFJLHFCQUFxQjtvQkFDakMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUMzQztxQkFDQSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sMEJBQTBCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsZ0JBQUEsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7b0JBQzFCLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRztBQUNuQix3QkFBQSxLQUFLLEVBQUUsS0FBSztBQUNaLHdCQUFBLElBQUksRUFBRSxjQUFjO0FBQ3BCLHdCQUFBLFdBQVcsRUFBRSxJQUFJO0FBQ2pCLHdCQUFBLFdBQVcsRUFBRSxJQUFJO3FCQUNsQixDQUFDO0FBQ0gsaUJBQUE7QUFDRixhQUFBO1lBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3pFLENBQUEsQ0FBQTtBQUFBLEtBQUE7SUFFRCxVQUFVLEdBQUE7QUFDUixRQUFBLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUEsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztLQUM5QjtBQUVELElBQUEsSUFBSSxTQUFTLEdBQUE7QUFDWCxRQUFBLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDMUI7QUFFRCxJQUFBLFdBQVcsQ0FDVCxTQUFvQixFQUNwQixxQkFBK0IsRUFDL0IscUJBQStCLEVBQy9CLHlCQUFrQyxFQUFBO0FBRWxDLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBQSxJQUFJLENBQUMscUJBQXFCLEdBQUcscUJBQXFCLENBQUM7QUFDbkQsUUFBQSxJQUFJLENBQUMscUJBQXFCLEdBQUcscUJBQXFCLENBQUM7QUFDbkQsUUFBQSxJQUFJLENBQUMseUJBQXlCLEdBQUcseUJBQXlCLENBQUM7S0FDNUQ7QUFDRjs7TUN2RVksa0JBQWtCLENBQUE7SUFvQjdCLFdBQTZCLENBQUEsSUFBVSxFQUFXLE9BQWdCLEVBQUE7UUFBckMsSUFBSSxDQUFBLElBQUEsR0FBSixJQUFJLENBQU07UUFBVyxJQUFPLENBQUEsT0FBQSxHQUFQLE9BQU8sQ0FBUztBQUNoRSxRQUFBLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkM7SUFFRCxPQUFPLFFBQVEsQ0FBQyxJQUFZLEVBQUE7QUFDMUIsUUFBQSxPQUFPLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUUsQ0FBQztLQUNqRTtBQUVELElBQUEsT0FBTyxNQUFNLEdBQUE7UUFDWCxPQUFPLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztLQUNuQzs7QUE3QnVCLGtCQUFPLENBQUEsT0FBQSxHQUF5QixFQUFFLENBQUM7QUFFM0Msa0JBQUEsQ0FBQSxJQUFJLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7QUFDcEQsSUFBQSxTQUFTLEVBQUUsRUFBRTtBQUNiLElBQUEsR0FBRyxFQUFFLElBQUk7QUFDVixDQUFBLENBQUMsQ0FBQztBQUNhLGtCQUFBLENBQUEsU0FBUyxHQUFHLElBQUksa0JBQWtCLENBQUMsZ0JBQWdCLEVBQUU7SUFDbkUsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2xCLElBQUEsR0FBRyxFQUFFLE9BQU87QUFDYixDQUFBLENBQUMsQ0FBQztBQUNhLGtCQUFBLENBQUEsU0FBUyxHQUFHLElBQUksa0JBQWtCLENBQUMsV0FBVyxFQUFFO0lBQzlELFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNsQixJQUFBLEdBQUcsRUFBRSxPQUFPO0FBQ2IsQ0FBQSxDQUFDLENBQUM7QUFDYSxrQkFBQSxDQUFBLFdBQVcsR0FBRyxJQUFJLGtCQUFrQixDQUFDLGFBQWEsRUFBRTtJQUNsRSxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDcEIsSUFBQSxHQUFHLEVBQUUsT0FBTztBQUNiLENBQUEsQ0FBQzs7TUN2QlMsdUJBQXVCLENBQUE7SUFpQmxDLFdBQ1csQ0FBQSxJQUFZLEVBQ1osU0FBd0MsRUFBQTtRQUR4QyxJQUFJLENBQUEsSUFBQSxHQUFKLElBQUksQ0FBUTtRQUNaLElBQVMsQ0FBQSxTQUFBLEdBQVQsU0FBUyxDQUErQjtBQUVqRCxRQUFBLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDNUM7SUFFRCxPQUFPLFFBQVEsQ0FBQyxJQUFZLEVBQUE7QUFDMUIsUUFBQSxPQUFPLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUUsQ0FBQztLQUN0RTtBQUVELElBQUEsT0FBTyxNQUFNLEdBQUE7UUFDWCxPQUFPLHVCQUF1QixDQUFDLE9BQU8sQ0FBQztLQUN4Qzs7QUE3QnVCLHVCQUFPLENBQUEsT0FBQSxHQUE4QixFQUFFLENBQUM7QUFFaEQsdUJBQUksQ0FBQSxJQUFBLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxJQUFJLENBQUMsQ0FBQztBQUN2RCx1QkFBSyxDQUFBLEtBQUEsR0FBRyxJQUFJLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksS0FBSTtBQUNwRSxJQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3JCLFFBQUEsT0FBTyxJQUFJLENBQUM7QUFDYixLQUFBO0FBQ0QsSUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssa0JBQWtCO1VBQ25DLElBQUksQ0FBQyxXQUFXO0FBQ2xCLFVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNqQyxDQUFDLENBQUMsQ0FBQztBQUNhLHVCQUFJLENBQUEsSUFBQSxHQUFHLElBQUksdUJBQXVCLENBQ2hELE1BQU0sRUFDTixDQUFDLElBQUksZUFBSyxPQUFBLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxXQUFXLG1DQUFJLElBQUksQ0FBQSxFQUFBLENBQ25DOztBQ1hILFNBQVMsY0FBYyxDQUFDLElBQVksRUFBQTtBQUNsQyxJQUFBLE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQyxJQUFBLE9BQU8sSUFBSSxLQUFLLGNBQWMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FDekIsSUFBVyxFQUNYLEdBQVcsRUFDWCxNQUF3QixFQUFBO0lBRXhCLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUN4QixHQUFHO0FBQ0gsUUFBQSxLQUFLLEVBQUUsQ0FBQztBQUNSLFFBQUEsSUFBSSxFQUFFLGFBQWE7UUFDbkIsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ3RCLFFBQUEsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsS0FBQSxDQUFDLENBQUMsQ0FBQztBQUNOLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFXLEVBQUUsRUFBdUMsRUFBQTtBQUNyRSxJQUFBLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDdEIsU0FBQSxNQUFNLENBQ0wsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FDWixLQUFLLElBQUksSUFBSTtBQUNiLFNBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUM5RDtBQUNBLFNBQUEsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEtBQUssa0JBQWtCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRDtBQUNBLFNBQVMsbUJBQW1CLENBQzFCLGtCQUFpRSxFQUFBO0FBRWpFLElBQUEsT0FBTyxNQUFNLENBQ1gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUN4QyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQ3JDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQ3BCLEtBQXdCLEVBQUE7QUFFeEIsSUFBQSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoRCxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQ3ZCLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUM1QixDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBOEIsS0FBSztRQUM3QyxHQUFHO0FBQ0gsUUFBQSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLEtBQUEsQ0FDRixDQUNGLENBQUM7QUFDSixDQUFDO01BRVksdUJBQXVCLENBQUE7SUFLbEMsV0FBb0IsQ0FBQSxHQUFRLEVBQVUsU0FBb0IsRUFBQTtRQUF0QyxJQUFHLENBQUEsR0FBQSxHQUFILEdBQUcsQ0FBSztRQUFVLElBQVMsQ0FBQSxTQUFBLEdBQVQsU0FBUyxDQUFXO1FBSmxELElBQWtCLENBQUEsa0JBQUEsR0FBMEMsRUFBRSxDQUFDO0tBSVQ7SUFFOUQsWUFBWSxHQUFBO1FBQ1YsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBRWxCLFFBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUk7WUFDOUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtnQkFDUCxPQUFPO0FBQ1IsYUFBQTtBQUVELFlBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELFNBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMxRDtBQUVELElBQUEsZUFBZSxDQUFDLElBQVcsRUFBQTtRQUN6QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ1AsT0FBTztBQUNSLFNBQUE7QUFFRCxRQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztLQUMxRDtJQUVELFdBQVcsR0FBQTtRQUNULElBQUksQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLHVCQUF1QixHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDMUQ7SUFFRCxVQUFVLEdBQUE7QUFDUixRQUFBLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7QUFDN0IsUUFBQSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFBLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLENBQUM7S0FDbkM7QUFFRCxJQUFBLElBQUksU0FBUyxHQUFBO0FBQ1gsUUFBQSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0tBQzFCO0FBQ0Y7O0FDekZELE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEtBQVksS0FBSyxFQUFFLENBQUM7TUFFcEMscUJBQXFCLENBQUE7SUFhaEMsV0FBNkIsQ0FBQSxJQUFVLEVBQVcsT0FBZ0IsRUFBQTtRQUFyQyxJQUFJLENBQUEsSUFBQSxHQUFKLElBQUksQ0FBTTtRQUFXLElBQU8sQ0FBQSxPQUFBLEdBQVAsT0FBTyxDQUFTO0FBQ2hFLFFBQUEscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxQztJQUVELE9BQU8sUUFBUSxDQUFDLElBQVksRUFBQTtBQUMxQixRQUFBLE9BQU8scUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBRSxDQUFDO0tBQ3BFO0FBRUQsSUFBQSxPQUFPLE1BQU0sR0FBQTtRQUNYLE9BQU8scUJBQXFCLENBQUMsT0FBTyxDQUFDO0tBQ3RDOztBQXRCdUIscUJBQU8sQ0FBQSxPQUFBLEdBQTRCLEVBQUUsQ0FBQztBQUU5QyxxQkFBTyxDQUFBLE9BQUEsR0FBRyxJQUFJLHFCQUFxQixDQUNqRCxTQUFTLEVBQ1QsZ0JBQWdCLENBQ2pCLENBQUM7QUFDYyxxQkFBTSxDQUFBLE1BQUEsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUMzRCxxQkFBTyxDQUFBLE9BQUEsR0FBRyxJQUFJLHFCQUFxQixDQUNqRCxTQUFTLEVBQ1QsMEJBQTBCLENBQzNCOztBQ2JILE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLE1BQU0sSUFBSSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDdEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUN0QixNQUFNLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBRXJCLFNBQVMsU0FBUyxDQUNoQixPQUFxQyxFQUNyQyxhQUFxQixFQUFBO0lBRXJCLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixRQUFBLE9BQU8sQ0FBQyxDQUFDO0FBQ1YsS0FBQTtBQUVELElBQUEsSUFBSSxPQUFPLENBQUMsV0FBVyxLQUFLLGFBQWEsRUFBRTtRQUN6QyxPQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztBQUNoQyxLQUFBO0lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7O0lBR2hELElBQUksTUFBTSxHQUFHLEdBQUcsRUFBRTtBQUNoQixRQUFBLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDMUIsS0FBQTtTQUFNLElBQUksTUFBTSxHQUFHLElBQUksRUFBRTtBQUN4QixRQUFBLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDMUIsS0FBQTtTQUFNLElBQUksTUFBTSxHQUFHLEdBQUcsRUFBRTtBQUN2QixRQUFBLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDMUIsS0FBQTtTQUFNLElBQUksTUFBTSxHQUFHLElBQUksRUFBRTtBQUN4QixRQUFBLE9BQU8sR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDNUIsS0FBQTtBQUFNLFNBQUE7QUFDTCxRQUFBLE9BQU8sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDN0IsS0FBQTtBQUNILENBQUM7TUFFWSx1QkFBdUIsQ0FBQTtBQVNsQyxJQUFBLFdBQUEsQ0FDRSxJQUE2QixHQUFBLEVBQUUsRUFDL0Isb0JBQTRCLEVBQzVCLHdCQUFnQyxFQUFBO0FBRWhDLFFBQUEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFFakIsUUFBQSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdkIsUUFBQSxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUNuQixRQUFBLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7QUFFNUIsUUFBQSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUM7QUFDakQsUUFBQSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsd0JBQXdCLENBQUM7S0FDMUQ7O0lBR0QsS0FBSyxHQUFBOztBQUNILFFBQUEsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztRQUUzQixLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3hDLFlBQUEsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUMvQyxnQkFBQSxLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUNyRCxJQUNFLElBQUksQ0FBQyxvQkFBb0I7QUFDekIsd0JBQUEsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVztBQUMzQyw0QkFBQSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsR0FBRyxFQUNqQztBQUNBLHdCQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxxQkFBQTtBQUFNLHlCQUFBO0FBQ0wsd0JBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3JELHFCQUFBO0FBQ0YsaUJBQUE7QUFFRCxnQkFBQSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUN6QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsaUJBQUE7QUFDRixhQUFBO1lBRUQsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNsQyxnQkFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsYUFBQTtBQUNGLFNBQUE7UUFFRCxJQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtZQUNqQyxNQUFNLFNBQVMsR0FDYixDQUFBLEVBQUEsR0FBQSxLQUFLO2lCQUNGLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQyxpQkFBQSxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztBQUN2QyxpQkFBQSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBSSxDQUFDLENBQUM7WUFFakIsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN4QyxnQkFBQSxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQy9DLG9CQUFBLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDckQsd0JBQUEsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBRyxTQUFTLEVBQUU7QUFDdkQsNEJBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLHlCQUFBO0FBQ0YscUJBQUE7QUFFRCxvQkFBQSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUN6QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIscUJBQUE7QUFDRixpQkFBQTtnQkFFRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ2xDLG9CQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixpQkFBQTtBQUNGLGFBQUE7QUFDRixTQUFBO0tBQ0Y7QUFFRCxJQUFBLG1CQUFtQixDQUFDLElBQWEsRUFBQTs7UUFDL0IsT0FBTyxDQUFBLEVBQUEsR0FBQSxNQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQywwQ0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3ZEO0FBRUQsSUFBQSxTQUFTLENBQUMsSUFBYSxFQUFBO1FBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsU0FBQTtBQUNELFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNwQyxZQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEMsU0FBQTtBQUVELFFBQUEsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzlDLFlBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRztnQkFDM0MsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUM7QUFDM0QsZ0JBQUEsV0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7YUFDeEIsQ0FBQztBQUNILFNBQUE7QUFBTSxhQUFBO0FBQ0wsWUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHO0FBQzNDLGdCQUFBLEtBQUssRUFBRSxDQUFDO0FBQ1IsZ0JBQUEsV0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7YUFDeEIsQ0FBQztBQUNILFNBQUE7QUFFRCxRQUFBLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQzNCO0FBRUQsSUFBQSxPQUFPLENBQUMsRUFBVyxFQUFFLEVBQVcsRUFBRSxhQUFxQixFQUFBO0FBQ3JELFFBQUEsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUN0RSxRQUFBLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFdEUsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO0FBQ3JCLFlBQUEsT0FBTyxDQUFDLENBQUM7QUFDVixTQUFBO0FBRUQsUUFBQSxPQUFPLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pDO0FBRUQsSUFBQSxJQUFJLGFBQWEsR0FBQTtBQUNmLFFBQUEsT0FBTyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztLQUM3QztJQUVELGtCQUFrQixHQUFBO0FBQ2hCLFFBQUEsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDdEM7QUFDRjs7QUNySUQsU0FBUyxlQUFlLENBQUMsT0FBZSxFQUFFLElBQVksRUFBQTtJQUNwRCxPQUFPLENBQUEsRUFBRyxPQUFPLENBQUEsRUFBQSxFQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUEsSUFBQSxDQUFNLENBQUM7QUFDL0MsQ0FBQztBQXNCSyxNQUFPLG1CQUNYLFNBQVFHLHNCQUFtQixDQUFBO0lBc0MzQixXQUFvQixDQUFBLEdBQVEsRUFBRSxTQUE0QixFQUFBO1FBQ3hELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQVpiLElBQW1CLENBQUEsbUJBQUEsR0FBRyxFQUFFLENBQUM7UUFNekIsSUFBa0IsQ0FBQSxrQkFBQSxHQUF5QixFQUFFLENBQUM7UUFPNUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQyxRQUFBLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0tBQzVCO0lBRUQsZUFBZSxHQUFBO1FBQ2IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3RELFFBQUEsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUMxQixPQUFPO0FBQ1IsU0FBQTs7QUFHRCxRQUFBLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNqRDtJQUVELE9BQWEsR0FBRyxDQUNkLEdBQVEsRUFDUixRQUFrQixFQUNsQixTQUE0QixFQUM1Qix5QkFBcUMsRUFBQTs7WUFFckMsTUFBTSxHQUFHLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFFcEQsWUFBQSxHQUFHLENBQUMsdUJBQXVCLEdBQUcsSUFBSSx1QkFBdUIsQ0FDdkQsR0FBRyxDQUFDLEdBQUcsRUFDUCxHQUFHLENBQUMsU0FBUyxDQUNkLENBQUM7QUFDRixZQUFBLEdBQUcsQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLHdCQUF3QixDQUN6RCxHQUFHLENBQUMsR0FBRyxFQUNQLEdBQUcsQ0FBQyxTQUFTLENBQ2QsQ0FBQztBQUNGLFlBQUEsR0FBRyxDQUFDLDRCQUE0QixHQUFHLElBQUksNEJBQTRCLENBQ2pFLEdBQUcsQ0FBQyxHQUFHLEVBQ1AsR0FBRyxDQUFDLFNBQVMsQ0FDZCxDQUFDO0FBQ0YsWUFBQSxHQUFHLENBQUMsd0JBQXdCLEdBQUcsSUFBSSx3QkFBd0IsQ0FDekQsR0FBRyxDQUFDLEdBQUcsRUFDUCxHQUFHLENBQUMsU0FBUyxDQUNkLENBQUM7QUFDRixZQUFBLEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLHVCQUF1QixDQUN2RCxHQUFHLENBQUMsR0FBRyxFQUNQLEdBQUcsQ0FBQyxTQUFTLENBQ2QsQ0FBQztZQUVGLEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLHVCQUF1QixDQUN2RCxRQUFRLENBQUMsb0JBQW9CLEVBQzdCLFFBQVEsQ0FBQyxtQ0FBbUMsQ0FBQyxvQkFBb0IsRUFDakUsUUFBUSxDQUFDLG1DQUFtQyxDQUFDLHdCQUF3QixDQUN0RSxDQUFDO0FBQ0YsWUFBQSxHQUFHLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFFcEMsWUFBQSxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFbkMsWUFBQSxHQUFHLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFPLENBQUMsS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7O0FBQ3RELGdCQUFBLE1BQU0sR0FBRyxDQUFDLHdCQUF3QixFQUFFLENBQUM7QUFDckMsZ0JBQUEsSUFBSSxNQUFBLEdBQUcsQ0FBQyx1QkFBdUIsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxhQUFhLEVBQUU7b0JBQzlDLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEdBQUcsR0FBRyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQztBQUNyRSxvQkFBQSxHQUFHLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUNqRCxvQkFBQSx5QkFBeUIsRUFBRSxDQUFDO0FBQzdCLGlCQUFBO2FBQ0YsQ0FBQSxDQUFDLENBQUM7QUFDSCxZQUFBLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FDeEMsb0JBQW9CLEVBQ3BCLENBQU8sQ0FBQyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtBQUNWLGdCQUFBLE1BQU0sR0FBRyxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ3JDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUNoQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzthQUM5QixDQUFBLENBQ0YsQ0FBQztBQUVGLFlBQUEsR0FBRyxDQUFDLHNCQUFzQixHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsS0FBSTtBQUNqRSxnQkFBQSxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDbEMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDOUIsaUJBQUE7QUFDSCxhQUFDLENBQUMsQ0FBQzs7WUFHSCxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFXLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtnQkFDbkUsR0FBRyxDQUFDLHlCQUF5QixFQUFFLENBQUM7Z0JBQ2hDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDOztnQkFFL0IsR0FBRyxDQUFDLDZCQUE2QixFQUFFLENBQUM7O2dCQUVwQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsQ0FBQztnQkFFaEMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDaEQsQ0FBQSxDQUFDLENBQUM7QUFFSCxZQUFBLE9BQU8sR0FBRyxDQUFDO1NBQ1osQ0FBQSxDQUFBO0FBQUEsS0FBQTtJQUVELG1CQUFtQixHQUFBO1FBQ2pCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsT0FBTztBQUNSLFNBQUE7QUFFRCxRQUFBLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNsQyxRQUFBLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTO0FBQ2hDLGFBQUEsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pELGFBQUEsSUFBSSxFQUFFLENBQUM7UUFDVixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2pCLE9BQU87QUFDUixTQUFBO0FBRUQsUUFBQSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUztBQUM1QixhQUFBLFFBQVEsQ0FDUCxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUN4RTtBQUNBLGFBQUEsT0FBTyxFQUFFO2FBQ1QsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNSLGFBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTO0FBQ3hCLGlCQUFBLFFBQVEsQ0FDUCxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN0QixnQkFBQSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3hELGdCQUFBLEVBQUUsRUFBRSxDQUFDO0FBQ04sYUFBQSxDQUFDLENBQ0g7QUFDQSxpQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0FBQzVDLFNBQUE7UUFDRCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsT0FBTztBQUNSLFNBQUE7QUFFRCxRQUFBLE1BQU0sQ0FBQyxZQUFZLENBQ2pCLFVBQVUsRUFDVixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFDMUQsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUNyQyxDQUFDO1FBRUYsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3RCO0lBRUQsVUFBVSxHQUFBO1FBQ1IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0tBQzVEOztBQUdELElBQUEsSUFBSSxpQkFBaUIsR0FBQTtRQUNuQixPQUFPLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzFEO0FBRUQsSUFBQSxJQUFJLGFBQWEsR0FBQTtRQUNmLE9BQU8sYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzVEO0FBRUQsSUFBQSxJQUFJLDZCQUE2QixHQUFBO1FBQy9CLE9BQU8scUJBQXFCLENBQUMsUUFBUSxDQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxDQUNqRCxDQUFDO0tBQ0g7QUFFRCxJQUFBLElBQUksa0JBQWtCLEdBQUE7QUFDcEIsUUFBQSxRQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsOEJBQThCO0FBQzVDLFlBQUEsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixFQUN2QztLQUNIO0FBRUQsSUFBQSxJQUFJLGdDQUFnQyxHQUFBO0FBQ2xDLFFBQUEsUUFDRSxJQUFJLENBQUMsUUFBUSxDQUFDLGdDQUFnQztBQUM5QyxZQUFBLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFDeEM7S0FDSDtBQUVELElBQUEsSUFBSSxpQ0FBaUMsR0FBQTtBQUNuQyxRQUFBLFFBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUM7QUFDL0MsWUFBQSxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLEVBQ3hDO0tBQ0g7QUFFRCxJQUFBLElBQUksdUJBQXVCLEdBQUE7UUFDekIsT0FBTyx1QkFBdUIsQ0FBQyxRQUFRLENBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQ3RDLENBQUM7S0FDSDtBQUVELElBQUEsSUFBSSxxQ0FBcUMsR0FBQTtBQUN2QyxRQUFBLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUM7YUFDdkQsS0FBSyxDQUFDLElBQUksQ0FBQzthQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNyQjs7QUFJRCxJQUFBLElBQUksWUFBWSxHQUFBO1FBQ2QsT0FBTztBQUNMLFlBQUEsV0FBVyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxrQkFBa0I7QUFDNUQsWUFBQSxZQUFZLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGtCQUFrQjtBQUM5RCxZQUFBLGdCQUFnQixFQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxrQkFBa0I7QUFDdEUsWUFBQSxZQUFZLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGtCQUFrQjtBQUM5RCxZQUFBLFdBQVcsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsdUJBQXVCO1NBQ2xFLENBQUM7S0FDSDtBQUVLLElBQUEsY0FBYyxDQUFDLFFBQWtCLEVBQUE7O0FBQ3JDLFlBQUEsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFFekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FDdEMsQ0FBQztZQUVGLElBQUk7QUFDRixnQkFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sZUFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUUsYUFBQTtBQUFDLFlBQUEsT0FBTyxDQUFNLEVBQUU7Z0JBQ2YsSUFBSUQsZUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUIsYUFBQTtZQUNELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLENBQ3ZDLElBQUksQ0FBQyxTQUFTLEVBQ2QsUUFBUSxDQUFDLHFDQUFxQztpQkFDM0MsS0FBSyxDQUFDLElBQUksQ0FBQztpQkFDWCxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ25CLFFBQVEsQ0FBQyxxQ0FBcUM7aUJBQzNDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDWCxpQkFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ25CLFFBQVEsQ0FBQyxpREFBaUQsQ0FDM0QsQ0FBQztBQUNGLFlBQUEsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsQ0FDM0MsUUFBUSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQzNELGVBQWUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUNsRCxRQUFRLENBQUMsbURBQW1ELElBQUksSUFBSSxDQUNyRSxDQUFDO1lBRUYsSUFBSSxDQUFDLHNCQUFzQixHQUFHRSxpQkFBUSxDQUNwQyxDQUFDLE9BQTZCLEVBQUUsRUFBMkIsS0FBSTtBQUM3RCxnQkFBQSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFaEMsZ0JBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQW9CLGlCQUFBLEVBQUEsT0FBTyxDQUFDLEtBQUssQ0FBRSxDQUFBLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQU0zQyxDQUFDO0FBRUYsZ0JBQUEsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU87QUFDOUIscUJBQUEsTUFBTSxDQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQ1AsV0FBVyxDQUFDLGtCQUFrQjtxQkFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsR0FBRyxDQUFDLEdBQUcsQ0FBQztBQUNwRCx3QkFBQSxFQUFFLENBQUMsTUFBTTtBQUNULHdCQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxrQkFBa0I7d0JBQ3hDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDM0I7QUFDQSxxQkFBQSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUk7QUFDVCxvQkFBQSxNQUFNLE9BQU8sR0FDWCxXQUFXLENBQUMsa0JBQWtCO0FBQzlCLHdCQUFBLElBQUksQ0FBQyw2QkFBNkI7QUFDaEMsNEJBQUEscUJBQXFCLENBQUMsT0FBTztBQUM3QiwwQkFBRSxJQUFJLENBQUMsNkJBQTZCLENBQUMsT0FBTztBQUM1QywwQkFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztBQUNqQyxvQkFBQSxPQUFPLE9BQU8sQ0FDWixJQUFJLENBQUMsWUFBWSxFQUNqQixDQUFDLENBQUMsSUFBSSxFQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQ3BDO3dCQUNFLFdBQVcsRUFBRSxXQUFXLENBQUMsa0JBQWtCO3dCQUMzQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsdUJBQXVCO0FBQ3RELHFCQUFBLENBQ0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQUssTUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBTSxJQUFJLENBQUEsRUFBQSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFBLENBQUEsQ0FBRyxDQUFDLENBQUM7QUFDbkQsaUJBQUMsQ0FBQztBQUNELHFCQUFBLElBQUksRUFBRSxDQUFDO0FBRVYsZ0JBQUEsRUFBRSxDQUNBLFFBQVEsQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxLQUFLLENBQzVDLENBQUMsRUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUNyQyxDQUNGLENBQUM7QUFFRixnQkFBQSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQ2hCLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQzlELENBQUM7YUFDSCxFQUNELElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQy9CLElBQUksQ0FDTCxDQUFDO0FBRUYsWUFBQSxJQUFJLENBQUMsYUFBYSxHQUFHQSxpQkFBUSxDQUFDLE1BQUs7Z0JBQ2pDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNkLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUV6QyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDeEIsQ0FBQSxDQUFBO0FBQUEsS0FBQTtJQUVPLGVBQWUsR0FBQTtBQUNyQixRQUFBLE1BQU0sb0JBQW9CLEdBQUcsQ0FDM0IsU0FBcUIsRUFDckIsR0FBa0IsS0FDaEI7QUFDRixZQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBSztnQkFDdkMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2IsZ0JBQUEsT0FBTyxJQUFJLENBQUM7YUFDYixDQUFDLENBQ0gsQ0FBQztBQUNKLFNBQUMsQ0FBQzs7QUFHRixRQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRSxRQUFBLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFFLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxTQUFTLENBQUUsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLFdBQVcsQ0FBRSxDQUFDLENBQUM7O0FBRzNFLFFBQUEsTUFBTSxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQ25DLENBQUM7QUFDRixRQUFBLElBQUksbUJBQW1CLEtBQUssbUJBQW1CLENBQUMsS0FBSyxFQUFFO0FBQ3JELFlBQUEsb0JBQW9CLENBQ2xCLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUMzQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FDdEMsQ0FBQztBQUNILFNBQUE7QUFDRCxRQUFBLElBQUksbUJBQW1CLEtBQUssbUJBQW1CLENBQUMsR0FBRyxFQUFFO0FBQ25ELFlBQUEsb0JBQW9CLENBQ2xCLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUN6QyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FDcEMsQ0FBQztBQUNILFNBQUE7QUFDRCxRQUFBLElBQUksbUJBQW1CLEtBQUssbUJBQW1CLENBQUMsSUFBSSxFQUFFO1lBQ3BELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUNqQixtQkFBbUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUNyQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUMvQixNQUFLO0FBQ0gsZ0JBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckMsZ0JBQUEsT0FBTyxLQUFLLENBQUM7YUFDZCxDQUNGLENBQ0YsQ0FBQztBQUNILFNBQUE7O1FBR0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssUUFBUSxDQUFFLENBQUMsSUFBSSxHQUFHLE1BQUs7WUFDM0QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2IsWUFBQSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDO0FBQ3BDLFNBQUMsQ0FBQzs7QUFHRixRQUFBLE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBa0IsS0FBSTtBQUN4QyxZQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN6RSxZQUFBLE9BQU8sS0FBSyxDQUFDO0FBQ2YsU0FBQyxDQUFDO0FBQ0YsUUFBQSxNQUFNLGNBQWMsR0FBRyxDQUFDLEdBQWtCLEtBQUk7QUFDNUMsWUFBQSxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekUsWUFBQSxPQUFPLEtBQUssQ0FBQztBQUNmLFNBQUMsQ0FBQztBQUVGLFFBQUEsTUFBTSwyQkFBMkIsR0FBRywyQkFBMkIsQ0FBQyxRQUFRLENBQ3RFLElBQUksQ0FBQyxRQUFRLENBQUMscUNBQXFDLENBQ3BELENBQUM7QUFDRixRQUFBLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQywrQ0FBK0MsRUFBRTtBQUNqRSxZQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBSztnQkFDeEMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2IsZ0JBQUEsT0FBTyxJQUFJLENBQUM7QUFDZCxhQUFDLENBQUMsRUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQUs7Z0JBQ3RDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNiLGdCQUFBLE9BQU8sSUFBSSxDQUFDO2FBQ2IsQ0FBQyxDQUNILENBQUM7QUFDSCxTQUFBO0FBQU0sYUFBQTtBQUNMLFlBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FDbkQsQ0FBQztBQUNILFNBQUE7QUFDRCxRQUFBLElBQUksMkJBQTJCLEtBQUssMkJBQTJCLENBQUMsSUFBSSxFQUFFO0FBQ3BFLFlBQUEsSUFBSSwyQkFBMkIsS0FBSywyQkFBMkIsQ0FBQyxHQUFHLEVBQUU7QUFDbkUsZ0JBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBRSxDQUNwRSxDQUFDO0FBQ0gsYUFBQTtZQUNELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUNqQiwyQkFBMkIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUM3QywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUN2QyxVQUFVLENBQ1gsRUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FDakIsMkJBQTJCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFDakQsMkJBQTJCLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFDM0MsY0FBYyxDQUNmLENBQ0YsQ0FBQztBQUNILFNBQUE7QUFFRCxRQUFBLE1BQU0saUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxDQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUNoQyxDQUFDO0FBQ0YsUUFBQSxJQUFJLGlCQUFpQixLQUFLLGtCQUFrQixDQUFDLElBQUksRUFBRTtZQUNqRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FDakIsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFDbkMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFDN0IsTUFBSztBQUNILGdCQUFBLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEUsZ0JBQUEsSUFDRSxJQUFJLENBQUMsSUFBSSxLQUFLLGNBQWM7b0JBQzVCLElBQUksQ0FBQyxJQUFJLEtBQUssY0FBYztBQUM1QixvQkFBQSxJQUFJLENBQUMsSUFBSSxLQUFLLGFBQWEsRUFDM0I7QUFDQSxvQkFBQSxPQUFPLEtBQUssQ0FBQztBQUNkLGlCQUFBO0FBRUQsZ0JBQUEsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FDdkQsSUFBSSxDQUFDLFdBQVcsQ0FDakIsQ0FBQztnQkFDRixJQUFJLENBQUMsWUFBWSxFQUFFOztvQkFFakIsSUFBSUYsZUFBTSxDQUFDLENBQWMsV0FBQSxFQUFBLElBQUksQ0FBQyxXQUFXLENBQUEsQ0FBRSxDQUFDLENBQUM7QUFDN0Msb0JBQUEsT0FBTyxLQUFLLENBQUM7QUFDZCxpQkFBQTtnQkFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwRCxnQkFBQSxPQUFPLEtBQUssQ0FBQzthQUNkLENBQ0YsQ0FDRixDQUFDO0FBQ0gsU0FBQTtLQUNGO0lBRUssd0JBQXdCLEdBQUE7O0FBQzVCLFlBQUEsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hDLFlBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBRXhDLFlBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUU7QUFDOUMsZ0JBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBQ3hDLGdCQUFBLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMxQyxnQkFBQSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQ2hCLGVBQWUsQ0FDYixvQ0FBb0MsRUFDcEMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FDMUIsQ0FDRixDQUFDO2dCQUNGLE9BQU87QUFDUixhQUFBO0FBRUQsWUFBQSxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsNENBQTRDLEVBQzFELElBQUksQ0FBQyxnQ0FBZ0MsQ0FDdEMsQ0FBQztZQUVGLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQ2xDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQ3ZDLENBQUM7QUFDRixZQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsTUFDaEIsZUFBZSxDQUFDLDJCQUEyQixFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FDeEUsQ0FBQztTQUNILENBQUEsQ0FBQTtBQUFBLEtBQUE7SUFFSyx5QkFBeUIsR0FBQTs7QUFDN0IsWUFBQSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEMsWUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFFLENBQUM7QUFFekMsWUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTtBQUMvQyxnQkFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFFLENBQUM7QUFDekMsZ0JBQUEsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzNDLGdCQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsTUFDaEIsZUFBZSxDQUNiLHFDQUFxQyxFQUNyQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUMxQixDQUNGLENBQUM7Z0JBQ0YsT0FBTztBQUNSLGFBQUE7WUFFRCxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLENBQzlDLElBQUksQ0FBQyxpQ0FBaUMsQ0FDdkMsQ0FBQztZQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQ25DLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQ3hDLENBQUM7QUFDRixZQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsTUFDaEIsZUFBZSxDQUFDLDRCQUE0QixFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FDekUsQ0FBQztTQUNILENBQUEsQ0FBQTtBQUFBLEtBQUE7SUFFSyw2QkFBNkIsR0FBQTs7QUFDakMsWUFBQSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEMsWUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLDJCQUEyQixFQUFFLENBQUM7QUFFN0MsWUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRTtBQUNuRCxnQkFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLDJCQUEyQixFQUFFLENBQUM7QUFDN0MsZ0JBQUEsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQy9DLGdCQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsTUFDaEIsZUFBZSxDQUNiLHdDQUF3QyxFQUN4QyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUMxQixDQUNGLENBQUM7Z0JBQ0YsT0FBTztBQUNSLGFBQUE7QUFFRCxZQUFBLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLGtCQUFrQixDQUFDO0FBQ3pELGdCQUFBLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGdDQUFnQztBQUN0RCxnQkFBQSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLHlCQUF5QixJQUFJLFNBQVM7QUFDdEUsZ0JBQUEsbUJBQW1CLEVBQ2pCLElBQUksQ0FBQyxRQUFRLENBQUMsbURBQW1EO29CQUNqRSxTQUFTO0FBQ1gsZ0JBQUEsV0FBVyxFQUNULElBQUksQ0FBQyxRQUFRLENBQUMsa0NBQWtDLElBQUksU0FBUztBQUNoRSxhQUFBLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQ3ZDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxTQUFTLENBQzVDLENBQUM7QUFDRixZQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsTUFDaEIsZUFBZSxDQUNiLGdDQUFnQyxFQUNoQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUMxQixDQUNGLENBQUM7U0FDSCxDQUFBLENBQUE7QUFBQSxLQUFBO0lBRUQseUJBQXlCLEdBQUE7QUFDdkIsUUFBQSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEMsUUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFFLENBQUM7QUFFekMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTtBQUMvQyxZQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztBQUN6QyxZQUFBLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMzQyxZQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsTUFDaEIsZUFBZSxDQUNiLG9DQUFvQyxFQUNwQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUMxQixDQUNGLENBQUM7WUFDRixPQUFPO0FBQ1IsU0FBQTtBQUVELFFBQUEsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksQ0FDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFDMUMsSUFBSSxDQUFDLHFDQUFxQyxDQUMzQyxDQUFDO1FBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FDbkMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FDeEMsQ0FBQztBQUNGLFFBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUNoQixlQUFlLENBQUMsNEJBQTRCLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUN6RSxDQUFDO0tBQ0g7SUFFRCx3QkFBd0IsR0FBQTtBQUN0QixRQUFBLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNoQyxRQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztBQUV4QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFO0FBQzlDLFlBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBQ3hDLFlBQUEsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzFDLFlBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUNoQixlQUFlLENBQ2IsbUNBQW1DLEVBQ25DLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQzFCLENBQ0YsQ0FBQztZQUNGLE9BQU87QUFDUixTQUFBO0FBRUQsUUFBQSxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FDbEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FDdkMsQ0FBQztBQUNGLFFBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUNoQixlQUFlLENBQUMsMkJBQTJCLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUN4RSxDQUFDO0tBQ0g7QUFFRCxJQUFBLDJCQUEyQixDQUFDLElBQVcsRUFBQTtBQUNyQyxRQUFBLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNoQyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFO0FBQzlDLFlBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUNoQixlQUFlLENBQ2IseUNBQXlDLEVBQ3pDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQzFCLENBQ0YsQ0FBQztZQUNGLE9BQU87QUFDUixTQUFBO0FBRUQsUUFBQSxJQUFJLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRW5ELFFBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUNoQixlQUFlLENBQ2IsaUNBQWlDLEVBQ2pDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQzFCLENBQ0YsQ0FBQztLQUNIO0lBRUQsc0JBQXNCLEdBQUE7QUFDcEIsUUFBQSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRTtBQUM5QyxZQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsTUFDaEIsZUFBZSxDQUNiLG1DQUFtQyxFQUNuQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUMxQixDQUNGLENBQUM7WUFDRixPQUFPO0FBQ1IsU0FBQTtBQUVELFFBQUEsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQ2xDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQ3ZDLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsTUFDaEIsZUFBZSxDQUFDLDJCQUEyQixFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FDeEUsQ0FBQztLQUNIO0FBRUQsSUFBQSxTQUFTLENBQ1AsTUFBc0IsRUFDdEIsTUFBYyxFQUNkLElBQVcsRUFBQTs7QUFFWCxRQUFBLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUVoQyxRQUFBLE1BQU0sWUFBWSxHQUFHLENBQUMsT0FBZSxLQUFJO1lBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFlLFlBQUEsRUFBQSxPQUFPLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDcEQsU0FBQyxDQUFDO0FBQ0YsUUFBQSxNQUFNLFlBQVksR0FBRyxDQUFDLE9BQWUsS0FBSTtZQUN2QyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEIsWUFBQSxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZixTQUFDLENBQUM7QUFFRixRQUFBLElBQ0UsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QjtZQUN0QyxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQ1osQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUNqQjtZQUNBLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ3ZDLFlBQUEsT0FBTyxJQUFJLENBQUM7QUFDYixTQUFBO0FBRUQsUUFBQSxJQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsNkJBQTZCO0FBQzNDLFlBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7WUFDeEIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUNqQjtZQUNBLFlBQVksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQy9DLFlBQUEsT0FBTyxJQUFJLENBQUM7QUFDYixTQUFBO1FBRUQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUN4RCxZQUFBLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7WUFDOUIsWUFBWSxDQUFDLHFEQUFxRCxDQUFDLENBQUM7QUFDcEUsWUFBQSxPQUFPLElBQUksQ0FBQztBQUNiLFNBQUE7QUFDRCxRQUFBLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFFOUIsTUFBTSxzQkFBc0IsR0FDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRCxRQUFBLElBQUksc0JBQXNCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzVDLFlBQVksQ0FDViw0RUFBNEUsQ0FDN0UsQ0FBQztBQUNGLFlBQUEsT0FBTyxJQUFJLENBQUM7QUFDYixTQUFBO0FBQ0QsUUFBQSxJQUNFLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7QUFDeEMsWUFBQSxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQ3hDO1lBQ0EsWUFBWSxDQUNWLDZEQUE2RCxDQUM5RCxDQUFDO0FBQ0YsWUFBQSxPQUFPLElBQUksQ0FBQztBQUNiLFNBQUE7QUFFRCxRQUFBLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JFLFFBQUEsWUFBWSxDQUFDLENBQUEsVUFBQSxFQUFhLE1BQU0sQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUVwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDM0UsUUFBQSxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUNuQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsd0JBQXdCO2NBQ3JELFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0I7Y0FDekQsQ0FBQyxDQUNOLENBQUM7UUFDRixZQUFZLENBQUMsQ0FBb0IsaUJBQUEsRUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO1FBRWxFLE1BQU0sWUFBWSxHQUFHLENBQUEsRUFBQSxHQUFBLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxJQUFJLENBQUM7QUFDNUMsUUFBQSxZQUFZLENBQUMsQ0FBQSxnQkFBQSxFQUFtQixZQUFZLENBQUEsQ0FBRSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNqQixZQUFZLENBQUMsQ0FBc0Qsb0RBQUEsQ0FBQSxDQUFDLENBQUM7QUFDckUsWUFBQSxPQUFPLElBQUksQ0FBQztBQUNiLFNBQUE7QUFFRCxRQUFBLE1BQU0sK0JBQStCLEdBQ25DLENBQUEsRUFBQSxHQUFBLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBSSxFQUFFLENBQUM7QUFDakQsUUFBQSxJQUNFLElBQUksTUFBTSxDQUFDLENBQUssRUFBQSxFQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsaUNBQWlDLENBQUEsQ0FBQSxDQUFHLENBQUMsQ0FBQyxJQUFJLENBQ3RFLCtCQUErQixDQUNoQyxFQUNEO1lBQ0EsWUFBWSxDQUNWLENBQTBFLHdFQUFBLENBQUEsQ0FDM0UsQ0FBQztBQUNGLFlBQUEsT0FBTyxJQUFJLENBQUM7QUFDYixTQUFBO0FBRUQsUUFBQSxJQUNFLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQztBQUN6QixZQUFBLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUM1RDtZQUNBLFlBQVksQ0FDVixDQUE2RCwyREFBQSxDQUFBLENBQzlELENBQUM7QUFDRixZQUFBLE9BQU8sSUFBSSxDQUFDO0FBQ2IsU0FBQTtBQUVELFFBQUEsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLDJCQUEyQjtBQUNsRSxjQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUU7Y0FDdEMsU0FBUyxDQUFDO0FBQ2QsUUFBQSxZQUFZLENBQUMsQ0FBQSx3QkFBQSxFQUEyQixrQkFBa0IsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUU5RCxJQUNFLENBQUMsSUFBSSxDQUFDLFdBQVc7QUFDakIsWUFBQSxDQUFDLGtCQUFrQjtBQUNuQixZQUFBLFlBQVksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUM3QztZQUNBLFlBQVksQ0FDVixvRkFBb0YsQ0FDckYsQ0FBQztBQUNGLFlBQUEsT0FBTyxJQUFJLENBQUM7QUFDYixTQUFBO0FBRUQsUUFBQSxZQUFZLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN0RSxRQUFBLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDOztBQUd6QixRQUFBLElBQUksa0JBQWtCLEtBQUksQ0FBQSxFQUFBLEdBQUEsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFFLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUEsRUFBRTtBQUNwRSxZQUFBLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ3pFLFNBQUE7O1FBR0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsRUFBRSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7UUFDdEQsT0FBTztBQUNMLFlBQUEsS0FBSyxFQUFFO0FBQ0wsZ0JBQUEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksTUFBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQUUsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsSUFBSSwwQ0FBRSxNQUFNLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEdBQUksQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7QUFDbEIsYUFBQTtBQUNELFlBQUEsR0FBRyxFQUFFLE1BQU07QUFDWCxZQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNwQixrQkFBa0I7Z0JBQ2xCLE9BQU8sRUFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFLLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQzdCLENBQUMsQ0FBQSxFQUFBLEVBQ0osTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQSxDQUFBLENBQzFDLENBQUM7YUFDSixDQUFDO1NBQ0gsQ0FBQztLQUNIO0FBRUQsSUFBQSxjQUFjLENBQUMsT0FBNkIsRUFBQTtBQUMxQyxRQUFBLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEtBQUk7WUFDN0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssS0FBSTtnQkFDN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pCLGFBQUMsQ0FBQyxDQUFDO0FBQ0wsU0FBQyxDQUFDLENBQUM7S0FDSjtJQUVELGdCQUFnQixDQUFDLElBQVUsRUFBRSxFQUFlLEVBQUE7QUFDMUMsUUFBQSxNQUFNLElBQUksR0FBRyxTQUFTLEVBQUUsQ0FBQztBQUV6QixRQUFBLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDdEIsUUFBQSxJQUNFLElBQUksQ0FBQyxJQUFJLEtBQUssa0JBQWtCO0FBQ2hDLFlBQUEsSUFBSSxDQUFDLFlBQVk7QUFDakIsWUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUNqQztBQUNBLFlBQUEsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUM7QUFDM0MsU0FBQTtRQUVELElBQUksQ0FBQyxTQUFTLENBQUM7WUFDYixJQUFJO1lBQ0osR0FBRyxFQUNELElBQUksQ0FBQyxJQUFJLEtBQUssY0FBYyxJQUFJLElBQUksQ0FBQyxTQUFTO0FBQzVDLGtCQUFFLHNEQUFzRDtBQUN4RCxrQkFBRSxTQUFTO0FBQ2hCLFNBQUEsQ0FBQyxDQUFDO1FBRUgsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRSxRQUFBLElBQUksV0FBVyxFQUFFO1lBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNiLGdCQUFBLEdBQUcsRUFBRSxtREFBbUQ7Z0JBQ3hELElBQUksRUFBRSxDQUFHLEVBQUEsV0FBVyxDQUFFLENBQUE7QUFDdkIsYUFBQSxDQUFDLENBQUM7QUFDSixTQUFBO0FBRUQsUUFBQSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRXJCLFFBQUEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQ3BELFFBQVEsSUFBSSxDQUFDLElBQUk7QUFDZixZQUFBLEtBQUssYUFBYTtBQUNoQixnQkFBQSxFQUFFLENBQUMsUUFBUSxDQUFDLG9EQUFvRCxDQUFDLENBQUM7Z0JBQ2xFLE1BQU07QUFDUixZQUFBLEtBQUssY0FBYztBQUNqQixnQkFBQSxFQUFFLENBQUMsUUFBUSxDQUFDLHFEQUFxRCxDQUFDLENBQUM7Z0JBQ25FLE1BQU07QUFDUixZQUFBLEtBQUssa0JBQWtCO0FBQ3JCLGdCQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMseURBQXlELENBQUMsQ0FBQztnQkFDdkUsTUFBTTtBQUNSLFlBQUEsS0FBSyxjQUFjO0FBQ2pCLGdCQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMscURBQXFELENBQUMsQ0FBQztnQkFDbkUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLG9CQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsK0NBQStDLENBQUMsQ0FBQztBQUM5RCxpQkFBQTtnQkFDRCxNQUFNO0FBQ1IsWUFBQSxLQUFLLGFBQWE7QUFDaEIsZ0JBQUEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO2dCQUNsRSxNQUFNO0FBQ1QsU0FBQTtLQUNGO0lBRUQsZ0JBQWdCLENBQUMsSUFBVSxFQUFFLEdBQStCLEVBQUE7O0FBQzFELFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDakIsT0FBTztBQUNSLFNBQUE7QUFFRCxRQUFBLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDOUIsUUFBQSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssY0FBYyxFQUFFO1lBQ2hDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2hFLGdCQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQ3RELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUNyQixDQUFDO0FBQ0gsZ0JBQUEsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWTtBQUN4QyxzQkFBRSxDQUFLLEVBQUEsRUFBQSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBSSxFQUFBLENBQUE7c0JBQy9CLENBQUksQ0FBQSxFQUFBLElBQUksQ0FBQyxLQUFLLENBQUssRUFBQSxFQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQSxJQUFBLENBQU0sQ0FBQztBQUNwRCxhQUFBO0FBQU0saUJBQUE7Z0JBQ0wsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FDdEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQzVDLENBQUM7QUFDSCxnQkFBQSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZO3NCQUN0QyxDQUFLLEVBQUEsRUFBQSxRQUFRLENBQUksRUFBQSxDQUFBO3NCQUNqQixJQUFJLFFBQVEsQ0FBQSxFQUFBLEVBQUssV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFBLElBQUEsQ0FBTSxDQUFDO0FBQ2xELGFBQUE7QUFDRixTQUFBO0FBRUQsUUFBQSxJQUNFLElBQUksQ0FBQyxJQUFJLEtBQUssYUFBYTtBQUMzQixZQUFBLElBQUksQ0FBQyxRQUFRLENBQUMscUNBQXFDLEVBQ25EO0FBQ0EsWUFBQSxZQUFZLEdBQUcsQ0FBQSxFQUFHLFlBQVksQ0FBQSxFQUFBLENBQUksQ0FBQztBQUNwQyxTQUFBO0FBQU0sYUFBQTtBQUNMLFlBQUEsSUFDRSxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQjtnQkFDbkMsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLGtCQUFrQixJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxFQUN0RTtBQUNBLGdCQUFBLFlBQVksR0FBRyxDQUFBLEVBQUcsWUFBWSxDQUFBLENBQUEsQ0FBRyxDQUFDO0FBQ25DLGFBQUE7QUFDRixTQUFBO0FBRUQsUUFBQSxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUV4QixRQUFBLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxrQkFBa0IsRUFBRTtZQUNwQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDckIsZ0JBQUEsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDbEMsYUFBQTtBQUVELFlBQUEsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUMvQixZQUFBLElBQUksS0FBSyxFQUFFO0FBQ1QsZ0JBQUEsY0FBYyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdDLFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNoRCxhQUFBO0FBQ0YsU0FBQTtBQUVELFFBQUEsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDbkMsTUFBTSxDQUFDLFlBQVksQ0FDakIsWUFBWSxFQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBRVAsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUEsRUFBQSxFQUNyQixFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTyxFQUFBLENBQUEsRUFFeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQ2pCLENBQUM7QUFFRixRQUFBLElBQUksY0FBYyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3pCLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxNQUFNLENBQUMsV0FBVyxDQUNoQixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNwQyxnQkFBQSxZQUFZLENBQUMsTUFBTTtnQkFDbkIsY0FBYyxDQUNqQixDQUNGLENBQUM7QUFDSCxTQUFBOztBQUdELFFBQUEsSUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQzFFO1lBQ0EsTUFBTSxDQUFDLFNBQVMsQ0FDZCxNQUFNLENBQUMsV0FBVyxDQUNoQixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQzdELENBQ0YsQ0FBQztBQUNILFNBQUE7UUFFRCxDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsdUJBQXVCLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUUsU0FBUyxDQUFDLElBQWUsQ0FBQyxDQUFDO0FBQ3pELFFBQUEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFO0FBQ2xELFlBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLHVCQUF1QixNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pELFNBQUE7UUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDdEI7QUFFTyxJQUFBLFlBQVksQ0FBQyxTQUF1QixFQUFBO0FBQzFDLFFBQUEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFO0FBQ2xELFlBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQzFCLFNBQUE7S0FDRjtBQUNGOztBQ3g3Qk0sTUFBTSxnQkFBZ0IsR0FBYTs7QUFFeEMsSUFBQSxRQUFRLEVBQUUsU0FBUztBQUNuQixJQUFBLGFBQWEsRUFBRSxRQUFRO0FBRXZCLElBQUEsc0JBQXNCLEVBQUUsQ0FBQztBQUN6QixJQUFBLHdCQUF3QixFQUFFLENBQUM7QUFDM0IsSUFBQSw4QkFBOEIsRUFBRSxDQUFDO0FBQ2pDLElBQUEsK0JBQStCLEVBQUUsQ0FBQztBQUNsQyxJQUFBLHVCQUF1QixFQUFFLElBQUk7QUFDN0IsSUFBQSxpQkFBaUIsRUFBRSxDQUFDO0FBQ3BCLElBQUEsNkJBQTZCLEVBQUUsS0FBSztBQUNwQyxJQUFBLHFCQUFxQixFQUFFLElBQUk7QUFDM0IsSUFBQSxpQ0FBaUMsRUFBRSxLQUFLOztBQUd4QyxJQUFBLGlCQUFpQixFQUFFLElBQUk7QUFDdkIsSUFBQSwyQkFBMkIsRUFBRSxJQUFJO0FBQ2pDLElBQUEsa0JBQWtCLEVBQUUsSUFBSTtBQUN4QixJQUFBLHVCQUF1QixFQUFFLE9BQU87O0FBR2hDLElBQUEsb0JBQW9CLEVBQUUsT0FBTztBQUM3QixJQUFBLHFDQUFxQyxFQUFFLE1BQU07QUFDN0MsSUFBQSwrQ0FBK0MsRUFBRSxLQUFLO0FBQ3RELElBQUEsaUJBQWlCLEVBQUUsTUFBTTtBQUN6QixJQUFBLFlBQVksRUFBRSxLQUFLOztBQUduQixJQUFBLDJCQUEyQixFQUFFLElBQUk7QUFDakMsSUFBQSxnQ0FBZ0MsRUFBRSxDQUFDO0FBQ25DLElBQUEsNENBQTRDLEVBQUUsS0FBSzs7QUFHbkQsSUFBQSw0QkFBNEIsRUFBRSxLQUFLO0FBQ25DLElBQUEsaUNBQWlDLEVBQUUsQ0FBQztBQUNwQyxJQUFBLHFDQUFxQyxFQUFFLEVBQUU7QUFDekMsSUFBQSxxQ0FBcUMsRUFBRSxFQUFFO0FBQ3pDLElBQUEsaURBQWlELEVBQUUsS0FBSzs7QUFHeEQsSUFBQSxnQ0FBZ0MsRUFBRSxLQUFLO0FBQ3ZDLElBQUEscUJBQXFCLEVBQUUsQ0FBK0csNkdBQUEsQ0FBQTtBQUN0SSxJQUFBLGVBQWUsRUFBRSxLQUFLO0FBQ3RCLElBQUEsZ0NBQWdDLEVBQUUsRUFBRTtBQUNwQyxJQUFBLHlCQUF5QixFQUFFLEVBQUU7QUFDN0IsSUFBQSxtREFBbUQsRUFBRSxFQUFFO0FBQ3ZELElBQUEsa0NBQWtDLEVBQUUsRUFBRTtBQUN0QyxJQUFBLG1CQUFtQixFQUFFLFNBQVM7O0FBRzlCLElBQUEsNEJBQTRCLEVBQUUsSUFBSTtBQUNsQyxJQUFBLDRCQUE0QixFQUFFLEtBQUs7QUFDbkMsSUFBQSxxQ0FBcUMsRUFBRSxFQUFFOztBQUd6QyxJQUFBLDJCQUEyQixFQUFFLElBQUk7QUFDakMsSUFBQSxrQ0FBa0MsRUFBRSxTQUFTO0FBQzdDLElBQUEscUNBQXFDLEVBQUUsS0FBSztBQUU1QyxJQUFBLG1DQUFtQyxFQUFFO0FBQ25DLFFBQUEsb0JBQW9CLEVBQUUsRUFBRTtBQUN4QixRQUFBLHdCQUF3QixFQUFFLENBQUM7QUFDNUIsS0FBQTs7QUFHRCxJQUFBLGdDQUFnQyxFQUFFLEtBQUs7O0FBR3ZDLElBQUEsb0JBQW9CLEVBQUUsRUFBRTtDQUN6QixDQUFDO0FBRUksTUFBTyw0QkFBNkIsU0FBUUcseUJBQWdCLENBQUE7SUFHaEUsV0FBWSxDQUFBLEdBQVEsRUFBRSxNQUF5QixFQUFBO0FBQzdDLFFBQUEsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNuQixRQUFBLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0tBQ3RCO0lBRUQsT0FBTyxHQUFBO0FBQ0wsUUFBQSxJQUFJLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRTNCLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVwQixXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxnQ0FBZ0MsRUFBRSxDQUFDLENBQUM7QUFDdkUsUUFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xDLFFBQUEsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3hDLFFBQUEsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlDLFFBQUEsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25ELFFBQUEsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3BELFFBQUEsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3hELFFBQUEsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3BELFFBQUEsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25ELFFBQUEsSUFBSSxDQUFDLDhDQUE4QyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2pFLFFBQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3BDO0FBRU8sSUFBQSxlQUFlLENBQUMsV0FBd0IsRUFBQTtRQUM5QyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBRTdDLFFBQUEsSUFBSUMsZ0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUMxRCxFQUFFO0FBQ0MsYUFBQSxVQUFVLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMvRCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBQ3ZDLGFBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNmLFlBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUM3QixnQkFBQSxXQUFXLEVBQUUsSUFBSTtBQUNqQixnQkFBQSxZQUFZLEVBQUUsSUFBSTtBQUNuQixhQUFBLENBQUMsQ0FBQztTQUNKLENBQUEsQ0FBQyxDQUNMLENBQUM7QUFDRixRQUFBLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDbkUsWUFBQSxNQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtBQUNyQyxnQkFBQSxHQUFHLEVBQUUsd0NBQXdDO0FBQzlDLGFBQUEsQ0FBQyxDQUFDO1lBQ0gsRUFBRSxDQUFDLFVBQVUsQ0FBQztBQUNaLGdCQUFBLElBQUksRUFBRSw0Q0FBNEM7QUFDbkQsYUFBQSxDQUFDLENBQUM7QUFDSCxZQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQ2YsZ0JBQUEsSUFBSSxFQUFFLHdEQUF3RDtBQUM5RCxnQkFBQSxJQUFJLEVBQUUsWUFBWTtBQUNuQixhQUFBLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxVQUFVLENBQUM7QUFDWixnQkFBQSxJQUFJLEVBQUUsNkJBQTZCO0FBQ3BDLGFBQUEsQ0FBQyxDQUFDO0FBQ0osU0FBQTtBQUVELFFBQUEsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQ2hFLEVBQUU7QUFDQyxhQUFBLFVBQVUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM1RCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO0FBQzVDLGFBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzNDLFlBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQixDQUFBLENBQUMsQ0FDTCxDQUFDO0FBQ0YsUUFBQSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsS0FBSyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtBQUNyRSxZQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQzFCLGdCQUFBLElBQUksRUFBRSx3REFBd0Q7QUFDOUQsZ0JBQUEsR0FBRyxFQUFFLHdDQUF3QztBQUM5QyxhQUFBLENBQUMsQ0FBQztBQUNKLFNBQUE7UUFFRCxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUNyQixPQUFPLENBQUMsMkJBQTJCLENBQUM7QUFDcEMsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQ1osRUFBRTtBQUNDLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQztBQUNyRCxhQUFBLGlCQUFpQixFQUFFO0FBQ25CLGFBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7QUFDcEQsWUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDbEMsQ0FBQSxDQUFDLENBQ0wsQ0FBQztRQUVKLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQzthQUMxQyxPQUFPLENBQUMsK0RBQStELENBQUM7QUFDeEUsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQ1osRUFBRTtBQUNDLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ25CLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQztBQUN2RCxhQUFBLGlCQUFpQixFQUFFO0FBQ25CLGFBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUM7QUFDdEQsWUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDbEMsQ0FBQSxDQUFDLENBQ0wsQ0FBQztRQUVKLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQzthQUMvQyxPQUFPLENBQUMsK0NBQStDLENBQUM7QUFDeEQsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQ1osRUFBRTtBQUNDLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ25CLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQztBQUM3RCxhQUFBLGlCQUFpQixFQUFFO0FBQ25CLGFBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsR0FBRyxLQUFLLENBQUM7QUFDNUQsWUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDbEMsQ0FBQSxDQUFDLENBQ0wsQ0FBQztRQUVKLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQztBQUMxQyxhQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FDWixFQUFFO0FBQ0MsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLCtCQUErQixDQUFDO0FBQzlELGFBQUEsaUJBQWlCLEVBQUU7QUFDbkIsYUFBQSxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO1lBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLCtCQUErQixHQUFHLEtBQUssQ0FBQztBQUM3RCxZQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUNsQyxDQUFBLENBQUMsQ0FDTCxDQUFDO1FBRUosSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDckIsT0FBTyxDQUFDLDBCQUEwQixDQUFDO0FBQ25DLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFJO0FBQ2hCLFlBQUEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLFFBQVEsQ0FDaEUsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO2dCQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztBQUNyRCxnQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDbEMsQ0FBQSxDQUNGLENBQUM7QUFDSixTQUFDLENBQUMsQ0FBQztRQUVMLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQztBQUMxQyxhQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FDWixFQUFFO0FBQ0MsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7YUFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDO0FBQ2hELGFBQUEsaUJBQWlCLEVBQUU7QUFDbkIsYUFBQSxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO1lBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztBQUMvQyxZQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUNsQyxDQUFBLENBQUMsQ0FDTCxDQUFDO1FBRUosSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDckIsT0FBTyxDQUFDLG1DQUFtQyxDQUFDO0FBQzVDLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFJO0FBQ2hCLFlBQUEsRUFBRSxDQUFDLFFBQVEsQ0FDVCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsQ0FDbkQsQ0FBQyxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO2dCQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsR0FBRyxLQUFLLENBQUM7QUFDM0QsZ0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ2xDLENBQUEsQ0FBQyxDQUFDO0FBQ0wsU0FBQyxDQUFDLENBQUM7UUFFTCxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUNyQixPQUFPLENBQUMsK0JBQStCLENBQUM7QUFDeEMsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDaEIsWUFBQSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUMsUUFBUSxDQUM5RCxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7Z0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO0FBQ25ELGdCQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUNsQyxDQUFBLENBQ0YsQ0FBQztBQUNKLFNBQUMsQ0FBQyxDQUFDO1FBRUwsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDckIsT0FBTyxDQUFDLHlDQUF5QyxDQUFDO0FBQ2xELGFBQUEsT0FBTyxDQUFDLENBQUMsRUFBRSxLQUFJO0FBQ2QsWUFBQSxFQUFFLENBQUMsUUFBUSxDQUNULElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxDQUN2RCxDQUFDLFFBQVEsQ0FBQyxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxHQUFHLEtBQUssQ0FBQztBQUMvRCxnQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDbEMsQ0FBQSxDQUFDLENBQUM7QUFDTCxTQUFDLENBQUMsQ0FBQztLQUNOO0FBRU8sSUFBQSxxQkFBcUIsQ0FBQyxXQUF3QixFQUFBO1FBQ3BELFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFFbkQsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDckIsT0FBTyxDQUFDLHFCQUFxQixDQUFDO2FBQzlCLE9BQU8sQ0FDTixnR0FBZ0csQ0FDakc7QUFDQSxhQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNoQixZQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLENBQzFELENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtnQkFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7QUFDL0MsZ0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ2xDLENBQUEsQ0FDRixDQUFDO0FBQ0osU0FBQyxDQUFDLENBQUM7UUFFTCxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUNyQixPQUFPLENBQUMsK0JBQStCLENBQUM7YUFDeEMsT0FBTyxDQUNOLDBHQUEwRyxDQUMzRztBQUNBLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFJO0FBQ2hCLFlBQUEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLFFBQVEsQ0FDcEUsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO2dCQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLDJCQUEyQixHQUFHLEtBQUssQ0FBQztBQUN6RCxnQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDbEMsQ0FBQSxDQUNGLENBQUM7QUFDSixTQUFDLENBQUMsQ0FBQztRQUVMLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzthQUMvQixPQUFPLENBQ04saUdBQWlHLENBQ2xHO0FBQ0EsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDaEIsWUFBQSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsUUFBUSxDQUMzRCxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7Z0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0FBQ2hELGdCQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUNsQyxDQUFBLENBQ0YsQ0FBQztBQUNKLFNBQUMsQ0FBQyxDQUFDO1FBRUwsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDckIsT0FBTyxDQUFDLDZCQUE2QixDQUFDO0FBQ3RDLGFBQUEsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUNkLEVBQUU7QUFDQyxhQUFBLFVBQVUsQ0FDVCxTQUFTLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUMzRDthQUNBLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQztBQUN0RCxhQUFBLFFBQVEsQ0FBQyxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7WUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO0FBQ3JELFlBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ2xDLENBQUEsQ0FBQyxDQUNMLENBQUM7S0FDTDtBQUVPLElBQUEsMkJBQTJCLENBQUMsV0FBd0IsRUFBQTtRQUMxRCxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFFMUQsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDckIsT0FBTyxDQUFDLHlCQUF5QixDQUFDO0FBQ2xDLGFBQUEsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUNkLEVBQUU7QUFDQyxhQUFBLFVBQVUsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2xFLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQztBQUNuRCxhQUFBLFFBQVEsQ0FBQyxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7WUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0FBQ2xELFlBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ2xDLENBQUEsQ0FBQyxDQUNMLENBQUM7UUFFSixJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUNyQixPQUFPLENBQUMsMkNBQTJDLENBQUM7QUFDcEQsYUFBQSxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQ2QsRUFBRTtBQUNDLGFBQUEsVUFBVSxDQUNULFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQy9EO2FBQ0EsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxDQUFDO0FBQ3BFLGFBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsR0FBRyxLQUFLLENBQUM7QUFDbkUsWUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDbEMsQ0FBQSxDQUFDLENBQ0wsQ0FBQztRQUVKLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyw2REFBNkQsQ0FBQztBQUN0RSxhQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNoQixZQUFBLEVBQUUsQ0FBQyxRQUFRLENBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsK0NBQStDLENBQ3JFLENBQUMsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtBQUN6QixnQkFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQywrQ0FBK0M7QUFDbEUsb0JBQUEsS0FBSyxDQUFDO0FBQ1IsZ0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ2xDLENBQUEsQ0FBQyxDQUFDO0FBQ0wsU0FBQyxDQUFDLENBQUM7QUFFTCxRQUFBLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUN0RSxFQUFFO0FBQ0MsYUFBQSxVQUFVLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNqRSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7QUFDaEQsYUFBQSxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO1lBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztBQUMvQyxZQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUNsQyxDQUFBLENBQUMsQ0FDTCxDQUFDO1FBRUYsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDckIsT0FBTyxDQUFDLGVBQWUsQ0FBQzthQUN4QixPQUFPLENBQ04sd0hBQXdILENBQ3pIO0FBQ0EsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDaEIsWUFBQSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsQ0FDckQsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO2dCQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDMUMsZ0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ2xDLENBQUEsQ0FDRixDQUFDO0FBQ0osU0FBQyxDQUFDLENBQUM7S0FDTjtBQUVPLElBQUEsZ0NBQWdDLENBQUMsV0FBd0IsRUFBQTtBQUMvRCxRQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3pCLFlBQUEsSUFBSSxFQUFFLHlCQUF5QjtBQUMvQixZQUFBLEdBQUcsRUFBRSwyRkFBMkY7QUFDakcsU0FBQSxDQUFDLENBQUM7UUFFSCxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUNyQixPQUFPLENBQUMsZ0NBQWdDLENBQUM7QUFDekMsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDaEIsWUFBQSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLENBQUMsUUFBUSxDQUNwRSxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7Z0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEdBQUcsS0FBSyxDQUFDO0FBQ3pELGdCQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2hCLENBQUEsQ0FDRixDQUFDO0FBQ0osU0FBQyxDQUFDLENBQUM7QUFFTCxRQUFBLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUU7WUFDcEQsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7aUJBQ3JCLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQztpQkFDaEQsT0FBTyxDQUFDLCtDQUErQyxDQUFDO0FBQ3hELGlCQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FDWixFQUFFO0FBQ0MsaUJBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLENBQUM7QUFDL0QsaUJBQUEsaUJBQWlCLEVBQUU7QUFDbkIsaUJBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtnQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEdBQUcsS0FBSyxDQUFDO0FBQzlELGdCQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUN2RCxDQUFBLENBQUMsQ0FDTCxDQUFDO1lBRUosSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7aUJBQ3JCLE9BQU8sQ0FBQyxvREFBb0QsQ0FBQztBQUM3RCxpQkFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDaEIsZ0JBQUEsRUFBRSxDQUFDLFFBQVEsQ0FDVCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyw0Q0FBNEMsQ0FDbEUsQ0FBQyxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO0FBQ3pCLG9CQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLDRDQUE0QztBQUMvRCx3QkFBQSxLQUFLLENBQUM7QUFDUixvQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7aUJBQ3ZELENBQUEsQ0FBQyxDQUFDO0FBQ0wsYUFBQyxDQUFDLENBQUM7QUFDTixTQUFBO0tBQ0Y7QUFFTyxJQUFBLGlDQUFpQyxDQUFDLFdBQXdCLEVBQUE7QUFDaEUsUUFBQSxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtBQUN6QixZQUFBLElBQUksRUFBRSwwQkFBMEI7QUFDaEMsWUFBQSxHQUFHLEVBQUUsNEZBQTRGO0FBQ2xHLFNBQUEsQ0FBQyxDQUFDO1FBRUgsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDckIsT0FBTyxDQUFDLGlDQUFpQyxDQUFDO0FBQzFDLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFJO0FBQ2hCLFlBQUEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLFFBQVEsQ0FDckUsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO2dCQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLDRCQUE0QixHQUFHLEtBQUssQ0FBQztnQkFDMUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2YsZ0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQ3hELENBQUEsQ0FDRixDQUFDO0FBQ0osU0FBQyxDQUFDLENBQUM7QUFFTCxRQUFBLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUU7WUFDckQsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7aUJBQ3JCLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQztpQkFDaEQsT0FBTyxDQUFDLCtDQUErQyxDQUFDO0FBQ3hELGlCQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FDWixFQUFFO0FBQ0MsaUJBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUNBQWlDLENBQUM7QUFDaEUsaUJBQUEsaUJBQWlCLEVBQUU7QUFDbkIsaUJBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtnQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEdBQUcsS0FBSyxDQUFDO0FBQy9ELGdCQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUNsQyxDQUFBLENBQUMsQ0FDTCxDQUFDO1lBRUosSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7aUJBQ3JCLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQztpQkFDdkMsT0FBTyxDQUFDLDhDQUE4QyxDQUFDO0FBQ3ZELGlCQUFBLFdBQVcsQ0FBQyxDQUFDLEdBQUcsS0FBSTtnQkFDbkIsTUFBTSxFQUFFLEdBQUcsR0FBRztxQkFDWCxRQUFRLENBQ1AsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUNBQXFDLENBQzNEO3FCQUNBLGNBQWMsQ0FBQyxVQUFVLENBQUM7QUFDMUIscUJBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtBQUN4QixvQkFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUM7QUFDeEQsd0JBQUEsS0FBSyxDQUFDO0FBQ1Isb0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2lCQUNsQyxDQUFBLENBQUMsQ0FBQztnQkFDTCxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVM7QUFDbEIsb0JBQUEsK0NBQStDLENBQUM7QUFDbEQsZ0JBQUEsT0FBTyxFQUFFLENBQUM7QUFDWixhQUFDLENBQUMsQ0FBQztZQUNMLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2lCQUNyQixPQUFPLENBQUMsOEJBQThCLENBQUM7aUJBQ3ZDLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQztBQUN2RCxpQkFBQSxXQUFXLENBQUMsQ0FBQyxHQUFHLEtBQUk7Z0JBQ25CLE1BQU0sRUFBRSxHQUFHLEdBQUc7cUJBQ1gsUUFBUSxDQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxDQUMzRDtxQkFDQSxjQUFjLENBQUMsVUFBVSxDQUFDO0FBQzFCLHFCQUFBLFFBQVEsQ0FBQyxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7QUFDeEIsb0JBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUNBQXFDO0FBQ3hELHdCQUFBLEtBQUssQ0FBQztBQUNSLG9CQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztpQkFDbEMsQ0FBQSxDQUFDLENBQUM7Z0JBQ0wsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTO0FBQ2xCLG9CQUFBLCtDQUErQyxDQUFDO0FBQ2xELGdCQUFBLE9BQU8sRUFBRSxDQUFDO0FBQ1osYUFBQyxDQUFDLENBQUM7WUFDTCxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQztpQkFDckIsT0FBTyxDQUFDLDRDQUE0QyxDQUFDO0FBQ3JELGlCQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNoQixnQkFBQSxFQUFFLENBQUMsUUFBUSxDQUNULElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtBQUNqQixxQkFBQSxpREFBaUQsQ0FDckQsQ0FBQyxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO0FBQ3pCLG9CQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGlEQUFpRDtBQUNwRSx3QkFBQSxLQUFLLENBQUM7QUFDUixvQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQ2xDLENBQUEsQ0FBQyxDQUFDO0FBQ0wsYUFBQyxDQUFDLENBQUM7QUFDTixTQUFBO0tBQ0Y7QUFFTyxJQUFBLHFDQUFxQyxDQUFDLFdBQXdCLEVBQUE7QUFDcEUsUUFBQSxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtBQUN6QixZQUFBLElBQUksRUFBRSw4QkFBOEI7QUFDcEMsWUFBQSxHQUFHLEVBQUUsZ0dBQWdHO0FBQ3RHLFNBQUEsQ0FBQyxDQUFDO1FBRUgsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDckIsT0FBTyxDQUFDLHFDQUFxQyxDQUFDO0FBQzlDLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFJO0FBQ2hCLFlBQUEsRUFBRSxDQUFDLFFBQVEsQ0FDVCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsQ0FDdEQsQ0FBQyxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO2dCQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsR0FBRyxLQUFLLENBQUM7QUFDOUQsZ0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNoQixDQUFBLENBQUMsQ0FBQztBQUNMLFNBQUMsQ0FBQyxDQUFDO0FBRUwsUUFBQSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFO1lBQ3pELElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2lCQUNyQixPQUFPLENBQUMseUJBQXlCLENBQUM7aUJBQ2xDLE9BQU8sQ0FDTixzRUFBc0UsQ0FDdkU7QUFDQSxpQkFBQSxXQUFXLENBQUMsQ0FBQyxHQUFHLEtBQUk7Z0JBQ25CLE1BQU0sRUFBRSxHQUFHLEdBQUc7cUJBQ1gsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDO3FCQUNwRCxjQUFjLENBQUMsZUFBZSxDQUFDO0FBQy9CLHFCQUFBLFFBQVEsQ0FBQyxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7b0JBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztBQUNuRCxvQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQ2xDLENBQUEsQ0FBQyxDQUFDO2dCQUNMLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUztBQUNsQixvQkFBQSwrQ0FBK0MsQ0FBQztBQUNsRCxnQkFBQSxPQUFPLEVBQUUsQ0FBQztBQUNaLGFBQUMsQ0FBQyxDQUFDO0FBRUwsWUFBQSxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FDbEUsRUFBRTtBQUNDLGlCQUFBLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDOUQsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQztBQUM5QyxpQkFBQSxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO2dCQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0FBQzdDLGdCQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUNsQyxDQUFBLENBQUMsQ0FDTCxDQUFDO1lBRUYsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7aUJBQ3JCLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQztpQkFDN0IsT0FBTyxDQUFDLDREQUE0RCxDQUFDO0FBQ3JFLGlCQUFBLE9BQU8sQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNkLGdCQUFBLEVBQUUsQ0FBQyxRQUFRLENBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLENBQ3RELENBQUMsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtvQkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEdBQUcsS0FBSyxDQUFDO0FBQzlELG9CQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztpQkFDbEMsQ0FBQSxDQUFDLENBQUM7QUFDTCxhQUFDLENBQUMsQ0FBQztZQUVMLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2lCQUNyQixPQUFPLENBQUMsZ0NBQWdDLENBQUM7aUJBQ3pDLE9BQU8sQ0FDTiwyRkFBMkYsQ0FDNUY7QUFDQSxpQkFBQSxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDZCxnQkFBQSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsUUFBUSxDQUNsRSxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7b0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMseUJBQXlCLEdBQUcsS0FBSyxDQUFDO0FBQ3ZELG9CQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztpQkFDbEMsQ0FBQSxDQUNGLENBQUM7QUFDSixhQUFDLENBQUMsQ0FBQztZQUVMLElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2lCQUNyQixPQUFPLENBQ04scUVBQXFFLENBQ3RFO2lCQUNBLE9BQU8sQ0FDTiwrR0FBK0csQ0FDaEg7QUFDQSxpQkFBQSxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDZCxnQkFBQSxFQUFFLENBQUMsUUFBUSxDQUNULElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtBQUNqQixxQkFBQSxtREFBbUQsQ0FDdkQsQ0FBQyxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO0FBQ3pCLG9CQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLG1EQUFtRDtBQUN0RSx3QkFBQSxLQUFLLENBQUM7QUFDUixvQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQ2xDLENBQUEsQ0FBQyxDQUFDO0FBQ0wsYUFBQyxDQUFDLENBQUM7WUFFTCxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQztpQkFDckIsT0FBTyxDQUFDLHdDQUF3QyxDQUFDO2lCQUNqRCxPQUFPLENBQ04sc0pBQXNKLENBQ3ZKO0FBQ0EsaUJBQUEsT0FBTyxDQUFDLENBQUMsRUFBRSxLQUFJO0FBQ2QsZ0JBQUEsRUFBRSxDQUFDLFFBQVEsQ0FDVCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsQ0FDeEQsQ0FBQyxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO29CQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsR0FBRyxLQUFLLENBQUM7QUFDaEUsb0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2lCQUNsQyxDQUFBLENBQUMsQ0FBQztBQUNMLGFBQUMsQ0FBQyxDQUFDO1lBRUwsSUFBSUEsZ0JBQU8sQ0FBQyxXQUFXLENBQUM7aUJBQ3JCLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQztpQkFDaEMsT0FBTyxDQUNOLGdHQUFnRyxDQUNqRztBQUNBLGlCQUFBLE9BQU8sQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNkLGdCQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxRQUFRLENBQzVELENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtvQkFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7QUFDakQsb0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2lCQUNsQyxDQUFBLENBQ0YsQ0FBQztBQUNKLGFBQUMsQ0FBQyxDQUFDO0FBQ04sU0FBQTtLQUNGO0FBRU8sSUFBQSxpQ0FBaUMsQ0FBQyxXQUF3QixFQUFBO0FBQ2hFLFFBQUEsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDekIsWUFBQSxJQUFJLEVBQUUsMEJBQTBCO0FBQ2hDLFlBQUEsR0FBRyxFQUFFLDRGQUE0RjtBQUNsRyxTQUFBLENBQUMsQ0FBQztRQUVILElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQztBQUMxQyxhQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNoQixZQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxRQUFRLENBQ3JFLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtnQkFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsR0FBRyxLQUFLLENBQUM7QUFDMUQsZ0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEIsQ0FBQSxDQUNGLENBQUM7QUFDSixTQUFDLENBQUMsQ0FBQztBQUVMLFFBQUEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTtZQUNyRCxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQztpQkFDckIsT0FBTyxDQUFDLHVCQUF1QixDQUFDO0FBQ2hDLGlCQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNoQixnQkFBQSxFQUFFLENBQUMsUUFBUSxDQUNULElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLDRCQUE0QixDQUNsRCxDQUFDLFFBQVEsQ0FBQyxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7b0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLDRCQUE0QixHQUFHLEtBQUssQ0FBQztBQUMxRCxvQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7aUJBQ3hELENBQUEsQ0FBQyxDQUFDO0FBQ0wsYUFBQyxDQUFDLENBQUM7WUFDTCxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQztpQkFDckIsT0FBTyxDQUFDLDhCQUE4QixDQUFDO2lCQUN2QyxPQUFPLENBQUMsOENBQThDLENBQUM7QUFDdkQsaUJBQUEsV0FBVyxDQUFDLENBQUMsR0FBRyxLQUFJO2dCQUNuQixNQUFNLEVBQUUsR0FBRyxHQUFHO3FCQUNYLFFBQVEsQ0FDUCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FDM0Q7cUJBQ0EsY0FBYyxDQUFDLFVBQVUsQ0FBQztBQUMxQixxQkFBQSxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO0FBQ3hCLG9CQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFDQUFxQztBQUN4RCx3QkFBQSxLQUFLLENBQUM7QUFDUixvQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQ2xDLENBQUEsQ0FBQyxDQUFDO2dCQUNMLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUztBQUNsQixvQkFBQSwrQ0FBK0MsQ0FBQztBQUNsRCxnQkFBQSxPQUFPLEVBQUUsQ0FBQztBQUNaLGFBQUMsQ0FBQyxDQUFDO0FBQ04sU0FBQTtLQUNGO0FBRU8sSUFBQSxnQ0FBZ0MsQ0FBQyxXQUF3QixFQUFBO0FBQy9ELFFBQUEsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDekIsWUFBQSxJQUFJLEVBQUUseUJBQXlCO0FBQy9CLFlBQUEsR0FBRyxFQUFFLDJGQUEyRjtBQUNqRyxTQUFBLENBQUMsQ0FBQztRQUVILElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQztBQUN6QyxhQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNoQixZQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxRQUFRLENBQ3BFLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtnQkFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsR0FBRyxLQUFLLENBQUM7QUFDekQsZ0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEIsQ0FBQSxDQUNGLENBQUM7QUFDSixTQUFDLENBQUMsQ0FBQztBQUVMLFFBQUEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRTtZQUNwRCxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQztpQkFDckIsT0FBTyxDQUFDLG9DQUFvQyxDQUFDO0FBQzdDLGlCQUFBLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FDZCxFQUFFO0FBQ0MsaUJBQUEsVUFBVSxDQUNULFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQ3pEO2lCQUNBLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsQ0FBQztBQUNqRSxpQkFBQSxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO2dCQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsR0FBRyxLQUFLLENBQUM7QUFDaEUsZ0JBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ2xDLENBQUEsQ0FBQyxDQUNMLENBQUM7WUFFSixJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQztpQkFDckIsT0FBTyxDQUFDLCtCQUErQixDQUFDO0FBQ3hDLGlCQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNoQixnQkFBQSxFQUFFLENBQUMsUUFBUSxDQUNULElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxDQUMzRCxDQUFDLFFBQVEsQ0FBQyxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7b0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxHQUFHLEtBQUssQ0FBQztBQUNuRSxvQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQ2xDLENBQUEsQ0FBQyxDQUFDO0FBQ0wsYUFBQyxDQUFDLENBQUM7QUFDTixTQUFBO0tBQ0Y7QUFFTyxJQUFBLDhDQUE4QyxDQUNwRCxXQUF3QixFQUFBO0FBRXhCLFFBQUEsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDekIsWUFBQSxJQUFJLEVBQUUsdUNBQXVDO0FBQzdDLFlBQUEsR0FBRyxFQUFFLG9IQUFvSDtBQUMxSCxTQUFBLENBQUMsQ0FBQztRQUVILElBQUlBLGdCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3JCLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQzthQUNuQyxPQUFPLENBQUMsZ0NBQWdDLENBQUM7QUFDekMsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQ1osRUFBRTtBQUNDLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLGFBQUEsUUFBUSxDQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLG1DQUFtQztBQUNyRCxhQUFBLG9CQUFvQixDQUN4QjtBQUNBLGFBQUEsaUJBQWlCLEVBQUU7QUFDbkIsYUFBQSxRQUFRLENBQUMsQ0FBTyxLQUFLLEtBQUksU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxhQUFBO0FBQ3hCLFlBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsbUNBQW1DLENBQUMsb0JBQW9CO0FBQzNFLGdCQUFBLEtBQUssQ0FBQztBQUNSLFlBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ2xDLENBQUEsQ0FBQyxDQUNMLENBQUM7UUFFSixJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUNyQixPQUFPLENBQUMsK0JBQStCLENBQUM7YUFDeEMsT0FBTyxDQUFDLGdDQUFnQyxDQUFDO0FBQ3pDLGFBQUEsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUNaLEVBQUU7QUFDQyxhQUFBLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUN0QixhQUFBLFFBQVEsQ0FDUCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxtQ0FBbUM7QUFDckQsYUFBQSx3QkFBd0IsQ0FDNUI7QUFDQSxhQUFBLGlCQUFpQixFQUFFO0FBQ25CLGFBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLEVBQUEsYUFBQTtBQUN4QixZQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLG1DQUFtQyxDQUFDLHdCQUF3QjtBQUMvRSxnQkFBQSxLQUFLLENBQUM7QUFDUixZQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUNsQyxDQUFBLENBQUMsQ0FDTCxDQUFDO0tBQ0w7QUFFTyxJQUFBLGdCQUFnQixDQUFDLFdBQXdCLEVBQUE7UUFDL0MsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU5QyxJQUFJQSxnQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUNyQixPQUFPLENBQUMseUNBQXlDLENBQUM7QUFDbEQsYUFBQSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDaEIsWUFBQSxFQUFFLENBQUMsUUFBUSxDQUNULElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxDQUN0RCxDQUFDLFFBQVEsQ0FBQyxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxFQUFBLGFBQUE7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxHQUFHLEtBQUssQ0FBQztBQUM5RCxnQkFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDbEMsQ0FBQSxDQUFDLENBQUM7QUFDTCxTQUFDLENBQUMsQ0FBQztLQUNOO0lBRUssbUJBQW1CLEdBQUE7O0FBQ3ZCLFlBQUEsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhO0FBQ3hDLGdCQUFBLEtBQUssUUFBUTtvQkFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO29CQUMvQyxNQUFNO0FBQ1IsZ0JBQUEsS0FBSyxTQUFTO29CQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUM7b0JBQzlDLE1BQU07QUFDUixnQkFBQTs7QUFFRSxvQkFBQSxJQUFJSixlQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNuQyxhQUFBO0FBQ0QsWUFBQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDbEMsQ0FBQSxDQUFBO0FBQUEsS0FBQTtJQUVLLDZCQUE2QixHQUFBOztBQUNqQyxZQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHVCQUF1QjtBQUMxQyxnQkFBQSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDO0FBQ2hELFlBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ2xDLENBQUEsQ0FBQTtBQUFBLEtBQUE7SUFFSywwQkFBMEIsQ0FDOUIsSUFBWSxFQUNaLEtBQTJCLEVBQUE7O0FBRTNCLFlBQUEsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JFLFlBQUEsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDN0MsWUFBQSxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssS0FBSyxTQUFTLE1BQU0sQ0FBQyxNQUFNLElBQUksS0FBSyxLQUFLLFFBQVEsQ0FBQyxFQUFFO0FBQ3RFLGdCQUFBLE9BQU8sS0FBSyxDQUFDO0FBQ2QsYUFBQTtBQUVELFlBQUEsTUFBTSxRQUFRLEdBQ1osS0FBSyxLQUFLLFNBQVMsR0FBRyxDQUFDLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQzNFLFlBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRSxZQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBRTNELFlBQUEsT0FBTyxJQUFJLENBQUM7U0FDYixDQUFBLENBQUE7QUFBQSxLQUFBO0lBRUQsNkJBQTZCLEdBQUE7UUFDM0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUNuQjtBQUNFLFlBQUEsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU87QUFDckMsWUFBQSxNQUFNLEVBQUcsSUFBSSxDQUFDLEdBQVcsQ0FBQyxRQUFRO1lBQ2xDLFFBQVEsRUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFFLEVBQUEsRUFBQSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsQ0FBQTtBQUNsRSxTQUFBLEVBQ0QsSUFBSSxFQUNKLENBQUMsQ0FDRixDQUFDO0tBQ0g7QUFDRjs7TUNoNkJZLGlCQUFpQixDQUFBO0FBQzVCLElBQUEsV0FBQSxDQUNTLFdBQStCLEVBQy9CLFlBQWdDLEVBQ2hDLGdCQUFvQyxFQUNwQyxZQUFnQyxFQUNoQyxXQUErQixFQUMvQixhQUFpQyxFQUNqQyx1QkFBMkMsRUFBQTtRQU4zQyxJQUFXLENBQUEsV0FBQSxHQUFYLFdBQVcsQ0FBb0I7UUFDL0IsSUFBWSxDQUFBLFlBQUEsR0FBWixZQUFZLENBQW9CO1FBQ2hDLElBQWdCLENBQUEsZ0JBQUEsR0FBaEIsZ0JBQWdCLENBQW9CO1FBQ3BDLElBQVksQ0FBQSxZQUFBLEdBQVosWUFBWSxDQUFvQjtRQUNoQyxJQUFXLENBQUEsV0FBQSxHQUFYLFdBQVcsQ0FBb0I7UUFDL0IsSUFBYSxDQUFBLGFBQUEsR0FBYixhQUFhLENBQW9CO1FBQ2pDLElBQXVCLENBQUEsdUJBQUEsR0FBdkIsdUJBQXVCLENBQW9CO0tBQ2hEO0lBRUosT0FBTyxHQUFHLENBQ1IsU0FBc0IsRUFDdEIsaUJBQTBCLEVBQzFCLGtCQUEyQixFQUMzQiwyQkFBb0MsRUFBQTtRQUVwQyxNQUFNLFdBQVcsR0FBRyxrQkFBa0I7QUFDcEMsY0FBRSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN6QixnQkFBQSxJQUFJLEVBQUUsS0FBSztBQUNYLGdCQUFBLEdBQUcsRUFBRSx1RUFBdUU7YUFDN0UsQ0FBQztjQUNGLElBQUksQ0FBQztRQUNULE1BQU0sWUFBWSxHQUFHLGtCQUFrQjtBQUNyQyxjQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ3pCLGdCQUFBLElBQUksRUFBRSxLQUFLO0FBQ1gsZ0JBQUEsR0FBRyxFQUFFLHdFQUF3RTthQUM5RSxDQUFDO2NBQ0YsSUFBSSxDQUFDO1FBQ1QsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0I7QUFDekMsY0FBRSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN6QixnQkFBQSxJQUFJLEVBQUUsS0FBSztBQUNYLGdCQUFBLEdBQUcsRUFBRSw0RUFBNEU7YUFDbEYsQ0FBQztjQUNGLElBQUksQ0FBQztRQUNULE1BQU0sWUFBWSxHQUFHLGtCQUFrQjtBQUNyQyxjQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ3pCLGdCQUFBLElBQUksRUFBRSxLQUFLO0FBQ1gsZ0JBQUEsR0FBRyxFQUFFLHdFQUF3RTthQUM5RSxDQUFDO2NBQ0YsSUFBSSxDQUFDO1FBQ1QsTUFBTSxXQUFXLEdBQUcsa0JBQWtCO0FBQ3BDLGNBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDekIsZ0JBQUEsSUFBSSxFQUFFLEtBQUs7QUFDWCxnQkFBQSxHQUFHLEVBQUUsdUVBQXVFO2FBQzdFLENBQUM7Y0FDRixJQUFJLENBQUM7UUFFVCxNQUFNLGFBQWEsR0FBRyxpQkFBaUI7QUFDckMsY0FBRSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN6QixnQkFBQSxJQUFJLEVBQUUsS0FBSztBQUNYLGdCQUFBLEdBQUcsRUFBRSx5RUFBeUU7YUFDL0UsQ0FBQztjQUNGLElBQUksQ0FBQztRQUVULE1BQU0sdUJBQXVCLEdBQUcsMkJBQTJCO0FBQ3pELGNBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDekIsZ0JBQUEsSUFBSSxFQUFFLEtBQUs7QUFDWCxnQkFBQSxHQUFHLEVBQUUsbUZBQW1GO2FBQ3pGLENBQUM7Y0FDRixJQUFJLENBQUM7QUFFVCxRQUFBLE9BQU8sSUFBSSxpQkFBaUIsQ0FDMUIsV0FBVyxFQUNYLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLFdBQVcsRUFDWCxhQUFhLEVBQ2IsdUJBQXVCLENBQ3hCLENBQUM7S0FDSDtBQUVELElBQUEsMEJBQTBCLENBQUMsUUFBb0IsRUFBQTs7UUFDN0MsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLGFBQWEsTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDekQ7QUFDRCxJQUFBLGlDQUFpQyxDQUFDLFFBQW9CLEVBQUE7O1FBQ3BELENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyx1QkFBdUIsTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDbkU7SUFFRCxzQkFBc0IsR0FBQTs7UUFDcEIsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLFdBQVcsTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbEM7SUFDRCx1QkFBdUIsR0FBQTs7UUFDckIsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLFlBQVksTUFBQSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbkM7SUFDRCwyQkFBMkIsR0FBQTs7UUFDekIsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLGdCQUFnQixNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN2QztJQUNELHVCQUF1QixHQUFBOztRQUNyQixDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsWUFBWSxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNuQztJQUNELHNCQUFzQixHQUFBOztRQUNwQixDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsV0FBVyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNsQztJQUVELHNCQUFzQixHQUFBOztRQUNwQixDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsV0FBVyxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUMxQztJQUNELHVCQUF1QixHQUFBOztRQUNyQixDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsWUFBWSxNQUFBLElBQUEsSUFBQSxFQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUMzQztJQUNELDJCQUEyQixHQUFBOztRQUN6QixDQUFBLEVBQUEsR0FBQSxJQUFJLENBQUMsZ0JBQWdCLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsdUJBQXVCLEdBQUE7O1FBQ3JCLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxZQUFZLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzNDO0lBQ0Qsc0JBQXNCLEdBQUE7O1FBQ3BCLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxXQUFXLE1BQUEsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzFDO0FBRUQsSUFBQSxxQkFBcUIsQ0FBQyxLQUFVLEVBQUE7O1FBQzlCLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxXQUFXLE1BQUUsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQzFDO0FBQ0QsSUFBQSxzQkFBc0IsQ0FBQyxLQUFVLEVBQUE7O1FBQy9CLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxZQUFZLE1BQUUsSUFBQSxJQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0FBQ0QsSUFBQSwwQkFBMEIsQ0FBQyxLQUFVLEVBQUE7O1FBQ25DLENBQUEsRUFBQSxHQUFBLElBQUksQ0FBQyxnQkFBZ0IsTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDL0M7QUFDRCxJQUFBLHNCQUFzQixDQUFDLEtBQVUsRUFBQTs7UUFDL0IsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLFlBQVksTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDM0M7QUFDRCxJQUFBLHFCQUFxQixDQUFDLEtBQVUsRUFBQTs7UUFDOUIsQ0FBQSxFQUFBLEdBQUEsSUFBSSxDQUFDLFdBQVcsTUFBRSxJQUFBLElBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxD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
