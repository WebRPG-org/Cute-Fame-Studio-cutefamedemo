//=============================================================================
// DynamicFacesetPlugin.js
//=============================================================================

/*:
 * @plugindesc Changes the face within a faceset based on party member's health and class.
 *            Allows swapping of party member faces using plugin commands.
 * @author Fame/ChatGPT
 *
 * @help This plugin allows you to change the face within a faceset based on
 * the health and class of each party member. It supports up to 10 party members.
 * You can also use plugin commands to swap the faces of party members.
 *
 * Usage:
 * - Set up your facesets with the naming convention:
 *   Face_1.png, Face_1_2.png, Face_1_3.png, etc.
 *   These files should be located in the "img/faces" folder of your project.
 *   Note: The numbering starts from 1, not 0.
 *   Replace the numbers with the desired class IDs.
 *
 * - The plugin will check the health and class of each party member and use the
 *   corresponding face within the faceset if their health is below 40% and they
 *   have a class-specific face available. Otherwise, it will use the default face.
 *   The plugin will automatically revert to the default face if the actor recovers
 *   their health or dies.
 *
 * Plugin Commands:
 * - SwapFaceSlot <oldSlot> <newSlot>
 *   This command swaps the faces of two party members. Replace <oldSlot> and <newSlot>
 *   with the slot numbers of the party members you want to swap. The slot numbers range
 *   from 1 to the maximum number of party member slots defined in the plugin parameters.
 *
 * Note Tags:
 * - To specify a class-specific face, add the following note tag to the class note box:
 *   <LowHealthFace: filename>
 *   Replace "filename" with the name of the face image file you want to use.
 *   The face image file should be located in the "img/faces" folder of your project.
 *
 * Terms of Use:
 * - This plugin can be used in both free and commercial projects.
 * - Credit is appreciated but not required.
 *
 * @param Slots
 * @type number
 * @min 1
 * @max 10
 * @desc Number of party member slots to consider.
 * @default 4
 */

(function() {
  var parameters = PluginManager.parameters('DynamicFacesetPlugin');
  var slots = Number(parameters['Slots']) || 4;

  var _Game_Actor_initialize = Game_Actor.prototype.initialize;
  Game_Actor.prototype.initialize = function(actorId) {
    _Game_Actor_initialize.call(this, actorId);
    this._originalFaceName = this.faceName();
  };

  var _Game_Actor_faceName = Game_Actor.prototype.faceName;
  Game_Actor.prototype.faceName = function() {
    if (this.isHpBelowThreshold()) {
      var slotId = this.actorId();
      if (slotId > 0 && slotId <= slots) {
        return this.getDynamicFace(slotId);
      }
    } else if (this.isDead()) {
      return this._originalFaceName;
    }
    return _Game_Actor_faceName.call(this);
  };

  Game_Actor.prototype.getDynamicFace = function(slotId) {
    var baseFaceName = 'Face_' + slotId;
    var classId = this.currentClass().id;
    var classFaceName = baseFaceName + '_' + classId;

    if (this.isDying()) {
      return classFaceName + '_Critical';
    } else {
      var classNote = this.currentClass().note;
      var regExp = /<LowHealthFace:\s*(\S+)>/i;
      var match = regExp.exec(classNote);
      if (match && match[1]) {
        return match[1];
      }
      return classFaceName;
    }
  };

  Game_Actor.prototype.isHpBelowThreshold = function() {
    return this.hp / this.mhp < 0.4;
  };

  Game_Actor.prototype.isDying = function() {
    return this.hp <= 0 && !this.isDead();
  };

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === 'SwapFaceSlot') {
      var oldSlot = parseInt(args[0]);
      var newSlot = parseInt(args[1]);
      this.swapFaceSlot(oldSlot, newSlot);
    }
  };

  Game_Interpreter.prototype.swapFaceSlot = function(oldSlot, newSlot) {
    if (oldSlot > 0 && oldSlot <= slots && newSlot > 0 && newSlot <= slots) {
      var tempActor = $gameParty.members()[oldSlot - 1];
      $gameParty._actors[oldSlot - 1] = $gameParty._actors[newSlot - 1];
      $gameParty._actors[newSlot - 1] = tempActor;
    }
  };
})();