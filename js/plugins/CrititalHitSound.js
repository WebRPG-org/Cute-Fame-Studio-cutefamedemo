var alias_applyCrit = Game_Action.prototype.applyCritical;
Game_Action.prototype.applyCritical = function(damage) {
    AudioManager.playSe({name: "Critical", pan: 0, pitch: 100, volume: 65});
    return alias_applyCrit.call(this, damage);
};