module.exports = [
"[project]/node_modules/sanitize-html/node_modules/entities/dist/decode-codepoint.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "codePointToString",
    ()=>codePointToString,
    "replaceCodePoint",
    ()=>replaceCodePoint,
    "replaceCodePointXML",
    ()=>replaceCodePointXML
]);
// Adapted from https://github.com/mathiasbynens/he/blob/36afe179392226cf1b6ccdb16ebbb7a5a844d93a/src/he.js#L106-L134
/**
 * C1 Unicode control character reference replacements (code points 128–159).
 * Index i gives the replacement for code point 128+i; 0 means "no replacement".
 */ const c1 = [
    8364,
    0,
    8218,
    402,
    8222,
    8230,
    8224,
    8225,
    710,
    8240,
    352,
    8249,
    338,
    0,
    381,
    0,
    0,
    8216,
    8217,
    8220,
    8221,
    8226,
    8211,
    8212,
    732,
    8482,
    353,
    8250,
    339,
    0,
    382,
    376
];
/**
 * True for NUL, UTF-16 surrogates, and values past U+10FFFF.
 * @param codePoint Unicode code point to check.
 */ function isInvalidCodePoint(codePoint) {
    return codePoint === 0 || codePoint >= 0xd8_00 && codePoint <= 0xdf_ff || codePoint > 0x10_ff_ff;
}
function replaceCodePoint(codePoint) {
    if (isInvalidCodePoint(codePoint)) {
        return 0xff_fd;
    }
    if (codePoint >= 128 && codePoint <= 159) {
        return c1[codePoint - 128] || codePoint;
    }
    return codePoint;
}
function replaceCodePointXML(codePoint) {
    return isInvalidCodePoint(codePoint) ? 0xff_fd : codePoint;
}
function codePointToString(codePoint) {
    return codePoint - 1 >>> 0 < 0x7f || codePoint - 0xa0 >>> 0 < 0xd7_60 ? String.fromCharCode(codePoint) : String.fromCodePoint(replaceCodePoint(codePoint));
}
}),
"[project]/node_modules/sanitize-html/node_modules/entities/dist/internal/decode-shared.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeTrieDict",
    ()=>decodeTrieDict
]);
/*
 * Inverse of the encoder's SAFE alphabet (0x21..0x7E minus 0x22, 0x24, 0x5C),
 * precomputed once at module load. Entries for excluded chars stay 0 but
 * are never read.
 */ const BASE91_INVERSE = /* #__PURE__ */ (()=>{
    const table = new Uint8Array(127);
    let code = 0;
    for(let char = 0x21; char <= 0x7e; char++){
        if (char !== 0x22 && char !== 0x24 && char !== 0x5c) {
            table[char] = code++;
        }
    }
    return table;
})();
function decodeTrieDict(input, resultLength, atomCount, dict1AtomCount, ngramCount, dictSize) {
    const base = 91;
    const inputLength = input.length;
    // For 2-char codes, slot = char1 * base - twoCharBias + char2.
    const twoCharBias = dictSize * (base - 1);
    let pos = 0;
    /** Read one slot code at `pos` and return its slot index, advancing pos. */ const readSlotCode = ()=>{
        const c1 = BASE91_INVERSE[input.charCodeAt(pos++)];
        return c1 < dictSize ? c1 : c1 * base - twoCharBias + BASE91_INVERSE[input.charCodeAt(pos++)];
    };
    const dict2AtomCount = atomCount - dict1AtomCount;
    const slotCount = atomCount + ngramCount;
    /*
     * Per-slot contents: atoms (always a single value) live directly in
     * `single`; ngram slots hold -1 there and expand to
     * `pool[start[slot] .. start[slot] + length[slot])`.
     */ const single = new Int32Array(slotCount);
    single.fill(-1, dict1AtomCount, dictSize);
    single.fill(-1, dictSize + dict2AtomCount, slotCount);
    const start = new Int32Array(slotCount);
    const length = new Int32Array(slotCount);
    /**
     * Decode `count` ascending uint16 values from a delta+RLE stream into
     * `single[off..off+count)`.
     *
     *   code < 89   → delta = code
     *   code == 89  → run-length: next char encodes runLength-2; emit `runLength` consecutive +1 values
     *   code == 90, next < 90  → escape: delta = 89 + next * BASE + after-next
     *   code == 90, next == 90 → double-escape: extra char for very large deltas
     * @param count
     * @param off
     */ function decodeDelta(count, off) {
        let previous = 0;
        let slot = off;
        const end = off + count;
        while(slot < end){
            const code = BASE91_INVERSE[input.charCodeAt(pos++)];
            if (code < 89) {
                previous += code;
                single[slot++] = previous;
            } else if (code === 89) {
                let runLength = BASE91_INVERSE[input.charCodeAt(pos++)] + 2;
                while(runLength--)single[slot++] = ++previous;
            } else {
                const next = BASE91_INVERSE[input.charCodeAt(pos++)];
                previous += 89 + // eslint-disable-next-line unicorn/prefer-minimal-ternary -- branches read a different number of side-effecting input bytes
                (next < 90 ? next * base + BASE91_INVERSE[input.charCodeAt(pos++)] : BASE91_INVERSE[input.charCodeAt(pos++)] * 8281 + BASE91_INVERSE[input.charCodeAt(pos++)] * base + BASE91_INVERSE[input.charCodeAt(pos++)]);
                single[slot++] = previous;
            }
        }
    }
    // Streams 1 & 2: atoms decoded into their slot ranges.
    decodeDelta(dict1AtomCount, 0);
    decodeDelta(dict2AtomCount, dictSize);
    /*
     * Streams 3 & 4 are read in two passes: first collect every ngram's two
     * references and derive its expanded length (each ref resolves to an earlier
     * slot, so lengths are already known), which sizes the shared pool.
     * Pool ranges are handed out in decode order, so the second pass fills
     * the pool contiguously with a single write cursor.
     */ const references = new Int32Array(ngramCount * 2);
    let poolSize = 0;
    let ngramIndex = 0;
    /**
     * Read `count` ngram entries (each = 2 slot-code references) for the slots
     * starting at `startSlot`, recording references and assigning pool ranges.
     * @param count
     * @param startSlot
     */ function readNgramReferences(count, startSlot) {
        for(let index = 0; index < count; index++){
            const slot = startSlot + index;
            const a = readSlotCode();
            const b = readSlotCode();
            references[ngramIndex * 2] = a;
            references[ngramIndex * 2 + 1] = b;
            ngramIndex += 1;
            start[slot] = poolSize;
            const entryLength = (single[a] < 0 ? length[a] : 1) + (single[b] < 0 ? length[b] : 1);
            length[slot] = entryLength;
            poolSize += entryLength;
        }
    }
    readNgramReferences(ngramCount - dictSize + dict1AtomCount, dictSize + dict2AtomCount);
    readNgramReferences(dictSize - dict1AtomCount, dict1AtomCount);
    // Second pass: concatenate each ngram's two halves into the pool.
    const pool = new Uint16Array(poolSize);
    let write = 0;
    for(let index = 0; index < ngramIndex; index++){
        for(let half = 0; half < 2; half++){
            const source = references[index * 2 + half];
            const value = single[source];
            if (value < 0) {
                let read = start[source];
                const readEnd = read + length[source];
                while(read < readEnd)pool[write++] = pool[read++];
            } else {
                pool[write++] = value;
            }
        }
    }
    // Stream 5: data. Each code expands to its slot's stored values.
    const out = new Uint16Array(resultLength);
    let outIndex = 0;
    while(pos < inputLength){
        let slot = BASE91_INVERSE[input.charCodeAt(pos++)];
        if (slot >= dictSize) {
            slot = slot * base - twoCharBias + BASE91_INVERSE[input.charCodeAt(pos++)];
        }
        const value = single[slot];
        if (value < 0) {
            let read = start[slot];
            const readEnd = read + length[slot];
            while(read < readEnd)out[outIndex++] = pool[read++];
        } else {
            out[outIndex++] = value;
        }
    }
    return out;
}
}),
"[project]/node_modules/sanitize-html/node_modules/entities/dist/generated/decode-data-html.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "htmlDecodeTree",
    ()=>htmlDecodeTree
]);
// Generated using scripts/write-decode-map.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$decode$2d$shared$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/entities/dist/internal/decode-shared.js [app-ssr] (ecmascript)");
;
const htmlDecodeTree = /* #__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$decode$2d$shared$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeTrieDict"])("!}.&u%}'&}*'~!6*)%&,~!J~!J~%L~y<~!R,~~%Lu~~#GD~~#|)1#%}^%}2%+#.##%##%}&%##%'#%##&%#%#'%#&#%#&#'#%%#&#%##%#)%''%&%#%#'%#%%#%%}%%%#%#&(23#%%#&-%0%('1#(##%#'##+%'*.:1}#%#6-+(%'%%#%%%}#L'2351&('%}&/N'(0(/*-%(%%}#'+&T%7.2}#&%&#%#36/5##%&%%#&#%%#))2%%##%&&'0~!#*+&'%1~!%).'3q?&%'1~!.##%6(~!+%%%(Gw'rT~!E#<nA%#jZ~!H%(~!42##~!*31&~!G%U~#)5~#`3~!J~!Z~%]~%Y~%C~!q~!u~#kz~%#~!6'~!D~!U~!?~#T~!c%~!G#'~%7|~!G~!J~!G&~#pb~(Df}#%}*&}#%##%##%##&#-}&'#'&%#.++}%mI,#,@&(}*%}*'%&##&#%##%}&0}#.},U},%}+%}&%}#%##&}B%(}(%}+%)})%##%#&}&%##%&}<%}>%#%&}*%}(%}9%}/%})%}*%}*%}?&}&%}3%}&*#%})%#%#)}#&#-#+*%E%%'%'#%}#*V##&##I}#&&##%&%#&&Qf%%))w/0+&%#(#.%-''''++++7}>%4'',##1,#%#&%##&#'##&#*#9)%&%}#*}%,#+P(%A&%#'&##wSD',9E00#y#@}(+}&%&>~!#~!X}#*}(&&}(&}(,%}%&#+&}#&}I%#%}%)#(},'%#*}4%%#%}(''}#/##(##),%-##%%)#&}(.}&%#&}%%}*&#%},&&}&%}#%*'#%})%}D&}&%}-&}6&#&}-,%}#%})-(~+`~,=?~I9'9%~!,#%})%})%}@%}?%}(~!?~#<~#pP~#BG~#=1#%K+~#?#~%;)~#A~#mF1~#A'~'X%'~#lR~#N~'N~#r~#m#-~#i'?%#'%~#B%##%,%#~#_%#0%~#]732~,w~2+#:&#%&'0%&>%}#>##F+)#%&&#(+_}4&}-%}(&}@&}O7Fdf0@+/v4}&WU##&/0#&'('B#%}.%}'+#%}#%%&#&%#%##+#&#)#6#'#.},%}c%},%#%##%&#&%#&~#>'*-.%##%##%}#%%}%'~#)D1}#%*&~#_%%'(~#S2%'.}#~#=##*'*-%}&'%'##&&~'E%.#&~#M4}%%##&'%#~#O1##%&#'+~#<B%##%%'%+~#;#@%}#&%#&&%#(~#H1}'%'##&&~#?A}&'~#D#%32}'&&&&~#[}'(#%}'~#;C})&}%%#%~#=&%,3}%'(#%%~#^'#&&)#%'~#Y%-~#d-%'~#^%%&#&&&}#~#b~2t*&'~&(~&@~0%~e~3}%*''0})&}+~!9##-}#%-hD*)1fC#%/&/fB#40~!+#)*4~!+~!K'&:~!/*7~!.#~!H~!L':~%x&~!H#~!*~%1~!I#~!+A~#p'~!F~~#-#~,,(~.Z~!V~%;'B'mq-W~!N~%I%#&&#&}#%},%%}'%}+X#%}#&}(%}'%}<%}#%}%%'}'%}:~![)9@~%>~#UA%-%##&~!C%~!-.9:~!1~!-^2/:a~!y,D*J#-5)/4~%23,~#G~!L1~!0X3`~!2+~!!0-~&E~!W~!o,>Y&]~%cZx_&~#O*9#A#'#+I'%#)~!0B*-5A+-((F&*M#)(-7-5+'-3a5Vi~!Y~!?+[)%3),ERHm~!+:D,VG.+)?fB%%*(%)'(#&80%1'8`K8?`+'Z#&O&'H5#*9)A%%5&3))0%39+.*7#()&&*=4@**L)<'_&*+..;(#*+)./&0#3)%')-8(4ixD(&.}%,('aI:,)%,k2231T)I'#/-W7,/'Q#.'Y24+h')37</31&83##&0#),H(?'&?/1##%#&&#%''-%&&&#(&''&#.-'%#%%(,')*'&#&#'##%(%(#%('#&##%%%%('%#%#%%#%#&%##h>w+v<ayvyvcg.uuhKr}g/v|g>u9i[~>g5uI~=RvdwEg;v/g;uk!!TTSx]@RT!U!#!@VBRUU!'UTe-d0c`e&gSdicedFcrdTaqb.kYcAohdYd@a3e+d}dMdtd.aJ#bqcK`dle/e.e'dwdPdodddjbEb}ogd^ofdpduc6j?l%d{drdqc)d7bacOdQ%T#Y)X.sR[yH>6Vyv3[xwLu>vo'!*.[yBacahoj>6Rew3[xqdZa#!a&#^(X-[yG>6Vyu3[xvg3sEr|g.u/Ri9db0T#^(Xa)!-[y;>6Vylg4wKs{JwNZt3@3r=c4Z([xlg;wKt!cpq's@v7A'*a(a+!-a#[y<3Dt?3Dt'>6Vym3[xmg9rxsNJwLZt4~?r?db1T#`-!(Xa,!0[yS>6Vz%NuQs.g4wKtnJwNZtS@3r>c4Z([y%g;wKtrdga8!a(!#&T*Y-Xa#!a0<or[yc3Dtq>6Vz43[y3JwNZtf@3s!Ju}!%Dti:pm3c_%X#tjB5pkd6q!r]u?voC'*-a.a2!0a&a+[yI3DtI3Ds~3DtH>6Vyw3[xx;:s#~<5pKJwNZtE@3r~d`a)!a2T#a.(!+U.X1[yT3Dt`3Dtv>6Vz&3[y&g9rxwzcxstPu.<rAJwLZtT~?r@dZa%!a.&^*Za(/Reu[ya>6Vz23[y1g3sEr}wkg{NuQRg{ci(U#5@b`~,cg#U(2WnH5wugcRh7dX#T(Y,a'Ta!!a,[yZ<]mj>6Vz,3[y+Pv#5ReZKu+=,%!H}7ABwkaS?Rh:BcW(X#<]mrj:ubv/ARekdg%!(!a.*Ta(Y.X1!#sP>Rl*Dt6[y>>6Vyo3Wf*jOvuumvuRgRJuq*!:9<B@bX~3jVv&v@s@5Re[d/rQt{uAvo&a&a*)a2!,0Wf!3Dt0=Bs'>6Re}3[xy~<5s%JwJZt1~Gs)c;&!#2sJkNuXvzq7rxu,Re8dka4!a8(aEZ+a@Y.X1Xa)[yd=Bs(3DtP>6Vz53[y4cX#X&Re:avRe9~<5s&JwJZtQ~Gs*i^rzvdRg+Jv{%!2sbB@bX}kdga,!Za?&^*T1/!a'Dt+[y6>6Vyf3Wf%g/u;s4hGu6?Rh-JvZ,!c%#&RoX54Rivj7uyvf8RgTKvZB%*!2sGh<vu5Rgq<=C::9bb~#dZ#T&Ta6Y.X*Dt>[y93Wf)coZ(T,6VyifluvRgC@95@B@bX~/hFu34cC#T,k/unq8w8Q5RkUklwQuzunq8w8Q5Rk8d/rJu?v8w9)-&!a0a;a&aIWejg3sEr/h1s<DtDJvyZqY5aws3Jvy!&Wei~Hr1:au5@Bag>23E~5c:Z&bX};kKv?w&unuVu5Rjc;>bs)#~@:Rh.=ay<a]C;b`}Vd6s/t{uAvoaxa()!a,a7%-a#a2Dt,[yF2Wo[>6Vyt3[xuNuPRi&NuPwpi#RoWh?vf8Ri%Jv]!%Ri:KvxD!.'2WeAjZu`q9rxu,Re7woeAg-unLq(qA_/*2Wg_g3u5q^9:4E}/jTrxrzv=Wkkd~0UX#^^Xa-a1a5T&a=U1a'*aEa]!a*aPaA-adok[y54Rn>;:p3~Dp5g9rpsFNvZqjg3uJp4~<5p0Pw;5qlJwNZt*@3p1Pw:5p/Ou!5p2JvG'!6Vye=<qnJvh_[xhg3v,Rh3kOwOw-sDuev/Re^dha[a%!%!a+#Ta7)-5TaCaO!aka!a)sf[yb2>Rl!9ARiq5E}Qg=ucRkBE|oJrJ_@Wk~@Wk{JrJ_@Wk|@WkyJrJ_@Wk}@WkzJvO_[y2g-vMRmiKuYC!)&>Ri;>Ri<@3RkNc](X#@9Rk=g5vuRmhKvDB!+'=]meg3u4Rmgd)#Y'Vz3CARmfd`a+!%T'!+#Ta1Ta6TaM-sTDt9[yA9sYd'%Y#s[[xpj:ueunaXRgEjRq,v-vuqdd2'`#6Rev<32@5>:2<E}5xIo9a*X#Y(;5RePJvD_g>vyRgNj8w)v8<wggs:RgXiZt|vjx,hSq3ah!-(~@:Ro/Ou!5RhWj^v(pyw8unRhUdx-UY#^Ua.a3a70!)%UX1TaDa)'omRiRRhE[y:3Dsz=Br,>6Vyj3[xkg6ruwjcqsrPw;5r*Ku]D'Zt-@3r(~?r.i[vwv]dU1a--U#`a4(g/vsRhPOu!5RhLj:rmu9Wo!~@:wdh@g/vsRiTjXuvvNr}:RhBj^v(pyw8unRn]dz1UYa'a+^Y(!aETZalaRY.Ta?a4[yDJw1!#qLsW>6Vyrfzq-pLflpwRe|Js>%!Dt@3Dt&Jvy_[xs~HrnjMuwpsw'RecKu+D#'!t<~Grl~?rjg5u-x,gwp{ah!-(~@:Rg~Ou!5Rh'jXuvvNr}:Rh#cW#X/c;&!#2sLi[v7u7RgpJv)(!iLrxu,Re6j7v@s@5Se[e7d`aW!Za(a`T.a#!a3!&aDa-!9)Dt_=6s+3[x~~DR|h~DS6avhGun5RkZj3w)v-]mkKunB!&*]kb97R|i<ARk<c:Z(6Vy}Juh'!wziMRoS:F|vkLuauJv5vtvQRh1d='T+Y#VyO~DR|jcF#T'7R|g97R|kJv3'!ay<Rj,Jvh&!:ReXcsa6*a+#a#_aIRf9aLRf?c,Z&Rf5Rf7c.Z&Rf;Rf>cQ#%T'p-Rf8Rf=ct#%'(*!,p,Rf4p+Rf6Rf:Rf<d~'Ua%U*^UYa(!a,-!#a4YaTalaEX0a8a<Weo3Dt/3Dsx=Br93Wen~Dr;~<5p<JwNZt2@3p=Pw:5p;Ou!5r3c7&!#:p>3Ds}KvGB)_6Vyk2sM=<r7x'eovA(!hFu1ARf}cV#X&@r5j6rvwQa^Rf3c=Za'wkghJv__g;unRggA53B9=b^}%j6uduo5Jq;!(hIv%2Re`Ou4ARe_e%a#^^^Xa&!a*a2!&a6YaP!*ad!#a:aE/5Rn?[y@>6Vyp;:pE~DrY~<5pBJwNZt8@3pCh=rt3rWPw:5pAJup_[xoNuPpF9c!#'45pD5ARn)d8#X'X*3@rU72s]h>v<<sSjJpqvewOJq/(!hNw'5ReBk0s2u3w/w'5ReE5@Jq.!a+JQ!&WeU23d(#Y&RjG5]jBk!u7w&u0udARjEe#+^^^Ub#!a2/a`Z(agT1!a-a;|@TaG!aS[yV=Re~fow'RguNuPRe?bz#'>RoUWeL>:Cbb|?JwPZtVg6ruRmzJvD'!6Vz(g/vmRh~Jvy_[y(g9voRgyx*cy(#2>Ri2B9b]~9kIw9u7rluJu3Rg]dI#a%UY'@=p%CAx.gQZ&RhwwygtRm{x5g_Z'+ABqR9Woa=Bp&dV#^*Xa'!&@o{g4v]Rk;Jv{!%Rk[wkkiA5RkiwwfUB=x,fUuqC&*!>RfTg8v0RfV~ARfSd;rJsAuAv9wR'ae+/aO!a@aza/a#[yQ@Wg!2Wemg3sEr0JvB_g>uvReWg2v+Re=KupB_+[y!2AbY~-~Hr2AJwD!(h<~El>h<~El?Kun@+_:9b`}Kg-v/Ri3g;vtwyk_9]k_d=&T#*U.6qh@Ab`|K9:H|CJv[!&3Dtex'fDwC%!Rf[9WlMd[(^X,!a%Z06Vz!@WgBg=v~Rgvg,QRe@awd,#Y+jTv|Q~EfWj]uNr|~FRfXdy#Y&^Ua%!aO.!(a)Ua;=!a@aKap!a-,a!Ta]a[rSa]p?[y82sK=Bq~;:p:~<5p8Pw:5p7d'#Y'Wf(;RnRi[u4w&RgJJvG'!6Vyh=<r#ijuuv/sIKuYD'ZtG@3p9~Gr&d2#`(g<vtRgFj`u5w&rqpxRf2CJuY!+:wfnTOu!5Rg}jNs1ucv&RfwJvA!&3@q|BDcC#T,k/unq8w8Q5RkTklwQuzunq8w8Q5Rk9dga#!a'!a=#a0!:+Tb*b@aO.a4!aba8aFJv^}?!VyR~Dr<g;u%Rn.~<5p[x'e`wNZtR@3p]Pw:5pZhNvjBp.woe_g5u-r4JwF!%DtO3:ooc7&!#:p^3DtpLuGw(!+%)Dtk6Vz#2sd=<r8d'#Y([y#<x3gJt`w@!)%}MRiowzikRij=]ilxAf3,U(#B2Rf#g0v-Rm[ck{`U#]giKv3>)!&6Ri154s,KuGB_%@r68r:dJ|t`#X(9<E|u2@H|rx3gJu?w'!+'1Nu7Reg4=H~+9<wxgY95Rm]xLggZ-`(X}U2:Ri4h<uOawRmsJv__5@bb{jbV~3dka#a'a]!,#a+U=a>b6a3b%!/aKa/)!arwve^VyJ;:pR~DpTg3uJpS~<5pOPw;5qmPw:5pNOu!5pQJvG'!6Vyx=<qoJvA!{~Jup!%@qk7Rn/KvyD!}''[xz;>wkh'?Rh,x8gyt`w5D!&),(SgyccRgztJ@3pPB5p#d'(Y#<]mmifubw&RgoJvE&!82s^JvF&!8Rf,ADb]~;x=h'rNu]vK!,%'*0RnORh)4Rh*AqQg-vaRnNg;wHwkh'ba~4cE#Ta*x3gctyw@'!+%RnFRnD<4Rn@hFvK5RnCxWg[#`&a0Ua()`1Rm75Rg[c]%X#qi8Rg^NvdRj>BwzgZauwji7Rm6A4wgg]d1#&(*,.0a#Rm;Rm<Rm=Rm>Rm?Rm@RmARmBe%#^^^Xaea?aC/b+(,!a+a#!a/!>a&Ta<aKbD!2wphBRnk[yPw}hE|.=Br-3Dtm>6Vy~g6urRf.x,hPrNav!%'RnqRo%Ro#Nu;q[Pw;5r+JwNZtM@3r)d'#Y'Weh;xChL#`&RnmRnoKu}>%(!Rne~Bs-;2wjcussJv+'!aYSO}6@B<5?ba~8LrNvj!.%*ROwungw~ng~:9;Ri^>wtnig;wHRnixDh@|(UZ.x1h@|)!#:2<H|*xHn]#-UX'3Ro)z=iT}6ARns=Bwsn_wpnaRncw]aR(#UXa&Ua*a/=]iPd'#Y&Ro'WnXf{QRm2hNvj]nZd`'T~&1`{|`#9b]{}c:'!#Wl{>@=be}]?cl{{U#:5Abb}Jds#^YaF!a*b4a#a3aPa>&Tb!bH!*a_!Eau?/a&RjY<]gj>6Vz*;:pe~DrZg,QRj1JwNZtX@wihspcJvZ&!VyX9WmOJu|!|N2WmHJvh&!]ht~Bpbcn&T(!#RmQ<s7Nu;padH#X'`+WmJ@>RmKCARhnKup=!)&Wf+:RhqNuPpf9c!#'45pd5AwghpARn(Ls@w!%,)!RmP@Wfe<E|IJva!&WmNg8vsRmLd`*.`#Y'Xa!axRn*]hrA8Rhug5s@rXg8u!RmMd8#X'X*3@rV72smdI*#UY&RmICARho~GsgxVgd)Ta'U-Y&Xa!T#RnEWnA@Wffg1uDRi0hFvK5RnBxGnG&#`%owp)@wsf+bX}Ze-*1!a*^^^Ua|!#a.aq&Ya2!a>.a6!a:aO`aJDtL[y`@Wg#>6Vz12@wzoYRoZNuPRi!NuPRhzg=ucRi,@=b`{Yg=ucRi-ACJvB!&Sh[ebSh]ebi`wUuFRm4Jw2_[y0JvB!.<Ju(!&SoG}6Shd}6<Ju(!&SoH}6She}6Kur@._g5vHRieJvx!{L2G{Kx6gd'T#?Rh82Wi5cZ#X(g1w)Rm5dW-Y(Ta#!a)!#aYa=wnfE=su2>>bU{0j9udv:<svj8uQv-7RgHdE%#^'sq9sp=>Bb_{TJv`!&g/r|snj6v(us5d,#Y(56H}[978H}]Jw5!&g1rushJvB!+j;v{u5?zDhd}6}bj;v{u5?zDhe}6}ce*#`(^^^a[aea!=!a6a*aoXb1a.!aAbL!b>,b'aL!aV@Wf|2Wlg3[y/JwNZt^@3piPw:5pgJunZou3@rsJva&!Vy_g<v~Rm#JvG'!6Vz0=<r{Ju{%!:pj@WfsiXuJu3Rm:JvZ&!WfA~Bph@c4Z&Dtwax5rubx(#:awRk1@d,#Y&RfjRfid1#,Y(@Wfp2Wlrg5s@ryKu[@!,'=]ig9wlk?Rk>g5u-rqJvy'!@9RkQcH(T#=>Ri~@<wkj(Wj(KuZB*!&<7rw@9RkRcH(T#=>Ri}@<wkj)Wj)dg(Ta2Xa9X#`-!a*CARhg@@=I}d9x;c~#X%so=<sj>2@@=aybb}XjWv0Q~EfEj3vLv;<d,#Y(56H}`978H}_dgaPaFa'a/!#a3Y0a_a;a|!1(a7-[yE3[xt;:pJNvZrrg3uJrvJwNZt=@3pIh=rt3rxPw:5pGOu!5rpJvG'!6Vys=<rz@c4Z&Dt(ax5rtJvZ!&~BpH@wsfNg-vaRlNci*U#=<wei<F}a5@Jq.!a*JQ!%@qZ23d(#Y&RjH5]jCk!u7w&u0udARjFd/prq=tyvpaEa(a:.!a1aZ(@@=I}:9wpd%=<sX55w_h}@@=I{t=ay<aU@@=I}T=ay<2@@=I})?C9:9au@9Cb]}DP~=x-fAZ(2Wl1=ay<aU@@=I}>5@d##Y+jTv|vV~EfFj]uNpn~FRfGdgaK!Z2&!a8a-Tb({E!acTbM*!a(DtY[yYd'%Y#sl[y*hHvh>Re5x2c{Z}.j4uCvcawRiMd+#X+_x&d!},<5RkX;2Hzw@x,gavfB-!{CcF&T#Roe;RodwWbBg5urRgaKvHC*_6Vz+<4opieuew&Rmq@d]&Y)X,T#X0Rh}<BqP=4qS9:ReMg/ujReNJw0!/<Jui%!bd{kawwnemRelAxUa?a3#*.&UX(Ya+a/RhvRnQ<o}9Wmtd-#Y&RgSRmw9;Rmxay=Rmyg-vaRmuxEhSrNu,v-voC!%(aR.a(a7+1Ro1>Ro5CE{A9b]{@;5x#eO{:g;urRi+KrNA!%(Ro3>Ro79;Ri_Ku@>{;&!x%gX|{KunA_+g5QRj/g3u5Rj#g>uERj%wio/xRhS&!,!#^1U}wba{8>>@=be}qC@:D5ba{7Ku+A&!}x?ba}t>>@=be}se(aA^^^Uat!b0#{pa+awUazbGa#aLb9bgaWac'a5TbS=Br!d1#`%scp_Jvl!#rT>Re0JvX&!VyN=H{Fcm#U&:pY=ReaJv2&!]h0=]nUJvG'!6Vy|=<r%JrM_=]h2@Wlud'#)U'Wf'b]{i=]h/Jvh!&~BpWg=v]RnMx+ny#'Nu;pVwjnu=]nwxJnx,T#`&Reqwjnt=]nvieu9vrRjLLuYwP(#+!th@wih5pX~Gr'g5v/Rh4KunA'!-CARnP@wwiN:Rm_9x'cvw>!|l=<saKvAA!0&3@q}>w^e1bp#&Re2Re3BDx7gH#T|f5H|eKuZ>!%(:qNAH{]Jv6!+3B2B9=b^{X<5<B92:E{ZLvhwA(a;a%!igQuyRmad+#Y}m@3Rh5d8#X'X*:AqUAHzmaxwbh<aXRnVcF}RT#Nw&cj#U(BWnug/vsRntdka)(a3+.Zb7aYYan1!bVa@Xa}[y^@b[{G=H{+hFu73Rj&Pv#5ReQcK%T#sig1v{Rj'Ku+D#'!t]~Grm~?rkKuMB!01d5#`'Vy.ta3Dtu~Hroc8#'{^45s85AwZbP&!#Rn!wghxWn#KvEA!)&2RlA2RlBx:h|#(T,=]j09Wobz>x]z/@awRoTd+#Y(az]hFhCrm4d,#Y+jTv|Q~EfMj]uNr|~FRfOdCa!Xa9_X#@<plJvf!%b`{(9;Rgwc;.!#2x7cw#T|UDb]|T5Ju={(!=@E{&Jv)&!Ab`{'awJvf!~*>>@=be{#KuY>!+&4Ezyi[ugv&RjIdea+T)#UXa&T-T&a!Rh9auRmW=]kLg5vuRn+g3u4Rn-Ow6ARn,hHus5xNk?#UX(U~)/g8v0RkD~AwkkF?Ri.OuNBwkkA?Ri/d|a2`a*^UYa.!aBTZaTa'Xa;!(!2!-a#b2[yC>6Vyq3[xr2Wi?g1rusVh%s?DtF~<5rbJs;%!DtBfswKtCj[uvuSsEu3RgVx3o:u+wN'*Zt;@3rd~Grh~?rfg8w)Lq)qE&-a%!>bI|`jWv0vV~EfCjTv|vV~Ef@j]uNpn~FRfBcK#T']gWNu7x,k7q4ai(0!hHv8<RhmkMu9vrsBuev/RhlCJvB!,g<v{wchh~@:Rhji[vrv{wchi~@:RhkdS&a5UY#Ta!RgPwwiI5BwciI~@:Rh`x'iJvj'!5]iJPu8Bwch]~@:Rhach)U#h3rp]gLh@t|Ax,hTq3ah!-(~@:Ro0Ou!5RhXj^v(pyw8unRhVd|)`,^UYas!a?/a2Z'a^Ta{Tb7Ta(a#!a,Wf&9sZ3DtAadamov=Bqt3[xig8vsRm~>waiL2b`{QJv*_Ouv2qgj<v]v2BqfdR'X*X#Y-@3qr~Gqv~?p6hHv-]glPup5Lq+q?_%*b_{qF{n9b^{rOu4ARhpKvCD!+&~Bqp:5Dbb}nwoiKl&unuTuBv]v+ueunaXRf0=Jvh!0nKufu8v1w&w7q%w&uHrz:Rgnj5w,uxDJq/(!hNw'5ReCk0s2u3w/w'5ReFd>Za&!*UaA=<wkgsRnSJv^!%Refifw3vyRgOKu_B'!,<]gkiiu:w&Rh<=C@a^<B57@2F{[<B5@aW:=3away9A5aW=<B=C@a^<B57@2F{Ie-#`(^^^bCara.b8aza6!/bZ,!adTbnTbOb+aFaS!aAT9@Wf~2Wli3Dtl2@d,#Y&RfnRfmJwJZtN~GqyJva&!VyMg<v~Rm%iXuJu3Rm9Jv[_=]ih9wlkDRkCd1#`(@Wg>2Wls3cH#T(@<Rj*=>Ri|b~'#23s9h<~El.d'#Y&Dtxi^rzvdRl#d*#U%(o|B2s`hJwSaxRmDKv4B&!1:Rmdd5#`'Vx}to~Hq{x'f1v3(!BA5ba|bJv_&!Wfug1v]ReIdO+U/Y#&G}-8wze=Rh{g1v]ReHg/uQRf/by#)ibQwERl/cH#T(@<Rj+=>Ri{cNu+vlax-!(#a0qa9<Rii2;;bU{H;x<i=&X#Rk`<4wwi=C9H~8xAI(Y#<azRi@45wXI<B9;5bb~7dL(X#Xa(+!aL6Vy{g5QqOau:5au2@ay547EzbxOcU(UX-T#Ta#:Cbb|A?wjh/b_|SOw6ARgtihr}u7Rhy<d1#T)X1@@=I|~=ay<2@@=aybb}Sj3vLv;<d,#Y(56H}A978H}@dGpvs@uAu`vcw9*!aFa+ai%(b!aXa8.a?a[ozWey=sU2@G}Nch&U#Rf_WexKu+D#'!t:~Gr`~?r^j]uNr|~FRg*j^psurwJt|RmcKv)@&!)7Rkv~Br[@wxfO:Rl3co#U'6Rezj_q#vIuavjRltwzeyh@vr5JqD0!>aY?C9:9au@9Cb]}9cl#U*5;5<H||jbuus1ucv&Rfvg1v~d/pppzqFr^a--a~!aMat1(hFv;Wiz@@=Izoj5uuv-7Rix~Cw`fk2WlVcZ#X,k)u3vWs@u2]ktg;wEx'fBq(_2Wg/jTv|vV~EfoJv]!15x'hzqG!(P~EfU~CRl_j6v(us5x4i-#T(2WmZ?C2F|d>Kq<aj1!*jTqIsBv=Wl`~Cw`fi2WlWj`v0u*~>RlR=c>Z,k#u3vWs@u2]kr<c1Z+jTqIsBv=Wla~Cw`fm2WlXdmb3!a{(arZa`bkTa%TbQTa-a9+c'!aM!/[yL=Bqug.w'RifhFvyDRj.g>vgwyk^9]k^Jv3_@WfbAARkhJw2_[x|JvB_wkoIRoKwkoJRoLd'(Y#<]gm=<9<H|yd'%_X#skDtb3awwqkgNulRkgdB#^',9:p'hJwSaxRmEBwVb8@4=H|qLu+w50&!)@3qs~?pU>Awwn;;Rn=c:Z'ARn<=<qwKvC@!/&~BqqJv6!&]eVb^z^xRge'/a%+^`#Sge}6<4Rn3=]n0Pw2>Rn8Jw0!&>Rn:>Rn6cY#a7+!a&=<wkaNw~h3z_c5Z{=wjh#=]nLKv^D!&)Vyz=bW|swYb<WetcG#T(2wxa@qVx@gD#Y&b^|V5JwG&!5bb|pg/w&RgD@x=kHs=uAvn!a%%/'+RmSRh694Ro`g-vaRmRhHv-]mlxCcS#`&ba~.5cD#Ta)P~=d,#Y(56H{>978H{Dd_#{2^Y%_+qbbb{6g3sERhsbU{?dfa.,`a(Xa<!aiX#(55RiG54RiHcI#T'WiU3RiVNvdwtfcRlKNvdd,#Y&RlHRlExQgf.1*^T'X#Sgf}6Wn4=]hfPrk>Rn7Jw0!&>Rn5>Rn9Lunw?&a2!,5<oq@@wqfdRlJj5Q~=d,#Y(~ARfcOuN]fdDKw;ay(}i!547E}j?cI#T(@5bV}iCbV}hdv(^^Tb?a40,b##Tbo!a*bR!a<b|a/!aKai!aU[yK=]o^g:v>ReGJwPZtK<7Rh+h<~El,Pv#5ReR@awwxjCg,ulRjDJv6&!]j!z?aQeeg>w=Sh<eeJw;!&axEzOg,Qosc!#*:wkeJ]eJ>x'h-u(!%Ro.w~h.zPdNZ(X,Ya![x{;9ReY;wkgxRiF:x?ap#Y&RmUg<s2Rkod]+UY0TZ'!a&A9sw<=bczLNvuw{gqzNhJwSaxRmCKuLay!#&s_Rf-55b^{uJvZa!!c%#(55Ri654wmiu5RiuawLu,vp!+}^%b_}Y9;wkgxba}o>A9:=b^}zKuh=a''!3awRk3c*'!#aHRk6c+Z&Rk5Rk4Jv)&!awRjSawd9*`#0?C2@EzMj8u<uJ5RmbjQrquJu3x,k>uq@_+=ayb^|W~ARkEOuN]k@7dhzV^X/X&a-#zRzSb`zXcJzTT#2WkVKvDBzW!%FzY9;5bbzWjQrquJu3Jw3%!b`zU=ayb^zQd:#X(T-a!6Vyywxh}=b]{Jg=u1RiAdGp~qHtzv!w(wA+a+a;<!aJaYai'anasb(=azRmV:Cbb{MLq2vb!%')RjuRjrRjtRjqx3jnqCw3!%')Rk(Rk+Rk&Rk)Lq2vb!%')Rj{RjxRjzRjwLq2vb!%')RjsRjpRjfRjex3jcqCw3!%')Rk'Rk*RjkRjl9<CbbzfOu4ARhxLq2vb!%')RjyRjvRjhRjgx=joq*uKvb!%')+-Rk.Rk%Rj~Rk-Rk#Rj}x=jdq*uKvb!%')+-Rk,Rk!Rj|RjmRjjRjidAq&qKs@uAv8Aa.'*-a@a&0!aM@a5[y73Dsy3Ds|3Dt):wxgI2sHJwJZt.~Gqxwsf0ikrzt}Rl0Jvy_[xj~HqzKv_A|D!&WfP8axRoVcf,U#k(v]v+ueunaXRf1Ju}'!g8u#Ri=jQw!sCunLprq>!,')~<5qeGzq9F{W=c##%s5au:5aU3CBE|;d4#X(D!a&6Vygx(b;#(=]ed?C2F{N<capoq2r[a&!aPa9,'Pw;5s:@@=I|,55w_h|@@=IzcP~=x'fCqB_2Wl2>aU@@=I|1OuNBc1Z+jTqIsBv=Wlc~Cw`fl2WlZ~AcTa%!Z+jTqIsBv=Wlb~Cw`fh2WlYk+uNqJsBv=WlSg,u3dca3#UXaMYa)TaB-=cM|7T#<bI}l5@B932:aV2G{BOuNBJq:|M!5Ezt=<B=C@a^<B57@2F{v>cB{/T#=ay<bI{3Jv6!a.6BKq0ah&+!5E}HP~Ef{978BaU@@=Iza<7d#.Y#978BaU@@=IzH~AJq0!(@@=IzG978BaU@@=IzFe,aU*Y&^^^bvJb,b:bFad!a,c2Ta>aL.bo6!a#CbTa'T#Re{2Wlh2@G{yg6t~Ro_NvdRfticuRQRllJv3&!x&c|zs@Jw3!%RflwpfkRlpKuL;%(!Re<@G|C2GzdhIvuBwgjAg-u0RjAKQB%!(GzZ@G|5NuuRl7d='T+Y#Vy[g<v~Rm!==G|>JvA!)@wma=]m1ifuaw&RmnLs@vT'!|/+[y,g:v>ReTJw1!#qX=x!eC{bLu+wT&)ZtZauq_~Graci&U#F|89:r_Lupvq!.)&2RlG8RfaC=x!eF{_h?rpWlmd&'!#X|&]k::xJey#`'T|+<E|&2@H|%dE#(^,g;u.RiEg6vjRiC9xCkA{O|zY#g=ucRmXKs0@!&*@G|m@awRknJuh!,3d(}gY}eJvj!%Rm):Jw3!%Rm+Rm-Ls0w(&!a(a#@b[|6cZ#X'7RkxWgAOu4ARn'dH'U#Y*Vz-Wm'CARm}d]*#a%^a*T'aK!a<9bV{PC=p*Jw4!&SgxcbB5r]idw(wBRmF7xFkt#&`(Rm/Rm8E|!JuY_9:Rl5=wrgr2:bbxd@xXfB(a*#T+!.X0X1Ta/a'T&RlDRfL>RlyARl9b[z[>RfZ:RlL:RfRwlg/ARl;9;RlxKv,A/!%7s69<74=BA5ba{-8Bde#`a<XaKYa1,a'P~=wxfB2bZ}}?C972@@=I}r8@55B9;5bb}G978B2@@=aybb}3j3vLv;<Jw3&!>Rfk=ayb^}4~Ad1#`*@@=aybb{w2@>==<bbz]dx+UY#^UaF!a9!bB'Ya1.!ajXa#%olRhD[y=3Dt#Ov5BrHKuMB%!(Rf^Wep~HrJwkiQjKr|~FRg)Ku+D#'!t5~GrF~?rDdV)UY,Z/_7RkuG{<~BrBg,rlsO:235B@bX}|d?a1!#`(6Vyn5@d##Y+jTv|vV~EfIj]uNpn~FRfH7Lq2vb1!a9-978BaU@@=Iz9978BbU}#~AJq0!(@@=Iz8978BaU@@=Iz7~AJQ|}!978BbU}!JvkaK!AdUa21-U#`a+(g/vsRn~Ou!5RPj:rmu9WhOjXuvvNr}:RhAj^v(pyw8unRn[kPr}p|u7vwv]RiSBd;pppzq@qHQa?(b.!a.a`@.|xa(hFv;Wiyj5uuv-7Riw~Cw`fg2WlU978BbU|wOuNBJqG!(P~EfD~CRlQcZ#X,k)u3vWs@u2]ksg;wEx'f@q1_2Wg.j]uNpn~FRfqJv]!15x'h{qG!(@@=IzK~CRl^j6v(us5x4i,#T(2WmY?C2F{1>Kq<aj1!*jTqIsBv=Wld~Cw`fj2Wl[j`v0u*~>RlT=c>Z,k#u3vWs@u2]kq<c1Z+jTqIsBv=Wle~Cw`fn2Wl]dn1#c(a(b^a2!b/bAT(bj!aDa7bu,a_a{c0!2T0g:v>ReD2@G{42@G{5~DpM~<5rc=Bx6i>{RT#RnI@zCx]y]z:2Jv[!zr5Awyk]9]k]dD(Y+X#6Vz.g=wKtgwhaCwgmTWj2Lu,w%_+/[y-B;b^xeg3u3Rj-2@bX{*KrJ<!+'@Wg(g?QRlC@Jv`!%b[zIwsfII}8JQ_@w|kW|=Jv(%!AqcOuNBJvEzh!bYzjLs@wP#(0!oy@>RkdJwMZtc3Dtd@BcG#T'9bWxg2@2Fznd*#Y+;2x'c}w<zizixNgwa#Z'U+!/!a'!a+w~g~z6wcn{Rn}wcnzRn|5Rh%=]nJg5vuRmvNvdRlvcprJu}w*az*a#!%.a.'Bot9qT]kj@Wg'ay2Gzv@Jv`!%b[zEwsfHI}1;ck#Ux`<Cbbx_Lu+w!a&0*!wko*wwo,So,}6Juqxf!E}PigQuyRm`d3(`#8>Rn%:A5B;bZ~%KvhCa!a2!x>k7#Uxb@b{#xaRk7Jw0!)>wwhlShl}6>wwhmShm}6CJvB!.x'hhvj{!!5Bwkhhbaz}x'hivjz~!5Bwkhibaz|xEhTrNu,v-vpD!a%&/)a3a.,%Ro2t[CE{)@3re9b]{%wjo09:rgc:Z&Ro6=<riifuaw&RmoKrNA!%(Ro4>Ro89;Ri`dSaL'UYzxZb)7Rka3xRhT&!,!#^1U}vbaz{>>@=be}yC@:D5bazzKu+A&!}{?ba}y>>@=be}wxBh[t`u~vJvr!%a!a()a,a0a4RoC=]o;Ju(!%RoGRhdwjh`=]oAg>w#Ro?g5vuRo=NvdRl|Ku]C.!&;RoEJvB!%RoORoMBx'h[v+_?w~h`}~5?w~hd~!xKh]oiptu-utv.vp!#%&a30a@a'a+(a/aOp(o~p!RoDJu(!%RoHRhewjha=]oBNvdRl}g>w#Ro@g5vuRo>c[#X']o<CauRoRAd-#Y':RkpauRoQKu]C.!&;RoFJvB!%RoNRoPBx'h]v+_?w~ha}t5?w~he}ue!/UbhYacXaW^Tc&a;b:a-c/#b&aja1(!cL+!bKbt!bmcRc9aIc?8[yW3Dtt94Rg`Jv}!&SiRMzBhEebShEMNuPRe>x7gL#TzuwjirRipc<Z&>on;>z=h-MSh.Mwqczx'a7vj&!>Re4@=ResJt__NuPRi*NuPRi)j]uNr|~FRfzKrJ>_+@Wfy@Wf]2WocKrJ<!+'@Wg%g/QRl@@Jv`!&awRl<wsfFIzgLu(w*!.*&ShBMwvhIRhI9;RhNx1hK'!#Sn]Mx1hK~0!#:2<H~7cNu+w7D*'1ZtW>Rn1~?rOc:Z&Rn2=<rQ<7wjh&=BSnLMc]#X(6Vz)w[b=a!U#9wzgMc3#&(RgMRitRis<x,gKt`ax!&+SioM=BSilMc3#&(RgKRinRimKurB,!&SiQMzBhDebShDM6BJQ!(P~Efx978B2@@=I}WLrJw!!,a*&@G}O@9wkibRid@@x'fKwC!&SlDMSfLMjUv~Q~EfKKv3@a+!(hFv-]mpx/hYZ(C5RiWz<o/MwkhY?So/M@x,gbvfB*&!SgEM:SoeeehFu3:Rgbda(,^TZa)X/7Sg[eb:2RgI~BrMC@wgkc:wwkcRerx3h(uUvK!&*,SnOM4Sh*MArRg;wHRh(x=h;rJvPwI!a4',a'0@Wg&=BSh/Mg>w=Rh=g3w*wwgGRgGcW(X#;Sg}M2Gzk@Jv`!&awRl=wsfGIz`dKZ*T'Y-:RhR7RhQg5u-p`j6v(us5d,#Y+~Awkia?RicOuNBwkibba}Ld6p~tyu_vbAa'a+!a/'a3aEa8a!>Sh,ebJv{!&Sh@ebSaReb9;SgwebNuPRi(NvdRl)NuPRi'hHu^<Rm^Jvv_@Wl(g;u1Si/ebKu'B&!*Sh?eb@Wl'z@aPeb95Si.ebcpputyvjB)!,&a+0a%ShAMWeK@G}C@WfJ9;RhMwvhH9w{ia}ix,hJvRA1(!zAn[MRhHx1hJ~*!#hFv(BSn[MBJQ!(@@=I~'978B2@@=I}2db.Ua<'X}+T#a0XaG2G}E;wkg|wuh!Rh!x,hZu,@)!&So0MVy)C5RiXACJvB!&5RiY5RiZg8w)cG}*T#2@bU}=KsA>(!a.3wkhZba~(x,h^u(A!&(SoCMRhb5Bz=h[eb?w~hb~6x,h_u(A!&(SoDMRhc5Bz=h]eb?w~hc~6e)aA1T#T,^^^c-bMb&blcPaP(a/!0!bA=b5c@a(!bfbrc#2afwmhARnjwchORnp2Wlf3DtsNvdRl-2@wpa<]m0bx(#:awRk2@Jw3!%RfhwpfgRlnKQB%!(G{V@G|'NuuRl6d='T+Y#VyUg<v~Rl~==G|<Jv+'!aYShC}6@B<5?ba~8@Jw3'!g2QRljhLrpWlOd+#Y'g.w'rIg>w*wgj@g-u0Rj@Lu+wT&)ZtUauq]~GrGci&U#F|39:rELrNvj!.%*RhCwunfw~nf~:9;Ri]>wtnhg;wHRnhx3hDs@v~!/+'@Wfr@9RkSNu&Rlo=@<5GzoKs0@_+@Wl+@awRkmJuh!-3d(}pY#qWJvj!%Rm(:Jw3!%Rm,Rm*de&!1U-U#`)Re;@G|.@9Ri82@wjfvRlq=@<5GzpLvOvr!).&2RlF8Rf`C=x!eE{.Jw3_g2QRlkhLrpWlPde(!#U{s,UXa*Ta'[y'g:v>ReS;x0PZ&RnlRnn~HrKJw1}f!=x!eB|2w]aP(#Xa&a*Ta.Ua2a7=]iOd'#Y&Ro&WnWg;u.RiDg6vjRiBNvdRlzhNvj]nYJuW_2Wm3x)kFze{9d])!a.!,Y01!#&aC!a3RndC=ox~BrC@2b^{pg,rlse7x'ksuq!%Rm.E{xidw(wBRmGx9o+)X#wwo-So-}69:Rl4@xSf@a#XZ'X)X,Ta(/ARl8b[xc>RfY:RlI:RfQwlg.ARl:9;Rlwdn'#^XafaQa1X1TaHTa)@b[{zcZ#X'7RkwWg@Ou4ARn&x)kG#{,g7u/RkGdH'U#Y*Vz'Wm&CARm|bx#(A]gUbUzJj9Q~=d,#Y(56H}l978H{U7d,0#U*2>ABb_xZ978BbU{e~AJQ{g!978BbU{hxMh?ad{oUYZ.x1h?{l!#:2<H{mx3n[t{vl!,&a%3Ro(z=iS}6ARnr=Bwsn^wvn`Rnbd`*T}B0!#^X'BG{c9b]{a>>@=be}F?JvS!&BG{d7BG}(Bde#`a1X,Ya@!a'P~=wxf@2bZ}I56B2@@=aybb}08@55B9;5bb}<j3vLv;<Jw3&!>Rfg=ayb^}&OuNBKuLA!)a!P~=x#fD{f2@>==<bbzl?C972@@=Ix^d6rSu,v7w*C(0a)a6#B+a%!sQ[y?3Dt%3[xn~<5rLOu!5p@Ku+D#'!t7~GrP~?rNKvlaya7'!h+v-5qMg=t|cd,U#5AAaa5Abb{S@52B5@a[@52B5Gx[iXueu;d<#`a(!/549C;ag>23ExY5@Dah89b^~689Jv)!~2b[~1Lv'w(%*!a#bX|aPrmawRe]keu7uhv-q6rxu,q`xTo]/a5aU!bNaDXbi!b-!ao!b<bwA!#5@B932:aV2G|:d-)Y#hJrL>RhG<7@C5<H|_=Cau:5aj5@B932:bJ|ng>vIbs)#?C2F|9jPv0w.vISh-MKvUaz(.!9ABbb|[5;5<H|Eg>unwfh;9:4E|YjQsBt|vjx'hYq3!(?C2F|J:2<BaY?C2F|GOu!5x,g|p{ah!-(?C2F|c9:4E|OjXuvvNr}:Rh&i[w*t|cd+U#jJvsu)vsSn~Mkfrmu9p}u7vwv]So!McW#Xa!ax5@A5aY:5;5<H|>kJv~vYrquJu3x4ib#T)2@SmZM?C2F|Bj:rmu9@xPhI(a*a#U#`a3-5Abb|L~@:RhK9:4E|0@52B5G|#C::aY?C2F|-:2<BaY?C2F|.5Jvk!a)javYrquJu3x4ia#T)2@SmYM?C2F|HAxPhH(!a#U#`a*-5Abb|4~@:RhJ9:4E|R@52B5G|F:2<BaY?C2F|Sc^#Xa2j=Qq5CJvB!-g<v{z;hhM?C2F|Zi[vrv{z;hiM?C2F|XKsA>!a)-g<v{z;h[eb?C2F|]i[vrv{z;h]eb?C2F|^iZu.vix,hZq3ah!.(?C2F|QOu!5ShXM:2<BaY?C2F|P", 13_494, 2713, 49, 25, 61);
}),
"[project]/node_modules/sanitize-html/node_modules/entities/dist/generated/decode-data-xml.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Generated using scripts/write-decode-map.ts
/** Packed XML decode trie data. */ __turbopack_context__.s([
    "xmlDecodeTree",
    ()=>xmlDecodeTree
]);
const xmlDecodeTree = /* #__PURE__ */ new Uint16Array([
    512,
    26_465,
    29_036,
    7,
    0,
    2,
    4,
    116,
    24_638,
    116,
    24_636,
    8693,
    29_807,
    24_610,
    621,
    1,
    0,
    0,
    3,
    112,
    24_614,
    111,
    115,
    24_615
]);
}),
"[project]/node_modules/sanitize-html/node_modules/entities/dist/internal/bin-trie-flags.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Bit flags & masks for the binary trie encoding used for entity decoding.
 *
 * The trie is a flat `Uint16Array`. Every node starts with one header word:
 *
 *   15..14 VALUE_LENGTH   Number of words the value occupies, +1.
 *                         0 = no value; 1 = value inline in bits 12..0;
 *                         2/3 = value in the 1/2 words after the header.
 *   13     FLAG13         If VALUE_LENGTH > 0: semicolon required ("strict"
 *                         entity; `;` is never stored as a branch).
 *                         If VALUE_LENGTH == 0: this node is a compact run.
 *   12..7  BRANCH_LENGTH  Number of branches (or run length for runs).
 *   6..0   JUMP_TABLE     Jump-table offset / single-branch char / first
 *                         run char (see below).
 *
 * Branch data follows the header and any value words. Its shape is selected
 * by (JUMP_TABLE, BRANCH_LENGTH) in the header:
 *
 *   Single branch  JUMP_TABLE = the only child's char, BRANCH_LENGTH = 0.
 *                  No branch words; the child node follows immediately.
 *   Jump table     JUMP_TABLE = first covered char (> 0), BRANCH_LENGTH =
 *                  table length. One word per covered char: 0 = no branch,
 *                  otherwise the child's offset from the END of the table,
 *                  +1 (so 0 stays the no-branch sentinel).
 *   Dictionary     JUMP_TABLE = 0, BRANCH_LENGTH = number of branches.
 *                  ceil(n/2) words of sorted keys packed two per word
 *                  (low byte first), then n pointer words storing the
 *                  child's offset from the END of the branch data.
 *   Compact run    VALUE_LENGTH = 0, FLAG13 set. BRANCH_LENGTH = run
 *                  length (3..63), JUMP_TABLE = first char; remaining run
 *                  chars packed two per word after the header. The target
 *                  node follows the packed words immediately.
 *
 * Pointers are end-relative (rather than relative to the pointer's own
 * position) because that makes the common "child encoded right after the
 * branch data" case a small constant, which compresses far better. Offsets
 * to already-encoded (shared) nodes wrap via uint16 modulo arithmetic; the
 * decoder masks navigation results with `& 0xff_ff` to match.
 */ __turbopack_context__.s([
    "BinTrieFlags",
    ()=>BinTrieFlags
]);
var BinTrieFlags;
(function(BinTrieFlags) {
    BinTrieFlags[BinTrieFlags["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
    BinTrieFlags[BinTrieFlags["FLAG13"] = 8192] = "FLAG13";
    BinTrieFlags[BinTrieFlags["BRANCH_LENGTH"] = 8064] = "BRANCH_LENGTH";
    BinTrieFlags[BinTrieFlags["JUMP_TABLE"] = 127] = "JUMP_TABLE";
    /** Bits 12..0: the inline value of a VALUE_LENGTH = 1 header word. */ BinTrieFlags[BinTrieFlags["VALUE_MASK"] = 8191] = "VALUE_MASK";
})(BinTrieFlags || (BinTrieFlags = {}));
}),
"[project]/node_modules/sanitize-html/node_modules/entities/dist/decode.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DecodingMode",
    ()=>DecodingMode,
    "EntityDecoder",
    ()=>EntityDecoder,
    "decodeHTML",
    ()=>decodeHTML,
    "decodeHTMLAttribute",
    ()=>decodeHTMLAttribute,
    "decodeHTMLStrict",
    ()=>decodeHTMLStrict,
    "decodeXML",
    ()=>decodeXML,
    "determineBranch",
    ()=>determineBranch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2d$codepoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/entities/dist/decode-codepoint.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$generated$2f$decode$2d$data$2d$html$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/entities/dist/generated/decode-data-html.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$generated$2f$decode$2d$data$2d$xml$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/entities/dist/generated/decode-data-xml.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/entities/dist/internal/bin-trie-flags.js [app-ssr] (ecmascript)");
