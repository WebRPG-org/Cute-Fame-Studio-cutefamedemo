//=============================================================================
// Icon X Background
// IconXbg.js
//=============================================================================
 /*:
 * @plugindesc Replaces black bars with repeated icon/ picture in icon folder.
 * @author tale (credit not necessary)
 *
 * @help
 * You would need to name your images with proper numbers inside icon folder.
 * Default: 1.png | For randomized on load, edit totalCount (line 19) to # used.
 *
 * ===
 * 
 * License: Public Domain
 * 
 */

var totalCount = 3;
function ChangeIt() 
{
var num = Math.ceil( Math.random() * totalCount );
document.body.background = 'icon/'+num+'.png';
document.body.style.backgroundRepeat = "repeat";// Background repeat
document.body.style.backgroundAttachment = "fixed";
document.body.style.backgroundPosition = "center";
}

ChangeIt();