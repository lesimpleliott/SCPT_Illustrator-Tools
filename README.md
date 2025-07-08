# 🎨 Scripts Illustrator – eLeGarage

Une collection de scripts JavaScript pour **Adobe Illustrator CC 2020+**, conçus pour améliorer le flux de travail.
Chaque script est autonome, prêt à être utilisé dans Illustrator via le **ScriptRunner**.

## 🚀 Installation

### 1. Télécharger les éléments

Pour télécharger les scripts, vous pouvez soit cloner le dépôt GitHub, soit télécharger le dossier en cliquant sur le bouton "Code" et en sélectionnant "Télécharger ZIP".

### 2. Installer ScriptRunner

Rendez-vous dans le dossier `Scripts` d’Illustrator :

```
/Applications/Adobe Illustrator [VOTRE VERSION]/Presets/fr_FR/Scripts/
```

Placez le fichier `ScriptRunner.jsx` dans le dossier et entrer votre mot de passe administrateur si nécessaire.

### 3. Préparer votre bibliothèque de scripts

Rendez-vous dans le dossier `Documents` de votre ordinateur (MacOS).
Placer le dossier `Scripts Illustrator` à la racine de `Documents`.

> 💡 Tips : Vous pouvez nommer ce dossier comme vous le souhaitez et le ranger dans un autre emplacement permanent de votre choix.
> Ce dossier sera sélectionné lors du **premier lancement** de ScriptRunner et utilisé à chaque fois par la suite.

---

### 4. Lancer ScriptRunner

Dans Illustrator, lancer ScriptRunner via le menu :
**Fichier > Scripts > ScriptRunner**

Lors de la **première exécution**, le script vous demandera de sélectionner l’emplacement de votre dossier de scripts.  
Ensuite, l'interface vous permettra d'exécuter vos scripts rapidement, avec une vue organisée et un **mode découverte**.
Vous pouvez modifier l’emplacement des scripts à tout moment depuis l’interface.

> 💡 **Astuce : Attribuer un raccourci clavier à ScriptRunner**
>
> 1. Ouvrez le panneau **Fenêtre > Scripts d’action**.
> 2. Créez un nouveau script ou sélectionnez-en un existant.
> 3. Cliquez sur **Nouvelle action**, nommez-la 'ScriptRunner', et attribuez un raccourci clavier (par exemple F12).
> 4. Lorsque l'enregistrement commence, **arrêtez-le immédiatement** (le but est d'insérer une commande manuellement).
> 5. Cliquez sur le menu burger en haut à droite du panneau, puis sur **Insérer une commande...**.
> 6. Dans la barre de recherche, entrez **ScriptRunner** puis Tab, puis validez.
>
> Vous pourrez désormais ouvrir ScriptRunner avec une simple combinaison de touches **Fn + F12** ! 🎯

---

---

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
