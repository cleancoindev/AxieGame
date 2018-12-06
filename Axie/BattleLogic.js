var team1 = [];
var team2 = [];

class AxieBattleEntity {
    constructor(_axie, pos){
        this.id = _axie.id;
        this.stats = _axie.stats;
        this.class = _axie.class;
        this.position = pos;
        this.remainingHp = _axie.stats.hp;
        this.skills = [];
        this.skills[0] = _axie.parts.tail.moves[0];
        this.skills[0].class = _axie.parts.tail.class;
        this.skills[1] = _axie.parts.mouth.moves[0];
        this.skills[1].class = _axie.parts.mouth.class;
        this.skills[2] = _axie.parts.horn.moves[0];
        this.skills[2].class = _axie.parts.horn.class;
        this.skills[3] = _axie.parts.back.moves[0];
        this.skills[3].class = _axie.parts.back.class;
    }
    getDamage(attIndex, defIndex, defender){
        var damage = this.skills[attIndex].attack - defender.skills[defIndex].defense +
        classBonus(this.skills[attIndex].class, defender.skills[defIndex].class) +
        classBonus(this.class.defenderAxie.class) +
        positionBonus(this.position, defender.position);
    return damage;
    };
    getHitChance(attIndex, defIndex, defender){
        var chance = this.skills[attIndex].accuracy +
        this.stats.skill / 3 -
        defender.stats.speed / 8 +
        classAccBonus(this.skills[attIndex].class, defender.skills[defIndex].class) +
        positionAccBonus(this.position, defender.position);
        return chance;
    };
    getCounterChance(defenderAxie) {
        return defenderAxie.stats.morale / 2 - this.stats.speed / 4;
    }
    getCritChance(defenderAxie) {
        return this.stats.morale / 2 - defenderAxie.stats.speed / 4;
    }
    getLastStandCount() {
        return this.stats.morale / 10;
    }
    
    triggerLastStand(dmg) {
        return dmg - this.remainingHp >= 0 && dmg - this.remainingHp <= this.remainingHp * this.stats.morale / 100;
    }
    findTarget(opponents){
        var sortedOpp = opponents.sort((a, b) => a.position - b.position);
        var map = [];
        var row = 0;
        switch(this.position){
            case 0:
            case 4:
            case 8:
                row = 2;
                break
            case 1:
            case 6:
                row = 3;
                break;
            case 2:
            case 7:
                 row = 1;
                 break;
            case 3: 
                 row = 4;
                 break;
            case 5:
                row = 0;
                break;
        }
        sortedOpp.foreach(opp =>{
            if(opp.remainingHp > 0){
                switch(opp.position){
                    case 0:
                        map[1][2] = opp;
                        break;
                    case 1:
                        map[2][3] = opp;
                        break;
                    case 2:
                        map[2][1] = opp;
                        break;
                    case 3:
                        map[3][4] = opp;
                        break;
                    case 4:
                        map[3][2] = opp;
                        break;
                    case 5:
                        map[3][0] = opp;
                        break;
                    case 6:
                        map[4][3] = opp;
                        break;
                    case 7:
                        map[4][1] = opp;
                        break;
                    case 8:
                        map[5][2] = opp;
                        break;
                }
            }
        });
        for (var i = 1 ; i < 5 ; i++){
            for (var j = 0 ; j < 6 ; j++){
                
            }
        }
    }

}

function GetDistance()
{

}

function getDamage(attackSkill, defendSkill, attacker, defender) {
    var damage = attackSkill.attack - defendSkill.defense +
        classBonus(attackSkill.class, defendSkill.class) +
        classBonus(attacker.class.defenderAxie.class) +
        positionBonus(attacker.position, defender.position);
    return damage;
}
function getHitChance(attackSkill, defendSkill, attacker, defender) {
    var chance = attackSkill.accuracy +
        attacker.stats.skill / 3 -
        defender.stats.speed / 8 +
        classAccBonus(attackSkill.class, defendSkill.class) +
        positionAccBonus(attackSkill.position, defendSkill.position);
        return chance;
}
function getCounterChance(attackerAxie, defenderAxie) {
    return defenderAxie.stats.morale / 2 - attackerAxie.stats.speed / 4;
}
function getCritChance(attackerAxie, defenderAxie) {
    return attackerAxie.stats.morale / 2 - defenderAxie.stats.speed / 4;
}
function getLastStandCount(axie) {
    return axie.stats.morale / 10;
}