;
;
;
;
var CharCodes;
(function(CharCodes) {
    CharCodes[CharCodes["AMP"] = 38] = "AMP";
    CharCodes[CharCodes["NUM"] = 35] = "NUM";
    CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
    CharCodes[CharCodes["EQUALS"] = 61] = "EQUALS";
    CharCodes[CharCodes["ZERO"] = 48] = "ZERO";
    CharCodes[CharCodes["NINE"] = 57] = "NINE";
    CharCodes[CharCodes["LOWER_A"] = 97] = "LOWER_A";
    CharCodes[CharCodes["LOWER_X"] = 120] = "LOWER_X";
})(CharCodes || (CharCodes = {}));
/** Bit that needs to be set to convert an upper case ASCII character to lower case */ const TO_LOWER_BIT = 0b10_0000;
/*
 * `parseNumericEntity` packs its two results into one 32-bit integer:
 * `(consumed << CONSUMED_SHIFT) | codePoint`. The 21-bit code point field
 * fits any valid Unicode value (max 0x10FFFF, clamped before packing); the
 * consumed count excludes `&` and gets the remaining 11 bits. Extract it
 * with `>>>` so the topmost bit isn't treated as a sign.
 *
 * Plain consts rather than a `const enum`: with `isolatedModules`, enum
 * member reads compile to runtime property loads.
 */ const CONSUMED_SHIFT = 21;
const CODE_POINT_MASK = 0x1f_ff_ff;
/**
 * Reserved consumed field for counts of at least 2047 characters after `&`.
 * The true count is in `longNumericConsumed`.
 */ const CONSUMED_OVERFLOW = 0x7_ff;
/**
 * Side channel for numeric entities of at least 2048 characters including
 * `&`. Set by `parseNumericEntity` when its consumed count reaches the
 * reserved value `CONSUMED_OVERFLOW`; callers read the true count from here.
 * A module-level slot avoids a tuple allocation on the hot path.
 */ let longNumericConsumed = 0;
