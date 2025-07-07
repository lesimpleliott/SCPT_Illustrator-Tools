/**
 * Nom du script : Ajouter un fond au plan de travail.jsx
 * Auteur        : eLeGarage - Eliott Lesimple
 * URL           : https://github.com/lesimpleliott
 * Version       : 1.2
 * Date          : 27/06/2025
 * Catégorie     : Plans de travail
 * Compatible    : Illustrator CC 2020+
 * Description   : Ce script ajoute automatiquement un rectangle de couleur de fond sur un ou plusieurs plans de travail sélectionnés dans le document actif.
 *
 *                 Une interface permet à l'utilisateur de choisir une couleur CMJN prédéfinie et définir une marge de fond perdu à ajouter autour du rectangle.
 *
 *                 Le rectangle est ajouté sur un calque dédié nommé "BG-Color" placé en arrière-plan.
 * ---
 * Fonctions :
 * - main : Gère le déroulement principal, collecte les paramètres via l’UI et applique les fonds.
 * - showArtboardDialog : Affiche l’interface pour sélectionner les plans, la couleur et la marge de fond perdu.
 * - drawRectOnArtboard : Dessine un rectangle de fond coloré sur un plan de travail donné, avec bleed optionnel.
 * - addGlobalProcessSwatch : Crée une nouvelle nuance globale de type CMJN dans le document.
 * - createOrGetBGColorLayer : Crée ou récupère le calque "BG-Color" et le place en arrière-plan.
 * - createCMYKColor : Crée un objet couleur CMJN à partir de valeurs numériques.
 * - getUniqueSwatchName : Génère un nom unique pour éviter les doublons lors de la création de nuances.
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================
var SHOW_ALERT_AT_END = false; // true = afficher une alerte après exécution, false = silencieux

// --- Couleurs prédéfinies (CMJN) ---
var presetColors = [
  { name: "Cyan", c: 100, m: 0, y: 0, k: 0 },
  { name: "Magenta", c: 0, m: 100, y: 0, k: 0 },
  { name: "Jaune", c: 0, m: 0, y: 100, k: 0 },
  { name: "Rouge", c: 0, m: 100, y: 100, k: 0 },
  { name: "Vert", c: 100, m: 0, y: 100, k: 0 },
  { name: "Bleu", c: 100, m: 100, y: 0, k: 0 },
  { name: "Gris foncé", c: 0, m: 0, y: 0, k: 80 },
  { name: "Gris clair", c: 0, m: 0, y: 0, k: 20 },
  { name: "Blanc", c: 0, m: 0, y: 0, k: 0 },
  { name: "Noir", c: 0, m: 0, y: 0, k: 100 },
];

// ========================================
// =============== MAIN ===================
// ========================================
function main() {
  if (app.documents.length === 0) {
    alert("Veuillez ouvrir un document avant d'exécuter ce script.");
    return;
  }

  var doc = app.activeDocument;
  var result = showArtboardDialog(doc.artboards);
  if (!result) return;

  var bgLayer = createOrGetBGColorLayer(doc);
  var globalColor = addGlobalProcessSwatch(doc, result.color, "BG_COLOR");

  for (var i = 0; i < result.indices.length; i++) {
    var ab = doc.artboards[result.indices[i]];
    drawRectOnArtboard(doc, ab, bgLayer, globalColor, result.bleed);
  }

  if (SHOW_ALERT_AT_END) {
    alert("Fond ajouté à " + result.indices.length + " plan(s) de travail.");
  }
}

// Lancer le script
try {
  main();
} catch (err) {
  alert("Erreur dans le script :\n" + err.message);
}

// ========================================
// =============== UTILS ==================
// ========================================

/**
 * Crée un objet CMYKColor.
 * @param {number} c - Cyan
 * @param {number} m - Magenta
 * @param {number} y - Jaune
 * @param {number} k - Noir
 * @returns {CMYKColor}
 */
function createCMYKColor(c, m, y, k) {
  var color = new CMYKColor();
  color.cyan = c;
  color.magenta = m;
  color.yellow = y;
  color.black = k;
  return color;
}

/**
 * Génère un nom unique pour une nouvelle nuance.
 * @param {Document} doc
 * @param {string} baseName
 * @returns {string}
 */
function getUniqueSwatchName(doc, baseName) {
  var i = 1;
  var name = baseName;
  while (true) {
    try {
      doc.swatches.getByName(name);
      name = baseName + "-" + i;
      i++;
    } catch (_) {
      return name;
    }
  }
}

/**
 * Crée une nuance CMJN globale.
 * @param {Document} doc
 * @param {CMYKColor} color
 * @param {string} baseName
 * @returns {SpotColor}
 */
