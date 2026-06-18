//=============================================================================
// RPG Maker MZ - CT_Bolt's Level Up Extras
//=============================================================================

/*:
 * @target MZ
 * @plugindesc v1.00 CT_Bolt's Level Up Extras
 * @author CT_Bolt
 * 
 * @param Level Up Code
 * @text Level Up Code
 * @desc Javascript to run upon level up
 * @type multiline_string
 * @default this._hp = this.mhp
 *
 * @help CTB_LevelUpExtras.js
 *
 * This plugin provides extra LevelUp features
 *
 */
 
var CTB = CTB || {}; CTB.LevelUpExtras  = CTB.LevelUpExtras || {};
var Imported = Imported || {}; Imported["CTB_LevelUpExtras"] = 1.00;

(($_$) => {
    const NAMESPACE   = 'LevelUpExtras';
    const PLUGIN_NAME = 'CTB_' + NAMESPACE;
	
	function getPluginParameters() {var a = document.currentScript || (function() { var b = document.getElementsByTagName('script'); return b[b.length - 1]; })(); return PluginManager.parameters(a.src.substring((a.src.lastIndexOf('/') + 1), a.src.indexOf('.js')));} $_$.param = getPluginParameters();
		
	//*****************************************************************************
	// Game_Actor
	//*****************************************************************************
	$_$['Game_Actor.prototype.levelUp'] = Game_Actor.prototype.levelUp;
	Game_Actor.prototype.levelUp = function() {
		var orig = $_$['Game_Actor.prototype.levelUp'].apply(this, arguments);
		eval($_$.param['Level Up Code']);
		return orig;
	};

})(CTB.LevelUpExtras, this);