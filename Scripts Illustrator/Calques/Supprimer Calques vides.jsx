/**
 * Nom du script : Supprimer Calques vides.jsx
 * Auteur        : eLeGarage - Eliott Lesimple
 * URL           : https://github.com/lesimpleliott
 * Version       : 2.0
 * Date          : 2025-07-05
 * Catégorie     : Calques
 * Compatible    : Illustrator CC 2020+
 * Description   : Ce script supprime tous les calques vides dans le document actif, y compris les sous-calques.
 *
 *                 Seuls les calques non verrouillés sont pris en compte. La suppression s'applique aux calques masqués comme visibles. Le script restaure ensuite l’état de visibilité d’origine de chaque calque.
 *
 *                 Il est utile pour nettoyer rapidement un document en éliminant les calques sans contenu, tout en préservant la structure de visibilité initiale.
 * ---
 * Fonctions :
 * - main : Supprime tous les calques vides et déverrouillés, tout en restaurant leur visibilité initiale.
 * - getAllLayers : Retourne tous les calques et sous-calques de manière récursive à partir d’un container donné.
 * - restoreVisibilityRecursive : Restaure l’état de visibilité original de chaque calque à l’aide d’une map temporaire.
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================

var SHOW_ALERT_AT_END = false; // true = afficher une alerte après exécution, false = silencieux

// ========================================
// =============== MAIN ===================
// ========================================

function main() {
  /* Description : Supprime tous les calques vides non verrouillés, même s'ils sont masqués */
  if (app.documents.length === 0) {
    alert("Aucun document ouvert.");
    return;
  }

  var doc = app.activeDocument;
  var allLayers = getAllLayers(doc);
  var deletedCount = 0;

  // Sauvegarde des états de visibilité
  var visibilityMap = {};

  for (var i = 0; i < allLayers.length; i++) {
    visibilityMap[allLayers[i].name] = allLayers[i].visible;
    allLayers[i].visible = true; // Forcer la visibilité pour accéder aux objets
  }

  for (var i = allLayers.length - 1; i >= 0; i--) {
    var layer = allLayers[i];
    if (!layer.locked && layer.pageItems.length === 0) {
      try {
        layer.remove();
        deletedCount++;
      } catch (e) {}
    }
  }

  // Restauration des états de visibilité d'origine
  for (var i = 0; i < doc.layers.length; i++) {
    restoreVisibilityRecursive(doc.layers[i], visibilityMap);
  }

  if (SHOW_ALERT_AT_END) {
    alert(deletedCount + " calques vides supprimés.");
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

function getAllLayers(container) {
  /* Description : Retourne tous les calques et sous-calques récursivement
   * @params     : container (Document | Layer)
   * @return     : Array
   */
  var layers = [];
  for (var i = 0; i < container.layers.length; i++) {
    var layer = container.layers[i];
    layers.push(layer);
    layers = layers.concat(getAllLayers(layer));
  }
  return layers;
}

function restoreVisibilityRecursive(layer, visibilityMap) {
  /* Description : Restaure la visibilité originale d’un calque et ses enfants
   * @params     : layer (Layer), visibilityMap (Object)
   */
  if (visibilityMap.hasOwnProperty(layer.name)) {
    layer.visible = visibilityMap[layer.name];
  }
  for (var i = 0; i < layer.layers.length; i++) {
    restoreVisibilityRecursive(layer.layers[i], visibilityMap);
  }
}
