/*
============================================
SCRIPT : Générer plans de travail par groupe
Auteur      : Eliott Lesimple
Date        : 2025-05-14
Description : Génère automatiquement des plans de travail dans Adobe Illustrator
              à partir des groupes de 1er niveau visibles dans les calques non verrouillés.
              Si un groupe contient un masque d'écrêtage (même en profondeur),
              un rectangle rouge est ajouté sur le calque _ERROR_ à la position du plan.
              Ce script :
              - Supprime les anciens plans de travail (sauf un minimum obligatoire)
              - Nettoie les anciens marqueurs sur le calque _ERROR_
              - Crée de nouveaux plans de travail pour chaque groupe valide
              - Nomme chaque plan "Untitled"
              - Positionne le calque _ERROR_ en dernier dans la pile

**** main                            : Fonction principale qui orchestre tout le processus.
**** containsClipping                : Détection récursive de masque d'écrêtage dans les groupes.
============================================
*/

main();

/*
Description : Fonction principale qui gère la génération des plans de travail.
              - Nettoie les artboards et le calque _ERROR_
              - Parcourt les groupes de 1er niveau valides
              - Crée des plans de travail
              - Marque ceux contenant un masque d'écrêtage
@params     : Aucun
@return     : Aucun
*/
function main() {
  if (app.documents.length === 0) {
    alert("Aucun document ouvert.");
    return;
  }

  var doc = app.activeDocument;
  var layers = doc.layers;
  var artboards = doc.artboards;
  var artCount = 0;

  // === PARAMÈTRES PERSONNALISABLES ===
  var padding = 0; // Marge autour du plan de travail
  var errorColor = [255, 0, 0]; // Couleur du fond _ERROR_ (R, G, B)
  // ======================================

  // --- Nettoyage des anciens artboards ---
  while (artboards.length > 1) {
    artboards.remove(artboards.length - 1);
  }

  // --- Suppression des marqueurs d'erreur existants ---
  for (var l = 0; l < layers.length; l++) {
    if (layers[l].name === "_ERROR_") {
      var errorItems = layers[l].pageItems;
      for (var i = errorItems.length - 1; i >= 0; i--) {
        errorItems[i].remove();
      }
      break;
    }
  }

  // --- Calque _ERROR_ ---
  var errorLayer = null;
  for (var e = 0; e < layers.length; e++) {
    if (layers[e].name === "_ERROR_") {
      errorLayer = layers[e];
      break;
    }
  }
  if (!errorLayer) {
    errorLayer = doc.layers.add();
    errorLayer.name = "_ERROR_";
  }
  if (doc.layers[doc.layers.length - 1].name !== "_ERROR_") {
    errorLayer.zOrder(ZOrderMethod.SENDTOBACK);
  }

  // --- Fonction pour détection des masques ---
  function containsClipping(group) {
    if (group.clipped) return true;
    for (var i = 0; i < group.groupItems.length; i++) {
      if (containsClipping(group.groupItems[i])) return true;
    }
    return false;
  }

  // --- Parcours des calques et groupes ---
  for (var l = 0; l < layers.length; l++) {
    var layer = layers[l];
    if (!layer.visible || layer.locked || layer.name === "_ERROR_") continue;

    for (var i = 0; i < layer.groupItems.length; i++) {
      var group = layer.groupItems[i];
      if (group.parent !== layer) continue;

      var bounds = group.visibleBounds;
      var x1 = bounds[0] - padding;
      var y1 = bounds[1] + padding;
      var x2 = bounds[2] + padding;
      var y2 = bounds[3] - padding;
      var rect = [x1, y1, x2, y2];

      var newAB = artboards.add(rect);
      newAB.name = "Untitled";
      artCount++;

      if (containsClipping(group)) {
        var redRect = errorLayer.pathItems.rectangle(y1, x1, x2 - x1, y1 - y2);
        redRect.filled = true;
        redRect.stroked = false;
        var red = new RGBColor();
        red.red = errorColor[0];
        red.green = errorColor[1];
        red.blue = errorColor[2];
        redRect.fillColor = red;
      }
    }
  }

  alert(
    artCount +
      " plans de travail créés.\n" +
      "Vérifiez le calque _ERROR_ pour les erreurs de masquage."
  );
}
