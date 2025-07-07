# 🎨 Scripts Illustrator – eLeGarage

Une collection de scripts JavaScript pour **Adobe Illustrator CC 2020+**, conçus pour améliorer le flux de travail.
Chaque script est autonome, prêt à être utilisé dans Illustrator via le **ScriptRunner**.

## 🚀 Installation

### 1. Installer ScriptRunner

Placez le fichier `ScriptRunner.jsx` dans le dossier suivant (selon votre version d’Illustrator) :

```
/Applications/Adobe Illustrator [VOTRE VERSION]/Presets.localized/fr_FR/Scripts/
```

> Remplacez `[VOTRE VERSION]` par la version exacte que vous utilisez, par exemple `Adobe Illustrator 2024` ou `Adobe Illustrator 2025`.

### 2. Préparer votre bibliothèque de scripts

Créez un dossier contenant tous vos scripts `.jsx` et nommez-le par exemple : "Scripts Illustrator"
Placez ce dossier **dans un emplacement permanent** (Documents, Library, etc.).  
Ce dossier sera sélectionné lors du **premier lancement** de ScriptRunner et utilisé à chaque fois par la suite.

---

### 3. Lancer ScriptRunner

Dans Illustrator, lancer ScriptRunner via le menu :
**Fichier > Scripts > ScriptRunner**

Lors de la **première exécution**, le script vous demandera de sélectionner l’emplacement de votre dossier de scripts.  
Ensuite, l'interface vous permettra d'exécuter vos scripts rapidement, avec une vue organisée et un **mode découverte** optionnel.  
Vous pouvez modifier l’emplacement des scripts à tout moment depuis l’interface.

---

## 🔎 LISTES DES SCRIPTS DISPONIBLES

### Calques

- `Paramétrer les calques visibles et non verrouillés.jsx`
  Ce script permet de configurer rapidement les **propriétés des calques visibles** et **non verrouillés** dans un document actif.

- `Supprimer calques vides.jsx`
  Ce script supprime **tous les calques vides** et **non vérouillés** dans le document actif, y compris les sous-calques.

### Nuances

- `Supprimer toutes les nuances.jsx`
  Ce script supprime **toutes les nuances du document** actif ainsi que les groupes de couleurs.

---

### Objets

- `Calculer la surface d'un objet.jsx`
  Calcule la **surface vectorielle** de chaque objet sélectionné, en **cm²**, et affiche le résultat sur un calque dédié.

---

### Plans de travail

- `Ajouter un fond au plan de travail.jsx`
  Ajoute un **rectangle de fond coloré** à un ou plusieurs plans de travail sélectionnés, avec gestion des **fonds perdus**.

- `Fusionner plusieurs fichiers en planche.jsx`
  Importe automatiquement tous les fichiers d’un dossier (images et fichiers vectoriels) et les organise en **grille de plans de travail**, dans un nouveau document Illustrator.

- `Redimensionner plan de travail.jsx`
  Ajoute une **marge extérieure (blanc tournant)** autour des plans de travail sélectionnés en ajustant leurs dimensions.

- `Renommer les plans de travail.jsx`
  Renomme chaque plan de travail automatiquement selon une logique prédéfinie (ex : nom d’objet, numéro de série, etc.).

---

### Textes

- `Fusionner des blocs textes.jsx`
  Fusionne plusieurs blocs de texte séparés en **lignes cohérentes**, puis en un **paragraphe unique** en conservant l’alignement, l’interlignage et la mise en forme.

---

## ✍️ Auteur

**Eliott Lesimple (eLeGarage)**  
🔗 [GitHub – lesimpleliott](https://github.com/lesimpleliott)

---
