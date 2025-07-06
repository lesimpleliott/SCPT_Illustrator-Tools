/*
============================================
SCRIPT : Grouper objets par plan de travail
Auteur      : Eliott Lesimple
Date        : 2025-05-14
Description : Parcourt tous les plans de travail d'un document Illustrator,
              sélectionne les objets présents sur chacun d'eux, et les groupe individuellement.

              Ce script :
              - Désactive les interactions utilisateur pour éviter les popups
              - Active chaque plan de travail un par un
              - Sélectionne les objets présents uniquement sur ce plan
              - Les groupe s'il y a une sélection

**** main                            : Fonction principale du script
============================================
*/

main();

/*
Description : Fonction principale qui gère le regroupement par plan de travail.
              - Vérifie la présence d’un document actif
              - Parcourt tous les artboards
              - Sélectionne et groupe les objets s’il y en a
@params     : Aucun
@return     : Aucun
*/
function main() {
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

  if (app.documents.length === 0) {
    alert("Aucun document ouvert.");
    return;
  }

  var doc = app.activeDocument;
  var artboardCount = doc.artboards.length;

  for (var i = 0; i < artboardCount; i++) {
    doc.artboards.setActiveArtboardIndex(i);
    doc.selectObjectsOnActiveArtboard();

    if (doc.selection.length > 0) {
      app.executeMenuCommand("group");
    }
  }

  alert("Tous les éléments ont été groupés, artboard par artboard.");
}
