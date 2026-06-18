/*:
* @plugindesc Minor but important fixes to SRD_SummonCore
* @author Yorae Rasante
* @help The original way of setting the level ignored parts of leveling up.
* Things like skills that were not learned, and the summon started with less
* health.
* 
* By default, Game_Action uses the saved actor, not the party member, as subject.
* This is a problem because the summon is a copy of the actor, not the real one.
* For a small example, the actor is still on its initial level.
* 
* You cannot use master for level and turns, only for position.
* Well, now you can.
* 
* Minor fps fixes
* 
* Summon only disappear now when they collapse, for better compatibility with
* Yanfly Action Sequences.
* 
* Other minor fixes
*/

// The original way of setting the level (this._level = level) ignored the rest of the leveling up.
// Things like skills that were not learned.

var SCMF_Game_Summon_initialize = Game_Summon.prototype.initialize;
Game_Summon.prototype.initialize = function(actorId, level, turns, introAni, exitAni, masterId) {
    Game_Actor.prototype.initialize.call(this, actorId);
	SCMF_Game_Summon_initialize.call(this, actorId, level, turns, introAni, exitAni, masterId)
	this._level = 1;
	while (this._level !== level) {
        if (this._level < level) this.levelUp();
        else this.levelDown();
    }
	this.recoverAll();
};


// By default, Game_Action uses the saved actor, not the party member, as subject.
// This is a problem because the summon is a copy of the actor, not the real one.
// For a mild example, the actor is still on its initial level.

var SCMF_Game_Action_setSubject = Game_Action.prototype.setSubject;
Game_Action.prototype.setSubject = function(subject) {
    if (subject.isActor() && $gameParty._summons.length > 0 && $gameParty._summons.contains(subject)) {
        this._subjectActorIndex = subject.index();
    } else {
        this._subjectActorIndex = -1;
    }
    SCMF_Game_Action_setSubject.apply(this, arguments);
};

var SCMF_Game_Action_subject = Game_Action.prototype.subject;
Game_Action.prototype.subject = function() {
    if (this._subjectActorIndex >= 0) {
        return $gameParty.members()[this._subjectActorIndex];
    }
    return SCMF_Game_Action_subject.apply(this, arguments);
};

//You cannot use master for level and turns, only for position.

Game_Action.prototype.createSummons = function() {
    const item = this.item();
	const result = [];
	for(let i = 0; i < item.summonInfo.length; i++) {
        const info = item.summonInfo[i];
        if (!info) break;
        const actor = $gameActors.actor(this._subjectActorId);
        const id = new Function('actor', 'var master = actor; return '+info.id);
		const lvl = new Function('actor', 'var master = actor; return '+info.lvl);
		const turns = new Function('actor', 'var master = actor; return '+info.turn);
		const introAni = new Function('actor', 'var master = actor; return '+info.ani);
		const exitAni = new Function('actor', 'var master = actor; return '+info.exit);
		const summon = $gameParty.summonActor(id.call(this, actor), lvl.call(this, actor), turns.call(this, actor), introAni.call(this, actor), exitAni.call(this, actor), this._subjectActorId);
		if(!summon) break;
        actor.addSummon(summon);
        summon.setX(info.x);
		summon.setY(info.y);
		if(this.isSkill()) {
			summon.setSkillId(item.id, 's');
		} else if(this.isItem()) {
			summon.setSkillId(item.id, 'i');
		}
		BattleManager._spriteset.registerSummonSprite(summon);
		result.push(summon);
	}
	return result;
};

//Minor fps fixes

Sprite_Summon.prototype.updateVisibility = function() {
    Sprite_Actor.prototype.updateVisibility.call(this);
};

Spriteset_Battle.prototype.getPositionsForSummons = function(x, y, id) {
	const actors = $gameParty.rawBattleMembers();
	const index = actors.length;
	for(let i = 0; i < actors.length; i++) {
		if(actors[i].actorId() === id) {
			const master = this._actorSprites[i];
            const result = {};
            const posX = new Function ('index','master','return '+x);
            const posY = new Function ('index','master','return '+y);
			result.x = posX.call(this, index, master);
			result.y = posY.call(this, index, master);;
			return result;
		}
	}
	return {x: -1, y: -1};
};

