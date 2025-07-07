/**
 * Nom du script : ScriptRunner.jsx
 * Auteur        : eLeGarage - Eliott Lesimple
 * URL           : https://github.com/lesimpleliott
 * Version       : 1.0.0
 * Date          : 2025-07-07
 * Catégorie     : Interface Utilisateur / Productivité
 * Compatible    : Illustrator CC 2020+
 * Description   : Interface de lancement rapide de scripts Illustrator regroupés par dossiers,
 *                 avec aperçu dynamique, mode découverte interactif, et gestion persistée de l’emplacement des scripts.
 * ---
 * Fonctions :
 * - main() : Construit et affiche l’interface principale
 * - getGroupedScripts() : Recherche récursive des fichiers .jsx
 * - addScriptButton() : Crée dynamiquement un bouton de lancement pour chaque script
 * - getScriptDescription() : Extrait la description du script à partir des métadonnées du fichier
 * - createLinkButton() : Génère un bouton avec lien cliquable
 * - loadScriptRoot() : Récupère ou initialise le chemin des scripts et l’état du mode découverte
 * - saveScriptRunnerConfig() : Sauvegarde les préférences utilisateur dans un fichier de config
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================
var WINDOW_WIDTH = 900; //Largeur globale de la fenêtre principale
var leftPanelWidth = 350; // Largeur de la colonne gauche (liste des scripts)
var rightPanelWidth = 400; // Largeur de la colonne droite (description et options)
// DEFAULT_DESCRIPTION : Message d’accueil par défaut dans la zone de description
var DEFAULT_DESCRIPTION =
  "Bienvenue dans ScriptRunner !\n\n" +
  "Ce panneau vous permet de lancer rapidement des scripts Illustrator organisés par dossiers. " +
  "Chaque script est affiché dans la colonne de gauche, trié par catégorie.\n\n" +
  "🛍 Mode découverte : activez cette option pour en apprendre plus sur vos scripts avant de les exécuter.\n" +
  "    • 1er clic : affiche la description du script\n" +
  "    • 2e clic (sur le même bouton) : exécute le script\n\n" +
  "📁 Emplacement des scripts : utilisez le bouton en bas pour changer le dossier où vos fichiers .jsx sont stockés.";

// ========================================
// ====== DEV VARIABLES GLOBALES ==========
// ========================================
var configData = loadScriptRoot();
var SCRIPT_ROOT = configData.folder;

var lastClickedScript = null;
var lastClickedTime = 0;
var discoveryMode;
var descBox;

// ========================================
// =============== MAIN ===================
// ========================================

// Lancer le script
try {
  main();
} catch (err) {
  alert("Erreur dans le script :\n" + err.message);
}

// Description : Fonction principale qui construit et affiche l’interface de ScriptRunner
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
  leftPanel.preferredSize.width = leftPanelWidth;

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

  discoveryMode = rightPanel.add(
    "checkbox",
    undefined,
    "Mode découverte (survol/cliquer)"
  );
  discoveryMode.value = configData.discoveryMode;
  discoveryMode.onClick = function () {
    configData.discoveryMode = discoveryMode.value;
    if (!discoveryMode.value) {
      descBox.text = DEFAULT_DESCRIPTION;
    }
    // Mise à jour persistée avec la version actuelle du path
    saveScriptRunnerConfig(SCRIPT_ROOT.fsName, configData.discoveryMode);
  };

  descBox = rightPanel.add("edittext", undefined, DEFAULT_DESCRIPTION, {
    multiline: true,
    readonly: true,
  });
  descBox.minimumSize.height = 100;
  descBox.maximumSize.height = 1000;
  descBox.maximumSize.width = rightPanelWidth;
  descBox.minimumSize.width = rightPanelWidth;

  // ==== Ajustement de hauteur dynamique ====
  win.onShow = function () {
    win.layout.layout(true);
    win.layout.resize();

    var offset = 100;
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

  var creditText = creditsGroup.add(
    "statictext",
    undefined,
    "Créé avec ❤️ et beaucoup de ☕️ par"
  );
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
  // footer.add("button", undefined, "Modifier l'emplacement des scripts...");
  var changePathBtn = footer.add(
    "button",
    undefined,
    "Modifier l'emplacement des scripts..."
  );
  changePathBtn.onClick = function () {
    var newFolder = Folder.selectDialog(
      "📁 Sélectionnez le nouveau dossier de scripts"
    );
    if (newFolder) {
      configData.path = newFolder.fsName;
      saveScriptRunnerConfig(configData.path, discoveryMode.value);
      alert(
        "✅ Le nouvel emplacement a bien été enregistré.\nRedémarrez ScriptRunner pour le recharger."
      );
      win.close();
    }
  };

  footer.add("button", undefined, "Quitter", { name: "cancel" });

  win.center();
  win.show();
}

// ========================================
// =============== UTILS ==================
// ========================================

/* Description : Recherche récursive de tous les fichiers .jsx dans un dossier
 * @params : folder (Folder), map (Object), relPath (String)
 * @return : map rempli avec les scripts trouvés, organisés par dossier
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

/* Description : Ajoute dynamiquement un bouton pour chaque script et gère le double-clic ou affichage description
 * @params : container (Group), file (File)
 * @return : aucun
 */
