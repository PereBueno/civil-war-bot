var cas = require('../assets/cas').data;
var provs = require('../assets/provs').data;
const readline = require('readline');

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
    currentCas = cas;
    currentProvs = provs;
}

const newTurn = () => {
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
    console.log(attack.attacker.id + " attacks " + attack.victim);
    if (Math.random() * 10 > 5){ // Win
        winTurn(attack.attacker.id, attack.victim)
    }else{ // Counter
        console.log(attack.attacker.id + " failed miserably, counter!")
        if (Math.random() * 10 > 5){ // Win counter
            console.log(attack.victim + " won " +  attack.attacker.id);
            winTurn( attack.victim, attack.attacker.id)
        }else{
            console.log("Nothing happened, let's see what is going on in the rest of the country...")            
        }
    }
    turns++;
    statusSummary();
    console.log("Press ENTER for a new turn, Q to quit");
}

const winTurn = (winner, loser) => {
    console.log("*****************")
    console.log("* ROUND SUMMARY *")
    console.log("*****************")    
    updateCa(currentCas.filter(x => {return x.currentProvinces.indexOf(loser) >= 0})[0], currentProvs.filter(x => { return x.id == loser})[0], "lose");
    updateCa(currentCas.filter(x => {return x.currentProvinces.indexOf(winner) >= 0})[0], currentProvs.filter(x => { return x.id == loser})[0], "win");    
}

const updateCa = (ca, prov, operation="win") =>{
    console.log(ca.name + " " + operation + " " + prov.name);
    let provIndex = currentProvs.indexOf(prov);
    let caIndex = currentCas.indexOf(ca);

    if (operation === "win"){
        // Add province        
        currentCas[caIndex].currentProvinces.push(prov.id);
        // Update province metadata
        currentProvs[provIndex].timesConquered++;
        currentProvs[provIndex].caHistory.push(ca.id);                
        console.log("Now " + ca.name + " contains " + currentCas[caIndex].currentProvinces);
    }else{
        // Remove province        
        currentCas[caIndex].currentProvinces.splice(currentCas[caIndex].currentProvinces.indexOf(prov.id), 1);
        console.log(currentCas[caIndex].currentProvinces)

        // If no more provinces left --> CA extinguished
        if (currentCas[caIndex].currentProvinces.length === 0){
            currentCas.splice(caIndex, 1);
            console.log(ca.name + " has been extinguished");
        }        
        // If lost province was the capital select a new one
        else if (prov.id === ca.currentCapital){
            currentCas[caIndex].currentCapital = currentCas[caIndex].currentProvinces[Math.floor((Math.random() * 100) % currentCas[caIndex].currentProvinces.length)];
            currentProvs.filter(x => { return x.id == currentCas[caIndex].currentCapital})[0].wasCapital++;
            console.log(ca.name +"'s capital fell. New capital is " + currentCas[caIndex].currentCapital);
            console.log("Now " + ca.name + " contains " + currentCas[caIndex].currentProvinces);
        }else{
            console.log("Now " + ca.name + " contains " + currentCas[caIndex].currentProvinces);
        }
    }            
}

const statusSummary = () => {
    console.log("*********************");
    console.log("** PARTE DE GUERRA **")
    console.log("*********************");
    console.log("Turno:\t" + turns);
    cas.forEach(ca => {
        let currently = currentCas.filter(x => {return x.id == ca.id})[0]
        console.log (ca.name + " started with " + ca.initialProvinces.length + " provinces, now it has " + (currently == undefined ? "0" : currently.currentProvinces.length))
    })
}
//preGameChecks();
let currentCas = cas;
let currentProvs = provs;
let turns = 0;

newGame();
newTurn();


var stdin = process.openStdin();
stdin.addListener("data", (key) => {
    if ("Q" != key){
        newTurn();
    }
});