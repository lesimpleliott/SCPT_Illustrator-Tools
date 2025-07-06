/**
 * Nom du script : ScriptRunner.jsx
 * Auteur        : eLeGarage - Eliott Lesimple
 * URL           : https://github.com/lesimpleliott
 * Version       : 2.0
 * Date          : 2025-07-06
 * Catégorie     : Interface Utilisateur / Productivité
 * Compatible    : Illustrator CC 2020+
 * Description   : Interface de lancement de scripts Illustrator regroupés par dossier, avec aperçu dynamique et gestion de l'emplacement des scripts.
 * ---
 * Fonctions :
 * - main() : Construit l'UI avec les boutons de scripts, regroupés par catégorie.
 * - getGroupedScripts() : Recherche récursive de tous les fichiers .jsx
 * - addScriptButton() : Ajoute dynamiquement un bouton pour chaque script trouvé
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================
var SCRIPT_ROOT = new Folder(
  "/Users/lesimpleliott/Documents/Scripts Illustrator"
);
var WINDOW_WIDTH = 950;

var DEFAULT_DESCRIPTION =
  "Bienvenue dans ScriptRunner !\n\n" +
  "Ce panneau vous permet de lancer rapidement des scripts Illustrator organisés par dossiers. " +
  "Chaque script est affiché dans la colonne de gauche, trié par catégorie.\n\n" +
  "🧭 Mode découverte : activez cette option pour en apprendre plus sur vos scripts avant de les exécuter.\n" +
  "• 1er clic : affiche la description du script\n" +
  "• 2e clic (sur le même bouton) : exécute le script\n\n" +
  "📁 Emplacement des scripts : utilisez le bouton en bas pour changer le dossier où vos fichiers .jsx sont stockés.";
// ========================================
// =============== MAIN ===================
// ========================================

main();

function main() {
  if (!SCRIPT_ROOT.exists) {
    alert("❌ Le dossier des scripts n'existe pas :\n" + SCRIPT_ROOT.fsName);
    return;
  }

  var allScripts = {};
  getGroupedScripts(SCRIPT_ROOT, allScripts, "");

  var win = new Window("dialog", "ScriptRunner");
  win.orientation = "column";
  win.alignChildren = "fill";

  var contentGroup = win.add("group");
  contentGroup.orientation = "row";
  contentGroup.alignChildren = "top";
  contentGroup.margins = 10;

  // ==== Colonne gauche ====
  var leftPanel = contentGroup.add("group");
  leftPanel.orientation = "column";
  leftPanel.alignChildren = "fill";
  leftPanel.spacing = 10;
  leftPanel.margins = 0;
  leftPanel.preferredSize.width = 430;

  for (var group in allScripts) {
    var panel = leftPanel.add("panel", undefined, decodeURIComponent(group));
    panel.orientation = "column";
    panel.alignChildren = "fill";

    var scripts = allScripts[group].sort(function (a, b) {
      return decodeURIComponent(a.name).localeCompare(
        decodeURIComponent(b.name)
      );
    });

    for (var i = 0; i < scripts.length; i++) {
      addScriptButton(panel, scripts[i]);
    }
  }

  // ==== Colonne droite ====
  var rightPanel = contentGroup.add("group");
  rightPanel.orientation = "column";

  rightPanel.alignChildren = "left";
  rightPanel.spacing = 10;
  rightPanel.margins = [20, 0, 0, 0];
  rightPanel.preferredSize.width = 480;

  var label = rightPanel.add("statictext", undefined, "Explorateur de scripts");
  label.graphics.font = ScriptUI.newFont("Helvetica", "bold", 12);

  var discoveryMode = rightPanel.add(
    "checkbox",
    undefined,
    "Mode découverte (survol/cliquer)"
  );

  var descBox = rightPanel.add(
    "edittext",
    undefined,
    DEFAULT_DESCRIPTION,

    {
      multiline: true,
      readonly: true,
    }
  );
  descBox.minimumSize.height = 100;
  descBox.maximumSize.height = 1000;
  descBox.maximumSize.width = 400;
  descBox.minimumSize.width = 400;

  // ==== Ajustement de hauteur dynamique ====
  win.onShow = function () {
    win.layout.layout(true);
    win.layout.resize();

    var offset = 100; // Ajustement de la hauteur - permet de réduire la hauteur de la descBox
    var leftHeight = leftPanel.size ? leftPanel.size.height : 300;

    descBox.maximumSize.height = leftHeight - offset;
    descBox.preferredSize.height = leftHeight - offset;
    descBox.minimumSize.height = leftHeight - offset;

    win.layout.layout(true);
  };

  // ==== Crédits ====
  var creditsGroup = rightPanel.add("group");
  creditsGroup.orientation = "row";
  creditsGroup.alignChildren = ["left", "center"];
  creditsGroup.spacing = 10;

  // Texte : Créé par ...
  var creditText = creditsGroup.add(
    "statictext",
    undefined,
    "Créé avec 🤍 et beaucoup de ☕️ par"
  );

  // Liens GitHub
  createLinkButton(creditsGroup, "eleGarage", "https://elegarage.fr/");
  createLinkButton(
    creditsGroup,
    "GitHub",
    "https://github.com/lesimpleliott/SCPT_Illustrator-Tools"
  );

  // ==== Footer ====
  var footer = win.add("group");
  footer.orientation = "row";
  footer.alignment = "center";
  footer.margins = [0, 15, 0, 15];

  footer.add("button", undefined, "Modifier l'emplacement des scripts...");
  footer.add("button", undefined, "Quitter", { name: "cancel" });

  win.center();
  win.show();
}

// ========================================
// =============== UTILS ==================
// ========================================

/* Description : Ajoute dynamiquement un bouton à l'interface pour lancer un script
 * @param {Group} container - Le conteneur UI
 * @param {File} file - Le fichier .jsx à exécuter
 */
