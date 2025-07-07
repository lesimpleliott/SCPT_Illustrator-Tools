/**
 * Nom du script : supprimer_toutes_les_nuances.jsx
 * Auteur        : eLeGarage - Eliott Lesimple
 * URL           : https://github.com/lesimpleliott
 * Version       : 2.1
 * Date          : 2025-07-05
 * Catégorie     : Nuances
 * Compatible    : Illustrator CC 2020+
 * Description   : Ce script supprime toutes les nuances du document actif ainsi que les groupes de couleurs.
 *
 *                 Il est possibile d'ajouter des nuances à conserver dans la variable WHITELISTED_SWATCHES du code.
 * ---
 * Fonctions :
 * - main : Supprime toutes les nuances non protégées et supprime les groupes de couleurs vides.
 * - isWhitelisted : Vérifie si une nuance est protégée (système ou incluse dans la whitelist définie).
 */

// ========================================
// == CONFIGURATION ET PERSONNALISATION ==
// ========================================
var SHOW_ALERT_AT_END = false; // true = afficher une alerte après exécution, false = silencieux
var WHITELISTED_SWATCHES = new Array("Noir", "Blanc"); // Ajouter ici les noms (EXACTES) des nuances à conserver

// ========================================
// =============== MAIN ===================
// ========================================

/**
 * Supprime toutes les nuances du document sauf celles définies dans la whitelist
 * et les nuances système [Sans] et [Repérage]. Supprime aussi les groupes de couleurs vides.
 */
function main() {
  if (app.documents.length === 0) {
    alert("Aucun document ouvert.");
    return;
  }

  var doc = app.activeDocument;
  var swatches = doc.swatches;
  var deletedCount = 0;

  for (var i = swatches.length - 1; i >= 0; i--) {
    var s = swatches[i];
    var name = s.name;

    if (!isWhitelisted(name)) {
      try {
        s.remove();
        deletedCount++;
      } catch (e) {}
    }
  }

  var groups = doc.swatchGroups;
  var groupsDeleted = 0;

  for (var j = groups.length - 1; j >= 0; j--) {
    try {
      if (groups[j].getAllSwatches().length === 0) {
        groups[j].remove();
        groupsDeleted++;
      }
    } catch (e) {}
  }

  if (SHOW_ALERT_AT_END) {
    alert(
      deletedCount +
        " nuances supprimées\n" +
        groupsDeleted +
        " groupes vides supprimés"
    );
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

/**
 * Vérifie si un nom de nuance est autorisé (whitelisté).
 * @param {string} name - Le nom de la nuance à vérifier.
 * @return {boolean} - true si la nuance est dans la whitelist ou est une nuance système, sinon false.
 */
function isWhitelisted(name) {
  if (name === "[Sans]" || name === "[Repérage]") return true;

  for (var i = 0; i < WHITELISTED_SWATCHES.length; i++) {
    if (WHITELISTED_SWATCHES[i] === name) return true;
  }
  return false;
}
