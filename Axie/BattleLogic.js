var team1 = [];
var team2 = [];

function getAxieBattleEntity(_axie) {
    var battleAxie = {};
    battleAxie.stats = _axie.stats;
    battleAxie.class = _axie.class;
    battleAxie.remainingHp = _axie.stats.hp;
    battleAxie.skills = [];
    battleAxie.skills[0] = _axie.parts.tail.moves[0];
    battleAxie.skills[0].class = _axie.parts.tail.class;
    battleAxie.skills[1] = _axie.parts.mouth.moves[0];
    battleAxie.skills[1].class = _axie.parts.mouth.class;
    battleAxie.skills[2] = _axie.parts.horn.moves[0];
    battleAxie.skills[2].class = _axie.parts.horn.class;
    battleAxie.skills[3] = _axie.parts.back.moves[0];
    battleAxie.skills[3].class = _axie.parts.back.class;
    return battleAxie;
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
        positionAccBonus(attackSkill.class, defendSkill.class);
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