function addScriptButton(container, file) {
  var label = decodeURIComponent(file.name.replace(/\.jsx$/, ""));
  var btn = container.add("button", undefined, label);
  btn.onClick = function () {
    container.window.close();
    $.evalFile(file);
  };
}

/* Description : Récupère tous les scripts ".jsx" d'un dossier et de ses sous-dossiers
 * @param {Folder} folder - Le dossier à scanner
 * @param {Object} map - Dictionnaire { NomDuGroupe : [Fichiers] }
 * @param {string} relPath - Chemin relatif actuel (pour le regroupement)
 */
function getGroupedScripts(folder, map, relPath) {
  var items = folder.getFiles();
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (item instanceof Folder) {
      var newRel = relPath ? relPath + "/" + item.name : item.name;
      getGroupedScripts(item, map, newRel);
    } else if (item instanceof File && item.name.match(/\.jsx$/i)) {
      if (!map[relPath]) map[relPath] = [];
      map[relPath].push(item);
    }
  }
}

/**
 * Crée un bouton qui ouvre un lien web
 * @param {Group} parentGroup - Le groupe UI dans lequel insérer le bouton
 * @param {string} label - Le texte à afficher sur le bouton
 * @param {string} url - Le lien à ouvrir
 * @returns {Button} - Le bouton créé
 */
function createLinkButton(parentGroup, label, url) {
  var btn = parentGroup.add("button", undefined, label);
  // btn.preferredSize.width = 60;
  btn.preferredSize.height = 20;
  btn.onClick = function () {
    var html =
      '<html><head><meta http-equiv="refresh" content="0;url=' +
      url +
      '"></head><body></body></html>';
    var tempFile = new File(
      Folder.temp + "/open_link_" + encodeURIComponent(label) + ".html"
    );
    tempFile.open("w");
    tempFile.write(html);
    tempFile.close();
    tempFile.execute();
  };
  return btn;
}
