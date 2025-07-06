/**
 * Nom du script : Fusionner plusieurs fichiers en planche.jsx
 * Auteur        : eLeGarage - Eliott Lesimple
 * URL           : https://github.com/lesimpleliott
 * Version       : 1.1
 * Date          : 2024-10-26
 * Catégorie     : Plans de travail
 * Compatible    : Illustrator CC 2020+
 * Description   : Ce script importe tous les fichiers image d’un dossier (et sous-dossiers) pour les
 *                 organiser automatiquement dans un nouveau document Illustrator, chaque image sur son propre
 *                 plan de travail, dans une grille. Les plans de travail sont nommés selon les fichiers importés.
 *                 Le fichier généré est sauvegardé automatiquement dans le dossier parent avec un nom basé sur
 *                 celui du dossier source (avec timestamp optionnel). Tous les éléments sont placés dans un calque
 *                 dédié et redimensionnés pour s’adapter au plan de travail.
 * ---
 * Fonctions :
 * - main : Gère le flux principal (sélection dossier, génération document, importation et export).
 * - selectAndValidateFolder : Ouvre une boîte de dialogue pour choisir le dossier source.
 * - retrieveAndValidateFiles : Parcourt le dossier de manière récursive pour collecter les fichiers valides.
 * - initializeDocument : Crée un nouveau document avec une grille de plans de travail adaptés au nombre de fichiers.
 * - addFilesToDocument : Importe chaque fichier, le groupe, le colle sur le bon plan de travail et l’organise dans un calque.
 * - finalizeDocument : Enregistre le fichier avec un nom dynamique dans le dossier parent.
 * - getFilesRecursively : Fonction récursive pour parcourir un dossier et ses sous-dossiers.
 * - processImage : Ouvre chaque fichier, le copie, le colle, le renomme, et ajuste son échelle pour l’artboard.
 * - removeEmptyLayers : Supprime tous les calques vides sauf le calque d’import principal.
 * - scaleToFitArtboard : Redimensionne et centre une image importée dans son plan de travail.
 * - slugify : Nettoie et convertit un nom de dossier en chaîne formatée pour le nom de fichier exporté.
 * - getTimestamp : Génère un horodatage pour les noms de fichiers.
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================
var SHOW_ALERT_AT_END = true; // true = afficher une alerte après exécution, false = silencieux

var exportLayerName = "IMPORTED_IMAGES"; // Nom du calque où seront placées les images importées
var addTimestamp = true; // Ajouter un horodatage au nom du fichier exporté
var artboardSize = 100; // Taille des plans de travail en pixels
var spacing = 10; // Espace entre les plans de travail en pixels
var maxColumns = 20; // Nombre maximum de colonnes par ligne

// HARD CUSTOMIZABLE IF NEEDED
var supportedFileTypes = /\.(ai|eps|svg|jpg|jpeg|png|gif|tiff|webp)$/i;
var maxFiles = 500;

// ========================================
// =============== MAIN ===================
// ========================================
function main() {
  var folder = selectAndValidateFolder();
  if (!folder) return;

  customFileName = slugify(folder.name); // Définir dynamiquement le nom du fichier

  var files = retrieveAndValidateFiles(folder);
  if (files.length === 0) return;

  var masterDoc = initializeDocument(files.length);
  addFilesToDocument(files, masterDoc, folder);
  finalizeDocument(masterDoc, folder);

  if (SHOW_ALERT_AT_END) {
    alert("Traitement terminé et fichier exporté avec succès !");
  }
}

try {
  main();
} catch (err) {
  alert("Erreur dans le script :\n" + err.message);
}

// ========================================
// =============== UTILS ==================
// ========================================

/**
 * Description : Ouvre une boîte de dialogue pour sélectionner un dossier
 * @return {Folder|null} - Dossier sélectionné ou null si annulé
 */
function selectAndValidateFolder() {
  var folder = Folder.selectDialog(
    "Choisissez le dossier contenant les images"
  );
  if (!folder) {
    alert("Aucun dossier sélectionné. Script annulé.");
    return null;
  }
  return folder;
}

/**
 * Description : Récupère tous les fichiers image valides d’un dossier (récursivement)
 * @param {Folder} folder
 * @return {File[]} - Liste des fichiers valides
 */
function retrieveAndValidateFiles(folder) {
  var files = [];
  getFilesRecursively(folder, files);

  if (files.length === 0) {
    alert("Aucune image trouvée dans le dossier sélectionné.");
    return [];
  }

  if (files.length > maxFiles) {
    alert("Limite de 1 000 fichiers dépassée.");
    return [];
  }

  return files;
}

/**
 * Description : Initialise un document avec une grille de plans de travail
 * @param {Number} fileCount - Nombre de plans à créer
 * @return {Document} - Nouveau document AI
 */
function initializeDocument(fileCount) {
  var doc = app.documents.add(DocumentColorSpace.RGB);
  doc.artboards[0].artboardRect = [0, 0, artboardSize, -artboardSize];

  for (var i = 1; i < fileCount; i++) {
    var col = i % maxColumns;
    var row = Math.floor(i / maxColumns);
    var x = col * (artboardSize + spacing);
    var y = -row * (artboardSize + spacing);
    doc.artboards.add([x, y, x + artboardSize, y - artboardSize]);
  }

  return doc;
}

/**
 * Description : Importe chaque fichier et l’ajoute au document
 * @param {File[]} files - Fichiers à importer
 * @param {Document} masterDoc - Document Illustrator principal
 * @param {Folder} rootFolder - Dossier racine sélectionné
 */