/**
 * Extract the consumed count from a `parseNumericEntity` packed result,
 * recovering the true length from `longNumericConsumed` when the packed
 * field contains the sentinel. Read it before the next `parseNumericEntity`
 * call, which may overwrite the side channel. This helper owns that protocol.
 * @param packed Packed result of `parseNumericEntity`.
 */ function unpackConsumed(packed) {
    const consumed = packed >>> CONSUMED_SHIFT;
    return consumed === CONSUMED_OVERFLOW ? longNumericConsumed : consumed;
}
/**
 * Unsigned subtraction trick: (code - lo) >>> 0 wraps negatives to large
 * values, so a single `<=` covers the entire [lo..hi] range check.
 * @param code Code point to check.
 */ function isNumber(code) {
    return code - CharCodes.ZERO >>> 0 <= 9;
}
function isHexadecimalCharacter(code) {
    return (code | TO_LOWER_BIT) - CharCodes.LOWER_A >>> 0 <= 5; // F - a
}
function isAlpha(code) {
    return (code | TO_LOWER_BIT) - CharCodes.LOWER_A >>> 0 <= 25; // Z - a
}
/**
 * Checks if the given character is a valid end character for an entity in an attribute.
 *
 * Attribute values that aren't terminated properly aren't parsed, and shouldn't lead to a parser error.
 * See the example in https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
 * @param code Code point to check.
 */ function isEntityInAttributeInvalidEnd(code) {
    return code === CharCodes.EQUALS || isAlpha(code) || isNumber(code);
}
var EntityDecoderState;
(function(EntityDecoderState) {
    EntityDecoderState[EntityDecoderState["EntityStart"] = 0] = "EntityStart";
    EntityDecoderState[EntityDecoderState["NumericStart"] = 1] = "NumericStart";
    EntityDecoderState[EntityDecoderState["NumericDecimal"] = 2] = "NumericDecimal";
    EntityDecoderState[EntityDecoderState["NumericHex"] = 3] = "NumericHex";
    EntityDecoderState[EntityDecoderState["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode) {
    /** Entities in text nodes that can end with any character. */ DecodingMode[DecodingMode["Legacy"] = 0] = "Legacy";
    /** Only allow entities terminated with a semicolon. */ DecodingMode[DecodingMode["Strict"] = 1] = "Strict";
    /** Entities in attributes have limitations on ending characters. */ DecodingMode[DecodingMode["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
class EntityDecoder {
    decodeTree;
    emitCodePoint;
    errors;
    /** The current state of the decoder. */ state = EntityDecoderState.EntityStart;
    /** Characters that were consumed while parsing an entity. */ consumed = 1;
    /**
     * The result of the entity.
     *
     * For named entities: the trie index of the best legacy match so far
     * (0 = none). For numeric entities: the accumulated code point.
     */ result = 0;
    /** The current index in the decode tree. */ treeIndex = 0;
    /**
     * Characters consumed since the last recorded legacy match, plus one.
     * Invariant at the top of the `stateNamedEntity` loop: `excess` equals
     * the number of unrecorded consumed characters + 1.
     */ // biome-ignore lint/correctness/noUnusedPrivateClassMembers: False positive (read via destructuring)
    excess = 1;
    /** The mode in which the decoder is operating. */ decodeMode = DecodingMode.Strict;
    /** The number of characters that have been consumed in the current run. */ // biome-ignore lint/correctness/noUnusedPrivateClassMembers: False positive
    runConsumed = 0;
    constructor(/** The predefined HTML or XML decode tree. */ decodeTree, /**
     * The function that is called when a codepoint is decoded.
     *
     * For named entities that decode to multiple code points, this will
     * be called multiple times, with the second codepoint, and the same
     * `consumed` value.
     * @param codepoint The decoded codepoint.
     * @param consumed The number of characters consumed by the decoder.
     */ emitCodePoint, /** An object that is used to produce errors. */ errors){
        this.decodeTree = decodeTree;
        this.emitCodePoint = emitCodePoint;
        this.errors = errors;
    }
    /**
     * Resets the instance to make it reusable.
     * @param decodeMode Entity decoding mode to use.
     */ startEntity(decodeMode) {
        this.decodeMode = decodeMode;
        this.state = EntityDecoderState.EntityStart;
        this.result = 0;
        this.treeIndex = 0;
        this.excess = 1;
        this.consumed = 1;
        this.runConsumed = 0;
    }
    /**
     * Write an entity to the decoder. This can be called multiple times with partial entities.
     * If the entity is incomplete, the decoder will return -1.
     *
     * Mirrors the non-streaming `decodeWithTrie`, but with the ability to stop decoding if the
     * entity is incomplete, and resume when the next string is written.
     * @param input The string containing the entity (or a continuation of the entity).
     * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */ write(input, offset) {
        switch(this.state){
            case EntityDecoderState.EntityStart:
                {
                    if (input.charCodeAt(offset) === CharCodes.NUM) {
                        this.state = EntityDecoderState.NumericStart;
                        this.consumed += 1;
                        return this.stateNumericStart(input, offset + 1);
                    }
                    this.state = EntityDecoderState.NamedEntity;
                    return this.stateNamedEntity(input, offset);
                }
            case EntityDecoderState.NumericStart:
                {
                    return this.stateNumericStart(input, offset);
                }
            case EntityDecoderState.NumericDecimal:
                {
                    return this.stateNumericDecimal(input, offset);
                }
            case EntityDecoderState.NumericHex:
                {
                    return this.stateNumericHex(input, offset);
                }
            default:
                {
                    // NamedEntity — the only remaining state.
                    return this.stateNamedEntity(input, offset);
                }
        }
    }
    /**
     * Switches between the numeric decimal and hexadecimal states.
     *
     * Equivalent to the `Numeric character reference state` in the HTML spec.
     * @param input The string containing the entity (or a continuation of the entity).
     * @param offset The current offset.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */ // eslint-disable-next-line unicorn/consistent-class-member-order
    stateNumericStart(input, offset) {
        if (offset >= input.length) {
            return -1;
        }
        if ((input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
            this.state = EntityDecoderState.NumericHex;
            this.consumed += 1;
            return this.stateNumericHex(input, offset + 1);
        }
        this.state = EntityDecoderState.NumericDecimal;
        return this.stateNumericDecimal(input, offset);
    }
    /**
     * Parses a hexadecimal numeric entity.
     *
     * Equivalent to the `Hexademical character reference state` in the HTML
     * spec. Digit parsing matches the hex loop in `parseNumericEntity`.
     * The accumulated value is preserved for numeric validation callbacks.
     * @param input The string containing the entity (or a continuation of the entity).
     * @param offset The current offset.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */ stateNumericHex(input, offset) {
        const inputLength = input.length;
        // Local accumulators; flushed before any exit (see stateNamedEntity).
        let { result } = this;
        let { consumed } = this;
        while(offset < inputLength){
            const char = input.charCodeAt(offset);
            if (isNumber(char) || isHexadecimalCharacter(char)) {
                // Convert hex digit to value (0-15); 'a'/'A' -> 10.
                const digit = char <= CharCodes.NINE ? char - CharCodes.ZERO : (char | TO_LOWER_BIT) - CharCodes.LOWER_A + 10;
                result = result * 16 + digit;
                consumed += 1;
                offset += 1;
            } else {
                this.result = result;
                this.consumed = consumed;
                return this.emitNumericEntity(char, 3);
            }
        }
        this.result = result;
        this.consumed = consumed;
        return -1; // Incomplete entity
    }
    /**
     * Parses a decimal numeric entity.
     *
     * Equivalent to the `Decimal character reference state` in the HTML
     * spec. Digit parsing matches the decimal loop in `parseNumericEntity`.
     * The accumulated value is preserved for numeric validation callbacks.
     * @param input The string containing the entity (or a continuation of the entity).
     * @param offset The current offset.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */ stateNumericDecimal(input, offset) {
        const inputLength = input.length;
        // Local accumulators; flushed before any exit (see stateNamedEntity).
        let { result } = this;
        let { consumed } = this;
        while(offset < inputLength){
            const digit = input.charCodeAt(offset) - CharCodes.ZERO;
            if (digit >>> 0 > 9) {
                this.result = result;
                this.consumed = consumed;
                return this.emitNumericEntity(digit + CharCodes.ZERO, 2);
            }
            result = result * 10 + digit;
            consumed += 1;
            offset += 1;
        }
        this.result = result;
        this.consumed = consumed;
        return -1; // Incomplete entity
    }
    /**
     * Validate and emit a numeric entity.
     *
     * Implements the logic from the `Hexademical character reference start
     * state` and `Numeric character reference end state` in the HTML spec.
     * @param lastCp The last code point of the entity. Used to see if the
     *               entity was terminated with a semicolon.
     * @param expectedLength The minimum number of characters that should be
     *                       consumed. Used to validate that at least one digit
     *                       was consumed.
     * @returns The number of characters that were consumed.
     */ emitNumericEntity(lastCp, expectedLength) {
        // Ensure we consumed at least one digit.
        if (this.consumed <= expectedLength) {
            this.errors?.absenceOfDigitsInNumericCharacterReference(this.consumed);
            return 0;
        }
        // Figure out if this is a legit end of the entity
        if (lastCp === CharCodes.SEMI) {
            this.consumed += 1;
        } else if (this.decodeMode === DecodingMode.Strict) {
            return 0;
        }
        this.emitCodePoint((this.decodeTree === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$generated$2f$decode$2d$data$2d$xml$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["xmlDecodeTree"] ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2d$codepoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["replaceCodePointXML"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2d$codepoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["replaceCodePoint"])(this.result), this.consumed);
        if (this.errors) {
            if (lastCp !== CharCodes.SEMI) {
                this.errors.missingSemicolonAfterCharacterReference();
            }
            this.errors.validateNumericCharacterReference(this.result);
        }
        return this.consumed;
    }
    /**
     * Flush locally-tracked walk state back to the fields, then emit the
     * recorded legacy match or reject (cold path — at most once per
     * entity). Called after failed navigation (leaf node, branch miss, or
     * compact-run mismatch). In attribute mode, reject if no legacy was
     * recorded at the current node, if we descended past it, or if the
     * pending input character is an invalid attribute terminator.
     * @param consumed Locally-tracked consumed count.
     * @param excess Locally-tracked excess count.
     * @param char Pending input character (may be the mismatching char).
     * @param valueLength Value length at the current trie node.
     */ flushAndEmitLegacyOrReject(consumed, excess, char, valueLength) {
        this.consumed = consumed;
        this.excess = excess;
        return this.result === 0 || this.decodeMode === DecodingMode.Attribute && (valueLength === 0 || excess > 1 || isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
    }
    /**
     * Parses a named entity.
     *
     * Equivalent to the `Named character reference state` in the HTML spec.
     * @param input The string containing the entity (or a continuation of the entity).
     * @param offset The current offset.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */ stateNamedEntity(input, offset) {
        const { decodeTree } = this;
        const inputLength = input.length;
        const isStrict = this.decodeMode === DecodingMode.Strict;
        /*
         * Local copies of the resumable walk state avoid per-character
         * field writes. They are flushed back to the fields
         * on every exit (chunk end, and before any emit helper that reads
         * them). `this.result` is only written at the (rare) record points,
         * so it stays a direct field write.
         *
         * Legacy-match recording happens in two idempotent places: at the
         * loop top when sitting on a value node, and in the chunk-end
         * epilogue (so `end()` sees matches that land exactly on a chunk
         * boundary). Recording applies `consumed += excess - 1; excess = 1`,
         * which is a no-op when repeated — the loop-top invariant is
         * `excess` = unrecorded consumed characters + 1.
         */ let { treeIndex } = this;
        let { excess } = this;
        let { consumed } = this;
        let current = decodeTree[treeIndex];
        while(offset < inputLength){
            /*
             * Descend through value-less jump-table nodes (including the
             * single-branch encoding) inline, mirroring `decodeWithTrie`:
             * this avoids a `determineBranch` call per level for the
             * dominant node shape — including the root on the first write.
             */ while((current & (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].VALUE_LENGTH | __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13)) === 0 && (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].JUMP_TABLE) !== 0){
                const char = input.charCodeAt(offset);
                const jumpOffset = current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].JUMP_TABLE;
                const branchCount = (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].BRANCH_LENGTH) >> 7;
                if (branchCount === 0) {
                    // Single branch encoded inline in the jump offset bits.
                    if (char !== jumpOffset) {
                        return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
                    }
                    treeIndex += 1;
                } else {
                    const slot = char - jumpOffset;
                    if (slot >>> 0 >= branchCount) {
                        return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
                    }
                    const stored = decodeTree[treeIndex + 1 + slot];
                    if (stored === 0) {
                        return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
                    }
                    // End-relative: branch data ends at treeIndex+1+branchCount.
                    treeIndex = treeIndex + branchCount + stored & 0xff_ff;
                }
                current = decodeTree[treeIndex];
                offset += 1;
                excess += 1;
                /*
                 * `charCodeAt` past the end returns NaN, which would alias
                 * to slot 0 after `>>> 0` — bail out explicitly.
                 */ // eslint-disable-next-line unicorn/no-break-in-nested-loop
                if (offset >= inputLength) break;
            }
            if (offset >= inputLength) break;
            // Handle compact runs (resumable across chunks).
            if ((current & (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].VALUE_LENGTH | __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13)) === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13) {
                const runLength = (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].BRANCH_LENGTH) >> 7; /* 3..63 */ 
                let { runConsumed } = this;
                // If we are starting a run, check the first char.
                if (runConsumed === 0) {
                    const char = input.charCodeAt(offset);
                    if (char !== (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].JUMP_TABLE)) {
                        return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
                    }
                    offset += 1;
                    excess += 1;
                    runConsumed = 1;
                }
                // Check remaining characters in the run (packed two per uint16 word).
                while(runConsumed < runLength){
                    if (offset >= inputLength) {
                        this.treeIndex = treeIndex;
                        this.excess = excess;
                        this.consumed = consumed;
                        this.runConsumed = runConsumed;
                        return -1;
                    }
                    const charIndexInPacked = runConsumed - 1;
                    const packedWord = decodeTree[treeIndex + 1 + (charIndexInPacked >> 1)];
                    const expectedChar = packedWord >> ((charIndexInPacked & 1) << 3) & 0xff;
                    const char = input.charCodeAt(offset);
                    if (char !== expectedChar) {
                        this.runConsumed = 0;
                        return this.flushAndEmitLegacyOrReject(consumed, excess, char, 0);
                    }
                    offset += 1;
                    excess += 1;
                    runConsumed += 1;
                }
                this.runConsumed = 0;
                treeIndex += 1 + (runLength >> 1);
                current = decodeTree[treeIndex];
                continue;
            }
            // Header plus out-of-line value words; 0 means no value.
            const valueLength = current >>> 14;
            const char = input.charCodeAt(offset);
            if (valueLength !== 0) {
                // Record a legacy match (FLAG13 clear = semicolon optional).
                if (!isStrict && (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13) === 0) {
                    this.result = treeIndex;
                    consumed += excess - 1;
                    excess = 1;
                }
                /*
                 * Implicit semicolon handling: emit immediately. Covers both
                 * strict (FLAG13 set) and legacy entities — neither stores
                 * an explicit `;` branch in the trie.
                 */ if (char === CharCodes.SEMI) {
                    return this.emitNamedEntityData(treeIndex, valueLength, consumed + excess);
                }
                /*
                 * `valueLength === 1` packs the codepoint into the header
                 * word's low 13 bits, where branch metadata also lives. Skip
                 * the branch lookup on leaves so those value bits aren't
                 * reinterpreted as branch offsets.
                 */ if (valueLength === 1) {
                    return this.flushAndEmitLegacyOrReject(consumed, excess, char, valueLength);
                }
            }
            // Value-bearing or dictionary node: dispatch through determineBranch.
            const next = determineBranch(decodeTree, current, treeIndex + (valueLength || 1), char);
            if (next < 0) {
                return this.flushAndEmitLegacyOrReject(consumed, excess, char, valueLength);
            }
            treeIndex = next;
            current = decodeTree[treeIndex];
            offset += 1;
            excess += 1;
        }
        /*
         * Chunk exhausted. Record a legacy match we may be sitting on, so a
         * subsequent `end()` emits it, then persist the walk state.
         */ if (!isStrict && current >>> 14 !== 0 && (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13) === 0) {
            this.result = treeIndex;
            consumed += excess - 1;
            excess = 1;
        }
        this.treeIndex = treeIndex;
        this.excess = excess;
        this.consumed = consumed;
        return -1;
    }
    /**
     * Emit a named entity that was not terminated with a semicolon.
     * @returns The number of characters consumed.
     */ emitNotTerminatedNamedEntity() {
        const { result, decodeTree } = this;
        const valueLength = decodeTree[result] >>> 14;
        this.emitNamedEntityData(result, valueLength, this.consumed);
        this.errors?.missingSemicolonAfterCharacterReference();
        return this.consumed;
    }
    /**
     * Emit a named entity.
     * @param result The index of the entity in the decode tree.
     * @param valueLength Encoded value length (header plus any value words).
     * @param consumed The number of characters consumed.
     * @returns The number of characters consumed.
     */ emitNamedEntityData(result, valueLength, consumed) {
        const { decodeTree } = this;
        this.emitCodePoint(valueLength === 1 ? decodeTree[result] & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].VALUE_MASK : decodeTree[result + 1], consumed);
        if (valueLength === 3) {
            // Emit the second UTF-16 code unit.
            this.emitCodePoint(decodeTree[result + 2], consumed);
        }
        return consumed;
    }
    /**
     * Signal to the parser that the end of the input was reached.
     *
     * Remaining data will be emitted and relevant errors will be produced.
     * @returns The number of characters consumed.
     */ end() {
        switch(this.state){
            case EntityDecoderState.NamedEntity:
                {
                    // Emit a named entity if we have one.
                    return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
                }
            // Otherwise, emit a numeric entity if we have one.
            case EntityDecoderState.NumericDecimal:
                {
                    return this.emitNumericEntity(0, 2);
                }
            case EntityDecoderState.NumericHex:
                {
                    return this.emitNumericEntity(0, 3);
                }
            case EntityDecoderState.NumericStart:
                {
                    this.errors?.absenceOfDigitsInNumericCharacterReference(this.consumed);
                    return 0;
                }
            default:
                {
                    // EntityStart or unknown — return 0.
                    return 0;
                }
        }
    }
}
function determineBranch(decodeTree, current, nodeIndex, char) {
    const branchCount = (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].BRANCH_LENGTH) >> 7;
    const jumpOffset = current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].JUMP_TABLE;
    // Case 1: Single branch or jump table (jumpOffset encodes the first/only char code).
    if (jumpOffset) {
        if (branchCount === 0) {
            // Single branch encoded inline in the jump offset bits.
            return char === jumpOffset ? nodeIndex : -1;
        }
        /*
         * Jump table: branchCount consecutive slots starting at jumpOffset.
         * Unsigned comparison handles both < 0 and >= branchCount in one check.
         */ const slot = char - jumpOffset;
        if (slot >>> 0 >= branchCount) return -1;
        const stored = decodeTree[nodeIndex + slot];
        /*
         * 0 = empty slot (no branch); otherwise the child's offset from the
         * end of the branch array, +1 (end-relative pointers compress
         * better). `& 0xff_ff` mirrors the encoder's uint16 wrap for
         * backreferences to already-encoded nodes.
         */ return stored === 0 ? -1 : nodeIndex + branchCount + stored - 1 & 0xff_ff;
    }
    /*
     * Case 2: Packed dictionary. Linear scan — over 90% of dict nodes have
     * <= 4 branches in the HTML trie, where the constant-factor savings
     * dominate over binary search's asymptotic edge.
     */ if (branchCount === 0) return -1;
    const packedKeySlots = branchCount + 1 >> 1;
    const branchEnd = nodeIndex + packedKeySlots + branchCount;
    for(let index = 0; index < branchCount; index++){
        const packed = decodeTree[nodeIndex + (index >> 1)];
        const key = packed >> ((index & 1) << 3) & 0xff;
        if (key === char) {
            const pointerIndex = nodeIndex + packedKeySlots + index;
            // Pointers are relative to the end of the branch data.
            return branchEnd + decodeTree[pointerIndex] & 0xff_ff;
        }
        // Keys are sorted; if we've passed `char`, no match is possible.
        if (key > char) return -1;
    }
    return -1;
}
/**
 * Read the decoded value from a trie node.
 * @param decodeTree The trie.
 * @param nodeIndex The index of the node.
 * @param valueLength The length of the value (1, 2, or 3).
 * @returns The decoded string.
 */ function readTrieValue(decodeTree, nodeIndex, valueLength) {
    if (valueLength === 1) {
        return String.fromCharCode(decodeTree[nodeIndex] & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].VALUE_MASK);
    }
    if (valueLength === 2) {
        return String.fromCharCode(decodeTree[nodeIndex + 1]);
    }
    return String.fromCharCode(decodeTree[nodeIndex + 1], decodeTree[nodeIndex + 2]);
}
/**
 * Parse a numeric entity (`&#DDD;` or `&#xHHH;`).
 *
 * Encodes the result as `(consumed << CONSUMED_SHIFT) | codepoint` (see
 * the packing comment at the top of the file; overlong entities spill
 * their length into `longNumericConsumed`). Returns 0 when no digits were
 * found.
 *
 * This is the sync counterpart of the streaming
 * `EntityDecoder#stateNumericDecimal` / `#stateNumericHex`. Digit parsing
 * matches those methods; only this packed result needs a value clamp.
 * @param input       The input string.
 * @param numberStart Index of the `#` character.
 * @param inputLength Cached `input.length`.
 */ function parseNumericEntity(input, numberStart, inputLength) {
    let offset = numberStart + 1; // Skip "#"
    let cp = 0;
    let digitStart = offset;
    /*
     * Separate decimal and hexadecimal loops: each multiplies by a constant
     * and runs a single digit test, instead of a per-character base check.
     */ if (offset < inputLength && (input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
        offset += 1;
        digitStart = offset;
        while(offset < inputLength){
            const char = input.charCodeAt(offset);
            if (isNumber(char)) {
                cp = cp * 16 + (char - CharCodes.ZERO);
            } else if (isHexadecimalCharacter(char)) {
                cp = cp * 16 + ((char | TO_LOWER_BIT) - CharCodes.LOWER_A + 10);
            } else {
                break;
            }
            offset += 1;
        }
    } else {
        while(offset < inputLength){
            const digit = input.charCodeAt(offset) - CharCodes.ZERO;
            if (digit >>> 0 > 9) break;
            cp = cp * 10 + digit;
            offset += 1;
        }
    }
    if (offset === digitStart) return 0;
    // Include the semicolon in consumed when present.
    if (offset < inputLength && input.charCodeAt(offset) === CharCodes.SEMI) {
        offset += 1;
    }
    /*
     * Clamp out-of-range values to 0x110000 so they fit the 21-bit field
     * and decode to U+FFFD. Lengths at or above CONSUMED_OVERFLOW use the
     * side channel described with the packing constants.
     */ if (cp > 0x10_ff_ff) cp = 0x11_00_00;
    let consumed = offset - numberStart;
    if (consumed >= CONSUMED_OVERFLOW) {
        // eslint-disable-next-line unicorn/no-top-level-assignment-in-function -- deliberate side channel, see `longNumericConsumed`
        longNumericConsumed = consumed;
        consumed = CONSUMED_OVERFLOW;
    }
    return consumed << CONSUMED_SHIFT | cp;
}
/**
 * Decode all entities in `input` using the HTML trie.
 *
 * Hard-wired to `htmlDecodeTree`: the inline root navigation below assumes
 * the HTML root's jump-table shape, so this must not be generalized to
 * other tries (the XML trie's dictionary root would silently match no
 * entities — `decodeXML` has its own hand-coded fast path instead).
 * @param input      The string to decode.
 * @param isStrict Only match semicolon-terminated entities.
 * @param isAttribute Whether to apply attribute-specific parsing rules (disallowing certain non-semicolon terminators).
 * @returns The decoded string.
 */ function decodeWithTrie(input, isStrict, isAttribute) {
    const decodeTree = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$generated$2f$decode$2d$data$2d$html$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["htmlDecodeTree"];
    // Fast path: no entities at all — return input without any allocation.
    let offset = input.indexOf("&");
    if (offset < 0) return input;
    const inputLength = input.length;
    /*
     * `chunkStart` marks the start of the next pending slice. Rejected
     * entities don't advance it, so consecutive rejections are stitched
     * into a single `slice` once a real match (or end of input) is hit.
     */ let chunkStart = 0;
    let result = "";
    /*
     * Root navigation fields, hoisted out of the per-entity loop. The HTML
     * root is a multi-branch jump-table covering [A-Za-z]; see the inline
     * first-iteration comment below.
     */ const root = decodeTree[0];
    const rootJumpOffset = root & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].JUMP_TABLE;
    const rootBranchCount = (root & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].BRANCH_LENGTH) >> 7;
    do {
        const entityStart = offset + 1;
        // Quick check: entity names must start with [A-Za-z], numeric with #.
        const firstChar = input.charCodeAt(entityStart);
        let consumed;
        let value;
        if (firstChar === CharCodes.NUM) {
            const packed = parseNumericEntity(input, entityStart, inputLength);
            consumed = unpackConsumed(packed);
            // In strict mode, require semicolon termination.
            if (isStrict && consumed > 0 && input.charCodeAt(entityStart + consumed - 1) !== CharCodes.SEMI) {
                consumed = 0;
            }
            value = consumed === 0 ? "" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2d$codepoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["codePointToString"])(packed & CODE_POINT_MASK);
        } else if (isAlpha(firstChar)) {
            consumed = 0;
            value = "";
            /*
             * The generator guarantees a jump-table root. Consume the first
             * character directly, then walk from its child.
             */ const rootSlotIndex = firstChar - rootJumpOffset;
            let nodeIndex;
            if (rootSlotIndex >>> 0 < rootBranchCount) {
                const stored = decodeTree[1 + rootSlotIndex];
                nodeIndex = stored === 0 ? -1 : rootBranchCount + stored & 0xff_ff;
            } else {
                nodeIndex = -1;
            }
            /*
             * Best legacy (no-semicolon) match so far, as trie coordinates.
             * Deferring `readTrieValue` to the end avoids allocating a
             * string for matches that longer matches supersede.
             */ let bestNodeIndex = 0;
            let bestValueLength = 0;
            let current = nodeIndex < 0 ? 0 : decodeTree[nodeIndex];
            let index = entityStart + 1;
            /*
             * Walk the trie from the root child. The `trie` label lets the
             * inner descent and compact-run loops abandon the entity (and
             * fall through to the legacy/reject handling) directly.
             */ trie: while(index < inputLength){
                /*
                 * Inline value-less jump tables and single branches. A miss
                 * falls through to the recorded legacy match or rejection.
                 */ while(// Value-less, non-run node with a nonzero jump offset.
                (current & (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].VALUE_LENGTH | __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13)) === 0 && (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].JUMP_TABLE) !== 0){
                    const jumpOffset = current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].JUMP_TABLE;
                    const branchCount = (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].BRANCH_LENGTH) >> 7;
                    if (branchCount === 0) {
                        // Single branch encoded inline in the jump offset bits.
                        if (input.charCodeAt(index) !== jumpOffset) break trie;
                        nodeIndex += 1;
                    } else {
                        const slot = input.charCodeAt(index) - jumpOffset;
                        if (slot >>> 0 >= branchCount) break trie;
                        const stored = decodeTree[nodeIndex + 1 + slot];
                        if (stored === 0) break trie;
                        // End-relative: branch data ends at nodeIndex+1+branchCount.
                        nodeIndex = nodeIndex + branchCount + stored & 0xff_ff;
                    }
                    current = decodeTree[nodeIndex];
                    index += 1;
                    /*
                     * `charCodeAt` past the end returns NaN, which would
                     * alias to slot 0 after `>>> 0` — bail out explicitly.
                     */ if (index >= inputLength) break trie;
                }
                // FLAG13 without a value marks a compact run.
                if ((current & (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].VALUE_LENGTH | __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13)) === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13) {
                    const runLength = (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].BRANCH_LENGTH) >> 7;
                    // Check first char (stored in JUMP_TABLE bits).
                    if (input.charCodeAt(index) !== (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].JUMP_TABLE)) {
                        break;
                    }
                    index += 1;
                    // Check remaining characters (packed two per uint16 word).
                    const remaining = runLength - 1;
                    let wordIndex = nodeIndex + 1;
                    let charIndexInPacked = 0;
                    /*
                     * Process pairs: read one packed word, compare low byte then high byte.
                     * No explicit bounds check needed — charCodeAt returns NaN for OOB,
                     * which never equals an integer, so the mismatch break fires naturally.
                     */ for(; charIndexInPacked + 1 < remaining; charIndexInPacked += 2){
                        const packed = decodeTree[wordIndex];
                        if (input.charCodeAt(index) !== (packed & 0xff)) break trie;
                        index += 1;
                        if (input.charCodeAt(index) !== (packed >> 8 & 0xff)) break trie;
                        index += 1;
                        wordIndex += 1;
                    }
                    // Handle odd trailing char.
                    if (charIndexInPacked < remaining) {
                        if (input.charCodeAt(index) !== (decodeTree[wordIndex] & 0xff)) break;
                        index += 1;
                    }
                    nodeIndex += 1 + (runLength >> 1);
                    current = decodeTree[nodeIndex];
                    continue;
                }
                // Header plus out-of-line value words; 0 means no value.
                const valueLength = current >>> 14;
                const char = input.charCodeAt(index);
                /*
                 * Check current node for a value before navigating.
                 * This handles both: (a) values reached via compact runs on the
                 * previous iteration, and (b) values at regular branch targets.
                 */ if (valueLength !== 0) {
                    // If char is `;`, emit immediately.
                    if (char === CharCodes.SEMI) {
                        consumed = index - entityStart + 1;
                        // Inline leaves carry the value in the low 13 bits.
                        value = valueLength === 1 ? String.fromCharCode(current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].VALUE_MASK) : readTrieValue(decodeTree, nodeIndex, valueLength);
                        break;
                    }
                    // Record non-terminated (legacy) match (FLAG13 clear = semicolon optional).
                    if (!isStrict && (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13) === 0) {
                        consumed = index - entityStart;
                        bestNodeIndex = nodeIndex;
                        bestValueLength = valueLength;
                    }
                    /*
                     * A valueLength of 1 means the value is packed inline in the header
                     * word — these are always leaf nodes with no branches, so we can
                     * stop walking the trie.
                     */ // eslint-disable-next-line unicorn/no-break-in-nested-loop
                    if (valueLength === 1) break;
                }
                // Navigate to the next node (valueLength || 1: skip past value words, minimum 1 for header).
                const next = determineBranch(decodeTree, current, nodeIndex + (valueLength || 1), char);
                // eslint-disable-next-line unicorn/no-break-in-nested-loop
                if (next < 0) break;
                nodeIndex = next;
                current = decodeTree[nodeIndex];
                index += 1;
            }
            /*
             * Post-loop: if the semicolon path didn't set value,
             * check for a final legacy match. The last navigation may
             * have landed on a legacy node whose value hasn't been
             * recorded yet (loop exited before the top-of-loop check
             * could run).
             */ if (value === "") {
                const finalVL = current >>> 14;
                if (finalVL !== 0 && !isStrict && (current & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$internal$2f$bin$2d$trie$2d$flags$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BinTrieFlags"].FLAG13) === 0) {
                    consumed = index - entityStart;
                    bestNodeIndex = nodeIndex;
                    bestValueLength = finalVL;
                }
                if (consumed > 0) {
                    value = readTrieValue(decodeTree, bestNodeIndex, bestValueLength);
                }
            }
        } else {
            consumed = 0;
            value = "";
        }
        /*
         * The attribute end-char rule (HTML spec §13.2.5.73) only applies to
         * unterminated *named* references.  Semicolon-terminated entities and
         * numeric entities are always accepted, matching EntityDecoder behavior.
         *
         * When `attribute` is false (the common case), short-circuit skips all
         * the unterminated-named checks entirely.
         */ if (consumed === 0 || isAttribute && firstChar !== CharCodes.NUM && input.charCodeAt(entityStart + consumed - 1) !== CharCodes.SEMI && entityStart + consumed < inputLength && isEntityInAttributeInvalidEnd(input.charCodeAt(entityStart + consumed))) {
            // Rejected: leave `&` in the pending chunk, scan past it.
            offset = entityStart;
        } else {
            if (chunkStart < offset) {
                result += input.slice(chunkStart, offset);
            }
            result += value;
            offset = chunkStart = entityStart + consumed;
        }
        /*
         * Adjacent entities (`&x;&y;`) are common in entity-dense input;
         * checking the single character at `offset` first skips the
         * `indexOf` call (and its per-call overhead) for that case.
         */ if (input.charCodeAt(offset) !== CharCodes.AMP) {
            offset = input.indexOf("&", offset);
        }
    }while (offset >= 0)
    return result + input.slice(chunkStart);
}
function decodeHTML(htmlString, mode = DecodingMode.Legacy) {
    return decodeWithTrie(htmlString, mode === DecodingMode.Strict, mode === DecodingMode.Attribute);
}
function decodeHTMLAttribute(htmlAttribute) {
    return decodeWithTrie(htmlAttribute, false, true);
}
function decodeHTMLStrict(htmlString) {
    return decodeWithTrie(htmlString, true, false);
}
function decodeXML(xmlString) {
    let offset = xmlString.indexOf("&");
    if (offset < 0) return xmlString;
    let lastIndex = 0;
    let result = "";
    do {
        const start = offset + 1;
        let consumed = 0;
        let value = "";
        const c1 = xmlString.charCodeAt(start);
        if (c1 === CharCodes.NUM) {
            const packed = parseNumericEntity(xmlString, start, xmlString.length);
            consumed = unpackConsumed(packed);
            // XML is always strict — require semicolon.
            if (consumed === 0 || xmlString.charCodeAt(start + consumed - 1) !== CharCodes.SEMI) {
                consumed = 0;
            } else {
                const codePoint = packed & CODE_POINT_MASK;
                // Nonzero BMP values below the surrogate range need no replacement.
                value = codePoint - 1 >>> 0 < 0xd7_ff ? String.fromCharCode(codePoint) : String.fromCodePoint((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2d$codepoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["replaceCodePointXML"])(codePoint));
            }
        } else {
            /* eslint-disable unicorn/no-break-in-nested-loop -- Keep XML name dispatch inline with the decode loop. */ switch(c1){
                // &lt; / &gt;
                case 0x6c:
                case 0x67:
                    {
                        if (xmlString.charCodeAt(start + 1) === 0x74 && xmlString.charCodeAt(start + 2) === CharCodes.SEMI) {
                            consumed = 3;
                            value = c1 === 0x6c ? "<" : ">";
                        }
                        break;
                    }
                // &amp; / &apos;
                case 0x61:
                    {
                        const c2 = xmlString.charCodeAt(start + 1);
                        if (c2 === 0x6d && xmlString.charCodeAt(start + 2) === 0x70 && xmlString.charCodeAt(start + 3) === CharCodes.SEMI) {
                            consumed = 4;
                            value = "&";
                        } else if (c2 === 0x70 && xmlString.charCodeAt(start + 2) === 0x6f && xmlString.charCodeAt(start + 3) === 0x73 && xmlString.charCodeAt(start + 4) === CharCodes.SEMI) {
                            consumed = 5;
                            value = "'";
                        }
                        break;
                    }
                // &quot;
                case 0x71:
                    {
                        if (xmlString.charCodeAt(start + 1) === 0x75 && xmlString.charCodeAt(start + 2) === 0x6f && xmlString.charCodeAt(start + 3) === 0x74 && xmlString.charCodeAt(start + 4) === CharCodes.SEMI) {
                            consumed = 5;
                            value = '"';
                        }
                        break;
                    }
            }
        /* eslint-enable unicorn/no-break-in-nested-loop */ }
        if (consumed > 0) {
            if (lastIndex < offset) result += xmlString.slice(lastIndex, offset);
            result += value;
            offset = lastIndex = start + consumed;
        } else {
            offset = start;
        }
        /*
         * Adjacent entities (`&x;&y;`) are common in entity-dense input;
         * checking the single character at `lastIndex` first skips the
         * `indexOf` call (and its per-call overhead) for that case.
         */ offset = xmlString.charCodeAt(offset) === CharCodes.AMP ? offset : xmlString.indexOf("&", offset);
    }while (offset >= 0)
    return result + xmlString.slice(lastIndex);
}
;
;
;
}),
"[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/Tokenizer.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuoteType",
    ()=>QuoteType,
    "default",
    ()=>Tokenizer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/entities/dist/decode.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$generated$2f$decode$2d$data$2d$html$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/entities/dist/generated/decode-data-html.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$generated$2f$decode$2d$data$2d$xml$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/entities/dist/generated/decode-data-xml.js [app-ssr] (ecmascript)");
