const atlas = require('world-atlas/world/110m.json');
const country = require('world-countries');
const plurals = require('plurals-cldr');
const iso6393 = require('iso-639-3');

let ls = {};
let cs = {};

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

console.log(JSON.stringify({country: cs, language: ls}));