function addFilesToDocument(files, masterDoc, rootFolder) {
  for (var i = 0; i < files.length; i++) {
    processImage(files[i], masterDoc, i, rootFolder);
  }

  var exportLayer = masterDoc.layers.add();
  exportLayer.name = exportLayerName;

  masterDoc.activate();
  app.executeMenuCommand("selectall");
  app.executeMenuCommand("group");
  var tempGroup = masterDoc.selection[0];
  tempGroup.move(exportLayer, ElementPlacement.PLACEATBEGINNING);
  app.executeMenuCommand("ungroup");

  removeEmptyLayers(masterDoc, exportLayerName);
}

/**
 * Description : Enregistre et exporte le document
 * @param {Document} masterDoc - Document principal
 * @param {Folder} folder - Dossier d’origine
 */
function finalizeDocument(masterDoc, folder) {
  var parentFolder = folder.parent;
  var baseName = customFileName;
  var timestamp = addTimestamp ? "_" + getTimestamp() : "";
  var saveFile = new File(parentFolder + "/" + baseName + timestamp + ".ai");

  masterDoc.saveAs(saveFile);
  app.executeMenuCommand("zoomout");
  app.executeMenuCommand("zoomout");
  masterDoc.selection = null;
}

/**
 * Description : Parcours récursivement un dossier pour récupérer tous les fichiers pris en charge
 * @param {Folder} folder
 * @param {File[]} files - Liste à remplir
 */
function getFilesRecursively(folder, files) {
  var items = folder.getFiles();
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (item instanceof Folder) {
      getFilesRecursively(item, files);
    } else if (supportedFileTypes.test(item.name)) {
      files.push(item);
    }
  }
}

/**
 * Description : Ouvre, copie, et place une image dans le plan de travail correspondant
 * @param {File} file - Fichier image
 * @param {Document} masterDoc
 * @param {Number} index - Index du plan de travail
 * @param {Folder} rootFolder
 */
function processImage(file, masterDoc, index, rootFolder) {
  var doc = app.open(file);
  app.executeMenuCommand("selectall");
  app.executeMenuCommand("group");
  app.executeMenuCommand("copy");
  doc.close(SaveOptions.DONOTSAVECHANGES);

  masterDoc.artboards.setActiveArtboardIndex(index);
  masterDoc.activate();
  app.executeMenuCommand("paste");

  var fileName = file.name.replace(/\.[^\.]+$/, "");
  var isInSubfolder = file.parent.fullName !== rootFolder.fullName;
  var folderName = isInSubfolder
    ? toCamelCase(decodeURI(file.parent.name))
    : "";
  var finalName = (folderName ? folderName + "_" : "") + fileName;

  masterDoc.artboards[index].name = finalName;

  if (
    masterDoc.selection.length > 0 &&
    masterDoc.selection[0].typename === "GroupItem"
  ) {
    masterDoc.selection[0].name = finalName;
    scaleToFitArtboard(
      masterDoc.selection[0],
      masterDoc.artboards[index].artboardRect
    );
  }

  masterDoc.selection = null;
}

/**
 * Description : Supprime les calques vides sauf celui spécifié
 * @param {Document} doc
 * @param {String} preservedLayerName
 */
function removeEmptyLayers(doc, preservedLayerName) {
  for (var i = doc.layers.length - 1; i >= 0; i--) {
    var layer = doc.layers[i];
    if (layer.pageItems.length === 0 && layer.name !== preservedLayerName) {
      layer.remove();
    }
  }
}

/**
 * Description : Redimensionne un élément pour qu’il tienne dans son plan de travail
 * @param {PageItem} item - Élément à redimensionner
 * @param {Array} artboardRect - Coordonnées du plan de travail
 */
function scaleToFitArtboard(item, artboardRect) {
  var bounds = item.visibleBounds;
  var itemWidth = bounds[2] - bounds[0];
  var itemHeight = bounds[1] - bounds[3];
  var scale = Math.min(artboardSize / itemWidth, artboardSize / itemHeight);
  item.resize(scale * 100, scale * 100, true, true, true, true, scale * 100);
  item.position = [
    artboardRect[0] + artboardSize / 2 - item.width / 2,
    artboardRect[1] - artboardSize / 2 + item.height / 2,
  ];
}

/**
 * Description : Transforme une chaîne en slug MAJUSCULE avec tirets (sans accents, compatible ExtendScript)
 * @param {String} str - Texte à transformer
 * @return {String}
 */
function slugify(str) {
  var accentMap = {
    à: "a",
    â: "a",
    ä: "a",
    é: "e",
    è: "e",
    ê: "e",
    ë: "e",
    î: "i",
    ï: "i",
    ô: "o",
    ö: "o",
    ù: "u",
    û: "u",
    ü: "u",
    ç: "c",
    À: "A",
    Â: "A",
    Ä: "A",
    É: "E",
    È: "E",
    Ê: "E",
    Ë: "E",
    Î: "I",
    Ï: "I",
    Ô: "O",
    Ö: "O",
    Ù: "U",
    Û: "U",
    Ü: "U",
    Ç: "C",
  };

  var result = "";
  for (var i = 0; i < str.length; i++) {
    var c = str.charAt(i);
    result += accentMap[c] || c;
  }

  result = result.replace(/[^\w\s-]/g, ""); // Supprimer les caractères spéciaux
  result = result.replace(/\s+/g, "-"); // Remplacer les espaces par des tirets
  return result.toUpperCase();
}

/**
 * Description : Génère une chaîne d’horodatage
 * @return {String}
 */
function getTimestamp() {
  var date = new Date();
  return (
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    "_" +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2)
  );
}