;
var CharCodes;
(function(CharCodes) {
    CharCodes[CharCodes["Tab"] = 9] = "Tab";
    CharCodes[CharCodes["NewLine"] = 10] = "NewLine";
    CharCodes[CharCodes["FormFeed"] = 12] = "FormFeed";
    CharCodes[CharCodes["CarriageReturn"] = 13] = "CarriageReturn";
    CharCodes[CharCodes["Space"] = 32] = "Space";
    CharCodes[CharCodes["ExclamationMark"] = 33] = "ExclamationMark";
    CharCodes[CharCodes["Number"] = 35] = "Number";
    CharCodes[CharCodes["Amp"] = 38] = "Amp";
    CharCodes[CharCodes["SingleQuote"] = 39] = "SingleQuote";
    CharCodes[CharCodes["DoubleQuote"] = 34] = "DoubleQuote";
    CharCodes[CharCodes["Dash"] = 45] = "Dash";
    CharCodes[CharCodes["Slash"] = 47] = "Slash";
    CharCodes[CharCodes["Zero"] = 48] = "Zero";
    CharCodes[CharCodes["Nine"] = 57] = "Nine";
    CharCodes[CharCodes["Semi"] = 59] = "Semi";
    CharCodes[CharCodes["Lt"] = 60] = "Lt";
    CharCodes[CharCodes["Eq"] = 61] = "Eq";
    CharCodes[CharCodes["Gt"] = 62] = "Gt";
    CharCodes[CharCodes["Questionmark"] = 63] = "Questionmark";
    CharCodes[CharCodes["UpperA"] = 65] = "UpperA";
    CharCodes[CharCodes["LowerA"] = 97] = "LowerA";
    CharCodes[CharCodes["UpperF"] = 70] = "UpperF";
    CharCodes[CharCodes["LowerF"] = 102] = "LowerF";
    CharCodes[CharCodes["UpperZ"] = 90] = "UpperZ";
    CharCodes[CharCodes["LowerZ"] = 122] = "LowerZ";
    CharCodes[CharCodes["LowerX"] = 120] = "LowerX";
    CharCodes[CharCodes["OpeningSquareBracket"] = 91] = "OpeningSquareBracket";
})(CharCodes || (CharCodes = {}));
/** All the states the tokenizer can be in. */ var State;
(function(State) {
    State[State["Text"] = 1] = "Text";
    State[State["BeforeTagName"] = 2] = "BeforeTagName";
    State[State["InTagName"] = 3] = "InTagName";
    State[State["InSelfClosingTag"] = 4] = "InSelfClosingTag";
    State[State["BeforeClosingTagName"] = 5] = "BeforeClosingTagName";
    State[State["InClosingTagName"] = 6] = "InClosingTagName";
    State[State["AfterClosingTagName"] = 7] = "AfterClosingTagName";
    // Attributes
    State[State["BeforeAttributeName"] = 8] = "BeforeAttributeName";
    State[State["InAttributeName"] = 9] = "InAttributeName";
    State[State["AfterAttributeName"] = 10] = "AfterAttributeName";
    State[State["BeforeAttributeValue"] = 11] = "BeforeAttributeValue";
    State[State["InAttributeValueDq"] = 12] = "InAttributeValueDq";
    State[State["InAttributeValueSq"] = 13] = "InAttributeValueSq";
    State[State["InAttributeValueNq"] = 14] = "InAttributeValueNq";
    // Declarations
    State[State["BeforeDeclaration"] = 15] = "BeforeDeclaration";
    State[State["InDeclaration"] = 16] = "InDeclaration";
    // Processing instructions
    State[State["InProcessingInstruction"] = 17] = "InProcessingInstruction";
    // Comments & CDATA
    State[State["BeforeComment"] = 18] = "BeforeComment";
    State[State["CDATASequence"] = 19] = "CDATASequence";
    State[State["DeclarationSequence"] = 20] = "DeclarationSequence";
    State[State["InSpecialComment"] = 21] = "InSpecialComment";
    State[State["InCommentLike"] = 22] = "InCommentLike";
    // Special tags
    State[State["SpecialStartSequence"] = 23] = "SpecialStartSequence";
    State[State["InSpecialTag"] = 24] = "InSpecialTag";
    State[State["InPlainText"] = 25] = "InPlainText";
    State[State["InEntity"] = 26] = "InEntity";
})(State || (State = {}));
function isWhitespace(c) {
    return c === CharCodes.Space || c === CharCodes.NewLine || c === CharCodes.Tab || c === CharCodes.FormFeed || c === CharCodes.CarriageReturn;
}
function isEndOfTagSection(c) {
    return c === CharCodes.Slash || c === CharCodes.Gt || isWhitespace(c);
}
function isASCIIAlpha(c) {
    return c >= CharCodes.LowerA && c <= CharCodes.LowerZ || c >= CharCodes.UpperA && c <= CharCodes.UpperZ;
}
var QuoteType;
(function(QuoteType) {
    QuoteType[QuoteType["NoValue"] = 0] = "NoValue";
    QuoteType[QuoteType["Unquoted"] = 1] = "Unquoted";
    QuoteType[QuoteType["Single"] = 2] = "Single";
    QuoteType[QuoteType["Double"] = 3] = "Double";
})(QuoteType || (QuoteType = {}));
/**
 * Sequences used to match longer strings.
 *
 * We don't have `Script`, `Style`, or `Title` here. Instead, we re-use the *End
 * sequences with an increased offset.
 */ const Sequences = {
    Empty: new Uint8Array(0),
    Cdata: new Uint8Array([
        0x43,
        0x44,
        0x41,
        0x54,
        0x41,
        0x5b
    ]),
    CdataEnd: new Uint8Array([
        0x5d,
        0x5d,
        0x3e
    ]),
    CommentEnd: new Uint8Array([
        0x2d,
        0x2d,
        0x21,
        0x3e
    ]),
    Doctype: new Uint8Array([
        0x64,
        0x6f,
        0x63,
        0x74,
        0x79,
        0x70,
        0x65
    ]),
    IframeEnd: new Uint8Array([
        0x3c,
        0x2f,
        0x69,
        0x66,
        0x72,
        0x61,
        0x6d,
        0x65
    ]),
    NoembedEnd: new Uint8Array([
        0x3c,
        0x2f,
        0x6e,
        0x6f,
        0x65,
        0x6d,
        0x62,
        0x65,
        0x64
    ]),
    NoframesEnd: new Uint8Array([
        0x3c,
        0x2f,
        0x6e,
        0x6f,
        0x66,
        0x72,
        0x61,
        0x6d,
        0x65,
        0x73
    ]),
    Plaintext: new Uint8Array([
        0x3c,
        0x2f,
        0x70,
        0x6c,
        0x61,
        0x69,
        0x6e,
        0x74,
        0x65,
        0x78,
        0x74
    ]),
    ScriptEnd: new Uint8Array([
        0x3c,
        0x2f,
        0x73,
        0x63,
        0x72,
        0x69,
        0x70,
        0x74
    ]),
    StyleEnd: new Uint8Array([
        0x3c,
        0x2f,
        0x73,
        0x74,
        0x79,
        0x6c,
        0x65
    ]),
    TitleEnd: new Uint8Array([
        0x3c,
        0x2f,
        0x74,
        0x69,
        0x74,
        0x6c,
        0x65
    ]),
    TextareaEnd: new Uint8Array([
        0x3c,
        0x2f,
        0x74,
        0x65,
        0x78,
        0x74,
        0x61,
        0x72,
        0x65,
        0x61
    ]),
    XmpEnd: new Uint8Array([
        0x3c,
        0x2f,
        0x78,
        0x6d,
        0x70
    ])
};
/**
 * Maps the first lowercase character of an HTML tag name to the sequence
 * used for special-tag detection.  All sequences share a common layout
 * where index 2 is the first tag-name character, so matching always
 * continues from offset 3.
 */ const specialStartSequences = new Map([
    [
        Sequences.IframeEnd[2],
        Sequences.IframeEnd
    ],
    [
        Sequences.NoembedEnd[2],
        Sequences.NoembedEnd
    ],
    [
        Sequences.Plaintext[2],
        Sequences.Plaintext
    ],
    [
        Sequences.ScriptEnd[2],
        Sequences.ScriptEnd
    ],
    [
        Sequences.TitleEnd[2],
        Sequences.TitleEnd
    ],
    [
        Sequences.XmpEnd[2],
        Sequences.XmpEnd
    ]
]);
class Tokenizer {
    cbs;
    /** The current state the tokenizer is in. */ state = State.Text;
    /** The read buffer. */ buffer = "";
    /** The beginning of the section that is currently being read. */ sectionStart = 0;
    /** The index within the buffer that we are currently looking at. */ index = 0;
    /** The start of the last entity. */ entityStart = 0;
    /** Some behavior, eg. when decoding entities, is done while we are in another state. This keeps track of the other state type. */ baseState = State.Text;
    /** For special parsing behavior inside of script and style tags. */ isSpecial = false;
    /** Indicates whether the tokenizer has been paused. */ running = true;
    /** The offset of the current buffer. */ offset = 0;
    xmlMode;
    decodeEntities;
    recognizeSelfClosing;
    entityDecoder;
    constructor({ xmlMode = false, decodeEntities = true, recognizeSelfClosing = xmlMode }, cbs){
        this.cbs = cbs;
        this.xmlMode = xmlMode;
        this.decodeEntities = decodeEntities;
        this.recognizeSelfClosing = recognizeSelfClosing;
        this.entityDecoder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EntityDecoder"](xmlMode ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$generated$2f$decode$2d$data$2d$xml$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["xmlDecodeTree"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$generated$2f$decode$2d$data$2d$html$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["htmlDecodeTree"], (cp, consumed)=>this.emitCodePoint(cp, consumed));
    }
    reset() {
        this.state = State.Text;
        this.buffer = "";
        this.sectionStart = 0;
        this.index = 0;
        this.baseState = State.Text;
        this.isSpecial = false;
        this.currentSequence = Sequences.Empty;
        this.sequenceIndex = 0;
        this.running = true;
        this.offset = 0;
    }
    write(chunk) {
        this.offset += this.buffer.length;
        this.buffer = chunk;
        this.parse();
    }
    end() {
        if (this.running) this.finish();
    }
    pause() {
        this.running = false;
    }
    resume() {
        this.running = true;
        if (this.index < this.buffer.length + this.offset) {
            this.parse();
        }
    }
    stateText(c) {
        if (c === CharCodes.Lt || !this.decodeEntities && this.fastForwardTo(CharCodes.Lt)) {
            if (this.index > this.sectionStart) {
                this.cbs.ontext(this.sectionStart, this.index);
            }
            this.state = State.BeforeTagName;
            this.sectionStart = this.index;
        } else if (this.decodeEntities && c === CharCodes.Amp) {
            this.startEntity();
        }
    }
    currentSequence = Sequences.Empty;
    sequenceIndex = 0;
    enterTagBody() {
        if (this.currentSequence === Sequences.Plaintext) {
            this.currentSequence = Sequences.Empty;
            this.state = State.InPlainText;
        } else if (this.isSpecial) {
            this.state = State.InSpecialTag;
            this.sequenceIndex = 0;
        } else {
            this.state = State.Text;
        }
    }
    /**
     * Match the opening tag name against an HTML text-only tag sequence.
     *
     * Some tags share an initial prefix (`script`/`style`, `title`/`textarea`,
     * `noembed`/`noframes`), so we may switch to an alternate sequence at the
     * first distinguishing byte.  On a successful full match we fall back to
     * the normal tag-name state; a later `>` will enter raw-text, RCDATA, or
     * plaintext mode based on `currentSequence` / `isSpecial`.
     * @param c Current character code point.
     */ stateSpecialStartSequence(c) {
        const lower = c | 0x20;
        // Still matching — check for an alternate sequence at branch points.
        if (this.sequenceIndex < this.currentSequence.length) {
            if (lower === this.currentSequence[this.sequenceIndex]) {
                this.sequenceIndex++;
                return;
            }
            if (this.sequenceIndex === 3) {
                if (this.currentSequence === Sequences.ScriptEnd && lower === Sequences.StyleEnd[3]) {
                    this.currentSequence = Sequences.StyleEnd;
                    this.sequenceIndex = 4;
                    return;
                }
                if (this.currentSequence === Sequences.TitleEnd && lower === Sequences.TextareaEnd[3]) {
                    this.currentSequence = Sequences.TextareaEnd;
                    this.sequenceIndex = 4;
                    return;
                }
            } else if (this.sequenceIndex === 4 && this.currentSequence === Sequences.NoembedEnd && lower === Sequences.NoframesEnd[4]) {
                this.currentSequence = Sequences.NoframesEnd;
                this.sequenceIndex = 5;
                return;
            }
        } else if (isEndOfTagSection(c)) {
            // Full match on a valid tag boundary — keep the sequence.
            this.sequenceIndex = 0;
            this.state = State.InTagName;
            this.stateInTagName(c);
            return;
        }
        // No match — abandon special-tag detection.
        this.isSpecial = false;
        this.currentSequence = Sequences.Empty;
        this.sequenceIndex = 0;
        this.state = State.InTagName;
        this.stateInTagName(c);
    }
    stateCDATASequence(c) {
        if (c === Sequences.Cdata[this.sequenceIndex]) {
            if (++this.sequenceIndex === Sequences.Cdata.length) {
                this.state = State.InCommentLike;
                this.currentSequence = Sequences.CdataEnd;
                this.sequenceIndex = 0;
                this.sectionStart = this.index + 1;
            }
        } else {
            this.sequenceIndex = 0;
            if (this.xmlMode) {
                this.state = State.InDeclaration;
                this.stateInDeclaration(c); // Reconsume the character
            } else {
                this.state = State.InSpecialComment;
                this.stateInSpecialComment(c); // Reconsume the character
            }
        }
    }
    /**
     * When we wait for one specific character, we can speed things up
     * by skipping through the buffer until we find it.
     * @param c Current character code point.
     * @returns Whether the character was found.
     */ fastForwardTo(c) {
        while(++this.index < this.buffer.length + this.offset){
            if (this.buffer.charCodeAt(this.index - this.offset) === c) {
                return true;
            }
        }
        /*
         * We increment the index at the end of the `parse` loop,
         * so set it to `buffer.length - 1` here.
         *
         * TODO: Refactor `parse` to increment index before calling states.
         */ this.index = this.buffer.length + this.offset - 1;
        return false;
    }
    /**
     * Emit a comment token and return to the text state.
     * @param offset Number of characters in the end sequence that have already been matched.
     */ emitComment(offset) {
        this.cbs.oncomment(this.sectionStart, this.index, offset);
        this.sequenceIndex = 0;
        this.sectionStart = this.index + 1;
        this.state = State.Text;
    }
    /**
     * Comments and CDATA end with `-->` and `]]>`.
     *
     * Their common qualities are:
     * - Their end sequences have a distinct character they start with.
     * - That character is then repeated, so we have to check multiple repeats.
     * - All characters but the start character of the sequence can be skipped.
     * @param c Current character code point.
     */ stateInCommentLike(c) {
        if (!this.xmlMode && this.currentSequence === Sequences.CommentEnd && this.sequenceIndex <= 1 && /*
             * We're still at the very start of the comment: the only
             * characters consumed since `<!--` are the dashes that
             * advanced sequenceIndex (0 for `<!-->`, 1 for `<!--->`).
             */ this.index === this.sectionStart + this.sequenceIndex && c === CharCodes.Gt) {
            // Abruptly closed empty HTML comment.
            this.emitComment(this.sequenceIndex);
        } else if (this.currentSequence === Sequences.CommentEnd && this.sequenceIndex === 2 && c === CharCodes.Gt) {
            // `!` is optional here, so the same sequence also accepts `-->`.
            this.emitComment(2);
        } else if (this.currentSequence === Sequences.CommentEnd && this.sequenceIndex === this.currentSequence.length - 1 && c !== CharCodes.Gt) {
            this.sequenceIndex = Number(c === CharCodes.Dash);
        } else if (c === this.currentSequence[this.sequenceIndex]) {
            if (++this.sequenceIndex === this.currentSequence.length) {
                if (this.currentSequence === Sequences.CdataEnd) {
                    this.cbs.oncdata(this.sectionStart, this.index, 2);
                } else {
                    this.cbs.oncomment(this.sectionStart, this.index, 3);
                }
                this.sequenceIndex = 0;
                this.sectionStart = this.index + 1;
                this.state = State.Text;
            }
        } else if (this.sequenceIndex === 0) {
            // Fast-forward to the first character of the sequence
            if (this.fastForwardTo(this.currentSequence[0])) {
                this.sequenceIndex = 1;
            }
        } else if (c !== this.currentSequence[this.sequenceIndex - 1]) {
            // Allow long sequences, eg. --->, ]]]>
            this.sequenceIndex = 0;
        }
    }
    /**
     * HTML only allows ASCII alpha characters (a-z and A-Z) at the beginning of a tag name.
     *
     * XML allows a lot more characters here (@see https://www.w3.org/TR/REC-xml/#NT-NameStartChar).
     * We allow anything that wouldn't end the tag.
     * @param c Current character code point.
     */ isTagStartChar(c) {
        return this.xmlMode ? !isEndOfTagSection(c) : isASCIIAlpha(c);
    }
    /**
     * Scan raw-text / RCDATA content for the matching end tag.
     *
     * For RCDATA tags (`<title>`, `<textarea>`) entities are decoded inline.
     * For raw-text tags (`<script>`, `<style>`, etc.) we fast-forward to `<`.
     * @param c Current character code point.
     */ stateInSpecialTag(c) {
        if (this.sequenceIndex === this.currentSequence.length) {
            if (isEndOfTagSection(c)) {
                const endOfText = this.index - this.currentSequence.length;
                if (this.sectionStart < endOfText) {
                    // Spoof the index so that reported locations match up.
                    const actualIndex = this.index;
                    this.index = endOfText;
                    this.cbs.ontext(this.sectionStart, endOfText);
                    this.index = actualIndex;
                }
                this.isSpecial = false;
                this.sectionStart = endOfText + 2; // Skip over the `</`
                this.stateInClosingTagName(c);
                return; // We are done; skip the rest of the function.
            }
            this.sequenceIndex = 0;
        }
        if ((c | 0x20) === this.currentSequence[this.sequenceIndex]) {
            this.sequenceIndex += 1;
        } else if (this.sequenceIndex === 0) {
            if (this.currentSequence === Sequences.TitleEnd || this.currentSequence === Sequences.TextareaEnd) {
                // RCDATA tags have to parse entities while still looking for their end tag.
                if (this.decodeEntities && c === CharCodes.Amp) {
                    this.startEntity();
                }
            } else if (this.fastForwardTo(CharCodes.Lt)) {
                // Outside of RCDATA tags, we can fast-forward.
                this.sequenceIndex = 1;
            }
        } else {
            // If we see a `<`, set the sequence index to 1; useful for eg. `<</script>`.
            this.sequenceIndex = Number(c === CharCodes.Lt);
        }
    }
    stateBeforeTagName(c) {
        if (c === CharCodes.ExclamationMark) {
            this.state = State.BeforeDeclaration;
            this.sectionStart = this.index + 1;
        } else if (c === CharCodes.Questionmark) {
            if (this.xmlMode) {
                this.state = State.InProcessingInstruction;
                this.sequenceIndex = 0;
                this.sectionStart = this.index + 1;
            } else {
                this.state = State.InSpecialComment;
                this.sectionStart = this.index;
            }
        } else if (this.isTagStartChar(c)) {
            this.sectionStart = this.index;
            const special = this.xmlMode || this.cbs.isInForeignContext?.() ? undefined : specialStartSequences.get(c | 0x20);
            if (special === undefined) {
                this.state = State.InTagName;
            } else {
                this.isSpecial = true;
                this.currentSequence = special;
                this.sequenceIndex = 3;
                this.state = State.SpecialStartSequence;
            }
        } else if (c === CharCodes.Slash) {
            this.state = State.BeforeClosingTagName;
        } else {
            this.state = State.Text;
            this.stateText(c);
        }
    }
    stateInTagName(c) {
        if (isEndOfTagSection(c)) {
            this.cbs.onopentagname(this.sectionStart, this.index);
            this.sectionStart = -1;
            this.state = State.BeforeAttributeName;
            this.stateBeforeAttributeName(c);
        }
    }
    stateBeforeClosingTagName(c) {
        if (isWhitespace(c)) {
            if (this.xmlMode) {
            // Ignore
            } else {
                this.state = State.InSpecialComment;
                this.sectionStart = this.index;
            }
        } else if (c === CharCodes.Gt) {
            this.state = State.Text;
            if (!this.xmlMode) {
                this.sectionStart = this.index + 1;
            }
        } else {
            this.state = this.isTagStartChar(c) ? State.InClosingTagName : State.InSpecialComment;
            this.sectionStart = this.index;
        }
    }
    stateInClosingTagName(c) {
        if (isEndOfTagSection(c)) {
            this.cbs.onclosetag(this.sectionStart, this.index);
            this.sectionStart = -1;
            this.state = State.AfterClosingTagName;
            this.stateAfterClosingTagName(c);
        }
    }
    stateAfterClosingTagName(c) {
        // Skip everything until ">"
        if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
            this.state = State.Text;
            this.sectionStart = this.index + 1;
        }
    }
    stateBeforeAttributeName(c) {
        if (c === CharCodes.Gt) {
            this.cbs.onopentagend(this.index);
            this.enterTagBody();
            this.sectionStart = this.index + 1;
        } else if (c === CharCodes.Slash) {
            this.state = State.InSelfClosingTag;
        } else if (!isWhitespace(c)) {
            this.state = State.InAttributeName;
            this.sectionStart = this.index;
        }
    }
    /**
     * Handle `/` before `>` in an opening tag.
     *
     * In HTML mode, text-only tags ignore the self-closing flag and still enter
     * their raw-text/RCDATA/plaintext state unless self-closing tags are being
     * recognized. In XML mode, or for ordinary tags, the tokenizer returns to
     * regular text parsing after emitting the self-closing callback.
     * @param c Current character code point.
     */ stateInSelfClosingTag(c) {
        if (c === CharCodes.Gt) {
            this.cbs.onselfclosingtag(this.index);
            this.sectionStart = this.index + 1;
            if (!this.recognizeSelfClosing) {
                this.enterTagBody();
                return;
            }
            this.state = State.Text;
            this.isSpecial = false; // Reset special state, in case of self-closing special tags
            this.currentSequence = Sequences.Empty;
        } else if (!isWhitespace(c)) {
            this.state = State.BeforeAttributeName;
            this.stateBeforeAttributeName(c);
        }
    }
    stateInAttributeName(c) {
        if (c === CharCodes.Eq || isEndOfTagSection(c)) {
            this.cbs.onattribname(this.sectionStart, this.index);
            this.sectionStart = this.index;
            this.state = State.AfterAttributeName;
            this.stateAfterAttributeName(c);
        }
    }
    stateAfterAttributeName(c) {
        if (c === CharCodes.Eq) {
            this.state = State.BeforeAttributeValue;
        } else if (c === CharCodes.Slash || c === CharCodes.Gt) {
            this.cbs.onattribend(QuoteType.NoValue, this.sectionStart);
            this.sectionStart = -1;
            this.state = State.BeforeAttributeName;
            this.stateBeforeAttributeName(c);
        } else if (!isWhitespace(c)) {
            this.cbs.onattribend(QuoteType.NoValue, this.sectionStart);
            this.state = State.InAttributeName;
            this.sectionStart = this.index;
        }
    }
    stateBeforeAttributeValue(c) {
        if (c === CharCodes.DoubleQuote) {
            this.state = State.InAttributeValueDq;
            this.sectionStart = this.index + 1;
        } else if (c === CharCodes.SingleQuote) {
            this.state = State.InAttributeValueSq;
            this.sectionStart = this.index + 1;
        } else if (!isWhitespace(c)) {
            this.sectionStart = this.index;
            this.state = State.InAttributeValueNq;
            this.stateInAttributeValueNoQuotes(c); // Reconsume token
        }
    }
    handleInAttributeValue(c, quote) {
        if (c === quote || !this.decodeEntities && this.fastForwardTo(quote)) {
            this.cbs.onattribdata(this.sectionStart, this.index);
            this.sectionStart = -1;
            this.cbs.onattribend(quote === CharCodes.DoubleQuote ? QuoteType.Double : QuoteType.Single, this.index + 1);
            this.state = State.BeforeAttributeName;
        } else if (this.decodeEntities && c === CharCodes.Amp) {
            this.startEntity();
        }
    }
    stateInAttributeValueDoubleQuotes(c) {
        this.handleInAttributeValue(c, CharCodes.DoubleQuote);
    }
    stateInAttributeValueSingleQuotes(c) {
        this.handleInAttributeValue(c, CharCodes.SingleQuote);
    }
    stateInAttributeValueNoQuotes(c) {
        if (isWhitespace(c) || c === CharCodes.Gt) {
            this.cbs.onattribdata(this.sectionStart, this.index);
            this.sectionStart = -1;
            this.cbs.onattribend(QuoteType.Unquoted, this.index);
            this.state = State.BeforeAttributeName;
            this.stateBeforeAttributeName(c);
        } else if (this.decodeEntities && c === CharCodes.Amp) {
            this.startEntity();
        }
    }
    /**
     * Distinguish between CDATA, declarations, HTML comments, and HTML bogus
     * comments after `<!`.
     *
     * In HTML mode, only real comments and doctypes stay on declaration paths;
     * everything else becomes a bogus comment terminated by the next `>`.
     * @param c Current character code point.
     */ stateBeforeDeclaration(c) {
        if (c === CharCodes.OpeningSquareBracket) {
            this.state = State.CDATASequence;
            this.sequenceIndex = 0;
        } else if (this.xmlMode) {
            this.state = c === CharCodes.Dash ? State.BeforeComment : State.InDeclaration;
        } else if ((c | 0x20) === Sequences.Doctype[0]) {
            this.state = State.DeclarationSequence;
            this.currentSequence = Sequences.Doctype;
            this.sequenceIndex = 1;
        } else if (c === CharCodes.Gt) {
            this.cbs.oncomment(this.sectionStart, this.index, 0);
            this.state = State.Text;
            this.sectionStart = this.index + 1;
        } else if (c === CharCodes.Dash) {
            this.state = State.BeforeComment;
        } else {
            this.state = State.InSpecialComment;
        }
    }
    /**
     * Continue matching `doctype` after `<!d`.
     *
     * A full `doctype` match stays on the declaration path; any other name falls
     * back to an HTML bogus comment, which matches browser behavior for
     * non-doctype `<!...>` constructs.
     * @param c Current character code point.
     */ stateDeclarationSequence(c) {
        if (this.sequenceIndex === this.currentSequence.length) {
            this.state = State.InDeclaration;
            this.stateInDeclaration(c);
        } else if ((c | 0x20) === this.currentSequence[this.sequenceIndex]) {
            this.sequenceIndex += 1;
        } else if (c === CharCodes.Gt) {
            this.cbs.oncomment(this.sectionStart, this.index, 0);
            this.state = State.Text;
            this.sectionStart = this.index + 1;
        } else {
            this.state = State.InSpecialComment;
        }
    }
    stateInDeclaration(c) {
        if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
            this.cbs.ondeclaration(this.sectionStart, this.index);
            this.state = State.Text;
            this.sectionStart = this.index + 1;
        }
    }
    /**
     * XML processing instructions (`<?...?>`).
     *
     * In HTML mode `<?` is routed to `InSpecialComment` instead, so this
     * state is only reachable in XML mode.
     * @param c Current character code point.
     */ stateInProcessingInstruction(c) {
        if (c === CharCodes.Questionmark) {
            // Remember that we just consumed `?`, so the next `>` closes the PI.
            this.sequenceIndex = 1;
        } else if (c === CharCodes.Gt && this.sequenceIndex === 1) {
            this.cbs.onprocessinginstruction(this.sectionStart, this.index - 1);
            this.sequenceIndex = 0;
            this.state = State.Text;
            this.sectionStart = this.index + 1;
        } else {
            // Keep scanning for the next `?`, which can start a closing `?>`.
            this.sequenceIndex = Number(this.fastForwardTo(CharCodes.Questionmark));
        }
    }
    stateBeforeComment(c) {
        if (c === CharCodes.Dash) {
            this.state = State.InCommentLike;
            this.currentSequence = Sequences.CommentEnd;
            this.sequenceIndex = 0;
            this.sectionStart = this.index + 1;
        } else if (this.xmlMode) {
            this.state = State.InDeclaration;
        } else if (c === CharCodes.Gt) {
            this.cbs.oncomment(this.sectionStart, this.index, 0);
            this.state = State.Text;
            this.sectionStart = this.index + 1;
        } else {
            this.state = State.InSpecialComment;
        }
    }
    stateInSpecialComment(c) {
        if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
            this.cbs.oncomment(this.sectionStart, this.index, 0);
            this.state = State.Text;
            this.sectionStart = this.index + 1;
        }
    }
    startEntity() {
        this.baseState = this.state;
        this.state = State.InEntity;
        this.entityStart = this.index;
        this.entityDecoder.startEntity(this.xmlMode ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DecodingMode"].Strict : this.baseState === State.Text || this.baseState === State.InSpecialTag ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DecodingMode"].Legacy : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$decode$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DecodingMode"].Attribute);
    }
    stateInEntity() {
        const indexInBuffer = this.index - this.offset;
        const length = this.entityDecoder.write(this.buffer, indexInBuffer);
        // If `length` is positive, we are done with the entity.
        if (length >= 0) {
            this.state = this.baseState;
            if (length === 0) {
                this.index -= 1;
            }
        } else {
            if (indexInBuffer < this.buffer.length && this.buffer.charCodeAt(indexInBuffer) === CharCodes.Amp) {
                this.state = this.baseState;
                this.index -= 1;
                return;
            }
            // Mark buffer as consumed.
            this.index = this.offset + this.buffer.length - 1;
        }
    }
    /**
     * Remove data that has already been consumed from the buffer.
     */ cleanup() {
        // If we are inside of text or attributes, emit what we already have.
        if (this.running && this.sectionStart !== this.index) {
            if (this.state === State.Text || this.state === State.InPlainText || this.state === State.InSpecialTag && this.sequenceIndex === 0) {
                this.cbs.ontext(this.sectionStart, this.index);
                this.sectionStart = this.index;
            } else if (this.state === State.InAttributeValueDq || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueNq) {
                this.cbs.onattribdata(this.sectionStart, this.index);
                this.sectionStart = this.index;
            }
        }
    }
    shouldContinue() {
        return this.index < this.buffer.length + this.offset && this.running;
    }
    /**
     * Iterates through the buffer, calling the function corresponding to the current state.
     *
     * States that are more likely to be hit are higher up, as a performance improvement.
     */ parse() {
        while(this.shouldContinue()){
            const c = this.buffer.charCodeAt(this.index - this.offset);
            switch(this.state){
                case State.Text:
                    {
                        this.stateText(c);
                        break;
                    }
                case State.InPlainText:
                    {
                        // Skip to end of buffer; cleanup() emits the text.
                        this.index = this.buffer.length + this.offset - 1;
                        break;
                    }
                case State.SpecialStartSequence:
                    {
                        this.stateSpecialStartSequence(c);
                        break;
                    }
                case State.InSpecialTag:
                    {
                        this.stateInSpecialTag(c);
                        break;
                    }
                case State.CDATASequence:
                    {
                        this.stateCDATASequence(c);
                        break;
                    }
                case State.DeclarationSequence:
                    {
                        this.stateDeclarationSequence(c);
                        break;
                    }
                case State.InAttributeValueDq:
                    {
                        this.stateInAttributeValueDoubleQuotes(c);
                        break;
                    }
                case State.InAttributeName:
                    {
                        this.stateInAttributeName(c);
                        break;
                    }
                case State.InCommentLike:
                    {
                        this.stateInCommentLike(c);
                        break;
                    }
                case State.InSpecialComment:
                    {
                        this.stateInSpecialComment(c);
                        break;
                    }
                case State.BeforeAttributeName:
                    {
                        this.stateBeforeAttributeName(c);
                        break;
                    }
                case State.InTagName:
                    {
                        this.stateInTagName(c);
                        break;
                    }
                case State.InClosingTagName:
                    {
                        this.stateInClosingTagName(c);
                        break;
                    }
                case State.BeforeTagName:
                    {
                        this.stateBeforeTagName(c);
                        break;
                    }
                case State.AfterAttributeName:
                    {
                        this.stateAfterAttributeName(c);
                        break;
                    }
                case State.InAttributeValueSq:
                    {
                        this.stateInAttributeValueSingleQuotes(c);
                        break;
                    }
                case State.BeforeAttributeValue:
                    {
                        this.stateBeforeAttributeValue(c);
                        break;
                    }
                case State.BeforeClosingTagName:
                    {
                        this.stateBeforeClosingTagName(c);
                        break;
                    }
                case State.AfterClosingTagName:
                    {
                        this.stateAfterClosingTagName(c);
                        break;
                    }
                case State.InAttributeValueNq:
                    {
                        this.stateInAttributeValueNoQuotes(c);
                        break;
                    }
                case State.InSelfClosingTag:
                    {
                        this.stateInSelfClosingTag(c);
                        break;
                    }
                case State.InDeclaration:
                    {
                        this.stateInDeclaration(c);
                        break;
                    }
                case State.BeforeDeclaration:
                    {
                        this.stateBeforeDeclaration(c);
                        break;
                    }
                case State.BeforeComment:
                    {
                        this.stateBeforeComment(c);
                        break;
                    }
                case State.InProcessingInstruction:
                    {
                        this.stateInProcessingInstruction(c);
                        break;
                    }
                case State.InEntity:
                    {
                        this.stateInEntity();
                        break;
                    }
            }
            this.index++;
        }
        this.cleanup();
    }
    finish() {
        if (this.state === State.InEntity) {
            this.entityDecoder.end();
            this.state = this.baseState;
        }
        this.handleTrailingData();
        this.cbs.onend();
    }
    handleTrailingCommentLikeData(endIndex) {
        if (this.state !== State.InCommentLike) {
            return false;
        }
        if (this.currentSequence === Sequences.CdataEnd) {
            if (this.xmlMode) {
                if (this.sectionStart < endIndex) {
                    this.cbs.oncdata(this.sectionStart, endIndex, 0);
                }
            } else {
                /* In HTML mode, unclosed CDATA is a bogus comment. */ const cdataStart = this.sectionStart - Sequences.Cdata.length - 1;
                this.cbs.oncomment(cdataStart, endIndex, 0);
            }
        } else {
            const offset = this.xmlMode ? 0 : Math.min(this.sequenceIndex, Sequences.CommentEnd.length - 1);
            this.cbs.oncomment(this.sectionStart, endIndex, offset);
        }
        return true;
    }
    handleTrailingMarkupDeclaration(endIndex) {
        if (this.xmlMode) {
            switch(this.state){
                case State.InSpecialComment:
                case State.BeforeComment:
                case State.CDATASequence:
                case State.DeclarationSequence:
                case State.InDeclaration:
                    {
                        this.cbs.ontext(this.sectionStart, endIndex);
                        return true;
                    }
                default:
                    {
                        return false;
                    }
            }
        }
        switch(this.state){
            case State.BeforeDeclaration:
            case State.InSpecialComment:
            case State.BeforeComment:
            case State.CDATASequence:
                {
                    this.cbs.oncomment(this.sectionStart, endIndex, 0);
                    return true;
                }
            case State.DeclarationSequence:
                {
                    if (this.sequenceIndex !== Sequences.Doctype.length) {
                        this.cbs.oncomment(this.sectionStart, endIndex, 0);
                    }
                    return true;
                }
            case State.InDeclaration:
                {
                    return true;
                }
            default:
                {
                    return false;
                }
        }
    }
    /** Handle any trailing data. */ handleTrailingData() {
        const endIndex = this.buffer.length + this.offset;
        if (this.handleTrailingCommentLikeData(endIndex) || this.handleTrailingMarkupDeclaration(endIndex)) {
            return;
        }
        // If there is no remaining data, we are done.
        if (this.sectionStart >= endIndex) {
            return;
        }
        switch(this.state){
            case State.InTagName:
            case State.BeforeAttributeName:
            case State.BeforeAttributeValue:
            case State.AfterAttributeName:
            case State.InAttributeName:
            case State.InAttributeValueSq:
            case State.InAttributeValueDq:
            case State.InAttributeValueNq:
            case State.InClosingTagName:
                {
                    break;
                }
            default:
                {
                    this.cbs.ontext(this.sectionStart, endIndex);
                }
        }
    }
    emitCodePoint(cp, consumed) {
        if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) {
            if (this.sectionStart < this.entityStart) {
                this.cbs.onattribdata(this.sectionStart, this.entityStart);
            }
            this.sectionStart = this.entityStart + consumed;
            this.index = this.sectionStart - 1;
            this.cbs.onattribentity(cp);
        } else {
            if (this.sectionStart < this.entityStart) {
                this.cbs.ontext(this.sectionStart, this.entityStart);
            }
            this.sectionStart = this.entityStart + consumed;
            this.index = this.sectionStart - 1;
            this.cbs.ontextentity(cp, this.sectionStart);
        }
    }
}
}),
"[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/Parser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Parser",
    ()=>Parser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Tokenizer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/Tokenizer.js [app-ssr] (ecmascript)");