function TriggerLastStand(dmg, defender) {
    return dmg - defender.remainingHp >= 0 && dmg - defender.remainingHp <= defender.remainingHp * defender.stats.morale / 100;
}

function classDmgBonus(attackerClass, defenderClass) {
    var att;
    switch (attackerClass) {
        case "bug":
        case "beast":
            att = 0;
            break;
        case "aquatic":
        case "bird":
            att = 2;
            break;
        case "plant":
        case "reptile":
            att = 1;
            break;
    }

    var def;
    switch (defenderClass) {
        case "bug":
        case "beast":
            def = 0;
            break;
        case "aquatic":
        case "bird":
            def = 1;
            break;
        case "plant":
        case "reptile":
            def = 2;
            break;
    }
    //no bonus
    if (att === 0 && def === 0) return 0;
    else if (att === 1 && def === 1) return 0;
    else if (att === 2 && def === 2) return 0;
    //bonus
    else if (att === 1 && def === 2) return 3;
    else if (att === 2 && def === 0) return 3;
    else if (att === 0 && def === 1) return 3;
    //malus
    else if (att === 2 && def === 1) return -3;
    else if (att === 0 && def === 2) return -3;
    else if (att === 1 && def === 0) return -3;
}
function positionDmgBonus(attackerPos, defenderPos) {
    var bonus = 0;
    switch (attackerPos) {
        case 1:
            bonus += 2;
            break;
        case 2:
        case 3:
            bonus += 1;
            break;
        case 7:
        case 8:
            bonus -= 1;
            break;
        case 9:
            bonus -= 2;
            break;
    }
    switch (defenderPos) {
        case 1:
            bonus += 2;
            break;
        case 2:
        case 3:
            bonus += 1;
            break;
        case 7:
        case 8:
            bonus -= 1;
            break;
        case 9:
            bonus -= 2;
            break;
    }
    return bonus;
}

function classAccBonus(attackerClass, defenderClass) {
    var att;
    switch (attackerClass) {
        case "bug":
        case "beast":
            att = 0;
            break;
        case "aquatic":
        case "bird":
            att = 2;
            break;
        case "plant":
        case "reptile":
            att = 1;
            break;
    }

    var def;
    switch (defenderClass) {
        case "bug":
        case "beast":
            def = 0;
            break;
        case "aquatic":
        case "bird":
            def = 1;
            break;
        case "plant":
        case "reptile":
            def = 2;
            break;
    }
    //no bonus
    if (att === 0 && def === 0) return 0;
    else if (att === 1 && def === 1) return 0;
    else if (att === 2 && def === 2) return 0;
    //bonus
    else if (att === 1 && def === 2) return 5;
    else if (att === 2 && def === 0) return 5;
    else if (att === 0 && def === 1) return 5;
    //malus
    else if (att === 2 && def === 1) return -5;
    else if (att === 0 && def === 2) return -5;
    else if (att === 1 && def === 0) return -5;
}
function positionAccBonus(attackerPos, defenderPos) {
    var bonus = 0;
    switch (attackerPos) {
        case 1:
            bonus += 5;
            break;
        case 2:
        case 3:
            bonus += 3;
            break;
        case 7:
        case 8:
            bonus -= 3;
            break;
        case 9:
            bonus -= 5;
            break;
    }
    switch (defenderPos) {
        case 1:
            bonus += 5;
            break;
        case 2:
        case 3:
            bonus += 3;
            break;
        case 7:
        case 8:
            bonus -= 3;
            break;
        case 9:
            bonus -= 5;
            break;
    }
    return bonus;
}

module.exports = AxieBattleEntity;