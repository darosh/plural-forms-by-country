const atlas = require('world-atlas/world/110m.json');
const country = require('world-countries');
const plurals = require('plurals-cldr');
const cardinal = require('make-plural/data/plurals.json')['supplemental']['plurals-type-cardinal'];
const iso6393 = require('iso-639-3');

let ls = {};
let cs = {};
var ruleCache = [];

atlas.objects.countries.geometries.forEach(geom => {
    let d = country.filter(c => c.ccn3 === geom.id);

    if (d[0]) {
        d = d[0];
        let l = Object.keys(d.languages);
        let vl = [];
        l.forEach(aa => {
            let a = aa === 'bar' ? 'deu' : aa;
            if (typeof ls[a] === 'undefined') {
                let f = iso6393.filter(i => i.iso6393 === a)[0];

                if (f && f.iso6391) {
                    let p = plurals.forms(f.iso6391);

                    if (p) {
                        vl.push(a);
                        ls[a] = {
                            name: f.name.replace(/ \([^)]+\)/, ''),
                            plural: p
                        };

                        if (!cardinal[f.iso6391]) {
                            console.error('missing cardinal: ', a);
                        } else {
                            ls[a].rule = ruleId(cardinal[f.iso6391]);
                        }
                    }
                }
            } else {
                vl.push(a);
            }
        });

        let forms = {};

        vl.forEach(o => forms[ls[o].plural.length] = true);

        forms = Object.keys(forms);
        forms.sort();
        forms = forms.map(f => parseInt(f));

        cs[d.ccn3] = {
            name: d.name.common,
            languages: vl,
            forms: forms
        };
    } else if (d.ccn3 > 0) {
        console.error('missing code ' + geom.id);
    }
});

function ruleId(o) {
    var s = JSON.stringify(o);
    var i = ruleCache.indexOf(s);

    if (i > -1) {
        return i;
    } else {
        ruleCache.push(s);
        return ruleCache.length - 1;
    }
}

/*
 console.log(plurals.forms('af') === plurals.forms('asa'));
 true

 console.log(plurals.forms('af') === plurals.forms('ak'));
 false

 ...but it does not work on same-rule-level :-(
 */

let rs = {};

Object.keys(cs).forEach(c => {
    cs[c].languages.forEach(l => {
        let nn = ls[l].plural.length;
        let n = nn.toString();
        rs[n] = rs[n] || [];
        let f = rs[n].filter(f => f.group === ls[l].rule)[0];

        if (!f) {
            f = {
                group: ls[l].rule,
                length: nn,
                country: []
            };

            rs[n].push(f);
        }

        f.country.push(c);
    });
});

Object.keys(rs).forEach(r => {
    rs[r].sort((a, b) => b.country.length - a.country.length);
});

console.log(JSON.stringify({country: cs, language: ls, rules: rs}));
