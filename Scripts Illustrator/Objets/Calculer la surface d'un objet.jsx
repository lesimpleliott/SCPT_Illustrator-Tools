/**
 * Nom du script : Calcul Surface.jsx
 * Auteur        : Source Internet (anonyme) | Documentée et revue par eLeGarage
 * URL           : https://github.com/lesimpleliott
 * Version       : 1.1
 * Date          : inconnue
 * Catégorie     : Surfaces
 * Compatible    : Illustrator CS5+ (vérifié avec la propriété `.area`)
 * Description   : Calcule automatiquement la surface (en cm²) de tous les objets vectoriels sélectionnés.
 *
 *                 Les surfaces sont affichées en texte dans un nouveau calque nommé dynamiquement "Surface X".
 * ---
 * Fonctions :
 * - main : Vérifie les sélections, calcule les surfaces et génère les annotations.
 * - extractPathes : Extrait les objets vectoriels valides de la sélection (récursif).
 * - propObjet : Calcule la surface réelle, la surface estimée (ellipse), et les dimensions.
 * - pointText1 : Place du texte à une position donnée avec une police et une couleur.
 * - nomLayer : Génère un nom de calque unique basé sur un nom de base.
 * - detectPolice : Recherche une police par nom exact.
 * - macmykColor : Crée une couleur CMJN personnalisée.
 * - getArrondi : Arrondit un nombre à N décimales.
 * - afficheTab : Affiche un tableau texte avec les résultats.
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================
var police = "Arial-BoldItalicMT";
var coulText = macmykColor(100, 0, 0, 0);
var corps = 10;
var layerName = "Surface";

// ========================================
// =============== MAIN ===================
// ========================================

if (app.documents.length > 0) {
  var docRef = app.activeDocument;
  docRef.rulerOrigin = [0, 0];
  var erreur = 0.05;
  var Version = parseInt(version);
  if (Version >= 12) {
    var point = UnitValue(1, "Pt");
    var cm = UnitValue(1, "cm");
  } else {
    var cm = uniteMesure("cm");
    var point = uniteMesure("pt");
  }
  var iCount = textFonts.length;
  var numPolice = detectPolice(police, iCount);
  var p,
    aire,
    scml,
    total = 0;
  var liste = initliste();
  var propObjets = [];
  var pathes = [];
  var selectedItems = selection;

  extractPathes(selectedItems, pathes);
  var endIndex = pathes.length;

  if (endIndex > 0) {
    var nouveauLayer = docRef.layers.add();
    nouveauLayer.name = nomLayer(layerName);

    for (p = 0; p < endIndex; p++) {
      rayonNul = false;
      if (propObjet(pathes[p], propObjets)) {
        aire = propObjets[2][1];
      } else aire = propObjets[2][0];

      pointText1(
        propObjets[0][0],
        propObjets[0][1],
        "p " + p,
        corps,
        numPolice,
        coulText
      );
      Scm = getArrondi(aire / Math.pow(point * cm, 2), 2);
      ObjetName = pathes[p].name || " ";
      liste[0] += p + "\tSurface = " + Scm + "\r";
      liste[1] += ObjetName + "\r";
      total += aire;
    }
    afficheTab(20, corps * 1.3 * (p + 3), liste);
    if (endIndex != 1) {
      Scm = getArrondi(total / Math.pow(point * cm, 2), 2);
      pointText1(
        20,
        corps * 1.3,
        "Surface total = " + Scm + " cm2",
        corps,
        numPolice,
        coulText
      );
    }
  } else {
    alert("Veuillez sélectionner un ou plusieurs tracés.", "Calcul de surface");
  }
} else {
  alert("Aucun document n'est ouvert.", "Calcul de surface");
}

// ========================================
// =============== UTILS ==================
// ========================================

function afficheTab(x, y, tab) {
  var dec = 20,
    gout = 40;
  for (var i = 0; i < tab.length; i++) {
    pointText1(x, y, tab[i], corps, numPolice, coulText);
    var geo = [docRef.pageItems[0].geometricBounds];
    x += geo[0][2] - geo[0][0] + gout;
  }
}

function initliste() {
  return ["Objet\tSurface en cm2\r\r", "  \r\r", "  \r\r"];
}

function propObjet(objetSelect, Cxy) {
  var geo = [objetSelect.geometricBounds];
  var p1x = geo[0][0],
    p1y = geo[0][1],
    p2x = geo[0][2],
    p2y = geo[0][3];
  var largeur = p2x - p1x,
    hauteur = p1y - p2y;

  if (objetSelect.pathPoints.length <= 2) {
    surface = aire = 0;
  } else {
    surface = Math.abs(objetSelect.area);
    aire = (Math.PI * Math.pow((largeur + hauteur) / 2, 2)) / 4;
  }
  var marge = (aire * erreur) / 100;
  if (largeur == 0 && hauteur == 0) rayonNul = true;
  var Cx = (p1x + p2x) / 2,
    Cy = (p1y + p2y) / 2;
  Cxy[0] = [Cx, Cy];
  Cxy[1] = [largeur, hauteur];
  Cxy[2] = [surface, aire];

  return surface < aire + marge && surface > aire - marge;
}

function detectPolice(chaine, iCount) {
  for (var i = 0; i < iCount; i++) {
    if (police == app.textFonts[i].name) {
      return i;
    }
  }
}

function extractPathes(s, tabs) {
  for (var i = 0; i < s.length; i++) {
    if (s[i].typename == "PathItem" && !s[i].guides && !s[i].clipping) {
      tabs.push(s[i]);
    } else if (s[i].typename == "GroupItem") {
      extractPathes(s[i].pageItems, pathes);
    } else if (s[i].typename == "CompoundPathItem") {
      extractPathes(s[i].pathItems, tabs);
    }
  }
}

function getArrondi(nb, N) {
  return Math.round(Math.pow(10, N) * nb) / Math.pow(10, N);
}

function macmykColor(c, m, j, k) {
  var cmykColor = new CMYKColor();
  cmykColor.cyan = c;
  cmykColor.magenta = m;
  cmykColor.yellow = j;
  cmykColor.black = k;
  return cmykColor;
}

function inv(chaine) {
  if (chaine.length < 2) return chaine;
  return inv(chaine.substring(1)) + chaine.substr(0, 1);
}

function nomLayer(nomLayer) {
  var nom,
    tnoms = [],
    exist = false,
    indice = 0;
  for (k = 0; k < docRef.layers.length; k++) {
    nom = docRef.layers[k].name;
    if (nom.indexOf(nomLayer, 0) != -1) {
      tnoms[indice] = inv(nom);
      indice++;
    }
  }
  tnoms.sort();
  indice = 1;
  k = 0;
  nbExist = tnoms.length;
  while ((!exist || k < nbExist) && nbExist != 0) {
    if (parseInt(tnoms[k]) == indice || k > nbExist - 1) {
      k = 0;
      indice++;
    } else {
      k++;
      exist = true;
    }
  }
  return nomLayer + " " + indice;
}

function pointText1(x, y, text, corps, font, maCouleur) {
  var pointText = docRef.textFrames.add();
  pointText.contents = text;
  pointText.spacing = 0;
  pointText.position = [x, y];
  if (font != undefined)
    pointText.textRange.characterAttributes.textFont = app.textFonts[font];
  pointText.textRange.characterAttributes.fillColor = maCouleur;
  pointText.textRange.characterAttributes.size = corps;
}