const { fromCodePoint } = String;
;
const formTags = new Set([
    "input",
    "option",
    "optgroup",
    "select",
    "button",
    "datalist",
    "textarea"
]);
const pTag = new Set([
    "p"
]);
const headingTags = new Set([
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p"
]);
const tableSectionTags = new Set([
    "thead",
    "tbody"
]);
const ddtTags = new Set([
    "dd",
    "dt"
]);
const rtpTags = new Set([
    "rt",
    "rp"
]);
const openImpliesClose = new Map([
    [
        "tr",
        new Set([
            "tr",
            "th",
            "td"
        ])
    ],
    [
        "th",
        new Set([
            "th"
        ])
    ],
    [
        "td",
        new Set([
            "thead",
            "th",
            "td"
        ])
    ],
    [
        "body",
        new Set([
            "head",
            "link",
            "script"
        ])
    ],
    [
        "a",
        new Set([
            "a"
        ])
    ],
    [
        "li",
        new Set([
            "li"
        ])
    ],
    [
        "p",
        pTag
    ],
    [
        "h1",
        headingTags
    ],
    [
        "h2",
        headingTags
    ],
    [
        "h3",
        headingTags
    ],
    [
        "h4",
        headingTags
    ],
    [
        "h5",
        headingTags
    ],
    [
        "h6",
        headingTags
    ],
    [
        "select",
        formTags
    ],
    [
        "input",
        formTags
    ],
    [
        "output",
        formTags
    ],
    [
        "button",
        formTags
    ],
    [
        "datalist",
        formTags
    ],
    [
        "textarea",
        formTags
    ],
    [
        "option",
        new Set([
            "option"
        ])
    ],
    [
        "optgroup",
        new Set([
            "optgroup",
            "option"
        ])
    ],
    [
        "dd",
        ddtTags
    ],
    [
        "dt",
        ddtTags
    ],
    [
        "address",
        pTag
    ],
    [
        "article",
        pTag
    ],
    [
        "aside",
        pTag
    ],
    [
        "blockquote",
        pTag
    ],
    [
        "details",
        pTag
    ],
    [
        "div",
        pTag
    ],
    [
        "dl",
        pTag
    ],
    [
        "fieldset",
        pTag
    ],
    [
        "figcaption",
        pTag
    ],
    [
        "figure",
        pTag
    ],
    [
        "footer",
        pTag
    ],
    [
        "form",
        pTag
    ],
    [
        "header",
        pTag
    ],
    [
        "hr",
        pTag
    ],
    [
        "main",
        pTag
    ],
    [
        "nav",
        pTag
    ],
    [
        "ol",
        pTag
    ],
    [
        "pre",
        pTag
    ],
    [
        "section",
        pTag
    ],
    [
        "table",
        pTag
    ],
    [
        "ul",
        pTag
    ],
    [
        "rt",
        rtpTags
    ],
    [
        "rp",
        rtpTags
    ],
    [
        "tbody",
        tableSectionTags
    ],
    [
        "tfoot",
        tableSectionTags
    ]
]);
const DOCUMENT_TYPE = "doctype";
const voidElements = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
]);
const foreignContextElements = new Set([
    "math",
    "svg"
]);
/**
 * Elements that can be used to integrate HTML content within foreign namespaces (e.g., SVG or MathML).
 *
 * Entries must use the SVG-adjusted casing (e.g. "foreignObject" not
 * "foreignobject") since they are compared against adjusted tag names.
 */ const htmlIntegrationElements = new Set([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext",
    "annotation-xml",
    "foreignObject",
    "desc",
    "title"
]);
const svgTagNameAdjustments = new Map([
    [
        "altglyph",
        "altGlyph"
    ],
    [
        "altglyphdef",
        "altGlyphDef"
    ],
    [
        "altglyphitem",
        "altGlyphItem"
    ],
    [
        "animatecolor",
        "animateColor"
    ],
    [
        "animatemotion",
        "animateMotion"
    ],
    [
        "animatetransform",
        "animateTransform"
    ],
    [
        "clippath",
        "clipPath"
    ],
    [
        "feblend",
        "feBlend"
    ],
    [
        "fecolormatrix",
        "feColorMatrix"
    ],
    [
        "fecomponenttransfer",
        "feComponentTransfer"
    ],
    [
        "fecomposite",
        "feComposite"
    ],
    [
        "feconvolvematrix",
        "feConvolveMatrix"
    ],
    [
        "fediffuselighting",
        "feDiffuseLighting"
    ],
    [
        "fedisplacementmap",
        "feDisplacementMap"
    ],
    [
        "fedistantlight",
        "feDistantLight"
    ],
    [
        "fedropshadow",
        "feDropShadow"
    ],
    [
        "feflood",
        "feFlood"
    ],
    [
        "fefunca",
        "feFuncA"
    ],
    [
        "fefuncb",
        "feFuncB"
    ],
    [
        "fefuncg",
        "feFuncG"
    ],
    [
        "fefuncr",
        "feFuncR"
    ],
    [
        "fegaussianblur",
        "feGaussianBlur"
    ],
    [
        "feimage",
        "feImage"
    ],
    [
        "femerge",
        "feMerge"
    ],
    [
        "femergenode",
        "feMergeNode"
    ],
    [
        "femorphology",
        "feMorphology"
    ],
    [
        "feoffset",
        "feOffset"
    ],
    [
        "fepointlight",
        "fePointLight"
    ],
    [
        "fespecularlighting",
        "feSpecularLighting"
    ],
    [
        "fespotlight",
        "feSpotLight"
    ],
    [
        "fetile",
        "feTile"
    ],
    [
        "feturbulence",
        "feTurbulence"
    ],
    [
        "foreignobject",
        "foreignObject"
    ],
    [
        "glyphref",
        "glyphRef"
    ],
    [
        "lineargradient",
        "linearGradient"
    ],
    [
        "radialgradient",
        "radialGradient"
    ],
    [
        "textpath",
        "textPath"
    ]
]);
var ForeignContext;
(function(ForeignContext) {
    ForeignContext[ForeignContext["None"] = 0] = "None";
    ForeignContext[ForeignContext["Svg"] = 1] = "Svg";
    ForeignContext[ForeignContext["MathML"] = 2] = "MathML";
})(ForeignContext || (ForeignContext = {}));
const reNameEnd = /\s|\//;
class Parser {
    options;
    /** The start index of the last event. */ startIndex = 0;
    /** The end index of the last event. */ endIndex = 0;
    /**
     * Store the start index of the current open tag,
     * so we can update the start index for attributes.
     */ openTagStart = 0;
    tagname = "";
    attribname = "";
    attribvalue = "";
    attribs = null;
    stack = [];
    foreignContext;
    cbs;
    lowerCaseTagNames;
    lowerCaseAttributeNames;
    recognizeSelfClosing;
    /** We are parsing HTML. Inverse of the `xmlMode` option. */ htmlMode;
    tokenizer;
    buffers = [];
    bufferOffset = 0;
    /** The index of the last written buffer. Used when resuming after a `pause()`. */ writeIndex = 0;
    /** Indicates whether the parser has finished running / `.end` has been called. */ ended = false;
    constructor(cbs, options = {}){
        this.options = options;
        this.cbs = cbs ?? {};
        this.htmlMode = !this.options.xmlMode;
        this.lowerCaseTagNames = options.lowerCaseTags ?? this.htmlMode;
        this.lowerCaseAttributeNames = options.lowerCaseAttributeNames ?? this.htmlMode;
        this.recognizeSelfClosing = options.recognizeSelfClosing ?? !this.htmlMode;
        this.tokenizer = new (options.Tokenizer ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Tokenizer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(this.options, this);
        this.foreignContext = [
            ForeignContext.None
        ];
        this.cbs.onparserinit?.(this);
    }
    // Tokenizer event handlers
    /**
     * @param start Start index for the current parser event.
     * @param endIndex End index for the current parser event.
     * @internal
     */ ontext(start, endIndex) {
        const data = this.getSlice(start, endIndex);
        this.endIndex = endIndex - 1;
        this.cbs.ontext?.(data);
        this.startIndex = endIndex;
    }
    /**
     * @param cp Current Unicode code point.
     * @param endIndex End index for the current parser event.
     * @internal
     */ ontextentity(cp, endIndex) {
        this.endIndex = endIndex - 1;
        this.cbs.ontext?.(fromCodePoint(cp));
        this.startIndex = endIndex;
    }
    /** @internal */ isInForeignContext() {
        return this.foreignContext[0] !== ForeignContext.None;
    }
    /**
     * Checks if the current tag is a void element. Override this if you want
     * to specify your own additional void elements.
     * @param name Name of the pseudo selector.
     */ isVoidElement(name) {
        return this.htmlMode && voidElements.has(name);
    }
    /**
     * Read a tag name from the buffer.
     *
     * When `lowerCaseTagNames` is enabled (the default in HTML mode), the name
     * is lowercased and may be adjusted for SVG casing or the `image` → `img`
     * alias.
     * @param start Start index of the tag name in the buffer.
     * @param endIndex End index of the tag name in the buffer.
     */ readTagName(start, endIndex) {
        const name = this.lowerCaseTagNames ? this.getSlice(start, endIndex).toLowerCase() : this.getSlice(start, endIndex);
        if (!(this.lowerCaseTagNames && this.htmlMode)) {
            return name;
        }
        if (this.foreignContext[0] === ForeignContext.Svg) {
            return svgTagNameAdjustments.get(name) ?? name;
        }
        /*
         * Closing tags for SVG elements inside HTML integration points
         * (e.g. </foreignObject> while inside its own content) need case
         * adjustment so the name matches what was pushed to the stack.
         * `foreignContext.length > 1` means a foreign ancestor exists —
         * the base [None] entry plus at least one pushed context.
         */ if (this.foreignContext.length > 1) {
            const adjusted = svgTagNameAdjustments.get(name);
            if (adjusted !== undefined && this.stack.includes(adjusted)) {
                return adjusted;
            }
        }
        if (!this.isInForeignContext()) {
            return name === "image" ? "img" : name;
        }
        return name;
    }
    /**
     * @param start Start index for the current parser event.
     * @param endIndex End index for the current parser event.
     * @internal
     */ onopentagname(start, endIndex) {
        this.endIndex = endIndex;
        this.emitOpenTag(this.readTagName(start, endIndex));
    }
    emitOpenTag(name) {
        this.openTagStart = this.startIndex;
        this.tagname = name;
        /*
         * The spec ignores a second <form> when one is already open.
         * Setting tagname to "" suppresses all downstream effects: attribs
         * stays null so endOpenTag is a no-op, and closeCurrentTag can't
         * match "" on the stack.
         */ if (this.htmlMode && name === "form" && this.stack.includes("form")) {
            this.tagname = "";
            return;
        }
        const impliesClose = this.htmlMode && openImpliesClose.get(name);
        if (impliesClose) {
            while(this.stack.length > 0 && impliesClose.has(this.stack[0])){
                this.popElement(true);
            }
        }
        if (!this.isVoidElement(name)) {
            this.stack.unshift(name);
            if (this.htmlMode) {
                if (name === "svg") {
                    this.foreignContext.unshift(ForeignContext.Svg);
                } else if (name === "math") {
                    this.foreignContext.unshift(ForeignContext.MathML);
                } else if (htmlIntegrationElements.has(name)) {
                    this.foreignContext.unshift(ForeignContext.None);
                }
            }
        }
        this.cbs.onopentagname?.(name);
        if (this.cbs.onopentag) this.attribs = {};
    }
    endOpenTag(isImplied) {
        this.startIndex = this.openTagStart;
        if (this.attribs) {
            this.cbs.onopentag?.(this.tagname, this.attribs, isImplied);
            this.attribs = null;
        }
        if (this.cbs.onclosetag && this.isVoidElement(this.tagname)) {
            this.cbs.onclosetag(this.tagname, true);
        }
        this.tagname = "";
    }
    /**
     * @param endIndex End index for the current parser event.
     * @internal
     */ onopentagend(endIndex) {
        this.endIndex = endIndex;
        this.endOpenTag(false);
        // Set `startIndex` for next node
        this.startIndex = endIndex + 1;
    }
    /**
     * @param start Start index for the current parser event.
     * @param endIndex End index for the current parser event.
     * @internal
     */ onclosetag(start, endIndex) {
        this.endIndex = endIndex;
        const name = this.readTagName(start, endIndex);
        if (!this.isVoidElement(name)) {
            const pos = this.stack.indexOf(name);
            if (pos !== -1) {
                for(let index = 0; index < pos; index++){
                    this.popElement(true);
                }
                this.popElement(false);
            } else if (this.htmlMode && name === "p") {
                // Implicit open before close
                this.emitOpenTag("p");
                this.closeCurrentTag(true);
            }
        } else if (this.htmlMode && name === "br") {
            // We can't use `emitOpenTag` for implicit open, as `br` would be implicitly closed.
            this.cbs.onopentagname?.("br");
            this.cbs.onopentag?.("br", {}, true);
            this.cbs.onclosetag?.("br", false);
        }
        // Set `startIndex` for next node
        this.startIndex = endIndex + 1;
    }
    /**
     * @param endIndex End index for the current parser event.
     * @internal
     */ onselfclosingtag(endIndex) {
        this.endIndex = endIndex;
        if (this.recognizeSelfClosing || this.isInForeignContext()) {
            this.closeCurrentTag(false);
            // Set `startIndex` for next node
            this.startIndex = endIndex + 1;
        } else {
            // Ignore the fact that the tag is self-closing.
            this.onopentagend(endIndex);
        }
    }
    /**
     * Pop the top element off the stack, emit a close event, and maintain
     * the foreign context stack.
     * @param implied Whether this close is implied (not from an explicit end tag).
     */ popElement(implied) {
        // biome-ignore lint/style/noNonNullAssertion: The element is guaranteed to exist.
        const element = this.stack.shift();
        if (this.htmlMode && (foreignContextElements.has(element) || htmlIntegrationElements.has(element))) {
            this.foreignContext.shift();
        }
        this.cbs.onclosetag?.(element, implied);
    }
    closeCurrentTag(isOpenImplied) {
        const name = this.tagname;
        this.endOpenTag(isOpenImplied);
        // Self-closing tags will be on the top of the stack
        if (this.stack[0] === name) {
            this.popElement(!isOpenImplied);
        }
    }
    /**
     * @param start Start index for the current parser event.
     * @param endIndex End index for the current parser event.
     * @internal
     */ onattribname(start, endIndex) {
        this.startIndex = start;
        const name = this.getSlice(start, endIndex);
        this.attribname = this.lowerCaseAttributeNames ? name.toLowerCase() : name;
    }
    /**
     * @param start Start index for the current parser event.
     * @param endIndex End index for the current parser event.
     * @internal
     */ onattribdata(start, endIndex) {
        this.attribvalue += this.getSlice(start, endIndex);
    }
    /**
     * @param cp Current Unicode code point.
     * @internal
     */ onattribentity(cp) {
        this.attribvalue += fromCodePoint(cp);
    }
    /**
     * @param quote Quote type used for the current attribute.
     * @param endIndex End index for the current parser event.
     * @internal
     */ onattribend(quote, endIndex) {
        this.endIndex = endIndex;
        this.cbs.onattribute?.(this.attribname, this.attribvalue, quote === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Tokenizer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QuoteType"].Double ? '"' : quote === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Tokenizer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QuoteType"].Single ? "'" : quote === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Tokenizer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QuoteType"].NoValue ? undefined : null);
        if (this.attribs && !Object.hasOwn(this.attribs, this.attribname)) {
            this.attribs[this.attribname] = this.attribvalue;
        }
        this.attribvalue = "";
    }
    getInstructionName(value) {
        const index = value.search(reNameEnd);
        let name = index < 0 ? value : value.substr(0, index);
        if (this.lowerCaseTagNames) {
            name = name.toLowerCase();
        }
        return name;
    }
    /**
     * @param start Start index for the current parser event.
     * @param endIndex End index for the current parser event.
     * @internal
     */ ondeclaration(start, endIndex) {
        this.endIndex = endIndex;
        const value = this.getSlice(start, endIndex);
        if (this.cbs.onprocessinginstruction) {
            /*
             * In HTML mode, ondeclaration is only reached for DOCTYPE
             * (the tokenizer routes everything else to bogus comments).
             */ const name = this.htmlMode ? this.lowerCaseTagNames ? DOCUMENT_TYPE : value.slice(0, DOCUMENT_TYPE.length) : this.getInstructionName(value);
            this.cbs.onprocessinginstruction(`!${name}`, `!${value}`);
        }
        // Set `startIndex` for next node
        this.startIndex = endIndex + 1;
    }
    /**
     * @param start Start index for the current parser event.
     * @param endIndex End index for the current parser event.
     * @internal
     */ onprocessinginstruction(start, endIndex) {
        this.endIndex = endIndex;
        const value = this.getSlice(start, endIndex);
        if (this.cbs.onprocessinginstruction) {
            const name = this.getInstructionName(value);
            this.cbs.onprocessinginstruction(`?${name}`, `?${value}`);
        }
        // Set `startIndex` for next node
        this.startIndex = endIndex + 1;
    }
    /**
     * @param start Start index for the current parser event.
     * @param endIndex End index for the current parser event.
     * @param offset Offset applied when computing parser indices.
     * @internal
     */ oncomment(start, endIndex, offset) {
        this.endIndex = endIndex;
        this.cbs.oncomment?.(this.getSlice(start, endIndex - offset));
        this.cbs.oncommentend?.();
        // Set `startIndex` for next node
        this.startIndex = endIndex + 1;
    }
    /**
     * @param start Start index for the current parser event.
     * @param endIndex End index for the current parser event.
     * @param offset Offset applied when computing parser indices.
     * @internal
     */ oncdata(start, endIndex, offset) {
        this.endIndex = endIndex;
        const value = this.getSlice(start, endIndex - offset);
        if (!this.htmlMode || this.options.recognizeCDATA) {
            this.cbs.oncdatastart?.();
            this.cbs.ontext?.(value);
            this.cbs.oncdataend?.();
        } else if (this.isInForeignContext()) {
            this.cbs.ontext?.(value);
        } else {
            this.cbs.oncomment?.(`[CDATA[${value}]]`);
            this.cbs.oncommentend?.();
        }
        // Set `startIndex` for next node
        this.startIndex = endIndex + 1;
    }
    /** @internal */ onend() {
        if (this.cbs.onclosetag) {
            // Set the end index for all remaining tags
            this.endIndex = this.startIndex;
            for(let index = 0; index < this.stack.length; index++){
                this.cbs.onclosetag(this.stack[index], true);
            }
        }
        this.cbs.onend?.();
    }
    /**
     * Resets the parser to a blank state, ready to parse a new HTML document
     */ reset() {
        this.cbs.onreset?.();
        this.tokenizer.reset();
        this.tagname = "";
        this.attribname = "";
        this.attribvalue = "";
        this.attribs = null;
        this.stack.length = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.cbs.onparserinit?.(this);
        this.buffers.length = 0;
        this.foreignContext.length = 0;
        this.foreignContext.unshift(ForeignContext.None);
        this.bufferOffset = 0;
        this.writeIndex = 0;
        this.ended = false;
    }
    /**
     * Resets the parser, then parses a complete document and
     * pushes it to the handler.
     * @param data Document to parse.
     */ parseComplete(data) {
        this.reset();
        this.end(data);
    }
    getSlice(start, end) {
        if (start === end) {
            return "";
        }
        while(start - this.bufferOffset >= this.buffers[0].length){
            this.shiftBuffer();
        }
        let slice = this.buffers[0].slice(start - this.bufferOffset, end - this.bufferOffset);
        while(end - this.bufferOffset > this.buffers[0].length){
            this.shiftBuffer();
            slice += this.buffers[0].slice(0, end - this.bufferOffset);
        }
        return slice;
    }
    shiftBuffer() {
        this.bufferOffset += this.buffers[0].length;
        this.writeIndex--;
        this.buffers.shift();
    }
    /**
     * Parses a chunk of data and calls the corresponding callbacks.
     * @param chunk Chunk to parse.
     */ write(chunk) {
        if (this.ended) {
            this.cbs.onerror?.(new Error(".write() after done!"));
            return;
        }
        this.buffers.push(chunk);
        if (this.tokenizer.running) {
            this.tokenizer.write(chunk);
            this.writeIndex++;
        }
    }
    /**
     * Parses the end of the buffer and clears the stack, calls onend.
     * @param chunk Optional final chunk to parse.
     */ end(chunk) {
        if (this.ended) {
            this.cbs.onerror?.(new Error(".end() after done!"));
            return;
        }
        if (chunk) this.write(chunk);
        this.ended = true;
        this.tokenizer.end();
    }
    /**
     * Pauses parsing. The parser won't emit events until `resume` is called.
     */ pause() {
        this.tokenizer.pause();
    }
    /**
     * Resumes parsing after `pause` was called.
     */ resume() {
        this.tokenizer.resume();
        while(this.tokenizer.running && this.writeIndex < this.buffers.length){
            this.tokenizer.write(this.buffers[this.writeIndex++]);
        }
        if (this.ended) this.tokenizer.end();
    }
}
}),
"[project]/node_modules/sanitize-html/node_modules/domelementtype/dist/index.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Types of elements found in htmlparser2's DOM */ __turbopack_context__.s([
    "CDATA",
    ()=>CDATA,
    "Comment",
    ()=>Comment,
    "Directive",
    ()=>Directive,
    "Doctype",
    ()=>Doctype,
    "ElementType",
    ()=>ElementType,
    "Root",
    ()=>Root,
    "Script",
    ()=>Script,
    "Style",
    ()=>Style,
    "Tag",
    ()=>Tag,
    "Text",
    ()=>Text,
    "isTag",
    ()=>isTag
]);
var ElementType;
(function(ElementType) {
    /** Type for the root element of a document */ ElementType["Root"] = "root";
    /** Type for Text */ ElementType["Text"] = "text";
    /** Type for <? ... ?> */ ElementType["Directive"] = "directive";
    /** Type for <!-- ... --> */ ElementType["Comment"] = "comment";
    /** Type for <script> tags */ ElementType["Script"] = "script";
    /** Type for <style> tags */ ElementType["Style"] = "style";
    /** Type for Any tag */ ElementType["Tag"] = "tag";
    /** Type for <![CDATA[ ... ]]> */ ElementType["CDATA"] = "cdata";
    /** Type for <!doctype ...> */ ElementType["Doctype"] = "doctype";
})(ElementType || (ElementType = {}));
function isTag(element) {
    return element.type === ElementType.Tag || element.type === ElementType.Script || element.type === ElementType.Style;
}
const Root = ElementType.Root;
const Text = ElementType.Text;
const Directive = ElementType.Directive;
const Comment = ElementType.Comment;
const Script = ElementType.Script;
const Style = ElementType.Style;
const Tag = ElementType.Tag;
const CDATA = ElementType.CDATA;
const Doctype = ElementType.Doctype;
}),
"[project]/node_modules/sanitize-html/node_modules/domhandler/dist/node.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CDATA",
    ()=>CDATA,
    "Comment",
    ()=>Comment,
    "DataNode",
    ()=>DataNode,
    "Document",
    ()=>Document,
    "Element",
    ()=>Element,
    "Node",
    ()=>Node,
    "NodeWithChildren",
    ()=>NodeWithChildren,
    "ProcessingInstruction",
    ()=>ProcessingInstruction,
    "Text",
    ()=>Text,
    "cloneNode",
    ()=>cloneNode,
    "hasChildren",
    ()=>hasChildren,
    "isCDATA",
    ()=>isCDATA,
    "isComment",
    ()=>isComment,
    "isDirective",
    ()=>isDirective,
    "isDocument",
    ()=>isDocument,
    "isTag",
    ()=>isTag,
    "isText",
    ()=>isText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domelementtype/dist/index.js [app-ssr] (ecmascript)");
;
class Node {
    /** Parent of the node */ parent = null;
    /** Previous sibling */ prev = null;
    /** Next sibling */ next = null;
    /** The start index of the node. Requires `withStartIndices` on the handler to be `true. */ startIndex = null;
    /** The end index of the node. Requires `withEndIndices` on the handler to be `true. */ endIndex = null;
    // Read-write aliases for properties
    /**
     * Same as {@link parent}.
     * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
     */ get parentNode() {
        return this.parent;
    }
    set parentNode(parent) {
        this.parent = parent;
    }
    /**
     * Same as {@link prev}.
     * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
     */ get previousSibling() {
        return this.prev;
    }
    set previousSibling(previous) {
        this.prev = previous;
    }
    /**
     * Same as {@link next}.
     * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
     */ get nextSibling() {
        return this.next;
    }
    set nextSibling(next) {
        this.next = next;
    }
    /**
     * Clone this node, and optionally its children.
     * @param recursive Clone child nodes as well.
     * @returns A clone of the node.
     */ cloneNode(recursive = false) {
        return cloneNode(this, recursive);
    }
}
class DataNode extends Node {
    data;
    /**
     * @param data The content of the data node
     */ constructor(data){
        super();
        this.data = data;
    }
    /**
     * Same as {@link data}.
     * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
     */ get nodeValue() {
        return this.data;
    }
    set nodeValue(data) {
        this.data = data;
    }
}
class Text extends DataNode {
    type = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Text;
    get nodeType() {
        return 3;
    }
}
class Comment extends DataNode {
    type = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Comment;
    get nodeType() {
        return 8;
    }
}
class ProcessingInstruction extends DataNode {
    type = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Directive;
    name;
    constructor(name, data){
        super(data);
        this.name = name;
    }
    get nodeType() {
        return 1;
    }
    /** If this is a doctype, the document type name (parse5 only). */ "x-name";
    /** If this is a doctype, the document type public identifier (parse5 only). */ "x-publicId";
    /** If this is a doctype, the document type system identifier (parse5 only). */ "x-systemId";
}
class NodeWithChildren extends Node {
    children;
    /**
     * @param children Children of the node. Only certain node types can have children.
     */ constructor(children){
        super();
        this.children = children;
    }
    // Aliases
    /** First child of the node. */ get firstChild() {
        return this.children[0] ?? null;
    }
    /** Last child of the node. */ get lastChild() {
        return this.children.length > 0 ? this.children[this.children.length - 1] : null;
    }
    /**
     * Same as {@link children}.
     * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
     */ get childNodes() {
        return this.children;
    }
    set childNodes(children) {
        this.children = children;
    }
}
class CDATA extends NodeWithChildren {
    type = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].CDATA;
    get nodeType() {
        return 4;
    }
}
class Document extends NodeWithChildren {
    type = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Root;
    get nodeType() {
        return 9;
    }
}
class Element extends NodeWithChildren {
    name;
    attribs;
    type;
    /**
     * @param name Name of the tag, eg. `div`, `span`.
     * @param attribs Object mapping attribute names to attribute values.
     * @param children Children of the node.
     * @param type Node type used for the new node instance.
     */ constructor(name, attribs, children = [], type = name === "script" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Script : name === "style" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Style : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Tag){
        super(children);
        this.name = name;
        this.attribs = attribs;
        this.type = type;
    }
    get nodeType() {
        return 1;
    }
    // DOM Level 1 aliases
    /**
     * Same as {@link name}.
     * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
     */ get tagName() {
        return this.name;
    }
    set tagName(name) {
        this.name = name;
    }
    get attributes() {
        return Object.keys(this.attribs).map((name)=>({
                name,
                value: this.attribs[name],
                namespace: this["x-attribsNamespace"]?.[name],
                prefix: this["x-attribsPrefix"]?.[name]
            }));
    }
    /** Element namespace (parse5 only). */ namespace;
    /** Element attribute namespaces (parse5 only). */ "x-attribsNamespace";
    /** Element attribute namespace-related prefixes (parse5 only). */ "x-attribsPrefix";
}
function isTag(node) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(node);
}
function isCDATA(node) {
    return node.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].CDATA;
}
function isText(node) {
    return node.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Text;
}
function isComment(node) {
    return node.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Comment;
}
function isDirective(node) {
    return node.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Directive;
}
function isDocument(node) {
    return node.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Root;
}
function hasChildren(node) {
    return Object.hasOwn(node, "children");
}
function cloneNode(node, recursive = false) {
    let result;
    if (isText(node)) {
        result = new Text(node.data);
    } else if (isComment(node)) {
        result = new Comment(node.data);
    } else if (isTag(node)) {
        const children = recursive ? cloneChildren(node.children) : [];
        const clone = new Element(node.name, {
            ...node.attribs
        }, children);
        for (const child of children){
            child.parent = clone;
        }
        if (node.namespace != null) {
            clone.namespace = node.namespace;
        }
        if (node["x-attribsNamespace"]) {
            clone["x-attribsNamespace"] = {
                ...node["x-attribsNamespace"]
            };
        }
        if (node["x-attribsPrefix"]) {
            clone["x-attribsPrefix"] = {
                ...node["x-attribsPrefix"]
            };
        }
        result = clone;
    } else if (isCDATA(node)) {
        const children = recursive ? cloneChildren(node.children) : [];
        const clone = new CDATA(children);
        for (const child of children){
            child.parent = clone;
        }
        result = clone;
    } else if (isDocument(node)) {
        const children = recursive ? cloneChildren(node.children) : [];
        const clone = new Document(children);
        for (const child of children){
            child.parent = clone;
        }
        if (node["x-mode"]) {
            clone["x-mode"] = node["x-mode"];
        }
        result = clone;
    } else if (isDirective(node)) {
        const instruction = new ProcessingInstruction(node.name, node.data);
        if (node["x-name"] != null) {
            instruction["x-name"] = node["x-name"];
            instruction["x-publicId"] = node["x-publicId"];
            instruction["x-systemId"] = node["x-systemId"];
        }
        result = instruction;
    } else {
        throw new Error(`Not implemented yet: ${node.type}`);
    }
    result.startIndex = node.startIndex;
    result.endIndex = node.endIndex;
    if (node.sourceCodeLocation != null) {
        result.sourceCodeLocation = node.sourceCodeLocation;
    }
    return result;
}
/**
 * Clone a list of child nodes.
 * @param childs The child nodes to clone.
 * @returns A list of cloned child nodes.
 */ function cloneChildren(childs) {
    const children = childs.map((child)=>cloneNode(child, true));
    for(let index = 1; index < children.length; index++){
        children[index].prev = children[index - 1];
        children[index - 1].next = children[index];
    }
    return children;
}
}),
"[project]/node_modules/sanitize-html/node_modules/domhandler/dist/index.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DomHandler",
    ()=>DomHandler,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domelementtype/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domhandler/dist/node.js [app-ssr] (ecmascript)");
;
;
;
// Default options
const defaultOptions = {
    withStartIndices: false,
    withEndIndices: false,
    xmlMode: false
};
class DomHandler {
    /** The elements of the DOM */ dom = [];
    /** The root element for the DOM */ root = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Document"](this.dom);
    /** Called once parsing has completed. */ callback;
    /** Settings for the handler. */ options;
    /** Callback whenever a tag is closed. */ elementCB;
    /** Indicated whether parsing has been completed. */ done = false;
    /** Stack of open tags. */ tagStack = [
        this.root
    ];
    /** A data node that is still being written to. */ lastNode = null;
    /** Reference to the parser instance. Used for location information. */ parser = null;
    /**
     * @param callback Called once parsing has completed.
     * @param options Settings for the handler.
     * @param elementCB Callback whenever a tag is closed.
     */ constructor(callback, options, elementCB){
        // Make it possible to skip arguments, for backwards-compatibility
        if (typeof options === "function") {
            elementCB = options;
            options = defaultOptions;
        }
        if (typeof callback === "object") {
            options = callback;
            callback = undefined;
        }
        this.callback = callback ?? null;
        this.options = options ?? defaultOptions;
        this.elementCB = elementCB ?? null;
    }
    onparserinit(parser) {
        this.parser = parser;
    }
    // Resets the handler back to starting state
    onreset() {
        this.dom = [];
        this.root = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Document"](this.dom);
        this.done = false;
        this.tagStack = [
            this.root
        ];
        this.lastNode = null;
        this.parser = null;
    }
    // Signals the handler that parsing is done
    onend() {
        if (this.done) return;
        this.done = true;
        this.parser = null;
        this.handleCallback(null);
    }
    onerror(error) {
        this.handleCallback(error);
    }
    onclosetag() {
        this.lastNode = null;
        const element = this.tagStack.pop();
        if (this.options.withEndIndices && this.parser) {
            element.endIndex = this.parser.endIndex;
        }
        if (this.elementCB) this.elementCB(element);
    }
    onopentag(name, attribs) {
        const type = this.options.xmlMode ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Tag : undefined;
        const element = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Element"](name, attribs, undefined, type);
        this.addNode(element);
        this.tagStack.push(element);
    }
    ontext(data) {
        const { lastNode } = this;
        if (lastNode && lastNode.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Text) {
            lastNode.data += data;
            if (this.options.withEndIndices && this.parser) {
                lastNode.endIndex = this.parser.endIndex;
            }
        } else {
            const node = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"](data);
            this.addNode(node);
            this.lastNode = node;
        }
    }
    oncomment(data) {
        if (this.lastNode && this.lastNode.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Comment) {
            this.lastNode.data += data;
            return;
        }
        const node = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Comment"](data);
        this.addNode(node);
        this.lastNode = node;
    }
    oncommentend() {
        this.lastNode = null;
    }
    oncdatastart() {
        const text = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"]("");
        const node = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CDATA"]([
            text
        ]);
        this.addNode(node);
        text.parent = node;
        this.lastNode = text;
    }
    oncdataend() {
        this.lastNode = null;
    }
    onprocessinginstruction(name, data) {
        const node = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProcessingInstruction"](name, data);
        this.addNode(node);
    }
    handleCallback(error) {
        if (typeof this.callback === "function") {
            this.callback(error, this.dom);
        } else if (error) {
            throw error;
        }
    }
    addNode(node) {
        const parent = this.tagStack[this.tagStack.length - 1];
        const previousSibling = parent.children[parent.children.length - 1];
        if (this.options.withStartIndices && this.parser) {
            node.startIndex = this.parser.startIndex;
        }
        if (this.options.withEndIndices && this.parser) {
            node.endIndex = this.parser.endIndex;
        }
        parent.children.push(node);
        if (previousSibling) {
            node.prev = previousSibling;
            previousSibling.next = node;
        }
        node.parent = parent;
        this.lastNode = null;
    }
}
const __TURBOPACK__default__export__ = DomHandler;
}),
"[project]/node_modules/sanitize-html/node_modules/domutils/dist/querying.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "existsOne",
    ()=>existsOne,
    "filter",
    ()=>filter,
    "find",
    ()=>find,
    "findAll",
    ()=>findAll,
    "findOne",
    ()=>findOne
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domhandler/dist/node.js [app-ssr] (ecmascript)");
;
function filter(test, node, recurse = true, limit = Number.POSITIVE_INFINITY) {
    return find(test, Array.isArray(node) ? node : [
        node
    ], recurse, limit);
}
function find(test, nodes, recurse, limit) {
    const result = [];
    /** Stack of the arrays we are looking at. */ const nodeStack = [
        Array.isArray(nodes) ? nodes : [
            nodes
        ]
    ];
    /** Stack of the indices within the arrays. */ const indexStack = [
        0
    ];
    for(;;){
        // First, check if the current array has any more elements to look at.
        if (indexStack[0] >= nodeStack[0].length) {
            // If we have no more arrays to look at, we are done.
            if (indexStack.length === 1) {
                return result;
            }
            // Otherwise, remove the current array from the stack.
            nodeStack.shift();
            indexStack.shift();
            continue;
        }
        const element = nodeStack[0][indexStack[0]++];
        if (test(element)) {
            result.push(element);
            if (--limit <= 0) return result;
        }
        if (recurse && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(element) && element.children.length > 0) {
            /*
             * Add the children to the stack. We are depth-first, so this is
             * the next array we look at.
             */ indexStack.unshift(0);
            nodeStack.unshift(element.children);
        }
    }
}
function findOne(test, nodes, recurse = true) {
    const searchedNodes = Array.isArray(nodes) ? nodes : [
        nodes
    ];
    for (const node of searchedNodes){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(node) && test(node)) {
            return node;
        }
        if (recurse && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(node) && node.children.length > 0) {
            const found = findOne(test, node.children, true);
            if (found) return found;
        }
    }
    return null;
}
function existsOne(test, nodes) {
    return (Array.isArray(nodes) ? nodes : [
        nodes
    ]).some((node)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(node) && test(node) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(node) && existsOne(test, node.children));
}
function findAll(test, nodes) {
    const result = [];
    const nodeStack = [
        Array.isArray(nodes) ? nodes : [
            nodes
        ]
    ];
    const indexStack = [
        0
    ];
    for(;;){
        if (indexStack[0] >= nodeStack[0].length) {
            if (nodeStack.length === 1) {
                return result;
            }
            // Otherwise, remove the current array from the stack.
            nodeStack.shift();
            indexStack.shift();
            continue;
        }
        const element = nodeStack[0][indexStack[0]++];
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(element) && test(element)) result.push(element);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(element) && element.children.length > 0) {
            indexStack.unshift(0);
            nodeStack.unshift(element.children);
        }
    }
}
}),
"[project]/node_modules/sanitize-html/node_modules/domutils/dist/legacy.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getElementById",
    ()=>getElementById,
    "getElements",
    ()=>getElements,
    "getElementsByClassName",
    ()=>getElementsByClassName,
    "getElementsByTagName",
    ()=>getElementsByTagName,
    "getElementsByTagType",
    ()=>getElementsByTagType,
    "testElement",
    ()=>testElement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domhandler/dist/node.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/querying.js [app-ssr] (ecmascript)");
;
;
/**
 * A map of functions to check nodes against.
 */ const Checks = {
    tag_name (name) {
        if (typeof name === "function") {
            return (element)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(element) && name(element.name);
        }
        if (name === "*") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"];
        }
        return (element)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(element) && element.name === name;
    },
    tag_type (type) {
        if (typeof type === "function") {
            return (element)=>type(element.type);
        }
        return (element)=>element.type === type;
    },
    tag_contains (data) {
        if (typeof data === "function") {
            return (element)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isText"])(element) && data(element.data);
        }
        return (element)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isText"])(element) && element.data === data;
    }
};
/**
 * Returns a function to check whether a node has an attribute with a particular
 * value.
 *
 * @param attrib Attribute to check.
 * @param value Attribute value to look for.
 * @returns A function to check whether the a node has an attribute with a
 *   particular value.
 */ function getAttribCheck(attrib, value) {
    if (typeof value === "function") {
        return (element)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(element) && value(element.attribs[attrib]);
    }
    return (element)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(element) && element.attribs[attrib] === value;
}
/**
 * Returns a function that returns `true` if either of the input functions
 * returns `true` for a node.
 *
 * @param a First function to combine.
 * @param b Second function to combine.
 * @returns A function taking a node and returning `true` if either of the input
 *   functions returns `true` for the node.
 */ function combineFuncs(a, b) {
    return (element)=>a(element) || b(element);
}
/**
 * Returns a function that executes all checks in `options` and returns `true`
 * if any of them match a node.
 *
 * @param options An object describing nodes to look for.
 * @returns A function that executes all checks in `options` and returns `true`
 *   if any of them match a node.
 */ function compileTest(options) {
    const funcs = Object.keys(options).map((key)=>{
        const value = options[key];
        return Object.hasOwn(Checks, key) ? Checks[key](value) : getAttribCheck(key, value);
    });
    return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
}
function testElement(options, node) {
    const test = compileTest(options);
    return test ? test(node) : true;
}
function getElements(options, nodes, recurse, limit = Number.POSITIVE_INFINITY) {
    const test = compileTest(options);
    return test ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filter"])(test, nodes, recurse, limit) : [];
}
function getElementById(id, nodes, recurse = true) {
    if (!Array.isArray(nodes)) nodes = [
        nodes
    ];
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findOne"])(getAttribCheck("id", id), nodes, recurse);
}
function getElementsByTagName(tagName, nodes, recurse = true, limit = Number.POSITIVE_INFINITY) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filter"])(Checks["tag_name"](tagName), nodes, recurse, limit);
}
function getElementsByClassName(className, nodes, recurse = true, limit = Number.POSITIVE_INFINITY) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filter"])(getAttribCheck("class", className), nodes, recurse, limit);
}
function getElementsByTagType(type, nodes, recurse = true, limit = Number.POSITIVE_INFINITY) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filter"])(Checks["tag_type"](type), nodes, recurse, limit);
}
}),
"[project]/node_modules/sanitize-html/node_modules/entities/dist/escape.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "XML_BITSET_VALUE",
    ()=>XML_BITSET_VALUE,
    "encodeXML",
    ()=>encodeXML,
    "escape",
    ()=>escape,
    "escapeAttribute",
    ()=>escapeAttribute,
    "escapeText",
    ()=>escapeText,
    "escapeUTF8",
    ()=>escapeUTF8,
    "getCodePoint",
    ()=>getCodePoint,
    "xmlEncodeRegex",
    ()=>xmlEncodeRegex
]);
/**
 * Get the named reference for an XML special character or U+00A0.
 * @param char Code unit matched by one of the escape regexes.
 */ function getEscape(char) {
    return char === 34 ? "&quot;" : char === 38 ? "&amp;" : char === 39 ? "&apos;" : char === 60 ? "&lt;" : char === 62 ? "&gt;" : "&nbsp;";
}
const getCodePoint = (input, index)=>input.codePointAt(index);
const XML_BITSET_VALUE = 0x50_00_00_c4; // 32..63 -> 34 ("),38 (&),39 ('),60 (<),62 (>)
const xmlEncodeRegex = /["&'<>\u0080-\uFFFF]/g;
/**
 * Whether `code` (a UTF-16 code unit) is escaped by {@link encodeXML}: a
 * non-ASCII unit, or one of the five XML specials flagged in
 * `XML_BITSET_VALUE` (which is only meaningful for code units 32-63).
 * @param code Code unit to test.
 */ function isXmlEscapable(code) {
    return code >= 0x80 || code >= 32 && code < 64 && (XML_BITSET_VALUE >>> code & 1) === 1;
}
function encodeXML(input) {
    const { length } = input;
    let out;
    let last = 0;
    let index = 0;
    while(index < length){
        const char = input.charCodeAt(index);
        /*
         * Find the next character to escape: scan a short window inline
         * (escapable characters cluster in markup-heavy input), then fall
         * back to the regex, which skips clean spans in native code.
         */ if (!isXmlEscapable(char)) {
            const bound = Math.min(index + 32, length);
            let next = index + 1;
            while(next < bound && !isXmlEscapable(input.charCodeAt(next))){
                next++;
            }
            if (next < bound) {
                index = next;
                continue;
            }
            if (next >= length) break;
            xmlEncodeRegex.lastIndex = next;
            if (!xmlEncodeRegex.test(input)) break;
            index = xmlEncodeRegex.lastIndex - 1;
            continue;
        }
        if (out === undefined) out = input.substring(0, index);
        else if (last !== index) out += input.substring(last, index);
        if (char < 64) {
            // Known replacement
            out += getEscape(char);
            last = index += 1;
            continue;
        }
        // Non-ASCII: encode as numeric entity (handle surrogate pair)
        const cp = input.codePointAt(index);
        out += `&#x${cp.toString(16)};`;
        if (cp !== char) index++; // Skip trailing surrogate
        last = index += 1;
    }
    if (out === undefined) return input;
    if (last < length) out += input.substr(last);
    return out;
}
const escape = encodeXML;
/**
 * Escape `data` using `re`, mapping each matched character to its entity.
 * Every match is one UTF-16 code unit, so its index is `lastIndex - 1`.
 * @param re Global regex matching exactly the characters to escape
 *   (`"`, `&`, `'`, `<`, `>`, `\u00A0` at most).
 * @param data String to escape.
 */ function escapeWithRegex(re, data) {
    re.lastIndex = 0;
    if (!re.test(data)) return data;
    let out = "";
    let last = 0;
    do {
        const index = re.lastIndex - 1;
        if (last !== index) out += data.substring(last, index);
        const char = data.charCodeAt(index);
        out += getEscape(char);
        last = index + 1;
    }while (re.test(data))
    return out + data.substring(last);
}
const xmlEscapeRegex = /["&'<>]/g;
function escapeUTF8(data) {
    return escapeWithRegex(xmlEscapeRegex, data);
}
const attributeEscapeRegex = /["&\u{A0}]/gu;
function escapeAttribute(data) {
    return escapeWithRegex(attributeEscapeRegex, data);
}
const textEscapeRegex = /[&<>\u{A0}]/gu;
function escapeText(data) {
    return escapeWithRegex(textEscapeRegex, data);
}
}),
"[project]/node_modules/sanitize-html/node_modules/dom-serializer/dist/foreign-names.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Mixed-case SVG and MathML element names recognized in foreign content.
 * @see https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign
 */ __turbopack_context__.s([
    "attributeNames",
    ()=>attributeNames,
    "elementNames",
    ()=>elementNames
]);
const elementNames = new Map("altGlyph altGlyphDef altGlyphItem animateColor animateMotion animateTransform clipPath feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feDropShadow feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence foreignObject glyphRef linearGradient radialGradient textPath".split(" ").map((name)=>[
        name.toLowerCase(),
        name
    ]));
const attributeNames = new Map("definitionURL attributeName attributeType baseFrequency baseProfile calcMode clipPathUnits diffuseConstant edgeMode filterUnits glyphRef gradientTransform gradientUnits kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions requiredFeatures specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles surfaceScale systemLanguage tableValues targetX targetY textLength viewBox viewTarget xChannelSelector yChannelSelector zoomAndPan".split(" ").map((name)=>[
        name.toLowerCase(),
        name
    ]));
}),
"[project]/node_modules/sanitize-html/node_modules/dom-serializer/dist/index.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "render",
    ()=>render
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domelementtype/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$escape$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/entities/dist/escape.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$dom$2d$serializer$2f$dist$2f$foreign$2d$names$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/dom-serializer/dist/foreign-names.js [app-ssr] (ecmascript)");
;
;
;
// ── Constants ────────────────────────────────────────────────────────
/** Elements whose text content is never entity-encoded. */ const unencodedElements = new Set("style script xmp iframe noembed noframes plaintext noscript".split(" "));
/** HTML void elements — they cannot have children. */ const voidElements = new Set("area base basefont br col command embed frame hr img input isindex keygen link meta param source track wbr".split(" "));
/** Elements that switch the parser into foreign (XML-like) mode. */ const foreignElements = new Set([
    "svg",
    "math"
]);
/**
 * Foreign-mode integration points: children of these elements are parsed
 * as HTML again, not as foreign content.
 */ const foreignModeIntegrationPoints = new Set("mi mo mn ms mtext annotation-xml foreignObject desc title".split(" "));
