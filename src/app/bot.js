var cas = require('../assets/cas').data;
var provs = require('../assets/provs').data;

const preGameChecks = () => {
    console.log("Basic integrity test\n************************")

    cas.forEach(element => {   
        let expected = element.initialProvinces;
        let found = provs.filter (prov => {return prov.initialCa == element.id}).map(x => {return x.id});   
        if (expected.length === found.length){
            console.log(element.name + " OK")
        }else{
            console.log("ERROR!!!!")
            console.log(element.name)
            console.log("Expected: " + expected)
            console.log("Found: " + found)
        }
    });

    console.log("*********************************\nAdvanced border integrity test\n*********************************")
    // console.log(provs.filter(x => {return x.borders.indexOf("cadiz") > 0}));
    // console.log(provs.filter(x => {return x.id == "ceuta"}));
    provs.forEach(prov => {
        let myBorders = prov.borders.length;
        let realBorders = provs.filter(x => {return x.borders.indexOf(prov.id) >= 0}).length;
        (myBorders == realBorders) 
            ? console.log(prov.name + " has " + myBorders + " borders, as expected")
            : console.log("ERROR!!!!" + prov.name + " has " + realBorders + " borders, but expected " + myBorders)
    })
}

const newGame = () => {
    let currentCas = cas;
    let currentProvs = provs;

    let nextTurn = Math.floor((Math.random() * 100) % currentCas.length);    
    console.log("It's " + currentCas[nextTurn].name + " turn");
    console.log("Current provinces: " + currentCas[nextTurn].currentProvinces);    
    let provsAtack = currentProvs.filter(x => {return currentCas[nextTurn].currentProvinces.indexOf(x.id) >= 0});
    let attackers = [];
    provsAtack.forEach(x => {
        console.log(x.id + " can attack " + x.borders.filter(y => { return currentCas[nextTurn].currentProvinces.indexOf(y) < 0}));
        if (x.borders.filter(y => { return currentCas[nextTurn].currentProvinces.indexOf(y) < 0}).length > 0)
        attackers.push({prov:x, borders: x.borders.filter(y => { return currentCas[nextTurn].currentProvinces.indexOf(y) < 0})})
    })
    let nextAttack = Math.floor((Math.random() * 100) % attackers.length);
    let attack = {attacker: attackers[nextAttack].prov, victim: attackers[nextAttack].borders[(Math.floor((Math.random() * 100) % attackers[nextAttack].borders.length))]};
    console.log(attackers[nextAttack].prov);
    console.log(attack);
    console.log(attack.attacker.id + " will attack " + attack.victim);
    
}
//preGameChecks();
newGame();