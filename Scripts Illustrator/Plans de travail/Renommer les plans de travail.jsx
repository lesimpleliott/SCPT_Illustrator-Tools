/**
 * Nom du script : Renommer les plans de travail.jsx
 *
 * Auteur        : eLeGarage - Eliott Lesimple
 * URL           : https://github.com/lesimpleliott
 * Version       : 2.0
 * Date          : 06/07/2025
 * Catégorie     : Plans de travail
 * Description   : Ce script permet de renommer automatiquement les plans de travail dans un document Illustrator en se basant sur des objets texte positionnés sur chaque plan.
 *
 *                 Ces textes sont répartis dans trois calques distincts : Prefix, Base (obligatoire), et Suffix.
 *
 *                 Le script s'utilise en deux étapes :
 *
 *                 1. Initialisation : ajoute des calques spécifiques contenant des textes par défaut à chaque plan de travail.
 *                    Ces textes servent de gabarit personnalisable pour la génération des noms.
 *
 *                 2. Renommage : lit les contenus des textes présents sur chaque plan de travail et applique le nom généré.
 *                    Si la valeur de base est inchangée (valeur par défaut), le plan est ignoré ou nommé "NONAME".
 * ---
 * Fonctions :
 * - mainLauncher : Affiche la fenêtre d’interface utilisateur (Initialiser ou Renommer).
 * - initArtboards : Crée les calques et ajoute les textes sur chaque plan de travail.
 * - renameMain : Extrait les textes et applique les nouveaux noms aux plans de travail.
 * - getOrCreateLayer : Crée ou récupère un calque Illustrator donné.
 * - hasAnyTextInBounds : Vérifie la présence de texte dans les limites d’un plan de travail.
 * - getTextItemsFromLayer : Récupère tous les objets texte d’un calque.
 * - getLayerIfExists : Retourne un calque s’il existe, sinon null.
 * - findBestTextForArtboard : Associe le meilleur texte à un plan de travail donné.
 * - cleanTextName : Nettoie un nom pour le rendre compatible avec Illustrator.
 * - buildNameForArtboard : Assemble le nom final à partir des textes prefix/base/suffix.
 * - buildArtboardNameMap : Génère un mapping entre plans et noms à appliquer.
 * - renameArtboardsFromMap : Applique les noms aux plans de travail en gérant les doublons.
 * - macmykColor : Crée une couleur CMJN à utiliser dans Illustrator.
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================
var SHOW_ALERT_AT_END = false; // true = afficher une alerte après exécution, false = silencieux

const DEFAULT_PREFIX = "PREFIX"; // Préfixe par défaut pour les noms de plans de travail
const DEFAULT_BASE = "Name"; // Base obligatoire pour les noms de plans de travail
const DEFAULT_SUFFIX = "SUFFIX"; // Suffixe optionnel pour les noms de plans de travail
var layerName = "RenameArtboard"; // Nom racine des calques générés

var textColor = macmykColor(0, 100, 0, 0); // Couleur du texte (CMJN)
var fontSize = 12; // Taille de la police du texte
var lineSpacing = 14; // Espacement vertical entre chaque ligne de texte (en points)
var textOffsetLeft = 5; // Décalage horizontal du texte depuis le bord gauche du plan de travail (en mm)
var textOffsetTop = 5; // Décalage vertical du texte depuis le bord supérieur du plan de travail (en mm)

// ========================================
// =============== MAIN ===================
// ========================================

/**
 * Affiche la boîte de dialogue principale du script permettant de choisir entre Initialiser ou Renommer.
 */
function mainLauncher() {
  var dialog = new Window("dialog", "Renommer les plans de travail");
  dialog.orientation = "column";
  dialog.alignChildren = "fill";

  // Zone d'explication
  var description = dialog.add(
    "edittext",
    undefined,
    "Ce script permet de renommer automatiquement vos plans de travail en fonction de textes spécifiques placés sur chaque plan.\n\nCommencez par initialiser les calques, puis personnalisez vos textes. Relancez ensuite ce script pour appliquer le renommage.",
    { multiline: true, readonly: true }
  );
  description.preferredSize = [400, 100];
  description.margins = 10;

  // Boutons sur une ligne
  var buttonGroup = dialog.add("group");
  buttonGroup.orientation = "row";
  buttonGroup.alignment = "center";

  var initBtn = buttonGroup.add("button", undefined, "Initialiser", {
    name: "init",
  });
  var renameBtn = buttonGroup.add("button", undefined, "Renommer", {
    name: "rename",
  });

  initBtn.onClick = function () {
    dialog.close();
    initArtboards();
  };
  renameBtn.onClick = function () {
    dialog.close();
    renameMain(SHOW_ALERT_AT_END);
  };

  dialog.show();
}

// Lancer le script
try {
  mainLauncher();
} catch (err) {
  alert("Erreur dans le script :\n" + err.message);
}