function render(node, options = {}) {
    const nodes = "length" in node ? node : [
        node
    ];
    /*
     * `xmlMode` is threaded as a separate argument through the internal
     * functions so that foreign-mode transitions (svg/mathml ↔ html) can
     * adjust it without copying the options object on every element.
     */ const xmlMode = options.xmlMode ?? false;
    let output = "";
    // eslint-disable-next-line unicorn/no-for-loop
    for(let index = 0; index < nodes.length; index++){
        output += renderNode(nodes[index], options, xmlMode);
    }
    return output;
}
const __TURBOPACK__default__export__ = render;
// ── Internal rendering ───────────────────────────────────────────────
/**
 * Render an array of child nodes (skips the single-node wrapping in `render`).
 * @param children The child nodes to render.
 * @param options The serialization options.
 * @param xmlMode The XML mode to use.
 */ function renderChildren(children, options, xmlMode) {
    let output = "";
    // eslint-disable-next-line unicorn/no-for-loop
    for(let index = 0; index < children.length; index++){
        output += renderNode(children[index], options, xmlMode);
    }
    return output;
}
function renderNode(node, options, xmlMode) {
    switch(node.type){
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"]:
            {
                return renderChildren(node.children, options, xmlMode);
            }
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Directive"]:
            {
                return `<${node.data}>`;
            }
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Comment"]:
            {
                return `<!--${node.data}-->`;
            }
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CDATA"]:
            {
                return `<![CDATA[${node.children[0].data}]]>`;
            }
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Script"]:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Style"]:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tag"]:
            {
                return renderTag(node, options, xmlMode);
            }
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"]:
            {
                const element = node;
                const data = element.data || "";
                /*
             * Skip encoding when entities weren't decoded on input, or when
             * inside a raw-text element (script, style, etc.) in HTML mode.
             */ if ((options.encodeEntities ?? options.decodeEntities) !== false && !(!xmlMode && element.parent && unencodedElements.has(element.parent.name))) {
                    // `xmlMode: "foreign"` is truthy
                    return xmlMode || options.encodeEntities !== "utf8" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$escape$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encodeXML"])(data) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$escape$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["escapeText"])(data);
                }
                return data;
            }
    }
}
function renderTag(element, options, xmlMode) {
    if (xmlMode === "foreign") {
        // Correct lowercase element names back to their canonical mixed-case form
        element.name = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$dom$2d$serializer$2f$dist$2f$foreign$2d$names$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementNames"].get(element.name) ?? element.name;
        // Integration points exit foreign mode: their children are HTML
        if (element.parent && foreignModeIntegrationPoints.has(element.parent.name)) {
            xmlMode = false;
        }
    }
    if (!xmlMode && foreignElements.has(element.name)) {
        xmlMode = "foreign";
    }
    const { name, children } = element;
    // Cache the void-element check — used for both self-closing and closing-tag logic
    const isVoid = !xmlMode && voidElements.has(name);
    let tag = `<${name}${formatAttributes(element.attribs, options, xmlMode)}`;
    if (children.length === 0 && (xmlMode ? options.selfClosingTags !== false : options.selfClosingTags && isVoid)) {
        // XML: `<br/>`, HTML: `<br />`
        tag += xmlMode ? "/>" : " />";
    } else {
        tag += ">";
        if (children.length > 0) {
            tag += renderChildren(children, options, xmlMode);
        }
        if (!isVoid) {
            tag += `</${name}>`;
        }
    }
    return tag;
}
// ── Attribute formatting ─────────────────────────────────────────────
function replaceQuotes(value) {
    return value.replaceAll('"', "&quot;");
}
/**
 * Serialize an element's attribute map to a string.
 *
 * Returns a string with a leading space before each attribute, or an
 * empty string if there are no attributes. This convention lets the
 * caller unconditionally concatenate the result onto the tag name.
 * @param attributes
 * @param options
 * @param xmlMode
 */ function formatAttributes(attributes, options, xmlMode) {
    if (!attributes) return "";
    /*
     * Pick the right encoder:
     *  - Encoding disabled → only escape double-quotes (for valid attributes)
     *  - XML / non-utf8    → full numeric entity encoding (encodeXML)
     *  - HTML + utf8       → minimal escaping (escapeAttribute)
     */ const encode = (options.encodeEntities ?? options.decodeEntities) === false ? replaceQuotes : xmlMode || options.encodeEntities !== "utf8" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$escape$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encodeXML"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$entities$2f$dist$2f$escape$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["escapeAttribute"];
    const isForeign = xmlMode === "foreign";
    const showEmpty = !!(options.emptyAttrs ?? xmlMode);
    let result = "";
    for(const key in attributes){
        if (!Object.hasOwn(attributes, key)) continue;
        const value = attributes[key];
        const k = isForeign ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$dom$2d$serializer$2f$dist$2f$foreign$2d$names$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeNames"].get(key) ?? key : key;
        result += !showEmpty && (value == null || value === "") ? ` ${k}` : ` ${k}="${encode(value == null ? "" : String(value))}"`;
    }
    return result;
}
}),
"[project]/node_modules/sanitize-html/node_modules/domutils/dist/stringify.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getInnerHTML",
    ()=>getInnerHTML,
    "getOuterHTML",
    ()=>getOuterHTML,
    "getText",
    ()=>getText,
    "innerText",
    ()=>innerText,
    "textContent",
    ()=>textContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$dom$2d$serializer$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/dom-serializer/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domelementtype/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domhandler/dist/node.js [app-ssr] (ecmascript)");
;
;
;
function getOuterHTML(node, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$dom$2d$serializer$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(node, options);
}
function getInnerHTML(node, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(node) ? node.children.map((node)=>getOuterHTML(node, options)).join("") : "";
}
function getText(node) {
    if (Array.isArray(node)) return node.map(getText).join("");
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(node)) return node.name === "br" ? "\n" : getText(node.children);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isCDATA"])(node)) return getText(node.children);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isText"])(node)) return node.data;
    return "";
}
function textContent(node) {
    if (Array.isArray(node)) return node.map(textContent).join("");
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(node) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isComment"])(node)) {
        return textContent(node.children);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isText"])(node)) return node.data;
    return "";
}
function innerText(node) {
    if (Array.isArray(node)) return node.map(innerText).join("");
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(node) && (node.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementType"].Tag || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isCDATA"])(node))) {
        return innerText(node.children);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isText"])(node)) return node.data;
    return "";
}
}),
"[project]/node_modules/sanitize-html/node_modules/domutils/dist/feeds.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getFeed",
    ()=>getFeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/legacy.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$stringify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/stringify.js [app-ssr] (ecmascript)");
;
;
function getFeed(document) {
    const feedRoot = getOneElement(isValidFeed, document);
    return feedRoot ? feedRoot.name === "feed" ? getAtomFeed(feedRoot) : getRssFeed(feedRoot) : null;
}
/**
 * Parse an Atom feed.
 *
 * @param feedRoot The root of the feed.
 * @returns The parsed feed.
 */ function getAtomFeed(feedRoot) {
    const childs = feedRoot.children;
    const feed = {
        type: "atom",
        items: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElementsByTagName"])("entry", childs).map((item)=>{
            const { children } = item;
            const entry = {
                media: getMediaElements(children)
            };
            addConditionally(entry, "id", "id", children);
            addConditionally(entry, "title", "title", children);
            const href = getOneElement("link", children)?.attribs["href"];
            if (href) {
                entry.link = href;
            }
            const description = fetch("summary", children) || fetch("content", children);
            if (description) {
                entry.description = description;
            }
            const pubDate = fetch("updated", children);
            if (pubDate) {
                entry.pubDate = new Date(pubDate);
            }
            return entry;
        })
    };
    addConditionally(feed, "id", "id", childs);
    addConditionally(feed, "title", "title", childs);
    const href = getOneElement("link", childs)?.attribs["href"];
    if (href) {
        feed.link = href;
    }
    addConditionally(feed, "description", "subtitle", childs);
    const updated = fetch("updated", childs);
    if (updated) {
        feed.updated = new Date(updated);
    }
    addConditionally(feed, "author", "email", childs, true);
    return feed;
}
/**
 * Parse a RSS feed.
 *
 * @param feedRoot The root of the feed.
 * @returns The parsed feed.
 */ function getRssFeed(feedRoot) {
    const childs = getOneElement("channel", feedRoot.children)?.children ?? [];
    const feed = {
        type: feedRoot.name.substr(0, 3),
        id: "",
        items: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElementsByTagName"])("item", feedRoot.children).map((item)=>{
            const { children } = item;
            const entry = {
                media: getMediaElements(children)
            };
            addConditionally(entry, "id", "guid", children);
            addConditionally(entry, "title", "title", children);
            addConditionally(entry, "link", "link", children);
            addConditionally(entry, "description", "description", children);
            const pubDate = fetch("pubDate", children) || fetch("dc:date", children);
            if (pubDate) entry.pubDate = new Date(pubDate);
            return entry;
        })
    };
    addConditionally(feed, "title", "title", childs);
    addConditionally(feed, "link", "link", childs);
    addConditionally(feed, "description", "description", childs);
    const updated = fetch("lastBuildDate", childs);
    if (updated) {
        feed.updated = new Date(updated);
    }
    addConditionally(feed, "author", "managingEditor", childs, true);
    return feed;
}
const MEDIA_KEYS_STRING = [
    "url",
    "type",
    "lang"
];
const MEDIA_KEYS_INT = [
    "fileSize",
    "bitrate",
    "framerate",
    "samplingrate",
    "channels",
    "duration",
    "height",
    "width"
];
/**
 * Get all media elements of a feed item.
 *
 * @param where Nodes to search in.
 * @returns Media elements.
 */ function getMediaElements(where) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElementsByTagName"])("media:content", where).map((element)=>{
        const { attribs } = element;
        const media = {
            medium: attribs["medium"],
            isDefault: !!attribs["isDefault"]
        };
        for (const attrib of MEDIA_KEYS_STRING){
            if (attribs[attrib]) {
                media[attrib] = attribs[attrib];
            }
        }
        for (const attrib of MEDIA_KEYS_INT){
            if (attribs[attrib]) {
                media[attrib] = Number.parseInt(attribs[attrib], 10);
            }
        }
        if (attribs["expression"]) {
            media.expression = attribs["expression"];
        }
        return media;
    });
}
/**
 * Get one element by tag name.
 *
 * @param tagName Tag name to look for
 * @param node Node to search in
 * @returns The element or null
 */ function getOneElement(tagName, node) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElementsByTagName"])(tagName, node, true, 1)[0];
}
/**
 * Get the text content of an element with a certain tag name.
 *
 * @param tagName Tag name to look for.
 * @param where Node to search in.
 * @param recurse Whether to recurse into child nodes.
 * @returns The text content of the element.
 */ function fetch(tagName, where, recurse = false) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$stringify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["textContent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElementsByTagName"])(tagName, where, recurse, 1)).trim();
}
/**
 * Adds a property to an object if it has a value.
 *
 * @param object Object to be extended.
 * @param property Property name.
 * @param tagName Tag name that contains the conditionally added property.
 * @param where Element to search for the property.
 * @param recurse Whether to recurse into child nodes.
 */ function addConditionally(object, property, tagName, where, recurse = false) {
    const value = fetch(tagName, where, recurse);
    if (value) object[property] = value;
}
/**
 * Checks if an element is a feed root node.
 *
 * @param value The name of the element to check.
 * @returns Whether an element is a feed root node.
 */ function isValidFeed(value) {
    return value === "rss" || value === "feed" || value === "rdf:RDF";
}
}),
"[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/index.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createDocumentStream",
    ()=>createDocumentStream,
    "parseDocument",
    ()=>parseDocument,
    "parseFeed",
    ()=>parseFeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Parser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/Parser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domhandler/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$feeds$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/feeds.js [app-ssr] (ecmascript)");
;
;
;
;
function parseDocument(data, options) {
    const handler = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DomHandler"](undefined, options);
    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Parser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Parser"](handler, options).end(data);
    return handler.root;
}
function createDocumentStream(callback, options, elementCallback) {
    const handler = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DomHandler"]((error)=>callback(error, handler.root), options, elementCallback);
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Parser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Parser"](handler, options);
}
;
;
;
;
const parseFeedDefaultOptions = {
    xmlMode: true
};
function parseFeed(feed, options = parseFeedDefaultOptions) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$feeds$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFeed"])(parseDocument(feed, options).children);
}
;
}),
"[project]/node_modules/sanitize-html/node_modules/domutils/dist/index.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
;
;
;
;
;
;
}),
"[project]/node_modules/sanitize-html/node_modules/domutils/dist/helpers.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DocumentPosition",
    ()=>DocumentPosition,
    "compareDocumentPosition",
    ()=>compareDocumentPosition,
    "removeSubsets",
    ()=>removeSubsets,
    "uniqueSort",
    ()=>uniqueSort
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domhandler/dist/node.js [app-ssr] (ecmascript)");
;
function removeSubsets(nodes) {
    let index = nodes.length;
    /*
     * Check if each node (or one of its ancestors) is already contained in the
     * array.
     */ while(--index >= 0){
        const node = nodes[index];
        /*
         * Remove the node if it is not unique.
         * We are going through the array from the end, so we only
         * have to check nodes that preceed the node under consideration in the array.
         */ if (index > 0 && nodes.lastIndexOf(node, index - 1) >= 0) {
            nodes.splice(index, 1);
            continue;
        }
        for(let ancestor = node.parent; ancestor; ancestor = ancestor.parent){
            if (nodes.includes(ancestor)) {
                nodes.splice(index, 1);
                break;
            }
        }
    }
    return nodes;
}
var DocumentPosition;
(function(DocumentPosition) {
    DocumentPosition[DocumentPosition["DISCONNECTED"] = 1] = "DISCONNECTED";
    DocumentPosition[DocumentPosition["PRECEDING"] = 2] = "PRECEDING";
    DocumentPosition[DocumentPosition["FOLLOWING"] = 4] = "FOLLOWING";
    DocumentPosition[DocumentPosition["CONTAINS"] = 8] = "CONTAINS";
    DocumentPosition[DocumentPosition["CONTAINED_BY"] = 16] = "CONTAINED_BY";
})(DocumentPosition || (DocumentPosition = {}));
function compareDocumentPosition(nodeA, nodeB) {
    const aParents = [];
    const bParents = [];
    if (nodeA === nodeB) {
        return 0;
    }
    let current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(nodeA) ? nodeA : nodeA.parent;
    while(current){
        aParents.unshift(current);
        current = current.parent;
    }
    current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(nodeB) ? nodeB : nodeB.parent;
    while(current){
        bParents.unshift(current);
        current = current.parent;
    }
    const maxIndex = Math.min(aParents.length, bParents.length);
    let index = 0;
    while(index < maxIndex && aParents[index] === bParents[index]){
        index++;
    }
    if (index === 0) {
        return DocumentPosition.DISCONNECTED;
    }
    const sharedParent = aParents[index - 1];
    const siblings = sharedParent.children;
    const aSibling = aParents[index];
    const bSibling = bParents[index];
    if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
        if (sharedParent === nodeB) {
            return DocumentPosition.FOLLOWING | DocumentPosition.CONTAINED_BY;
        }
        return DocumentPosition.FOLLOWING;
    }
    if (sharedParent === nodeA) {
        return DocumentPosition.PRECEDING | DocumentPosition.CONTAINS;
    }
    return DocumentPosition.PRECEDING;
}
function uniqueSort(nodes) {
    nodes = nodes.filter((node, index, array)=>!array.includes(node, index + 1));
    nodes.sort((a, b)=>{
        const relative = compareDocumentPosition(a, b);
        if (relative & DocumentPosition.PRECEDING) {
            return -1;
        }
        if (relative & DocumentPosition.FOLLOWING) {
            return 1;
        }
        return 0;
    });
    return nodes;
}
}),
"[project]/node_modules/sanitize-html/node_modules/domutils/dist/manipulation.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Remove an element from the dom
 *
 * @category Manipulation
 * @param element The element to be removed.
 */ __turbopack_context__.s([
    "append",
    ()=>append,
    "appendChild",
    ()=>appendChild,
    "prepend",
    ()=>prepend,
    "prependChild",
    ()=>prependChild,
    "removeElement",
    ()=>removeElement,
    "replaceElement",
    ()=>replaceElement
]);
function removeElement(element) {
    if (element.prev) element.prev.next = element.next;
    if (element.next) element.next.prev = element.prev;
    if (element.parent) {
        const childs = element.parent.children;
        const childsIndex = childs.lastIndexOf(element);
        if (childsIndex !== -1) {
            childs.splice(childsIndex, 1);
        }
    }
    element.next = null;
    element.prev = null;
    element.parent = null;
}
function replaceElement(element, replacement) {
    replacement.prev = element.prev;
    if (replacement.prev) {
        replacement.prev.next = replacement;
    }
    replacement.next = element.next;
    if (replacement.next) {
        replacement.next.prev = replacement;
    }
    replacement.parent = element.parent;
    if (replacement.parent) {
        const { children } = replacement.parent;
        const elementIndex = children.lastIndexOf(element);
        if (elementIndex === -1) {
            return;
        }
        children[elementIndex] = replacement;
        element.parent = null;
    }
}
function appendChild(parent, child) {
    removeElement(child);
    child.next = null;
    child.parent = parent;
    if (parent.children.push(child) > 1) {
        const sibling = parent.children[parent.children.length - 2];
        sibling.next = child;
        child.prev = sibling;
    } else {
        child.prev = null;
    }
}
function append(element, next) {
    removeElement(next);
    const { parent } = element;
    const currentNext = element.next;
    next.next = currentNext;
    next.prev = element;
    element.next = next;
    next.parent = parent;
    if (currentNext) {
        currentNext.prev = next;
        if (parent) {
            const childs = parent.children;
            childs.splice(childs.lastIndexOf(currentNext), 0, next);
        }
    } else if (parent) {
        parent.children.push(next);
    }
}
function prependChild(parent, child) {
    removeElement(child);
    child.parent = parent;
    child.prev = null;
    if (parent.children.unshift(child) === 1) {
        child.next = null;
    } else {
        const sibling = parent.children[1];
        sibling.prev = child;
        child.next = sibling;
    }
}
function prepend(element, previous) {
    removeElement(previous);
    const { parent } = element;
    if (parent) {
        const childs = parent.children;
        childs.splice(childs.indexOf(element), 0, previous);
    }
    if (element.prev) {
        element.prev.next = previous;
    }
    previous.parent = parent;
    previous.prev = element.prev;
    previous.next = element;
    element.prev = previous;
}
}),
"[project]/node_modules/sanitize-html/node_modules/domutils/dist/traversal.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAttributeValue",
    ()=>getAttributeValue,
    "getChildren",
    ()=>getChildren,
    "getName",
    ()=>getName,
    "getParent",
    ()=>getParent,
    "getSiblings",
    ()=>getSiblings,
    "hasAttrib",
    ()=>hasAttrib,
    "nextElementSibling",
    ()=>nextElementSibling,
    "prevElementSibling",
    ()=>prevElementSibling
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domhandler/dist/node.js [app-ssr] (ecmascript)");
;
function getChildren(element) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasChildren"])(element) ? element.children : [];
}
function getParent(element) {
    return element.parent || null;
}
function getSiblings(element) {
    const parent = getParent(element);
    if (parent != null) return getChildren(parent);
    const siblings = [
        element
    ];
    let { prev, next } = element;
    while(prev != null){
        siblings.unshift(prev);
        ({ prev } = prev);
    }
    while(next != null){
        siblings.push(next);
        ({ next } = next);
    }
    return siblings;
}
function getAttributeValue(element, name) {
    const { attribs } = element;
    return attribs?.[name];
}
function hasAttrib(element, name) {
    const { attribs } = element;
    return attribs != null && Object.hasOwn(attribs, name) && attribs[name] != null;
}
function getName(element) {
    return element.name;
}
function nextElementSibling(element) {
    let { next } = element;
    while(next !== null && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(next))({ next } = next);
    return next;
}
function prevElementSibling(element) {
    let { prev } = element;
    while(prev !== null && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTag"])(prev))({ prev } = prev);
    return prev;
}
}),
"[project]/node_modules/sanitize-html/node_modules/domutils/dist/index.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DocumentPosition",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$helpers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DocumentPosition"],
    "append",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$manipulation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["append"],
    "appendChild",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$manipulation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appendChild"],
    "compareDocumentPosition",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$helpers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["compareDocumentPosition"],
    "existsOne",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["existsOne"],
    "filter",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filter"],
    "find",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["find"],
    "findAll",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findAll"],
    "findOne",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findOne"],
    "getAttributeValue",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$traversal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttributeValue"],
    "getChildren",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$traversal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getChildren"],
    "getElementById",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElementById"],
    "getElements",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElements"],
    "getElementsByClassName",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElementsByClassName"],
    "getElementsByTagName",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElementsByTagName"],
    "getElementsByTagType",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getElementsByTagType"],
    "getFeed",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$feeds$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFeed"],
    "getInnerHTML",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$stringify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInnerHTML"],
    "getName",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$traversal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getName"],
    "getOuterHTML",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$stringify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOuterHTML"],
    "getParent",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$traversal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getParent"],
    "getSiblings",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$traversal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSiblings"],
    "getText",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$stringify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getText"],
    "hasAttrib",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$traversal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasAttrib"],
    "innerText",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$stringify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["innerText"],
    "nextElementSibling",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$traversal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nextElementSibling"],
    "prepend",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$manipulation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prepend"],
    "prependChild",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$manipulation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prependChild"],
    "prevElementSibling",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$traversal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prevElementSibling"],
    "removeElement",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$manipulation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeElement"],
    "removeSubsets",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$helpers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeSubsets"],
    "replaceElement",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$manipulation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["replaceElement"],
    "testElement",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["testElement"],
    "textContent",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$stringify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["textContent"],
    "uniqueSort",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$helpers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uniqueSort"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$feeds$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/feeds.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$helpers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/helpers.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$legacy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/legacy.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$manipulation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/manipulation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$querying$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/querying.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$stringify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/stringify.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$traversal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/traversal.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/index.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DefaultHandler",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DomHandler"],
    "DomHandler",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DomHandler"],
    "DomUtils",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    "ElementType",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    "Parser",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Parser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Parser"],
    "QuoteType",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Tokenizer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QuoteType"],
    "Tokenizer",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Tokenizer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    "createDocumentStream",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createDocumentStream"],
    "getFeed",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$feeds$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFeed"],
    "parseDocument",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["parseDocument"],
    "parseFeed",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["parseFeed"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Parser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/Parser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domhandler$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domhandler/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domelementtype$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domelementtype/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$htmlparser2$2f$dist$2f$Tokenizer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/Tokenizer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$feeds$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/feeds.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$node_modules$2f$domutils$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/node_modules/domutils/dist/index.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/escape-string-regexp/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = (string)=>{
    if (typeof string !== 'string') {
        throw new TypeError('Expected a string');
    }
    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it’s always valid, and a \unnnn escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
    return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
};
}),
"[project]/node_modules/is-plain-object/dist/is-plain-object.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */ function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
}
function isPlainObject(o) {
    var ctor, prot;
    if (isObject(o) === false) return false;
    // If has modified constructor
    ctor = o.constructor;
    if (ctor === undefined) return true;
    // If has modified prototype
    prot = ctor.prototype;
    if (isObject(prot) === false) return false;
    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
    }
    // Most likely a plain Object
    return true;
}
exports.isPlainObject = isPlainObject;
}),
"[project]/node_modules/parse-srcset/src/parse-srcset.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Srcset Parser
 *
 * By Alex Bell |  MIT License
 *
 * JS Parser for the string value that appears in markup <img srcset="here">
 *
 * @returns Array [{url: _, d: _, w: _, h:_}, ...]
 *
 * Based super duper closely on the reference algorithm at:
 * https://html.spec.whatwg.org/multipage/embedded-content.html#parse-a-srcset-attribute
 *
 * Most comments are copied in directly from the spec
 * (except for comments in parens).
 */ (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        ((r)=>r !== undefined && __turbopack_context__.v(r))(factory());
    } else if (("TURBOPACK compile-time value", "object") === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.parseSrcset = factory();
    }
})(/*TURBOPACK member replacement*/ __turbopack_context__.e, function() {
    // 1. Let input be the value passed to this algorithm.
    return function(input) {
        // UTILITY FUNCTIONS
        // Manual is faster than RegEx
        // http://bjorn.tipling.com/state-and-regular-expressions-in-javascript
        // http://jsperf.com/whitespace-character/5
        function isSpace(c) {
            return c === "\u0020" || // space
            c === "\u0009" || // horizontal tab
            c === "\u000A" || // new line
            c === "\u000C" || // form feed
            c === "\u000D"; // carriage return
        }
        function collectCharacters(regEx) {
            var chars, match = regEx.exec(input.substring(pos));
            if (match) {
                chars = match[0];
                pos += chars.length;
                return chars;
            }
        }
        var inputLength = input.length, // (Don't use \s, to avoid matching non-breaking space)
        regexLeadingSpaces = /^[ \t\n\r\u000c]+/, regexLeadingCommasOrSpaces = /^[, \t\n\r\u000c]+/, regexLeadingNotSpaces = /^[^ \t\n\r\u000c]+/, regexTrailingCommas = /[,]+$/, regexNonNegativeInteger = /^\d+$/, // ( Positive or negative or unsigned integers or decimals, without or without exponents.
        // Must include at least one digit.
        // According to spec tests any decimal point must be followed by a digit.
        // No leading plus sign is allowed.)
        // https://html.spec.whatwg.org/multipage/infrastructure.html#valid-floating-point-number
        regexFloatingPoint = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/, url, descriptors, currentDescriptor, state, c, // 2. Let position be a pointer into input, initially pointing at the start
        //    of the string.
        pos = 0, // 3. Let candidates be an initially empty source set.
        candidates = [];
        // 4. Splitting loop: Collect a sequence of characters that are space
        //    characters or U+002C COMMA characters. If any U+002C COMMA characters
        //    were collected, that is a parse error.
        while(true){
            collectCharacters(regexLeadingCommasOrSpaces);
            // 5. If position is past the end of input, return candidates and abort these steps.
            if (pos >= inputLength) {
                return candidates; // (we're done, this is the sole return path)
            }
            // 6. Collect a sequence of characters that are not space characters,
            //    and let that be url.
            url = collectCharacters(regexLeadingNotSpaces);
            // 7. Let descriptors be a new empty list.
            descriptors = [];
            // 8. If url ends with a U+002C COMMA character (,), follow these substeps:
            //		(1). Remove all trailing U+002C COMMA characters from url. If this removed
            //         more than one character, that is a parse error.
            if (url.slice(-1) === ",") {
                url = url.replace(regexTrailingCommas, "");
                // (Jump ahead to step 9 to skip tokenization and just push the candidate).
                parseDescriptors();
            //	Otherwise, follow these substeps:
            } else {
                tokenize();
            } // (close else of step 8)
        // 16. Return to the step labeled splitting loop.
        } // (Close of big while loop.)
        /**
		 * Tokenizes descriptor properties prior to parsing
		 * Returns undefined.
		 */ function tokenize() {
            // 8.1. Descriptor tokeniser: Skip whitespace
            collectCharacters(regexLeadingSpaces);
            // 8.2. Let current descriptor be the empty string.
            currentDescriptor = "";
            // 8.3. Let state be in descriptor.
            state = "in descriptor";
            while(true){
                // 8.4. Let c be the character at position.
                c = input.charAt(pos);
                //  Do the following depending on the value of state.
                //  For the purpose of this step, "EOF" is a special character representing
                //  that position is past the end of input.
                // In descriptor
                if (state === "in descriptor") {
                    // Do the following, depending on the value of c:
                    // Space character
                    // If current descriptor is not empty, append current descriptor to
                    // descriptors and let current descriptor be the empty string.
                    // Set state to after descriptor.
                    if (isSpace(c)) {
                        if (currentDescriptor) {
                            descriptors.push(currentDescriptor);
                            currentDescriptor = "";
                            state = "after descriptor";
                        }
                    // U+002C COMMA (,)
                    // Advance position to the next character in input. If current descriptor
                    // is not empty, append current descriptor to descriptors. Jump to the step
                    // labeled descriptor parser.
                    } else if (c === ",") {
                        pos += 1;
                        if (currentDescriptor) {
                            descriptors.push(currentDescriptor);
                        }
                        parseDescriptors();
                        return;
                    // U+0028 LEFT PARENTHESIS (()
                    // Append c to current descriptor. Set state to in parens.
                    } else if (c === "\u0028") {
                        currentDescriptor = currentDescriptor + c;
                        state = "in parens";
                    // EOF
                    // If current descriptor is not empty, append current descriptor to
                    // descriptors. Jump to the step labeled descriptor parser.
                    } else if (c === "") {
                        if (currentDescriptor) {
                            descriptors.push(currentDescriptor);
                        }
                        parseDescriptors();
                        return;
                    // Anything else
                    // Append c to current descriptor.
                    } else {
                        currentDescriptor = currentDescriptor + c;
                    }
                // (end "in descriptor"
                // In parens
                } else if (state === "in parens") {
                    // U+0029 RIGHT PARENTHESIS ())
                    // Append c to current descriptor. Set state to in descriptor.
                    if (c === ")") {
                        currentDescriptor = currentDescriptor + c;
                        state = "in descriptor";
                    // EOF
                    // Append current descriptor to descriptors. Jump to the step labeled
                    // descriptor parser.
                    } else if (c === "") {
                        descriptors.push(currentDescriptor);
                        parseDescriptors();
                        return;
                    // Anything else
                    // Append c to current descriptor.
                    } else {
                        currentDescriptor = currentDescriptor + c;
                    }
                // After descriptor
                } else if (state === "after descriptor") {
                    // Do the following, depending on the value of c:
                    // Space character: Stay in this state.
                    if (isSpace(c)) {
                    // EOF: Jump to the step labeled descriptor parser.
                    } else if (c === "") {
                        parseDescriptors();
                        return;
                    // Anything else
                    // Set state to in descriptor. Set position to the previous character in input.
                    } else {
                        state = "in descriptor";
                        pos -= 1;
                    }
                }
                // Advance position to the next character in input.
                pos += 1;
            // Repeat this step.
            } // (close while true loop)
        }
        /**
		 * Adds descriptor properties to a candidate, pushes to the candidates array
		 * @return undefined
		 */ // Declared outside of the while loop so that it's only created once.
        function parseDescriptors() {
            // 9. Descriptor parser: Let error be no.
            var pError = false, // 10. Let width be absent.
            // 11. Let density be absent.
            // 12. Let future-compat-h be absent. (We're implementing it now as h)
            w, d, h, i, candidate = {}, desc, lastChar, value, intVal, floatVal;
            // 13. For each descriptor in descriptors, run the appropriate set of steps
            // from the following list:
            for(i = 0; i < descriptors.length; i++){
                desc = descriptors[i];
                lastChar = desc[desc.length - 1];
                value = desc.substring(0, desc.length - 1);
                intVal = parseInt(value, 10);
                floatVal = parseFloat(value);
                // If the descriptor consists of a valid non-negative integer followed by
                // a U+0077 LATIN SMALL LETTER W character
                if (regexNonNegativeInteger.test(value) && lastChar === "w") {
                    // If width and density are not both absent, then let error be yes.
                    if (w || d) {
                        pError = true;
                    }
                    // Apply the rules for parsing non-negative integers to the descriptor.
                    // If the result is zero, let error be yes.
                    // Otherwise, let width be the result.
                    if (intVal === 0) {
                        pError = true;
                    } else {
                        w = intVal;
                    }
                // If the descriptor consists of a valid floating-point number followed by
                // a U+0078 LATIN SMALL LETTER X character
                } else if (regexFloatingPoint.test(value) && lastChar === "x") {
                    // If width, density and future-compat-h are not all absent, then let error
                    // be yes.
                    if (w || d || h) {
                        pError = true;
                    }
                    // Apply the rules for parsing floating-point number values to the descriptor.
                    // If the result is less than zero, let error be yes. Otherwise, let density
                    // be the result.
                    if (floatVal < 0) {
                        pError = true;
                    } else {
                        d = floatVal;
                    }
                // If the descriptor consists of a valid non-negative integer followed by
                // a U+0068 LATIN SMALL LETTER H character
                } else if (regexNonNegativeInteger.test(value) && lastChar === "h") {
                    // If height and density are not both absent, then let error be yes.
                    if (h || d) {
                        pError = true;
                    }
                    // Apply the rules for parsing non-negative integers to the descriptor.
                    // If the result is zero, let error be yes. Otherwise, let future-compat-h
                    // be the result.
                    if (intVal === 0) {
                        pError = true;
                    } else {
                        h = intVal;
                    }
                // Anything else, Let error be yes.
                } else {
                    pError = true;
                }
            } // (close step 13 for loop)
            // 15. If error is still no, then append a new image source to candidates whose
            // URL is url, associated with a width width if not absent and a pixel
            // density density if not absent. Otherwise, there is a parse error.
            if (!pError) {
                candidate.url = url;
                if (w) {
                    candidate.w = w;
                }
                if (d) {
                    candidate.d = d;
                }
                if (h) {
                    candidate.h = h;
                }
                candidates.push(candidate);
            } else if (console && console.log) {
                console.log("Invalid srcset descriptor found in '" + input + "' at '" + desc + "'.");
            }
        } // (close parseDescriptors fn)
    };
});
}),
"[externals]/postcss [external] (postcss, cjs, [project]/node_modules/postcss)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("postcss-9745a0d11e3197ae", () => require("postcss-9745a0d11e3197ae"));

module.exports = mod;
}),
"[project]/node_modules/dayjs/dayjs.min.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

