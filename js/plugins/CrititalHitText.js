/*:
* @plugindesc Adds a Critical Popup.
* @author Jory4001
*
* @help
*
*
* Must be placed below YEP_BattleEngineCore
*
*
*/

// This function taken from Yanfly's YEP_BattleEngineCore.js for compatibility
Sprite_Damage.prototype.setup = function(target) {
var result = target.shiftDamagePopup();
if (result.missed || result.evaded) {
this.createMiss();
} else if (result.hpAffected) {
this.createDigits(0, result.hpDamage);
} else if (target.isAlive() && result.mpDamage !== 0) {
this.createDigits(2, result.mpDamage);
}
if (result.critical) {
this.createCrit(); // My Added line to Yanfly's Function
this.setupCriticalEffect();
}
};

//My Function that draws the Critical graphic
Sprite_Damage.prototype.createCrit = function() {
var w = this.digitWidth();
var h = this.digitHeight();
var sprite = this.createChildSprite();
sprite.setFrame(4 * w, 4 * h, 5 * w, h);
sprite.anchor.y = 2;
sprite.dy = 0;
};