/**
 * Crée les calques et les textes nécessaires sur chaque plan de travail du document actif.
 * Les textes sont positionnés avec un décalage configurable et stylisés.
 */
function initArtboards() {
  if (app.documents.length === 0) {
    alert("Aucun document ouvert.");
    return;
  }

  var doc = app.activeDocument;
  var artboards = doc.artboards;

  var layersInfo = [
    { name: layerName + "_Prefix", content: DEFAULT_PREFIX + "_optional" },
    { name: layerName + "_Base", content: DEFAULT_BASE + "_obligatory" },
    { name: layerName + "_Suffix", content: DEFAULT_SUFFIX + "_optional" },
  ];

  var layers = {};
  for (var i = layersInfo.length - 1; i >= 0; i--) {
    layers[layersInfo[i].name] = getOrCreateLayer(doc, layersInfo[i].name);
  }

  for (var a = 0; a < artboards.length; a++) {
    var artboard = artboards[a];
    var rect = artboard.artboardRect;
    var skip = false;
    for (var j = 0; j < layersInfo.length; j++) {
      var layer = layers[layersInfo[j].name];
      if (hasAnyTextInBounds(layer, rect)) {
        skip = true;
        break;
      }
    }
    if (skip) continue;

    for (var i = 0; i < layersInfo.length; i++) {
      var info = layersInfo[i];
      var layer = layers[info.name];
      var yOffset = textOffsetTop * 2.83464567 + i * lineSpacing; // Conversion mm to points
      var x = rect[0] + textOffsetLeft * 2.83464567; // Conversion mm to points
      var y = rect[1] - yOffset;

      var black = new GrayColor();
      black.gray = 100;
      var text = layer.textFrames.add();
      text.contents = info.content;
      text.textRange.size = fontSize;
      text.textRange.fillColor = textColor;
      text.position = [x, y];
    }
  }

  if (SHOW_ALERT_AT_END) alert("Initialisation terminée.");
}

/**
 * Extrait les textes des calques et renomme les plans de travail selon leur contenu.
 * @param {boolean} showAlerts - Affiche une alerte en fin de traitement si true.
 */
function renameMain(showAlerts) {
  if (showAlerts === undefined) showAlerts = true;

  try {
    var doc = app.activeDocument;
    var artboards = doc.artboards;

    var baseTexts = getTextItemsFromLayer(layerName + "_Base");
    var prefixTexts = getTextItemsFromLayer(layerName + "_Prefix");
    var suffixTexts = getTextItemsFromLayer(layerName + "_Suffix");

    var mapping = buildArtboardNameMap(
      artboards,
      baseTexts,
      prefixTexts,
      suffixTexts
    );
    renameArtboardsFromMap(artboards, mapping);

    if (showAlerts) {
      alert("Renommage terminé.");
    }
  } catch (e) {
    alert("Erreur : " + e.message);
  }
}

// ========================================
// =============== UTILS ==================
// ========================================

/**
 * Crée un calque s’il n’existe pas ou le récupère s’il est déjà présent.
 * @param {Document} doc - Document actif
 * @param {string} name - Nom du calque à créer ou récupérer
 * @returns {Layer}
 */
function getOrCreateLayer(doc, name) {
  var layer;
  try {
    layer = doc.layers.getByName(name);
    layer.visible = true;
    layer.locked = false;
  } catch (e) {
    layer = doc.layers.add();
    layer.name = name;
  }
  layer.printable = false;
  layer.color = new RGBColor();
  layer.color.red = 255;
  layer.color.green = 0;
  layer.color.blue = 0;
  return layer;
}

/**
 * Vérifie si un calque contient un texte entièrement à l’intérieur d’un rectangle donné.
 * @param {Layer} layer
 * @param {Array} bounds - [left, top, right, bottom]
 * @returns {boolean}
 */
function hasAnyTextInBounds(layer, bounds) {
  for (var i = 0; i < layer.textFrames.length; i++) {
    var tf = layer.textFrames[i];
    var tfBounds = tf.geometricBounds;
    var fullyInside =
      tfBounds[0] >= bounds[0] &&
      tfBounds[2] <= bounds[2] &&
      tfBounds[1] <= bounds[1] &&
      tfBounds[3] >= bounds[3];
    if (fullyInside) return true;
  }
  return false;
}

/**
 * Récupère tous les objets texte d’un calque donné (ou retourne une liste vide).
 * @param {string} layerName
 * @returns {Array<TextFrame>}
 */
function getTextItemsFromLayer(layerName) {
  var layer = getLayerIfExists(layerName);
  var list = [];
  if (!layer) return list;
  for (var i = 0; i < layer.textFrames.length; i++) {
    list.push(layer.textFrames[i]);
  }
  return list;
}

/** * Récupère un calque par son nom s’il existe, sinon retourne null.
 * @param {string} name
 * @returns {Layer|null}
 */
function getLayerIfExists(name) {
  try {
    return app.activeDocument.layers.getByName(name);
  } catch (e) {
    return null;
  }
}

