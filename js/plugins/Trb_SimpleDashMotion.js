//=============================================================================
// Trb_SimpleDashMotion.js
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
//twitter https://twitter.com/Trb_surasura
/*:
 * @target MZ
 * @plugindesc Simple dash motion
 * @author Trb
 * @version 1.00 2016/6/3  The first version
 *          1.1  2016/6/4  Fixed a bug where followers did not create a running motion. 
 *                         The structure has also been changed for easier editing.
 *          1.2  2020/8/22 A change has been made to set the vertical value and 
 *                         the tilt value from the parameters.
 * 
 * 
 * @param Tilt value
 * @desc It's the degree of tilt when dashing.
 * @default 14
 * @type number
 * @max 90
 * 
 * @param Vertical value
 * @desc Stretch that moves up and down when dashing.
 * @default 2
 * @type number
 * @max 100
 * 
 * 
 * @help While the character is running, tilt the image slightly and move it
 * up and down, just do it like running.   
 * 
 *  
 * MV,MZ It corresponds to both.
 *
 * Copyright (c) 2016 Trb
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 * twitter https://twitter.com/Trb_surasura
 *
 * Translated from Japanese by rooge (1strooge)
 */
(function () {

const parameters = PluginManager.parameters('Trb_SimpleDashMotion');
const lean = Number(parameters['Tilt value']);
const shake = Number(parameters['Vertical value']);

const Sprite_Character_updateOther = Sprite_Character.prototype.updateOther;
Sprite_Character.prototype.updateOther = function() {
    Sprite_Character_updateOther.call(this);
    this.updateDashMotion();//ダッシュモーション用の処理を追加
};

//ダッシュモーションの計算
Sprite_Character.prototype.updateDashMotion = function() {
    const chara = this._character;
    //フォロワーだったらダッシュ判定をプレイヤーと同じにする処理を追加(ver1.1)
    const isDashing = chara._memberIndex ? $gamePlayer.isDashing() : chara.isDashing();
    if(isDashing && (chara.isMoving() || this.T_lastMoving)){//キャラクターが走っている時
        this.y -= chara.pattern() % 2 * shake;//y座標に補正をかける（画像を上下させる）
        switch(chara.direction()){//キャラの向きで分岐
            case 2://上下を向いてる時
            case 8:
                this.scale.y = 0.92;//少し潰す
                this.rotation = 0;
            break;
            case 4://左を向いてる時
                this.rotation = lean * -0.01;//少し左に傾ける
            break;
            case 6://右を向いてる時
                this.rotation = lean * 0.01;//少し右に傾ける
            break;
        }
    }else{//走ってない時角度と潰れをリセット
        this.rotation = 0;
        this.scale.y = 1;
    }
    this.T_lastMoving = chara.isMoving();
};


})();