function addScriptButton(container, file) {
  var label = decodeURIComponent(file.name.replace(/\.jsx$/, ""));
  var btn = container.add("button", undefined, label);

  btn.onClick = function () {
    var now = new Date().getTime();
    var isDoubleClick =
      lastClickedScript === file && now - lastClickedTime < 500;

    if (discoveryMode.value) {
      if (isDoubleClick) {
        container.window.close();
        $.evalFile(file);
        return;
      }

      if (lastClickedScript === file) {
        container.window.close();
        $.evalFile(file);
      } else {
        var desc = getScriptDescription(file);
        descBox.text = "Script : " + label + "\n\n" + desc;
        lastClickedScript = file;
        lastClickedTime = now;
      }
    } else {
      container.window.close();
      $.evalFile(file);
    }
  };
}

/* Description : Crée un bouton cliquable qui ouvre un lien web dans le navigateur
 * @params : parentGroup (Group), label (String), url (String)
 * @return : Button
 */
function createLinkButton(parentGroup, label, url) {
  var btn = parentGroup.add("button", undefined, label);
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

/* Description : Extrait la description du script à partir de l’en-tête du fichier
 * @params : file (File)
 * @return : String contenant la description formatée
 */
function getScriptDescription(file) {
  file.open("r");
  var content = file.read();
  file.close();

  var lines = content.split("\n");
  var collecting = false;
  var descriptionLines = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (line.indexOf("* ---") !== -1) break;

    if (collecting) {
      if (line.match(/^\s*\*\s*- /)) continue;
      descriptionLines.push(line.replace(/^\s*\*\s?/, ""));
    }

    if (line.match(/^\s*\*\s+Description\s*:/i)) {
      collecting = true;
      var firstLine = line.replace(/^\s*\*\s+Description\s*:\s*/i, "");
      descriptionLines.push(firstLine);
    }
  }

  var description =
    descriptionLines.length > 0 ? descriptionLines.join("\n") : null;

  // 🔄 Nettoyage
  if (description) {
    // Supprimer tous les doublons d'espaces
    description = description.replace(/ {2,}/g, " ");

    // Supprimer les espaces en début de ligne
    var descLines = description.split("\n");
    for (var j = 0; j < descLines.length; j++) {
      descLines[j] = descLines[j].replace(/^\s+/, "");
    }
    description = descLines.join("\n");
  }

  return description;
}

/* Description : Charge le fichier de config ou propose une sélection si absent
 * @params : aucun
 * @return : Object contenant { folder, discoveryMode }
 */
function loadScriptRoot() {
  var appVersion = app.version.split(".")[0];
  var userLibrary = Folder(Folder.userData).parent;
  var configFolder = new Folder(
    userLibrary +
      "/Application Support/Adobe/Adobe Illustrator " +
      appVersion +
      "/fr_FR"
  );

  if (!configFolder.exists) {
    configFolder.create();
  }

  var configFile = new File(configFolder.fsName + "/.ScriptRunnerConfig.json");

  var config = { path: null, discoveryMode: false };

  if (configFile.exists) {
    try {
      configFile.open("r");
      var content = configFile.read();
      configFile.close();

      config = eval("(" + content + ")");
    } catch (e) {
      alert("⚠️ Erreur de lecture du fichier de config :\n" + e.message);
    }
  }

  // Si pas de chemin valide → demander à l’utilisateur
  var scriptFolder = config.path ? new Folder(config.path) : null;

  if (!scriptFolder || !scriptFolder.exists) {
    alert(
      "👋 Bienvenue dans ScriptRunner !\n\nVeuillez sélectionner le dossier contenant vos scripts Illustrator."
    );
    var selectedFolder = Folder.selectDialog(
      "Sélectionnez le dossier de vos scripts Illustrator"
    );

    if (selectedFolder) {
      config.path = selectedFolder.fsName;
      saveScriptRunnerConfig(config.path, config.discoveryMode);
      scriptFolder = selectedFolder;
    } else {
      scriptFolder = new Folder(Folder.myDocuments + "/Scripts Illustrator");
    }
  }

  return { folder: scriptFolder, discoveryMode: config.discoveryMode };
}

/* Description : Sauvegarde les préférences utilisateur dans un fichier JSON
 * @params : path (String), discoveryModeValue (Boolean)
 * @return : aucun
 */
function saveScriptRunnerConfig(path, discoveryModeValue) {
  var appVersion = app.version.split(".")[0];
  var userLibrary = Folder(Folder.userData).parent;
  var configFolder = new Folder(
    userLibrary +
      "/Application Support/Adobe/Adobe Illustrator " +
      appVersion +
      "/fr_FR"
  );

  if (!configFolder.exists) configFolder.create();

  var configFile = new File(configFolder.fsName + "/.ScriptRunnerConfig.json");

  var config = {
    path: path,
    discoveryMode: discoveryModeValue,
  };

  try {
    configFile.open("w");
    configFile.write(config.toSource());
    configFile.close();
  } catch (e) {
    alert(
      "❌ Erreur lors de la sauvegarde de la configuration :\n" + e.message
    );
  }
}
