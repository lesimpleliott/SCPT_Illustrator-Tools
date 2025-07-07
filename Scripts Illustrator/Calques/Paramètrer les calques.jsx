/**
 * Nom du script : Paramétrer les calques visibles et non verrouillés.jsx
 * Auteur        : eLeGarage - Eliott Lesimple
 * URL           : https://github.com/lesimpleliott
 * Version       : 1.1
 * Date          : 2024-05-16
 * Catégorie     : Calques
 * Compatible    : Illustrator CC 2020+
 * Description   : Ce script permet de configurer rapidement les propriétés des calques visibles et non verrouillés dans un document Illustrator.
 *
 *                 Il propose une interface utilisateur pour appliquer des options comme la visibilité, l'impression, le verrouillage, l'opacité, ou encore la couleur, y compris sur les sous-calques si nécessaire.
 *
 *                 L'utilisateur peut choisir une couleur prédéfinie ou une couleur personnalisée, activer l’estompage des images avec gestion de l’opacité, et appliquer ces réglages à tous les calques actifs.
 * ---
 * Fonctions :
 * - main : Affiche l’interface utilisateur et applique les paramètres sélectionnés aux calques concernés.
 * - createUI : Construit et retourne tous les composants de l’interface utilisateur (dialog, champs, options...).
 * - applyLayerSettings : Applique les réglages définis à un calque et ses sous-calques selon les critères donnés.
 * - getPresetColorNames : Retourne la liste des noms de couleurs prédéfinies (ex. Vert, Rouge, etc.).
 * - updateRGBFields : Met à jour les champs de couleur RGB selon la couleur présélectionnée dans le menu déroulant.
 * - setInputFont : Applique un style typographique (normal ou italique) à un champ de saisie RGB.
 * - isValueDifferentFrom : Compare une couleur entrée à un preset pour détecter une personnalisation manuelle.
 * - attachColorInputChange : Gère automatiquement le changement du statut "Personnalisée" sur modification RGB.
 * - clamp : Contraint une valeur numérique dans une plage spécifiée (min, max).
 * - parseIntOr : Convertit un texte en nombre entier, ou retourne une valeur par défaut si invalide.
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================

var SHOW_ALERT_AT_END = false; // true = afficher une alerte après exécution, false = silencieux

var DEFAULT_LAYER_SETTINGS = {
  visible: true,
  locked: false,
  printable: true,
  template: false,
  preview: true,
  dimImages: false,
  opacity: 100,
  includeSubs: true,
};

var PRESET_COLORS = {
  Vert: [0, 255, 0],
  Rouge: [255, 0, 0],
  Bleu: [0, 0, 255],
  Jaune: [255, 255, 0],
  Magenta: [255, 0, 255],
  Cyan: [0, 255, 255],
  Noir: [0, 0, 0],
  Gris: [128, 128, 128],
  Blanc: [255, 255, 255],
};

// ========================================
// =============== MAIN ===================
// ========================================

/* Description : Affiche l'interface utilisateur, collecte les options et applique les paramètres aux calques */
function main() {
  var ui = createUI();
  var dialog = ui.dialog;

  ui.colorDropdown.onChange = function () {
    if (ui.colorDropdown.selection.text !== "Personnalisée") {
      updateRGBFields(
        ui.colorDropdown.selection.text,
        ui.redInput,
        ui.greenInput,
        ui.blueInput
      );
    }
  };

  attachColorInputChange(
    ui.redInput,
    ui.colorDropdown,
    ui.redInput,
    ui.greenInput,
    ui.blueInput
  );
  attachColorInputChange(
    ui.greenInput,
    ui.colorDropdown,
    ui.redInput,
    ui.greenInput,
    ui.blueInput
  );
  attachColorInputChange(
    ui.blueInput,
    ui.colorDropdown,
    ui.redInput,
    ui.greenInput,
    ui.blueInput
  );

  updateRGBFields("Vert", ui.redInput, ui.greenInput, ui.blueInput);

  if (dialog.show() === 1) {
    if (app.documents.length === 0) {
      alert("Aucun document ouvert.");
      return;
    }

    var doc = app.activeDocument;
    var opacity = clamp(parseFloat(ui.opacityInput.text), 0, 100);
    var rgb = new RGBColor();
    rgb.red = parseIntOr(ui.redInput.text, 0);
    rgb.green = parseIntOr(ui.greenInput.text, 0);
    rgb.blue = parseIntOr(ui.blueInput.text, 0);

    var options = {
      visible: ui.chkVisible.value,
      locked: ui.chkLocked.value,
      printable: ui.chkPrintable.value,
      template: ui.chkTemplate.value,
      preview: ui.chkPreview.value,
      dimImages: ui.chkDimImages.value,
      includeSubs: ui.chkIncludeSubLayers.value,
    };

    for (var i = 0; i < doc.layers.length; i++) {
      applyLayerSettings(doc.layers[i], rgb, opacity, options);
    }

    if (SHOW_ALERT_AT_END) alert("Paramètres appliqués !");
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

/* Description : Retourne la liste des couleurs prédéfinies avec "Personnalisée" en tête
 * @return     : Array
 */
function getPresetColorNames() {
  var names = ["Personnalisée"];
  for (var key in PRESET_COLORS) {
    if (PRESET_COLORS.hasOwnProperty(key)) names.push(key);
  }
  return names;
}

/* Description : Met à jour les champs RGB selon la couleur sélectionnée
 * @params     : colorName (string), rInput/gInput/bInput (ScriptUIEditText)
 */
function updateRGBFields(colorName, rInput, gInput, bInput) {
  var values = PRESET_COLORS[colorName];
  rInput.text = values[0];
  gInput.text = values[1];
  bInput.text = values[2];
  setInputFont(rInput, "italic");
  setInputFont(gInput, "italic");
  setInputFont(bInput, "italic");
}

/* Description : Applique un style de police à un champ texte ScriptUI
 * @params     : input (ScriptUIEditText), style (string)
 */
function setInputFont(input, style) {
  input.graphics.font = ScriptUI.newFont("dialog", style, 12);
}

/* Description : Vérifie si les valeurs RGB diffèrent du preset donné
 * @params     : colorName (string), r/g/b (ScriptUIEditText)
 * @return     : boolean
 */
function isValueDifferentFrom(colorName, r, g, b) {
  var expected = PRESET_COLORS[colorName];
  return (
    parseInt(r.text) !== expected[0] ||
    parseInt(g.text) !== expected[1] ||
    parseInt(b.text) !== expected[2]
  );
}

/* Description : Active la gestion de la sélection "Personnalisée" en cas de modification RGB
 * @params     : input (ScriptUIEditText), dropdown (DropdownList), r/g/b (ScriptUIEditText)
 */
function attachColorInputChange(input, dropdown, r, g, b) {
  input.onChanging = function () {
    if (dropdown.selection && dropdown.selection.text !== "Personnalisée") {
      if (isValueDifferentFrom(dropdown.selection.text, r, g, b)) {
        dropdown.selection = 0;
        setInputFont(r, "normal");
        setInputFont(g, "normal");
        setInputFont(b, "normal");
      }
    }
  };
}

/* Description : Contraint une valeur numérique dans un intervalle
 * @params     : value, min, max (number)
 * @return     : number
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* Description : Convertit une chaîne en entier ou retourne une valeur par défaut
 * @params     : value (string), fallback (number)
 * @return     : number
 */
function parseIntOr(value, fallback) {
  var n = parseInt(value, 10);
  return isNaN(n) ? fallback : n;
}

/* Description : Applique les paramètres à un calque et ses sous-calques s'ils sont visibles et déverrouillés
 * @params     : layer (Layer), rgb (RGBColor), opacity (number), options (object)
 */
function applyLayerSettings(layer, rgb, opacity, options) {
  if (layer.visible && !layer.locked) {
    layer.template = options.template;
    layer.visible = options.visible;
    layer.preview = options.preview;
    layer.locked = options.locked;
    layer.printable = options.printable;
    layer.dimPlacedImages = options.dimImages;
    if (options.dimImages) layer.opacity = opacity;
    layer.color = rgb;

    if (options.includeSubs && layer.layers.length > 0) {
      for (var i = 0; i < layer.layers.length; i++) {
        applyLayerSettings(layer.layers[i], rgb, opacity, options);
      }
    }
  }
}

/* Description : Crée et retourne l'interface utilisateur principale du script
 * @return     : Object
 */
function createUI() {
  var dialog = new Window(
    "dialog",
    "Paramètres des calques visibles et déverrouillés"
  );
  dialog.orientation = "column";
  dialog.alignChildren = "fill";

  var propertiesPanel = dialog.add("panel", undefined, "Propriétés du calque");
  propertiesPanel.orientation = "row";
  propertiesPanel.alignChildren = "top";
  propertiesPanel.spacing = 30;
  propertiesPanel.margins = 20;

  var leftCol = propertiesPanel.add("group");
  leftCol.orientation = "column";
  leftCol.alignChildren = "left";
  leftCol.spacing = 5;

  var chkVisible = leftCol.add("checkbox", undefined, "Afficher");
  chkVisible.value = DEFAULT_LAYER_SETTINGS.visible;
  // var chkLocked = leftCol.add("checkbox", undefined, "Verrouiller");
  // chkLocked.value = DEFAULT_LAYER_SETTINGS.locked;
  var chkPrintable = leftCol.add("checkbox", undefined, "Imprimer");
  chkPrintable.value = DEFAULT_LAYER_SETTINGS.printable;
  var chkIncludeSubLayers = leftCol.add(
    "checkbox",
    undefined,
    "Inclure les sous-calques"
  );
  chkIncludeSubLayers.value = DEFAULT_LAYER_SETTINGS.includeSubs;

  var rightCol = propertiesPanel.add("group");
  rightCol.orientation = "column";
  rightCol.alignChildren = "left";
  rightCol.spacing = 5;

  var chkTemplate = rightCol.add("checkbox", undefined, "Modèle");
  chkTemplate.value = DEFAULT_LAYER_SETTINGS.template;
  var chkPreview = rightCol.add("checkbox", undefined, "Aperçu");
  chkPreview.value = DEFAULT_LAYER_SETTINGS.preview;
  var chkDimImages = rightCol.add("checkbox", undefined, "Estomper les images");
  chkDimImages.value = DEFAULT_LAYER_SETTINGS.dimImages;

  var opacityGroup = rightCol.add("group");
  opacityGroup.orientation = "row";
  opacityGroup.margins = [20, -5, 0, 0];
  opacityGroup.add("statictext", undefined, "Opacité (%) :");
  var opacityInput = opacityGroup.add(
    "edittext",
    undefined,
    DEFAULT_LAYER_SETTINGS.opacity.toString()
  );
  opacityInput.characters = 5;
  opacityInput.enabled = DEFAULT_LAYER_SETTINGS.dimImages;

  chkDimImages.onClick = function () {
    opacityInput.enabled = chkDimImages.value;
  };

  var colorPanel = dialog.add("panel", undefined, "Couleur");
  colorPanel.orientation = "column";
  colorPanel.alignChildren = "left";
  colorPanel.margins = 20;

  var colorLine = colorPanel.add("group");
  colorLine.orientation = "row";
  colorLine.alignChildren = "center";
  colorLine.spacing = 10;

  var colorDropdown = colorLine.add(
    "dropdownlist",
    undefined,
    getPresetColorNames()
  );
  colorDropdown.selection = 1;

  function addRGBField(parent, label, defaultValue) {
    parent.add("statictext", undefined, label);
    var input = parent.add("edittext", undefined, defaultValue);
    input.characters = 4;
    input.graphics.font = ScriptUI.newFont("dialog", "italic", 12);
    return input;
  }

  var redInput = addRGBField(colorLine, "R", PRESET_COLORS.Vert[0].toString());
  var greenInput = addRGBField(
    colorLine,
    "V",
    PRESET_COLORS.Vert[1].toString()
  );
  var blueInput = addRGBField(colorLine, "B", PRESET_COLORS.Vert[2].toString());

  var btnGroup = dialog.add("group");
  btnGroup.alignment = "center";
  btnGroup.spacing = 15;
  btnGroup.add("button", undefined, "Annuler", { name: "cancel" });
  var okBtn = btnGroup.add("button", undefined, "OK", { name: "ok" });

  return {
    dialog: dialog,
    okBtn: okBtn,
    chkVisible: chkVisible,
    // chkLocked: chkLocked,
    chkPrintable: chkPrintable,
    chkIncludeSubLayers: chkIncludeSubLayers,
    chkTemplate: chkTemplate,
    chkPreview: chkPreview,
    chkDimImages: chkDimImages,
    opacityInput: opacityInput,
    colorDropdown: colorDropdown,
    redInput: redInput,
    greenInput: greenInput,
    blueInput: blueInput,
  };
}