!function(t, e) {
    ("TURBOPACK compile-time truthy", 1) ? module.exports = e() : "TURBOPACK unreachable";
}(/*TURBOPACK member replacement*/ __turbopack_context__.e, function() {
    "use strict";
    var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = {
        name: "en",
        weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        ordinal: function(t) {
            var e = [
                "th",
                "st",
                "nd",
                "rd"
            ], n = t % 100;
            return "[" + t + (e[(n - 20) % 10] || e[n] || e[0]) + "]";
        }
    }, m = function(t, e, n) {
        var r = String(t);
        return !r || r.length >= e ? t : "" + Array(e + 1 - r.length).join(n) + t;
    }, v = {
        s: m,
        z: function(t) {
            var e = -t.utcOffset(), n = Math.abs(e), r = Math.floor(n / 60), i = n % 60;
            return (e <= 0 ? "+" : "-") + m(r, 2, "0") + ":" + m(i, 2, "0");
        },
        m: function t(e, n) {
            if (e.date() < n.date()) return -t(n, e);
            var r = 12 * (n.year() - e.year()) + (n.month() - e.month()), i = e.clone().add(r, c), s = n - i < 0, u = e.clone().add(r + (s ? -1 : 1), c);
            return +(-(r + (n - i) / (s ? i - u : u - i)) || 0);
        },
        a: function(t) {
            return t < 0 ? Math.ceil(t) || 0 : Math.floor(t);
        },
        p: function(t) {
            return ({
                M: c,
                y: h,
                w: o,
                d: a,
                D: d,
                h: u,
                m: s,
                s: i,
                ms: r,
                Q: f
            })[t] || String(t || "").toLowerCase().replace(/s$/, "");
        },
        u: function(t) {
            return void 0 === t;
        }
    }, g = "en", D = {};
    D[g] = M;
    var p = "$isDayjsObject", S = function(t) {
        return t instanceof _ || !(!t || !t[p]);
    }, w = function t(e, n, r) {
        var i;
        if (!e) return g;
        if ("string" == typeof e) {
            var s = e.toLowerCase();
            D[s] && (i = s), n && (D[s] = n, i = s);
            var u = e.split("-");
            if (!i && u.length > 1) return t(u[0]);
        } else {
            var a = e.name;
            D[a] = e, i = a;
        }
        return !r && i && (g = i), i || !r && g;
    }, O = function(t, e) {
        if (S(t)) return t.clone();
        var n = "object" == typeof e ? e : {};
        return n.date = t, n.args = arguments, new _(n);
    }, b = v;
    b.l = w, b.i = S, b.w = function(t, e) {
        return O(t, {
            locale: e.$L,
            utc: e.$u,
            x: e.$x,
            $offset: e.$offset
        });
    };
    var _ = function() {
        function M(t) {
            this.$L = w(t.locale, null, !0), this.parse(t), this.$x = this.$x || t.x || {}, this[p] = !0;
        }
        var m = M.prototype;
        return m.parse = function(t) {
            this.$d = function(t) {
                var e = t.date, n = t.utc;
                if (null === e) return new Date(NaN);
                if (b.u(e)) return new Date;
                if (e instanceof Date) return new Date(e);
                if ("string" == typeof e && !/Z$/i.test(e)) {
                    var r = e.match($);
                    if (r) {
                        var i = r[2] - 1 || 0, s = (r[7] || "0").substring(0, 3);
                        return n ? new Date(Date.UTC(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s)) : new Date(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s);
                    }
                }
                return new Date(e);
            }(t), this.init();
        }, m.init = function() {
            var t = this.$d;
            this.$y = t.getFullYear(), this.$M = t.getMonth(), this.$D = t.getDate(), this.$W = t.getDay(), this.$H = t.getHours(), this.$m = t.getMinutes(), this.$s = t.getSeconds(), this.$ms = t.getMilliseconds();
        }, m.$utils = function() {
            return b;
        }, m.isValid = function() {
            return !(this.$d.toString() === l);
        }, m.isSame = function(t, e) {
            var n = O(t);
            return this.startOf(e) <= n && n <= this.endOf(e);
        }, m.isAfter = function(t, e) {
            return O(t) < this.startOf(e);
        }, m.isBefore = function(t, e) {
            return this.endOf(e) < O(t);
        }, m.$g = function(t, e, n) {
            return b.u(t) ? this[e] : this.set(n, t);
        }, m.unix = function() {
            return Math.floor(this.valueOf() / 1e3);
        }, m.valueOf = function() {
            return this.$d.getTime();
        }, m.startOf = function(t, e) {
            var n = this, r = !!b.u(e) || e, f = b.p(t), l = function(t, e) {
                var i = b.w(n.$u ? Date.UTC(n.$y, e, t) : new Date(n.$y, e, t), n);
                return r ? i : i.endOf(a);
            }, $ = function(t, e) {
                return b.w(n.toDate()[t].apply(n.toDate("s"), (r ? [
                    0,
                    0,
                    0,
                    0
                ] : [
                    23,
                    59,
                    59,
                    999
                ]).slice(e)), n);
            }, y = this.$W, M = this.$M, m = this.$D, v = "set" + (this.$u ? "UTC" : "");
            switch(f){
                case h:
                    return r ? l(1, 0) : l(31, 11);
                case c:
                    return r ? l(1, M) : l(0, M + 1);
                case o:
                    var g = this.$locale().weekStart || 0, D = (y < g ? y + 7 : y) - g;
                    return l(r ? m - D : m + (6 - D), M);
                case a:
                case d:
                    return $(v + "Hours", 0);
                case u:
                    return $(v + "Minutes", 1);
                case s:
                    return $(v + "Seconds", 2);
                case i:
                    return $(v + "Milliseconds", 3);
                default:
                    return this.clone();
            }
        }, m.endOf = function(t) {
            return this.startOf(t, !1);
        }, m.$set = function(t, e) {
            var n, o = b.p(t), f = "set" + (this.$u ? "UTC" : ""), l = (n = {}, n[a] = f + "Date", n[d] = f + "Date", n[c] = f + "Month", n[h] = f + "FullYear", n[u] = f + "Hours", n[s] = f + "Minutes", n[i] = f + "Seconds", n[r] = f + "Milliseconds", n)[o], $ = o === a ? this.$D + (e - this.$W) : e;
            if (o === c || o === h) {
                var y = this.clone().set(d, 1);
                y.$d[l]($), y.init(), this.$d = y.set(d, Math.min(this.$D, y.daysInMonth())).$d;
            } else l && this.$d[l]($);
            return this.init(), this;
        }, m.set = function(t, e) {
            return this.clone().$set(t, e);
        }, m.get = function(t) {
            return this[b.p(t)]();
        }, m.add = function(r, f) {
            var d, l = this;
            r = Number(r);
            var $ = b.p(f), y = function(t) {
                var e = O(l);
                return b.w(e.date(e.date() + Math.round(t * r)), l);
            };
            if ($ === c) return this.set(c, this.$M + r);
            if ($ === h) return this.set(h, this.$y + r);
            if ($ === a) return y(1);
            if ($ === o) return y(7);
            var M = (d = {}, d[s] = e, d[u] = n, d[i] = t, d)[$] || 1, m = this.$d.getTime() + r * M;
            return b.w(m, this);
        }, m.subtract = function(t, e) {
            return this.add(-1 * t, e);
        }, m.format = function(t) {
            var e = this, n = this.$locale();
            if (!this.isValid()) return n.invalidDate || l;
            var r = t || "YYYY-MM-DDTHH:mm:ssZ", i = b.z(this), s = this.$H, u = this.$m, a = this.$M, o = n.weekdays, c = n.months, f = n.meridiem, h = function(t, n, i, s) {
                return t && (t[n] || t(e, r)) || i[n].slice(0, s);
            }, d = function(t) {
                return b.s(s % 12 || 12, t, "0");
            }, $ = f || function(t, e, n) {
                var r = t < 12 ? "AM" : "PM";
                return n ? r.toLowerCase() : r;
            };
            return r.replace(y, function(t, r) {
                return r || function(t) {
                    switch(t){
                        case "YY":
                            return String(e.$y).slice(-2);
                        case "YYYY":
                            return b.s(e.$y, 4, "0");
                        case "M":
                            return a + 1;
                        case "MM":
                            return b.s(a + 1, 2, "0");
                        case "MMM":
                            return h(n.monthsShort, a, c, 3);
                        case "MMMM":
                            return h(c, a);
                        case "D":
                            return e.$D;
                        case "DD":
                            return b.s(e.$D, 2, "0");
                        case "d":
                            return String(e.$W);
                        case "dd":
                            return h(n.weekdaysMin, e.$W, o, 2);
                        case "ddd":
                            return h(n.weekdaysShort, e.$W, o, 3);
                        case "dddd":
                            return o[e.$W];
                        case "H":
                            return String(s);
                        case "HH":
                            return b.s(s, 2, "0");
                        case "h":
                            return d(1);
                        case "hh":
                            return d(2);
                        case "a":
                            return $(s, u, !0);
                        case "A":
                            return $(s, u, !1);
                        case "m":
                            return String(u);
                        case "mm":
                            return b.s(u, 2, "0");
                        case "s":
                            return String(e.$s);
                        case "ss":
                            return b.s(e.$s, 2, "0");
                        case "SSS":
                            return b.s(e.$ms, 3, "0");
                        case "Z":
                            return i;
                    }
                    return null;
                }(t) || i.replace(":", "");
            });
        }, m.utcOffset = function() {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m.diff = function(r, d, l) {
            var $, y = this, M = b.p(d), m = O(r), v = (m.utcOffset() - this.utcOffset()) * e, g = this - m, D = function() {
                return b.m(y, m);
            };
            switch(M){
                case h:
                    $ = D() / 12;
                    break;
                case c:
                    $ = D();
                    break;
                case f:
                    $ = D() / 3;
                    break;
                case o:
                    $ = (g - v) / 6048e5;
                    break;
                case a:
                    $ = (g - v) / 864e5;
                    break;
                case u:
                    $ = g / n;
                    break;
                case s:
                    $ = g / e;
                    break;
                case i:
                    $ = g / t;
                    break;
                default:
                    $ = g;
            }
            return l ? $ : b.a($);
        }, m.daysInMonth = function() {
            return this.endOf(c).$D;
        }, m.$locale = function() {
            return D[this.$L];
        }, m.locale = function(t, e) {
            if (!t) return this.$L;
            var n = this.clone(), r = w(t, e, !0);
            return r && (n.$L = r), n;
        }, m.clone = function() {
            return b.w(this.$d, this);
        }, m.toDate = function() {
            return new Date(this.valueOf());
        }, m.toJSON = function() {
            return this.isValid() ? this.toISOString() : null;
        }, m.toISOString = function() {
            return this.$d.toISOString();
        }, m.toString = function() {
            return this.$d.toUTCString();
        }, M;
    }(), Y = _.prototype;
    return O.prototype = Y, [
        [
            "$ms",
            r
        ],
        [
            "$s",
            i
        ],
        [
            "$m",
            s
        ],
        [
            "$H",
            u
        ],
        [
            "$W",
            a
        ],
        [
            "$M",
            c
        ],
        [
            "$y",
            h
        ],
        [
            "$D",
            d
        ]
    ].forEach(function(t) {
        Y[t[1]] = function(e) {
            return this.$g(e, t[0], t[1]);
        };
    }), O.extend = function(t, e) {
        return t.$i || (t(e, _, O), t.$i = !0), O;
    }, O.locale = w, O.isDayjs = S, O.unix = function(t) {
        return O(1e3 * t);
    }, O.en = D[g], O.Ls = D, O.p = {}, O;
});
}),
"[project]/node_modules/launder/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const dayjs = __turbopack_context__.r("[project]/node_modules/dayjs/dayjs.min.js [app-ssr] (ecmascript)");
// Strip characters browsers ignore inside URLs (control chars and
// embedded HTML comments) that are commonly used to sneak XSS
// payloads past simple scheme checks.
function cleanHref(href) {
    // Browsers ignore character codes of 32 (space) and below in a surprising
    // number of situations. Start reading here:
    // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Embedded_tab
    // eslint-disable-next-line no-control-regex
    href = href.replace(/[\x00-\x20]+/g, '');
    // Clobber any comments in URLs, which the browser might
    // interpret inside an XML data island, allowing
    // a javascript: URL to be snuck through
    while(true){
        const firstIndex = href.indexOf('<!--');
        if (firstIndex === -1) {
            break;
        }
        const lastIndex = href.indexOf('-->', firstIndex + 4);
        if (lastIndex === -1) {
            break;
        }
        href = href.substring(0, firstIndex) + href.substring(lastIndex + 3);
    }
    return href;
}
// Returns true if `href` should be rejected as unsafe. Used to block
// `javascript:`, `data:` and other dangerous schemes both when
// validating URL fields and when sanitizing HTML attribute values.
//
// `options.allowedSchemes` is an array of permitted URL schemes
// (defaults to the schemes long permitted by `launder().url`).
// `options.allowProtocolRelative` controls whether protocol-relative
// URLs (e.g. `//example.com`) are permitted. Defaults to true.
function naughtyHref(href, options) {
    options = options || {};
    const allowedSchemes = options.allowedSchemes || [
        'http',
        'https',
        'ftp',
        'mailto',
        'tel',
        'sms'
    ];
    const allowProtocolRelative = options.allowProtocolRelative !== false;
    if (typeof href !== 'string') {
        return false;
    }
    href = cleanHref(href);
    // Case insensitive so we don't get faked out by JAVASCRIPT #1
    // Allow more characters after the first so we don't get faked
    // out by certain schemes browsers accept
    const matches = href.match(/^([a-zA-Z][a-zA-Z0-9.\-+]*):/);
    if (!matches) {
        // Protocol-relative URL starting with any combination of '/' and '\'
        if (href.match(/^[/\\]{2}/)) {
            return !allowProtocolRelative;
        }
        // No scheme
        return false;
    }
    const scheme = matches[1].toLowerCase();
    return allowedSchemes.indexOf(scheme) === -1;
}
module.exports = function(options) {
    const self = {};
    self.options = options || {};
    self.filterTag = self.options.filterTag || function(tag) {
        tag = tag.trim();
        return tag.toLowerCase();
    };
    self.string = function(s, def) {
        if (typeof s !== 'string') {
            if (typeof s === 'number' || typeof s === 'boolean') {
                s += '';
            } else {
                s = '';
            }
        }
        s = s.trim();
        if (def !== undefined) {
            if (s === '') {
                s = def;
            }
        }
        return s;
    };
    self.strings = function(strings) {
        if (!Array.isArray(strings)) {
            return [];
        }
        return strings.map(function(s) {
            return self.string(s);
        });
    };
    self.integer = function(i, def, min, max) {
        if (def === undefined) {
            def = 0;
        }
        if (typeof i === 'number') {
            i = Math.floor(i);
        } else {
            try {
                i = parseInt(i, 10);
                if (isNaN(i)) {
                    i = def;
                }
            } catch (e) {
                i = def;
            }
        }
        if (typeof min === 'number' && i < min) {
            i = min;
        }
        if (typeof max === 'number' && i > max) {
            i = max;
        }
        return i;
    };
    self.padInteger = function(i, places) {
        let s = i + '';
        while(s.length < places){
            s = '0' + s;
        }
        return s;
    };
    self.float = function(i, def, min, max) {
        if (def === undefined) {
            def = 0;
        }
        if (!(typeof i === 'number')) {
            try {
                i = parseFloat(i, 10);
                if (isNaN(i)) {
                    i = def;
                }
            } catch (e) {
                i = def;
            }
        }
        if (typeof min === 'number' && i < min) {
            i = min;
        }
        if (typeof max === 'number' && i > max) {
            i = max;
        }
        return i;
    };
    self.naughtyHref = naughtyHref;
    self.url = function(s, def, httpsFix) {
        s = self.string(s, def);
        // Allow the default to be undefined, null, false, etc.
        if (s === def) {
            return s;
        }
        // Strip characters browsers ignore that are commonly used to
        // smuggle dangerous schemes past validation.
        s = cleanHref(s);
        // Reject naughty URLs (e.g. `javascript:`, `data:`) before fixUrl
        // runs. Otherwise fixUrl could mask such schemes by prepending
        // `https://` to anything containing a `.`, turning
        // `javascript:alert(document.domain)` into a syntactically odd
        // but accepted `https://...` URL.
        if (naughtyHref(s)) {
            return def;
        }
        s = fixUrl(s);
        if (s === null) {
            return def;
        }
        return s;
        //TURBOPACK unreachable
        ;
        function fixUrl(href) {
            if (href.match(/^(((https?|ftp):\/\/)|((mailto|tel|sms):)|#|([^/.]+)?\/|[^/.]+$)/)) {
                // All good - no change required
                return href;
            } else if (href.match(/^[^/.]+\.[^/.]+/)) {
                // Smells like a domain name. Educated guess: they left off http://
                const protocol = httpsFix ? 'https://' : 'http://';
                return protocol + href;
            } else {
                return null;
            }
        }
    };
    self.select = function(s, choices, def) {
        s = self.string(s);
        if (!choices || !choices.length) {
            return def;
        }
        let choice;
        if (typeof choices[0] === 'object') {
            choice = choices.find(function(choice) {
                if (choice.value === null || choice.value === undefined) {
                    // Don't crash on invalid choices
                    return false;
                }
                return choice.value.toString() === s;
            });
            if (choice != null) {
                return choice.value;
            }
            return def;
        }
        choice = choices.find(function(choice) {
            if (choice === null || choice === undefined) {
                // Don't crash on invalid choices
                return false;
            }
            return choice.toString() === s;
        });
        if (choice !== undefined) {
            return choice;
        }
        return def;
    };
    self.boolean = function(b, def) {
        if (b === true) {
            return true;
        }
        if (b === false) {
            return false;
        }
        b = self.string(b, def);
        if (b === def) {
            if (b === undefined) {
                return false;
            }
            return b;
        }
        b = b.toLowerCase().charAt(0);
        if (b === '' || b === 'n' || b === '0' || b === 'f') {
            return false;
        }
        if (b === 't' || b === 'y' || b === '1') {
            return true;
        }
        return false;
    };
    // Given an `options` object in which options[name] is a string
    // set to '0', '1', or 'any', this method adds mongodb criteria
    // to the `criteria` object.
    //
    // '0' or false means "the property must be false or absent," '1' or true
    // means "the property must be true," and 'any' or null means "we don't care
    // what the property is."
    //
    // See `booleanOrNull` for additional synonyms accepted for the
    // three possible values.
    //
    // An empty string is considered equivalent to '0'.
    //
    // This is not the same as apos.sanitizeBoolean which is concerned only with
    // true or false and does not address "any."
    //
    // `def` defaults to `any`.
    //
    // This method is most often used with REST API parameters and forms.
    self.addBooleanFilterToCriteria = function(options, name, criteria, def) {
        // if any or null, we aren't changing criteria
        if (def === undefined) {
            def = null;
        }
        // allow object or boolean
        let value = typeof options === 'object' && options !== null ? options[name] : options;
        value = value === undefined ? def : value;
        value = self.booleanOrNull(value);
        if (value === null) {
        // Don't care, show all
        } else if (!value) {
            // Must be absent or false. Hooray for $ne
            criteria[name] = {
                $ne: true
            };
        } else {
            // Must be true
            criteria[name] = true;
        }
    };
    // This method is used for tristate filters, i.e. "published,"
    // "unpublished", and "show me both".
    //
    // Accepts `true`, `false`, or `null` and returns them exactly
    // as such; if the parameter is none of those or their synonyms
    // below, returns `def`.
    //
    // Also accepts the strings `'yes'` (or starting with y), `'no'` (or
    // starting with n), `'true'` (or starting with t), `'false'`
    // (or starting with f), `'1'`, `'0'` and the strings `'any'` and
    // `'null'`. The string `'null'` must be an exact match, anything
    // else starting with `n` is taken as `no` (false).
    //
    // These various synonyms are useful for string input, such as from
    // a user friendly query string.
    self.booleanOrNull = function(b, def) {
        if (b === true) {
            return b;
        }
        if (b === false) {
            return b;
        }
        if (b === null) {
            return b;
        }
        b = self.string(b, def);
        if (b === def) {
            if (def === undefined) {
                return null;
            }
            return b;
        }
        // String 'null' must match as a full string to disambiguate from string 'n' for 'no'
        if (b === 'null') {
            return null;
        }
        b = b.toLowerCase().charAt(0);
        if (b === '' || b === 'n' || b === '0' || b === 'f') {
            return false;
        }
        if (b === 't' || b === 'y' || b === '1') {
            return true;
        }
        if (b === 'a') {
            return null;
        }
        return def;
    };
    // Accept a user-entered string in YYYY-MM-DD, MM/DD, MM/DD/YY, or MM/DD/YYYY format
    // (tolerates missing leading zeroes on MM and DD). Also accepts a Date object.
    // Returns YYYY-MM-DD.
    //
    // The current year is assumed when MM/DD is used. If there is no explicit default
    // any unparseable date is returned as today's date.
    //
    // If the default is explicitly `null` (not `undefined`) then `null` is returned for
    // any unparseable date.
    //
    // The `now` argument can be passed for performance if you prefer to call
    // `new Date()` just once before many calls to this method and pass that single
    // value to all of them.
    self.date = function(date, def, now) {
        let components;
        function returnDefault() {
            if (def === undefined) {
                def = dayjs().format('YYYY-MM-DD');
            }
            return def;
        }
        if (typeof date === 'string') {
            if (date.match(/\//)) {
                components = date.split('/');
                if (components.length === 2) {
                    // Convert mm/dd to yyyy-mm-dd
                    return (now || new Date()).getFullYear() + '-' + self.padInteger(components[0], 2) + '-' + self.padInteger(components[1], 2);
                } else if (components.length === 3) {
                    // Convert mm/dd/yy to mm/dd/yyyy
                    if (components[2] < 100) {
                        // Add the current century. If the result is more than
                        // 50 years in the future, assume they meant the
                        // previous century. Thus in 2015, we find that
                        // we get the intuitive result for both 1/1/75,
                        // 1/1/99 and 1/1/25. It's a nasty habit among
                        // us imprecise humans. -Tom
                        const d = now || new Date();
                        const nowYear = d.getFullYear() % 100;
                        const nowCentury = d.getFullYear() - nowYear;
                        let theirYear = parseInt(components[2]) + nowCentury;
                        if (theirYear - d.getFullYear() > 50) {
                            theirYear -= 100;
                        }
                        components[2] = theirYear;
                    }
                    // Convert mm/dd/yyyy to yyyy-mm-dd
                    return self.padInteger(components[2], 4) + '-' + self.padInteger(components[0], 2) + '-' + self.padInteger(components[1], 2);
                } else {
                    return returnDefault();
                }
            } else if (date.match(/-/)) {
                components = date.split('-');
                if (components.length === 2) {
                    // Convert mm-dd to yyyy-mm-dd
                    return (now || new Date()).getFullYear() + '-' + self.padInteger(components[0], 2) + '-' + self.padInteger(components[1], 2);
                } else if (components.length === 3) {
                    // Convert yyyy-mm-dd (with questionable padding) to yyyy-mm-dd
                    return self.padInteger(components[0], 4) + '-' + self.padInteger(components[1], 2) + '-' + self.padInteger(components[2], 2);
                } else {
                    return returnDefault();
                }
            }
        }
        try {
            if (date === null) {
                return returnDefault();
            }
            date = now || new Date(date);
            if (isNaN(date.getTime())) {
                return returnDefault();
            }
            return date.getFullYear() + '-' + self.padInteger(date.getMonth() + 1, 2) + '-' + self.padInteger(date.getDate(), 2);
        } catch (e) {
            return returnDefault();
        }
    };
    // This is likely not relevent to you unless you're using Apostrophe
    // Given a date object, return a date string in Apostrophe's preferred sortable,
    // comparable, JSON-able format, which is YYYY-MM-DD. If `date` is undefined
    // the current date is used.
    self.formatDate = function(date) {
        return dayjs(date).format('YYYY-MM-DD');
    };
    // Accepts a user-entered string in 12-hour or 24-hour time and returns a string
    // in 24-hour time. This method is tolerant of syntax such as `4pm`; minutes and
    // seconds are optional.
    //
    // If `def` is not set the default is the current time.
    self.time = function(time, def) {
        time = self.string(time).toLowerCase();
        time = time.trim();
        const components = time.match(/^(\d+)([:|.](\d+))?([:|.](\d+))?\s*(am|pm|AM|PM|a|p|A|M)?$/);
        if (components) {
            let hours = parseInt(components[1], 10);
            const minutes = components[3] !== undefined ? parseInt(components[3], 10) : 0;
            const seconds = components[5] !== undefined ? parseInt(components[5], 10) : 0;
            let ampm = components[6] ? components[6].toLowerCase() : components[6];
            ampm = ampm && ampm.charAt(0);
            if (hours === 12 && ampm === 'a') {
                hours -= 12;
            } else if (hours === 12 && ampm === 'p') {
            // Leave it be
            } else if (ampm === 'p') {
                hours += 12;
            }
            if (hours === 24 || hours === '24') {
                hours = 0;
            }
            return self.padInteger(hours, 2) + ':' + self.padInteger(minutes, 2) + ':' + self.padInteger(seconds, 2);
        } else {
            if (def !== undefined) {
                return def;
            }
            return dayjs().format('HH:mm');
        }
    };
    // This is likely not relevent to you unless you're using Apostrophe
    // Given a JavaScript Date object, return a time string in
    // Apostrophe's preferred sortable, comparable, JSON-able format:
    // 24-hour time, with seconds.
    //
    // If `date` is missing the current time is used.
    self.formatTime = function(date) {
        return dayjs(date).format('HH:mm:ss');
    };
    // Sanitize tags. Tags should be submitted as an array of strings,
    // or a comma-separated string.
    //
    // This method ensures the input is an array or string and, if
    // an array, that the elements of the array are strings.
    //
    // If a filterTag function is passed as an option when initializing
    // Launder, then all tags are passed through it (as individual
    // strings, one per call) and the return value is used instead. You
    // may also pass a filterTag when calling this function
    self.tags = function(tags, filter) {
        if (typeof tags === 'string') {
            tags = tags.split(/,\s*/);
        }
        if (!Array.isArray(tags)) {
            return [];
        }
        const strings = tags.map((tag)=>self.string(tag));
        const rewritten = strings.map(filter || self.filterTag);
        const filtered = rewritten.filter((tag)=>tag.length > 0);
        return filtered;
    };
    // Sanitize an id. IDs must consist solely of upper and lower case
    // letters, numbers, and digits unless options.idRegExp is set.
    self.idRegExp = self.options.idRegExp || /^[A-Za-z0-9_]+$/;
    self.id = function(s, def) {
        const id = self.string(s, def);
        if (id === def) {
            return id;
        }
        if (!id.match(self.idRegExp)) {
            return def;
        }
        return id;
    };
    // Sanitize an array of IDs. IDs must consist solely of upper and lower case
    // letters and numbers, digits, and underscores. Any elements that are not
    // IDs are omitted from the final array.
    self.ids = function(ids) {
        if (!Array.isArray(ids)) {
            return [];
        }
        const result = ids.filter(function(id) {
            return self.id(id) !== undefined;
        });
        return result;
    };
    return self;
};
// Expose `naughtyHref` statically so callers (notably sanitize-html)
// can use it without instantiating a launder.
module.exports.naughtyHref = naughtyHref;
}),
"[project]/node_modules/sanitize-html/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const htmlparser = __turbopack_context__.r("[project]/node_modules/sanitize-html/node_modules/htmlparser2/dist/index.js [app-ssr] (ecmascript)");
const escapeStringRegexp = __turbopack_context__.r("[project]/node_modules/escape-string-regexp/index.js [app-ssr] (ecmascript)");
const { isPlainObject } = __turbopack_context__.r("[project]/node_modules/is-plain-object/dist/is-plain-object.js [app-ssr] (ecmascript)");
const parseSrcset = __turbopack_context__.r("[project]/node_modules/parse-srcset/src/parse-srcset.js [app-ssr] (ecmascript)");
const { parse: postcssParse } = __turbopack_context__.r("[externals]/postcss [external] (postcss, cjs, [project]/node_modules/postcss)");
const { naughtyHref: launderNaughtyHref } = __turbopack_context__.r("[project]/node_modules/launder/index.js [app-ssr] (ecmascript)");
// Tags that can conceivably represent stand-alone media.
const mediaTags = [
    'img',
    'audio',
    'video',
    'picture',
    'svg',
    'object',
    'map',
    'iframe',
    'embed'
];
// Tags that are inherently vulnerable to being used in XSS attacks.
const vulnerableTags = [
    'script',
    'style'
];
// SVG SMIL animation elements. These do not carry a URL themselves: they
// retarget an attribute of another element, naming it with `attributeName`
// and supplying the new value(s) in `values`, `from`, `to` and `by`.
const svgAnimationTags = [
    'animate',
    'animatecolor',
    'animatemotion',
    'animatetransform',
    'set'
];
// Attribute names that always name a URL sink, whatever
// `allowedSchemesAppliedToAttributes` has been narrowed to. A namespace prefix
// is ignored when matching, so `xlink:href` and any other prefixed spelling of
// `href` are covered.
const alwaysUrlAttributes = [
    'href'
];
// Our own diagnostics. A console-shaped `logger` option takes them instead of
// the console; missing methods fall back to it.
const severities = [
    'debug',
    'info',
    'warn',
    'error'
];
function loggerFor(options) {
    const source = options && options.logger || console;
    const logger = {};
    for (const severity of severities){
        logger[severity] = typeof source[severity] === 'function' ? (...args)=>source[severity](...args) : (...args)=>console[severity](...args);
    }
    return logger;
}
function each(obj, cb) {
    if (obj) {
        Object.keys(obj).forEach(function(key) {
            cb(obj[key], key);
        });
    }
}
// Avoid false positives with .__proto__, .hasOwnProperty, etc.
function has(obj, key) {
    return ({}).hasOwnProperty.call(obj, key);
}
// Combine the tag-specific and wildcard lists of allowed classes
function mergeClasses(specific, wildcard) {
    if (!Array.isArray(specific) || !Array.isArray(wildcard)) {
        return wildcard;
    }
    return specific.concat(wildcard);
}
// Combine the tag-specific and wildcard allowed styles, concatenating the
// lists of regular expressions for properties that appear in both. The result
// has no prototype, so a property named `__proto__` is just another property
function mergeStyles(specific, wildcard) {
    const merged = Object.create(null);
    for (const rules of [
        specific,
        wildcard
    ]){
        for (const prop of Object.keys(rules)){
            merged[prop] = has(merged, prop) ? merged[prop].concat(rules[prop]) : rules[prop];
        }
    }
    return merged;
}
// Returns those elements of `a` for which `cb(a)` returns truthy
function filter(a, cb) {
    const n = [];
    each(a, function(v) {
        if (cb(v)) {
            n.push(v);
        }
    });
    return n;
}
function isEmptyObject(obj) {
    for(const key in obj){
        if (has(obj, key)) {
            return false;
        }
    }
    return true;
}
function stringifySrcset(parsedSrcset) {
    return parsedSrcset.map(function(part) {
        if (!part.url) {
            throw new Error('URL missing');
        }
        return part.url + (part.w ? ` ${part.w}w` : '') + (part.h ? ` ${part.h}h` : '') + (part.d ? ` ${part.d}x` : '');
    }).join(', ');
}
module.exports = sanitizeHtml;
// A valid attribute name.
// We use a tolerant definition based on the set of strings defined by
// html.spec.whatwg.org/multipage/parsing.html#before-attribute-name-state
// and html.spec.whatwg.org/multipage/parsing.html#attribute-name-state .
// The characters accepted are ones which can be appended to the attribute
// name buffer without triggering a parse error:
//   * unexpected-equals-sign-before-attribute-name
//   * unexpected-null-character
//   * unexpected-character-in-attribute-name
// We exclude the empty string because it's impossible to get to the after
// attribute name state with an empty attribute name buffer.
const VALID_HTML_ATTRIBUTE_NAME = /^[^\0\t\n\f\r /<=>]+$/;
// How many discarded <iframe> elements can be nested while their fallback
// markup is still re-sanitized as HTML (see the `ontext` handler). Deeper
// fallback is escaped as text, so that crafted input cannot recurse without
// bound or re-parse the remainder of the input once per iframe
// (GHSA-c9rx-x947-fp3h).
const MAX_IFRAME_FALLBACK_DEPTH = 8;
// `_fallback` is internal: it is set when re-sanitizing the fallback markup
// of a discarded <iframe>, to carry the current nesting depth into the
// recursive call.
function sanitizeHtml(html, options, _fallback) {
    if (html == null) {
        return '';
    }
    const baseDepth = _fallback && _fallback.depth || 0;
    const iframeFallbackDepth = _fallback && _fallback.iframeFallbackDepth || 0;
    if (typeof html === 'number') {
        html = html.toString();
    }
    let result = '';
    // Used for hot swapping the result variable with an empty string
    // in order to "capture" the text written to it.
    let tempResult = '';
    function Frame(tag, attribs) {
        const that = this;
        this.tag = tag;
        this.attribs = attribs || {};
        this.tagPosition = result.length;
        this.text = ''; // Node inner text
        this.openingTagLength = 0;
        this.mediaChildren = [];
        this.updateParentNodeText = function() {
            if (stack.length) {
                const parentFrame = stack[stack.length - 1];
                parentFrame.text += that.text;
            }
        };
        this.updateParentNodeMediaChildren = function() {
            if (stack.length && mediaTags.includes(this.tag)) {
                const parentFrame = stack[stack.length - 1];
                parentFrame.mediaChildren.push(this.tag);
            }
        };
    }
    options = Object.assign({}, sanitizeHtml.defaults, options);
    options.parser = Object.assign({}, htmlParserDefaults, options.parser);
    const logger = loggerFor(options);
    const tagAllowed = function(name) {
        return options.allowedTags === false || (options.allowedTags || []).indexOf(name) > -1;
    };
    // vulnerableTags
    vulnerableTags.forEach(function(tag) {
        if (tagAllowed(tag) && !options.allowVulnerableTags) {
            logger.warn(`Your \`allowedTags\` option includes \`${tag}\`, which is inherently ` + 'vulnerable to XSS attacks. Please remove it from `allowedTags`, or, ' + 'to disable this warning, add the `allowVulnerableTags` option and ' + 'ensure you are accounting for this risk.');
        }
    });
    // Tags that contain something other than HTML, or where discarding
    // the text when the tag is disallowed makes sense for other reasons.
    // If we are not allowing these tags, we should drop their content too.
    // For other tags you would drop the tag but keep its content.
    // `xmp` is included because htmlparser2 treats it as a raw-text element,
    // so markup inside is parsed as text on input but would otherwise be
    // re-emitted unescaped via the `ontext` branch below, allowing XSS bypass
    // when `xmp` is disallowed (which is the default).
    const nonTextTagsArray = options.nonTextTags || [
        'script',
        'style',
        'textarea',
        'option',
        'xmp'
    ];
    let allowedAttributesMap;
    let allowedAttributesGlobMap;
    if (options.allowedAttributes) {
        allowedAttributesMap = {};
        allowedAttributesGlobMap = {};
        each(options.allowedAttributes, function(attributes, tag) {
            allowedAttributesMap[tag] = [];
            const globRegex = [];
            attributes.forEach(function(obj) {
                if (typeof obj === 'string' && obj.indexOf('*') >= 0) {
                    globRegex.push(escapeStringRegexp(obj).replace(/\\\*/g, '.*'));
                } else {
                    allowedAttributesMap[tag].push(obj);
                }
            });
            if (globRegex.length) {
                allowedAttributesGlobMap[tag] = new RegExp('^(' + globRegex.join('|') + ')$');
            }
        });
    }
    const allowedClassesMap = {};
    const allowedClassesGlobMap = {};
    const allowedClassesRegexMap = {};
    each(options.allowedClasses, function(classes, tag) {
        // Implicitly allows the class attribute
        if (allowedAttributesMap) {
            if (!has(allowedAttributesMap, tag)) {
                allowedAttributesMap[tag] = [];
            }
            allowedAttributesMap[tag].push('class');
        }
        allowedClassesMap[tag] = classes;
        if (Array.isArray(classes)) {
            const globRegex = [];
            allowedClassesMap[tag] = [];
            allowedClassesRegexMap[tag] = [];
            classes.forEach(function(obj) {
                if (typeof obj === 'string' && obj.indexOf('*') >= 0) {
                    globRegex.push(escapeStringRegexp(obj).replace(/\\\*/g, '.*'));
                } else if (obj instanceof RegExp) {
                    allowedClassesRegexMap[tag].push(obj);
                } else {
                    allowedClassesMap[tag].push(obj);
                }
            });
            if (globRegex.length) {
                allowedClassesGlobMap[tag] = new RegExp('^(' + globRegex.join('|') + ')$');
            }
        }
    });
    const transformTagsMap = {};
    let transformTagsAll;
    each(options.transformTags, function(transform, tag) {
        let transFun;
        if (typeof transform === 'function') {
            transFun = transform;
        } else if (typeof transform === 'string') {
            transFun = sanitizeHtml.simpleTransform(transform);
        }
        if (tag === '*') {
            transformTagsAll = transFun;
        } else {
            transformTagsMap[tag] = transFun;
        }
    });
    let depth;
    let stack;
    let skipMap;
    let transformMap;
    let skipText;
    let skipTextDepth;
    // Browsers (with scripting enabled) parse <noscript> content as raw text up
    // to the first `</noscript`, but htmlparser2 parses it as markup, so an end
    // tag for an ancestor can make htmlparser2 close the <noscript> implicitly
    // much earlier. `rawTextEnd` is the source offset where the browser ends the
    // <noscript> being discarded, and `skipRawText` is set while htmlparser2 has
    // already closed it but the browser has not, so that we keep discarding
    // until we reach that offset (GHSA-x3q4-9hxx-gx8m).
    let rawTextEnd;
    let skipRawText;
    let addedText = false;
    initializeState();
    const parser = new htmlparser.Parser({
        onopentag: function(name, attribs) {
            if (options.onOpenTag) {
                options.onOpenTag(name, attribs);
            }
            updateRawTextRegion();
            // If `enforceHtmlBoundary` is `true` and this has found the opening
            // `html` tag, reset the state.
            if (options.enforceHtmlBoundary && name === 'html') {
                initializeState();
            }
            if (skipRawText) {
                return;
            }
            if (skipText) {
                skipTextDepth++;
                return;
            }
            const frame = new Frame(name, attribs);
            stack.push(frame);
            let skip = false;
            const hasText = !!frame.text;
            let transformedTag;
            if (has(transformTagsMap, name)) {
                transformedTag = transformTagsMap[name](name, attribs);
                frame.attribs = attribs = transformedTag.attribs;
                if (transformedTag.text !== undefined) {
                    frame.innerText = transformedTag.text;
                }
                if (name !== transformedTag.tagName) {
                    frame.name = name = transformedTag.tagName;
                    transformMap[depth] = transformedTag.tagName;
                }
            }
            if (transformTagsAll) {
                transformedTag = transformTagsAll(name, attribs);
                frame.attribs = attribs = transformedTag.attribs;
                if (name !== transformedTag.tagName) {
                    frame.name = name = transformedTag.tagName;
                    transformMap[depth] = transformedTag.tagName;
                }
            }
            if (!tagAllowed(name) || animatesUrlAttribute(name, attribs) || options.disallowedTagsMode === 'recursiveEscape' && !isEmptyObject(skipMap) || options.nestingLimit != null && depth >= options.nestingLimit) {
                skip = true;
                skipMap[depth] = true;
                if (options.disallowedTagsMode === 'discard' || options.disallowedTagsMode === 'completelyDiscard') {
                    if (nonTextTagsArray.indexOf(name) !== -1) {
                        skipText = true;
                        skipTextDepth = 1;
                        if (frame.tag.toLowerCase() === 'noscript') {
                            rawTextEnd = findRawTextEnd('noscript', parser.endIndex + 1);
                        }
                    }
                }
            }
            depth++;
            if (skip) {
                if (options.disallowedTagsMode === 'discard' || options.disallowedTagsMode === 'completelyDiscard') {
                    // We want the contents but not this tag
                    if (frame.innerText && !hasText) {
                        const escaped = escapeHtml(frame.innerText);
                        if (options.textFilter) {
                            result += options.textFilter(escaped, name);
                        } else {
                            result += escaped;
                        }
                        addedText = true;
                    }
                    return;
                }
                tempResult = result;
                result = '';
            }
            result += '<' + name;
            if (name === 'script') {
                if (options.allowedScriptHostnames || options.allowedScriptDomains) {
                    frame.innerText = '';
                }
            }
            const isBeingEscaped = skip && (options.disallowedTagsMode === 'escape' || options.disallowedTagsMode === 'recursiveEscape');
            const shouldPreserveEscapedAttributes = isBeingEscaped && options.preserveEscapedAttributes;
            if (shouldPreserveEscapedAttributes) {
                each(attribs, function(value, a) {
                    result += ' ' + a + '="' + escapeHtml(value || '', true) + '"';
                });
            } else if (!allowedAttributesMap || has(allowedAttributesMap, name) || allowedAttributesMap['*']) {
                each(attribs, function(value, a) {
                    if (!VALID_HTML_ATTRIBUTE_NAME.test(a)) {
                        // This prevents part of an attribute name in the output from being
                        // interpreted as the end of an attribute, or end of a tag.
                        delete frame.attribs[a];
                        return;
                    }
                    // If the value is empty, check if the attribute is
                    // in the allowedEmptyAttributes array.
                    // If it is not in the allowedEmptyAttributes array,
                    // and it is a known non-boolean attribute, delete it
                    // List taken from https://html.spec.whatwg.org/multipage/indices.html#attributes-3
                    if (value === '' && !options.allowedEmptyAttributes.includes(a) && (options.nonBooleanAttributes.includes(a) || options.nonBooleanAttributes.includes('*'))) {
                        delete frame.attribs[a];
                        return;
                    }
                    // check allowedAttributesMap for the element and attribute and modify the value
                    // as necessary if there are specific values defined.
                    let passedAllowedAttributesMapCheck = false;
                    if (!allowedAttributesMap || has(allowedAttributesMap, name) && allowedAttributesMap[name].indexOf(a) !== -1 || allowedAttributesMap['*'] && allowedAttributesMap['*'].indexOf(a) !== -1 || has(allowedAttributesGlobMap, name) && allowedAttributesGlobMap[name].test(a) || allowedAttributesGlobMap['*'] && allowedAttributesGlobMap['*'].test(a)) {
                        passedAllowedAttributesMapCheck = true;
                    } else if (allowedAttributesMap && allowedAttributesMap[name]) {
                        for (const o of allowedAttributesMap[name]){
                            if (isPlainObject(o) && o.name && o.name === a) {
                                passedAllowedAttributesMapCheck = true;
                                let newValue = '';
                                if (o.multiple === true) {
                                    // verify the values that are allowed
                                    const splitStrArray = value.split(' ');
                                    for (const s of splitStrArray){
                                        if (o.values.indexOf(s) !== -1) {
                                            if (newValue === '') {
                                                newValue = s;
                                            } else {
                                                newValue += ' ' + s;
                                            }
                                        }
                                    }
                                } else if (o.values.indexOf(value) >= 0) {
                                    // verified an allowed value matches the entire attribute value
                                    newValue = value;
                                }
                                value = newValue;
                            }
                        }
                    }
                    if (passedAllowedAttributesMapCheck) {
                        if (options.allowedSchemesAppliedToAttributes.indexOf(a) !== -1) {
                            if (naughtyHref(name, value)) {
                                delete frame.attribs[a];
                                return;
                            }
                        }
                        // `<meta http-equiv="refresh" content="0;url=...">` navigates to a
                        // URL embedded in `content`, so scheme check that URL too
                        // (GHSA-cv27-6wvh-8x7j). Other meta `content` values are left alone.
                        if (name === 'meta' && a.toLowerCase() === 'content' && isRefresh(attribs) && naughtyRefresh(value)) {
                            delete frame.attribs[a];
                            return;
                        }
                        if (name === 'script' && a === 'src') {
                            let allowed = true;
                            try {
                                const parsed = parseUrl(value);
                                if (options.allowedScriptHostnames || options.allowedScriptDomains) {
                                    const allowedHostname = (options.allowedScriptHostnames || []).find(function(hostname) {
                                        return hostname === parsed.url.hostname;
                                    });
                                    const allowedDomain = (options.allowedScriptDomains || []).find(function(domain) {
                                        return parsed.url.hostname === domain || parsed.url.hostname.endsWith(`.${domain}`);
                                    });
                                    allowed = allowedHostname || allowedDomain;
                                }
                            } catch (e) {
                                allowed = false;
                            }
                            if (!allowed) {
                                delete frame.attribs[a];
                                return;
                            }
                        }
                        if (name === 'iframe' && a === 'src') {
                            let allowed = true;
                            try {
                                const parsed = parseUrl(value);
                                if (parsed.isRelativeUrl) {
                                    // default value of allowIframeRelativeUrls is true
                                    // unless allowedIframeHostnames or allowedIframeDomains specified
                                    allowed = has(options, 'allowIframeRelativeUrls') ? options.allowIframeRelativeUrls : !options.allowedIframeHostnames && !options.allowedIframeDomains;
                                } else if (options.allowedIframeHostnames || options.allowedIframeDomains) {
                                    const allowedHostname = (options.allowedIframeHostnames || []).find(function(hostname) {
                                        return hostname === parsed.url.hostname;
                                    });
                                    const allowedDomain = (options.allowedIframeDomains || []).find(function(domain) {
                                        return parsed.url.hostname === domain || parsed.url.hostname.endsWith(`.${domain}`);
                                    });
                                    allowed = allowedHostname || allowedDomain;
                                }
                            } catch (e) {
                                // Unparseable iframe src
                                allowed = false;
                            }
                            if (!allowed) {
                                delete frame.attribs[a];
                                return;
                            }
                        }
                        if (a === 'srcset' || a === 'imagesrcset') {
                            try {
                                let parsed = parseSrcset(value);
                                parsed.forEach(function(value) {
                                    if (naughtyHref(name, value.url)) {
                                        value.evil = true;
                                    }
                                });
                                parsed = filter(parsed, function(v) {
                                    return !v.evil;
                                });
                                if (!parsed.length) {
                                    delete frame.attribs[a];
                                    return;
                                } else {
                                    value = stringifySrcset(filter(parsed, function(v) {
                                        return !v.evil;
                                    }));
                                    frame.attribs[a] = value;
                                }
                            } catch (e) {
                                // Unparseable srcset
                                delete frame.attribs[a];
                                return;
                            }
                        }
                        if (a === 'class') {
                            const allowedSpecificClasses = allowedClassesMap[name];
                            const allowedWildcardClasses = allowedClassesMap['*'];
                            const allowedSpecificClassesGlob = allowedClassesGlobMap[name];
                            const allowedSpecificClassesRegex = allowedClassesRegexMap[name];
                            const allowedWildcardClassesRegex = allowedClassesRegexMap['*'];
                            const allowedWildcardClassesGlob = allowedClassesGlobMap['*'];
                            const allowedClassesGlobs = [
                                allowedSpecificClassesGlob,
                                allowedWildcardClassesGlob
                            ].concat(allowedSpecificClassesRegex, allowedWildcardClassesRegex).filter(function(t) {
                                return t;
                            });
                            if (allowedSpecificClasses && allowedWildcardClasses) {
                                value = filterClasses(value, mergeClasses(allowedSpecificClasses, allowedWildcardClasses), allowedClassesGlobs);
                            } else {
                                value = filterClasses(value, allowedSpecificClasses || allowedWildcardClasses, allowedClassesGlobs);
                            }
                            if (!value.length) {
                                delete frame.attribs[a];
                                return;
                            }
                        }
                        if (a === 'style') {
                            if (options.parseStyleAttributes) {
                                try {
                                    const abstractSyntaxTree = postcssParse(name + ' {' + value + '}', {
                                        map: false
                                    });
                                    const filteredAST = filterCss(abstractSyntaxTree, options.allowedStyles);
                                    value = stringifyStyleAttributes(filteredAST);
                                    if (value.length === 0) {
                                        delete frame.attribs[a];
                                        return;
                                    }
                                } catch (e) {
                                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                                    ;
                                    delete frame.attribs[a];
                                    return;
                                }
                            } else if (options.allowedStyles) {
                                throw new Error('allowedStyles option cannot be used together with parseStyleAttributes: false.');
                            }
                        }
                        result += ' ' + a;
                        if (value && value.length) {
                            result += '="' + escapeHtml(value, true) + '"';
                        } else if (options.allowedEmptyAttributes.includes(a)) {
                            result += '=""';
                        }
                    } else {
                        delete frame.attribs[a];
                    }
                });
            }
            if (options.selfClosing.indexOf(name) !== -1) {
                result += ' />';
            } else {
                result += '>';
                if (frame.innerText && !hasText) {
                    const escaped = escapeHtml(frame.innerText);
                    if (options.textFilter) {
                        result += options.textFilter(escaped, name);
                    } else {
                        result += escaped;
                    }
                    addedText = true;
                }
            }
            if (skip) {
                result = tempResult + escapeHtml(result);
                tempResult = '';
            }
            frame.openingTagLength = result.length - frame.tagPosition;
        },
        ontext: function(text) {
            updateRawTextRegion();
            if (skipText || skipRawText) {
                return;
            }
            const lastFrame = stack[stack.length - 1];
            let tag;
            if (lastFrame) {
                tag = lastFrame.tag;
                // If inner text was set by transform function then let's use it
                text = lastFrame.innerText !== undefined ? lastFrame.innerText : text;
            }
            if (options.disallowedTagsMode === 'completelyDiscard' && !tagAllowed(tag)) {
                text = '';
            } else if (tag && tagAllowed(tag) && (options.disallowedTagsMode === 'discard' || options.disallowedTagsMode === 'completelyDiscard') && (tag === 'script' || tag === 'style')) {
                // htmlparser2 gives us these as-is. Escaping them ruins the content. Allowing
                // script tags is, by definition, game over for XSS protection, so if that's
                // your concern, don't allow them. The same is essentially true for style tags
                // which have their own collection of XSS vectors.
                result += text;
            } else if (tag && tagAllowed(tag) && (options.disallowedTagsMode === 'discard' || options.disallowedTagsMode === 'completelyDiscard') && (tag === 'textarea' || tag === 'xmp')) {
                // <textarea> and <xmp> hold text that must not be re-emitted verbatim:
                // if a raw `<` survives into the output it can reopen a tag when the
                // result is re-parsed by a browser, smuggling non-allowlisted markup
                // through the allowlist (mutation-XSS, GHSA-jxwj-j7wr-gfrw — e.g. the
                // `</textarea/>` solidus mis-close). We therefore ALWAYS escape this
                // content rather than passing it through. Escaping unconditionally also
                // closes the related SVG/MathML foreign-content bypass (where the HTML5
                // parser treats <textarea>/<xmp> as ordinary foreign elements and a
                // browser re-parses their contents as live markup, e.g.
                // `<svg><textarea><img src=x onerror=alert(1)></textarea></svg>`): since
                // we never re-emit raw text for these tags, no namespace check is
                // needed. The two tags need different escaping because htmlparser2
                // tokenizes them differently:
                if (tag === 'xmp') {
                    // <xmp> is a raw-text (CDATA) element: entities are NOT decoded, so
                    // its content reaches us as raw source that is already entity-encoded.
                    // Escape only the angle brackets so a literal `<` cannot reopen a tag,
                    // while leaving `&` untouched to avoid double-encoding entities that
                    // are already encoded in the source.
                    result += text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                } else {
                    // <textarea> is an RCDATA element: htmlparser2 (>= 11) decodes
                    // entities inside it, so its content reaches us as plain decoded text.
                    // It must therefore be fully escaped like any other text — escaping
                    // `&` as well as `<`/`>` — so entities round-trip faithfully (no
                    // double-encoding, see the CVE-2026-40186 regression tests) and no
                    // `<` can reopen a tag.
                    result += escapeHtml(text, false);
                }
            // Other "nonTextTags" like <option> are not raw text elements in
            // htmlparser2, so their contents are decoded and must be escaped below
            // like any other text (important to prevent XSS via entity-encoded
            // payloads such as <option>&lt;script&gt;...&lt;/script&gt;</option>).
            } else if (// htmlparser2 treats <iframe> as a raw-text element, so markup inside
            // (including after an unclosed <iframe>) arrives as a single text node.
            // When the iframe is discarded, re-sanitize that fallback markup as HTML
            // instead of escaping it as plain text (issue #5550).
            // The nested call continues from the current depth so that
            // `nestingLimit` applies to the whole output.
            tag === 'iframe' && !tagAllowed(tag) && options.disallowedTagsMode === 'discard' && iframeFallbackDepth < MAX_IFRAME_FALLBACK_DEPTH) {
                result += sanitizeHtml(text, options, {
                    depth,
                    iframeFallbackDepth: iframeFallbackDepth + 1
                });
            } else if (!addedText) {
                const escaped = escapeHtml(text, false);
                if (options.textFilter) {
                    result += options.textFilter(escaped, tag);
                } else {
                    result += escaped;
                }
            }
            if (stack.length) {
                const frame = stack[stack.length - 1];
                frame.text += text;
            }
        },
        onclosetag: function(name, isImplied) {
            if (options.onCloseTag) {
                options.onCloseTag(name, isImplied);
            }
            updateRawTextRegion();
            if (skipRawText) {
                // Still inside the browser's raw text: only close elements that were
                // opened before the discarded region, so the output stays balanced.
                const lastFrame = stack[stack.length - 1];
                if (!lastFrame || lastFrame.tag !== name) {
                    return;
                }
            } else if (skipText) {
                skipTextDepth--;
                if (!skipTextDepth) {
                    skipText = false;
                    if (rawTextEnd !== null) {
                        // htmlparser2 closed the element implicitly (e.g. an ancestor's
                        // end tag) before the browser would. Close its frame below, but
                        // keep discarding up to the browser's end tag.
                        skipRawText = true;
                    }
                } else {
                    return;
                }
            }
            const frame = stack.pop();
            if (!frame) {
                // Do not crash on bad markup
                return;
            }
            if (frame.tag !== name) {
                // Another case of bad markup.
                // Push to stack, so that it will be used in future closing tags.
                stack.push(frame);
                return;
            }
            skipText = options.enforceHtmlBoundary ? name === 'html' : false;
            depth--;
            const skip = skipMap[depth];
            if (skip) {
                delete skipMap[depth];
                if (options.disallowedTagsMode === 'discard' || options.disallowedTagsMode === 'completelyDiscard') {
                    frame.updateParentNodeText();
                    return;
                }
                tempResult = result;
                result = '';
            }
            if (transformMap[depth]) {
                name = transformMap[depth];
                delete transformMap[depth];
            }
            if (options.exclusiveFilter) {
                const filterResult = options.exclusiveFilter(frame);
                if (filterResult === 'excludeTag') {
                    if (skip) {
                        // no longer escaping the tag since it's not added at all
                        result = tempResult;
                        tempResult = '';
                    }
                    // remove the opening tag from the result
                    result = result.substring(0, frame.tagPosition) + result.substring(frame.tagPosition + frame.openingTagLength);
                    return;
                } else if (filterResult) {
                    result = result.substring(0, frame.tagPosition);
                    return;
                }
            }
            frame.updateParentNodeMediaChildren();
            frame.updateParentNodeText();
            if (// Already output />
            options.selfClosing.indexOf(name) !== -1 || isImplied && !tagAllowed(name) && [
                'escape',
                'recursiveEscape'
            ].indexOf(options.disallowedTagsMode) >= 0) {
                if (skip) {
                    result = tempResult;
                    tempResult = '';
                }
                return;
            }
            result += '</' + name + '>';
            if (skip) {
                result = tempResult + escapeHtml(result);
                tempResult = '';
            }
            addedText = false;
        }
    }, options.parser);
    parser.write(html);
    parser.end();
    if (options.disallowedTagsMode === 'escape' || options.disallowedTagsMode === 'recursiveEscape') {
        const lastParsedIndex = parser.endIndex;
        if (lastParsedIndex != null && lastParsedIndex >= 0 && lastParsedIndex < html.length) {
            const unparsed = html.substring(lastParsedIndex);
            result += escapeHtml(unparsed);
        } else if ((lastParsedIndex == null || lastParsedIndex < 0) && html.length > 0 && result === '') {
            result = escapeHtml(html);
        }
    }
    return result;
    //TURBOPACK unreachable
    ;
    function initializeState() {
        result = '';
        depth = baseDepth;
        stack = [];
        skipMap = {};
        transformMap = {};
        skipText = false;
        skipTextDepth = 0;
        rawTextEnd = null;
        skipRawText = false;
    }
    // Leave the raw text region once the parser reaches the offset where the
    // browser ends it.
    function updateRawTextRegion() {
        if (rawTextEnd !== null && parser.startIndex >= rawTextEnd) {
            rawTextEnd = null;
            skipRawText = false;
        }
    }
    // Offset of the end tag that ends a raw text element in a browser: the
    // first case-insensitive `</name` followed by HTML whitespace, `/` or `>`.
    // With no such end tag the element runs to the end of the input.
    function findRawTextEnd(tagName, from) {
        const re = new RegExp('</' + tagName + '[\\t\\n\\f\\r />]', 'ig');
        re.lastIndex = from;
        const match = re.exec(html);
        return match ? match.index : Infinity;
    }
    function escapeHtml(s, quote) {
        if (typeof s !== 'string') {
            s = s + '';
        }
        if (options.parser.decodeEntities) {
            s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (quote) {
                s = s.replace(/"/g, '&quot;');
            }
        }
        // TODO: this is inadequate because it will pass `&0;`. This approach
        // will not work, each & must be considered with regard to whether it
        // is followed by a 100% syntactically valid entity or not, and escaped
        // if it is not. If this bothers you, don't set parser.decodeEntities
        // to false. (The default is true.)
        s = s.replace(/&(?![a-zA-Z0-9#]{1,20};)/g, '&amp;') // Match ampersands not part of existing HTML entity
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (quote) {
            s = s.replace(/"/g, '&quot;');
        }
        return s;
    }
    function naughtyHref(name, href) {
        // Resolve the per-tag scheme allowlist if one is configured for
        // this tag, otherwise fall back to the global allowedSchemes.
        const allowedSchemes = has(options.allowedSchemesByTag, name) ? options.allowedSchemesByTag[name] : options.allowedSchemes || [];
        return launderNaughtyHref(href, {
            allowedSchemes,
            allowProtocolRelative: options.allowProtocolRelative
        });
    }
    function isRefresh(attribs) {
        return Object.keys(attribs).some(function(a) {
            return a.toLowerCase() === 'http-equiv' && String(attribs[a]).trim().toLowerCase() === 'refresh';
        });
    }
    // True if the `content` of a `<meta http-equiv="refresh">` must be dropped:
    // its destination URL fails the scheme policy, or it cannot be parsed as a
    // refresh at all (a browser would ignore it then, so nothing is lost).
    // Extracts the URL the way the HTML standard's "shared declarative refresh
    // steps" do, so that spelling, separator, quoting and case variations of
    // `url=`, or no `url=` at all, all yield the URL a browser would navigate to.
    function naughtyRefresh(content) {
        const input = String(content);
        const isWhitespace = function(c) {
            return c === ' ' || c === '\t' || c === '\n' || c === '\f' || c === '\r';
        };
        let position = 0;
        const skipWhitespace = function() {
            while(position < input.length && isWhitespace(input[position])){
                position++;
            }
        };
        const lowerAt = function(i) {
            return (input[i] || '').toLowerCase();
        };
        skipWhitespace();
        const timeStart = position;
        while(position < input.length && /[0-9.]/.test(input[position])){
            position++;
        }
        if (position === timeStart) {
            return true;
        }
        if (position < input.length) {
            const c = input[position];
            if (c !== ';' && c !== ',' && !isWhitespace(c)) {
                return true;
            }
            skipWhitespace();
            if (input[position] === ';' || input[position] === ',') {
                position++;
            }
            skipWhitespace();
        }
        if (position >= input.length) {
            // No URL: refreshes the current document
            return false;
        }
        let url = input.slice(position);
        let quoted = true;
        if (lowerAt(position) === 'u') {
            quoted = false;
            if (lowerAt(position + 1) === 'r' && lowerAt(position + 2) === 'l') {
                position += 3;
                skipWhitespace();
                if (input[position] === '=') {
                    position++;
                    skipWhitespace();
                    quoted = true;
                }
            }
        }
        if (quoted) {
            const quote = input[position];
            if (quote === '"' || quote === '\'') {
                position++;
            }
            url = input.slice(position);
            if (quote === '"' || quote === '\'') {
                const end = url.indexOf(quote);
                if (end !== -1) {
                    url = url.slice(0, end);
                }
            }
        }
        return naughtyHref('meta', url);
    }
    // True if this is an SVG SMIL animation element that animates a URL-bearing
    // attribute, e.g. `<animate attributeName="href" values="#safe;javascript:...">`.
    //
    // Such an element carries no URL of its own: the browser copies the animation
    // values into the target attribute *after* sanitization, so a `javascript:`
    // destination reaches a live link sink without ever being scheme checked.
    // `values` compounds this, because it is a semicolon-separated LIST of
    // destinations: checking it as one flat URL only validates its first entry, so
    // a leading `#safe` fragment carries the rest of the list past the policy.
    //
    // Re-checking each entry of each value attribute would leave the safety of the
    // output resting on our imitation of SMIL list parsing, so we reject the
    // animation on the strength of its target instead. Animations of attributes
    // that are not URL sinks, such as `fill` or `opacity`, are unaffected.
    function animatesUrlAttribute(name, attribs) {
        // In an XML serialization a prefixed name such as `svg:animate` is the same
        // element as `animate`, so match on the local name (GHSA-374f-7chj-9948).
        if (svgAnimationTags.indexOf(localPart(name)) === -1) {
            return false;
        }
        const schemeCheckedAttributes = options.allowedSchemesAppliedToAttributes || [];
        return Object.keys(attribs || {}).some(function(attributeName) {
            if (localPart(attributeName) !== 'attributename') {
                return false;
            }
            const target = (attribs[attributeName] || '').trim().toLowerCase();
            // The target may be namespace prefixed (`xlink:href`). Which prefixes are
            // in scope depends on the document, so consider the local name too.
            const localName = target.slice(target.lastIndexOf(':') + 1);
            return alwaysUrlAttributes.indexOf(localName) !== -1 || schemeCheckedAttributes.indexOf(target) !== -1 || schemeCheckedAttributes.indexOf(localName) !== -1;
        });
    }
    // Lowercased name with any namespace prefix removed.
    function localPart(name) {
        const lower = name.toLowerCase();
        return lower.slice(lower.lastIndexOf(':') + 1);
    }
    function parseUrl(value) {
        value = value.replace(/^(\w+:)?\s*[\\/]\s*[\\/]/, '$1//');
        if (value.startsWith('relative:')) {
            // An attempt to exploit our workaround for base URLs being
            // mandatory for relative URL validation in the WHATWG
            // URL parser, reject it
            throw new Error('relative: exploit attempt');
        }
        // naughtyHref is in charge of whether protocol relative URLs
        // are cool. Here we are concerned just with allowed hostnames and
        // whether to allow relative URLs.
        //
        // Build a placeholder "base URL" against which any reasonable
        // relative URL may be parsed successfully
        let base = 'relative://relative-site';
        for(let i = 0; i < 100; i++){
            base += `/${i}`;
        }
        const parsed = new URL(value, base);
        const isRelativeUrl = parsed && parsed.hostname === 'relative-site' && parsed.protocol === 'relative:';
        return {
            isRelativeUrl,
            url: parsed
        };
    }
    /**
   * Filters user input css properties by allowlisted regex attributes.
   * Modifies the abstractSyntaxTree object.
   *
   * @param {object} abstractSyntaxTree  - Object representation of CSS attributes.
   * @property {array[Declaration]} abstractSyntaxTree.nodes[0] -
   * Each object contains prop and value key, i.e { prop: 'color', value: 'red' }.
   * @param {object} allowedStyles       - Keys are properties (i.e color),
   * value is list of permitted regex rules (i.e /green/i).
   * @return {object}                    - The modified tree.
   */ function filterCss(abstractSyntaxTree, allowedStyles) {
        if (!allowedStyles) {
            return abstractSyntaxTree;
        }
        const astRules = abstractSyntaxTree.nodes[0];
        let selectedRule;
        // Merge global and tag-specific styles into new AST.
        if (allowedStyles[astRules.selector] && allowedStyles['*']) {
            selectedRule = mergeStyles(allowedStyles[astRules.selector], allowedStyles['*']);
        } else {
            selectedRule = allowedStyles[astRules.selector] || allowedStyles['*'];
        }
        if (selectedRule) {
            abstractSyntaxTree.nodes[0].nodes = astRules.nodes.reduce(filterDeclarations(selectedRule), []);
        }
        return abstractSyntaxTree;
    }
    /**
   * Extracts the style attributes from an AbstractSyntaxTree and formats those
   * values in the inline style attribute format.
   *
   * @param  {AbstractSyntaxTree} filteredAST
   * @return {string}             - Example:
   * "color:yellow;text-align:center !important;font-family:helvetica;"
   */ function stringifyStyleAttributes(filteredAST) {
        return filteredAST.nodes[0].nodes.reduce(function(extractedAttributes, attrObject) {
            extractedAttributes.push(`${attrObject.prop}:${attrObject.value}${attrObject.important ? ' !important' : ''}`);
            return extractedAttributes;
        }, []).join(';');
    }
    /**
    * Filters the existing attributes for the given property. Discards any attributes
    * which don't match the allowlist.
    *
    * @param  {object} selectedRule - Example: { color: red, font-family: helvetica }
    * @param  {array} allowedDeclarationsList - List of declarations
    * which pass the allowlist.
    * @param  {object} attributeObject - Object representing the current css property.
    * @property {string} attributeObject.type - Typically 'declaration'.
    * @property {string} attributeObject.prop - The CSS property, i.e 'color'.
    * @property {string} attributeObject.value - The corresponding value to
    * the css property, i.e 'red'.
    * @return {function} - When used in Array.reduce,
    * will return an array of Declaration objects
    */ function filterDeclarations(selectedRule) {
        return function(allowedDeclarationsList, attributeObject) {
            // If this property is allowlisted...
            if (has(selectedRule, attributeObject.prop)) {
                const matchesRegex = selectedRule[attributeObject.prop].some(function(regularExpression) {
                    return regularExpression.test(attributeObject.value);
                });
                if (matchesRegex) {
                    allowedDeclarationsList.push(attributeObject);
                }
            }
            return allowedDeclarationsList;
        };
    }
    function filterClasses(classes, allowed, allowedGlobs) {
        if (!allowed) {
            // The class attribute is allowed without filtering on this tag
            return classes;
        }
        classes = classes.split(/\s+/);
        return classes.filter(function(clss) {
            return allowed.indexOf(clss) !== -1 || allowedGlobs.some(function(glob) {
                return glob.test(clss);
            });
        }).join(' ');
    }
}
// Defaults are accessible to you so that you can use them as a starting point
// programmatically if you wish
const htmlParserDefaults = {
    decodeEntities: true
};
sanitizeHtml.defaults = {
    allowedTags: [
        // Sections derived from MDN element categories and limited to the more
        // benign categories.
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element
        // Content sectioning
        'address',
        'article',
        'aside',
        'footer',
        'header',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'hgroup',
        'main',
        'nav',
        'section',
        // Text content
        'blockquote',
        'dd',
        'div',
        'dl',
        'dt',
        'figcaption',
        'figure',
        'hr',
        'li',
        'menu',
        'ol',
        'p',
        'pre',
        'ul',
        // Inline text semantics
        'a',
        'abbr',
        'b',
        'bdi',
        'bdo',
        'br',
        'cite',
        'code',
        'data',
        'dfn',
        'em',
        'i',
        'kbd',
        'mark',
        'q',
        'rb',
        'rp',
        'rt',
        'rtc',
        'ruby',
        's',
        'samp',
        'small',
        'span',
        'strong',
        'sub',
        'sup',
        'time',
        'u',
        'var',
        'wbr',
        // Table content
        'caption',
        'col',
        'colgroup',
        'table',
        'tbody',
        'td',
        'tfoot',
        'th',
        'thead',
        'tr'
    ],
    // Tags that cannot be boolean
    nonBooleanAttributes: [
        'abbr',
        'accept',
        'accept-charset',
        'accesskey',
        'action',
        'allow',
        'alt',
        'as',
        'autocapitalize',
        'autocomplete',
        'blocking',
        'charset',
        'cite',
        'class',
        'color',
        'cols',
        'colspan',
        'content',
        'contenteditable',
        'coords',
        'crossorigin',
        'data',
        'datetime',
        'decoding',
        'dir',
        'dirname',
        'download',
        'draggable',
        'enctype',
        'enterkeyhint',
        'fetchpriority',
        'for',
        'form',
        'formaction',
        'formenctype',
        'formmethod',
        'formtarget',
        'headers',
        'height',
        'hidden',
        'high',
        'href',
        'hreflang',
        'http-equiv',
        'id',
        'imagesizes',
        'imagesrcset',
        'inputmode',
        'integrity',
        'is',
        'itemid',
        'itemprop',
        'itemref',
        'itemtype',
        'kind',
        'label',
        'lang',
        'list',
        'loading',
        'low',
        'max',
        'maxlength',
        'media',
        'method',
        'min',
        'minlength',
        'name',
        'nonce',
        'optimum',
        'pattern',
        'ping',
        'placeholder',
        'popover',
        'popovertarget',
        'popovertargetaction',
        'poster',
        'preload',
        'referrerpolicy',
        'rel',
        'rows',
        'rowspan',
        'sandbox',
        'scope',
        'shape',
        'size',
        'sizes',
        'slot',
        'span',
        'spellcheck',
        'src',
        'srcdoc',
        'srclang',
        'srcset',
        'start',
        'step',
        'style',
        'tabindex',
        'target',
        'title',
        'translate',
        'type',
        'usemap',
        'value',
        'width',
        'wrap',
        // Event handlers
        'onauxclick',
        'onafterprint',
        'onbeforematch',
        'onbeforeprint',
        'onbeforeunload',
        'onbeforetoggle',
        'onblur',
        'oncancel',
        'oncanplay',
        'oncanplaythrough',
        'onchange',
        'onclick',
        'onclose',
        'oncontextlost',
        'oncontextmenu',
        'oncontextrestored',
        'oncopy',
        'oncuechange',
        'oncut',
        'ondblclick',
        'ondrag',
        'ondragend',
        'ondragenter',
        'ondragleave',
        'ondragover',
        'ondragstart',
        'ondrop',
        'ondurationchange',
        'onemptied',
        'onended',
        'onerror',
        'onfocus',
        'onformdata',
        'onhashchange',
        'oninput',
        'oninvalid',
        'onkeydown',
        'onkeypress',
        'onkeyup',
        'onlanguagechange',
        'onload',
        'onloadeddata',
        'onloadedmetadata',
        'onloadstart',
        'onmessage',
        'onmessageerror',
        'onmousedown',
        'onmouseenter',
        'onmouseleave',
        'onmousemove',
        'onmouseout',
        'onmouseover',
        'onmouseup',
        'onoffline',
        'ononline',
        'onpagehide',
        'onpageshow',
        'onpaste',
        'onpause',
        'onplay',
        'onplaying',
        'onpopstate',
        'onprogress',
        'onratechange',
        'onreset',
        'onresize',
        'onrejectionhandled',
        'onscroll',
        'onscrollend',
        'onsecuritypolicyviolation',
        'onseeked',
        'onseeking',
        'onselect',
        'onslotchange',
        'onstalled',
        'onstorage',
        'onsubmit',
        'onsuspend',
        'ontimeupdate',
        'ontoggle',
        'onunhandledrejection',
        'onunload',
        'onvolumechange',
        'onwaiting',
        'onwheel'
    ],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
        a: [
            'href',
            'name',
            'target'
        ],
        // We don't currently allow img itself by default, but
        // these attributes would make sense if we did.
        img: [
            'src',
            'srcset',
            'alt',
            'title',
            'width',
            'height',
            'loading'
        ]
    },
    allowedEmptyAttributes: [
        'alt'
    ],
    // Lots of these won't come up by default because we don't allow them
    selfClosing: [
        'img',
        'br',
        'hr',
        'area',
        'base',
        'basefont',
        'input',
        'link',
        'meta',
        'col'
    ],
    // URL schemes we permit
    allowedSchemes: [
        'http',
        'https',
        'ftp',
        'mailto',
        'tel'
    ],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [
        'href',
        'src',
        'cite',
        'action',
        'formaction',
        'data',
        'xlink:href',
        'poster',
        'background',
        'ping',
        'longdesc',
        'usemap',
        'codebase',
        'classid',
        'archive',
        'profile',
        'manifest',
        'itemid',
        'dynsrc',
        'lowsrc'
    ],
    allowProtocolRelative: true,
    enforceHtmlBoundary: false,
    parseStyleAttributes: true,
    preserveEscapedAttributes: false
};
sanitizeHtml.simpleTransform = function(newTagName, newAttribs, merge) {
    merge = merge === undefined ? true : merge;
    newAttribs = newAttribs || {};
    return function(tagName, attribs) {
        let attrib;
        if (merge) {
            for(attrib in newAttribs){
                attribs[attrib] = newAttribs[attrib];
            }
        } else {
            attribs = newAttribs;
        }
        return {
            tagName: newTagName,
            attribs
        };
    };
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0blag1u._.js.map