Sprite_Summon.prototype.setActorHome = function(index) {
	BattleManager._spriteset.updateSummonMasters();
	const position = this._actor.getPosition();
    const master = this._masterSprite;
    const posX = new Function ('index','master','return '+position.x);
    const posY = new Function ('index','master','return '+position.y);
	const x = posX.call(this, index, master);
	const y = posY.call(this, index, master);
	this.setHome(x, y);
	BattleManager.summonsXPositions[x] = true;
	BattleManager.summonsYPositions[y] = true;
};

Sprite_Summon.prototype.update = function() {
	Sprite_Actor.prototype.update.call(this);
	if(!this._introStarted && (this._actor && this._actor.ready())) this.updateSummonIntro();
	if(this._summonSprite) this.updateTransition();
};

Sprite_Summon.prototype.updateSummonIntro = function() {
	this.setupIntroAnimation();
	this._introStarted = true;
};

Sprite_Summon.prototype.updateTransition = function() {
	if(this._transitionType === 1) {
		this.opacity = Math.floor(((this._maxDuration - this._summonSprite._duration) / this._maxDuration) * 255);
	} else if(this._transitionType === 2) {
		this.opacity = Math.floor((this._summonSprite._duration / this._maxDuration) * 255);
	}
	if(!this._summonSprite.isPlaying()) {
		if(this._transitionType === 2) {
			BattleManager.summonsXPositions[this._homeX] = false;
			BattleManager.summonsXPositions[this._homeY] = false;
			this._introStarted = false;
			this._exitAnimation = 0;
		}
		this._transitionType = 0;
		this._summonSprite = null;
	}
};

//Other minor fixes
Game_Actor.prototype.canUseSummon = function(item) {
	if(SRD.SummonCore.perPosition) {
		for(let i = 0; i < item.summonInfo.length; i++) {
			const info = item.summonInfo[i];
			const x = info.x;
			const y = info.y;
			const id = this.actorId();
			const pos = BattleManager._spriteset.getPositionsForSummons(x, y, id);
			if(BattleManager.summonsXPositions[pos.x] && BattleManager.summonsYPositions[pos.y]) {
				return false;
			}
		}
	}
	if(SRD.SummonCore.perSkill) {
		const id = item.id;
		if(DataManager.isSkill(item)) {
			if(BattleManager.summonsSkillIds[id] > 0) return false;
		} else {
			if(BattleManager.summonsItemIds[id] > 0) return false;
		}
	}
	if($gameParty.hasMaxSummons()) return false;
	return true;
};

Sprite_Summon.prototype.updateTransition = function() {
	if(this._summonSprite) {
		if(this._transitionType === 1) {
			this.opacity = Math.floor(((this._maxDuration - this._summonSprite._duration) / this._maxDuration) * 255);
		} else if(this._transitionType === 2) {
			this.opacity = Math.floor((this._summonSprite._duration / this._maxDuration) * 255);
		}
		if(!this._summonSprite.isPlaying()) {
			if(this._transitionType === 2) {
				BattleManager.summonsXPositions[this._homeX] = false;
				BattleManager.summonsYPositions[this._homeY] = false;
				this._introStarted = false;
				this._exitAnimation = 0;
			}
			this._transitionType = 0;
			this._summonSprite = null;
		}
	}
};

Game_Summon.prototype.refresh = function() {
	Game_Actor.prototype.refresh.apply(this, arguments);
};

Game_Summon.prototype.performCollapse = function() {
	$gameParty.removeSummon(this);
};

Game_Party.prototype.removeSummon = function(summon) {
	if(this._summons.contains(summon)) {
		//this._summons.splice(this._summons.indexOf(summon), 1);
		const actor = $gameActors.actor(summon.masterId());
		actor.removeSummon(summon);
		if(summon.baseSkillType() === 's') {
			BattleManager.summonsSkillIds[summon.baseSkillId()]--;
		} else if(summon.baseSkillType() === 'i') {
			BattleManager.summonsItemIds[summon.baseSkillId()]--;
		}
		BattleManager._spriteset.removeSummonSprite(summon);
		//summon.setBattleSprite(null);
		//summon = null;
		summon._dismissed = true;
	}
};

var SCMF_BattleManager_endAction = BattleManager.endAction;
BattleManager.endAction = function() {
	SCMF_BattleManager_endAction.call(this);
	for (var i = 0; i < $gameParty.summonMembers().length; i++) {
		if ($gameParty.summonMembers()[i]._dismissed) {
			var summon = $gameParty.summonMembers()[i];
			$gameParty._summons.splice(i, 1);
			summon.setBattleSprite(null);
			summon = null;
			i--;
		}
	}
};