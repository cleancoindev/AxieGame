var team1 = [];
var team2 = [];

function getAxieBattleEntity(_axie) {
    var battleAxie = {};
    battleAxie.stats = _axie.stats;
    battleAxie.class = _axie.class;
    battleAxie.skills = [];
    battleAxie.skills[0] = _axie.parts.tail.moves[0];
    battleAxie.skills[1] = _axie.parts.mouth.moves[0];
    battleAxie.skills[2] = _axie.parts.horn.moves[0];
    battleAxie.skills[3] = _axie.parts.back.moves[0];
}
