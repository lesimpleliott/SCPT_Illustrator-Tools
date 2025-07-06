function alignToArtboardCenter() {
  var doc = app.activeDocument;
  var artboards = doc.artboards;

  alert(artboards.length);

  for (var i = 0; i < artboards.length; i++) {
    doc.artboards.setActiveArtboardIndex(i);
    doc.selectObjectsOnActiveArtboard();

    if (doc.selection.length > 0) {
      // Centrage horizontal et vertical par rapport au plan de travail
      app.executeMenuCommand("group");
      app.executeMenuCommand("selectallinartboard");
      app.executeMenuCommand("alignhorizontalcenter");
      app.executeMenuCommand("alignverticalcenter");
      app.executeMenuCommand("ungroup");
    }
  }

  alert("Tous les éléments ont été centrés sur leurs plans de travail !");
}

alignToArtboardCenter();
