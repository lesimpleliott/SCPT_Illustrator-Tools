/**
 * Nom du script : Créer un bloc texte - regrouper textes.jsx
 *
 * Auteur        : Source Internet (anonyme) | Documentée et revue par eLeGarage
 * URL           : https://github.com/lesimpleliott
 * Version       : 1.1
 * Date          : inconnue
 * Catégorie     : Textes
 * Compatible avec : Illustrator CC 2020+
 * Description   : Ce script fusionne plusieurs blocs de texte sélectionnés en un seul paragraphe structuré.
 *                 Il détecte les blocs appartenant à une même ligne selon leur ancrage vertical,
 *                 puis ajuste l’espacement horizontal et l’interligne pour les assembler harmonieusement.
 *                 Une justification commune est ensuite appliquée à l’ensemble.
 *
 * ---
 * Fonctions :
 * - main : Point d’entrée, sélectionne les blocs, trie, regroupe en lignes puis en un paragraphe.
 * - reconstituerLigne : Fusionne les blocs appartenant à une même ligne horizontale.
 * - reconstituerParagraphe : Assemble plusieurs lignes en un seul bloc de texte avec gestion de l’interligne.
 * - fitTextToItem : Redimensionne un texte pour épouser la taille d’un objet (utilisé pour l’alignement).
 * - getTextLastCharacterAnchor : Récupère la position du dernier caractère d’un bloc de texte.
 * - setAnchor : Ajuste la position d’un bloc de texte selon un ancrage donné.
 * - Fonctions utilitaires : tri vertical/horizontal, médiane, seuils de tolérance.
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================
var limiteAjoutEspace = 1;
var limiteAjoutParangonnage = 0.1;
var limiteMemeLigne = 1;
var limitePasFerAGauche = 0.001;

Number.prototype.arrondirALincrement = function (increment) {
  return increment * Math.round(this / increment);
};

function median(values) {
  values.sort(function (a, b) {
    return a - b;
  });
  var half = values.length / 2;
  return half % 1
    ? values[Math.floor(half)]
    : (values[half - 1] + values[half]) / 2;
}

function fitTextToItem(tx, it) {
  var tx0 = tx.duplicate().createOutline();
  tx.width *= it.width / tx0.width;
  tx.height *= it.height / tx0.height;
  var tx1 = tx.duplicate().createOutline();
  tx.left += it.left - tx1.left;
  tx.top += it.top - tx1.top;
  tx0.remove();
  tx1.remove();
}

function getTextLastCharacterAnchor(tx) {
  var tx2 = tx.duplicate();
  tx.textRanges[tx.textRanges.length - 1].duplicate(tx2.insertionPoints[0]);
  tx2.contents = "A";
  tx2.paragraphs[0].paragraphAttributes.justification = Justification.LEFT;
  var tx3 = tx.duplicate();
  tx3.textRanges[tx3.textRanges.length - 1].contents += "A";
  var tx4 = tx3.createOutline();
  fitTextToItem(tx2, tx4.pageItems[0]);
  var an = tx2.anchor;
  tx2.remove();
  tx4.remove();
  return an;
}

function trierDeHautEnBas(a, b) {
  return b.anchor[1] - a.anchor[1];
}
function trierDeGaucheADroite(a, b) {
  return a.anchor[0] - b.anchor[0];
}
function triNumerique(a, b) {
  return a - b;
}

function reconstituerLigne(lesTextes) {
  lesTextes.sort(trierDeGaucheADroite);

  for (var i = 1; i < lesTextes.length; i++) {
    var joint = lesTextes[0].textRanges.length - 1;
    var limiteAjoutEspace =
      lesTextes[0].textRanges[joint].characterAttributes.size * 0.16;
    var gb2bak = Number(lesTextes[i].geometricBounds[2]);
    for (var j = 0; j < lesTextes[i].textRanges.length; j++) {
      var decalageVertical = lesTextes[i].anchor[1] - lesTextes[0].anchor[1];
      if (Math.abs(decalageVertical) >= limiteAjoutParangonnage) {
        lesTextes[i].textRanges[j].characterAttributes.baselineShift +=
          decalageVertical;
      }
      lesTextes[i].textRanges[j].duplicate(
        lesTextes[0].insertionPoints[lesTextes[0].insertionPoints.length - 1]
      );
    }
    while (
      Math.abs(gb2bak - lesTextes[0].geometricBounds[2]) >= limiteAjoutEspace
    ) {
      if (gb2bak >= lesTextes[0].geometricBounds[2] + limiteAjoutEspace) {
        lesTextes[0].textRanges[joint].contents += " ";
        joint++;
        continue;
      }
      if (
        gb2bak <= lesTextes[0].geometricBounds[2] - limiteAjoutEspace &&
        lesTextes[0].textRanges[joint].contents.match(/\s/)
      ) {
        lesTextes[0].textRanges[joint].remove();
        joint--;
        continue;
      }
      break;
    }
    var approcheMin = -1000,
      approcheMax = 1000;
    var approche;
    var classementResultats = [];
    while (true) {
      approche = (approcheMin + approcheMax) / 2;
      lesTextes[0].textRanges[joint].characterAttributes.tracking =
        Math.round(approche);
      var dW = lesTextes[0].geometricBounds[2] - gb2bak;
      classementResultats.push({
        dW: dW,
        approche: lesTextes[0].textRanges[joint].characterAttributes.tracking,
      });

      dW > 0 ? (approcheMax = approche) : (approcheMin = approche);
      if (approcheMax - approcheMin > 0.25) {
        continue;
      }
      if (approcheMin != approcheMax) {
        classementResultats.sort(function (a, b) {
          return Math.abs(a.dW) - Math.abs(b.dW);
        });
        approcheMin = approcheMax = classementResultats[0].approche;
        continue;
      }
      break;
    }
  }

  for (var i = lesTextes.length - 1; i > 0; i--) {
    lesTextes[i].remove();
  }
  return lesTextes[0];
}

function reconstituerParagraphe(lesTextes) {
  lesTextes.sort(trierDeHautEnBas);
  var monParagraphe = lesTextes[0];

  for (var i = 1; i < lesTextes.length; i++) {
    var interligne;
    if (lesTextes[i - 1].lines.length > 1) {
      var ancre = getTextLastCharacterAnchor(lesTextes[i - 1]);
      interligne = ancre[1] - lesTextes[i].anchor[1];
    } else {
      interligne = lesTextes[i - 1].anchor[1] - lesTextes[i].anchor[1];
    }
    monParagraphe.textRanges[monParagraphe.textRanges.length - 1].contents +=
      "\r";
    for (var j = 0; j < lesTextes[i].textRanges.length; j++) {
      if (j < lesTextes[i].lines[0].textRanges.length) {
        lesTextes[i].textRanges[j].autoLeading = false;
        lesTextes[i].textRanges[j].leading = interligne;
      }
      lesTextes[i].textRanges[j].duplicate(
        monParagraphe.insertionPoints[monParagraphe.insertionPoints.length - 1]
      );
    }
  }

  if (
    monParagraphe.paragraphs.length > 1 &&
    monParagraphe.paragraphs[0].characters[0].size ===
      monParagraphe.paragraphs[1].characters[0].size
  ) {
    monParagraphe.paragraphs[0].autoLeading =
      monParagraphe.paragraphs[1].autoLeading;
    monParagraphe.paragraphs[0].leading = monParagraphe.paragraphs[1].leading;
  }

  for (var i = lesTextes.length - 1; i > 0; i--) {
    lesTextes[i].remove();
  }
  return monParagraphe;
}

function main() {
  var maSelection = [];
  for (var i = 0; i < app.activeDocument.textFrames.length; i++) {
    if (app.activeDocument.textFrames[i].selected) {
      maSelection.push(app.activeDocument.textFrames[i]);
    }
  }

  if (maSelection.length === 0) {
    alert("Veuillez sélectionner des blocs de texte à regrouper.");
    return;
  }

  var mesLignesObj = {};
  for (var i = 0; i < maSelection.length; i++) {
    mesLignesObj[
      maSelection[i].anchor[1].arrondirALincrement(limiteMemeLigne)
    ] = [maSelection[i]].concat(
      mesLignesObj[
        maSelection[i].anchor[1].arrondirALincrement(limiteMemeLigne)
      ] || []
    );
  }

  var mesLignesArr = [];
  for (var l in mesLignesObj) {
    mesLignesArr.push(reconstituerLigne(mesLignesObj[l]));
  }
  if (mesLignesArr.length < 2) {
    return;
  }

  var pointsDAncragesX = [];
  var ancresSelonJustifs = { LEFT: [], CENTER: [], RIGHT: [] };
  for (var l = 0; l < mesLignesArr.length; l++) {
    ancresSelonJustifs.LEFT.push(mesLignesArr[l].left);
    ancresSelonJustifs.CENTER.push(
      mesLignesArr[l].left + mesLignesArr[l].width / 2
    );
    ancresSelonJustifs.RIGHT.push(mesLignesArr[l].left + mesLignesArr[l].width);
    while (
      mesLignesArr[l].textRange.paragraphAttributes.justification ===
        Justification.LEFT &&
      mesLignesArr[l].textRanges[
        mesLignesArr[l].textRanges.length - 1
      ].contents.match(/\s/)
    ) {
      mesLignesArr[l].textRanges[
        mesLignesArr[l].textRanges.length - 1
      ].remove();
    }
  }
  var amplitudesSelonJustifs = {};
  var classementAmplitudes = [];
  for (var alignment in ancresSelonJustifs) {
    ancresSelonJustifs[alignment].sort(triNumerique);
    var amplitude =
      ancresSelonJustifs[alignment][ancresSelonJustifs[alignment].length - 1] -
      ancresSelonJustifs[alignment][0];
    amplitudesSelonJustifs[amplitude] = alignment;
    classementAmplitudes.push(amplitude);
  }
  var meilleureJustif;
  if (classementAmplitudes[0] < limitePasFerAGauche) {
    meilleureJustif = "LEFT";
  } else {
    classementAmplitudes.sort(triNumerique);
    meilleureJustif = amplitudesSelonJustifs[classementAmplitudes[0]];
  }

  for (var l = 0; l < mesLignesArr.length; l++) {
    var position = [mesLignesArr[l].left, mesLignesArr[l].top];
    mesLignesArr[l].textRange.paragraphAttributes.justification =
      Justification[meilleureJustif];
    mesLignesArr[l].left = position[0];
    mesLignesArr[l].top = position[1];
    pointsDAncragesX.push(mesLignesArr[l].anchor[0]);
  }

  var monParagraphe = reconstituerParagraphe(mesLignesArr);
  setAnchor(monParagraphe, [median(pointsDAncragesX), monParagraphe.anchor[1]]);
  app.activeDocument.selection = monParagraphe;
}

try {
  main();
} catch (e) {}

function setAnchor(theTextFrameItem, theAnchor) {
  theTextFrameItem.left += theAnchor[0] - theTextFrameItem.anchor[0];
  theTextFrameItem.top += theAnchor[1] - theTextFrameItem.anchor[1];
}
