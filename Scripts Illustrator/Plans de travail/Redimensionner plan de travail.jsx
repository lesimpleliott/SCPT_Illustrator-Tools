/**
 * Nom du script : Redimensionner plan de travail.jsx
 * Auteur        : eLeGarage - Eliott Lesimple
 * URL           : https://github.com/lesimpleliott
 * Version       : 1.0
 * Date          : 2025-06-28
 * Catégorie     : Plans de travail
 * Compatible    : Illustrator CC 2020+
 * Description   : Ce script permet d'ajouter un "blanc tournant" (marge externe) autour d’un ou plusieurs
 *                 plans de travail sélectionnés dans un document Illustrator. L’utilisateur peut choisir
 *                 la valeur de la marge à appliquer (en mm) via une interface de sélection conviviale.
 * ---
 * Fonctions :
 * - main : Gère le déroulement global (vérification document, interface, redimensionnement).
 * - showArtboardSelectionDialog : Interface pour choisir les plans à modifier et entrer le blanc tournant.
 * - resizeArtboards : Applique un redimensionnement avec marge aux plans sélectionnés.
 * - mmToPoints : Convertit une valeur millimétrique en points Illustrator.
 */

// ========================================
// =============== MAIN ===================
// ========================================
function main() {
  if (app.documents.length === 0) {
    alert("Aucun document ouvert.");
    return;
  }

  var doc = app.activeDocument;
  var result = showArtboardSelectionDialog(doc.artboards);
  if (!result) return;

  if (result.indices.length === 0) {
    alert("Aucun plan de travail sélectionné.");
    return;
  }

  resizeArtboards(result.indices, result.offset);
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
 * Description : Convertit des millimètres en points Illustrator.
 * @param {Number} mm - Valeur en millimètres.
 * @return {Number} Valeur convertie en points.
 */
function mmToPoints(mm) {
  return mm * 2.83464567;
}

/**
 * Description : Affiche une fenêtre permettant de sélectionner les plans de travail à modifier et de saisir la marge (blanc tournant).
 * @param {Artboards} artboards - Liste des plans de travail du document.
 * @return {Object|null} Objet contenant `indices` (array) et `offset` (en points), ou null si annulé.
 */
function showArtboardSelectionDialog(artboards) {
  var abCount = artboards.length;
  var maxRows = 10;
  var numCols = Math.ceil(abCount / maxRows);
  var itemsPerCol = Math.ceil(abCount / numCols);

  var dialog = new Window("dialog", "Sélection des plans de travail");
  dialog.alignChildren = "fill";

  // Zone centrale avec marge + boutons
  var centerBlock = dialog.add("group");
  centerBlock.orientation = "column";
  centerBlock.alignChildren = ["center", "top"];

  // Ligne : saisie du blanc tournant
  var offsetRow = centerBlock.add("group");
  offsetRow.add("statictext", undefined, "Blanc tournant :");
  var offsetInput = offsetRow.add("edittext", undefined, "10");
  offsetInput.characters = 6;
  offsetRow.add("statictext", undefined, "mm");

  // Boutons sélection/désélection
  var selectionRow = centerBlock.add("group");
  selectionRow.add("button", undefined, "Tout sélectionner").onClick =
    function () {
      for (var i = 0; i < checkboxes.length; i++) checkboxes[i].value = true;
    };
  selectionRow.add("button", undefined, "Tout désélectionner").onClick =
    function () {
      for (var i = 0; i < checkboxes.length; i++) checkboxes[i].value = false;
    };

  // Zone de sélection des plans de travail
  var paddedContainer = dialog.add("group");
  paddedContainer.orientation = "column";
  paddedContainer.alignChildren = ["fill", "top"];
  paddedContainer.margins = 10;

  var checkboxPanel = paddedContainer.add("group");
  checkboxPanel.orientation = "row";
  checkboxPanel.alignChildren = ["left", "top"];

  var checkboxes = [];
  var idx = 0;
  for (var col = 0; col < numCols; col++) {
    if (col > 0) {
      var spacer = checkboxPanel.add("panel", undefined, "");
      spacer.preferredSize.width = 20;
    }

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

  // Boutons OK / Annuler
  var buttons = dialog.add("group");
  buttons.alignment = "center";
  buttons.add("button", undefined, "OK", { name: "ok" });
  buttons.add("button", undefined, "Annuler", { name: "cancel" });

  if (dialog.show() !== 1) return null;

  var selectedIndices = [];
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].value) selectedIndices.push(i);
  }

  var offset = parseFloat(offsetInput.text);
  if (isNaN(offset)) {
    alert("Valeur invalide pour le blanc tournant.");
    return null;
  }

  return {
    indices: selectedIndices,
    offset: mmToPoints(offset),
  };
}

/**
 * Description : Redimensionne les plans de travail spécifiés en ajoutant une marge autour.
 * @param {Array} indices - Liste des indices de plans de travail à modifier.
 * @param {Number} offset - Valeur du blanc tournant à ajouter (en points).
 * @return {void}
 */
function resizeArtboards(indices, offset) {
  var doc = app.activeDocument;
  for (var i = 0; i < indices.length; i++) {
    var ab = doc.artboards[indices[i]];
    var rect = ab.artboardRect;
    var newRect = [
      rect[0] - offset / 2,
      rect[1] + offset / 2,
      rect[2] + offset / 2,
      rect[3] - offset / 2,
    ];
    ab.artboardRect = newRect;
  }
}