/**
 * Retourne le meilleur objet texte associé à un plan de travail donné.
 * Priorise les textes entièrement inclus dans la zone.
 * @param {Array<TextFrame>} texts
 * @param {Array<number>} bounds
 * @returns {TextFrame|null}
 */
function findBestTextForArtboard(texts, bounds) {
  var fallback = null;
  for (var i = 0; i < texts.length; i++) {
    var tf = texts[i];
    var tfBounds = tf.geometricBounds;
    var fullyInside =
      tfBounds[0] >= bounds[0] &&
      tfBounds[2] <= bounds[2] &&
      tfBounds[1] <= bounds[1] &&
      tfBounds[3] >= bounds[3];
    if (fullyInside) return tf;
    var overlap =
      tfBounds[2] > bounds[0] &&
      tfBounds[0] < bounds[2] &&
      tfBounds[1] > bounds[3] &&
      tfBounds[3] < bounds[1];
    if (overlap && fallback === null) fallback = tf;
  }
  return fallback;
}

/**
 * Nettoie une chaîne de caractères pour en faire un nom de plan de travail valide.
 * @param {string} name
 * @returns {string}
 */
function cleanTextName(name) {
  var sanitized = (name + "").replace(/^\s+|\s+$/g, "");
  sanitized = sanitized.replace(/[\/\\:*?"<>|]/g, "-");
  return sanitized;
}

/**
 * Construit un nom pour un plan de travail en combinant les textes (prefix, base, suffix).
 * Ignore les valeurs par défaut non modifiées.
 * @param {TextFrame|null} prefix
 * @param {TextFrame|null} base
 * @param {TextFrame|null} suffix
 * @returns {string|null}
 */
function buildNameForArtboard(prefix, base, suffix) {
  var defaultPrefix = DEFAULT_PREFIX + "_optional";
  var defaultBase = DEFAULT_BASE + "_obligatory";
  var defaultSuffix = DEFAULT_SUFFIX + "_optional";

  var hasValidPrefix = prefix && prefix.contents !== defaultPrefix;
  var hasValidBase = base && base.contents !== defaultBase;
  var hasValidSuffix = suffix && suffix.contents !== defaultSuffix;

  if (!hasValidBase) return null;

  var parts = [];
  if (hasValidPrefix) parts.push(cleanTextName(prefix.contents));
  parts.push(cleanTextName(base.contents));

  var raw = parts.join("_");
  if (hasValidSuffix) raw += "-" + cleanTextName(suffix.contents);

  return raw;
}

/**
 * Construit une table d'association entre les plans de travail et leurs noms.
 * @returns {{rawNames: string[], nameMap: Object<string, number[]>}}
 */
function buildArtboardNameMap(artboards, baseTexts, prefixTexts, suffixTexts) {
  var rawNames = [];
  var nameMap = {};

  for (var i = 0; i < artboards.length; i++) {
    var bounds = artboards[i].artboardRect;
    var baseText = findBestTextForArtboard(baseTexts, bounds);
    var prefixText = findBestTextForArtboard(prefixTexts, bounds);
    var suffixText = findBestTextForArtboard(suffixTexts, bounds);
    var raw = buildNameForArtboard(prefixText, baseText, suffixText);
    rawNames[i] = raw;
    if (!nameMap[raw]) nameMap[raw] = [];
    nameMap[raw].push(i);
  }

  return { rawNames: rawNames, nameMap: nameMap };
}

/**
 * Applique les noms de plans de travail depuis une map générée. Gère les doublons.
 * @param {Artboard[]} artboards
 * @param {{rawNames: string[], nameMap: Object<string, number[]>}} mapping
 */
function renameArtboardsFromMap(artboards, mapping) {
  var rawNames = mapping.rawNames;
  var nameMap = mapping.nameMap;
  var untitledCounter = 0;

  for (var i = 0; i < rawNames.length; i++) {
    var raw = rawNames[i];
    if (!raw) {
      untitledCounter++;
      artboards[i].name = "NONAME-" + untitledCounter;
      continue;
    }
    var finalName = raw;
    var indices = nameMap[raw];
    if (indices.length > 1) {
      var indexInGroup = 0;
      for (var j = 0; j < indices.length; j++) {
        if (indices[j] === i) {
          indexInGroup = j;
          break;
        }
      }
      finalName += "-" + ("0" + (indexInGroup + 1)).slice(-2);
    }
    artboards[i].name = finalName;
  }
}

/**
 * Crée un objet couleur CMJN utilisable pour du texte ou un fond.
 * @param {number} c
 * @param {number} m
 * @param {number} y
 * @param {number} k
 * @returns {CMYKColor}
 */
function macmykColor(c, m, y, k) {
  var cmyk = new CMYKColor();
  cmyk.cyan = c;
  cmyk.magenta = m;
  cmyk.yellow = y;
  cmyk.black = k;
  return cmyk;
}