function addGlobalProcessSwatch(doc, color, baseName) {
  var swatchName = getUniqueSwatchName(doc, baseName);
  var spot = doc.spots.add();
  spot.name = swatchName;
  spot.colorType = ColorModel.PROCESS;
  spot.color = color;

  var spotColor = new SpotColor();
  spotColor.spot = spot;
  spotColor.tint = 100;
  doc.swatches.add(spotColor);

  for (var i = doc.swatches.length - 1; i >= 0; i--) {
    var swatch = doc.swatches[i];
    if (/^Sans titre/i.test(swatch.name)) {
      try {
        swatch.remove();
      } catch (e) {}
    }
  }
  return spotColor;
}

/**
 * Crée ou récupère le calque "BG-Color".
 * @param {Document} doc
 * @returns {Layer}
 */
function createOrGetBGColorLayer(doc) {
  var layer;
  try {
    layer = doc.layers.getByName("BG-Color");
  } catch (_) {
    layer = doc.layers.add();
    layer.name = "BG-Color";
  }
  layer.zOrder(ZOrderMethod.SENDTOBACK);
  return layer;
}

/**
 * Dessine un rectangle coloré sur un plan de travail.
 * @param {Document} doc
 * @param {Artboard} artboard
 * @param {Layer} layer
 * @param {SpotColor} color
 * @param {number} bleedMM - marge de fond perdu (mm)
 */
function drawRectOnArtboard(doc, artboard, layer, color, bleedMM) {
  var bleed = bleedMM * 2.8346; // mm → pt
  var rect = artboard.artboardRect;

  var left = rect[0] - bleed;
  var top = rect[1] + bleed;
  var width = rect[2] - rect[0] + bleed * 2;
  var height = rect[1] - rect[3] + bleed * 2;

  var bgRect = layer.pathItems.rectangle(top, left, width, height);
  bgRect.filled = true;
  bgRect.fillColor = color;
  bgRect.stroked = false;
  bgRect.move(layer, ElementPlacement.PLACEATBEGINNING);
}

/**
 * Affiche une palette de sélection de plans de travail et de couleur.
 * @param {Artboards} artboards
 * @returns {{indices:number[], color:CMYKColor, bleed:number}|null}
 */
function showArtboardDialog(artboards) {
  var abCount = artboards.length;
  var maxRows = 10;
  var numCols = Math.ceil(abCount / maxRows);
  var itemsPerCol = Math.ceil(abCount / numCols);

  var dialog = new Window("dialog", "Ajouter une couleur de fond");
  dialog.alignChildren = "fill";

  var checkboxPanel = dialog.add("group");
  checkboxPanel.orientation = "row";
  checkboxPanel.alignChildren = ["left", "top"];

  var checkboxes = [];
  var idx = 0;
  for (var col = 0; col < numCols; col++) {
    var colGroup = checkboxPanel.add("group");
    colGroup.orientation = "column";
    colGroup.alignChildren = ["left", "top"];
    for (var row = 0; row < itemsPerCol && idx < abCount; row++) {
      var abName = "#" + (idx + 1) + " : " + artboards[idx].name;
      var cb = colGroup.add("checkbox", undefined, abName);
      cb.value = true;
      checkboxes.push(cb);
      idx++;
    }
  }

  dialog.add("panel", undefined).preferredSize.height = 10;

  var centerBlock = dialog.add("group");
  centerBlock.orientation = "column";
  centerBlock.alignChildren = ["center", "top"];

  var btnGroup = centerBlock.add("group");
  btnGroup.add("button", undefined, "Tout sélectionner").onClick = function () {
    for (var i = 0; i < checkboxes.length; i++) checkboxes[i].value = true;
  };
  btnGroup.add("button", undefined, "Tout désélectionner").onClick =
    function () {
      for (var i = 0; i < checkboxes.length; i++) checkboxes[i].value = false;
    };

  var colorGroup = centerBlock.add("group");
  colorGroup.add("statictext", undefined, "Couleur de fond :");
  var colorDropdown = colorGroup.add("dropdownlist", undefined, []);
  for (var i = 0; i < presetColors.length; i++) {
    var item = colorDropdown.add("item", presetColors[i].name);
    if (presetColors[i].name === "Magenta") colorDropdown.selection = item;
  }

  var bleedGroup = centerBlock.add("group");
  bleedGroup.add("statictext", undefined, "Ajouter des fonds perdus :");
  var bleedInput = bleedGroup.add("edittext", undefined, "0");
  bleedInput.characters = 4;
  bleedGroup.add("statictext", undefined, "mm");

  dialog.add("panel", undefined).preferredSize.height = 10;

  var buttons = dialog.add("group");
  buttons.alignment = "center";
  buttons.add("button", undefined, "OK", { name: "ok" });
  buttons.add("button", undefined, "Annuler", { name: "cancel" });

  if (dialog.show() !== 1) return null;

  var selectedIndices = [];
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].value) selectedIndices.push(i);
  }

  var selectedColor = presetColors[colorDropdown.selection.index];
  var bleed = parseFloat(bleedInput.text.replace(",", ".")) || 0;

  return {
    indices: selectedIndices,
    color: createCMYKColor(
      selectedColor.c,
      selectedColor.m,
      selectedColor.y,
      selectedColor.k
    ),
    bleed: bleed,
  };
}
